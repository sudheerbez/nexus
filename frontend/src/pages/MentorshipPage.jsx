import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/api';
import { BookOpen, GraduationCap, MessageCircle, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function MentorshipPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'mentor',
            text: `Welcome ${user?.name || ''}! I'm your Mentor Agent. I use Socratic questioning to help you develop deeper understanding. Ask me anything about your learning journey!`,
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const reply = await sendChatMessage(msg);
            setMessages(prev => [...prev, { role: 'mentor', text: reply }]);
        } catch (e) {
            setError(e.message);
            setMessages(prev => [...prev, { role: 'mentor', text: `Error: ${e.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const stageIndex = ['Dependent', 'Interested', 'Involved', 'Self-Directed'].indexOf(user?.current_stage || 'Dependent');

    // Learning path data from user's real roadmap
    const learningPath = user?.learning_path;
    const hasLearningPath = !!learningPath;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
                <div className="glass-card p-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-l-4 border-l-purple-400">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Mentorship Hub</h1>
                    <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                        Connect with your Mentor Agent for personalized Socratic guidance. The agent adapts its feedback to your current stage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chat */}
                    <div className="glass-card p-6 flex flex-col gap-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><MessageCircle size={20} /></div>
                            <h3 className="font-semibold text-xl text-white">Mentor Agent Chat</h3>
                            <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online
                            </span>
                        </div>

                        <div className="bg-black/20 rounded-xl border border-white/10 p-4 min-h-[300px] max-h-[400px] overflow-y-auto flex flex-col gap-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === 'mentor' ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                                        {msg.role === 'mentor' ? 'M' : user?.name?.[0] || 'Y'}
                                    </div>
                                    <div className={`p-3 rounded-xl text-sm max-w-[80%] ${msg.role === 'mentor' ? 'bg-white/5 rounded-tl-none text-slate-200' : 'bg-blue-500/20 rounded-tr-none text-blue-100'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">M</div>
                                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none text-sm text-slate-400 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" /> Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="flex gap-2">
                            <input type="text" placeholder="Ask your mentor a question..." className="glass-input text-sm flex-1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} />
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="glass-button bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/30 text-purple-200 disabled:opacity-50">
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send
                            </button>
                        </div>
                    </div>

                    {/* Your Roadmap - Real data */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><BookOpen size={20} /></div>
                            <h3 className="font-semibold text-xl text-white">Your Roadmap</h3>
                        </div>
                        {hasLearningPath ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Primary Goal</p>
                                    <p className="text-sm text-blue-300 font-medium">🎯 {learningPath.primary_goal}</p>
                                </div>
                                {[
                                    { label: 'Dependent', goal: learningPath.dependent_goal },
                                    { label: 'Interested', goal: learningPath.interested_goal },
                                    { label: 'Involved', goal: learningPath.involved_goal },
                                    { label: 'Self-Directed', goal: learningPath.self_directed_goal },
                                ].map((s, i) => (
                                    <div key={i} className={`p-3 rounded-xl border text-sm ${s.label === user?.current_stage ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/20 border-white/5'}`}>
                                        <span className="text-blue-300 font-medium text-xs">{s.label}:</span>{' '}
                                        <span className="text-slate-300 text-xs">{s.goal || 'TBD'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] text-center gap-2">
                                <Sparkles size={24} className="text-slate-500" />
                                <p className="text-sm text-slate-400">Complete onboarding to generate your personalized roadmap.</p>
                            </div>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><GraduationCap size={20} /></div>
                            <h3 className="font-semibold text-xl text-white">Stage Progress</h3>
                        </div>
                        <div className="space-y-4">
                            {['Dependent', 'Interested', 'Involved', 'Self-Directed'].map((stage, i) => {
                                const isComplete = i < stageIndex;
                                const isCurrent = i === stageIndex;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className={isCurrent ? 'text-blue-300 font-medium' : isComplete ? 'text-green-300' : 'text-slate-400'}>{stage}</span>
                                            <span className="text-xs font-mono">{isComplete ? '✓' : isCurrent ? 'Current' : '—'}</span>
                                        </div>
                                        <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
                                            <div className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : isCurrent ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-transparent'}`} style={{ width: isComplete ? '100%' : isCurrent ? '50%' : '0%' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
