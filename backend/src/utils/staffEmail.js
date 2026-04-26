/**
 * Staff account emails must use a domain with at least one dot after @
 * (e.g. name@company.com), not bare hosts like name@localhost.
 */
const STAFF_ACCOUNT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidStaffAccountEmail(email) {
  const t = String(email ?? "").trim().toLowerCase();
  if (!t) return false;
  return STAFF_ACCOUNT_EMAIL_RE.test(t);
}

export function staffAccountEmailErrorMessage() {
  return "Email must include a domain with a dot after @ (e.g. name@company.com).";
}
