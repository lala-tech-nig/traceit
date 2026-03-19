import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        query: { type: String, required: true },
        found: { type: Boolean, default: false },
        device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null },
    },
    { timestamps: true }
);

const SearchLog = mongoose.model('SearchLog', searchLogSchema);
export default SearchLog;
