import { Customer } from "../models/Customer.js";
import jwt from 'jsonwebtoken'

const generateToken = (customerId) =>{
    return jwt.sign({id: customerId}, process.env.CUSTOMER_ACCESS_TOKEN, {expiresIn:"7d"})
}

export async function registerCustomer(req,res){
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "All fields are required."})
        }
        if(!email.includes("@")){
            return res.status(400).json({message: "Invalid email"})
        }
        const customer = await Customer.create(req.body);
        res.status(201).json({
            firstname: customer.firstName, 
            lastname: customer.lastName, 
            email: customer.email, 
            address: customer.address
        })

    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error.message})
    }
}

export async function loginCustomer(req,res){
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        const customer = await Customer.findOne({email})
        if(!customer) return res.status(400).json({message:"Invalid customer"});
        
        const isMatch = (email === customer.email && password === customer.password)
        if(!isMatch) return res.status(400).json({message:"Invalid credentials!"});

        const accesstoken = generateToken(customer._id);
        res.json({
            id: customer.id,
            firstname: customer.firstName,
            email: customer.email,
            token: accesstoken
        })

    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
    }
}

export async function updateCustomer(req,res){
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {new:true});
        res.status(200).json({message: "Customer updated successfully"})
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
    }
}

export async function deleteCustomer(req, res) {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "User removed successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal server error", error:error.message})
    }
}