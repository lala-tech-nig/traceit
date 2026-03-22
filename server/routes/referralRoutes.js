import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getMyReferrals,
    getMyEarnings,
    requestWithdrawal,
    getPayWithEarningsInfo,
    getMyWithdrawals
} from '../controllers/referralController.js';

const router = express.Router();

router.get('/my-referrals', protect, getMyReferrals);
router.get('/my-earnings', protect, getMyEarnings);
router.get('/withdrawals', protect, getMyWithdrawals);
router.post('/request-withdrawal', protect, requestWithdrawal);
router.post('/pay-with-earnings-info', protect, getPayWithEarningsInfo);

export default router;
