"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckCircle, ShieldAlert, XCircle, Clock, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function VerificatorPortal() {
    const { user, API_URL } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!user || user.verificatorStatus !== 'approved') return;

        const fetchJobs = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_URL}/verificator/jobs`, config);
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user]);

    if (!user || user.verificatorStatus !== 'approved') {
        return <div className="p-8 text-center text-red-500 font-bold">You are not an active Verificator.</div>;
    }

    const handleAction = async (jobId, actionType) => {
        setActionLoading(jobId);
        setMessage({ type: '', text: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = { comment: comment || "Verified by agent" };
            
            if (actionType === 'accept') {
                await axios.post(`${API_URL}/verificator/jobs/${jobId}/accept`, {}, config);
            } else if (actionType === 'verify') {
                await axios.post(`${API_URL}/verificator/jobs/${jobId}/verify`, payload, config);
            } else if (actionType === 'decline_user') {
                await axios.post(`${API_URL}/verificator/jobs/${jobId}/decline-user`, { comment: comment || 'Address mismatched' }, config);
            }
            
            setMessage({ type: 'success', text: `Job updated successfully!` });
            
            // Refresh
            const res = await axios.get(`${API_URL}/verificator/jobs`, config);
            setJobs(res.data);
            setComment('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-primary" /> Verificator Portal
                </h1>
                <p className="text-neutral-500 font-medium text-lg">
                    Manage your assigned field verification jobs. Remember your strict 24-hr assignment SLA.
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <div key={job._id} className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                    job.status === 'verified' ? 'bg-green-100 text-green-700' : 
                                    job.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                    job.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-neutral-400 font-bold"><Clock className="inline w-3 h-3 mr-1"/>{new Date(job.assignedAt).toLocaleDateString()}</span>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-foreground">{job.targetUser?.firstName} {job.targetUser?.lastName}</h3>
                                <div className="flex items-start gap-2 mt-2 text-sm text-neutral-600 font-medium">
                                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                                    <p>{job.targetUser?.homeAddress || 'No Address Provided'}</p>
                                </div>
                            </div>

                            {job.status === 'accepted' && (
                                <div className="pt-4 border-t border-neutral-100">
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add verification notes/comments..."
                                        className="w-full bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-primary resize-none h-20"
                                    ></textarea>
                                </div>
                            )}

                            {job.status === 'pending' && (
                                <p className="text-xs text-amber-600 font-bold italic pt-4">Awaiting your acceptance. You must visit this address within 24 hours.</p>
                            )}
                        </div>

                        <div className="pt-6">
                            {job.status === 'pending' && (
                                <button 
                                    disabled={actionLoading === job._id}
                                    onClick={() => handleAction(job._id, 'accept')}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                                >
                                    {actionLoading === job._id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Job'}
                                </button>
                            )}

                            {job.status === 'accepted' && (
                                <div className="flex gap-3">
                                    <button 
                                        disabled={actionLoading === job._id}
                                        onClick={() => handleAction(job._id, 'verify')}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center hover:bg-primary-dark transition text-sm"
                                    >
                                        Verify
                                    </button>
                                    <button 
                                        disabled={actionLoading === job._id}
                                        onClick={() => handleAction(job._id, 'decline_user')}
                                        className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center hover:bg-red-200 transition text-sm"
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}

                            {['verified', 'declined_user'].includes(job.status) && (
                                <div className="py-3 bg-neutral-100 text-neutral-500 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4" /> Job Completed
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {jobs.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                        <ShieldAlert className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-neutral-400">No Jobs Assigned</h3>
                        <p className="text-neutral-500 mt-2">You currently have no active verifications in your area.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
