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
  var SCHEMA = 6;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2zM2 11h2M20 11h2M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/></svg>';
  var CATS = { breakfast: L('Breakfast & snack', 'Petit-déjeuner & en-cas'), main: L('Lunch & dinner', 'Déjeuner & dîner') };
  var OTHER = L('Other', 'Autres');
  /* Empreintes des 10 recettes intégrées d'origine (version anglaise, v0.4). Une copie encore identique
     est remplacée par la version française ; une recette modifiée par l'utilisateur reste telle quelle. */
  var LEGACY_EN = { 'b-cottage-eggs': '13yqel9', 'b-skyr-bowl': '1c896eo', 'b-banana-pancakes': '1vz9snt', 'b-salmon-wrap': 'ym5v8l',
    'm-honey-garlic-chicken': 'yiocr1', 'm-chicken-fajitas': 'qphei0', 'm-korean-beef': 'epn7mx', 'm-lemon-salmon': '3gb594',
    'm-tuna-pasta': '12umfqs', 'm-shrimp-fried-rice': 'r8w1dr' };
  /* Recettes intégrées retirées en v0.19 (remplacées par celles du livret PDF, trop proches) : empreintes
     des versions publiées (française, et anglaise d'origine pour les 3 premières). Une copie encore identique
     est supprimée des données ; une recette modifiée par l'utilisateur est gardée. */
  var REMOVED = { 'b-banana-pancakes': ['13r3ea0', '1vz9snt'], 'b-overnight-oats': ['ogq3qs'], 'b-ham-omelette': ['1qy4sr0'],
    'b-egg-muffins': ['nwprkb'], 'b-avocado-toast': ['5brupa'], 'm-chicken-fajitas': ['16duqai', 'qphei0'], 'm-tuna-pasta': ['cswgtt', '12umfqs'],
    'm-coconut-curry': ['ibwd26'], 'm-lean-burgers': ['z26ts9'], 'm-chicken-quesadillas': ['79kia7'], 'm-pesto-gnocchi': ['mlg1gd'] };
  /* v0.24 : protéines par portion recalculées à partir des ingrédients (valeurs nutritionnelles standard, crus/secs).
     [ancienne valeur, nouvelle] : une copie qui a encore l'ancienne valeur est corrigée ; une valeur modifiée à la main est gardée. */
  var PROTEIN_FIX = { 'm-tuna-pasta-bake': [43, 65], 'b-cottage-egg-muffins': [25, 36], 'm-crispy-chicken-cheddar': [45, 60], 'm-chicken-burger-bowl': [45, 60], 'b-tomato-mozza-egg-toast': [27, 34], 'm-tortilla-pizza': [42, 53], 'm-chicken-caesar': [52, 65], 'm-paprika-chicken-tray': [46, 57], 'b-breakfast-burrito': [38, 32], 'm-chicken-cheddar-wraps': [45, 55], 'm-chicken-mozza-quesadillas': [45, 55], 'm-tuna-baked-potatoes': [42, 51], 'm-shrimp-risotto': [38, 46], 'b-tuna-toast': [33, 39], 'b-protein-french-toast': [32, 38], 'm-mozza-cottage-omelette': [38, 45], 'b-fromage-blanc-apple': [26, 23], 'm-chicken-lasagna': [45, 53], 'm-chicken-burger': [45, 53], 'm-turkey-meatballs': [52, 61], 'm-chicken-coconut-curry': [45, 53], 'm-creamy-pesto-chicken-pasta': [50, 58], 'm-creamy-chicken-pasta': [50, 58], 'b-pb-smoothie': [35, 40], 'b-cheesecake-oats': [30, 27], 'm-lentil-dahl': [32, 36], 'm-creamy-chicken-gnocchi': [48, 54] };
  /* v0.25 : calories par portion recalculées de la même façon (huile, avocat, fromages comptés). Même règle que PROTEIN_FIX. */
  var KCAL_FIX = { 'b-choco-porridge': [470, 540], 'b-fromage-blanc-apple': [360, 320], 'b-protein-bars': [230, 270], 'b-choco-protein-crepes': [520, 460], 'b-avocado-egg-toasts': [560, 750], 'b-avocado-scrambled-feta': [520, 600], 'b-cottage-egg-muffins': [380, 430], 'b-tomato-mozza-egg-toast': [520, 620], 'm-lemon-salmon': [680, 770], 'm-chili': [640, 710], 'm-turkey-meatballs': [650, 810], 'm-peanut-tofu': [640, 860], 'm-paprika-chicken-tray': [560, 700], 'm-teriyaki-salmon': [690, 850], 'm-shrimp-poke': [600, 720], 'm-chicken-ramen': [580, 500], 'm-lentil-feta-salad': [560, 660], 'm-tortilla-pizza': [560, 700], 'm-creamy-chicken-gnocchi': [700, 610], 'm-chicken-mozza-quesadillas': [620, 690], 'm-chicken-coconut-curry': [690, 770], 'm-mozza-cottage-omelette': [520, 620], 'm-chicken-burger-bowl': [650, 570], 'm-tuna-pasta-bake': [690, 760], 'm-crispy-chicken-cheddar': [700, 620], 'm-chicken-burger': [620, 510] };
  function fingerprint(r) {
    var str = JSON.stringify([r.name, r.ingredients, r.steps, r.tips || '']), x = 5381;
    for (var i = 0; i < str.length; i++) x = ((x * 33) ^ str.charCodeAt(i)) >>> 0;
    return x.toString(36);
  }

  /* ---------- Données ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  /* Copie d'une recette intégrée pour les données de l'utilisateur : texte français seulement (la traduction reste dans la source). */
  function builtinCopy(src) { var c = clone(src); delete c.en; delete c.photo; c.builtin = true; return c; }
  /* Photo d'une recette intégrée (img/recettes/…), lue dans la source : jamais enregistrée dans les données. */
  var ROOT = window.S2_APP && window.S2_APP.root || ''; /* app Cuisine seule (cuisine/) : fichiers un dossier plus haut */
  function photoOf(r) { var src = r.builtin && BUILTIN[r.id]; return src && src.photo ? ROOT + src.photo : null; }

  var BUILTIN = {}, BUILTIN_FP = {};
  (S2.cuisineRecipes || []).forEach(function (r) { BUILTIN[r.id] = r; BUILTIN_FP[r.id] = fingerprint(r); });

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.recipes)) d = { schema: SCHEMA, recipes: [], checks: {}, removedBuiltins: [] };
    d.checks = d.checks || {};
    d.removedBuiltins = d.removedBuiltins || [];
    /* v0.23 : favoris, notes, menu de la semaine, historique, « avec ce que j'ai », ingrédients exclus (ajouts compatibles). */
    d.favs = d.favs || {}; d.notes = d.notes || {};
    d.plan = d.plan || {}; d.plan.items = d.plan.items || []; d.plan.checks = d.plan.checks || {};
    d.history = d.history || []; d.have = d.have || []; d.exclude = d.exclude || [];
    /* v0.29 : planning de la semaine validé (ajout compatible). week = { start, batch, days: [{ meals: [{ recipeId, portion }] }] } */
    d.week = d.week || null; d.weekBatch = !!d.weekBatch;
    /* v0.36 : app personnelle, plus de planning « à 2 » : on retire la portion de l'autre personne du planning validé
       (le menu et les courses déjà calculés ne changent pas). */
    d.forTwo = false;
    /* v0.37 : listes de courses reçues d'une autre app Gym Food (courses à 2) : [{ id, from, at, added, items }]. */
    d.shared = Array.isArray(d.shared) ? d.shared : [];
    if (d.week) { d.week.forTwo = false; d.week.days.forEach(function (day) { day.meals.forEach(function (m) { delete m.portion2; }); }); }
    /* v0.30 : prix saisis par l'utilisateur (€ par kg, litre ou pièce selon l'ingrédient), clé = nom normalisé. */
    d.prices = d.prices || {};
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
    /* Migration v3 : retire les copies non modifiées des recettes intégrées supprimées (et leurs cases cochées). */
    if ((d.schema || 1) < 3) {
      d.recipes = d.recipes.filter(function (r) {
        var gone = r.builtin && REMOVED[r.id] && REMOVED[r.id].indexOf(fingerprint(r)) > -1;
        if (gone) { delete d.checks[r.id]; added = true; }
        return !gone;
      });
    }
    if ((d.schema || 1) < 4) {
      d.recipes.forEach(function (r) {
        var f = r.builtin && PROTEIN_FIX[r.id];
        if (f && r.protein === f[0]) { r.protein = f[1]; added = true; }
      });
    }
    if ((d.schema || 1) < 5) {
      d.recipes.forEach(function (r) {
        var f = r.builtin && KCAL_FIX[r.id];
        if (f && r.kcal === f[0]) { r.kcal = f[1]; added = true; }
      });
    }
    /* v0.33 : protéines du poke bowl crevettes recalculées avec la table nutritionnelle (crevettes cuites ≈ 24 g / 100 g). */
    if ((d.schema || 1) < 6) {
      d.recipes.forEach(function (r) {
        if (r.builtin && r.id === 'm-shrimp-poke' && r.protein === 42) { r.protein = 50; added = true; }
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
  /* v0.43 : photo des données avant une action qu'on peut regretter, pour « Annuler ». */
  function snapshot() {
    var saved = JSON.stringify(data);
    return function () { data = JSON.parse(saved); persist(); if (root) render(); };
  }
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


  /* ---------- Analyse d'une ligne d'ingrédient : quantité, unité, nom ----------
     « 240 g de blanc de poulet » → { qty: 240, unit: 'g ', link: 'de ', name: 'blanc de poulet' }.
     Sert à additionner les courses du menu et à retrouver les quantités citées dans une étape. */
  var UNIT_RE = /^(kg|g|mg|ml|cl|dl|l|tbsp|tsp|c\. à soupe|c\. à café)(\s+|$)/i;
  function parseLine(line) {
    var m = String(line).match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*)(.*)$/);
    if (!m) return { qty: null, unit: '', link: '', name: String(line) };
    var q = m[1].indexOf('/') > -1 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'));
    var rest = m[3], unit = '', link = '';
    var u = rest.match(UNIT_RE);
    if (u) { unit = u[0]; rest = rest.slice(u[0].length); }
    var l = rest.match(/^(de |d’|d'|of )/i);
    if (l) { link = l[0]; rest = rest.slice(l[0].length); }
    return { qty: q, unit: unit, link: link, name: rest };
  }
  function singular(w) { return w.length > 3 ? w.replace(/(s|x)$/, '') : w; }
  /* Clé de regroupement d'un nom : sans accents, sans parenthèses, au singulier. */
  function nameKey(name) {
    return norm(String(name).replace(/\([^)]*\)/g, ' ')).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).map(singular).join(' ');
  }
  function roundQty(v) { return v >= 10 ? Math.round(v) : Math.round(v * 10) / 10; }

  /* ---------- Rayons du magasin (mots-clés en français et en anglais) ---------- */
  var AISLES = [
    { id: 'grocery', label: L('Pantry', 'Épicerie') },
    { id: 'meat', label: L('Meat & fish', 'Viandes & poissons') },
    { id: 'dairy', label: L('Dairy & eggs', 'Crèmerie & œufs') },
    { id: 'veg', label: L('Fruit & veg', 'Fruits & légumes') },
    { id: 'bakery', label: L('Bakery', 'Boulangerie') }
  ];
  var AISLE_ORDER = ['veg', 'meat', 'dairy', 'bakery', 'grocery'];
  /* Ordre important : les exceptions d'épicerie (« lait de coco », « beurre de cacahuète », « sel & poivre »…) d'abord. */
  var AISLE_RULES = [
    ['grocery', /coco|cacahuete|peanut|\bsel\b|\bsalt\b|poivre\b|paprika|curry|cumin|cannelle|cinnamon|epice|spice|origan|oregano|herbes de provence|bouillon|stock|vinaigre|vinegar|sauce|huile|\boil\b|haricot rouge|haricot noir|kidney|black bean|lentille|lentil|coulis|passata|concasse|chopped tomato|pesto|moutarde|mustard|cornichon|gherkin|chapelure|breadcrumb|levure|baking powder|farine|flour|cacao|cocoa|chocolat|chocolate|miel|honey|sirop|syrup|sucre|sugar|whey|protein powder|mais|sweetcorn|corn|maizena|cornflour/],
    ['meat', /poulet|chicken|boeuf|beef|steak|rumsteck|porc|pork|filet mignon|dinde|turkey|jambon|\bham\b|saumon|salmon|thon|tuna|crevette|prawn|shrimp|cabillaud|\bcod\b|poisson|fish|volaille/],
    ['dairy', /oeuf|\begg|skyr|yaourt|yogurt|yoghurt|fromage|cheese|cottage|feta|mozzarella|parmesan|cheddar|ricotta|\blait\b|\bmilk\b|beurre|butter|creme|cream|quark/],
    ['bakery', /\bpain\b|bread|tortilla|bagel|brioche|\bbun\b|burger|pita/],
    ['veg', /tomate|tomato|avocat|avocado|citron|lemon|lime|banane|banana|pomme|apple|poivron|\bpepper\b|oignon|onion|echalote|shallot|\bail\b|garlic|concombre|cucumber|carotte|carrot|courgette|brocoli|broccoli|epinard|spinach|salade|lettuce|roquette|rocket|champignon|mushroom|haricot vert|green bean|patate|potato|fraise|strawberr|fruit|berr|cebette|spring onion|pousse de soja|bean sprout|ciboulette|chive|persil|parsley|basilic|basil|aneth|dill|coriandre|coriander|gingembre|ginger|edamame|bok choy|romaine|legume|vegetable|herbe|herb/]
  ];
  function aisleOf(key) {
    for (var i = 0; i < AISLE_RULES.length; i++) if (AISLE_RULES[i][1].test(key)) return AISLE_RULES[i][0];
    return 'grocery';
  }

  /* ---------- Critères de recherche ---------- */
  var MEAT_RE = /poulet|chicken|boeuf|beef|steak|dinde|turkey|porc|pork|jambon|\bham\b|saumon|salmon|thon|tuna|crevette|prawn|shrimp|cabillaud|\bcod\b|poisson|fish|volaille|viande|meat|lardon|bacon/;
  var OVEN_RE = /\bfour\b|enfourne|oven|air fryer|gratin|\bbake\b|baking dish/;
  function allText(v, part) { return norm([].concat(v[part] || [], v.alt ? v.alt[part] || [] : []).join(' | ')); }
  function isQuick(r) { return !!r.time && r.time <= 15; }
  function usesOven(v) { return OVEN_RE.test(allText(v, 'steps')); }
  function isVeggie(v) { return !MEAT_RE.test(allText(v, 'ingredients')); }
  function excluded(r, v) {
    if (!data.exclude.length) return false;
    var hs = haystack(r, v);
    return data.exclude.some(function (t) { return hs.indexOf(singular(norm(t))) > -1; });
  }
  /* Ingrédients principaux d'une recette = ses mots-clés, sans les types de plat. */
  var NOT_INGREDIENT = /^(en-cas|snack|four|oven|vegetarien|vegetarian|vegan|salade|salad|soupe|soup|wok|burger|pizza|risotto|wrap|bowl|curry|lasagne|lasagnes|crepes|meal prep|tortilla)$/;
  function mainIngredients(v) {
    return v.tags.filter(function (t) { return !NOT_INGREDIENT.test(norm(t)); });
  }
  function haveIt(tag) {
    var k = nameKey(tag);
    return data.have.some(function (h0) { var x = nameKey(h0); return x && (k.indexOf(x) > -1 || x.indexOf(k) > -1); });
  }
  function missingFor(v) { return mainIngredients(v).filter(function (t) { return !haveIt(t); }); }

  /* ---------- Menu de la semaine et historique ---------- */
  function planItems() { return data.plan.items.filter(function (it) { return recipe(it.recipeId); }); }
  function addToPlan(r, servings) {
    data.plan.items.push({ uid: ui.uid(), recipeId: r.id, servings: servings, added: new Date().toISOString() });
    persist();
  }
  function logCooked(r, servings) {
    data.history.unshift({ recipeId: r.id, servings: servings, date: new Date().toISOString() });
    if (data.history.length > 200) data.history.length = 200;
  }
  function cookedStats(id) {
    var list = data.history.filter(function (x) { return x.recipeId === id; });
    return { n: list.length, last: list[0] ? list[0].date : null };
  }

  /* Liste de courses commune : additionne les quantités de même unité et même nom, puis range par rayon. */
  function shoppingList(mineOnly) {
    var groups = {}, order = [];
    planItems().forEach(function (it) {
      var r = recipe(it.recipeId), v = view(r), factor = (it.servings || 1) / (r.servings || 1);
      v.ingredients.forEach(function (line) {
        var p = parseLine(line), nk = nameKey(p.name);
        var key = (p.qty === null ? 'x' : norm(p.unit).trim() || '#') + '|' + nk;
        var g = groups[key];
        if (!g) { g = groups[key] = { key: key, qty: p.qty === null ? null : 0, first: p, recipes: [], aisle: aisleOf(nk) }; order.push(key); }
        if (p.qty !== null) g.qty += p.qty * factor;
        if (g.recipes.indexOf(v.name) < 0) g.recipes.push(v.name);
      });
    });
    var list = order.map(function (k) { return groups[k]; });
    /* Courses à 2 : on ajoute les listes reçues (mêmes ingrédients additionnés). */
    if (!mineOnly && data.shared.length && SH) SH.merge(list, data.shared, myLabel());
    return list.map(function (g) {
      var f = g.first;
      if (g.qty === null) { g.text = f.name; return g; }
      var total = roundQty(g.qty), name = f.name;
      if (!f.unit && f.qty < 2 && total >= 2) name = FR ? pluralize(name) : pluralizeEn(name);
      g.text = num(total) + ' ' + f.unit + f.link + name;
      return g;
    });
  }

  /* ---------- Guide de cuisson : quantités citées dans une étape, minuteurs ---------- */
  var WEAK_WORDS = /^(blanc|filet|pave|dos|tranche|boite|gousse|poignee|pincee|feuille|grande|grand|petite|petit|gros|grosse|frais|fraiche|cuit|cru|nature|complet|complete|surgele|sachet|boule|coeur|paquet|haute|cuisse|egoutte|rape|leger|light|slice|clove|handful|pinch|fillet|large|small|fresh|plain|breast|thigh|drained|grated|cooked|uncooked|frozen|pouch|ball|heart|whole|wholegrain|wholewheat|seeded|lean|minced|peeled|chopped|tinned|can|piece|cereale|aux|des|les|the|and|avec|pour|bien|mur|mure)$/;
  function stepIngredients(stepText, v, factor) {
    var s = ' ' + norm(stepText).replace(/[^a-z0-9]+/g, ' ') + ' ';
    var out = [];
    v.ingredients.forEach(function (line) {
      var p = parseLine(line);
      if (p.qty === null) return;
      var words = nameKey(p.name).split(' ').filter(function (w) { return w.length >= 3 && !WEAK_WORDS.test(w) && !/^\d/.test(w); });
      if (!words.length) return;
      var hit = words.some(function (w) { return new RegExp(' ' + w + '(s|x|es)? ').test(s); });
      if (hit) out.push(scaleLine(line, factor));
    });
    return out;
  }
  /* Durées citées : « 5 à 6 minutes », « 30 secondes », « 1 heure » → secondes (borne basse : on vérifie tôt). */
  var DURATION_RE = /(\d+(?:[.,]\d+)?)(?:\s*(?:à|a|-|–|to|or|ou)\s*(\d+(?:[.,]\d+)?))?\s*(minutes?|min\b|secondes?|seconds?|sec\b|heures?|hours?)/gi;
  function durations(text) {
    var out = [], m, seen = {};
    DURATION_RE.lastIndex = 0;
    while ((m = DURATION_RE.exec(text))) {
      var a = Number(m[1].replace(',', '.')), b = m[2] ? Number(m[2].replace(',', '.')) : null, u = m[3].toLowerCase();
      var mult = /^s/.test(u) ? 1 : /^h/.test(u) ? 3600 : 60;
      var secs = Math.round(a * mult);
      if (!secs || seen[secs]) continue;
      seen[secs] = true;
      var unitShort = mult === 1 ? ' s' : mult === 3600 ? ' h' : ' min';
      out.push({ secs: secs, label: num(a) + (b ? '–' + num(b) : '') + unitShort });
    }
    return out;
  }

  /* Minuteur unique, visible partout (pastille en haut de l'écran, au-dessus des feuilles). Le bip est programmé à l'avance via
     Web Audio, démarré par le toucher (exigence d'iOS) ; l'écran reste allumé pendant le guide. */
  var timer = null;
  function fmtClock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function startTimer(secs, label) {
    stopTimer(true);
    var ctx = null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        [0, 0.45, 0.9, 1.6, 2.05, 2.5].forEach(function (d) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.value = 880; g.gain.value = 0.25;
          o.connect(g); g.connect(ctx.destination);
          o.start(ctx.currentTime + secs + d); o.stop(ctx.currentTime + secs + d + 0.3);
        });
      }
    } catch (e) { ctx = null; }
    var pill = h('button', { class: 'ck-timerpill', 'aria-live': 'polite',
      onclick: function () { if (!timer) return; if (timer.done) stopTimer(); else ui.confirm({ title: L('Stop the timer?', 'Arrêter le minuteur ?'), okLabel: L('Stop', 'Arrêter') }).then(function (ok) { if (ok) stopTimer(); }); } });
    document.body.appendChild(pill);
    timer = { end: Date.now() + secs * 1000, label: label, ctx: ctx, pill: pill, done: false };
    function tick() {
      if (!timer) return;
      var left = (timer.end - Date.now()) / 1000;
      if (left <= 0 && !timer.done) {
        timer.done = true;
        pill.classList.add('is-done');
        if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
        ui.toast(L('Time’s up! ', 'C’est l’heure ! ') + timer.label);
      }
      pill.textContent = timer.done ? L('⏰ Time’s up · tap to close', '⏰ Terminé · touche pour fermer') : '⏱ ' + fmtClock(left) + ' · ' + timer.label;
    }
    tick();
    timer.iv = setInterval(tick, 500);
  }
  function stopTimer(silent) {
    if (!timer) return;
    clearInterval(timer.iv);
    if (timer.ctx) { try { timer.ctx.close(); } catch (e) { /* déjà fermé */ } }
    timer.pill.remove();
    timer = null;
    if (!silent) ui.toast(L('Timer stopped', 'Minuteur arrêté'));
  }
  function timerButtons(text) {
    var d = durations(text);
    if (!d.length) return null;
    return h('div', { class: 'ck-timers' }, d.map(function (x) {
      return h('button', { class: 'btn btn-secondary btn-sm ck-timerbtn', type: 'button',
        'aria-label': L('Start a timer for ', 'Lancer un minuteur de ') + x.label,
        onclick: function (e) { e.stopPropagation(); startTimer(x.secs, x.label); } }, '⏱ ' + x.label);
    }));
  }

  /* ---------- État d'interface ---------- */
  var page = 'list';       // list | detail
  var section = 'recipes'; // recipes | menu | shop (onglets en haut de la liste)
  var flags = { fav: false, quick: false, noOven: false, veggie: false, have: false, goal: false };
  var dayIdx = 0;          // journée type affichée (section Planning › Un jour)
  var planDays = null;     // 1 | 3 | 4 | 7 jours (null = longueur du planning validé, sinon 1)
  var planShift = 0;       // décalage (jours) du début de la proposition par rapport au début proposé
  var weekSeed = 0, weekPicks = [], weekDraft = false; // proposition en cours (non enregistrée)

  /* ---------- Objectif (Gym Food) : lu via S2.objectif, jamais dans les données d'un autre onglet ---------- */
  var NE = S2.nutritionEngine;
  function goalTargets() {
    try { return NE && S2.objectif ? S2.objectif.targets() : null; } catch (e) { return null; }
  }
  function hasGoalTab() { return !!(NE && S2.objectif); }
  var FIT_LABEL = {
    good: L('🎯 Great for your goal', '🎯 Idéale pour ton objectif'),
    ok: L('Fine for your goal', 'Correcte pour ton objectif'),
    low: L('Low in protein for your goal', 'Peu protéinée pour ton objectif')
  };
  function portionText(x) { return x === 1 ? L('1 serving', '1 portion') : '×' + num(x) + L(' serving', ' portion'); }
  var SLOT_LABELS = {
    2: [L('Lunch', 'Déjeuner'), L('Dinner', 'Dîner')],
    3: [L('Breakfast', 'Petit-déjeuner'), L('Lunch', 'Déjeuner'), L('Dinner', 'Dîner')],
    4: [L('Breakfast', 'Petit-déjeuner'), L('Lunch', 'Déjeuner'), L('Snack', 'En-cas'), L('Dinner', 'Dîner')],
    5: [L('Breakfast', 'Petit-déjeuner'), L('Morning snack', 'En-cas du matin'), L('Lunch', 'Déjeuner'), L('Afternoon snack', 'Goûter'), L('Dinner', 'Dîner')]
  };
  var currentId = null;
  var mode = 'groceries';  // groceries | cook
  var query = '', filter = 'all';
  var servingsView = {};   // portions affichées par recette (non enregistré)

  function meals(n) { return n + (FR ? ' repas' : n === 1 ? ' meal' : ' meals'); } /* « repas » est invariable */
  function plural(n, en, fr) { return n + ' ' + (FR ? fr + (n > 1 ? 's' : '') : en + (n === 1 ? '' : 's')); }

  var goalDefaultSet = false;
  function mount(container) {
    data = loadData();
    /* Profil rempli dans Objectif : les recettes sont classées selon l'objectif dès l'ouverture (puce désactivable). */
    if (!goalDefaultSet) { goalDefaultSet = true; if (goalTargets()) flags.goal = true; }
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
    var nMenu = planItems().length;
    var secs = [['recipes', L('Recipes', 'Recettes')]];
    if (hasGoalTab()) secs.push(['day', L('Planning', 'Planning')]);
    secs.push(['menu', L('Menu', 'Menu') + (nMenu ? ' · ' + nMenu : '')], ['shop', L('Groceries', 'Courses')]);
    root.appendChild(h('div', { class: 'segmented ck-sections' },
      secs.map(function (x) {
        return h('button', { class: 'seg' + (section === x[0] ? ' is-active' : ''), 'aria-pressed': section === x[0] ? 'true' : 'false',
          onclick: function () { section = x[0]; render(); window.scrollTo(0, 0); } }, x[1]);
      })));
    if (section === 'menu') { renderMenu(); return; }
    if (section === 'day' && hasGoalTab()) { renderDay(); return; }
    if (section === 'shop') { renderShop(); return; }
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
    root.appendChild(filterChips());
    root.appendChild(results);
    renderResults(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editRecipe(null); } }, L('+ Add a recipe', '+ Ajouter une recette'))));
  }

  function renderResults(box) {
    box.innerHTML = '';
    var useHave = flags.have && data.have.length > 0;
    var T = flags.goal ? goalTargets() : null;
    var list = data.recipes.map(function (r) { return { r: r, v: view(r) }; })
      .filter(function (x) {
        if (!(filter === 'all' || x.r.category === filter) || !matches(x.r, x.v, query)) return false;
        if (flags.fav && !data.favs[x.r.id]) return false;
        if (flags.quick && !isQuick(x.r)) return false;
        if (flags.noOven && usesOven(x.v)) return false;
        if (flags.veggie && !isVeggie(x.v)) return false;
        if (excluded(x.r, x.v)) return false;
        if (useHave) {
          var main = mainIngredients(x.v);
          x.missing = missingFor(x.v);
          if (!main.length || x.missing.length === main.length) return false; /* aucun ingrédient principal en stock */
        }
        if (T) x.fit = NE.recipeFit(x.r, T);
        return true;
      })
      .sort(function (a, b) {
        if (useHave && a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
        if (T) { var sa = a.fit ? a.fit.score : 99, sb = b.fit ? b.fit.score : 99; if (sa !== sb) return sa - sb; }
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
    if (useHave) box.appendChild(h('p', { class: 'hint' }, L('Sorted by what you are missing (main ingredients).', 'Classées selon ce qu’il te manque (ingrédients principaux).')));
    else if (T) box.appendChild(h('p', { class: 'hint' }, L('Sorted by fit with your goal (', 'Classées selon ton objectif (') + T.kcal + ' kcal · ' + T.protein +
      L(' g protein a day): richest in protein per calorie first. Your serving is adjusted to about one meal (≈ ', ' g de protéines par jour) : les plus riches en protéines par calorie d’abord. Ta portion est ajustée pour faire environ un repas (≈ ') + T.perMeal.kcal + ' kcal).'));
    var lastCat = null;
    list.forEach(function (x) {
      if (useHave) { box.appendChild(card(x.r, x.v, x.missing, x.fit)); return; }
      if (filter === 'all' && x.r.category !== lastCat) {
        lastCat = x.r.category;
        box.appendChild(h('h2', { class: 'section-title' }, CATS[x.r.category] || OTHER));
      }
      box.appendChild(card(x.r, x.v, null, x.fit));
    });
  }

  function card(r, v, missing, fit) {
    var photo = photoOf(r);
    return h('button', { class: 'card ck-card' + (photo ? ' has-photo' : ''), onclick: function () { open(r.id); } },
      photo ? h('img', { class: 'ck-thumb', src: photo, alt: '', loading: 'lazy', decoding: 'async' }) : null,
      h('div', { class: 'ck-cardname' }, data.favs[r.id] ? h('span', { class: 'ck-fav', 'aria-label': L('Favourite', 'Favori') }, '♥ ') : null, v.name),
      missing ? h('div', { class: 'ck-missing' + (missing.length ? '' : ' is-ok') },
        missing.length ? L('Missing: ', 'Il te manque : ') + missing.join(', ') : L('✓ You have the main ingredients', '✓ Tu as les ingrédients principaux')) : null,
      h('div', { class: 'ck-meta' },
        r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
        r.protein ? h('span', { class: 'ck-protein' }, r.protein + L(' g protein', ' g de protéines')) : null,
        r.kcal ? h('span', null, r.kcal + ' kcal') : null,
        r.protein || r.kcal ? h('span', { class: 'ck-perserv' }, L('per serving', 'par portion')) : null),
      fit ? h('div', { class: 'ck-fit ck-fit-' + fit.level }, FIT_LABEL[fit.level] +
        ' · ' + L('your serving ', 'ta portion ') + (fit.portion === 1 ? '×1' : '×' + num(fit.portion)) + ' ≈ ' + fit.kcal + ' kcal, ' + fit.protein + ' g') : null,
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
    var photo = photoOf(r);
    if (photo) root.appendChild(h('img', { class: 'ck-hero', src: photo, alt: v.name, decoding: 'async' }));
    var fav = !!data.favs[r.id];
    root.appendChild(h('div', { class: 'ck-titlerow' },
      h('h2', { class: 'page-title' }, v.name),
      h('button', { class: 'btn btn-icon ck-favbtn' + (fav ? ' is-on' : ''), 'aria-pressed': fav ? 'true' : 'false',
        'aria-label': fav ? L('Remove from favourites', 'Retirer des favoris') : L('Add to favourites', 'Ajouter aux favoris'),
        onclick: function () { if (fav) delete data.favs[r.id]; else data.favs[r.id] = true; persist(); render(); } }, fav ? '♥' : '♡')));
    var stats = cookedStats(r.id);
    if (stats.n) root.appendChild(h('p', { class: 'hint ck-cooked' },
      L('Cooked ' + stats.n + (stats.n === 1 ? ' time' : ' times') + ' · last on ', 'Cuisinée ' + stats.n + ' fois · la dernière le ') + ui.date(stats.last)));
    root.appendChild(h('div', { class: 'ck-meta ck-meta-lg' },
      h('span', { class: 'badge' }, CATS[r.category] || OTHER),
      r.time ? h('span', null, '⏱ ' + r.time + ' min') : null,
      r.protein ? h('span', { class: 'ck-protein' }, '≈ ' + r.protein + L(' g protein', ' g de protéines')) : null,
      r.kcal ? h('span', null, '≈ ' + r.kcal + ' kcal') : null));
    /* Les valeurs enregistrées sont PAR PORTION (une personne) : elles ne changent pas avec le nombre de portions. */
    var MX = NT && (r.kcal || r.protein) ? NT.macros(r) : null;
    if (MX) root.appendChild(h('div', { class: 'ck-meta' }, h('span', null, L('Carbs ≈ ', 'Glucides ≈ ') + MX.carbs + ' g'), h('span', null, L('Fat ≈ ', 'Lipides ≈ ') + MX.fat + ' g')));
    if (r.protein || r.kcal) root.appendChild(h('p', { class: 'hint' },
      L('Approximate values per serving (one person)', 'Valeurs approximatives par portion (une personne)') +
      (serv > 1 && r.protein ? L(' · ≈ ' + Math.round(r.protein * serv) + ' g protein in total for ' + serv, ' · ≈ ' + Math.round(r.protein * serv) + ' g de protéines au total pour ' + serv) : '') + '.'));
    var T = goalTargets(), fit = T && NE.recipeFit(r, T);
    if (fit) root.appendChild(h('div', { class: 'card ck-goalcard ck-fit-' + fit.level },
      h('div', { class: 'ck-fit ck-fit-' + fit.level }, FIT_LABEL[fit.level]),
      h('p', { class: 'sheet-text' }, L('Your serving: ', 'Ta portion : '), h('b', null, portionText(fit.portion)), ' ≈ ' + fit.kcal + ' kcal · ' + fit.protein + L(' g protein', ' g de protéines')),
      h('div', { class: 'ck-goalbars' },
        goalBar(L('of your calories', 'de tes calories'), fit.dayKcal),
        goalBar(L('of your protein', 'de tes protéines'), fit.dayProtein)),
      h('p', { class: 'hint' }, fit.level === 'low'
        ? L('Pair it with a protein side (skyr, eggs, chicken…) or choose another recipe.', 'Ajoute un accompagnement protéiné (skyr, œufs, poulet…) ou choisis une autre recette.')
        : L('Based on ' + T.meals + ' meals a day (≈ ' + T.perMeal.kcal + ' kcal each).', 'Calculé pour ' + T.meals + ' repas par jour (≈ ' + T.perMeal.kcal + ' kcal chacun).'))));

    root.appendChild(h('div', { class: 'card ck-servings' },
      h('span', { class: 'field-label' }, L('Servings', 'Portions')),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': L('One serving less', 'Une portion de moins'), disabled: serv <= 1,
          onclick: function () { servingsView[r.id] = Math.max(1, serv - 1); render(); } }, '−'),
        h('span', { class: 'stepper-num' }, serv),
        h('button', { class: 'btn btn-step', 'aria-label': L('One serving more', 'Une portion de plus'), disabled: serv >= 12,
          onclick: function () { servingsView[r.id] = Math.min(12, serv + 1); render(); } }, '+'))));
    var inMenu = planItems().filter(function (it) { return it.recipeId === r.id; }).length;
    root.appendChild(h('button', { class: 'btn btn-secondary btn-block ck-addmenu', onclick: function () {
      addToPlan(r, serv); render();
      ui.toast(L('Added to the menu · ', 'Ajoutée au menu · ') + plural(serv, 'serving', 'portion'));
    } }, L('+ Add to the menu', '+ Ajouter au menu') + ' (' + plural(serv, 'serving', 'portion') + ')' +
      (inMenu ? L(' · already ' + inMenu + '×', ' · déjà ' + inMenu + '×') : '')));

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
          h('span', { class: 'ck-steptext' }, s,
            (function () { var q = stepIngredients(s, v, factor); return q.length ? h('span', { class: 'ck-stepqty' }, q.join(' · ')) : null; })())),
          timerButtons(s));
      })));
      if (done) root.appendChild(h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ch.steps = {}; persist(); render(); } }, L('Reset the steps', 'Remettre les étapes à zéro')));
      root.appendChild(h('details', { class: 'card ck-inglist' },
        h('summary', null, L('Ingredients', 'Ingrédients') + ' (' + v.ingredients.length + ')'),
        h('ul', null, v.ingredients.map(function (l) { return h('li', null, scaleLine(l, factor)); }))));
    }

    if (v.tips) root.appendChild(h('div', { class: 'note' }, h('strong', null, tipLabel), v.tips));

    /* Note perso (« Maeva : moins de piment »), enregistrée quand on quitte le champ. */
    var noteTa = h('textarea', { class: 'input ck-textarea ck-note', rows: 2, 'aria-label': L('My notes', 'Mes notes'),
      placeholder: L('e.g. less chilli, double the sauce…', 'ex. moins de piment, double dose de sauce…') });
    noteTa.value = data.notes[r.id] || '';
    noteTa.addEventListener('change', function () {
      var t = noteTa.value.trim();
      if (t) data.notes[r.id] = t; else delete data.notes[r.id];
      persist(); ui.toast(L('Note saved', 'Note enregistrée'));
    });
    root.appendChild(h('div', { class: 'card ck-notes' }, h('div', { class: 'card-title' }, L('My notes', 'Mes notes')), noteTa));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () { editRecipe(r); } }, L('Edit this recipe', 'Modifier cette recette')),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () { removeRecipe(r); } }, L('Delete this recipe', 'Supprimer cette recette'))));
  }

  /* ---------- Filtres (rangée de puces sous les catégories) ---------- */
  function filterChips() {
    function chip(key, label) {
      var on = flags[key];
      return h('button', { class: 'ck-chip' + (on ? ' is-on' : ''), 'aria-pressed': on ? 'true' : 'false',
        onclick: function () { flags[key] = !on; render(); } }, label);
    }
    var haveOn = flags.have && data.have.length;
    var goalChip = null;
    if (hasGoalTab()) {
      var gOn = flags.goal && !!goalTargets();
      goalChip = h('button', { class: 'ck-chip' + (gOn ? ' is-on' : ''), 'aria-pressed': gOn ? 'true' : 'false', onclick: function () {
        if (!goalTargets()) { askProfile(); return; }
        flags.goal = !flags.goal; render();
      } }, L('🎯 My goal', '🎯 Mon objectif'));
    }
    return h('div', { class: 'ck-chips', role: 'group', 'aria-label': L('Filters', 'Filtres') },
      goalChip,
      chip('fav', L('♥ Favourites', '♥ Favoris')),
      h('button', { class: 'ck-chip' + (haveOn ? ' is-on' : ''), 'aria-pressed': haveOn ? 'true' : 'false', onclick: editHave },
        L('🧺 What I have', '🧺 Avec ce que j’ai') + (data.have.length ? ' (' + data.have.length + ')' : '')),
      chip('quick', L('⏱ 15 min max', '⏱ 15 min max')),
      chip('noOven', L('No oven', 'Sans four')),
      chip('veggie', L('Vegetarian', 'Végétarien')),
      h('button', { class: 'ck-chip' + (data.exclude.length ? ' is-on' : ''), onclick: editExclude },
        L('🚫 Without…', '🚫 Sans…') + (data.exclude.length ? ' (' + data.exclude.length + ')' : '')));
  }

  /* « Avec ce que j'ai » : ingrédients principaux les plus fréquents, à cocher, + saisie libre. Enregistré. */
  function editHave() {
    var counts = {}, labels = {};
    data.recipes.forEach(function (r) {
      mainIngredients(view(r)).forEach(function (t) { var k = nameKey(t); counts[k] = (counts[k] || 0) + 1; if (!labels[k]) labels[k] = t; });
    });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || labels[a].localeCompare(labels[b], S2.lang); }).slice(0, 40);
    var picked = data.have.slice();
    function isPicked(t) { return picked.some(function (x) { return nameKey(x) === nameKey(t); }); }
    ui.sheet(function (close) {
      var box = h('div', { class: 'ck-chips ck-chips-wrap' });
      var extra = h('div', { class: 'ck-chips ck-chips-wrap' });
      function paint() {
        box.innerHTML = ''; extra.innerHTML = '';
        keys.forEach(function (k) {
          var t = labels[k], on = isPicked(t);
          box.appendChild(h('button', { class: 'ck-chip' + (on ? ' is-on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { if (on) picked = picked.filter(function (x) { return nameKey(x) !== k; }); else picked.push(t); paint(); } }, t));
        });
        picked.filter(function (x) { return keys.indexOf(nameKey(x)) < 0; }).forEach(function (t) {
          extra.appendChild(h('button', { class: 'ck-chip is-on', type: 'button', onclick: function () { picked = picked.filter(function (x) { return x !== t; }); paint(); } }, t + ' ✕'));
        });
      }
      paint();
      var inp = h('input', { class: 'input', type: 'text', autocomplete: 'off', enterkeyhint: 'done', autocapitalize: 'none',
        placeholder: L('Another ingredient, e.g. tofu', 'Autre ingrédient, ex. tofu'), 'aria-label': L('Add an ingredient', 'Ajouter un ingrédient') });
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var t = inp.value.trim().toLowerCase();
        if (t && !isPicked(t)) picked.push(t);
        inp.value = ''; paint();
      });
      return [
        h('h2', { class: 'sheet-title' }, L('What do you have?', 'Qu’est-ce que tu as ?')),
        h('p', { class: 'sheet-text' }, L('Tick your main ingredients: recipes are sorted by what is missing.', 'Coche tes ingrédients principaux : les recettes sont classées selon ce qu’il manque.')),
        box, extra, h('label', { class: 'field' }, inp),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            var t = inp.value.trim().toLowerCase(); if (t && !isPicked(t)) picked.push(t);
            data.have = picked; flags.have = picked.length > 0; persist(); close(); render();
          } }, L('Show the recipes', 'Voir les recettes')),
          picked.length || data.have.length ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () {
            data.have = []; flags.have = false; persist(); close(); render();
          } }, L('Clear', 'Tout effacer')) : null,
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* « Sans… » : ingrédients à éviter (ex. crevettes). Enregistré, appliqué à toutes les listes. */
  function editExclude() {
    ui.sheet(function (close) {
      var ta = h('input', { class: 'input', type: 'text', autocomplete: 'off', autocapitalize: 'none',
        value: data.exclude.join(', '), placeholder: L('e.g. shrimp, feta', 'ex. crevettes, feta'), 'aria-label': L('Ingredients to avoid', 'Ingrédients à éviter') });
      function save() {
        data.exclude = ta.value.split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
        persist(); close(); render();
        ui.toast(data.exclude.length ? L('Recipes with these ingredients are hidden', 'Les recettes avec ces ingrédients sont masquées') : L('No ingredient excluded', 'Aucun ingrédient exclu'));
      }
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      return [
        h('h2', { class: 'sheet-title' }, L('Without…', 'Sans…')),
        h('p', { class: 'sheet-text' }, L('Recipes containing these ingredients are hidden. Separate them with commas.', 'Les recettes qui contiennent ces ingrédients sont masquées. Sépare-les par des virgules.')),
        h('label', { class: 'field' }, ta),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          data.exclude.length ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { ta.value = ''; save(); } }, L('Show everything again', 'Tout réafficher')) : null,
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  function goalBar(label, share) {
    var pct = Math.round(share * 100);
    return h('div', { class: 'ck-goalbar' },
      h('span', { class: 'ck-goalpct' }, pct + ' %'), h('span', { class: 'list-sub' }, label),
      h('span', { class: 'ck-bar', 'aria-hidden': 'true' }, h('span', { style: 'width:' + Math.min(100, pct) + '%' })));
  }
  function askProfile() {
    ui.confirm({ title: L('Fill in your profile first', 'Remplis d’abord ton profil'),
      message: L('In the Goal tab, enter your height, weight and goal: recipes are then matched to your daily needs.',
        'Dans l’onglet Objectif, entre ta taille, ton poids et ton objectif : les recettes sont ensuite choisies selon tes besoins du jour.'),
      okLabel: L('Go to Goal', 'Aller à Objectif') }).then(function (ok) { if (ok) location.hash = '#objectif'; });
  }

  /* ---------- Ma journée : une journée type qui colle aux besoins (suggestion, rien n'est ajouté sans toi) ---------- */
  /* ---------- Planning : un jour, 3 jours, 4 jours ou la semaine (courses 1 ou 2 fois par semaine), pour 1 ou à 2 ---------- */
  var PERIODS = [[1, L('1 day', '1 jour')], [3, L('3 days', '3 jours')], [4, L('4 days', '4 jours')], [7, L('Week', 'Semaine')]];
  function periodName(n) { return n === 7 ? L('the week', 'la semaine') : n + L(' days', ' jours'); }
  function partnerT() {
    return null; /* v0.36 : app personnelle, plus de 2e personne */
  }
  function myName() { return S2.objectif && S2.objectif.myName ? S2.objectif.myName() : L('You', 'Toi'); }
  function otherName() { return S2.objectif && S2.objectif.partnerName ? S2.objectif.partnerName() : L('Other person', 'L’autre'); }
  function pShort(x) { return '×' + num(x); }
  /* Texte des portions d'un repas : la sienne, et celle de l'autre personne quand on cuisine à 2. */
  function mealText(m) {
    if (m.portion2 === undefined) return portionText(m.portion) + ' · ' + m.kcal + ' kcal · ' + m.protein + ' g';
    return myName() + ' ' + pShort(m.portion) + ' (' + m.kcal + ' kcal) · ' + otherName() + ' ' + pShort(m.portion2) + ' (' + m.kcal2 + ' kcal)';
  }
  function mealServings(m) { return Math.max(1, Math.ceil(m.portion + (m.portion2 || 0))); }
  function partnerLine(kcal2, protein2, T2, avg) {
    return h('div', { class: 'list-sub ck-partnerline' }, otherName() + (avg ? L(', per day on average: ', ', par jour en moyenne : ') : ' : ') +
      kcal2 + ' / ' + T2.kcal + ' kcal · ' + protein2 + ' / ' + T2.protein + L(' g protein', ' g de protéines'));
  }

  function renderDay() {
    var T = goalTargets();
    if (!T) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('Fill in your height, weight and goal in the Goal tab: the app then suggests a day of recipes that matches your needs.',
          'Remplis ta taille, ton poids et ton objectif dans l’onglet Objectif : l’app te propose ensuite une journée de recettes qui colle à tes besoins.')),
        h('a', { class: 'btn btn-primary', href: '#objectif' }, L('Fill in my profile', 'Remplir mon profil'))));
      return;
    }
    if (planDays === null) planDays = data.week && [3, 4, 7].indexOf(data.week.days.length) > -1 ? data.week.days.length : 1;
    root.appendChild(h('div', { class: 'segmented ck-planmode' },
      PERIODS.map(function (x) {
        return h('button', { class: 'seg' + (planDays === x[0] ? ' is-active' : ''), 'aria-pressed': planDays === x[0] ? 'true' : 'false',
          onclick: function () { planDays = x[0]; weekDraft = false; weekPicks = []; planShift = 0; render(); } }, x[1]);
      })));

    var T2 = partnerT();
    var two = !!(T2 && data.forTwo);
    root.appendChild(h('div', { class: 'card ck-daytarget' },
      h('div', { class: 'list-sub' }, (two ? myName() + ' · ' : '') + (S2.objectif.goalLabel(T.goal) || '') + L(' · per day', ' · par jour')),
      h('div', { class: 'ck-daytargetnum' }, T.kcal + ' kcal · ' + T.protein + L(' g protein', ' g de protéines')),
      h('div', { class: 'list-sub' }, T.meals + L(' meals', ' repas') + ' · ' + L('carbs ', 'glucides ') + T.carbs + ' g · ' + L('fat ', 'lipides ') + T.fat + ' g'),
      two ? h('div', { class: 'list-sub ck-partnerline' }, otherName() + ' : ' + T2.kcal + ' kcal · ' + T2.protein + L(' g protein', ' g de protéines')) : null));
    if (T2) {
      root.appendChild(h('div', { class: 'segmented small' },
        [[false, L('For me', 'Pour moi')], [true, L('For two (with ', 'À 2 (avec ') + otherName() + ')']].map(function (x) {
          return h('button', { class: 'seg' + (two === x[0] ? ' is-active' : ''), 'aria-pressed': two === x[0] ? 'true' : 'false',
            onclick: function () { data.forTwo = x[0]; persist(); weekDraft = !!data.week; render(); } }, x[1]);
        })));
    }

    var pool = data.recipes.filter(function (r) {
      var v = view(r);
      if (excluded(r, v)) return false;
      if (flags.veggie && !isVeggie(v)) return false;
      if (flags.noOven && usesOven(v)) return false;
      if (flags.quick && !isQuick(r)) return false;
      return true;
    });
    var active = [flags.veggie && L('vegetarian', 'végétarien'), flags.noOven && L('no oven', 'sans four'), flags.quick && L('15 min max', '15 min max'),
      data.exclude.length && L('without ', 'sans ') + data.exclude.join(', ')].filter(Boolean);
    if (active.length) root.appendChild(h('p', { class: 'hint' }, L('Filters applied: ', 'Filtres appliqués : ') + active.join(' · ')));
    if (planDays > 1) { renderPeriod(T, pool, planDays, two ? T2 : null); return; }

    var plans = NE.dayPlans(pool, T, 8);
    if (!plans.length) {
      root.appendChild(h('div', { class: 'empty-state small' }, h('p', null, L('Not enough recipes with calories and protein for a full day. Remove a filter or add recipes.',
        'Pas assez de recettes avec calories et protéines pour une journée. Retire un filtre ou ajoute des recettes.'))));
      return;
    }
    if (dayIdx >= plans.length) dayIdx = 0;
    var plan = plans[dayIdx];
    if (two) plan = NE.forTwo([plan], T2)[0];
    var labels = SLOT_LABELS[plan.meals.length] || [];
    root.appendChild(h('h2', { class: 'section-title' }, L('Suggested day ', 'Journée proposée ') + (dayIdx + 1) + ' / ' + plans.length));
    root.appendChild(h('div', { class: 'list' }, plan.meals.map(function (m, i) {
      var v = view(m.recipe);
      return h('button', { class: 'list-row list-row-btn ck-dayrow', onclick: function () {
        servingsView[m.recipe.id] = mealServings(m); open(m.recipe.id); } },
        h('div', { class: 'ck-daymain' },
          h('span', { class: 'ck-dayslot' }, labels[i] || ''),
          h('span', { class: 'list-title' }, v.name),
          h('span', { class: 'list-sub' }, mealText(m) + (m.recipe.time ? ' · ⏱ ' + m.recipe.time + ' min' : ''))),
        h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
    })));
    root.appendChild(h('div', { class: 'card ck-daytotal' },
      goalBar((two ? myName() + ' · ' : '') + L('calories: ', 'calories : ') + plan.kcal + ' / ' + T.kcal + ' kcal', plan.kcal / T.kcal),
      goalBar((two ? myName() + ' · ' : '') + L('protein: ', 'protéines : ') + plan.protein + ' / ' + T.protein + ' g', plan.protein / T.protein),
      two ? partnerLine(plan.kcal2, plan.protein2, T2) : null));
    root.appendChild(h('div', { class: 'bottom-actions' },
      plans.length > 1 ? h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { dayIdx = (dayIdx + 1) % plans.length; render(); } },
        L('↻ Another suggestion', '↻ Autre proposition')) : null,
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        plan.meals.forEach(function (m) { addToPlan(m.recipe, mealServings(m)); });
        render();
        ui.toast(L('Day added to the menu', 'Journée ajoutée au menu') + ' · ' + plan.meals.length + L(' meals', ' repas'));
      } }, L('+ Add this day to the menu', '+ Ajouter cette journée au menu'))));
    root.appendChild(h('p', { class: 'hint' }, L('Half servings are rounded up in the menu and groceries (cook a whole one, keep the rest). Values are estimates per serving.',
      'Les demi-portions sont arrondies au-dessus dans le menu et les courses (cuisine une portion entière, garde le reste). Valeurs estimées par portion.')));
  }

  /* ---------- Dates ---------- */
  function addDays(iso, n) { var d = new Date(iso); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d.toISOString(); }
  function dayLabel(start, i) {
    var s = new Date(addDays(start, i)).toLocaleDateString(S2.locale, { weekday: 'long', day: 'numeric', month: 'short' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function dayShort(start, i) {
    return new Date(addDays(start, i)).toLocaleDateString(S2.locale, { weekday: 'short' }).replace('.', '');
  }
  function todayStart() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); }
  /* Début proposé : le lendemain du dernier jour du planning validé s'il n'est pas fini, sinon aujourd'hui. */
  function defaultStart() {
    var today = todayStart();
    if (!data.week) return today;
    var end = addDays(data.week.start, data.week.days.length);
    return end > today ? end : today;
  }
  /* Planning enregistré → même forme que le moteur (recettes supprimées depuis : retirées). */
  function savedWeek() {
    if (!data.week) return null;
    return data.week.days.map(function (day) {
      var meals = day.meals.map(function (m) {
        var r = recipe(m.recipeId);
        if (!r) return null;
        var o = { recipe: r, portion: m.portion, kcal: Math.round((r.kcal || 0) * m.portion), protein: Math.round((r.protein || 0) * m.portion) };
        if (m.portion2) { o.portion2 = m.portion2; o.kcal2 = Math.round((r.kcal || 0) * m.portion2); o.protein2 = Math.round((r.protein || 0) * m.portion2); }
        return o;
      }).filter(Boolean);
      var d = { meals: meals, kcal: meals.reduce(function (n, m) { return n + m.kcal; }, 0), protein: meals.reduce(function (n, m) { return n + m.protein; }, 0) };
      if (data.week.forTwo) { d.kcal2 = meals.reduce(function (n, m) { return n + (m.kcal2 || 0); }, 0); d.protein2 = meals.reduce(function (n, m) { return n + (m.protein2 || 0); }, 0); }
      return d;
    });
  }

  function renderPeriod(T, pool, n, T2) {
    var savedFits = !weekDraft && data.week && data.week.days.length === n;
    var week, start, two;
    if (savedFits) {
      week = savedWeek(); start = data.week.start; two = !!data.week.forTwo;
      T2 = two ? (partnerT() || T2) : null;
    } else {
      var base = defaultStart();
      start = addDays(base, planShift);
      /* Recettes du planning validé : évitées pour ne pas remanger la même chose à la période suivante. */
      var avoid = {};
      if (data.week) data.week.days.forEach(function (d) { d.meals.forEach(function (m) { avoid[m.recipeId] = true; }); });
      var seed = weekSeed * 997 + Math.round(new Date(start).getTime() / 86400000);
      week = NE.weekPlan(pool, T, { days: n, seed: seed, picks: weekPicks, batch: data.weekBatch, avoid: avoid });
      two = !!T2;
      if (two) week = NE.forTwo(week, T2);
      if (!week.length) {
        root.appendChild(h('div', { class: 'empty-state small' }, h('p', null, L('Not enough recipes with calories and protein for this plan. Remove a filter or add recipes.',
          'Pas assez de recettes avec calories et protéines pour ce planning. Retire un filtre ou ajoute des recettes.'))));
        return;
      }
      /* Début du planning (aujourd'hui au plus tôt, 2 semaines au plus tard). */
      var today = todayStart(), maxStart = addDays(today, 14);
      root.appendChild(h('div', { class: 'card ck-startrow' },
        h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('One day earlier', 'Un jour plus tôt'), disabled: start <= today,
          onclick: function () { planShift--; weekPicks = []; render(); } }, '‹'),
        h('div', { class: 'ck-startlabel' },
          h('span', { class: 'list-sub' }, L('Starting', 'À partir de')),
          h('span', { class: 'ck-weekname' }, dayLabel(start, 0))),
        h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('One day later', 'Un jour plus tard'), disabled: start >= maxStart,
          onclick: function () { planShift++; weekPicks = []; render(); } }, '›')));
      /* Variété ou batch cooking (préférence enregistrée). */
      root.appendChild(h('div', { class: 'segmented small' },
        [[false, L('Varied', 'Variée')], [true, L('Batch cooking', 'Batch cooking')]].map(function (x) {
          return h('button', { class: 'seg' + (data.weekBatch === x[0] ? ' is-active' : ''), 'aria-pressed': data.weekBatch === x[0] ? 'true' : 'false',
            onclick: function () { data.weekBatch = x[0]; weekPicks = []; persist(); render(); } }, x[1]);
        })));
      root.appendChild(h('p', { class: 'hint' }, data.weekBatch
        ? L('Batch cooking: the same dishes come back 2 to 3 days in a row, so fewer recipes to buy and cook (cook several servings at once).',
          'Batch cooking : les mêmes plats reviennent 2 à 3 jours de suite, donc moins de recettes à acheter et à cuisiner (prépare plusieurs portions d’un coup).')
        : L('Varied: a different menu every day, a recipe comes back at most a few times.', 'Variée : un menu différent chaque jour, une recette revient peu.')));
    }

    var totals = NE.weekTotals(week);
    var avg = function (k) { return Math.round(week.reduce(function (s, d) { return s + (d[k] || 0); }, 0) / week.length); };
    var toCook = totals.reduce(function (s, x) { return s + Math.max(1, Math.ceil(x.portions)); }, 0);
    root.appendChild(h('h2', { class: 'section-title' }, (savedFits ? L('My plan · ', 'Mon planning · ') : L('Suggestion · ', 'Proposition · ')) + periodName(n) + (two ? L(' · for two', ' · à 2') : '')));
    root.appendChild(h('p', { class: 'hint' }, dayLabel(start, 0) + ' → ' + dayLabel(start, n - 1).toLowerCase() +
      (savedFits ? L(' · confirmed on ', ' · validé le ') + ui.date(data.week.saved || data.week.start) + L(': its meals are in the menu and the groceries.', ' : ses repas sont dans le menu et les courses.') : '')));
    root.appendChild(h('div', { class: 'card ck-daytotal' },
      h('div', { class: 'list-sub' }, plural(totals.length, 'different recipe', 'recette') + (FR && totals.length > 1 ? ' différentes' : FR ? ' différente' : '') + ' · ' + plural(toCook, 'serving', 'portion') + L(' to cook', ' à cuisiner')),
      goalBar((two ? myName() + ' · ' : '') + L('calories per day on average: ', 'calories par jour en moyenne : ') + avg('kcal') + ' / ' + T.kcal + ' kcal', avg('kcal') / T.kcal),
      goalBar((two ? myName() + ' · ' : '') + L('protein per day on average: ', 'protéines par jour en moyenne : ') + avg('protein') + ' / ' + T.protein + ' g', avg('protein') / T.protein),
      two && T2 ? partnerLine(avg('kcal2'), avg('protein2'), T2, true) : null));

    week.forEach(function (day, i) {
      var labels = SLOT_LABELS[day.meals.length] || [];
      root.appendChild(h('div', { class: 'card ck-weekday' },
        h('div', { class: 'ck-weekhead' },
          h('div', null,
            h('div', { class: 'ck-weekname' }, dayLabel(start, i)),
            h('div', { class: 'list-sub' }, (two ? myName() + ' ' : '') + day.kcal + ' kcal · ' + day.protein + ' g' +
              (two ? ' · ' + otherName() + ' ' + day.kcal2 + ' kcal · ' + day.protein2 + ' g' : L(' protein', ' de protéines')))),
          !savedFits && day.choices > 1 ? h('button', { class: 'btn btn-ghost btn-sm', 'aria-label': L('Another suggestion for this day', 'Autre proposition pour ce jour'), onclick: function () {
            weekPicks[i] = ((weekPicks[i] || 0) + 1) % day.choices; render();
          } }, L('↻ Change', '↻ Changer')) : null),
        h('div', { class: 'ck-weekmeals' }, day.meals.map(function (m, k) {
          return h('button', { class: 'ck-weekmeal', onclick: function () { servingsView[m.recipe.id] = mealServings(m); open(m.recipe.id); } },
            h('span', { class: 'ck-dayslot' }, labels[k] || ''),
            h('span', { class: 'ck-weekrecipe' }, view(m.recipe).name),
            h('span', { class: 'list-sub' }, mealText(m)));
        }))));
    });

    if (savedFits) {
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { section = 'shop'; render(); window.scrollTo(0, 0); } }, L('🛒 Groceries ›', '🛒 Courses ›')),
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { weekDraft = true; weekSeed++; weekPicks = []; planShift = 0; render(); window.scrollTo(0, 0); } },
          L('Plan the next days', 'Prévoir la suite')),
        h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
          ui.confirm({ title: L('Remove this plan?', 'Retirer ce planning ?'),
            message: L('The plan is removed. The meals already in the menu stay there (remove them from the menu if needed).', 'Le planning est retiré. Les repas déjà dans le menu y restent (retire-les du menu si besoin).'),
            okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) { if (!ok) return; var back = snapshot(); data.week = null; persist(); render(); ui.undo(L('Plan removed', 'Planning retiré'), back); });
        } }, L('Remove this plan', 'Retirer ce planning'))));
      root.appendChild(h('p', { class: 'hint' }, L('“Plan the next days” starts the day after this plan and avoids its dishes. Pick 3 or 4 days at the top to shop twice a week.',
        '« Prévoir la suite » commence le lendemain de ce planning et évite ses plats. Choisis 3 ou 4 jours en haut pour faire les courses 2 fois par semaine.')));
      return;
    }
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { confirmWeek(week, start, totals, two); } },
        n === 7 ? L('✓ Confirm the week', '✓ Valider la semaine') : L('✓ Confirm these ' + n + ' days', '✓ Valider ces ' + n + ' jours')),
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { weekSeed++; weekPicks = []; render(); window.scrollTo(0, 0); } }, L('↻ Another suggestion', '↻ Autre proposition')),
      data.week ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { weekDraft = false; planDays = data.week.days.length; render(); window.scrollTo(0, 0); } },
        L('Back to my confirmed plan', 'Revenir à mon planning validé')) : null));
    root.appendChild(h('p', { class: 'hint' }, (n === 3 || n === 4
      ? L('Shopping twice a week: confirm 3 days now, then 4 days next time (it starts the day after and avoids the same dishes). ',
        'Courses 2 fois par semaine : valide 3 jours maintenant, puis 4 jours la fois suivante (ça commence le lendemain et évite les mêmes plats). ') : '') +
      L('Confirming puts each recipe once in the menu with all its servings (rounded up' + (two ? ', both people' : '') + '), so the groceries add everything up. “↻ Change” only replaces that day.',
        'Valider met chaque recette une seule fois au menu avec toutes ses portions (arrondies au-dessus' + (two ? ', pour les 2' : '') + ') : les courses additionnent tout. « ↻ Changer » ne remplace que ce jour-là.')));
  }

  function confirmWeek(week, start, totals, two) {
    var n = week.length;
    function apply(replace) {
      if (replace) { data.plan.items = []; data.plan.checks = {}; }
      totals.forEach(function (x) {
        data.plan.items.push({ uid: ui.uid(), recipeId: x.recipe.id, servings: Math.min(24, Math.max(1, Math.ceil(x.portions))),
          added: new Date().toISOString(), days: x.days.map(function (i) { return dayShort(start, i); }).join(', ') });
      });
      data.week = { start: start, saved: new Date().toISOString(), batch: data.weekBatch, forTwo: !!two,
        days: week.map(function (d) { return { meals: d.meals.map(function (m) {
          var o = { recipeId: m.recipe.id, portion: m.portion };
          if (m.portion2) o.portion2 = m.portion2;
          return o;
        }) }; }) };
      weekDraft = false; planDays = n; planShift = 0; persist(); render(); window.scrollTo(0, 0);
      ui.toast(L('Plan confirmed · ', 'Planning validé · ') + plural(totals.length, 'recipe', 'recette') + L(' in the menu', ' au menu'));
    }
    if (!planItems().length) { apply(false); return; }
    ui.sheet(function (close) {
      return [
        h('h2', { class: 'sheet-title' }, L('Your menu already has meals', 'Ton menu contient déjà des repas')),
        h('p', { class: 'sheet-text' }, L('Replace it with this plan (grocery ticks are reset), or add the plan to it?', 'Le remplacer par ce planning (les cases des courses sont remises à zéro), ou y ajouter le planning ?')),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () { close(); apply(true); } }, L('Replace the menu', 'Remplacer le menu')),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () { close(); apply(false); } }, L('Add to the menu', 'Ajouter au menu')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    });
  }

  /* ---------- Menu de la semaine ---------- */
  function renderMenu() {
    var items = planItems();
    root.appendChild(h('h2', { class: 'section-title' }, L('This week’s menu', 'Menu de la semaine')));
    if (!items.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('No meal planned yet. Open a recipe and tap “+ Add to the menu”.', 'Aucun repas prévu. Ouvre une recette et touche « + Ajouter au menu ».')),
        h('button', { class: 'btn btn-secondary', onclick: function () { section = 'recipes'; render(); } }, L('Choose recipes', 'Choisir des recettes'))));
    } else {
      var totalServ = items.reduce(function (n, it) { return n + (it.servings || 1); }, 0);
      root.appendChild(h('p', { class: 'hint' }, meals(items.length) + ' · ' + plural(totalServ, 'serving', 'portion')));
      root.appendChild(h('div', { class: 'list' }, items.map(function (it) {
        var r = recipe(it.recipeId), v = view(r);
        return h('div', { class: 'list-row ck-menurow' },
          h('button', { class: 'ck-menuname', onclick: function () { servingsView[r.id] = it.servings; open(r.id); } },
            h('span', { class: 'list-title' }, v.name),
            h('span', { class: 'list-sub' }, (it.days ? '📅 ' + it.days + ' · ' : '') + (CATS[r.category] || OTHER) + (r.time ? ' · ⏱ ' + r.time + ' min' : ''))),
          h('div', { class: 'stepper ck-menustep' },
            h('button', { class: 'btn btn-step', 'aria-label': L('One serving less', 'Une portion de moins'), disabled: it.servings <= 1,
              onclick: function () { it.servings = Math.max(1, it.servings - 1); persist(); render(); } }, '−'),
            h('span', { class: 'stepper-num', 'aria-label': plural(it.servings, 'serving', 'portion') }, it.servings),
            h('button', { class: 'btn btn-step', 'aria-label': L('One serving more', 'Une portion de plus'), disabled: it.servings >= 24,
              onclick: function () { it.servings = Math.min(24, it.servings + 1); persist(); render(); } }, '+')),
          h('div', { class: 'ck-menuacts' },
            h('button', { class: 'btn btn-secondary btn-sm', onclick: function () {
              var back = snapshot();
              logCooked(r, it.servings); data.plan.items.splice(data.plan.items.indexOf(it), 1); persist(); render();
              ui.undo(L('Marked as cooked', 'Marquée comme cuisinée'), back);
            } }, L('✓ Cooked', '✓ Faite')),
            h('button', { class: 'btn btn-ghost btn-sm', 'aria-label': L('Remove from the menu', 'Retirer du menu'), onclick: function () {
              var back = snapshot();
              data.plan.items.splice(data.plan.items.indexOf(it), 1); persist(); render();
              ui.undo(L('Removed from the menu', 'Retirée du menu'), back);
            } }, '✕')));
      })));
      root.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { section = 'shop'; render(); window.scrollTo(0, 0); } }, L('🛒 Groceries for the menu ›', '🛒 Courses du menu ›')),
        h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
          ui.confirm({ title: L('Clear the menu?', 'Vider le menu ?'), message: L('All planned meals and grocery ticks will be removed.', 'Tous les repas prévus et les cases cochées des courses seront retirés.'),
            okLabel: L('Clear', 'Vider'), cancelLabel: L('Cancel', 'Annuler'), danger: true }).then(function (ok) {
            if (!ok) return; var back = snapshot(); data.plan.items = []; data.plan.checks = {}; persist(); render();
            ui.undo(L('Menu cleared', 'Menu vidé'), back);
          });
        } }, L('Clear the menu', 'Vider le menu'))));
    }
    /* Déjà cuisiné : les 10 derniers repas, à remettre au menu en un geste. */
    var hist = data.history.filter(function (x) { return recipe(x.recipeId); }).slice(0, 10);
    if (hist.length) {
      root.appendChild(h('h2', { class: 'section-title' }, L('Recently cooked', 'Déjà cuisiné')));
      root.appendChild(h('div', { class: 'list' }, hist.map(function (x) {
        var r = recipe(x.recipeId);
        return h('div', { class: 'list-row ck-histrow' },
          h('button', { class: 'ck-menuname', onclick: function () { open(r.id); } },
            h('span', { class: 'list-title' }, view(r).name),
            h('span', { class: 'list-sub' }, ui.date(x.date) + ' · ' + plural(x.servings || 1, 'serving', 'portion'))),
          h('div', { class: 'ck-histacts' },
            h('button', { class: 'btn btn-secondary btn-sm', onclick: function () {
              addToPlan(r, x.servings || r.servings || 1); render(); ui.toast(L('Added to the menu', 'Ajoutée au menu'));
            } }, L('+ Menu', '+ Menu')),
            /* v0.43 : « Faite » par erreur : la retirer de l'historique (et des restes d'Aujourd'hui). */
            h('button', { class: 'btn btn-icon', 'aria-label': L('Remove from history', 'Retirer de l’historique'), onclick: function () {
              var back = snapshot();
              data.history.splice(data.history.indexOf(x), 1); persist(); render();
              ui.undo(L('Removed from history', 'Retiré de l’historique'), back);
            } }, '✕')));
      })));
    }
  }

  /* ---------- Prix estimé du panier (js/tabs/cuisine-prices.js : prix moyens intégrés, aucun accès réseau) ---------- */
  var PRICES = S2.cuisinePrices;
  var SH = S2.cuisineShare;
  function myLabel() { try { return S2.objectif && S2.objectif.myName ? S2.objectif.myName() : L('Me', 'Moi'); } catch (e) { return L('Me', 'Moi'); } }
  var NT = S2.nutritionTable;
  function money(x, round) {
    return Number(x).toLocaleString(S2.locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: round ? 0 : 2, maximumFractionDigits: round ? 0 : 2 });
  }
  function priceItems(list) {
    return list.map(function (g) {
      var nk = g.key.split('|').slice(1).join('|');
      return { g: g, key: nk, unit: norm(g.first.unit).trim(), qty: g.qty, own: data.prices[nk], done: !!data.plan.checks[g.key] };
    });
  }
  var BASIS = { kg: L('€ / kg', '€ / kg'), l: L('€ / litre', '€ / litre'), unit: L('€ each', '€ / pièce'), flat: L('€', '€') };
  function editPrices(items) {
    var rows = items.filter(function (it) { return it.estimate && it.estimate.known && !it.estimate.none; });
    var unknown = items.filter(function (it) { return it.estimate && !it.estimate.known; });
    ui.sheet(function (close) {
      var inputs = [];
      function line(it, basis) {
        var e = it.estimate;
        var inp = h('input', { class: 'input ck-priceinp', type: 'text', inputmode: 'decimal', value: it.own !== undefined ? num(it.own) : '',
          placeholder: e && e.ref !== undefined ? num(e.ref) : '', 'aria-label': L('Price for ', 'Prix pour ') + it.g.first.name });
        inputs.push({ it: it, inp: inp });
        return h('label', { class: 'ck-pricerow' },
          h('span', { class: 'ck-pricename' }, it.g.text, h('span', { class: 'ck-from' }, e && e.known ? L('Estimate: ', 'Estimation : ') + money(e.pantry ? e.used : e.price) + (e.pantry ? L(' (pantry)', ' (placard)') : '') : L('No price yet', 'Pas encore de prix'))),
          h('span', { class: 'ck-priceunit' }, inp, h('span', { class: 'list-sub' }, BASIS[basis || (e && e.basis) || 'unit'])));
      }
      function save() {
        var bad = false;
        inputs.forEach(function (x) {
          var v = ui.parseNum(x.inp.value);
          if (x.inp.value.trim() === '') { delete data.prices[x.it.key]; return; }
          if (v === null || v < 0 || v > 500) { bad = true; x.inp.classList.add('is-bad'); return; }
          data.prices[x.it.key] = Math.round(v * 100) / 100;
        });
        if (bad) { ui.toast(L('Check the prices in red', 'Vérifie les prix en rouge')); return; }
        persist(); close(); render();
        ui.toast(L('Prices saved', 'Prix enregistrés'));
      }
      var uBasis = function (it) { var k = PRICES.measure(it.unit).kind; return k === 'vol' ? 'l' : k === 'count' ? 'unit' : 'kg'; };
      return [
        h('h2', { class: 'sheet-title' }, L('My prices', 'Mes prix')),
        h('p', { class: 'sheet-text' }, L('Grey = average supermarket price used by the app. Type the price you pay (e.g. at your shop) to replace it; leave empty to keep the average.',
          'En gris = prix moyen en supermarché utilisé par l’app. Tape le prix que tu paies (dans ton magasin par exemple) pour le remplacer ; laisse vide pour garder la moyenne.')),
        unknown.length ? h('h3', { class: 'ck-aisle' }, L('Without a price', 'Sans prix')) : null,
        unknown.length ? h('div', { class: 'ck-prices' }, unknown.map(function (it) { return line(it, uBasis(it)); })) : null,
        h('h3', { class: 'ck-aisle' }, L('Estimated', 'Estimés')),
        h('div', { class: 'ck-prices' }, rows.map(function (it) { return line(it); })),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          Object.keys(data.prices).length ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () {
            ui.confirm({ title: L('Back to average prices?', 'Revenir aux prix moyens ?'), message: L('All the prices you typed are removed.', 'Tous les prix que tu as saisis sont effacés.'),
              okLabel: L('Use average prices', 'Utiliser les prix moyens'), danger: true }).then(function (ok) {
              if (!ok) return; data.prices = {}; persist(); close(); render();
            });
          } }, L('Back to average prices', 'Revenir aux prix moyens')) : null,
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ---------- Courses du menu : une seule liste, quantités additionnées, par rayon ---------- */
  function renderShop() {
    var list = shoppingList(), checks = data.plan.checks;
    root.appendChild(h('h2', { class: 'section-title' }, L('Groceries for the menu', 'Courses du menu')));
    if (!list.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('Add meals to the menu: their ingredients are combined here.', 'Ajoute des repas au menu : leurs ingrédients sont regroupés ici.')),
        h('button', { class: 'btn btn-secondary', onclick: function () { section = 'recipes'; render(); } }, L('Choose recipes', 'Choisir des recettes')),
        SH ? h('button', { class: 'btn btn-ghost', onclick: importShared }, L('📥 Add someone’s groceries', '📥 Ajouter les courses de quelqu’un')) : null));
      return;
    }
    var shared = data.shared;
    if (shared.length) {
      root.appendChild(h('div', { class: 'card ck-sharedcard' },
        h('div', { class: 'card-title' }, L('🛒 Groceries for two', '🛒 Courses à 2')),
        h('p', { class: 'hint' }, L('Your list includes the groceries received below. Same ingredients are added up.', 'Ta liste comprend les courses reçues ci-dessous. Les mêmes ingrédients sont additionnés.')),
        shared.map(function (sl) {
          return h('div', { class: 'ck-sharedrow' },
            h('div', null, h('div', { class: 'list-title' }, sl.from),
              h('div', { class: 'list-sub' }, plural(sl.items.length, 'item', 'article') + (sl.at ? L(' · sent ', ' · envoyé le ') + ui.date(sl.at) : ''))),
            h('button', { class: 'btn btn-ghost btn-sm danger-text', onclick: function () {
              ui.confirm({ title: L('Remove ' + sl.from + '’s groceries?', 'Retirer les courses de ' + sl.from + ' ?'),
                message: L('Their items are taken out of your list. Your own menu does not change.', 'Ses articles sont retirés de ta liste. Ton menu ne change pas.'),
                okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) {
                if (!ok) return; var back = snapshot(); data.shared = data.shared.filter(function (x) { return x.id !== sl.id; }); persist(); render();
                ui.undo(L('List removed', 'Liste retirée'), back);
              });
            } }, L('Remove', 'Retirer')));
        })));
    }
    var got = list.filter(function (g) { return checks[g.key]; }).length;
    var items = PRICES ? priceItems(list) : [], cost = PRICES ? PRICES.basket(items) : null, priceOf = {};
    items.forEach(function (it) { priceOf[it.g.key] = it.estimate; });
    if (cost && cost.count) {
      var servings = planItems().reduce(function (n, it) { return n + (it.servings || 1); }, 0);
      root.appendChild(h('div', { class: 'card ck-basket' },
        h('div', { class: 'list-sub' }, L('Estimated basket', 'Panier estimé')),
        h('div', { class: 'ck-basketnum' }, '≈ ' + money(cost.basket, true)),
        h('div', { class: 'list-sub' }, L('between ', 'entre ') + money(cost.low, true) + L(' and ', ' et ') + money(cost.high, true) + L(' depending on the shop', ' selon le magasin')),
        h('div', { class: 'ck-basketstats' },
          got && cost.left !== cost.basket ? h('div', null, h('span', { class: 'ck-basketval' }, money(cost.left, true)), h('span', { class: 'list-sub' }, L('left to buy', 'reste à acheter'))) : null,
          cost.used < cost.basket * 0.9 ? h('div', null, h('span', { class: 'ck-basketval' }, money(cost.used - cost.pantry, true)), h('span', { class: 'list-sub' }, L('eaten from it', 'consommé'))) : null,
          servings && !data.shared.length ? h('div', null, h('span', { class: 'ck-basketval' }, money(cost.used / servings)), h('span', { class: 'list-sub' }, L('per serving', 'par portion'))) : null,
          cost.pantry >= 0.5 ? h('div', null, h('span', { class: 'ck-basketval' }, '+ ' + money(cost.pantry, true)), h('span', { class: 'list-sub' }, L('pantry, pro rata', 'placard, au prorata'))) : null),
        h('p', { class: 'hint' }, L('Average supermarket prices, whole packs (6 eggs, 500 g of chicken…). “Eaten” = what the menu really uses (opened packs serve later). Oil, spices and sauces from the pantry are counted apart, only for what is used.',
          'Prix moyens en supermarché, paquets entiers (6 œufs, 500 g de poulet…). « Consommé » = ce que le menu utilise vraiment (les paquets entamés servent ensuite). Huile, épices et sauces du placard sont comptées à part, seulement pour ce qui est utilisé.') +
          (cost.unknown ? L(' ' + cost.unknown + ' item(s) without a price.', ' ' + cost.unknown + ' article(s) sans prix.') : '')),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editPrices(items); } }, L('✎ Adjust my prices', '✎ Ajuster mes prix'))));
    }
    root.appendChild(h('div', { class: 'ck-listhead' },
      h('span', { class: 'muted' }, meals(planItems().length)),
      h('span', { class: 'muted' }, got + ' / ' + list.length + L(' ticked', ' cochés'))));
    AISLE_ORDER.forEach(function (aid) {
      var rows = list.filter(function (g) { return g.aisle === aid; });
      if (!rows.length) return;
      var label = AISLES.filter(function (a) { return a.id === aid; })[0].label;
      var sub = rows.reduce(function (n, g) { var e = priceOf[g.key]; return n + (e && e.known && !e.none && !e.pantry ? e.price : 0); }, 0);
      root.appendChild(h('h3', { class: 'ck-aisle ck-aislerow' }, h('span', null, label), sub > 0 ? h('span', { class: 'ck-aisleprice' }, '≈ ' + money(sub, true)) : null));
      root.appendChild(h('div', { class: 'list ck-checklist' }, rows.map(function (g) {
        var on = !!checks[g.key], e = priceOf[g.key];
        return h('button', { class: 'list-row ck-check' + (on ? ' is-on' : ''), role: 'checkbox', 'aria-checked': on ? 'true' : 'false',
          onclick: function () { if (on) delete checks[g.key]; else checks[g.key] = true; persist(); render(); } },
          h('span', { class: 'ck-box', 'aria-hidden': 'true' }, on ? '✓' : ''),
          h('span', { class: 'ck-checktext' }, g.text,
            shared.length && g.people ? h('span', { class: 'ck-from ck-for' }, L('For: ', 'Pour : ') + g.people.join(' + ')) : null,
            g.recipes.length && (g.recipes.length > 1 || planItems().length > 1) ? h('span', { class: 'ck-from' }, g.recipes.join(' · ')) : null),
          e && e.known && !e.none ? h('span', { class: 'ck-itemprice' + (e.pantry ? ' is-pantry' : '') }, e.pantry ? money(e.used) : money(e.price)) : null);
      })));
    });
    root.appendChild(h('p', { class: 'hint' }, L('Same ingredients are added up (same unit). Tick what you have or put in the basket.',
      'Les mêmes ingrédients sont additionnés (même unité). Coche ce que tu as ou ce que tu mets dans le panier.')));
    root.appendChild(h('div', { class: 'bottom-actions' },
      SH ? h('button', { class: 'btn btn-primary btn-block', onclick: sendMine }, L('📤 Send my groceries', '📤 Envoyer mes courses')) : null,
      SH ? h('button', { class: 'btn btn-secondary btn-block', onclick: importShared }, L('📥 Add someone’s groceries', '📥 Ajouter les courses de quelqu’un')) : null,
      got ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { data.plan.checks = {}; persist(); render(); } }, L('Untick everything', 'Tout décocher')) : null));
  }

  /* ---------- Courses à 2 : envoyer sa liste, ajouter celle de l'autre (par message, sans serveur) ---------- */
  function sendMine() {
    var mine = shoppingList(true).filter(function (g) { return !data.plan.checks[g.key]; });
    if (!mine.length) { ui.toast(planItems().length ? L('You have everything!', 'Tu as tout !') : L('Your menu is empty', 'Ton menu est vide')); return; }
    var me = myLabel();
    var payload = SH.pack(me, mine);
    var title = L('🛒 ' + me + '’s groceries (' + mine.length + ' items) — to add in Gym Food › Kitchen › Groceries › “Add someone’s groceries”:',
      '🛒 Courses de ' + me + ' (' + mine.length + ' articles) — à ajouter dans Gym Food › Cuisine › Courses › « Ajouter les courses de quelqu’un » :');
    var text = SH.message(payload, title, mine.map(function (g) { return g.text; }));
    if (navigator.share) navigator.share({ title: L('My groceries', 'Mes courses'), text: text }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { ui.toast(L('Copied: paste it in a message', 'Copié : colle-le dans un message')); });
    else ui.toast(L('Sharing is not available here', 'Le partage n’est pas disponible ici'));
  }
  function importShared() {
    var parsed = null;
    ui.sheet(function (close) {
      var ta = h('textarea', { class: 'input ck-textarea ck-pastearea', rows: 5, placeholder: L('Paste the message received here', 'Colle ici le message reçu'), 'aria-label': L('Message', 'Message') });
      var preview = h('div', { class: 'ck-preview' });
      var addBtn = h('button', { class: 'btn btn-primary btn-block', disabled: true, onclick: function () {
        if (!parsed) return;
        var replaced = data.shared.some(function (x) { return x.from === parsed.from; });
        data.shared = data.shared.filter(function (x) { return x.from !== parsed.from; });
        data.shared.push({ id: ui.uid(), from: parsed.from, at: parsed.at, added: new Date().toISOString(), items: parsed.items });
        persist(); close(); section = 'shop'; render(); window.scrollTo(0, 0);
        ui.toast((replaced ? L('Updated: ', 'Mise à jour : ') : L('Added: ', 'Ajouté : ')) + L(parsed.from + '’s groceries', 'courses de ' + parsed.from));
      } }, L('Add to my list', 'Ajouter à ma liste'));
      function check() {
        parsed = SH.read(ta.value);
        preview.innerHTML = '';
        addBtn.disabled = !parsed;
        if (!ta.value.trim()) return;
        if (!parsed) { preview.appendChild(h('p', { class: 'form-error' }, L('This is not a Gym Food groceries message. Paste the whole message, including the line starting with SANEVA1.', 'Ce n’est pas un message de courses Gym Food. Colle tout le message, y compris la ligne qui commence par SANEVA1.'))); return; }
        var again = data.shared.some(function (x) { return x.from === parsed.from; });
        preview.appendChild(h('div', { class: 'card' },
          h('div', { class: 'list-title' }, L(parsed.from + '’s groceries', 'Courses de ' + parsed.from)),
          h('div', { class: 'list-sub' }, plural(parsed.items.length, 'item', 'article') + (parsed.at ? L(' · sent ', ' · envoyé le ') + ui.date(parsed.at) : '')),
          h('ul', { class: 'ck-previewlist' }, parsed.items.slice(0, 6).map(function (it) {
            var f = it.first;
            return h('li', null, it.qty === null ? f.name : num(roundQty(it.qty)) + ' ' + f.unit + f.link + f.name);
          }).concat(parsed.items.length > 6 ? [h('li', { class: 'muted' }, L('and ' + (parsed.items.length - 6) + ' more', 'et ' + (parsed.items.length - 6) + ' autres'))] : [])),
          again ? h('p', { class: 'note' }, L('It replaces the list already received from ' + parsed.from + '.', 'Elle remplace la liste déjà reçue de ' + parsed.from + '.')) : null));
      }
      ta.addEventListener('input', check);
      return [
        h('h2', { class: 'sheet-title' }, L('Add someone’s groceries', 'Ajouter les courses de quelqu’un')),
        h('p', { class: 'sheet-text' }, L('In their Gym Food, they tap “📤 Send my groceries” and send you the message. Copy the whole message and paste it here.',
          'Dans son Gym Food, l’autre personne touche « 📤 Envoyer mes courses » et t’envoie le message. Copie tout le message et colle-le ici.')),
        navigator.clipboard && navigator.clipboard.readText ? h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: function () {
          navigator.clipboard.readText().then(function (t) { ta.value = t; check(); }).catch(function () { ui.toast(L('Paste it in the box instead', 'Colle-le plutôt dans le champ')); });
        } }, L('📋 Paste', '📋 Coller')) : null,
        ta, preview,
        h('div', { class: 'sheet-actions' }, addBtn, h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
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
    var serv = servingsView[r.id] || r.servings || 1, factor = serv / (r.servings || 1);
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
        var qty = stepIngredients(v.steps[i], v, factor);
        if (qty.length) wrap.appendChild(h('ul', { class: 'ck-cookqty', 'aria-label': L('For this step', 'Pour cette étape') },
          qty.map(function (q) { return h('li', null, q); })));
        var tb = timerButtons(v.steps[i]);
        if (tb) wrap.appendChild(tb);
        if (i === n - 1 && v.tips) wrap.appendChild(h('div', { class: 'note' }, h('strong', null, L('Tip: ', 'Astuce : ')), v.tips));
        var last = i === n - 1;
        wrap.appendChild(h('div', { class: 'ck-cooknav' },
          h('button', { class: 'btn btn-secondary btn-lg', disabled: i === 0, onclick: function () { i--; paint(); } }, L('‹ Back', '‹ Retour')),
          h('button', { class: 'btn btn-primary btn-lg', onclick: function () {
            ch.steps[i] = true; persist();
            if (last) {
              /* Recette terminée : historique, et la recette quitte le menu si elle y était. */
              var undoCook = snapshot();
              logCooked(r, serv);
              var it = planItems().filter(function (x) { return x.recipeId === r.id; })[0];
              if (it) data.plan.items.splice(data.plan.items.indexOf(it), 1);
              persist(); closeSheet(); ui.undo(L('Enjoy your meal!', 'Bon appétit !'), undoCook);
            } else { i++; paint(); }
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

      /* Calcul depuis les ingrédients (table nutritionnelle intégrée) : remplit les champs, tu peux corriger avant d'enregistrer. */
      var calcNote = h('p', { class: 'hint', hidden: true });
      var calcBtn = NT ? h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: function () {
        var c = NT.recipe({ ingredients: draft.ingredients, servings: draft.servings || 1 });
        if (!c.kcal) { calcNote.textContent = L('Add ingredients with quantities first (e.g. “200 g of chicken”).', 'Ajoute d’abord des ingrédients avec leur quantité (ex. « 200 g de poulet »).'); calcNote.hidden = false; return; }
        draft.protein = c.protein; draft.kcal = c.kcal;
        var sheetEl = calcBtn.closest('.sheet');
        sheetEl.querySelector('input[aria-label="' + L('Protein per serving (g)', 'Protéines par portion (g)') + '"]').value = String(c.protein);
        sheetEl.querySelector('input[aria-label="' + L('Calories per serving (kcal, optional)', 'Calories par portion (kcal, facultatif)') + '"]').value = String(c.kcal);
        calcNote.textContent = L('Calculated per serving: ', 'Calculé par portion : ') + c.kcal + ' kcal · ' + c.protein + L(' g protein · ', ' g de protéines · ') + c.carbs + L(' g carbs · ', ' g de glucides · ') + c.fat + L(' g fat', ' g de lipides') +
          (c.unknown.length ? L('. Not counted: ', '. Non comptés : ') + c.unknown.join(', ') : '') + L('. Check and adjust if needed.', '. Vérifie et corrige si besoin.');
        calcNote.hidden = false;
      } }, L('🧮 Calculate from the ingredients', '🧮 Calculer depuis les ingrédients')) : null;
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New recipe', 'Nouvelle recette') : L('Edit recipe', 'Modifier la recette')),
        text(L('Name', 'Nom'), 'name', L('e.g. Chicken curry', 'ex. Curry de poulet')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Category', 'Catégorie')), catSeg),
        h('div', { class: 'form-grid' }, numf(L('Time (min)', 'Temps (min)'), 'time', '15'), numf(L('Servings', 'Portions'), 'servings', '1'),
          numf(L('Protein per serving (g)', 'Protéines par portion (g)'), 'protein', '40')),
        h('div', { class: 'form-grid ck-grid1' }, numf(L('Calories per serving (kcal, optional)', 'Calories par portion (kcal, facultatif)'), 'kcal', '600')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' },
          L('Main ingredients (for search, comma-separated)', 'Ingrédients principaux (pour la recherche, séparés par des virgules)')), tagsInp),
        lines(L('Ingredients (one per line)', 'Ingrédients (un par ligne)'), 'ingredients',
          L('200 g chicken breast\n1 tbsp honey\nSalt & pepper', '200 g de blanc de poulet\n1 c. à soupe de miel\nSel & poivre'),
          L('Start a line with the quantity (e.g. “200 g …”) so it adjusts with the number of servings.',
            'Commence la ligne par la quantité (ex. « 200 g … ») pour qu’elle s’adapte au nombre de portions.')),
        calcBtn, calcNote,
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
      var undoIt = snapshot();
      data.recipes = data.recipes.filter(function (x) { return x.id !== r.id; });
      delete data.checks[r.id]; delete data.favs[r.id]; delete data.notes[r.id];
      data.plan.items = data.plan.items.filter(function (it) { return it.recipeId !== r.id; });
      if (r.builtin && data.removedBuiltins.indexOf(r.id) < 0) data.removedBuiltins.push(r.id);
      persist(); back(); ui.undo(L('Recipe deleted', 'Recette supprimée'), undoIt);
    });
  }

  /* API en lecture pour l'onglet Aujourd'hui : repas prévus par le planning validé, recettes et leurs valeurs par portion. */
  function ensureData() { if (!data) data = loadData(); return data; }
  function recipeInfo(r) {
    var m = NT ? NT.macros(r) : { kcal: r.kcal || 0, protein: r.protein || 0, carbs: 0, fat: 0 };
    return { id: r.id, name: view(r).name, category: r.category, kcal: m.kcal || 0, protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0 };
  }
  S2.cuisine = {
    plannedMeals: function (date) {
      ensureData();
      if (!data.week) return [];
      var a = new Date(data.week.start); a.setHours(0, 0, 0, 0);
      var b = new Date(date); b.setHours(0, 0, 0, 0);
      var i = Math.round((b - a) / 86400000);
      if (i < 0 || i >= data.week.days.length) return [];
      var meals = data.week.days[i].meals, labels = SLOT_LABELS[meals.length] || [];
      return meals.map(function (m, k) {
        var r = recipe(m.recipeId);
        if (!r) return null;
        var info = recipeInfo(r);
        info.slot = labels[k] || ''; info.slotIndex = k; info.portion = m.portion; info.portion2 = m.portion2 || null;
        return info;
      }).filter(Boolean);
    },
    recipes: function () { ensureData(); return data.recipes.filter(function (r) { return r.kcal || r.protein; }).map(recipeInfo); },
    recipe: function (id) { ensureData(); var r = recipe(id); return r ? recipeInfo(r) : null; },
    open: function (id) { ensureData(); if (!recipe(id)) return; currentId = id; page = 'detail'; mode = 'cook'; if (location.hash === '#cuisine' && root) render(); else location.hash = '#cuisine'; },
    /* v0.40 : recettes cuisinées ces derniers jours (« J'ai cuisiné » / « ✓ Faite »), pour les restes affichés dans Aujourd'hui. */
    cooked: function (days) {
      ensureData();
      var from = Date.now() - (days || 5) * 86400000;
      return data.history.filter(function (x) { return new Date(x.date).getTime() >= from && recipe(x.recipeId); })
        .map(function (x) { return { recipeId: x.recipeId, servings: x.servings || 1, date: x.date }; });
    },
    /* v0.40 : ouvre la liste des recettes filtrée sur « Avec ce que j'ai » (demande les ingrédients s'il n'y en a pas encore). */
    openHave: function () {
      ensureData();
      page = 'list'; section = 'recipes'; flags.have = data.have.length > 0;
      var ask = !data.have.length;
      if (location.hash === '#cuisine' && root) render(); else location.hash = '#cuisine';
      if (ask) setTimeout(editHave, 300);
    }
  };

  S2.app.registerTab({ id: 'cuisine', label: L('Kitchen', 'Cuisine'), order: 30, icon: ICON, mount: mount });
})();
