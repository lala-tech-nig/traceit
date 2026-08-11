import mongoose from 'mongoose';

const appContentSchema = new mongoose.Schema({
    section: {
        type: String, // 'features', 'how_it_works', 'for_who'
        required: true,
        enum: ['features', 'how_it_works', 'for_who']
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    icon: {
        type: String, // e.g. 'ShieldCheck', 'Smartphone', 'Search'
        default: 'Zap'
    },
    description: {
        type: String,
        required: true
    },
    badge: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const AppContent = mongoose.models.AppContent || mongoose.model('AppContent', appContentSchema);
export default AppContent;
