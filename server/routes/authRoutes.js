import express from 'express';
import { registerUser, loginUser, getUserProfile, verifyUserEmail, applyVerificator, sendRegistrationOTP } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/send-otp', sendRegistrationOTP);
router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/verify-user', protect, verifyUserEmail);
router.post('/apply-verificator', protect, applyVerificator);

export default router;
