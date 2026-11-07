/* Stockage par espace de noms dans localStorage.
   Chaque onglet a sa propre clé : "sandeep2:<ns>". */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var PREFIX = 'sandeep2:';
  /* App dérivée (ex. cuisine/) : window.S2_APP.storage = liste des espaces qu'elle possède. Export, import et
     effacement se limitent alors à ces espaces, pour ne jamais toucher aux données de l'app complète
     si les deux partagent le stockage sur le même iPhone. */
  var SCOPE = window.S2_APP && window.S2_APP.storage || null;
  function inScope(ns) { return !SCOPE || SCOPE.indexOf(ns) > -1; }
  var listeners = [];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load(ns, defaults) {
    try {
      var raw = localStorage.getItem(PREFIX + ns);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Lecture impossible pour', ns, e);
    }
    return defaults === undefined ? null : clone(defaults);
  }

  function save(ns, data) {
    try {
      localStorage.setItem(PREFIX + ns, JSON.stringify(data));
      listeners.forEach(function (fn) { fn(ns, true); });
      return true;
    } catch (e) {
      console.error('Écriture impossible pour', ns, e);
      listeners.forEach(function (fn) { fn(ns, false); });
      return false;
    }
  }

  function keys() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0 && inScope(k.slice(PREFIX.length))) out.push(k.slice(PREFIX.length));
    }
    return out.sort();
  }

  function exportAll() {
    var data = {};
    keys().forEach(function (ns) { data[ns] = load(ns); });
    return {
      app: 'Sandeep 2.0', /* marqueur du format de sauvegarde (commun aux 3 apps) : ne jamais changer */
      format: 1,
      exportedAt: new Date().toISOString(),
      data: data
    };
  }

  /* Remplace toutes les données par celles d'un export. Lève une erreur si invalide. */
  function importAll(obj) {
    if (!obj || typeof obj !== 'object' || obj.app !== 'Sandeep 2.0' ||
        !obj.data || typeof obj.data !== 'object') {
      throw new Error(S2.L ? S2.L('This file is not a backup of this app.', 'Ce fichier n’est pas une sauvegarde de cette app.') : 'This file is not a backup of this app.');
    }
    var backup = exportAll();
    try {
      clearAll();
      Object.keys(obj.data).filter(inScope).forEach(function (ns) {
        localStorage.setItem(PREFIX + ns, JSON.stringify(obj.data[ns]));
      });
    } catch (e) {
      clearAll();
      Object.keys(backup.data).forEach(function (ns) {
        localStorage.setItem(PREFIX + ns, JSON.stringify(backup.data[ns]));
      });
      throw new Error('Import failed (storage full?). Previous data restored.');
    }
  }

  function clearAll() {
    keys().forEach(function (ns) { localStorage.removeItem(PREFIX + ns); });
  }

  function onSave(fn) { listeners.push(fn); }

  S2.storage = {
    load: load, save: save, keys: keys,
    exportAll: exportAll, importAll: importAll, clearAll: clearAll,
    onSave: onSave
  };
})();
