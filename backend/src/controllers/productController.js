import Product from "../models/Product.js";
import { getActiveSiteWideDiscount, applySiteWideToProductPlain } from "../utils/sideWidePricing.js";

function wantsShopPricing(req) {
  const q = req.query.forShop;
  return q === "1" || q === "true";
}

export async function createProduct(req, res) {
  try {
    const { productName, productCategory, productPrice, stockQuantity, isActive } = req.body;

    // Required field validation
    if (!productName || !productName.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!productCategory) {
      return res.status(400).json({ message: "Product category is required" });
    }
    if (productPrice === undefined || productPrice === null || isNaN(productPrice) || productPrice < 0) {
      return res.status(400).json({ message: "A valid price is required" });
    }
    if (stockQuantity === undefined || isNaN(stockQuantity) || stockQuantity < 0) {
      return res.status(400).json({ message: "A valid stock quantity is required" });
    }
    if (isActive === undefined || isActive === null) {
      return res.status(400).json({ message: "Active status is required" });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getProduct(req, res) {
  try {
    const products = await Product.find({}).lean();
    if (!wantsShopPricing(req)) {
      return res.status(200).json(products);
    }
    const sw = await getActiveSiteWideDiscount();
    const out = products.map((p) => applySiteWideToProductPlain(p, sw));
    res.status(200).json(out);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!wantsShopPricing(req)) {
      return res.status(200).json(product);
    }
    const sw = await getActiveSiteWideDiscount();
    res.status(200).json(applySiteWideToProductPlain(product, sw));
  } catch {
    res.status(404).json({ message: "Product not found" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { productName, productCategory, productPrice, stockQuantity } = req.body;

    // Validate only fields that are being updated
    if (productName !== undefined && !productName.trim()) {
      return res.status(400).json({ message: "Product name cannot be empty" });
    }
    if (productPrice !== undefined && (isNaN(productPrice) || productPrice < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    if (stockQuantity !== undefined && (isNaN(stockQuantity) || stockQuantity < 0)) {
      return res.status(400).json({ message: "Stock quantity must be a positive number" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true   // ← runs schema enum/type checks on update too
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" }); // ✅ fixed typo
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}