import User from '../models/User.js';
import Payment from '../models/Payment.js';
import SearchLog from '../models/SearchLog.js';
import Transfer from '../models/Transfer.js';
import Device from '../models/Device.js';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const allUsers = await User.find();
        const totalUsers = allUsers.length;
        const activeAccounts = allUsers.filter(u => u.isApproved).length;
        const newAccountsToday = allUsers.filter(u => new Date(u.createdAt) >= startOfDay).length;
        const verifiedAccounts = allUsers.filter(u => u.ninVerified).length;

        // Payments
        const allPayments = await Payment.find({ status: 'success' });
        const paymentsToday = allPayments.filter(p => new Date(p.createdAt) >= startOfDay);
        const dailyRevenue = paymentsToday.reduce((acc, curr) => acc + curr.amount, 0);

        const paymentsWeek = allPayments.filter(p => new Date(p.createdAt) >= startOfWeek);
        const weeklyRevenue = paymentsWeek.reduce((acc, curr) => acc + curr.amount, 0);

        // Devices
        const allDevices = await Device.find();
        const totalDevices = allDevices.length;
        const devicesToday = allDevices.filter(d => new Date(d.createdAt) >= startOfDay).length;
        const devicesWeek = allDevices.filter(d => new Date(d.createdAt) >= startOfWeek).length;

        // Device Category Breakdown
        const categoryMap = {};
        allDevices.forEach(d => {
            const cat = d.category || 'Unknown';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const categoryBreakdown = Object.keys(categoryMap).map(cat => ({ 
            category: cat, 
            count: categoryMap[cat] 
        })).sort((a,b) => b.count - a.count);

        // Logs
        const searchArr = await SearchLog.find();
        const recentSearches = searchArr
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        const transferArr = await Transfer.find();
        const recentTransfers = transferArr
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

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

        const rawUsers = await User.find(filter);
        let users = rawUsers.map(u => {
            const userObj = { ...u };
            delete userObj.password;
            return userObj;
        });

        if (sort === '-createdAt') {
            users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
            
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
        const rawUsers = await User.find({ hasPaid: true, isApproved: false });
        const users = rawUsers.map(u => {
            const userObj = { ...u };
            delete userObj.password;
            return userObj;
        });
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

// @desc    Download System Backup (db.json and upload folder)
// @route   GET /api/admin/backup
// @access  Private/Admin
export const downloadBackup = async (req, res) => {
    try {
        const zip = new AdmZip();
        
        // Use path.resolve to get the root dir consistently since we are in controllers folder
        const rootDir = path.resolve(__dirname, '..');
        
        // Add db.json
        const dbPath = path.join(rootDir, 'db.json');
        if (fs.existsSync(dbPath)) {
            zip.addLocalFile(dbPath);
        }
        
        // Add upload folder
        const uploadDir = path.join(rootDir, 'upload');
        if (fs.existsSync(uploadDir)) {
            zip.addLocalFolder(uploadDir, 'upload');
        }
        
        const zipBuffer = await zip.toBufferPromise();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=traceit-backup-${timestamp}.zip`);
        res.send(zipBuffer);
    } catch (error) {
        console.error('Backup generation failed:', error);
        res.status(500).json({ message: 'Backup generation failed: ' + error.message });
    }
};
