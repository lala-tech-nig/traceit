import User from '../models/User.js';
import Device from '../models/Device.js';
import Transfer from '../models/Transfer.js';

// @desc    Get dashboard statistics
// @route   GET /api/vendor/stats
// @access  Private (Vendor/Technician/Substore)
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        let queryObj = { currentOwner: userId };

        // If vendor, maybe they want to see stats across their substores?
        // For now, let's keep it simple: their own devices
        const deviceCount = await Device.countDocuments(queryObj);

        // Transfers made or received
        const transfersInitiated = await Transfer.countDocuments({ initiator: userId });
        const transfersReceived = await Transfer.countDocuments({ targetUser: userId });

        res.json({
            deviceCount,
            transfersInitiated,
            transfersReceived
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all substores for a vendor
// @route   GET /api/vendor/substores
// @access  Private (Vendor only)
export const getSubstores = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ message: 'Only vendors can access substores' });
        }

        const rawSubstores = await User.find({ mainVendorId: req.user._id, role: 'substore' });
        const substores = rawSubstores.map(u => {
            const userObj = { ...u };
            delete userObj.password;
            return userObj;
        });
        res.json(substores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
