import Referral from '../models/Referral.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import User from '../models/User.js';

// @desc    Get my referrals (users I referred)
// @route   GET /api/referrals/my-referrals
// @access  Private
export const getMyReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ referrer: req.user._id })
            .populate('referred', 'firstName lastName email isApproved ninVerified hasPaid createdAt')
            .sort({ createdAt: -1 });

        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my earnings summary
// @route   GET /api/referrals/my-earnings
// @access  Private
export const getMyEarnings = async (req, res) => {
    try {
        // Credited referral commissions
        const creditedReferrals = await Referral.find({
            referrer: req.user._id,
            status: 'credited'
        });
        const referralEarnings = creditedReferrals.reduce((acc, r) => acc + r.commissionAmount, 0);

        // Pending commissions (not yet credited)
        const pendingReferrals = await Referral.find({
            referrer: req.user._id,
            status: 'pending'
        });
        const pendingEarnings = pendingReferrals.reduce((acc, r) => acc + r.commissionAmount, 0);

        // Reward points value (each point = ₦10)
        const user = await User.findById(req.user._id);
        const rewardPointsValue = (user.rewardPoints || 0) * 10;

        // Approved withdrawals (already paid out)
        const withdrawals = await WithdrawalRequest.find({
            user: req.user._id,
            status: 'approved'
        });
        const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);

        const availableBalance = referralEarnings + rewardPointsValue - totalWithdrawn;

        res.json({
            referralEarnings,
            pendingEarnings,
            rewardPoints: user.rewardPoints || 0,
            rewardPointsValue,
            totalWithdrawn,
            availableBalance: Math.max(0, availableBalance),
            totalCreditedReferrals: creditedReferrals.length,
            totalPendingReferrals: pendingReferrals.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a withdrawal
// @route   POST /api/referrals/request-withdrawal
// @access  Private
export const requestWithdrawal = async (req, res) => {
    try {
        const { amount, bankName, accountNumber, accountName } = req.body;

        const user = await User.findById(req.user._id);

        // Validate account name matches user profile (case-insensitive)
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase().trim();
        const enteredName = (accountName || '').toLowerCase().trim();

        if (enteredName !== fullName) {
            return res.status(400).json({
                message: `Account name must match your profile name: "${user.firstName} ${user.lastName}". Please enter your exact name.`
            });
        }

        // Check available balance
        const creditedReferrals = await Referral.find({ referrer: req.user._id, status: 'credited' });
        const referralEarnings = creditedReferrals.reduce((acc, r) => acc + r.commissionAmount, 0);
        const rewardPointsValue = (user.rewardPoints || 0) * 10;

        const approvedWithdrawals = await WithdrawalRequest.find({ user: req.user._id, status: 'approved' });
        const totalWithdrawn = approvedWithdrawals.reduce((acc, w) => acc + w.amount, 0);

        const availableBalance = referralEarnings + rewardPointsValue - totalWithdrawn;

        if (amount > availableBalance) {
            return res.status(400).json({
                message: `Insufficient balance. Available: ₦${availableBalance.toFixed(2)}`
            });
        }

        // Check no pending withdrawal exists
        const existingPending = await WithdrawalRequest.findOne({ user: req.user._id, status: 'pending' });
        if (existingPending) {
            return res.status(400).json({ message: 'You already have a pending withdrawal request.' });
        }

        const withdrawal = await WithdrawalRequest.create({
            user: req.user._id,
            amount,
            bankName,
            accountNumber,
            accountName,
            status: 'pending'
        });

        res.status(201).json({ message: 'Withdrawal request submitted successfully.', withdrawal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pay for a service using earnings
// @route   POST /api/referrals/pay-with-earnings
// @access  Private
export const getPayWithEarningsInfo = async (req, res) => {
    try {
        const { requiredAmount } = req.body;
        const user = await User.findById(req.user._id);

        const creditedReferrals = await Referral.find({ referrer: req.user._id, status: 'credited' });
        const referralEarnings = creditedReferrals.reduce((acc, r) => acc + r.commissionAmount, 0);
        const rewardPointsValue = (user.rewardPoints || 0) * 10;

        const approvedWithdrawals = await WithdrawalRequest.find({ user: req.user._id, status: 'approved' });
        const totalWithdrawn = approvedWithdrawals.reduce((acc, w) => acc + w.amount, 0);

        const availableBalance = Math.max(0, referralEarnings + rewardPointsValue - totalWithdrawn);

        if (availableBalance >= requiredAmount) {
            // Full coverage from earnings
            res.json({ canPay: true, balanceSufficient: true, availableBalance, amountFromEarnings: requiredAmount, amountFromPaystack: 0 });
        } else {
            // Partial coverage
            const amountFromPaystack = requiredAmount - availableBalance;
            res.json({ canPay: true, balanceSufficient: false, availableBalance, amountFromEarnings: availableBalance, amountFromPaystack });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my withdrawal history
// @route   GET /api/referrals/withdrawals
// @access  Private
export const getMyWithdrawals = async (req, res) => {
    try {
        const withdrawals = await WithdrawalRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
