import React from 'react';
import { Home, Compass, User, Settings, Bell, Search } from 'lucide-react';

export default function DashboardLayout({ children, userData }) {
    return (
        <div className="min-h-screen flex text-slate-100 font-sans">

            {/* Left Sidebar (Vertical Leg of F-Pattern) */}
            <aside className="w-20 lg:w-64 glass-panel m-4 flex flex-col items-center lg:items-start p-4 transition-all duration-300 z-20">
                <div className="flex items-center gap-3 w-full mb-10 px-2 lg:px-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold">N</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden lg:block tracking-wide">Nexus</span>
                </div>

                <nav className="flex flex-col gap-4 w-full">
                    {[
                        { icon: Home, label: "Home", active: false },
                        { icon: Compass, label: "Discovery", active: true },
                        { icon: User, label: "Mentorship", active: false },
                        { icon: Settings, label: "Settings", active: false },
                    ].map((item, i) => (
                        <button key={i} className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all ${item.active ? 'bg-white/10 shadow-lg border border-white/10 text-blue-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                            <item.icon size={20} className={item.active ? 'text-blue-400' : ''} />
                            <span className="font-medium hidden lg:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col mr-4">
                {/* Top Header (Top Bar of F-Pattern) */}
                <header className="glass-panel mt-4 mb-4 p-4 flex justify-between items-center z-10 sticky top-4">
                    <div className="flex-1 max-w-xl hidden md:flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl border border-white/5 focus-within:border-blue-400/30 transition-colors">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search resources, peers, or artifacts..."
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
                            <Bell size={20} className="text-slate-300" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium">Student</span>
                                <span className="text-xs text-blue-300">Interested Stage</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-[2px]">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student" alt="User" className="w-full h-full rounded-full bg-slate-900" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 pb-4 flex flex-col">
                    {children}
                </main>
            </div>

        </div>
    );
}
