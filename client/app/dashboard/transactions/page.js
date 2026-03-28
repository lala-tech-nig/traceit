"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CreditCard,
    ArrowLeftRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldAlert
} from 'lucide-react';

export default function TransactionsHistoryPage() {
    const { user, API_URL } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_URL}/payments/history`, config);
                setTransactions(res.data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTransactions();
        }
    }, [user, API_URL]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'approved':
            case 'credited':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
            case 'rejected':
            case 'declined':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-amber-500" />;
            default:
                return null;
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'approved':
            case 'credited':
                return 'bg-green-50 text-green-700';
            case 'failed':
            case 'rejected':
            case 'declined':
                return 'bg-red-50 text-red-700';
            case 'pending':
                return 'bg-amber-50 text-amber-700';
            default:
                return 'bg-neutral-50 text-neutral-600';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 fade-in animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-primary" />
                    Transaction History
                </h1>
                <p className="text-neutral-500 font-medium">Keep track of your payments, withdrawals, and earnings over time.</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                <th className="px-8 py-5">Date & Time</th>
                                <th className="px-8 py-5">Activity</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldAlert className="w-8 h-8" />
                                        </div>
                                        <p className="text-neutral-500 font-bold mb-1">No Transactions Found</p>
                                        <p className="text-xs text-neutral-400 font-medium">You haven't made any payments or withdrawals yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <p className="text-sm font-bold text-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                            <p className="text-xs font-medium text-neutral-400 mt-0.5">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'payment' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'}`}>
                                                    {t.type === 'payment' ? <CreditCard className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground capitalize">{t.title}</p>
                                                    <p className="text-[10px] font-mono font-medium text-neutral-400 mt-0.5 max-w-[150px] truncate">{t.reference}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <p className={`text-base font-black ${t.type === 'payment' ? 'text-red-500' : 'text-green-500'}`}>
                                                {t.type === 'payment' ? '-' : '+'}₦{t.amount.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${getStatusStyles(t.status)}`}>
                                                    {getStatusIcon(t.status)}
                                                    {t.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
