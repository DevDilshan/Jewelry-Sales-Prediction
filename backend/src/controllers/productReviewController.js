import ProductReview from "../models/ProductReview.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Feedback from "../models/Feedback.js";
import Order from "../models/Order.js";
import { getActiveSiteWideDiscount, applySiteWideToProductPlain } from "../utils/siteWidePricing.js";

function customerDisplayName(customer) {
  if (!customer) return "";
  const n = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return n || customer.email || "Customer";
}

/** Normalize order Feedback to same shape as product reviews for the shop */
function mapOrderFeedbackToReview(fb) {
  return {
    _id: fb._id,
    customerName: fb.customerName || "Customer",
    title: fb.title || "",
    text: fb.feedback,
    rating: fb.rating,
    createdAt: fb.createdAt,
    source: "order",
    staffReply: fb.staffReply || "",
    staffRepliedByName: fb.staffRepliedByName || "",
    staffReplyAt: fb.staffReplyAt,
  };
}

async function fetchMergedReviewsForProduct(productId, orderIds) {
  const [productRows, orderFeedbacks] = await Promise.all([
    ProductReview.find({ product: productId })
      .sort({ createdAt: -1 })
      .select("customerName title text rating createdAt")
      .lean(),
    orderIds.length
      ? Feedback.find({ order: { $in: orderIds } })
          .sort({ createdAt: -1 })
          .select(
            "customerName title feedback rating createdAt staffReply staffReplyAt staffRepliedByName"
          )
          .lean()
      : Promise.resolve([]),
  ]);

  const fromShop = productRows.map((r) => ({ ...r, source: "product" }));
  const fromOrders = orderFeedbacks.map(mapOrderFeedbackToReview);
  return [...fromShop, ...fromOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function resolveMineForProduct(productId, customerId) {
  if (!customerId) {
    return { productReview: null, orderFeedback: null };
  }

  const [productReview, custOrderIds] = await Promise.all([
    ProductReview.findOne({ product: productId, customer: customerId })
      .select("customerName title text rating createdAt")
      .lean(),
    Order.find({
      customer: customerId,
      "items.product": productId,
    }).distinct("_id"),
  ]);

  if (!custOrderIds.length) {
    return { productReview: productReview || null, orderFeedback: null };
  }

  const fb = await Feedback.findOne({
    customer: customerId,
    order: { $in: custOrderIds },
  })
    .sort({ createdAt: -1 })
    .select(
      "customerName title feedback rating createdAt staffReply staffReplyAt staffRepliedByName"
    )
    .lean();

  return {
    productReview: productReview || null,
    orderFeedback: fb ? mapOrderFeedbackToReview(fb) : null,
  };
}

/**
 * One round trip: active product + merged reviews + optional mine (send customer Bearer token)
 */
export async function getProductPageBundle(req, res) {
  try {
    const { productId } = req.params;

    const [product, orderIds] = await Promise.all([
      Product.findById(productId).lean(),
      Order.find({ "items.product": productId }).distinct("_id"),
    ]);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [reviews, mine, siteWide] = await Promise.all([
      fetchMergedReviewsForProduct(productId, orderIds),
      resolveMineForProduct(productId, req.customerId),
      getActiveSiteWideDiscount(),
    ]);

    const productOut = applySiteWideToProductPlain(product, siteWide);
    res.status(200).json({ product: productOut, reviews, mine });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Public: all reviews for a product */
export async function listReviewsForProduct(req, res) {
  try {
    const { productId } = req.params;
    const [product, orderIds] = await Promise.all([
      Product.findById(productId).select("_id isActive").lean(),
      Order.find({ "items.product": productId }).distinct("_id"),
    ]);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }
    const merged = await fetchMergedReviewsForProduct(productId, orderIds);
    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getMyProductReview(req, res) {
  try {
    const { productId } = req.params;
    const mine = await resolveMineForProduct(productId, req.customerId);
    res.status(200).json(mine);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Customer: create review — visible on product page immediately */
export async function createProductReview(req, res) {
  try {
    const { productId, rating, title, text } = req.body;
    if (!productId || text == null || String(text).trim() === "" || rating == null) {
      return res.status(400).json({ message: "Product, review text, and rating are required." });
    }
    const r = Number(rating);
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = await ProductReview.findOne({ product: productId, customer: req.customerId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const customer = await Customer.findById(req.customerId);
    const doc = await ProductReview.create({
      product: productId,
      customer: req.customerId,
      customerName: customerDisplayName(customer),
      title: (title || "").trim(),
      text: String(text).trim(),
      rating: r,
    });

    const out = await ProductReview.findById(doc._id)
      .select("customerName title text rating createdAt")
      .lean();

    res.status(201).json(out);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
