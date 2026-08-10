import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserEmail: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'cancelled'], default: 'pending' }
}, {
    timestamps: true
});

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;
