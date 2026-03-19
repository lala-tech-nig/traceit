"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Smartphone, Calendar, User as UserIcon } from 'lucide-react';

export default function DeviceHistoryPage() {
    const { user, API_URL } = useAuth();
    const [historyDevices, setHistoryDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/devices/history`, config);
            setHistoryDevices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Device History</h1>
                    <p className="text-neutral-500 font-medium">Review all gadgets you have owned, transferred, or received over time.</p>
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-24 bg-neutral-200 rounded-3xl w-full"></div>
                        <div className="h-24 bg-neutral-200 rounded-3xl w-full"></div>
                    </div>
                ) : historyDevices.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-3xl">
                        <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No device history</h3>
                        <p className="text-neutral-500">You haven't owned or transferred any devices yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {historyDevices.map(device => {
                            const isCurrentOwner = device.currentOwner === user._id;
                            return (
                                <div key={device._id} className="bg-white border border-neutral-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-primary/30 transition-all group overflow-hidden relative">
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center shrink-0">
                                            {device.deviceImage ? (
                                                <img src={device.deviceImage} alt={device.name} className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <Smartphone className="w-8 h-8 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-foreground">{device.name}</h3>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest self-start ${
                                                    isCurrentOwner ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                    {isCurrentOwner ? 'Currently Owned' : 'Previously Owned'}
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
                                                {device.brand} {device.model} • S/N: {device.serialNumber}
                                            </p>
                                            
                                            {/* History Log */}
                                            {device.history && device.history.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Transfer Trail</p>
                                                    {device.history.map((h, index) => (
                                                        <div key={index} className="flex gap-4 items-start text-sm font-medium bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                                <ArrowLeftRight className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-neutral-700">
                                                                    Transferred on <span className="font-bold">{new Date(h.transferDate).toLocaleDateString()}</span>
                                                                </p>
                                                                {h.comment && (
                                                                    <p className="text-neutral-500 text-xs italic mt-1 font-medium">"{h.comment}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
