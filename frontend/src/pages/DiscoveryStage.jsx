import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LearningPathWidget from '../components/widgets/LearningPathWidget';
import AccountabilityPartnerWidget from '../components/widgets/AccountabilityPartnerWidget';
import ProjectArtifactsWidget from '../components/widgets/ProjectArtifactsWidget';

export default function DiscoveryStage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                {/* Stage Header */}
                <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-l-4 border-l-blue-400">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Discovery Stage</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                            Welcome to the 'Interested' phase. Here we focus on understanding the "Why" behind the technical concepts.
                            The Curriculum Agent has personalized your roadmap based on your initial assessments.
                        </p>
                    </div>

                    <button className="glass-button bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        Review Learning Contract
                    </button>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LearningPathWidget />
                    <AccountabilityPartnerWidget />
                    <ProjectArtifactsWidget />
                </div>

            </div>
        </DashboardLayout>
    );
}
