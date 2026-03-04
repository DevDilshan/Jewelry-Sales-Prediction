import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;