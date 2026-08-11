import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Star, MapPin, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function Merchants() {
    const { API_URL } = useAuth();
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedMerchant, setSelectedMerchant] = useState(null);

    useEffect(() => { fetchMerchants(); }, [selectedCategory]);

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory !== 'All') params.category = selectedCategory;
            const res = await axios.get(`${API_URL}/merchants`, { params });
            setMerchants(res.data);
        } catch (err) {
            console.error('Failed to fetch merchants:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredMerchants = merchants.filter(m => {
        const q = searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    });

    const categories = ['All', 'Mobile Retailer & Authorized Dealer', 'Gadgets & Smart Accessories', 'Laptop & Apple Specialist', 'Home Appliances & Smart TV Hub'];

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-50 to-white py-20 px-5 lg:px-8 border-b border-neutral-100">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6">
                        <ShieldCheck className="w-4 h-4" /> Verified Vendor Directory
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                        Registered <span className="text-orange-500">Merchants &amp; Dealers</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Search and confirm the identity of verified gadget sellers, phone stores, and electronics retailers registered on the TraceIt National Registry.
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name, location (e.g. Computer Village), or category..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 shadow-sm transition-all"
                        />
                    </div>

                    {/* Category Chips */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Merchant Cards */}
            <section className="max-w-7xl w-full mx-auto px-5 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
                    </div>
                ) : filteredMerchants.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
                        <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-700 mb-2">No Merchants Found</h3>
                        <p className="text-neutral-400 max-w-md mx-auto text-sm">
                            {searchQuery ? `No vendors matched "${searchQuery}". Try another search term.` : 'No merchants have been registered yet. Check back soon.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMerchants.map(merchant => (
                            <div
                                key={merchant._id}
                                className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="relative">
                                            <img src={merchant.logoUrl} alt={merchant.name} className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 bg-neutral-100" />
                                            <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" title="Verified Merchant">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            {merchant.starRating?.toFixed(1)}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-neutral-900 mb-1">{merchant.name}</h3>
                                    <p className="text-xs font-semibold text-orange-500 mb-3">{merchant.category}</p>
                                    <p className="text-neutral-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                                        {merchant.description || 'Verified merchant registered on the TraceIt National Gadget Registry.'}
                                    </p>

                                    <div className="space-y-2 text-xs text-neutral-500 mb-5 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                            <span className="truncate">{merchant.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                            <span>Registered: {new Date(merchant.dateJoined).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedMerchant(merchant)}
                                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" /> Confirm Merchant Identity
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Identity Modal */}
            {selectedMerchant && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 border border-neutral-200">
                        <button onClick={() => setSelectedMerchant(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-2 rounded-full transition-colors">✕</button>
                        <div className="flex items-center gap-4 mb-6">
                            <img src={selectedMerchant.logoUrl} alt={selectedMerchant.name} className="w-20 h-20 rounded-2xl object-cover border border-neutral-200 bg-neutral-100" />
                            <div>
                                <div className="inline-flex items-center gap-1 text-green-600 text-xs font-bold mb-1">
                                    <CheckCircle2 className="w-4 h-4" /> Verified Registered Merchant
                                </div>
                                <h2 className="text-2xl font-black text-neutral-900">{selectedMerchant.name}</h2>
                                <p className="text-xs text-orange-500 font-semibold">{selectedMerchant.category}</p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs mb-6">
                            {[
                                ['Star Rating', `★ ${selectedMerchant.starRating} / 5.0`],
                                ['Date Joined', new Date(selectedMerchant.dateJoined).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })],
                                ['Location', selectedMerchant.location],
                                selectedMerchant.phone ? ['Phone', selectedMerchant.phone] : null,
                                selectedMerchant.email ? ['Email', selectedMerchant.email] : null,
                            ].filter(Boolean).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-neutral-200 pb-2 last:border-0 last:pb-0">
                                    <span className="text-neutral-400 font-medium">{key}:</span>
                                    <span className="font-bold text-neutral-800">{val}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
                            {selectedMerchant.description || 'This vendor is officially registered on TraceIt. You can safely verify gadgets sold by this store.'}
                        </p>
                        <button onClick={() => setSelectedMerchant(null)} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors">
                            Close Identity Sheet
                        </button>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
