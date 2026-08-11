import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="w-full bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-slate-800/80 py-4 top-0 z-50 fixed">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="TraceIt Logo" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold tracking-tight text-white">Trace<span className="text-primary">It</span></span>
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                    <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
                    <Link to="/merchants" className="hover:text-primary transition-colors">Merchants</Link>
                    <Link to="/influencers" className="hover:text-primary transition-colors">Influencers</Link>
                    <Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
