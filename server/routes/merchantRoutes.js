import express from 'express';
import { getMerchants, getMerchantById, createMerchant, updateMerchant, deleteMerchant } from '../controllers/merchantController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .get(getMerchants)
    .post(protect, admin, upload.single('logo'), createMerchant);

router.route('/:id')
    .get(getMerchantById)
    .put(protect, admin, upload.single('logo'), updateMerchant)
    .delete(protect, admin, deleteMerchant);

export default router;
