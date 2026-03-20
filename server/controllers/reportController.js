import Report from '../models/Report.js';
import User from '../models/User.js';
import Device from '../models/Device.js';

export const createReport = async (req, res) => {
    try {
        const { deviceId, address, sellerDescription } = req.body;
        
        const device = await Device.findById(deviceId);
        if (!device) return res.status(404).json({ message: 'Device not found' });

        const report = await Report.create({
            device: deviceId,
            reporter: req.user._id,
            address,
            sellerDescription
        });

        // Award 10 points to reporter
        const user = await User.findById(req.user._id);
        user.rewardPoints = (user.rewardPoints || 0) + 10;
        await user.save();

        res.status(201).json({ message: 'Report submitted successfully. You earned 10 reward points!', report, rewardPoints: user.rewardPoints });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReports = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const reports = await Report.find()
                .populate('device')
                .populate('reporter', 'firstName lastName email phoneNumber')
                .sort('-createdAt');
            return res.json(reports);
        } else {
            // Devices current user owns
            const myDevices = await Device.find({ currentOwner: req.user._id }).select('_id');
            const deviceIds = myDevices.map(d => d._id);
            const reports = await Report.find({ device: { $in: deviceIds } })
                .populate('device')
                .populate('reporter', 'firstName lastName email phoneNumber')
                .sort('-createdAt');
            return res.json(reports);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
