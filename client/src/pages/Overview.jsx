import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, ShieldAlert, Smartphone, Search, Users,
    ArrowRight, Zap, Globe, CheckCircle2, Award, Lock,
    Fingerprint, BarChart2, MessageCircle, Home as HomeIcon,
    Star, Layers, Target
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '@/components/PublicLayout';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const ICON_MAP = {
    ShieldCheck, ShieldAlert, Smartphone, Search, Users,
    ArrowRight, Zap, Globe, CheckCircle2, Award, Lock,
    Fingerprint, BarChart2, Star, Layers, Target
};

const WHATSAPP = 'https://wa.me/2348121444306?text=Hello%2C%20I%20need%20help%20with%20TraceIt';

function SectionBadge({ children }) {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-5">
            {children}
        </div>
    );
}

export default function FeaturesPage() {
    const { API_URL } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeSection = (tabParam && ['features', 'howItWorks', 'forWho'].includes(tabParam)) ? tabParam : 'features';
    
    const [data, setData] = useState({ features: [], howItWorks: [], forWho: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOverview(); }, []);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/content/overview`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch overview content:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = (iconName, cls = 'w-6 h-6') => {
        const Icon = ICON_MAP[iconName] || Zap;
        return <Icon className={cls} />;
    };

    const tabs = [
        { id: 'features', label: 'Features', icon: <Zap className="w-4 h-4" /> },
        { id: 'howItWorks', label: 'How It Works', icon: <Layers className="w-4 h-4" /> },
        { id: 'forWho', label: 'For Who', icon: <Target className="w-4 h-4" /> },
    ];

    return (
        <PublicLayout>
            {/* ── HERO ── */}
            <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 px-5 lg:px-8 border-b border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-orange-500 transition-colors bg-white border border-neutral-200 px-4 py-2 rounded-full">
                            <HomeIcon className="w-3.5 h-3.5" /> Home
                        </Link>
                        <span className="text-neutral-300">/</span>
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">Features</span>
                    </div>
                    <SectionBadge><Zap className="w-4 h-4" /> Platform Overview</SectionBadge>
                    <h1 className="text-4xl lg:text-6xl font-black text-neutral-900 tracking-tight mb-5 leading-tight">
                        Everything TraceIt<br />
                        <span className="text-orange-500">Does For You</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nigeria's first verified national gadget registry — protecting owners, exposing stolen devices, and building a transparent tech market you can trust.
                    </p>

                    {/* Tab Pills */}
                    <div className="inline-flex bg-neutral-100 p-1.5 rounded-2xl gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSearchParams({ tab: tab.id })}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                                    activeSection === tab.id
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'text-neutral-600 hover:text-orange-500'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-orange-500" />
                </div>
            ) : (
                <>
                    {/* ── FEATURES ── */}
                    <section id="features" className={`py-20 px-5 lg:px-8 ${activeSection !== 'features' ? 'hidden' : ''}`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-14">
                                <SectionBadge><ShieldCheck className="w-4 h-4" /> Core Features</SectionBadge>
                                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-4">
                                    Powerful Tools to <span className="text-orange-500">Protect You</span>
                                </h2>
                                <p className="text-neutral-500 max-w-xl mx-auto">
                                    Every feature is built to give you real-world protection, total transparency, and iron-clad proof of ownership.
                                </p>
                            </div>

                            {data.features.length === 0 ? (
                                /* Fallback hardcoded features */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { icon: 'ShieldCheck', title: 'Device Registration', description: 'Register your gadget with its IMEI/serial number. Creates a permanent, tamper-proof ownership record on Nigeria\'s national registry.' },
                                        { icon: 'Search', title: 'Instant Device Search', description: 'Search any device by IMEI before buying second-hand. Know instantly if it\'s stolen, under dispute, or clean.' },
                                        { icon: 'Fingerprint', title: 'NIN Identity Verification', description: 'All users are verified against Nigeria\'s NIMC database. No anonymous accounts — real people, real ownership.' },
                                        { icon: 'ShieldAlert', title: 'Theft Reporting', description: 'Report your device stolen instantly. It gets flagged across our entire network and notified to field agents.' },
                                        { icon: 'Users', title: 'Ownership Transfer', description: 'Sell your device safely. Transfer ownership with a digital receipt that protects both buyer and seller legally.' },
                                        { icon: 'Lock', title: 'Verified Merchant Directory', description: 'Find and verify trusted gadget stores registered on TraceIt. Buy with confidence from approved dealers.' },
                                    ].map((f, i) => (
                                        <div key={i} className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 group">
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                                                {renderIcon(f.icon, 'w-6 h-6 text-orange-500 group-hover:text-white transition-colors')}
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-2">{f.title}</h3>
                                            <p className="text-neutral-500 text-sm leading-relaxed">{f.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.features.map((f, i) => (
                                        <div key={f._id || i} className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 group">
                                            {f.badge && <span className="inline-block bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">{f.badge}</span>}
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                                                {renderIcon(f.icon, 'w-6 h-6 text-orange-500 group-hover:text-white transition-colors')}
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-2">{f.title}</h3>
                                            {f.subtitle && <p className="text-xs font-bold text-orange-500 mb-2">{f.subtitle}</p>}
                                            <p className="text-neutral-500 text-sm leading-relaxed">{f.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── HOW IT WORKS ── */}
                    <section id="how-it-works" className={`py-20 px-5 lg:px-8 bg-neutral-50 ${activeSection !== 'howItWorks' ? 'hidden' : ''}`}>
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <SectionBadge><Layers className="w-4 h-4" /> Step by Step</SectionBadge>
                                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-4">
                                    How <span className="text-orange-500">TraceIt Works</span>
                                </h2>
                                <p className="text-neutral-500 max-w-xl mx-auto">
                                    Getting started takes under 5 minutes. Here's exactly what happens when you register.
                                </p>
                            </div>

                            {data.howItWorks.length === 0 ? (
                                <div className="space-y-6">
                                    {[
                                        { step: '01', title: 'Create Your Account', description: 'Sign up with your email and phone number. Your account is tied to a real identity for maximum security and trust.' },
                                        { step: '02', title: 'Verify Your NIN Identity', description: 'Pay a one-time ₦500 fee to verify your National Identification Number (NIN) via NIMC. This ensures only real Nigerians own devices on our platform.' },
                                        { step: '03', title: 'Register Your Gadget', description: 'Add your device — phone, laptop, or tablet — using its IMEI or serial number. Upload your purchase receipt as proof of ownership.' },
                                        { step: '04', title: 'Get Your Ownership Certificate', description: 'Receive a verified digital certificate of ownership, valid across Nigeria. Share it when selling or if your device is questioned.' },
                                        { step: '05', title: 'Transfer or Report Anytime', description: 'Selling your device? Transfer ownership with a digital receipt. Device stolen? Report it instantly to flag it across the national network.' },
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-6 bg-white border border-neutral-200 rounded-3xl p-7 hover:border-orange-200 hover:shadow-lg transition-all">
                                            <div className="text-4xl font-black text-orange-100 shrink-0 leading-none">{s.step}</div>
                                            <div>
                                                <h3 className="text-lg font-black text-neutral-900 mb-2">{s.title}</h3>
                                                <p className="text-neutral-500 text-sm leading-relaxed">{s.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {data.howItWorks.map((s, i) => (
                                        <div key={s._id || i} className="flex gap-6 bg-white border border-neutral-200 rounded-3xl p-7 hover:border-orange-200 hover:shadow-lg transition-all">
                                            <div className="text-4xl font-black text-orange-100 shrink-0 leading-none">{String(i + 1).padStart(2, '0')}</div>
                                            <div>
                                                {s.badge && <span className="inline-block bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">{s.badge}</span>}
                                                <h3 className="text-lg font-black text-neutral-900 mb-2">{s.title}</h3>
                                                {s.subtitle && <p className="text-xs font-bold text-orange-500 mb-2">{s.subtitle}</p>}
                                                <p className="text-neutral-500 text-sm leading-relaxed">{s.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── FOR WHO ── */}
                    <section id="for-who" className={`py-20 px-5 lg:px-8 ${activeSection !== 'forWho' ? 'hidden' : ''}`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-14">
                                <SectionBadge><Target className="w-4 h-4" /> Who It's For</SectionBadge>
                                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-4">
                                    Built for <span className="text-orange-500">Every Nigerian</span>
                                </h2>
                                <p className="text-neutral-500 max-w-xl mx-auto">
                                    Whether you're buying, selling, repairing, or policing — TraceIt gives you the power you need.
                                </p>
                            </div>

                            {data.forWho.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { icon: 'Users', title: 'Gadget Owners', description: 'Register your device and protect it with a verified digital ownership certificate. If it\'s stolen, report it in seconds.' },
                                        { icon: 'Search', title: 'Second-Hand Buyers', description: 'Check any device before buying. Know if it\'s stolen, previously reported, or has a clean history in under 30 seconds.' },
                                        { icon: 'Globe', title: 'Gadget Sellers & Shops', description: 'Join the Verified Merchant Directory. Build trust with buyers and close deals faster with registered, traceable devices.' },
                                        { icon: 'Smartphone', title: 'Phone & Tech Technicians', description: 'Verify devices brought in for repairs. Avoid handling stolen property and protect your business from legal risk.' },
                                        { icon: 'Award', title: 'Corporate & Fleet Managers', description: 'Manage entire fleets of company devices. Track, register, and transfer corporate gadgets all from one dashboard.' },
                                        { icon: 'ShieldAlert', title: 'Law Enforcement Agents', description: 'Cross-check seized devices instantly. Access the national registry to verify ownership and track stolen gadgets.' },
                                    ].map((f, i) => (
                                        <div key={i} className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 group">
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                                                {renderIcon(f.icon, 'w-6 h-6 text-orange-500 group-hover:text-white transition-colors')}
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-2">{f.title}</h3>
                                            <p className="text-neutral-500 text-sm leading-relaxed">{f.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.forWho.map((f, i) => (
                                        <div key={f._id || i} className="bg-white border border-neutral-200 hover:border-orange-300 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 group">
                                            {f.badge && <span className="inline-block bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">{f.badge}</span>}
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                                                {renderIcon(f.icon, 'w-6 h-6 text-orange-500 group-hover:text-white transition-colors')}
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-2">{f.title}</h3>
                                            {f.subtitle && <p className="text-xs font-bold text-orange-500 mb-2">{f.subtitle}</p>}
                                            <p className="text-neutral-500 text-sm leading-relaxed">{f.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* ── CTA STRIP ── */}
            <section className="bg-orange-500 py-16 px-5 lg:px-8">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-1">Ready to protect your gadget?</h2>
                        <p className="text-orange-100 text-sm">Join thousands of Nigerians who already own their devices safely.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-7 py-3.5 rounded-2xl hover:bg-orange-50 transition-all shadow-xl">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href={WHATSAPP}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-white/30 transition-all border border-white/30"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp Support
                        </a>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
