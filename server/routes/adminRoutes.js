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
    getUserAdminDetails,
    getWithdrawalRequests,
    processWithdrawalRequest,
    setVerificatorTargets,
    toggleUserSuspension,
    searchUsers,
    getVerificators,
    manageVerificator,
    getAdminVerifications
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

// Withdrawal management
router.get('/withdrawals', protect, admin, getWithdrawalRequests);
router.put('/withdrawals/:id', protect, admin, processWithdrawalRequest);

// Verificator targets
router.put('/verificator-targets/:id', protect, admin, setVerificatorTargets);
router.post('/users/:id/suspend', protect, admin, toggleUserSuspension);
router.get('/users/search', protect, admin, searchUsers);

// Verificator Management
router.get('/verificators', protect, admin, getVerificators);
router.put('/verificators/:id/status', protect, admin, manageVerificator);
router.get('/verificators/jobs', protect, admin, getAdminVerifications);


export default router;

