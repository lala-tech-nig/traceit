import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
    {
        device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
        initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        targetUserEmail: { type: String, required: true }, // Before the target accepts, we just know their email
        targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Populated once accepted/found
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'cancelled'],
            default: 'pending'
        },
        comment: { type: String, required: true }
    },
    { timestamps: true }
);

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;
