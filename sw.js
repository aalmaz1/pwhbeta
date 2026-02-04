const CACHE_NAME = "pixel-word-v3";
const APP_PREFIX = "/pwhbeta";  // <-- ТВОЙ ПУТЬ GH PAGES!

const ASSETS = [
  `${APP_PREFIX}/`,
  `${APP_PREFIX}/index.html`,
  `${APP_PREFIX}/style.css`,
  `${APP_PREFIX}/app.js`,
  `${APP_PREFIX}/words_optimized.js`,
  `${APP_PREFIX}/convert.js`,  // Если используешь
  `${APP_PREFIX}/manifest.json`,
  // `${APP_PREFIX}/logo.png`,  // Удали, если файла нет!
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keyList => Promise.all(
      keyList.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
