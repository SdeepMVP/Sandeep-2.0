/* Onglet Wardrobe (interface) : penderie, tenues enregistrées, linge, historique, statistiques et suggestion du jour.
   Le moteur (règles, notes, recherche) est dans garde-robe-engine.js ; les combinaisons dans garde-robe-combos.js.
   La météo est saisie à la main (pas de récupération automatique, cf. CLAUDE.md).
   Données : localStorage "sandeep2:garde-robe" ; photos compressées : "sandeep2:garde-robe-photos". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  var NS = 'garde-robe';
  var SCHEMA = 4;
  var PHOTOS_NS = 'garde-robe-photos';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a2 2 0 1 1 2-2M12 6v2l8.5 6.5a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 8"/></svg>';

  var E = S2.wardrobeEngine;
  var CATS = E.CATS, CORE = E.CORE, TAGS = E.TAGS, GROUPS = E.GROUPS, OCCASIONS = E.OCCASIONS, LEGACY_OCC = E.LEGACY_OCC,
    LEGACY_TEMP = E.LEGACY_TEMP, CONDITIONS = E.CONDITIONS, WARMTH = E.WARMTH, FITS = E.FITS, FORMALITY = E.FORMALITY,
    PATTERNS = E.PATTERNS, MATERIALS = E.MATERIALS, LENGTHS = E.LENGTHS, COLORS = E.COLORS, DNA = E.DNA, COMBOS = E.COMBOS;
  var color = E.color, cat = E.cat, catLabel = E.catLabel, tag = E.tag, occ = E.occ, cond = E.cond, formality = E.formality,
    inPalette = E.inPalette, weatherText = E.weatherText, today = E.today, daysAgo = E.daysAgo, complete = E.complete, score = E.score;

  /* ---------- Données ---------- */
  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.items)) d = { schema: SCHEMA, items: [], outfits: [], today: null, history: [] };
    d.history = d.history || [];
    d.outfits = d.outfits || [];
    d.prefs = d.prefs || {};
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
  var photos = {}, rev = 0;
  function persist() {
    rev++;
    if (!S2.storage.save(NS, data)) ui.toast('Storage full: export a backup and remove some photos');
  }
  function savePhotos() { return S2.storage.save(PHOTOS_NS, photos); }
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

  /* ---------- Moteur (avec cache : « Show another one » ne recalcule rien) ---------- */
  var cache = { key: null, list: null };
  function makeCtx(st, oc) { return { temp: st.temp, cond: st.cond, occasion: oc, worn: lastWornMap(), prefs: data.prefs }; }
  function candidates(ctx) {
    var key = [rev, ctx.temp, ctx.cond, ctx.occasion.id, today()].join('|');
    if (cache.key !== key) cache = { key: key, list: E.candidates(data.items, ctx) };
    return cache.list;
  }
  function missing(ctx) { return E.missing(data.items, ctx); }
  function accessorySuggestions(o, ctx, st) { return E.accessorySuggestions(data.items, o, ctx, st.accDismissed); }

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
  var ctxOpen = false;              // bandeau occasion / météo déplié
  var selecting = false, selected = {}; // sélection multiple dans la penderie

  function mount(container) {
    data = loadData();
    photos = S2.storage.load(PHOTOS_NS, {}) || {};
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
  /* Photo de la pièce (avec une pastille de sa couleur), ou pastille seule. */
  function thumb(x, size) {
    var src = x && photos[x.id];
    if (!src) return swatch(x.color, true);
    return h('span', { class: 'wr-thumb' + (size === 'lg' ? ' is-lg' : ''), 'aria-hidden': 'true' },
      h('img', { src: src, alt: '' }), h('span', { class: 'wr-thumbdot', style: { background: color(x.color).hex } }));
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

    var oc = occ(st.occasion);
    var ready = !!oc && st.temp !== null && st.temp !== undefined;
    if (ready && !ctxOpen) root.appendChild(contextBar(st, oc));
    else renderPickers(st, oc, ready);
    if (!ready) {
      root.appendChild(h('p', { class: 'note' }, !oc ? 'Pick an occasion, then set the weather.' : 'Set the temperature to get your outfit.'));
      return;
    }
    var ctx = makeCtx(st, oc);
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
      renderReadyOutfits(st, oc, ctx);
      return;
    }
    if (pick >= list.length) pick = 0;
    var c = list[pick];
    root.appendChild(h('div', { class: 'wr-suggesthead' },
      h('h2', { class: 'section-title' }, 'Suggested · ' + (pick + 1) + ' of ' + list.length),
      h('div', { class: 'wr-feedback' },
        h('button', { class: 'btn btn-icon wr-fb', 'aria-label': 'I like this outfit', onclick: function () { feedback(c, 1); } }, '👍'),
        h('button', { class: 'btn btn-icon wr-fb', 'aria-label': 'Not for me', onclick: function () { feedback(c, -1); } }, '👎'))));
    root.appendChild(outfitCard(c.o, c.why, null, c.bends));

    /* Compléter la tenue */
    var accs = accessorySuggestions(c.o, ctx, st);
    root.appendChild(accessoryBlock(accs, st));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        wear(st, c.o, accs.filter(function (a) { return st.accAdded[a.x.id]; }).map(function (a) { return a.x; }));
      } }, 'I wore this ✓'),
      list.length > 1 ? h('button', { class: 'btn btn-secondary btn-block', onclick: function () { pick = (pick + 1) % list.length; st.accAdded = {}; S2.storage.save(NS, data); render(); } }, '↻ Show another one') : null,
      h('div', { class: 'wr-twobtn' },
        h('button', { class: 'btn btn-ghost', onclick: function () { compose(st, c.o); } }, 'Swap a piece'),
        h('button', { class: 'btn btn-ghost', onclick: function () { editOutfit(null, c.o, oc.tags.slice(0, 1)); } }, '♡ Save outfit'))));
    renderReadyOutfits(st, oc, ctx);
  }

  /* Bandeau compact : occasion + météo du jour, à toucher pour modifier. */
  function contextBar(st, oc) {
    return h('div', { class: 'card wr-ctxbar' },
      h('button', { class: 'wr-ctxmain', 'aria-label': 'Change occasion or weather', onclick: function () { ctxOpen = true; render(); } },
        h('span', { class: 'wr-ctxocc' }, oc.icon + ' ' + oc.label),
        h('span', { class: 'list-sub' }, weatherText(st.temp, st.cond) + ' · tap to change')),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: openStyle }, '✦ My Style'));
  }

  function renderPickers(st, oc, ready) {
    /* Occasion : rangée de puces défilante, groupée par catégorie */
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
    if (ready) root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block', onclick: function () { ctxOpen = false; render(); window.scrollTo(0, 0); } }, 'Show my outfit ↓')));
  }

  /* Tenues enregistrées prêtes pour cette occasion (sous la suggestion). */
  function renderReadyOutfits(st, oc, ctx) {
    var mine = data.outfits.filter(function (of) { return of.occasions.some(function (t) { return oc.tags.indexOf(t) > -1; }); })
      .map(function (of) { var stt = outfitStatus(of); return { of: of, st: stt, fit: stt.ready ? score(stt.o, ctx) : null }; })
      .filter(function (x) { return x.st.ready; })
      .sort(function (a, b) { return (b.fit ? b.fit.score : -999) - (a.fit ? a.fit.score : -999); });
    if (!mine.length) return;
    root.appendChild(h('h2', { class: 'section-title' }, 'Your saved outfits ready for ' + oc.label.toLowerCase()));
    mine.slice(0, 3).forEach(function (x) {
      root.appendChild(savedCard(x.of, x.st, {
        weatherNote: x.fit ? (x.fit.score < 80 ? 'Not the best fit for today’s weather' : null) : 'Not for this occasion',
        onWear: function () { wear(st, x.st.o, []); }
      }));
    });
  }

  /* 👍 / 👎 : le moteur retient l'avis (tenue et paires de pièces) et les suggestions s'adaptent. */
  function feedback(c, delta) {
    E.learn(data.prefs, c.o, delta);
    persist();
    ui.toast(delta > 0 ? 'Noted: more like this' : 'Noted: you won’t see this one again');
    render();
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
      box.appendChild(h('div', { class: 'wr-accrow' + (on ? ' is-on' : '') }, thumb(a.x),
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
    return h('div', { class: 'wr-piece' + (x.laundry ? ' is-dirty' : '') }, thumb(x),
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
    pieces.concat(accs).forEach(function (x) { x.lastWorn = today(); x.worn = (x.worn || 0) + 1; x.wearsSinceWash = (x.wearsSinceWash || 0) + 1; });
    E.learn(data.prefs, o, 0.5); /* porter une tenue compte comme un petit « j'aime » */
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
      if (x.wearsSinceWash) x.wearsSinceWash--;
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
    pieces.forEach(function (x) {
      var due = x.washEvery > 0 && (x.wearsSinceWash || 0) >= x.washEvery;
      draft[x.id] = due || (sport && x.cat !== 'shoes' && x.cat !== 'outer' && x.cat !== 'acc' && x.washEvery > 0);
    });
    ui.sheet(function (close) {
      var wrap = h('div');
      function paint() {
        wrap.innerHTML = '';
        pieces.forEach(function (x) {
          wrap.appendChild(h('button', { class: 'wr-check' + (draft[x.id] ? ' is-on' : ''), type: 'button', role: 'checkbox', 'aria-checked': draft[x.id] ? 'true' : 'false',
            onclick: function () { draft[x.id] = !draft[x.id]; paint(); } },
            h('span', { class: 'wr-box', 'aria-hidden': 'true' }, draft[x.id] ? '✓' : ''), thumb(x),
            h('span', { class: 'wr-checkmain' }, h('span', null, x.name),
              h('span', { class: 'list-sub' }, x.washEvery > 0 ? 'Worn ' + (x.wearsSinceWash || 0) + ' / ' + x.washEvery + ' times since last wash' : 'Doesn’t need washing'))));
        });
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, 'What goes in the laundry?'),
        h('p', { class: 'sheet-text' }, 'Pre-ticked: pieces that reached their wears before washing. Ticked items are unavailable until you mark them clean.'),
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
    root.appendChild(insights());
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

  /* Statistiques de la penderie : les plus portées, jamais portées, oubliées, coût par port. */
  function insights() {
    var core = data.items.filter(function (x) { return x.cat !== 'acc'; });
    var worn = core.filter(function (x) { return x.worn > 0; }).sort(function (a, b) { return b.worn - a.worn; });
    var never = core.filter(function (x) { return !x.worn; });
    var forgotten = core.filter(function (x) { return x.worn > 0 && daysAgo(x.lastWorn) >= 60; });
    var priced = data.items.filter(function (x) { return x.price > 0 && x.worn > 0; })
      .map(function (x) { return { x: x, cpw: x.price / x.worn }; }).sort(function (a, b) { return a.cpw - b.cpw; });
    var month = today().slice(0, 7);
    var thisMonth = data.history.filter(function (e) { return (e.date || '').slice(0, 7) === month; }).length;
    function names(list, fmt) {
      return h('ul', { class: 'wr-inslist' }, list.map(function (x) { return h('li', null, thumb(x), h('span', null, x.name), fmt ? h('span', { class: 'muted' }, fmt(x)) : null); }));
    }
    var d = h('details', { class: 'card wr-insights' }, h('summary', null, '📊 Insights'));
    d.appendChild(h('div', { class: 'stats wr-insstats' },
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Pieces worn'), h('div', { class: 'stat-value' }, worn.length + ' / ' + core.length)),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Outfits this month'), h('div', { class: 'stat-value' }, thisMonth))));
    if (worn.length) { d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Most worn')); d.appendChild(names(worn.slice(0, 5), function (x) { return x.worn + '×'; })); }
    if (never.length) {
      d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Never worn · ' + never.length));
      d.appendChild(names(never.slice(0, 8)));
      d.appendChild(h('p', { class: 'hint' }, 'Style them into a saved outfit, or consider giving them away.'));
    }
    if (forgotten.length) { d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Not worn for 2 months+')); d.appendChild(names(forgotten.slice(0, 6))); }
    if (priced.length) {
      d.appendChild(h('div', { class: 'field-label wr-pickhead' }, 'Best value (cost per wear)'));
      d.appendChild(names(priced.slice(0, 5).map(function (p) { return p.x; }), function (x) { return (x.price / x.worn).toFixed(2) + ' €'; }));
    } else d.appendChild(h('p', { class: 'hint' }, 'Add prices to your pieces to see their cost per wear.'));
    return d;
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
    root.appendChild(h('div', { class: 'wr-searchwrap' }, search,
      h('button', { class: 'btn btn-ghost btn-sm wr-selbtn', onclick: function () { selecting = !selecting; selected = {}; render(); } }, selecting ? 'Done' : 'Select')));
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', 'All'], ['clean', 'Clean'], ['laundry', '🧺 Laundry']].concat(TAGS.map(function (t) { return [t.id, t.icon + ' ' + t.label]; })).map(function (f) {
        return h('button', { class: 'wr-pill' + (closetFilter === f[0] ? ' is-active' : ''), onclick: function () { closetFilter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    paintCloset(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editItem(null); } }, '+ Add a piece of clothing')));
    if (selecting) { root.appendChild(h('div', { class: 'wr-bulkpad', 'aria-hidden': 'true' })); root.appendChild(bulkBar()); }
  }

  /* Actions groupées sur les pièces sélectionnées. */
  function bulkBar() {
    var ids = Object.keys(selected).filter(function (k) { return selected[k]; });
    var picked = data.items.filter(function (x) { return ids.indexOf(x.id) > -1; });
    function done(msg) { persist(); render(); ui.toast(msg); }
    function act(label, fn) { return h('button', { class: 'btn btn-sm wr-bulkact', disabled: !picked.length, onclick: fn }, label); }
    return h('div', { class: 'wr-bulkbar', role: 'toolbar', 'aria-label': 'Selected pieces' },
      h('span', { class: 'wr-bulkcount' }, picked.length + ' selected'),
      h('div', { class: 'wr-bulkacts' },
        act('🧺 Laundry', function () { picked.forEach(function (x) { x.laundry = true; }); done(picked.length + ' in the laundry'); }),
        act('Clean', function () { picked.forEach(function (x) { x.laundry = false; x.wearsSinceWash = 0; }); done(picked.length + ' clean'); }),
        act('★', function () { var on = !picked.every(function (x) { return x.fav; }); picked.forEach(function (x) { x.fav = on; }); done(on ? 'Marked as favourites' : 'Favourites removed'); }),
        act('Contexts', function () { bulkTags(picked); }),
        act('Place', function () { bulkPlace(picked); }),
        act('Delete', function () {
          ui.confirm({ title: 'Delete ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's') + '?', message: 'They will be removed from your closet and from saved outfits. Your history keeps their names.', okLabel: 'Delete', danger: true })
            .then(function (ok) {
              if (!ok) return;
              picked.forEach(function (x) {
                data.outfits.forEach(function (of) { if (of.items[x.cat] === x.id) of.items[x.cat] = null; });
                delete photos[x.id];
              });
              data.items = data.items.filter(function (x) { return ids.indexOf(x.id) < 0; });
              savePhotos(); selected = {}; done('Deleted');
            });
        })));
  }
  function bulkTags(picked) {
    var add = {}, remove = {};
    ui.sheet(function (close) {
      var wrap = h('div');
      function row(label, set, other) {
        return h('div', { class: 'field' }, h('span', { class: 'field-label' }, label), h('div', { class: 'wr-filters wr-filters-wrap' }, TAGS.map(function (t) {
          var on = !!set[t.id];
          return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { set[t.id] = !on; if (!on) delete other[t.id]; paint(); } }, t.icon + ' ' + t.label);
        })));
      }
      function paint() { wrap.innerHTML = ''; wrap.appendChild(row('Add', add, remove)); wrap.appendChild(row('Remove', remove, add)); }
      paint();
      return [h('h2', { class: 'sheet-title' }, 'Contexts for ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's')), wrap,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            picked.forEach(function (x) {
              Object.keys(add).forEach(function (t) { if (add[t] && x.occasions.indexOf(t) < 0) x.occasions.push(t); });
              x.occasions = x.occasions.filter(function (t) { return !remove[t]; });
              if (!x.occasions.length) x.occasions = ['chill'];
            });
            close(); persist(); render(); ui.toast('Contexts updated');
          } }, 'Apply'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))];
    }, { modal: true });
  }
  function bulkPlace(picked) {
    ui.sheet(function (close) {
      var inp = h('input', { class: 'input', type: 'text', placeholder: 'e.g. Wardrobe left, 2nd shelf', 'aria-label': 'Storage place', autocapitalize: 'sentences' });
      return [h('h2', { class: 'sheet-title' }, 'Storage place for ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Where are they stored?'), inp),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            picked.forEach(function (x) { x.location = inp.value.trim(); }); close(); persist(); render(); ui.toast('Storage place updated');
          } }, 'Apply'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))];
    }, { modal: true });
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
      x.cat !== 'acc' ? formality(x.formality).label : null,
      x.washEvery > 0 && x.wearsSinceWash ? x.wearsSinceWash + '/' + x.washEvery + ' wears' : null].filter(Boolean).join(' · ');
    var sel = !!selected[x.id];
    return h('button', { class: 'list-row list-row-btn wr-row' + (x.laundry ? ' is-dirty' : '') + (selecting ? ' is-selecting' : '') + (sel ? ' is-selected' : ''),
      'aria-pressed': selecting ? (sel ? 'true' : 'false') : null,
      onclick: function () {
        if (!selecting) { editItem(x); return; }
        selected[x.id] = !sel; render();
      } },
      selecting ? h('span', { class: 'wr-box', 'aria-hidden': 'true' }, sel ? '✓' : '') : null,
      thumb(x),
      h('div', { class: 'wr-rowmain' },
        h('div', { class: 'list-title' }, (x.fav ? '★ ' : '') + x.name),
        h('div', { class: 'list-sub' }, sub),
        h('div', { class: 'list-sub' }, x.occasions.map(function (id) { return tag(id).icon; }).join(' ') + (x.rainOk ? ' · ☔' : '') + (x.location ? ' · 📍 ' + x.location : ''))),
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, 'Laundry') : h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function editItem(x, prefill) {
    var isNew = !x;
    var draft = x ? JSON.parse(JSON.stringify(x)) : prefill ? prefill
      : complete({ id: ui.uid(), name: '', cat: 'top', color: 'navy', warmth: 1, occasions: ['chill'], rainOk: false, laundry: false, lastWorn: null, worn: 0, subtype: null, material: null, fit: 'regular' });
    var photo = photos[draft.id] || (prefill && prefill._photo) || null, photoChanged = !!(prefill && prefill._photo);
    delete draft._photo;
    var defaultsNote = '';
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
        /* Sorte : pour une nouvelle pièce, remplit automatiquement coupe, matière, style, contextes, lavage… */
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, isAcc ? 'Kind' : 'Kind (recommended)'),
          h('div', { class: 'wr-filters wr-filters-wrap' }, cat(draft.cat).subtypes.map(function (o) {
            var on = draft.subtype === o;
            return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () {
                if (on) { draft.subtype = null; }
                else if (isNew) { E.applyDefaults(draft, o); defaultsNote = 'Filled in for ' + o.toLowerCase() + ': fit, material, style, contexts and washing. Adjust if needed.'; }
                else draft.subtype = o;
                paint();
              } }, o);
          })),
          defaultsNote ? h('p', { class: 'hint wr-defaults' }, '✓ ' + defaultsNote) : null));
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
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Wears before washing'),
          h('div', { class: 'stepper wr-washstep' },
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': 'One wear less', onclick: function () { draft.washEvery = Math.max(0, (draft.washEvery || 0) - 1); paint(); } }, '−'),
            h('span', { class: 'wr-washval' }, draft.washEvery > 0 ? draft.washEvery + (draft.washEvery === 1 ? ' wear' : ' wears') : 'Never'),
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': 'One wear more', onclick: function () { draft.washEvery = Math.min(40, (draft.washEvery || 0) + 1); paint(); } }, '+')),
          h('p', { class: 'hint' }, draft.washEvery > 0 ? 'Suggested for the laundry after ' + draft.washEvery + ' wear' + (draft.washEvery === 1 ? '' : 's') + (draft.wearsSinceWash ? ' (worn ' + draft.wearsSinceWash + ' since last wash).' : '.') : 'Never suggested for the laundry (leather, shoes, watch…).')));
        body.appendChild(toggleRow('★ Favourite (comes back more often)', 'fav'));
        body.appendChild(toggleRow('🧺 In the laundry (not available)', 'laundry'));
      }
      /* Photo : compressée (320 px, JPEG) pour rester légère dans le stockage du téléphone. */
      var photoBox = h('div', { class: 'wr-photo' });
      var fileInp = h('input', { type: 'file', accept: 'image/*', class: 'sr-only', 'aria-label': 'Choose a photo' });
      fileInp.addEventListener('change', function () {
        var f = fileInp.files && fileInp.files[0]; fileInp.value = '';
        if (!f) return;
        compressImage(f, 320, 0.68).then(function (url) { photo = url; photoChanged = true; paintPhoto(); }, function () { ui.toast('This photo could not be read'); });
      });
      function paintPhoto() {
        photoBox.innerHTML = '';
        photoBox.appendChild(photo ? h('img', { class: 'wr-photoimg', src: photo, alt: 'Photo of the piece' }) : h('div', { class: 'wr-photoempty', style: { background: color(draft.color).hex } }, '📷'));
        photoBox.appendChild(h('div', { class: 'wr-photobtns' },
          h('button', { class: 'btn btn-secondary btn-sm', type: 'button', onclick: function () { fileInp.click(); } }, photo ? 'Change photo' : 'Add a photo'),
          photo ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () { photo = null; photoChanged = true; paintPhoto(); } }, 'Remove') : null));
        photoBox.appendChild(fileInp);
      }
      paintPhoto();
      var price = h('input', { class: 'input', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Price in euros',
        value: draft.price ? String(draft.price) : '', placeholder: 'e.g. 79' });
      price.addEventListener('input', function () { draft.price = ui.parseNum(price.value); });
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
        if (!draft.laundry && x && x.laundry) draft.wearsSinceWash = 0;
        if (draft.price !== null && !(draft.price > 0)) draft.price = null;
        if (photoChanged) {
          if (photo) photos[draft.id] = photo; else delete photos[draft.id];
          if (!savePhotos()) { delete photos[draft.id]; ui.toast('Photo too big for the phone storage: export a backup and remove some photos'); }
        }
        if (isNew) data.items.push(draft);
        else {
          data.items[data.items.indexOf(x)] = draft;
          if (draft.cat !== x.cat) data.outfits.forEach(function (of) { if (of.items[x.cat] === x.id) of.items[x.cat] = null; });
        }
        persist(); close(); render(); ui.toast(isNew ? 'Added to your closet' : 'Saved');
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'New piece' : 'Edit piece'),
        photoBox,
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        body,
        textInput('Where is it stored? (optional)', 'location', 'e.g. Wardrobe left, 2nd shelf'),
        textInput('Brand (optional)', 'brand', 'e.g. Uniqlo'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Price in € (optional, for cost per wear)'), price),
        textInput('Notes (optional)', 'notes', 'e.g. Iron before wearing'),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? 'Add to closet' : 'Save'),
          isNew ? null : h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            var copy = JSON.parse(JSON.stringify(x));
            copy.id = ui.uid(); copy.name = x.name + ' (copy)'; copy.laundry = false; copy.worn = 0; copy.wearsSinceWash = 0; copy.lastWorn = null;
            copy._photo = photos[x.id] || null;
            close(); setTimeout(function () { editItem(null, copy); }, 250);
          } }, 'Duplicate (same kind, other colour)'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            var used = data.outfits.filter(function (of) { return of.items[x.cat] === x.id; });
            ui.confirm({ title: 'Delete “' + x.name + '”?', message: 'It will be removed from your closet' + (used.length ? ' and from ' + used.length + ' saved outfit' + (used.length === 1 ? '' : 's') : '') + '. Your history keeps its name.', okLabel: 'Delete', danger: true })
              .then(function (ok) {
                if (!ok) return;
                data.items = data.items.filter(function (i) { return i.id !== x.id; });
                used.forEach(function (of) { of.items[x.cat] = null; });
                if (photos[x.id]) { delete photos[x.id]; savePhotos(); }
                persist(); close(); render();
              });
          } }, 'Delete'))
      ];
    }, { modal: true });
  }

  /* Réduit une photo (côté le plus long = max px) et la convertit en JPEG data-URL. */
  function compressImage(file, max, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image')); };
      img.src = url;
    });
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
      return h('div', { class: 'list-row wr-row' }, thumb(x),
        h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, x.name), h('div', { class: 'list-sub' }, catLabel(x.cat) + ' · ' + color(x.color).label)),
        h('button', { class: 'btn btn-secondary btn-sm', onclick: function () { x.laundry = false; x.wearsSinceWash = 0; persist(); render(); ui.toast(x.name + ' is clean'); } }, 'Clean ✓'));
    })));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        ui.confirm({ title: 'Everything is clean?', message: 'All ' + list.length + ' items will be available again.', okLabel: 'Mark all clean' })
          .then(function (ok) { if (!ok) return; list.forEach(function (x) { x.laundry = false; x.wearsSinceWash = 0; }); persist(); render(); ui.toast('All clean'); });
      } }, 'Laundry done: all clean')));
  }

  S2.app.registerTab({ id: 'garde-robe', label: 'Wardrobe', order: 20, icon: ICON, mount: mount });
  /* Exposé pour Réglages (« My Style ») et pour les tests. */
  S2.wardrobe = { score: score, openStyle: openStyle, occasions: OCCASIONS, dna: DNA, engine: E };
})();
