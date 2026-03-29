import mongoose, { Schema } from "mongoose";

const discountSchema = new Schema(
  {
    discountName: {
      type: String,
      required: true,
      trim: true,
    },
    // Used to group recurring discounts for statistics/analytics (e.g., "New Year")
    campaignTheme: {
      type: String,
      default: "None",
      trim: true,
    },
    /** 'percentage' = discountAmount is 0–100; 'fixed' = discountAmount is LKR */
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
    /** coupon = code at checkout; site_wide = all shop product prices reduced */
    promoScope: {
      type: String,
      enum: ["coupon", "site_wide"],
      default: "coupon",
    },
    /** Unique; site-wide rows get an auto-generated code (e.g. SW…) */
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
    /**
     * Optional minimum cart subtotal (LKR) required before this coupon can be applied.
     * If null or 0, there is no minimum — coupon works on any subtotal.
     * (API/admin UI may refer to this as minSubtotalLkr; it is stored here.)
     */
    minSubtotal: {
      type: Number,
      default: null,
      min: 0,
    },
    /** Coupon only: max successful checkouts; null = unlimited */
    maxUses: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema);

// FIX: This tells MongoDB to check this schema against the database
// and automatically delete any old "ghost" indexes (like the "Coupen" typo).
Discount.syncIndexes()
  .then(() => console.log("Discount indexes synced successfully! Ghost indexes removed."))
  .catch((err) => console.error("Error syncing discount indexes:", err));

export default Discount;