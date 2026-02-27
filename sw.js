const CACHE_VERSION = 'v7';
const CACHE_NAME = `pixel-word-${CACHE_VERSION}`;

// Assets with version query params for cache busting
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=7',
  './bundle.js?v=7',
  './app.js',
  './data.js',
  './ui.js',
  './storage.js',
  './words_optimized.json',
  './manifest.json',
  './assets/favicon.ico',
  './assets/logo.png'
];

// Static assets that never change (cache-first forever)
const STATIC_ASSETS = [
  './style.css',
  './style.css?v=7',
  './bundle.js',
  './bundle.js?v=7',
  './manifest.json',
  './assets/favicon.ico',
  './assets/logo.png'
];

// Install event - cache all assets immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Cleaning old caches');
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => {
      // Take control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - optimized caching strategies
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Handle Google Fonts - cache-first with long expiry
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) {
          console.log('[SW] Font cache hit:', url.pathname);
          return response;
        }
        
        return fetch(e.request).then((fetchResponse) => {
          // Cache font files for offline use
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return fetchResponse;
        }).catch(() => {
          // Return empty response for fonts if offline
          return new Response('', { status: 200 });
        });
      })
    );
    return;
  }

  // Skip non-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Helper to normalize URLs (strip query params for cache matching)
  const normalizeUrl = (requestUrl) => {
    const u = new URL(requestUrl);
    u.search = '';
    return u.toString();
  };

  // Cache-first for static assets (JS, CSS, images)
  // Use normalized path (without query params) for matching
  const basePath = url.pathname.split('?')[0];
  if (STATIC_ASSETS.some(asset => basePath.endsWith(asset.replace('./', '').split('?')[0])) ||
      basePath.endsWith('.js') || basePath.endsWith('.css') ||
      basePath.endsWith('.png') || basePath.endsWith('.ico')) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) {
          console.log('[SW] Static cache hit:', url.pathname);
          return response;
        }

        // Try matching without query params for versioned URLs
        const normalizedUrl = normalizeUrl(e.request.url);
        return caches.match(normalizedUrl).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Static cache hit (normalized):', url.pathname);
            return cachedResponse;
          }

          console.log('[SW] Static cache miss:', url.pathname);
          return fetch(e.request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              const normalizedUrl = normalizeUrl(e.request.url);
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseClone);
                if (url.search) {
                  cache.put(normalizedUrl, fetchResponse.clone());
                }
              });
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for JSON data (fast response + background update)
  if (url.pathname.includes('words_optimized.json')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        // Start fetch in background
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
              console.log('[SW] JSON data updated in cache');
            });
          }
          return networkResponse;
        }).catch(() => {
          console.log('[SW] Network failed for JSON');
        });

        // Return cached version immediately, or wait for network
        if (cachedResponse) {
          console.log('[SW] JSON cache hit, serving stale data');
          return cachedResponse;
        }
        
        console.log('[SW] JSON cache miss, waiting for network');
        return fetchPromise;
      })
    );
    return;
  }

  // Network-first for HTML (to get fresh content), fallback to cache
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Network failed, serving cached HTML');
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Default: cache-first strategy
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) {
        console.log('[SW] Default cache hit:', url.pathname);
        return response;
      }
      
      return fetch(e.request).then((fetchResponse) => {
        if (fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return fetchResponse;
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});