import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [orderItemSchema],

    subtotal: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    discountCode: {
      type: String,
      trim: true,
    },

    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      default: "Cash",
    },

    /** Takeaway: pay on pickup; no online payment */
    fulfillmentType: {
      type: String,
      enum: ["takeaway", "delivery"],
      default: "takeaway",
    },
  },
  { timestamps: true }
);

orderSchema.index({ "items.product": 1 });
orderSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
