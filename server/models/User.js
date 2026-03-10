import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['basic', 'technician', 'vendor', 'substore'],
            default: 'basic'
        },
        image: { type: String }, // cloudinary url

        // Vendor specific
        mainVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If role is substore
        substores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // If role is vendor

        // Subscription & limits
        subscriptionExpiresAt: { type: Date },
        transferCount: { type: Number, default: 0 } // For technician (limit 20)
    },
    { timestamps: true }
);

// Password hashing
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
