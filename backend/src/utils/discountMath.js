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

/** @param discount Mongoose doc or plain object; @param subtotal cart subtotal in LKR */
export function evaluateDiscount(discount, subtotal) {
  if (!discount) {
    return { ok: false, message: "Invalid promo code" };
  }

  const sched = discountScheduleMessage(discount);
  if (sched) {
    return { ok: false, message: sched };
  }

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
