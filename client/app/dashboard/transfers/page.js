"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftRight, Check, X, Send, Smartphone } from 'lucide-react';

export default function TransfersPage() {
    const { user, API_URL } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [outgoingTransfers, setOutgoingTransfers] = useState([]);
    const [myDevices, setMyDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initiate transfer state
    const [showInitiateForm, setShowInitiateForm] = useState(false);
    const [transferForm, setTransferForm] = useState({ deviceId: '', targetUserEmail: '', comment: '' });
    const [initiating, setInitiating] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const [transfersRes, outgoingRes, devicesRes] = await Promise.all([
                axios.get(`${API_URL}/transfers/incoming`, config),
                axios.get(`${API_URL}/transfers/outgoing`, config),
                axios.get(`${API_URL}/devices/mydevices`, config)
            ]);

            setTransfers(transfersRes.data);
            setOutgoingTransfers(outgoingRes.data);
            setMyDevices(devicesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAccept = async (transferId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/transfers/${transferId}/accept`, {}, config);
            setMessage({ type: 'success', text: 'Transfer accepted successfully!' });
            fetchData(); // Refresh lists
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to accept transfer' });
        }
    };

    const handleReject = async (transferId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/transfers/${transferId}/reject`, {}, config);
            setMessage({ type: 'success', text: 'Transfer rejected successfully!' });
            fetchData(); // Refresh lists
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject transfer' });
        }
    };

    const verifyEmail = async () => {
        if (!transferForm.targetUserEmail) return;
        setVerifying(true);
        setMessage({ type: '', text: '' });
        setVerifiedUser(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/auth/verify-user?email=${transferForm.targetUserEmail}`, config);
            setVerifiedUser(res.data);
            setMessage({ type: 'success', text: `Verified! User: ${res.data.firstName} ${res.data.lastName}` });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'User not found' });
        } finally {
            setVerifying(false);
        }
    };

    const handleInitiate = async (e) => {
        e.preventDefault();
        if (!verifiedUser) {
            setMessage({ type: 'error', text: 'Please verify the target email first.' });
            return;
        }
        setInitiating(true);
        setMessage({ type: '', text: '' });

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/transfers/initiate`, transferForm, config);
            setMessage({ type: 'success', text: 'Transfer initiated successfully! Waiting for target user to accept.' });
            setShowInitiateForm(false);
            setTransferForm({ deviceId: '', targetUserEmail: '', comment: '' });
            setVerifiedUser(null);
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to initiate transfer' });
        } finally {
            setInitiating(false);
        }
    };

    const handleCancel = async (transferId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/transfers/${transferId}/cancel`, config);
            setMessage({ type: 'success', text: 'Transfer cancelled successfully!' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to cancel transfer' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Device Transfers</h1>
                    <p className="text-neutral-500 font-medium">Accept incoming gadgets or transfer yours to someone else.</p>
                </div>
                <button
                    onClick={() => setShowInitiateForm(!showInitiateForm)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    {showInitiateForm ? 'Cancel Transfer' : 'Initiate Transfer'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 border rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {showInitiateForm && (
                <div className="bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Transfer a Device</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleInitiate}>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Select Device</label>
                            <select
                                required
                                value={transferForm.deviceId}
                                onChange={(e) => setTransferForm({ ...transferForm, deviceId: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                            >
                                <option value="" disabled>-- Select a device from your inventory --</option>
                                {myDevices.map(d => (
                                    <option key={d._id} value={d._id}>{d.name} ({d.serialNumber})</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Target User Email</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    value={transferForm.targetUserEmail}
                                    onChange={(e) => {
                                        setTransferForm({ ...transferForm, targetUserEmail: e.target.value });
                                        setVerifiedUser(null); // Reset verification on change
                                    }}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="newowner@example.com"
                                />
                                <button type="button" onClick={verifyEmail} disabled={verifying || !transferForm.targetUserEmail} className="bg-neutral-100 text-neutral-700 px-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors whitespace-nowrap">
                                    {verifying ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </div>
                            {verifiedUser && (
                                <p className="text-sm text-green-600 mt-2 font-bold px-2">✓ Verified: {verifiedUser.firstName} {verifiedUser.lastName}</p>
                            )}
                            <p className="text-xs text-neutral-500 mt-2">The new owner must log in to their TraceIt account to accept the transfer.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Transfer Comment / Note</label>
                            <textarea
                                required
                                value={transferForm.comment}
                                onChange={(e) => setTransferForm({ ...transferForm, comment: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[100px]"
                                placeholder="e.g. Sold gadget on 12/Oct, in perfect condition."
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button disabled={initiating || myDevices.length === 0 || !verifiedUser} type="submit" className="bg-foreground text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors disabled:opacity-70">
                                {initiating ? 'Initiating...' : 'Confirm Transfer Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Pending Incoming Transfers</h2>
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-24 bg-neutral-200 rounded-2xl w-full"></div>
                    </div>
                ) : transfers.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-3xl">
                        <ArrowLeftRight className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No pending transfers</h3>
                        <p className="text-neutral-500">You don't have any incoming device transfers at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transfers.map(transfer => (
                            <div key={transfer._id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{transfer.device?.name || 'Unknown Device'}</h3>
                                        <p className="text-sm text-neutral-500 mb-2 font-medium">S/N: {transfer.device?.serialNumber}</p>
                                        <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic">
                                            "<span className="font-medium">{transfer.comment}</span>" <br />
                                            <span className="text-xs text-neutral-500 mt-1 block not-italic">— Sent by {transfer.initiator?.name} ({transfer.initiator?.email})</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                                    <button onClick={() => handleAccept(transfer._id)} className="w-full bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <Check className="w-4 h-4" />
                                        Accept
                                    </button>
                                    <button onClick={() => handleReject(transfer._id)} className="w-full bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Outgoing Pending Transfers</h2>
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-24 bg-neutral-200 rounded-2xl w-full"></div>
                        </div>
                    ) : outgoingTransfers.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-3xl">
                            <Send className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-foreground mb-1">No outgoing transfers</h3>
                            <p className="text-neutral-500">You haven't initiated any transfers.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {outgoingTransfers.map(transfer => (
                                <div key={transfer._id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                            <ArrowLeftRight className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{transfer.device?.name || 'Unknown Device'}</h3>
                                            <p className="text-sm text-neutral-500 mb-2 font-medium">To: {transfer.targetUserEmail}</p>
                                            <p className="text-xs text-neutral-500 mt-1 block not-italic">Sent on {new Date(transfer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button onClick={() => handleCancel(transfer._id)} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm">
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
