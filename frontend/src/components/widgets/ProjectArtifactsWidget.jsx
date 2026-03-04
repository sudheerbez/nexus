import React, { useState } from 'react';
import { FileCode, FileTerminal, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ProjectArtifactsWidget({ artifacts = [], onSubmitArtifact }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codeInput, setCodeInput] = useState('');
    const [submitResult, setSubmitResult] = useState(null);

    const handleSubmit = async () => {
        if (!codeInput.trim()) return;
        setIsSubmitting(true);
        setSubmitResult(null);
        try {
            const result = await onSubmitArtifact(codeInput);
            setCodeInput('');
            setSubmitResult({ type: result.status, message: result.feedback || `Artifact ${result.status}!` });
        } catch (e) {
            setSubmitResult({ type: 'error', message: e.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusConfig = {
        verified: { icon: CheckCircle, bg: 'bg-green-500/20', text: 'text-green-400', label: 'text-green-300', labelBg: 'bg-green-500/20' },
        rejected: { icon: XCircle, bg: 'bg-red-500/20', text: 'text-red-400', label: 'text-red-300', labelBg: 'bg-red-500/20' },
        pending: { icon: Clock, bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'text-yellow-300', labelBg: 'bg-yellow-500/20' },
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-xl text-white">Verifiable Artifacts</h3>
            <p className="text-slate-300 text-sm">Submit your code for Mentor Agent review.</p>

            <div className="flex flex-col gap-3 mt-2 max-h-48 overflow-y-auto pr-2">
                {artifacts.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No artifacts submitted yet. Submit code below for verification.</p>
                )}
                {artifacts.map((art) => {
                    const sc = statusConfig[art.status] || statusConfig.pending;
                    return (
                        <div key={art.id} className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${sc.bg} ${sc.text}`}>
                                    {art.type === 'code' ? <FileCode size={20} /> : <FileTerminal size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm truncate">{art.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">{art.date_submitted}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sc.labelBg} ${sc.label}`}>
                                            {art.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {art.feedback && (
                                <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                                    <strong>Mentor Feedback:</strong> {art.feedback}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit Result */}
            {submitResult && (
                <div className={`p-3 rounded-xl text-xs border ${submitResult.type === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                        submitResult.type === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                            submitResult.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                    }`}>
                    {submitResult.message}
                </div>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
                <textarea
                    className="glass-input text-sm min-h-[80px]"
                    placeholder="Paste code snippet for verification..."
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !codeInput.trim()}
                    className="glass-button w-full justify-center disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isSubmitting ? "Evaluating..." : "Submit to Mentor Agent"}
                </button>
            </div>
        </div>
    );
}
