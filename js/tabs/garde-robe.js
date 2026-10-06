/* Onglet Wardrobe : vêtements, linge sale, et proposition de tenue selon la météo et l'occasion.
   La météo est choisie à la main (pas de récupération automatique, cf. CLAUDE.md).
   Données : localStorage "sandeep2:garde-robe". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  var NS = 'garde-robe';
  var SCHEMA = 1;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a2 2 0 1 1 2-2M12 6v2l8.5 6.5a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 8"/></svg>';

  /* Ordre = du haut du corps vers les pieds, tel qu'affiché dans une tenue. */
  var CATS = [
    { id: 'outer', label: 'Outerwear', hint: 'Jacket, coat' },
    { id: 'layer', label: 'Mid layer', hint: 'Sweater, hoodie, overshirt' },
    { id: 'top', label: 'Top', hint: 'T-shirt, shirt, polo' },
    { id: 'bottom', label: 'Bottom', hint: 'Jeans, chinos, shorts' },
    { id: 'shoes', label: 'Shoes', hint: 'Sneakers, boots' }
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
  function catLabel(id) { return CATS.filter(function (c) { return c.id === id; })[0].label; }
  function occ(id) { return OCCASIONS.filter(function (o) { return o.id === id; })[0]; }

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
  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.items)) d = { schema: SCHEMA, items: [], today: null, history: [] };
    d.history = d.history || [];
    if (d.today && d.today.date !== today()) d.today = null; /* nouvelle journée : on repart de zéro */
    d.schema = SCHEMA;
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function item(id) { return data.items.filter(function (x) { return x.id === id; })[0]; }
  function clean(cat, occasion) {
    return data.items.filter(function (x) { return x.cat === cat && !x.laundry && x.occasions.indexOf(occasion) > -1; });
  }
  function todayState() {
    if (!data.today) data.today = { date: today(), temp: null, rain: false, occasion: null, outfit: null, worn: false };
    return data.today;
  }

  function starter() {
    function it(name, cat, col, warmth, occasions, rainOk) {
      return { id: ui.uid(), name: name, cat: cat, color: col, warmth: warmth, occasions: occasions, rainOk: !!rainOk, laundry: false, lastWorn: null, worn: 0 };
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

  /* Note une tenue { outer, layer, top, bottom, shoes } et explique pourquoi. null = tenue impossible. */
  function score(o, ctx) {
    var s = 100, why = [];
    var parts = ['outer', 'layer', 'top', 'bottom', 'shoes'].map(function (k) { return o[k]; }).filter(Boolean);
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
    }

    /* Occasion */
    if (ctx.occasion === 'work' && o.bottom.warmth === 1) s -= 30;
    if (ctx.occasion === 'date' && o.bottom.warmth === 1) s -= 10;

    /* Couleurs */
    var accents = [];
    wear.concat([o.shoes]).forEach(function (x) { if (!color(x.color).neutral && accents.indexOf(x.color) < 0) accents.push(x.color); });
    if (accents.length === 0) { why.push('Neutral palette: always works'); }
    else if (accents.length === 1) { s += 8; why.push('One accent colour (' + color(accents[0]).label.toLowerCase() + ') over neutrals'); }
    else if (accents.length === 2 && isPair(accents[0], accents[1])) { s += 2; why.push(color(accents[0]).label + ' & ' + color(accents[1]).label.toLowerCase() + ' complement each other'); }
    else if (accents.length === 2) s -= 22;
    else s -= 50;
    if (ctx.occasion === 'work') s -= accents.length * 4;

    var tc = color(o.top.color), bc = color(o.bottom.color);
    if (o.top.color === o.bottom.color) {
      if (o.top.color === 'black' && ctx.occasion === 'club') { s += 4; why.push('All black: sharp for a night out'); }
      else if (o.top.color === 'denim') s -= 25;
      else s -= 10;
    } else if ((tc.light && bc.dark) || (tc.dark && bc.light)) { s += 6; why.push(tc.label + ' over ' + bc.label.toLowerCase() + ': good contrast'); }
    else if (tc.light && bc.light) s -= 4;
    if ((o.shoes.color === 'brown' || o.shoes.color === 'camel') && o.bottom.color === 'black') s -= 8;
    if (o.layer && o.outer && o.layer.color === o.outer.color) s -= 4;
    if (ctx.occasion === 'club' && tc.dark) s += 5;
    if (ctx.occasion === 'date' && accents.length === 1) s += 3;
    if ((o.top.color === 'navy' && o.bottom.color === 'beige') || (o.top.color === 'white' && o.bottom.color === 'navy') ||
        (o.top.color === 'lightblue' && (o.bottom.color === 'navy' || o.bottom.color === 'beige'))) { s += 5; why.push('Classic menswear pairing'); }

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

  /* ---------- Interface ---------- */
  var view = 'today'; // today | closet | laundry
  var pick = 0;       // rang de la proposition affichée

  function mount(container) {
    data = loadData();
    root = container;
    render();
  }

  function render() {
    root.innerHTML = '';
    var dirty = data.items.filter(function (x) { return x.laundry; }).length;
    root.appendChild(h('div', { class: 'segmented wr-nav' },
      [['today', 'Today'], ['closet', 'Closet (' + data.items.length + ')'], ['laundry', 'Laundry' + (dirty ? ' (' + dirty + ')' : '')]].map(function (v) {
        return h('button', { class: 'seg' + (view === v[0] ? ' is-active' : ''), onclick: function () { view = v[0]; render(); window.scrollTo(0, 0); } }, v[1]);
      })));
    if (view === 'closet') renderCloset();
    else if (view === 'laundry') renderLaundry();
    else renderToday();
  }

  function swatch(col, big) {
    return h('span', { class: 'wr-swatch' + (big ? ' is-big' : ''), style: { background: color(col).hex }, 'aria-hidden': 'true' });
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
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () { compose(st, c.o); } }, 'Swap a piece myself')));
  }

  function outfitCard(o, why) {
    var card = h('div', { class: 'card wr-outfit' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CATS.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    CATS.forEach(function (c) {
      var x = o[c.id];
      if (!x) return;
      card.appendChild(h('div', { class: 'wr-piece' }, swatch(x.color, true),
        h('div', null, h('div', { class: 'wr-piecename' }, x.name), h('div', { class: 'list-sub' }, c.label + ' · ' + color(x.color).label))));
    });
    if (why && why.length) card.appendChild(h('ul', { class: 'wr-why' }, why.slice(0, 3).map(function (w) { return h('li', null, w); })));
    return card;
  }

  /* Choisir soi-même une pièce par catégorie (parmi les vêtements propres). */
  function compose(st, base) {
    var draft = { outer: base.outer, layer: base.layer, top: base.top, bottom: base.bottom, shoes: base.shoes };
    ui.sheet(function (close) {
      var wrap = h('div');
      function paint() {
        wrap.innerHTML = '';
        CATS.forEach(function (c) {
          var opts = data.items.filter(function (x) { return x.cat === c.id && !x.laundry; });
          var optional = c.id === 'outer' || c.id === 'layer';
          wrap.appendChild(h('div', { class: 'field-label wr-pickhead' }, c.label));
          var row = h('div', { class: 'wr-pickrow' });
          if (optional) row.appendChild(h('button', { class: 'wr-pick' + (!draft[c.id] ? ' is-active' : ''), type: 'button',
            onclick: function () { draft[c.id] = null; paint(); } }, 'None'));
          opts.forEach(function (x) {
            row.appendChild(h('button', { class: 'wr-pick' + (draft[c.id] && draft[c.id].id === x.id ? ' is-active' : ''), type: 'button',
              onclick: function () { draft[c.id] = x; paint(); } }, swatch(x.color), x.name));
          });
          if (!opts.length && !optional) row.appendChild(h('span', { class: 'muted' }, 'Nothing clean'));
          wrap.appendChild(row);
        });
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, 'Build your outfit'),
        h('p', { class: 'sheet-text' }, 'Only clean clothes are shown.'),
        wrap,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast('Pick a top, a bottom and shoes'); return; }
            close(); wear(st, draft);
          } }, 'Wear this ✓'),
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
    persist(); render(); window.scrollTo(0, 0);
    ui.toast('Have a great day!');
  }

  function renderWorn(st) {
    var o = {};
    st.outfit.forEach(function (id) { var x = item(id); if (x) o[x.cat] = x; });
    var oc = occ(st.occasion);
    root.appendChild(h('h2', { class: 'section-title' }, 'Today’s outfit · ' + (oc ? oc.icon + ' ' + oc.label : '')));
    root.appendChild(outfitCard(o, null));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { sortLaundry(st); } }, 'Back home: sort the laundry'),
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
    pieces.forEach(function (x) { draft[x.id] = x.cat === 'top' || st.occasion === 'gym' && x.cat !== 'shoes' && x.cat !== 'outer'; });
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

  /* ----- Penderie ----- */
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
    CATS.forEach(function (c) {
      var list = data.items.filter(function (x) { return x.cat === c.id; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      root.appendChild(h('h2', { class: 'section-title' }, c.label + ' · ' + list.length));
      if (!list.length) { root.appendChild(h('p', { class: 'hint' }, 'None yet (' + c.hint.toLowerCase() + ').')); return; }
      root.appendChild(h('div', { class: 'list' }, list.map(itemRow)));
    });
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editItem(null); } }, '+ Add a piece of clothing')));
  }

  function itemRow(x) {
    return h('button', { class: 'list-row list-row-btn wr-row' + (x.laundry ? ' is-dirty' : ''), onclick: function () { editItem(x); } },
      swatch(x.color, true),
      h('div', { class: 'wr-rowmain' },
        h('div', { class: 'list-title' }, x.name),
        h('div', { class: 'list-sub' }, color(x.color).label + ' · ' + WARMTH[x.warmth] + ' · ' +
          x.occasions.map(function (id) { return occ(id).icon; }).join(' ') + (x.rainOk ? ' · ☔' : ''))),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, 'Laundry') : h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function editItem(x) {
    var isNew = !x;
    var draft = x ? JSON.parse(JSON.stringify(x)) : { id: ui.uid(), name: '', cat: 'top', color: 'navy', warmth: 1, occasions: ['chill'], rainOk: false, laundry: false, lastWorn: null, worn: 0 };
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var name = h('input', { class: 'input', type: 'text', value: draft.name, placeholder: 'e.g. Navy Oxford shirt', 'aria-label': 'Name', autocapitalize: 'sentences' });
      name.addEventListener('input', function () { draft.name = name.value; });
      var body = h('div');
      function seg(options, key) {
        return h('div', { class: 'segmented small wr-seg' }, options.map(function (o) {
          return h('button', { class: 'seg' + (draft[key] === o[0] ? ' is-active' : ''), type: 'button', onclick: function () { draft[key] = o[0]; paint(); } }, o[1]);
        }));
      }
      function paint() {
        body.innerHTML = '';
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Type'),
          seg(CATS.map(function (c) { return [c.id, c.label]; }), 'cat')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Colour · ' + color(draft.color).label),
          h('div', { class: 'wr-colors' }, COLORS.map(function (c) {
            return h('button', { class: 'wr-color' + (draft.color === c.id ? ' is-active' : ''), type: 'button', 'aria-label': c.label,
              'aria-pressed': draft.color === c.id ? 'true' : 'false', style: { background: c.hex }, onclick: function () { draft.color = c.id; paint(); } });
          }))));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Warmth'),
          seg([[1, 'Light'], [2, 'Medium'], [3, 'Warm']], 'warmth')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Good for'),
          h('div', { class: 'wr-occs wr-occs-sm' }, OCCASIONS.map(function (o) {
            var on = draft.occasions.indexOf(o.id) > -1;
            return h('button', { class: 'wr-chip wr-occ' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () { if (on) draft.occasions = draft.occasions.filter(function (i) { return i !== o.id; }); else draft.occasions.push(o.id); paint(); } },
              h('span', { class: 'wr-occicon', 'aria-hidden': 'true' }, o.icon), h('span', { class: 'wr-chiplabel' }, o.label));
          }))));
        if (draft.cat === 'outer' || draft.cat === 'shoes') {
          body.appendChild(toggleRow('☔ OK in the rain', 'rainOk'));
        }
        body.appendChild(toggleRow('🧺 In the laundry (not available)', 'laundry'));
      }
      function toggleRow(label, key) {
        return h('button', { class: 'wr-rain' + (draft[key] ? ' is-active' : ''), type: 'button', role: 'switch', 'aria-checked': draft[key] ? 'true' : 'false',
          onclick: function () { draft[key] = !draft[key]; paint(); } }, h('span', null, label), h('span', { class: 'wr-toggle', 'aria-hidden': 'true' }));
      }
      paint();
      function save() {
        draft.name = draft.name.trim();
        if (!draft.name) { err.textContent = 'Give it a name.'; err.hidden = false; return; }
        if (!draft.occasions.length) { err.textContent = 'Pick at least one occasion.'; err.hidden = false; return; }
        if (draft.cat !== 'outer' && draft.cat !== 'shoes') draft.rainOk = false;
        if (isNew) data.items.push(draft); else data.items[data.items.indexOf(x)] = draft;
        persist(); close(); render(); ui.toast(isNew ? 'Added to your closet' : 'Saved');
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New piece' : 'Edit piece'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        body, err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Add to closet' : 'Save'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            ui.confirm({ title: 'Delete “' + x.name + '”?', message: 'It will be removed from your closet.', okLabel: 'Delete', danger: true })
              .then(function (ok) { if (!ok) return; data.items = data.items.filter(function (i) { return i.id !== x.id; }); persist(); close(); render(); });
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
