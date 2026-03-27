import User from '../models/User.js';
import Payment from '../models/Payment.js';
import SearchLog from '../models/SearchLog.js';
import Transfer from '../models/Transfer.js';
import Device from '../models/Device.js';
import Referral from '../models/Referral.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import VerificationJob from '../models/VerificationJob.js';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';
import axios from 'axios';

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
        const { sort = '-createdAt', role, isApproved, isVerified } = req.query;
        
        const filter = {};
        if (role) filter.role = role;
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
        if (isVerified !== undefined) filter.ninVerified = isVerified === 'true';

        const rawUsers = await User.find(filter).lean();
        const allPayments = await Payment.find({ status: 'success' }).lean();

        const paymentMap = {};
        allPayments.forEach(p => {
            const uid = p.user.toString();
            paymentMap[uid] = (paymentMap[uid] || 0) + p.amount;
        });

        let users = rawUsers.map(u => {
            const userObj = { ...u };
            delete userObj.password;
            userObj.amountPaid = paymentMap[userObj._id.toString()] || 0;
            return userObj;
        });

        if (sort === '-createdAt') {
            users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'createdAt') {
            users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === '-amountPaid') {
            users.sort((a, b) => b.amountPaid - a.amountPaid);
        } else if (sort === 'amountPaid') {
            users.sort((a, b) => a.amountPaid - b.amountPaid);
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
            user.ninVerified = true;
            await user.save();

            // Credit referral commission to whoever referred this user
            if (user.referredBy) {
                const referral = await Referral.findOne({
                    referrer: user.referredBy,
                    referred: user._id,
                    status: 'pending'
                });
                if (referral) {
                    referral.status = 'credited';
                    referral.creditedAt = new Date();
                    await referral.save();
                }
            }

            res.json({ message: 'User approved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getWithdrawalRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const withdrawals = await WithdrawalRequest.find(filter)
            .populate('user', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process a withdrawal request (approve/reject)
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
export const processWithdrawalRequest = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }
        const withdrawal = await WithdrawalRequest.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });

        withdrawal.status = status;
        withdrawal.adminNote = adminNote || '';
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        res.json({ message: `Withdrawal ${status}`, withdrawal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set verificator targets
// @route   PUT /api/admin/verificator-targets/:id
// @access  Private/Admin
export const setVerificatorTargets = async (req, res) => {
    try {
        const { daily, weekly, monthly, dailyPay, weeklyPay, monthlyPay } = req.body;
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'verificator') {
            return res.status(404).json({ message: 'Verificator not found' });
        }
        user.verificatorTarget = { daily, weekly, monthly, dailyPay, weeklyPay, monthlyPay };
        await user.save();
        res.json({ message: 'Targets updated', target: user.verificatorTarget });
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

// @desc    Download System Backup (MongoDB + Cloudinary, selective)
// @route   GET /api/admin/backup?type=mongodb|cloudinary|both
// @access  Private/Admin
export const downloadBackup = async (req, res) => {
    try {
        const backupType = req.query.type || 'both'; // 'mongodb', 'cloudinary', or 'both'
        const zip = new AdmZip();
        const now = new Date();

        // Build human-readable timestamp: 2026-03-27_00-47-52
        const pad = n => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

        const manifest = { generatedAt: now.toISOString(), type: backupType };

        // ── 1. MongoDB dump ────────────────────────────────────────────────────
        if (backupType === 'mongodb' || backupType === 'both') {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                const docs = await db.collection(col.name).find({}).toArray();
                zip.addFile(`database/${col.name}.json`, Buffer.from(JSON.stringify(docs, null, 2), 'utf8'));
            }
            manifest.collections = collections.map(c => c.name);
        }

        // ── 2. Cloudinary images (traceit_uploads ONLY) ────────────────────────
        if (backupType === 'cloudinary' || backupType === 'both') {
            let nextCursor = undefined;
            let imageIndex = 0;
            do {
                const result = await cloudinary.api.resources({
                    resource_type: 'image',
                    type: 'upload',
                    prefix: 'traceit_uploads',   // Only TraceIt project images
                    max_results: 100,
                    ...(nextCursor ? { next_cursor: nextCursor } : {})
                });
                nextCursor = result.next_cursor || undefined;

                for (const resource of result.resources) {
                    for (let attempt = 1; attempt <= 2; attempt++) {
                        try {
                            const imgRes = await axios.get(resource.secure_url, { responseType: 'arraybuffer', timeout: 45000 });
                            const ext = resource.format || 'jpg';
                            const safeName = resource.public_id.replace(/[/\\:*?"<>|]/g, '_');
                            zip.addFile(`images/${safeName}.${ext}`, Buffer.from(imgRes.data));
                            imageIndex++;
                            break;
                        } catch (imgErr) {
                            if (attempt === 2) {
                                console.warn(`Skipped (${resource.public_id}): ${imgErr.message}`);
                            }
                        }
                    }
                }
            } while (nextCursor);
            manifest.imageCount = imageIndex;
        }

        // ── 3. Manifest ────────────────────────────────────────────────────────
        zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

        const zipBuffer = await zip.toBufferPromise();
        const filename = `traceit-${backupType}-backup-${timestamp}.zip`;

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(zipBuffer);
    } catch (error) {
        console.error('Backup generation failed:', error);
        res.status(500).json({ message: 'Backup generation failed: ' + error.message });
    }
};

// @desc    Get user admin deep details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserAdminDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const payments = await Payment.find({ user: user._id }).sort({ createdAt: -1 }).lean();
        
        const totalPaid = payments
            .filter(p => p.status === 'success')
            .reduce((acc, curr) => acc + curr.amount, 0);

        let subscriptionDaysRemaining = 0;
        if (user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
            const diffTime = Math.abs(new Date(user.subscriptionEnd) - new Date());
            subscriptionDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }

        res.json({
            user,
            payments,
            totalPaid,
            subscriptionDaysRemaining
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend or unsuspend a user
// @route   POST /api/admin/users/:id/suspend
// @access  Private/Admin
export const toggleUserSuspension = async (req, res) => {
    try {
        const { isSuspended, suspensionReason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Admin accounts cannot be suspended via this interface' });
        }

        user.isSuspended = isSuspended;
        user.suspensionReason = suspensionReason || '';
        await user.save();

        res.json({ message: `User account ${isSuspended ? 'restricted' : 'restored'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users by email, name, or phone
// @route   GET /api/admin/users/search
// @access  Private/Admin
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchRegex = new RegExp(query, 'i');

        const users = await User.find({
            $or: [
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex },
                { phoneNumber: searchRegex }
            ]
        }).select('-password').sort({ createdAt: -1 }).limit(20);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all verificator applications and active verificators
// @route   GET /api/admin/verificators
// @access  Private/Admin
export const getVerificators = async (req, res) => {
    try {
        const verificators = await User.find({ verificatorStatus: { $ne: 'none' } })
            .select('-password').sort({ updatedAt: -1 });
        res.json(verificators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manage Verificator Status
// @route   PUT /api/admin/verificators/:id/status
// @access  Private/Admin
export const manageVerificator = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'suspended', 'rejected', 'none'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.verificatorStatus = status;
        user.isVerificator = status === 'approved';
        await user.save();
        
        res.json({ message: `Verificator status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all verification jobs for admin
// @route   GET /api/admin/verificators/jobs
// @access  Private/Admin
export const getAdminVerifications = async (req, res) => {
    try {
        const jobs = await VerificationJob.find({})
            .populate('verificator', 'firstName lastName email phoneNumber')
            .populate('targetUser', 'firstName lastName email homeAddress phoneNumber')
            .sort({ assignedAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
