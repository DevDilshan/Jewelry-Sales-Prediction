import express from 'express';
import {
  deleteCustomer,
  forgotCustomerPassword,
  loginCustomer,
  registerCustomer,
  resetCustomerPasswordWithToken,
  updateCustomer,
} from "../controllers/customerController.js";

const router = express.Router();


router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/forgot-password", forgotCustomerPassword);
router.post("/reset-password", resetCustomerPasswordWithToken);
router.put('/:id', updateCustomer);  
router.delete('/:id', deleteCustomer);  

export default router;
