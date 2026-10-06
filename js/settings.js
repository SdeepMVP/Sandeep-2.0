/* Écran Réglages : thème, export / import JSON, effacement. Données : "sandeep2:settings". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  var NS = 'settings';
  var VERSION = '0.1.0';

  function get() { return S2.storage.load(NS, { theme: 'auto', lastExport: null }); }
  function set(patch) {
    var s = get();
    Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
    S2.storage.save(NS, s);
  }

  function applyTheme() {
    var t = get().theme;
    var html = document.documentElement;
    if (t === 'light' || t === 'dark') html.setAttribute('data-theme', t);
    else html.removeAttribute('data-theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute('content', dark ? '#1A1511' : '#F5EFE6');
    });
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  function fileName() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return 'sandeep2-sauvegarde-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json';
  }

  function doExport() {
    var json = JSON.stringify(S2.storage.exportAll(), null, 2);
    var name = fileName();
    var file;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) { file = null; }
    var done = function () { set({ lastExport: new Date().toISOString() }); S2.app.refresh(); ui.toast('Sauvegarde exportée'); };
    /* Sur iPhone : feuille de partage → « Enregistrer dans Fichiers ». */
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).then(done).catch(function (e) {
        if (e && e.name === 'AbortError') return;
        download(json, name); done();
      });
    } else {
      download(json, name); done();
    }
  }

  function download(json, name) {
    var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function copyJson() {
    var json = JSON.stringify(S2.storage.exportAll());
    navigator.clipboard.writeText(json).then(function () {
      set({ lastExport: new Date().toISOString() }); S2.app.refresh();
      ui.toast('JSON copié dans le presse-papiers');
    }, function () { ui.toast('Copie impossible'); });
  }

  function onImportFile(input) {
    var f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var obj;
      try { obj = JSON.parse(reader.result); } catch (e) { ui.toast('Fichier JSON illisible'); return; }
      if (!obj || obj.app !== 'Sandeep 2.0' || !obj.data) { ui.toast('Ce n’est pas une sauvegarde Sandeep 2.0'); return; }
      var muscu = obj.data.muscu;
      var n = muscu && muscu.sessions ? muscu.sessions.length : 0;
      ui.confirm({
        title: 'Importer cette sauvegarde ?',
        message: 'Sauvegarde du ' + (obj.exportedAt ? ui.longDate(obj.exportedAt) : 'date inconnue') + ' (' + n +
          ' séance(s) de muscu). Toutes les données actuelles seront remplacées. Pense à exporter avant si besoin.',
        okLabel: 'Remplacer mes données', danger: true
      }).then(function (ok) {
        if (!ok) return;
        try { S2.storage.importAll(obj); } catch (e) { ui.toast(e.message); return; }
        location.reload();
      });
    };
    reader.readAsText(f);
  }

  function wipe() {
    ui.confirm({ title: 'Tout effacer ?', message: 'Toutes les données de l’app seront supprimées de cet iPhone. Exporte d’abord une sauvegarde.',
      okLabel: 'Continuer', danger: true }).then(function (ok) {
      if (!ok) return;
      return ui.confirm({ title: 'Vraiment sûr ?', message: 'Action définitive.', okLabel: 'Effacer définitivement', danger: true })
        .then(function (ok2) { if (ok2) { S2.storage.clearAll(); location.hash = '#muscu'; location.reload(); } });
    });
  }

  function mount(c) {
    var s = get();
    var themes = [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']];

    c.appendChild(h('h2', { class: 'section-title' }, 'Apparence'));
    c.appendChild(h('div', { class: 'card' },
      h('div', { class: 'field-label' }, 'Thème'),
      h('div', { class: 'segmented' }, themes.map(function (t) {
        return h('button', { class: 'seg' + (s.theme === t[0] ? ' is-active' : ''),
          onclick: function () { set({ theme: t[0] }); applyTheme(); S2.app.refresh(); } }, t[1]);
      })),
      h('p', { class: 'hint' }, 'Auto suit le réglage de l’iPhone.')));

    var fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr-only', id: 'import-file',
      onchange: function () { onImportFile(fileInput); } });

    c.appendChild(h('h2', { class: 'section-title' }, 'Sauvegarde'));
    c.appendChild(h('div', { class: 'card' },
      h('p', { class: 'sheet-text' }, 'Tes données vivent uniquement sur cet iPhone. Exporte régulièrement un fichier JSON (par ex. dans Fichiers ou iCloud Drive).'),
      h('p', { class: 'hint' }, s.lastExport ? 'Dernier export : ' + ui.longDate(s.lastExport) : 'Aucun export pour l’instant.'),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: doExport }, 'Exporter (JSON)'),
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { fileInput.click(); } }, 'Importer un fichier JSON'),
        navigator.clipboard ? h('button', { class: 'btn btn-ghost btn-block', onclick: copyJson }, 'Copier le JSON') : null),
      fileInput));

    c.appendChild(h('h2', { class: 'section-title' }, 'Données'));
    var keys = S2.storage.keys();
    var bytes = keys.reduce(function (n, k) { return n + (localStorage.getItem('sandeep2:' + k) || '').length; }, 0);
    c.appendChild(h('div', { class: 'card' },
      h('p', { class: 'sheet-text' }, 'Espaces : ' + (keys.join(', ') || 'aucun') + ' · ' + ui.num(bytes / 1024, 1) + ' Ko utilisés.'),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: wipe }, 'Tout effacer')));

    c.appendChild(h('h2', { class: 'section-title' }, 'Installer sur l’iPhone'));
    c.appendChild(h('div', { class: 'card' },
      h('ol', { class: 'steps' },
        h('li', null, 'Ouvre cette page dans Safari.'),
        h('li', null, 'Touche le bouton Partager (carré avec une flèche).'),
        h('li', null, 'Choisis « Sur l’écran d’accueil », puis « Ajouter ».'))));

    c.appendChild(h('p', { class: 'hint center' }, 'Sandeep 2.0 · version ' + VERSION));
  }

  S2.settings = { applyTheme: applyTheme, get: get, VERSION: VERSION };

  S2.app.registerTab({
    id: 'reglages', label: 'Réglages', title: 'Réglages', order: 90, mount: mount,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  });
})();
