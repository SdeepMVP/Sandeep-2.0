/* Onglet Kitchen : recettes, recherche, liste de courses par recette, guide de cuisson pas à pas.
   Données : localStorage "sandeep2:cuisine". Recettes intégrées : js/tabs/cuisine-recipes.js. */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'cuisine';
  var SCHEMA = 1;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2zM2 11h2M20 11h2M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/></svg>';
  var CATS = { breakfast: 'Breakfast & snack', main: 'Lunch & dinner' };

  /* ---------- Données ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.recipes)) d = { schema: SCHEMA, recipes: [], checks: {}, removedBuiltins: [] };
    d.checks = d.checks || {};
    d.removedBuiltins = d.removedBuiltins || [];
    /* Ajoute les recettes intégrées manquantes (sauf celles que l'utilisateur a supprimées). */
    var have = {};
    d.recipes.forEach(function (r) { have[r.id] = true; });
    var added = false;
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
    return norm([r.name].concat(r.tags || [], r.ingredients || []).join(' | '));
  }
  function matches(r, q) {
    var tokens = norm(q).split(/[\s,]+/).filter(Boolean);
    if (!tokens.length) return true;
    var hs = haystack(r);
    return tokens.every(function (t) {
      if (t.length > 3 && /s$/.test(t)) t = t.slice(0, -1); /* « eggs » trouve aussi « egg » */
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
    return num(v) + m[2] + m[3];
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
      placeholder: 'Recipe or ingredient, e.g. chicken', 'aria-label': 'Search recipes' });
    var results = h('div', { class: 'ck-results' });
    search.addEventListener('input', function () { query = search.value; renderResults(results); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') search.blur(); });

    root.appendChild(h('div', { class: 'ck-searchwrap' }, search));
    root.appendChild(h('div', { class: 'segmented small' },
      [['all', 'All'], ['breakfast', 'Breakfast & snacks'], ['main', 'Lunch & dinner']].map(function (f) {
        return h('button', { class: 'seg' + (filter === f[0] ? ' is-active' : ''),
          onclick: function () { filter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    renderResults(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editRecipe(null); } }, '+ Add a recipe')));
  }

  function renderResults(box) {
    box.innerHTML = '';
    var list = data.recipes.filter(function (r) { return (filter === 'all' || r.category === filter) && matches(r, query); })
      .sort(function (a, b) {
        if (a.category !== b.category) return a.category === 'breakfast' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    box.appendChild(h('p', { class: 'hint' }, list.length + ' recipe' + (list.length === 1 ? '' : 's') +
      (query.trim() ? ' for “' + query.trim() + '”' : '')));
    if (!list.length) {
      box.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, 'No recipe found.'),
        h('button', { class: 'btn btn-secondary', onclick: function () { editRecipe(null); } }, 'Add a recipe')));
      return;
    }
    var lastCat = null;
    list.forEach(function (r) {
      if (filter === 'all' && r.category !== lastCat) {
        lastCat = r.category;
        box.appendChild(h('h2', { class: 'section-title' }, CATS[r.category] || 'Other'));
      }
      box.appendChild(card(r));
    });
  }

  function card(r) {
    return h('button', { class: 'card ck-card', onclick: function () { open(r.id); } },
      h('div', { class: 'ck-cardname' }, r.name),
      h('div', { class: 'ck-meta' },
        r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
        r.protein ? h('span', { class: 'ck-protein' }, r.protein + ' g protein') : null,
        r.kcal ? h('span', null, r.kcal + ' kcal') : null),
      (r.tags && r.tags.length) ? h('div', { class: 'ck-tags' }, r.tags.slice(0, 4).join(' · ')) : null);
  }

  /* ---------- Détail : courses + cuisson ---------- */
  function renderDetail(r) {
    var base = r.servings || 1;
    var serv = servingsView[r.id] || base;
    var factor = serv / base;
    var ch = checksOf(r.id);

    root.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: back }, '‹ Recipes'));
    root.appendChild(h('h2', { class: 'page-title' }, r.name));
    root.appendChild(h('div', { class: 'ck-meta ck-meta-lg' },
      h('span', { class: 'badge' }, CATS[r.category] || 'Other'),
      r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
      r.protein ? h('span', { class: 'ck-protein' }, '≈ ' + Math.round(r.protein * factor) + ' g protein') : null,
      r.kcal ? h('span', null, '≈ ' + Math.round(r.kcal * factor) + ' kcal') : null));
    if (r.protein || r.kcal) root.appendChild(h('p', { class: 'hint' }, 'Approximate values for ' + serv + ' serving' + (serv === 1 ? '' : 's') + '.'));

    root.appendChild(h('div', { class: 'card ck-servings' },
      h('span', { class: 'field-label' }, 'Servings'),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': 'One serving less', disabled: serv <= 1,
          onclick: function () { servingsView[r.id] = Math.max(1, serv - 1); render(); } }, '−'),
        h('span', { class: 'stepper-num' }, serv),
        h('button', { class: 'btn btn-step', 'aria-label': 'One serving more', disabled: serv >= 12,
          onclick: function () { servingsView[r.id] = Math.min(12, serv + 1); render(); } }, '+'))));

    root.appendChild(h('div', { class: 'segmented ck-mode' },
      h('button', { class: 'seg' + (mode === 'groceries' ? ' is-active' : ''), onclick: function () { mode = 'groceries'; render(); } }, '🛒 Groceries'),
      h('button', { class: 'seg' + (mode === 'cook' ? ' is-active' : ''), onclick: function () { mode = 'cook'; render(); } }, '🍳 Cook')));

    if (mode === 'groceries') {
      var got = r.ingredients.filter(function (_, i) { return ch.ing[i]; }).length;
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, 'Ingredients'),
        h('span', { class: 'muted' }, got + ' / ' + r.ingredients.length + ' ticked')));
      root.appendChild(h('div', { class: 'list ck-checklist' }, r.ingredients.map(function (line, i) {
        return checkRow(scaleLine(line, factor), !!ch.ing[i], function () {
          if (ch.ing[i]) delete ch.ing[i]; else ch.ing[i] = true;
          persist(); render();
        });
      })));
      root.appendChild(h('p', { class: 'hint' }, 'Tick what you already have or put in your basket. Ticks are saved until you reset.'));
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { shareList(r, factor, ch); } }, 'Share the missing items'),
        got ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.ing = {}; persist(); render(); } }, 'Reset the list') : null,
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { mode = 'cook'; render(); window.scrollTo(0, 0); } }, 'Start cooking ›')));
    } else {
      var done = r.steps.filter(function (_, i) { return ch.steps[i]; }).length;
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { cookMode(r, factor, 0); } }, '▶ Step-by-step guide')));
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, 'Steps'),
        h('span', { class: 'muted' }, done + ' / ' + r.steps.length + ' done')));
      root.appendChild(h('ol', { class: 'ck-steps' }, r.steps.map(function (s, i) {
        return h('li', null, h('button', { class: 'ck-step' + (ch.steps[i] ? ' is-done' : ''), 'aria-pressed': ch.steps[i] ? 'true' : 'false',
          onclick: function () { if (ch.steps[i]) delete ch.steps[i]; else ch.steps[i] = true; persist(); render(); } },
          h('span', { class: 'ck-stepnum' }, ch.steps[i] ? '✓' : i + 1),
          h('span', { class: 'ck-steptext' }, s)));
      })));
      if (done) root.appendChild(h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.steps = {}; persist(); render(); } }, 'Reset the steps'));
      root.appendChild(h('details', { class: 'card ck-inglist' },
        h('summary', null, 'Ingredients (' + r.ingredients.length + ')'),
        h('ul', null, r.ingredients.map(function (l) { return h('li', null, scaleLine(l, factor)); }))));
    }

    if (r.tips) root.appendChild(h('div', { class: 'note' }, h('strong', null, 'Tip: '), r.tips));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () { editRecipe(r); } }, 'Edit this recipe'),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () { removeRecipe(r); } }, 'Delete this recipe')));
  }

  function checkRow(text, on, toggle) {
    return h('button', { class: 'list-row ck-check' + (on ? ' is-on' : ''), role: 'checkbox', 'aria-checked': on ? 'true' : 'false', onclick: toggle },
      h('span', { class: 'ck-box', 'aria-hidden': 'true' }, on ? '✓' : ''),
      h('span', { class: 'ck-checktext' }, text));
  }

  function shareList(r, factor, ch) {
    var missing = r.ingredients.map(function (l) { return scaleLine(l, factor); }).filter(function (_, i) { return !ch.ing[i]; });
    if (!missing.length) { ui.toast('You have everything!'); return; }
    var text = r.name + '\n' + missing.map(function (l) { return '• ' + l; }).join('\n');
    if (navigator.share) {
      navigator.share({ title: r.name, text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { ui.toast('List copied'); }, function () { ui.toast('Copy failed'); });
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
          h('span', { class: 'muted' }, 'Step ' + (i + 1) + ' of ' + r.steps.length),
          h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { closeSheet(); } }, 'Close')));
        wrap.appendChild(h('div', { class: 'ck-progress' }, h('span', { style: { width: ((i + 1) / r.steps.length * 100) + '%' } })));
        wrap.appendChild(h('p', { class: 'ck-cooktext' }, r.steps[i]));
        if (i === r.steps.length - 1 && r.tips) wrap.appendChild(h('div', { class: 'note' }, h('strong', null, 'Tip: '), r.tips));
        var last = i === r.steps.length - 1;
        wrap.appendChild(h('div', { class: 'ck-cooknav' },
          h('button', { class: 'btn btn-secondary btn-lg', disabled: i === 0, onclick: function () { i--; paint(); } }, '‹ Back'),
          h('button', { class: 'btn btn-primary btn-lg', onclick: function () {
            ch.steps[i] = true; persist();
            if (last) { closeSheet(); ui.toast('Enjoy your meal!'); } else { i++; paint(); }
          } }, last ? 'Done ✓' : 'Next ›')));
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
      var tagsInp = h('input', { class: 'input', type: 'text', value: (draft.tags || []).join(', '), 'aria-label': 'Main ingredients',
        placeholder: 'e.g. chicken, rice, broccoli', autocapitalize: 'none' });
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
        var problem = !draft.name ? 'Give the recipe a name.'
          : !draft.ingredients.length ? 'Add at least one ingredient.'
          : !draft.steps.length ? 'Add at least one step.'
          : (draft.servings !== null && draft.servings < 1) ? 'Servings must be at least 1.' : null;
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
        ui.toast(isNew ? 'Recipe added' : 'Recipe updated');
      }

      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New recipe' : 'Edit recipe'),
        text('Name', 'name', 'e.g. Chicken curry'),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Category'), catSeg),
        h('div', { class: 'form-grid' }, numf('Time (min)', 'time', '15'), numf('Servings', 'servings', '1'), numf('Protein (g)', 'protein', '40')),
        h('div', { class: 'form-grid ck-grid1' }, numf('Calories (kcal, optional)', 'kcal', '600')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Main ingredients (for search, comma-separated)'), tagsInp),
        lines('Ingredients (one per line)', 'ingredients', '200 g chicken breast\n1 tbsp honey\nSalt & pepper',
          'Start a line with the quantity (e.g. “200 g …”) so it adjusts with the number of servings.'),
        lines('Steps (one per line)', 'steps', 'Cut the chicken into pieces.\nCook 6 minutes over medium-high heat.'),
        text('Tip (optional)', 'tips', ''),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Add the recipe' : 'Save changes'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))
      ];
    }, { modal: true });
  }

  function removeRecipe(r) {
    ui.confirm({ title: 'Delete this recipe?', message: '“' + r.name + '” will be removed from your recipes.',
      okLabel: 'Delete', danger: true }).then(function (ok) {
      if (!ok) return;
      data.recipes = data.recipes.filter(function (x) { return x.id !== r.id; });
      delete data.checks[r.id];
      if (r.builtin && data.removedBuiltins.indexOf(r.id) < 0) data.removedBuiltins.push(r.id);
      persist(); back(); ui.toast('Recipe deleted');
    });
  }

  S2.app.registerTab({ id: 'cuisine', label: 'Kitchen', order: 30, icon: ICON, mount: mount });
})();
