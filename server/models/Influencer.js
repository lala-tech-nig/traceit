import mongoose from 'mongoose';

const influencerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'Brand Ambassador'
    },
    handle: {
        type: String,
        default: '@traceit_ng'
    },
    platform: {
        type: String,
        default: 'Instagram'
    },
    socialUrl: {
        type: String,
        default: ''
    },
    quote: {
        type: String,
        default: 'TraceIt is revolutionizing gadget security and ownership verification in Nigeria!'
    },
    starRating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Influencer = mongoose.models.Influencer || mongoose.model('Influencer', influencerSchema);
export default Influencer;
