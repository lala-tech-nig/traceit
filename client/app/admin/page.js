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
    Trash,
    BarChart2,
    Globe,
    MousePointerClick,
    Timer,
    LayoutDashboard,
    Radio,
    ChevronLeft,
    Mail,
    Send,
    Users2,
    UserCheck,
    UserX,
    AlertTriangle,
    CheckCheck,
    Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [processLoading, setProcessLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [backupLoading, setBackupLoading] = useState(false);
    const [showBackupDropdown, setShowBackupDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, accounts, logs, reports, ads, verificators
    const [verificators, setVerificators] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [verifLoading, setVerifLoading] = useState(false);

    // Withdrawals
    const [withdrawals, setWithdrawals] = useState([]);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
    
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
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsMonth, setAnalyticsMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [analyticsIPSort, setAnalyticsIPSort] = useState('visits'); // 'visits' | 'lastSeen'

    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // ── Email Centre State ─────────────────────────────────────────────────────
    const [emailTarget, setEmailTarget]           = useState('pending');
    const [emailMsgType, setEmailMsgType]         = useState('activation');
    const [emailSubject, setEmailSubject]         = useState('');
    const [emailBody, setEmailBody]               = useState('');
    const [emailSending, setEmailSending]         = useState(false);
    const [emailResults, setEmailResults]         = useState(null);
    const [emailPreview, setEmailPreview]         = useState(false);

    const handleViewUserDetails = async (id) => {
        setUserDetailsLoading(true);
        setShowUserModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/admin/users/${id}`, config);
            setSelectedUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            setMessage({ type: 'error', text: 'Failed to load user info.' });
            setShowUserModal(false);
        } finally {
            setUserDetailsLoading(false);
        }
    };

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
        setIsSearching(false);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                params: { 
                    sort: `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`,
                    role: filterRole,
                    isVerified: filterStatus === 'verified' ? true : filterStatus === 'not_verified' ? false : undefined
                }
            };
            const res = await axios.get(`${API_URL}/admin/users`, config);
            setAllUsers(res.data);
            setSearchQuery('');
        } catch (error) {
            console.error("Failed to fetch all users", error);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleSearchUsers = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            fetchAllUsers();
            return;
        }
        setUsersLoading(true);
        setIsSearching(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                params: { query: searchQuery }
            };
            const res = await axios.get(`${API_URL}/admin/users/search`, config);
            setAllUsers(res.data);
        } catch (error) {
            console.error("Search failed", error);
            setMessage({ type: 'error', text: 'Search failed.' });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleDownloadBackup = async (type = 'both') => {
        setBackupLoading(true);
        setShowBackupDropdown(false);
        try {
            const response = await fetch(`${API_URL}/admin/backup?type=${type}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error('Backup failed');
            
            // Get filename from header if possible, else generate one
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `traceit-${type}-backup-${new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19)}.zip`;
            
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const match = contentDisposition.match(/filename="?([^";]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: `${type.toUpperCase()} Backup started!` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Backup failed: ' + (error.message || 'Unknown error') });
        } finally {
            setBackupLoading(false);
        }
    };

    const handleToggleSuspension = async (userId, isCurrentlySuspended) => {
        const action = isCurrentlySuspended ? 'restore' : 'restrict';
        const reason = !isCurrentlySuspended ? window.prompt("Enter reason for restriction (optional):", "Policy violation") : "";
        
        if (!isCurrentlySuspended && reason === null) return; // Cancelled

        setProcessLoading(userId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/admin/users/${userId}/suspend`, {
                isSuspended: !isCurrentlySuspended,
                suspensionReason: reason
            }, config);
            
            setMessage({ type: 'success', text: `User account ${action}ed successfully!` });
            
            // Refresh current view
            if (isSearching) {
                handleSearchUsers();
            } else {
                fetchAllUsers();
            }
            
            // Update selected user if modal is open
            if (selectedUser && selectedUser.user?._id === userId) {
                handleViewUserDetails(userId);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || `Failed to ${action} user` });
        } finally {
            setProcessLoading(null);
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

    const fetchVerificators = async () => {
        setVerifLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [vRes, jobsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/verificators`, config),
                axios.get(`${API_URL}/admin/verificators/jobs`, config)
            ]);
            setVerificators(vRes.data);
            setVerifications(jobsRes.data);
        } catch (error) {
            console.error("Failed to fetch verificators", error);
        } finally {
            setVerifLoading(false);
        }
    };

    const handleManageVerificator = async (id, status) => {
        if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/verificators/${id}/status`, { status }, config);
            setMessage({ type: 'success', text: `Verificator status updated to ${status}!` });
            fetchVerificators();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update user' });
        } finally {
            setProcessLoading(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'accounts' && user) fetchAllUsers();
        if (activeTab === 'reports' && user) fetchReports();
        if (activeTab === 'ads' && user) fetchAds();
        if (activeTab === 'analytics' && user) fetchAnalytics();
        if (activeTab === 'verificators' && user) fetchVerificators();
        if (activeTab === 'withdrawals' && user) fetchWithdrawals();
    }, [activeTab, sortConfig, filterRole, filterStatus]);

    const fetchWithdrawals = async () => {
        setWithdrawalsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/admin/withdrawals`, config);
            setWithdrawals(res.data);
        } catch (error) {
            console.error("Failed to fetch withdrawals", error);
        } finally {
            setWithdrawalsLoading(false);
        }
    };

    const handleProcessWithdrawal = async (id, status) => {
        const note = status === 'rejected' ? window.prompt("Enter reason for rejection (optional):") : '';
        if (status === 'rejected' && note === null) return; // cancelled

        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/withdrawals/${id}`, { status, adminNote: note }, config);
            setMessage({ type: 'success', text: `Withdrawal request ${status} successfully!` });
            fetchWithdrawals();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process withdrawal' });
        } finally {
            setProcessLoading(null);
        }
    };

    const fetchAnalytics = async (month, sortBy) => {
        setAnalyticsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { month: month || analyticsMonth, sortBy: sortBy || analyticsIPSort }
            };
            const res = await axios.get(`${API_URL}/analytics/admin`, config);
            setAnalyticsData(res.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

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



    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    // ── Email Centre ───────────────────────────────────────────────────────────
    const handleSendBulkEmail = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Send "${emailMsgType}" email to all "${emailTarget}" users? This cannot be undone.`)) return;
        setEmailSending(true);
        setEmailResults(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                target: emailTarget,
                messageType: emailMsgType,
                ...(emailMsgType === 'custom' ? { customSubject: emailSubject, customBody: emailBody } : {})
            };
            const res = await axios.post(`${API_URL}/admin/email/send`, payload, config);
            setEmailResults(res.data);
            setMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Email send failed' });
            setEmailResults(null);
        } finally {
            setEmailSending(false);
        }
    };

    if (loading && !stats) {
        return <div className="flex items-center justify-center min-h-screen bg-neutral-50"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    const navItems = [
        { id: 'overview',   label: 'Platform Overview',     icon: LayoutDashboard },
        { id: 'accounts',   label: 'All Accounts',          icon: Users },
        { id: 'approvals',  label: `Approvals (${pendingUsers.length})`, icon: Clock },
        { id: 'reports',    label: 'Device Reports',        icon: ShieldAlert },
        { id: 'verificators',label: 'Field Agents / Verificators', icon: CheckCircle },
        { id: 'withdrawals',label: 'Withdrawal Requests',   icon: ArrowLeftRight },
        { id: 'ads',        label: 'Broadcast Ads',         icon: Radio },
        { id: 'email',      label: 'Email Centre',          icon: Mail },
        { id: 'logs',       label: 'Activity Logs',         icon: SearchCode },
        { id: 'analytics',  label: 'Platform Analytics',    icon: BarChart2 },
    ];

    return (
        <div className="flex min-h-screen bg-neutral-100 font-[family-name:var(--font-geist-sans)]">

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className="w-64 shrink-0 bg-[#0f0f11] text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
                {/* Logo */}
                <div className="px-7 pt-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="TraceIt Logo" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-black tracking-tight">Trace<span className="text-primary">It</span> <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Admin</span></span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-6 space-y-0.5">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                activeTab === item.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon className="w-4.5 h-4.5 shrink-0" style={{width:'1.1rem',height:'1.1rem'}} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 pb-6 border-t border-white/10 pt-4 space-y-1">
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
                        <ChevronLeft className="w-4 h-4" /> Back to Platform
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-sm">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/70 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-foreground">{navItems.find(n=>n.id===activeTab)?.label || 'Super Admin'}</h1>
                        <p className="text-xs font-medium text-neutral-400 mt-0.5">TraceIt Super Admin Control Panel</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {message.text && (
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${ message.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' }`}>{message.text}</span>
                        )}
                        <button 
                            onClick={handleDownloadBackup}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all text-xs shadow-md shadow-amber-500/20"
                        >
                            <Download className="w-3.5 h-3.5" /> Backup
                        </button>
                        <button 
                            onClick={() => activeTab === 'accounts' ? fetchAllUsers() : activeTab === 'analytics' ? fetchAnalytics() : activeTab === 'verificators' ? fetchVerificators() : activeTab === 'withdrawals' ? fetchWithdrawals() : fetchData()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-all text-xs"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading||usersLoading||analyticsLoading||verifLoading||withdrawalsLoading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Pane */}
                <main className="flex-1 overflow-y-auto p-8 space-y-8">

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
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <form onSubmit={handleSearchUsers} className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search email, name..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                                    />
                                    {isSearching && (
                                        <button 
                                            type="button"
                                            onClick={fetchAllUsers}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </form>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="verified">Verified</option>
                                        <option value="not_verified">Not Verified</option>
                                    </select>
                                </div>
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
                                <div className="relative">
                                    <button
                                        onClick={() => setShowBackupDropdown(!showBackupDropdown)}
                                        disabled={backupLoading}
                                        title="Download database or image backup"
                                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-md disabled:opacity-50"
                                    >
                                        {backupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        {backupLoading ? 'Backing up...' : 'Backup System'}
                                    </button>

                                    {showBackupDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => handleDownloadBackup('mongodb')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-50 flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <BarChart2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Database Only</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">MongoDB Collections</p>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadBackup('cloudinary')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-50 flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Images Only</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">Cloudinary Gallery</p>
                                                </div>
                                            </button>
                                            <div className="my-1 border-t border-neutral-100"></div>
                                            <button 
                                                onClick={() => handleDownloadBackup('both')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-100 flex items-center gap-3 bg-neutral-50/50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Full Backup</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">Database + Images</p>
                                                </div>
                                            </button>
                                        </div>
                                    )}
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
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('amountPaid')}>
                                            <div className="flex items-center gap-2">Total Paid <ArrowUpDown className="w-3 h-3" /></div>
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
                                        allUsers.map((u, i) => (
                                            <tr key={u._id || `user-${i}`} className="hover:bg-neutral-50/50 transition-colors group">
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
                                                <td className="px-8 py-5 text-sm font-bold text-foreground">
                                                    ₦{(u.amountPaid || 0).toLocaleString()}
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
                                                       {u.isSuspended && (
                                                            <span className="flex items-center gap-1 text-red-600 text-[10px] font-black uppercase"><ShieldAlert className="w-3 h-3" /> Restricted</span>
                                                       )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleViewUserDetails(u._id)}
                                                        className="text-neutral-400 hover:text-primary font-bold text-xs transition-colors"
                                                    >
                                                        Details
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

            {activeTab === 'verificators' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Field Agents & Applications</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Manage user applications to become field verificators.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Focus Area</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {verifLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : verificators.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-10 text-center text-neutral-400 font-bold">No verificator applications found.</td></tr>
                                    ) : (
                                        verificators.map(v => (
                                            <tr key={v._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{v.firstName} {v.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{v.email}</p>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-neutral-600">{v.verificatorAreaOfFocus || 'N/A'}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.verificatorStatus === 'approved' ? 'bg-green-50 text-green-700' : v.verificatorStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{v.verificatorStatus}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                    {v.verificatorStatus === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleManageVerificator(v._id, 'approved')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Approve</button>
                                                            <button onClick={() => handleManageVerificator(v._id, 'rejected')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                                                        </>
                                                    )}
                                                    {v.verificatorStatus === 'approved' && (
                                                        <button onClick={() => handleManageVerificator(v._id, 'suspended')} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Suspend</button>
                                                    )}
                                                    {['suspended', 'rejected'].includes(v.verificatorStatus) && (
                                                        <button onClick={() => handleManageVerificator(v._id, 'approved')} className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Re-Approve</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Verification Jobs History</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Monitor all physical address verification jobs assigned to field agents.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">Target User</th>
                                        <th className="px-8 py-4">Assigned Agent</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {verifLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : verifications.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-10 text-center text-neutral-400 font-bold">No verification jobs found.</td></tr>
                                    ) : (
                                        verifications.map(job => (
                                            <tr key={job._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{job.targetUser?.firstName} {job.targetUser?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{job.targetUser?.homeAddress || 'No Address'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{job.verificator?.firstName} {job.verificator?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{job.verificator?.email}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'verified' ? 'bg-green-50 text-green-700' : ['declined_user', 'declined_job'].includes(job.status) ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{job.status.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-medium text-sm text-neutral-500">
                                                    {new Date(job.assignedAt).toLocaleDateString()}
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

            {activeTab === 'withdrawals' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Withdrawal Requests</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Review and process user earning withdrawal requests.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4">Bank Details</th>
                                        <th className="px-8 py-4">Date & Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {withdrawalsLoading ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : withdrawals.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center text-neutral-400 font-bold">No withdrawal requests found.</td></tr>
                                    ) : (
                                        withdrawals.map(req => (
                                            <tr key={req._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground text-sm">{req.user?.firstName} {req.user?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{req.user?.email}</p>
                                                    <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-0.5">{req.user?.phoneNumber}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-foreground text-lg">₦{req.amount?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-foreground">{req.bankName}</p>
                                                    <p className="text-xs font-mono text-neutral-600 mt-0.5">{req.accountNumber}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{req.accountName}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs font-medium text-neutral-600 mb-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        req.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                        req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                    {req.adminNote && (
                                                        <p className="text-[10px] font-medium text-neutral-400 mt-2 max-w-[150px] truncate" title={req.adminNote}>
                                                            Note: {req.adminNote}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-right whitespace-nowrap">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                disabled={processLoading === req._id}
                                                                onClick={() => handleProcessWithdrawal(req._id, 'approved')}
                                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {processLoading === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                                                            </button>
                                                            <button 
                                                                disabled={processLoading === req._id}
                                                                onClick={() => handleProcessWithdrawal(req._id, 'rejected')}
                                                                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-neutral-300">Processed</span>
                                                    )}
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
                    {activeTab === 'analytics' && (
                        <div className="animate-in fade-in duration-500 space-y-6">

                            {/* Filter Bar */}
                            <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-4 flex flex-wrap items-center gap-4 shadow-sm">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Month</label>
                                    <input
                                        type="month"
                                        value={analyticsMonth}
                                        onChange={e => {
                                            setAnalyticsMonth(e.target.value);
                                            fetchAnalytics(e.target.value, analyticsIPSort);
                                        }}
                                        className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Sort IPs By</label>
                                    <div className="flex rounded-xl overflow-hidden border border-neutral-200 text-xs font-black">
                                        {[['visits','Total Visits'],['lastSeen','Last Seen']].map(([val, label]) => (
                                            <button
                                                key={val}
                                                onClick={() => { setAnalyticsIPSort(val); fetchAnalytics(analyticsMonth, val); }}
                                                className={`px-4 py-2 transition-all ${analyticsIPSort === val ? 'bg-primary text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
                                            >{label}</button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => fetchAnalytics(analyticsMonth, analyticsIPSort)}
                                    className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                                    Reload Data
                                </button>
                            </div>

                            {analyticsLoading ? (
                                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                            ) : !analyticsData ? (
                                <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200">
                                    <BarChart2 className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="font-bold text-neutral-500">No analytics data yet. Users must visit the platform first.</p>
                                    <button onClick={() => fetchAnalytics(analyticsMonth, analyticsIPSort)} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">Load Analytics</button>
                                </div>
                            ) : (
                                <>
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                        <StatCard icon={Activity}  label="Active Now"      value={analyticsData.activeNow}     trend="in the last 5 min"   color="green"  />
                                        <StatCard icon={Globe}     label="This Month"      value={analyticsData.monthSessions} trend={analyticsMonth}       color="blue"   />
                                        <StatCard icon={Users}     label="Unique IPs (Month)" value={analyticsData.uniqueIPsMonth} trend={`${analyticsData.uniqueIPsAll} all time`} color="indigo" />
                                        <StatCard icon={Timer}     label="Avg. Session"    value={`${Math.floor(analyticsData.avgTimeSpent/60)}m ${analyticsData.avgTimeSpent%60}s`} trend="per visit" color="purple" />
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Daily Activity Chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Sessions — Last 7 Days</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Daily visitor count</p>
                                            <div className="flex items-end gap-2 h-36">
                                                {analyticsData.dailyActivity.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data yet</p>
                                                ) : analyticsData.dailyActivity.map((d, i) => {
                                                    const max = Math.max(...analyticsData.dailyActivity.map(x => x.sessions), 1);
                                                    const pct = Math.max((d.sessions / max) * 100, 4);
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                            <span className="hidden group-hover:block text-[9px] font-black text-primary">{d.sessions}</span>
                                                            <div title={`${d.sessions} sessions`} className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary/80" style={{ height: `${pct}%`, minHeight: '6px', maxHeight: '130px' }} />
                                                            <span className="text-[9px] text-neutral-400 font-bold">{d._id?.slice(5)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Monthly Breakdown Chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Monthly Sessions</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Last 12 months comparison</p>
                                            <div className="flex items-end gap-2 h-36">
                                                {analyticsData.monthlyBreakdown.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data yet</p>
                                                ) : [...analyticsData.monthlyBreakdown].reverse().map((m, i) => {
                                                    const max = Math.max(...analyticsData.monthlyBreakdown.map(x => x.sessions), 1);
                                                    const pct = Math.max((m.sessions / max) * 100, 4);
                                                    const isSelected = m._id === analyticsMonth;
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => { setAnalyticsMonth(m._id); fetchAnalytics(m._id, analyticsIPSort); }}>
                                                            <span className="hidden group-hover:block text-[9px] font-black text-indigo-500">{m.sessions}</span>
                                                            <div title={`${m.sessions} sessions in ${m._id}`} className={`w-full rounded-t-lg transition-all duration-500 ${isSelected ? 'bg-primary' : 'bg-indigo-300 hover:bg-indigo-500'}`} style={{ height: `${pct}%`, minHeight: '6px', maxHeight: '130px' }} />
                                                            <span className={`text-[9px] font-bold ${isSelected ? 'text-primary' : 'text-neutral-400'}`}>{m._id?.slice(5)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Top Pages */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-neutral-300" /> Most Visited Pages</h3>
                                            <div className="space-y-3">
                                                {analyticsData.topPages.map((p, i) => {
                                                    const max = Math.max(...analyticsData.topPages.map(x => x.count), 1);
                                                    return (
                                                        <div key={i}>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{p._id}</span>
                                                                <span className="text-xs font-black text-neutral-400">{p.count}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {analyticsData.topPages.length === 0 && <p className="text-neutral-400 text-sm font-medium">No page data yet.</p>}
                                            </div>
                                        </div>

                                        {/* Top Clicks */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-neutral-300" /> Top Button Clicks</h3>
                                            <div className="space-y-3">
                                                {analyticsData.topEvents.map((ev, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{ev._id || 'unknown'}</span>
                                                        <span className="text-xs font-black px-2 py-0.5 bg-primary/10 text-primary rounded-lg shrink-0">{ev.count}×</span>
                                                    </div>
                                                ))}
                                                {analyticsData.topEvents.length === 0 && <p className="text-neutral-400 text-sm font-medium">No click data yet.</p>}
                                            </div>
                                        </div>

                                        {/* Hourly activity small chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Last 24 Hours</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Hourly sessions</p>
                                            <div className="flex items-end gap-0.5 h-28">
                                                {analyticsData.hourlyActivity.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data</p>
                                                ) : analyticsData.hourlyActivity.map((h, i) => {
                                                    const max = Math.max(...analyticsData.hourlyActivity.map(x => x.sessions), 1);
                                                    const pct = Math.max((h.sessions / max) * 100, 4);
                                                    return (
                                                        <div key={i} className="flex-1 group" title={`${h.sessions} at ${h._id?.slice(11)}`}>
                                                            <div className="w-full bg-indigo-400 rounded-t-sm hover:bg-indigo-600 transition-all" style={{ height: `${pct}%`, minHeight: '3px', maxHeight: '108px' }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* IP Address Table — sortable, with monthly visit count & user identity */}
                                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                                        <div className="p-7 border-b border-neutral-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base font-black text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-neutral-300" /> IP Address Report</h3>
                                                <p className="text-xs text-neutral-400 font-medium mt-1">All visitors — sortable by frequency or recency. Click column headers to re-sort.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setAnalyticsIPSort('visits'); fetchAnalytics(analyticsMonth, 'visits'); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${analyticsIPSort === 'visits' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                                    By Visits
                                                </button>
                                                <button onClick={() => { setAnalyticsIPSort('lastSeen'); fetchAnalytics(analyticsMonth, 'lastSeen'); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${analyticsIPSort === 'lastSeen' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                                    By Recent
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                        <th className="px-7 py-3">#</th>
                                                        <th className="px-7 py-3">IP Address</th>
                                                        <th className="px-7 py-3">Associated User</th>
                                                        <th className="px-7 py-3 cursor-pointer hover:text-primary" onClick={() => { setAnalyticsIPSort('visits'); fetchAnalytics(analyticsMonth, 'visits'); }}>Total Visits ↕</th>
                                                        <th className="px-7 py-3">This Month</th>
                                                        <th className="px-7 py-3">First Seen</th>
                                                        <th className="px-7 py-3 cursor-pointer hover:text-primary" onClick={() => { setAnalyticsIPSort('lastSeen'); fetchAnalytics(analyticsMonth, 'lastSeen'); }}>Last Active ↕</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {analyticsData.topIPs.length === 0 ? (
                                                        <tr><td colSpan="7" className="px-7 py-16 text-center text-neutral-400 font-bold">No IP data recorded yet.</td></tr>
                                                    ) : analyticsData.topIPs.map((ip, i) => (
                                                        <tr key={`ip-${i}`} className="hover:bg-neutral-50/60 transition-colors">
                                                            <td className="px-7 py-4 text-xs font-black text-neutral-300">{i + 1}</td>
                                                            <td className="px-7 py-4 font-mono text-xs font-bold text-neutral-800">{ip._id || 'unknown'}</td>
                                                            <td className="px-7 py-4">
                                                                {ip.userId ? (
                                                                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">Logged In</span>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-neutral-400">Guest</span>
                                                                )}
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <span className="text-sm font-black text-foreground">{ip.totalVisits}</span>
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${ip.monthVisits > 0 ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'}`}>
                                                                    {ip.monthVisits}
                                                                </span>
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-400 font-medium">
                                                                {ip.firstSeen ? new Date(ip.firstSeen).toLocaleDateString() : '—'}
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-500 font-medium">
                                                                {ip.lastSeen ? new Date(ip.lastSeen).toLocaleString() : '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Recent Sessions Table */}
                                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                                        <div className="p-7 border-b border-neutral-100">
                                            <h3 className="text-base font-black text-foreground">Recent Sessions</h3>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">Individual visitor sessions for {analyticsMonth} — guests and logged-in users.</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                        <th className="px-7 py-3">IP Address</th>
                                                        <th className="px-7 py-3">User</th>
                                                        <th className="px-7 py-3">Pages Visited</th>
                                                        <th className="px-7 py-3">Time Spent</th>
                                                        <th className="px-7 py-3">Last Active</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {analyticsData.recentSessions.length === 0 ? (
                                                        <tr><td colSpan="5" className="px-7 py-16 text-center text-neutral-400 font-bold">No sessions recorded for this period.</td></tr>
                                                    ) : analyticsData.recentSessions.map((s) => (
                                                        <tr key={s.sessionId || s._id} className="hover:bg-neutral-50/50 transition-colors">
                                                            <td className="px-7 py-4 font-mono text-xs font-bold text-neutral-700">{s.ipAddress}</td>
                                                            <td className="px-7 py-4">
                                                                {s.userId ? (
                                                                    <div>
                                                                        <p className="text-xs font-bold text-foreground">{s.userId.firstName} {s.userId.lastName}</p>
                                                                        <p className="text-[10px] text-neutral-400 font-medium">{s.userId.role}</p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-neutral-400 italic">Guest</span>
                                                                )}
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                                    {s.pagesVisited.slice(0, 3).map((pg, j) => (
                                                                        <span key={`pg-${j}`} className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md truncate max-w-[120px]">{pg}</span>
                                                                    ))}
                                                                    {s.pagesVisited.length > 3 && <span key="overflow" className="text-[10px] font-bold text-primary">+{s.pagesVisited.length - 3}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-7 py-4 text-xs font-bold text-neutral-700">
                                                                {Math.floor(s.timeSpentSeconds / 60)}m {s.timeSpentSeconds % 60}s
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-400 font-medium">
                                                                {new Date(s.lastActive).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}


                {/* User Details Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> User Details
                                </h3>
                                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-foreground transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-neutral-50/50">
                                {userDetailsLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                                ) : selectedUser ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 bg-white p-6 rounded-[1.5rem] border border-neutral-200 shadow-sm">
                                            <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl font-black text-xl">
                                                {selectedUser.user?.firstName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg text-foreground">{selectedUser.user?.firstName} {selectedUser.user?.lastName}</h4>
                                                <p className="text-sm font-medium text-neutral-500">{selectedUser.user?.email}</p>
                                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">{selectedUser.user?.role}</p>
                                            </div>
                                        </div>

                                        {/* Header Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Total Paid</p>
                                                <p className="text-xl font-black text-primary">₦{(selectedUser.totalPaid || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Sub Days Left</p>
                                                <p className="text-xl font-black text-amber-500">{selectedUser.subscriptionDaysRemaining || 0}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Transfer Count</p>
                                                <p className="text-xl font-black text-indigo-500">{selectedUser.user?.transferCount || 0}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Verified</p>
                                                <div className="mt-1 flex justify-center">
                                                    {selectedUser.user?.ninVerified ? <CheckCircle className="w-6 h-6 text-green-500"/> : <XCircle className="w-6 h-6 text-red-500"/>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suspension Control Section */}
                                        <div className={`p-6 rounded-[1.5rem] border ${selectedUser.user?.isSuspended ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-200'} shadow-sm flex items-center justify-between`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedUser.user?.isSuspended ? 'bg-red-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                                    <ShieldAlert className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className={`font-black ${selectedUser.user?.isSuspended ? 'text-red-700' : 'text-foreground'}`}>
                                                        {selectedUser.user?.isSuspended ? 'Account Restricted' : 'Account Active'}
                                                    </h4>
                                                    <p className="text-xs font-medium text-neutral-500">
                                                        {selectedUser.user?.isSuspended 
                                                            ? `Reason: ${selectedUser.user?.suspensionReason || 'No reason provided'}` 
                                                            : 'Standard user access is currently active for this account.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                disabled={processLoading === selectedUser.user?._id || selectedUser.user?.role === 'admin'}
                                                onClick={() => handleToggleSuspension(selectedUser.user?._id, selectedUser.user?.isSuspended)}
                                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 ${
                                                    selectedUser.user?.isSuspended 
                                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20' 
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                                                }`}
                                            >
                                                {processLoading === selectedUser.user?._id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                ) : (
                                                    selectedUser.user?.isSuspended ? 'Restore Access' : 'Restrict Access'
                                                )}
                                            </button>
                                        </div>

                                        {/* Recent Payments Table */}
                                        <div className="bg-white rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm">
                                            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                                                <h4 className="text-sm font-black text-foreground">Payment History</h4>
                                                <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">{selectedUser.payments?.length || 0} Records</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                            <th className="px-6 py-4">Date</th>
                                                            <th className="px-6 py-4">Reference</th>
                                                            <th className="px-6 py-4">Amount</th>
                                                            <th className="px-6 py-4">Type</th>
                                                            <th className="px-6 py-4">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-50">
                                                        {(!selectedUser.payments || selectedUser.payments.length === 0) ? (
                                                            <tr><td colSpan="5" className="px-6 py-10 text-center text-neutral-400 font-bold text-xs">No payments found.</td></tr>
                                                        ) : selectedUser.payments.map((p, i) => (
                                                            <tr key={i} className="hover:bg-neutral-50/50">
                                                                <td className="px-6 py-4 text-xs font-medium text-neutral-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 text-xs font-mono font-bold text-neutral-800">{p.reference}</td>
                                                                <td className="px-6 py-4 text-xs font-black text-foreground">₦{(p.amount || 0).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-wider">{p.type}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${p.status === 'success' ? 'bg-green-50 text-green-600' : p.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center py-20 text-neutral-400 font-bold">User data missing.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                </main>
            </div>

            {/* ── Email Centre Tab ───────────────────────────────────── */}
            {activeTab === 'email' && (
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Mail className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground">Email Centre</h2>
                                <p className="text-sm font-medium text-neutral-500">Send targeted email campaigns to platform users instantly.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendBulkEmail} className="space-y-8">

                            {/* Step 1 — Target Audience */}
                            <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
                                    <h3 className="text-base font-black text-foreground">Select Target Audience</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'pending', label: 'Pending Users', desc: 'Registered, not yet approved', icon: UserX, color: 'amber' },
                                        { id: 'absent',  label: 'Inactive Users', desc: 'Not logged in for 2+ weeks',  icon: AlertTriangle, color: 'orange' },
                                        { id: 'active',  label: 'Active Users',  desc: 'All approved accounts',       icon: UserCheck, color: 'green' },
                                        { id: 'all',     label: 'All Users',     desc: 'Everyone on the platform',    icon: Users2, color: 'blue' },
                                    ].map(t => {
                                        const colorMap = { amber:'bg-amber-50 text-amber-600 border-amber-200', orange:'bg-orange-50 text-orange-600 border-orange-200', green:'bg-green-50 text-green-600 border-green-200', blue:'bg-blue-50 text-blue-600 border-blue-200' };
                                        const selectedMap = { amber:'border-amber-500 bg-amber-50', orange:'border-orange-500 bg-orange-50', green:'border-green-500 bg-green-50', blue:'border-blue-500 bg-blue-50' };
                                        const isSelected = emailTarget === t.id;
                                        return (
                                            <button type="button" key={t.id} onClick={() => setEmailTarget(t.id)}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${isSelected ? selectedMap[t.color] + ' shadow-md' : 'border-neutral-200 bg-neutral-50 hover:bg-white'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[t.color]}`}>
                                                    <t.icon className="w-5 h-5" />
                                                </div>
                                                <p className="font-black text-sm text-foreground">{t.label}</p>
                                                <p className="text-xs text-neutral-500 font-medium mt-1 leading-snug">{t.desc}</p>
                                                {isSelected && <div className="mt-3 flex items-center gap-1 text-xs font-black text-primary"><CheckCheck className="w-3.5 h-3.5" /> Selected</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2 — Message Type */}
                            <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                                    <h3 className="text-base font-black text-foreground">Choose Message Template</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'welcome',      label: '🎉 Welcome Email',          desc: 'Platform intro, features, earning tips' },
                                        { id: 'activation',   label: '⏳ Activation Reminder',     desc: 'Nudge pending users to complete setup' },
                                        { id: 'reengagement', label: '😔 Re-engagement Email',     desc: "We miss you — come back to TraceIt" },
                                        { id: 'custom',       label: '✍️ Custom Draft',            desc: 'Write your own subject and message' },
                                    ].map(m => {
                                        const isSelected = emailMsgType === m.id;
                                        return (
                                            <button type="button" key={m.id} onClick={() => setEmailMsgType(m.id)}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'}`}>
                                                <p className={`font-black text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
                                                <p className="text-xs text-neutral-500 font-medium mt-1">{m.desc}</p>
                                                {isSelected && <div className="mt-2 flex items-center gap-1 text-xs font-black text-primary"><CheckCheck className="w-3.5 h-3.5" /> Selected</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 3 — Custom Draft (conditional) */}
                            {emailMsgType === 'custom' && (
                                <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
                                        <h3 className="text-base font-black text-foreground">Draft Your Message</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Email Subject Line</label>
                                            <input type="text" required value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                                                placeholder="e.g. Important update regarding your TraceIt account..."
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all bg-neutral-50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Message Body <span className="text-neutral-400 normal-case font-medium">(HTML supported)</span></label>
                                            <textarea required rows={10} value={emailBody} onChange={e => setEmailBody(e.target.value)}
                                                placeholder="Write your message here. You can use <strong>, <br/>, <a href=...>, <ul><li>... etc."
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all bg-neutral-50 resize-none font-mono" />
                                            <p className="text-xs text-neutral-400 font-medium mt-2">💡 Tip: The recipient's first name ({'{firstName}'}) is automatically added as a greeting above your message.</p>
                                        </div>

                                        {/* Live Preview */}
                                        {emailBody && (
                                            <div>
                                                <button type="button" onClick={() => setEmailPreview(!emailPreview)}
                                                    className="flex items-center gap-2 text-xs font-black text-primary hover:text-primary-dark transition-colors">
                                                    <Eye className="w-3.5 h-3.5" /> {emailPreview ? 'Hide Preview' : 'Show Preview'}
                                                </button>
                                                {emailPreview && (
                                                    <div className="mt-3 border border-neutral-200 rounded-xl overflow-hidden">
                                                        <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full bg-red-400" />
                                                            <span className="w-3 h-3 rounded-full bg-amber-400" />
                                                            <span className="w-3 h-3 rounded-full bg-green-400" />
                                                            <span className="text-xs text-neutral-500 font-medium ml-2">Message Preview</span>
                                                        </div>
                                                        <div className="bg-[#111827] p-6 text-[#cbd5e1] text-sm leading-relaxed min-h-[100px]"
                                                            dangerouslySetInnerHTML={{ __html: `<strong style="color:#f1f5f9">Hi [First Name],</strong><br/><br/>${emailBody}` }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Send Button */}
                            <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm">
                                <div>
                                    <p className="font-black text-foreground text-sm">Ready to send?</p>
                                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                        Sending <span className="font-black text-primary capitalize">{emailMsgType}</span> email to <span className="font-black text-primary capitalize">{emailTarget}</span> users.
                                    </p>
                                </div>
                                <button type="submit" disabled={emailSending}
                                    className="flex items-center gap-2.5 px-8 py-3.5 bg-primary text-white rounded-xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {emailSending
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                        : <><Send className="w-4 h-4" /> Send Emails</>
                                    }
                                </button>
                            </div>
                        </form>

                        {/* Results Panel */}
                        {emailResults && (
                            <div className="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                                    <h3 className="font-black text-foreground">Campaign Results</h3>
                                    <button onClick={() => setEmailResults(null)} className="text-neutral-400 hover:text-red-500 transition-colors text-xs font-bold">✕ Clear</button>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100">
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-black text-foreground">{emailResults.total}</p>
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-1">Total</p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-black text-green-600">{emailResults.sent}</p>
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-1">Sent ✓</p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-black text-red-500">{emailResults.failed}</p>
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-1">Failed ✗</p>
                                    </div>
                                </div>

                                {/* Per-user breakdown */}
                                <div className="max-h-96 overflow-y-auto divide-y divide-neutral-50">
                                    {emailResults.results?.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{r.name}</p>
                                                <p className="text-xs text-neutral-500 font-medium">{r.email}</p>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${r.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                {r.status === 'sent' ? '✓ sent' : `✗ ${r.error || 'failed'}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
