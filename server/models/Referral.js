import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commissionAmount: { type: Number, default: 100 },
    status: { type: String, enum: ['pending', 'credited'], default: 'pending' },
    creditedAt: { type: Date }
}, { timestamps: true });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
