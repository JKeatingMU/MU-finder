const CACHE_NAME = 'mu-finder-v3';

// Only cache truly static assets — NOT index.html, which references hashed
// JS/CSS filenames that change on every deploy. Caching index.html risks
// serving a stale entry point whose asset references no longer exist.
const urlsToCache = [
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always fetch index.html fresh from the network
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for everything else (hashed JS/CSS assets, manifest, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
