import crypto from "crypto";

/** Password reset links expire after this many milliseconds (1 hour). */
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

/** Cryptographically secure random token (hex). */
export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function passwordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
}
