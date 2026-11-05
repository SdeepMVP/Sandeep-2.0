/* Langue de l'interface : anglais (par défaut) ou français, choisie dans Réglages (clé "sandeep2:settings", champ lang).
   Usage partout : S2.L('English text', 'Texte français'). Changer de langue recharge l'app (S2.setLang),
   donc les libellés calculés au chargement (onglets, constantes) suivent aussi.
   Les données enregistrées ne sont jamais traduites : seul l'affichage change.
   Une app dérivée (ex. cuisine/) peut imposer sa langue via window.S2_APP = { lang: 'fr' } : le choix est alors fixe. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var lang = 'en';
  try {
    var s = JSON.parse(localStorage.getItem('sandeep2:settings') || 'null');
    if (s && s.lang === 'fr') lang = 'fr';
  } catch (e) { /* stockage indisponible : anglais */ }
  var cfg = window.S2_APP || {};
  if (cfg.lang === 'fr' || cfg.lang === 'en') lang = cfg.lang;
  S2.langForced = !!cfg.lang;

  S2.lang = lang;
  S2.locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  S2.L = function (en, fr) { return lang === 'fr' && fr !== undefined && fr !== null ? fr : en; };
  S2.setLang = function (l) {
    if (S2.langForced) return;
    var s = {};
    try { s = JSON.parse(localStorage.getItem('sandeep2:settings') || '{}') || {}; } catch (e) { s = {}; }
    s.lang = l === 'fr' ? 'fr' : 'en';
    localStorage.setItem('sandeep2:settings', JSON.stringify(s));
    location.reload();
  };
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
})();
