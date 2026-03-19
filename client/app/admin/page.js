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
    Download
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
    const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, accounts, logs
    
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

    useEffect(() => {
        if (activeTab === 'accounts' && user) {
            fetchAllUsers();
        }
    }, [activeTab, sortConfig, filterRole]);

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
