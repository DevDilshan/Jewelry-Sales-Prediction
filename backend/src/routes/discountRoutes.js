import express from "express";
import {
  createDiscount,
  deleteDiscount,
  listPublicActiveCoupons,
  updateDiscount,
  viewDiscount,
  validateCoupon,
} from "../controllers/discountController.js";

// Make sure these middleware paths match your actual project structure!
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";

const router = express.Router();

// Public storefront
router.get("/public/active-coupons", listPublicActiveCoupons);
router.post("/validate", validateCoupon);

// Protected routes for the Admin Dashboard
router.get("/", verifyToken, allowRoles("admin", "sales"), viewDiscount);
router.post("/create", verifyToken, allowRoles("admin", "sales"), createDiscount);
router.put("/:id", verifyToken, allowRoles("admin", "sales"), updateDiscount);
router.delete("/:id", verifyToken, allowRoles("admin", "sales"), deleteDiscount);

export default router;