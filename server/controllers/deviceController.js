import Device from '../models/Device.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import SearchLog from '../models/SearchLog.js';

// @desc    Add a new device
// @route   POST /api/devices
// @access  Private
export const addDevice = async (req, res) => {
    try {
        if (!req.user.isApproved) {
            return res.status(403).json({ message: 'Account not approved. Please complete identity verification to add devices.' });
        }

        let { name, brand, model, color, serialNumber, imei, category, specs } = req.body;

        // Ensure imei is a string if it comes as an array
        if (Array.isArray(imei)) {
            imei = imei.find(i => i !== '') || '';
        }

        const deviceExists = await Device.findOne({
            $or: [{ serialNumber }, { imei: imei || 'none-provided' }]
        });

        if (deviceExists && (serialNumber || imei)) {
            // Only block if it's a real conflict (IMEI is optional)
            if (deviceExists.serialNumber === serialNumber || (imei && deviceExists.imei === imei)) {
                return res.status(400).json({ message: 'Device with this Serial Number or IMEI already exists' });
            }
        }

        let deviceImage = '';
        if (req.file) {
            deviceImage = req.file.path;
        }

        // Parse specs if it comes as a string (from FormData)
        let parsedSpecs = specs;
        if (typeof specs === 'string') {
            try {
                parsedSpecs = JSON.parse(specs);
            } catch (e) {
                parsedSpecs = {};
            }
        }

        const device = await Device.create({
            name,
            brand,
            model,
            color,
            serialNumber,
            imei,
            category,
            specs: parsedSpecs,
            currentOwner: req.user._id,
            deviceImage
        });

        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's devices
// @route   GET /api/devices/mydevices
// @access  Private
export const getMyDevices = async (req, res) => {
    try {
        const devices = await Device.find({ currentOwner: req.user._id });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update device status (e.g. clean to stolen)
// @route   PUT /api/devices/:id/status
// @access  Private
export const updateDeviceStatus = async (req, res) => {
    try {
        if (!req.user.isApproved) {
            return res.status(403).json({ message: 'Account not approved. Please complete identity verification to manage devices.' });
        }
        const { status, statusComment } = req.body;
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (device.currentOwner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this device' });
        }

        if (status) device.status = status;
        if (statusComment !== undefined) device.statusComment = statusComment;

        const updatedDevice = await device.save();
        res.json(updatedDevice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search device by Serial Number or IMEI
// @route   GET /api/devices/search/:identifier
// @access  Private
export const searchDevice = async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const { paymentRef } = req.query;

        // Security & Payment Check
        let isAuthorized = false;

        if (req.user.role === 'admin') {
            isAuthorized = true;
        } else if (req.user.role === 'basic') {
            if (paymentRef) {
                const payment = await Payment.findOne({
                    reference: paymentRef,
                    user: req.user._id,
                    type: 'search',
                    status: 'success'
                });
                if (payment) isAuthorized = true;
            }
        } else {
            // technician, vendor, substore
            if (req.user.subscriptionEnd && new Date(req.user.subscriptionEnd) > new Date()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(402).json({ 
                message: req.user.role === 'basic' 
                    ? 'Payment required for this search' 
                    : 'Active subscription required. Please renew your plan.',
                requiresPayment: true 
            });
        }

        const device = await Device.findOne({
            $or: [{ serialNumber: identifier }, { imei: identifier }]
        }).populate('currentOwner', 'firstName lastName email image role')
            .populate('history.previousOwner', 'firstName lastName email')
            .populate('history.newOwner', 'firstName lastName email');

        if (!device) {
            await SearchLog.create({
                user: req.user._id,
                query: identifier,
                found: false
            });
            return res.status(404).json({ message: 'Device not found' });
        }

        // Blurred response logic happens on client if they haven't paid, OR we can restrict here based on a query param 'paid=true'
        // To ensure security, if user is 'basic' we must check if they have a successful payment block
        // For now, we return the device if authenticated. Frontend handles blurred view before firing search (or we require a paymentRef).

        await SearchLog.create({
            user: req.user._id,
            query: identifier,
            found: true,
            device: device._id
        });

        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Public Search device (unauthenticated) - returns bare minimum to know it exists
// @route   GET /api/devices/public-search/:identifier
// @access  Public
export const publicSearchDevice = async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const device = await Device.findOne({
            $or: [{ serialNumber: identifier }, { imei: identifier }]
        });

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Return dummy required auth error format
        res.status(401).json({ message: 'Authentication required to view device details' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
