import { Users, Calendar, Video } from "lucide-react";

export default function AccountabilityPartnerWidget() {
    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                    <Users size={20} />
                </div>
                <h3 className="font-semibold text-xl text-white">Partner Check-ins</h3>
            </div>

            <p className="text-slate-300 text-sm">Matched via Gale-Shapley Algorithm.</p>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex" className="w-full h-full rounded-full bg-slate-900" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Alex Chen</h4>
                        <p className="text-pink-300 text-xs">CS Major • 92% Match</p>
                    </div>
                </div>

                <div className="h-px w-full bg-white/10 my-1"></div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Tomorrow, 2:00 PM</span>
                    </div>
                    <button className="glass-button text-xs py-1 px-3 bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200">
                        <Video size={14} /> Join Call
                    </button>
                </div>
            </div>
        </div>
    );
}
