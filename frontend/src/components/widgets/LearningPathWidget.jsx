import { BookOpen, CheckCircle, Target } from "lucide-react";

export default function LearningPathWidget() {
    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl text-white">Current Learning Path</h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                    Interested Stage
                </span>
            </div>

            <div className="mt-2 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-400">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-sm line-through opacity-70">Dependent: Foundation</h4>
                        <p className="text-slate-400 text-xs">Completed React Basics</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 relative before:absolute before:inset-0 before:ml-[8px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-500/30 before:to-transparent">
                    <div className="mt-1 text-blue-400 animate-pulse relative z-10 bg-[#0f172a]">
                        <Target size={18} />
                    </div>
                    <div className="relative z-10 w-full">
                        <h4 className="text-blue-100 font-medium text-sm">Interested: Discovery Stage</h4>
                        <p className="text-slate-300 text-xs mt-1">Exploring "Why" behind state management.</p>
                        <div className="mt-3 w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[45%]"></div>
                        </div>
                        <p className="text-right text-xs text-blue-300 mt-1 font-mono">45%</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 opacity-50">
                    <div className="mt-1 text-slate-500">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-sm">Involved: Guided Projects</h4>
                        <p className="text-slate-400 text-xs">Locked</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
