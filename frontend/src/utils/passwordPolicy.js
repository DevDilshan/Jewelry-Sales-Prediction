export const PASSWORD_MIN_LENGTH = 8;

/** Requirements summary for labels / hints */
export const PASSWORD_REQUIREMENTS_HINT =
  "At least 8 characters, one uppercase letter, and one special character.";

/**
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordPolicyValid(password) {
  const s = String(password ?? "");
  return (
    s.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(s) &&
    /[^A-Za-z0-9]/.test(s)
  );
}

/**
 * Human-readable issues for a non-empty password that does not meet policy.
 * @param {string} password
 * @returns {string[]}
 */
export function getPasswordPolicyIssues(password) {
  const s = String(password ?? "");
  if (!s) return [];
  const issues = [];
  if (s.length < PASSWORD_MIN_LENGTH) {
    issues.push(`Use at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(s)) {
    issues.push("Add an uppercase letter (A–Z).");
  }
  if (!/[^A-Za-z0-9]/.test(s)) {
    issues.push("Add a special character (e.g. ! @ # $).");
  }
  return issues;
}
