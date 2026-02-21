import express from "express"
import { createDiscount,viewDiscount} from "../controllers/discountController.js"

const router = express.Router();

router.post('/creatediscount', createDiscount);
router.get('/', viewDiscount);

export default router;