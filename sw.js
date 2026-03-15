// sw.js — ИСПРАВЛЕННЫЙ Service Worker для Pixel Word Hunter
// 🔒 Защита от утечки XP между аккаунтами

const CACHE_VERSION = 'v16';
const BASE_CACHE_NAME = `pixel-word-${CACHE_VERSION}`;

// 🚫 ПУТИ КОТОРЫЕ НЕЛЬЗЯ КЭШИРОВАТЬ (game state)
const NO_CACHE_PATHS = ['state', 'xp', 'localStorage', 'game-data', 'progress'];

function getCacheName(userUid = 'default') {
  return userUid ? `${BASE_CACHE_NAME}-${userUid}` : BASE_CACHE_NAME;
}

// Core assets to precache
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

// INSTALL: precache core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(getCacheName()).then(async cache => {
      try {
        await cache.addAll(ASSETS_TO_CACHE);
        console.log('✅ SW: Assets закешированы');
      } catch (err) {
        console.warn('⚠️ SW: Precache частично не удался:', err);
      }
    })
  );
});

// ACTIVATE: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (self.registration?.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) { /* ignore */ }
    }

    const keys = await caches.keys();
    const currentCache = getCacheName();
    
    // Удаляем старые кэши
    for (const key of keys) {
      if (key.startsWith('pixel-word-') && key !== currentCache) {
        console.log('💥 SW: Удалён старый кэш:', key);
        await caches.delete(key);
      }
    }
    
    await self.clients.claim();
    console.log('✅ SW: Активирован, кэш:', currentCache);
  })());
});

// 🚫 ПРОВЕРКА: нужно ли блокировать кэширование
function isBlockedFromCache(url) {
  const urlStr = url.toLowerCase();
  return NO_CACHE_PATHS.some(blocked => urlStr.includes(blocked));
}

// FETCH: с блокировкой state/xp
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 🚫 БЛОКИРОВКА: state, xp, localStorage
  if (isBlockedFromCache(url.pathname) || isBlockedFromCache(url.search)) {
    console.log('🚫 SW: Заблокировано кэширование:', url.pathname);
    event.respondWith(fetch(req));
    return;
  }

  // Firestore API - всегда сеть
  if (url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(fetch(req));
    return;
  }

  // Sensitive endpoints - всегда сеть
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/admin')) {
    event.respondWith(networkOnly(req));
    return;
  }

  // Google Fonts - cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Large JSON (words) - stale-while-revalidate
  if (url.pathname.endsWith('words_optimized.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Navigation / HTML - network-first
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static assets - cache-first
  if (['script', 'style', 'image', 'font'].includes(req.destination)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default - stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

// Strategy: cache-first
async function cacheFirst(request) {
  const cache = await caches.open(getCacheName());
  const cached = await cache.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      cache.put(request, clone);
    }
    return response;
  } catch (err) {
    if (request.mode === 'navigate') {
      return (await caches.match('./offline.html')) || new Response('', { status: 504 });
    }
    return new Response('', { status: 504 });
  }
}

// Strategy: network-first
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (err) {
    const cache = await caches.open(getCacheName());
    const cached = await cache.match(request) || await cache.match('./index.html') || await cache.match('./offline.html');
    return cached || new Response('', { status: 504 });
  }
}

// Strategy: stale-while-revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(getCacheName());
  let cached = await cache.match(request);

  const networkPromise = fetch(request).then(async resp => {
    if (resp && (resp.ok || resp.type === 'opaque')) {
      const clone = resp.clone();
      cache.put(request, clone);
    }
    return resp;
  }).catch(() => null);

  return (await networkPromise) || cached || new Response('', { status: 504 });
}

// Strategy: network-only
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return (await caches.match('./offline.html')) || new Response('', { status: 504 });
  }
}

// 📬 MESSAGE HANDLER: команды от приложения
self.addEventListener('message', event => {
  if (!event.data) return;
  
  console.log('📬 SW: Получено сообщение:', event.data);

  // SKIP_WAITING - обновить SW
  if (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING') {
    self.skipWaiting();
    console.log('✅ SW: skipWaiting');
  }

  // RESET_CACHE - очистить кэш при смене пользователя
  if (event.data.type === 'RESET_CACHE' || event.data === 'RESET_CACHE') {
    console.log('💥 SW: Получена команда RESET_CACHE');
    
    caches.keys().then(async keys => {
      for (const key of keys) {
        if (key.startsWith('pixel-word-')) {
          await caches.delete(key);
          console.log('💥 SW: Удалён кэш:', key);
        }
      }
      
      // Отправить подтверждение
      event.source?.postMessage({ type: 'CACHE_RESET_COMPLETE' });
      console.log('✅ SW: Все кэши очищены');
    });
  }

  // SET_USER_UID - установить UID для персонального кэша
  if (event.data.type === 'SET_USER_UID') {
    const newUid = event.data.uid;
    console.log('👤 SW: Новый UID:', newUid);
    
    // Открыть кэш с новым именем
    caches.open(getCacheName(newUid)).then(() => {
      console.log('✅ SW: Кэш для UID', newUid, 'готов');
    });
  }

  // GETCACHEVERSION
  if (event.data.type === 'GETCACHEVERSION') {
    event.source?.postMessage({ type: 'CACHEVERSION', version: CACHE_VERSION });
  }
});

console.log('✅ SW: Загружен, версия:', CACHE_VERSION);
