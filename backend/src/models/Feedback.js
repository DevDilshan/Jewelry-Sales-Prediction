import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    name: {
        type: String
    },
    productId: {
        type: String
    },
    inquiryType: {
        type: String,
        enum: ['review', 'complaint', 'question'],
        default: 'review'
    },
    feedback: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;