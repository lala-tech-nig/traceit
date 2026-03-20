import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    query: { type: String, required: true },
    found: { type: Boolean, default: false },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    ipAddress: { type: String }
}, {
    timestamps: true
});

const SearchLog = mongoose.model('SearchLog', searchLogSchema);
export default SearchLog;
