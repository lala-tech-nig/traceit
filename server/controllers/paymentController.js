import Payment from '../models/Payment.js';
import User from '../models/User.js';
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
