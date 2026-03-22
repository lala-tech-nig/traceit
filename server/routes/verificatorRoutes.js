import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    setAreaOfFocus,
    getMyJobs,
    acceptJob,
    submitVerification,
    declineUser,
    declineJob,
    getMyStats,
    getMyIntroductions
} from '../controllers/verificatorController.js';

const verificator = (req, res, next) => {
    if (req.user && (req.user.role === 'verificator' || req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as a verificator' });
};

const router = express.Router();

router.post('/area-of-focus', protect, verificator, setAreaOfFocus);
router.get('/jobs', protect, verificator, getMyJobs);
router.post('/jobs/:id/accept', protect, verificator, acceptJob);
router.post('/jobs/:id/verify', protect, verificator, submitVerification);
router.post('/jobs/:id/decline-user', protect, verificator, declineUser);
router.post('/jobs/:id/decline-job', protect, verificator, declineJob);
router.get('/stats', protect, verificator, getMyStats);
router.get('/my-introductions', protect, verificator, getMyIntroductions);

export default router;
