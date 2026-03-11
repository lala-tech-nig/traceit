"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { payWithPaystack } from '@/lib/paystack';
import { LayoutDashboard, Smartphone, ArrowLeftRight, LogOut, Store, BarChart3, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, loading, logout, API_URL, checkAndLoadUser } = useAuth();
    const router = useRouter();

    const [ninLoading, setNinLoading] = useState(false);
    const [ninValue, setNinValue] = useState('');
    const [ninMessage, setNinMessage] = useState({ type: '', text: '' });
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-neutral-500">Loading...</div>;
    }

    const handlePayment = () => {
        setNinMessage({ type: '', text: '' });
        setPaymentLoading(true);
        const reference = `traceit-nin-${user._id}-${Date.now()}`;

        payWithPaystack({
            email: user.email,
            amount: 500,
            description: 'NIN Identity Verification Fee',
            reference,
            onSuccess: async ({ reference: paystackRef }) => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.post(`${API_URL}/payments/verify`, {
                        reference: paystackRef,
                        amount: 500,
                        type: 'nin_verification'
                    }, config);
                    setPaymentDone(true);
                    setNinMessage({ type: 'success', text: '₦500 payment verified! Now enter your NIN below.' });
                } catch {
                    setNinMessage({ type: 'error', text: 'Payment recorded but verification failed. Please contact support.' });
                } finally {
                    setPaymentLoading(false);
                }
            },
            onClose: () => {
                setPaymentLoading(false);
                setNinMessage({ type: 'error', text: 'Payment was cancelled. Please complete payment to proceed.' });
            }
        });
    };

    const handleVerifyNIN = async (e) => {
        e.preventDefault();
        setNinMessage({ type: '', text: '' });

        if (!paymentDone) {
            setNinMessage({ type: 'error', text: 'You must pay the ₦500 verification fee first.' });
            return;
        }

        setNinLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(`${API_URL}/nin/verify`, { ninNumber: ninValue }, config);
            setNinMessage({ type: 'success', text: res.data.message });

            // Reload user context to update ninVerified to true across the app
            await checkAndLoadUser();
        } catch (error) {
            setNinMessage({ type: 'error', text: error.response?.data?.message || 'Verification failed. Please check your NIN.' });
        } finally {
            setNinLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex font-[family-name:var(--font-geist-sans)]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-neutral-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Trace<span className="text-primary">It</span></span>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/devices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                        <Smartphone className="w-5 h-5" />
                        My Devices
                    </Link>
                    <Link href="/dashboard/transfers" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                        <ArrowLeftRight className="w-5 h-5" />
                        Transfers
                    </Link>

                    {user.role === 'vendor' && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Vendor Management</div>
                            <Link href="/dashboard/substores" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                                <Store className="w-5 h-5" />
                                Sub-Stores
                            </Link>
                            <Link href="/dashboard/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                                <BarChart3 className="w-5 h-5" />
                                Reports
                            </Link>
                        </>
                    )}

                    {user.role === 'technician' && (
                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-primary uppercase tracking-wider">Technician Pro</div>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        {user.image ? (
                            <img src={user.image} alt={user.firstName} className="w-10 h-10 rounded-full border border-neutral-200 object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {user.firstName.charAt(0)}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs font-medium text-neutral-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">T</div>
                        <span className="text-lg font-bold tracking-tight">TraceIt</span>
                    </Link>
                    <button onClick={logout} className="text-red-600 p-2">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    {(!user.ninVerified) && (
                        <div className="absolute inset-0 z-50 bg-neutral-900/50 backdrop-blur-md flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-center mt-4 mb-2">Mandatory Identity Verification</h2>
                                <p className="text-neutral-600 text-center font-medium mb-6">
                                    For security and trust on the platform, you must verify your identity before performing any tasks (adding devices, transfers, etc).
                                </p>

                                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-6">
                                    <h4 className="font-bold text-sm mb-2 text-neutral-800">Your Registered Info:</h4>
                                    <p className="text-sm"><strong>First Name:</strong> {user.firstName}</p>
                                    <p className="text-sm"><strong>Surname:</strong> {user.lastName}</p>
                                    <p className="text-xs text-orange-600 font-semibold mt-2">These names must exactly match your NIN details.</p>
                                </div>

                                {ninMessage.text && (
                                    <div className={`p-3 mb-6 rounded-xl font-medium text-sm ${ninMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {ninMessage.text}
                                    </div>
                                )}

                                <form onSubmit={handleVerifyNIN} className="space-y-4">
                                    {!paymentDone ? (
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-neutral-700 mb-4">A standard verification fee of ₦500 applies.</p>
                                            <button
                                                type="button"
                                                disabled={paymentLoading}
                                                onClick={handlePayment}
                                                className="w-full bg-foreground text-white px-6 py-4 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {paymentLoading ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                                ) : (
                                                    'Pay ₦500 Verification Fee'
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-2 justify-center text-green-600 font-bold bg-green-50 py-2 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5" /> Payment Successful
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-neutral-700 mb-1">Enter your 11-Digit NIN Number</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={ninValue}
                                                    onChange={(e) => setNinValue(e.target.value)}
                                                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="e.g. 12345678901"
                                                    minLength={11}
                                                    maxLength={11}
                                                />
                                            </div>
                                            <button
                                                disabled={ninLoading}
                                                type="submit"
                                                className="w-full bg-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-70 mt-2"
                                            >
                                                {ninLoading ? 'Verifying...' : 'Validate NIN Identity'}
                                            </button>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
