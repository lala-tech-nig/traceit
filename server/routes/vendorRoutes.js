import express from 'express';
import { getDashboardStats, getSubstores } from '../controllers/vendorController.js';
import { protect, vendorOrTechOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, vendorOrTechOnly, getDashboardStats);
router.get('/substores', protect, getSubstores);

export default router;
