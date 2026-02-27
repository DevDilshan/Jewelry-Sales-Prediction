import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  inquiryType: {
    type: String,
    enum: ['review', 'complaint', 'question'],
    required: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number (1 to 5 stars)'
    }
  },

  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },

  images: {
    type: [String],
    validate: {
      validator: v => v.length <= 3,
      message: 'Maximum 3 images allowed'
    },
    default: []
  },
  
  adminResponse: {
    message: { type: String },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    respondedAt: { type: Date }
  }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;