/* Onglet Wardrobe : vêtements, tenues enregistrées, linge sale, historique, et proposition de tenue
   selon la météo, l'occasion et le « Style DNA » de l'utilisateur.
   La météo est saisie à la main (pas de récupération automatique, cf. CLAUDE.md).
   Règles de couleurs : js/tabs/garde-robe-combos.js. Données : localStorage "sandeep2:garde-robe". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  var NS = 'garde-robe';
  var SCHEMA = 3;
  var COMBOS = S2.wardrobeCombos || { pairs: [], trios: [], shoes: {} };

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a2 2 0 1 1 2-2M12 6v2l8.5 6.5a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 8"/></svg>';

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

  /* ---------- Données ---------- */
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
    if (x.location === undefined) x.location = '';
    if (x.brand === undefined) x.brand = '';
    if (x.notes === undefined) x.notes = '';
    return x;
  }

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.items)) d = { schema: SCHEMA, items: [], outfits: [], today: null, history: [] };
    d.history = d.history || [];
    d.outfits = d.outfits || [];
    d.items.forEach(complete);
    /* Historique : chaque entrée garde une copie des pièces portées (pour rester lisible si une pièce est supprimée). */
    d.history.forEach(function (e) {
      if (!e.id) e.id = ui.uid();
      if (!e.at) e.at = e.date + 'T12:00:00';
      if (typeof e.temp === 'string') e.temp = LEGACY_TEMP[e.temp] !== undefined ? LEGACY_TEMP[e.temp] : null;
      if (!e.cond) e.cond = e.rain ? 'rain' : 'clear';
      if (e.occasion && LEGACY_OCC[e.occasion]) e.occasion = LEGACY_OCC[e.occasion];
      if (!e.pieces) e.pieces = (e.items || []).map(function (id) { var x = d.items.filter(function (i) { return i.id === id; })[0]; return x ? snap(x) : null; }).filter(Boolean);
      e.acc = e.acc || [];
    });
    if (d.today && d.today.date !== today()) d.today = null; /* nouvelle journée : on repart de zéro */
    if (d.today) {
      if (typeof d.today.temp === 'string') d.today.temp = LEGACY_TEMP[d.today.temp];
      if (!d.today.cond) d.today.cond = d.today.rain ? 'rain' : 'clear';
      if (d.today.occasion && LEGACY_OCC[d.today.occasion]) d.today.occasion = LEGACY_OCC[d.today.occasion];
      d.today.accAdded = d.today.accAdded || {};
      d.today.accDismissed = d.today.accDismissed || {};
    }
    d.schema = SCHEMA;
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function item(id) { return data.items.filter(function (x) { return x.id === id; })[0]; }
  function snap(x) { return { id: x.id, name: x.name, cat: x.cat, color: x.color, subtype: x.subtype || null }; }
  function todayState() {
    if (!data.today) data.today = { date: today(), temp: null, cond: 'clear', occasion: null, outfit: null, worn: false, accAdded: {}, accDismissed: {} };
    return data.today;
  }

  /* Dernier jour de port d'une pièce d'après les 30 dernières entrées de l'historique (sinon champ lastWorn). */
  function lastWornMap() {
    var m = {};
    data.history.slice().sort(function (a, b) { return a.at < b.at ? 1 : -1; }).slice(0, 30).forEach(function (e) {
      (e.items || []).concat(e.acc || []).forEach(function (id) { if (!m[id]) m[id] = e.date || e.at.slice(0, 10); });
    });
    return m;
  }

  function starter() {
    function it(name, c, col, warmth, occasions, rainOk, extra) {
      var x = { id: ui.uid(), name: name, cat: c, color: col, warmth: warmth, occasions: occasions, rainOk: !!rainOk, laundry: false, lastWorn: null, worn: 0 };
      Object.keys(extra || {}).forEach(function (k) { x[k] = extra[k]; });
      return complete(x);
    }
    return [
      it('Navy rain jacket', 'outer', 'navy', 1, ['work', 'gym', 'chill', 'travel'], true),
      it('Camel wool coat', 'outer', 'camel', 3, ['work', 'date', 'club', 'formal']),
      it('Black bomber jacket', 'outer', 'black', 2, ['club', 'date', 'chill']),
      it('Black cropped leather jacket', 'outer', 'black', 2, ['club', 'date', 'chill'], false, { subtype: 'Leather jacket', material: 'Leather', length: 'cropped' }),
      it('Grey crewneck sweater', 'layer', 'grey', 2, ['work', 'date', 'chill', 'travel']),
      it('Navy knit sweater', 'layer', 'navy', 2, ['work', 'date', 'chill']),
      it('Black hoodie', 'layer', 'black', 2, ['gym', 'chill'], false, { fit: 'wide' }),
      it('Taupe houndstooth overshirt', 'layer', 'taupe', 2, ['work', 'date', 'chill'], false, { subtype: 'Overshirt', pattern: 'houndstooth' }),
      it('Cream fleece zip-up', 'layer', 'cream', 2, ['chill', 'travel'], false, { subtype: 'Zip-up', material: 'Fleece' }),
      it('White T-shirt', 'top', 'white', 1, ['chill', 'date', 'travel'], false, { fit: 'slim' }),
      it('Black T-shirt', 'top', 'black', 1, ['club', 'chill', 'date'], false, { fit: 'slim' }),
      it('White Oxford shirt', 'top', 'white', 1, ['work', 'date', 'formal']),
      it('Cream knit polo', 'top', 'cream', 1, ['work', 'date', 'chill'], false, { fit: 'slim', subtype: 'Polo' }),
      it('Black shirt', 'top', 'black', 1, ['club', 'date', 'formal']),
      it('Grey training T-shirt', 'top', 'grey', 1, ['gym']),
      it('Wide-leg navy trousers', 'bottom', 'navy', 2, ['work', 'date', 'club', 'formal'], false, { subtype: 'Trousers', formality: 'smart' }),
      it('Relaxed beige chinos', 'bottom', 'beige', 2, ['work', 'date', 'chill', 'travel'], false, { subtype: 'Chinos' }),
      it('Wide black jeans', 'bottom', 'black', 2, ['club', 'date', 'chill'], false, { subtype: 'Jeans' }),
      it('Khaki cargo pants', 'bottom', 'khaki', 2, ['chill', 'travel']),
      it('Relaxed cream shorts', 'bottom', 'cream', 1, ['chill', 'travel'], false, { subtype: 'Shorts' }),
      it('Black training shorts', 'bottom', 'black', 1, ['gym'], false, { subtype: 'Sport shorts' }),
      it('Black leather sneakers', 'shoes', 'black', 1, ['chill', 'date', 'club', 'travel'], false, { subtype: 'Sneakers', material: 'Leather' }),
      it('Brown leather derbies', 'shoes', 'brown', 2, ['work', 'date', 'formal'], false, { subtype: 'Derbies' }),
      it('Black Chelsea boots', 'shoes', 'black', 2, ['club', 'date', 'work', 'formal'], true),
      it('Running shoes', 'shoes', 'grey', 1, ['gym'], true),
      it('Black cap', 'acc', 'black', 1, ['chill', 'travel', 'gym'], false, { subtype: 'Cap' }),
      it('Grey beanie', 'acc', 'grey', 2, ['chill', 'travel', 'club'], false, { subtype: 'Beanie' }),
      it('Navy wool scarf', 'acc', 'navy', 2, ['work', 'chill', 'date', 'formal'], false, { subtype: 'Scarf' }),
      it('Brown leather watch', 'acc', 'brown', 1, ['work', 'date', 'formal', 'chill'], false, { subtype: 'Watch' }),
      it('Black crossbody bag', 'acc', 'black', 1, ['chill', 'travel', 'club'], false, { subtype: 'Crossbody bag' }),
      it('Silver chain necklace', 'acc', 'grey', 1, ['chill', 'date', 'club', 'travel'], false, { subtype: 'Necklace' }),
      it('Black chain wallet', 'acc', 'black', 1, ['chill', 'club', 'travel'], false, { subtype: 'Chain wallet' })
    ];
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
  function pool(c, o) { return data.items.filter(function (x) { return x.cat === c && !poolReason(x, o); }); }

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
    var worn = ctx.worn || {};
    parts.forEach(function (x) {
      var d = daysAgo(worn[x.id] || x.lastWorn);
      if (d <= 3) s -= (x.cat === 'shoes' || x.cat === 'outer') ? 20 : 40;
      else if (d >= 7) s += 5;
    });

    /* Une tenue qui plie une ligne directrice ne garde la mention que si elle reste bien classée. */
    if (s < 100) bends = bends.filter(function (b) { return b.indexOf('Lighter shoes') < 0; });
    return { score: s, why: why, bends: bends };
  }

  function candidates(ctx) {
    var oc = ctx.occasion;
    var tops = pool('top', oc), bottoms = pool('bottom', oc), shoes = pool('shoes', oc);
    var layers = [null].concat(pool('layer', oc)), outers = [null].concat(pool('outer', oc));
    var out = [];
    tops.forEach(function (top) { bottoms.forEach(function (bottom) { shoes.forEach(function (sh) {
      layers.forEach(function (layer) { outers.forEach(function (outer) {
        var o = { outer: outer, layer: layer, top: top, bottom: bottom, shoes: sh };
        var r = score(o, ctx);
        if (r) out.push({ o: o, score: r.score, why: r.why, bends: r.bends });
      }); });
    }); }); });
    out.sort(function (a, b) { return b.score - a.score; });
    /* Variété : deux propositions de suite ne partagent pas le même haut + bas. */
    var seen = {}, res = [];
    out.forEach(function (c) {
      var k = c.o.top.id + '|' + c.o.bottom.id;
      if (!seen[k]) { seen[k] = true; res.push(c); }
    });
    return res;
  }

  /* Ce qui manque pour proposer une tenue (pour l'expliquer clairement). */
  function missing(ctx) {
    var oc = ctx.occasion;
    var need = ['top', 'bottom', 'shoes'];
    var out = [];
    need.forEach(function (c) {
      if (pool(c, oc).length) return;
      var tagged = data.items.filter(function (x) { return x.cat === c && x.occasions.some(function (t) { return oc.tags.indexOf(t) > -1; }); });
      var dirty = tagged.filter(function (x) { return x.laundry; }).length;
      var label = c === 'shoes' && oc.type === 'formal' ? 'Dressed-up shoes (no sneakers)' : catLabel(c);
      out.push(label + (dirty ? ' (' + dirty + ' in the laundry)' : ''));
    });
    return out;
  }

  /* ---------- Accessoires : « Complete your look » (2 maximum : discrets mais présents) ---------- */
  function accessorySuggestions(o, ctx, st) {
    var oc = ctx.occasion, t = ctx.temp;
    var clean = data.items.filter(function (x) { return x.cat === 'acc' && !x.laundry && !st.accDismissed[x.id]; });
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

  /* ---------- Tenues enregistrées ---------- */
  function outfitPieces(of) {
    var o = {};
    CORE.forEach(function (c) { var id = of.items[c.id]; var x = id ? item(id) : null; if (x) o[c.id] = x; });
    return o;
  }
  function outfitStatus(of) {
    var o = outfitPieces(of);
    var dirty = CORE.map(function (c) { return o[c.id]; }).filter(function (x) { return x && x.laundry; });
    var full = !!(o.top && o.bottom && o.shoes);
    return { o: o, dirty: dirty, ready: full && !dirty.length, complete: full };
  }

  /* ---------- Interface ---------- */
  var view = 'today'; // today | outfits | closet | laundry | history
  var pick = 0;       // rang de la proposition affichée
  var outfitFilter = 'all', closetQuery = '', closetFilter = 'all';

  function mount(container) {
    data = loadData();
    root = container;
    render();
  }

  function render() {
    root.innerHTML = '';
    var dirty = data.items.filter(function (x) { return x.laundry; }).length;
    root.appendChild(h('div', { class: 'segmented wr-nav' },
      [['today', 'Today'], ['outfits', 'Outfits'], ['closet', 'Closet'], ['laundry', 'Laundry' + (dirty ? ' ' + dirty : '')], ['history', 'History']].map(function (v) {
        return h('button', { class: 'seg' + (view === v[0] ? ' is-active' : ''), onclick: function () { view = v[0]; render(); window.scrollTo(0, 0); } }, v[1]);
      })));
    if (view === 'closet') renderCloset();
    else if (view === 'outfits') renderOutfits();
    else if (view === 'laundry') renderLaundry();
    else if (view === 'history') renderHistory();
    else renderToday();
  }

  function swatch(col, big) {
    return h('span', { class: 'wr-swatch' + (big ? ' is-big' : ''), style: { background: color(col).hex }, 'aria-hidden': 'true' });
  }
  function pieceSub(x) {
    return [x.subtype || catLabel(x.cat), color(x.color).label, x.fit && x.fit !== 'regular' && x.cat !== 'acc' && x.cat !== 'shoes' ? (x.fit === 'slim' ? 'Slim' : 'Wide') : null].filter(Boolean).join(' · ');
  }

  /* ----- Aujourd'hui ----- */
  function renderToday() {
    var st = todayState();
    if (!data.items.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, 'Your closet is empty. Add your clothes so the app can suggest outfits.'),
        h('button', { class: 'btn btn-primary', onclick: function () { view = 'closet'; render(); } }, 'Go to the closet')));
      return;
    }

    if (st.worn && st.outfit) return renderWorn(st);

    /* Occasion : rangée de puces défilante, groupée par catégorie */
    var oc = occ(st.occasion);
    root.appendChild(h('div', { class: 'wr-todayhead' },
      h('h2', { class: 'section-title' }, 'Occasion'),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: openStyle }, '✦ My Style')));
    var row = h('div', { class: 'wr-occrow', role: 'listbox', 'aria-label': 'Occasion' });
    GROUPS.forEach(function (g) {
      row.appendChild(h('span', { class: 'wr-occgroup' }, g.label));
      g.items.forEach(function (o) {
        var on = oc && oc.id === o.id;
        row.appendChild(h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), role: 'option', 'aria-selected': on ? 'true' : 'false',
          onclick: function () { st.occasion = o.id; pick = 0; st.accAdded = {}; st.accDismissed = {}; persist(); render(); } }, o.icon + ' ' + o.label));
      });
    });
    root.appendChild(row);
    if (oc) setTimeout(function () { var a = row.querySelector('.is-active'); if (a) row.scrollLeft = Math.max(0, a.offsetLeft - row.offsetLeft - 90); }, 0);

    /* Météo : température + condition */
    root.appendChild(h('h2', { class: 'section-title' }, 'Weather'));
    var tVal = st.temp === null || st.temp === undefined ? 15 : st.temp;
    var tLabel = h('span', { class: 'wr-tempval' }, st.temp === null || st.temp === undefined ? '— °C' : tVal + ' °C');
    var slider = h('input', { class: 'wr-slider', type: 'range', min: -10, max: 40, step: 1, value: String(tVal), 'aria-label': 'Temperature in °C' });
    slider.addEventListener('input', function () { tLabel.textContent = slider.value + ' °C'; });
    slider.addEventListener('change', function () { st.temp = Number(slider.value); pick = 0; persist(); render(); });
    root.appendChild(h('div', { class: 'card wr-weather' },
      h('div', { class: 'wr-temprow' }, h('span', { class: 'field-label' }, 'Temperature'), tLabel),
      slider,
      h('div', { class: 'wr-conds' }, CONDITIONS.map(function (c) {
        var on = st.cond === c.id;
        return h('button', { class: 'wr-cond' + (on ? ' is-active' : ''), 'aria-pressed': on ? 'true' : 'false',
          onclick: function () { st.cond = c.id; if (st.temp === null || st.temp === undefined) st.temp = Number(slider.value); pick = 0; persist(); render(); } },
          h('span', { 'aria-hidden': 'true' }, c.icon), h('span', null, c.label));
      }))));
    root.appendChild(h('p', { class: 'hint' }, 'Check your weather app, then set it here.'));

    if (!oc || st.temp === null || st.temp === undefined) {
      root.appendChild(h('p', { class: 'note' }, !oc ? 'Pick an occasion, then set the weather.' : 'Set the temperature to get an outfit.'));
      return;
    }
    var ctx = { temp: st.temp, cond: st.cond, occasion: oc, worn: lastWornMap() };

    /* Tenues enregistrées prêtes pour cette occasion */
    var mine = data.outfits.filter(function (of) { return of.occasions.some(function (t) { return oc.tags.indexOf(t) > -1; }); })
      .map(function (of) { var stt = outfitStatus(of); return { of: of, st: stt, fit: stt.ready ? score(stt.o, ctx) : null }; })
      .filter(function (x) { return x.st.ready; })
      .sort(function (a, b) { return (b.fit ? b.fit.score : -999) - (a.fit ? a.fit.score : -999); });
    if (mine.length) {
      root.appendChild(h('h2', { class: 'section-title' }, 'Your outfits ready for ' + oc.label.toLowerCase()));
      mine.slice(0, 3).forEach(function (x) {
        root.appendChild(savedCard(x.of, x.st, {
          weatherNote: x.fit ? (x.fit.score < 80 ? 'Not the best fit for today’s weather' : null) : 'Not for this occasion',
          onWear: function () { wear(st, x.st.o, []); }
        }));
      });
    }

    var list = candidates(ctx);
    if (!list.length) {
      var miss = missing(ctx);
      root.appendChild(h('div', { class: 'card wr-none' },
        h('div', { class: 'card-title' }, 'No complete outfit available'),
        h('p', { class: 'sheet-text' }, miss.length
          ? 'Missing clean pieces for ' + oc.label.toLowerCase() + ': ' + miss.join(', ') + '.'
          : 'No combination of your clean clothes works for this occasion.'),
        h('p', { class: 'hint' }, 'Tag more clothes for this context in the Closet, or mark some laundry as clean. You can also build it yourself.'),
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { compose(st, {}); } }, 'Build it myself')));
      return;
    }
    if (pick >= list.length) pick = 0;
    var c = list[pick];
    root.appendChild(h('h2', { class: 'section-title' }, 'Suggested outfit · ' + (pick + 1) + ' of ' + list.length));
    root.appendChild(outfitCard(c.o, c.why, null, c.bends));

    /* Compléter la tenue */
    var accs = accessorySuggestions(c.o, ctx, st);
    root.appendChild(accessoryBlock(accs, st));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        wear(st, c.o, accs.filter(function (a) { return st.accAdded[a.x.id]; }).map(function (a) { return a.x; }));
      } }, 'I wore this ✓'),
      list.length > 1 ? h('button', { class: 'btn btn-secondary btn-block', onclick: function () { pick = (pick + 1) % list.length; st.accAdded = {}; persist(); render(); } }, '↻ Show another one') : null,
      h('div', { class: 'wr-twobtn' },
        h('button', { class: 'btn btn-ghost', onclick: function () { compose(st, c.o); } }, 'Swap a piece'),
        h('button', { class: 'btn btn-ghost', onclick: function () { editOutfit(null, c.o, oc.tags.slice(0, 1)); } }, '♡ Save outfit'))));
  }

  function accessoryBlock(accs, st) {
    var box = h('section', { class: 'card wr-acc' }, h('div', { class: 'wr-acchead' },
      h('span', { class: 'card-title' }, 'Complete your look'), h('span', { class: 'muted wr-accopt' }, 'Optional')));
    if (!data.items.some(function (x) { return x.cat === 'acc'; })) {
      box.appendChild(h('p', { class: 'hint' }, 'Add caps, beanies, scarves, bags or watches in the Closet (type “Accessories”) to get suggestions here.'));
      return box;
    }
    if (!accs.length) { box.appendChild(h('p', { class: 'hint' }, 'No accessory to suggest for this outfit.')); return box; }
    accs.forEach(function (a) {
      var on = !!st.accAdded[a.x.id];
      box.appendChild(h('div', { class: 'wr-accrow' + (on ? ' is-on' : '') }, swatch(a.x.color, true),
        h('div', { class: 'wr-piecemain' },
          h('div', { class: 'wr-piecename' }, a.x.name),
          h('div', { class: 'list-sub' }, a.why),
          a.x.location ? h('div', { class: 'wr-loc' }, '📍 ' + a.x.location) : null),
        h('button', { class: 'btn btn-sm ' + (on ? 'btn-primary' : 'btn-secondary'), 'aria-pressed': on ? 'true' : 'false',
          onclick: function () { if (on) delete st.accAdded[a.x.id]; else st.accAdded[a.x.id] = true; persist(); render(); } }, on ? 'Added ✓' : 'Add'),
        h('button', { class: 'btn btn-icon', 'aria-label': 'Dismiss ' + a.x.name,
          onclick: function () { st.accDismissed[a.x.id] = true; delete st.accAdded[a.x.id]; persist(); render(); } }, '✕')));
    });
    return box;
  }

  function pieceLine(x) {
    return h('div', { class: 'wr-piece' + (x.laundry ? ' is-dirty' : '') }, swatch(x.color, true),
      h('div', { class: 'wr-piecemain' },
        h('div', { class: 'wr-piecename' }, x.name),
        h('div', { class: 'list-sub' }, pieceSub(x)),
        x.location ? h('div', { class: 'wr-loc' }, '📍 ' + x.location) : null),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, '🧺 Laundry') : null);
  }

  function outfitCard(o, why, acc, bends) {
    var card = h('div', { class: 'card wr-outfit' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CORE.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    CORE.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id])); });
    (acc || []).forEach(function (x) { card.appendChild(pieceLine(x)); });
    if (why && why.length) card.appendChild(h('ul', { class: 'wr-why' }, why.slice(0, 4).map(function (w) { return h('li', null, w); })));
    if (bends && bends.length) card.appendChild(h('p', { class: 'wr-bend' }, '✦ Creative pick: ' + bends[0]));
    return card;
  }

  function savedCard(of, stt, opts) {
    opts = opts || {};
    var o = stt.o;
    var card = h('div', { class: 'card wr-outfit wr-saved' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CORE.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    card.appendChild(h('div', { class: 'wr-savedhead' },
      h('div', null,
        h('div', { class: 'wr-savedname' }, of.name),
        h('div', { class: 'list-sub' }, of.occasions.map(function (id) { return tag(id).icon + ' ' + tag(id).label; }).join(' · '))),
      stt.ready ? h('span', { class: 'badge wr-readybadge' }, 'Ready ✓')
        : !stt.complete ? h('span', { class: 'badge wr-dirtybadge' }, 'Incomplete')
        : h('span', { class: 'badge wr-dirtybadge' }, stt.dirty.length + ' in laundry')));
    if (opts.weatherNote) card.appendChild(h('p', { class: 'wr-weathernote' }, '⚠︎ ' + opts.weatherNote));
    CORE.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id])); });
    if (of.note) card.appendChild(h('p', { class: 'hint wr-savednote' }, of.note));
    card.appendChild(h('div', { class: 'wr-savedbtns' },
      stt.ready && opts.onWear ? h('button', { class: 'btn btn-primary btn-sm', onclick: opts.onWear }, 'I wore this ✓') : null,
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editOutfit(of); } }, 'Edit')));
    return card;
  }

  /* Choisir soi-même une pièce par catégorie. */
  function piecePicker(draft, onlyClean) {
    var wrap = h('div');
    function paint() {
      wrap.innerHTML = '';
      CORE.forEach(function (c) {
        var opts = data.items.filter(function (x) { return x.cat === c.id && (!onlyClean || !x.laundry); })
          .sort(function (a, b) { return a.name.localeCompare(b.name); });
        var optional = c.id === 'outer' || c.id === 'layer';
        wrap.appendChild(h('div', { class: 'field-label wr-pickhead' }, c.label + (optional ? ' (optional)' : '')));
        var row = h('div', { class: 'wr-pickrow' });
        if (optional) row.appendChild(h('button', { class: 'wr-pick' + (!draft[c.id] ? ' is-active' : ''), type: 'button',
          onclick: function () { draft[c.id] = null; paint(); } }, 'None'));
        opts.forEach(function (x) {
          row.appendChild(h('button', { class: 'wr-pick' + (draft[c.id] && draft[c.id].id === x.id ? ' is-active' : ''), type: 'button',
            onclick: function () { draft[c.id] = x; paint(); } }, swatch(x.color), x.name + (x.laundry ? ' 🧺' : '')));
        });
        if (!opts.length && !optional) row.appendChild(h('span', { class: 'muted' }, onlyClean ? 'Nothing clean' : 'Nothing yet'));
        wrap.appendChild(row);
      });
    }
    paint();
    return wrap;
  }

  function compose(st, base) {
    var draft = { outer: base.outer || null, layer: base.layer || null, top: base.top || null, bottom: base.bottom || null, shoes: base.shoes || null };
    var oc = occ(st.occasion);
    ui.sheet(function (close) {
      return [
        h('h2', { class: 'sheet-title' }, 'Build your outfit'),
        h('p', { class: 'sheet-text' }, 'Only clean clothes are shown. Your picks are kept as they are, even if they break a style rule.'),
        piecePicker(draft, true),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast('Pick a top, a bottom and shoes'); return; }
            close(); wear(st, draft, []);
          } }, 'I wore this ✓'),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast('Pick a top, a bottom and shoes'); return; }
            close(); editOutfit(null, draft, oc ? oc.tags.slice(0, 1) : []);
          } }, '♡ Save as an outfit'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))
      ];
    }, { modal: true });
  }

  /* « I wore this » : enregistre la tenue dans l'historique (date + heure, pièces, occasion, météo). */
  function wear(st, o, accs) {
    var pieces = CORE.map(function (c) { return o[c.id]; }).filter(Boolean);
    accs = accs || [];
    var now = new Date();
    pieces.concat(accs).forEach(function (x) { x.lastWorn = today(); x.worn = (x.worn || 0) + 1; });
    var entry = {
      id: ui.uid(), at: now.toISOString(), date: today(),
      occasion: st.occasion, temp: st.temp, cond: st.cond || 'clear',
      items: pieces.map(function (x) { return x.id; }), acc: accs.map(function (x) { return x.id; }),
      pieces: pieces.concat(accs).map(snap)
    };
    data.history.unshift(entry);
    data.history = data.history.slice(0, 365);
    st.outfit = entry.items; st.acc = entry.acc; st.entryId = entry.id; st.worn = true;
    persist(); view = 'today'; render(); window.scrollTo(0, 0);
    ui.toast('Saved to your history. Have a great day!');
  }

  function renderWorn(st) {
    var o = {};
    st.outfit.forEach(function (id) { var x = item(id); if (x) o[x.cat] = x; });
    var accs = (st.acc || []).map(item).filter(Boolean);
    var oc = occ(st.occasion);
    root.appendChild(h('h2', { class: 'section-title' }, 'Today’s outfit' + (oc ? ' · ' + oc.icon + ' ' + oc.label : '')));
    root.appendChild(outfitCard(o, null, accs));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { sortLaundry(st); } }, 'Back home: sort the laundry'),
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editOutfit(null, o, oc ? oc.tags.slice(0, 1) : []); } }, '♡ Save as an outfit'),
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () {
        ui.confirm({ title: 'Change outfit?', message: 'Today’s outfit will be removed from your history so you can pick another one.', okLabel: 'Change outfit' })
          .then(function (ok) {
            if (!ok) return;
            removeEntry(st.entryId || (data.history[0] && data.history[0].id));
            st.worn = false; st.outfit = null; st.acc = []; st.entryId = null; persist(); render();
          });
      } }, 'Change outfit')));
  }

  /* Supprime une entrée d'historique et recalcule le dernier port des pièces concernées. */
  function removeEntry(id) {
    var e = data.history.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    data.history = data.history.filter(function (x) { return x.id !== id; });
    (e.items || []).concat(e.acc || []).forEach(function (pid) {
      var x = item(pid); if (!x) return;
      if (x.worn) x.worn--;
      var prev = data.history.filter(function (h2) { return (h2.items || []).concat(h2.acc || []).indexOf(pid) > -1; })[0];
      x.lastWorn = prev ? prev.date : null;
    });
    var st = data.today;
    if (st && st.entryId === id) { st.worn = false; st.outfit = null; st.acc = []; st.entryId = null; }
  }

  /* Le soir : quelles pièces vont au linge ? Suggestion : haut (et sport) cochés, l'utilisateur décide. */
  function sortLaundry(st) {
    var pieces = st.outfit.concat(st.acc || []).map(item).filter(Boolean);
    var sport = occ(st.occasion) && occ(st.occasion).type === 'sport';
    var draft = {};
    pieces.forEach(function (x) { draft[x.id] = x.cat === 'top' || (sport && x.cat !== 'shoes' && x.cat !== 'outer' && x.cat !== 'acc'); });
    ui.sheet(function (close) {
      var wrap = h('div');
      function paint() {
        wrap.innerHTML = '';
        pieces.forEach(function (x) {
          wrap.appendChild(h('button', { class: 'wr-check' + (draft[x.id] ? ' is-on' : ''), type: 'button', role: 'checkbox', 'aria-checked': draft[x.id] ? 'true' : 'false',
            onclick: function () { draft[x.id] = !draft[x.id]; paint(); } },
            h('span', { class: 'wr-box', 'aria-hidden': 'true' }, draft[x.id] ? '✓' : ''), swatch(x.color), h('span', null, x.name)));
        });
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, 'What goes in the laundry?'),
        h('p', { class: 'sheet-text' }, 'Ticked items will be unavailable until you mark them clean.'),
        wrap,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            var n = 0;
            pieces.forEach(function (x) { if (draft[x.id]) { x.laundry = true; n++; } });
            persist(); close(); render();
            ui.toast(n ? n + ' item' + (n === 1 ? '' : 's') + ' in the laundry' : 'Nothing in the laundry');
          } }, 'Confirm'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))
      ];
    }, { modal: true });
  }

  /* ----- Historique (journal) ----- */
  function renderHistory() {
    var list = data.history.slice().sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    if (!list.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, '📓 No outfit logged yet.'),
        h('p', { class: 'muted' }, 'Tap “I wore this” on an outfit and it will appear here. Recent pieces are then suggested less often.')));
      return;
    }
    root.appendChild(h('p', { class: 'hint' }, list.length + ' outfit' + (list.length === 1 ? '' : 's') + ' logged. Pieces worn in the last 3 days are suggested less; pieces not worn for a week come first.'));
    var lastDay = null, journal = h('div', { class: 'wr-journal' });
    list.forEach(function (e) {
      var d = new Date(e.at);
      var dayKey = e.date || e.at.slice(0, 10);
      if (dayKey !== lastDay) {
        lastDay = dayKey;
        var ago = daysAgo(dayKey);
        journal.appendChild(h('h2', { class: 'section-title wr-journalday' },
          (ago === 0 ? 'Today · ' : ago === 1 ? 'Yesterday · ' : '') + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: ago > 300 ? 'numeric' : undefined })));
      }
      var oc = occ(e.occasion);
      var hasTime = !/T12:00:00$/.test(e.at);
      journal.appendChild(h('article', { class: 'wr-entry' },
        h('div', { class: 'wr-entryhead' },
          h('div', null,
            h('div', { class: 'wr-entryocc' }, oc ? oc.icon + ' ' + oc.label : 'Outfit'),
            h('div', { class: 'list-sub' }, (hasTime ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' : '') + weatherText(e.temp, e.cond))),
          h('button', { class: 'btn btn-icon', 'aria-label': 'Delete this entry', onclick: function () {
            ui.confirm({ title: 'Delete this entry?', message: 'It will be removed from your history; the clothes stay in your closet.', okLabel: 'Delete', danger: true })
              .then(function (ok) { if (!ok) return; removeEntry(e.id); persist(); render(); ui.toast('Entry deleted'); });
          } }, '🗑')),
        h('div', { class: 'wr-entrypieces' }, (e.pieces || []).map(function (p) {
          var live = item(p.id);
          return h('span', { class: 'wr-entrypiece' }, swatch(live ? live.color : p.color), live ? live.name : p.name);
        }))));
    });
    root.appendChild(journal);
  }

  /* ----- Tenues enregistrées ----- */
  function renderOutfits() {
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', 'All'], ['ready', 'Ready ✓']].concat(TAGS.map(function (t) { return [t.id, t.icon + ' ' + t.label]; })).map(function (f) {
        return h('button', { class: 'wr-pill' + (outfitFilter === f[0] ? ' is-active' : ''), onclick: function () { outfitFilter = f[0]; render(); } }, f[1]);
      })));
    var list = data.outfits.map(function (of) { return { of: of, st: outfitStatus(of) }; })
      .filter(function (x) {
        if (outfitFilter === 'all') return true;
        if (outfitFilter === 'ready') return x.st.ready;
        return x.of.occasions.indexOf(outfitFilter) > -1;
      })
      .sort(function (a, b) { return (b.st.ready - a.st.ready) || a.of.name.localeCompare(b.of.name); });
    var ready = data.outfits.filter(function (of) { return outfitStatus(of).ready; }).length;
    root.appendChild(h('p', { class: 'hint' }, data.outfits.length
      ? ready + ' of ' + data.outfits.length + ' outfit' + (data.outfits.length === 1 ? '' : 's') + ' ready to wear (nothing in the laundry).'
      : 'Save your favourite combinations here: you will see at a glance which ones are ready and where each piece is stored.'));
    var st = todayState();
    list.forEach(function (x) {
      root.appendChild(savedCard(x.of, x.st, { onWear: st.worn ? null : function () {
        if (!st.occasion) {
          var first = OCCASIONS.filter(function (o) { return x.of.occasions.indexOf(o.tags[0]) > -1; })[0];
          st.occasion = first ? first.id : null;
        }
        wear(st, x.st.o, []);
      } }));
    });
    if (data.outfits.length && !list.length) root.appendChild(h('p', { class: 'muted' }, 'No outfit matches this filter.'));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editOutfit(null); } }, '+ New outfit')));
    root.appendChild(colourGuide());
  }

  function editOutfit(of, prefill, tags) {
    var isNew = !of;
    var draft = {};
    CORE.forEach(function (c) {
      draft[c.id] = of ? (of.items[c.id] ? item(of.items[c.id]) || null : null) : (prefill && prefill[c.id]) || null;
    });
    var meta = { name: of ? of.name : '', occasions: of ? of.occasions.slice() : (tags || []).slice(), note: of ? of.note || '' : '' };
    if (isNew && !meta.name && draft.top && draft.bottom) meta.name = color(draft.top.color).label + ' & ' + color(draft.bottom.color).label.toLowerCase();
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var name = h('input', { class: 'input', type: 'text', value: meta.name, placeholder: 'e.g. Friday office look', 'aria-label': 'Outfit name', autocapitalize: 'sentences' });
      name.addEventListener('input', function () { meta.name = name.value; });
      var note = h('input', { class: 'input', type: 'text', value: meta.note, placeholder: 'e.g. Roll up the sleeves', 'aria-label': 'Note' });
      note.addEventListener('input', function () { meta.note = note.value; });
      var occWrap = h('div', { class: 'wr-filters wr-filters-wrap' });
      function paintOcc() {
        occWrap.innerHTML = '';
        TAGS.forEach(function (t) {
          var on = meta.occasions.indexOf(t.id) > -1;
          occWrap.appendChild(h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { if (on) meta.occasions = meta.occasions.filter(function (i) { return i !== t.id; }); else meta.occasions.push(t.id); paintOcc(); } },
            t.icon + ' ' + t.label));
        });
      }
      paintOcc();
      function save() {
        meta.name = meta.name.trim();
        if (!meta.name) { err.textContent = 'Give the outfit a name.'; err.hidden = false; return; }
        if (!draft.top || !draft.bottom || !draft.shoes) { err.textContent = 'Pick at least a top, a bottom and shoes.'; err.hidden = false; return; }
        if (!meta.occasions.length) { err.textContent = 'Pick at least one context.'; err.hidden = false; return; }
        var items = {};
        CORE.forEach(function (c) { items[c.id] = draft[c.id] ? draft[c.id].id : null; });
        var rec = { id: of ? of.id : ui.uid(), name: meta.name, occasions: meta.occasions, items: items, note: meta.note.trim() };
        if (isNew) data.outfits.push(rec); else data.outfits[data.outfits.indexOf(of)] = rec;
        persist(); close(); render(); ui.toast(isNew ? 'Outfit saved' : 'Outfit updated');
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New outfit' : 'Edit outfit'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Good for'), occWrap),
        h('p', { class: 'hint' }, 'All your clothes are listed, even those in the laundry (🧺).'),
        piecePicker(draft, false),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Note (optional)'), note),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Save the outfit' : 'Save changes'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            ui.confirm({ title: 'Delete “' + of.name + '”?', message: 'The outfit is removed; the clothes stay in your closet.', okLabel: 'Delete', danger: true })
              .then(function (ok) { if (!ok) return; data.outfits = data.outfits.filter(function (x) { return x.id !== of.id; }); persist(); close(); render(); });
          } }, 'Delete this outfit'))
      ];
    }, { modal: true });
  }

  /* Guide des couleurs (paires, trios, chaussures) consultable. */
  function colourGuide() {
    var d = h('details', { class: 'card wr-guide' }, h('summary', null, '🎨 Colour guide'));
    d.appendChild(h('p', { class: 'hint' }, 'The suggestions use these proven menswear combinations, filtered by your palette (My Style): neutrals as a base, light/dark contrast, and shoes matched to the trousers.'));
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Trios'));
    COMBOS.trios.forEach(function (t) {
      d.appendChild(h('div', { class: 'wr-guiderow' }, swatch(t[0]), swatch(t[1]), swatch(t[2]), h('span', null, t[3])));
    });
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Pairs'));
    COMBOS.pairs.forEach(function (p) {
      d.appendChild(h('div', { class: 'wr-guiderow' }, swatch(p[0]), swatch(p[1]), h('span', null, p[2])));
    });
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Shoes for each trouser colour'));
    Object.keys(COMBOS.shoes).forEach(function (b) {
      var r = COMBOS.shoes[b];
      d.appendChild(h('div', { class: 'wr-guiderow wr-guideshoes' }, swatch(b),
        h('span', null, h('strong', null, color(b).label + ': '),
          r.good.map(function (c) { return color(c).label.toLowerCase(); }).join(', '),
          r.avoid ? h('span', { class: 'muted' }, ' · avoid ' + r.avoid.map(function (c) { return color(c).label.toLowerCase(); }).join(', ')) : null)));
    });
    return d;
  }

  /* ----- My Style (lecture seule) ----- */
  function openStyle() {
    ui.sheet(function (close) {
      function rule(icon, title, body) {
        return h('div', { class: 'wr-dnarow' }, h('span', { class: 'wr-dnaicon', 'aria-hidden': 'true' }, icon),
          h('div', null, h('div', { class: 'wr-dnatitle' }, title), body));
      }
      function p(text) { return h('p', { class: 'list-sub' }, text); }
      return [
        h('h2', { class: 'sheet-title' }, 'My Style'),
        h('p', { class: 'sheet-text' }, 'Structured street smart with oversized tailoring influences. Effortless but intentional: no loud branding, no bright colours. Creativity comes from proportion, texture and tonal play.'),
        h('p', { class: 'note' }, 'These are guidelines, not rules. A great outfit that bends one beats a safe outfit that follows them all: look for ✦ Creative pick.'),
        h('div', { class: 'wr-dna' },
          rule('📐', 'Silhouette', h('div', null,
            p('Strong contrast: a fitted or structured top with wide, draped trousers or jeans. Both pieces can have volume when the look still feels intentional (e.g. tonal).'),
            p('Outerwear cropped or waist-length to keep the proportion; long coats worn open.'))),
          rule('🎨', 'Colour', h('div', null,
            h('div', { class: 'wr-dnaswatches' }, DNA.palette.map(function (c) {
              return h('span', { class: 'wr-dnaswatch' }, swatch(c, true), h('span', null, color(c).label));
            })),
            p('Tonal outfits work extremely well (all black, all cream, all brown, all grey); otherwise lean on shades of the same family. 2–3 colours look cleaner; a subtle extra colour in an accessory or a pattern adds personality.'))),
          rule('🧵', 'Pattern & texture', h('div', null,
            p('One statement piece with a subtle pattern: thin stripe, plaid, houndstooth, tonal pinstripe.'),
            p('Mix textures: leather over a plain tee, fleece over smooth trousers, a knit over a fitted shirt. One statement texture is usually enough.'))),
          rule('👞', 'Shoes', p('Tend to be dark and structured. A tendency, not a rule.')),
          rule('🌡️', 'Layering', h('div', null,
            p('Each layer visible and intentional: a base peeking at the collar or hem, a mid layer adding structure or texture, an outer layer completing the silhouette.'),
            h('ul', { class: 'wr-dnalist' },
              h('li', null, 'Above ' + DNA.baseOnlyAbove + ' °C: base layer is enough'),
              h('li', null, DNA.midLayerFrom + '–' + DNA.baseOnlyAbove + ' °C: a mid layer adds depth'),
              h('li', null, 'Below ' + DNA.outerBelow + ' °C: outerwear feels natural'),
              h('li', null, 'Below ' + DNA.outerStrongBelow + ' °C: outerwear is the right call')),
            p('Soft guidance: skipping layers on a warm day or adding more on a cool one is equally valid.'))),
          rule('⌚', 'Accessories', p('Subtle but present: a cap, a chain wallet, a necklace, a watch. One or two details (shown under each outfit) that finish the look without overpowering it.'))),
        h('p', { class: 'hint' }, 'Read-only for now.'),
        h('div', { class: 'sheet-actions' }, h('button', { class: 'btn btn-primary btn-block', onclick: function () { close(); } }, 'Close'))
      ];
    });
  }

  /* ----- Penderie ----- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function renderCloset() {
    if (!data.items.length) {
      root.appendChild(h('div', { class: 'card' },
        h('div', { class: 'card-title' }, 'Start your closet'),
        h('p', { class: 'sheet-text' }, 'Add your clothes one by one, or load a starter set of basics in your palette that you can then edit, delete or complete.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () { editItem(null); } }, '+ Add a piece of clothing'),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            ui.confirm({ title: 'Load the starter set?', message: '32 basic pieces (jackets, sweaters, shirts, trousers, shoes, accessories…) will be added. Edit or delete them to match your real closet.', okLabel: 'Load the starter set' })
              .then(function (ok) { if (!ok) return; data.items = data.items.concat(starter()); persist(); render(); ui.toast('Starter set added'); });
          } }, 'Load a starter set'))));
      return;
    }
    var search = h('input', { class: 'input wr-search', type: 'search', value: closetQuery, autocomplete: 'off', enterkeyhint: 'search',
      placeholder: 'Search name, colour, type, place…', 'aria-label': 'Search the closet' });
    var results = h('div');
    search.addEventListener('input', function () { closetQuery = search.value; paintCloset(results); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') search.blur(); });
    root.appendChild(h('div', { class: 'wr-searchwrap' }, search));
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', 'All'], ['clean', 'Clean'], ['laundry', '🧺 Laundry']].concat(TAGS.map(function (t) { return [t.id, t.icon + ' ' + t.label]; })).map(function (f) {
        return h('button', { class: 'wr-pill' + (closetFilter === f[0] ? ' is-active' : ''), onclick: function () { closetFilter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    paintCloset(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editItem(null); } }, '+ Add a piece of clothing')));
  }

  function paintCloset(box) {
    box.innerHTML = '';
    var tokens = norm(closetQuery).split(/\s+/).filter(Boolean);
    var shown = 0;
    var isTag = TAGS.some(function (t) { return t.id === closetFilter; });
    CATS.forEach(function (c) {
      var list = data.items.filter(function (x) {
        if (x.cat !== c.id) return false;
        if (closetFilter === 'clean' && x.laundry) return false;
        if (closetFilter === 'laundry' && !x.laundry) return false;
        if (isTag && x.occasions.indexOf(closetFilter) < 0) return false;
        if (!tokens.length) return true;
        var hs = norm([x.name, x.subtype, color(x.color).label, formality(x.formality).label, x.material, x.pattern, x.fit, x.brand, x.location, x.notes, c.label].join(' '));
        return tokens.every(function (t) { return hs.indexOf(t) > -1; });
      }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      shown += list.length;
      if (!list.length) { if (!tokens.length && closetFilter === 'all') { box.appendChild(h('h2', { class: 'section-title' }, c.label + ' · 0')); box.appendChild(h('p', { class: 'hint' }, 'None yet (' + c.hint.toLowerCase() + ').')); } return; }
      box.appendChild(h('h2', { class: 'section-title' }, c.label + ' · ' + list.length));
      box.appendChild(h('div', { class: 'list' }, list.map(itemRow)));
    });
    if (!shown && (tokens.length || closetFilter !== 'all')) box.appendChild(h('p', { class: 'muted wr-noresult' }, 'Nothing matches.'));
  }

  function itemRow(x) {
    var sub = [x.subtype, color(x.color).label, x.cat !== 'acc' && x.cat !== 'shoes' && x.fit !== 'regular' ? (x.fit === 'slim' ? 'Slim' : 'Wide') : null,
      x.cat !== 'acc' ? formality(x.formality).label : null].filter(Boolean).join(' · ');
    return h('button', { class: 'list-row list-row-btn wr-row' + (x.laundry ? ' is-dirty' : ''), onclick: function () { editItem(x); } },
      swatch(x.color, true),
      h('div', { class: 'wr-rowmain' },
        h('div', { class: 'list-title' }, x.name),
        h('div', { class: 'list-sub' }, sub),
        h('div', { class: 'list-sub' }, x.occasions.map(function (id) { return tag(id).icon; }).join(' ') + (x.rainOk ? ' · ☔' : '') + (x.location ? ' · 📍 ' + x.location : ''))),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, 'Laundry') : h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function editItem(x) {
    var isNew = !x;
    var draft = x ? JSON.parse(JSON.stringify(x)) : complete({ id: ui.uid(), name: '', cat: 'top', color: 'navy', warmth: 1, occasions: ['chill'], rainOk: false, laundry: false, lastWorn: null, worn: 0, subtype: null, material: null, fit: 'regular' });
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      function textInput(label, key, ph) {
        var inp = h('input', { class: 'input', type: 'text', value: draft[key] || '', placeholder: ph, 'aria-label': label, autocapitalize: 'sentences' });
        inp.addEventListener('input', function () { draft[key] = inp.value; });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      var body = h('div');
      function seg(options, key, after) {
        return h('div', { class: 'segmented small wr-seg' }, options.map(function (o) {
          return h('button', { class: 'seg' + (draft[key] === o[0] ? ' is-active' : ''), type: 'button',
            onclick: function () { draft[key] = o[0]; if (after) after(); paint(); } }, o[1]);
        }));
      }
      function pills(options, key) {
        return h('div', { class: 'wr-filters wr-filters-wrap' }, options.map(function (o) {
          var on = draft[key] === o;
          return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { draft[key] = on ? null : o; paint(); } }, o);
        }));
      }
      function toggleRow(label, key) {
        return h('button', { class: 'wr-rain' + (draft[key] ? ' is-active' : ''), type: 'button', role: 'switch', 'aria-checked': draft[key] ? 'true' : 'false',
          onclick: function () { draft[key] = !draft[key]; paint(); } }, h('span', null, label), h('span', { class: 'wr-toggle', 'aria-hidden': 'true' }));
      }
      function paint() {
        var isAcc = draft.cat === 'acc';
        body.innerHTML = '';
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Type'),
          seg(CATS.map(function (c) { return [c.id, c.id === 'top' ? 'Top' : c.label]; }), 'cat', function () {
            if (draft.subtype && cat(draft.cat).subtypes.indexOf(draft.subtype) < 0) draft.subtype = null;
          })));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, isAcc ? 'Kind' : 'Kind (optional)'), pills(cat(draft.cat).subtypes, 'subtype')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Colour · ' + color(draft.color).label + (inPalette(draft.color) ? '' : ' (outside your palette)')),
          h('div', { class: 'wr-colors' }, COLORS.map(function (c) {
            return h('button', { class: 'wr-color' + (draft.color === c.id ? ' is-active' : ''), type: 'button', 'aria-label': c.label,
              'aria-pressed': draft.color === c.id ? 'true' : 'false', style: { background: c.hex }, onclick: function () { draft.color = c.id; paint(); } });
          }))));
        if (!isAcc && draft.cat !== 'shoes') body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Fit'), seg(FITS, 'fit')));
        if (draft.cat === 'outer') {
          if (!draft.length) draft.length = 'hip';
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Length'), seg(LENGTHS, 'length')));
        }
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Pattern'), seg(PATTERNS, 'pattern')));
        if (!isAcc) body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Style'), seg(FORMALITY.map(function (f) { return [f.id, f.label]; }), 'formality')));
        if (!isAcc) body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Warmth'),
          seg([[1, 'Light'], [2, 'Medium'], [3, 'Warm']], 'warmth')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Material (optional)'), pills(MATERIALS, 'material')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Good for'),
          h('div', { class: 'wr-filters wr-filters-wrap' }, TAGS.map(function (t) {
            var on = draft.occasions.indexOf(t.id) > -1;
            return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () { if (on) draft.occasions = draft.occasions.filter(function (i) { return i !== t.id; }); else draft.occasions.push(t.id); paint(); } },
              t.icon + ' ' + t.label);
          }))));
        if (draft.cat === 'outer' || draft.cat === 'shoes') body.appendChild(toggleRow('☔ OK in the rain', 'rainOk'));
        body.appendChild(toggleRow('🧺 In the laundry (not available)', 'laundry'));
      }
      paint();
      var name = h('input', { class: 'input', type: 'text', value: draft.name, placeholder: 'e.g. Navy Oxford shirt', 'aria-label': 'Name', autocapitalize: 'sentences' });
      name.addEventListener('input', function () { draft.name = name.value; });
      function save() {
        draft.name = draft.name.trim();
        var fail = !draft.name ? 'Give it a name.' : !draft.occasions.length ? 'Pick at least one context in “Good for”.'
          : draft.cat === 'acc' && !draft.subtype ? 'Pick the kind of accessory (cap, scarf, watch…).' : null;
        if (fail) { err.textContent = fail; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
        if (draft.cat !== 'outer' && draft.cat !== 'shoes') draft.rainOk = false;
        ['location', 'brand', 'notes'].forEach(function (k) { draft[k] = (draft[k] || '').trim(); });
        if (isNew) data.items.push(draft);
        else {
          data.items[data.items.indexOf(x)] = draft;
          if (draft.cat !== x.cat) data.outfits.forEach(function (of) { if (of.items[x.cat] === x.id) of.items[x.cat] = null; });
        }
        persist(); close(); render(); ui.toast(isNew ? 'Added to your closet' : 'Saved');
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New piece' : 'Edit piece'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        body,
        textInput('Where is it stored? (optional)', 'location', 'e.g. Wardrobe left, 2nd shelf'),
        textInput('Brand (optional)', 'brand', 'e.g. Uniqlo'),
        textInput('Notes (optional)', 'notes', 'e.g. Iron before wearing'),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Add to closet' : 'Save'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            var used = data.outfits.filter(function (of) { return of.items[x.cat] === x.id; });
            ui.confirm({ title: 'Delete “' + x.name + '”?', message: 'It will be removed from your closet' + (used.length ? ' and from ' + used.length + ' saved outfit' + (used.length === 1 ? '' : 's') : '') + '. Your history keeps its name.', okLabel: 'Delete', danger: true })
              .then(function (ok) {
                if (!ok) return;
                data.items = data.items.filter(function (i) { return i.id !== x.id; });
                used.forEach(function (of) { of.items[x.cat] = null; });
                persist(); close(); render();
              });
          } }, 'Delete'))
      ];
    }, { modal: true });
  }

  /* ----- Linge ----- */
  function renderLaundry() {
    var list = data.items.filter(function (x) { return x.laundry; });
    if (!list.length) {
      root.appendChild(h('div', { class: 'empty-state small' }, h('p', null, '🧺 Nothing in the laundry. Everything is ready to wear.')));
      return;
    }
    root.appendChild(h('p', { class: 'hint' }, list.length + ' item' + (list.length === 1 ? '' : 's') + ' not available. Tap “Clean” when an item is washed and dry.'));
    root.appendChild(h('div', { class: 'list' }, list.map(function (x) {
      return h('div', { class: 'list-row wr-row' }, swatch(x.color, true),
        h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, x.name), h('div', { class: 'list-sub' }, catLabel(x.cat) + ' · ' + color(x.color).label)),
        h('button', { class: 'btn btn-secondary btn-sm', onclick: function () { x.laundry = false; persist(); render(); ui.toast(x.name + ' is clean'); } }, 'Clean ✓'));
    })));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        ui.confirm({ title: 'Everything is clean?', message: 'All ' + list.length + ' items will be available again.', okLabel: 'Mark all clean' })
          .then(function (ok) { if (!ok) return; list.forEach(function (x) { x.laundry = false; }); persist(); render(); ui.toast('All clean'); });
      } }, 'Laundry done: all clean')));
  }

  S2.app.registerTab({ id: 'garde-robe', label: 'Wardrobe', order: 20, icon: ICON, mount: mount });
  /* Exposé pour Réglages (« My Style ») et pour les tests. */
  S2.wardrobe = { score: score, openStyle: openStyle, occasions: OCCASIONS, dna: DNA };
})();
