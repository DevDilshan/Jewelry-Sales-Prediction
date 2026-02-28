import jwt from 'jsonwebtoken'
import Staff from '../models/Staff.js';

const generateToken = (username, role)=>{
    return jwt.sign({username, role}, process.env.ACCESS_TOKEN, {expiresIn:"7d"});
}

export async function registerUser(req, res){
    try {
        const {username, email} = req.body;
        if(!username || !email){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await Staff.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({message: "Internal server error", error:error.message})
    }
}


export async function loginStaff(req,res){
    try {
        const {email, password} = req.body
        const user = await Staff.findOne({email})
        if(!user){
            return res.status(401).json({message: "Invalid email or password"})
        }

        const isMatch = (email === user.email && password === user.password)

        if(!isMatch){
            return res.status(401).json({message: "Invalid email or password"})
        }

       const accesstoken = generateToken(user.username, user.role);
       res.json({username: user.username, email: user.email, role: user.role, accesstoken: accesstoken})
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error.message})

    }
}

export async function updateStaff(req,res){
    try {
        const user = await Staff.findByIdAndUpdate(req.params.id, req.body, {new:true});
        res.status(200).json({message: "User updated successfully", user})
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
    }
}

export async function deleteStaff(req, res) {
    try {
        const user = await Staff.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "User removed successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal server error", error:error.message})
    }
}