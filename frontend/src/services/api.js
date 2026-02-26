/*  Nexus API Service
 *  -  Tries the real backend first (local dev)
 *  -  Falls back to embedded mock data (GitHub Pages / offline)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/* ─── Mock Data ──────────────────────────────────────────── */

const MOCK_USER = {
    id: 1,
    name: "Test Student",
    email: "student@nexus.edu",
    major: "Computer Science",
    career_interest: "Software Engineering",
    current_stage: "interested",
    learning_path: {
        id: 1,
        user_id: 1,
        primary_goal: "Learn Full-Stack Development",
        identified_gaps: '["State Management", "API Design"]',
        dependent_goal: "Understand basic syntax.",
        interested_goal: "Build a React dashboard.",
        involved_goal: "Connect React to FastAPI.",
        self_directed_goal: "Deploy the application.",
    },
    artifacts: [
        {
            id: 1,
            user_id: 1,
            title: "Console Test",
            type: "Code",
            content: "console.log('test')",
            date_submitted: "2026-02-25",
            status: "verified",
            feedback: "Great work! This looks solid. Consider exploring edge cases next.",
        },
    ],
};

const MENTOR_RESPONSES = [
    "That's a great question! Think about what fundamental concept underlies this problem. What would happen if you broke it down into smaller pieces?",
    "I'm here to guide you using Socratic questioning. Rather than giving direct answers, I'll ask questions that help you discover the solution yourself. What specific concept are you struggling with?",
    "Before writing code, let's think through the logic. What inputs does your function need? What output should it produce? Can you trace through an example by hand?",
    "When we feel stuck, it often means we need to revisit our assumptions. What do you already know about this topic? Can you identify the specific part that's confusing?",
    "Consider the trade-offs here. What are the pros and cons of each approach? Which aligns best with the project's goals?",
    "Let's break this into steps. What's the very first thing you'd need to accomplish? Once that's clear, the rest often follows naturally.",
];

let mentorIdx = 0;

/* ─── Helpers ────────────────────────────────────────────── */

async function tryFetch(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

/* ─── Public API ─────────────────────────────────────────── */

export async function fetchDashboard(userId = 1) {
    const data = await tryFetch(`${API_BASE}/dashboard/${userId}`);
    if (data) return data;

    // Merge any locally-saved settings
    const saved = JSON.parse(localStorage.getItem('nexus_user') || 'null');
    return saved ? { ...MOCK_USER, ...saved } : { ...MOCK_USER };
}

export async function submitArtifact(content, userId = 1) {
    const payload = {
        title: "React Project Submission",
        type: "code",
        content,
        date_submitted: new Date().toISOString().split('T')[0],
    };

    const data = await tryFetch(`${API_BASE}/artifacts?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (data) return data;

    // Offline fallback — save locally
    const newArt = { ...payload, id: Date.now(), user_id: userId, status: 'pending', feedback: null };
    const existing = JSON.parse(localStorage.getItem('nexus_artifacts') || '[]');
    existing.push(newArt);
    localStorage.setItem('nexus_artifacts', JSON.stringify(existing));
    return newArt;
}

export async function runMatchAlgorithm() {
    const data = await tryFetch(`${API_BASE}/match`, { method: 'POST' });
    if (data) return data;

    // Offline fallback
    return {
        name: "Alex Chen",
        major: "CS Major",
        score: 92,
        meeting: "Tomorrow, 2:00 PM",
        seed: "Alex",
    };
}

export async function sendChatMessage(message) {
    const data = await tryFetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    if (data) return data.reply;

    // Offline fallback — cycle through canned Socratic responses
    const reply = MENTOR_RESPONSES[mentorIdx % MENTOR_RESPONSES.length];
    mentorIdx++;
    return reply;
}

export async function updateUser(updates, userId = 1) {
    const data = await tryFetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    // Always persist locally too
    const saved = JSON.parse(localStorage.getItem('nexus_user') || '{}');
    localStorage.setItem('nexus_user', JSON.stringify({ ...saved, ...updates }));

    return data || { message: "Saved locally", user: updates };
}
