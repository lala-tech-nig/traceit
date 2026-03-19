"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { payWithPaystack } from '@/lib/paystack';
import { LayoutDashboard, Smartphone, ArrowLeftRight, LogOut, Store, BarChart3, ShieldAlert, CheckCircle2, Loader2, CreditCard, History } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, loading, logout, API_URL, checkAndLoadUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

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

                <div className="flex-1 py-10 px-6 space-y-4 overflow-y-auto">
                    {[
                        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                        { name: 'My Devices', href: '/dashboard/devices', icon: Smartphone },
                        { name: 'Transfers', href: '/dashboard/transfers', icon: ArrowLeftRight },
                        { name: 'Device History', href: '/dashboard/history', icon: History },
                    ].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-base ${
                                    isActive ? 'text-white' : 'text-neutral-500 hover:text-primary hover:bg-neutral-50'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                    />
                                )}
                                <item.icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary'}`} />
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        );
                    })}

                    {user.role === 'vendor' && (
                        <>
                            <div className="pt-8 pb-3 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest opacity-60">Vendor Control</div>
                            {[
                                { name: 'Sub-Stores', href: '/dashboard/substores', icon: Store },
                                { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
                                { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard, color: 'primary' },
                            ].map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href} 
                                        className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-base ${
                                            isActive ? 'text-white' : 'text-neutral-500 hover:text-primary hover:bg-neutral-50'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary'}`} />
                                        <span className="relative z-10">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <div className="pt-8 pb-3 px-6 text-xs font-black text-primary uppercase tracking-widest opacity-60">Super Admin</div>
                            <Link href="/admin" className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-base ${
                                pathname === '/admin' ? 'text-white' : 'text-primary bg-primary/5 hover:bg-primary/10'
                            }`}>
                                {pathname === '/admin' && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <ShieldAlert className={`w-6 h-6 relative z-10 ${pathname === '/admin' ? 'text-white' : 'text-primary'}`} />
                                <span className="relative z-10">Admin Panel</span>
                            </Link>
                        </>
                    )}

                    {user.role === 'technician' && (
                        <>
                            <div className="pt-8 pb-3 px-6 text-xs font-black text-primary uppercase tracking-widest opacity-60">Technician Pro</div>
                            <Link href="/dashboard/subscription" className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-base ${
                                pathname === '/dashboard/subscription' ? 'text-white' : 'text-primary bg-primary/5 hover:bg-primary/10'
                            }`}>
                                {pathname === '/dashboard/subscription' && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <CreditCard className={`w-6 h-6 relative z-10 ${pathname === '/dashboard/subscription' ? 'text-white' : 'text-primary'}`} />
                                <span className="relative z-10">Subscription</span>
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

                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative pb-28 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Liquid Flow Effect) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-[100] px-2 pt-2 pb-[max(env(safe-area-inset-bottom),_0.75rem)] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                <div className="flex justify-between items-center max-w-sm mx-auto relative h-16 w-full">
                    {[
                        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
                        { name: 'Devices', href: '/dashboard/devices', icon: Smartphone },
                        { name: 'Transfers', href: '/dashboard/transfers', icon: ArrowLeftRight },
                        { name: 'History', href: '/dashboard/history', icon: History }
                    ].map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link href={tab.href} key={tab.href} className="relative flex flex-col items-center justify-center flex-1 h-full z-10 select-none -webkit-tap-highlight-transparent group">
                                {/* Liquid Bubble Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="liquid-bubble"
                                        className="absolute -top-8 w-16 h-16 bg-primary rounded-full shadow-[0_8px_30px_rgba(244,63,94,0.4)] border-4 border-white dark:border-neutral-900"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 18,
                                            mass: 0.8
                                        }}
                                    />
                                )}
                                
                                {/* Icon */}
                                <tab.icon 
                                    className={`w-7 h-7 relative z-20 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                                        isActive ? 'text-white -translate-y-7 scale-125 drop-shadow-lg' : 'text-neutral-400 translate-y-2 group-active:scale-90'
                                    }`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                
                                {/* Text */}
                                <span 
                                    className={`text-[13px] font-black absolute bottom-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) w-full text-center ${
                                        isActive ? 'text-primary opacity-100 translate-y-0 scale-110' : 'text-neutral-400 opacity-0 translate-y-4'
                                    }`}
                                >
                                    {tab.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
