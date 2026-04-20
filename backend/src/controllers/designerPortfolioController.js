import mongoose from "mongoose";
import DesignerPortfolio from "../models/DesignerPortfolio.js";
import Staff from "../models/Staff.js";
import { portfolioImageRelPathFromFilename } from "../middlewares/uploadDesignerPortfolioImage.js";
import { deleteUploadedRelPath } from "../utils/uploadedFile.js";

const MAX_IMAGES = 15;
const MAX_SPECIALTIES = 20;

function normalizeSpecialties(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(/[,;]/);
  const out = [];
  for (const s of arr) {
    const t = String(s).trim();
    if (t && out.length < MAX_SPECIALTIES) out.push(t.slice(0, 80));
  }
  return out;
}

function publicStaffFields(staff) {
  if (!staff || typeof staff !== "object") return null;
  return {
    firstName: staff.firstName ?? "",
    lastName: staff.lastName ?? "",
    jobTitle: staff.jobTitle ?? "",
  };
}

function toPublicPortfolio(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const staff = publicStaffFields(o.staff);
  return {
    _id: o._id,
    displayName: o.displayName,
    headline: o.headline,
    bio: o.bio,
    specialties: o.specialties || [],
    images: (o.images || []).map((img) => ({
      _id: img._id,
      relPath: img.relPath,
      caption: img.caption || "",
    })),
    updatedAt: o.updatedAt,
    staff,
  };
}

/** GET /api/designer-portfolios/public */
export async function listPublishedPortfolios(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "20"), 10) || 20, 1), 50);
    const skip = Math.max(parseInt(String(req.query.skip || "0"), 10) || 0, 0);

    const rows = await DesignerPortfolio.find({ isPublished: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("staff", "firstName lastName jobTitle")
      .lean();

    const data = rows.map((row) => toPublicPortfolio(row));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not list portfolios" });
  }
}

/** GET /api/designer-portfolios/public/:id */
export async function getPublishedPortfolioById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid portfolio id." });
    }
    const row = await DesignerPortfolio.findOne({ _id: id, isPublished: true })
      .populate("staff", "firstName lastName jobTitle")
      .lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }
    res.json({ success: true, data: toPublicPortfolio(row) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not load portfolio" });
  }
}

/** GET /api/designer-portfolios/me — designer only */
export async function getMyDesignerPortfolio(req, res) {
  try {
    const row = await DesignerPortfolio.findOne({ staff: req.user.id })
      .populate("staff", "firstName lastName email username jobTitle")
      .lean();
    if (!row) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not load portfolio" });
  }
}

/** POST /api/designer-portfolios/me — create portfolio (designer only) */
export async function createMyDesignerPortfolio(req, res) {
  try {
    const existing = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a portfolio. Use PATCH to update it.",
      });
    }

    const displayName = String(req.body?.displayName ?? "").trim();
    if (displayName.length < 2 || displayName.length > 120) {
      return res.status(400).json({
        success: false,
        message: "displayName is required (2–120 characters).",
      });
    }

    const headline = String(req.body?.headline ?? "").trim().slice(0, 200);
    const bio = String(req.body?.bio ?? "").trim().slice(0, 8000);
    const specialties = normalizeSpecialties(req.body?.specialties);
    const isPublished = Boolean(req.body?.isPublished);

    const doc = await DesignerPortfolio.create({
      staff: req.user.id,
      displayName,
      headline,
      bio,
      specialties,
      images: [],
      isPublished,
    });

    const populated = await DesignerPortfolio.findById(doc._id)
      .populate("staff", "firstName lastName email username jobTitle")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not create portfolio" });
  }
}

