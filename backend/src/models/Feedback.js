import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',                         
    required: [true, 'Product is required']
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',                         
    required: [true, 'Customer is required']
  },

  inquiryType: {
    type: String,
    enum: ['review', 'complaint', 'question'],
    required: [true, 'Inquiry type is required']
  },

  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },

  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'], 
    trim: true
  },

  images: {
    type: [String],
    validate: {
      validator: v => v.length <= 3, // image count validator   
      message: 'Maximum 3 images allowed'
    },
    default: []
  },

  adminResponse: {
    message: { type: String, trim: true },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Staff replies
    respondedAt: { type: Date }
  }
},

  { timestamps: true }); // Automatically adds createdAt and updatedAt

feedbackSchema.pre('validate', function (next) {
  if (this.inquiryType === 'review' && this.rating == null) {
    this.invalidate('rating', 'Rating is required for reviews');
  }
  if (this.inquiryType === 'review' && this.rating <= 2) {
    this.inquiryType = 'complaint';
  }
  next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;