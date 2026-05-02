import express from "express";
import {
  createCustomDesignRequest,
  createGuestCustomDesignInquiry,
  getCustomDesignRequestAdmin,
  getMyCustomDesignRequest,
  listCustomDesignRequestsAdmin,
  listMyCustomDesignRequests,
  updateCustomDesignRequestAdmin,
} from "../controllers/customDesignRequestController.js";
import { verifyCustomerToken } from "../middlewares/customerAuth.js";
import { verifyToken } from "../middlewares/staffAuthMiddleware.js";
import { allowRoles } from "../middlewares/staffRoleMiddleware.js";
import { uploadCustomDesignSketch } from "../middlewares/uploadCustomDesignSketch.js";

const router = express.Router();

function uploadSketchSafe(req, res, next) {
  uploadCustomDesignSketch(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid sketch upload.",
      });
    }
    next();
  });
}

/** Storefront / Expo: guest inquiry (JSON body, no sketch). Must be registered before POST "/". */
router.post("/inquiry", createGuestCustomDesignInquiry);

router.post("/", verifyCustomerToken, uploadSketchSafe, createCustomDesignRequest);
router.get("/my", verifyCustomerToken, listMyCustomDesignRequests);
router.get("/my/:id", verifyCustomerToken, getMyCustomDesignRequest);

router.get(
  "/admin",
  verifyToken,
  allowRoles("admin", "sales", "productmanager", "viewer", "designer"),
  listCustomDesignRequestsAdmin
);
router.get(
  "/admin/:id",
  verifyToken,
  allowRoles("admin", "sales", "productmanager", "viewer", "designer"),
  getCustomDesignRequestAdmin
);
router.patch(
  "/admin/:id",
  verifyToken,
  allowRoles("admin", "sales", "productmanager", "designer"),
  updateCustomDesignRequestAdmin
);

export default router;
