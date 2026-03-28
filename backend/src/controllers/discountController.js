import Discount from "../models/Discount.js";
import { evaluateDiscount } from "../utils/discountMath.js";

function normalizeCoupon(code) {
  return String(code || "").trim().toUpperCase();
}

function generateSiteWideCode() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SW-${t}-${r}`;
}

function parseOptionalPositiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

function parseOptionalMaxUses(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseInt(String(value), 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

export async function createDiscount(req, res) {
  try {
    const body = { ...req.body };
    const scope = body.promoScope === "site_wide" ? "site_wide" : "coupon";
    body.promoScope = scope;

    body.campaignTheme = body.campaignTheme && String(body.campaignTheme).trim() !== ""
        ? String(body.campaignTheme).trim()
        : "None";

    if (scope === "coupon") {
      if (!body.discountCoupon || !String(body.discountCoupon).trim()) {
        return res.status(400).json({ message: "Promo code is required for coupon discounts." });
      }
      body.discountCoupon = normalizeCoupon(body.discountCoupon);
      
      const existingCode = await Discount.findOne({ discountCoupon: body.discountCoupon });
      if (existingCode) {
        return res.status(400).json({ message: "This promo code already exists. Please choose another." });
      }
    } else {
      body.discountCoupon = generateSiteWideCode();
    }

    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      if (end < start) {
        return res.status(400).json({ message: "End date cannot be before the start date." });
      }
    }

    if (scope === "coupon") {
      body.minSubtotalLkr = parseOptionalPositiveNumber(body.minSubtotalLkr);
      body.maxUses = parseOptionalMaxUses(body.maxUses);
    } else {
      body.minSubtotalLkr = null;
      body.maxUses = null;
    }

    const discount = await Discount.create(body);
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not create discount" });
  }
}

export async function viewDiscount(req, res) {
  try {
    const discounts = await Discount.find({}).sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function validateCoupon(req, res) {
  try {
    // --- BEST DEAL ALGORITHM ---
    // We now take the 'baseSubtotal' (e.g., LKR 100,000) and the site-wide savings (e.g., LKR 20,000)
    const { code, baseSubtotal, siteWideSavings = 0 } = req.body;
    const coupon = normalizeCoupon(code);
    
    if (!coupon) return res.status(400).json({ valid: false, message: "Enter a promo code" });

    const discount = await Discount.findOne({ discountCoupon: coupon });
    if (!discount || discount.promoScope === "site_wide") {
      return res.status(200).json({ valid: false, message: "Invalid promo code" });
    }

    const sub = Math.max(0, Number(baseSubtotal) || 0);

    // Evaluate the coupon against the TRUE ORIGINAL PRICE (LKR 100,000)
    const result = evaluateDiscount(discount, sub);

    if (!result.ok) {
      return res.status(200).json({ valid: false, message: result.message });
    }

    const couponSavingsAmount = Number(result.discountAmount); // e.g., LKR 30,000

    // If the site-wide sale is better than the coupon, stop them!
    if (couponSavingsAmount <= siteWideSavings && siteWideSavings > 0) {
      return res.status(200).json({ 
        valid: false, 
        message: `You already have the best deal! The current sale saves you LKR ${siteWideSavings.toLocaleString()}, but this coupon only saves LKR ${couponSavingsAmount.toLocaleString()}.` 
      });
    }

    // If the coupon is better (30k > 20k), we apply it to the base price!
    const totalAfter = Math.max(0, Math.round((sub - couponSavingsAmount) * 100) / 100);

    res.status(200).json({
      valid: true,
      discountType: discount.discountType,
      discountAmount: couponSavingsAmount, 
      subtotal: sub,
      totalAfter: totalAfter,
      code: discount.discountCoupon,
      message: siteWideSavings > 0 
        ? "Awesome! This coupon overrides the site-wide sale to give you an even better deal." 
        : "Coupon applied successfully!"
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
}

function parseOptionalDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function updateDiscount(req, res) {
  try {
    const existing = await Discount.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Discount not found" });

    const {
      discountName,
      campaignTheme,
      promoScope: scopeRaw,
      discountType,
      discountAmount,
      discountCoupon: couponRaw,
      startDate: startDateRaw,
      endDate: endDateRaw,
      minSubtotalLkr: minSubtotalRaw,
      maxUses: maxUsesRaw,
    } = req.body;

    const promoScope = scopeRaw === "site_wide" ? "site_wide" : "coupon";

    const update = {
      promoScope,
      discountType: discountType === "percentage" || discountType === "fixed" ? discountType : existing.discountType,
      discountAmount: discountAmount != null && !Number.isNaN(Number(discountAmount)) ? Number(discountAmount) : existing.discountAmount,
      campaignTheme: campaignTheme != null && String(campaignTheme).trim() !== "" ? String(campaignTheme).trim() : existing.campaignTheme,
    };

    if (discountName != null && String(discountName).trim()) update.discountName = String(discountName).trim();

    let parsedStart = existing.startDate;
    let parsedEnd = existing.endDate;

    if (Object.prototype.hasOwnProperty.call(req.body, "startDate")) {
      parsedStart = parseOptionalDate(startDateRaw);
      update.startDate = parsedStart;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "endDate")) {
      parsedEnd = parseOptionalDate(endDateRaw);
      update.endDate = parsedEnd;
    }

    if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
      return res.status(400).json({ message: "End date cannot be before the start date." });
    }

    let coupon = existing.discountCoupon;

    if (promoScope === "site_wide") {
      if (existing.promoScope !== "site_wide") coupon = generateSiteWideCode();
    } else {
      const trimmed = couponRaw != null ? String(couponRaw).trim() : "";
      if (!trimmed) {
        if (existing.promoScope !== "coupon") return res.status(400).json({ message: "Promo code is required when switching to a coupon discount." });
        coupon = existing.discountCoupon;
      } else {
        coupon = normalizeCoupon(trimmed);
        const clash = await Discount.findOne({ discountCoupon: coupon, _id: { $ne: existing._id } });
        if (clash) return res.status(400).json({ message: "Another discount already uses this code." });
      }
    }

    update.discountCoupon = coupon;

    if (promoScope === "coupon") {
      if (Object.prototype.hasOwnProperty.call(req.body, "minSubtotalLkr")) {
        update.minSubtotalLkr = parseOptionalPositiveNumber(minSubtotalRaw);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "maxUses")) {
        update.maxUses = parseOptionalMaxUses(maxUsesRaw);
      }
    } else {
      update.minSubtotalLkr = null;
      update.maxUses = null;
    }

    const discount = await Discount.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json(discount);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteDiscount(req, res) {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}