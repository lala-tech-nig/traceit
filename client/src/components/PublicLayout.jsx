import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Lock, MessageCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const WHATSAPP_NUMBER = '2348121444306';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20need%20help%20with%20TraceIt`;

const NAV_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '/features?tab=features' },
    { label: 'How It Works', to: '/features?tab=howItWorks' },
    { label: 'For Who', to: '/features?tab=forWho' },
    { label: 'Merchants', to: '/merchants' },
    { label: 'Influencers', to: '/influencers' },
    { label: 'FAQs', to: '/faq' },
];

export default function PublicLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (link) => {
        const [path, search] = link.to.split('?');
        if (location.pathname === path) {
            if (!search) return true;
            return location.search === `?${search}`;
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased flex flex-col">
            {/* ── NAVBAR ── */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 mr-4 lg:mr-8 shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black text-neutral-900 tracking-tight">TraceIt</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-7">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className={`text-sm font-semibold transition-colors ${isActive(link) ? 'text-orange-500 font-bold' : 'text-neutral-600 hover:text-orange-500'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 transition-colors px-3 py-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>
                        <Link
                            to="/login"
                            className="text-sm font-bold text-neutral-700 hover:text-orange-500 transition-colors px-4 py-2"
                        >
                            Sign In
                        </Link>
                        <Link
                            to={user ? '/dashboard' : '/register'}
                            className="text-sm font-bold bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            {user ? 'Dashboard' : 'Get Started'}
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-neutral-700"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-neutral-100 px-5 py-4 space-y-1 shadow-lg">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive(link) ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700 hover:bg-orange-50 hover:text-orange-600'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                            <a
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-green-700 bg-green-50 rounded-xl"
                            >
                                <MessageCircle className="w-4 h-4" /> WhatsApp Support
                            </a>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-neutral-700 rounded-xl hover:bg-neutral-50 text-center">
                                Sign In
                            </Link>
                            <Link to={user ? '/dashboard' : '/register'} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl text-center hover:bg-orange-600 transition-colors">
                                {user ? 'Dashboard' : 'Get Started Free'}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* ── PAGE CONTENT ── */}
            <main className="flex-1 pt-16">
                {children}
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-neutral-950 text-neutral-400 py-16 px-5 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-black text-white tracking-tight">TraceIt</span>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xs mb-5">
                                Nigeria's verified national gadget registry — building a transparent, theft-free technology market, one device at a time.
                            </p>
                            <a
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat on WhatsApp
                            </a>
                        </div>

                        {/* Platform Links */}
                        <div>
                            <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Platform</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Register Device', to: '/register' },
                                    { label: 'Merchants', to: '/merchants' },
                                    { label: 'Influencers', to: '/influencers' },
                                    { label: 'FAQs', to: '/faq' },
                                ].map(({ label, to }) => (
                                    <li key={label}>
                                        <Link to={to} className="text-sm hover:text-orange-400 transition-colors font-medium">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pages & Company */}
                        <div>
                            <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Explore</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Features', to: '/features' },
                                    { label: 'How It Works', to: '/features#how-it-works' },
                                    { label: 'For Who', to: '/features#for-who' },
                                    { label: 'Home', to: '/' },
                                ].map(({ label, to }) => (
                                    <li key={label}>
                                        <Link to={to} className="text-sm hover:text-orange-400 transition-colors font-medium">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-medium">
                            © {new Date().getFullYear()} TraceIt Registry — All Rights Reserved. A product of{' '}
                            <span className="text-orange-400 font-bold">Lala Technologies Nigeria Ltd.</span>
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" /> +234 812 144 4306
                            </a>
                            <div className="flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-xs font-semibold text-neutral-500">256-bit SSL Encrypted &amp; NIN Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
