import Ad from '../models/Ad.js';

export const createAd = async (req, res) => {
    try {
        const { title, description, type, targetRoles, actionType, actionUrl, startDate, endDate } = req.body;
        
        let parsedRoles = ['all'];
        if (targetRoles) {
            try {
                parsedRoles = typeof targetRoles === 'string' ? JSON.parse(targetRoles) : targetRoles;
            } catch(e) {
                parsedRoles = [targetRoles];
            }
        }

        let mediaUrl = '';
        if (req.file) {
            mediaUrl = req.file.path;
        }

        const ad = await Ad.create({
            title, description, type, actionType, actionUrl,
            targetRoles: parsedRoles,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            mediaUrl,
            createdBy: req.user._id,
            isActive: true
        });

        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAd = async (req, res) => {
    try {
        const { title, description, type, targetRoles, actionType, actionUrl, startDate, endDate } = req.body;
        
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        if (title) ad.title = title;
        if (description) ad.description = description;
        if (type) ad.type = type;
        if (actionType) ad.actionType = actionType;
        if (actionUrl) ad.actionUrl = actionUrl;
        if (startDate) ad.startDate = new Date(startDate);
        if (endDate) ad.endDate = new Date(endDate);
        
        if (targetRoles) {
            try {
                const parsed = typeof targetRoles === 'string' ? JSON.parse(targetRoles) : targetRoles;
                ad.targetRoles = Array.isArray(parsed) ? parsed : [parsed];
            } catch(e) {
                ad.targetRoles = [targetRoles];
            }
        }

        if (req.file) {
            ad.mediaUrl = req.file.path;
        }

        await ad.save();
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleAdStatus = async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        ad.isActive = !ad.isActive;
        await ad.save();
        
        res.json({ message: `Ad is now ${ad.isActive ? 'active' : 'inactive'}`, ad });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminAds = async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveAds = async (req, res) => {
    try {
        const userRole = req.user ? req.user.role : 'basic';
        const currentDate = new Date();

        const activeAds = await Ad.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $or: [
                { targetRoles: 'all' },
                { targetRoles: userRole }
            ]
        });
        res.json(activeAds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAd = async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        await Ad.deleteOne({ _id: ad._id });
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
