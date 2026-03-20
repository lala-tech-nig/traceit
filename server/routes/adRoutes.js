import express from 'express';
import { createAd, updateAd, toggleAdStatus, getAdminAds, getActiveAds, deleteAd } from '../controllers/adController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .post(protect, admin, upload.single('mediaUrl'), createAd)
    .get(protect, admin, getAdminAds);

router.route('/:id')
    .put(protect, admin, upload.single('mediaUrl'), updateAd)
    .patch(protect, admin, toggleAdStatus)
    .delete(protect, admin, deleteAd);

router.get('/public/active', protect, getActiveAds);

export default router;
