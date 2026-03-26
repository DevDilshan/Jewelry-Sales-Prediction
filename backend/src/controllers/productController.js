import Product from "../models/Product.js";
import { getActiveSiteWideDiscount, applySiteWideToProductPlain } from "../utils/siteWidePricing.js";

function wantsShopPricing(req) {
  const q = req.query.forShop;
  return q === "1" || q === "true";
}

export async function createProduct(req, res) {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({message: "Internal server error", error:error.message})
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

/** Single active product — public (shop product page) */
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
        const product = await Product.findByIdAndUpdate(req.params.id, req.body,{new: true})
        if(!product){
            return res.status(404).json({message: "Product not found"})
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: "Internal server error", error:error.message})
    }
}

export async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.stauts(404).json({message: "Product not found"});
        }
        res.status(200).json({message: "Product deleted successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error.message})
    }
}