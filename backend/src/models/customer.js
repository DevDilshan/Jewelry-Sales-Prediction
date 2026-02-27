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
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase:true
    },
    password: {
        type:String,
        required: true
    }
}, {timestamps: true})

const Customer = mongoose.model("Customer", customerSchema);