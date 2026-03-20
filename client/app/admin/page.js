"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Fingerprint, 
    ShieldCheck,
    Search,
    Loader2,
    RefreshCw,
    TrendingUp,
    CreditCard,
    ArrowLeftRight,
    Activity,
    ChevronRight,
    SearchCode,
    Smartphone,
    ArrowUpDown,
    Filter,
    Download,
    Megaphone,
    ShieldAlert,
    PlusCircle,
    Edit3,
    ImageIcon,
    Trash
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, API_URL } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [recentTransfers, setRecentTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [processLoading, setProcessLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, accounts, logs, reports, ads
    
    // Ads and Reports State
    const [adsLoading, setAdsLoading] = useState(false);
    const [adsList, setAdsList] = useState([]);
    const [showAdModal, setShowAdModal] = useState(false);
    const [editingAdId, setEditingAdId] = useState(null);
    const [adForm, setAdForm] = useState({ 
        title: '', description: '', type: 'dashboard_banner', 
        targetRoles: ['all'], actionType: 'whatsapp', actionUrl: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
        media: null,
        mediaPreview: null
    });

    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filterRole, setFilterRole] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [statsRes, pendingRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, config),
                axios.get(`${API_URL}/admin/pending`, config)
            ]);
            
            setStats(statsRes.data.stats);
            setRecentSearches(statsRes.data.recentSearches);
            setRecentTransfers(statsRes.data.recentTransfers);
            setPendingUsers(pendingRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setUsersLoading(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                params: { 
                    sort: `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`,
                    role: filterRole
                }
            };
            const res = await axios.get(`${API_URL}/admin/users`, config);
            setAllUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch all users", error);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        if (user) fetchData();
    }, [user]);

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/reports`, config);
            setReports(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchAds = async () => {
        setAdsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/ads`, config);
            setAdsList(res.data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setAdsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'accounts' && user) fetchAllUsers();
        if (activeTab === 'reports' && user) fetchReports();
        if (activeTab === 'ads' && user) fetchAds();
    }, [activeTab, sortConfig, filterRole]);

    const resetAdForm = () => {
        setAdForm({ 
            title: '', description: '', type: 'dashboard_banner', 
            targetRoles: ['all'], actionType: 'whatsapp', actionUrl: '', 
            startDate: new Date().toISOString().split('T')[0], 
            endDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
            media: null,
            mediaPreview: null
        });
        setEditingAdId(null);
    };

    const handleOpenAdModal = (ad = null) => {
        if (ad) {
            setAdForm({
                title: ad.title, description: ad.description, type: ad.type || 'dashboard_banner',
                targetRoles: ad.targetRoles, actionType: ad.actionType, actionUrl: ad.actionUrl,
                startDate: new Date(ad.startDate).toISOString().split('T')[0],
                endDate: new Date(ad.endDate).toISOString().split('T')[0],
                media: null,
                mediaPreview: ad.mediaUrl || null
            });
            setEditingAdId(ad._id);
        } else {
            resetAdForm();
        }
        setShowAdModal(true);
    };

    const handleSaveAd = async (e) => {
        e.preventDefault();
        setAdsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('title', adForm.title);
            formData.append('description', adForm.description);
            formData.append('type', adForm.type);
            formData.append('actionType', adForm.actionType);
            formData.append('actionUrl', adForm.actionUrl);
            formData.append('startDate', adForm.startDate);
            formData.append('endDate', adForm.endDate);
            formData.append('targetRoles', JSON.stringify(adForm.targetRoles));
            if (adForm.media) formData.append('mediaUrl', adForm.media);

            if (editingAdId) {
                await axios.put(`${API_URL}/ads/${editingAdId}`, formData, config);
                setMessage({ type: 'success', text: 'Ad Campaign updated successfully!' });
            } else {
                await axios.post(`${API_URL}/ads`, formData, config);
                setMessage({ type: 'success', text: 'Ad Campaign launched successfully!' });
            }
            
            setShowAdModal(false);
            resetAdForm();
            fetchAds();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to broadcast ad.' });
        } finally {
            setAdsLoading(false);
        }
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this ad campaign?")) return;
        setAdsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/ads/${id}`, config);
            fetchAds();
        } catch (error) {
            console.error(error);
            alert("Failed to delete ad");
            setAdsLoading(false);
        }
    };

    const toggleAd = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${API_URL}/ads/${id}`, {}, config);
            fetchAds();
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id) => {
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/approve/${id}`, {}, config);
            setMessage({ type: 'success', text: 'User approved successfully!' });
            fetchData();
            if (activeTab === 'accounts') fetchAllUsers();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to approve user' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleDownloadBackup = async () => {
        try {
            setMessage({ type: 'success', text: 'Preparing backup download...' });
            const response = await axios.get(`${API_URL}/admin/backup`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `traceit-backup-${new Date().toISOString().slice(0,10)}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to download backup. Please check console.' });
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    if (loading && !stats) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground mb-2">Super Admin Control</h1>
                    <p className="text-neutral-500 font-medium">Platform overview, financial tracking, and account management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownloadBackup}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white border border-amber-600 rounded-2xl font-bold hover:bg-amber-600 transition-all text-sm shadow-md shadow-amber-500/20"
                    >
                        <Download className="w-4 h-4" />
                        Download Backup
                    </button>
                    <button 
                        onClick={() => activeTab === 'accounts' ? fetchAllUsers() : fetchData()}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl font-bold hover:bg-neutral-50 transition-all text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loading || usersLoading) ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-100 w-fit rounded-2xl">
                {[
                    { id: 'overview', label: 'Platform Overview', icon: Activity },
                    { id: 'accounts', label: 'All Accounts', icon: Users },
                    { id: 'approvals', label: `Pending Approvals (${pendingUsers.length})`, icon: Clock },
                    { id: 'reports', label: 'Device Reports', icon: ShieldAlert },
                    { id: 'ads', label: 'Broadcast Ad', icon: Megaphone },
                    { id: 'logs', label: 'Activity Logs', icon: SearchCode }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-foreground'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    {/* Primary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Total Accounts" value={stats?.totalUsers} trend={`${stats?.newAccountsToday} today`} color="blue" />
                        <StatCard icon={Smartphone} label="Registered Devices" value={stats?.totalDevices} trend={`${stats?.devicesToday} today`} color="indigo" />
                        <StatCard icon={Fingerprint} label="Verified Identity" value={stats?.verifiedAccounts} trend="NIN Verified" color="purple" />
                        <StatCard icon={CreditCard} label="Revenue Today" value={`₦${stats?.dailyRevenue.toLocaleString()}`} trend={`₦${stats?.weeklyRevenue.toLocaleString()} this week`} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Device Category Breakdown */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Device Distribution</h3>
                                <Activity className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                                {stats?.categoryBreakdown?.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-black text-foreground capitalize">{item.category}</p>
                                            <p className="text-xs font-bold text-neutral-400">{item.count} units</p>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full" 
                                                style={{ width: `${(item.count / stats.totalDevices) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) && (
                                    <p className="text-center text-neutral-400 font-medium py-10">No device data available</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Searches */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm lg:col-span-1">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Search Activity</h3>
                                <Search className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="divide-y divide-neutral-50 max-h-[350px] overflow-y-auto">
                                {recentSearches.map((log, i) => (
                                    <div key={i} className="p-5 hover:bg-neutral-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.found ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                <Search className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground truncate max-w-[120px]">Q: {log.query}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">By {log.user?.firstName || 'User'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.found ? 'FOUND' : 'MISSING'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transfers */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm lg:col-span-1">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Global Transfers</h3>
                                <ArrowLeftRight className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="divide-y divide-neutral-50 max-h-[350px] overflow-y-auto">
                                {recentTransfers.map((transfer, i) => (
                                    <div key={i} className="p-5 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                                                <Smartphone className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{transfer.device?.name || 'Device'}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">{transfer.initiator?.firstName || 'User'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${transfer.status === 'accepted' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {transfer.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'accounts' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground">All Registered Accounts</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Monitor and manage all user accounts on the platform.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <select 
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="basic">Basic Users</option>
                                        <option value="technician">Technicians</option>
                                        <option value="vendor">Vendors</option>
                                        <option value="substore">Sub-Stores</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('firstName')}>
                                            <div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('role')}>
                                            <div className="flex items-center gap-2">Role <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('createdAt')}>
                                            <div className="flex items-center gap-2">Joined <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {usersLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                                            </td>
                                        </tr>
                                    ) : allUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <p className="text-neutral-400 font-bold">No accounts match your criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        allUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-neutral-100 text-neutral-500 flex items-center justify-center rounded-full font-black text-xs">
                                                            {u.firstName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground text-sm">{u.firstName || 'User'} {u.lastName || ''}</p>
                                                            <p className="text-xs text-neutral-500 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        u.role === 'admin' ? 'bg-red-50 text-red-600' :
                                                        u.role === 'vendor' ? 'bg-blue-50 text-blue-600' :
                                                        u.role === 'technician' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-neutral-50 text-neutral-600'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-medium text-neutral-600">
                                                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        {u.isApproved ? (
                                                            <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase"><CheckCircle className="w-3 h-3" /> Approved</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> Pending</span>
                                                        )}
                                                        {u.ninVerified && (
                                                            <span className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase"><Fingerprint className="w-3 h-3" /> Verified</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="text-neutral-400 hover:text-primary font-bold text-xs transition-colors">Details</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Awaiting Validation</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">NIN and Payment verified accounts requiring approval.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">User Details</th>
                                        <th className="px-8 py-4">NIN Information</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {pendingUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <ShieldCheck className="w-12 h-12 text-neutral-100 mb-4" />
                                                    <p className="text-neutral-400 font-bold">No accounts pending approval at this time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-full font-black">
                                                            {u.firstName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{u.firstName || 'User'} {u.lastName || ''}</p>
                                                            <p className="text-xs text-neutral-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-primary font-mono font-bold">
                                                        <Fingerprint className="w-4 h-4" />
                                                        <span>{u.nin || 'UNAVAILABLE'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 italic">
                                                        Pending Admin
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        disabled={processLoading === u._id}
                                                        onClick={() => handleApprove(u._id)}
                                                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                                    >
                                                        {processLoading === u._id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Approve Access'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 text-center py-20">
                         <SearchCode className="w-16 h-16 text-neutral-100 mx-auto mb-4" />
                         <h2 className="text-2xl font-black text-foreground">Advanced Logs</h2>
                         <p className="text-neutral-500 font-medium">Comprehensive platform auditing and historical data coming soon.</p>
                         <button onClick={() => setActiveTab('overview')} className="mt-6 text-primary font-bold hover:underline">Back to Overview</button>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Device Discrepancy Reports</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Review flagged devices reported by users during searches.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Reporter</th>
                                        <th className="px-8 py-4">Device</th>
                                        <th className="px-8 py-4">Details</th>
                                        <th className="px-8 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {reportsLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : reports.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><p className="text-neutral-400 font-bold">No device reports submitted.</p></td></tr>
                                    ) : reports.map(r => (
                                        <tr key={r._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-foreground text-sm">{r.reporter?.firstName} {r.reporter?.lastName}</p>
                                                <p className="text-xs text-neutral-500">{r.reporter?.phoneNumber || r.reporter?.email}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-foreground text-sm">{r.device?.name || 'Unknown Device'}</p>
                                                <p className="text-xs font-mono text-neutral-500">{r.device?.serialNumber}</p>
                                            </td>
                                            <td className="px-8 py-5 max-w-sm">
                                                <p className="text-xs font-bold text-foreground"><span className="text-neutral-400 uppercase tracking-widest text-[10px]">LOC:</span> {r.address}</p>
                                                <p className="text-xs text-neutral-600 mt-1 line-clamp-2"><span className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">DESC:</span> {r.sellerDescription}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ads' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Global Ad Campaigns</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Manage scheduled ads, popups, and banners across the platform.</p>
                            </div>
                            <button 
                                onClick={() => handleOpenAdModal()}
                                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 shrink-0"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create Campaign
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Campaign</th>
                                        <th className="px-8 py-4">Type & Targeting</th>
                                        <th className="px-8 py-4">Duration</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {adsLoading && adsList.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : adsList.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><p className="text-neutral-400 font-bold">No ad campaigns found.</p></td></tr>
                                    ) : adsList.map(ad => (
                                        <tr key={ad._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    {ad.mediaUrl ? (
                                                        <img src={ad.mediaUrl} alt="Ad media" className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm max-w-[200px] truncate">{ad.title}</p>
                                                        <p className="text-[10px] font-medium text-neutral-500 uppercase flex items-center gap-1 mt-0.5">
                                                            {ad.actionType === 'whatsapp' ? 'WhatsApp' : 'Website'} Link
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">
                                                    {(ad.type || 'dashboard_banner').replace('_', ' ')}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {ad.targetRoles.map((r, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[9px] font-black uppercase">{r}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 min-w-[120px]">
                                                <p className="text-xs font-bold text-neutral-700">{new Date(ad.startDate).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-neutral-400 font-bold mt-0.5">to {new Date(ad.endDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <button 
                                                    onClick={() => toggleAd(ad._id)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                        ad.isActive ? 'bg-green-50 text-green-600 border-green-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                                                    }`}
                                                >
                                                    {ad.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Start)'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5 text-right whitespace-nowrap">
                                                <button onClick={() => handleOpenAdModal(ad)} className="p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg inline-flex mr-1">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteAd(ad._id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg inline-flex">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {showAdModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        {/* Left Side: Media Upload Preview */}
                        <div className="md:w-5/12 bg-neutral-50/50 border-r border-neutral-100 p-8 flex flex-col relative overflow-y-auto hidden md:flex">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-foreground">Media Assets</h3>
                                <p className="text-xs font-medium text-neutral-500 mt-1 pb-4 border-b border-neutral-200/60">Upload the visual component for banners or popups.</p>
                            </div>

                            <label className="flex-1 min-h-[250px] border-2 border-dashed border-neutral-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-center p-6 relative overflow-hidden group">
                                {adForm.mediaPreview ? (
                                    <img src={adForm.mediaPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center text-neutral-400 group-hover:text-primary transition-colors">
                                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-neutral-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Click to Upload Media</span>
                                        <span className="text-[10px] font-semibold opacity-60 mt-1 uppercase tracking-wider">PNG, JPG (Max 10MB)</span>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    className="hidden" 
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setAdForm({...adForm, media: file, mediaPreview: URL.createObjectURL(file)});
                                        }
                                    }} 
                                />
                                {adForm.mediaPreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg">Change Media</span>
                                    </div>
                                )}
                            </label>

                            {adForm.type === 'text_slider' && (
                                <div className="absolute inset-0 bg-neutral-100/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center pt-20">
                                    <div className="w-20 h-20 bg-white shadow-sm text-neutral-400 rounded-full flex items-center justify-center mb-4">
                                        <Megaphone className="w-10 h-10" />
                                    </div>
                                    <p className="font-black text-lg text-foreground">Media Disabled</p>
                                    <p className="text-xs font-medium text-neutral-500 mt-2 max-w-[200px]">Text Sliders are pure text broadcasts running across the top bar.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Form Configuration */}
                        <div className="md:w-7/12 p-8 md:p-10 flex flex-col bg-white overflow-y-auto relative">
                            <button onClick={() => setShowAdModal(false)} className="absolute top-8 right-8 p-2 bg-neutral-50 border border-neutral-100 text-neutral-400 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all z-10">
                                <XCircle className="w-5 h-5" />
                            </button>
                            
                            <div className="mb-8 pr-12">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">{editingAdId ? 'Edit Campaign' : 'Launch Campaign'}</h3>
                                <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest">Configure details, targeting & links</p>
                            </div>

                            <form onSubmit={handleSaveAd} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Campaign Type</label>
                                            <div className="relative">
                                                <select value={adForm.type} onChange={e => setAdForm({...adForm, type: e.target.value})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="dashboard_banner">Dashboard Banner (Carousel)</option>
                                                    <option value="text_slider">Top Notice Bar (Text Marquee)</option>
                                                    <option value="popup_modal">Session Popup Modal (Center)</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Target Audience</label>
                                            <div className="relative">
                                                <select value={adForm.targetRoles[0] || 'all'} onChange={e => setAdForm({...adForm, targetRoles: [e.target.value]})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="all">Everyone (Global)</option>
                                                    <option value="basic">Basic Users</option>
                                                    <option value="technician">Technicians</option>
                                                    <option value="vendor">Vendors</option>
                                                    <option value="substore">Sub-Stores</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Campaign Headline</label>
                                        <input required type="text" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} placeholder="Main attractive title..." className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-neutral-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Sub-description</label>
                                        <textarea required rows={2} value={adForm.description} onChange={e => setAdForm({...adForm, description: e.target.value})} placeholder="Catchy details..." className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-medium text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none placeholder:text-neutral-300" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Action Type</label>
                                            <div className="relative">
                                                <select value={adForm.actionType} onChange={e => setAdForm({...adForm, actionType: e.target.value})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="whatsapp">WhatsApp Directed</option>
                                                    <option value="website">External Link</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Action URL</label>
                                            <input required type="url" value={adForm.actionUrl} onChange={e => setAdForm({...adForm, actionUrl: e.target.value})} placeholder={adForm.actionType === 'whatsapp' ? 'https://wa.me/...' : 'https://...'} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Schedule Start Date</label>
                                            <input required type="date" value={adForm.startDate} onChange={e => setAdForm({...adForm, startDate: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm text-neutral-700 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Schedule End Date</label>
                                            <input required type="date" value={adForm.endDate} min={adForm.startDate} onChange={e => setAdForm({...adForm, endDate: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm text-neutral-700 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* Mobile Only: Simple Media Input (if screen is small) */}
                                    {adForm.type !== 'text_slider' && (
                                        <div className="md:hidden pt-4 border-t border-neutral-100">
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Media Upload (Banner/Popup)</label>
                                            <input type="file" accept="image/*,video/*" onChange={e => setAdForm({...adForm, media: e.target.files[0]})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-black file:bg-primary/10 file:text-primary" />
                                        </div>
                                    )}
                                </div>

                                <button 
                                    disabled={adsLoading}
                                    type="submit"
                                    className="w-full mt-8 bg-neutral-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50 text-[15px] hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    {adsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingAdId ? 'Update Campaign Details' : 'Launch New Campaign'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600'
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm relative overflow-hidden group">
            <div className={`w-14 h-14 ${colors[color]} flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-foreground mb-2">{value}</p>
            <p className="text-xs font-bold text-neutral-400">{trend}</p>
        </div>
    );
}
