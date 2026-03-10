"use client";

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="w-full bg-white shadow-sm border-b border-gray-100 py-4 top-0 z-50 fixed">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    {/* A simple logo design text */}
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Trace<span className="text-primary">It</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                        Login
                    </Link>
                    <Link href="/register" className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-sm">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
