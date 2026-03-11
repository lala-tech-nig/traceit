import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        type: {
            type: String,
            enum: ['search', 'subscription', 'substore_creation', 'transfer', 'nin_verification'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending'
        },
        reference: { type: String, required: true, unique: true } // Flutterwave tx_ref
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
