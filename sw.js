const CACHE_NAME = "pixel-word-v3";
const APP_PREFIX = "/pwhbeta";  // <-- ИСПРАВЬ ЗДЕСЬ

const ASSETS = [
  `${APP_PREFIX}/`,
  `${APP_PREFIX}/index.html`,
  `${APP_PREFIX}/style.css`,
  `${APP_PREFIX}/app.js`,
  `${APP_PREFIX}/words_optimized.js`,
  `${APP_PREFIX}/manifest.json`,
  `${APP_PREFIX}/logo.png`,  // Если нет logo.png — удали или добавь
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
