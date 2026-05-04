import jwt from 'jsonwebtoken'

export const verifyCustomerToken = (req,res,next)=>{
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1]

    if(!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.CUSTOMER_ACCESS_TOKEN);
        req.customerId = decoded.id
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" })
    }
}

/**
 * For public routes that should still link to a customer when a valid Bearer token is sent
 * (e.g. POST /custom-design-requests/inquiry). Invalid/missing token → continue as guest.
 */
export const optionalVerifyCustomerToken = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.CUSTOMER_ACCESS_TOKEN);
        req.customerId = decoded.id;
    } catch {
        /* ignore — treat as guest */
    }
    next();
};