import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    order: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
export default FAQ;
