const MIN_LENGTH = 8;

/**
 * @param {unknown} password
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePasswordStrength(password) {
  const s = String(password ?? "");
  if (s.length < MIN_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_LENGTH} characters.` };
  }
  if (!/[A-Z]/.test(s)) {
    return { ok: false, message: "Password must include at least one uppercase letter." };
  }
  if (!/[^A-Za-z0-9]/.test(s)) {
    return { ok: false, message: "Password must include at least one special character." };
  }
  return { ok: true };
}
