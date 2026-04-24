/** Sri Lankan mobile: 10 digits, local format starting with 07 (e.g. 0712345678). */
const LK_MOBILE_10_RE = /^07[0-9]{8}$/;

/** Strip to digits, map leading 94… to 0… (local), keep at most 10 digits. */
export function toLkMobileTenDigits(value) {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.startsWith("94") && d.length >= 11) {
    d = `0${d.slice(2)}`;
  }
  return d.slice(0, 10);
}

/**
 * @param {{ fullName: string, phone: string, address: string }} profile — email is not editable; omit from validation.
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateCustomerProfileForm(profile) {
  const errors = {};
  const fullName = String(profile.fullName ?? "").trim();
  const phone = String(profile.phone ?? "").trim();
  const address = String(profile.address ?? "").trim();

  if (!fullName) {
    errors.fullName = "Enter your full name.";
  } else if (fullName.length > 121) {
    errors.fullName = "Name is too long.";
  } else {
    const space = fullName.indexOf(" ");
    const first = space === -1 ? fullName : fullName.slice(0, space).trim();
    if (!first) {
      errors.fullName = "Enter your full name.";
    } else if (first.length > 60) {
      errors.fullName = "First name must be at most 60 characters.";
    } else {
      const last = space === -1 ? "" : fullName.slice(space + 1).trim();
      if (last.length > 60) {
        errors.fullName = "Last name must be at most 60 characters.";
      }
    }
  }

  const ph = toLkMobileTenDigits(phone);
  if (!ph) {
    errors.phone = "Enter your 10-digit mobile number (e.g. 0712345678).";
  } else if (!LK_MOBILE_10_RE.test(ph)) {
    errors.phone = "Use a Sri Lankan mobile: 10 digits starting with 07 (e.g. 0712345678).";
  }

  if (address.length > 2000) {
    errors.address = "Address must be at most 2000 characters.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
