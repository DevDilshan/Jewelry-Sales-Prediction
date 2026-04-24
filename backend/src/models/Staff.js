import mongoose, { Schema } from "mongoose";


const staffSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "productmanager", "sales", "viewer", "designer"],
        default: "viewer"
    },
    firstName: {
        type: String,
        trim: true,
        default: "",
    },
    lastName: {
        type: String,
        trim: true,
        default: "",
    },
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    jobTitle: {
        type: String,
        trim: true,
        default: "",
    },
    department: {
        type: String,
        trim: true,
        default: "",
    },
    address: {
        type: String,
        trim: true,
        default: "",
    },
    /** Optional data URL or URL string (same pattern as product images). */
    profileImage: {
        type: String,
        default: "",
    },
    resetToken: {
        type: String,
        default: null,
        sparse: true,
        index: true,
    },
    resetTokenExpiry: {
        type: Date,
        default: null,
    },

}, { timestamps: true })


const Staff = mongoose.model("Staff", staffSchema)
export default Staff