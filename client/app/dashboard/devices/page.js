"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, Plus, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function DevicesPage() {
    const { user, API_URL } = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '', brand: '', model: '', color: '', serialNumber: '', imei: ''
    });
    const [image, setImage] = useState(null);
    const [addLoading, setAddLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchDevices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/devices/mydevices`, config);
            setDevices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDevices();
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => setImage(e.target.files[0]);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (image) data.append('deviceImage', image);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(`${API_URL}/devices`, data, config);
            setMessage({ type: 'success', text: 'Device added successfully!' });
            setShowAddForm(false);
            fetchDevices();
            setFormData({ name: '', brand: '', model: '', color: '', serialNumber: '', imei: '' });
            setImage(null);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to add device'
            });
        } finally {
            setAddLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'clean': return <ShieldCheck className="w-5 h-5 text-green-500" />;
            case 'lost': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'stolen': return <AlertOctagon className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'clean': return <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Clean</span>;
            case 'lost': return <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide">Lost</span>;
            case 'stolen': return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Stolen</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">My Devices</h1>
                    <p className="text-neutral-500 font-medium">Manage and track your registered gadgets.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {showAddForm ? 'Cancel' : 'Add New Device'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 border rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {showAddForm && (
                <div className="bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Register a New Device</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddDevice}>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">Device Name</label><input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. My iPhone 13" /></div>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">Brand</label><input required name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. Apple" /></div>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">Model</label><input required name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. iPhone 13 Pro" /></div>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">Color</label><input required name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. Midnight Blue" /></div>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">Serial Number</label><input required name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Device S/N" /></div>
                        <div><label className="block text-sm font-semibold text-neutral-700 mb-1">IMEI (Optional but recommended)</label><input name="imei" value={formData.imei} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="15-digit IMEI" /></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Device Image (Optional)</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-neutral-50" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button disabled={addLoading} type="submit" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-70">
                                {addLoading ? 'Registering...' : 'Save Device'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-neutral-200 rounded-3xl animate-pulse" />)}
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center py-20 bg-white border border-neutral-200 rounded-3xl shadow-sm">
                    <Smartphone className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No devices found</h3>
                    <p className="text-neutral-500 font-medium">You haven't added any devices to your trace profile yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map(device => (
                        <div key={device._id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            <div className="h-40 bg-neutral-100 flex items-center justify-center relative border-b border-neutral-100">
                                {device.deviceImage ? (
                                    <img src={device.deviceImage} alt={device.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Smartphone className="w-16 h-16 text-neutral-300 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(device.status)}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-foreground mb-1 truncate">{device.name}</h3>
                                <p className="text-sm font-semibold text-neutral-500 mb-4">{device.brand} • {device.model}</p>
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500 font-medium">S/N:</span>
                                        <span className="font-bold text-foreground font-mono">{device.serialNumber}</span>
                                    </div>
                                    {device.imei && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500 font-medium">IMEI:</span>
                                            <span className="font-bold text-foreground font-mono">{device.imei}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(device.status)}
                                        <span className="text-sm font-bold capitalize text-foreground">{device.status}</span>
                                    </div>
                                    <button className="text-primary font-bold text-sm hover:text-primary-dark transition-colors">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
