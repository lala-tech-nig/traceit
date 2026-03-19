"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { payWithPaystack } from '@/lib/paystack';
import { CreditCard, Calendar, ShieldCheck, Flame, Zap, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function SubscriptionPage() {
    const { user, API_URL, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isSubscribed = user?.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
    const expiryDate = user?.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : 'No active subscription';

    const handleRenew = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        const reference = `sub-${user?._id}-${Date.now()}`;
        
        try {
            await payWithPaystack({
                email: user.email,
                amount: 5000, // Assuming 5000 for pro plan
                description: 'TraceIt Pro Monthly Subscription',
                reference,
                onSuccess: async ({ reference: paystackRef }) => {
                    try {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        await axios.post(`${API_URL}/payments/verify`, {
                            reference: paystackRef,
                            amount: 5000,
                            type: 'subscription'
                        }, config);
                        
                        // Refresh user local state
                        const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
                        login({ ...user, ...profileRes.data });
                        
                        setMessage({ type: 'success', text: 'Subscription renewed successfully!' });
                    } catch (err) {
                        setMessage({ type: 'error', text: 'Payment recorded but verification failed. Please contact support.' });
                    } finally {
                        setLoading(false);
                    }
                },
                onClose: () => {
                    setLoading(false);
                }
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Could not initiate payment. Please check your connection.' });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-foreground tracking-tight">Your Subscription</h1>
                <p className="text-neutral-500 font-medium text-lg">Manage your professional access and platform features.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Status Card */}
                <div className="bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSubscribed ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground">Current Plan</h2>
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">{user?.role} PRO</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-neutral-400" />
                                <span className="font-bold text-neutral-600">Expires On</span>
                            </div>
                            <span className={`font-black ${isSubscribed ? 'text-foreground' : 'text-red-500'}`}>{expiryDate}</span>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Plan Highlights</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    Unlimited Global Searches
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    Detailed History Tracking
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    Priority Status Management
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Renewal Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col text-white relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full -ml-24 -mb-24 blur-3xl group-hover:bg-primary/40 transition-all duration-700"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                                <Flame className="w-7 h-7" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Monthly Billing</p>
                                <p className="text-3xl font-black text-white">₦5,000</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black mb-4">Extend Your Access</h2>
                        <p className="text-neutral-400 font-medium text-sm mb-8">Keep your professional tools active. Renewing now adds 30 days to your current cycle.</p>

                        <button 
                            disabled={loading}
                            onClick={handleRenew}
                            className="mt-auto w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-current" /> Renew with Paystack</>}
                        </button>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-6 rounded-3xl border-2 animate-in slide-in-from-bottom-4 flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}
        </div>
    );
}
