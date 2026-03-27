import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Discount from "../models/Discount.js";
import { evaluateDiscount } from "../utils/discountMath.js";
import { getActiveSiteWideDiscount, effectiveUnitPrice } from "../utils/sideWidePricing.js";

function normalizeCoupon(code) {
  if (!code) return "";
  return String(code).trim().toUpperCase();
}

export const placeOrder = async (req, res) => {
  try {
    const { items, discountCoupon } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one product to place an order",
      });
    }

    const lineItems = [];
    let subtotal = 0;
    const siteWide = await getActiveSiteWideDiscount();

    for (const line of items) {
      const productId = line.productId;
      const quantity = parseInt(line.quantity, 10);
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: "Invalid cart line" });
      }

      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: "A product is no longer available" });
      }
      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.productName}`,
        });
      }

      const { unitPrice } = effectiveUnitPrice(product.productPrice, siteWide);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      lineItems.push({
        product: product._id,
        quantity,
        price: unitPrice,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    let discountAmount = 0;
    let discountId = null;
    let discountCode = null;

    const coupon = normalizeCoupon(discountCoupon);
    if (coupon) {
      const discountDoc = await Discount.findOne({
        discountCoupon: coupon,
        $or: [{ promoScope: "coupon" }, { promoScope: { $exists: false } }],
      });
      const evaluated = evaluateDiscount(discountDoc, subtotal);
      if (!evaluated.ok) {
        return res.status(400).json({ success: false, message: evaluated.message });
      }
      discountAmount = evaluated.discountAmount;
      discountId = discountDoc._id;
      discountCode = discountDoc.discountCoupon;
    }

    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    const order = new Order({
      customer: req.customerId,
      items: lineItems,
      subtotal,
      discountAmount,
      discountCode,
      discountId,
      totalAmount,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Cash",
      fulfillmentType: "takeaway",
    });

    for (let i = 0; i < items.length; i++) {
      const product = await Product.findById(items[i].productId);
      product.stockQuantity -= parseInt(items[i].quantity, 10);
      await product.save();
    }

    if (discountId) {
      await Discount.findByIdAndUpdate(discountId, { $inc: { timesApplied: 1 } });
    }

    const savedOrder = await order.save();
    const populated = await Order.findById(savedOrder._id).populate("items.product");

    res.status(201).json({
      success: true,
      message: "Order placed. Pay when you pick up at the boutique.",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customerId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.customer) !== String(req.customerId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    let q = Order.find({})
      .populate("customer", "firstName lastName email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    if (req.query.limit !== undefined) {
      const n = parseInt(req.query.limit, 10);
      if (!Number.isNaN(n) && n > 0) {
        q = q.limit(Math.min(n, 200));
      }
    }

    const orders = await q;
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderAdmin = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("customer", "firstName lastName email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderStatsAdmin = async (req, res) => {
  try {
    const agg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
        },
      },
    ]);
    const row = agg[0] || { totalOrders: 0, totalRevenue: 0 };
    res.json({
      success: true,
      data: {
        totalOrders: row.totalOrders,
        totalRevenue: Math.round(row.totalRevenue * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.customer) !== String(req.customerId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
