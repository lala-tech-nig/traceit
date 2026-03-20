"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Loader2, MapPin, User, Clock } from 'lucide-react';

export default function AlertsPage() {
    const { user, API_URL } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_URL}/reports`, config);
                setReports(res.data);
            } catch (err) {
                setError('Failed to fetch device alerts.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchReports();
        }
    }, [user, API_URL]);

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500" /> 
                    Security Alerts
                </h1>
                <p className="text-neutral-500 font-medium">Review reports and sightings of your missing or flagged devices.</p>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}

            {reports.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-[3rem] p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">No Security Alerts</h3>
                    <p className="text-neutral-500 font-medium max-w-md mx-auto">None of your devices have been flagged or reported by the community recently.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white border border-red-100 rounded-[2rem] p-6 shadow-sm shadow-red-500/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest">
                                            Flagged Device
                                        </div>
                                        <span className="text-sm font-bold text-neutral-400 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> 
                                            {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-black text-foreground">{report.device?.name || 'Unknown Device'}</h3>
                                        <p className="text-sm font-mono text-neutral-500 font-bold mt-1">S/N: {report.device?.serialNumber}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1 mb-2">
                                                <MapPin className="w-3 h-3" /> Location / Address
                                            </p>
                                            <p className="text-sm font-bold text-foreground">{report.address}</p>
                                        </div>
                                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1 mb-2">
                                                <User className="w-3 h-3" /> Seller Description
                                            </p>
                                            <p className="text-sm font-bold text-foreground line-clamp-3">{report.sellerDescription}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center min-w-[150px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Reported By</p>
                                    <p className="text-sm font-bold text-foreground">{report.reporter?.firstName}</p>
                                    <p className="text-xs font-medium text-neutral-500 mt-1">{report.reporter?.phoneNumber || 'Contact Unavailable'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