/** PATCH /api/designer-portfolios/me */
export async function patchMyDesignerPortfolio(req, res) {
  try {
    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) {
      return res.status(404).json({
        success: false,
        message: "No portfolio yet. Create one with POST /api/designer-portfolios/me first.",
      });
    }

    const patch = {};
    if (req.body.displayName != null) {
      const displayName = String(req.body.displayName).trim();
      if (displayName.length < 2 || displayName.length > 120) {
        return res.status(400).json({ success: false, message: "displayName must be 2–120 characters." });
      }
      patch.displayName = displayName;
    }
    if (req.body.headline != null) {
      patch.headline = String(req.body.headline).trim().slice(0, 200);
    }
    if (req.body.bio != null) {
      patch.bio = String(req.body.bio).trim().slice(0, 8000);
    }
    if (req.body.specialties != null) {
      patch.specialties = normalizeSpecialties(req.body.specialties);
    }
    if (req.body.isPublished != null) {
      patch.isPublished = Boolean(req.body.isPublished);
    }

    if (Array.isArray(req.body.imageOrder)) {
      const ids = req.body.imageOrder.map((x) => String(x));
      const byId = new Map(row.images.map((img) => [img._id.toString(), img]));
      if (ids.length !== row.images.length) {
        return res.status(400).json({
          success: false,
          message: "imageOrder must list every image id exactly once.",
        });
      }
      const seen = new Set();
      const reordered = [];
      for (const id of ids) {
        if (seen.has(id)) {
          return res.status(400).json({ success: false, message: "Duplicate id in imageOrder." });
        }
        seen.add(id);
        const img = byId.get(id);
        if (!img) {
          return res.status(400).json({ success: false, message: `Unknown image id: ${id}` });
        }
        reordered.push(img);
      }
      row.images = reordered;
    }

    Object.assign(row, patch);
    await row.save();

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle")
      .lean();

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not update portfolio" });
  }
}

/** POST /api/designer-portfolios/me/images — multipart field `image` */
export async function addMyPortfolioImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "An image file is required (field name: image).",
      });
    }

    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
      return res.status(404).json({
        success: false,
        message: "No portfolio yet. Create one with POST /api/designer-portfolios/me first.",
      });
    }

    if (row.images.length >= MAX_IMAGES) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
      return res.status(400).json({
        success: false,
        message: `At most ${MAX_IMAGES} portfolio images allowed.`,
      });
    }

    const caption = String(req.body?.caption ?? "").trim().slice(0, 500);
    const rel = portfolioImageRelPathFromFilename(req.file.filename);

    row.images.push({
      relPath: rel,
      caption,
      originalName: String(req.file.originalname || "").slice(0, 500),
      mimeType: req.file.mimetype || "",
    });
    await row.save();

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (req.file?.filename) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
    }
    res.status(500).json({ success: false, message: error.message || "Could not add image" });
  }
}

/** DELETE /api/designer-portfolios/me/images/:imageId */
export async function deleteMyPortfolioImage(req, res) {
  try {
    const { imageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ success: false, message: "Invalid image id." });
    }

    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    const img = row.images.id(imageId);
    if (!img) {
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    const relPath = img.relPath;
    row.images.pull({ _id: imageId });
    await row.save();
    await deleteUploadedRelPath(relPath);

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle")
      .lean();

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not remove image" });
  }
}

/** GET /api/designer-portfolios/admin */
export async function listDesignerPortfoliosAdmin(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10) || 50, 1), 100);
    const skip = Math.max(parseInt(String(req.query.skip || "0"), 10) || 0, 0);
    const q = {};
    if (req.query.isPublished === "true") q.isPublished = true;
    if (req.query.isPublished === "false") q.isPublished = false;

    const rows = await DesignerPortfolio.find(q)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not list portfolios" });
  }
}

/** GET /api/designer-portfolios/admin/:id */
export async function getDesignerPortfolioAdmin(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid portfolio id." });
    }
    const row = await DesignerPortfolio.findById(id)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not load portfolio" });
  }
}

