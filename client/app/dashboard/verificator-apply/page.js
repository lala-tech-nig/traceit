"use client";

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ShieldAlert, FileText, CheckCircle, ChevronRight, Loader2, Info } from 'lucide-react';

export default function VerificatorApplyPage() {
    const { user, API_URL, checkAndLoadUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [areaOfFocus, setAreaOfFocus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!user || (!['basic', 'technician'].includes(user.role))) {
        return <div className="p-8 text-center font-bold text-red-500">You must be a basic or technician user to view this page.</div>;
    }

    if (!user.isApproved) {
        return <div className="p-8 text-center font-bold text-amber-500">Please verify your identity before applying.</div>;
    }

    if (user.verificatorStatus === 'pending') {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-10 bg-white border border-neutral-200 rounded-3xl text-center shadow-sm">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 animate-spin pb-1" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4">Application Under Review</h2>
                <p className="text-neutral-500 font-medium text-lg mb-8">
                    Your application to become a TraceIt Field Verificator has been submitted and is currently being reviewed by an admin. We will notify you once approved.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-8 py-3 rounded-2xl transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (user.verificatorStatus === 'approved') {
        router.push('/dashboard/verificator');
        return null;
    }

    if (user.verificatorStatus === 'suspended' || user.verificatorStatus === 'rejected') {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-10 bg-white border border-red-200 rounded-3xl text-center shadow-sm">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4">Application {user.verificatorStatus.charAt(0).toUpperCase() + user.verificatorStatus.slice(1)}</h2>
                <p className="text-neutral-500 font-medium text-lg mb-8">
                    Unfortunately, your application to become a Field Verificator has been {user.verificatorStatus}. Contact support for more information.
                </p>
            </div>
        );
    }

    const handleApply = async (e) => {
        e.preventDefault();
        if (!acceptedTerms) {
            setError('You must accept the terms and conditions.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/auth/apply-verificator`, { areaOfFocus }, config);
            setSuccess(true);
            await checkAndLoadUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-10 bg-white border border-green-200 rounded-3xl text-center shadow-sm">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4">Application Submitted!</h2>
                <p className="text-neutral-500 font-medium text-lg mb-8">
                    Your request to become a Field Agent has been sent to the super admin for review. You will be able to access the Verificator Portal once approved.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-2xl transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-primary" /> Become a Field Verificator
                </h1>
                <p className="text-neutral-500 font-medium text-lg">
                    Join our network of trusted field agents. Earn money by verifying addresses in your local area.
                </p>
            </div>

            <div className="bg-white border border-neutral-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    How it Works & Policies
                </h2>

                <div className="space-y-6 text-neutral-600 font-medium leading-relaxed">
                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-blue-800">
                        <strong className="block text-blue-900 mb-1">Earn ₦100 Per Successful Verification</strong>
                        When a new user registers in your selected area, you will be automatically assigned a Verification Job. Once you complete the verification, ₦100 is credited to your earnings immediately.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-foreground">Detailed Instructions</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span><strong>Accept Jobs Quickly:</strong> Once assigned, you have a strict 24-hour Service Level Agreement (SLA) to visit and validate the physical address.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span><strong>Verify Thoroughly:</strong> Ensure the user lives at the stated address. Talk to them and confirm their identity.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span><strong>Submit Accurately:</strong> Use the Verificator Portal to either approve or decline the address based on your honest findings.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-red-600">The "Don'ts" & Liability</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <span><strong>Do Not Falsify Data:</strong> Submitting fake verifications is a serious offense. </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <span><strong>Chain of Liability:</strong> Every account you verify is permanently attached to your profile. If a user you verified commits fraud, you are held liable as an accomplice.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <span><strong>Legal Repercussions:</strong> You can and will be jailed and prosecuted for enabling fraudulent registrations through fake verifications.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-100">
                        <form onSubmit={handleApply} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-black text-neutral-700 mb-2 uppercase tracking-wide">Your Verified Area/City of Focus</label>
                                <input
                                    required
                                    type="text"
                                    value={areaOfFocus}
                                    onChange={(e) => setAreaOfFocus(e.target.value)}
                                    placeholder="e.g. Ikeja, Lagos"
                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                />
                                <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                                    <Info className="w-4 h-4" /> This helps us assign jobs matching your local area.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="w-5 h-5 mt-1 rounded text-primary focus:ring-primary"
                                />
                                <label htmlFor="terms" className="text-sm font-bold text-amber-900 leading-snug cursor-pointer">
                                    I have read and agree to the Verificator Terms and Conditions. I understand that verifying an address makes me liable for that user's authenticity on TraceIt, and I consent to prosecution if found guilty of submitting fraudulent verifications.
                                </label>
                            </div>

                            {error && <div className="text-red-500 font-bold text-sm">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading || !acceptedTerms || !areaOfFocus}
                                className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Application'}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
