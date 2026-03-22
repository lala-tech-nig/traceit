import VerificationJob from '../models/VerificationJob.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';

// Helper to get start of day/week/month
const getStartOf = (period) => {
    const now = new Date();
    if (period === 'day') {
        now.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
        now.setDate(now.getDate() - now.getDay());
        now.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
    }
    return now;
};

// @desc    Set verificator area of focus
// @route   POST /api/verificator/area-of-focus
// @access  Private/Verificator
export const setAreaOfFocus = async (req, res) => {
    try {
        const { areaOfFocus } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verificatorAreaOfFocus = areaOfFocus;
        await user.save();
        res.json({ message: 'Area of focus updated', areaOfFocus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned jobs for this verificator
// @route   GET /api/verificator/jobs
// @access  Private/Verificator
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await VerificationJob.find({ verificator: req.user._id })
            .populate('targetUser', 'firstName lastName email homeAddress image isApproved hasPaid createdAt role')
            .sort({ assignedAt: -1 });

        // NOTE: phone number is intentionally excluded from the populated fields
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a job
// @route   POST /api/verificator/jobs/:id/accept
// @access  Private/Verificator
export const acceptJob = async (req, res) => {
    try {
        const job = await VerificationJob.findOne({ _id: req.params.id, verificator: req.user._id });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'pending') return res.status(400).json({ message: 'Job is not in pending state' });

        job.status = 'accepted';
        await job.save();
        res.json({ message: 'Job accepted', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit verification (user lives at address - verified)
// @route   POST /api/verificator/jobs/:id/verify
// @access  Private/Verificator
export const submitVerification = async (req, res) => {
    try {
        const { comment } = req.body;
        const job = await VerificationJob.findOne({ _id: req.params.id, verificator: req.user._id });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (!['pending', 'accepted'].includes(job.status)) {
            return res.status(400).json({ message: 'Job cannot be verified in its current state' });
        }

        job.status = 'verified';
        job.verificatorComment = comment || '';
        job.completedAt = new Date();
        await job.save();

        // Mark the target user as address-verified (isApproved) if they have paid
        const targetUser = await User.findById(job.targetUser);
        if (targetUser && targetUser.hasPaid && !targetUser.isApproved) {
            targetUser.isApproved = true;
            targetUser.ninVerified = true;
            await targetUser.save();

            // Credit referral commission to their referrer
            if (targetUser.referredBy) {
                const referral = await Referral.findOne({
                    referrer: targetUser.referredBy,
                    referred: targetUser._id,
                    status: 'pending'
                });
                if (referral) {
                    referral.status = 'credited';
                    referral.creditedAt = new Date();
                    await referral.save();
                }
            }
        }

        res.json({ message: 'Address verified successfully', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Decline the user (user does not live at stated address)
// @route   POST /api/verificator/jobs/:id/decline-user
// @access  Private/Verificator
export const declineUser = async (req, res) => {
    try {
        const { comment } = req.body;
        const job = await VerificationJob.findOne({ _id: req.params.id, verificator: req.user._id });
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.status = 'declined_user';
        job.verificatorComment = comment || '';
        job.completedAt = new Date();
        await job.save();

        res.json({ message: 'User declined', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Decline the job (verificator refuses job — reassign to next)
// @route   POST /api/verificator/jobs/:id/decline-job
// @access  Private/Verificator
export const declineJob = async (req, res) => {
    try {
        const { reason } = req.body;
        const job = await VerificationJob.findOne({ _id: req.params.id, verificator: req.user._id });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (!['pending', 'accepted'].includes(job.status)) {
            return res.status(400).json({ message: 'Job cannot be declined in its current state' });
        }

        job.status = 'declined_job';
        job.declineReason = reason || '';
        job.completedAt = new Date();
        await job.save();

        // Re-assign to another verificator (exclude current one and any who already declined this job)
        const previouslyAssigned = await VerificationJob.find({
            targetUser: job.targetUser,
            status: { $in: ['declined_job'] }
        }).distinct('verificator');

        const verificators = await User.find({
            role: 'verificator',
            _id: { $nin: [...previouslyAssigned, req.user._id] }
        });

        if (verificators.length) {
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
            await VerificationJob.create({
                verificator: jobCounts[0].verificator,
                targetUser: job.targetUser,
                status: 'pending'
            });
        }

        res.json({ message: 'Job declined and reassigned', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get verificator stats vs targets
// @route   GET /api/verificator/stats
// @access  Private/Verificator
export const getMyStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const verifiedToday = await VerificationJob.countDocuments({
            verificator: req.user._id,
            status: 'verified',
            completedAt: { $gte: getStartOf('day') }
        });
        const verifiedThisWeek = await VerificationJob.countDocuments({
            verificator: req.user._id,
            status: 'verified',
            completedAt: { $gte: getStartOf('week') }
        });
        const verifiedThisMonth = await VerificationJob.countDocuments({
            verificator: req.user._id,
            status: 'verified',
            completedAt: { $gte: getStartOf('month') }
        });
        const totalVerified = await VerificationJob.countDocuments({
            verificator: req.user._id,
            status: 'verified'
        });
        const pendingJobs = await VerificationJob.countDocuments({
            verificator: req.user._id,
            status: { $in: ['pending', 'accepted'] }
        });

        res.json({
            verifiedToday,
            verifiedThisWeek,
            verifiedThisMonth,
            totalVerified,
            pendingJobs,
            target: user.verificatorTarget
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get users this verificator personally introduced (referred)
// @route   GET /api/verificator/my-introductions
// @access  Private/Verificator
export const getMyIntroductions = async (req, res) => {
    try {
        const referrals = await Referral.find({ referrer: req.user._id })
            .populate('referred', 'firstName lastName email isApproved createdAt')
            .sort({ createdAt: -1 });
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
