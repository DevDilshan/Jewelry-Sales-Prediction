import mongoose from "mongoose";
import DesignerPortfolio from "../models/DesignerPortfolio.js";
import Staff from "../models/Staff.js";
import { portfolioImageRelPathFromFilename } from "../middlewares/uploadDesignerPortfolioImage.js";
import { deleteUploadedRelPath } from "../utils/uploadedFile.js";
import { requestPublicBaseUrl, uploadsUrlForRelPath } from "../utils/publicAssetUrl.js";

const MAX_IMAGES = 15;
const MAX_SPECIALTIES = 20;
const YEARS_MAX = 80;
const PROJECTS_MAX = 100000;

const POPULATE_STAFF_ME = "firstName lastName email username jobTitle";
const POPULATE_STAFF_ADMIN = `${POPULATE_STAFF_ME} role`;

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

/** emptyAsZero: create / default when missing → 0. false: PATCH semantics (caller only passes when updating). */
function parseYears(raw, emptyAsZero) {
  if (emptyAsZero && (raw === undefined || raw === null || raw === "")) return { value: 0 };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > YEARS_MAX) {
    return { error: "yearsOfExperience must be an integer from 0 to 80." };
  }
  return { value: n };
}

function parseProjects(raw, emptyAsZero) {
  if (emptyAsZero && (raw === undefined || raw === null || raw === "")) return { value: 0 };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > PROJECTS_MAX) {
    return { error: "completedProjects must be an integer from 0 to 100,000." };
  }
  return { value: n };
}

function publicStaffFields(staff) {
  if (!staff || typeof staff !== "object") return null;
  return {
    firstName: staff.firstName ?? "",
    lastName: staff.lastName ?? "",
    jobTitle: staff.jobTitle ?? "",
  };
}

function toPublicPortfolio(doc, assetBase) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const staff = publicStaffFields(o.staff);
  const base = assetBase || "";
  const out = {
    _id: o._id,
    displayName: o.displayName,
    headline: o.headline,
    bio: o.bio,
    specialties: o.specialties || [],
    images: (o.images || []).map((img) => {
      const relPath = img.relPath;
      return {
        _id: img._id,
        relPath,
        caption: img.caption || "",
        url: uploadsUrlForRelPath(base, relPath),
      };
    }),
    updatedAt: o.updatedAt,
    staff,
  };
  if (typeof o.yearsOfExperience === "number" && Number.isFinite(o.yearsOfExperience)) {
    out.yearsOfExperience = o.yearsOfExperience;
  }
  if (typeof o.completedProjects === "number" && Number.isFinite(o.completedProjects)) {
    out.completedProjects = o.completedProjects;
  }
  return out;
}

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function asyncHandler(handler, fallbackMessage, { onCatch } = {}) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (onCatch) await onCatch(req, error);
      res.status(500).json({ success: false, message: error.message || fallbackMessage });
    }
  };
}

async function leanPortfolioById(id, staffSelect) {
  return DesignerPortfolio.findById(id).populate("staff", staffSelect).lean();
}

/** Validates create POST body; same rules for /me and admin create. */
function readCreatePortfolioBody(body) {
  const displayName = String(body?.displayName ?? "").trim();
  if (displayName.length < 2 || displayName.length > 120) {
    return { error: "displayName is required (2–120 characters)." };
  }
  const y = parseYears(body?.yearsOfExperience, true);
  if (y.error) return { error: y.error };
  const p = parseProjects(body?.completedProjects, true);
  if (p.error) return { error: p.error };
  return {
    displayName,
    headline: String(body?.headline ?? "").trim().slice(0, 200),
    bio: String(body?.bio ?? "").trim().slice(0, 8000),
    specialties: normalizeSpecialties(body?.specialties),
    isPublished: Boolean(body?.isPublished),
    yearsOfExperience: y.value,
    completedProjects: p.value,
  };
}

/** Mutates row.images when body.imageOrder is an array. Returns error message or null. */
function applyImageOrder(row, imageOrder) {
  const ids = imageOrder.map((x) => String(x));
  const byId = new Map(row.images.map((img) => [img._id.toString(), img]));
  if (ids.length !== row.images.length) {
    return "imageOrder must list every image id exactly once.";
  }
  const seen = new Set();
  const reordered = [];
  for (const id of ids) {
    if (seen.has(id)) return "Duplicate id in imageOrder.";
    seen.add(id);
    const img = byId.get(id);
    if (!img) return `Unknown image id: ${id}`;
    reordered.push(img);
  }
  row.images = reordered;
  return null;
}

