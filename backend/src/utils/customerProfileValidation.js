const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[\d\s\-+().]*$/;

function countPhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "").length;
}

/**
 * Merge DB customer with PATCH update for validation.
 * @param {Record<string, unknown>} customer — mongoose doc or lean object
 * @param {Record<string, string>} update — trimmed strings for keys being changed
 */
export function mergeCustomerProfileForValidation(customer, update) {
  const fromCustomer = (key) => String(customer[key] ?? "").trim();
  const merged = (key) =>
    Object.prototype.hasOwnProperty.call(update, key) ? update[key] : fromCustomer(key);

  return {
    firstName: merged("firstName"),
    lastName: merged("lastName"),
    email: Object.prototype.hasOwnProperty.call(update, "email")
      ? String(update.email ?? "").trim().toLowerCase()
      : fromCustomer("email").toLowerCase(),
    phone: merged("phone"),
    address: merged("address"),
  };
}

/**
 * @returns {Record<string, string>} field key → message (empty if valid)
 */
export function validateCustomerProfileFields(fields) {
  const errors = {};
  const { firstName, lastName, email, phone, address } = fields;

  const fn = String(firstName ?? "").trim();
  const ln = String(lastName ?? "").trim();
  if (!fn) {
    errors.firstName = "First name is required.";
  } else if (fn.length > 60) {
    errors.firstName = "First name must be at most 60 characters.";
  }
  if (ln.length > 60) {
    errors.lastName = "Last name must be at most 60 characters.";
  }

  const em = String(email ?? "").trim().toLowerCase();
  if (!em) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(em)) {
    errors.email = "Enter a valid email address.";
  }

  const ph = String(phone ?? "").trim();
  if (ph) {
    if (!PHONE_CHARS_RE.test(ph)) {
      errors.phone = "Phone may only include digits, spaces, and + ( ) - .";
    } else {
      const digits = countPhoneDigits(ph);
      if (digits < 8) {
        errors.phone = "Phone number is too short (at least 8 digits).";
      } else if (digits > 15) {
        errors.phone = "Phone number is too long (at most 15 digits).";
      }
    }
  }

  const addr = String(address ?? "").trim();
  if (addr.length > 2000) {
    errors.address = "Address must be at most 2000 characters.";
  }

  return errors;
}
