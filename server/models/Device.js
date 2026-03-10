import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    previousOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    newOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferDate: { type: Date, default: Date.now },
    comment: { type: String }
});

const deviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        color: { type: String, required: true },
        serialNumber: { type: String, required: true, unique: true },
        imei: { type: String, unique: true, sparse: true }, // Not all devices have IMEI
        status: {
            type: String,
            enum: ['clean', 'stolen', 'lost', 'damaged'],
            default: 'clean'
        },
        statusComment: { type: String },
        currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        history: [historySchema],
        deviceImage: { type: String } // Image of the device itself if needed
    },
    { timestamps: true }
);

const Device = mongoose.model('Device', deviceSchema);
export default Device;
