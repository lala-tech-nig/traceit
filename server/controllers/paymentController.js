import Payment from '../models/Payment.js';
import User from '../models/User.js';
import axios from 'axios';

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { transaction_id, tx_ref, amount, type } = req.body;

        // Verify with Flutterwave (Mockable if no key provided yet)
        let paymentSuccess = false;

        if (process.env.FLUTTERWAVE_SECRET_KEY) {
            const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
                }
            });

            const { status, amount: verifiedAmount } = response.data.data;
            if (status === 'successful' && verifiedAmount >= amount) {
                paymentSuccess = true;
            }
        } else {
            // Mock payment success for testing since no API key might be set yet
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
            reference: tx_ref
        });

        // Handle specific logic based on type
        const user = await User.findById(req.user._id);

        if (type === 'subscription' || type === 'substore_creation') {
            // Add 30 days
            const currentDate = user.subscriptionExpiresAt > Date.now() ? user.subscriptionExpiresAt : new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            user.subscriptionExpiresAt = currentDate;
            await user.save();
        }

        // For 'search' or 'transfer' by basic users, we just record the payment so client can proceed
        // The client will use the tx_ref or payment record to prove they paid for the action

        res.json({ message: 'Payment verified', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
