import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    serialNumber: { type: String, required: true },
    imei: { type: String },
    category: { type: String, required: true },
    specs: { type: Object, default: {} },
    currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceImage: { type: String },
    history: [{
        previousOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        newOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        transferDate: { type: Date, default: Date.now },
        comment: { type: String }
    }],
    statusUpdates: [{
        status: { type: String },
        comment: { type: String },
        date: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['clean', 'stolen', 'lost'], default: 'clean' },
    statusComment: { type: String, default: '' }
}, {
    timestamps: true
});

const Device = mongoose.model('Device', deviceSchema);
export default Device;
