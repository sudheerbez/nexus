import { FileCode, FileTerminal } from "lucide-react";

export default function ProjectArtifactsWidget() {
    const artifacts = [
        { title: "React Prototype Config", type: "code", date: "Today, 10:24 AM" },
        { title: "Build Logs", type: "terminal", date: "Today, 10:30 AM" }
    ];

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-xl text-white">Verifiable Artifacts</h3>
            <p className="text-slate-300 text-sm">Proof of work and technical progress.</p>

            <div className="flex flex-col gap-3 mt-2">
                {artifacts.map((art, i) => (
                    <div key={i} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            {art.type === 'code' ? <FileCode size={20} /> : <FileTerminal size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{art.title}</h4>
                            <p className="text-slate-400 text-xs">{art.date}</p>
                        </div>
                        <button className="glass-button text-xs py-1 px-3">View</button>
                    </div>
                ))}
            </div>

            <button className="glass-button w-full justify-center mt-2">
                Generate New Artifact
            </button>
        </div>
    );
}
