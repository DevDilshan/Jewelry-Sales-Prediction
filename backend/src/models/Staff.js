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
        enum: ["admin", "productmanager", "sales", "viewer"],
        default: "viewer"
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