import express from "express";
import {
  addAdminPortfolioImage,
  addMyPortfolioImage,
  createDesignerPortfolioAdmin,
  createMyDesignerPortfolio,
  deleteAdminPortfolioImage,
  deleteMyPortfolioImage,
  deleteMyDesignerPortfolio,
  getDesignerPortfolioAdmin,
  getMyDesignerPortfolio,
  getPublishedPortfolioById,
  listPublishedPortfolios,
  listDesignerPortfoliosAdmin,
  patchDesignerPortfolioAdmin,
  patchMyDesignerPortfolio,
} from "../controllers/designerPortfolioController.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";
import { uploadDesignerPortfolioImage } from "../middlewares/uploadDesignerPortfolioImage.js";

const router = express.Router();

function uploadImageSafe(req, res, next) {
  uploadDesignerPortfolioImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid image upload.",
      });
    }
    next();
  });
}

router.get("/public", listPublishedPortfolios);
router.get("/public/:id", getPublishedPortfolioById);

router.get("/me", verifyToken, allowRoles("designer"), getMyDesignerPortfolio);
router.post("/me", verifyToken, allowRoles("designer"), createMyDesignerPortfolio);
router.patch("/me", verifyToken, allowRoles("designer"), patchMyDesignerPortfolio);
router.post("/me/images", verifyToken, allowRoles("designer"), uploadImageSafe, addMyPortfolioImage);
router.delete("/me/images/:imageId", verifyToken, allowRoles("designer"), deleteMyPortfolioImage);
router.delete("/me", verifyToken, allowRoles("designer"), deleteMyDesignerPortfolio);

router.post(
  "/admin",
  verifyToken,
  allowRoles("admin", "productmanager"),
  createDesignerPortfolioAdmin
);
router.get(
  "/admin",
  verifyToken,
  allowRoles("admin", "productmanager", "sales", "viewer"),
  listDesignerPortfoliosAdmin
);
router.get(
  "/admin/:id",
  verifyToken,
  allowRoles("admin", "productmanager", "sales", "viewer"),
  getDesignerPortfolioAdmin
);
router.post(
  "/admin/:id/images",
  verifyToken,
  allowRoles("admin", "productmanager"),
  uploadImageSafe,
  addAdminPortfolioImage
);
router.delete(
  "/admin/:id/images/:imageId",
  verifyToken,
  allowRoles("admin", "productmanager"),
  deleteAdminPortfolioImage
);
router.patch(
  "/admin/:id",
  verifyToken,
  allowRoles("admin", "productmanager"),
  patchDesignerPortfolioAdmin
);

export default router;
