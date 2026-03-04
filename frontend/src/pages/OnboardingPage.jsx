import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, GraduationCap, Compass, ArrowRight, ArrowLeft, Loader2, Check, BookOpen, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
    const { user, loading, isAuthenticated, apiFetch, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Profile
    const [major, setMajor] = useState(user?.major || '');
    const [careerInterest, setCareerInterest] = useState(user?.career_interest || '');

    // Step 2: Goals
    const [goal, setGoal] = useState('');
    const [challenges, setChallenges] = useState('');

    // Step 3: Generated roadmap
    const [roadmap, setRoadmap] = useState(null);

    // Auth guards
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (user?.onboarding_complete) {
        return <Navigate to="/" replace />;
    }

    const handleNext = async () => {
        setError('');

        if (step === 1) {
            if (!major.trim() || !careerInterest.trim()) {
                setError('Please fill in both fields');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!goal.trim() || !challenges.trim()) {
                setError('Please fill in both fields');
                return;
            }
            // Submit onboarding — this calls the Curriculum Agent
            setSubmitting(true);
            try {
                const updatedUser = await apiFetch('/api/onboarding', {
                    method: 'POST',
                    body: JSON.stringify({ major, career_interest: careerInterest, goal, challenges }),
                });
                setRoadmap(updatedUser.learning_path);
                setStep(3);
            } catch (e) {
                setError(e.message);
            } finally {
                setSubmitting(false);
            }
        } else if (step === 3) {
            // Refreshing user and going to dashboard
            await refreshUser();
            navigate('/');
        }
    };

    const stages = roadmap ? [
        { label: 'Dependent', desc: roadmap.dependent_goal, icon: '📘' },
        { label: 'Interested', desc: roadmap.interested_goal, icon: '🔍' },
        { label: 'Involved', desc: roadmap.involved_goal, icon: '🛠️' },
        { label: 'Self-Directed', desc: roadmap.self_directed_goal, icon: '🚀' },
    ] : [];

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/20 mb-3">
                        <span className="text-lg font-bold text-white">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome to Nexus, {user?.name || 'there'}!</h1>
                    <p className="text-slate-400 mt-1 text-sm">Let's set up your personalized learning journey</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s < step ? 'bg-green-500 text-white' :
                                s === step ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                                    'bg-white/10 text-slate-500'
                                }`}>
                                {s < step ? <Check size={14} /> : s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-green-500' : 'bg-white/10'}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="glass-panel p-8">
                    <div className="relative z-10">
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                                <AlertCircle size={16} className="shrink-0" /> {error}
                            </div>
                        )}

                        {/* Step 1: Profile */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><GraduationCap size={20} /></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Your Profile</h2>
                                        <p className="text-xs text-slate-400">Tell us about your academic background</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Major / Field of Study</label>
                                    <input type="text" value={major} onChange={e => setMajor(e.target.value)} className="glass-input text-sm" placeholder="e.g. Computer Science" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Career Interest</label>
                                    <input type="text" value={careerInterest} onChange={e => setCareerInterest(e.target.value)} className="glass-input text-sm" placeholder="e.g. Full-Stack Development" />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Target size={20} /></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Discovery Assessment</h2>
                                        <p className="text-xs text-slate-400">The Curriculum Agent will generate your personalized roadmap</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">What do you want to learn?</label>
                                    <textarea value={goal} onChange={e => setGoal(e.target.value)} className="glass-input text-sm min-h-[80px]" placeholder="e.g. I want to learn full-stack web development with React and FastAPI" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">What are your biggest challenges?</label>
                                    <textarea value={challenges} onChange={e => setChallenges(e.target.value)} className="glass-input text-sm min-h-[80px]" placeholder="e.g. I struggle with state management and API design patterns" />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Roadmap Review */}
                        {step === 3 && roadmap && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Compass size={20} /></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Your Learning Roadmap</h2>
                                        <p className="text-xs text-slate-400">Generated by the Nexus Curriculum Agent</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <p className="text-sm text-blue-300 font-medium">🎯 {roadmap.primary_goal}</p>
                                </div>

                                <div className="space-y-3">
                                    {stages.map((s, i) => (
                                        <div key={i} className={`p-4 rounded-xl border transition-all ${i === 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/20 border-white/5'}`}>
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg">{s.icon}</span>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white">{s.label}{i === 0 ? ' (You are here)' : ''}</h4>
                                                    <p className="text-xs text-slate-300 mt-1">{s.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-sm text-slate-300">
                                    <p className="font-medium text-blue-200 mb-1">📝 Learning Contract</p>
                                    <p className="text-xs">By continuing, you agree to actively engage with the AI-guided curriculum, submit verifiable artifacts for each stage, and meet regularly with your accountability partner.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => { setStep(step - 1); setError(''); }}
                                    className="glass-button text-sm"
                                    disabled={submitting}
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                            ) : <div />}
                            <button
                                onClick={handleNext}
                                disabled={submitting}
                                className="glass-button text-sm bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Generating roadmap...</>
                                ) : step === 3 ? (
                                    <><Check size={16} /> I Agree — Start Learning</>
                                ) : (
                                    <><ArrowRight size={16} /> Continue</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
