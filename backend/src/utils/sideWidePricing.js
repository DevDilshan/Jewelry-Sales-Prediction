import Discount from "../models/Discount.js";
import { discountIsScheduleActive } from "./discountMath.js";

/** Returns ALL active site-wide discounts so we can evaluate the best one per product */
export async function getActiveSiteWideDiscount() {
  const docs = await Discount.find({ promoScope: "site_wide" }).lean();
  return docs.filter(d => discountIsScheduleActive(d));
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

// --- DISCOUNT BEST DEAL IDENTIFIER ---
export function applySiteWideToProductPlain(productPlain, siteWideData) {
  const copy = { ...productPlain };
  let bestUnitPrice = Number(copy.productPrice);
  let isDiscounted = false;

  // We loop through ALL active site-wide sales to find the lowest possible price
  const docs = Array.isArray(siteWideData) ? siteWideData : (siteWideData ? [siteWideData] : []);

  for (const doc of docs) {
    const { unitPrice } = effectiveUnitPrice(copy.productPrice, doc);
    if (unitPrice < bestUnitPrice) {
      bestUnitPrice = unitPrice;
      isDiscounted = true;
    }
  }

  if (isDiscounted) {
    copy.compareAtPrice = Number(copy.productPrice);
    copy.productPrice = bestUnitPrice;
  } else {
    delete copy.compareAtPrice;
  }
  return copy;
}