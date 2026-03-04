import React from 'react';
import { Compass, MapPin, CheckCircle, Circle } from "lucide-react";

const stages = [
    { key: 'dependent', label: 'Dependent', icon: '📘', goalKey: 'dependent_goal' },
    { key: 'interested', label: 'Interested', icon: '🔍', goalKey: 'interested_goal' },
    { key: 'involved', label: 'Involved', icon: '🛠️', goalKey: 'involved_goal' },
    { key: 'self_directed', label: 'Self-Directed', icon: '🚀', goalKey: 'self_directed_goal' },
];

export default function LearningPathWidget({ learningPath, currentStage }) {
    const stageOrder = ['Dependent', 'Interested', 'Involved', 'Self-Directed'];
    const currentIndex = stageOrder.indexOf(currentStage || 'Dependent');

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Compass size={20} />
                </div>
                <h3 className="font-semibold text-xl text-white">Learning Path</h3>
            </div>

            {learningPath ? (
                <>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Primary Goal</p>
                        <p className="text-sm text-blue-300 font-medium">{learningPath.primary_goal}</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        {stages.map((s, i) => {
                            const isComplete = i < currentIndex;
                            const isCurrent = i === currentIndex;
                            const goalText = learningPath[s.goalKey] || 'TBD';

                            return (
                                <div key={s.key} className="flex items-start gap-3">
                                    {/* Timeline line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${isComplete ? 'bg-green-500/20 border-green-400 text-green-400' :
                                                isCurrent ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-lg shadow-blue-500/20' :
                                                    'bg-white/5 border-white/10 text-slate-500'
                                            }`}>
                                            {isComplete ? <CheckCircle size={16} /> : <span>{s.icon}</span>}
                                        </div>
                                        {i < stages.length - 1 && (
                                            <div className={`w-0.5 h-6 mt-1 ${isComplete ? 'bg-green-500/40' : 'bg-white/10'}`}></div>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`text-sm font-medium ${isCurrent ? 'text-blue-300' : isComplete ? 'text-green-300' : 'text-slate-400'}`}>
                                            {s.label} {isCurrent && <span className="text-xs opacity-60">(current)</span>}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">{goalText}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center min-h-[140px] text-center">
                    <p className="text-sm text-slate-400">No learning path generated. Complete onboarding to get started.</p>
                </div>
            )}
        </div>
    );
}
