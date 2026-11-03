/* Onglet Cuisine : recettes, recherche, liste de courses par recette, guide de cuisson pas à pas.
   Seul onglet en français (demande de l'utilisateur, 3 nov. 2026 : utilisé aussi par sa compagne).
   Données : localStorage "sandeep2:cuisine". Recettes intégrées : js/tabs/cuisine-recipes.js. */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'cuisine';
  var SCHEMA = 2;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2zM2 11h2M20 11h2M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/></svg>';
  var CATS = { breakfast: 'Petit-déjeuner & en-cas', main: 'Déjeuner & dîner' };
  /* Empreintes des 10 recettes intégrées d'origine (version anglaise, v0.4). Une copie encore identique
     est remplacée par la version française ; une recette modifiée par l'utilisateur reste telle quelle. */
  var LEGACY_EN = { 'b-cottage-eggs': '13yqel9', 'b-skyr-bowl': '1c896eo', 'b-banana-pancakes': '1vz9snt', 'b-salmon-wrap': 'ym5v8l',
    'm-honey-garlic-chicken': 'yiocr1', 'm-chicken-fajitas': 'qphei0', 'm-korean-beef': 'epn7mx', 'm-lemon-salmon': '3gb594',
    'm-tuna-pasta': '12umfqs', 'm-shrimp-fried-rice': 'r8w1dr' };
  function fingerprint(r) {
    var str = JSON.stringify([r.name, r.ingredients, r.steps, r.tips || '']), x = 5381;
    for (var i = 0; i < str.length; i++) x = ((x * 33) ^ str.charCodeAt(i)) >>> 0;
    return x.toString(36);
  }

  /* ---------- Données ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.recipes)) d = { schema: SCHEMA, recipes: [], checks: {}, removedBuiltins: [] };
    d.checks = d.checks || {};
    d.removedBuiltins = d.removedBuiltins || [];
    /* Ajoute les recettes intégrées manquantes (sauf celles que l'utilisateur a supprimées). */
    var have = {}, builtins = {};
    (S2.cuisineRecipes || []).forEach(function (r) { builtins[r.id] = r; });
    var added = false;
    /* Migration v2 : recettes intégrées non modifiées → version française (mêmes positions de lignes, les cases cochées restent valables). */
    if ((d.schema || 1) < 2) {
      d.recipes = d.recipes.map(function (r) {
        if (!r.builtin || !builtins[r.id] || LEGACY_EN[r.id] !== fingerprint(r)) return r;
        added = true;
        var c = clone(builtins[r.id]); c.builtin = true; return c;
      });
    }
    d.recipes.forEach(function (r) { have[r.id] = true; });
    (S2.cuisineRecipes || []).forEach(function (r) {
      if (have[r.id] || d.removedBuiltins.indexOf(r.id) > -1) return;
      var c = clone(r); c.builtin = true; d.recipes.push(c); added = true;
    });
    d.schema = SCHEMA;
    if (added) S2.storage.save(NS, d);
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function recipe(id) { return data.recipes.filter(function (r) { return r.id === id; })[0]; }
  function checksOf(id) { return data.checks[id] || (data.checks[id] = { ing: {}, steps: {} }); }

  /* ---------- Recherche (nom OU ingrédients, sans accents, plusieurs mots = tous requis) ---------- */
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function haystack(r) {
    return norm([r.name].concat(r.tags || [], r.keywords || [], r.ingredients || []).join(' | '));
  }
  function matches(r, q) {
    var tokens = norm(q).split(/[\s,]+/).filter(Boolean);
    if (!tokens.length) return true;
    var hs = haystack(r);
    return tokens.every(function (t) {
      if (t.length > 3 && /[sx]$/.test(t)) t = t.slice(0, -1); /* « œufs » trouve aussi « œuf », « eggs » « egg » */
      return hs.indexOf(t) > -1;
    });
  }

  /* ---------- Quantités : ajustées au nombre de portions ---------- */
  function scaleLine(line, factor) {
    if (factor === 1) return line;
    var m = String(line).match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*)(.*)$/);
    if (!m) return line;
    var q = m[1].indexOf('/') > -1 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'));
    var v = q * factor;
    v = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    var rest = m[3];
    if (q < 1 && v >= 1) rest = rest.replace(/^d(e |’)/, ''); /* « 1/4 de concombre » × 4 → « 1 concombre » */
    if (q < 2 && v >= 2) rest = pluralize(rest);               /* « 1 tranche » × 2 → « 2 tranches » */
    return num(v).replace('.', ',') + m[2] + rest; /* virgule décimale : onglet en français */
  }
  /* Met au pluriel le nom qui suit la quantité (et l'adjectif placé devant : « petite gousse »). Pas les unités. */
  var UNITS = /^(g|kg|mg|ml|cl|dl|l|cm|c\.)$/i;
  function plur(w) { return /[sxz]$/i.test(w) ? w : /eau$/i.test(w) ? w + 'x' : w + 's'; }
  function pluralize(rest) {
    var words = rest.split(' ');
    if (!words[0] || UNITS.test(words[0])) return rest;
    if (/^(petite?|grande?|belle?|gros|grosse)$/i.test(words[0]) && words[1]) words[1] = plur(words[1]);
    words[0] = plur(words[0]);
    return words.join(' ');
  }

  /* ---------- État d'interface ---------- */
  var view = 'list';       // list | detail
  var currentId = null;
  var mode = 'groceries';  // groceries | cook
  var query = '', filter = 'all';
  var servingsView = {};   // portions affichées par recette (non enregistré)

  function mount(container) {
    data = loadData();
    root = container;
    root.setAttribute('lang', 'fr');
    if (view === 'detail' && !recipe(currentId)) view = 'list';
    render();
  }
  function render() {
    root.innerHTML = '';
    if (view === 'detail') renderDetail(recipe(currentId));
    else renderList();
  }
  function open(id) { currentId = id; view = 'detail'; mode = 'groceries'; render(); window.scrollTo(0, 0); }
  function back() { view = 'list'; render(); window.scrollTo(0, 0); }

  /* ---------- Liste + recherche ---------- */
  function renderList() {
    var search = h('input', { class: 'input ck-search', type: 'search', value: query, autocomplete: 'off', enterkeyhint: 'search',
      placeholder: 'Recette ou ingrédient, ex. poulet', 'aria-label': 'Rechercher une recette' });
    var results = h('div', { class: 'ck-results' });
    search.addEventListener('input', function () { query = search.value; renderResults(results); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') search.blur(); });

    root.appendChild(h('div', { class: 'ck-searchwrap' }, search));
    root.appendChild(h('div', { class: 'segmented small' },
      [['all', 'Tout'], ['breakfast', 'Petit-déj & en-cas'], ['main', 'Déj & dîner']].map(function (f) {
        return h('button', { class: 'seg' + (filter === f[0] ? ' is-active' : ''),
          onclick: function () { filter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    renderResults(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editRecipe(null); } }, '+ Ajouter une recette')));
  }

  function renderResults(box) {
    box.innerHTML = '';
    var list = data.recipes.filter(function (r) { return (filter === 'all' || r.category === filter) && matches(r, query); })
      .sort(function (a, b) {
        if (a.category !== b.category) return a.category === 'breakfast' ? -1 : 1;
        return a.name.localeCompare(b.name, 'fr');
      });
    box.appendChild(h('p', { class: 'hint' }, list.length + ' recette' + (list.length > 1 ? 's' : '') +
      (query.trim() ? ' pour « ' + query.trim() + ' »' : '')));
    if (!list.length) {
      box.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, 'Aucune recette trouvée.'),
        h('button', { class: 'btn btn-secondary', onclick: function () { editRecipe(null); } }, 'Ajouter une recette')));
      return;
    }
    var lastCat = null;
    list.forEach(function (r) {
      if (filter === 'all' && r.category !== lastCat) {
        lastCat = r.category;
        box.appendChild(h('h2', { class: 'section-title' }, CATS[r.category] || 'Autres'));
      }
      box.appendChild(card(r));
    });
  }

  function card(r) {
    return h('button', { class: 'card ck-card', onclick: function () { open(r.id); } },
      h('div', { class: 'ck-cardname' }, r.name),
      h('div', { class: 'ck-meta' },
        r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
        r.protein ? h('span', { class: 'ck-protein' }, r.protein + ' g de protéines') : null,
        r.kcal ? h('span', null, r.kcal + ' kcal') : null),
      (r.tags && r.tags.length) ? h('div', { class: 'ck-tags' }, r.tags.slice(0, 4).join(' · ')) : null);
  }

  /* ---------- Détail : courses + cuisson ---------- */
  function renderDetail(r) {
    var base = r.servings || 1;
    var serv = servingsView[r.id] || base;
    var factor = serv / base;
    var ch = checksOf(r.id);

    root.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: back }, '‹ Recettes'));
    root.appendChild(h('h2', { class: 'page-title' }, r.name));
    root.appendChild(h('div', { class: 'ck-meta ck-meta-lg' },
      h('span', { class: 'badge' }, CATS[r.category] || 'Autres'),
      r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
      r.protein ? h('span', { class: 'ck-protein' }, '≈ ' + Math.round(r.protein * factor) + ' g de protéines') : null,
      r.kcal ? h('span', null, '≈ ' + Math.round(r.kcal * factor) + ' kcal') : null));
    if (r.protein || r.kcal) root.appendChild(h('p', { class: 'hint' }, 'Valeurs approximatives pour ' + serv + ' portion' + (serv > 1 ? 's' : '') + '.'));

    root.appendChild(h('div', { class: 'card ck-servings' },
      h('span', { class: 'field-label' }, 'Portions'),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': 'Une portion de moins', disabled: serv <= 1,
          onclick: function () { servingsView[r.id] = Math.max(1, serv - 1); render(); } }, '−'),
        h('span', { class: 'stepper-num' }, serv),
        h('button', { class: 'btn btn-step', 'aria-label': 'Une portion de plus', disabled: serv >= 12,
          onclick: function () { servingsView[r.id] = Math.min(12, serv + 1); render(); } }, '+'))));

    root.appendChild(h('div', { class: 'segmented ck-mode' },
      h('button', { class: 'seg' + (mode === 'groceries' ? ' is-active' : ''), onclick: function () { mode = 'groceries'; render(); } }, '🛒 Courses'),
      h('button', { class: 'seg' + (mode === 'cook' ? ' is-active' : ''), onclick: function () { mode = 'cook'; render(); } }, '🍳 Cuisiner')));

    if (mode === 'groceries') {
      var got = r.ingredients.filter(function (_, i) { return ch.ing[i]; }).length;
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, 'Ingrédients'),
        h('span', { class: 'muted' }, got + ' / ' + r.ingredients.length + ' cochés')));
      root.appendChild(h('div', { class: 'list ck-checklist' }, r.ingredients.map(function (line, i) {
        return checkRow(scaleLine(line, factor), !!ch.ing[i], function () {
          if (ch.ing[i]) delete ch.ing[i]; else ch.ing[i] = true;
          persist(); render();
        });
      })));
      root.appendChild(h('p', { class: 'hint' }, 'Coche ce que tu as déjà ou ce que tu mets dans le panier. Les cases restent cochées jusqu’à ce que tu les remettes à zéro.'));
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { shareList(r, factor, ch); } }, 'Partager ce qui manque'),
        got ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.ing = {}; persist(); render(); } }, 'Remettre la liste à zéro') : null,
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { mode = 'cook'; render(); window.scrollTo(0, 0); } }, 'Commencer à cuisiner ›')));
    } else {
      var done = r.steps.filter(function (_, i) { return ch.steps[i]; }).length;
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { cookMode(r, factor, 0); } }, '▶ Guide pas à pas')));
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, 'Étapes'),
        h('span', { class: 'muted' }, done + ' / ' + r.steps.length + ' faites')));
      root.appendChild(h('ol', { class: 'ck-steps' }, r.steps.map(function (s, i) {
        return h('li', null, h('button', { class: 'ck-step' + (ch.steps[i] ? ' is-done' : ''), 'aria-pressed': ch.steps[i] ? 'true' : 'false',
          onclick: function () { if (ch.steps[i]) delete ch.steps[i]; else ch.steps[i] = true; persist(); render(); } },
          h('span', { class: 'ck-stepnum' }, ch.steps[i] ? '✓' : i + 1),
          h('span', { class: 'ck-steptext' }, s)));
      })));
      if (done) root.appendChild(h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.steps = {}; persist(); render(); } }, 'Remettre les étapes à zéro'));
      root.appendChild(h('details', { class: 'card ck-inglist' },
        h('summary', null, 'Ingrédients (' + r.ingredients.length + ')'),
        h('ul', null, r.ingredients.map(function (l) { return h('li', null, scaleLine(l, factor)); }))));
    }

    if (r.tips) root.appendChild(h('div', { class: 'note' }, h('strong', null, 'Astuce : '), r.tips));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () { editRecipe(r); } }, 'Modifier cette recette'),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () { removeRecipe(r); } }, 'Supprimer cette recette')));
  }

  function checkRow(text, on, toggle) {
    return h('button', { class: 'list-row ck-check' + (on ? ' is-on' : ''), role: 'checkbox', 'aria-checked': on ? 'true' : 'false', onclick: toggle },
      h('span', { class: 'ck-box', 'aria-hidden': 'true' }, on ? '✓' : ''),
      h('span', { class: 'ck-checktext' }, text));
  }

  function shareList(r, factor, ch) {
    var missing = r.ingredients.map(function (l) { return scaleLine(l, factor); }).filter(function (_, i) { return !ch.ing[i]; });
    if (!missing.length) { ui.toast('Tu as tout !'); return; }
    var text = r.name + '\n' + missing.map(function (l) { return '• ' + l; }).join('\n');
    if (navigator.share) {
      navigator.share({ title: r.name, text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { ui.toast('Liste copiée'); }, function () { ui.toast('La copie a échoué'); });
    }
  }

  /* Guide plein écran : une étape à la fois, gros texte, écran maintenu allumé si possible. */
  function cookMode(r, factor, start) {
    var i = start, lock = null;
    try {
      if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
    } catch (e) { /* pas de wake lock : sans importance */ }
    var close = ui.sheet(function (closeSheet) {
      var wrap = h('div', { class: 'ck-cook' });
      function paint() {
        wrap.innerHTML = '';
        var ch = checksOf(r.id);
        wrap.appendChild(h('div', { class: 'ck-cookhead' },
          h('span', { class: 'muted' }, 'Étape ' + (i + 1) + ' sur ' + r.steps.length),
          h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { closeSheet(); } }, 'Fermer')));
        wrap.appendChild(h('div', { class: 'ck-progress' }, h('span', { style: { width: ((i + 1) / r.steps.length * 100) + '%' } })));
        wrap.appendChild(h('p', { class: 'ck-cooktext' }, r.steps[i]));
        if (i === r.steps.length - 1 && r.tips) wrap.appendChild(h('div', { class: 'note' }, h('strong', null, 'Astuce : '), r.tips));
        var last = i === r.steps.length - 1;
        wrap.appendChild(h('div', { class: 'ck-cooknav' },
          h('button', { class: 'btn btn-secondary btn-lg', disabled: i === 0, onclick: function () { i--; paint(); } }, '‹ Retour'),
          h('button', { class: 'btn btn-primary btn-lg', onclick: function () {
            ch.steps[i] = true; persist();
            if (last) { closeSheet(); ui.toast('Bon appétit !'); } else { i++; paint(); }
          } }, last ? 'Terminé ✓' : 'Suivant ›')));
      }
      paint();
      return wrap;
    }, { modal: true, onClose: function () { if (lock) lock.release().catch(function () {}); render(); } });
    return close;
  }

  /* ---------- Ajout / modification ---------- */
  function editRecipe(r) {
    var isNew = !r;
    var draft = r ? clone(r) : { id: 'u-' + ui.uid(), name: '', category: 'main', time: null, servings: 1, protein: null, kcal: null,
      tags: [], ingredients: [], steps: [], tips: '' };

    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      function text(label, key, ph) {
        var inp = h('input', { class: 'input', type: 'text', value: draft[key] || '', placeholder: ph || '', 'aria-label': label, autocapitalize: 'sentences' });
        inp.addEventListener('input', function () { draft[key] = inp.value; });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      function numf(label, key, ph) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': label,
          value: draft[key] === null || draft[key] === undefined ? '' : String(draft[key]), placeholder: ph || '' });
        inp.addEventListener('input', function () { draft[key] = ui.parseNum(inp.value); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      function lines(label, key, ph, hint) {
        var ta = h('textarea', { class: 'input ck-textarea', rows: 6, placeholder: ph, 'aria-label': label, autocapitalize: 'sentences' });
        ta.value = (draft[key] || []).join('\n');
        ta.addEventListener('input', function () { draft[key] = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), ta, hint ? h('span', { class: 'hint' }, hint) : null);
      }
      var tagsInp = h('input', { class: 'input', type: 'text', value: (draft.tags || []).join(', '), 'aria-label': 'Ingrédients principaux',
        placeholder: 'ex. poulet, riz, brocoli', autocapitalize: 'none' });
      tagsInp.addEventListener('input', function () {
        draft.tags = tagsInp.value.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      });
      var catSeg = h('div', { class: 'segmented small' });
      function paintCats() {
        catSeg.innerHTML = '';
        Object.keys(CATS).forEach(function (k) {
          catSeg.appendChild(h('button', { class: 'seg' + (draft.category === k ? ' is-active' : ''), type: 'button',
            onclick: function () { draft.category = k; paintCats(); } }, CATS[k]));
        });
      }
      paintCats();

      function save() {
        draft.name = (draft.name || '').trim();
        var problem = !draft.name ? 'Donne un nom à la recette.'
          : !draft.ingredients.length ? 'Ajoute au moins un ingrédient.'
          : !draft.steps.length ? 'Ajoute au moins une étape.'
          : (draft.servings !== null && draft.servings < 1) ? 'Il faut au moins 1 portion.' : null;
        if (problem) { err.textContent = problem; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
        ['time', 'servings', 'protein', 'kcal'].forEach(function (k) { if (draft[k] !== null) draft[k] = Math.round(draft[k]); });
        if (!draft.servings) draft.servings = 1;
        draft.tips = (draft.tips || '').trim();
        if (isNew) data.recipes.push(draft);
        else {
          data.recipes[data.recipes.indexOf(r)] = draft;
          delete data.checks[draft.id]; /* les lignes ont pu changer */
        }
        delete servingsView[draft.id];
        persist(); close();
        currentId = draft.id; view = 'detail'; mode = 'groceries';
        render(); window.scrollTo(0, 0);
        ui.toast(isNew ? 'Recette ajoutée' : 'Recette modifiée');
      }

      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'Nouvelle recette' : 'Modifier la recette'),
        text('Nom', 'name', 'ex. Curry de poulet'),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Catégorie'), catSeg),
        h('div', { class: 'form-grid' }, numf('Temps (min)', 'time', '15'), numf('Portions', 'servings', '1'), numf('Protéines (g)', 'protein', '40')),
        h('div', { class: 'form-grid ck-grid1' }, numf('Calories (kcal, facultatif)', 'kcal', '600')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Ingrédients principaux (pour la recherche, séparés par des virgules)'), tagsInp),
        lines('Ingrédients (un par ligne)', 'ingredients', '200 g de blanc de poulet\n1 c. à soupe de miel\nSel & poivre',
          'Commence la ligne par la quantité (ex. « 200 g … ») pour qu’elle s’adapte au nombre de portions.'),
        lines('Étapes (une par ligne)', 'steps', 'Coupe le poulet en morceaux.\nCuis 6 minutes à feu moyen-vif.'),
        text('Astuce (facultatif)', 'tips', ''),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Ajouter la recette' : 'Enregistrer'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Annuler'))
      ];
    }, { modal: true });
  }

  function removeRecipe(r) {
    ui.confirm({ title: 'Supprimer cette recette ?', message: '« ' + r.name + ' » sera retirée de tes recettes.',
      okLabel: 'Supprimer', cancelLabel: 'Annuler', danger: true }).then(function (ok) {
      if (!ok) return;
      data.recipes = data.recipes.filter(function (x) { return x.id !== r.id; });
      delete data.checks[r.id];
      if (r.builtin && data.removedBuiltins.indexOf(r.id) < 0) data.removedBuiltins.push(r.id);
      persist(); back(); ui.toast('Recette supprimée');
    });
  }

  S2.app.registerTab({ id: 'cuisine', label: 'Cuisine', order: 30, icon: ICON, mount: mount });
})();
