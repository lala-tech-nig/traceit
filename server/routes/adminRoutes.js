import express from 'express';
const router = express.Router();
import { 
    getPendingApprovals,
    approveUser, 
    submitNIN, 
    confirmPayment,
    getAdminStats,
    getAllUsers,
    downloadBackup,
    getUserAdminDetails
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// User routes
router.post('/submit-nin', protect, submitNIN);
router.post('/confirm-payment', protect, confirmPayment);

// Admin only routes
router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/users/:id', protect, admin, getUserAdminDetails);
router.get('/pending', protect, admin, getPendingApprovals);
router.put('/approve/:id', protect, admin, approveUser);
router.get('/backup', protect, admin, downloadBackup);

export default router;
