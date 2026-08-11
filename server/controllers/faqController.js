import FAQ from '../models/FAQ.js';

// @desc    Get all public FAQs (supports category search)
// @route   GET /api/faqs
// @access  Public
export const getFAQs = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isPublished: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } }
            ];
        }

        const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin FAQs list (including unpublished)
// @route   GET /api/faqs/admin
// @access  Private/Admin
export const getAdminFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create FAQ (Super Admin)
// @route   POST /api/faqs
// @access  Private/Admin
export const createFAQ = async (req, res) => {
    try {
        const { question, answer, category, order, isPublished } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required.' });
        }

        const faq = await FAQ.create({
            question,
            answer,
            category: category || 'General',
            order: order !== undefined ? Number(order) : 0,
            isPublished: isPublished !== undefined ? Boolean(isPublished) : true
        });

        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FAQ (Super Admin)
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        const { question, answer, category, order, isPublished } = req.body;

        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        if (category) faq.category = category;
        if (order !== undefined) faq.order = Number(order);
        if (isPublished !== undefined) faq.isPublished = Boolean(isPublished);

        await faq.save();
        res.json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete FAQ (Super Admin)
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        await FAQ.deleteOne({ _id: faq._id });
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
