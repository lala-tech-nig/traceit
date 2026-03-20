import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    role: { type: String, enum: ['basic', 'technician', 'vendor', 'substore', 'admin'], default: 'basic' },
    isApproved: { type: Boolean, default: false },
    ninVerified: { type: Boolean, default: false },
    hasPaid: { type: Boolean, default: false },
    image: { type: String, default: null },
    parentVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    transferCount: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
