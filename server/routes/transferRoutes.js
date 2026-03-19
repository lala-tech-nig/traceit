import express from 'express';
import { initiateTransfer, acceptTransfer, getIncomingTransfers, getOutgoingTransfers, cancelTransfer } from '../controllers/transferController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiateTransfer);
router.put('/:id/accept', protect, acceptTransfer);
router.get('/incoming', protect, getIncomingTransfers);
router.get('/outgoing', protect, getOutgoingTransfers);
router.delete('/:id/cancel', protect, cancelTransfer);

export default router;
