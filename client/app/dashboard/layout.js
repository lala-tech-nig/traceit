"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { payWithPaystack } from '@/lib/paystack';
import { LayoutDashboard, Smartphone, ArrowLeftRight, LogOut, Store, BarChart3, ShieldAlert, CheckCircle2, Loader2, CreditCard, History } from 'lucide-react';

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
                    <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors font-medium">
                        <History className="w-5 h-5" />
                        Device History
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
                            <Link href="/dashboard/subscription" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold">
                                <CreditCard className="w-5 h-5" />
                                Subscription
                            </Link>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-primary uppercase tracking-wider">Super Admin</div>
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold">
                                <ShieldAlert className="w-5 h-5" />
                                Admin Panel
                            </Link>
                        </>
                    )}

                    {user.role === 'technician' && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-primary uppercase tracking-wider">Technician Pro</div>
                            <Link href="/dashboard/subscription" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold">
                                <CreditCard className="w-5 h-5" />
                                Subscription
                            </Link>
                        </>
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
                    {children}
                </div>
            </main>
        </div>
    );
}
