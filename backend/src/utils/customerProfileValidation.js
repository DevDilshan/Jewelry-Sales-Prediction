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
    phone: merged("phone"),
    address: merged("address"),
  };
}

/**
 * @returns {Record<string, string>} field key → message (empty if valid)
 */
export function validateCustomerProfileFields(fields) {
  const errors = {};
  const { firstName, lastName, phone, address } = fields;

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

  const ph = toLkMobileTenDigits(phone);
  if (!ph) {
    errors.phone = "Enter your 10-digit mobile number (e.g. 0712345678).";
  } else if (!LK_MOBILE_10_RE.test(ph)) {
    errors.phone = "Use a Sri Lankan mobile: 10 digits starting with 07 (e.g. 0712345678).";
  }

  const addr = String(address ?? "").trim();
  if (addr.length > 2000) {
    errors.address = "Address must be at most 2000 characters.";
  }

  return errors;
}
