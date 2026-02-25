import React, { useState } from 'react';
import { FileCode, FileTerminal, Loader2 } from "lucide-react";

export default function ProjectArtifactsWidget({ artifacts = [], onSubmitArtifact }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mockCodeInput, setMockCodeInput] = useState("");

    const handleGenerate = async () => {
        if (!mockCodeInput.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await onSubmitArtifact(mockCodeInput);
            if (res.ok) {
                setMockCodeInput("");
                // In a real app we would mutate the SWR cache or refetch the dashboard here
                // For this prototype, we'll just reload the page to get the fresh dashboard state
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-xl text-white">Verifiable Artifacts</h3>
            <p className="text-slate-300 text-sm">Submit your code for Mentor Agent review.</p>

            <div className="flex flex-col gap-3 mt-2 max-h-48 overflow-y-auto pr-2">
                {artifacts.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No artifacts submitted yet.</p>
                )}
                {artifacts.map((art) => (
                    <div key={art.id} className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-4 cursor-pointer">
                            <div className={`p-2 rounded-lg ${art.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {art.type === 'code' ? <FileCode size={20} /> : <FileTerminal size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium text-sm">{art.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs">{art.date_submitted}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${art.status === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
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
                ))}
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
                <textarea
                    className="glass-input text-sm min-h-[80px]"
                    placeholder="Paste code snippet for verification..."
                    value={mockCodeInput}
                    onChange={(e) => setMockCodeInput(e.target.value)}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isSubmitting || !mockCodeInput.trim()}
                    className="glass-button w-full justify-center disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Context to Mentor"}
                </button>
            </div>
        </div>
    );
}
