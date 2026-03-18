const CACHE_VERSION = 'v13';
const CACHE_NAME = `pixel-word-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './bundle.js',
  './app.js',
  './data.js',
  './ui.js',
  './storage.js',
  './words_optimized.json',
  './manifest.json',
  './assets/favicon.ico',
  './assets/logo.png',
  './assets/press-start-2p.woff2'
];

// Установка — кешируем всё сразу
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Активация — чистим старые кеши и уведомляем клиентов
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(async () => {
      const clientsArr = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsArr) {
        client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
      }
    })
  );
  self.clients.claim();
});

// Фетч — разные стратегии
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

// Google Fonts — cache-first
if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;
      return fetch(event.request).then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return r;
      });
    })
  );
  return;
}

// JSON — stale-while-revalidate
if (url.pathname.endsWith('words_optimized.json')) {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return r;
      });
      return cached || fetchPromise;
    })
  );
  return;
}

// HTML — network-first
if (url.pathname.endsWith('.html') || url.pathname === '') {
  event.respondWith(
    fetch(event.request).then(r => {
      if (r.ok) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return r;
    }).catch(() => caches.match('./index.html'))
  );
  return;
}

// Остальное — cache-first
event.respondWith(
  caches.match(event.request).then(resp => {
    if (resp) return resp;
    return fetch(event.request).then(r => {
      if (r.ok) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return r;
    });
  })
);

// Сообщения от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
