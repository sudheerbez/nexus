import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    404
                </div>
                <h1 className="text-2xl font-semibold text-white">Page Not Found</h1>
                <p className="text-slate-400 max-w-md">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="glass-button text-sm"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="glass-button text-sm bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200"
                    >
                        <Home size={16} /> Home
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
