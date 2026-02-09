import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    email:{
        type: String,
        required: true,
        unique: true

    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);
