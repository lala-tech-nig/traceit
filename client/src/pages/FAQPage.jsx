import React, { useState, useEffect } from 'react';
import { Search, HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const WHATSAPP_LINK = 'https://wa.me/2348121444306?text=Hello%2C%20I%20have%20a%20question%20about%20TraceIt';

export default function FAQPage() {
    const { API_URL } = useAuth();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openIdx, setOpenIdx] = useState(0);

    useEffect(() => { fetchFAQs(); }, [selectedCategory]);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory !== 'All') params.category = selectedCategory;
            const res = await axios.get(`${API_URL}/faqs`, { params });
            setFaqs(res.data);
        } catch (err) {
            console.error('Failed to fetch FAQs:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredFaqs = faqs.filter(faq => {
        const q = searchQuery.toLowerCase();
        return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    });

    const categories = ['All', 'General', 'Registration', 'Verification', 'Transfers', 'Security'];

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-50 to-white py-20 px-5 lg:px-8 border-b border-neutral-100">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6">
                        <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                        How Can We <span className="text-orange-500">Help You?</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Find instant answers to common questions about gadget registration, NIN identity verification, transferring ownership, and security.
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search questions (e.g. transfer, NIN, stolen, receipt)..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 shadow-sm transition-all"
                        />
                    </div>

                    {/* Category Chips */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    selectedCategory === cat
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

            {/* FAQ Accordions */}
            <section className="max-w-4xl w-full mx-auto px-5 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
                    </div>
                ) : filteredFaqs.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
                        <HelpCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-700 mb-2">No Matching FAQs</h3>
                        <p className="text-neutral-400 max-w-md mx-auto text-sm">
                            {searchQuery ? `No results for "${searchQuery}". Try a different keyword or contact support below.` : 'No FAQs found. Contact our team for help.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, index) => {
                            const isOpen = openIdx === index;
                            return (
                                <div key={faq._id || index} className="bg-white border border-neutral-200 hover:border-orange-200 rounded-2xl transition-all overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setOpenIdx(isOpen ? null : index)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-black text-neutral-900 text-base hover:text-orange-500 transition-colors"
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-orange-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* WhatsApp Support CTA */}
                <div className="mt-16 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-3xl p-10 text-center">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">Still Have Questions?</h3>
                    <p className="text-neutral-500 text-sm max-w-md mx-auto mb-7">
                        Can't find what you're looking for? Our support team is available on WhatsApp to help you immediately.
                    </p>
                    <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-200"
                    >
                        <MessageCircle className="w-5 h-5" /> Chat with Support — +234 812 144 4306
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
