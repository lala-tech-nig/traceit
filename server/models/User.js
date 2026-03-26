import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    homeAddress: { type: String, default: '' },
    role: { type: String, enum: ['basic', 'technician', 'vendor', 'substore', 'admin', 'verificator'], default: 'basic' },
    isApproved: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
    nin: { type: String, default: '' },
    ninVerified: { type: Boolean, default: false },
    hasPaid: { type: Boolean, default: false },
    image: { type: String, default: null },
    parentVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    transferCount: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },
    // Verificator fields
    isVerificator: { type: Boolean, default: false },
    verificatorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'suspended'], default: 'none' },
    verificatorAreaOfFocus: { type: String, default: '' },
    verificatorTarget: {
        daily: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        dailyPay: { type: Number, default: 0 },
        weeklyPay: { type: Number, default: 0 },
        monthlyPay: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
