/* Onglet Cuisine / Kitchen : recettes, recherche, liste de courses par recette, guide de cuisson pas à pas.
   L'onglet suit la langue de l'app (anglais ou français, réglée dans Réglages) via S2.L(en, fr).
   Données : localStorage "sandeep2:cuisine". Recettes intégrées : js/tabs/cuisine-recipes.js
   (textes français = référence enregistrée, traduction anglaise dans le champ `en`).
   Une recette intégrée jamais modifiée s'affiche dans la langue de l'app ; une recette modifiée
   ou créée par l'utilisateur s'affiche telle qu'enregistrée (voir view()). */
(function () {
  'use strict';
  var S2 = window.S2;
  var L = S2.L;
  var FR = S2.lang === 'fr';
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'cuisine';
  var SCHEMA = 2;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2zM2 11h2M20 11h2M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/></svg>';
  var CATS = { breakfast: L('Breakfast & snack', 'Petit-déjeuner & en-cas'), main: L('Lunch & dinner', 'Déjeuner & dîner') };
  var OTHER = L('Other', 'Autres');
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
  /* Copie d'une recette intégrée pour les données de l'utilisateur : texte français seulement (la traduction reste dans la source). */
  function builtinCopy(src) { var c = clone(src); delete c.en; c.builtin = true; return c; }

  var BUILTIN = {}, BUILTIN_FP = {};
  (S2.cuisineRecipes || []).forEach(function (r) { BUILTIN[r.id] = r; BUILTIN_FP[r.id] = fingerprint(r); });

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.recipes)) d = { schema: SCHEMA, recipes: [], checks: {}, removedBuiltins: [] };
    d.checks = d.checks || {};
    d.removedBuiltins = d.removedBuiltins || [];
    /* Ajoute les recettes intégrées manquantes (sauf celles que l'utilisateur a supprimées). */
    var have = {};
    var added = false;
    /* Migration v2 : recettes intégrées non modifiées → version française (mêmes positions de lignes, les cases cochées restent valables). */
    if ((d.schema || 1) < 2) {
      d.recipes = d.recipes.map(function (r) {
        if (!r.builtin || !BUILTIN[r.id] || LEGACY_EN[r.id] !== fingerprint(r)) return r;
        added = true;
        return builtinCopy(BUILTIN[r.id]);
      });
    }
    d.recipes.forEach(function (r) { have[r.id] = true; });
    (S2.cuisineRecipes || []).forEach(function (r) {
      if (have[r.id] || d.removedBuiltins.indexOf(r.id) > -1) return;
      d.recipes.push(builtinCopy(r)); added = true;
    });
    d.schema = SCHEMA;
    if (added) S2.storage.save(NS, d);
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function recipe(id) { return data.recipes.filter(function (r) { return r.id === id; })[0]; }
  function checksOf(id) { return data.checks[id] || (data.checks[id] = { ing: {}, steps: {} }); }

  /* ---------- Texte affiché ----------
     Recette intégrée encore identique à sa source française (même empreinte) : texte de la langue de l'app.
     Sinon (modifiée, ou créée par l'utilisateur) : texte enregistré tel quel.
     `alt` = texte de l'autre langue, pour que la recherche trouve « chicken » comme « poulet ». */
  function pick(o) {
    return { name: o.name, tags: o.tags || [], ingredients: o.ingredients || [], steps: o.steps || [], tips: o.tips || '' };
  }
  function view(r) {
    var src = r.builtin && BUILTIN[r.id];
    if (src && src.en && fingerprint(r) === BUILTIN_FP[r.id]) {
      var v = pick(FR ? src : src.en);
      v.alt = pick(FR ? src.en : src);
      v.untouched = true;
      return v;
    }
    return pick(r);
  }

  /* ---------- Recherche (nom OU ingrédients, sans accents, plusieurs mots = tous requis) ---------- */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, ''); /* « oeufs » trouve « œufs » */
  }
  function haystack(r, v) {
    var parts = [v.name].concat(v.tags, r.keywords || [], v.ingredients);
    if (v.alt) parts = parts.concat(v.alt.name, v.alt.tags, v.alt.ingredients);
    return norm(parts.join(' | '));
  }
  function matches(r, v, q) {
    var tokens = norm(q).split(/[\s,]+/).filter(Boolean);
    if (!tokens.length) return true;
    var hs = haystack(r, v);
    return tokens.every(function (t) {
      if (t.length > 3 && /[sx]$/.test(t)) t = t.slice(0, -1); /* « œufs » trouve aussi « œuf », « eggs » « egg » */
      return hs.indexOf(t) > -1;
    });
  }

  /* ---------- Quantités : ajustées au nombre de portions ----------
     Décimale selon la langue (ui.num). Règles d'accord propres à chaque langue. */
  function scaleLine(line, factor) {
    if (factor === 1) return line;
    var m = String(line).match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*)(.*)$/);
    if (!m) return line;
    var q = m[1].indexOf('/') > -1 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'));
    var v = q * factor;
    v = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    var rest = m[3];
    if (FR) {
      if (q < 1 && v >= 1) rest = rest.replace(/^d(e |’)/, ''); /* « 1/4 de concombre » × 4 → « 1 concombre » */
      if (q < 2 && v >= 2) rest = pluralize(rest);               /* « 1 tranche » × 2 → « 2 tranches » */
    } else if (q < 2 && v >= 2) {
      rest = pluralizeEn(rest);                                  /* « 1 slice » × 2 → « 2 slices » */
    }
    return num(v) + m[2] + rest;
  }
  /* Français : met au pluriel le nom qui suit la quantité (et l'adjectif placé devant : « petite gousse »). Pas les unités. */
  var UNITS = /^(g|kg|mg|ml|cl|dl|l|cm|c\.)$/i;
  function plur(w) {
    var m = w.match(/^(.*?)([,;.)]*)$/), core = m[1], tail = m[2]; /* « cornichon, » → « cornichons, » */
    return (/[sxz]$/i.test(core) ? core : /eau$/i.test(core) ? core + 'x' : core + 's') + tail;
  }
  function pluralize(rest) {
    var words = rest.split(' ');
    if (!words[0] || UNITS.test(words[0])) return rest;
    if (/^(petite?|grande?|belle?|gros|grosse)$/i.test(words[0]) && words[1]) words[1] = plur(words[1]);
    words[0] = plur(words[0]);
    return words.join(' ');
  }
  /* Anglais : seuls les noms connus passent au pluriel (« 1 red pepper » → « 2 red peppers »,
     « 1 salmon fillet » → « 2 salmon fillets ») ; on cherche dans les 3 premiers mots, sans dépasser
     une ponctuation. Tout le reste (unités, noms indénombrables, mots inconnus) reste tel quel. */
  var UNITS_EN = /^(g|kg|mg|ml|cl|l|cm|tbsp|tsp)$/i;
  var PLURAL_EN = {
    egg: 'eggs', slice: 'slices', banana: 'bananas', tortilla: 'tortillas', can: 'cans', handful: 'handfuls',
    pinch: 'pinches', clove: 'cloves', onion: 'onions', pepper: 'peppers', lemon: 'lemons', lime: 'limes',
    fillet: 'fillets', cucumber: 'cucumbers', avocado: 'avocados', apple: 'apples', carrot: 'carrots',
    courgette: 'courgettes', tomato: 'tomatoes', shallot: 'shallots', bun: 'buns', gherkin: 'gherkins',
    heart: 'hearts', ball: 'balls', mushroom: 'mushrooms', potato: 'potatoes', pouch: 'pouches',
    escalope: 'escalopes', leaf: 'leaves', breast: 'breasts', thigh: 'thighs', block: 'blocks', jar: 'jars', bar: 'bars'
  };
  function pluralizeEn(rest) {
    var words = rest.split(' ');
    if (!words[0] || UNITS_EN.test(words[0])) return rest;
    for (var i = 0; i < Math.min(3, words.length); i++) {
      var m = words[i].match(/^([A-Za-z-]+)([,;.)]*)$/);
      if (!m) return rest;
      var p = PLURAL_EN[m[1].toLowerCase()];
      if (p) { words[i] = p + m[2]; return words.join(' '); }
      if (m[2] || /^(of|or|and|&)$/i.test(m[1])) return rest;
    }
    return rest;
  }

  /* ---------- État d'interface ---------- */
  var page = 'list';       // list | detail
  var currentId = null;
  var mode = 'groceries';  // groceries | cook
  var query = '', filter = 'all';
  var servingsView = {};   // portions affichées par recette (non enregistré)

  function plural(n, en, fr) { return n + ' ' + (FR ? fr + (n > 1 ? 's' : '') : en + (n === 1 ? '' : 's')); }

  function mount(container) {
    data = loadData();
    root = container;
    root.setAttribute('lang', S2.lang);
    if (page === 'detail' && !recipe(currentId)) page = 'list';
    render();
  }
  function render() {
    root.innerHTML = '';
    if (page === 'detail') renderDetail(recipe(currentId));
    else renderList();
  }
  function open(id) { currentId = id; page = 'detail'; mode = 'groceries'; render(); window.scrollTo(0, 0); }
  function back() { page = 'list'; render(); window.scrollTo(0, 0); }

  /* ---------- Liste + recherche ---------- */
  function renderList() {
    var search = h('input', { class: 'input ck-search', type: 'search', value: query, autocomplete: 'off', enterkeyhint: 'search',
      placeholder: L('Recipe or ingredient, e.g. chicken', 'Recette ou ingrédient, ex. poulet'),
      'aria-label': L('Search recipes', 'Rechercher une recette') });
    var results = h('div', { class: 'ck-results' });
    search.addEventListener('input', function () { query = search.value; renderResults(results); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') search.blur(); });

    root.appendChild(h('div', { class: 'ck-searchwrap' }, search));
    root.appendChild(h('div', { class: 'segmented small' },
      [['all', L('All', 'Tout')], ['breakfast', L('Breakfast & snacks', 'Petit-déj & en-cas')], ['main', L('Lunch & dinner', 'Déj & dîner')]].map(function (f) {
        return h('button', { class: 'seg' + (filter === f[0] ? ' is-active' : ''),
          onclick: function () { filter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    renderResults(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editRecipe(null); } }, L('+ Add a recipe', '+ Ajouter une recette'))));
  }

  function renderResults(box) {
    box.innerHTML = '';
    var list = data.recipes.map(function (r) { return { r: r, v: view(r) }; })
      .filter(function (x) { return (filter === 'all' || x.r.category === filter) && matches(x.r, x.v, query); })
      .sort(function (a, b) {
        if (a.r.category !== b.r.category) return a.r.category === 'breakfast' ? -1 : 1;
        return a.v.name.localeCompare(b.v.name, S2.lang);
      });
    var q = query.trim();
    box.appendChild(h('p', { class: 'hint' }, plural(list.length, 'recipe', 'recette') +
      (q ? L(' for “' + q + '”', ' pour « ' + q + ' »') : '')));
    if (!list.length) {
      box.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('No recipe found.', 'Aucune recette trouvée.')),
        h('button', { class: 'btn btn-secondary', onclick: function () { editRecipe(null); } }, L('Add a recipe', 'Ajouter une recette'))));
      return;
    }
    var lastCat = null;
    list.forEach(function (x) {
      if (filter === 'all' && x.r.category !== lastCat) {
        lastCat = x.r.category;
        box.appendChild(h('h2', { class: 'section-title' }, CATS[x.r.category] || OTHER));
      }
      box.appendChild(card(x.r, x.v));
    });
  }

  function card(r, v) {
    return h('button', { class: 'card ck-card', onclick: function () { open(r.id); } },
      h('div', { class: 'ck-cardname' }, v.name),
      h('div', { class: 'ck-meta' },
        r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
        r.protein ? h('span', { class: 'ck-protein' }, r.protein + L(' g protein', ' g de protéines')) : null,
        r.kcal ? h('span', null, r.kcal + ' kcal') : null),
      v.tags.length ? h('div', { class: 'ck-tags' }, v.tags.slice(0, 4).join(' · ')) : null);
  }

  /* ---------- Détail : courses + cuisson ---------- */
  function renderDetail(r) {
    var v = view(r);
    var base = r.servings || 1;
    var serv = servingsView[r.id] || base;
    var factor = serv / base;
    var ch = checksOf(r.id);
    var tipLabel = L('Tip: ', 'Astuce : ');

    root.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: back }, L('‹ Recipes', '‹ Recettes')));
    root.appendChild(h('h2', { class: 'page-title' }, v.name));
    root.appendChild(h('div', { class: 'ck-meta ck-meta-lg' },
      h('span', { class: 'badge' }, CATS[r.category] || OTHER),
      r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
      r.protein ? h('span', { class: 'ck-protein' }, '≈ ' + Math.round(r.protein * factor) + L(' g protein', ' g de protéines')) : null,
      r.kcal ? h('span', null, '≈ ' + Math.round(r.kcal * factor) + ' kcal') : null));
    if (r.protein || r.kcal) root.appendChild(h('p', { class: 'hint' },
      L('Approximate values for ', 'Valeurs approximatives pour ') + plural(serv, 'serving', 'portion') + '.'));

    root.appendChild(h('div', { class: 'card ck-servings' },
      h('span', { class: 'field-label' }, L('Servings', 'Portions')),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': L('One serving less', 'Une portion de moins'), disabled: serv <= 1,
          onclick: function () { servingsView[r.id] = Math.max(1, serv - 1); render(); } }, '−'),
        h('span', { class: 'stepper-num' }, serv),
        h('button', { class: 'btn btn-step', 'aria-label': L('One serving more', 'Une portion de plus'), disabled: serv >= 12,
          onclick: function () { servingsView[r.id] = Math.min(12, serv + 1); render(); } }, '+'))));

    root.appendChild(h('div', { class: 'segmented ck-mode' },
      h('button', { class: 'seg' + (mode === 'groceries' ? ' is-active' : ''), onclick: function () { mode = 'groceries'; render(); } }, L('🛒 Groceries', '🛒 Courses')),
      h('button', { class: 'seg' + (mode === 'cook' ? ' is-active' : ''), onclick: function () { mode = 'cook'; render(); } }, L('🍳 Cook', '🍳 Cuisiner'))));

    if (mode === 'groceries') {
      var got = v.ingredients.filter(function (_, i) { return ch.ing[i]; }).length;
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, L('Ingredients', 'Ingrédients')),
        h('span', { class: 'muted' }, got + ' / ' + v.ingredients.length + L(' ticked', ' cochés'))));
      root.appendChild(h('div', { class: 'list ck-checklist' }, v.ingredients.map(function (line, i) {
        return checkRow(scaleLine(line, factor), !!ch.ing[i], function () {
          if (ch.ing[i]) delete ch.ing[i]; else ch.ing[i] = true;
          persist(); render();
        });
      })));
      root.appendChild(h('p', { class: 'hint' }, L('Tick what you already have or put in your basket. Ticks are saved until you reset.',
        'Coche ce que tu as déjà ou ce que tu mets dans le panier. Les cases restent cochées jusqu’à ce que tu les remettes à zéro.')));
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { shareList(v, factor, ch); } }, L('Share the missing items', 'Partager ce qui manque')),
        got ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.ing = {}; persist(); render(); } }, L('Reset the list', 'Remettre la liste à zéro')) : null,
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { mode = 'cook'; render(); window.scrollTo(0, 0); } }, L('Start cooking ›', 'Commencer à cuisiner ›'))));
    } else {
      var done = v.steps.filter(function (_, i) { return ch.steps[i]; }).length;
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { cookMode(r, v, 0); } }, L('▶ Step-by-step guide', '▶ Guide pas à pas'))));
      root.appendChild(h('div', { class: 'ck-listhead' },
        h('span', { class: 'card-title' }, L('Steps', 'Étapes')),
        h('span', { class: 'muted' }, done + ' / ' + v.steps.length + L(' done', ' faites'))));
      root.appendChild(h('ol', { class: 'ck-steps' }, v.steps.map(function (s, i) {
        return h('li', null, h('button', { class: 'ck-step' + (ch.steps[i] ? ' is-done' : ''), 'aria-pressed': ch.steps[i] ? 'true' : 'false',
          onclick: function () { if (ch.steps[i]) delete ch.steps[i]; else ch.steps[i] = true; persist(); render(); } },
          h('span', { class: 'ck-stepnum' }, ch.steps[i] ? '✓' : i + 1),
          h('span', { class: 'ck-steptext' }, s)));
      })));
      if (done) root.appendChild(h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.steps = {}; persist(); render(); } }, L('Reset the steps', 'Remettre les étapes à zéro')));
      root.appendChild(h('details', { class: 'card ck-inglist' },
        h('summary', null, L('Ingredients', 'Ingrédients') + ' (' + v.ingredients.length + ')'),
        h('ul', null, v.ingredients.map(function (l) { return h('li', null, scaleLine(l, factor)); }))));
    }

    if (v.tips) root.appendChild(h('div', { class: 'note' }, h('strong', null, tipLabel), v.tips));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () { editRecipe(r); } }, L('Edit this recipe', 'Modifier cette recette')),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () { removeRecipe(r); } }, L('Delete this recipe', 'Supprimer cette recette'))));
  }

  function checkRow(text, on, toggle) {
    return h('button', { class: 'list-row ck-check' + (on ? ' is-on' : ''), role: 'checkbox', 'aria-checked': on ? 'true' : 'false', onclick: toggle },
      h('span', { class: 'ck-box', 'aria-hidden': 'true' }, on ? '✓' : ''),
      h('span', { class: 'ck-checktext' }, text));
  }

  function shareList(v, factor, ch) {
    var missing = v.ingredients.map(function (l) { return scaleLine(l, factor); }).filter(function (_, i) { return !ch.ing[i]; });
    if (!missing.length) { ui.toast(L('You have everything!', 'Tu as tout !')); return; }
    var text = v.name + '\n' + missing.map(function (l) { return '• ' + l; }).join('\n');
    if (navigator.share) {
      navigator.share({ title: v.name, text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { ui.toast(L('List copied', 'Liste copiée')); },
        function () { ui.toast(L('Copy failed', 'La copie a échoué')); });
    }
  }

  /* Guide plein écran : une étape à la fois, gros texte, écran maintenu allumé si possible. */
  function cookMode(r, v, start) {
    var i = start, lock = null, n = v.steps.length;
    try {
      if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
    } catch (e) { /* pas de wake lock : sans importance */ }
    var close = ui.sheet(function (closeSheet) {
      var wrap = h('div', { class: 'ck-cook' });
      function paint() {
        wrap.innerHTML = '';
        var ch = checksOf(r.id);
        wrap.appendChild(h('div', { class: 'ck-cookhead' },
          h('span', { class: 'muted' }, L('Step ' + (i + 1) + ' of ' + n, 'Étape ' + (i + 1) + ' sur ' + n)),
          h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { closeSheet(); } }, L('Close', 'Fermer'))));
        wrap.appendChild(h('div', { class: 'ck-progress' }, h('span', { style: { width: ((i + 1) / n * 100) + '%' } })));
        wrap.appendChild(h('p', { class: 'ck-cooktext' }, v.steps[i]));
        if (i === n - 1 && v.tips) wrap.appendChild(h('div', { class: 'note' }, h('strong', null, L('Tip: ', 'Astuce : ')), v.tips));
        var last = i === n - 1;
        wrap.appendChild(h('div', { class: 'ck-cooknav' },
          h('button', { class: 'btn btn-secondary btn-lg', disabled: i === 0, onclick: function () { i--; paint(); } }, L('‹ Back', '‹ Retour')),
          h('button', { class: 'btn btn-primary btn-lg', onclick: function () {
            ch.steps[i] = true; persist();
            if (last) { closeSheet(); ui.toast(L('Enjoy your meal!', 'Bon appétit !')); } else { i++; paint(); }
          } }, last ? L('Done ✓', 'Terminé ✓') : L('Next ›', 'Suivant ›'))));
      }
      paint();
      return wrap;
    }, { modal: true, onClose: function () { if (lock) lock.release().catch(function () {}); render(); } });
    return close;
  }

  /* ---------- Ajout / modification ---------- */
  var TEXT_KEYS = ['name', 'tags', 'ingredients', 'steps', 'tips'];
  function editRecipe(r) {
    var isNew = !r;
    var shown = r ? view(r) : null;
    var draft = r ? clone(r) : { id: 'u-' + ui.uid(), name: '', category: 'main', time: null, servings: 1, protein: null, kcal: null,
      tags: [], ingredients: [], steps: [], tips: '' };
    /* L'éditeur montre le texte affiché (éventuellement la traduction d'une recette intégrée). */
    if (shown) TEXT_KEYS.forEach(function (k) { draft[k] = clone(shown[k]); });

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
      var tagsInp = h('input', { class: 'input', type: 'text', value: (draft.tags || []).join(', '), 'aria-label': L('Main ingredients', 'Ingrédients principaux'),
        placeholder: L('e.g. chicken, rice, broccoli', 'ex. poulet, riz, brocoli'), autocapitalize: 'none' });
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
        var problem = !draft.name ? L('Give the recipe a name.', 'Donne un nom à la recette.')
          : !draft.ingredients.length ? L('Add at least one ingredient.', 'Ajoute au moins un ingrédient.')
          : !draft.steps.length ? L('Add at least one step.', 'Ajoute au moins une étape.')
          : (draft.servings !== null && draft.servings < 1) ? L('Servings must be at least 1.', 'Il faut au moins 1 portion.') : null;
        if (problem) { err.textContent = problem; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
        ['time', 'servings', 'protein', 'kcal'].forEach(function (k) { if (draft[k] !== null) draft[k] = Math.round(draft[k]); });
        if (!draft.servings) draft.servings = 1;
        draft.tips = (draft.tips || '').trim();
        /* Texte inchangé (ex. seul le temps a été modifié) : on garde le texte enregistré, la recette intégrée
           reste « intacte » et continue de suivre la langue de l'app. */
        var sameText = shown && TEXT_KEYS.every(function (k) { return JSON.stringify(draft[k] || '') === JSON.stringify(shown[k] || ''); });
        if (sameText) TEXT_KEYS.forEach(function (k) { if (r[k] === undefined) delete draft[k]; else draft[k] = clone(r[k]); });
        if (isNew) data.recipes.push(draft);
        else {
          data.recipes[data.recipes.indexOf(r)] = draft;
          if (!sameText) delete data.checks[draft.id]; /* les lignes ont pu changer */
        }
        delete servingsView[draft.id];
        persist(); close();
        currentId = draft.id; page = 'detail'; mode = 'groceries';
        render(); window.scrollTo(0, 0);
        ui.toast(isNew ? L('Recipe added', 'Recette ajoutée') : L('Recipe updated', 'Recette modifiée'));
      }

      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New recipe', 'Nouvelle recette') : L('Edit recipe', 'Modifier la recette')),
        text(L('Name', 'Nom'), 'name', L('e.g. Chicken curry', 'ex. Curry de poulet')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Category', 'Catégorie')), catSeg),
        h('div', { class: 'form-grid' }, numf(L('Time (min)', 'Temps (min)'), 'time', '15'), numf(L('Servings', 'Portions'), 'servings', '1'),
          numf(L('Protein (g)', 'Protéines (g)'), 'protein', '40')),
        h('div', { class: 'form-grid ck-grid1' }, numf(L('Calories (kcal, optional)', 'Calories (kcal, facultatif)'), 'kcal', '600')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' },
          L('Main ingredients (for search, comma-separated)', 'Ingrédients principaux (pour la recherche, séparés par des virgules)')), tagsInp),
        lines(L('Ingredients (one per line)', 'Ingrédients (un par ligne)'), 'ingredients',
          L('200 g chicken breast\n1 tbsp honey\nSalt & pepper', '200 g de blanc de poulet\n1 c. à soupe de miel\nSel & poivre'),
          L('Start a line with the quantity (e.g. “200 g …”) so it adjusts with the number of servings.',
            'Commence la ligne par la quantité (ex. « 200 g … ») pour qu’elle s’adapte au nombre de portions.')),
        lines(L('Steps (one per line)', 'Étapes (une par ligne)'), 'steps',
          L('Cut the chicken into pieces.\nCook 6 minutes over medium-high heat.', 'Coupe le poulet en morceaux.\nCuis 6 minutes à feu moyen-vif.')),
        text(L('Tip (optional)', 'Astuce (facultatif)'), 'tips', ''),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? L('Add the recipe', 'Ajouter la recette') : L('Save changes', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  function removeRecipe(r) {
    var name = view(r).name;
    ui.confirm({ title: L('Delete this recipe?', 'Supprimer cette recette ?'),
      message: L('“' + name + '” will be removed from your recipes.', '« ' + name + ' » sera retirée de tes recettes.'),
      okLabel: L('Delete', 'Supprimer'), cancelLabel: L('Cancel', 'Annuler'), danger: true }).then(function (ok) {
      if (!ok) return;
      data.recipes = data.recipes.filter(function (x) { return x.id !== r.id; });
      delete data.checks[r.id];
      if (r.builtin && data.removedBuiltins.indexOf(r.id) < 0) data.removedBuiltins.push(r.id);
      persist(); back(); ui.toast(L('Recipe deleted', 'Recette supprimée'));
    });
  }

  S2.app.registerTab({ id: 'cuisine', label: L('Kitchen', 'Cuisine'), order: 30, icon: ICON, mount: mount });
})();
