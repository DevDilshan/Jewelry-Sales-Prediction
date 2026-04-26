const NAME_MAX = 80;
const TITLE_MAX = 120;
const ADDRESS_MAX = 500;
const PROFILE_IMAGE_DATA_URL_RE = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
const PROFILE_IMAGE_MAX_CHARS = 4_000_000;
const STAFF_PHONE_LOCAL_RE = /^0\d{9}$/;
const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 80;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredMsg(label) {
  return `${label} is required.`;
}

/**
 * Client-side validation for staff profile (mirrors backend). All personal fields are required.
 * @param {object} fields — firstName, lastName, phone, jobTitle, department, address, email
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateStaffProfileForm(fields) {
  const errors = {};
  const {
    firstName = "",
    lastName = "",
    phone = "",
    jobTitle = "",
    department = "",
    address = "",
    yearsOfExperience = "",
    dateOfBirth = "",
    emergencyContactNumber = "",
    email = "",
  } = fields;

  const fn = String(firstName).trim();
  if (!fn) errors.firstName = requiredMsg("First name");
  else if (fn.length > NAME_MAX) errors.firstName = `First name must be at most ${NAME_MAX} characters.`;
  else if (/<|>/.test(fn) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(fn)) {
    errors.firstName = "First name contains invalid characters.";
  }

  const ln = String(lastName).trim();
  if (!ln) errors.lastName = requiredMsg("Last name");
  else if (ln.length > NAME_MAX) errors.lastName = `Last name must be at most ${NAME_MAX} characters.`;
  else if (/<|>/.test(ln) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(ln)) {
    errors.lastName = "Last name contains invalid characters.";
  }

  const ph = String(phone).trim();
  if (!ph) errors.phone = requiredMsg("Phone");
  else {
    const digits = ph.replace(/\D/g, "");
    if (!STAFF_PHONE_LOCAL_RE.test(digits)) {
      errors.phone =
        "Enter exactly 10 digits starting with 0 (e.g. 0771234567).";
    }
  }

  const jt = String(jobTitle).trim();
  if (!jt) errors.jobTitle = requiredMsg("Job title");
  else if (jt.length > TITLE_MAX) errors.jobTitle = `Job title must be at most ${TITLE_MAX} characters.`;
  else if (/<|>/.test(jt) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(jt)) {
    errors.jobTitle = "Job title contains invalid characters.";
  }

  const dep = String(department).trim();
  if (!dep) errors.department = requiredMsg("Department");
  else if (dep.length > TITLE_MAX) errors.department = `Department must be at most ${TITLE_MAX} characters.`;
  else if (/<|>/.test(dep) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(dep)) {
    errors.department = "Department contains invalid characters.";
  }

  const addr = String(address).trim();
  if (!addr) errors.address = requiredMsg("Address");
  else if (addr.length > ADDRESS_MAX) errors.address = `Address must be at most ${ADDRESS_MAX} characters.`;
  else if (/<|>/.test(addr) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(addr)) {
    errors.address = "Address contains invalid characters.";
  }

  const exp = String(yearsOfExperience).trim();
  if (!exp) errors.yearsOfExperience = requiredMsg("Years of experience");
  else {
    const n = Number(exp);
    if (!Number.isInteger(n) || n < EXPERIENCE_MIN || n > EXPERIENCE_MAX) {
      errors.yearsOfExperience = `Years of experience must be a whole number between ${EXPERIENCE_MIN} and ${EXPERIENCE_MAX}.`;
    }
  }

  const dob = String(dateOfBirth).trim();
  if (!dob) errors.dateOfBirth = "Date of birth is required.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) errors.dateOfBirth = "Date of birth must be in YYYY-MM-DD format.";
  else {
    const d = new Date(`${dob}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) errors.dateOfBirth = "Date of birth is invalid.";
    else if (d > new Date()) errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  const ec = String(emergencyContactNumber).trim();
  if (!ec) errors.emergencyContactNumber = requiredMsg("Emergency contact number");
  else {
    const digits = ec.replace(/\D/g, "");
    if (!STAFF_PHONE_LOCAL_RE.test(digits)) {
      errors.emergencyContactNumber =
        "Enter exactly 10 digits starting with 0 (e.g. 0771234567).";
    }
  }

  const em = String(email).trim().toLowerCase();
  if (!em) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(em)) errors.email = "Enter a valid email address.";
  else if (em.length > 254) errors.email = "Email is too long.";

  const pic = fields.profileImage;
  if (pic != null && pic !== "") {
    const s = String(pic);
    if (s.length > PROFILE_IMAGE_MAX_CHARS) {
      errors.profileImage = "Profile photo is too large. Choose a smaller image (e.g. under 2.5 MB).";
    } else if (!PROFILE_IMAGE_DATA_URL_RE.test(s)) {
      errors.profileImage = "Profile photo must be JPEG, PNG, GIF, or WebP.";
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
