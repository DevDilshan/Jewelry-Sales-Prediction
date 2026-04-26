import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    /** Display name when listing (snapshot at submit time) */
    customerName: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    staffReply: {
      type: String,
      default: "",
      trim: true,
    },
    staffReplyAt: {
      type: Date,
    },
    staffRepliedByName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ order: 1, customer: 1 }, { unique: true }); //unique review fixed

export default mongoose.model("Feedback", feedbackSchema);
