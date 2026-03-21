'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Stable session ID persisted for the browser tab lifetime
function getOrCreateSessionId() {
    try {
        let sid = sessionStorage.getItem('_traceit_sid');
        if (!sid) {
            sid = crypto.randomUUID?.() ||
                  (Math.random().toString(36).slice(2) + Date.now().toString(36));
            sessionStorage.setItem('_traceit_sid', sid);
        }
        return sid;
    } catch {
        // SSR guard
        return null;
    }
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const { user, API_URL } = useAuth();

    // All mutable refs — never cause re-renders
    const sessionId   = useRef(null);
    const startTime   = useRef(Date.now());
    const lastPage    = useRef(null);
    const isReady     = useRef(false);

    // Initialize session ID client-side only
    useEffect(() => {
        sessionId.current = getOrCreateSessionId();
        isReady.current   = true;
    }, []);

    // ── Core ping function (stable via callback, no stale closure issues) ─────
    const sendPing = useCallback((payload) => {
        if (!isReady.current || !sessionId.current) return;

        const body = JSON.stringify({
            sessionId:        sessionId.current,
            userId:           user?._id || null,
            timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
            ...payload
        });

        const endpoint = `${API_URL}/analytics/track`;

        // Use reliable fetch (not sendBeacon — sendBeacon can fail with CORS)
        fetch(endpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true    // works on page unload too in modern browsers
        }).catch(() => {
            // Silently ignore network errors — analytics should never break the app
        });
    }, [user, API_URL]);

    // ── Page view tracking ────────────────────────────────────────────────────
    useEffect(() => {
        if (!pathname || !isReady.current) return;

        // Small delay to ensure sessionId is initialized on first render
        const timer = setTimeout(() => {
            if (lastPage.current !== pathname) {
                lastPage.current = pathname;
                sendPing({ page: pathname });
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [pathname, sendPing]);

    // ── Heartbeat every 30 s (updates time-spent for active sessions) ─────────
    useEffect(() => {
        const interval = setInterval(() => {
            if (lastPage.current) {
                sendPing({ page: lastPage.current });
            }
        }, 30_000);
        return () => clearInterval(interval);
    }, [sendPing]);

    // ── Click tracking ────────────────────────────────────────────────────────
    useEffect(() => {
        const handleClick = (e) => {
            const el = e.target.closest('button, a, [data-track]');
            if (!el) return;

            const label = (
                el.getAttribute('data-track')  ||
                el.getAttribute('aria-label')  ||
                el.innerText?.trim()?.slice(0, 60) ||
                el.getAttribute('href')        ||
                'unknown'
            ).trim();

            if (label) {
                sendPing({
                    page:  lastPage.current || pathname,
                    event: { type: 'click', label }
                });
            }
        };

        document.addEventListener('click', handleClick, { passive: true });
        return () => document.removeEventListener('click', handleClick);
    }, [pathname, sendPing]);

    // ── Page unload — record final time spent ─────────────────────────────────
    useEffect(() => {
        const handleUnload = () => {
            if (lastPage.current) sendPing({ page: lastPage.current });
        };
        window.addEventListener('pagehide', handleUnload);
        return () => window.removeEventListener('pagehide', handleUnload);
    }, [sendPing]);

    return null;
}