/** Shared PATCH field validation for designer /me and admin/:id. */
function buildPortfolioPatch(row, body) {
  const patch = {};
  if (body.displayName != null) {
    const displayName = String(body.displayName).trim();
    if (displayName.length < 2 || displayName.length > 120) {
      return { error: "displayName must be 2–120 characters." };
    }
    patch.displayName = displayName;
  }
  if (body.headline != null) patch.headline = String(body.headline).trim().slice(0, 200);
  if (body.bio != null) patch.bio = String(body.bio).trim().slice(0, 8000);
  if (body.specialties != null) patch.specialties = normalizeSpecialties(body.specialties);
  if (body.isPublished != null) patch.isPublished = Boolean(body.isPublished);
  if (body.yearsOfExperience !== undefined && body.yearsOfExperience !== null) {
    const r = parseYears(body.yearsOfExperience, false);
    if (r.error) return { error: r.error };
    patch.yearsOfExperience = r.value;
  }
  if (body.completedProjects !== undefined && body.completedProjects !== null) {
    const r = parseProjects(body.completedProjects, false);
    if (r.error) return { error: r.error };
    patch.completedProjects = r.value;
  }
  if (Array.isArray(body.imageOrder)) {
    const err = applyImageOrder(row, body.imageOrder);
    if (err) return { error: err };
  }
  return { patch };
}

async function cleanupUploadedFile(req) {
  if (req.file?.filename) {
    await deleteUploadedRelPath(portfolioImageRelPathFromFilename(req.file.filename));
  }
}

/** GET /api/designer-portfolios/public */
export const listPublishedPortfolios = asyncHandler(
  async (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "20"), 10) || 20, 1), 50);
    const skip = Math.max(parseInt(String(req.query.skip || "0"), 10) || 0, 0);
    const rows = await DesignerPortfolio.find({ isPublished: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("staff", "firstName lastName jobTitle")
      .lean();
    const assetBase = requestPublicBaseUrl(req);
    res.json({ success: true, data: rows.map((row) => toPublicPortfolio(row, assetBase)) });
  },
  "Could not list portfolios"
);

/** GET /api/designer-portfolios/public/:id */
export const getPublishedPortfolioById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, "Invalid portfolio id.");
    const row = await DesignerPortfolio.findOne({ _id: id, isPublished: true })
      .populate("staff", "firstName lastName jobTitle")
      .lean();
    if (!row) return fail(res, 404, "Portfolio not found.");
    res.json({ success: true, data: toPublicPortfolio(row, requestPublicBaseUrl(req)) });
  },
  "Could not load portfolio"
);

/** GET /api/designer-portfolios/me — designer only */
export const getMyDesignerPortfolio = asyncHandler(
  async (req, res) => {
    const row = await DesignerPortfolio.findOne({ staff: req.user.id })
      .populate("staff", POPULATE_STAFF_ME)
      .lean();
    res.json({ success: true, data: row || null });
  },
  "Could not load portfolio"
);

/** POST /api/designer-portfolios/me — create portfolio (designer only) */
export const createMyDesignerPortfolio = asyncHandler(
  async (req, res) => {
    if (await DesignerPortfolio.findOne({ staff: req.user.id })) {
      return fail(res, 409, "You already have a portfolio. Use PATCH to update it.");
    }
    const fields = readCreatePortfolioBody(req.body);
    if (fields.error) return fail(res, 400, fields.error);
    const doc = await DesignerPortfolio.create({
      staff: req.user.id,
      ...fields,
      images: [],
    });
    res.status(201).json({ success: true, data: await leanPortfolioById(doc._id, POPULATE_STAFF_ME) });
  },
  "Could not create portfolio"
);

/** PATCH /api/designer-portfolios/me */
export const patchMyDesignerPortfolio = asyncHandler(
  async (req, res) => {
    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) {
      return fail(res, 404, "No portfolio yet. Create one with POST /api/designer-portfolios/me first.");
    }
    const built = buildPortfolioPatch(row, req.body);
    if (built.error) return fail(res, 400, built.error);
    Object.assign(row, built.patch);
    await row.save();
    res.json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ME) });
  },
  "Could not update portfolio"
);

/** POST /api/designer-portfolios/me/images — multipart field `image` */
export const addMyPortfolioImage = asyncHandler(
  async (req, res) => {
    if (!req.file) return fail(res, 400, "An image file is required (field name: image).");
    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) {
      await cleanupUploadedFile(req);
      return fail(res, 404, "No portfolio yet. Create one with POST /api/designer-portfolios/me first.");
    }
    if (row.images.length >= MAX_IMAGES) {
      await cleanupUploadedFile(req);
      return fail(res, 400, `At most ${MAX_IMAGES} portfolio images allowed.`);
    }
    const rel = portfolioImageRelPathFromFilename(req.file.filename);
    row.images.push({
      relPath: rel,
      caption: String(req.body?.caption ?? "").trim().slice(0, 500),
      originalName: String(req.file.originalname || "").slice(0, 500),
      mimeType: req.file.mimetype || "",
    });
    await row.save();
    res.status(201).json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ME) });
  },
  "Could not add image",
  { onCatch: cleanupUploadedFile }
);

