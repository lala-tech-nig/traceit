import express from 'express';
import { verifyPayment, getMyTransactions } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getMyTransactions);

export default router;
