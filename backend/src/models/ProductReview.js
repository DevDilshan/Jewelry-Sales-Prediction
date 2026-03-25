import mongoose, { Schema } from "mongoose";

const productReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    text: {
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
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, customer: 1 }, { unique: true });
productReviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("ProductReview", productReviewSchema);
