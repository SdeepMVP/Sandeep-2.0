/* Moteur de l'onglet Wardrobe : référentiels (catégories, occasions, couleurs, Style DNA), règles de note
   et génération de tenues. Code PUR : aucun accès au DOM ni au stockage, pour pouvoir être testé
   automatiquement (tests/run.js). L'interface est dans garde-robe.js, les combinaisons dans garde-robe-combos.js. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var COMBOS = S2.wardrobeCombos || { pairs: [], trios: [], shoes: {} };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* Ordre = du haut du corps vers les pieds, tel qu'affiché dans une tenue. Les accessoires sont à part. */
  var CATS = [
    { id: 'outer', label: 'Outerwear', hint: 'Jacket, coat',
      subtypes: ['Jacket', 'Coat', 'Blazer', 'Bomber', 'Rain jacket', 'Puffer', 'Leather jacket', 'Denim jacket', 'Trench coat'] },
    { id: 'layer', label: 'Mid layer', hint: 'Sweater, hoodie, overshirt',
      subtypes: ['Sweater', 'Cardigan', 'Hoodie', 'Sweatshirt', 'Overshirt', 'Zip-up', 'Vest', 'Turtleneck'] },
    { id: 'top', label: 'Top (base layer)', hint: 'T-shirt, shirt, polo',
      subtypes: ['T-shirt', 'Shirt', 'Oxford shirt', 'Polo', 'Long-sleeve', 'Henley', 'Tank top', 'Sport top'] },
    { id: 'bottom', label: 'Bottom', hint: 'Jeans, chinos, shorts',
      subtypes: ['Jeans', 'Chinos', 'Trousers', 'Cargo pants', 'Joggers', 'Track pants', 'Shorts', 'Sport shorts'] },
    { id: 'shoes', label: 'Shoes', hint: 'Boots, leather shoes, sneakers',
      subtypes: ['Sneakers', 'Leather shoes', 'Loafers', 'Derbies', 'Boots', 'Chelsea boots', 'Running shoes', 'Sandals', 'Slides'] },
    { id: 'acc', label: 'Accessories', hint: 'Cap, beanie, scarf, watch, necklace, chain wallet, bag',
      subtypes: ['Cap', 'Beanie', 'Scarf', 'Watch', 'Necklace', 'Chain wallet', 'Tote bag', 'Crossbody bag', 'Backpack'] }
  ];
  var CORE = CATS.filter(function (c) { return c.id !== 'acc'; });

  /* Contextes pour lesquels une pièce convient (« Good for »). Les ids historiques sont conservés. */
  var TAGS = [
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'chill', label: 'Casual', icon: '☕' },
    { id: 'date', label: 'Date / dinner', icon: '🌹' },
    { id: 'club', label: 'Night out', icon: '🪩' },
    { id: 'formal', label: 'Dressed up', icon: '🎩' },
    { id: 'gym', label: 'Sport', icon: '🏋️' },
    { id: 'travel', label: 'Travel', icon: '✈️' }
  ];

  /* Occasions, groupées. type : work | casual | formal | sport. tags = contextes de pièces acceptés (le 1er est prioritaire).
     ideal = niveaux de formalité visés (0 sport, 1 casual, 2 smart casual, 3 formel). strict = pas de sweat / jogging. */
  var GROUPS = [
    { id: 'work', label: 'Work', items: [
      { id: 'wfh', label: 'Remote / WFH', icon: '🏠', type: 'work', tags: ['chill', 'work'], ideal: [1, 2] },
      { id: 'office', label: 'Office casual', icon: '💼', type: 'work', tags: ['work'], ideal: [2], strict: true },
      { id: 'meeting', label: 'Important meeting', icon: '📊', type: 'work', tags: ['work', 'formal'], ideal: [3, 2], strict: true, dressy: true },
      { id: 'clientdinner', label: 'Client dinner', icon: '🍽️', type: 'work', tags: ['work', 'formal', 'date'], ideal: [2, 3], strict: true, dressy: true }
    ] },
    { id: 'daily', label: 'Daily life', items: [
      { id: 'errands', label: 'Errands', icon: '🛒', type: 'casual', tags: ['chill'], ideal: [1] },
      { id: 'weekend', label: 'Weekend casual', icon: '☕', type: 'casual', tags: ['chill'], ideal: [1, 2] },
      { id: 'outdoors', label: 'Walk / outdoors', icon: '🌳', type: 'casual', tags: ['chill', 'travel'], ideal: [1] }
    ] },
    { id: 'social', label: 'Social', items: [
      { id: 'friends', label: 'Dinner with friends', icon: '🍝', type: 'casual', tags: ['chill', 'date'], ideal: [1, 2] },
      { id: 'datenight', label: 'Date night', icon: '🌹', type: 'casual', tags: ['date'], ideal: [2] },
      { id: 'bar', label: 'Bar / lounge', icon: '🍸', type: 'casual', tags: ['date', 'club'], ideal: [2] },
      { id: 'club', label: 'Club / night out', icon: '🪩', type: 'casual', tags: ['club'], ideal: [2, 1], night: true },
      { id: 'party', label: 'House party', icon: '🎉', type: 'casual', tags: ['chill', 'club'], ideal: [1, 2] }
    ] },
    { id: 'formal', label: 'Formal', items: [
      { id: 'wedding', label: 'Wedding (guest)', icon: '💍', type: 'formal', tags: ['formal'], ideal: [3] },
      { id: 'gala', label: 'Ceremony / gala', icon: '🎩', type: 'formal', tags: ['formal'], ideal: [3] },
      { id: 'interview', label: 'Job interview', icon: '🤝', type: 'formal', tags: ['formal', 'work'], ideal: [3, 2] }
    ] },
    { id: 'sport', label: 'Sport & wellness', items: [
      { id: 'gym', label: 'Gym / weights', icon: '🏋️', type: 'sport', tags: ['gym'], ideal: [0] },
      { id: 'running', label: 'Running / outdoor sport', icon: '🏃', type: 'sport', tags: ['gym'], ideal: [0] },
      { id: 'yoga', label: 'Yoga / recovery', icon: '🧘', type: 'sport', tags: ['gym'], ideal: [0] }
    ] },
    { id: 'travel', label: 'Travel', items: [
      { id: 'airport', label: 'Airport / long travel', icon: '✈️', type: 'casual', tags: ['travel', 'chill'], ideal: [1] },
      { id: 'citytrip', label: 'City trip', icon: '🏙️', type: 'casual', tags: ['travel', 'chill'], ideal: [1, 2] },
      { id: 'beach', label: 'Beach / holiday', icon: '🏖️', type: 'casual', tags: ['travel', 'chill'], ideal: [1], beach: true }
    ] }
  ];
  var OCCASIONS = [];
  GROUPS.forEach(function (g) { g.items.forEach(function (o) { o.group = g.label; OCCASIONS.push(o); }); });
  /* Anciennes occasions (v0.7–0.8) → nouvelles. */
  var LEGACY_OCC = { work: 'office', gym: 'gym', club: 'club', date: 'datenight', chill: 'weekend' };

  var CONDITIONS = [
    { id: 'clear', label: 'Clear', icon: '☀️' },
    { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
    { id: 'rain', label: 'Rain', icon: '🌧️' },
    { id: 'wind', label: 'Wind', icon: '💨' },
    { id: 'snow', label: 'Snow', icon: '❄️' }
  ];
  var WARMTH = { 1: 'Light', 2: 'Medium', 3: 'Warm' };
  var FITS = [['slim', 'Slim / fitted'], ['regular', 'Regular'], ['wide', 'Wide / relaxed']];
  var FORMALITY = [
    { id: 'sport', label: 'Sport', lvl: 0 },
    { id: 'casual', label: 'Casual', lvl: 1 },
    { id: 'smart', label: 'Smart casual', lvl: 2 },
    { id: 'formal', label: 'Formal', lvl: 3 }
  ];
  /* Motifs : subtils (une pièce « statement » idéale) ou voyants (à éviter dans cet esprit). */
  var PATTERNS = [['solid', 'Solid'], ['stripes', 'Thin stripe'], ['pinstripe', 'Tonal pinstripe'], ['check', 'Plaid / check'],
    ['houndstooth', 'Houndstooth'], ['texture', 'Texture'], ['print', 'Print'], ['graphic', 'Logo / graphic']];
  var SUBTLE_PATTERNS = ['stripes', 'pinstripe', 'check', 'houndstooth'];
  var LOUD_PATTERNS = ['print', 'graphic'];
  var MATERIALS = ['Cotton', 'Linen', 'Wool', 'Knit', 'Fleece', 'Corduroy', 'Denim', 'Leather', 'Suede', 'Shearling', 'Technical', 'Synthetic'];
  /* Matières « statement » : une par tenue sur des pièces lisses donne de la profondeur. */
  var STATEMENT_TEXTURES = ['Leather', 'Suede', 'Fleece', 'Knit', 'Wool', 'Corduroy', 'Shearling'];
  var LENGTHS = [['cropped', 'Cropped'], ['waist', 'Waist'], ['hip', 'Hip'], ['long', 'Long']];

  /* Couleurs : les neutres vont avec tout ; les couleurs « accent » se limitent à une par tenue. */
  var COLORS = [
    { id: 'black', label: 'Black', hex: '#1E1E1E', neutral: true, dark: true },
    { id: 'charcoal', label: 'Charcoal', hex: '#45464A', neutral: true, dark: true },
    { id: 'grey', label: 'Grey', hex: '#9A9A9A', neutral: true },
    { id: 'white', label: 'White', hex: '#F7F5F0', neutral: true, light: true },
    { id: 'cream', label: 'Cream', hex: '#EDE3CF', neutral: true, light: true },
    { id: 'beige', label: 'Beige', hex: '#D6C3A1', neutral: true, light: true },
    { id: 'sand', label: 'Sand', hex: '#CDB892', neutral: true, light: true },
    { id: 'khaki', label: 'Khaki', hex: '#B9A57A', neutral: true },
    { id: 'taupe', label: 'Taupe', hex: '#8B7D6B', neutral: true },
    { id: 'camel', label: 'Camel', hex: '#B8895A', neutral: true },
    { id: 'brown', label: 'Chocolate', hex: '#4E3524', neutral: true, dark: true },
    { id: 'navy', label: 'Dark navy', hex: '#1F2A44', neutral: true, dark: true },
    { id: 'denim', label: 'Denim', hex: '#4A6A8A', neutral: true },
    { id: 'lightblue', label: 'Light blue', hex: '#A9C6E3', neutral: true, light: true },
    { id: 'olive', label: 'Olive', hex: '#6B6B3A', neutral: true },
    { id: 'burgundy', label: 'Burgundy', hex: '#6D1F2A', dark: true },
    { id: 'red', label: 'Red', hex: '#B3262E' },
    { id: 'green', label: 'Green', hex: '#2F6B45', dark: true },
    { id: 'teal', label: 'Teal', hex: '#2A7A7A' },
    { id: 'blue', label: 'Blue', hex: '#2E5EAA' },
    { id: 'pink', label: 'Pink', hex: '#E3A6B4', light: true },
    { id: 'yellow', label: 'Yellow', hex: '#E0C04A', light: true },
    { id: 'orange', label: 'Orange', hex: '#D9772B' },
    { id: 'purple', label: 'Purple', hex: '#6A4C93', dark: true }
  ];
  var ACCENT_PAIRS = [['burgundy', 'green'], ['orange', 'teal'], ['yellow', 'purple'], ['pink', 'green'], ['red', 'teal']];

  /* ---------- Style DNA : street smart structuré, influences tailoring oversize ----------
     Ce sont des LIGNES DIRECTRICES, pas des contraintes : elles classent les tenues (bonus / malus)
     sans en éliminer. Une belle tenue qui plie une règle passe devant une tenue sage qui les suit toutes. */
  var DNA = {
    palette: ['white', 'cream', 'beige', 'sand', 'khaki', 'grey', 'black', 'brown', 'navy', 'taupe'],
    /* Couleurs ramenées à une famille de la palette (charcoal = gris, camel = beige, denim = marine). */
    family: { white: 'white', cream: 'cream', beige: 'beige', camel: 'beige', sand: 'sand', khaki: 'khaki', taupe: 'taupe',
      brown: 'brown', grey: 'grey', charcoal: 'grey', black: 'black', navy: 'navy', denim: 'navy' },
    /* Grandes familles de teintes, pour les tenues « ton sur ton ». */
    shade: { white: 'light', cream: 'light', beige: 'earth', camel: 'earth', sand: 'earth', khaki: 'earth', taupe: 'earth',
      brown: 'earth', grey: 'grey', charcoal: 'grey', black: 'dark', navy: 'dark', denim: 'dark' },
    baseOnlyAbove: 22,  /* au-dessus : la couche de base suffit */
    midLayerFrom: 14,   /* 14–22 °C : une couche intermédiaire donne de la profondeur */
    outerBelow: 14,     /* en dessous : le manteau est naturel */
    outerStrongBelow: 6, /* en dessous : le manteau s'impose */
    beanieBelow: 10,
    scarfBelow: 8
  };
  var FAMILY_LABEL = { white: 'white', cream: 'cream', beige: 'beige', sand: 'sand', khaki: 'khaki', taupe: 'taupe', brown: 'brown', grey: 'grey', black: 'black', navy: 'navy' };
  var STRUCTURED_SHOES = ['Leather shoes', 'Loafers', 'Derbies', 'Boots', 'Chelsea boots', 'Sneakers'];
  var SPORT_SHOES = ['Running shoes'];
  var CASUAL_SHOES = ['Sandals', 'Slides'];
  var TOO_CASUAL_FOR_WORK = ['Hoodie', 'Sweatshirt', 'Joggers', 'Track pants', 'Sport shorts', 'Sport top', 'Tank top'];

  function color(id) { return COLORS.filter(function (c) { return c.id === id; })[0] || COLORS[2]; }
  function cat(id) { return CATS.filter(function (c) { return c.id === id; })[0] || CATS[2]; }
  function catLabel(id) { return cat(id).label; }
  function tag(id) { return TAGS.filter(function (t) { return t.id === id; })[0] || { id: id, label: id, icon: '•' }; }
  function occ(id) { return OCCASIONS.filter(function (o) { return o.id === id; })[0] || OCCASIONS.filter(function (o) { return o.id === LEGACY_OCC[id]; })[0]; }
  function cond(id) { return CONDITIONS.filter(function (c) { return c.id === id; })[0] || CONDITIONS[0]; }
  function formality(id) { return FORMALITY.filter(function (f) { return f.id === id; })[0] || FORMALITY[1]; }
  function value(c) { return c.light ? 'light' : c.dark ? 'dark' : 'mid'; }
  function family(colId) { return DNA.family[colId] || colId; }
  function inPalette(colId) { return DNA.palette.indexOf(family(colId)) > -1; }
  function isDarkShoe(x) { return ['black', 'brown', 'navy', 'charcoal', 'burgundy'].indexOf(x.color) > -1; }
  function isStructured(x) {
    if (SPORT_SHOES.indexOf(x.subtype) > -1 || CASUAL_SHOES.indexOf(x.subtype) > -1) return false;
    if (x.formality === 'sport') return false;
    return !x.subtype || STRUCTURED_SHOES.indexOf(x.subtype) > -1;
  }
  function weatherText(t, c) { return (t === null || t === undefined ? '?' : t) + ' °C · ' + cond(c).icon + ' ' + cond(c).label; }

  /* ---------- Dates ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return keyOf(new Date()); }
  function daysAgo(k) {
    if (!k) return Infinity;
    var p = k.slice(0, 10).split('-');
    return Math.round((new Date(new Date().toDateString()) - new Date(+p[0], +p[1] - 1, +p[2])) / 86400000);
  }
  var LEGACY_TEMP = { cold: 5, cool: 13, mild: 20, hot: 27 };

  /* ---------- Migration ---------- */
  /* Complète une pièce avec les nouveaux champs (migration douce des anciennes données). */
  function complete(x) {
    var n = (x.name || '').toLowerCase();
    x.occasions = x.occasions || ['chill'];
    if (!x.formality) {
      x.formality = x.occasions.length === 1 && x.occasions[0] === 'gym' ? 'sport'
        : x.occasions.indexOf('work') > -1 ? 'smart' : 'casual';
    }
    if (!x.pattern) x.pattern = 'solid';
    if (x.material === undefined) {
      x.material = /denim|jeans/.test(n) ? 'Denim' : /linen/.test(n) ? 'Linen' : /suede/.test(n) ? 'Suede'
        : /leather|chelsea/.test(n) ? 'Leather' : /wool|coat/.test(n) ? 'Wool' : /knit|sweater/.test(n) ? 'Knit'
        : /training|running|sport/.test(n) ? 'Technical' : null;
    }
    if (x.subtype === undefined) {
      var subs = cat(x.cat).subtypes.slice().sort(function (a, b) { return b.length - a.length; });
      x.subtype = subs.filter(function (s) { return n.indexOf(s.toLowerCase().replace(/s$/, '')) > -1; })[0] || null;
    }
    if (x.cat === 'outer' && !x.length) {
      x.length = /crop/.test(n) ? 'cropped' : /bomber|leather jacket|denim jacket|harrington|blouson|trucker/.test(n) || ['Bomber', 'Leather jacket', 'Denim jacket'].indexOf(x.subtype) > -1 ? 'waist'
        : /coat|trench|overcoat/.test(n) || ['Coat', 'Trench coat'].indexOf(x.subtype) > -1 ? 'long' : 'hip';
    }
    if (!x.fit) x.fit = /slim|skinny|fitted/.test(n) ? 'slim' : /wide|relaxed|baggy|loose|oversized|cargo|pleated/.test(n) ? 'wide' : 'regular';
    if (x.washEvery === undefined) x.washEvery = washDefault(x);
    if (x.wearsSinceWash === undefined) x.wearsSinceWash = 0;
    if (x.fav === undefined) x.fav = false;
    if (x.price === undefined) x.price = null;
    if (x.location === undefined) x.location = '';
    if (x.brand === undefined) x.brand = '';
    if (x.notes === undefined) x.notes = '';
    return x;
  }

  /* ---------- Sélection des pièces selon l'occasion ---------- */
  /* Une pièce est candidate si elle est propre, taguée pour un contexte de l'occasion,
     et respecte les règles de l'occasion et du Style DNA. Retourne une raison de refus ou null. */
  function poolReason(x, o) {
    if (x.laundry) return 'laundry';
    if (!x.occasions.some(function (t) { return o.tags.indexOf(t) > -1; })) return 'tag';
    if (o.type === 'sport') {
      if (x.formality !== 'sport' && x.occasions.indexOf('gym') < 0) return 'sport';
      return null;
    }
    if (x.cat === 'shoes' && o.type === 'formal' && (x.subtype === 'Sneakers' || CASUAL_SHOES.indexOf(x.subtype) > -1)) return 'shoes';
    if (x.formality === 'sport') return 'sport';
    if (o.strict && TOO_CASUAL_FOR_WORK.indexOf(x.subtype) > -1) return 'casual';
    if (o.type === 'formal' && TOO_CASUAL_FOR_WORK.indexOf(x.subtype) > -1) return 'casual';
    return null;
  }
  function pool(items, c, o) { return items.filter(function (x) { return x.cat === c && !poolReason(x, o); }); }

  /* ---------- Moteur de tenue ---------- */
  function isPair(a, b) {
    return ACCENT_PAIRS.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); });
  }
  function hasPair(a, b) {
    return COMBOS.pairs.filter(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); })[0];
  }

  /* Note une tenue { outer, layer, top, bottom, shoes } selon les lignes directrices et explique pourquoi.
     why = ce qui la rend réussie ; bends = la ligne directrice qu'elle plie, et pourquoi ça marche quand même.
     null = tenue vraiment impossible (seul cas : short pour une occasion formelle).
     ctx = { temp, cond, occasion (objet), worn (carte id → date), free (tenue composée à la main) } */
  function score(o, ctx) {
    var s = 100, why = [], bends = [];
    var parts = CORE.map(function (c) { return o[c.id]; }).filter(Boolean);
    var wear = parts.filter(function (x) { return x.cat !== 'shoes'; });
    var t = ctx.temp, oc = ctx.occasion, sport = oc.type === 'sport';
    var wet = ctx.cond === 'rain' || ctx.cond === 'snow';
    var shorts = o.bottom.warmth === 1;
    if (shorts && oc.type === 'formal') return null;

    /* --- Couches selon la température (indicatif) --- */
    if (t > DNA.baseOnlyAbove) {
      if (o.layer && !ctx.free) s -= o.layer.warmth > 1 ? 35 : 20;
      if (o.outer && !(wet && o.outer.rainOk && o.outer.warmth === 1)) s -= o.outer.warmth > 1 ? 30 : 15;
      if (o.top.warmth > 1) s -= 10;
      if (!o.layer && !o.outer) why.push('Base layer is enough above ' + DNA.baseOnlyAbove + ' °C');
      if (shorts && t >= 25 && oc.type === 'casual') { s += oc.beach ? 18 : 12; why.push('Shorts for the heat'); }
      else if (!shorts && t >= 27 && oc.type === 'casual') s -= 6;
    } else if (t >= DNA.midLayerFrom) {
      if (o.layer) { s += 6; why.push('A mid layer adds depth without overheating'); if (o.layer.warmth === 3 && t >= 18) s -= 8; }
      if (o.outer && o.outer.warmth === 3) s -= 20;
      else if (o.outer && o.outer.warmth === 2 && !wet && t >= 18) s -= 12;
      if (shorts && t < 18 && !sport) s -= 15;
    } else if (t >= DNA.outerStrongBelow) {
      if (o.outer) { s += 8; why.push('Outerwear feels natural below ' + DNA.outerBelow + ' °C'); if (o.outer.warmth === 3 && t >= 10) s -= 6; }
      else s -= 10;
      if (!o.layer && !sport) s -= 4;
      if (shorts && !sport) s -= 30;
    } else {
      if (o.outer) {
        s += 12; why.push('Outerwear is the right call below ' + DNA.outerStrongBelow + ' °C');
        if (o.outer.warmth === 3) s += 6; else if (o.outer.warmth === 1) s -= 10;
      } else s -= 35;
      if (!o.layer) s -= 8;
      if (shorts) s -= 40;
    }
    if (shorts && oc.type === 'work') s -= 30;
    if (wet) {
      if (t <= DNA.baseOnlyAbove && !o.outer) s -= 10;
      if (o.outer && o.outer.rainOk) { s += 10; why.push('Rain-proof jacket'); }
      else if (o.outer) s -= 8;
      if (o.shoes.rainOk) s += 4; else s -= 6;
      if (o.shoes.material === 'Suede') s -= 12;
      if (o.outer && o.outer.material === 'Suede') s -= 8;
    }
    if (ctx.cond === 'wind' && t < 18) { if (o.outer) s += 4; else s -= 6; }
    var linen = wear.filter(function (x) { return x.material === 'Linen'; }).length;
    var wool = wear.filter(function (x) { return x.material === 'Wool' || x.material === 'Knit' || x.material === 'Shearling'; }).length;
    if (t > DNA.baseOnlyAbove) { s += linen * 5 - wool * 8; if (linen) why.push('Linen breathes in the heat'); }
    if (t < 10 && wool) s += Math.min(wool, 2) * 3;

    /* --- Couleurs : familles, ton sur ton --- */
    var wearFams = [], fams = [], groups = [];
    wear.forEach(function (x) {
      var f = family(x.color), g = DNA.shade[x.color] || x.color;
      if (wearFams.indexOf(f) < 0) wearFams.push(f);
      if (groups.indexOf(g) < 0) groups.push(g);
    });
    /* Des chaussures sombres ancrent la tenue sans compter comme une couleur. */
    parts.forEach(function (x) {
      if (x.cat === 'shoes' && isDarkShoe(x)) return;
      var f = family(x.color); if (fams.indexOf(f) < 0) fams.push(f);
    });
    var tonal = wearFams.length === 1, sameFamily = !tonal && groups.length === 1;
    if (tonal) { s += 14; why.unshift('All ' + (FAMILY_LABEL[wearFams[0]] || color(wear[0].color).label.toLowerCase()) + ': tonal look'); }
    else if (sameFamily) { s += 8; why.push('Shades of the same family'); }

    /* --- Silhouette : contraste haut / bas (direction, pas obligation) --- */
    var volume = false;
    if (!sport) {
      var tf = o.top.fit, bf = o.bottom.fit;
      if (tf === 'slim' && bf === 'wide') { s += 10; why.unshift('Fitted top, wide bottom: the signature contrast'); }
      else if (tf === 'wide' && bf === 'slim') { s += 4; why.push('Loose top, slim bottom: balanced proportions'); }
      else if (tf === 'slim' && bf === 'slim') s -= 8;
      else if (tf === 'wide' && bf === 'wide') { volume = true; s -= 6; }
      else if (bf === 'wide') s += 4;
      if (volume && (tonal || sameFamily)) { s += 8; bends.push('Volume on volume, kept intentional by the tonal palette'); }
    }
    if (o.outer) {
      if (o.outer.length === 'cropped' || o.outer.length === 'waist') { s += 5; why.push((o.outer.length === 'cropped' ? 'Cropped' : 'Waist-length') + ' jacket keeps the proportion'); }
      else if (o.outer.length === 'long') why.push('Long coat: wear it open');
    }
    /* Chaque couche visible : le haut qui dépasse au col ou à l'ourlet. */
    if (o.layer) {
      if (value(color(o.layer.color)) !== value(color(o.top.color))) { s += 3; why.push('Each layer stays visible'); }
      else if (o.layer.color === o.top.color && !tonal) s -= 3;
    }

    /* --- Nombre de couleurs (2–3 conseillé) ; une 3e/4e couleur discrète via un motif est permise --- */
    var subtleFams = [];
    fams.forEach(function (f) {
      var carriers = parts.filter(function (x) { return family(x.color) === f; });
      if (carriers.length && carriers.every(function (x) { return SUBTLE_PATTERNS.indexOf(x.pattern) > -1; })) subtleFams.push(f);
    });
    var effective = fams.length - Math.min(subtleFams.length, 1);
    if (!sport) {
      if (fams.length <= 2) s += 4;
      else if (effective === 3) s += 0;
      else if (effective === 4) s -= 10;
      else if (effective > 4) s -= 25;
      if (fams.length > 3 && effective <= 3) bends.push('A ' + (fams.length === 4 ? '4th' : 'extra') + ' colour, kept subtle in the pattern');
    }
    var off = parts.filter(function (x) { return !inPalette(x.color); });
    var bright = parts.filter(function (x) { return !color(x.color).neutral; });
    if (!sport) s -= off.length * 8 + bright.length * 12;

    /* --- Motif : une pièce statement subtile --- */
    var subtle = parts.filter(function (x) { return SUBTLE_PATTERNS.indexOf(x.pattern) > -1; });
    var loud = parts.filter(function (x) { return LOUD_PATTERNS.indexOf(x.pattern) > -1; });
    if (subtle.length === 1) { s += 6; why.push('One subtle pattern carries the interest (' + PATTERNS.filter(function (p) { return p[0] === subtle[0].pattern; })[0][1].toLowerCase() + ')'); }
    else if (subtle.length > 1) s -= 12;
    loud.forEach(function (x) { s -= x.pattern === 'graphic' ? 10 : 8; });

    /* --- Texture : une matière statement sur des pièces lisses --- */
    var tex = wear.filter(function (x) { return STATEMENT_TEXTURES.indexOf(x.material) > -1; });
    if (tex.length === 1 && wear.length > 1) { s += 6; why.push('Texture mix: ' + tex[0].material.toLowerCase() + ' against smooth pieces'); }
    else if (tex.length === 2) s += 2;
    else if (tex.length > 2) s -= 3;

    /* --- Occasion : contexte prioritaire et formalité --- */
    parts.forEach(function (x) {
      if (x.occasions.indexOf(oc.tags[0]) > -1) s += 3;
      if (oc.dressy && x.occasions.indexOf('formal') > -1) s += 4;
      if (oc.type === 'formal' && x.occasions.indexOf('formal') > -1) s += 4;
    });
    var fit = 0, lvls = parts.map(function (x) { return formality(x.formality).lvl; });
    parts.forEach(function (x) { if (oc.ideal.indexOf(formality(x.formality).lvl) > -1) fit++; });
    s += Math.min(fit, 4) * 2;
    if (oc.type === 'work' && !oc.strict && TOO_CASUAL_FOR_WORK.some(function (st) { return parts.some(function (x) { return x.subtype === st; }); })) s -= 10;
    var spread = Math.max.apply(null, lvls) - Math.min.apply(null, lvls);
    if (!sport) { if (spread >= 3) s -= 10; else if (spread === 2) s -= 3; }

    /* --- Paires et trios éprouvés --- */
    var cols = [];
    wear.forEach(function (x) { if (cols.indexOf(x.color) < 0) cols.push(x.color); });
    var found = [];
    for (var i = 0; i < cols.length; i++) for (var j = i + 1; j < cols.length; j++) {
      var p = hasPair(cols[i], cols[j]); if (p) found.push(p[2]);
    }
    s += Math.min(found.length, 2) * 3;
    var allCols = cols.concat([o.shoes.color]);
    var trio = COMBOS.trios.filter(function (tr) { return allCols.indexOf(tr[0]) > -1 && allCols.indexOf(tr[1]) > -1 && allCols.indexOf(tr[2]) > -1; })[0];
    if (trio) { s += 5; why.push(trio[3]); }
    else if (found.length && !tonal) why.push(found[0]);

    /* --- Contraste haut / bas --- */
    var tc = color(o.top.color), bc = color(o.bottom.color), sc = color(o.shoes.color);
    if (o.top.color === o.bottom.color) {
      if (o.top.color === 'denim') s -= 15;
      else if (!tonal) s -= 6;
    } else if ((tc.light && bc.dark) || (tc.dark && bc.light)) s += 4;
    if (o.layer && o.outer && o.layer.color === o.outer.color && !tonal) s -= 4;
    if (oc.night && tc.dark) s += 5;

    /* --- Chaussures : sombres et structurées (tendance) --- */
    if (!sport) {
      if (isDarkShoe(o.shoes) && isStructured(o.shoes)) s += 6;
      else if (!isDarkShoe(o.shoes)) { s -= 4; if (s > 0) bends.push('Lighter shoes: lifts the look'); }
      if (CASUAL_SHOES.indexOf(o.shoes.subtype) > -1 && !oc.beach) s -= 20;
    }
    var rule = COMBOS.shoes[o.bottom.color];
    if (rule) {
      if (rule.good && rule.good.indexOf(o.shoes.color) > -1) s += 4;
      else if (rule.avoid && rule.avoid.indexOf(o.shoes.color) > -1) s -= 8;
    }

    /* --- Historique : pièces portées ces 3 derniers jours en bas de la pile, non portées depuis 7 j en priorité --- */
    parts.forEach(function (x) { s += rotationPoints(x, ctx); });

    /* --- Goûts appris : 👍 / 👎 et tenues portées --- */
    var pr = ctx.prefs;
    if (pr) {
      var key = comboKey(o);
      if (pr.disliked && pr.disliked[key]) s -= 60;
      var liked = pr.liked && pr.liked[key];
      if (liked) { s += 12; why.unshift('You liked this outfit'); }
      var pairPts = 0;
      pairKeys(parts).forEach(function (k) { pairPts += (pr.pairs && pr.pairs[k]) || 0; });
      pairPts = clamp(pairPts, -6, 6);
      s += pairPts * 3;
      if (pairPts >= 2 && !liked) why.unshift('Pairings you liked before');
      parts.forEach(function (x) { s += clamp((pr.items && pr.items[x.id]) || 0, -3, 3); });
    }

    /* Une tenue qui plie une ligne directrice ne garde la mention que si elle reste bien classée. */
    if (s < 100) bends = bends.filter(function (b) { return b.indexOf('Lighter shoes') < 0; });
    return { score: s, why: why, bends: bends };
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* Identifiant stable d'une tenue (pièces principales). */
  function comboKey(o) { return CORE.map(function (c) { return o[c.id] ? o[c.id].id : '-'; }).join('|'); }
  /* Paires de pièces d'une tenue, pour apprendre les associations aimées / rejetées. */
  function pairKeys(parts) {
    var ids = parts.map(function (x) { return x.id; }).sort(), out = [];
    for (var i = 0; i < ids.length; i++) for (var j = i + 1; j < ids.length; j++) out.push(ids[i] + '+' + ids[j]);
    return out;
  }
  /* Rotation : portée ces 3 derniers jours → en bas de la pile (moitié moins pour une favorite) ; 7 j+ → priorité. */
  function rotationPoints(x, ctx) {
    var d = daysAgo((ctx.worn || {})[x.id] || x.lastWorn), pts = 0;
    var pen = (x.cat === 'shoes' || x.cat === 'outer') ? 20 : 40;
    if (x.fav) { pen = pen / 2; pts += 4; }
    if (d <= 3) pts -= pen; else if (d >= 7) pts += 5;
    return pts;
  }
  /* Mémorise un avis (+1 j'aime, −1 je n'aime pas, +0.5 portée) sur une tenue. Modifie prefs en place. */
  function learn(prefs, o, delta) {
    prefs.pairs = prefs.pairs || {}; prefs.items = prefs.items || {}; prefs.liked = prefs.liked || {}; prefs.disliked = prefs.disliked || {};
    var parts = CORE.map(function (c) { return o[c.id]; }).filter(Boolean), key = comboKey(o);
    pairKeys(parts).forEach(function (k) { prefs.pairs[k] = clamp((prefs.pairs[k] || 0) + delta, -5, 5); });
    parts.forEach(function (x) { prefs.items[x.id] = clamp((prefs.items[x.id] || 0) + delta / 2, -5, 5); });
    if (delta >= 1) { prefs.liked[key] = true; delete prefs.disliked[key]; }
    if (delta <= -1) { prefs.disliked[key] = true; delete prefs.liked[key]; }
    return prefs;
  }

  /* Note d'une pièce seule dans le contexte (météo, occasion, palette, rotation, goûts) : sert à présélectionner. */
  function pieceScore(x, ctx) {
    var t = ctx.temp, oc = ctx.occasion, wet = ctx.cond === 'rain' || ctx.cond === 'snow', s = 0;
    if (x.occasions.indexOf(oc.tags[0]) > -1) s += 3;
    if (oc.ideal.indexOf(formality(x.formality).lvl) > -1) s += 2;
    if (oc.type !== 'sport') { if (!inPalette(x.color)) s -= 8; if (!color(x.color).neutral) s -= 12; }
    if (LOUD_PATTERNS.indexOf(x.pattern) > -1) s -= 8;
    if (SUBTLE_PATTERNS.indexOf(x.pattern) > -1) s += 3;
    if (STATEMENT_TEXTURES.indexOf(x.material) > -1) s += 2;
    if (x.cat === 'layer') s += t > DNA.baseOnlyAbove ? (x.warmth > 1 ? -35 : -20) : t >= DNA.midLayerFrom ? 6 : 2;
    if (x.cat === 'outer') {
      if (t > DNA.baseOnlyAbove) s += wet && x.rainOk && x.warmth === 1 ? 4 : (x.warmth > 1 ? -30 : -15);
      else if (t >= DNA.midLayerFrom) s += x.warmth === 3 ? -20 : 0;
      else s += 8 + (t < DNA.outerStrongBelow && x.warmth === 3 ? 6 : 0);
      if (wet && x.rainOk) s += 10;
      if (x.length === 'cropped' || x.length === 'waist') s += 5;
    }
    if (x.cat === 'bottom') {
      var shorts = x.warmth === 1;
      if (shorts && t >= 25 && oc.type === 'casual') s += 12;
      if (shorts && (t < DNA.outerBelow || oc.type === 'work')) s -= 30;
      if (x.fit === 'wide') s += 4;
    }
    if (x.cat === 'top') { if (t > DNA.baseOnlyAbove && x.warmth > 1) s -= 10; if (x.fit === 'slim') s += 3; }
    if (x.cat === 'shoes' && oc.type !== 'sport') { if (isDarkShoe(x) && isStructured(x)) s += 6; if (wet && x.rainOk) s += 4; }
    s += rotationPoints(x, ctx);
    if (ctx.prefs && ctx.prefs.items) s += clamp(ctx.prefs.items[x.id] || 0, -3, 3);
    return s;
  }
  /* Garde les k meilleures pièces, plus la meilleure de chaque famille de couleur et de chaque coupe
     (pour ne pas perdre les tenues ton sur ton ou les contrastes de silhouette). */
  function shortlist(list, ctx, k) {
    var ranked = list.map(function (x) { return { x: x, s: pieceScore(x, ctx) }; }).sort(function (a, b) { return b.s - a.s; });
    var keep = ranked.slice(0, k).map(function (r) { return r.x; }), seen = {};
    keep.forEach(function (x) { seen['f' + family(x.color)] = seen['t' + x.fit] = true; });
    ranked.slice(k).forEach(function (r) {
      var f = 'f' + family(r.x.color), t = 't' + r.x.fit;
      if ((!seen[f] || !seen[t]) && keep.length < k + 6) { keep.push(r.x); seen[f] = seen[t] = true; }
    });
    return keep;
  }
  function beam(list, width, perPair) {
    list.sort(function (a, b) { return b.score - a.score; });
    var count = {}, out = [];
    for (var i = 0; i < list.length && out.length < width; i++) {
      var k = list[i].o.top.id + '|' + list[i].o.bottom.id;
      count[k] = (count[k] || 0) + 1;
      if (count[k] <= perPair) out.push(list[i]);
    }
    return out;
  }

  /* Recherche de tenues en 3 étapes (haut + bas + chaussures, puis couche, puis manteau) en ne gardant
     que les meilleures à chaque étape. ~4 000 notes au lieu de plus d'un million pour une grande penderie.
     opts.exhaustive = true : ancienne recherche complète (utilisée par les tests pour vérifier la qualité). */
  function candidates(items, ctx, opts) {
    opts = opts || {};
    if (opts.exhaustive) return exhaustive(items, ctx);
    var oc = ctx.occasion;
    var tops = shortlist(pool(items, 'top', oc), ctx, 14), bottoms = shortlist(pool(items, 'bottom', oc), ctx, 12);
    var shoes = shortlist(pool(items, 'shoes', oc), ctx, 6);
    var layers = [null].concat(shortlist(pool(items, 'layer', oc), ctx, 8)), outers = [null].concat(shortlist(pool(items, 'outer', oc), ctx, 6));
    function run(o) { var r = score(o, ctx); return r ? { o: o, score: r.score, why: r.why, bends: r.bends } : null; }
    var stage = [];
    tops.forEach(function (top) { bottoms.forEach(function (bottom) { shoes.forEach(function (sh) {
      var r = run({ outer: null, layer: null, top: top, bottom: bottom, shoes: sh }); if (r) stage.push(r);
    }); }); });
    stage = beam(stage, 70, 3);
    var withLayer = [];
    stage.forEach(function (c) { layers.forEach(function (l) {
      var r = run({ outer: null, layer: l, top: c.o.top, bottom: c.o.bottom, shoes: c.o.shoes }); if (r) withLayer.push(r);
    }); });
    withLayer = beam(withLayer, 90, 4);
    var out = [];
    withLayer.forEach(function (c) { outers.forEach(function (ou) {
      var r = run({ outer: ou, layer: c.o.layer, top: c.o.top, bottom: c.o.bottom, shoes: c.o.shoes }); if (r) out.push(r);
    }); });
    return dedupe(out);
  }
  function dedupe(out) {
    out.sort(function (a, b) { return b.score - a.score; });
    /* Variété : deux propositions de suite ne partagent pas le même haut + bas. */
    var seen = {}, res = [];
    out.forEach(function (c) {
      var k = c.o.top.id + '|' + c.o.bottom.id;
      if (!seen[k]) { seen[k] = true; res.push(c); }
    });
    return res;
  }
  function exhaustive(items, ctx) {
    var oc = ctx.occasion;
    var tops = pool(items, 'top', oc), bottoms = pool(items, 'bottom', oc), shoes = pool(items, 'shoes', oc);
    var layers = [null].concat(pool(items, 'layer', oc)), outers = [null].concat(pool(items, 'outer', oc));
    var out = [];
    tops.forEach(function (top) { bottoms.forEach(function (bottom) { shoes.forEach(function (sh) {
      layers.forEach(function (layer) { outers.forEach(function (outer) {
        var o = { outer: outer, layer: layer, top: top, bottom: bottom, shoes: sh };
        var r = score(o, ctx);
        if (r) out.push({ o: o, score: r.score, why: r.why, bends: r.bends });
      }); });
    }); }); });
    return dedupe(out);
  }

  /* Ce qui manque pour proposer une tenue (pour l'expliquer clairement). */
  function missing(items, ctx) {
    var oc = ctx.occasion;
    var need = ['top', 'bottom', 'shoes'];
    var out = [];
    need.forEach(function (c) {
      if (pool(items, c, oc).length) return;
      var tagged = items.filter(function (x) { return x.cat === c && x.occasions.some(function (t) { return oc.tags.indexOf(t) > -1; }); });
      var dirty = tagged.filter(function (x) { return x.laundry; }).length;
      var label = c === 'shoes' && oc.type === 'formal' ? 'Dressed-up shoes (no sneakers)' : catLabel(c);
      out.push(label + (dirty ? ' (' + dirty + ' in the laundry)' : ''));
    });
    return out;
  }

  /* ---------- Accessoires : « Complete your look » (2 maximum : discrets mais présents) ---------- */
  function accessorySuggestions(items, o, ctx, dismissed) {
    var oc = ctx.occasion, t = ctx.temp;
    dismissed = dismissed || {};
    var clean = items.filter(function (x) { return x.cat === 'acc' && !x.laundry && !dismissed[x.id]; });
    if (!clean.length) return [];
    var fams = [];
    CORE.forEach(function (c) { var x = o[c.id]; if (x) { var f = family(x.color); if (fams.indexOf(f) < 0) fams.push(f); } });
    function bestOf(list) {
      return list.map(function (x) {
        var sc = 0, f = family(x.color);
        if (fams.indexOf(f) > -1) sc += 6; else if (fams.length >= 3) sc -= 4; else sc += 1; /* une 3e couleur discrète est bienvenue */
        if (inPalette(x.color)) sc += 4; else sc -= 8;
        if (LOUD_PATTERNS.indexOf(x.pattern) > -1) sc -= 6;
        if (x.occasions.some(function (tg) { return oc.tags.indexOf(tg) > -1; })) sc += 3;
        if (daysAgo(ctx.worn[x.id] || x.lastWorn) <= 3) sc -= 2;
        return { x: x, sc: sc };
      }).sort(function (a, b) { return b.sc - a.sc; })[0];
    }
    function of(subs) { return clean.filter(function (x) { return subs.indexOf(x.subtype) > -1; }); }
    var casual = oc.type !== 'work' && oc.type !== 'formal';
    var kinds = [];
    if (t < DNA.scarfBelow || ctx.cond === 'wind') kinds.push({ list: of(['Scarf']), why: ctx.cond === 'wind' ? 'Scarf: it’s windy' : 'Scarf below ' + DNA.scarfBelow + ' °C' });
    /* Couvre-chef : jamais pour les occasions habillées ; au travail, seulement le bonnet quand il fait froid. */
    if (oc.type !== 'formal') {
      if (t < DNA.beanieBelow || ctx.cond === 'snow') kinds.push({ list: of(['Beanie']), why: 'Beanie for the cold' });
      else if (casual && (oc.ideal[0] <= 1 || oc.type === 'sport')) kinds.push({ list: of(['Cap']), why: 'Cap: the street finish' });
    }
    kinds.push({ list: of(['Watch']), why: 'Watch: a considered detail' });
    if (oc.type !== 'sport') kinds.push({ list: of(['Necklace']), why: 'Necklace: subtle, under the collar' });
    if (casual && oc.type !== 'sport') kinds.push({ list: of(['Chain wallet']), why: 'Chain wallet: a quiet street detail' });
    if (oc.type !== 'sport') kinds.push({ list: of(['Tote bag', 'Crossbody bag', 'Backpack']), why: 'Bag for your essentials' });
    var out = [];
    kinds.forEach(function (k) {
      if (out.length >= 2 || !k.list.length) return;
      var b = bestOf(k.list); out.push({ x: b.x, why: k.why });
    });
    return out;
  }

  /* ---------- Valeurs par défaut selon la sorte de pièce ----------
     wash = nombre de ports avant lavage (0 = ne passe pas au linge). */
  var DEFAULTS = {
    'T-shirt': { cat: 'top', warmth: 1, fit: 'slim', formality: 'casual', material: 'Cotton', wash: 1, occasions: ['chill', 'date', 'travel'] },
    'Shirt': { cat: 'top', warmth: 1, fit: 'regular', formality: 'smart', material: 'Cotton', wash: 2, occasions: ['work', 'date'] },
    'Oxford shirt': { cat: 'top', warmth: 1, fit: 'regular', formality: 'smart', material: 'Cotton', wash: 2, occasions: ['work', 'date', 'formal'] },
    'Polo': { cat: 'top', warmth: 1, fit: 'slim', formality: 'smart', material: 'Knit', wash: 2, occasions: ['work', 'date', 'chill'] },
    'Long-sleeve': { cat: 'top', warmth: 1, fit: 'slim', formality: 'casual', material: 'Cotton', wash: 1, occasions: ['chill', 'travel'] },
    'Henley': { cat: 'top', warmth: 1, fit: 'slim', formality: 'casual', material: 'Cotton', wash: 1, occasions: ['chill', 'date'] },
    'Tank top': { cat: 'top', warmth: 1, fit: 'slim', formality: 'casual', material: 'Cotton', wash: 1, occasions: ['chill', 'gym'] },
    'Sport top': { cat: 'top', warmth: 1, fit: 'regular', formality: 'sport', material: 'Technical', wash: 1, occasions: ['gym'] },
    'Sweater': { cat: 'layer', warmth: 2, fit: 'regular', formality: 'smart', material: 'Knit', wash: 5, occasions: ['work', 'date', 'chill'] },
    'Cardigan': { cat: 'layer', warmth: 2, fit: 'regular', formality: 'smart', material: 'Knit', wash: 5, occasions: ['work', 'date', 'chill'] },
    'Hoodie': { cat: 'layer', warmth: 2, fit: 'wide', formality: 'casual', material: 'Cotton', wash: 4, occasions: ['chill', 'travel'] },
    'Sweatshirt': { cat: 'layer', warmth: 2, fit: 'regular', formality: 'casual', material: 'Cotton', wash: 4, occasions: ['chill', 'travel'] },
    'Overshirt': { cat: 'layer', warmth: 2, fit: 'regular', formality: 'smart', material: null, wash: 4, occasions: ['work', 'date', 'chill'] },
    'Zip-up': { cat: 'layer', warmth: 2, fit: 'regular', formality: 'casual', material: 'Fleece', wash: 4, occasions: ['chill', 'travel'] },
    'Vest': { cat: 'layer', warmth: 2, fit: 'slim', formality: 'smart', material: null, wash: 6, occasions: ['work', 'date'] },
    'Turtleneck': { cat: 'layer', warmth: 2, fit: 'slim', formality: 'smart', material: 'Knit', wash: 3, occasions: ['work', 'date', 'club'] },
    'Jeans': { cat: 'bottom', warmth: 2, fit: 'wide', formality: 'casual', material: 'Denim', wash: 6, occasions: ['chill', 'date', 'club', 'travel'] },
    'Chinos': { cat: 'bottom', warmth: 2, fit: 'regular', formality: 'smart', material: 'Cotton', wash: 4, occasions: ['work', 'date', 'chill'] },
    'Trousers': { cat: 'bottom', warmth: 2, fit: 'wide', formality: 'smart', material: 'Wool', wash: 4, occasions: ['work', 'date', 'formal'] },
    'Cargo pants': { cat: 'bottom', warmth: 2, fit: 'wide', formality: 'casual', material: 'Cotton', wash: 5, occasions: ['chill', 'travel'] },
    'Joggers': { cat: 'bottom', warmth: 2, fit: 'regular', formality: 'casual', material: 'Cotton', wash: 3, occasions: ['chill'] },
    'Track pants': { cat: 'bottom', warmth: 2, fit: 'regular', formality: 'sport', material: 'Technical', wash: 2, occasions: ['gym'] },
    'Shorts': { cat: 'bottom', warmth: 1, fit: 'regular', formality: 'casual', material: 'Cotton', wash: 3, occasions: ['chill', 'travel'] },
    'Sport shorts': { cat: 'bottom', warmth: 1, fit: 'regular', formality: 'sport', material: 'Technical', wash: 1, occasions: ['gym'] },
    'Jacket': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'smart', material: null, wash: 20, length: 'hip', occasions: ['work', 'date', 'chill'] },
    'Coat': { cat: 'outer', warmth: 3, fit: 'regular', formality: 'smart', material: 'Wool', wash: 30, length: 'long', occasions: ['work', 'date', 'formal'] },
    'Blazer': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'formal', material: 'Wool', wash: 15, length: 'hip', occasions: ['work', 'date', 'formal'] },
    'Bomber': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'casual', material: null, wash: 20, length: 'waist', occasions: ['chill', 'date', 'club'] },
    'Rain jacket': { cat: 'outer', warmth: 1, fit: 'regular', formality: 'casual', material: 'Technical', wash: 20, length: 'hip', rainOk: true, occasions: ['chill', 'work', 'travel'] },
    'Puffer': { cat: 'outer', warmth: 3, fit: 'wide', formality: 'casual', material: 'Synthetic', wash: 20, length: 'hip', occasions: ['chill', 'travel'] },
    'Leather jacket': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'casual', material: 'Leather', wash: 0, length: 'waist', occasions: ['chill', 'date', 'club'] },
    'Denim jacket': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'casual', material: 'Denim', wash: 15, length: 'waist', occasions: ['chill', 'travel'] },
    'Trench coat': { cat: 'outer', warmth: 2, fit: 'regular', formality: 'smart', material: 'Cotton', wash: 20, length: 'long', rainOk: true, occasions: ['work', 'date', 'formal'] },
    'Sneakers': { cat: 'shoes', warmth: 1, formality: 'casual', material: 'Leather', wash: 0, occasions: ['chill', 'date', 'club', 'travel'] },
    'Leather shoes': { cat: 'shoes', warmth: 2, formality: 'smart', material: 'Leather', wash: 0, occasions: ['work', 'date', 'formal'] },
    'Loafers': { cat: 'shoes', warmth: 1, formality: 'smart', material: 'Leather', wash: 0, occasions: ['work', 'date', 'formal'] },
    'Derbies': { cat: 'shoes', warmth: 2, formality: 'smart', material: 'Leather', wash: 0, occasions: ['work', 'date', 'formal'] },
    'Boots': { cat: 'shoes', warmth: 2, formality: 'casual', material: 'Leather', wash: 0, rainOk: true, occasions: ['chill', 'date', 'club', 'travel'] },
    'Chelsea boots': { cat: 'shoes', warmth: 2, formality: 'smart', material: 'Leather', wash: 0, rainOk: true, occasions: ['work', 'date', 'club', 'formal'] },
    'Running shoes': { cat: 'shoes', warmth: 1, formality: 'sport', material: 'Technical', wash: 0, rainOk: true, occasions: ['gym'] },
    'Sandals': { cat: 'shoes', warmth: 1, formality: 'casual', material: null, wash: 0, occasions: ['travel', 'chill'] },
    'Slides': { cat: 'shoes', warmth: 1, formality: 'casual', material: null, wash: 0, occasions: ['travel', 'chill', 'gym'] },
    'Cap': { cat: 'acc', wash: 10, occasions: ['chill', 'travel', 'gym'] },
    'Beanie': { cat: 'acc', wash: 10, occasions: ['chill', 'travel', 'club'] },
    'Scarf': { cat: 'acc', wash: 10, occasions: ['work', 'chill', 'date', 'formal', 'travel'] },
    'Watch': { cat: 'acc', wash: 0, occasions: ['work', 'chill', 'date', 'formal', 'club', 'travel'] },
    'Necklace': { cat: 'acc', wash: 0, occasions: ['chill', 'date', 'club', 'travel'] },
    'Chain wallet': { cat: 'acc', wash: 0, occasions: ['chill', 'club', 'travel'] },
    'Tote bag': { cat: 'acc', wash: 0, occasions: ['chill', 'work', 'travel'] },
    'Crossbody bag': { cat: 'acc', wash: 0, occasions: ['chill', 'travel', 'club'] },
    'Backpack': { cat: 'acc', wash: 0, occasions: ['work', 'chill', 'travel'] }
  };
  /* Applique les valeurs par défaut d'une sorte à une pièce (renvoie la pièce). */
  function applyDefaults(x, subtype) {
    var d = DEFAULTS[subtype];
    x.subtype = subtype;
    if (!d) return x;
    ['cat', 'warmth', 'fit', 'formality', 'material', 'length'].forEach(function (k) { if (d[k] !== undefined) x[k] = d[k]; });
    x.washEvery = d.wash;
    x.rainOk = !!d.rainOk;
    x.occasions = d.occasions.slice();
    return x;
  }
  function washDefault(x) {
    var d = DEFAULTS[x.subtype];
    if (d) return d.wash;
    return { top: 1, layer: 4, bottom: 4, outer: 20, shoes: 0, acc: 0 }[x.cat] || 1;
  }

  S2.wardrobeEngine = {
    CATS: CATS, CORE: CORE, TAGS: TAGS, GROUPS: GROUPS, OCCASIONS: OCCASIONS, LEGACY_OCC: LEGACY_OCC, LEGACY_TEMP: LEGACY_TEMP,
    CONDITIONS: CONDITIONS, WARMTH: WARMTH, FITS: FITS, FORMALITY: FORMALITY, PATTERNS: PATTERNS, SUBTLE_PATTERNS: SUBTLE_PATTERNS,
    LOUD_PATTERNS: LOUD_PATTERNS, MATERIALS: MATERIALS, STATEMENT_TEXTURES: STATEMENT_TEXTURES, LENGTHS: LENGTHS, COLORS: COLORS,
    DNA: DNA, DEFAULTS: DEFAULTS, COMBOS: COMBOS,
    color: color, cat: cat, catLabel: catLabel, tag: tag, occ: occ, cond: cond, formality: formality, value: value,
    family: family, inPalette: inPalette, isDarkShoe: isDarkShoe, isStructured: isStructured, weatherText: weatherText,
    keyOf: keyOf, today: today, daysAgo: daysAgo,
    complete: complete, poolReason: poolReason, pool: pool, score: score, pieceScore: pieceScore,
    candidates: candidates, missing: missing, accessorySuggestions: accessorySuggestions,
    comboKey: comboKey, learn: learn, applyDefaults: applyDefaults, washDefault: washDefault
  };
})();
