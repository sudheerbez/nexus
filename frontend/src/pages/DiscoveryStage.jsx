import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LearningPathWidget from '../components/widgets/LearningPathWidget';
import AccountabilityPartnerWidget from '../components/widgets/AccountabilityPartnerWidget';
import ProjectArtifactsWidget from '../components/widgets/ProjectArtifactsWidget';
import { fetchDashboard, submitArtifact } from '../services/api';
import { X, FileText, AlertTriangle } from 'lucide-react';

export default function DiscoveryStage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showContract, setShowContract] = useState(false);

    const loadData = () => {
        setLoading(true);
        setError(null);
        fetchDashboard()
            .then(data => { setUserData(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { loadData(); }, []);

    const handleArtifactSubmit = async (artifactContent) => {
        const result = await submitArtifact(artifactContent);
        // Refresh dashboard to show new artifact
        loadData();
        return { ok: true, data: result };
    };

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
                    <p className="text-slate-300">Could not load data.</p>
                    <button onClick={loadData} className="glass-button text-sm">Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    const stageTitle = userData?.current_stage || 'Interested';

    return (
        <DashboardLayout userData={userData}>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                {/* Stage Header */}
                <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-l-4 border-l-blue-400">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{stageTitle.charAt(0).toUpperCase() + stageTitle.slice(1)} Stage</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                            Welcome. Here we focus on understanding the "Why" behind the technical concepts.
                            The Curriculum Agent has personalized your roadmap based on your initial assessments.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowContract(true)}
                        className="glass-button bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/50 text-blue-100 shadow-[0_0_15px_#3b82f633]"
                    >
                        <FileText size={16} />
                        Review Learning Contract
                    </button>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LearningPathWidget learningPath={userData?.learning_path} currentStage={userData?.current_stage} />
                    <AccountabilityPartnerWidget />
                    <ProjectArtifactsWidget artifacts={userData?.artifacts} onSubmitArtifact={handleArtifactSubmit} />
                </div>

            </div>

            {/* Learning Contract Modal */}
            {showContract && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowContract(false)}>
                    <div className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4 p-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-blue-400" />
                                Learning Contract
                            </h2>
                            <button onClick={() => setShowContract(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">📋 Student Information</h3>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                                    <p><span className="text-slate-400">Name:</span> <span className="text-white">{userData?.name || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Major:</span> <span className="text-white">{userData?.major || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Career Interest:</span> <span className="text-white">{userData?.career_interest || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Current Stage:</span> <span className="text-blue-300 capitalize">{userData?.current_stage || 'N/A'}</span></p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">🎯 Primary Goal</h3>
                                <p className="bg-black/20 p-4 rounded-xl border border-white/5">{userData?.learning_path?.primary_goal || 'No learning path set'}</p>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">🗺️ Stage Roadmap</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Dependent', goal: userData?.learning_path?.dependent_goal },
                                        { label: 'Interested', goal: userData?.learning_path?.interested_goal },
                                        { label: 'Involved', goal: userData?.learning_path?.involved_goal },
                                        { label: 'Self-Directed', goal: userData?.learning_path?.self_directed_goal },
                                    ].map((stage, i) => (
                                        <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5">
                                            <span className="text-blue-300 font-medium">{stage.label}:</span>{' '}
                                            <span>{stage.goal || 'TBD'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">📝 Agreement</h3>
                                <p className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    By participating in the Nexus program, I commit to actively engaging with the AI-guided curriculum,
                                    submitting verifiable artifacts for each stage, meeting regularly with my accountability partner,
                                    and progressing through the self-directed learning stages with integrity and dedication.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setShowContract(false)} className="glass-button text-sm">Close</button>
                            <button onClick={() => setShowContract(false)} className="glass-button text-sm bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200">
                                I Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
