"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Plus, Users, LayoutGrid } from 'lucide-react';

export default function SubStoresPage() {
    const { user, API_URL } = useAuth();
    const [substores, setSubstores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '' });
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchSubstores = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/vendor/substores`, config);
            setSubstores(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'vendor') {
            fetchSubstores();
        } else if (user) {
            setLoading(false);
        }
    }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setMessage({ type: '', text: '' });

        try {
            // Create substore by registering a new user with role substore and linking mainVendorId
            const registerData = new FormData();
            registerData.append('firstName', formData.firstName);
            registerData.append('lastName', formData.lastName);
            registerData.append('phoneNumber', formData.phoneNumber);
            registerData.append('email', formData.email);
            registerData.append('password', formData.password);
            registerData.append('role', 'substore');
            registerData.append('mainVendorId', user._id);

            await axios.post(`${API_URL}/auth/register`, registerData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // We would theoretically simulate payment here (5k NGN) 
            setMessage({ type: 'success', text: 'Sub-store created successfully!' });
            setShowCreateForm(false);
            setFormData({ name: '', email: '', password: '' });
            fetchSubstores();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create sub-store' });
        } finally {
            setCreating(false);
        }
    };

    if (user?.role !== 'vendor') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Store className="w-16 h-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                <p className="text-neutral-500 font-medium mt-2">Only Vendors can access the sub-store management dashboard.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Sub-Stores</h1>
                    <p className="text-neutral-500 font-medium">Manage your network of associated stores (₦5,000/store).</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-foreground text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {showCreateForm ? 'Cancel Creation' : 'Create Sub-Store'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 border rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {showCreateForm && (
                <div className="bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Create a New Sub-Store</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreate}>
                        <div className="md:col-span-2 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1">Store First Name</label>
                                <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="First Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1">Store Last Name</label>
                                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="bg-orange-50 text-orange-700 p-3 rounded-xl border border-orange-100 text-xs font-semibold">
                                ⚠️ First Name and Last Name must match the NIN of the sub-store manager for verification.
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Store Phone Number</label>
                            <input required type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="08012345678" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Store Email (Login ID)</label>
                            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="branch1@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Initial Password</label>
                            <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="••••••••" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button disabled={creating} type="submit" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2">
                                {creating ? 'Processing...' : 'Pay ₦5,000 & Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-neutral-200 rounded-3xl"></div>)}
                    </div>
                ) : substores.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-3xl">
                        <LayoutGrid className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No Sub-Stores yet</h3>
                        <p className="text-neutral-500">You haven't created any sub-stores under your vendor account.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {substores.map(store => (
                            <div key={store._id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl">
                                        {store.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg">{store.firstName} {store.lastName}</h3>
                                        <p className="text-sm text-neutral-500 font-medium">{store.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Users className="w-4 h-4" /> Switch context
                                    </div>
                                    <button className="text-primary font-bold text-sm hover:text-primary-dark transition-colors">
                                        Manage Store
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
