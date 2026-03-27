import express from "express";
import {
  createDiscount,
  deleteDiscount,
  updateDiscount,
  viewDiscount,
  validateCoupon,
} from "../controllers/discountController.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";

const router = express.Router();

router.post("/validate", validateCoupon);
router.get("/", verifyToken, allowRoles("admin", "sales"), viewDiscount);
router.post("/create", verifyToken, allowRoles("admin", "sales"), createDiscount);
router.put("/:id", verifyToken, allowRoles("admin", "sales"), updateDiscount);
router.delete("/:id", verifyToken, allowRoles("admin", "sales"), deleteDiscount);

export default router;
