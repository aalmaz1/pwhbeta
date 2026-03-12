// sw.js — final robust service worker for pixel-word
// Bump CACHE_VERSION on deploy to force clients to update
const CACHE_VERSION = 'v13';
const CACHE_NAME = `pixel-word-${CACHE_VERSION}`;

// Core assets to precache. Remove manifest if you don't host it at root.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './bundle.js',
  './app.js',
  './data.js',
  './ui.js',
  './storage.js',
  './words_optimized.json',
  './assets/favicon.ico',
  './assets/logo.png'
];

// INSTALL: precache core assets (fail-safe)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(ASSETS_TO_CACHE);
      } catch (err) {
        // don't block install on partial failures
        console.warn('Precache failed (some assets may be missing):', err);
      }
    })
  );
});

// ACTIVATE: cleanup old caches, enable navigation preload, claim clients
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // enable navigation preload if supported
    if (self.registration && self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) { /* ignore */ }
    }

    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();

    // notify clients about new version
    try {
      const clientsArr = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsArr) {
        client.postMessage({ type: 'NEW_VERSION_AVAILABLE', version: CACHE_VERSION });
      }
    } catch (e) { /* ignore */ }
  })());
});

// Utility: safe cache put (clone inside, only cache GET and successful/opaque responses)
async function safeCachePut(request, response) {
  try {
    if (!request || !response) return;
    if (request.method !== 'GET') return;
    if (!(response.ok || response.type === 'opaque')) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (err) {
    // ignore quota/opaque errors
    console.warn('safeCachePut failed', err);
  }
}

// FETCH: route requests with clear strategies
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass SW for sensitive API/admin endpoints (network-only)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/admin')) {
    event.respondWith(networkOnly(req));
    return;
  }

  // Google Fonts: cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Large JSON (word list): stale-while-revalidate
  if (url.pathname.endsWith('words_optimized.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Navigation / HTML: network-first with navigation preload support
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirstWithPreload(event));
    return;
  }

  // Static assets: cache-first
  if (['script', 'style', 'image', 'font'].includes(req.destination)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

// Strategy: cache-first
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    safeCachePut(request, response);
    return response;
  } catch (err) {
    if (request.mode === 'navigate') {
      return (await caches.match('./offline.html')) || new Response('', { status: 504, statusText: 'Offline' });
    }
    return new Response('', { status: 504, statusText: 'Network error' });
  }
}

// Strategy: network-first with navigation preload support
async function networkFirstWithPreload(event) {
  const request = event.request;
  try {
    // use navigation preload if available (faster)
    if (self.registration && self.registration.navigationPreload && event.preloadResponse)
    {
      const preloadResp = await event.preloadResponse;
      safeCachePut(request, preloadResp);
      return preloadResp;
    }

    const networkResp = await fetch(request);
    safeCachePut(request, networkResp);
    return networkResp;
  } catch (err) {
    const cache = await caches.open(CACHE_NAME);
    const cached = (await cache.match(request)) ||
                   (await cache.match('./index.html')) ||
                   (await cache.match('./offline.html'));
    return cached || new Response('', { status: 504, statusText: 'Network error' });
  }
}

// Strategy: stale-while-revalidate (single network fetch, background update)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(resp => {
      if (resp && (resp.ok || resp.type === 'opaque')) {
        safeCachePut(request, resp);
      }
      return resp;
    })
    .catch(() => null);

  if (cached) {
    // return cached immediately, update in background
    networkPromise.catch(()=>{/* ignore */});
    return cached;
  }

  const netResp = await networkPromise;
  if (netResp) return netResp;
  return (await caches.match('./offline.html')) || new Response('', { status: 504, statusText: 'Offline' });
}

// Strategy: network-only with offline fallback
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return (await caches.match('./offline.html')) || new Response('', { status: 504, statusText: 'Network error' });
  }
}

// Message handler: skipWaiting and version queries
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GETCACHEVERSION') {
    // event.source may be undefined in some contexts; guard it
    try {
      event.source && event.source.postMessage({ type: 'CACHEVERSION', version: CACHE_VERSION });
    } catch (e) { / ignore / }
  }
});

// Optional placeholders for push/sync if you add those features later
// self.addEventListener('push', event => { / handle push / });
// self.addEventListener('sync', event => { / handle background sync / });
