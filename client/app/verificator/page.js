"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    MapPin, ClipboardList, CheckCircle2, XCircle, UserX, LogOut,
    ChevronRight, Loader2, Target, TrendingUp, Users, UserCheck, Clock,
    AlertTriangle, RefreshCw, Home
} from 'lucide-react';

export default function VerificatorDashboard() {
    const { user, logout, API_URL } = useAuth();
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [introductions, setIntroductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [areaOfFocus, setAreaOfFocus] = useState('');
    const [areaLoading, setAreaLoading] = useState(false);
    const [areaMsg, setAreaMsg] = useState('');
    const [activeTab, setActiveTab] = useState('jobs'); // jobs | stats | intros

    // Per-job action state
    const [actionJob, setActionJob] = useState(null); // { job, action: 'verify'|'decline-user'|'decline-job' }
    const [actionComment, setActionComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

    const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        if (user.role !== 'verificator' && user.role !== 'admin') {
            router.push('/dashboard'); return;
        }
        setAreaOfFocus(user.verificatorAreaOfFocus || '');
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };
            const [jobsRes, statsRes, introsRes] = await Promise.all([
                axios.get(`${API_URL}/verificator/jobs`, cfg),
                axios.get(`${API_URL}/verificator/stats`, cfg),
                axios.get(`${API_URL}/verificator/my-introductions`, cfg)
            ]);
            setJobs(jobsRes.data);
            setStats(statsRes.data);
            setIntroductions(introsRes.data);
        } catch (err) {
            console.error('Failed to load verificator data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAreaSave = async () => {
        if (!areaOfFocus.trim()) return;
        setAreaLoading(true);
        setAreaMsg('');
        try {
            await axios.post(`${API_URL}/verificator/area-of-focus`, { areaOfFocus }, config);
            setAreaMsg('✓ Area of focus saved!');
        } catch (err) {
            setAreaMsg('Failed to save. Try again.');
        } finally {
            setAreaLoading(false);
            setTimeout(() => setAreaMsg(''), 3000);
        }
    };

    const handleAccept = async (jobId) => {
        try {
            await axios.post(`${API_URL}/verificator/jobs/${jobId}/accept`, {}, config);
            fetchAll();
        } catch (err) {
            console.error('Failed to accept job', err);
        }
    };

    const handleAction = async () => {
        if (!actionJob) return;
        setActionLoading(true);
        setActionMsg({ type: '', text: '' });
        const { job, action } = actionJob;
        try {
            const body = action === 'decline-job'
                ? { reason: actionComment }
                : { comment: actionComment };
            await axios.post(`${API_URL}/verificator/jobs/${job._id}/${action}`, body, config);
            setActionMsg({ type: 'success', text: 'Action submitted successfully.' });
            setTimeout(() => {
                setActionJob(null);
                setActionComment('');
                setActionMsg({ type: '', text: '' });
                fetchAll();
            }, 1500);
        } catch (err) {
            setActionMsg({ type: 'error', text: err.response?.data?.message || 'Action failed' });
        } finally {
            setActionLoading(false);
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-100 text-amber-700',
            accepted: 'bg-blue-100 text-blue-700',
            verified: 'bg-green-100 text-green-700',
            declined_user: 'bg-red-100 text-red-700',
            declined_job: 'bg-neutral-100 text-neutral-600',
        };
        const label = {
            pending: 'Pending',
            accepted: 'Accepted',
            verified: 'Verified',
            declined_user: 'Declined (User)',
            declined_job: 'Declined (Job)',
        };
        return <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${map[status] || 'bg-neutral-100 text-neutral-500'}`}>{label[status] || status}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-neutral-500 font-bold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const acceptedJobs = jobs.filter(j => j.status === 'accepted');
    const completedJobs = jobs.filter(j => ['verified', 'declined_user', 'declined_job'].includes(j.status));

    return (
        <div className="min-h-screen bg-neutral-50 font-[family-name:var(--font-geist-sans,_sans-serif)]">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-sm">
                        V
                    </div>
                    <div>
                        <p className="font-black text-foreground text-sm">Verificator Portal</p>
                        <p className="text-xs text-neutral-400 font-medium">{user?.firstName} {user?.lastName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll} className="w-9 h-9 bg-neutral-100 text-neutral-500 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={logout} className="flex items-center gap-2 bg-neutral-100 text-neutral-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Area of Focus */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Area of Focus
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={areaOfFocus}
                            onChange={(e) => setAreaOfFocus(e.target.value)}
                            placeholder="e.g. Lagos Island, Ikeja, Surulere..."
                            className="flex-1 px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm"
                        />
                        <button
                            onClick={handleAreaSave}
                            disabled={areaLoading}
                            className="bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                        >
                            {areaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </button>
                    </div>
                    {areaMsg && <p className="text-sm font-bold mt-2 text-green-600">{areaMsg}</p>}
                </div>

                {/* Summary Stats Bar */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Pending Jobs', value: stats.pendingJobs, icon: Clock, color: 'amber' },
                            { label: 'Verified Today', value: stats.verifiedToday, icon: CheckCircle2, color: 'green' },
                            { label: 'This Week', value: stats.verifiedThisWeek, icon: TrendingUp, color: 'blue' },
                            { label: 'This Month', value: stats.verifiedThisMonth, icon: Target, color: 'purple' },
                        ].map(({ label, value, icon: Icon, color }) => {
                            const c = {
                                amber: 'bg-amber-50 text-amber-600',
                                green: 'bg-green-50 text-green-600',
                                blue: 'bg-blue-50 text-blue-600',
                                purple: 'bg-purple-50 text-purple-600',
                            }[color];
                            return (
                                <div key={label} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400">{label}</p>
                                        <p className="text-2xl font-extrabold text-foreground">{value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Target Progress */}
                {stats?.target && (
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-6">
                        <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> My Targets & Pay
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { period: 'Daily', done: stats.verifiedToday, target: stats.target.daily, pay: stats.target.dailyPay },
                                { period: 'Weekly', done: stats.verifiedThisWeek, target: stats.target.weekly, pay: stats.target.weeklyPay },
                                { period: 'Monthly', done: stats.verifiedThisMonth, target: stats.target.monthly, pay: stats.target.monthlyPay },
                            ].map(({ period, done, target, pay }) => {
                                const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
                                return (
                                    <div key={period} className="bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">{period}</span>
                                            <span className="text-xs font-bold text-primary">₦{pay?.toLocaleString() || 0}</span>
                                        </div>
                                        <p className="text-2xl font-extrabold text-foreground">{done}<span className="text-sm font-bold text-neutral-400">/{target}</span></p>
                                        <div className="mt-2 bg-neutral-100 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-neutral-400 font-bold mt-1">{pct}% complete</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 bg-neutral-100 p-1 rounded-2xl">
                    {[
                        { id: 'jobs', label: `Jobs (${jobs.length})`, icon: ClipboardList },
                        { id: 'intros', label: `My Introductions (${introductions.length})`, icon: Users }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                                activeTab === id ? 'bg-white text-foreground shadow-sm' : 'text-neutral-500 hover:text-foreground'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div className="space-y-4">
                        {/* Pending & Accepted */}
                        {[...pendingJobs, ...acceptedJobs].length === 0 && completedJobs.length === 0 && (
                            <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center">
                                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-neutral-200" />
                                <p className="font-black text-neutral-400">No jobs assigned yet</p>
                                <p className="text-sm text-neutral-400 mt-1">New user registrations will be sent to you automatically.</p>
                            </div>
                        )}

                        {[...pendingJobs, ...acceptedJobs].map((job) => (
                            <div key={job._id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                {/* User Profile (no phone) */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 overflow-hidden shrink-0">
                                        {job.targetUser?.image ? (
                                            <img src={job.targetUser.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black text-xl">
                                                {job.targetUser?.firstName?.[0]}{job.targetUser?.lastName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <h3 className="font-black text-foreground text-lg">
                                                {job.targetUser?.firstName} {job.targetUser?.lastName}
                                            </h3>
                                            {statusBadge(job.status)}
                                        </div>
                                        <p className="text-sm text-neutral-500 font-medium">{job.targetUser?.email}</p>
                                        <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                            Registered: {new Date(job.targetUser?.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Address to verify */}
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
                                    <Home className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">Address to Verify</p>
                                        <p className="font-bold text-amber-900">{job.targetUser?.homeAddress || 'No address provided'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {job.status === 'pending' && (
                                        <button
                                            onClick={() => handleAccept(job._id)}
                                            className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all text-sm"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                            Accept Job
                                        </button>
                                    )}
                                    {['pending', 'accepted'].includes(job.status) && (
                                        <>
                                            <button
                                                onClick={() => { setActionJob({ job, action: 'verify' }); setActionComment(''); }}
                                                className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all text-sm"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Mark Verified
                                            </button>
                                            <button
                                                onClick={() => { setActionJob({ job, action: 'decline-user' }); setActionComment(''); }}
                                                className="flex items-center gap-2 bg-red-100 text-red-700 font-bold px-5 py-2.5 rounded-xl hover:bg-red-200 transition-all text-sm"
                                            >
                                                <UserX className="w-4 h-4" />
                                                Decline User
                                            </button>
                                            <button
                                                onClick={() => { setActionJob({ job, action: 'decline-job' }); setActionComment(''); }}
                                                className="flex items-center gap-2 bg-neutral-100 text-neutral-600 font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-sm"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Decline Job (Reassign)
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Completed Jobs */}
                        {completedJobs.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-3">Completed Jobs</h3>
                                <div className="space-y-3">
                                    {completedJobs.map((job) => (
                                        <div key={job._id} className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-black text-sm text-neutral-500">
                                                    {job.targetUser?.firstName?.[0]}{job.targetUser?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{job.targetUser?.firstName} {job.targetUser?.lastName}</p>
                                                    <p className="text-xs text-neutral-400">{job.targetUser?.homeAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {statusBadge(job.status)}
                                                {job.verificatorComment && (
                                                    <p className="text-xs text-neutral-400 italic max-w-[160px] text-right">"{job.verificatorComment}"</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Introductions Tab */}
                {activeTab === 'intros' && (
                    <div className="space-y-3">
                        {introductions.length === 0 ? (
                            <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 text-neutral-200" />
                                <p className="font-black text-neutral-400">No introductions yet</p>
                                <p className="text-sm text-neutral-400 mt-1">Use your registered email as a referral to introduce new users to the platform.</p>
                            </div>
                        ) : introductions.map((r) => (
                            <div key={r._id} className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-primary/20 transition-all">
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

            {/* Action Modal (Verify / Decline User / Decline Job) */}
            {actionJob && (
                <div className="fixed inset-0 z-[200] bg-neutral-900/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-8">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                                actionJob.action === 'verify' ? 'bg-green-50 text-green-600' :
                                actionJob.action === 'decline-user' ? 'bg-red-50 text-red-600' :
                                'bg-neutral-100 text-neutral-600'
                            }`}>
                                {actionJob.action === 'verify' ? <UserCheck className="w-8 h-8" /> :
                                 actionJob.action === 'decline-user' ? <UserX className="w-8 h-8" /> :
                                 <XCircle className="w-8 h-8" />}
                            </div>
                            <h3 className="text-2xl font-black text-foreground">
                                {actionJob.action === 'verify' ? 'Verify Address' :
                                 actionJob.action === 'decline-user' ? 'Decline User' :
                                 'Decline & Reassign Job'}
                            </h3>
                            <p className="text-neutral-500 text-sm font-medium mt-1">
                                {actionJob.action === 'verify' ? `Confirm that ${actionJob.job.targetUser?.firstName} lives at stated address.` :
                                 actionJob.action === 'decline-user' ? `${actionJob.job.targetUser?.firstName} does NOT live at the stated address.` :
                                 'You are declining this job. It will be reassigned to another verificator.'}
                            </p>
                        </div>

                        {actionMsg.text && (
                            <div className={`p-3 rounded-xl font-bold text-sm text-center mb-4 ${actionMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {actionMsg.text}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-black text-neutral-700 mb-2 uppercase tracking-wide">
                                {actionJob.action === 'decline-job' ? 'Reason for Declining' : 'Comment'} *
                            </label>
                            <textarea
                                required
                                value={actionComment}
                                onChange={(e) => setActionComment(e.target.value)}
                                placeholder={
                                    actionJob.action === 'verify' ? 'e.g. Visited address, user confirmed present. Address matches registration.' :
                                    actionJob.action === 'decline-user' ? 'e.g. No one by that name lives at this address.' :
                                    'e.g. Address is outside my current coverage area.'
                                }
                                rows={3}
                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setActionJob(null); setActionComment(''); setActionMsg({ type: '', text: '' }); }}
                                className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-200 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={actionLoading || !actionComment.trim()}
                                onClick={handleAction}
                                className={`flex-1 py-3 font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 text-white ${
                                    actionJob.action === 'verify' ? 'bg-green-600 hover:bg-green-700' :
                                    actionJob.action === 'decline-user' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-neutral-800 hover:bg-black'
                                }`}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
