import mongoose from 'mongoose';

const verificationJobSchema = new mongoose.Schema({
    verificator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'verified', 'declined_user', 'declined_job'],
        default: 'pending'
    },
    verificatorComment: { type: String, default: '' },
    declineReason: { type: String, default: '' },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

const VerificationJob = mongoose.model('VerificationJob', verificationJobSchema);
export default VerificationJob;
