import jwt from "jsonwebtoken";

/** Sets req.customerId when a valid customer Bearer token is present; otherwise continues without error */
export function optionalCustomerToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(" ")[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.CUSTOMER_ACCESS_TOKEN);
    req.customerId = decoded.id;
  } catch {
    /* public response without mine */
  }
  next();
}
