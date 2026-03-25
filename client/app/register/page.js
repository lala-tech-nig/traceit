"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { UploadCloud, Users, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
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

    const isStep1Valid = () => {
        return formData.firstName.trim() !== '' && 
               formData.lastName.trim() !== '' && 
               formData.phoneNumber.trim() !== '' && 
               formData.homeAddress.trim() !== '';
    };

    const isStep2Valid = () => {
        return formData.email.trim() !== '' && formData.password.trim() !== '';
    };

    const isFormValid = () => {
        return isStep1Valid() && isStep2Valid() && image !== null;
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
        if (e) e.preventDefault();
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

    const nextStep = () => {
        if (step === 1 && isStep1Valid()) setStep(2);
        else if (step === 2 && isStep2Valid()) setStep(3);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
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
                <div className="bg-white py-10 px-4 shadow-xl border border-neutral-100 sm:rounded-[2.5rem] sm:px-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-100">
                        <div 
                            className="h-full bg-primary transition-all duration-500 ease-out" 
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="mb-8 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">Step {step} of 3</span>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary w-4' : 'bg-neutral-200'}`} />
                            ))}
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-bold text-foreground">Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-600 mb-1">First Name</label>
                                        <input name="firstName" value={formData.firstName} type="text" required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-600 mb-1">Surname</label>
                                        <input name="lastName" value={formData.lastName} type="text" required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl border border-orange-100 text-xs font-bold leading-relaxed">
                                    ⚠️ Ensure your First Name and Surname exactly match the names on your National Identity Number (NIN).
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1">Phone Number</label>
                                    <input name="phoneNumber" value={formData.phoneNumber} type="tel" required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="08012345678" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1">Home Address</label>
                                    <input name="homeAddress" value={formData.homeAddress} type="text" required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="e.g. Adeola Street, Lagos" />
                                    <p className="mt-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">A field agent may visit to verify.</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-bold text-foreground">Account Setup</h3>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1">Email Address</label>
                                    <input name="email" value={formData.email} type="email" required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="you@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1">Password</label>
                                    <div className="relative">
                                        <input name="password" value={formData.password} type={showPassword ? "text" : "password"} required onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1">Account Type</label>
                                    <select name="role" onChange={handleChange} value={formData.role} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-bold">
                                        <option value="basic">Basic User</option>
                                        <option value="technician">Technician (₦5k/mo)</option>
                                        <option value="vendor">Vendor (₦10k/mo)</option>
                                        <option value="organization">Organization</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-bold text-foreground">Identification</h3>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-3 flex items-center justify-between">
                                        Profile Photo <span className="text-primary text-[10px] font-black uppercase">* Required</span>
                                    </label>
                                    <div className="relative border-2 border-dashed border-neutral-200 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-neutral-50 hover:border-primary transition-all cursor-pointer group">
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                                        {imagePreview ? (
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-neutral-100">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-bold bg-primary px-4 py-2 rounded-full">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all mb-4">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <span className="text-sm font-bold text-neutral-500 text-center">
                                                    Click to upload profile photo <br />
                                                    <span className="text-[10px] text-neutral-400 italic">Portrait photo is best for verification</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-600 mb-1 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" /> Referral Email <span className="ml-auto text-[10px] font-bold text-neutral-400 italic">Optional</span>
                                    </label>
                                    <input name="referralEmail" value={formData.referralEmail} type="email" onChange={handleChange} className="appearance-none block w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all sm:text-sm font-medium" placeholder="Email of person who invited you" />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="flex-1 py-4 px-6 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-500 bg-white hover:bg-neutral-50 transition-all">
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    disabled={(step === 1 && !isStep1Valid()) || (step === 2 && !isStep2Valid())}
                                    className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                                >
                                    Continue
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={handleSubmit}
                                    disabled={loading || !isFormValid()}
                                    className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                                >
                                    {loading ? 'Finalizing...' : 'Create Account'}
                                    {!loading && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
                        <p className="text-sm text-neutral-500 font-bold">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline hover:text-primary-dark transition-all">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
