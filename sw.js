// Daily Confidence — Service Worker
// Caches the app on first load so it works offline forever after.

const CACHE_NAME = ‘confidence-tracker-v2’;
const ASSETS = [
‘./’,
‘./index.html’
];

// On install: pre-cache the app shell
self.addEventListener(‘install’, (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
);
self.skipWaiting();
});

// On activate: clean up old caches
self.addEventListener(‘activate’, (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
)
)
);
self.clients.claim();
});

// On fetch: serve from cache first, fall back to network, then cache new responses
self.addEventListener(‘fetch’, (event) => {
// Only handle GET requests
if (event.request.method !== ‘GET’) return;

event.respondWith(
caches.match(event.request).then((cached) => {
if (cached) return cached;

```
  return fetch(event.request)
    .then((response) => {
      // Cache successful responses for next time
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    })
    .catch(() => {
      // Offline and nothing cached — return a basic offline response
      return new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    });
})
```

);
});