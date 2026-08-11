import AppContent from '../models/AppContent.js';

// @desc    Get dynamic features, how-it-works, and for-who content
// @route   GET /api/content/overview
// @access  Public
export const getOverviewContent = async (req, res) => {
    try {
        const features = await AppContent.find({ section: 'features' }).sort({ order: 1 });
        const howItWorks = await AppContent.find({ section: 'how_it_works' }).sort({ order: 1 });
        const forWho = await AppContent.find({ section: 'for_who' }).sort({ order: 1 });

        res.json({
            features,
            howItWorks,
            forWho
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create overview item (Super Admin)
// @route   POST /api/content/overview
// @access  Private/Admin
export const createContentItem = async (req, res) => {
    try {
        const { section, title, subtitle, icon, description, badge, order } = req.body;

        if (!section || !title || !description) {
            return res.status(400).json({ message: 'Section, title, and description are required.' });
        }

        const item = await AppContent.create({
            section,
            title,
            subtitle: subtitle || '',
            icon: icon || 'Zap',
            description,
            badge: badge || '',
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update overview item (Super Admin)
// @route   PUT /api/content/overview/:id
// @access  Private/Admin
export const updateContentItem = async (req, res) => {
    try {
        const item = await AppContent.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Content item not found' });
        }

        const { title, subtitle, icon, description, badge, order } = req.body;

        if (title) item.title = title;
        if (subtitle !== undefined) item.subtitle = subtitle;
        if (icon) item.icon = icon;
        if (description) item.description = description;
        if (badge !== undefined) item.badge = badge;
        if (order !== undefined) item.order = Number(order);

        await item.save();
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete overview item (Super Admin)
// @route   DELETE /api/content/overview/:id
// @access  Private/Admin
export const deleteContentItem = async (req, res) => {
    try {
        const item = await AppContent.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Content item not found' });
        }

        await AppContent.deleteOne({ _id: item._id });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
