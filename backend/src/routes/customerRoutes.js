import express from 'express';
import { getCustomerProfile, updateCustomerProfile, deleteCustomerProfile, updateCustomerTier, verifyToken } from '../controllers/customerController.js';  // Correct import

const router = express.Router();


router.get('/profile', verifyToken, getCustomerProfile);  
router.put('/profile', verifyToken, updateCustomerProfile);  
router.delete('/profile', verifyToken, deleteCustomerProfile);  
router.put('/profile/tier', verifyToken, updateCustomerTier);  

export default router;
