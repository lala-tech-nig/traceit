import Payment from '../models/Payment.js';
import User from '../models/User.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import axios from 'axios';

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { reference, amount, type } = req.body;

        // Verify with Paystack
        let paymentSuccess = false;

        if (process.env.PAYSTACK_SECRET_KEY) {
            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            });

            const { status, amount: verifiedAmount, currency } = response.data.data;
            // Paystack returns amount in kobo, so compare against amount * 100
            if (status === 'success' && verifiedAmount >= amount * 100 && currency === 'NGN') {
                paymentSuccess = true;
            }
        } else {
            // Mock payment success for testing (no key set)
            paymentSuccess = true;
        }

        if (!paymentSuccess) {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Save Payment Record
        const payment = await Payment.create({
            user: req.user._id,
            amount,
            type,
            status: 'success',
            reference
        });

        // Handle specific logic based on type
        const user = await User.findById(req.user._id);

        if (type === 'subscription' || type === 'substore_creation') {
            // Add 30 days
            const currentDate = user.subscriptionEnd > Date.now() ? user.subscriptionEnd : new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            user.subscriptionEnd = currentDate;
            await user.save();
        }

        if (type === 'nin_verification') {
            // Before unlocking, check if this user's NIN is already claimed by another account
            if (user.nin) {
                const duplicateNIN = await User.findOne({ nin: user.nin, _id: { $ne: user._id } });
                if (duplicateNIN) {
                    return res.status(400).json({ message: 'An account already exists with this NIN. Please log in to that account instead.' });
                }
            }
            user.hasPaid = true;
            await user.save();
        }

        // For 'search' or 'transfer' by basic users, we just record the payment so client can proceed
        // The client will use the tx_ref or payment record to prove they paid for the action

        res.json({ message: 'Payment verified', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complete transaction history (Payments + Withdrawals)
// @route   GET /api/payments/history
// @access  Private
export const getMyTransactions = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
        const withdrawals = await WithdrawalRequest.find({ user: req.user._id }).sort({ createdAt: -1 });

        const mappedPayments = payments.map(p => ({
            id: p._id,
            type: 'payment',
            title: `Payment: ${p.type.replace('_', ' ')}`,
            amount: p.amount,
            status: p.status, // 'pending', 'success', 'failed'
            date: p.createdAt,
            reference: p.reference
        }));

        const mappedWithdrawals = withdrawals.map(w => ({
            id: w._id,
            type: 'withdrawal',
            title: 'Earnings Withdrawal',
            amount: w.amount,
            status: w.status, // 'pending', 'approved', 'rejected'
            date: w.createdAt,
            reference: w.accountNumber
        }));

        const transactions = [...mappedPayments, ...mappedWithdrawals].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
