import express from 'express';
import { verifyNIN } from '../controllers/ninController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', protect, verifyNIN);

export default router;
