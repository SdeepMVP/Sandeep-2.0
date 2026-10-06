/* Cache hors-ligne : l'app s'ouvre instantanément, même sans réseau à la salle.
   Mises à jour : à chaque publication, le workflow GitHub Pages remplace __BUILD__
   par l'identifiant du commit. Ce fichier change donc, le navigateur installe le
   nouveau service worker, et js/main.js recharge l'app automatiquement.
   Ajouter tout nouveau fichier à ASSETS (les autres sont mis en cache au premier usage). */
var CACHE_VERSION = 'sandeep2-__BUILD__';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/core/storage.js',
  './js/core/ui.js',
  './js/core/app.js',
  './js/tabs/muscu.js',
  './js/tabs/garde-robe-combos.js',
  './js/tabs/garde-robe-engine.js',
  './js/tabs/garde-robe.js',
  './js/tabs/cuisine-recipes.js',
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
  e.waitUntil(caches.open(CACHE_VERSION).then(function (c) { return c.addAll(ASSETS.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
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
