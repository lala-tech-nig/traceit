"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Smartphone, 
    Plus, 
    ShieldCheck, 
    AlertTriangle, 
    AlertOctagon, 
    Laptop, 
    Tablet, 
    Watch, 
    Camera, 
    Gamepad, 
    Monitor,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';

const categoryConfig = {
    smartphone: {
        label: "Smartphone",
        icon: <Smartphone className="w-6 h-6" />,
        question: "IMEI Number",
        placeholder: "15-digit IMEI",
        specKey: "imei",
        required: true
    },
    laptop: {
        label: "Laptop",
        icon: <Laptop className="w-6 h-6" />,
        question: "Processor/Chipset",
        placeholder: "e.g. M2 Pro, Intel Core i9",
        specKey: "processor",
        required: true
    },
    tablet: {
        label: "Tablet",
        icon: <Tablet className="w-6 h-6" />,
        question: "Screen Size / Model Variant",
        placeholder: "e.g. 11-inch WiFi+Cellular",
        specKey: "variant",
        required: true
    },
    smartwatch: {
        label: "Smartwatch",
        icon: <Watch className="w-6 h-6" />,
        question: "Case Size / Material",
        placeholder: "e.g. 45mm Titanium",
        specKey: "build",
        required: true
    },
    camera: {
        label: "Camera",
        icon: <Camera className="w-6 h-6" />,
        question: "Sensor Type",
        placeholder: "e.g. Full Frame, APS-C",
        specKey: "sensor",
        required: true
    },
    console: {
        label: "Gaming Console",
        icon: <Gamepad className="w-6 h-6" />,
        question: "Storage Capacity",
        placeholder: "e.g. 1TB SSD",
        specKey: "storage",
        required: true
    },
    accessory: {
        label: "Other Electronics",
        icon: <Monitor className="w-6 h-6" />,
        question: "Unique Identifier",
        placeholder: "e.g. MAC Address or Model ID",
        specKey: "identifier",
        required: false
    }
};

