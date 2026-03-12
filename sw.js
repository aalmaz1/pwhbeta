async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  // fire-and-forget network update
  fetch(request).then(resp => {
    safeCachePut(request, resp);
  }).catch(()=>{/* ignore */});
  return cached || fetch(request).catch(()=> caches.match('./offline.html'));
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return new Response('', { status: 504 });
  }
}

// Message handler for skipWaiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
