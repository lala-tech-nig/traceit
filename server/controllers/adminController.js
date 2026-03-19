import User from '../models/User.js';
import Payment from '../models/Payment.js';
import SearchLog from '../models/SearchLog.js';
import Transfer from '../models/Transfer.js';
import Device from '../models/Device.js';

// @desc    Get Admin Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Accounts
        const totalUsers = await User.countDocuments();
        const activeAccounts = await User.countDocuments({ isApproved: true });
        const newAccountsToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });
        const verifiedAccounts = await User.countDocuments({ ninVerified: true });

        // Payments
        const paymentsToday = await Payment.find({ createdAt: { $gte: startOfDay }, status: 'success' });
        const dailyRevenue = paymentsToday.reduce((acc, curr) => acc + curr.amount, 0);

        const paymentsWeek = await Payment.find({ createdAt: { $gte: startOfWeek }, status: 'success' });
        const weeklyRevenue = paymentsWeek.reduce((acc, curr) => acc + curr.amount, 0);

        // Devices
        const totalDevices = await Device.countDocuments();
        const devicesToday = await Device.countDocuments({ createdAt: { $gte: startOfDay } });
        const devicesWeek = await Device.countDocuments({ createdAt: { $gte: startOfWeek } });

        // Device Category Breakdown
        const categoryBreakdown = await Device.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Logs
        const recentSearches = await SearchLog.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentTransfers = await Transfer.find()
            .populate('initiator', 'firstName lastName email')
            .populate('device', 'name serialNumber')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            stats: {
                totalUsers,
                activeAccounts,
                newAccountsToday,
                verifiedAccounts,
                dailyRevenue,
                weeklyRevenue,
                totalDevices,
                devicesToday,
                devicesWeek,
                categoryBreakdown
            },
            recentSearches,
            recentTransfers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const { sort = '-createdAt', role, isApproved } = req.query;
        
        const filter = {};
        if (role) filter.role = role;
        if (isApproved) filter.isApproved = isApproved === 'true';

        const users = await User.find(filter)
            .select('-password')
            .sort(sort);
            
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users pending approval
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingApprovals = async (req, res) => {
    try {
        const users = await User.find({ hasPaid: true, isApproved: false }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a user
// @route   PUT /api/admin/approve/:id
// @access  Private/Admin
export const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isApproved = true;
            user.ninVerified = true; // Since NIN was verified manually by admin
            await user.save();
            res.json({ message: 'User approved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit NIN for verification (User action)
// @route   POST /api/admin/submit-nin
// @access  Private
export const submitNIN = async (req, res) => {
    try {
        const { nin } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.nin = nin;
            user.verificationSubmittedAt = new Date();
            // In a real app, this would trigger payment or payment would trigger this.
            // Following user request: Enter NIN -> Submit -> Redirect to Payment
            await user.save();
            res.json({ message: 'NIN submitted. Please proceed to payment.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment status
// @route   POST /api/admin/confirm-payment
// @access  Private
export const confirmPayment = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.hasPaid = true;
            await user.save();
            res.json({ message: 'Payment confirmed. Awaiting admin approval.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
