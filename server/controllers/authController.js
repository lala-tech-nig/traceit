import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password, role, mainVendorId } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/upload/${req.file.filename}`;
        }

        // Role specific logic
        let parentVendor = null;
        if (role === 'substore') {
            if (!mainVendorId) return res.status(400).json({ message: 'Main vendor must be specified for sub-stores' });
            parentVendor = mainVendorId;
        }

        const user = await User.create({
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            role: role || 'basic',
            image: imageUrl,
            parentVendor
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role,
                image: user.image,
                ninVerified: user.ninVerified,
                isApproved: user.isApproved,
                hasPaid: user.hasPaid,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role,
                image: user.image,
                nin: user.nin,
                ninVerified: user.ninVerified,
                isApproved: user.isApproved,
                hasPaid: user.hasPaid,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role,
                image: user.image,
                nin: user.nin,
                ninVerified: user.ninVerified,
                isApproved: user.isApproved,
                hasPaid: user.hasPaid
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
