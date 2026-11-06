/* Écran Réglages : langue, thème, export / import JSON, effacement. Données : "sandeep2:settings". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, L = S2.L;
  var NS = 'settings';
  var VERSION = '0.30.0';

  function get() {
    var s = S2.storage.load(NS, null) || {};
    if (!s.theme) s.theme = 'auto'; /* réglages enregistrés par S2.setLang avant tout choix de thème */
    if (s.lastExport === undefined) s.lastExport = null;
    return s;
  }
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
    return 'sandeep2-backup-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json';
  }

  function doExport() {
    var json = JSON.stringify(S2.storage.exportAll(), null, 2);
    var name = fileName();
    var file;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) { file = null; }
    var done = function () { set({ lastExport: new Date().toISOString() }); S2.app.refresh(); ui.toast(L('Backup exported', 'Sauvegarde exportée')); };
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
      ui.toast(L('JSON copied to clipboard', 'JSON copié dans le presse-papiers'));
    }, function () { ui.toast(L('Copy failed', 'La copie a échoué')); });
  }

  function onImportFile(input) {
    var f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var obj;
      try { obj = JSON.parse(reader.result); } catch (e) { ui.toast(L('Unreadable JSON file', 'Fichier JSON illisible')); return; }
      if (!obj || obj.app !== 'Sandeep 2.0' || !obj.data) { ui.toast(L('This is not a Sandeep 2.0 backup', 'Ce n’est pas une sauvegarde Sandeep 2.0')); return; }
      var muscu = obj.data.muscu;
      var n = muscu && muscu.sessions ? muscu.sessions.length : 0;
      var hasGym = S2.app.tabs().some(function (t) { return t.id === 'muscu'; });
      ui.confirm({
        title: L('Import this backup?', 'Importer cette sauvegarde ?'),
        message: L('Backup from ', 'Sauvegarde du ') + (obj.exportedAt ? ui.longDate(obj.exportedAt) : L('unknown date', 'date inconnue')) +
          (hasGym ? ' (' + n + L(' gym workout(s))', ' séance(s) de muscu)') : '') +
          L('. All current data will be replaced. Export first if needed.', '. Toutes les données actuelles seront remplacées. Exporte d’abord si besoin.'),
        okLabel: L('Replace my data', 'Remplacer mes données'), danger: true
      }).then(function (ok) {
        if (!ok) return;
        try { S2.storage.importAll(obj); } catch (e) { ui.toast(e.message); return; }
        location.reload();
      });
    };
    reader.readAsText(f);
  }

  function wipe() {
    ui.confirm({ title: L('Erase everything?', 'Tout effacer ?'),
      message: L('All app data will be deleted from this iPhone. Export a backup first.', 'Toutes les données de l’app seront supprimées de cet iPhone. Exporte d’abord une sauvegarde.'),
      okLabel: L('Continue', 'Continuer'), danger: true }).then(function (ok) {
      if (!ok) return;
      return ui.confirm({ title: L('Are you sure?', 'Vraiment ?'), message: L('This cannot be undone.', 'C’est irréversible.'),
        okLabel: L('Erase permanently', 'Effacer définitivement'), danger: true })
        .then(function (ok2) { if (ok2) { S2.storage.clearAll(); location.hash = ''; location.reload(); } });
    });
  }

  function checkUpdate() {
    if (!('serviceWorker' in navigator)) { ui.toast(L('Updates unavailable here', 'Mises à jour indisponibles ici')); return; }
    navigator.serviceWorker.getRegistration().then(function (reg) {
      if (!reg) { ui.toast(L('Open the app from its online address', 'Ouvre l’app depuis son adresse en ligne')); return; }
      return reg.update().then(function () {
        ui.toast(reg.installing || reg.waiting ? L('Updating…', 'Mise à jour…') : L('You have the latest version', 'Tu as la dernière version'));
      });
    }).catch(function () { ui.toast(L('No network: try again later', 'Pas de réseau : réessaie plus tard')); });
  }

  function mount(c) {
    var s = get();
    var themes = [['auto', 'Auto'], ['light', L('Light', 'Clair')], ['dark', L('Dark', 'Sombre')]];
    var langs = [['en', 'English'], ['fr', 'Français']];

    /* Langue de toute l'app : enregistrée puis rechargement (les données ne changent pas). */
    if (!S2.langForced) c.appendChild(h('h2', { class: 'section-title' }, L('Language', 'Langue')));
    if (!S2.langForced) c.appendChild(h('div', { class: 'card' },
      h('div', { class: 'segmented' }, langs.map(function (l) {
        return h('button', { class: 'seg' + (S2.lang === l[0] ? ' is-active' : ''), lang: l[0], 'aria-pressed': S2.lang === l[0] ? 'true' : 'false',
          onclick: function () { if (S2.lang !== l[0]) S2.setLang(l[0]); } }, l[1]);
      })),
      h('p', { class: 'hint' }, L('Changes the whole app. Your data stays the same; names you typed yourself are not translated.',
        'Change toute l’app. Tes données ne changent pas ; les noms que tu as saisis toi-même ne sont pas traduits.'))));

    c.appendChild(h('h2', { class: 'section-title' }, L('Appearance', 'Apparence')));
    c.appendChild(h('div', { class: 'card' },
      h('div', { class: 'field-label' }, L('Theme', 'Thème')),
      h('div', { class: 'segmented' }, themes.map(function (t) {
        return h('button', { class: 'seg' + (s.theme === t[0] ? ' is-active' : ''),
          onclick: function () { set({ theme: t[0] }); applyTheme(); S2.app.refresh(); } }, t[1]);
      })),
      h('p', { class: 'hint' }, L('Auto follows your iPhone setting.', 'Auto suit le réglage de ton iPhone.'))));

    var fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr-only', id: 'import-file',
      onchange: function () { onImportFile(fileInput); } });

    if (S2.wardrobe && S2.wardrobe.openStyle) {
      c.appendChild(h('h2', { class: 'section-title' }, L('My Style', 'Mon style')));
      c.appendChild(h('div', { class: 'card' },
        h('p', { class: 'sheet-text' }, L('Smart casual + street smart: the rules every Wardrobe suggestion follows.', 'Smart casual + street smart : les règles que suit chaque suggestion de la Garde-robe.')),
        h('div', { class: 'stack' }, h('button', { class: 'btn btn-secondary btn-block', onclick: function () { S2.wardrobe.openStyle(); } }, L('✦ View My Style', '✦ Voir mon style')))));
    }

    c.appendChild(h('h2', { class: 'section-title' }, L('Backup', 'Sauvegarde')));
    c.appendChild(h('div', { class: 'card' },
      h('p', { class: 'sheet-text' }, L('Your data lives only on this iPhone. Export a JSON file regularly (e.g. to Files or iCloud Drive).', 'Tes données sont uniquement sur cet iPhone. Exporte régulièrement un fichier JSON (par ex. dans Fichiers ou iCloud Drive).')),
      h('p', { class: 'hint' }, s.lastExport ? L('Last export: ', 'Dernier export : ') + ui.longDate(s.lastExport) : L('No export yet.', 'Aucun export pour l’instant.')),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: doExport }, L('Export (JSON)', 'Exporter (JSON)')),
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { fileInput.click(); } }, L('Import a JSON file', 'Importer un fichier JSON')),
        navigator.clipboard ? h('button', { class: 'btn btn-ghost btn-block', onclick: copyJson }, L('Copy JSON', 'Copier le JSON')) : null),
      fileInput));

    c.appendChild(h('h2', { class: 'section-title' }, L('Data', 'Données')));
    var keys = S2.storage.keys();
    var bytes = keys.reduce(function (n, k) { return n + (localStorage.getItem('sandeep2:' + k) || '').length; }, 0);
    c.appendChild(h('div', { class: 'card' },
      h('p', { class: 'sheet-text' }, L('Spaces: ', 'Espaces : ') + (keys.join(', ') || L('none', 'aucun')) + ' · ' + ui.num(bytes / 1024, 1) + L(' KB used.', ' Ko utilisés.')),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: wipe }, L('Erase everything', 'Tout effacer'))));

    /* Lien vers SanEva (dossier cuisine/) : seule app qui contient la Cuisine (depuis la v0.22) et la Muscu (depuis la v0.27). Absent de SanEva elle-même. */
    if (!window.S2_APP) {
      var sanevaUrl = new URL('cuisine/', location.href.split('#')[0]).href;
      c.appendChild(h('h2', { class: 'section-title' }, 'SanEva'));
      c.appendChild(h('div', { class: 'card' },
        h('p', { class: 'sheet-text' }, L('Gym and Kitchen now live only in SanEva, their own app in French: install it on your phone and on Maeva’s. Each phone keeps its own data. Your workouts and recipes saved here stay in this app’s backups: export a backup below and import it in SanEva to get them there (it only takes Gym, Kitchen and settings).',
          'La Muscu et la Cuisine sont maintenant seulement dans SanEva, leur propre app en français : installe-la sur ton téléphone et sur celui de Maeva. Chaque téléphone garde ses données. Tes séances et recettes enregistrées ici restent dans les sauvegardes de cette app : exporte une sauvegarde ci-dessous et importe-la dans SanEva pour les y retrouver (elle ne prend que la Muscu, la Cuisine et les réglages).')),
        h('p', { class: 'hint' }, sanevaUrl),
        h('div', { class: 'stack' },
          h('a', { class: 'btn btn-primary btn-block', href: sanevaUrl }, L('Open SanEva', 'Ouvrir SanEva')),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
          if (navigator.share) navigator.share({ title: 'SanEva', url: sanevaUrl }).catch(function () {});
          else if (navigator.clipboard) navigator.clipboard.writeText(sanevaUrl).then(function () { ui.toast(L('Link copied', 'Lien copié')); });
        } }, L('Share the link', 'Partager le lien')))));
    }

    c.appendChild(h('h2', { class: 'section-title' }, L('Install on iPhone', 'Installer sur l’iPhone')));
    c.appendChild(h('div', { class: 'card' },
      h('ol', { class: 'steps' },
        h('li', null, L('Open this page in Safari.', 'Ouvre cette page dans Safari.')),
        h('li', null, L('Tap the Share button (square with an arrow).', 'Touche le bouton Partager (carré avec une flèche).')),
        h('li', null, L('Choose “Add to Home Screen”, then “Add”.', 'Choisis « Sur l’écran d’accueil », puis « Ajouter ».')))));

    c.appendChild(h('h2', { class: 'section-title' }, L('Updates', 'Mises à jour')));
    c.appendChild(h('div', { class: 'card' },
      h('p', { class: 'sheet-text' }, L('New versions install automatically when you open the app (with a network connection).', 'Les nouvelles versions s’installent toutes seules à l’ouverture de l’app (avec du réseau).')),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: checkUpdate }, L('Check now', 'Vérifier maintenant')))));

    c.appendChild(h('p', { class: 'hint center' }, (window.S2_APP && window.S2_APP.name || 'Sandeep 2.0') + ' · version ' + VERSION));
  }

  S2.settings = { applyTheme: applyTheme, get: get, VERSION: VERSION };

  S2.app.registerTab({
    id: 'reglages', label: L('Settings', 'Réglages'), title: L('Settings', 'Réglages'), order: 90, mount: mount,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  });
})();
