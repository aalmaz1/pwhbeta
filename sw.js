// Network-first with navigation preload support (used for navigations)
async function networkFirstWithPreload(event) {
  const request = event.request;
  try {
    // Use navigation preload response if available (faster)
    const preloadResp = await event.preloadResponse;
    if (preloadResp) {
      safeCachePut(request, preloadResp);
      return preloadResp;
    }

    const networkResp = await fetch(request);
    safeCachePut(request, networkResp);
    return networkResp;
  } catch (err) {
    // fallback to cache or offline page
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request)  await cache.match('./index.html')  await cache.match('./offline.html');
    return cached || new Response('', { status: 504, statusText: 'Network error' });
  }
}

// Stale-while-revalidate: return cache immediately if present, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Start network fetch once and reuse the promise
  const networkPromise = fetch(request)
    .then(resp => {
      if (resp && (resp.ok || resp.type === 'opaque')) {
        safeCachePut(request, resp);
      }
      return resp;
    })
    .catch(() => null);

  if (cached) {
    // Return cached immediately, but ensure background update runs
    networkPromise.catch(()=>{/* ignore */});
    return cached;
  }

  // No cache: wait for network, fallback to offline
  const netResp = await networkPromise;
  if (netResp) return netResp;
  return caches.match('./offline.html') || new Response('', { status: 504, statusText: 'Offline' });
}

// Network-only with offline fallback
async function networkOnly(request) {
  try {
    const resp = await fetch(request);
    return resp;
  } catch (err) {
    const cached = await caches.match('./offline.html');
    return cached || new Response('', { status: 504, statusText: 'Network error' });
  }
}

// Message handler for skipWaiting and other commands
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // allow clients to request cache version
  if (event.data.type === 'GET_CACHE_VERSION') {
    event.source.postMessage({ type: 'CACHE_VERSION', version: CACHE_VERSION });
  }
});

// Optional: listen for push events or sync events if needed (placeholders)
// self.addEventListener('push', event => { /* handle push */ });
// self.addEventListener('sync', event => { /* handle background sync */ });
