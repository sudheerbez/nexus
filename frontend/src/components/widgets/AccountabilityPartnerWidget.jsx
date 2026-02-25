import React, { useState, useEffect } from 'react';
import { Users, Calendar, Video, RefreshCw } from "lucide-react";

export default function AccountabilityPartnerWidget() {
    const [partnerData, setPartnerData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPartner = () => {
        setLoading(true);
        // This simulates a polling check to see if the Gale-Shapley match happened
        // In a real app we'd fetch the specific match for the user.
        // For prototype, we'll just mock the response after the trigger is successful.
        setTimeout(() => {
            setPartnerData(null); // Initially no partner
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchPartner();
    }, []);

    const handleRunMatch = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost:8000/api/match', { method: 'POST' });
            // Mocking the matched response since we just ran the algorithm
            setPartnerData({
                name: "Alex Chen",
                major: "CS Major",
                score: 92,
                meeting: "Tomorrow, 2:00 PM",
                seed: "Alex"
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                    <Users size={20} />
                </div>
                <h3 className="font-semibold text-xl text-white">Partner Check-ins</h3>
            </div>

            <p className="text-slate-300 text-sm">Find peers via Gale-Shapley Algorithm.</p>

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[140px]">
                    <RefreshCw className="animate-spin text-slate-500" size={24} />
                </div>
            ) : partnerData ? (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-2 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerData.seed}`} alt={partnerData.name} className="w-full h-full rounded-full bg-slate-900" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">{partnerData.name}</h4>
                            <p className="text-pink-300 text-xs">{partnerData.major} • {partnerData.score}% Match</p>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/10 my-1"></div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{partnerData.meeting}</span>
                        </div>
                        <button className="glass-button text-xs py-1 px-3 bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200">
                            <Video size={14} /> Join Call
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-2 flex flex-col items-center justify-center gap-3 min-h-[140px] text-center">
                    <p className="text-sm text-slate-400">You have not been matched with a partner yet.</p>
                    <button onClick={handleRunMatch} className="glass-button text-sm">
                        <RefreshCw size={16} /> Run Match Algorithm
                    </button>
                </div>
            )}
        </div>
    );
}
