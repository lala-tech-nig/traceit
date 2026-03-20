import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['text_slider', 'popup_modal', 'dashboard_banner'], required: true },
    mediaUrl: { type: String },
    targetRoles: [{ type: String }],
    actionType: { type: String, enum: ['website', 'whatsapp'], required: true },
    actionUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const Ad = mongoose.model('Ad', adSchema);
export default Ad;
