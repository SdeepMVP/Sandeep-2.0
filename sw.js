/* Cache hors-ligne « stale-while-revalidate » : l'app s'ouvre instantanément,
   même sans réseau à la salle ; les mises à jour arrivent au lancement suivant.
   Ajouter tout nouveau fichier à ASSETS et incrémenter CACHE_VERSION. */
var CACHE_VERSION = 'sandeep2-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/core/storage.js',
  './js/core/ui.js',
  './js/core/app.js',
  './js/tabs/muscu.js',
  './js/tabs/garde-robe.js',
  './js/tabs/cuisine.js',
  './js/tabs/habitudes.js',
  './js/settings.js',
  './js/main.js',
  './icons/icon.svg',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE_VERSION).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE_VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    });
  }));
});