export default function DevicesPage() {
    const { user, API_URL } = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [step, setStep] = useState(1); // 1: Category, 2: Details

    // Manage state
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [manageForm, setManageForm] = useState({ status: '', comment: '' });
    const [manageLoading, setManageLoading] = useState(false);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState("");
    const [formData, setFormData] = useState({
        name: '', brand: '', model: '', color: '', serialNumber: '', imei: '', specValue: ''
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

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedCategory("");
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            
            // Collect all base fields (except specValue and imei if smartphone)
            Object.keys(formData).forEach(key => {
                if (key !== 'specValue' && (key !== 'imei' || selectedCategory !== 'smartphone')) {
                    data.append(key, formData[key]);
                }
            });

            // Add Category
            data.append('category', selectedCategory);

            // Construct Specs
            const specs = {};
            const config = categoryConfig[selectedCategory];
            if (config) {
                specs[config.specKey] = formData.specValue;
                // For smartphones, if we haven't appended imei yet, do it now
                if (selectedCategory === 'smartphone') {
                    data.append('imei', formData.specValue);
                }
            }
            data.append('specs', JSON.stringify(specs));

            if (image) data.append('deviceImage', image);

            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(`${API_URL}/devices`, data, axiosConfig);
            setMessage({ type: 'success', text: 'Device added successfully!' });
            setShowAddForm(false);
            setStep(1);
            fetchDevices();
            setFormData({ name: '', brand: '', model: '', color: '', serialNumber: '', imei: '', specValue: '' });
            setSelectedCategory("");
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

    const handleManageSubmit = async (e) => {
        e.preventDefault();
        setManageLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/devices/${selectedDevice._id}/status`, {
                status: manageForm.status,
                statusComment: manageForm.comment
            }, config);

            setMessage({ type: 'success', text: 'Device status updated successfully!' });
            setSelectedDevice(null);
            fetchDevices();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update device' });
        } finally {
            setManageLoading(false);
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

    const getCategoryIcon = (category) => {
        const config = categoryConfig[category.toLowerCase()] || categoryConfig.accessory;
        return config.icon;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">My Devices</h1>
                    <p className="text-neutral-500 font-medium">Manage and track your registered gadgets.</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        if (!showAddForm) {
                            setStep(1);
                            setSelectedCategory("");
                        }
                    }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${showAddForm ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'}`}
                >
                    {showAddForm ? <ChevronLeft className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showAddForm ? 'Cancel Registration' : 'Register New Device'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 border rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {showAddForm && (
                <div className="bg-white border border-neutral-200 p-6 md:p-10 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
                    
                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black text-foreground mb-2 text-center">Select Device Category</h2>
                            <p className="text-neutral-500 text-center mb-10 font-medium">Choose the type of gadget you want to register in the registry.</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {Object.entries(categoryConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleCategorySelect(key)}
                                        className="flex flex-col items-center justify-center p-6 bg-neutral-50 border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-lg rounded-3xl transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                                            {config.icon}
                                        </div>
                                        <span className="font-bold text-neutral-600 group-hover:text-foreground text-sm md:text-base">{config.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
                                <button onClick={handleBack} className="p-2 bg-neutral-100 rounded-full text-neutral-500 hover:text-primary transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground leading-none mb-1">Device Details</h2>
                                    <p className="text-sm font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                                        {categoryConfig[selectedCategory]?.label} Registration
                                    </p>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddDevice}>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Give it a Name</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" placeholder="e.g. Work Laptop or Daily iPhone" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Brand</label>
                                    <input required name="brand" value={formData.brand} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" placeholder="e.g. Apple, Samsung, Dell" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Model Name</label>
                                    <input required name="model" value={formData.model} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" placeholder="e.g. iPhone 15 Pro, XPS 13" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Color</label>
                                    <input required name="color" value={formData.color} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" placeholder="e.g. Space Gray, Silver" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Serial Number (S/N)</label>
                                    <input required name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono" placeholder="Unique Serial ID" />
                                </div>

                                {/* Custom Question based on Category */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">
                                        {categoryConfig[selectedCategory]?.question}
                                        {categoryConfig[selectedCategory]?.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input 
                                        required={categoryConfig[selectedCategory]?.required} 
                                        name="specValue" 
                                        value={formData.specValue} 
                                        onChange={handleChange} 
                                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-neutral-400" 
                                        placeholder={categoryConfig[selectedCategory]?.placeholder} 
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-sm font-bold text-neutral-600">Device Proof / Photo (Recommended)</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 border-2 border-dashed border-neutral-200 rounded-2xl font-medium focus:border-primary outline-none bg-neutral-50 text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark transition-all" />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-4 gap-4">
                                    <button 
                                        type="button" 
                                        onClick={handleBack} 
                                        className="bg-neutral-100 text-neutral-600 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        disabled={addLoading} 
                                        type="submit" 
                                        className="bg-primary text-white px-10 py-4 rounded-2xl font-extrabold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {addLoading ? 'Protecting...' : 'Register Device'}
                                        {!addLoading && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-neutral-200 rounded-3xl animate-pulse" />)}
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center py-24 bg-white border border-neutral-100 rounded-[3rem] shadow-sm">
                    <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-12 h-12 text-neutral-200" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">No gadgets registered</h3>
                    <p className="text-neutral-500 font-medium max-w-xs mx-auto">Start building your digital fleet. Secure your technology by registering it in our global registry.</p>
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setStep(1);
                        }}
                        className="mt-8 text-primary font-black hover:underline"
                    >
                        Register your first device
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map(device => (
                        <div key={device._id} className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col">
                            <div className="h-44 bg-neutral-50 flex items-center justify-center relative border-b border-neutral-100 overflow-hidden">
                                {device.deviceImage ? (
                                    <img src={device.deviceImage} alt={device.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                                        <div className="text-neutral-300 group-hover:text-primary/20 group-hover:scale-125 transition-all duration-700">
                                            {getCategoryIcon(device.category || "accessory")}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(device.status)}
                                </div>
                                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-600 shadow-sm border border-neutral-100">
                                    {device.category || 'Device'}
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-foreground mb-1 truncate">{device.name}</h3>
                                <p className="text-sm font-bold text-neutral-500 mb-6 uppercase tracking-tight">{device.brand} • {device.model}</p>
                                
                                <div className="space-y-3 mt-auto">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-neutral-400 font-bold uppercase tracking-wider">Serial Number</span>
                                        <span className="font-black text-foreground font-mono bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">{device.serialNumber}</span>
                                    </div>
                                    {device.specs && Object.entries(device.specs).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center text-xs">
                                            <span className="text-neutral-400 font-bold uppercase tracking-wider capitalize">{key}</span>
                                            <span className="font-black text-foreground bg-primary/5 text-primary px-2 py-1 rounded-lg border border-primary/10">{val}</span>
                                        </div>
                                    ))}
                                    {device.statusComment && (
                                        <div className="mt-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 italic text-sm text-neutral-600 relative">
                                            <span className="absolute -top-2 left-4 bg-white px-2 py-0.5 rounded-full border border-neutral-100 text-[8px] font-black uppercase tracking-widest">Note</span>
                                            "{device.statusComment}"
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(device.status)}
                                        <span className="text-sm font-black capitalize text-foreground">{device.status}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedDevice(device);
                                            setManageForm({ status: device.status, comment: '' });
                                        }}
                                        className="h-10 px-6 rounded-full bg-neutral-900 text-white font-bold text-xs hover:bg-primary transition-all shadow-md shadow-neutral-900/10"
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manage Modal */}
            {selectedDevice && (
                <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-foreground leading-tight">Manage Gadget</h2>
                            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-primary">
                                {getCategoryIcon(selectedDevice.category || "accessory")}
                            </div>
                        </div>
                        <p className="text-sm text-neutral-500 font-medium mb-8">Update the status of <span className="text-foreground font-black">{selectedDevice.name}</span> in the registry.</p>

                        <form onSubmit={handleManageSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wide">Security Status</label>
                                <select
                                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    value={manageForm.status}
                                    onChange={(e) => setManageForm({ ...manageForm, status: e.target.value })}
                                >
                                    <option value="clean">Clean (No Issues)</option>
                                    <option value="lost">Lost</option>
                                    <option value="stolen">Stolen</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wide">Status Note</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                                    placeholder="Explain why the status changed or add a note for future owners..."
                                    value={manageForm.comment}
                                    onChange={(e) => setManageForm({ ...manageForm, comment: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDevice(null)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={manageLoading}
                                    type="submit"
                                    className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all disabled:opacity-70"
                                >
                                    {manageLoading ? 'Updating' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
