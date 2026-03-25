"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { UploadCloud, Users, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        homeAddress: '',
        email: '',
        password: '',
        role: 'basic',
        referralEmail: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const isFormValid = () => {
        return (
            formData.firstName.trim() !== '' &&
            formData.lastName.trim() !== '' &&
            formData.phoneNumber.trim() !== '' &&
            formData.homeAddress.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            image !== null
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('homeAddress', formData.homeAddress);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', formData.role);
        if (formData.referralEmail.trim()) {
            data.append('referralEmail', formData.referralEmail.trim());
        }
        if (image) {
            data.append('image', image);
        }

        const result = await register(data);
        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="TraceIt Logo" className="w-10 h-10 object-contain" />
                    <span className="text-3xl font-bold tracking-tight text-foreground">Trace<span className="text-primary">It</span></span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-foreground">
                    Create an account
                </h2>
                <p className="text-neutral-500 mt-2 text-sm font-medium">Join the secure gadget registry network</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow-xl border border-neutral-100 sm:rounded-2xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700">First Name</label>
                                <div className="mt-1">
                                    <input name="firstName" type="text" required onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium" placeholder="John" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700">Last Name (Surname)</label>
                                <div className="mt-1">
                                    <input name="lastName" type="text" required onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium" placeholder="Doe" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 text-orange-700 p-3 rounded-xl border border-orange-100 text-xs font-semibold">
                            ⚠️ Ensure your First Name and Surname exactly match the names on your National Identity Number (NIN). You will be required to verify your NIN after registration.
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Phone Number</label>
                            <div className="mt-1">
                                <input name="phoneNumber" type="tel" required onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium" placeholder="08012345678" />
                            </div>
                        </div>

                        {/* Home Address */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Home Address</label>
                            <div className="mt-1">
                                <input
                                    name="homeAddress"
                                    type="text"
                                    required
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="No. 5, Adeola Street, Ikeja, Lagos"
                                />
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">Your physical residential address — a field agent may visit to verify.</p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Email address</label>
                            <div className="mt-1">
                                <input name="email" type="email" required onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium" placeholder="you@example.com" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Password</label>
                            <div className="mt-1 relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Account Type */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Account Type</label>
                            <div className="mt-1">
                                <select name="role" onChange={handleChange} value={formData.role} className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium bg-white">
                                    <option value="basic">Basic User</option>
                                    <option value="technician">Technician (₦5k/mo)</option>
                                    <option value="vendor">Vendor (₦10k/mo)</option>
                                    <option value="organization">Organization</option>
                                </select>
                            </div>
                        </div>

                        {/* Referral Email */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-primary" />
                                Referral Email <span className="text-neutral-400 font-normal">(Optional)</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    name="referralEmail"
                                    type="email"
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="Email of person who invited you (optional)"
                                />
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">If someone referred you to TraceIt, enter their registered email. They earn ₦100 when you get verified.</p>
                        </div>

                        {/* Profile Image */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Profile Image <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="relative border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-neutral-50 hover:border-primary transition-all cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
                                        <span className="text-sm font-medium text-neutral-500 text-center">
                                            Click or drag to upload a profile photo <br />
                                            <span className="text-[10px] text-neutral-400 italic">(Compulsory for identification)</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-600 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
