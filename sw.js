const CACHE_NAME = 'pixel-word-v5';

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
  './assets/logo.png'
];

// Cache-first strategy for static assets
const STATIC_ASSETS = [
  './style.css',
  './bundle.js',
  './manifest.json',
  './assets/favicon.ico',
  './assets/logo.png'
];

// Network-first strategy for dynamic content
const DYNAMIC_CONTENT = [
  './words_optimized.json'
];

// Install event - cache all assets
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

// Fetch event - different strategies for different resources
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip cross-origin requests (e.g., Google Fonts)
  if (url.origin !== location.origin) {
    // Handle Google Fonts specially
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      e.respondWith(
        caches.match(e.request).then((response) => {
          if (response) return response;
          
          return fetch(e.request).then((fetchResponse) => {
            // Cache font files
            if (fetchResponse.ok && (
              url.pathname.endsWith('.woff2') ||
              url.pathname.endsWith('.woff') ||
              url.pathname.endsWith('.ttf')
            )) {
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
    return;
  }

  // Cache-first for static assets
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) {
          console.log('[SW] Cache hit:', url.pathname);
          return response;
        }
        
        console.log('[SW] Cache miss:', url.pathname);
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
    return;
  }

  // Network-first with cache fallback for JSON data
  if (url.pathname.includes('words_optimized.json')) {
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
          console.log('[SW] Network failed, serving from cache:', url.pathname);
          return caches.match(e.request);
        })
    );
    return;
  }

  // Network-first for HTML document (to get fresh content)
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Default: cache-first strategy
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;
      
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
