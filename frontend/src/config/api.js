const raw = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export const API_BASE = raw.replace(/\/$/, "");

/** Origin without `/api` — used for `/uploads/...` URLs */
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, "") || "";

/** Full URL for a stored upload path, e.g. `custom-designs/file.png` */
export function uploadUrl(relPath) {
  if (!relPath) return "";
  const clean = String(relPath).replace(/^\/+/, "");
  return `${API_ORIGIN}/uploads/${clean}`;
}

const STAFF_KEY = "spark_staff_token";
const STAFF_INFO_KEY = "spark_staff";
const CUSTOMER_KEY = "spark_customer_token";
const CUSTOMER_INFO_KEY = "spark_customer";

export function getStaffToken() {
  return localStorage.getItem(STAFF_KEY);
}

export function setStaffAuth(token, staffInfo) {
  if (token) localStorage.setItem(STAFF_KEY, token);
  else localStorage.removeItem(STAFF_KEY);
  if (staffInfo) localStorage.setItem(STAFF_INFO_KEY, JSON.stringify(staffInfo));
  else localStorage.removeItem(STAFF_INFO_KEY);
}

/** @deprecated — use setStaffAuth instead */
export function setStaffToken(token) {
  setStaffAuth(token, null);
}

export function getStaffInfo() {
  try {
    const s = localStorage.getItem(STAFF_INFO_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/** Read `role` from JWT payload when cached staff info omits it (fixes designer vs admin UI routing). */
function getRoleFromStaffJwt() {
  const t = getStaffToken();
  if (!t) return null;
  try {
    const part = t.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function getStaffRole() {
  return getStaffInfo()?.role || getRoleFromStaffJwt();
}

/**
 * Permission matrix — which roles can see each admin page.
 * Missing key = any staff can see it.
 */
export const ROLE_PERMISSIONS = {
  dashboard:  ["admin", "productmanager", "sales", "viewer", "designer"],
  products:   ["admin", "productmanager", "designer"],
  discounts:  ["admin", "sales", "designer"],
  orders:     ["admin", "sales", "designer"],
  customers:  ["admin", "productmanager", "sales", "viewer", "designer"],
  feedbacks:  ["admin", "productmanager", "sales", "viewer", "designer"],
  staff:      ["admin"],
  profile:    ["admin", "productmanager", "sales", "viewer", "designer"],
  "sales-prediction": ["admin", "productmanager", "sales", "viewer", "designer"],
  "custom-design-requests": ["admin", "productmanager", "sales", "viewer", "designer"],
  /** Designers edit their own; admin/PM manage all; sales/viewer read-only */
  "designer-portfolio": ["admin", "productmanager", "sales", "viewer", "designer"],
};

export function canAccess(pageId) {
  const role = getStaffRole();
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[pageId];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_KEY);
}

export function setCustomerAuth(token, customer) {
  if (token) localStorage.setItem(CUSTOMER_KEY, token);
  else localStorage.removeItem(CUSTOMER_KEY);
  if (customer) localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(customer));
  else localStorage.removeItem(CUSTOMER_INFO_KEY);
}

export function getCustomerInfo() {
  try {
    const s = localStorage.getItem(CUSTOMER_INFO_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} path — e.g. "/product" (API_BASE already includes /api)
 * @param {object} options
 */
export async function api(path, options = {}) {
  const { method = "GET", body, auth } = options;
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (auth === "staff") {
    const t = getStaffToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (auth === "customer") {
    const t = getCustomerToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const msg = data.message || data.error || res.statusText;
    const err = new Error(typeof msg === "string" ? msg : "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * POST multipart/form-data (e.g. sketch upload). Do not set Content-Type — browser sets boundary.
 */
export async function apiForm(path, formData, options = {}) {
  const { auth } = options;
  const headers = { ...options.headers };

  if (auth === "staff") {
    const t = getStaffToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (auth === "customer") {
    const t = getCustomerToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const msg = data.message || data.error || res.statusText;
    const err = new Error(typeof msg === "string" ? msg : "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** DELETE (no body) */
export async function apiDelete(path, options = {}) {
  const { auth } = options;
  const headers = { ...options.headers };

  if (auth === "staff") {
    const t = getStaffToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (auth === "customer") {
    const t = getCustomerToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const msg = data.message || data.error || res.statusText;
    const err = new Error(typeof msg === "string" ? msg : "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
