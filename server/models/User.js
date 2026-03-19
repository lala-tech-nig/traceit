import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['basic', 'technician', 'vendor', 'substore', 'admin'],
            default: 'basic'
        },
        image: { type: String, default: null }, // Cloudinary URL
        nin: { type: String, default: null },
        ninVerified: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false }, // Admin approval
        hasPaid: { type: Boolean, default: false },    // Payment for verification
        verificationSubmittedAt: { type: Date, default: null },
        parentVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // For substores

        // Subscription & limits
        subscriptionEnd: { type: Date, default: null },
        transferCount: { type: Number, default: 0 } // For technician (limit 20)
    },
    { timestamps: true }
);

// Password hashing
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
