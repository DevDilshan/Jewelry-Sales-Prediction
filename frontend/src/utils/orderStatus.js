/** Canonical order lifecycle for takeaway (matches backend enum). */
export const ORDER_STATUSES = ["Pending", "Processing", "Ready"];

/**
 * Map legacy statuses from older data to the current model.
 * @param {string | undefined} status
 * @returns {"Pending" | "Processing" | "Ready"}
 */
export function normalizeOrderStatus(status) {
  const s = status || "Pending";
  if (ORDER_STATUSES.includes(s)) return s;
  if (s === "Shipped" || s === "Delivered") return "Ready";
  if (s === "Cancelled") return "Pending";
  return "Pending";
}

/** When customers may submit order-based feedback (Ready, or legacy delivered/shipped). */
export function isOrderFeedbackEligible(status) {
  return status === "Ready" || status === "Delivered" || status === "Shipped";
}