/** DELETE /api/designer-portfolios/me/images/:imageId */
export const deleteMyPortfolioImage = asyncHandler(
  async (req, res) => {
    const { imageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(imageId)) return fail(res, 400, "Invalid image id.");
    const row = await DesignerPortfolio.findOne({ staff: req.user.id });
    if (!row) return fail(res, 404, "Portfolio not found.");
    const img = row.images.id(imageId);
    if (!img) return fail(res, 404, "Image not found.");
    const relPath = img.relPath;
    row.images.pull({ _id: imageId });
    await row.save();
    await deleteUploadedRelPath(relPath);
    res.json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ME) });
  },
  "Could not remove image"
);

/** GET /api/designer-portfolios/admin */
export const listDesignerPortfoliosAdmin = asyncHandler(
  async (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10) || 50, 1), 100);
    const skip = Math.max(parseInt(String(req.query.skip || "0"), 10) || 0, 0);
    const q = {};
    if (req.query.isPublished === "true") q.isPublished = true;
    if (req.query.isPublished === "false") q.isPublished = false;
    const rows = await DesignerPortfolio.find(q)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("staff", POPULATE_STAFF_ADMIN)
      .lean();
    res.json({ success: true, data: rows });
  },
  "Could not list portfolios"
);

/** GET /api/designer-portfolios/admin/:id */
export const getDesignerPortfolioAdmin = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, "Invalid portfolio id.");
    const row = await DesignerPortfolio.findById(id).populate("staff", POPULATE_STAFF_ADMIN).lean();
    if (!row) return fail(res, 404, "Portfolio not found.");
    res.json({ success: true, data: row });
  },
  "Could not load portfolio"
);

/** PATCH /api/designer-portfolios/admin/:id — admin / productmanager */
export const patchDesignerPortfolioAdmin = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, "Invalid portfolio id.");
    const row = await DesignerPortfolio.findById(id);
    if (!row) return fail(res, 404, "Portfolio not found.");
    const built = buildPortfolioPatch(row, req.body);
    if (built.error) return fail(res, 400, built.error);
    Object.assign(row, built.patch);
    await row.save();
    res.json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ADMIN) });
  },
  "Could not update portfolio"
);

/** POST /api/designer-portfolios/admin — create portfolio for a designer staff member */
export const createDesignerPortfolioAdmin = asyncHandler(
  async (req, res) => {
    const staffId = req.body?.staffId;
    if (!staffId || !mongoose.Types.ObjectId.isValid(String(staffId))) {
      return fail(res, 400, "Valid staffId is required.");
    }
    const staffMember = await Staff.findById(staffId).select("role");
    if (!staffMember) return fail(res, 404, "Staff member not found.");
    if (staffMember.role !== "designer") {
      return fail(res, 400, "Portfolios can only be created for accounts with the designer role.");
    }
    if (await DesignerPortfolio.findOne({ staff: staffId })) {
      return fail(res, 409, "This designer already has a portfolio.");
    }
    const fields = readCreatePortfolioBody(req.body);
    if (fields.error) return fail(res, 400, fields.error);
    const doc = await DesignerPortfolio.create({ staff: staffId, ...fields, images: [] });
    res.status(201).json({ success: true, data: await leanPortfolioById(doc._id, POPULATE_STAFF_ADMIN) });
  },
  "Could not create portfolio"
);

/** POST /api/designer-portfolios/admin/:id/images — same as /me/images but for any portfolio (admin) */
export const addAdminPortfolioImage = asyncHandler(
  async (req, res) => {
    if (!req.file) return fail(res, 400, "An image file is required (field name: image).");
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await cleanupUploadedFile(req);
      return fail(res, 400, "Invalid portfolio id.");
    }
    const row = await DesignerPortfolio.findById(id);
    if (!row) {
      await cleanupUploadedFile(req);
      return fail(res, 404, "Portfolio not found.");
    }
    if (row.images.length >= MAX_IMAGES) {
      await cleanupUploadedFile(req);
      return fail(res, 400, `At most ${MAX_IMAGES} portfolio images allowed.`);
    }
    row.images.push({
      relPath: portfolioImageRelPathFromFilename(req.file.filename),
      caption: String(req.body?.caption ?? "").trim().slice(0, 500),
      originalName: String(req.file.originalname || "").slice(0, 500),
      mimeType: req.file.mimetype || "",
    });
    await row.save();
    res.status(201).json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ADMIN) });
  },
  "Could not add image",
  { onCatch: cleanupUploadedFile }
);

/** DELETE /api/designer-portfolios/admin/:id/images/:imageId */
export const deleteAdminPortfolioImage = asyncHandler(
  async (req, res) => {
    const { id: portfolioId, imageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(portfolioId) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return fail(res, 400, "Invalid id.");
    }
    const row = await DesignerPortfolio.findById(portfolioId);
    if (!row) return fail(res, 404, "Portfolio not found.");
    const img = row.images.id(imageId);
    if (!img) return fail(res, 404, "Image not found.");
    const relPath = img.relPath;
    row.images.pull({ _id: imageId });
    await row.save();
    await deleteUploadedRelPath(relPath);
    res.json({ success: true, data: await leanPortfolioById(row._id, POPULATE_STAFF_ADMIN) });
  },
  "Could not remove image"
);
