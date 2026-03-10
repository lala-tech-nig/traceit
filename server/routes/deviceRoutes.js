import express from 'express';
import { addDevice, getMyDevices, updateDeviceStatus, searchDevice, publicSearchDevice } from '../controllers/deviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('deviceImage'), addDevice);

router.get('/mydevices', protect, getMyDevices);
router.put('/:id/status', protect, updateDeviceStatus);
router.get('/search/:identifier', protect, searchDevice);
router.get('/public-search/:identifier', publicSearchDevice);

export default router;
