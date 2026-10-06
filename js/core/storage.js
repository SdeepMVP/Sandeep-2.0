/* Stockage par espace de noms dans localStorage.
   Chaque onglet a sa propre clé : "sandeep2:<ns>". */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var PREFIX = 'sandeep2:';
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
      if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
    }
    return out.sort();
  }

  function exportAll() {
    var data = {};
    keys().forEach(function (ns) { data[ns] = load(ns); });
    return {
      app: 'Sandeep 2.0',
      format: 1,
      exportedAt: new Date().toISOString(),
      data: data
    };
  }

  /* Remplace toutes les données par celles d'un export. Lève une erreur si invalide. */
  function importAll(obj) {
    if (!obj || typeof obj !== 'object' || obj.app !== 'Sandeep 2.0' ||
        !obj.data || typeof obj.data !== 'object') {
      throw new Error('This file is not a Sandeep 2.0 backup.');
    }
    var backup = exportAll();
    try {
      clearAll();
      Object.keys(obj.data).forEach(function (ns) {
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
