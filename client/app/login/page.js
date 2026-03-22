"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspendedEmail, setSuspendedEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        if (!result.success) {
            setError(result.message);
            if (result.isSuspended) {
                setIsSuspended(true);
                setSuspendedEmail(result.email || email);
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="TraceIt Logo" className="w-10 h-10 object-contain" />
                    <span className="text-3xl font-bold tracking-tight text-foreground">Trace<span className="text-primary">It</span></span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-foreground">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl border border-neutral-100 sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className={`p-3 rounded-lg text-sm font-medium border ${isSuspended ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                <p>{error}</p>
                                {isSuspended && (
                                    <a 
                                        href={`https://wa.me/2349012345678?text=Hello%20TraceIt%20Support,%20my%20account%20(${suspendedEmail})%20has%20been%20restricted.%20Please%20I%20need%20help%20to%20resolve%20this.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all gap-2"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.097 3.391l-.712 2.6 2.658-.696c.92.544 1.99.866 3.136.866 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.361 8.211c-.044.125-.252.235-.38.258-.127.024-.252.028-.406-.024-.154-.052-.395-.145-.71-.274-1.3-.532-2.14-1.838-2.205-1.924-.065-.086-.519-.691-.519-1.32s.329-.938.446-1.061c.117-.123.254-.154.339-.154.084 0 .168.001.242.004.075.003.141-.028.216.155.075.183.256.626.279.673.024.047.04.102.008.165-.032.063-.072.134-.144.217-.072.083-.153.186-.219.248-.073.07-.15.146-.065.292.086.146.381.628.817 1.017.562.502 1.036.657 1.183.73s.255.053.339-.047c.084-.1.357-.414.452-.556.095-.141.19-.118.32-.07s.827.39.97.457c.143.067.238.101.272.161.034.059.034.343-.01.468z"/>
                                        </svg>
                                        Message Support
                                    </a>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Email address</label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">Password</label>
                            <div className="mt-2 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-600 font-medium">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
