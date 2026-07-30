import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

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
        return null;
    }
}

export default function AnalyticsTracker() {
    const location = useLocation();
    const pathname = location.pathname;
    const { user, API_URL } = useAuth();

    const sessionId   = useRef(null);
    const startTime   = useRef(Date.now());
    const lastPage    = useRef(null);
    const isReady     = useRef(false);

    useEffect(() => {
        sessionId.current = getOrCreateSessionId();
        isReady.current   = true;
    }, []);

    const sendPing = useCallback((payload) => {
        if (!isReady.current || !sessionId.current) return;

        const body = JSON.stringify({
            sessionId:        sessionId.current,
            userId:           user?._id || null,
            timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
            ...payload
        });

        const endpoint = `${API_URL}/analytics/track`;

        fetch(endpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true
        }).catch(() => {});
    }, [user, API_URL]);

    useEffect(() => {
        if (!pathname || !isReady.current) return;

        const timer = setTimeout(() => {
            if (lastPage.current !== pathname) {
                lastPage.current = pathname;
                sendPing({ page: pathname });
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [pathname, sendPing]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (lastPage.current) {
                sendPing({ page: lastPage.current });
            }
        }, 30_000);
        return () => clearInterval(interval);
    }, [sendPing]);

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

    useEffect(() => {
        const handleUnload = () => {
            if (lastPage.current) sendPing({ page: lastPage.current });
        };
        window.addEventListener('pagehide', handleUnload);
        return () => window.removeEventListener('pagehide', handleUnload);
    }, [sendPing]);

    return null;
}
