/* Onglet Wardrobe : vêtements, tenues enregistrées, linge sale, et proposition de tenue
   selon la météo et l'occasion. La météo est choisie à la main (pas de récupération automatique, cf. CLAUDE.md).
   Règles de couleurs : js/tabs/garde-robe-combos.js. Données : localStorage "sandeep2:garde-robe". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  var NS = 'garde-robe';
  var SCHEMA = 2;
  var COMBOS = S2.wardrobeCombos || { pairs: [], trios: [], shoes: {} };

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a2 2 0 1 1 2-2M12 6v2l8.5 6.5a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 8"/></svg>';

  /* Ordre = du haut du corps vers les pieds, tel qu'affiché dans une tenue. */
  var CATS = [
    { id: 'outer', label: 'Outerwear', hint: 'Jacket, coat',
      subtypes: ['Jacket', 'Coat', 'Blazer', 'Bomber', 'Rain jacket', 'Puffer', 'Leather jacket', 'Denim jacket', 'Trench coat'] },
    { id: 'layer', label: 'Mid layer', hint: 'Sweater, hoodie, overshirt',
      subtypes: ['Sweater', 'Cardigan', 'Hoodie', 'Sweatshirt', 'Overshirt', 'Zip-up', 'Vest', 'Turtleneck'] },
    { id: 'top', label: 'Top', hint: 'T-shirt, shirt, polo',
      subtypes: ['T-shirt', 'Shirt', 'Oxford shirt', 'Polo', 'Long-sleeve', 'Henley', 'Tank top', 'Sport top'] },
    { id: 'bottom', label: 'Bottom', hint: 'Jeans, chinos, shorts',
      subtypes: ['Jeans', 'Chinos', 'Trousers', 'Cargo pants', 'Joggers', 'Shorts', 'Sport shorts'] },
    { id: 'shoes', label: 'Shoes', hint: 'Sneakers, boots',
      subtypes: ['Sneakers', 'Leather shoes', 'Loafers', 'Boots', 'Chelsea boots', 'Running shoes', 'Sandals', 'Slides'] }
  ];
  var OCCASIONS = [
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'gym', label: 'Gym', icon: '🏋️' },
    { id: 'club', label: 'Clubbing', icon: '🪩' },
    { id: 'date', label: 'Date', icon: '🌹' },
    { id: 'chill', label: 'Chilling out', icon: '☕' }
  ];
  var TEMPS = [
    { id: 'cold', label: 'Cold', sub: '< 10 °C' },
    { id: 'cool', label: 'Cool', sub: '10–17 °C' },
    { id: 'mild', label: 'Mild', sub: '18–24 °C' },
    { id: 'hot', label: 'Hot', sub: '25 °C +' }
  ];
  var WARMTH = { 1: 'Light', 2: 'Medium', 3: 'Warm' };
  var FORMALITY = [
    { id: 'sport', label: 'Sport', lvl: 0 },
    { id: 'casual', label: 'Casual', lvl: 1 },
    { id: 'smart', label: 'Smart casual', lvl: 2 },
    { id: 'formal', label: 'Formal', lvl: 3 }
  ];
  /* Niveau de formalité idéal / à éviter par occasion. */
  var OCC_FORMALITY = {
    work: { ideal: [2, 3], bad: [0] },
    gym: { ideal: [0], bad: [2, 3] },
    club: { ideal: [2, 1], bad: [0] },
    date: { ideal: [2], bad: [0] },
    chill: { ideal: [1, 0], bad: [3] }
  };
  var PATTERNS = [['solid', 'Solid'], ['stripes', 'Stripes'], ['check', 'Check'], ['print', 'Print'], ['texture', 'Texture']];
  var MATERIALS = ['Cotton', 'Linen', 'Wool', 'Knit', 'Denim', 'Leather', 'Suede', 'Technical', 'Synthetic'];

  /* Couleurs : les neutres vont avec tout ; les couleurs « accent » se limitent à une par tenue. */
  var COLORS = [
    { id: 'black', label: 'Black', hex: '#1E1E1E', neutral: true, dark: true },
    { id: 'charcoal', label: 'Charcoal', hex: '#45464A', neutral: true, dark: true },
    { id: 'grey', label: 'Grey', hex: '#9A9A9A', neutral: true },
    { id: 'white', label: 'White', hex: '#F7F5F0', neutral: true, light: true },
    { id: 'cream', label: 'Cream', hex: '#EDE3CF', neutral: true, light: true },
    { id: 'beige', label: 'Beige', hex: '#D6C3A1', neutral: true, light: true },
    { id: 'camel', label: 'Camel', hex: '#B8895A', neutral: true },
    { id: 'brown', label: 'Brown', hex: '#5C3D2E', neutral: true, dark: true },
    { id: 'navy', label: 'Navy', hex: '#1F2A44', neutral: true, dark: true },
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
  /* Paires d'accents qui fonctionnent ensemble (complémentaires classiques). */
  var ACCENT_PAIRS = [['burgundy', 'green'], ['orange', 'teal'], ['yellow', 'purple'], ['pink', 'green'], ['red', 'teal']];

  function color(id) { return COLORS.filter(function (c) { return c.id === id; })[0] || COLORS[2]; }
  function cat(id) { return CATS.filter(function (c) { return c.id === id; })[0]; }
  function catLabel(id) { return cat(id).label; }
  function occ(id) { return OCCASIONS.filter(function (o) { return o.id === id; })[0]; }
  function formality(id) { return FORMALITY.filter(function (f) { return f.id === id; })[0] || FORMALITY[1]; }
  function value(c) { return c.light ? 'light' : c.dark ? 'dark' : 'mid'; }

  /* ---------- Dates ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return keyOf(new Date()); }
  function daysAgo(k) {
    if (!k) return Infinity;
    var p = k.split('-');
    return Math.round((new Date(new Date().toDateString()) - new Date(+p[0], +p[1] - 1, +p[2])) / 86400000);
  }

  /* ---------- Données ---------- */
  /* Complète une pièce avec les nouveaux champs (migration douce des anciennes données). */
  function complete(x) {
    var n = (x.name || '').toLowerCase();
    if (!x.formality) {
      x.formality = x.occasions && x.occasions.length === 1 && x.occasions[0] === 'gym' ? 'sport'
        : x.occasions && x.occasions.indexOf('work') > -1 ? 'smart' : 'casual';
    }
    if (!x.pattern) x.pattern = 'solid';
    if (x.material === undefined) {
      x.material = /denim|jeans/.test(n) ? 'Denim' : /linen/.test(n) ? 'Linen' : /suede/.test(n) ? 'Suede'
        : /leather|chelsea/.test(n) ? 'Leather' : /wool|coat/.test(n) ? 'Wool' : /knit|sweater/.test(n) ? 'Knit'
        : /training|running|sport/.test(n) ? 'Technical' : null;
    }
    if (x.subtype === undefined) {
      var subs = (cat(x.cat) || CATS[2]).subtypes.slice().sort(function (a, b) { return b.length - a.length; });
      x.subtype = subs.filter(function (s) { return n.indexOf(s.toLowerCase().replace(/s$/, '')) > -1; })[0] || null;
    }
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
    if (d.today && d.today.date !== today()) d.today = null; /* nouvelle journée : on repart de zéro */
    d.schema = SCHEMA;
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function item(id) { return data.items.filter(function (x) { return x.id === id; })[0]; }
  function clean(c, occasion) {
    return data.items.filter(function (x) { return x.cat === c && !x.laundry && x.occasions.indexOf(occasion) > -1; });
  }
  function todayState() {
    if (!data.today) data.today = { date: today(), temp: null, rain: false, occasion: null, outfit: null, worn: false };
    return data.today;
  }

  function starter() {
    function it(name, c, col, warmth, occasions, rainOk) {
      return complete({ id: ui.uid(), name: name, cat: c, color: col, warmth: warmth, occasions: occasions, rainOk: !!rainOk, laundry: false, lastWorn: null, worn: 0 });
    }
    return [
      it('Navy rain jacket', 'outer', 'navy', 1, ['work', 'gym', 'chill'], true),
      it('Camel wool coat', 'outer', 'camel', 3, ['work', 'date', 'club']),
      it('Black bomber jacket', 'outer', 'black', 2, ['club', 'date', 'chill']),
      it('Grey crewneck sweater', 'layer', 'grey', 2, ['work', 'date', 'chill']),
      it('Navy knit sweater', 'layer', 'navy', 2, ['work', 'date', 'chill']),
      it('Black hoodie', 'layer', 'black', 2, ['gym', 'chill']),
      it('White T-shirt', 'top', 'white', 1, ['chill', 'date']),
      it('Black T-shirt', 'top', 'black', 1, ['club', 'chill', 'date']),
      it('White Oxford shirt', 'top', 'white', 1, ['work', 'date']),
      it('Light blue shirt', 'top', 'lightblue', 1, ['work', 'date']),
      it('Black shirt', 'top', 'black', 1, ['club', 'date']),
      it('Burgundy polo', 'top', 'burgundy', 1, ['chill', 'date', 'work']),
      it('Grey training T-shirt', 'top', 'grey', 1, ['gym']),
      it('Dark denim jeans', 'bottom', 'denim', 2, ['chill', 'date', 'club']),
      it('Black jeans', 'bottom', 'black', 2, ['club', 'date', 'chill']),
      it('Beige chinos', 'bottom', 'beige', 2, ['work', 'date', 'chill']),
      it('Navy chinos', 'bottom', 'navy', 2, ['work', 'date']),
      it('Navy shorts', 'bottom', 'navy', 1, ['chill']),
      it('Black training shorts', 'bottom', 'black', 1, ['gym']),
      it('White leather sneakers', 'shoes', 'white', 1, ['chill', 'date', 'work']),
      it('Brown leather shoes', 'shoes', 'brown', 2, ['work', 'date']),
      it('Black Chelsea boots', 'shoes', 'black', 2, ['club', 'date', 'work'], true),
      it('Running shoes', 'shoes', 'grey', 1, ['gym'], true)
    ];
  }

  /* ---------- Moteur de tenue ---------- */
  function isPair(a, b) {
    return ACCENT_PAIRS.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); });
  }
  function hasPair(a, b) {
    return COMBOS.pairs.filter(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); })[0];
  }

  /* Note une tenue { outer, layer, top, bottom, shoes } et explique pourquoi. null = tenue impossible. */
  function score(o, ctx) {
    var s = 100, why = [];
    var parts = CATS.map(function (c) { return o[c.id]; }).filter(Boolean);
    var t = ctx.temp, wear = parts.filter(function (x) { return x.cat !== 'shoes'; });

    /* Météo : couches nécessaires */
    if (t === 'hot') {
      if (o.outer && !(ctx.rain && o.outer.rainOk && o.outer.warmth === 1)) return null;
      if (o.layer) return null;
      if (o.top.warmth > 1) s -= 15;
      if (o.bottom.warmth === 1) { s += 6; why.push('Light pieces for the heat'); }
    } else if (t === 'mild') {
      if (o.outer && o.outer.warmth > 1) return null;
      if (o.outer && !ctx.rain) s -= 12;
      if (o.layer && o.layer.warmth > 2) s -= 8;
      if (o.bottom.warmth === 1 && ctx.occasion !== 'gym') s -= 4;
    } else if (t === 'cool') {
      if (!o.layer && !o.outer) return null;
      if (o.outer && o.outer.warmth === 3) s -= 10;
      if (o.bottom.warmth === 1 && ctx.occasion !== 'gym') s -= 25;
      why.push(o.layer && o.outer ? 'Two layers for the cool air' : 'A layer for the cool air');
    } else if (t === 'cold') {
      if (!o.outer || o.outer.warmth < 2) return null;
      if (o.bottom.warmth === 1) return null;
      if (o.outer.warmth === 3) { s += 8; why.push('Warm coat for the cold'); }
      if (o.layer) s += 6; else s -= 10;
    }
    if (ctx.rain) {
      if (t !== 'hot' && !o.outer) s -= 10;
      if (o.outer && o.outer.rainOk) { s += 10; why.push('Rain-proof jacket'); }
      else if (o.outer) s -= 8;
      if (o.shoes.rainOk) s += 4; else s -= 6;
      if (o.shoes.material === 'Suede') s -= 12;
      if (o.outer && o.outer.material === 'Suede') s -= 8;
    }

    /* Matières selon la météo */
    var linen = wear.filter(function (x) { return x.material === 'Linen'; }).length;
    var wool = wear.filter(function (x) { return x.material === 'Wool' || x.material === 'Knit'; }).length;
    if (t === 'hot') { s += linen * 5 - wool * 8; if (linen) why.push('Linen breathes in the heat'); }
    if (t === 'cold' && wool) { s += Math.min(wool, 2) * 3; why.push('Wool keeps you warm'); }

    /* Occasion : coupe et formalité */
    if (ctx.occasion === 'work' && o.bottom.warmth === 1) s -= 30;
    if (ctx.occasion === 'date' && o.bottom.warmth === 1) s -= 10;
    var pref = OCC_FORMALITY[ctx.occasion];
    var lvls = parts.map(function (x) { return formality(x.formality).lvl; });
    if (pref) {
      var fit = 0;
      parts.forEach(function (x) {
        var l = formality(x.formality).lvl;
        if (pref.bad.indexOf(l) > -1) s -= (ctx.occasion === 'gym' && x.cat !== 'outer' && x.cat !== 'layer') ? 30 : 15;
        else if (pref.ideal.indexOf(l) > -1) fit++;
      });
      s += Math.min(fit, 4) * 2;
      if (fit === parts.length && ctx.occasion !== 'gym') why.push('Right dress code for ' + occ(ctx.occasion).label.toLowerCase());
    }
    var spread = Math.max.apply(null, lvls) - Math.min.apply(null, lvls);
    if (spread >= 3) s -= 10; else if (spread === 2) s -= 3;

    /* Motifs : un seul motif marqué par tenue */
    var patterned = parts.filter(function (x) { return ['stripes', 'check', 'print'].indexOf(x.pattern) > -1; }).length;
    if (patterned > 1) s -= 12;
    else if (patterned === 1) { s += 2; why.push('One patterned piece, the rest plain'); }

    /* Couleurs : accents */
    var accents = [];
    parts.forEach(function (x) { if (!color(x.color).neutral && accents.indexOf(x.color) < 0) accents.push(x.color); });
    if (accents.length === 1) { s += 8; why.push('One accent colour (' + color(accents[0]).label.toLowerCase() + ') over neutrals'); }
    else if (accents.length === 2 && isPair(accents[0], accents[1])) { s += 2; why.push(color(accents[0]).label + ' & ' + color(accents[1]).label.toLowerCase() + ' complement each other'); }
    else if (accents.length === 2) s -= 22;
    else if (accents.length > 2) s -= 50;
    if (ctx.occasion === 'work') s -= accents.length * 4;

    /* Couleurs : paires et trios éprouvés */
    var cols = [];
    wear.forEach(function (x) { if (cols.indexOf(x.color) < 0) cols.push(x.color); });
    var found = [];
    for (var i = 0; i < cols.length; i++) for (var j = i + 1; j < cols.length; j++) {
      var p = hasPair(cols[i], cols[j]); if (p) found.push(p[2]);
    }
    s += Math.min(found.length, 2) * 4;
    var allCols = cols.concat([o.shoes.color]);
    var trio = COMBOS.trios.filter(function (tr) { return allCols.indexOf(tr[0]) > -1 && allCols.indexOf(tr[1]) > -1 && allCols.indexOf(tr[2]) > -1; })[0];
    if (trio) { s += 6; why.push(trio[3]); }
    else if (found.length) why.push(found[0]);
    if (!accents.length && !found.length && !trio) why.push('Neutral palette: always works');

    /* Haut / bas : contraste */
    var tc = color(o.top.color), bc = color(o.bottom.color), sc = color(o.shoes.color);
    if (o.top.color === o.bottom.color) {
      if (o.top.color === 'black' && ctx.occasion === 'club') { s += 4; why.push('All black: sharp for a night out'); }
      else if (o.top.color === 'denim') s -= 25;
      else s -= 10;
    } else if ((tc.light && bc.dark) || (tc.dark && bc.light)) {
      s += 6;
      if ((tc.light && bc.dark && sc.light) || (tc.dark && bc.light && sc.dark)) { s += 3; why.push('Light–dark balance from top to shoes'); }
    } else if (tc.light && bc.light) s -= 4;
    if (value(tc) === value(bc) && value(bc) === value(sc) && !(o.top.color === 'black' && ctx.occasion === 'club')) s -= 4;
    if (o.layer && o.outer && o.layer.color === o.outer.color) s -= 4;
    if (ctx.occasion === 'club' && tc.dark) s += 5;
    if (ctx.occasion === 'date' && accents.length === 1) s += 3;

    /* Chaussures selon la couleur du bas */
    var rule = COMBOS.shoes[o.bottom.color];
    if (rule) {
      if (rule.good && rule.good.indexOf(o.shoes.color) > -1) { s += 5; why.push(sc.label + ' shoes suit ' + bc.label.toLowerCase() + ' ' + (o.bottom.subtype || 'trousers').toLowerCase()); }
      else if (rule.avoid && rule.avoid.indexOf(o.shoes.color) > -1) s -= 10;
    }

    /* Rotation : éviter ce qui a été porté hier ou avant-hier */
    var recent = 0;
    parts.forEach(function (x) { var d = daysAgo(x.lastWorn); if (d <= 1) recent += x.cat === 'shoes' || x.cat === 'outer' ? 2 : 10; else if (d <= 2) recent += 4; });
    s -= recent;

    return { score: s, why: why };
  }

  function candidates(ctx) {
    var tops = clean('top', ctx.occasion), bottoms = clean('bottom', ctx.occasion), shoes = clean('shoes', ctx.occasion);
    var layers = [null].concat(clean('layer', ctx.occasion)), outers = [null].concat(clean('outer', ctx.occasion));
    var out = [];
    tops.forEach(function (top) { bottoms.forEach(function (bottom) { shoes.forEach(function (sh) {
      layers.forEach(function (layer) { outers.forEach(function (outer) {
        var o = { outer: outer, layer: layer, top: top, bottom: bottom, shoes: sh };
        var r = score(o, ctx);
        if (r) out.push({ o: o, score: r.score, why: r.why });
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
    var need = ['top', 'bottom', 'shoes'];
    if (ctx.temp === 'cold') need.push('outer');
    var out = [];
    need.forEach(function (c) {
      if (clean(c, ctx.occasion).length) return;
      var dirty = data.items.filter(function (x) { return x.cat === c && x.laundry && x.occasions.indexOf(ctx.occasion) > -1; }).length;
      out.push(catLabel(c) + (dirty ? ' (' + dirty + ' in the laundry)' : ''));
    });
    return out;
  }

  /* ---------- Tenues enregistrées ---------- */
  function outfitPieces(of) {
    var o = {};
    CATS.forEach(function (c) { var id = of.items[c.id]; var x = id ? item(id) : null; if (x) o[c.id] = x; });
    return o;
  }
  function outfitStatus(of) {
    var o = outfitPieces(of);
    var dirty = CATS.map(function (c) { return o[c.id]; }).filter(function (x) { return x && x.laundry; });
    var full = !!(o.top && o.bottom && o.shoes);
    return { o: o, dirty: dirty, ready: full && !dirty.length, complete: full };
  }

  /* ---------- Interface ---------- */
  var view = 'today'; // today | outfits | closet | laundry
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
      [['today', 'Today'], ['outfits', 'Outfits'], ['closet', 'Closet'], ['laundry', 'Laundry' + (dirty ? ' ' + dirty : '')]].map(function (v) {
        return h('button', { class: 'seg' + (view === v[0] ? ' is-active' : ''), onclick: function () { view = v[0]; render(); window.scrollTo(0, 0); } }, v[1]);
      })));
    if (view === 'closet') renderCloset();
    else if (view === 'outfits') renderOutfits();
    else if (view === 'laundry') renderLaundry();
    else renderToday();
  }

  function swatch(col, big) {
    return h('span', { class: 'wr-swatch' + (big ? ' is-big' : ''), style: { background: color(col).hex }, 'aria-hidden': 'true' });
  }
  function pieceSub(x, c) {
    return [x.subtype || c.label, color(x.color).label].join(' · ');
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

    root.appendChild(h('h2', { class: 'section-title' }, 'Weather today'));
    root.appendChild(h('div', { class: 'wr-temps' }, TEMPS.map(function (t) {
      return h('button', { class: 'wr-chip' + (st.temp === t.id ? ' is-active' : ''), 'aria-pressed': st.temp === t.id ? 'true' : 'false',
        onclick: function () { st.temp = t.id; pick = 0; persist(); render(); } },
        h('span', { class: 'wr-chiplabel' }, t.label), h('span', { class: 'wr-chipsub' }, t.sub));
    })));
    root.appendChild(h('button', { class: 'wr-rain' + (st.rain ? ' is-active' : ''), role: 'switch', 'aria-checked': st.rain ? 'true' : 'false',
      onclick: function () { st.rain = !st.rain; pick = 0; persist(); render(); } },
      h('span', null, '☔ Rain expected'), h('span', { class: 'wr-toggle', 'aria-hidden': 'true' })));
    root.appendChild(h('p', { class: 'hint' }, 'Check your weather app, then pick here.'));

    root.appendChild(h('h2', { class: 'section-title' }, 'Where are you going?'));
    root.appendChild(h('div', { class: 'wr-occs' }, OCCASIONS.map(function (o) {
      return h('button', { class: 'wr-chip wr-occ' + (st.occasion === o.id ? ' is-active' : ''), 'aria-pressed': st.occasion === o.id ? 'true' : 'false',
        onclick: function () { st.occasion = o.id; pick = 0; persist(); render(); } },
        h('span', { class: 'wr-occicon', 'aria-hidden': 'true' }, o.icon), h('span', { class: 'wr-chiplabel' }, o.label));
    })));

    if (!st.temp || !st.occasion) {
      root.appendChild(h('p', { class: 'note' }, 'Pick the weather and the occasion to get an outfit.'));
      return;
    }
    var ctx = { temp: st.temp, rain: st.rain, occasion: st.occasion };

    /* Tenues enregistrées prêtes pour cette occasion */
    var mine = data.outfits.filter(function (of) { return of.occasions.indexOf(st.occasion) > -1; })
      .map(function (of) { var stt = outfitStatus(of); return { of: of, st: stt, fit: stt.ready ? score(stt.o, ctx) : null }; })
      .filter(function (x) { return x.st.ready; })
      .sort(function (a, b) { return (b.fit ? b.fit.score : -999) - (a.fit ? a.fit.score : -999); });
    if (mine.length) {
      root.appendChild(h('h2', { class: 'section-title' }, 'Your outfits ready for ' + occ(st.occasion).label.toLowerCase()));
      mine.slice(0, 3).forEach(function (x) {
        root.appendChild(savedCard(x.of, x.st, {
          weatherNote: x.fit ? null : 'Not ideal for this weather',
          onWear: function () { wear(st, x.st.o); }
        }));
      });
    }

    var list = candidates(ctx);
    if (!list.length) {
      var miss = missing(ctx);
      root.appendChild(h('div', { class: 'card wr-none' },
        h('div', { class: 'card-title' }, 'No complete outfit available'),
        h('p', { class: 'sheet-text' }, miss.length
          ? 'Missing clean pieces for ' + occ(st.occasion).label.toLowerCase() + ': ' + miss.join(', ') + '.'
          : 'Nothing fits this weather with the clean clothes you have (e.g. a warm enough jacket, or pieces light enough for the heat).'),
        h('p', { class: 'hint' }, 'Tag more clothes with this occasion in the Closet, or mark some laundry as clean.')));
      return;
    }
    if (pick >= list.length) pick = 0;
    var c = list[pick];
    root.appendChild(h('h2', { class: 'section-title' }, 'Suggested outfit · ' + (pick + 1) + ' of ' + list.length));
    root.appendChild(outfitCard(c.o, c.why));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { wear(st, c.o); } }, 'Wear this ✓'),
      list.length > 1 ? h('button', { class: 'btn btn-secondary btn-block', onclick: function () { pick = (pick + 1) % list.length; render(); } }, '↻ Show another one') : null,
      h('div', { class: 'wr-twobtn' },
        h('button', { class: 'btn btn-ghost', onclick: function () { compose(st, c.o); } }, 'Swap a piece'),
        h('button', { class: 'btn btn-ghost', onclick: function () { editOutfit(null, c.o, [st.occasion]); } }, '♡ Save outfit'))));
  }

  function pieceLine(x, c) {
    return h('div', { class: 'wr-piece' + (x.laundry ? ' is-dirty' : '') }, swatch(x.color, true),
      h('div', { class: 'wr-piecemain' },
        h('div', { class: 'wr-piecename' }, x.name),
        h('div', { class: 'list-sub' }, pieceSub(x, c)),
        x.location ? h('div', { class: 'wr-loc' }, '📍 ' + x.location) : null),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, '🧺 Laundry') : null);
  }

  function outfitCard(o, why) {
    var card = h('div', { class: 'card wr-outfit' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CATS.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    CATS.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id], c)); });
    if (why && why.length) card.appendChild(h('ul', { class: 'wr-why' }, why.slice(0, 4).map(function (w) { return h('li', null, w); })));
    return card;
  }

  function savedCard(of, stt, opts) {
    opts = opts || {};
    var o = stt.o;
    var card = h('div', { class: 'card wr-outfit wr-saved' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CATS.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    card.appendChild(h('div', { class: 'wr-savedhead' },
      h('div', null,
        h('div', { class: 'wr-savedname' }, of.name),
        h('div', { class: 'list-sub' }, of.occasions.map(function (id) { return occ(id).icon + ' ' + occ(id).label; }).join(' · '))),
      stt.ready ? h('span', { class: 'badge wr-readybadge' }, 'Ready ✓')
        : !stt.complete ? h('span', { class: 'badge wr-dirtybadge' }, 'Incomplete')
        : h('span', { class: 'badge wr-dirtybadge' }, stt.dirty.length + ' in laundry')));
    if (opts.weatherNote) card.appendChild(h('p', { class: 'wr-weathernote' }, '⚠︎ ' + opts.weatherNote));
    CATS.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id], c)); });
    if (of.note) card.appendChild(h('p', { class: 'hint wr-savednote' }, of.note));
    card.appendChild(h('div', { class: 'wr-savedbtns' },
      stt.ready && opts.onWear ? h('button', { class: 'btn btn-primary btn-sm', onclick: opts.onWear }, 'Wear this ✓') : null,
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editOutfit(of); } }, 'Edit')));
    return card;
  }

  /* Choisir soi-même une pièce par catégorie. */
  function piecePicker(draft, onlyClean, onChange) {
    var wrap = h('div');
    function paint() {
      wrap.innerHTML = '';
      CATS.forEach(function (c) {
        var opts = data.items.filter(function (x) { return x.cat === c.id && (!onlyClean || !x.laundry); })
          .sort(function (a, b) { return a.name.localeCompare(b.name); });
        var optional = c.id === 'outer' || c.id === 'layer';
        wrap.appendChild(h('div', { class: 'field-label wr-pickhead' }, c.label + (optional ? ' (optional)' : '')));
        var row = h('div', { class: 'wr-pickrow' });
        if (optional) row.appendChild(h('button', { class: 'wr-pick' + (!draft[c.id] ? ' is-active' : ''), type: 'button',
          onclick: function () { draft[c.id] = null; paint(); if (onChange) onChange(); } }, 'None'));
        opts.forEach(function (x) {
          row.appendChild(h('button', { class: 'wr-pick' + (draft[c.id] && draft[c.id].id === x.id ? ' is-active' : ''), type: 'button',
            onclick: function () { draft[c.id] = x; paint(); if (onChange) onChange(); } }, swatch(x.color), x.name + (x.laundry ? ' 🧺' : '')));
        });
        if (!opts.length && !optional) row.appendChild(h('span', { class: 'muted' }, onlyClean ? 'Nothing clean' : 'Nothing yet'));
        wrap.appendChild(row);
      });
    }
    paint();
    return wrap;
  }

  function compose(st, base) {
    var draft = { outer: base.outer, layer: base.layer, top: base.top, bottom: base.bottom, shoes: base.shoes };
    ui.sheet(function (close) {
      return [
        h('h2', { class: 'sheet-title' }, 'Build your outfit'),
        h('p', { class: 'sheet-text' }, 'Only clean clothes are shown.'),
        piecePicker(draft, true),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast('Pick a top, a bottom and shoes'); return; }
            close(); wear(st, draft);
          } }, 'Wear this ✓'),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast('Pick a top, a bottom and shoes'); return; }
            close(); editOutfit(null, draft, st.occasion ? [st.occasion] : []);
          } }, '♡ Save as an outfit'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))
      ];
    }, { modal: true });
  }

  function wear(st, o) {
    var ids = CATS.map(function (c) { return o[c.id] ? o[c.id].id : null; }).filter(Boolean);
    ids.forEach(function (id) { var x = item(id); x.lastWorn = today(); x.worn = (x.worn || 0) + 1; });
    st.outfit = ids; st.worn = true;
    data.history.unshift({ date: today(), occasion: st.occasion, temp: st.temp, rain: st.rain, items: ids });
    data.history = data.history.slice(0, 120);
    persist(); view = 'today'; render(); window.scrollTo(0, 0);
    ui.toast('Have a great day!');
  }

  function renderWorn(st) {
    var o = {};
    st.outfit.forEach(function (id) { var x = item(id); if (x) o[x.cat] = x; });
    var oc = occ(st.occasion);
    root.appendChild(h('h2', { class: 'section-title' }, 'Today’s outfit' + (oc ? ' · ' + oc.icon + ' ' + oc.label : '')));
    root.appendChild(outfitCard(o, null));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { sortLaundry(st); } }, 'Back home: sort the laundry'),
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editOutfit(null, o, st.occasion ? [st.occasion] : []); } }, '♡ Save as an outfit'),
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () {
        ui.confirm({ title: 'Change outfit?', message: 'Today’s outfit will be cleared so you can pick another one.', okLabel: 'Change outfit' })
          .then(function (ok) {
            if (!ok) return;
            data.history.shift();
            st.outfit.forEach(function (id) {
              var x = item(id); if (!x) return;
              if (x.worn) x.worn--;
              var prev = data.history.filter(function (e) { return e.items.indexOf(id) > -1; })[0];
              x.lastWorn = prev ? prev.date : null;
            });
            st.worn = false; st.outfit = null; persist(); render();
          });
      } }, 'Change outfit')));
  }

  /* Le soir : quelles pièces vont au linge ? Suggestion : haut (et sport) cochés, l'utilisateur décide. */
  function sortLaundry(st) {
    var pieces = st.outfit.map(item).filter(Boolean);
    var draft = {};
    pieces.forEach(function (x) { draft[x.id] = x.cat === 'top' || (st.occasion === 'gym' && x.cat !== 'shoes' && x.cat !== 'outer'); });
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

  /* ----- Tenues enregistrées ----- */
  function renderOutfits() {
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', 'All'], ['ready', 'Ready ✓']].concat(OCCASIONS.map(function (o) { return [o.id, o.icon + ' ' + o.label]; })).map(function (f) {
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
        if (!st.occasion) st.occasion = x.of.occasions[0] || null;
        wear(st, x.st.o);
      } }));
    });
    if (data.outfits.length && !list.length) root.appendChild(h('p', { class: 'muted' }, 'No outfit matches this filter.'));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editOutfit(null); } }, '+ New outfit')));
    root.appendChild(colourGuide());
  }

  function editOutfit(of, prefill, occs) {
    var isNew = !of;
    var draft = {};
    CATS.forEach(function (c) {
      draft[c.id] = of ? (of.items[c.id] ? item(of.items[c.id]) || null : null) : (prefill && prefill[c.id]) || null;
    });
    var meta = { name: of ? of.name : '', occasions: of ? of.occasions.slice() : (occs || []).slice(), note: of ? of.note || '' : '' };
    if (isNew && !meta.name && draft.top && draft.bottom) meta.name = color(draft.top.color).label + ' & ' + color(draft.bottom.color).label.toLowerCase();
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var name = h('input', { class: 'input', type: 'text', value: meta.name, placeholder: 'e.g. Friday office look', 'aria-label': 'Outfit name', autocapitalize: 'sentences' });
      name.addEventListener('input', function () { meta.name = name.value; });
      var note = h('input', { class: 'input', type: 'text', value: meta.note, placeholder: 'e.g. Roll up the sleeves', 'aria-label': 'Note' });
      note.addEventListener('input', function () { meta.note = note.value; });
      var occWrap = h('div', { class: 'wr-occs wr-occs-sm' });
      function paintOcc() {
        occWrap.innerHTML = '';
        OCCASIONS.forEach(function (o) {
          var on = meta.occasions.indexOf(o.id) > -1;
          occWrap.appendChild(h('button', { class: 'wr-chip wr-occ' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { if (on) meta.occasions = meta.occasions.filter(function (i) { return i !== o.id; }); else meta.occasions.push(o.id); paintOcc(); } },
            h('span', { class: 'wr-occicon', 'aria-hidden': 'true' }, o.icon), h('span', { class: 'wr-chiplabel' }, o.label)));
        });
      }
      paintOcc();
      function save() {
        meta.name = meta.name.trim();
        if (!meta.name) { err.textContent = 'Give the outfit a name.'; err.hidden = false; return; }
        if (!draft.top || !draft.bottom || !draft.shoes) { err.textContent = 'Pick at least a top, a bottom and shoes.'; err.hidden = false; return; }
        if (!meta.occasions.length) { err.textContent = 'Pick at least one occasion.'; err.hidden = false; return; }
        var items = {};
        CATS.forEach(function (c) { items[c.id] = draft[c.id] ? draft[c.id].id : null; });
        var rec = { id: of ? of.id : ui.uid(), name: meta.name, occasions: meta.occasions, items: items, note: meta.note.trim() };
        if (isNew) data.outfits.push(rec); else data.outfits[data.outfits.indexOf(of)] = rec;
        persist(); close(); render(); ui.toast(isNew ? 'Outfit saved' : 'Outfit updated');
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New outfit' : 'Edit outfit'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'For'), occWrap),
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
    d.appendChild(h('p', { class: 'hint' }, 'The suggestions use these proven menswear combinations: neutrals as a base, at most one accent colour, light/dark contrast, and shoes matched to the trousers.'));
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

  /* ----- Penderie ----- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function renderCloset() {
    if (!data.items.length) {
      root.appendChild(h('div', { class: 'card' },
        h('div', { class: 'card-title' }, 'Start your closet'),
        h('p', { class: 'sheet-text' }, 'Add your clothes one by one, or load a starter set of basics that you can then edit, delete or complete.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () { editItem(null); } }, '+ Add a piece of clothing'),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            ui.confirm({ title: 'Load the starter set?', message: '23 basic pieces (jackets, sweaters, shirts, jeans, shoes…) will be added. Edit or delete them to match your real closet.', okLabel: 'Load the starter set' })
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
      [['all', 'All'], ['clean', 'Clean'], ['laundry', '🧺 Laundry']].concat(OCCASIONS.map(function (o) { return [o.id, o.icon + ' ' + o.label]; })).map(function (f) {
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
    CATS.forEach(function (c) {
      var list = data.items.filter(function (x) {
        if (x.cat !== c.id) return false;
        if (closetFilter === 'clean' && x.laundry) return false;
        if (closetFilter === 'laundry' && !x.laundry) return false;
        if (OCC_FORMALITY[closetFilter] && x.occasions.indexOf(closetFilter) < 0) return false;
        if (!tokens.length) return true;
        var hs = norm([x.name, x.subtype, color(x.color).label, formality(x.formality).label, x.material, x.pattern, x.brand, x.location, x.notes, c.label].join(' '));
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
    var sub = [x.subtype, color(x.color).label, formality(x.formality).label, WARMTH[x.warmth]].filter(Boolean).join(' · ');
    return h('button', { class: 'list-row list-row-btn wr-row' + (x.laundry ? ' is-dirty' : ''), onclick: function () { editItem(x); } },
      swatch(x.color, true),
      h('div', { class: 'wr-rowmain' },
        h('div', { class: 'list-title' }, x.name),
        h('div', { class: 'list-sub' }, sub),
        h('div', { class: 'list-sub' }, x.occasions.map(function (id) { return occ(id).icon; }).join(' ') + (x.rainOk ? ' · ☔' : '') + (x.location ? ' · 📍 ' + x.location : ''))),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, 'Laundry') : h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function editItem(x) {
    var isNew = !x;
    var draft = x ? JSON.parse(JSON.stringify(x)) : complete({ id: ui.uid(), name: '', cat: 'top', color: 'navy', warmth: 1, occasions: ['chill'], rainOk: false, laundry: false, lastWorn: null, worn: 0, subtype: null, material: null });
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
        body.innerHTML = '';
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Type'),
          seg(CATS.map(function (c) { return [c.id, c.label]; }), 'cat', function () {
            if (draft.subtype && cat(draft.cat).subtypes.indexOf(draft.subtype) < 0) draft.subtype = null;
          })));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Kind (optional)'), pills(cat(draft.cat).subtypes, 'subtype')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Colour · ' + color(draft.color).label),
          h('div', { class: 'wr-colors' }, COLORS.map(function (c) {
            return h('button', { class: 'wr-color' + (draft.color === c.id ? ' is-active' : ''), type: 'button', 'aria-label': c.label,
              'aria-pressed': draft.color === c.id ? 'true' : 'false', style: { background: c.hex }, onclick: function () { draft.color = c.id; paint(); } });
          }))));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Pattern'), seg(PATTERNS, 'pattern')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Style'), seg(FORMALITY.map(function (f) { return [f.id, f.label]; }), 'formality')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Warmth'),
          seg([[1, 'Light'], [2, 'Medium'], [3, 'Warm']], 'warmth')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Material (optional)'), pills(MATERIALS, 'material')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Good for'),
          h('div', { class: 'wr-occs wr-occs-sm' }, OCCASIONS.map(function (o) {
            var on = draft.occasions.indexOf(o.id) > -1;
            return h('button', { class: 'wr-chip wr-occ' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () { if (on) draft.occasions = draft.occasions.filter(function (i) { return i !== o.id; }); else draft.occasions.push(o.id); paint(); } },
              h('span', { class: 'wr-occicon', 'aria-hidden': 'true' }, o.icon), h('span', { class: 'wr-chiplabel' }, o.label));
          }))));
        if (draft.cat === 'outer' || draft.cat === 'shoes') body.appendChild(toggleRow('☔ OK in the rain', 'rainOk'));
        body.appendChild(toggleRow('🧺 In the laundry (not available)', 'laundry'));
      }
      paint();
      var name = h('input', { class: 'input', type: 'text', value: draft.name, placeholder: 'e.g. Navy Oxford shirt', 'aria-label': 'Name', autocapitalize: 'sentences' });
      name.addEventListener('input', function () { draft.name = name.value; });
      function save() {
        draft.name = draft.name.trim();
        if (!draft.name) { err.textContent = 'Give it a name.'; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
        if (!draft.occasions.length) { err.textContent = 'Pick at least one occasion.'; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
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
            ui.confirm({ title: 'Delete “' + x.name + '”?', message: 'It will be removed from your closet' + (used.length ? ' and from ' + used.length + ' saved outfit' + (used.length === 1 ? '' : 's') : '') + '.', okLabel: 'Delete', danger: true })
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
  S2.wardrobe = { score: score }; /* exposé pour les tests */
})();
