import express from 'express';
import { getInfluencers, createInfluencer, updateInfluencer, deleteInfluencer } from '../controllers/influencerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .get(getInfluencers)
    .post(protect, admin, upload.single('photo'), createInfluencer);

router.route('/:id')
    .put(protect, admin, upload.single('photo'), updateInfluencer)
    .delete(protect, admin, deleteInfluencer);

export default router;
