import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LearningPathWidget from '../components/widgets/LearningPathWidget';
import AccountabilityPartnerWidget from '../components/widgets/AccountabilityPartnerWidget';
import ProjectArtifactsWidget from '../components/widgets/ProjectArtifactsWidget';

export default function DiscoveryStage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = "http://localhost:8000/api";

    useEffect(() => {
        // Fetch User ID 1 for demonstration
        fetch(`${API_URL}/dashboard/1`)
            .then(res => res.json())
            .then(data => {
                setUserData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching dashboard data:", err);
                setLoading(false);
            });
    }, []);

    const handleArtifactSubmit = (artifactContent) => {
        return fetch(`${API_URL}/artifacts?user_id=1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "React Project Submission",
                type: "code",
                content: artifactContent,
                date_submitted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Default stage text for header
    const stageTitle = userData?.current_stage || 'Interested';

    return (
        <DashboardLayout userData={userData}>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                {/* Stage Header */}
                <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-l-4 border-l-blue-400">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{stageTitle.charAt(0).toUpperCase() + stageTitle.slice(1)} Stage</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
                            Welcome. Here we focus on understanding the "Why" behind the technical concepts.
                            The Curriculum Agent has personalized your roadmap based on your initial assessments.
                        </p>
                    </div>

                    <button className="glass-button bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/50 text-blue-100 shadow-[0_0_15px_#3b82f633]">
                        Review Learning Contract
                    </button>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LearningPathWidget learningPath={userData?.learning_path} currentStage={userData?.current_stage} />
                    <AccountabilityPartnerWidget />
                    <ProjectArtifactsWidget artifacts={userData?.artifacts} onSubmitArtifact={handleArtifactSubmit} />
                </div>

            </div>
        </DashboardLayout>
    );
}
