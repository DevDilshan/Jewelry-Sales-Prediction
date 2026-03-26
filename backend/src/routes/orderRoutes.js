import express from "express";
import {
  deleteOrder,
  getAllOrdersAdmin,
  getMyOrders,
  getOrderStatsAdmin,
  getSingleOrder,
  placeOrder,
  updateOrderAdmin,
} from "../controllers/orderController.js";
import { verifyCustomerToken } from "../middlewares/customerAuth.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";

const router = express.Router();

router.get("/admin/stats", verifyToken, allowRoles("admin", "sales"), getOrderStatsAdmin);
router.get("/admin/all", verifyToken, allowRoles("admin", "sales"), getAllOrdersAdmin);
router.patch("/admin/:id", verifyToken, allowRoles("admin", "sales"), updateOrderAdmin);

router.post("/", verifyCustomerToken, placeOrder);
router.get("/my", verifyCustomerToken, getMyOrders);
router.get("/:id", verifyCustomerToken, getSingleOrder);
router.delete("/:id", verifyCustomerToken, deleteOrder);

export default router;
