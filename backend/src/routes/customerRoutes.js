import express from 'express';
import { deleteCustomer, loginCustomer, registerCustomer, updateCustomer } from '../controllers/customerController.js';  

const router = express.Router();


router.post('/register', registerCustomer);  
router.post('/login', loginCustomer);  
router.put('/:id', updateCustomer);  
router.delete('/:id', deleteCustomer);  

export default router;
