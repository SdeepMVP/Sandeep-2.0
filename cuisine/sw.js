/* Cache hors-ligne de l'app « Gym Food » (dossier cuisine/, portée limitée à ce dossier).
   Même fonctionnement que ../sw.js : le workflow GitHub Pages remplace __BUILD__ par l'identifiant du commit,
   ce qui installe la nouvelle version et recharge l'app. Ajouter ici tout nouveau fichier utilisé par la Muscu ou la Cuisine
   (en particulier les photos de img/recettes/). */
var CACHE_VERSION = 'sandeep2-cuisine-__BUILD__';
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
  '../js/tabs/muscu-engine.js',
  '../js/tabs/muscu.js',
  '../js/tabs/objectif-engine.js',
  '../js/tabs/objectif.js',
  '../js/tabs/cuisine-recipes.js',
  '../js/tabs/cuisine-prices.js',
  '../js/tabs/cuisine-nutrition.js',
  '../js/tabs/cuisine-share.js',
  '../js/tabs/cuisine.js',
  '../js/tabs/ciqual-data.js',
  '../js/tabs/aujourdhui-engine.js',
  '../js/tabs/aujourdhui.js',
  '../js/settings.js',
  '../js/main.js',
  '../img/recettes/b-avocado-egg-toasts.jpg',
  '../img/recettes/b-banana-skyr-pancakes.jpg',
  '../img/recettes/b-cheesecake-oats.jpg',
  '../img/recettes/b-choco-pb-bowlcake.jpg',
  '../img/recettes/b-choco-protein-crepes.jpg',
  '../img/recettes/b-protein-french-toast.jpg',
  '../img/recettes/b-salmon-avocado-toasts.jpg',
  '../img/recettes/m-chicken-avocado-bowl.jpg',
  '../img/recettes/m-chicken-burger.jpg',
  '../img/recettes/m-chicken-cheddar-wraps.jpg',
  '../img/recettes/m-chicken-coconut-curry.jpg',
  '../img/recettes/m-chicken-lasagna.jpg',
  '../img/recettes/m-chicken-mozza-quesadillas.jpg',
  '../img/recettes/m-creamy-chicken-gnocchi.jpg',
  '../img/recettes/m-creamy-chicken-pasta.jpg',
  '../img/recettes/m-creamy-pesto-chicken-pasta.jpg',
  '../img/recettes/m-garlic-shrimp-rice.jpg',
  '../img/recettes/m-shrimp-risotto.jpg',
  '../img/recettes/m-tuna-baked-potatoes.jpg',
  '../img/recettes/m-tuna-pasta-bake.jpg',
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
    /* Ne supprime que les anciennes versions de l'app Cuisine : l'app complète (../sw.js) a ses propres caches. */
    return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION && k.indexOf('sandeep2-cuisine-') === 0; })
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
