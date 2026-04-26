import express from 'express';
import { getPredictions } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/predict-all', getPredictions);

export default router;