import { BookOpen, CheckCircle, Target } from "lucide-react";

export default function LearningPathWidget({ learningPath, currentStage }) {

    if (!learningPath) return null;

    const stages = [
        { id: "dependent", label: "Dependent: Foundation", goal: learningPath.dependent_goal, icon: CheckCircle, isPast: currentStage !== 'dependent', isCurrent: currentStage === 'dependent' },
        { id: "interested", label: "Interested: Discovery Stage", goal: learningPath.interested_goal, icon: Target, isPast: currentStage === 'involved' || currentStage === 'self_directed', isCurrent: currentStage === 'interested' },
        { id: "involved", label: "Involved: Guided Projects", goal: learningPath.involved_goal, icon: BookOpen, isPast: currentStage === 'self_directed', isCurrent: currentStage === 'involved' },
        { id: "self_directed", label: "Self-Directed: Independence", goal: learningPath.self_directed_goal, icon: BookOpen, isPast: false, isCurrent: currentStage === 'self_directed' }
    ];

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl text-white">Current Learning Path</h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30 capitalize">
                    {currentStage || "Dependent"} Stage
                </span>
            </div>

            <p className="text-sm text-slate-300 font-medium">{learningPath.primary_goal}</p>

            <div className="mt-2 space-y-4">
                {stages.map((stage, idx) => {
                    if (stage.isPast) {
                        return (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1 text-green-400">
                                    <stage.icon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm line-through opacity-70">{stage.label}</h4>
                                    <p className="text-slate-400 text-xs">{stage.goal}</p>
                                </div>
                            </div>
                        );
                    } else if (stage.isCurrent) {
                        return (
                            <div key={idx} className="flex items-start gap-3 relative before:absolute before:inset-0 before:ml-[8px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-500/30 before:to-transparent">
                                <div className="mt-1 text-blue-400 animate-pulse relative z-10 bg-[#0f172a]">
                                    <stage.icon size={18} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <h4 className="text-blue-100 font-medium text-sm">{stage.label}</h4>
                                    <p className="text-slate-300 text-xs mt-1">{stage.goal}</p>
                                    <div className="mt-3 w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[45%]"></div>
                                    </div>
                                    <p className="text-right text-xs text-blue-300 mt-1 font-mono">In Progress</p>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={idx} className="flex items-start gap-3 opacity-50">
                                <div className="mt-1 text-slate-500">
                                    <stage.icon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">{stage.label}</h4>
                                    <p className="text-slate-400 text-xs text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{stage.goal}</p>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    );
}
