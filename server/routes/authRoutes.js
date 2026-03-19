import express from 'express';
import { registerUser, loginUser, getUserProfile, verifyUserEmail } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/verify-user', protect, verifyUserEmail);

export default router;