/** PATCH /api/designer-portfolios/admin/:id — admin / productmanager */
export async function patchDesignerPortfolioAdmin(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid portfolio id." });
    }

    const row = await DesignerPortfolio.findById(id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    const patch = {};
    if (req.body.displayName != null) {
      const displayName = String(req.body.displayName).trim();
      if (displayName.length < 2 || displayName.length > 120) {
        return res.status(400).json({ success: false, message: "displayName must be 2–120 characters." });
      }
      patch.displayName = displayName;
    }
    if (req.body.headline != null) {
      patch.headline = String(req.body.headline).trim().slice(0, 200);
    }
    if (req.body.bio != null) {
      patch.bio = String(req.body.bio).trim().slice(0, 8000);
    }
    if (req.body.specialties != null) {
      patch.specialties = normalizeSpecialties(req.body.specialties);
    }
    if (req.body.isPublished != null) {
      patch.isPublished = Boolean(req.body.isPublished);
    }

    if (Array.isArray(req.body.imageOrder)) {
      const ids = req.body.imageOrder.map((x) => String(x));
      const byId = new Map(row.images.map((img) => [img._id.toString(), img]));
      if (ids.length !== row.images.length) {
        return res.status(400).json({
          success: false,
          message: "imageOrder must list every image id exactly once.",
        });
      }
      const seen = new Set();
      const reordered = [];
      for (const iid of ids) {
        if (seen.has(iid)) {
          return res.status(400).json({ success: false, message: "Duplicate id in imageOrder." });
        }
        seen.add(iid);
        const img = byId.get(iid);
        if (!img) {
          return res.status(400).json({ success: false, message: `Unknown image id: ${iid}` });
        }
        reordered.push(img);
      }
      row.images = reordered;
    }

    Object.assign(row, patch);
    await row.save();

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not update portfolio" });
  }
}

/** POST /api/designer-portfolios/admin — create portfolio for a designer staff member */
export async function createDesignerPortfolioAdmin(req, res) {
  try {
    const staffId = req.body?.staffId;
    if (!staffId || !mongoose.Types.ObjectId.isValid(String(staffId))) {
      return res.status(400).json({ success: false, message: "Valid staffId is required." });
    }

    const staffMember = await Staff.findById(staffId).select("role");
    if (!staffMember) {
      return res.status(404).json({ success: false, message: "Staff member not found." });
    }
    if (staffMember.role !== "designer") {
      return res.status(400).json({
        success: false,
        message: "Portfolios can only be created for accounts with the designer role.",
      });
    }

    const existing = await DesignerPortfolio.findOne({ staff: staffId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This designer already has a portfolio.",
      });
    }

    const displayName = String(req.body?.displayName ?? "").trim();
    if (displayName.length < 2 || displayName.length > 120) {
      return res.status(400).json({
        success: false,
        message: "displayName is required (2–120 characters).",
      });
    }

    const headline = String(req.body?.headline ?? "").trim().slice(0, 200);
    const bio = String(req.body?.bio ?? "").trim().slice(0, 8000);
    const specialties = normalizeSpecialties(req.body?.specialties);
    const isPublished = Boolean(req.body?.isPublished);

    const doc = await DesignerPortfolio.create({
      staff: staffId,
      displayName,
      headline,
      bio,
      specialties,
      images: [],
      isPublished,
    });

    const populated = await DesignerPortfolio.findById(doc._id)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not create portfolio" });
  }
}

/** POST /api/designer-portfolios/admin/:id/images — same as /me/images but for any portfolio (admin) */
export async function addAdminPortfolioImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "An image file is required (field name: image).",
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
      return res.status(400).json({ success: false, message: "Invalid portfolio id." });
    }

    const row = await DesignerPortfolio.findById(id);
    if (!row) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    if (row.images.length >= MAX_IMAGES) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
      return res.status(400).json({
        success: false,
        message: `At most ${MAX_IMAGES} portfolio images allowed.`,
      });
    }

    const caption = String(req.body?.caption ?? "").trim().slice(0, 500);
    const rel = portfolioImageRelPathFromFilename(req.file.filename);

    row.images.push({
      relPath: rel,
      caption,
      originalName: String(req.file.originalname || "").slice(0, 500),
      mimeType: req.file.mimetype || "",
    });
    await row.save();

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (req.file?.filename) {
      await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
    }
    res.status(500).json({ success: false, message: error.message || "Could not add image" });
  }
}

/** DELETE /api/designer-portfolios/admin/:id/images/:imageId */
export async function deleteAdminPortfolioImage(req, res) {
  try {
    const { id: portfolioId, imageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(portfolioId) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }

    const row = await DesignerPortfolio.findById(portfolioId);
    if (!row) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    const img = row.images.id(imageId);
    if (!img) {
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    const relPath = img.relPath;
    row.images.pull({ _id: imageId });
    await row.save();
    await deleteUploadedRelPath(relPath);

    const populated = await DesignerPortfolio.findById(row._id)
      .populate("staff", "firstName lastName email username jobTitle role")
      .lean();

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not remove image" });
  }
}
