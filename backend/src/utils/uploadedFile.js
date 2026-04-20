import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const UPLOADS_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "uploads");

/** Delete a file under backend/uploads given a relative path like `designer-portfolio/foo.png`. */
export async function deleteUploadedRelPath(relPath) {
  if (!relPath || typeof relPath !== "string") return;
  const abs = path.join(UPLOADS_ROOT, ...relPath.split("/").filter(Boolean));
  try {
    await fs.unlink(abs);
  } catch {
    /* missing file is fine */
  }
}
