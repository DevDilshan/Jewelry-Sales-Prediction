const NAME_MAX = 80;
const TITLE_MAX = 120;
const ADDRESS_MAX = 500;
/** Max stored length for base64 profile photos (~3.7MB decoded). */
const PROFILE_IMAGE_MAX_CHARS = 5_000_000;
const PROFILE_IMAGE_DATA_URL_RE = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
/** Local mobile: exactly 10 digits, first digit 0 (e.g. 0771234567) */
const STAFF_PHONE_LOCAL_RE = /^0\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredMsg(fieldLabel) {
  return `${fieldLabel} is required.`;
}

/**
 * Validate staff self-service profile fields. Only checks keys present on `body`.
 * Personal-detail fields (firstName, lastName, phone, jobTitle, department, address) are required when sent.
 * @returns {{ ok: true, values: object } | { ok: false, errors: Record<string, string> }}
 */
export function validateStaffProfilePatch(body) {
  const errors = {};
  const values = {};

  if (Object.prototype.hasOwnProperty.call(body, "firstName")) {
    const t = String(body.firstName ?? "").trim();
    if (!t) {
      errors.firstName = requiredMsg("First name");
    } else if (t.length > NAME_MAX) {
      errors.firstName = `First name must be at most ${NAME_MAX} characters.`;
    } else if (/<|>/.test(t) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t)) {
      errors.firstName = "First name contains invalid characters.";
    } else {
      values.firstName = t;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "lastName")) {
    const t = String(body.lastName ?? "").trim();
    if (!t) {
      errors.lastName = requiredMsg("Last name");
    } else if (t.length > NAME_MAX) {
      errors.lastName = `Last name must be at most ${NAME_MAX} characters.`;
    } else if (/<|>/.test(t) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t)) {
      errors.lastName = "Last name contains invalid characters.";
    } else {
      values.lastName = t;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    const raw = String(body.phone ?? "").trim();
    if (!raw) {
      errors.phone = requiredMsg("Phone");
    } else {
      const digits = raw.replace(/\D/g, "");
      if (!STAFF_PHONE_LOCAL_RE.test(digits)) {
        errors.phone =
          "Enter exactly 10 digits starting with 0 (e.g. 0771234567).";
      } else {
        values.phone = digits;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "jobTitle")) {
    const t = String(body.jobTitle ?? "").trim();
    if (!t) {
      errors.jobTitle = requiredMsg("Job title");
    } else if (t.length > TITLE_MAX) {
      errors.jobTitle = `Job title must be at most ${TITLE_MAX} characters.`;
    } else if (/<|>/.test(t) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t)) {
      errors.jobTitle = "Job title contains invalid characters.";
    } else {
      values.jobTitle = t;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "department")) {
    const t = String(body.department ?? "").trim();
    if (!t) {
      errors.department = requiredMsg("Department");
    } else if (t.length > TITLE_MAX) {
      errors.department = `Department must be at most ${TITLE_MAX} characters.`;
    } else if (/<|>/.test(t) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t)) {
      errors.department = "Department contains invalid characters.";
    } else {
      values.department = t;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "address")) {
    const t = String(body.address ?? "").trim();
    if (!t) {
      errors.address = requiredMsg("Address");
    } else if (t.length > ADDRESS_MAX) {
      errors.address = `Address must be at most ${ADDRESS_MAX} characters.`;
    } else if (/<|>/.test(t) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t)) {
      errors.address = "Address contains invalid characters.";
    } else {
      values.address = t;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "profileImage")) {
    const raw = body.profileImage;
    if (raw === null || raw === undefined) {
      /* skip */
    } else if (typeof raw !== "string") {
      errors.profileImage = "Profile photo must be a string or empty.";
    } else {
      const t = raw.trim();
      if (!t) {
        values.profileImage = "";
      } else if (t.length > PROFILE_IMAGE_MAX_CHARS) {
        errors.profileImage = "Profile photo is too large. Use a smaller image (e.g. under 2.5 MB).";
      } else if (!PROFILE_IMAGE_DATA_URL_RE.test(t)) {
        errors.profileImage = "Profile photo must be a JPEG, PNG, GIF, or WebP image.";
      } else {
        values.profileImage = t;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "email")) {
    const t = String(body.email ?? "").trim().toLowerCase();
    if (!t) {
      errors.email = "Email is required.";
    } else if (!EMAIL_RE.test(t)) {
      errors.email = "Enter a valid email address.";
    } else if (t.length > 254) {
      errors.email = "Email is too long.";
    } else {
      values.email = t;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, values };
}
