import express from 'express';
import { getCustomerProfile, updateCustomerProfile, deleteCustomerProfile, updateCustomerTier } from '../controllers/customerController.js';
import { verifyToken } from '../controllers/customerController.js'; 

const router = express.Router();

router.get('/profile', verifyToken, getCustomerProfile);

router.put('/profile', verifyToken, updateCustomerProfile);

router.delete('/profile', verifyToken, deleteCustomerProfile);

router.put('/profile/tier', verifyToken, updateCustomerTier);

export default router;
