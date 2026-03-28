// Minimal Service Worker to satisfy PWA requirements

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Let API requests bypass the service worker entirely
    // This prevents noisy 'Uncaught in promise' errors when the backend is sleeping/starting up
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch((err) => {
            console.warn('SW Fetch Error:', err);
            throw err;
        })
    );
});
