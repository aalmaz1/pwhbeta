const CACHE_NAME = 'pixel-word-v2';

self.addEventListener('install', (e) => {
  e.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((res) =>
      res || fetch(e.request).then((fetchRes) => fetchRes)
    )
  );
});
