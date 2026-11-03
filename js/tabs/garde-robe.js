/* Onglet Wardrobe (interface) : penderie, tenues enregistrées, linge, historique, statistiques et suggestion du jour.
   Le moteur (règles, notes, recherche) est dans garde-robe-engine.js ; les combinaisons dans garde-robe-combos.js.
   La météo est saisie à la main (pas de récupération automatique, cf. CLAUDE.md).
   Données : localStorage "sandeep2:garde-robe" ; photos compressées : "sandeep2:garde-robe-photos". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h;
  /* Traduction : L('English', 'Français'). Les valeurs enregistrées restent en anglais ; seul l'affichage est traduit. */
  var L = S2.L || function (en) { return en; };
  /* Pluriel : singulier en anglais pour n = 1, en français pour n ≤ 1. */
  function pl(n, en1, enN, fr1, frN) { return L(n === 1 ? en1 : enN, n > 1 ? frN : fr1); }
  /* Montant avec 2 décimales (virgule en français). */
  function money(v) { var t = v.toFixed(2); return (S2.lang === 'fr' ? t.replace('.', ',') : t) + ' €'; }
  var NS = 'garde-robe';
  var SCHEMA = 4;
  var PHOTOS_NS = 'garde-robe-photos';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a2 2 0 1 1 2-2M12 6v2l8.5 6.5a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 8"/></svg>';

  var E = S2.wardrobeEngine;
  var CATS = E.CATS, CORE = E.CORE, TAGS = E.TAGS, GROUPS = E.GROUPS, OCCASIONS = E.OCCASIONS, LEGACY_OCC = E.LEGACY_OCC,
    LEGACY_TEMP = E.LEGACY_TEMP, CONDITIONS = E.CONDITIONS, WARMTH = E.WARMTH, FITS = E.FITS, FORMALITY = E.FORMALITY,
    PATTERNS = E.PATTERNS, MATERIALS = E.MATERIALS, LENGTHS = E.LENGTHS, COLORS = E.COLORS, DNA = E.DNA, COMBOS = E.COMBOS;
  var color = E.color, cat = E.cat, catLabel = E.catLabel, tag = E.tag, occ = E.occ, cond = E.cond, formality = E.formality,
    kindLabel = E.kindLabel, materialLabel = E.materialLabel, patternLabel = E.patternLabel, lengthLabel = E.lengthLabel, FIT_SHORT = E.FIT_SHORT,
    inPalette = E.inPalette, weatherText = E.weatherText, today = E.today, daysAgo = E.daysAgo, complete = E.complete, score = E.score;

  /* ---------- Données ---------- */
  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.items)) d = { schema: SCHEMA, items: [], outfits: [], today: null, history: [] };
    d.history = d.history || [];
    d.outfits = d.outfits || [];
    d.prefs = d.prefs || {};
    d.wishlist = d.wishlist || [];
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
    if (!S2.storage.save(NS, data)) ui.toast(L('Storage full: export a backup and remove some photos', 'Stockage plein : exporte une sauvegarde et supprime des photos'));
  }
  function savePhotos() { return S2.storage.save(PHOTOS_NS, photos); }
  /* Sauvegarde sans invalider les caches (liste d'envies, rang de suggestion…). */
  function saveQuiet() { S2.storage.save(NS, data); }
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
    /* name = [anglais, français] : complete() déduit sorte et matière du nom anglais, puis le nom suit la langue. */
    function it(name, c, col, warmth, occasions, rainOk, extra) {
      var x = { id: ui.uid(), name: name[0], cat: c, color: col, warmth: warmth, occasions: occasions, rainOk: !!rainOk, laundry: false, lastWorn: null, worn: 0 };
      Object.keys(extra || {}).forEach(function (k) { x[k] = extra[k]; });
      complete(x);
      x.name = L(name[0], name[1]);
      return x;
    }
    return [
      it(['Navy rain jacket', 'Imperméable marine'], 'outer', 'navy', 1, ['work', 'gym', 'chill', 'travel'], true),
      it(['Camel wool coat', 'Manteau en laine camel'], 'outer', 'camel', 3, ['work', 'date', 'club', 'formal']),
      it(['Black bomber jacket', 'Bomber noir'], 'outer', 'black', 2, ['club', 'date', 'chill']),
      it(['Black cropped leather jacket', 'Veste en cuir courte noire'], 'outer', 'black', 2, ['club', 'date', 'chill'], false, { subtype: 'Leather jacket', material: 'Leather', length: 'cropped' }),
      it(['Grey crewneck sweater', 'Pull col rond gris'], 'layer', 'grey', 2, ['work', 'date', 'chill', 'travel']),
      it(['Navy knit sweater', 'Pull en maille marine'], 'layer', 'navy', 2, ['work', 'date', 'chill']),
      it(['Black hoodie', 'Sweat à capuche noir'], 'layer', 'black', 2, ['gym', 'chill'], false, { fit: 'wide' }),
      it(['Taupe houndstooth overshirt', 'Surchemise pied-de-poule taupe'], 'layer', 'taupe', 2, ['work', 'date', 'chill'], false, { subtype: 'Overshirt', pattern: 'houndstooth' }),
      it(['Cream fleece zip-up', 'Polaire zippée crème'], 'layer', 'cream', 2, ['chill', 'travel'], false, { subtype: 'Zip-up', material: 'Fleece' }),
      it(['White T-shirt', 'T-shirt blanc'], 'top', 'white', 1, ['chill', 'date', 'travel'], false, { fit: 'slim' }),
      it(['Black T-shirt', 'T-shirt noir'], 'top', 'black', 1, ['club', 'chill', 'date'], false, { fit: 'slim' }),
      it(['White Oxford shirt', 'Chemise Oxford blanche'], 'top', 'white', 1, ['work', 'date', 'formal']),
      it(['Cream knit polo', 'Polo en maille crème'], 'top', 'cream', 1, ['work', 'date', 'chill'], false, { fit: 'slim', subtype: 'Polo' }),
      it(['Black shirt', 'Chemise noire'], 'top', 'black', 1, ['club', 'date', 'formal']),
      it(['Grey training T-shirt', 'T-shirt de sport gris'], 'top', 'grey', 1, ['gym']),
      it(['Wide-leg navy trousers', 'Pantalon large marine'], 'bottom', 'navy', 2, ['work', 'date', 'club', 'formal'], false, { subtype: 'Trousers', formality: 'smart' }),
      it(['Relaxed beige chinos', 'Chino ample beige'], 'bottom', 'beige', 2, ['work', 'date', 'chill', 'travel'], false, { subtype: 'Chinos' }),
      it(['Wide black jeans', 'Jean large noir'], 'bottom', 'black', 2, ['club', 'date', 'chill'], false, { subtype: 'Jeans' }),
      it(['Khaki cargo pants', 'Pantalon cargo kaki'], 'bottom', 'khaki', 2, ['chill', 'travel']),
      it(['Relaxed cream shorts', 'Short ample crème'], 'bottom', 'cream', 1, ['chill', 'travel'], false, { subtype: 'Shorts' }),
      it(['Black training shorts', 'Short de sport noir'], 'bottom', 'black', 1, ['gym'], false, { subtype: 'Sport shorts' }),
      it(['Black leather sneakers', 'Baskets en cuir noires'], 'shoes', 'black', 1, ['chill', 'date', 'club', 'travel'], false, { subtype: 'Sneakers', material: 'Leather' }),
      it(['Brown leather derbies', 'Derbies en cuir marron'], 'shoes', 'brown', 2, ['work', 'date', 'formal'], false, { subtype: 'Derbies' }),
      it(['Black Chelsea boots', 'Chelsea boots noires'], 'shoes', 'black', 2, ['club', 'date', 'work', 'formal'], true),
      it(['Running shoes', 'Chaussures de running'], 'shoes', 'grey', 1, ['gym'], true),
      it(['Black cap', 'Casquette noire'], 'acc', 'black', 1, ['chill', 'travel', 'gym'], false, { subtype: 'Cap' }),
      it(['Grey beanie', 'Bonnet gris'], 'acc', 'grey', 2, ['chill', 'travel', 'club'], false, { subtype: 'Beanie' }),
      it(['Navy wool scarf', 'Écharpe en laine marine'], 'acc', 'navy', 2, ['work', 'chill', 'date', 'formal'], false, { subtype: 'Scarf' }),
      it(['Brown leather watch', 'Montre en cuir marron'], 'acc', 'brown', 1, ['work', 'date', 'formal', 'chill'], false, { subtype: 'Watch' }),
      it(['Black crossbody bag', 'Sac bandoulière noir'], 'acc', 'black', 1, ['chill', 'travel', 'club'], false, { subtype: 'Crossbody bag' }),
      it(['Silver chain necklace', 'Collier chaîne argent'], 'acc', 'grey', 1, ['chill', 'date', 'club', 'travel'], false, { subtype: 'Necklace' }),
      it(['Black chain wallet', 'Chaîne de portefeuille noire'], 'acc', 'black', 1, ['chill', 'club', 'travel'], false, { subtype: 'Chain wallet' })
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
      [['today', L('Today', 'Jour')], ['outfits', L('Outfits', 'Tenues')], ['closet', L('Closet', 'Penderie')], ['laundry', L('Laundry', 'Linge') + (dirty ? ' ' + dirty : '')], ['history', L('History', 'Historique')]].map(function (v) {
        var on = view === v[0] || (view === 'shop' && v[0] === 'closet');
        return h('button', { class: 'seg' + (on ? ' is-active' : ''), onclick: function () { view = v[0]; render(); window.scrollTo(0, 0); } }, v[1]);
      })));
    if (view === 'closet') renderCloset();
    else if (view === 'shop') renderShop();
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
    return [kindLabel(x.subtype) || catLabel(x.cat), color(x.color).label, x.fit && x.fit !== 'regular' && x.cat !== 'acc' && x.cat !== 'shoes' ? FIT_SHORT[x.fit === 'slim' ? 'slim' : 'wide'] : null].filter(Boolean).join(' · ');
  }

  /* ----- Aujourd'hui ----- */
  function renderToday() {
    var st = todayState();
    if (!data.items.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('Your closet is empty. Add your clothes so the app can suggest outfits.', 'Ta penderie est vide. Ajoute tes vêtements pour recevoir des idées de tenues.')),
        h('button', { class: 'btn btn-primary', onclick: function () { view = 'closet'; render(); } }, L('Go to the closet', 'Aller à la penderie'))));
      return;
    }

    if (st.worn && st.outfit) return renderWorn(st);

    var oc = occ(st.occasion);
    var ready = !!oc && st.temp !== null && st.temp !== undefined;
    if (ready && !ctxOpen) root.appendChild(contextBar(st, oc));
    else renderPickers(st, oc, ready);
    if (!ready) {
      root.appendChild(h('p', { class: 'note' }, !oc ? L('Pick an occasion, then set the weather.', 'Choisis une occasion, puis indique la météo.') : L('Set the temperature to get your outfit.', 'Indique la température pour voir ta tenue.')));
      return;
    }
    var ctx = makeCtx(st, oc);
    var list = candidates(ctx);
    if (!list.length) {
      var miss = missing(ctx);
      root.appendChild(h('div', { class: 'card wr-none' },
        h('div', { class: 'card-title' }, L('No complete outfit available', 'Aucune tenue complète disponible')),
        h('p', { class: 'sheet-text' }, miss.length
          ? L('Missing clean pieces for ' + oc.label.toLowerCase() + ': ' + miss.join(', ') + '.',
            'Il manque des pièces propres pour « ' + oc.label.toLowerCase() + ' » : ' + miss.join(', ').toLowerCase() + '.')
          : L('No combination of your clean clothes works for this occasion.', 'Aucune combinaison de tes vêtements propres ne convient à cette occasion.')),
        h('p', { class: 'hint' }, L('Tag more clothes for this context in the Closet, or mark some laundry as clean. You can also build it yourself.', 'Associe plus de vêtements à ce contexte dans la Penderie, ou marque du linge comme propre. Tu peux aussi composer la tenue toi-même.')),
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { compose(st, {}); } }, L('Build it myself', 'Je la compose moi-même')),
        h('button', { class: 'btn btn-ghost btn-block', onclick: function () { view = 'shop'; render(); window.scrollTo(0, 0); } }, L('🛍 What should I buy?', '🛍 Quoi acheter ?'))));
      renderReadyOutfits(st, oc, ctx);
      return;
    }
    if (pick >= list.length) pick = 0;
    var c = list[pick];
    root.appendChild(h('div', { class: 'wr-suggesthead' },
      h('h2', { class: 'section-title' }, L('Suggested · ' + (pick + 1) + ' of ' + list.length, 'Suggestion · ' + (pick + 1) + ' sur ' + list.length)),
      h('div', { class: 'wr-feedback' },
        h('button', { class: 'btn btn-icon wr-fb', 'aria-label': L('I like this outfit', 'J’aime cette tenue'), onclick: function () { feedback(c, 1); } }, '👍'),
        h('button', { class: 'btn btn-icon wr-fb', 'aria-label': L('Not for me', 'Pas pour moi'), onclick: function () { feedback(c, -1); } }, '👎'))));
    root.appendChild(outfitCard(c.o, c.why, null, c.bends));

    /* Compléter la tenue */
    var accs = accessorySuggestions(c.o, ctx, st);
    root.appendChild(accessoryBlock(accs, st));

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        wear(st, c.o, accs.filter(function (a) { return st.accAdded[a.x.id]; }).map(function (a) { return a.x; }));
      } }, L('I wore this ✓', 'Je l’ai portée ✓')),
      list.length > 1 ? h('button', { class: 'btn btn-secondary btn-block', onclick: function () { pick = (pick + 1) % list.length; st.accAdded = {}; S2.storage.save(NS, data); render(); } }, L('↻ Show another one', '↻ Une autre')) : null,
      h('div', { class: 'wr-twobtn' },
        h('button', { class: 'btn btn-ghost', onclick: function () { compose(st, c.o); } }, L('Swap a piece', 'Changer une pièce')),
        h('button', { class: 'btn btn-ghost', onclick: function () { editOutfit(null, c.o, oc.tags.slice(0, 1)); } }, L('♡ Save outfit', '♡ Enregistrer')))));
    renderReadyOutfits(st, oc, ctx);
  }

  /* Bandeau compact : occasion + météo du jour, à toucher pour modifier. */
  function contextBar(st, oc) {
    return h('div', { class: 'card wr-ctxbar' },
      h('button', { class: 'wr-ctxmain', 'aria-label': L('Change occasion or weather', 'Changer l’occasion ou la météo'), onclick: function () { ctxOpen = true; render(); } },
        h('span', { class: 'wr-ctxocc' }, oc.icon + ' ' + oc.label),
        h('span', { class: 'list-sub' }, weatherText(st.temp, st.cond) + L(' · tap to change', ' · touche pour changer'))),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: openStyle }, L('✦ My Style', '✦ Mon style')));
  }

  function renderPickers(st, oc, ready) {
    /* Occasion : rangée de puces défilante, groupée par catégorie */
    root.appendChild(h('div', { class: 'wr-todayhead' },
      h('h2', { class: 'section-title' }, L('Occasion', 'Occasion')),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: openStyle }, L('✦ My Style', '✦ Mon style'))));
    var row = h('div', { class: 'wr-occrow', role: 'listbox', 'aria-label': L('Occasion', 'Occasion') });
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
    root.appendChild(h('h2', { class: 'section-title' }, L('Weather', 'Météo')));
    var tVal = st.temp === null || st.temp === undefined ? 15 : st.temp;
    var tLabel = h('span', { class: 'wr-tempval' }, st.temp === null || st.temp === undefined ? '— °C' : tVal + ' °C');
    var slider = h('input', { class: 'wr-slider', type: 'range', min: -10, max: 40, step: 1, value: String(tVal), 'aria-label': L('Temperature in °C', 'Température en °C') });
    slider.addEventListener('input', function () { tLabel.textContent = slider.value + ' °C'; });
    slider.addEventListener('change', function () { st.temp = Number(slider.value); pick = 0; persist(); render(); });
    root.appendChild(h('div', { class: 'card wr-weather' },
      h('div', { class: 'wr-temprow' }, h('span', { class: 'field-label' }, L('Temperature', 'Température')), tLabel),
      slider,
      h('div', { class: 'wr-conds' }, CONDITIONS.map(function (c) {
        var on = st.cond === c.id;
        return h('button', { class: 'wr-cond' + (on ? ' is-active' : ''), 'aria-pressed': on ? 'true' : 'false',
          onclick: function () { st.cond = c.id; if (st.temp === null || st.temp === undefined) st.temp = Number(slider.value); pick = 0; persist(); render(); } },
          h('span', { 'aria-hidden': 'true' }, c.icon), h('span', null, c.label));
      }))));
    root.appendChild(h('p', { class: 'hint' }, L('Check your weather app, then set it here.', 'Regarde ton appli météo, puis reporte-la ici.')));
    if (ready) root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block', onclick: function () { ctxOpen = false; render(); window.scrollTo(0, 0); } }, L('Show my outfit ↓', 'Voir ma tenue ↓'))));
  }

  /* Tenues enregistrées prêtes pour cette occasion (sous la suggestion). */
  function renderReadyOutfits(st, oc, ctx) {
    var mine = data.outfits.filter(function (of) { return of.occasions.some(function (t) { return oc.tags.indexOf(t) > -1; }); })
      .map(function (of) { var stt = outfitStatus(of); return { of: of, st: stt, fit: stt.ready ? score(stt.o, ctx) : null }; })
      .filter(function (x) { return x.st.ready; })
      .sort(function (a, b) { return (b.fit ? b.fit.score : -999) - (a.fit ? a.fit.score : -999); });
    if (!mine.length) return;
    root.appendChild(h('h2', { class: 'section-title' }, L('Your saved outfits ready for ' + oc.label.toLowerCase(), 'Tes tenues prêtes pour « ' + oc.label.toLowerCase() + ' »')));
    mine.slice(0, 3).forEach(function (x) {
      root.appendChild(savedCard(x.of, x.st, {
        weatherNote: x.fit ? (x.fit.score < 80 ? L('Not the best fit for today’s weather', 'Pas idéale pour la météo du jour') : null) : L('Not for this occasion', 'Pas pour cette occasion'),
        onWear: function () { wear(st, x.st.o, []); }
      }));
    });
  }

  /* 👍 / 👎 : le moteur retient l'avis (tenue et paires de pièces) et les suggestions s'adaptent. */
  function feedback(c, delta) {
    E.learn(data.prefs, c.o, delta);
    persist();
    ui.toast(delta > 0 ? L('Noted: more like this', 'Noté : plus de tenues comme ça') : L('Noted: you won’t see this one again', 'Noté : tu ne la reverras plus'));
    render();
  }

  function accessoryBlock(accs, st) {
    var box = h('section', { class: 'card wr-acc' }, h('div', { class: 'wr-acchead' },
      h('span', { class: 'card-title' }, L('Complete your look', 'Complète ta tenue')), h('span', { class: 'muted wr-accopt' }, L('Optional', 'Facultatif'))));
    if (!data.items.some(function (x) { return x.cat === 'acc'; })) {
      box.appendChild(h('p', { class: 'hint' }, L('Add caps, beanies, scarves, bags or watches in the Closet (type “Accessories”) to get suggestions here.', 'Ajoute casquettes, bonnets, écharpes, sacs ou montres dans la Penderie (type « Accessoires ») pour avoir des suggestions ici.')));
      return box;
    }
    if (!accs.length) { box.appendChild(h('p', { class: 'hint' }, L('No accessory to suggest for this outfit.', 'Aucun accessoire à suggérer pour cette tenue.'))); return box; }
    accs.forEach(function (a) {
      var on = !!st.accAdded[a.x.id];
      box.appendChild(h('div', { class: 'wr-accrow' + (on ? ' is-on' : '') }, thumb(a.x),
        h('div', { class: 'wr-piecemain' },
          h('div', { class: 'wr-piecename' }, a.x.name),
          h('div', { class: 'list-sub' }, a.why),
          a.x.location ? h('div', { class: 'wr-loc' }, '📍 ' + a.x.location) : null),
        h('button', { class: 'btn btn-sm ' + (on ? 'btn-primary' : 'btn-secondary'), 'aria-pressed': on ? 'true' : 'false',
          onclick: function () { if (on) delete st.accAdded[a.x.id]; else st.accAdded[a.x.id] = true; persist(); render(); } }, on ? L('Added ✓', 'Ajouté ✓') : L('Add', 'Ajouter')),
        h('button', { class: 'btn btn-icon', 'aria-label': L('Dismiss ', 'Écarter ') + a.x.name,
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
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, L('🧺 Laundry', '🧺 Au linge')) : null);
  }

  function outfitCard(o, why, acc, bends) {
    var card = h('div', { class: 'card wr-outfit' });
    card.appendChild(h('div', { class: 'wr-palette', 'aria-hidden': 'true' },
      CORE.map(function (c) { return o[c.id] ? h('span', { style: { background: color(o[c.id].color).hex } }) : null; })));
    CORE.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id])); });
    (acc || []).forEach(function (x) { card.appendChild(pieceLine(x)); });
    if (why && why.length) card.appendChild(h('ul', { class: 'wr-why' }, why.slice(0, 4).map(function (w) { return h('li', null, w); })));
    if (bends && bends.length) card.appendChild(h('p', { class: 'wr-bend' }, L('✦ Creative pick: ', '✦ Choix créatif : ') + bends[0]));
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
      stt.ready ? h('span', { class: 'badge wr-readybadge' }, L('Ready ✓', 'Prête ✓'))
        : !stt.complete ? h('span', { class: 'badge wr-dirtybadge' }, L('Incomplete', 'Incomplète'))
        : h('span', { class: 'badge wr-dirtybadge' }, stt.dirty.length + L(' in laundry', ' au linge'))));
    if (opts.weatherNote) card.appendChild(h('p', { class: 'wr-weathernote' }, '⚠︎ ' + opts.weatherNote));
    CORE.forEach(function (c) { if (o[c.id]) card.appendChild(pieceLine(o[c.id])); });
    if (of.note) card.appendChild(h('p', { class: 'hint wr-savednote' }, of.note));
    card.appendChild(h('div', { class: 'wr-savedbtns' },
      stt.ready && opts.onWear ? h('button', { class: 'btn btn-primary btn-sm', onclick: opts.onWear }, L('I wore this ✓', 'Je l’ai portée ✓')) : null,
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editOutfit(of); } }, L('Edit', 'Modifier'))));
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
        wrap.appendChild(h('div', { class: 'field-label wr-pickhead' }, c.label + (optional ? L(' (optional)', ' (facultatif)') : '')));
        var row = h('div', { class: 'wr-pickrow' });
        if (optional) row.appendChild(h('button', { class: 'wr-pick' + (!draft[c.id] ? ' is-active' : ''), type: 'button',
          onclick: function () { draft[c.id] = null; paint(); } }, L('None', 'Aucun')));
        opts.forEach(function (x) {
          row.appendChild(h('button', { class: 'wr-pick' + (draft[c.id] && draft[c.id].id === x.id ? ' is-active' : ''), type: 'button',
            onclick: function () { draft[c.id] = x; paint(); } }, swatch(x.color), x.name + (x.laundry ? ' 🧺' : '')));
        });
        if (!opts.length && !optional) row.appendChild(h('span', { class: 'muted' }, onlyClean ? L('Nothing clean', 'Rien de propre') : L('Nothing yet', 'Rien pour l’instant')));
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
        h('h2', { class: 'sheet-title' }, L('Build your outfit', 'Compose ta tenue')),
        h('p', { class: 'sheet-text' }, L('Only clean clothes are shown. Your picks are kept as they are, even if they break a style rule.', 'Seuls les vêtements propres sont affichés. Tes choix sont gardés tels quels, même s’ils sortent des règles de style.')),
        piecePicker(draft, true),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast(L('Pick a top, a bottom and shoes', 'Choisis un haut, un bas et des chaussures')); return; }
            close(); wear(st, draft, []);
          } }, L('I wore this ✓', 'Je l’ai portée ✓')),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            if (!draft.top || !draft.bottom || !draft.shoes) { ui.toast(L('Pick a top, a bottom and shoes', 'Choisis un haut, un bas et des chaussures')); return; }
            close(); editOutfit(null, draft, oc ? oc.tags.slice(0, 1) : []);
          } }, L('♡ Save as an outfit', '♡ Enregistrer comme tenue')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
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
    ui.toast(L('Saved to your history. Have a great day!', 'Ajoutée à l’historique. Belle journée !'));
  }

  function renderWorn(st) {
    var o = {};
    st.outfit.forEach(function (id) { var x = item(id); if (x) o[x.cat] = x; });
    var accs = (st.acc || []).map(item).filter(Boolean);
    var oc = occ(st.occasion);
    root.appendChild(h('h2', { class: 'section-title' }, L('Today’s outfit', 'Tenue du jour') + (oc ? ' · ' + oc.icon + ' ' + oc.label : '')));
    root.appendChild(outfitCard(o, null, accs));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { sortLaundry(st); } }, L('Back home: sort the laundry', 'De retour : trier le linge')),
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editOutfit(null, o, oc ? oc.tags.slice(0, 1) : []); } }, L('♡ Save as an outfit', '♡ Enregistrer comme tenue')),
      h('button', { class: 'btn btn-ghost btn-block', onclick: function () {
        ui.confirm({ title: L('Change outfit?', 'Changer de tenue ?'), message: L('Today’s outfit will be removed from your history so you can pick another one.', 'La tenue du jour sera retirée de l’historique pour que tu puisses en choisir une autre.'), okLabel: L('Change outfit', 'Changer de tenue') })
          .then(function (ok) {
            if (!ok) return;
            removeEntry(st.entryId || (data.history[0] && data.history[0].id));
            st.worn = false; st.outfit = null; st.acc = []; st.entryId = null; persist(); render();
          });
      } }, L('Change outfit', 'Changer de tenue'))));
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
              h('span', { class: 'list-sub' }, x.washEvery > 0 ? L('Worn ' + (x.wearsSinceWash || 0) + ' / ' + x.washEvery + ' times since last wash', 'Portée ' + (x.wearsSinceWash || 0) + ' / ' + x.washEvery + ' fois depuis le lavage') : L('Doesn’t need washing', 'Pas besoin de lavage')))));
        });
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, L('What goes in the laundry?', 'Qu’est-ce qui va au linge ?')),
        h('p', { class: 'sheet-text' }, L('Pre-ticked: pieces that reached their wears before washing. Ticked items are unavailable until you mark them clean.', 'Pré-cochées : les pièces qui ont atteint leur nombre de ports avant lavage. Les pièces cochées restent indisponibles jusqu’à ce que tu les marques propres.')),
        wrap,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            var n = 0;
            pieces.forEach(function (x) { if (draft[x.id]) { x.laundry = true; n++; } });
            persist(); close(); render();
            ui.toast(n ? n + pl(n, ' item in the laundry', ' items in the laundry', ' pièce au linge', ' pièces au linge') : L('Nothing in the laundry', 'Rien au linge'));
          } }, L('Confirm', 'Valider')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ----- Historique (journal) ----- */
  function renderHistory() {
    var list = data.history.slice().sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    if (!list.length) {
      root.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('📓 No outfit logged yet.', '📓 Aucune tenue enregistrée pour l’instant.')),
        h('p', { class: 'muted' }, L('Tap “I wore this” on an outfit and it will appear here. Recent pieces are then suggested less often.', 'Touche « Je l’ai portée » sur une tenue et elle apparaîtra ici. Les pièces récentes sont ensuite moins proposées.'))));
      return;
    }
    root.appendChild(insights());
    root.appendChild(h('p', { class: 'hint' }, list.length + pl(list.length, ' outfit logged', ' outfits logged', ' tenue enregistrée', ' tenues enregistrées') + L('. Pieces worn in the last 3 days are suggested less; pieces not worn for a week come first.', '. Les pièces portées ces 3 derniers jours sont moins proposées ; celles non portées depuis une semaine passent en premier.')));
    var lastDay = null, journal = h('div', { class: 'wr-journal' });
    list.forEach(function (e) {
      var d = new Date(e.at);
      var dayKey = e.date || e.at.slice(0, 10);
      if (dayKey !== lastDay) {
        lastDay = dayKey;
        var ago = daysAgo(dayKey);
        journal.appendChild(h('h2', { class: 'section-title wr-journalday' },
          (ago === 0 ? L('Today · ', 'Aujourd’hui · ') : ago === 1 ? L('Yesterday · ', 'Hier · ') : '') + d.toLocaleDateString(S2.locale, { weekday: 'long', day: 'numeric', month: 'long', year: ago > 300 ? 'numeric' : undefined })));
      }
      var oc = occ(e.occasion);
      var hasTime = !/T12:00:00$/.test(e.at);
      journal.appendChild(h('article', { class: 'wr-entry' },
        h('div', { class: 'wr-entryhead' },
          h('div', null,
            h('div', { class: 'wr-entryocc' }, oc ? oc.icon + ' ' + oc.label : L('Outfit', 'Tenue')),
            h('div', { class: 'list-sub' }, (hasTime ? d.toLocaleTimeString(S2.locale, { hour: '2-digit', minute: '2-digit' }) + ' · ' : '') + weatherText(e.temp, e.cond))),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Delete this entry', 'Supprimer cette entrée'), onclick: function () {
            ui.confirm({ title: L('Delete this entry?', 'Supprimer cette entrée ?'), message: L('It will be removed from your history; the clothes stay in your closet.', 'Elle sera retirée de l’historique ; les vêtements restent dans ta penderie.'), okLabel: L('Delete', 'Supprimer'), danger: true })
              .then(function (ok) { if (!ok) return; removeEntry(e.id); persist(); render(); ui.toast(L('Entry deleted', 'Entrée supprimée')); });
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
    var d = h('details', { class: 'card wr-insights' }, h('summary', null, L('📊 Insights', '📊 Statistiques')));
    d.appendChild(h('div', { class: 'stats wr-insstats' },
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, L('Pieces worn', 'Pièces portées')), h('div', { class: 'stat-value' }, worn.length + ' / ' + core.length)),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, L('Outfits this month', 'Tenues ce mois-ci')), h('div', { class: 'stat-value' }, thisMonth))));
    if (worn.length) { d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Most worn', 'Les plus portées'))); d.appendChild(names(worn.slice(0, 5), function (x) { return x.worn + '×'; })); }
    if (never.length) {
      d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Never worn · ', 'Jamais portées · ') + never.length));
      d.appendChild(names(never.slice(0, 8)));
      d.appendChild(h('p', { class: 'hint' }, L('Style them into a saved outfit, or consider giving them away.', 'Intègre-les à une tenue enregistrée, ou pense à les donner.')));
    }
    if (forgotten.length) { d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Not worn for 2 months+', 'Pas portées depuis 2 mois ou plus'))); d.appendChild(names(forgotten.slice(0, 6))); }
    if (priced.length) {
      d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Best value (cost per wear)', 'Meilleur rapport (coût par port)')));
      d.appendChild(names(priced.slice(0, 5).map(function (p) { return p.x; }), function (x) { return money(x.price / x.worn); }));
    } else d.appendChild(h('p', { class: 'hint' }, L('Add prices to your pieces to see their cost per wear.', 'Ajoute le prix de tes pièces pour voir leur coût par port.')));
    return d;
  }

  /* ----- Tenues enregistrées ----- */
  function renderOutfits() {
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', L('All', 'Toutes')], ['ready', L('Ready ✓', 'Prêtes ✓')]].concat(TAGS.map(function (t) { return [t.id, t.icon + ' ' + t.label]; })).map(function (f) {
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
      ? L(ready + ' of ' + data.outfits.length + ' outfit' + (data.outfits.length === 1 ? '' : 's') + ' ready to wear (nothing in the laundry).',
        ready + ' sur ' + data.outfits.length + (data.outfits.length > 1 ? ' tenues' : ' tenue') + (ready > 1 ? ' prêtes' : ' prête') + ' à porter (rien au linge).')
      : L('Save your favourite combinations here: you will see at a glance which ones are ready and where each piece is stored.', 'Enregistre ici tes combinaisons préférées : tu verras d’un coup d’œil lesquelles sont prêtes et où chaque pièce est rangée.')));
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
    if (data.outfits.length && !list.length) root.appendChild(h('p', { class: 'muted' }, L('No outfit matches this filter.', 'Aucune tenue ne correspond à ce filtre.')));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editOutfit(null); } }, L('+ New outfit', '+ Nouvelle tenue'))));
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
      var name = h('input', { class: 'input', type: 'text', value: meta.name, placeholder: L('e.g. Friday office look', 'ex. Look bureau du vendredi'), 'aria-label': L('Outfit name', 'Nom de la tenue'), autocapitalize: 'sentences' });
      name.addEventListener('input', function () { meta.name = name.value; });
      var note = h('input', { class: 'input', type: 'text', value: meta.note, placeholder: L('e.g. Roll up the sleeves', 'ex. Retrousser les manches'), 'aria-label': L('Note', 'Note') });
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
        if (!meta.name) { err.textContent = L('Give the outfit a name.', 'Donne un nom à la tenue.'); err.hidden = false; return; }
        if (!draft.top || !draft.bottom || !draft.shoes) { err.textContent = L('Pick at least a top, a bottom and shoes.', 'Choisis au moins un haut, un bas et des chaussures.'); err.hidden = false; return; }
        if (!meta.occasions.length) { err.textContent = L('Pick at least one context.', 'Choisis au moins un contexte.'); err.hidden = false; return; }
        var items = {};
        CORE.forEach(function (c) { items[c.id] = draft[c.id] ? draft[c.id].id : null; });
        var rec = { id: of ? of.id : ui.uid(), name: meta.name, occasions: meta.occasions, items: items, note: meta.note.trim() };
        if (isNew) data.outfits.push(rec); else data.outfits[data.outfits.indexOf(of)] = rec;
        persist(); close(); render(); ui.toast(isNew ? L('Outfit saved', 'Tenue enregistrée') : L('Outfit updated', 'Tenue mise à jour'));
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New outfit', 'Nouvelle tenue') : L('Edit outfit', 'Modifier la tenue')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Name', 'Nom')), name),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Good for', 'Convient pour')), occWrap),
        h('p', { class: 'hint' }, L('All your clothes are listed, even those in the laundry (🧺).', 'Tous tes vêtements sont listés, même ceux au linge (🧺).')),
        piecePicker(draft, false),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Note (optional)', 'Note (facultatif)')), note),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? L('Save the outfit', 'Enregistrer la tenue') : L('Save changes', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            ui.confirm({ title: L('Delete “' + of.name + '”?', 'Supprimer « ' + of.name + ' » ?'), message: L('The outfit is removed; the clothes stay in your closet.', 'La tenue est supprimée ; les vêtements restent dans ta penderie.'), okLabel: L('Delete', 'Supprimer'), danger: true })
              .then(function (ok) { if (!ok) return; data.outfits = data.outfits.filter(function (x) { return x.id !== of.id; }); persist(); close(); render(); });
          } }, L('Delete this outfit', 'Supprimer cette tenue')))
      ];
    }, { modal: true });
  }

  /* Guide des couleurs (paires, trios, chaussures) consultable. */
  function colourGuide() {
    var d = h('details', { class: 'card wr-guide' }, h('summary', null, L('🎨 Colour guide', '🎨 Guide des couleurs')));
    d.appendChild(h('p', { class: 'hint' }, L('The suggestions use these proven menswear combinations, filtered by your palette (My Style): neutrals as a base, light/dark contrast, and shoes matched to the trousers.', 'Les suggestions s’appuient sur ces associations éprouvées de la mode masculine, filtrées par ta palette (Mon style) : des neutres en base, un contraste clair/foncé et des chaussures assorties au pantalon.')));
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Trios', 'Trios')));
    COMBOS.trios.forEach(function (t) {
      d.appendChild(h('div', { class: 'wr-guiderow' }, swatch(t[0]), swatch(t[1]), swatch(t[2]), h('span', null, t[3])));
    });
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Pairs', 'Paires')));
    COMBOS.pairs.forEach(function (p) {
      d.appendChild(h('div', { class: 'wr-guiderow' }, swatch(p[0]), swatch(p[1]), h('span', null, p[2])));
    });
    d.appendChild(h('div', { class: 'field-label wr-pickhead' }, L('Shoes for each trouser colour', 'Chaussures selon la couleur du pantalon')));
    Object.keys(COMBOS.shoes).forEach(function (b) {
      var r = COMBOS.shoes[b];
      d.appendChild(h('div', { class: 'wr-guiderow wr-guideshoes' }, swatch(b),
        h('span', null, h('strong', null, color(b).label + L(': ', ' : ')),
          r.good.map(function (c) { return color(c).label.toLowerCase(); }).join(', '),
          r.avoid ? h('span', { class: 'muted' }, L(' · avoid ', ' · à éviter : ') + r.avoid.map(function (c) { return color(c).label.toLowerCase(); }).join(', ')) : null)));
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
        h('h2', { class: 'sheet-title' }, L('My Style', 'Mon style')),
        h('p', { class: 'sheet-text' }, L('Structured street smart with oversized tailoring influences. Effortless but intentional: no loud branding, no bright colours. Creativity comes from proportion, texture and tonal play.', 'Street smart structuré, avec des influences tailoring oversize. Naturel mais réfléchi : pas de logos voyants, pas de couleurs vives. La créativité vient des proportions, des matières et du ton sur ton.')),
        h('p', { class: 'note' }, L('These are guidelines, not rules. A great outfit that bends one beats a safe outfit that follows them all: look for ✦ Creative pick.', 'Ce sont des repères, pas des règles. Une belle tenue qui en plie un bat une tenue sage qui les suit tous : cherche ✦ Choix créatif.')),
        h('div', { class: 'wr-dna' },
          rule('📐', L('Silhouette', 'Silhouette'), h('div', null,
            p(L('Strong contrast: a fitted or structured top with wide, draped trousers or jeans. Both pieces can have volume when the look still feels intentional (e.g. tonal).', 'Contraste fort : un haut ajusté ou structuré avec un pantalon ou un jean large et fluide. Les deux pièces peuvent avoir du volume si la tenue reste intentionnelle (ex. ton sur ton).')),
            p(L('Outerwear cropped or waist-length to keep the proportion; long coats worn open.', 'Vestes courtes ou à la taille pour garder la proportion ; manteaux longs portés ouverts.')))),
          rule('🎨', L('Colour', 'Couleur'), h('div', null,
            h('div', { class: 'wr-dnaswatches' }, DNA.palette.map(function (c) {
              return h('span', { class: 'wr-dnaswatch' }, swatch(c, true), h('span', null, color(c).label));
            })),
            p(L('Tonal outfits work extremely well (all black, all cream, all brown, all grey); otherwise lean on shades of the same family. 2–3 colours look cleaner; a subtle extra colour in an accessory or a pattern adds personality.', 'Le ton sur ton marche très bien (tout noir, tout crème, tout marron, tout gris) ; sinon, joue sur les nuances d’une même famille. 2–3 couleurs font plus net ; une couleur en plus, discrète, dans un accessoire ou un motif, ajoute de la personnalité.')))),
          rule('🧵', L('Pattern & texture', 'Motif & matière'), h('div', null,
            p(L('One statement piece with a subtle pattern: thin stripe, plaid, houndstooth, tonal pinstripe.', 'Une pièce forte au motif discret : fine rayure, carreaux, pied-de-poule, rayure ton sur ton.')),
            p(L('Mix textures: leather over a plain tee, fleece over smooth trousers, a knit over a fitted shirt. One statement texture is usually enough.', 'Mélange les matières : du cuir sur un t-shirt uni, de la polaire avec un pantalon lisse, de la maille sur une chemise ajustée. Une seule matière forte suffit en général.')))),
          rule('👞', L('Shoes', 'Chaussures'), p(L('Tend to be dark and structured. A tendency, not a rule.', 'Plutôt foncées et structurées. Une tendance, pas une règle.'))),
          rule('🌡️', L('Layering', 'Superposition'), h('div', null,
            p(L('Each layer visible and intentional: a base peeking at the collar or hem, a mid layer adding structure or texture, an outer layer completing the silhouette.', 'Chaque couche visible et voulue : une base qui dépasse au col ou à l’ourlet, une couche intermédiaire qui apporte structure ou matière, une veste qui complète la silhouette.')),
            h('ul', { class: 'wr-dnalist' },
              h('li', null, L('Above ' + DNA.baseOnlyAbove + ' °C: base layer is enough', 'Au-dessus de ' + DNA.baseOnlyAbove + ' °C : la 1re couche suffit')),
              h('li', null, DNA.midLayerFrom + '–' + DNA.baseOnlyAbove + L(' °C: a mid layer adds depth', ' °C : une couche intermédiaire donne de la profondeur')),
              h('li', null, L('Below ' + DNA.outerBelow + ' °C: outerwear feels natural', 'Sous ' + DNA.outerBelow + ' °C : une veste s’impose naturellement')),
              h('li', null, L('Below ' + DNA.outerStrongBelow + ' °C: outerwear is the right call', 'Sous ' + DNA.outerStrongBelow + ' °C : le manteau est le bon choix'))),
            p(L('Soft guidance: skipping layers on a warm day or adding more on a cool one is equally valid.', 'Repère souple : enlever des couches quand il fait doux ou en ajouter quand il fait frais, c’est tout aussi valable.')))),
          rule('⌚', L('Accessories', 'Accessoires'), p(L('Subtle but present: a cap, a chain wallet, a necklace, a watch. One or two details (shown under each outfit) that finish the look without overpowering it.', 'Discrets mais présents : une casquette, une chaîne de portefeuille, un collier, une montre. Un ou deux détails (proposés sous chaque tenue) qui finissent la tenue sans l’écraser.')))),
        h('p', { class: 'hint' }, L('Read-only for now.', 'En lecture seule pour l’instant.')),
        h('div', { class: 'sheet-actions' }, h('button', { class: 'btn btn-primary btn-block', onclick: function () { close(); } }, L('Close', 'Fermer')))
      ];
    });
  }

  /* ----- Penderie ----- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function renderCloset() {
    if (!data.items.length) {
      root.appendChild(h('div', { class: 'card' },
        h('div', { class: 'card-title' }, L('Start your closet', 'Commence ta penderie')),
        h('p', { class: 'sheet-text' }, L('Add your clothes one by one, or load a starter set of basics in your palette that you can then edit, delete or complete.', 'Ajoute tes vêtements un par un, ou charge un kit de base dans ta palette, que tu pourras ensuite modifier, supprimer ou compléter.')),
        h('div', { class: 'stack' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () { editItem(null); } }, L('+ Add a piece of clothing', '+ Ajouter un vêtement')),
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            ui.confirm({ title: L('Load the starter set?', 'Charger le kit de base ?'), message: L('32 basic pieces (jackets, sweaters, shirts, trousers, shoes, accessories…) will be added. Edit or delete them to match your real closet.', '32 pièces de base (vestes, pulls, chemises, pantalons, chaussures, accessoires…) seront ajoutées. Modifie-les ou supprime-les pour coller à ta vraie penderie.'), okLabel: L('Load the starter set', 'Charger le kit') })
              .then(function (ok) { if (!ok) return; data.items = data.items.concat(starter()); persist(); render(); ui.toast(L('Starter set added', 'Kit de base ajouté')); });
          } }, L('Load a starter set', 'Charger un kit de base')))));
      return;
    }
    var ess = E.essentials(data.items), owned = ess.filter(function (x) { return x.have.length; }).length;
    root.appendChild(h('button', { class: 'card wr-shopentry', onclick: function () { view = 'shop'; render(); window.scrollTo(0, 0); } },
      h('span', { class: 'wr-shopicon', 'aria-hidden': 'true' }, '🛍'),
      h('span', { class: 'wr-piecemain' },
        h('span', { class: 'wr-piecename' }, L('Complete your wardrobe', 'Compléter ma garde-robe')),
        h('span', { class: 'list-sub' }, L('Style essentials ' + owned + ' / ' + ess.length + ' · see which purchases unlock the most outfits', 'Indispensables ' + owned + ' / ' + ess.length + ' · les achats qui débloquent le plus de tenues'))),
      h('span', { class: 'chev', 'aria-hidden': 'true' }, '›')));
    var search = h('input', { class: 'input wr-search', type: 'search', value: closetQuery, autocomplete: 'off', enterkeyhint: 'search',
      placeholder: L('Search name, colour, type, place…', 'Nom, couleur, type, endroit…'), 'aria-label': L('Search the closet', 'Chercher dans la penderie') });
    var results = h('div');
    search.addEventListener('input', function () { closetQuery = search.value; paintCloset(results); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') search.blur(); });
    root.appendChild(h('div', { class: 'wr-searchwrap' }, search,
      h('button', { class: 'btn btn-ghost btn-sm wr-selbtn', onclick: function () { selecting = !selecting; selected = {}; render(); } }, selecting ? L('Done', 'OK') : L('Select', 'Sélection'))));
    root.appendChild(h('div', { class: 'wr-filters' },
      [['all', L('All', 'Tout')], ['clean', L('Clean', 'Propres')], ['laundry', L('🧺 Laundry', '🧺 Au linge')]].concat(TAGS.map(function (t) { return [t.id, t.icon + ' ' + t.label]; })).map(function (f) {
        return h('button', { class: 'wr-pill' + (closetFilter === f[0] ? ' is-active' : ''), onclick: function () { closetFilter = f[0]; render(); } }, f[1]);
      })));
    root.appendChild(results);
    paintCloset(results);
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editItem(null); } }, L('+ Add a piece of clothing', '+ Ajouter un vêtement'))));
    if (selecting) { root.appendChild(h('div', { class: 'wr-bulkpad', 'aria-hidden': 'true' })); root.appendChild(bulkBar()); }
  }

  /* Actions groupées sur les pièces sélectionnées. */
  function bulkBar() {
    var ids = Object.keys(selected).filter(function (k) { return selected[k]; });
    var picked = data.items.filter(function (x) { return ids.indexOf(x.id) > -1; });
    function done(msg) { persist(); render(); ui.toast(msg); }
    function act(label, fn) { return h('button', { class: 'btn btn-sm wr-bulkact', disabled: !picked.length, onclick: fn }, label); }
    return h('div', { class: 'wr-bulkbar', role: 'toolbar', 'aria-label': L('Selected pieces', 'Pièces sélectionnées') },
      h('span', { class: 'wr-bulkcount' }, picked.length + pl(picked.length, ' selected', ' selected', ' sélectionnée', ' sélectionnées')),
      h('div', { class: 'wr-bulkacts' },
        act(L('🧺 Laundry', '🧺 Linge'), function () { picked.forEach(function (x) { x.laundry = true; }); done(picked.length + L(' in the laundry', ' au linge')); }),
        act(L('Clean', 'Propre'), function () { picked.forEach(function (x) { x.laundry = false; x.wearsSinceWash = 0; }); done(picked.length + pl(picked.length, ' clean', ' clean', ' propre', ' propres')); }),
        act('★', function () { var on = !picked.every(function (x) { return x.fav; }); picked.forEach(function (x) { x.fav = on; }); done(on ? L('Marked as favourites', 'Ajoutées aux favoris') : L('Favourites removed', 'Retirées des favoris')); }),
        act(L('Contexts', 'Contextes'), function () { bulkTags(picked); }),
        act(L('Place', 'Endroit'), function () { bulkPlace(picked); }),
        act(L('Delete', 'Supprimer'), function () {
          ui.confirm({ title: L('Delete ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's') + '?', 'Supprimer ' + picked.length + (picked.length > 1 ? ' pièces' : ' pièce') + ' ?'), message: L('They will be removed from your closet and from saved outfits. Your history keeps their names.', 'Elles seront retirées de ta penderie et des tenues enregistrées. L’historique garde leur nom.'), okLabel: L('Delete', 'Supprimer'), danger: true })
            .then(function (ok) {
              if (!ok) return;
              picked.forEach(function (x) {
                data.outfits.forEach(function (of) { if (of.items[x.cat] === x.id) of.items[x.cat] = null; });
                delete photos[x.id];
              });
              data.items = data.items.filter(function (x) { return ids.indexOf(x.id) < 0; });
              savePhotos(); selected = {}; done(L('Deleted', 'Supprimé'));
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
      function paint() { wrap.innerHTML = ''; wrap.appendChild(row(L('Add', 'Ajouter'), add, remove)); wrap.appendChild(row(L('Remove', 'Retirer'), remove, add)); }
      paint();
      return [h('h2', { class: 'sheet-title' }, L('Contexts for ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's'), 'Contextes pour ' + picked.length + (picked.length > 1 ? ' pièces' : ' pièce'))), wrap,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            picked.forEach(function (x) {
              Object.keys(add).forEach(function (t) { if (add[t] && x.occasions.indexOf(t) < 0) x.occasions.push(t); });
              x.occasions = x.occasions.filter(function (t) { return !remove[t]; });
              if (!x.occasions.length) x.occasions = ['chill'];
            });
            close(); persist(); render(); ui.toast(L('Contexts updated', 'Contextes mis à jour'));
          } }, L('Apply', 'Appliquer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))];
    }, { modal: true });
  }
  function bulkPlace(picked) {
    ui.sheet(function (close) {
      var inp = h('input', { class: 'input', type: 'text', placeholder: L('e.g. Wardrobe left, 2nd shelf', 'ex. Armoire gauche, 2e étagère'), 'aria-label': L('Storage place', 'Endroit de rangement'), autocapitalize: 'sentences' });
      return [h('h2', { class: 'sheet-title' }, L('Storage place for ' + picked.length + ' piece' + (picked.length === 1 ? '' : 's'), 'Rangement de ' + picked.length + (picked.length > 1 ? ' pièces' : ' pièce'))),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Where are they stored?', 'Où sont-elles rangées ?')), inp),
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            picked.forEach(function (x) { x.location = inp.value.trim(); }); close(); persist(); render(); ui.toast(L('Storage place updated', 'Rangement mis à jour'));
          } }, L('Apply', 'Appliquer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))];
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
        var hs = norm([x.name, x.subtype, kindLabel(x.subtype), color(x.color).label, formality(x.formality).label, x.material, materialLabel(x.material), x.pattern, patternLabel(x.pattern), x.fit, x.brand, x.location, x.notes, c.label].join(' '));
        return tokens.every(function (t) { return hs.indexOf(t) > -1; });
      }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      shown += list.length;
      if (!list.length) { if (!tokens.length && closetFilter === 'all') { box.appendChild(h('h2', { class: 'section-title' }, c.label + ' · 0')); box.appendChild(h('p', { class: 'hint' }, L('None yet (', 'Rien pour l’instant (') + c.hint.toLowerCase() + ').')); } return; }
      box.appendChild(h('h2', { class: 'section-title' }, c.label + ' · ' + list.length));
      box.appendChild(h('div', { class: 'list' }, list.map(itemRow)));
    });
    if (!shown && (tokens.length || closetFilter !== 'all')) box.appendChild(h('p', { class: 'muted wr-noresult' }, L('Nothing matches.', 'Aucun résultat.')));
  }

  function itemRow(x) {
    var sub = [kindLabel(x.subtype), color(x.color).label, x.cat !== 'acc' && x.cat !== 'shoes' && x.fit !== 'regular' ? FIT_SHORT[x.fit === 'slim' ? 'slim' : 'wide'] : null,
      x.cat !== 'acc' ? formality(x.formality).label : null,
      x.washEvery > 0 && x.wearsSinceWash ? x.wearsSinceWash + '/' + x.washEvery + L(' wears', ' ports') : null].filter(Boolean).join(' · ');
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
      x.laundry ? h('span', { class: 'badge wr-dirtybadge' }, L('Laundry', 'Au linge')) : h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function editItem(x, prefill, onSaved) {
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
      function pills(options, key, label) {
        return h('div', { class: 'wr-filters wr-filters-wrap' }, options.map(function (o) {
          var on = draft[key] === o;
          return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { draft[key] = on ? null : o; paint(); } }, label ? label(o) : o);
        }));
      }
      function toggleRow(label, key) {
        return h('button', { class: 'wr-rain' + (draft[key] ? ' is-active' : ''), type: 'button', role: 'switch', 'aria-checked': draft[key] ? 'true' : 'false',
          onclick: function () { draft[key] = !draft[key]; paint(); } }, h('span', null, label), h('span', { class: 'wr-toggle', 'aria-hidden': 'true' }));
      }
      function paint() {
        var isAcc = draft.cat === 'acc';
        body.innerHTML = '';
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Type', 'Type')),
          seg(CATS.map(function (c) { return [c.id, c.short]; }), 'cat', function () {
            if (draft.subtype && cat(draft.cat).subtypes.indexOf(draft.subtype) < 0) draft.subtype = null;
          })));
        /* Sorte : pour une nouvelle pièce, remplit automatiquement coupe, matière, style, contextes, lavage… */
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, isAcc ? L('Kind', 'Modèle') : L('Kind (recommended)', 'Modèle (conseillé)')),
          h('div', { class: 'wr-filters wr-filters-wrap' }, cat(draft.cat).subtypes.map(function (o) {
            var on = draft.subtype === o;
            return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () {
                if (on) { draft.subtype = null; }
                else if (isNew) { E.applyDefaults(draft, o); defaultsNote = L('Filled in for ' + o.toLowerCase() + ': fit, material, style, contexts and washing. Adjust if needed.', 'Rempli pour « ' + kindLabel(o).toLowerCase() + ' » : coupe, matière, style, contextes et lavage. Ajuste si besoin.'); }
                else draft.subtype = o;
                paint();
              } }, kindLabel(o));
          })),
          defaultsNote ? h('p', { class: 'hint wr-defaults' }, '✓ ' + defaultsNote) : null));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Colour · ', 'Couleur · ') + color(draft.color).label + (inPalette(draft.color) ? '' : L(' (outside your palette)', ' (hors de ta palette)'))),
          h('div', { class: 'wr-colors' }, COLORS.map(function (c) {
            return h('button', { class: 'wr-color' + (draft.color === c.id ? ' is-active' : ''), type: 'button', 'aria-label': c.label,
              'aria-pressed': draft.color === c.id ? 'true' : 'false', style: { background: c.hex }, onclick: function () { draft.color = c.id; paint(); } });
          }))));
        if (!isAcc && draft.cat !== 'shoes') body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Fit', 'Coupe')), seg(FITS, 'fit')));
        if (draft.cat === 'outer') {
          if (!draft.length) draft.length = 'hip';
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Length', 'Longueur')), seg(LENGTHS, 'length')));
        }
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Pattern', 'Motif')), seg(PATTERNS, 'pattern')));
        if (!isAcc) body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Style', 'Style')), seg(FORMALITY.map(function (f) { return [f.id, f.label]; }), 'formality')));
        if (!isAcc) body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Warmth', 'Chaleur')),
          seg([[1, WARMTH[1]], [2, WARMTH[2]], [3, WARMTH[3]]], 'warmth')));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Material (optional)', 'Matière (facultatif)')), pills(MATERIALS, 'material', materialLabel)));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Good for', 'Convient pour')),
          h('div', { class: 'wr-filters wr-filters-wrap' }, TAGS.map(function (t) {
            var on = draft.occasions.indexOf(t.id) > -1;
            return h('button', { class: 'wr-pill' + (on ? ' is-active' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () { if (on) draft.occasions = draft.occasions.filter(function (i) { return i !== t.id; }); else draft.occasions.push(t.id); paint(); } },
              t.icon + ' ' + t.label);
          }))));
        if (draft.cat === 'outer' || draft.cat === 'shoes') body.appendChild(toggleRow(L('☔ OK in the rain', '☔ Va sous la pluie'), 'rainOk'));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Wears before washing', 'Ports avant lavage')),
          h('div', { class: 'stepper wr-washstep' },
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': L('One wear less', 'Un port de moins'), onclick: function () { draft.washEvery = Math.max(0, (draft.washEvery || 0) - 1); paint(); } }, '−'),
            h('span', { class: 'wr-washval' }, draft.washEvery > 0 ? draft.washEvery + pl(draft.washEvery, ' wear', ' wears', ' port', ' ports') : L('Never', 'Jamais')),
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': L('One wear more', 'Un port de plus'), onclick: function () { draft.washEvery = Math.min(40, (draft.washEvery || 0) + 1); paint(); } }, '+')),
          h('p', { class: 'hint' }, draft.washEvery > 0 ? L('Suggested for the laundry after ' + draft.washEvery + ' wear' + (draft.washEvery === 1 ? '' : 's') + (draft.wearsSinceWash ? ' (worn ' + draft.wearsSinceWash + ' since last wash).' : '.'), 'Proposée au linge après ' + draft.washEvery + (draft.washEvery > 1 ? ' ports' : ' port') + (draft.wearsSinceWash ? ' (portée ' + draft.wearsSinceWash + ' fois depuis le lavage).' : '.')) : L('Never suggested for the laundry (leather, shoes, watch…).', 'Jamais proposée au linge (cuir, chaussures, montre…).'))));
        body.appendChild(toggleRow(L('★ Favourite (comes back more often)', '★ Favorite (revient plus souvent)'), 'fav'));
        body.appendChild(toggleRow(L('🧺 In the laundry (not available)', '🧺 Au linge (indisponible)'), 'laundry'));
      }
      /* Photo : compressée (320 px, JPEG) pour rester légère dans le stockage du téléphone. */
      var photoBox = h('div', { class: 'wr-photo' });
      var fileInp = h('input', { type: 'file', accept: 'image/*', class: 'sr-only', 'aria-label': L('Choose a photo', 'Choisir une photo') });
      fileInp.addEventListener('change', function () {
        var f = fileInp.files && fileInp.files[0]; fileInp.value = '';
        if (!f) return;
        compressImage(f, 320, 0.68).then(function (url) { photo = url; photoChanged = true; paintPhoto(); }, function () { ui.toast(L('This photo could not be read', 'Impossible de lire cette photo')); });
      });
      function paintPhoto() {
        photoBox.innerHTML = '';
        photoBox.appendChild(photo ? h('img', { class: 'wr-photoimg', src: photo, alt: L('Photo of the piece', 'Photo de la pièce') }) : h('div', { class: 'wr-photoempty', style: { background: color(draft.color).hex } }, '📷'));
        photoBox.appendChild(h('div', { class: 'wr-photobtns' },
          h('button', { class: 'btn btn-secondary btn-sm', type: 'button', onclick: function () { fileInp.click(); } }, photo ? L('Change photo', 'Changer la photo') : L('Add a photo', 'Ajouter une photo')),
          photo ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () { photo = null; photoChanged = true; paintPhoto(); } }, L('Remove', 'Retirer')) : null));
        photoBox.appendChild(fileInp);
      }
      paintPhoto();
      var price = h('input', { class: 'input', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': L('Price in euros', 'Prix en euros'),
        value: draft.price ? ui.num(draft.price) : '', placeholder: L('e.g. 79', 'ex. 79') });
      price.addEventListener('input', function () { draft.price = ui.parseNum(price.value); });
      paint();
      var name = h('input', { class: 'input', type: 'text', value: draft.name, placeholder: L('e.g. Navy Oxford shirt', 'ex. Chemise Oxford marine'), 'aria-label': L('Name', 'Nom'), autocapitalize: 'sentences' });
      name.addEventListener('input', function () { draft.name = name.value; });
      function save() {
        draft.name = draft.name.trim();
        var fail = !draft.name ? L('Give it a name.', 'Donne-lui un nom.') : !draft.occasions.length ? L('Pick at least one context in “Good for”.', 'Choisis au moins un contexte dans « Convient pour ».')
          : draft.cat === 'acc' && !draft.subtype ? L('Pick the kind of accessory (cap, scarf, watch…).', 'Choisis le modèle d’accessoire (casquette, écharpe, montre…).') : null;
        if (fail) { err.textContent = fail; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
        if (draft.cat !== 'outer' && draft.cat !== 'shoes') draft.rainOk = false;
        ['location', 'brand', 'notes'].forEach(function (k) { draft[k] = (draft[k] || '').trim(); });
        if (!draft.laundry && x && x.laundry) draft.wearsSinceWash = 0;
        if (draft.price !== null && !(draft.price > 0)) draft.price = null;
        if (photoChanged) {
          if (photo) photos[draft.id] = photo; else delete photos[draft.id];
          if (!savePhotos()) { delete photos[draft.id]; ui.toast(L('Photo too big for the phone storage: export a backup and remove some photos', 'Photo trop lourde pour le stockage du téléphone : exporte une sauvegarde et supprime des photos')); }
        }
        if (isNew) data.items.push(draft);
        else {
          data.items[data.items.indexOf(x)] = draft;
          if (draft.cat !== x.cat) data.outfits.forEach(function (of) { if (of.items[x.cat] === x.id) of.items[x.cat] = null; });
        }
        if (onSaved) onSaved(draft);
        persist(); close(); render(); ui.toast(isNew ? L('Added to your closet', 'Ajoutée à ta penderie') : L('Saved', 'Enregistré'));
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New piece', 'Nouvelle pièce') : L('Edit piece', 'Modifier la pièce')),
        photoBox,
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Name', 'Nom')), name),
        body,
        textInput(L('Where is it stored? (optional)', 'Où est-elle rangée ? (facultatif)'), 'location', L('e.g. Wardrobe left, 2nd shelf', 'ex. Armoire gauche, 2e étagère')),
        textInput(L('Brand (optional)', 'Marque (facultatif)'), 'brand', L('e.g. Uniqlo', 'ex. Uniqlo')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Price in € (optional, for cost per wear)', 'Prix en € (facultatif, pour le coût par port)')), price),
        textInput(L('Notes (optional)', 'Notes (facultatif)'), 'notes', L('e.g. Iron before wearing', 'ex. Repasser avant de porter')),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? L('Add to closet', 'Ajouter à la penderie') : L('Save', 'Enregistrer')),
          isNew ? null : h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
            var copy = JSON.parse(JSON.stringify(x));
            copy.id = ui.uid(); copy.name = x.name + L(' (copy)', ' (copie)'); copy.laundry = false; copy.worn = 0; copy.wearsSinceWash = 0; copy.lastWorn = null;
            copy._photo = photos[x.id] || null;
            close(); setTimeout(function () { editItem(null, copy); }, 250);
          } }, L('Duplicate (same kind, other colour)', 'Dupliquer (même modèle, autre couleur)')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            var used = data.outfits.filter(function (of) { return of.items[x.cat] === x.id; });
            ui.confirm({ title: L('Delete “' + x.name + '”?', 'Supprimer « ' + x.name + ' » ?'), message: L('It will be removed from your closet' + (used.length ? ' and from ' + used.length + ' saved outfit' + (used.length === 1 ? '' : 's') : '') + '. Your history keeps its name.', 'Elle sera retirée de ta penderie' + (used.length ? ' et de ' + used.length + (used.length > 1 ? ' tenues enregistrées' : ' tenue enregistrée') : '') + '. L’historique garde son nom.'), okLabel: L('Delete', 'Supprimer'), danger: true })
              .then(function (ok) {
                if (!ok) return;
                data.items = data.items.filter(function (i) { return i.id !== x.id; });
                used.forEach(function (of) { of.items[x.cat] = null; });
                if (photos[x.id]) { delete photos[x.id]; savePhotos(); }
                persist(); close(); render();
              });
          } }, L('Delete', 'Supprimer')))
      ];
    }, { modal: true });
  }

  /* ----- Compléter la garde-robe : achats conseillés, indispensables, liste d'envies ----- */
  var shopCache = { rev: -1, result: null };
  function wishKey(kind, col, pattern) { return kind + '|' + col + '|' + (pattern || 'solid'); }
  function inWish(v) { var k = wishKey(v.subtype, v.color, v.pattern); return data.wishlist.some(function (w) { return wishKey(w.kind, w.color, w.pattern) === k; }); }
  function toggleWish(v) {
    var k = wishKey(v.subtype, v.color, v.pattern);
    if (inWish(v)) data.wishlist = data.wishlist.filter(function (w) { return wishKey(w.kind, w.color, w.pattern) !== k; });
    else data.wishlist.push({ id: ui.uid(), kind: v.subtype, color: v.color, pattern: v.pattern || 'solid', name: v.name, added: today() });
    saveQuiet(); render();
  }
  /* « I bought it » : ouvre la fiche pré-remplie ; une fois enregistrée, la pièce quitte la liste d'envies. */
  function bought(v) {
    var prefill = JSON.parse(JSON.stringify(v));
    delete prefill.virtual; prefill.id = ui.uid();
    editItem(null, prefill, function () {
      var k = wishKey(v.subtype, v.color, v.pattern);
      data.wishlist = data.wishlist.filter(function (w) { return wishKey(w.kind, w.color, w.pattern) !== k; });
    });
  }
  function shopButtons(v) {
    var wished = inWish(v);
    return h('div', { class: 'wr-buybtns' },
      h('button', { class: 'btn btn-sm ' + (wished ? 'btn-primary' : 'btn-secondary'), 'aria-pressed': wished ? 'true' : 'false', onclick: function () { toggleWish(v); } }, wished ? L('♥ In wishlist', '♥ Dans mes envies') : L('♡ Wishlist', '♡ Envie')),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { bought(v); } }, L('I bought it', 'Je l’ai acheté')));
  }
  function pieceDesc(v) {
    return [catLabel(v.cat), v.fit && v.fit !== 'regular' && v.cat !== 'shoes' ? FIT_SHORT[v.fit === 'slim' ? 'slim' : 'wide'] : null,
      v.length && v.cat === 'outer' ? lengthLabel(v.length) : null,
      v.pattern && v.pattern !== 'solid' ? patternLabel(v.pattern) : null].filter(Boolean).join(' · ');
  }
  function runShop(done) {
    if (shopCache.rev === rev && shopCache.result) { done(); return; }
    var plan = E.planShopping(data.items, { prefs: data.prefs });
    var res = [], i = 0, n = plan.candidates.length;
    (function step() {
      var end = Math.min(n, i + 10);
      for (; i < end; i++) res.push(E.evaluateCandidate(plan, plan.candidates[i]));
      var bar = document.getElementById('wr-shopprog');
      if (bar) bar.style.width = Math.round(i / n * 100) + '%';
      if (i < n) setTimeout(step, 0);
      else { shopCache = { rev: rev, result: { buys: E.rankShopping(res, 8), gaps: E.contextGaps(plan) } }; done(); }
    })();
  }

  function renderShop() {
    root.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: function () { view = 'closet'; render(); } }, L('‹ Closet', '‹ Penderie')));
    root.appendChild(h('h2', { class: 'page-title' }, L('Complete your wardrobe', 'Compléter ma garde-robe')));
    root.appendChild(h('p', { class: 'hint' }, L('Calculated from your closet and your style guidelines, across 6 typical days (weekend, office, date night, summer, cold city day, wedding). Pieces in the laundry count as owned. Nothing is fetched or bought for you.', 'Calculé à partir de ta penderie et de tes repères de style, sur 6 journées types (week-end, bureau, rendez-vous, été, journée froide en ville, mariage). Les pièces au linge comptent comme possédées. Rien n’est récupéré ni acheté à ta place.')));
    var box = h('div');
    root.appendChild(box);
    if (shopCache.rev === rev && shopCache.result) paintShop(box);
    else {
      box.appendChild(h('div', { class: 'card wr-analysing' }, h('p', { class: 'sheet-text' }, L('Analysing which pieces would unlock the most outfits…', 'Analyse des pièces qui débloqueraient le plus de tenues…')),
        h('div', { class: 'wr-prog' }, h('span', { id: 'wr-shopprog' }))));
      setTimeout(function () { runShop(function () { if (view === 'shop') { box.innerHTML = ''; paintShop(box); } }); }, 30);
    }
  }

  function paintShop(box) {
    var r = shopCache.result;
    /* Meilleurs achats */
    box.appendChild(h('h2', { class: 'section-title' }, L('Best next buys', 'Meilleurs prochains achats')));
    if (!r.buys.length) box.appendChild(h('p', { class: 'muted' }, L('Your closet already covers these days well. Check the essentials below.', 'Ta penderie couvre déjà bien ces journées. Jette un œil aux indispensables plus bas.')));
    r.buys.forEach(function (b, idx) {
      var v = b.piece, reasons = [];
      if (b.unlocked) reasons.push(L('Unlocks ' + b.unlocked + ' new outfit' + (b.unlocked === 1 ? '' : 's') + (b.partners ? ' with ' + b.partners + ' of your pieces' : ''),
        'Débloque ' + b.unlocked + (b.unlocked > 1 ? ' nouvelles tenues' : ' nouvelle tenue') + (b.partners ? ' avec ' + b.partners + ' de tes pièces' : '')));
      if (b.firsts.length) reasons.push(L('First outfit possible for: ', 'Première tenue possible pour : ') + b.firsts.join(', ').toLowerCase());
      if (b.improved.length) reasons.push(L('Upgrades your best look for: ', 'Améliore ta meilleure tenue pour : ') + b.improved.join(', ').toLowerCase());
      box.appendChild(h('div', { class: 'card wr-buy' },
        h('div', { class: 'wr-buyhead' },
          h('span', { class: 'wr-buyrank' }, idx + 1), swatch(v.color, true),
          h('div', { class: 'wr-piecemain' }, h('div', { class: 'wr-piecename' }, v.name), h('div', { class: 'list-sub' }, pieceDesc(v))),
          b.unlocked ? h('span', { class: 'badge wr-readybadge' }, '+' + b.unlocked) : null),
        h('ul', { class: 'wr-why' }, reasons.map(function (t) { return h('li', null, t); })),
        b.alternatives.length ? h('div', { class: 'wr-alts' }, h('span', { class: 'list-sub' }, L('Also works in', 'Existe aussi en')),
          b.alternatives.slice(0, 3).map(function (a) {
            return h('button', { class: 'wr-alt' + (inWish(a.piece) ? ' is-active' : ''), 'aria-label': L('Add ' + a.piece.name + ' to the wishlist', 'Ajouter ' + a.piece.name + ' à mes envies'), onclick: function () { toggleWish(a.piece); } },
              swatch(a.piece.color), color(a.piece.color).label);
          })) : null,
        shopButtons(v)));
    });

    /* Occasions impossibles */
    if (r.gaps.length) {
      box.appendChild(h('h2', { class: 'section-title' }, L('Days you can’t dress for yet', 'Journées encore sans tenue')));
      r.gaps.forEach(function (g) {
        box.appendChild(h('div', { class: 'card wr-gap' },
          h('div', { class: 'wr-piecename' }, g.occasion.icon + ' ' + g.label),
          h('p', { class: 'list-sub' }, L('Missing: ', 'Il manque : ') + g.slots.map(function (c) { return catLabel(c).toLowerCase(); }).join(', ') + L('. A simple set to start:', '. Un ensemble simple pour commencer :')),
          g.pieces.map(function (v) {
            return h('div', { class: 'wr-gaprow' }, swatch(v.color, true),
              h('div', { class: 'wr-piecemain' }, h('div', { class: 'wr-piecename' }, v.name), h('div', { class: 'list-sub' }, pieceDesc(v))), shopButtons(v));
          })));
      });
    }

    /* Indispensables du style */
    var ess = E.essentials(data.items), have = ess.filter(function (x) { return x.have.length; }).length;
    box.appendChild(h('h2', { class: 'section-title' }, L('Style essentials · ', 'Indispensables · ') + have + ' / ' + ess.length));
    box.appendChild(h('div', { class: 'list wr-esslist' }, ess.map(function (x) {
      var v = E.virtualPiece(x.e.kind, x.e.color, x.e.pattern);
      if (x.have.length) return h('div', { class: 'list-row wr-ess is-have' }, h('span', { class: 'wr-box', 'aria-hidden': 'true' }, '✓'),
        h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, x.e.label), h('div', { class: 'list-sub' }, x.have.slice(0, 2).map(function (p) { return p.name; }).join(', ') + (x.have.length > 2 ? ' +' + (x.have.length - 2) : ''))));
      return h('div', { class: 'list-row wr-ess' }, h('span', { class: 'wr-box', 'aria-hidden': 'true' }),
        h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, x.e.label), h('div', { class: 'list-sub' }, L('e.g. ', 'ex. ') + v.name.toLowerCase())),
        h('button', { class: 'btn btn-icon', 'aria-label': inWish(v) ? L('Remove ' + v.name + ' from the wishlist', 'Retirer ' + v.name + ' de mes envies') : L('Add ' + v.name + ' to the wishlist', 'Ajouter ' + v.name + ' à mes envies'), onclick: function () { toggleWish(v); } }, inWish(v) ? '♥' : '♡'));
    })));

    /* Liste d'envies */
    box.appendChild(h('h2', { class: 'section-title' }, L('Wishlist · ', 'Envies · ') + data.wishlist.length));
    if (!data.wishlist.length) box.appendChild(h('p', { class: 'hint' }, L('Tap ♡ on a suggestion to build your shopping list.', 'Touche ♡ sur une suggestion pour faire ta liste d’achats.')));
    else {
      box.appendChild(h('div', { class: 'list' }, data.wishlist.map(function (w) {
        var v = E.virtualPiece(w.kind, w.color, w.pattern);
        return h('div', { class: 'list-row wr-row' }, swatch(w.color, true),
          h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, w.name), h('div', { class: 'list-sub' }, pieceDesc(v) + L(' · added ', ' · ajoutée le ') + ui.date(w.added))),
          h('button', { class: 'btn btn-secondary btn-sm', onclick: function () { bought(v); } }, L('Bought', 'Acheté')),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Remove ', 'Retirer ') + w.name, onclick: function () { toggleWish(v); } }, '✕'));
      })));
      box.appendChild(h('div', { class: 'bottom-actions' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
          var text = L('Wardrobe wishlist', 'Mes envies garde-robe') + '\n' + data.wishlist.map(function (w) { return '• ' + w.name; }).join('\n');
          if (navigator.share) navigator.share({ title: L('Wardrobe wishlist', 'Mes envies garde-robe'), text: text }).catch(function () {});
          else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { ui.toast(L('List copied', 'Liste copiée')); });
        } }, L('Share the list', 'Partager la liste'))));
    }
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
      root.appendChild(h('div', { class: 'empty-state small' }, h('p', null, L('🧺 Nothing in the laundry. Everything is ready to wear.', '🧺 Rien au linge. Tout est prêt à porter.'))));
      return;
    }
    root.appendChild(h('p', { class: 'hint' }, L(list.length + ' item' + (list.length === 1 ? '' : 's') + ' not available. Tap “Clean” when an item is washed and dry.', list.length + (list.length > 1 ? ' pièces indisponibles' : ' pièce indisponible') + '. Touche « Propre » quand une pièce est lavée et sèche.')));
    root.appendChild(h('div', { class: 'list' }, list.map(function (x) {
      return h('div', { class: 'list-row wr-row' }, thumb(x),
        h('div', { class: 'wr-rowmain' }, h('div', { class: 'list-title' }, x.name), h('div', { class: 'list-sub' }, catLabel(x.cat) + ' · ' + color(x.color).label)),
        h('button', { class: 'btn btn-secondary btn-sm', onclick: function () { x.laundry = false; x.wearsSinceWash = 0; persist(); render(); ui.toast(L(x.name + ' is clean', x.name + ' : propre')); } }, L('Clean ✓', 'Propre ✓')));
    })));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
        ui.confirm({ title: L('Everything is clean?', 'Tout est propre ?'), message: L('All ' + list.length + ' items will be available again.', list.length > 1 ? 'Les ' + list.length + ' pièces seront de nouveau disponibles.' : 'La pièce sera de nouveau disponible.'), okLabel: L('Mark all clean', 'Tout marquer propre') })
          .then(function (ok) { if (!ok) return; list.forEach(function (x) { x.laundry = false; x.wearsSinceWash = 0; }); persist(); render(); ui.toast(L('All clean', 'Tout est propre')); });
      } }, L('Laundry done: all clean', 'Lessive faite : tout est propre'))));
  }

  S2.app.registerTab({ id: 'garde-robe', label: L('Wardrobe', 'Garde-robe'), order: 20, icon: ICON, mount: mount });
  /* Exposé pour Réglages (« My Style ») et pour les tests. */
  S2.wardrobe = { score: score, openStyle: openStyle, occasions: OCCASIONS, dna: DNA, engine: E };
})();
