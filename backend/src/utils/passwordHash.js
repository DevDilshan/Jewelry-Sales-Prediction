import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

function isBcryptHash(stored) {
  return typeof stored === "string" && /^\$2[aby]\$/.test(stored);
}

export async function hashPassword(plain) {
  if (typeof plain !== "string") {
    throw new Error("Invalid password");
  }
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Check plain password against stored value (bcrypt or legacy plaintext).
 * Does not modify the user record.
 */
export async function verifyStoredPassword(plain, stored) {
  if (!plain || stored == null) return false;
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

/**
 * For login: verify password. If DB still has legacy plaintext, rehash and save.
 * @param {{ password: string, save: () => Promise<unknown> }} user — Mongoose document
 */
export async function verifyPasswordMigrateLegacy(user, plain) {
  if (!user?.password || !plain) return false;
  const stored = user.password;
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  if (plain !== stored) return false;
  user.password = await hashPassword(plain);
  await user.save();
  return true;
}
