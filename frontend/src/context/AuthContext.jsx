import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('nexus_token');
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = { detail: "Invalid JSON response" };
    }

    if (!res.ok) {
        throw new Error(data.detail || 'Request failed');
    }

    return data;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('nexus_token'));
    const [loading, setLoading] = useState(true);

    // Load user on mount if token exists
    useEffect(() => {
        if (token) {
            apiFetch('/api/me')
                .then(u => { setUser(u); setLoading(false); })
                .catch(() => { logout(); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, []);

    const saveAuth = (tokenData) => {
        localStorage.setItem('nexus_token', tokenData.access_token);
        setToken(tokenData.access_token);
        setUser(tokenData.user);
    };

    const signup = async (name, email, password) => {
        const data = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        saveAuth(data);
        return data.user;
    };

    const login = async (email, password) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        saveAuth(data);
        return data.user;
    };

    const googleLogin = async (credential) => {
        const data = await apiFetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });
        saveAuth(data);
        return data.user;
    };

    const logout = useCallback(() => {
        localStorage.removeItem('nexus_token');
        setToken(null);
        setUser(null);
    }, []);

    const refreshUser = async () => {
        const u = await apiFetch('/api/me');
        setUser(u);
        return u;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token && !!user,
                signup,
                login,
                googleLogin,
                logout,
                refreshUser,
                apiFetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export { apiFetch };
