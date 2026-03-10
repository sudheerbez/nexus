/*  Nexus API Service — Real data only, no mock fallbacks
 *  All requests include JWT auth token from localStorage
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
    return localStorage.getItem('nexus_token');
}

async function apiFetch(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.detail || `Request failed (${res.status})`);
    }
    return data;
}

// ─── Auth ────────────────────────────────────────────────

export async function signup(name, email, password) {
    return apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function login(email, password) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function googleLogin(credential) {
    return apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    });
}

// ─── User ────────────────────────────────────────────────

export async function getMe() {
    return apiFetch('/api/me');
}

export async function updateUser(updates) {
    return apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function submitOnboarding(data) {
    return apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ─── Artifacts ──────────────────────────────────────────

export async function submitArtifact(data) {
    return apiFetch('/api/artifacts', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ─── Chat ───────────────────────────────────────────────

export async function sendChatMessage(message) {
    const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
    return data.reply;
}

// ─── Matching ───────────────────────────────────────────

export async function runMatchAlgorithm() {
    return apiFetch('/api/match', { method: 'POST' });
}

export async function getMyPartner() {
    return apiFetch('/api/my-partner');
}

// ─── Assessment ─────────────────────────────────────────

export async function createAssessment(goal, challenges) {
    return apiFetch('/api/assess', {
        method: 'POST',
        body: JSON.stringify({ goal, challenges }),
    });
}

// ─── Notifications ──────────────────────────────────────

export async function getNotifications() {
    return apiFetch('/api/notifications');
}

export async function markAllNotificationsRead() {
    return apiFetch('/api/notifications/read-all', { method: 'POST' });
}

export async function markNotificationRead(notificationId) {
    return apiFetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
}

// ─── Search ─────────────────────────────────────────────

export async function searchAll(query) {
    return apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
}

// ─── Preferences ────────────────────────────────────────

export async function updatePreferences(prefs) {
    return apiFetch('/api/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs),
    });
}
