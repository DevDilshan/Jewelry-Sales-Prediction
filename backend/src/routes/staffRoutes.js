import express from "express";
import {
  changeOwnPassword,
  deleteStaff,
  forgotStaffPassword,
  getStaffMe,
  listStaff,
  loginStaff,
  registerStaff,
  resetStaffPasswordWithToken,
  setupFirstStaff,
  updateStaff,
} from "../controllers/staffController.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js"

const router = express.Router();

router.post("/setup-first", setupFirstStaff);
router.post("/login", loginStaff);
router.post("/forgot-password", forgotStaffPassword);
router.post("/reset-password", resetStaffPasswordWithToken);

router.get("/me", verifyToken, getStaffMe);
router.post("/me/password", verifyToken, changeOwnPassword);

router.post("/register", verifyToken, allowRoles("admin"), registerStaff);
router.get("/", verifyToken, allowRoles("admin"), listStaff);
router.put("/:id", verifyToken, allowRoles("admin"), updateStaff);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteStaff);

export default router;
