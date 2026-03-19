"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, ArrowLeftRight, Activity, ShieldAlert, CreditCard, Fingerprint, ChevronRight, CheckCircle, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { payWithPaystack } from '@/lib/paystack';

export default function DashboardPage() {
    const { user, API_URL, login } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ devices: 0, transfers: 0, incomingTransfers: 0 });
    const [loading, setLoading] = useState(true);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [nin, setNin] = useState('');
    const [verifyStep, setVerifyStep] = useState(1); // 1: Input NIN, 2: Payment, 3: Pending
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [error, setError] = useState('');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const isRestricted = !user?.isApproved;

    useEffect(() => {
        const fetchDashboardDetails = async () => {
            if (!user?.isApproved && !user?.hasPaid) {
               // Only fetch basic stats if not approved, or skip if restricted
            }
            try {
                const token = user?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const devicesRes = await axios.get(`${API_URL}/devices/mydevices`, config);
                const transfersRes = await axios.get(`${API_URL}/transfers/incoming`, config);

                setStats({
                    devices: devicesRes.data.length,
                    transfers: 0,
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
            if (user.hasPaid && !user.isApproved) setVerifyStep(3);
        }
    }, [user, API_URL]);

    const handleNinSubmit = async (e) => {
        e.preventDefault();
        setVerifyLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
        const reference = `search-${user._id}-${Date.now()}`;
        try {
            await payWithPaystack({
                email: user.email,
                amount: 500,
                description: 'Gadget Registry Search Fee',
                reference,
                onSuccess: async ({ reference: paystackRef }) => {
                    try {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        // Verify the payment first
                        await axios.post(`${API_URL}/payments/verify`, {
                            reference: paystackRef,
                            amount: 500,
                            type: 'search'
                        }, config);
                        
                        // Retry search with the ref
                        handleSearch(null, paystackRef);
                    } catch (err) {
                        setSearchError('Payment verification failed.');
                        setSearchLoading(false);
                    }
                },
                onClose: () => {
                    setSearchLoading(false);
                }
            });
        } catch (err) {
            setSearchError('Could not initiate payment.');
            setSearchLoading(false);
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
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        await axios.post(`${API_URL}/payments/verify`, {
                            reference: paystackRef,
                            amount: 500,
                            type: 'nin_verification'
                        }, config);
                        
                        // Refresh user local state
                        const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
                        login({ ...user, ...profileRes.data });
                        
                        setVerifyStep(3);
                    } catch (err) {
                        setError('Payment recorded but verification failed. Please contact support.');
                    } finally {
                        setVerifyLoading(false);
                    }
                },
                onClose: () => {
                    setVerifyLoading(false);
                }
            });
        } catch (err) {
            setError('Could not initiate payment. Please check your connection.');
            setVerifyLoading(false);
        }
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
                {!user?.isApproved && (
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
                        <p className="text-red-500 text-sm font-bold mt-4 animate-in slide-in-from-top-2">
                            {searchError}
                        </p>
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
                        </div>
                    )}
                </div>
            </div>

            {/* Notification for Pending Approval */}
            {user?.hasPaid && !user?.isApproved && (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-start gap-4 animate-in slide-in-from-top-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl shrink-0">
                        <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-foreground">Verification in Progress</h4>
                        <p className="text-neutral-600 font-medium">Your NIN and payment have been received. A super admin is currently reviewing your details. This usually takes less than 24 hours.</p>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${isRestricted ? 'opacity-60 grayscale' : ''}`}>
                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                        <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Total Devices</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.devices}</p>
                    </div>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl">
                        <ArrowLeftRight className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Pending Transfers</p>
                        <p className="text-3xl font-extrabold text-foreground">{stats.incomingTransfers}</p>
                    </div>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl">
                        <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-500 mb-1">Account Status</p>
                        <p className={`text-lg font-extrabold capitalize ${user?.isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                            {user?.isApproved ? 'Fully Verified' : 'Awaiting Setup'}
                        </p>
                    </div>
                </div>
            </div>

            {isRestricted ? (
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
                    {/* Add more dashboard features here if approved */}
                </>
            )}

            {/* Verification Modal */}
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

                                    <button 
                                        disabled={verifyLoading}
                                        onClick={handlePayment}
                                        className="w-full bg-neutral-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {verifyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pay via Secure Gateway'}
                                        <ShieldAlert className="w-5 h-5" />
                                    </button>
                                    
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
                                            We've received your NIN and payment information. A super admin is reviewing your details to ensure they match our security standards.
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
        </div>
    );
}
