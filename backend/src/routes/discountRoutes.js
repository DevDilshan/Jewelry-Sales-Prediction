import express from "express";
import{
    createDiscount,
    getAllDiscounts,
    updateDiscount,
    deleteDiscount
} from "../controllers/discountController.js";

const router = express.Router();

router.post("/create",createDiscount);
router.get("/",getAllDiscounts);
router.put("/:id",updateDiscount);
router.delete("/:id",deleteDiscount);

export default router;