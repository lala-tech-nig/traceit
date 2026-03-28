"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, ArrowLeftRight, Activity, ShieldAlert, CreditCard, Fingerprint, ChevronRight, CheckCircle, Loader2, Search, History, Users, Wallet, Banknote, TrendingUp, X, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { payWithPaystack } from '@/lib/paystack';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
    const { user, API_URL, login } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ devices: 0, transfers: 0, incomingTransfers: 0 });
    const [loading, setLoading] = useState(true);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [nin, setNin] = useState('');
    const [verifyStep, setVerifyStep] = useState(1);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [error, setError] = useState('');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ address: '', sellerDescription: '' });
    const [reportLoading, setReportLoading] = useState(false);
    const [reportMsg, setReportMsg] = useState({ type: '', text: '' });
    const [reportStep, setReportStep] = useState(1);

    // Referral state
    const [referralEarnings, setReferralEarnings] = useState(null);
    const [myReferrals, setMyReferrals] = useState([]);
    const [showReferralPanel, setShowReferralPanel] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankName: '', accountNumber: '', accountName: '' });
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawMsg, setWithdrawMsg] = useState({ type: '', text: '' });
    const [withdrawStep, setWithdrawStep] = useState(1);

    const isRestricted = !user?.isApproved;

    const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

    useEffect(() => {
        const fetchDashboardDetails = async () => {
            try {
                const token = user?.token;
                const cfg = { headers: { Authorization: `Bearer ${token}` } };

                const [devicesRes, transfersRes, adsRes] = await Promise.all([
                    axios.get(`${API_URL}/devices/mydevices`, cfg),
                    axios.get(`${API_URL}/transfers/incoming`, cfg),
                    axios.get(`${API_URL}/ads/public/active`, cfg)
                ]);

                setStats({
                    devices: devicesRes.data.length,
                    transfers: 0,
                    incomingTransfers: transfersRes.data.length
                });

                const banners = adsRes.data.filter(a => a.type === 'dashboard_banner');
                setBannerAds(banners);
            } catch (error) {
                console.error("Failed to fetch dashboard detail", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReferralData = async () => {
            try {
                const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };
                const [earningsRes, referralsRes] = await Promise.all([
                    axios.get(`${API_URL}/referrals/my-earnings`, cfg),
                    axios.get(`${API_URL}/referrals/my-referrals`, cfg)
                ]);
                setReferralEarnings(earningsRes.data);
                setMyReferrals(referralsRes.data);
            } catch (err) {
                console.error('Failed to fetch referral data', err);
            }
        };

        if (user) {
            fetchDashboardDetails();
            fetchReferralData();
            if (user.hasPaid && !user.isApproved) setVerifyStep(3);
        }
    }, [user, API_URL]);

    const [bannerAds, setBannerAds] = useState([]);
    const [currentAdIdx, setCurrentAdIdx] = useState(0);

    useEffect(() => {
        if (bannerAds.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentAdIdx(prev => (prev + 1) % bannerAds.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [bannerAds]);

    const handleNinSubmit = async (e) => {
        e.preventDefault();
        setVerifyLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/admin/submit-nin`, { nin }, config);
            setVerifyStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit NIN');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleSearch = async (e, forcedPaymentRef = null) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchError('');
        setSearchResult(null);
        try {
            const url = forcedPaymentRef
                ? `${API_URL}/devices/search/${searchQuery}?paymentRef=${forcedPaymentRef}`
                : `${API_URL}/devices/search/${searchQuery}`;
            const res = await axios.get(url, config);
            setSearchResult(res.data);
        } catch (err) {
            if (err.response?.status === 402) {
                if (user.role === 'basic') {
                    handleSearchPayment();
                } else {
                    setSearchError('Active subscription required. Please click the Profile to renew.');
                }
            } else {
                setSearchError(err.response?.data?.message || 'Device not found in registry');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchPayment = async () => {
        setSearchLoading(true);
        // Check earnings first
        try {
            const earnRes = await axios.post(`${API_URL}/referrals/pay-with-earnings-info`, { requiredAmount: 500 }, config);
            if (earnRes.data.availableBalance > 0) {
                // If they have any earnings, we show a choice or just auto-apply if sufficient
                // For simplicity in this UI, if they have enough, we'll ask. 
                // But since search is triggered by a form submit, let's add a state to show a "Pay Choice" modal or inline notice.
                setSearchError(`Notice: You have ₦${earnRes.data.availableBalance} in earnings. [PAY_WITH_EARNINGS_BUTTON]`);
                // Wait, I should probably just add a small "Use Earnings" button below the search error.
                setSearchLoading(false);
                return;
            }
        } catch (err) { console.error(err); }

        const reference = `search-${user._id}-${Date.now()}`;
        try {
            await payWithPaystack({
                email: user.email,
                amount: 500,
                description: 'Gadget Registry Search Fee',
                reference,
                onSuccess: async ({ reference: paystackRef }) => {
                    try {
                        await axios.post(`${API_URL}/payments/verify`, { reference: paystackRef, amount: 500, type: 'search' }, config);
                        handleSearch(null, paystackRef);
                    } catch (err) {
                        setSearchError('Payment verification failed.');
                        setSearchLoading(false);
                    }
                },
                onClose: () => { setSearchLoading(false); }
            });
        } catch (err) {
            setSearchError('Could not initiate payment.');
            setSearchLoading(false);
        }
    };

    const handleApplyEarnings = async (amount, type, onDone) => {
        setVerifyLoading(true);
        try {
            await axios.post(`${API_URL}/referrals/apply-earnings`, { amount, type }, config);
            const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
            login({ ...user, ...profileRes.data });
            if (onDone) onDone();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply earnings');
        } finally {
            setVerifyLoading(false);
        }
    };


    const handlePayment = async () => {
        setVerifyLoading(true);
        setError('');
        const reference = `traceit-nin-${user._id}-${Date.now()}`;
        try {
            await payWithPaystack({
                email: user.email,
                amount: 500,
                description: 'NIN Identity Verification Fee',
                reference,
                onSuccess: async ({ reference: paystackRef }) => {
                    try {
                        await axios.post(`${API_URL}/payments/verify`, { reference: paystackRef, amount: 500, type: 'nin_verification' }, config);
                        const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
                        login({ ...user, ...profileRes.data });
                        setVerifyStep(3);
                    } catch (err) {
                        setError('Payment recorded but verification failed. Please contact support.');
                    } finally {
                        setVerifyLoading(false);
                    }
                },
                onClose: () => { setVerifyLoading(false); }
            });
        } catch (err) {
            setError('Could not initiate payment. Please check your connection.');
            setVerifyLoading(false);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setReportLoading(true);
        setReportMsg({ type: '', text: '' });
        try {
            const res = await axios.post(`${API_URL}/reports`, {
                deviceId: searchResult._id,
                address: reportForm.address,
                sellerDescription: reportForm.sellerDescription
            }, config);
            setReportMsg({ type: 'success', text: res.data.message });
            setTimeout(() => {
                setShowReportModal(false);
                setReportMsg({ type: '', text: '' });
                setReportForm({ address: '', sellerDescription: '' });
            }, 2500);
            const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
            login({ ...user, ...profileRes.data });
        } catch (err) {
            setReportMsg({ type: 'error', text: err.response?.data?.message || 'Report failed' });
        } finally {
            setReportLoading(false);
        }
    };

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        setWithdrawLoading(true);
        setWithdrawMsg({ type: '', text: '' });
        try {
            const res = await axios.post(`${API_URL}/referrals/request-withdrawal`, {
                amount: Number(withdrawForm.amount),
                bankName: withdrawForm.bankName,
                accountNumber: withdrawForm.accountNumber,
                accountName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
            }, config);
            setWithdrawMsg({ type: 'success', text: res.data.message });
            setWithdrawForm({ amount: '', bankName: '', accountNumber: '', accountName: '' });
            // Refresh earnings
            const earningsRes = await axios.get(`${API_URL}/referrals/my-earnings`, config);
            setReferralEarnings(earningsRes.data);
            setTimeout(() => { setShowWithdrawModal(false); setWithdrawMsg({ type: '', text: '' }); }, 2500);
        } catch (err) {
            setWithdrawMsg({ type: 'error', text: err.response?.data?.message || 'Withdrawal request failed' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const getCombinedHistory = (device) => {
        if (!device) return [];
        const combined = [
            { id: 'reg', type: 'registration', date: new Date(device.createdAt), title: 'Device Registered', desc: 'Added to TraceIt Registry', icon: 'check', color: 'green' },
            ...(device.history || []).map((h, i) => ({
                id: `transfer-${i}`, type: 'transfer', date: new Date(h.transferDate),
                title: 'Ownership Transfer', desc: `From ${h.previousOwner?.firstName || 'Unknown'} to ${h.newOwner?.firstName || 'Unknown'}`,
                comment: h.comment, icon: 'transfer', color: 'blue'
            })),
            ...(device.reports || []).map((r, i) => ({
                id: `report-${i}`, type: 'report', date: new Date(r.createdAt),
                title: 'Device Flagged', desc: `Reported at: ${r.address}`,
                comment: r.sellerDescription, icon: 'alert', color: 'red'
            })),
            ...(device.statusUpdates || []).map((s, i) => ({
                id: `status-${i}`, type: 'status', date: new Date(s.date),
                title: `Status Changed to ${s.status}`, desc: `Marked as ${s.status.toUpperCase()}`,
                comment: s.comment, icon: 'status', color: 'amber'
            }))
        ];
        return combined.sort((a, b) => b.date - a.date);
    };

    const searchHistoryTimeline = searchResult ? getCombinedHistory(searchResult) : [];

    const colorClasses = {
        green: { bg: 'bg-green-100', text: 'text-green-600', hoverBg: 'hover:bg-green-50/30', hoverBorder: 'hover:border-green-200' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', hoverBg: 'hover:bg-blue-50/30', hoverBorder: 'hover:border-blue-200' },
        red: { bg: 'bg-red-100', text: 'text-red-600', hoverBg: 'hover:bg-red-50/30', hoverBorder: 'hover:border-red-200' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600', hoverBg: 'hover:bg-amber-50/30', hoverBorder: 'hover:border-amber-200' }
    };

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
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Welcome back, {user?.firstName}</h1>
                    <p className="text-neutral-500 font-medium">Manage your devices, transfers, and account activities.</p>
                </div>
                {!user?.isApproved && !user?.hasPaid && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-2 pr-4 rounded-2xl">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center rounded-xl">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Identity Unverified</p>
                            <button onClick={() => setShowVerifyModal(true)} className="text-sm font-black text-amber-900 hover:underline">Verify Account Now</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Search Section */}
            <div className="bg-white border border-neutral-200 p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Global Registry Search
                    </h3>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter Serial Number or IMEI..."
                                className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button
                            disabled={searchLoading}
                            type="submit"
                            className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </form>

                    {searchError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
                            <p className="text-red-500 text-sm font-bold">
                                {searchError.includes('[PAY_WITH_EARNINGS_BUTTON]') 
                                    ? searchError.replace('[PAY_WITH_EARNINGS_BUTTON]', '') 
                                    : searchError}
                            </p>
                            {searchError.includes('[PAY_WITH_EARNINGS_BUTTON]') && (
                                <button 
                                    onClick={() => handleApplyEarnings(500, 'search', () => handleSearch())}
                                    className="mt-2 bg-primary text-white text-xs font-black px-4 py-2 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                                >
                                    Use Earnings (₦500)
                                </button>
                            )}
                        </div>
                    )}


                    {searchResult && (
                        <div className="mt-8 p-6 bg-neutral-50 rounded-3xl border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                                <div>
                                    <h4 className="text-lg font-black text-foreground">{searchResult.name}</h4>
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{searchResult.brand} {searchResult.model}</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    searchResult.status === 'clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {searchResult.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500 font-bold">Serial Number:</span>
                                        <span className="font-bold text-foreground font-mono">{searchResult.serialNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500 font-bold">Current Owner:</span>
                                        <span className="font-bold text-foreground">
                                            {isRestricted ? "******** (Verify to view)" : searchResult.currentOwner?.name}
                                        </span>
                                    </div>
                                </div>

                                {isRestricted ? (
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                        <ShieldAlert className="w-6 h-6 text-amber-600 mb-2" />
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-tight mb-2">Verified Members Only</p>
                                        <button
                                            onClick={() => setShowVerifyModal(true)}
                                            className="text-[10px] font-black text-amber-900 bg-amber-200/50 px-3 py-1 rounded-lg hover:bg-amber-200 transition-colors"
                                        >
                                            Verify Identity to View Owner Details
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500 font-bold">Owner Email:</span>
                                            <span className="font-bold text-foreground">{searchResult.currentOwner?.email}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500 font-bold">Member Since:</span>
                                            <span className="font-bold text-foreground">
                                                {new Date(searchResult.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {searchResult.status !== 'clean' && !isRestricted && (
                                <button onClick={() => setShowReportModal(true)} className="mt-6 w-full bg-red-50 text-red-600 border border-red-200 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    Flag / Report Device Location (Earn Reward Points)
                                </button>
                            )}

                            {!isRestricted && searchHistoryTimeline.length > 0 && (
                                <div className="mt-8 border-t border-neutral-200 pt-8">
                                    <h4 className="text-lg font-black text-foreground mb-8 flex items-center gap-2">
                                        <History className="w-5 h-5" /> Device Lifecycle History
                                    </h4>
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                                        {searchHistoryTimeline.map((item) => {
                                            const colors = colorClasses[item.color] || colorClasses.blue;
                                            return (
                                                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active mt-6">
                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${colors.bg} ${colors.text}`}>
                                                        {item.icon === 'check' && <CheckCircle className="w-4 h-4" />}
                                                        {item.icon === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                                                        {item.icon === 'alert' && <ShieldAlert className="w-4 h-4" />}
                                                        {item.icon === 'status' && <Activity className="w-4 h-4" />}
                                                    </div>
                                                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm transition-all hover:-translate-y-1 ${colors.hoverBg} ${colors.hoverBorder}`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>{item.title}</span>
                                                            <time className="text-[10px] font-bold text-neutral-400">{item.date.toLocaleDateString()}</time>
                                                        </div>
                                                        <p className="text-sm font-bold text-foreground">{item.desc}</p>
                                                        {item.comment && <p className="text-xs text-neutral-500 mt-1 italic">"{item.comment}"</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Ad Carousel */}
            {bannerAds.length > 0 && (
                <div onClick={() => window.open(bannerAds[currentAdIdx].actionUrl, '_blank')} className="relative bg-neutral-100 rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden aspect-[21/9] md:aspect-[32/9] flex items-center group cursor-pointer transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-700 w-full max-h-[300px]">
                    {bannerAds[currentAdIdx].mediaUrl ? (
                        <div className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-transform duration-[10s] ease-out" style={{ backgroundImage: `url(${bannerAds[currentAdIdx].mediaUrl})` }}></div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center p-8 text-white text-center">
                            <h3 className="text-3xl font-black mb-2">{bannerAds[currentAdIdx].title}</h3>
                            <p className="text-sm font-medium opacity-90 max-w-lg">{bannerAds[currentAdIdx].description}</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white text-primary font-black px-8 py-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                            {bannerAds[currentAdIdx].actionType === 'whatsapp' ? 'Connect on WhatsApp' : 'Visit Link'} <ChevronRight className="w-5 h-5" />
                        </span>
                    </div>
                    {bannerAds.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                            {bannerAds.map((_, i) => (
                                <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentAdIdx(i); }} className={`w-2 h-2 rounded-full transition-all cursor-pointer shadow-sm ${i === currentAdIdx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/90'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notification for Pending Approval */}
            {user?.hasPaid && !user?.isApproved && (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-start gap-4 animate-in slide-in-from-top-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl shrink-0">
                        <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-foreground">Verification in Progress</h4>
                        <p className="text-neutral-600 font-medium">Your NIN and payment have been received. A field verificator will visit your address and an admin is reviewing your details. This usually takes less than 24 hours.</p>
                    </div>
                </div>
            )}

            {/* ── REFERRAL EARNINGS BANNER ── */}
            {referralEarnings && (
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-[2.5rem] p-6 md:p-8 shadow-lg shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 opacity-80" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80">Referral & Reward Earnings</p>
                            </div>
                            <div className="flex items-end gap-6">
                                <div>
                                    <p className="text-xs font-bold opacity-60 uppercase tracking-wider mb-1">Available Balance</p>
                                    <p className="text-4xl font-black">₦{(referralEarnings.availableBalance || 0).toLocaleString()}</p>
                                </div>
                                <div className="pb-1 space-y-0.5">
                                    <p className="text-xs font-semibold opacity-60">Referral Credits: ₦{referralEarnings.referralEarnings}</p>
                                    <p className="text-xs font-semibold opacity-60">Reward Points: {referralEarnings.rewardPoints} pts (₦{referralEarnings.rewardPointsValue})</p>
                                    {referralEarnings.pendingEarnings > 0 && (
                                        <p className="text-xs font-semibold opacity-60">Pending: ₦{referralEarnings.pendingEarnings} (awaiting verifications)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowReferralPanel(!showReferralPanel)}
                                className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-3 rounded-2xl transition-all flex items-center gap-2 text-sm"
                            >
                                <Users className="w-4 h-4" />
                                My Referrals ({referralEarnings.totalCreditedReferrals + referralEarnings.totalPendingReferrals})
                            </button>
                            <button
                                onClick={() => { setShowWithdrawModal(true); setWithdrawStep(1); }}
                                className="bg-white text-primary font-bold px-5 py-3 rounded-2xl hover:bg-neutral-50 transition-all flex items-center gap-2 text-sm shadow-lg"
                            >
                                <Banknote className="w-4 h-4" />
                                Withdraw Earnings
                            </button>
                        </div>
                    </div>

                    {/* Referral link hint */}
                    <div className="relative z-10 mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                        <p className="text-xs opacity-70">Your referral: Share your registered email with anyone joining TraceIt to earn ₦100 per verified user.</p>
                    </div>
                </div>
            )}

            {/* ── MY REFERRALS PANEL ── */}
            {showReferralPanel && (
                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> Users I Referred
                        </h3>
                        <button onClick={() => setShowReferralPanel(false)} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 hover:text-foreground transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {myReferrals.length === 0 ? (
                        <div className="text-center py-10 text-neutral-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-bold">No referrals yet</p>
                            <p className="text-sm mt-1">Share your email with friends to earn ₦100 per verified user.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myReferrals.map((r) => (
                                <div key={r._id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary/20 transition-all">
                                    <div>
                                        <p className="font-bold text-foreground">{r.referred?.firstName} {r.referred?.lastName}</p>
                                        <p className="text-xs text-neutral-500 font-medium">{r.referred?.email}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Joined {new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs font-black px-3 py-1 rounded-full ${r.status === 'credited' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {r.status === 'credited' ? `+₦${r.commissionAmount}` : 'Pending'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.referred?.isApproved ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                            {r.referred?.isApproved ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${isRestricted ? 'opacity-60 grayscale' : ''}`}>
                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl shrink-0">
                        <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Total Devices</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.devices}</p>
                    </div>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl shrink-0">
                        <ArrowLeftRight className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Pending Transfers</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.incomingTransfers}</p>
                    </div>
                </div>

                <button onClick={() => { if (!isRestricted) router.push('/dashboard/history') }} className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 hover:border-primary/30 transition-all text-left group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 flex items-center justify-center rounded-2xl shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <History className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1 line-clamp-1">View History</p>
                        <p className="text-lg font-extrabold text-foreground leading-tight">Device Log</p>
                    </div>
                </button>

                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl shrink-0">
                        <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Status</p>
                        <p className={`text-sm font-extrabold capitalize leading-tight ${user?.isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                            {user?.isApproved ? 'Fully Verified' : 'Awaiting Setup'}
                        </p>
                    </div>
                </div>
            </div>

            {isRestricted ? (
                user?.hasPaid ? (
                    <div className="bg-white border border-neutral-200 rounded-[3rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-primary animate-pulse"></div>
                        <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-3xl mx-auto mb-8 animate-pulse">
                            <Activity className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground mb-4">Awaiting Admin Approval</h2>
                        <p className="text-neutral-500 max-w-xl mx-auto font-medium text-lg leading-relaxed mb-6">
                            Your NIN identity detail and verification payment have been successfully received. A field verificator will visit your home address and a super admin will review your account.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-[3rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>
                        <div className="w-24 h-24 bg-neutral-50 text-neutral-300 flex items-center justify-center rounded-3xl mx-auto mb-8">
                            <ShieldAlert className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground mb-4">Complete Your Profile</h2>
                        <p className="text-neutral-500 max-w-xl mx-auto font-medium text-lg leading-relaxed mb-10">
                            To maintain a secure ecosystem, we requires all users to verify their identity with a National Identity Number (NIN) before accessing the device registry and transfer features.
                        </p>
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className="bg-primary text-white font-black px-12 py-5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 text-lg hover:-translate-y-1 active:scale-95"
                        >
                            Start Identity Verification
                        </button>
                        <div className="mt-12 pt-8 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
                            {['Add Devices', 'Track Gadgets', 'Transfer Ownership', 'View History'].map(feat => (
                                <div key={feat} className="flex items-center justify-center gap-2 text-sm font-bold">
                                    <CheckCircle className="w-4 h-4" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <>
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
                </>
            )}

            {/* ── VERIFICATION MODAL ── */}
            {showVerifyModal && (
                <div className="fixed inset-0 z-[100] bg-neutral-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowVerifyModal(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 hover:text-foreground transition-all"
                        >
                            ✕
                        </button>

                        <div className="p-10 md:p-12">
                            {verifyStep === 1 && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-3xl mx-auto mb-6">
                                            <Fingerprint className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-black text-foreground mb-2">Identity Details</h3>
                                        <p className="text-neutral-500 font-medium">Verify that the details below match your NIN slip.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">First Name</p>
                                                <p className="font-bold text-foreground">{user?.firstName}</p>
                                            </div>
                                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Last Name</p>
                                                <p className="font-bold text-foreground">{user?.lastName}</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleNinSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-black text-neutral-700 mb-2 uppercase tracking-wide">Enter NIN Number</label>
                                                <input
                                                    required
                                                    type="text"
                                                    maxLength={11}
                                                    value={nin}
                                                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="11-digit National Identity Number"
                                                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl font-mono text-lg focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                                            <button
                                                disabled={verifyLoading || nin.length < 11}
                                                type="submit"
                                                className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {verifyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Identity'}
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {verifyStep === 2 && (
                                <div className="space-y-8 py-4">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-green-50 text-green-600 flex items-center justify-center rounded-3xl mx-auto mb-6">
                                            <CreditCard className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-black text-foreground mb-2">Verification Fee</h3>
                                        <p className="text-neutral-500 font-medium">Secure your account access with a one-time verification fee.</p>
                                    </div>

                                    <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 text-center">
                                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Amount to Pay</p>
                                        <p className="text-5xl font-black text-foreground">₦500<span className="text-lg text-neutral-400 font-bold">.00</span></p>
                                    </div>

                                    {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                                    <div className="flex flex-col gap-3">
                                        <button
                                            disabled={verifyLoading}
                                            onClick={handlePayment}
                                            className="w-full bg-neutral-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {verifyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pay via Secure Gateway'}
                                            <ShieldAlert className="w-5 h-5" />
                                        </button>

                                        {referralEarnings?.availableBalance >= 500 && (
                                            <button
                                                disabled={verifyLoading}
                                                onClick={() => handleApplyEarnings(500, 'nin_verification', () => setVerifyStep(3))}
                                                className="w-full bg-primary/10 text-primary font-black py-5 rounded-2xl hover:bg-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-primary/20"
                                            >
                                                {verifyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pay with Earnings (₦500)'}
                                                <TrendingUp className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>


                                    <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Powered by Traceit Global Registry</p>
                                </div>
                            )}

                            {verifyStep === 3 && (
                                <div className="space-y-8 py-10 text-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto animate-pulse">
                                            <Activity className="w-12 h-12" />
                                        </div>
                                        <div className="absolute top-0 right-[35%] w-8 h-8 bg-green-500 text-white flex items-center justify-center rounded-full border-4 border-white">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-foreground mb-4">Submission Received</h3>
                                        <p className="text-neutral-500 font-medium leading-relaxed">
                                            We've received your NIN and payment information. A field verificator will visit your home address, and a super admin is reviewing your details.
                                        </p>
                                    </div>

                                    <div className="bg-neutral-50 p-6 rounded-2xl">
                                        <p className="text-sm font-bold text-primary italic">"Safety first, for everyone in the registry."</p>
                                    </div>

                                    <button
                                        onClick={() => setShowVerifyModal(false)}
                                        className="w-full bg-neutral-100 text-neutral-900 font-black py-5 rounded-2xl hover:bg-neutral-200 transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── REPORT MODAL ── */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] bg-neutral-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 hover:text-foreground transition-all"
                        >
                            ✕
                        </button>
                        <div className="p-10 md:p-12">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-red-50 text-red-600 flex items-center justify-center rounded-3xl mx-auto mb-6">
                                    <ShieldAlert className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-black text-foreground mb-2">Report Device</h3>
                                <p className="text-neutral-500 font-medium leading-relaxed">Please provide the location and description of the person in possession of this stolen/lost device. You earn reward points for accurate reports!</p>
                            </div>

                            <div className="mb-8 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">Step {reportStep} of 2</span>
                                <div className="flex gap-1.5">
                                    {[1, 2].map((s) => (
                                        <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${s <= reportStep ? 'bg-primary w-4' : 'bg-neutral-200'}`} />
                                    ))}
                                </div>
                            </div>

                            {reportMsg.text && (
                                <div className={`p-4 rounded-xl font-bold mb-6 text-center ${reportMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {reportMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleReportSubmit} className="space-y-6">
                                {reportStep === 1 ? (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-black text-neutral-700 mb-2 uppercase tracking-wide">Device Location / Address</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={reportForm.address}
                                                    onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                                                    placeholder="e.g. Shop 12, Computer Village, Ikeja"
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-neutral-400 font-medium italic">Enter the exact address where you spotted this device.</p>
                                        </div>
                                        <div className="flex justify-end pt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => setReportStep(2)}
                                                disabled={!reportForm.address}
                                                className="bg-primary text-white px-10 py-4 rounded-2xl font-extrabold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                Next Details
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-black text-neutral-700 mb-2 uppercase tracking-wide">Seller / Possessor Description</label>
                                                <textarea
                                                    required
                                                    value={reportForm.sellerDescription}
                                                    onChange={(e) => setReportForm({ ...reportForm, sellerDescription: e.target.value })}
                                                    placeholder="Describe the person who brought the device..."
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium h-32 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-neutral-400 font-medium italic">Accurate descriptions help us and the owner recover the gadget faster.</p>
                                        </div>
                                        <div className="flex gap-4 pt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => setReportStep(1)} 
                                                className="flex-1 bg-neutral-100 text-neutral-600 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-all font-black text-xs uppercase"
                                            >
                                                Back
                                            </button>
                                            <button
                                                disabled={reportLoading || !reportForm.sellerDescription}
                                                type="submit"
                                                className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {reportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                                                {reportLoading ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showWithdrawModal && (
                    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
                            onClick={() => setShowWithdrawModal(false)}
                        />
                        
                        {/* Modal Card */}
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 sm:mb-0 mb-20"
                        >
                            <div className="p-8 sm:p-10">
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="absolute top-6 right-6 w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 hover:text-foreground transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Progress Indicator */}
                                <div className="flex gap-2 mb-8 mt-2">
                                    {[1, 2, 3].map((s) => (
                                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${withdrawStep >= s ? 'bg-primary' : 'bg-neutral-100'}`} />
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {withdrawStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mx-auto mb-4">
                                                    <Wallet className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-2xl font-black text-foreground">Withdraw Amount</h3>
                                                <p className="text-sm text-neutral-500 mt-1">Select how much you'd like to withdraw.</p>
                                            </div>

                                            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 text-center">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Available Balance</p>
                                                <p className="text-3xl font-black text-foreground">₦{(referralEarnings?.availableBalance || 0).toLocaleString()}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center ml-1">
                                                    <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-widest">Amount to Withdraw (₦)</label>
                                                    {withdrawForm.amount && Number(withdrawForm.amount) > (referralEarnings?.availableBalance || 0) && (
                                                        <span className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-right-2">Insufficient Balance</span>
                                                    )}
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    min="100"
                                                    max={referralEarnings?.availableBalance || 0}
                                                    value={withdrawForm.amount}
                                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                                    placeholder="e.g. 500"
                                                    className={`w-full px-5 py-4 bg-neutral-50 border rounded-2xl font-bold text-foreground outline-none transition-all ${
                                                        withdrawForm.amount && (Number(withdrawForm.amount) < 100 || Number(withdrawForm.amount) > (referralEarnings?.availableBalance || 0))
                                                        ? 'border-red-200 focus:border-red-400'
                                                        : 'border-neutral-200 focus:border-primary focus:bg-white'
                                                    }`}
                                                />
                                                {withdrawForm.amount && Number(withdrawForm.amount) < 100 && (
                                                    <p className="text-[10px] text-neutral-400 font-bold ml-1">Minimum withdrawal is ₦100</p>
                                                )}
                                            </div>

                                            <button
                                                disabled={!referralEarnings || !withdrawForm.amount || Number(withdrawForm.amount) < 100 || Number(withdrawForm.amount) > referralEarnings?.availableBalance}
                                                onClick={() => setWithdrawStep(2)}
                                                className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {referralEarnings ? 'Next Step' : <Loader2 className="w-4 h-4 animate-spin" />}
                                                {referralEarnings && <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        </motion.div>
                                    )}

                                    {withdrawStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-5"
                                        >
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-black text-foreground">Bank Details</h3>
                                                <p className="text-sm text-neutral-500 mt-1">Where should we send your money?</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Bank Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={withdrawForm.bankName}
                                                        onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                                                        placeholder="e.g. Access Bank"
                                                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-foreground focus:bg-white focus:border-primary outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Account Number</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        maxLength={10}
                                                        value={withdrawForm.accountNumber}
                                                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                                                        placeholder="10-digit account number"
                                                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono font-bold text-base text-foreground focus:bg-white focus:border-primary outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Account Name</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                                                        className="w-full px-5 py-3.5 bg-neutral-100 border border-neutral-200 rounded-xl font-bold text-neutral-500 outline-none cursor-not-allowed text-sm"
                                                    />
                                                    <p className="text-[10px] text-green-600 font-bold ml-1">Fetched securely from your verified profile.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => setWithdrawStep(1)}
                                                    className="flex-1 bg-neutral-100 text-neutral-500 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-all"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    disabled={!withdrawForm.bankName || withdrawForm.accountNumber.length < 10}
                                                    onClick={() => setWithdrawStep(3)}
                                                    className="flex-[2] bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                                >
                                                    Review Request
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {withdrawStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-black text-foreground">Review & Confirm</h3>
                                                <p className="text-sm text-neutral-500 mt-1">Please confirm the details are correct.</p>
                                            </div>

                                            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 space-y-4">
                                                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase">Amount</span>
                                                    <span className="font-black text-foreground">₦{Number(withdrawForm.amount).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase">Bank</span>
                                                    <span className="font-bold text-foreground">{withdrawForm.bankName}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase">Account</span>
                                                    <div className="text-right">
                                                        <p className="font-bold text-foreground leading-none">{withdrawForm.accountNumber}</p>
                                                        <p className="text-[10px] font-medium text-neutral-500 mt-1">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {withdrawMsg.text && (
                                                <div className={`p-4 rounded-xl font-bold text-center text-sm ${withdrawMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {withdrawMsg.text}
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <button
                                                    disabled={withdrawLoading}
                                                    onClick={() => setWithdrawStep(2)}
                                                    className="flex-1 bg-neutral-100 text-neutral-500 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    disabled={withdrawLoading}
                                                    onClick={handleWithdrawSubmit}
                                                    className="flex-[2] bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                                >
                                                    {withdrawLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                    {withdrawLoading ? 'Confirming...' : 'Confirm & Withdraw'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
