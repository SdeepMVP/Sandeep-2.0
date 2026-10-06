/* Démarrage de l'app. */
(function () {
  'use strict';
  S2.settings.applyTheme();
  S2.app.start();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service worker non enregistré', e); });
  }
})();
