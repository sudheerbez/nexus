import React, { useState, useEffect } from 'react';
import { runMatchAlgorithm, getMyPartner } from '../../services/api';
import { Users, Calendar, Video, RefreshCw, X, ExternalLink, Loader2, AlertCircle } from "lucide-react";

export default function AccountabilityPartnerWidget() {
    const [partnerData, setPartnerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCallModal, setShowCallModal] = useState(false);

    const fetchPartner = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyPartner();
            setPartnerData(data.partner);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartner();
    }, []);

    const handleRunMatch = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await runMatchAlgorithm();
            // After matching, fetch the partner
            const data = await getMyPartner();
            setPartnerData(data.partner);
        } catch (e) {
            setError(e.message);
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
                    <Loader2 className="animate-spin text-slate-500" size={24} />
                </div>
            ) : partnerData ? (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-2 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                            {partnerData.name?.[0]?.toUpperCase() || 'P'}
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
                            <span>{partnerData.next_meeting}</span>
                        </div>
                        <button
                            onClick={() => setShowCallModal(true)}
                            className="glass-button text-xs py-1 px-3 bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200"
                        >
                            <Video size={14} /> Join Call
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-2 flex flex-col items-center justify-center gap-3 min-h-[140px] text-center">
                    {error && (
                        <p className="text-xs text-red-300 flex items-center gap-1"><AlertCircle size={12} />{error}</p>
                    )}
                    <p className="text-sm text-slate-400">No partner match found yet.</p>
                    <button onClick={handleRunMatch} className="glass-button text-sm">
                        <RefreshCw size={16} /> Run Match Algorithm
                    </button>
                    <p className="text-xs text-slate-500">Requires 2+ onboarded users</p>
                </div>
            )}

            {/* Video Call Modal */}
            {showCallModal && partnerData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCallModal(false)}>
                    <div className="glass-panel w-full max-w-md m-4 p-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Video size={20} className="text-blue-400" /> Join Meeting
                            </h3>
                            <button onClick={() => setShowCallModal(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                                    {partnerData.name?.[0]?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-lg">{partnerData.name}</h4>
                                    <p className="text-pink-300 text-sm">{partnerData.major}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">This will open a video call with your accountability partner.</p>
                        </div>
                        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setShowCallModal(false)} className="glass-button text-sm">Cancel</button>
                            <a href="https://meet.jit.si/nexus-partner-checkin" target="_blank" rel="noopener noreferrer" className="glass-button text-sm bg-green-500/20 hover:bg-green-500/40 border-green-400/30 text-green-200 no-underline">
                                <ExternalLink size={14} /> Open Video Call
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
