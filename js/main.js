/* Démarrage de l'app. */
(function () {
  'use strict';
  S2.settings.applyTheme();
  S2.app.start();

  if (sessionStorage.getItem('s2-updated')) {
    sessionStorage.removeItem('s2-updated');
    S2.ui.toast('Application mise à jour');
  }

  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;

  /* Mise à jour automatique : dès qu'une nouvelle version est publiée, le nouveau
     service worker prend le relais et on recharge l'app. Les données sont déjà
     enregistrées à chaque frappe, mais on attend que tu ne sois pas en train de
     saisir (champ actif ou feuille ouverte) pour ne rien interrompre. */
  var hadController = !!navigator.serviceWorker.controller;
  var reloading = false;

  function busy() {
    var a = document.activeElement;
    return (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) ||
      document.getElementById('overlay-root').children.length > 0;
  }
  function applyUpdate() {
    if (busy()) { setTimeout(applyUpdate, 1500); return; }
    sessionStorage.setItem('s2-updated', '1');
    location.reload();
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController) { hadController = true; return; } /* première installation */
    if (reloading) return;
    reloading = true;
    applyUpdate();
  });

  navigator.serviceWorker.register('sw.js').then(function (reg) {
    /* Revérifie à chaque retour dans l'app (l'iPhone la garde souvent en mémoire). */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') reg.update().catch(function () {});
    });
  }).catch(function (e) { console.warn('Service worker non enregistré', e); });
})();
