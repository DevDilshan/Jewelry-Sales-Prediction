import Customer from "../models/Customer.js";
import jwt from "jsonwebtoken";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";
import { hashPassword, verifyPasswordMigrateLegacy } from "../utils/passwordHash.js";
import { generatePasswordResetToken, passwordResetExpiryDate } from "../utils/passwordResetToken.js";

const generateToken = (customerId) =>{
    return jwt.sign({id: customerId}, process.env.CUSTOMER_ACCESS_TOKEN, {expiresIn:"7d"})
}

export async function registerCustomer(req,res){
    try {
        const { firstName, lastName, email, password, address } = req.body;

        if(!email || !password){
            return res.status(400).json({message: "All fields are required."})
        }
        if(!email.includes("@")){
            return res.status(400).json({message: "Invalid email"})
        }
        const policy = validatePasswordStrength(password);
        if (!policy.ok) {
            return res.status(400).json({ message: policy.message });
        }
        const passwordHash = await hashPassword(password);
        const customer = await Customer.create({
            firstName,
            lastName,
            email: String(email).trim().toLowerCase(),
            address,
            password: passwordHash,
        });
        const accesstoken = generateToken(customer._id);
        res.status(201).json({
            id: customer._id,
            firstname: customer.firstName,
            lastname: customer.lastName,
            email: customer.email,
            address: customer.address,
            token: accesstoken,
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

        const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
        if(!customer) return res.status(400).json({message:"Invlaid customer"});
        
        const isMatch = await verifyPasswordMigrateLegacy(customer, password);
        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

        const accesstoken = generateToken(customer._id);
        res.json({
            id: customer._id,
            firstname: customer.firstName,
            lastname: customer.lastName,
            email: customer.email,
            token: accesstoken,
        })

    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message})
    }
}

const CUSTOMER_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for that email, password reset instructions have been sent.";

function sanitizeReturnPath(value) {
  const s = String(value ?? "").trim();
  if (!s.startsWith("/")) return "";
  if (s.startsWith("//") || s.includes("://")) return "";
  return s;
}

export async function forgotCustomerPassword(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "A valid email is required." });
    }
    const customer = await Customer.findOne({ email });
    if (customer) {
      const token = generatePasswordResetToken();
      customer.resetToken = token;
      customer.resetTokenExpiry = passwordResetExpiryDate();
      await customer.save();
      const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
      const returnPath = sanitizeReturnPath(req.body?.return);
      const qs = new URLSearchParams({ token });
      if (returnPath) qs.set("return", returnPath);
      const link = `${base}/reset-password?${qs.toString()}`;
      console.log("[Customer password reset]", { email: customer.email, resetLink: link });
    }
    res.json({ message: CUSTOMER_FORGOT_PASSWORD_MESSAGE });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function resetCustomerPasswordWithToken(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ message: policy.message });
    }
    const customer = await Customer.findOne({ resetToken: String(token).trim() });
    if (!customer?.resetTokenExpiry || new Date(customer.resetTokenExpiry) <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset link. Request a new one." });
    }
    customer.password = await hashPassword(newPassword);
    customer.resetToken = null;
    customer.resetTokenExpiry = null;
    await customer.save();
    res.json({ message: "Password has been reset. You can sign in with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function updateCustomer(req,res){
    try {
        const body = { ...req.body };
        delete body.resetToken;
        delete body.resetTokenExpiry;
        if (Object.prototype.hasOwnProperty.call(body, "password") && body.password) {
            body.password = await hashPassword(String(body.password));
        } else {
            delete body.password;
        }
        const customer = await Customer.findByIdAndUpdate(req.params.id, body, { new: true });
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