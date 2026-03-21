import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    type: { type: String }, // 'click', 'pageview'
    label: { type: String }, // button text or page path
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    pagesVisited: [{ type: String }],
    events: [eventSchema],
    timeSpentSeconds: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    sessionStart: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast active-user queries
analyticsSchema.index({ lastActive: -1 });
analyticsSchema.index({ ipAddress: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
