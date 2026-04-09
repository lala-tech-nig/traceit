import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Referral from '../models/Referral.js';
import VerificationJob from '../models/VerificationJob.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

// Helper: assign a new verification job to the least-loaded available verificator
const assignVerificationJob = async (newUserId) => {
    try {
        // Find all verificators
        const verificators = await User.find({ role: 'verificator' });
        if (!verificators.length) return;

        // Find the one with fewest pending jobs
        const jobCounts = await Promise.all(
            verificators.map(async (v) => {
                const count = await VerificationJob.countDocuments({
                    verificator: v._id,
                    status: { $in: ['pending', 'accepted'] }
                });
                return { verificator: v._id, count };
            })
        );

        jobCounts.sort((a, b) => a.count - b.count);
        const assignedVerificatorId = jobCounts[0].verificator;

        await VerificationJob.create({
            verificator: assignedVerificatorId,
            targetUser: newUserId,
            status: 'pending'
        });
    } catch (err) {
        console.error('Failed to assign verification job:', err.message);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, homeAddress, email: rawEmail, password, role, mainVendorId, referralEmail } = req.body;
        const email = rawEmail?.toLowerCase();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'An account with this email address already exists. Please log in instead.' });
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

        // Referral lookup
        let referredBy = null;
        if (referralEmail && referralEmail.trim()) {
            const referrer = await User.findOne({ email: referralEmail.trim().toLowerCase() });
            if (referrer) {
                referredBy = referrer._id;
            }
        }

        const user = await User.create({
            firstName,
            lastName,
            phoneNumber,
            homeAddress: homeAddress || '',
            email,
            password,
            role: role || 'basic',
            image: imageUrl,
            parentVendor,
            referredBy
        });

        // Create a pending referral record if someone referred this user
        if (referredBy) {
            await Referral.create({
                referrer: referredBy,
                referred: user._id,
                commissionAmount: 100,
                status: 'pending'
            });
        }

        // Auto-assign a physical verification job to a verificator
        await assignVerificationJob(user._id);

        // Send welcome email asynchronously (non-blocking)
        if (user.welcomeEmailSentAt === null || user.welcomeEmailSentAt === undefined) {
            sendWelcomeEmail(user).then(async () => {
                user.welcomeEmailSentAt = new Date();
                await user.save();
            }).catch(err => console.error('[EMAIL] Welcome email failed:', err.message));
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                homeAddress: user.homeAddress,
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
        const lowerEmail = email?.toLowerCase();

        const user = await User.findOne({ email: lowerEmail });

        if (user && (await user.matchPassword(password))) {
            if (user.isSuspended) {
                return res.status(403).json({
                    message: 'Your account has been restricted, reach out to the support whatsapp line.',
                    isSuspended: true,
                    email: user.email
                });
            }

            // Stamp last login time for re-engagement scheduler
            user.lastLoginAt = new Date();
            await user.save();

            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                homeAddress: user.homeAddress,
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
                homeAddress: user.homeAddress,
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

// @desc    Verify user by email
// @route   GET /api/auth/verify-user
// @access  Private
export const verifyUserEmail = async (req, res) => {
    try {
        const { email } = req.query;
        const lowerEmail = email?.toLowerCase();
        const user = await User.findOne({ email: lowerEmail });
        if (user) {
            res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email });
        } else {
            res.status(404).json({ message: 'Account with this email does not exist on the platform' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply to be a verificator
// @route   POST /api/auth/apply-verificator
// @access  Private (Basic/Technician only)
export const applyVerificator = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!['basic', 'technician'].includes(user.role)) {
            return res.status(403).json({ message: 'Only Basic and Technician users can apply to be a Verificator' });
        }

        if (!user.isApproved) {
            return res.status(400).json({ message: 'You must be a verified user to apply' });
        }

        if (user.verificatorStatus !== 'none' && user.verificatorStatus !== 'rejected') {
            return res.status(400).json({ message: `Application is already ${user.verificatorStatus}` });
        }

        user.verificatorStatus = 'pending';
        if (req.body.areaOfFocus) {
            user.verificatorAreaOfFocus = req.body.areaOfFocus;
        }
        await user.save();

        res.json({ message: 'Application submitted successfully', verificatorStatus: user.verificatorStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
