import Device from '../models/Device.js';
import User from '../models/User.js';

// @desc    Add a new device
// @route   POST /api/devices
// @access  Private
export const addDevice = async (req, res) => {
    try {
        const { name, brand, model, color, serialNumber, imei } = req.body;

        const deviceExists = await Device.findOne({
            $or: [{ serialNumber }, { imei }]
        });

        if (deviceExists) {
            return res.status(400).json({ message: 'Device with this Serial Number or IMEI already exists' });
        }

        let deviceImage = '';
        if (req.file) {
            deviceImage = req.file.path;
        }

        const device = await Device.create({
            name,
            brand,
            model,
            color,
            serialNumber,
            imei,
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
        const { status, statusComment } = req.body;
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (device.currentOwner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this device' });
        }

        device.status = status || device.status;
        device.statusComment = statusComment || device.statusComment;

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
        // Note: Payment validation should pre-flight this or be checked here.
        // Assuming middleware or client has validated payment token for 'basic' users.
        const identifier = req.params.identifier;
        const device = await Device.findOne({
            $or: [{ serialNumber: identifier }, { imei: identifier }]
        }).populate('currentOwner', 'name email image role')
            .populate('history.previousOwner', 'name email')
            .populate('history.newOwner', 'name email');

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Blurred response logic happens on client if they haven't paid, OR we can restrict here based on a query param 'paid=true'
        // To ensure security, if user is 'basic' we must check if they have a successful payment block
        // For now, we return the device if authenticated. Frontend handles blurred view before firing search (or we require a paymentRef).

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
