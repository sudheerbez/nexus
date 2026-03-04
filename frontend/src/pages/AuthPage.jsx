import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthPage() {
    const { isAuthenticated, user, signup, login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const googleBtnRef = useRef(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // If already authenticated, redirect
    if (isAuthenticated) {
        return <Navigate to={user?.onboarding_complete ? '/' : '/onboarding'} replace />;
    }

    // Initialize Google Sign-In
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const initGoogle = () => {
            if (window.google && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                    auto_select: false,
                });
                window.google.accounts.id.renderButton(
                    googleBtnRef.current,
                    {
                        theme: 'filled_black',
                        size: 'large',
                        width: '100%',
                        shape: 'pill',
                        text: 'continue_with',
                    }
                );
            }
        };

        // Wait for Google script to load
        if (window.google) {
            initGoogle();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGoogle;
            document.head.appendChild(script);
        }
    }, [isLogin]);

    const handleGoogleResponse = async (response) => {
        setError('');
        setLoading(true);
        try {
            const u = await googleLogin(response.credential);
            navigate(u.onboarding_complete ? '/' : '/onboarding');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const u = await login(email, password);
                navigate(u.onboarding_complete ? '/' : '/onboarding');
            } else {
                if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
                if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
                const u = await signup(name, email, password);
                navigate('/onboarding');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/30 mb-4">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Nexus</h1>
                    <p className="text-slate-400 mt-2 text-sm">AI-Guided Self-Directed Learning Platform</p>
                </div>

                {/* Auth Card */}
                <div className="glass-panel p-8">
                    <div className="relative z-10">
                        {/* Toggle */}
                        <div className="flex bg-black/30 rounded-xl p-1 mb-6">
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${isLogin ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => { setIsLogin(true); setError(''); }}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${!isLogin ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => { setIsLogin(false); setError(''); }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Google Sign-In */}
                        {GOOGLE_CLIENT_ID ? (
                            <>
                                <div ref={googleBtnRef} className="w-full mb-4 flex justify-center [&>div]:w-full"></div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-xs text-slate-500">or continue with email</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>
                            </>
                        ) : null}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="glass-input pl-10 text-sm"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="glass-input pl-10 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                                        className="glass-input pl-10 pr-10 text-sm"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="glass-button w-full justify-center bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 border-blue-400/30 text-white py-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                        </form>

                        <p className="text-center text-xs text-slate-500 mt-6">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
