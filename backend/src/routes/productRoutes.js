import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";

const router = express.Router();

router.get("/", getProduct);
router.get("/:id", getProductById);
router.post("/create", verifyToken, allowRoles("admin", "productmanager"), createProduct);
router.put("/:id", verifyToken, allowRoles("admin", "productmanager"), updateProduct);
router.delete("/:id", verifyToken, allowRoles("admin", "productmanager"), deleteProduct);

export default router;
