const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[\d\s\-+().]*$/;

function countPhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "").length;
}

/**
 * @param {{ fullName: string, email: string, phone: string, address: string }} profile
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateCustomerProfileForm(profile) {
  const errors = {};
  const fullName = String(profile.fullName ?? "").trim();
  const email = String(profile.email ?? "").trim();
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

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone) {
    if (!PHONE_CHARS_RE.test(phone)) {
      errors.phone = "Phone may only include digits, spaces, and + ( ) - .";
    } else {
      const digits = countPhoneDigits(phone);
      if (digits < 8) {
        errors.phone = "Phone number is too short (at least 8 digits).";
      } else if (digits > 15) {
        errors.phone = "Phone number is too long (at most 15 digits).";
      }
    }
  }

  if (address.length > 2000) {
    errors.address = "Address must be at most 2000 characters.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
