/* Langue de l'interface : français uniquement depuis la v0.39 (anglais auparavant au choix dans Réglages).
   Usage partout : S2.L('English text', 'Texte français') — seul le texte français est affiché ; l'anglais reste dans le code.
   Les données enregistrées ne sont jamais traduites : seul l'affichage change. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  /* Depuis la v0.39 (7 novembre 2026), les trois apps (Habits, Dressing, Gym Food) sont en français uniquement :
     la langue est imposée, il n'y a plus de choix dans Réglages. Le champ lang déjà enregistré est ignoré. */
  var lang = 'fr';
  S2.langForced = true;

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
