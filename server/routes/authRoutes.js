import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Allow image upload during registration
router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
