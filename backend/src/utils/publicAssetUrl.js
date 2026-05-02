/**
 * Public base URL for building absolute links to `/uploads/...` (e.g. designer portfolio images).
 * Prefer `PUBLIC_API_BASE_URL` on Render (https://your-service.onrender.com) so URLs stay correct
 * behind a reverse proxy. Otherwise derive from the incoming request.
 */
export function requestPublicBaseUrl(req) {
  const env = process.env.PUBLIC_API_BASE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") || req.get("host");
  const proto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return "";
}

/** Full URL to a file stored under `backend/uploads` (same rules as the mobile `mediaUrl` helper). */
export function uploadsUrlForRelPath(baseUrl, relPath) {
  if (relPath == null || typeof relPath !== "string") return null;
  let p = relPath.trim().replace(/^\/+/g, "").replace(/\\/g, "/");
  if (!p) return null;
  if (/^uploads\//i.test(p)) {
    p = p.replace(/^uploads\//i, "");
  }
  const encodedPath = p
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  if (!encodedPath) return null;
  const b = (baseUrl || "").replace(/\/$/, "");
  if (!b) return null;
  return `${b}/uploads/${encodedPath}`;
}
