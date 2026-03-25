import express from "express";
import {
  createProductReview,
  getMyProductReview,
  getProductPageBundle,
  listReviewsForProduct,
} from "../controllers/productReviewController.js";
import { verifyCustomerToken } from "../middlewares/customerAuth.js";
import { optionalCustomerToken } from "../middlewares/customerAuthOptional.js";

const router = express.Router();

router.get("/page/:productId", optionalCustomerToken, getProductPageBundle);
router.get("/product/:productId", listReviewsForProduct);
router.get("/mine/:productId", verifyCustomerToken, getMyProductReview);
router.post("/", verifyCustomerToken, createProductReview);

export default router;
