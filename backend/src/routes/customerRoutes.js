import express from 'express';
import {
  changeCustomerPassword,
  deleteCustomer,
  forgotCustomerPassword,
  getCustomerMe,
  loginCustomer,
  registerCustomer,
  resetCustomerPasswordWithToken,
  updateCustomer,
  updateCustomerMe,
} from "../controllers/customerController.js";
import { verifyCustomerToken } from "../middlewares/customerAuth.js";

const router = express.Router();

router.get('/me', verifyCustomerToken, getCustomerMe);
router.patch('/me', verifyCustomerToken, updateCustomerMe);
router.post('/me/password', verifyCustomerToken, changeCustomerPassword);

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/forgot-password", forgotCustomerPassword);
router.post("/reset-password", resetCustomerPasswordWithToken);
router.put('/:id', updateCustomer);  
router.delete('/:id', deleteCustomer);  

export default router;
