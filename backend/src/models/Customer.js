import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
    firstName: {
        type:String,
        trim: true
    },
    lastName: {
        type:String,
        trim: true
    },
    address:{
        type: String
    },
    
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase:true
    },
    password: {
        type:String,
        required: true
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
}, {timestamps: true})

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;