import Transfer from '../models/Transfer.js';
import Device from '../models/Device.js';
import User from '../models/User.js';

// @desc    Initiate a device transfer
// @route   POST /api/transfers/initiate
// @access  Private
export const initiateTransfer = async (req, res) => {
    try {
        if (!req.user.isApproved) {
            return res.status(403).json({ message: 'Account not approved. Please complete identity verification to initiate transfers.' });
        }
        const { deviceId, targetUserEmail, comment } = req.body;

        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (device.currentOwner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to transfer this device. You are not the current owner.' });
        }

        // Check if there is an active pending transfer for this device
        const pendingTransfer = await Transfer.findOne({ device: deviceId, status: 'pending' });
        if (pendingTransfer) {
            return res.status(400).json({ message: 'A transfer is already pending for this device' });
        }

        const targetUser = await User.findOne({ email: targetUserEmail });

        const transfer = await Transfer.create({
            device: deviceId,
            initiator: req.user._id,
            targetUserEmail,
            targetUser: targetUser ? targetUser._id : undefined,
            comment
        });

        res.status(201).json(transfer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a device transfer
// @route   PUT /api/transfers/:id/accept
// @access  Private
export const acceptTransfer = async (req, res) => {
    try {
        if (!req.user.isApproved) {
            return res.status(403).json({ message: 'Account not approved. Please complete identity verification to accept transfers.' });
        }
        const transfer = await Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer request not found' });
        }

        if (transfer.status !== 'pending') {
            return res.status(400).json({ message: 'Transfer is no longer pending' });
        }

        // If the targetUser was not registered initially, we try matching by email
        const isTargetUserByEmail = transfer.targetUserEmail === req.user.email;
        const isTargetUserById = transfer.targetUser && transfer.targetUser.toString() === req.user._id.toString();

        if (!isTargetUserByEmail && !isTargetUserById) {
            return res.status(401).json({ message: 'Not authorized to accept this transfer' });
        }

        transfer.status = 'accepted';
        transfer.targetUser = req.user._id;

        // Update Device
        const device = await Device.findById(transfer.device);

        // Add to history
        device.history.push({
            previousOwner: transfer.initiator,
            newOwner: req.user._id,
            transferDate: Date.now(),
            comment: transfer.comment
        });

        device.currentOwner = req.user._id;
        // Reset status to clean on transfer if desired, or keep it. Let's keep it.

        await transfer.save();
        await device.save();

        res.json({ message: 'Transfer accepted successfully', transfer, device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a device transfer
// @route   PUT /api/transfers/:id/reject
// @access  Private
export const rejectTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer request not found' });
        }

        if (transfer.status !== 'pending') {
            return res.status(400).json({ message: 'Transfer is no longer pending' });
        }

        const isTargetUserByEmail = transfer.targetUserEmail === req.user.email;
        const isTargetUserById = transfer.targetUser && transfer.targetUser.toString() === req.user._id.toString();

        if (!isTargetUserByEmail && !isTargetUserById) {
            return res.status(401).json({ message: 'Not authorized to reject this transfer' });
        }

        transfer.status = 'rejected';
        await transfer.save();

        res.json({ message: 'Transfer rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's incoming transfers
// @route   GET /api/transfers/incoming
// @access  Private
export const getIncomingTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.find({
            $or: [
                { targetUser: req.user._id, status: 'pending' },
                { targetUserEmail: req.user.email, status: 'pending' }
            ]
        })
        .populate('device', 'name serialNumber')
        .populate('initiator', 'firstName lastName email')
        .lean();
        
        const mappedTransfers = transfers.map(t => {
            if (t.initiator) {
                t.initiator.name = `${t.initiator.firstName} ${t.initiator.lastName}`;
            }
            return t;
        });
        
        res.json(mappedTransfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's outgoing transfers
// @route   GET /api/transfers/outgoing
// @access  Private
export const getOutgoingTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.find({ initiator: req.user._id, status: 'pending' })
            .populate('device', 'name serialNumber')
            .lean();
        
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a pending transfer
// @route   DELETE /api/transfers/:id/cancel
// @access  Private
export const cancelTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
        if (transfer.initiator.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized to cancel this transfer' });
        if (transfer.status !== 'pending') return res.status(400).json({ message: 'Can only cancel pending transfers' });
        
        transfer.status = 'cancelled';
        await transfer.save();
        res.json({ message: 'Transfer cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
