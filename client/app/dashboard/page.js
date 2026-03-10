"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, ArrowLeftRight, Activity } from 'lucide-react';

export default function DashboardPage() {
    const { user, API_URL } = useAuth();
    const [stats, setStats] = useState({ devices: 0, transfers: 0, incomingTransfers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardDetails = async () => {
            try {
                const token = user?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch devices simply to count
                const devicesRes = await axios.get(`${API_URL}/devices/mydevices`, config);
                // Fetch incoming transfers
                const transfersRes = await axios.get(`${API_URL}/transfers/incoming`, config);

                setStats({
                    devices: devicesRes.data.length,
                    transfers: 0, // Initiated transfers can be fetched separately if needed
                    incomingTransfers: transfersRes.data.length
                });
            } catch (error) {
                console.error("Failed to fetch dashboard detail", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardDetails();
        }
    }, [user, API_URL]);

    if (loading) {
        return <div className="animate-pulse flex flex-col gap-6">
            <div className="h-10 bg-neutral-200 w-1/4 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-neutral-200 rounded-2xl"></div>
                <div className="h-32 bg-neutral-200 rounded-2xl"></div>
                <div className="h-32 bg-neutral-200 rounded-2xl"></div>
            </div>
        </div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
                <p className="text-neutral-500 font-medium">Manage your devices, transfers, and account activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-white border border-neutral-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                        <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Total Devices</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.devices}</p>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white border border-neutral-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl">
                        <ArrowLeftRight className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Pending Transfers</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.incomingTransfers}</p>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white border border-neutral-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Account Status</p>
                        <p className="text-lg font-extrabold text-foreground capitalize">{user?.role} Active</p>
                    </div>
                </div>
            </div>

            {user?.role === 'vendor' && (
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Vendor Hub</h2>
                    <p className="text-neutral-600 mb-6 max-w-2xl font-medium">
                        Manage your sub-stores and monitor your entire inventory from the master control panel.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors">
                            Create Sub-Store
                        </button>
                        <button className="bg-white border border-neutral-200 text-foreground font-bold px-6 py-3 rounded-xl hover:bg-neutral-50 transition-colors">
                            View Reports
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
