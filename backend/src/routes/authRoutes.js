import express from "express"
import { getUserProfile, loginUser, registerUser, updateUserProfile } from "../controllers/authController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', registerUser);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);


export default router