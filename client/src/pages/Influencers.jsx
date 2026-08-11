import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Quote, Award, ExternalLink, HeartHandshake } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function Influencers() {
    const { API_URL } = useAuth();
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchInfluencers(); }, []);

    const fetchInfluencers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/influencers`);
            setInfluencers(res.data);
        } catch (err) {
            console.error('Failed to fetch influencers:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-50 to-white py-20 px-5 lg:px-8 border-b border-neutral-100">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-4 h-4" /> Brand Ambassadors &amp; Champions
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                        Influencers Supporting <span className="text-orange-500">TraceIt</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Meet the top tech creators, industry advocates, and brand ambassadors backing TraceIt to eradicate gadget theft and bring trust to electronic ownership in Nigeria.
                    </p>
                </div>
            </section>

            {/* Influencer Cards */}
            <section className="max-w-7xl w-full mx-auto px-5 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
                    </div>
                ) : influencers.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
                        <HeartHandshake className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-700 mb-2">No Brand Ambassadors Listed Yet</h3>
                        <p className="text-neutral-400 max-w-md mx-auto text-sm">
                            Check back soon to view our official tech advocates and ambassadors.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {influencers.map(person => (
                            <div
                                key={person._id}
                                className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-100 flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                                <div>
                                    <div className="flex items-center gap-4 mb-5">
                                        <img
                                            src={person.photoUrl}
                                            alt={person.name}
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-200 shadow-md bg-neutral-100"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                                                <span>{person.starRating ? person.starRating.toFixed(1) : '5.0'}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 leading-tight">{person.name}</h3>
                                            <p className="text-xs font-semibold text-orange-500">{person.role}</p>
                                            <p className="text-xs text-neutral-400 font-mono mt-0.5">{person.handle}</p>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 relative mb-5">
                                        <Quote className="w-5 h-5 text-orange-200 absolute top-3 right-3" />
                                        <p className="text-neutral-600 text-xs leading-relaxed italic">
                                            "{person.quote}"
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                                    <span className="flex items-center gap-1.5 font-semibold text-neutral-700">
                                        <Award className="w-4 h-4 text-orange-400" /> {person.platform} Champion
                                    </span>
                                    {person.socialUrl && (
                                        <a
                                            href={person.socialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-500 hover:text-orange-700 flex items-center gap-1 font-bold"
                                        >
                                            View Profile <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Join CTA */}
            <section className="bg-orange-500 py-16 px-5 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <Sparkles className="w-10 h-10 text-orange-200 mx-auto mb-4" />
                    <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Want to Become a TraceIt Ambassador?</h2>
                    <p className="text-orange-100 text-base mb-8 max-w-xl mx-auto">
                        Are you a tech creator, influencer, or industry voice? Partner with us to promote safe, verified gadget ownership across Nigeria.
                    </p>
                    <a
                        href={`https://wa.me/2348121444306?text=Hello%2C%20I%20want%20to%20become%20a%20TraceIt%20Brand%20Ambassador`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-2xl"
                    >
                        Partner With Us on WhatsApp
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
