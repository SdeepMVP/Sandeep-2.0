/* Cache hors-ligne de l'app « Dressing » (dossier dressing/, portée limitée à ce dossier).
   Même fonctionnement que ../sw.js : le workflow GitHub Pages remplace __BUILD__ par l'identifiant du commit,
   ce qui installe la nouvelle version et recharge l'app. Ajouter ici tout nouveau fichier utilisé par la Garde-robe. */
var CACHE_VERSION = 'sandeep2-dressing-__BUILD__';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './config.js',
  '../css/app.css',
  '../js/core/i18n.js',
  '../js/core/storage.js',
  '../js/core/ui.js',
  '../js/core/app.js',
  '../js/tabs/garde-robe-combos.js',
  '../js/tabs/garde-robe-engine.js',
  '../js/tabs/garde-robe.js',
  '../js/settings.js',
  '../js/main.js',
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
    /* Ne supprime que les anciennes versions de l'app Dressing : l'app principale (../sw.js) a ses propres caches. */
    return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION && k.indexOf('sandeep2-dressing-') === 0; })
      .map(function (k) { return caches.delete(k); }));
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
