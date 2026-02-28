import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next)=>{

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
        req.user = decoded;
        next()
    } catch (error) {
        res.status(401).json({message:"Invalid token", error: error.message})
    }
}