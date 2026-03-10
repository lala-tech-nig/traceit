"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Smartphone, ArrowLeftRight, LogOut, Store, BarChart3 } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-neutral-500">Loading...</div>;
    }

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
                            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border border-neutral-200 object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
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
                <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">T</div>
                        <span className="text-lg font-bold tracking-tight">TraceIt</span>
                    </Link>
                    <button onClick={logout} className="text-red-600 p-2">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
