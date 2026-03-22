import mongoose from 'mongoose';

const referralSpendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String, // 'subscription', 'search', 'nin_verification'
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ReferralSpend = mongoose.model('ReferralSpend', referralSpendSchema);
export default ReferralSpend;
