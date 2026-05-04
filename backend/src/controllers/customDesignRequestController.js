import CustomDesignRequest from "../models/CustomDesignRequest.js";
import Customer from "../models/Customer.js";
import { sketchRelPathFromFilename } from "../middlewares/uploadCustomDesignSketch.js";

const ALLOWED_STATUSES = ["pending", "in_review", "quoted", "declined", "completed"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeDescription(raw) {
  return String(raw ?? "").trim();
}

/** POST /api/custom-design-requests/inquiry — public, no login; text + contact (no sketch). */
export async function createGuestCustomDesignInquiry(req, res) {
  try {
    const guestName = String(req.body?.name ?? req.body?.guestName ?? "").trim();
    const guestEmail = String(req.body?.email ?? req.body?.guestEmail ?? "").trim().toLowerCase();
    const guestPhone = String(req.body?.phone ?? req.body?.guestPhone ?? "").trim();
    const budgetNote = String(req.body?.budget ?? req.body?.budgetNote ?? "").trim().slice(0, 500);
    let description = normalizeDescription(req.body?.description);

    if (!guestName || guestName.length < 2) {
      return res.status(400).json({ success: false, message: "Name is required (at least 2 characters)." });
    }
    if (!guestEmail || !EMAIL_RE.test(guestEmail)) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }
    if (description.length > 8000) {
      return res.status(400).json({
        success: false,
        message: "Description must be at most 8000 characters.",
      });
    }

    const payload = {
      guestName,
      guestEmail,
      guestPhone: guestPhone.slice(0, 40),
      budgetNote: budgetNote || "",
      description,
      sketchRelPath: "",
      sketchOriginalName: "",
      sketchMimeType: "",
      title: String(req.body?.title ?? "").trim().slice(0, 200),
      status: "pending",
    };
    if (req.customerId) {
      payload.customer = req.customerId;
    }

    const doc = await CustomDesignRequest.create(payload);

    const lean = await CustomDesignRequest.findById(doc._id).lean();
    res.status(201).json({ success: true, data: lean });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Could not create inquiry" });
  }
}

/** POST /api/custom-design-requests — customer + multipart (sketch required) */
export async function createCustomDesignRequest(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A sketch image file is required (field name: sketch).",
      });
    }

    const description = normalizeDescription(req.body?.description);
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required.",
      });
    }
    if (description.length > 8000) {
      return res.status(400).json({
        success: false,
        message: "Description must be at most 8000 characters.",
      });
    }

    const title = String(req.body?.title ?? "").trim().slice(0, 200);

    const rel = sketchRelPathFromFilename(req.file.filename);

    const doc = await CustomDesignRequest.create({
      customer: req.customerId,
      title,
      description,
      sketchRelPath: rel,
      sketchOriginalName: String(req.file.originalname || "").slice(0, 500),
      sketchMimeType: req.file.mimetype || "",
      status: "pending",
    });

    const populated = await CustomDesignRequest.findById(doc._id)
      .populate("customer", "firstName lastName email")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.message && error.message.includes("Sketch must be an image")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || "Could not create request" });
  }
}

/** GET /api/custom-design-requests/my — linked by `customer` or by matching `guestEmail` to account email */
export async function listMyCustomDesignRequests(req, res) {
  try {
    const customer = await Customer.findById(req.customerId).select("email").lean();
    const email = customer?.email ? String(customer.email).trim().toLowerCase() : "";
    const or = [{ customer: req.customerId }];
    if (email) {
      or.push({ guestEmail: email });
    }
    const list = await CustomDesignRequest.find({ $or: or })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/** GET /api/custom-design-requests/my/:id — owned by customer id or guest inquiry with same email */
export async function getMyCustomDesignRequest(req, res) {
  try {
    const customer = await Customer.findById(req.customerId).select("email").lean();
    const email = customer?.email ? String(customer.email).trim().toLowerCase() : "";
    const or = [{ customer: req.customerId }];
    if (email) {
      or.push({ guestEmail: email });
    }
    const row = await CustomDesignRequest.findOne({
      _id: req.params.id,
      $or: or,
    }).lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/** GET /api/custom-design-requests/admin — staff: all requests */
export async function listCustomDesignRequestsAdmin(req, res) {
  try {
    const status = String(req.query.status || "").trim().toLowerCase();
    const filter = {};
    if (status && ALLOWED_STATUSES.includes(status)) {
      filter.status = status;
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    const [rows, total] = await Promise.all([
      CustomDesignRequest.find(filter)
        .populate("customer", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomDesignRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: rows,
      meta: { total, limit, skip },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/** GET /api/custom-design-requests/admin/:id — staff: one request */
export async function getCustomDesignRequestAdmin(req, res) {
  try {
    const row = await CustomDesignRequest.findById(req.params.id)
      .populate("customer", "firstName lastName email phone address")
      .lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/** PATCH /api/custom-design-requests/admin/:id — staff: status + staffNote */
export async function updateCustomDesignRequestAdmin(req, res) {
  try {
    const { status, staffNote } = req.body;
    const update = {};

    if (status !== undefined && status !== null && String(status).trim() !== "") {
      const s = String(status).trim().toLowerCase();
      if (!ALLOWED_STATUSES.includes(s)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Use one of: ${ALLOWED_STATUSES.join(", ")}.`,
        });
      }
      update.status = s;
    }

    if (staffNote !== undefined) {
      const note = String(staffNote ?? "").trim();
      if (note.length > 4000) {
        return res.status(400).json({
          success: false,
          message: "Staff note must be at most 4000 characters.",
        });
      }
      update.staffNote = note;
    }

    if (Object.keys(update).length === 0) {
      const existing = await CustomDesignRequest.findById(req.params.id)
        .populate("customer", "firstName lastName email phone")
        .lean();
      if (!existing) {
        return res.status(404).json({ success: false, message: "Request not found." });
      }
      return res.json({ success: true, data: existing });
    }

    const row = await CustomDesignRequest.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
      .populate("customer", "firstName lastName email phone")
      .lean();

    if (!row) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
