import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchDashboard } from '../services/api';
import { Compass, Users, FileCode, TrendingUp, ArrowRight, Sparkles, Target, BookOpen, AlertTriangle } from 'lucide-react';

export default function HomePage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard()
            .then(data => { setUserData(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && !userData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <AlertTriangle size={32} className="text-yellow-400" />
                    <p className="text-slate-300">Could not load dashboard data.</p>
                    <button onClick={() => window.location.reload()} className="glass-button text-sm">Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    const stage = userData?.current_stage || 'Interested';
    const artifactCount = userData?.artifacts?.length || 0;
    const verifiedCount = userData?.artifacts?.filter(a => a.status === 'verified').length || 0;

    const stats = [
        { label: "Current Stage", value: stage, sub: "of 4 stages", icon: Target, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
        { label: "Artifacts Submitted", value: artifactCount, sub: `${verifiedCount} verified`, icon: FileCode, iconBg: "bg-green-500/20", iconColor: "text-green-400" },
        { label: "Partner Matches", value: "1", sub: "active pairing", icon: Users, iconBg: "bg-pink-500/20", iconColor: "text-pink-400" },
        { label: "Overall Progress", value: "45%", sub: "to self-directed", icon: TrendingUp, iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    ];

    return (
        <DashboardLayout userData={userData}>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                {/* Welcome Banner */}
                <div className="glass-card p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-l-4 border-l-blue-400">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                Welcome back, {userData?.name || 'Student'} 👋
                            </h1>
                            <p className="mt-2 text-slate-300 text-sm max-w-xl">
                                Your Nexus Mission Control dashboard. Track your progress, connect with peers, and advance through the self-directed learning stages.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/discovery')}
                            className="glass-button bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-100 shrink-0"
                        >
                            <Sparkles size={16} />
                            Go to Discovery
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-5 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                <div className={`p-1.5 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                                    <stat.icon size={16} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white capitalize">{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => navigate('/discovery')} className="glass-card p-6 flex flex-col items-start gap-3 text-left group">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                            <Compass size={24} />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Discovery Stage</h3>
                        <p className="text-slate-400 text-sm">View your learning path, submit artifacts, and find accountability partners.</p>
                        <span className="text-blue-400 text-sm flex items-center gap-1 mt-auto">Open <ArrowRight size={14} /></span>
                    </button>

                    <button onClick={() => navigate('/mentorship')} className="glass-card p-6 flex flex-col items-start gap-3 text-left group">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Mentorship Hub</h3>
                        <p className="text-slate-400 text-sm">Chat with your Mentor Agent, track skills, and access learning resources.</p>
                        <span className="text-purple-400 text-sm flex items-center gap-1 mt-auto">Open <ArrowRight size={14} /></span>
                    </button>

                    <button onClick={() => navigate('/settings')} className="glass-card p-6 flex flex-col items-start gap-3 text-left group">
                        <div className="p-3 rounded-xl bg-slate-500/20 text-slate-400 group-hover:bg-slate-500/30 transition-colors">
                            <Users size={24} />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Account Settings</h3>
                        <p className="text-slate-400 text-sm">Manage your profile, notification preferences, and privacy settings.</p>
                        <span className="text-slate-400 text-sm flex items-center gap-1 mt-auto">Open <ArrowRight size={14} /></span>
                    </button>
                </div>

                {/* Recent Activity */}
                {artifactCount > 0 && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-xl text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {userData.artifacts.slice(-3).reverse().map((art, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div className={`p-2 rounded-lg ${art.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <FileCode size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{art.title}</p>
                                        <p className="text-xs text-slate-400">{art.date_submitted}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${art.status === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {art.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
