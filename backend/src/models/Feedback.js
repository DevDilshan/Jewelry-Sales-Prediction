import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    name:{
        type:String
    },
    feedback: {
        type:String
    },
    rating:{
        type: Number,
        required: true
    }
}, {timestamps: true})

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;