import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, User, Settings, Bell, Search, X, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);

    const navItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: Compass, label: "Discovery", path: "/discovery" },
        { icon: User, label: "Mentorship", path: "/mentorship" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="min-h-screen flex text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 glass-panel m-4 flex flex-col items-center lg:items-start p-4 transition-all duration-300 z-20 overflow-visible">
                <div className="flex items-center gap-3 w-full mb-10 px-2 lg:px-4 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold cursor-pointer" onClick={() => navigate('/')}>N</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden lg:block tracking-wide cursor-pointer" onClick={() => navigate('/')}>Nexus</span>
                </div>
                <nav className="flex flex-col gap-2 w-full relative z-10">
                    {navItems.map((item, i) => {
                        const active = isActive(item.path);
                        return (
                            <button key={i} onClick={() => navigate(item.path)} className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-white/10 shadow-lg border border-white/10 text-blue-300' : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'}`}>
                                <item.icon size={20} className={active ? 'text-blue-400' : ''} />
                                <span className="font-medium hidden lg:block">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                {/* Logout at bottom */}
                <div className="mt-auto w-full relative z-10 pt-4">
                    <button onClick={logout} className="flex items-center gap-4 w-full p-3 rounded-xl transition-all cursor-pointer hover:bg-red-500/10 text-slate-400 hover:text-red-300 border border-transparent">
                        <LogOut size={20} />
                        <span className="font-medium hidden lg:block">Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col mr-4">
                {/* Header */}
                <header className="glass-panel mt-4 mb-4 p-4 flex justify-between items-center z-30 sticky top-4 overflow-visible">
                    <div className="flex-1 max-w-xl hidden md:flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl border border-white/5 focus-within:border-blue-400/30 transition-colors relative z-10">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search resources, peers, or artifacts..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-4 ml-auto relative z-10">
                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-white/10 transition-colors relative cursor-pointer">
                                <Bell size={20} className="text-slate-300" />
                                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">{unreadCount}</span>}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100]" style={{ overflow: 'hidden' }}>
                                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                                        <h4 className="text-sm font-semibold text-white">Notifications</h4>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Mark all read</button>}
                                            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.unread ? 'bg-blue-500/10' : ''}`} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}>
                                                <div className="flex items-start gap-2">
                                                    {n.unread && <span className="w-2 h-2 mt-1.5 bg-blue-400 rounded-full shrink-0"></span>}
                                                    <div>
                                                        <p className="text-sm text-slate-200">{n.text}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                                <span className="text-xs text-blue-300 capitalize">{user?.current_stage || 'Dependent'} Stage</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-[2px]">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full bg-slate-900" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-blue-300">
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 pb-4 flex flex-col">{children}</main>
            </div>
        </div>
    );
}
