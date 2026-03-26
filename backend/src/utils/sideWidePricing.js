import Discount from "../models/Discount.js";
import { discountIsScheduleActive } from "./discountMath.js";

/** Newest site-wide discount whose schedule is active (only one effective rule for the storefront) */
export async function getActiveSiteWideDiscount() {
  const docs = await Discount.find({ promoScope: "site_wide" }).sort({ createdAt: -1 }).lean();
  for (const d of docs) {
    if (discountIsScheduleActive(d)) return d;
  }
  return null;
}

/**
 * Apply site-wide rules to a single catalogue unit price (LKR).
 * @returns {{ unitPrice: number, compareAtPrice: number | null }}
 */
export function effectiveUnitPrice(originalPrice, siteWideDoc) {
  const original = Number(originalPrice);
  if (!Number.isFinite(original) || original < 0) {
    return { unitPrice: 0, compareAtPrice: null };
  }
  if (!siteWideDoc || !discountIsScheduleActive(siteWideDoc)) {
    return { unitPrice: Math.round(original * 100) / 100, compareAtPrice: null };
  }

  const type = siteWideDoc.discountType || "fixed";
  const raw = Number(siteWideDoc.discountAmount);
  if (Number.isNaN(raw) || raw < 0) {
    return { unitPrice: Math.round(original * 100) / 100, compareAtPrice: null };
  }

  let u = original;
  if (type === "percentage") {
    if (raw > 100) return { unitPrice: Math.round(original * 100) / 100, compareAtPrice: null };
    u = original * (1 - raw / 100);
  } else {
    u = Math.max(0, original - raw);
  }
  u = Math.round(u * 100) / 100;
  const onSale = u < original - 0.001;
  return { unitPrice: u, compareAtPrice: onSale ? Math.round(original * 100) / 100 : null };
}

export function applySiteWideToProductPlain(productPlain, siteWideDoc) {
  const copy = { ...productPlain };
  const { unitPrice, compareAtPrice } = effectiveUnitPrice(copy.productPrice, siteWideDoc);
  copy.productPrice = unitPrice;
  if (compareAtPrice != null) copy.compareAtPrice = compareAtPrice;
  else delete copy.compareAtPrice;
  return copy;
}
