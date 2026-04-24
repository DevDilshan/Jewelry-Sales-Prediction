/** Same rule as backend: domain must contain a dot after @. */
const STAFF_ACCOUNT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidStaffAccountEmail(email) {
  const t = String(email ?? "").trim();
  if (!t) return false;
  return STAFF_ACCOUNT_EMAIL_RE.test(t);
}

export function staffAccountEmailHint() {
  return "Use an address like name@company.com (the part after @ must include a dot).";
}
