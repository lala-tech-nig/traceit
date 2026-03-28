// Minimal Service Worker to satisfy PWA requirements

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // We just pass through all requests for basic installation capability
    event.respondWith(fetch(event.request));
});
