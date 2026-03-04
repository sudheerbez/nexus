import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/api';
import { User, Moon, Sun, Bell, Shield, Palette, Check, Loader2, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const { user, logout, refreshUser } = useAuth();
    const [darkMode, setDarkMode] = useState(true);
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [privacy, setPrivacy] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [major, setMajor] = useState(user?.major || '');
    const [careerInterest, setCareerInterest] = useState(user?.career_interest || '');

    const Toggle = ({ enabled, onToggle }) => (
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${enabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    const handleSave = async () => {
        setSaving(true); setSaved(false); setError('');
        try {
            await updateUser({ name, email, major, career_interest: careerInterest });
            await refreshUser();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                <div className="glass-card p-8 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-l-4 border-l-slate-400">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Settings</h1>
                    <p className="mt-2 text-slate-300 text-sm">Manage your account preferences and application settings.</p>
                </div>

                {/* Profile */}
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><User size={20} /></div>
                        <h3 className="font-semibold text-xl text-white">Profile</h3>
                        <span className="ml-auto text-xs text-slate-500 capitalize">Auth: {user?.auth_provider}</span>
                    </div>
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Major</label>
                            <input type="text" value={major} onChange={e => setMajor(e.target.value)} className="glass-input text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Career Interest</label>
                            <input type="text" value={careerInterest} onChange={e => setCareerInterest(e.target.value)} className="glass-input text-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end mt-2">
                        {saved && <span className="text-sm text-green-400 flex items-center gap-1"><Check size={14} /> Saved!</span>}
                        <button onClick={handleSave} disabled={saving} className="glass-button bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200 disabled:opacity-50">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="glass-card p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Palette size={20} /></div>
                        <h3 className="font-semibold text-xl text-white">Preferences</h3>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            {darkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />}
                            <div>
                                <p className="text-sm text-white font-medium">Dark Mode</p>
                                <p className="text-xs text-slate-400">Use dark theme across the application</p>
                            </div>
                        </div>
                        <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Bell size={18} className="text-pink-400" />
                            <div>
                                <p className="text-sm text-white font-medium">Notifications</p>
                                <p className="text-xs text-slate-400">Receive alerts for feedback and meetings</p>
                            </div>
                        </div>
                        <Toggle enabled={notifEnabled} onToggle={() => setNotifEnabled(!notifEnabled)} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-green-400" />
                            <div>
                                <p className="text-sm text-white font-medium">Privacy</p>
                                <p className="text-xs text-slate-400">Profile visible to accountability partners only</p>
                            </div>
                        </div>
                        <Toggle enabled={privacy} onToggle={() => setPrivacy(!privacy)} />
                    </div>
                </div>

                {/* Logout */}
                <div className="glass-card p-6">
                    <button onClick={logout} className="glass-button bg-red-500/20 hover:bg-red-500/40 border-red-400/30 text-red-200 w-full justify-center">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
