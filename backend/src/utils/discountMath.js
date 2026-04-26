/** Date window only — used by coupons, site-wide, and schedule checks */
export function discountScheduleMessage(discount) {
  if (!discount) return "Invalid promo code";
  const now = new Date();
  if (discount.startDate && new Date(discount.startDate) > now) {
    return "This code is not active yet";
  }
  if (discount.endDate && new Date(discount.endDate) < now) {
    return "This promo code has expired";
  }
  return null;
}

export function discountIsScheduleActive(discount) {
  return !discountScheduleMessage(discount);
}

/**
 * Evaluate a discount against a cart subtotal.
 * Now also enforces the optional minSubtotal threshold.
 *
 * @param discount  Mongoose doc or plain object
 * @param subtotal  Cart subtotal in LKR
 * @returns {{ ok: boolean, message?: string, discountAmount?: number }}
 */
export function evaluateDiscount(discount, subtotal) {
  if (!discount) {
    return { ok: false, message: "Invalid promo code" };
  }

  // --- Schedule check ---
  const sched = discountScheduleMessage(discount);
  if (sched) {
    return { ok: false, message: sched };
  }

  // --- Minimum subtotal (admin sends minSubtotalLkr; DB field is minSubtotal) ---
  const rawMin = discount.minSubtotalLkr ?? discount.minSubtotal;
  const minSub = Number(rawMin);
  if (!Number.isNaN(minSub) && minSub > 0 && subtotal < minSub) {
    const subStr = subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const minStr = minSub.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return {
      ok: false,
      message: `This code needs a minimum order of LKR ${minStr}. Your cart subtotal is LKR ${subStr}.`,
    };
  }

  const isCoupon = discount.promoScope !== "site_wide";
  if (isCoupon) {
    const maxUses = discount.maxUses;
    if (maxUses != null && maxUses > 0) {
      const used = Number(discount.timesApplied) || 0;
      if (used >= maxUses) {
        return { ok: false, message: "This promo code has reached its usage limit." };
      }
    }
  }

  // --- Discount calculation ---
  const type = discount.discountType || "fixed";
  const raw = Number(discount.discountAmount);
  if (Number.isNaN(raw) || raw < 0) {
    return { ok: false, message: "Invalid discount configuration" };
  }

  let off = 0;
  if (type === "percentage") {
    if (raw > 100) {
      return { ok: false, message: "Invalid percentage discount" };
    }
    off = (subtotal * raw) / 100;
  } else {
    off = Math.min(raw, subtotal);
  }

  off = Math.round(off * 100) / 100;
  return { ok: true, discountAmount: off };
}