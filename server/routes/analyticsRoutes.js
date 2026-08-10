import express from 'express';
import { trackSession, getAnalyticsData } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public tracker — no auth required (called by the tracker component)
router.post('/track', trackSession);

// Admin-only reporting endpoint
router.get('/admin', protect, admin, getAnalyticsData);

export default router;
