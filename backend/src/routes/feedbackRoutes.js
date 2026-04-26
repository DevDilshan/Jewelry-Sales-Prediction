import express from "express";
import {
  createCustomerFeedback,
  deleteFeedback,
  getFeedbackStats,
  getMyCustomerFeedback,
  listFeedbackForStaff,
  replyToFeedback,
  updateCustomerFeedback,
  deleteCustomerFeedback,
} from "../controllers/feedbackController.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { verifyCustomerToken } from "../middlewares/customerAuth.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";

const router = express.Router();

router.post("/create", verifyCustomerToken, createCustomerFeedback);
router.get("/my", verifyCustomerToken, getMyCustomerFeedback);
router.patch("/my/:id", verifyCustomerToken, updateCustomerFeedback);
router.delete("/my/:id", verifyCustomerToken, deleteCustomerFeedback);

router.get("/stats", verifyToken, getFeedbackStats);
router.get("/", verifyToken, listFeedbackForStaff);
router.patch("/:id/reply", verifyToken, replyToFeedback);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteFeedback);

export default router;
