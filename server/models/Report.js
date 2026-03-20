import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true },
    sellerDescription: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
