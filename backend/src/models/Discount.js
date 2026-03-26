import mongoose, { Schema } from "mongoose";

const discountSchema = new Schema(
  {
    discountName: {
      type: String,
      required: true,
      trim: true,
    },
    /** 'percentage' = discountAmount is 0–100; 'fixed' = discountAmount is LKR (off subtotal for coupons, off each unit for site-wide) */
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    /** coupon = code at checkout; site_wide = all shop product prices reduced (no customer code) */
    promoScope: {
      type: String,
      enum: ["coupon", "site_wide"],
      default: "coupon",
    },
    /** Unique; site-wide rows get an auto-generated code (e.g. SW…) for storage */
    discountCoupon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    timesApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;
