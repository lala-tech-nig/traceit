import Merchant from '../models/Merchant.js';

// @desc    Get all public registered merchants (with search & filters)
// @route   GET /api/merchants
// @access  Public
export const getMerchants = async (req, res) => {
    try {
        const { search, category, rating } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (rating) {
            query.starRating = { $gte: Number(rating) };
        }

        const merchants = await Merchant.find(query).sort({ createdAt: -1 });
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single merchant by ID
// @route   GET /api/merchants/:id
// @access  Public
export const getMerchantById = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }
        res.json(merchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a merchant (Super Admin)
// @route   POST /api/merchants
// @access  Private/Admin
export const createMerchant = async (req, res) => {
    try {
        const { name, dateJoined, starRating, location, category, phone, email, website, description } = req.body;

        let logoUrl = '';
        if (req.file) {
            logoUrl = req.file.path || req.file.secure_url;
        } else if (req.body.logoUrl) {
            logoUrl = req.body.logoUrl;
        }

        if (!name || !logoUrl) {
            return res.status(400).json({ message: 'Merchant name and logo image are required.' });
        }

        const merchant = await Merchant.create({
            name,
            logoUrl,
            dateJoined: dateJoined ? new Date(dateJoined) : new Date(),
            starRating: starRating ? Number(starRating) : 5,
            location: location || 'Computer Village, Ikeja, Lagos',
            category: category || 'Gadget & Electronics Dealer',
            phone: phone || '',
            email: email || '',
            website: website || '',
            description: description || ''
        });

        res.status(201).json(merchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update merchant details (Super Admin)
// @route   PUT /api/merchants/:id
// @access  Private/Admin
export const updateMerchant = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        const { name, dateJoined, starRating, location, category, phone, email, website, description, logoUrl } = req.body;

        if (name) merchant.name = name;
        if (dateJoined) merchant.dateJoined = new Date(dateJoined);
        if (starRating) merchant.starRating = Number(starRating);
        if (location) merchant.location = location;
        if (category) merchant.category = category;
        if (phone !== undefined) merchant.phone = phone;
        if (email !== undefined) merchant.email = email;
        if (website !== undefined) merchant.website = website;
        if (description !== undefined) merchant.description = description;

        if (req.file) {
            merchant.logoUrl = req.file.path || req.file.secure_url;
        } else if (logoUrl) {
            merchant.logoUrl = logoUrl;
        }

        await merchant.save();
        res.json(merchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete merchant (Super Admin)
// @route   DELETE /api/merchants/:id
// @access  Private/Admin
export const deleteMerchant = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        await Merchant.deleteOne({ _id: merchant._id });
        res.json({ message: 'Merchant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
