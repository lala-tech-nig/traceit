import express from 'express';
import { getOverviewContent, createContentItem, updateContentItem, deleteContentItem } from '../controllers/contentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', getOverviewContent);
router.post('/overview', protect, admin, createContentItem);
router.put('/overview/:id', protect, admin, updateContentItem);
router.delete('/overview/:id', protect, admin, deleteContentItem);

export default router;
