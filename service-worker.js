const CACHE_NAME = 'luna-maths-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json'
];

// External CDN resources - don't cache these in service worker
// Let the browser handle them natively (better iOS Safari support)
const EXTERNAL_URLS = [
    'https://unpkg.com/three',
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip service worker for external CDN resources
    // This fixes iOS Safari "has redirections" error
    const isExternal = EXTERNAL_URLS.some(externalUrl => url.href.startsWith(externalUrl));
    if (isExternal) {
        // Let browser handle external resources natively
        event.respondWith(fetch(event.request));
        return;
    }

    // For local resources, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Don't cache non-successful responses or redirects
                    if (!networkResponse || networkResponse.status !== 200 || 
                        networkResponse.type === 'opaque' ||
                        networkResponse.redirected) {
                        return networkResponse;
                    }

                    // Clone the response before caching
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                });
            })
            .catch(() => {
                // If both cache and network fail, return a fallback for HTML pages
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});
