import Influencer from '../models/Influencer.js';

// @desc    Get all public influencers & brand supporters
// @route   GET /api/influencers
// @access  Public
export const getInfluencers = async (req, res) => {
    try {
        const influencers = await Influencer.find().sort({ createdAt: -1 });
        res.json(influencers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create influencer (Super Admin)
// @route   POST /api/influencers
// @access  Private/Admin
export const createInfluencer = async (req, res) => {
    try {
        const { name, role, handle, platform, socialUrl, quote, starRating, dateJoined, featured } = req.body;

        let photoUrl = '';
        if (req.file) {
            photoUrl = req.file.path || req.file.secure_url;
        } else if (req.body.photoUrl) {
            photoUrl = req.body.photoUrl;
        }

        if (!name || !photoUrl) {
            return res.status(400).json({ message: 'Influencer name and photo are required.' });
        }

        const influencer = await Influencer.create({
            name,
            photoUrl,
            role: role || 'Brand Ambassador',
            handle: handle || '@traceit_ng',
            platform: platform || 'Instagram',
            socialUrl: socialUrl || '',
            quote: quote || 'TraceIt is revolutionizing gadget security and ownership verification in Nigeria!',
            starRating: starRating ? Number(starRating) : 5,
            dateJoined: dateJoined ? new Date(dateJoined) : new Date(),
            featured: featured !== undefined ? Boolean(featured) : true
        });

        res.status(201).json(influencer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update influencer (Super Admin)
// @route   PUT /api/influencers/:id
// @access  Private/Admin
export const updateInfluencer = async (req, res) => {
    try {
        const influencer = await Influencer.findById(req.params.id);
        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        const { name, role, handle, platform, socialUrl, quote, starRating, dateJoined, featured, photoUrl } = req.body;

        if (name) influencer.name = name;
        if (role) influencer.role = role;
        if (handle) influencer.handle = handle;
        if (platform) influencer.platform = platform;
        if (socialUrl !== undefined) influencer.socialUrl = socialUrl;
        if (quote) influencer.quote = quote;
        if (starRating) influencer.starRating = Number(starRating);
        if (dateJoined) influencer.dateJoined = new Date(dateJoined);
        if (featured !== undefined) influencer.featured = Boolean(featured);

        if (req.file) {
            influencer.photoUrl = req.file.path || req.file.secure_url;
        } else if (photoUrl) {
            influencer.photoUrl = photoUrl;
        }

        await influencer.save();
        res.json(influencer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete influencer (Super Admin)
// @route   DELETE /api/influencers/:id
// @access  Private/Admin
export const deleteInfluencer = async (req, res) => {
    try {
        const influencer = await Influencer.findById(req.params.id);
        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        await Influencer.deleteOne({ _id: influencer._id });
        res.json({ message: 'Influencer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
