import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logoUrl: {
        type: String,
        required: true
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    starRating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    location: {
        type: String,
        default: 'Computer Village, Ikeja, Lagos'
    },
    category: {
        type: String,
        default: 'Gadget & Electronics Dealer'
    },
    verifiedStatus: {
        type: String,
        default: 'Verified Merchant'
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', merchantSchema);
export default Merchant;
