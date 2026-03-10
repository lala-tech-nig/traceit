"use client";

import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, Devices, ArrowLeftRight, Clock } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();

    // Mock data for comprehensive reporting
    const stats = [
        { title: 'Total Revenue Generated', value: '₦45,500', trend: '+12%', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Devices Registered', value: '1,240', trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Completed Transfers', value: '382', trend: '+18%', color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Active Sub-Stores', value: '4', trend: '0%', color: 'text-orange-600', bg: 'bg-orange-50' }
    ];

    if (user?.role !== 'vendor') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <BarChart3 className="w-16 h-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                <p className="text-neutral-500 font-medium mt-2">Only Vendors can access the reports dashboard.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2">Comprehensive Reports</h1>
                <p className="text-neutral-500 font-medium">Analytics and performance tracking for your vendor network.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-neutral-100 p-6 rounded-3xl shadow-sm">
                        <p className="text-sm font-semibold text-neutral-500 mb-2">{stat.title}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.bg} ${stat.color}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm h-96 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Registration Activity</h3>
                        <p className="text-sm font-medium text-neutral-500">Device registrations over the last 6 months.</p>
                    </div>
                    {/* Mock chart placeholder */}
                    <div className="w-full flex-1 mt-6 flex items-end justify-between gap-2 border-b border-neutral-100 pb-2">
                        {[40, 70, 45, 90, 65, 110].map((h, i) => (
                            <div key={i} className="w-full bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary" style={{ height: `${h}%` }}>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h * 10}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between w-full text-xs font-semibold text-neutral-400 mt-4 px-2">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><ArrowLeftRight className="w-4 h-4" /></div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Sub-store "Branch 1" transferred device <span className="text-primary cursor-pointer hover:underline">S/N 8933</span></p>
                                <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                            <div>
                                <p className="text-sm font-bold text-foreground">New device registered successfully</p>
                                <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 5 hours ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0"><Store className="w-4 h-4" /></div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Vendor subscription renewed</p>
                                <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Missing lucide-react import fix
    function CheckCircle2(props) {
        return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    }
}
