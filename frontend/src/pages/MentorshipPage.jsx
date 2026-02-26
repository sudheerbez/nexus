import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { sendChatMessage } from '../services/api';
import { BookOpen, GraduationCap, MessageCircle, Send, Loader2 } from 'lucide-react';

export default function MentorshipPage() {
    const [messages, setMessages] = useState([
        {
            role: 'mentor',
            text: "Welcome! I'm your Mentor Agent. I use Socratic questioning to help you develop deeper understanding. Ask me anything about your learning journey!",
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

        try {
            const reply = await sendChatMessage(msg);
            setMessages(prev => [...prev, { role: 'mentor', text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'mentor', text: "I couldn't process that right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="glass-card p-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-l-4 border-l-purple-400">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Mentorship Hub</h1>
                    <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                        Connect with your Mentor Agent for personalized guidance. Get Socratic feedback on your artifacts and track your learning journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mentor Chat */}
                    <div className="glass-card p-6 flex flex-col gap-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <MessageCircle size={20} />
                            </div>
                            <h3 className="font-semibold text-xl text-white">Mentor Agent Chat</h3>
                            <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Online
                            </span>
                        </div>

                        <div className="bg-black/20 rounded-xl border border-white/10 p-4 min-h-[300px] max-h-[400px] overflow-y-auto flex flex-col gap-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.role === 'mentor' ? (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">M</div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">Y</div>
                                    )}
                                    <div className={`p-3 rounded-xl text-sm max-w-[80%] ${msg.role === 'mentor'
                                        ? 'bg-white/5 rounded-tl-none text-slate-200'
                                        : 'bg-blue-500/20 rounded-tr-none text-blue-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">M</div>
                                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none text-sm text-slate-400 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask your mentor a question..."
                                className="glass-input text-sm flex-1"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="glass-button bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/30 text-purple-200 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Send
                            </button>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <BookOpen size={20} />
                            </div>
                            <h3 className="font-semibold text-xl text-white">Learning Resources</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "React Fundamentals Guide", url: "https://react.dev/learn" },
                                { name: "State Management Patterns", url: "https://react.dev/learn/managing-state" },
                                { name: "API Design Best Practices", url: "https://fastapi.tiangolo.com/tutorial/" },
                            ].map((resource, i) => (
                                <a
                                    key={i}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer no-underline"
                                >
                                    <BookOpen size={16} className="text-blue-400 shrink-0" />
                                    <span className="text-sm text-slate-200">{resource.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                <GraduationCap size={20} />
                            </div>
                            <h3 className="font-semibold text-xl text-white">Skill Progress</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { skill: "React Components", pct: 75 },
                                { skill: "State Management", pct: 45 },
                                { skill: "API Integration", pct: 30 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-300">{item.skill}</span>
                                        <span className="text-blue-300 font-mono">{item.pct}%</span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
