/* Onglet Muscu : programme 12 semaines, saisie des séances, progression, historique.
   Données : localStorage "sandeep2:muscu". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'muscu';
  var SCHEMA = 1;
  var WEEKS = 12;
  var RPE_CUTOFF = 9.5;
  var RPE_VALUES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  var CATS = {
    main:      { label: 'Mouvement principal', short: 'Principal',  rpe: [7.5, 8],  inc: '+2,5 kg' },
    secondary: { label: 'Composé secondaire',  short: 'Secondaire', rpe: [8, 8.5],  inc: '+2,5 kg' },
    isolation: { label: 'Isolation',           short: 'Isolation',  rpe: [8.5, 9],  inc: '+1 à 2 kg' }
  };

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>';

  /* ---------- Données ---------- */

  function slot(names, category, sets, repMin, repMax) {
    names = Array.isArray(names) ? names : [names];
    return {
      id: ui.uid(), category: category, sets: sets, repMin: repMin, repMax: repMax,
      options: names.map(function (n) { return { id: ui.uid(), name: n }; })
    };
  }

  function defaults() {
    return {
      schema: SCHEMA,
      days: [
        { id: 'legs', name: 'Legs', slots: [] },
        { id: 'push', name: 'Push', slots: [
          slot('Barbell Bench Press', 'main', 5, 5, 7),
          slot('Incline DB Press', 'secondary', 3, 8, 10),
          slot('Decline Barbell Press', 'secondary', 3, 8, 10),
          slot('Cable Crossover', 'isolation', 3, 12, 15),
          slot(['Close-Grip Bench', 'Skull Crusher'], 'secondary', 3, 8, 12)
        ] },
        { id: 'pull', name: 'Pull', slots: [
          slot('Rack Pull', 'main', 5, 5, 7),
          slot('Barbell Shrug', 'secondary', 3, 8, 12),
          slot('Pendlay Row', 'secondary', 4, 6, 8),
          slot('Cable Face Pull', 'isolation', 3, 12, 15),
          slot('DB Farmer Carry Shrug', 'isolation', 3, 10, 12)
        ] },
        { id: 'shoulders', name: 'Shoulders', slots: [
          slot('Overhead Press', 'main', 5, 5, 7)
        ] }
      ],
      /* session = { id, dayId, week, startedAt, finishedAt|null, choices: {slotId: exId},
                     entries: { exId: { sets: [{w, r, rpe, done}], snap: {name, category, sets, repMin, repMax} } } } */
      sessions: [],
      activeId: null
    };
  }

  var data = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.days)) {
      d = defaults();
      S2.storage.save(NS, d);
    }
    d.sessions = d.sessions || [];
    /* Futures migrations : if (d.schema < 2) { ... } */
    d.schema = SCHEMA;
    return d;
  }
  function persist() { S2.storage.save(NS, data); }

  function day(id) { return data.days.filter(function (d) { return d.id === id; })[0]; }
  function active() {
    if (!data.activeId) return null;
    var s = data.sessions.filter(function (x) { return x.id === data.activeId; })[0];
    if (!s) data.activeId = null;
    return s || null;
  }
  function finished() {
    return data.sessions.filter(function (s) { return s.finishedAt; })
      .sort(function (a, b) { return a.startedAt < b.startedAt ? -1 : 1; });
  }

  /* Trouve un exercice (option) dans le programme. */
  function findExercise(exId) {
    for (var i = 0; i < data.days.length; i++) {
      var d = data.days[i];
      for (var j = 0; j < d.slots.length; j++) {
        var s = d.slots[j];
        for (var k = 0; k < s.options.length; k++) {
          if (s.options[k].id === exId) return { day: d, slot: s, option: s.options[k] };
        }
      }
    }
    return null;
  }
  function exName(exId) {
    var f = findExercise(exId);
    if (f) return f.option.name;
    var hist = finished().reverse();
    for (var i = 0; i < hist.length; i++) {
      var e = hist[i].entries[exId];
      if (e && e.snap) return e.snap.name;
    }
    return 'Exercice supprimé';
  }
  function snapOf(s, option) {
    return { name: option.name, category: s.category, sets: s.sets, repMin: s.repMin, repMax: s.repMax };
  }

  /* Dernière séance terminée contenant cet exercice. */
  function lastPerf(exId, excludeId) {
    var list = finished();
    for (var i = list.length - 1; i >= 0; i--) {
      var s = list[i];
      if (s.id === excludeId) continue;
      var e = s.entries[exId];
      if (e && e.sets && e.sets.length) return { session: s, entry: e };
    }
    return null;
  }

  function isLogged(set) {
    return set && (set.done || set.w !== null || set.r !== null || set.rpe !== null);
  }
  /* Valeurs effectives d'une série : saisie, sinon valeur grisée de la dernière fois. */
  function effective(set, prev) {
    prev = prev || {};
    return {
      w: set.w !== null ? set.w : (prev.w !== undefined ? prev.w : null),
      r: set.r !== null ? set.r : (prev.r !== undefined ? prev.r : null),
      rpe: set.rpe !== null ? set.rpe : (prev.rpe !== undefined ? prev.rpe : null)
    };
  }
  function prevSet(prevEntry, i) {
    if (!prevEntry || !prevEntry.sets.length) return null;
    return prevEntry.sets[Math.min(i, prevEntry.sets.length - 1)];
  }

  /* ---------- Calculs ---------- */

  function e1rm(w, r) {
    if (!w || !r) return 0;
    return w * (1 + r / 30);
  }
  function bestSet(sets) {
    var best = null, bestV = 0;
    (sets || []).forEach(function (s, i) {
      var v = e1rm(s.w, s.r);
      if (v > bestV) { bestV = v; best = i; }
    });
    return best === null ? null : { index: best, value: bestV };
  }

  /* Double progression. sets = séries effectives (w, r, rpe), snap = config de l'exercice. */
  function progression(sets, snap) {
    if (!sets.length) return null;
    var cat = CATS[snap.category] || CATS.secondary;
    var topW = Math.max.apply(null, sets.map(function (s) { return s.w || 0; }));
    var wTxt = topW ? num(topW) + ' kg' : 'la même charge';
    if (sets.some(function (s) { return s.r === null || s.w === null; })) {
      return { type: 'info', text: 'Complète poids et reps pour obtenir une suggestion.' };
    }
    if (sets.some(function (s) { return s.rpe === null; })) {
      return { type: 'info', text: 'Renseigne le RPE de chaque série pour obtenir une suggestion.' };
    }
    if (sets.length < snap.sets) {
      return { type: 'keep', text: 'Garder ' + wTxt,
        detail: sets.length + ' série(s) sur ' + snap.sets + ' faites.' };
    }
    var high = sets.some(function (s) { return s.rpe >= RPE_CUTOFF; });
    var allTop = sets.every(function (s) { return s.r >= snap.repMax; });
    if (allTop && !high) {
      return { type: 'up', text: 'Augmenter la charge (' + cat.inc + ')',
        detail: 'Toutes les séries à ' + snap.repMax + ' reps avec un RPE < 9,5.' };
    }
    if (high) {
      return { type: 'keep', text: 'Garder ' + wTxt,
        detail: 'RPE ≥ 9,5 sur au moins une série : consolider avant d’augmenter.' };
    }
    return { type: 'keep', text: 'Garder ' + wTxt,
      detail: 'Viser ' + snap.repMax + ' reps sur toutes les séries.' };
  }

  function rpeRange(cat) {
    var c = CATS[cat] || CATS.secondary;
    return num(c.rpe[0]) + '–' + num(c.rpe[1]);
  }
  function setsSummary(sets) {
    return sets.map(function (s) {
      return num(s.w) + '×' + (s.r === null ? '?' : s.r) + (s.rpe !== null && s.rpe !== undefined ? ' @' + num(s.rpe) : '');
    }).join(' · ');
  }

  /* ---------- État d'interface ---------- */

  var view = 'session';        // session | history | program
  var historyMode = 'exercises'; // exercises | sessions
  var historyEx = null;        // exId affiché en détail
  var programDay = 'push';
  var pickDay = null, pickWeek = null;
  var root = null;

  function mount(container) {
    data = loadData();
    root = container;
    render();
  }

  function go(v, opts) {
    view = v;
    if (opts && opts.ex !== undefined) historyEx = opts.ex;
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    root.innerHTML = '';
    var tabs = [['session', active() ? 'Séance en cours' : 'Séance'], ['history', 'Historique'], ['program', 'Programme']];
    root.appendChild(h('div', { class: 'segmented mu-nav', role: 'tablist' },
      tabs.map(function (t) {
        return h('button', { class: 'seg' + (view === t[0] ? ' is-active' : ''), role: 'tab',
          'aria-selected': view === t[0] ? 'true' : 'false',
          onclick: function () { historyEx = null; go(t[0]); } }, t[1]);
      })));
    var body = h('div', { class: 'mu-body' });
    root.appendChild(body);
    if (view === 'session') (active() ? renderActive : renderStart)(body);
    else if (view === 'history') renderHistory(body);
    else renderProgram(body);
  }

  /* ---------- Démarrer une séance ---------- */

  function renderStart(body) {
    var done = finished();
    var last = done[done.length - 1];
    if (pickWeek === null) pickWeek = last ? last.week : 1;

    body.appendChild(h('h2', { class: 'section-title' }, 'Nouvelle séance'));

    var grid = h('div', { class: 'mu-daygrid' });
    data.days.forEach(function (d) {
      var lastOfDay = done.filter(function (s) { return s.dayId === d.id; }).pop();
      grid.appendChild(h('button', {
        class: 'mu-daybtn' + (pickDay === d.id ? ' is-active' : ''),
        'aria-pressed': pickDay === d.id ? 'true' : 'false',
        onclick: function () { pickDay = d.id; render(); }
      },
        h('span', { class: 'mu-dayname' }, d.name),
        h('span', { class: 'mu-daymeta' }, d.slots.length + ' exercice' + (d.slots.length > 1 ? 's' : '')),
        h('span', { class: 'mu-daymeta' }, lastOfDay ? 'Dernière : ' + ui.date(lastOfDay.startedAt) + ' (S' + lastOfDay.week + ')' : 'Jamais faite')));
    });
    body.appendChild(grid);

    body.appendChild(h('div', { class: 'card mu-weekcard' },
      h('div', { class: 'field-label' }, 'Semaine du programme'),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': 'Semaine précédente', disabled: pickWeek <= 1,
          onclick: function () { pickWeek = Math.max(1, pickWeek - 1); render(); } }, '−'),
        h('div', { class: 'stepper-value' }, h('span', { class: 'stepper-num' }, pickWeek), h('span', { class: 'muted' }, ' / ' + WEEKS)),
        h('button', { class: 'btn btn-step', 'aria-label': 'Semaine suivante', disabled: pickWeek >= WEEKS,
          onclick: function () { pickWeek = Math.min(WEEKS, pickWeek + 1); render(); } }, '+')),
      h('p', { class: 'hint' }, pickWeek === 1
        ? 'Semaine 1 = référence : pas d’objectifs ni de suggestions.'
        : (last ? 'Dernière séance enregistrée : semaine ' + last.week + '.' : ''))));

    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', disabled: !pickDay, onclick: startSession },
        pickDay ? 'Commencer ' + day(pickDay).name + ' · S' + pickWeek : 'Choisis un jour')));

    if (done.length) {
      body.appendChild(h('h2', { class: 'section-title' }, 'Dernières séances'));
      body.appendChild(h('div', { class: 'list' }, done.slice(-4).reverse().map(sessionRow)));
    }
  }

  function sessionRow(s) {
    var d = day(s.dayId);
    var nSets = Object.keys(s.entries).reduce(function (n, k) { return n + s.entries[k].sets.length; }, 0);
    return h('div', { class: 'list-row' },
      h('div', null,
        h('div', { class: 'list-title' }, (d ? d.name : s.dayId) + ' · Semaine ' + s.week),
        h('div', { class: 'list-sub' }, ui.longDate(s.startedAt) + ' · ' + nSets + ' séries')));
  }

  function startSession() {
    var d = day(pickDay);
    var s = { id: ui.uid(), dayId: d.id, week: pickWeek, startedAt: new Date().toISOString(),
      finishedAt: null, choices: {}, entries: {} };
    /* Pour les exercices à variantes, présélectionner celle de la dernière fois (modifiable). */
    var done = finished();
    d.slots.forEach(function (sl) {
      if (sl.options.length < 2) return;
      for (var i = done.length - 1; i >= 0; i--) {
        var c = done[i].choices && done[i].choices[sl.id];
        if (c && sl.options.some(function (o) { return o.id === c; })) { s.choices[sl.id] = c; return; }
      }
      s.choices[sl.id] = sl.options[0].id;
    });
    data.sessions.push(s);
    data.activeId = s.id;
    persist();
    pickDay = null;
    render();
  }

  /* ---------- Séance en cours ---------- */

  function chosenOption(s, sl) {
    var id = s.choices[sl.id];
    return sl.options.filter(function (o) { return o.id === id; })[0] || sl.options[0];
  }

  function entryFor(s, sl, option) {
    var e = s.entries[option.id];
    if (!e) {
      e = s.entries[option.id] = { sets: [], snap: snapOf(sl, option) };
    }
    e.snap = snapOf(sl, option);
    return e;
  }

  function renderActive(body) {
    var s = active();
    var d = day(s.dayId);
    body.appendChild(h('div', { class: 'card mu-sessionhead' },
      h('div', null,
        h('div', { class: 'mu-sessiontitle' }, (d ? d.name : s.dayId) + ' · Semaine ' + s.week),
        h('div', { class: 'list-sub' }, 'Commencée ' + ui.longDate(s.startedAt) + ' à ' +
          new Date(s.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))),
      h('div', { class: 'autosave', id: 'mu-autosave' }, 'Enregistrement auto')));

    if (s.week === 1) {
      body.appendChild(h('p', { class: 'note' }, 'Semaine 1 : séance de référence. Note simplement ce que tu fais, sans objectif.'));
    }
    body.appendChild(h('p', { class: 'hint' }, 'Les valeurs grises = dernière fois. Touche ✓ pour les reprendre, ou tape seulement ce qui change.'));

    if (!d || !d.slots.length) {
      body.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, 'Aucun exercice pour ce jour.'),
        h('button', { class: 'btn btn-secondary', onclick: function () { programDay = s.dayId; go('program'); } }, 'Ajouter des exercices')));
    } else {
      d.slots.forEach(function (sl) { body.appendChild(exerciseCard(s, sl)); });
    }

    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: finishSession }, 'Terminer la séance'),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: abandonSession }, 'Abandonner la séance')));
  }

  function exerciseCard(s, sl) {
    var option = chosenOption(s, sl);
    var entry = s.entries[option.id];
    var nSets = Math.max(sl.sets, entry ? entry.sets.length : 0);
    var prev = lastPerf(option.id, s.id);
    var prevEntry = prev ? prev.entry : null;
    var baseline = s.week === 1;
    var cat = CATS[sl.category] || CATS.secondary;

    var card = h('section', { class: 'card mu-ex', 'data-slot': sl.id });

    card.appendChild(h('div', { class: 'mu-exhead' },
      h('h3', { class: 'mu-exname' }, option.name),
      h('button', { class: 'btn btn-icon', 'aria-label': 'Historique de ' + option.name,
        onclick: function () { historyEx = option.id; go('history'); } , html: chartIcon() })));

    if (sl.options.length > 1) {
      card.appendChild(h('div', { class: 'segmented small' }, sl.options.map(function (o) {
        return h('button', { class: 'seg' + (o.id === option.id ? ' is-active' : ''),
          onclick: function () { s.choices[sl.id] = o.id; persist(); replaceCard(card, s, sl); } }, o.name);
      })));
    }

    card.appendChild(h('div', { class: 'mu-meta' },
      h('span', { class: 'badge badge-' + sl.category }, cat.short),
      h('span', null, sl.sets + ' × ' + sl.repMin + '–' + sl.repMax + ' reps'),
      baseline ? h('span', { class: 'muted' }, 'Référence') : h('span', null, 'RPE cible ' + rpeRange(sl.category))));

    if (prev) {
      card.appendChild(h('div', { class: 'mu-last' },
        h('span', { class: 'muted' }, 'Dernière fois (' + ui.date(prev.session.startedAt) + ', S' + prev.session.week + ') : '),
        setsSummary(prevEntry.sets)));
      if (!baseline && prev.session.week !== 1) {
        var ps = progression(prevEntry.sets, prevEntry.snap || snapOf(sl, option));
        if (ps && ps.type !== 'info') {
          card.appendChild(h('div', { class: 'mu-prevsugg is-' + ps.type },
            h('strong', null, 'Suggestion pour aujourd’hui : '), ps.text));
        }
      }
    } else {
      card.appendChild(h('div', { class: 'mu-last muted' }, 'Première fois sur cet exercice.'));
    }

    var table = h('div', { class: 'mu-sets' },
      h('div', { class: 'mu-setrow mu-sethead' },
        h('span', null, 'Série'), h('span', null, 'kg'), h('span', null, 'Reps'), h('span', null, 'RPE'), h('span', { class: 'sr-only' }, 'Valider')));
    for (var i = 0; i < nSets; i++) table.appendChild(setRow(s, sl, option, i, prevSet(prevEntry, i), card));
    card.appendChild(table);

    var extra = entry ? entry.sets.length - sl.sets : 0;
    card.appendChild(h('div', { class: 'mu-setbtns' },
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
        var e = entryFor(s, sl, option);
        while (e.sets.length < nSets) e.sets.push(emptySet());
        e.sets.push(emptySet());
        persist(); replaceCard(card, s, sl);
      } }, '+ Série'),
      extra > 0 ? h('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
        var e = entryFor(s, sl, option);
        e.sets.pop(); persist(); replaceCard(card, s, sl);
      } }, '− Série') : null));

    card.appendChild(h('div', { class: 'mu-sugg', 'data-sugg': '1' }));
    updateSuggestion(card, s, sl, option);
    return card;
  }

  function replaceCard(card, s, sl) {
    var fresh = exerciseCard(s, sl);
    card.replaceWith(fresh);
  }

  function emptySet() { return { w: null, r: null, rpe: null, done: false }; }

  function getSet(s, sl, option, i) {
    var e = entryFor(s, sl, option);
    while (e.sets.length <= i) e.sets.push(emptySet());
    return e.sets[i];
  }

  function setRow(s, sl, option, i, prev, card) {
    var entry = s.entries[option.id];
    var cur = (entry && entry.sets[i]) || emptySet();
    var row = h('div', { class: 'mu-setrow' + (cur.done ? ' is-done' : '') });

    function changed() {
      persist();
      flashSaved();
      updateSuggestion(card, s, sl, option);
    }

    var w = h('input', { class: 'input mu-in', type: 'text', inputmode: 'decimal', autocomplete: 'off',
      'aria-label': 'Poids série ' + (i + 1) + ' en kg',
      placeholder: prev && prev.w !== null ? num(prev.w) : 'kg', value: cur.w !== null ? num(cur.w) : '' });
    w.addEventListener('input', function () { getSet(s, sl, option, i).w = ui.parseNum(w.value); changed(); });

    var r = h('input', { class: 'input mu-in', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off',
      'aria-label': 'Répétitions série ' + (i + 1),
      placeholder: prev && prev.r !== null ? String(prev.r) : 'reps', value: cur.r !== null ? String(cur.r) : '' });
    r.addEventListener('input', function () {
      var n = ui.parseNum(r.value);
      getSet(s, sl, option, i).r = n === null ? null : Math.round(n);
      changed();
    });

    var sel = h('select', { class: 'input mu-in mu-rpe' + (cur.rpe === null ? ' is-placeholder' : ''),
      'aria-label': 'RPE série ' + (i + 1) },
      h('option', { value: '' }, prev && prev.rpe !== null && prev.rpe !== undefined ? num(prev.rpe) : '—'),
      RPE_VALUES.map(function (v) { return h('option', { value: String(v) }, num(v)); }));
    sel.value = cur.rpe === null ? '' : String(cur.rpe);
    sel.addEventListener('change', function () {
      getSet(s, sl, option, i).rpe = sel.value === '' ? null : Number(sel.value);
      sel.classList.toggle('is-placeholder', sel.value === '');
      changed();
    });

    var check = h('button', { class: 'btn btn-check' + (cur.done ? ' is-on' : ''),
      'aria-label': (cur.done ? 'Annuler la validation de la série ' : 'Valider la série ') + (i + 1),
      'aria-pressed': cur.done ? 'true' : 'false',
      onclick: function () {
        var set = getSet(s, sl, option, i);
        if (!set.done) {
          var eff = effective(set, prev);
          set.w = eff.w; set.r = eff.r; set.rpe = eff.rpe;
          set.done = true;
        } else {
          set.done = false;
        }
        persist();
        replaceCard(card, s, sl);
      } }, '✓');

    row.appendChild(h('span', { class: 'mu-setnum' }, i + 1));
    row.appendChild(w); row.appendChild(r); row.appendChild(sel); row.appendChild(check);
    return row;
  }

  function loggedEffectiveSets(s, sl, option) {
    var e = s.entries[option.id];
    if (!e) return [];
    var prev = lastPerf(option.id, s.id);
    var out = [];
    e.sets.forEach(function (set, i) {
      if (isLogged(set)) out.push(effective(set, prevSet(prev && prev.entry, i)));
    });
    return out;
  }

  function updateSuggestion(card, s, sl, option) {
    var box = card.querySelector('[data-sugg]');
    if (!box) return;
    box.innerHTML = '';
    box.className = 'mu-sugg';
    if (s.week === 1) return;
    var sets = loggedEffectiveSets(s, sl, option);
    var p = progression(sets, snapOf(sl, option));
    if (!p) return;
    box.classList.add('is-' + p.type);
    box.appendChild(h('div', null, h('strong', null, 'Prochaine séance : '), p.text));
    if (p.detail) box.appendChild(h('div', { class: 'mu-suggdetail' }, p.detail));
  }

  var savedTimer;
  function flashSaved() {
    var el = document.getElementById('mu-autosave');
    if (!el) return;
    el.textContent = 'Enregistré ✓';
    el.classList.add('is-saved');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { el.classList.remove('is-saved'); el.textContent = 'Enregistrement auto'; }, 1500);
  }

  function finishSession() {
    var s = active();
    var d = day(s.dayId);
    var count = 0;
    Object.keys(s.entries).forEach(function (k) {
      count += s.entries[k].sets.filter(isLogged).length;
    });
    ui.confirm({
      title: 'Terminer la séance ?',
      message: count
        ? count + ' série(s) seront enregistrées. Les séries jamais touchées sont ignorées ; les cases laissées grises reprennent la valeur de la dernière fois.'
        : 'Aucune série saisie : la séance sera enregistrée vide.',
      okLabel: 'Terminer et enregistrer'
    }).then(function (ok) {
      if (!ok) return;
      /* Fige les séries : on garde les séries saisies, en complétant avec les valeurs grises. */
      Object.keys(s.entries).forEach(function (exId) {
        var e = s.entries[exId];
        var prev = lastPerf(exId, s.id);
        var kept = [];
        e.sets.forEach(function (set, i) {
          if (!isLogged(set)) return;
          var eff = effective(set, prevSet(prev && prev.entry, i));
          kept.push({ w: eff.w, r: eff.r, rpe: eff.rpe });
        });
        var f = findExercise(exId);
        if (f) e.snap = snapOf(f.slot, f.option);
        if (kept.length) e.sets = kept; else delete s.entries[exId];
      });
      /* Ne garder que la variante choisie pour chaque slot à variantes. */
      if (d) d.slots.forEach(function (sl) {
        if (sl.options.length < 2) return;
        sl.options.forEach(function (o) { if (o.id !== s.choices[sl.id]) delete s.entries[o.id]; });
      });
      s.finishedAt = new Date().toISOString();
      data.activeId = null;
      persist();
      ui.toast('Séance enregistrée');
      pickWeek = s.week;
      render();
      window.scrollTo(0, 0);
    });
  }

  function abandonSession() {
    ui.confirm({ title: 'Abandonner la séance ?', message: 'Toutes les séries saisies pour cette séance seront supprimées.',
      okLabel: 'Supprimer la séance', danger: true }).then(function (ok) {
      if (!ok) return;
      var s = active();
      data.sessions = data.sessions.filter(function (x) { return x.id !== s.id; });
      data.activeId = null;
      persist();
      render();
    });
  }

  /* ---------- Historique ---------- */

  function chartIcon() {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M5 15l4-4 3 3 6-7"/></svg>';
  }

  function historyFor(exId) {
    return finished().filter(function (s) { return s.entries[exId] && s.entries[exId].sets.length; })
      .map(function (s) {
        var e = s.entries[exId];
        var b = bestSet(e.sets);
        return { session: s, entry: e, best: b };
      });
  }

  function renderHistory(body) {
    if (historyEx) return renderExerciseHistory(body, historyEx);

    body.appendChild(h('div', { class: 'segmented small' },
      h('button', { class: 'seg' + (historyMode === 'exercises' ? ' is-active' : ''),
        onclick: function () { historyMode = 'exercises'; render(); } }, 'Par exercice'),
      h('button', { class: 'seg' + (historyMode === 'sessions' ? ' is-active' : ''),
        onclick: function () { historyMode = 'sessions'; render(); } }, 'Séances')));

    if (historyMode === 'sessions') return renderSessionsList(body);

    var seen = {};
    data.days.forEach(function (d) {
      var rows = [];
      d.slots.forEach(function (sl) {
        sl.options.forEach(function (o) { seen[o.id] = true; rows.push(exerciseRow(o.id, o.name)); });
      });
      if (!rows.length) return;
      body.appendChild(h('h2', { class: 'section-title' }, d.name));
      body.appendChild(h('div', { class: 'list' }, rows));
    });
    var orphans = {};
    finished().forEach(function (s) {
      Object.keys(s.entries).forEach(function (id) { if (!seen[id]) orphans[id] = true; });
    });
    var ids = Object.keys(orphans);
    if (ids.length) {
      body.appendChild(h('h2', { class: 'section-title' }, 'Exercices retirés du programme'));
      body.appendChild(h('div', { class: 'list' }, ids.map(function (id) { return exerciseRow(id, exName(id)); })));
    }
  }

  function exerciseRow(exId, name) {
    var hist = historyFor(exId);
    var last = hist[hist.length - 1];
    return h('button', { class: 'list-row list-row-btn', onclick: function () { historyEx = exId; render(); window.scrollTo(0, 0); } },
      h('div', null,
        h('div', { class: 'list-title' }, name),
        h('div', { class: 'list-sub' }, hist.length
          ? hist.length + ' séance' + (hist.length > 1 ? 's' : '') + ' · 1RM estimé ' + num(last.best ? last.best.value : 0, 1) + ' kg'
          : 'Pas encore de données')),
      h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function renderExerciseHistory(body, exId) {
    var name = exName(exId);
    var hist = historyFor(exId);
    body.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: function () { historyEx = null; render(); } }, '‹ Retour'));
    body.appendChild(h('h2', { class: 'page-title' }, name));

    if (!hist.length) {
      body.appendChild(h('p', { class: 'muted' }, 'Aucune séance enregistrée pour cet exercice.'));
      return;
    }
    var pts = hist.filter(function (x) { return x.best; }).map(function (x) {
      return { t: new Date(x.session.startedAt).getTime(), v: x.best.value, label: ui.date(x.session.startedAt), week: x.session.week };
    });
    var best = Math.max.apply(null, pts.map(function (p) { return p.v; }).concat([0]));
    var last = pts[pts.length - 1];

    body.appendChild(h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, '1RM estimé (dernier)'), h('div', { class: 'stat-value' }, last ? num(last.v, 1) + ' kg' : '—')),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Record'), h('div', { class: 'stat-value' }, best ? num(best, 1) + ' kg' : '—'))));

    body.appendChild(h('div', { class: 'card' },
      h('div', { class: 'card-title' }, '1RM estimé au fil du temps'),
      lineChart(pts),
      h('p', { class: 'hint' }, 'Formule d’Epley sur la meilleure série : poids × (1 + reps / 30).')));

    body.appendChild(h('h2', { class: 'section-title' }, 'Séances'));
    hist.slice().reverse().forEach(function (x) {
      body.appendChild(h('div', { class: 'card mu-histcard' },
        h('div', { class: 'mu-histhead' },
          h('span', { class: 'list-title' }, ui.longDate(x.session.startedAt)),
          h('span', { class: 'muted' }, 'S' + x.session.week)),
        h('ol', { class: 'mu-histsets' }, x.entry.sets.map(function (st, i) {
          var isBest = x.best && x.best.index === i;
          return h('li', { class: isBest ? 'is-best' : '' },
            h('span', null, num(st.w) + ' kg × ' + st.r + (st.rpe !== null && st.rpe !== undefined ? ' @ RPE ' + num(st.rpe) : '')),
            isBest ? h('span', { class: 'mu-e1rm' }, '1RM ≈ ' + num(x.best.value, 1)) : null);
        }))));
    });
  }

  /* Graphique en ligne simple (SVG), une série, info-bulle au toucher. */
  function lineChart(pts) {
    var W = 340, H = 190, L = 44, R = 14, T = 16, B = 28;
    var wrap = h('div', { class: 'chart' });
    if (pts.length === 0) { wrap.appendChild(h('p', { class: 'muted' }, 'Pas de données.')); return wrap; }
    var vs = pts.map(function (p) { return p.v; });
    var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    var pad = Math.max((max - min) * 0.15, 2.5);
    min = Math.max(0, min - pad); max = max + pad;
    var t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    function x(p, i) {
      if (pts.length === 1) return L + (W - L - R) / 2;
      return t1 === t0 ? L + i * (W - L - R) / (pts.length - 1) : L + (p.t - t0) / (t1 - t0) * (W - L - R);
    }
    function y(v) { return T + (1 - (v - min) / (max - min)) * (H - T - B); }
    var NSV = 'http://www.w3.org/2000/svg';
    function s(tag, attrs, text) {
      var e = document.createElementNS(NSV, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text !== undefined) e.textContent = text;
      return e;
    }
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart-svg', role: 'img',
      'aria-label': '1RM estimé : de ' + num(pts[0].v, 1) + ' à ' + num(pts[pts.length - 1].v, 1) + ' kg' });
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * g / 3;
      svg.appendChild(s('line', { x1: L, x2: W - R, y1: y(gv), y2: y(gv), class: 'chart-grid' }));
      svg.appendChild(s('text', { x: L - 6, y: y(gv) + 4, 'text-anchor': 'end', class: 'chart-axis' }, num(gv, 0)));
    }
    svg.appendChild(s('text', { x: L, y: H - 8, 'text-anchor': 'start', class: 'chart-axis' }, pts[0].label));
    if (pts.length > 1) svg.appendChild(s('text', { x: W - R, y: H - 8, 'text-anchor': 'end', class: 'chart-axis' }, pts[pts.length - 1].label));
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p, i).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' ');
    svg.appendChild(s('path', { d: d, class: 'chart-line' }));
    pts.forEach(function (p, i) { svg.appendChild(s('circle', { cx: x(p, i), cy: y(p.v), r: 4, class: 'chart-dot' })); });

    var guide = s('line', { x1: 0, x2: 0, y1: T, y2: H - B, class: 'chart-guide', visibility: 'hidden' });
    var focus = s('circle', { cx: 0, cy: 0, r: 6, class: 'chart-focus', visibility: 'hidden' });
    svg.appendChild(guide); svg.appendChild(focus);
    var tip = h('div', { class: 'chart-tip', hidden: true });

    function pick(ev) {
      var rect = svg.getBoundingClientRect();
      var px = (ev.clientX - rect.left) / rect.width * W;
      var bi = 0, bd = Infinity;
      pts.forEach(function (p, i) { var dd = Math.abs(x(p, i) - px); if (dd < bd) { bd = dd; bi = i; } });
      var p = pts[bi], cx = x(p, bi), cy = y(p.v);
      guide.setAttribute('x1', cx); guide.setAttribute('x2', cx); guide.setAttribute('visibility', 'visible');
      focus.setAttribute('cx', cx); focus.setAttribute('cy', cy); focus.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.textContent = p.label + ' · S' + p.week + ' · ' + num(p.v, 1) + ' kg';
      var leftPct = Math.min(Math.max(cx / W * 100, 18), 82);
      tip.style.left = leftPct + '%';
    }
    svg.addEventListener('pointerdown', pick);
    svg.addEventListener('pointermove', function (ev) { if (ev.pressure > 0 || ev.pointerType === 'mouse') pick(ev); });
    wrap.appendChild(tip);
    wrap.appendChild(svg);
    return wrap;
  }

  function renderSessionsList(body) {
    var list = finished().reverse();
    if (!list.length) { body.appendChild(h('p', { class: 'muted' }, 'Aucune séance terminée pour l’instant.')); return; }
    list.forEach(function (s) {
      var d = day(s.dayId);
      var card = h('details', { class: 'card mu-sesscard' },
        h('summary', null,
          h('span', { class: 'list-title' }, (d ? d.name : s.dayId) + ' · S' + s.week),
          h('span', { class: 'list-sub' }, ui.longDate(s.startedAt))));
      Object.keys(s.entries).forEach(function (exId) {
        var e = s.entries[exId];
        card.appendChild(h('div', { class: 'mu-sessex' },
          h('div', { class: 'mu-sessexname' }, (e.snap && e.snap.name) || exName(exId)),
          h('div', { class: 'list-sub' }, setsSummary(e.sets))));
      });
      if (!Object.keys(s.entries).length) card.appendChild(h('p', { class: 'muted' }, 'Séance vide.'));
      card.appendChild(h('button', { class: 'btn btn-ghost btn-sm danger-text', onclick: function () {
        ui.confirm({ title: 'Supprimer cette séance ?', message: 'Elle disparaîtra de l’historique. Action définitive.',
          okLabel: 'Supprimer', danger: true }).then(function (ok) {
          if (!ok) return;
          data.sessions = data.sessions.filter(function (x) { return x.id !== s.id; });
          persist(); render();
        });
      } }, 'Supprimer la séance'));
      body.appendChild(card);
    });
  }

  /* ---------- Programme (édition) ---------- */

  function renderProgram(body) {
    body.appendChild(h('div', { class: 'segmented small' }, data.days.map(function (d) {
      return h('button', { class: 'seg' + (programDay === d.id ? ' is-active' : ''),
        onclick: function () { programDay = d.id; render(); } }, d.name);
    })));
    var d = day(programDay) || data.days[0];
    if (active() && active().dayId === d.id) {
      body.appendChild(h('p', { class: 'note' }, 'Séance en cours sur ce jour : les modifications s’appliquent tout de suite.'));
    }
    if (!d.slots.length) {
      body.appendChild(h('div', { class: 'empty-state small' }, h('p', null, 'Aucun exercice pour ' + d.name + '.')));
    }
    var list = h('div', { class: 'list' });
    d.slots.forEach(function (sl, i) {
      var cat = CATS[sl.category] || CATS.secondary;
      list.appendChild(h('div', { class: 'list-row mu-progrow' },
        h('div', { class: 'mu-progmain' },
          h('div', { class: 'list-title' }, sl.options.map(function (o) { return o.name; }).join(' OU ')),
          h('div', { class: 'list-sub' },
            h('span', { class: 'badge badge-' + sl.category }, cat.short), ' ',
            sl.sets + ' × ' + sl.repMin + '–' + sl.repMax + ' · RPE ' + rpeRange(sl.category))),
        h('div', { class: 'mu-progbtns' },
          h('button', { class: 'btn btn-icon', 'aria-label': 'Monter', disabled: i === 0, onclick: function () { move(d, i, -1); } }, '↑'),
          h('button', { class: 'btn btn-icon', 'aria-label': 'Descendre', disabled: i === d.slots.length - 1, onclick: function () { move(d, i, 1); } }, '↓'),
          h('button', { class: 'btn btn-icon', 'aria-label': 'Modifier', onclick: function () { editSlot(d, sl); } }, '✎'))));
    });
    body.appendChild(list);
    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editSlot(d, null); } }, '+ Ajouter un exercice')));
    body.appendChild(h('p', { class: 'hint' }, 'RPE cible par catégorie : principal 7,5–8 · secondaire 8–8,5 · isolation 8,5–9. Un exercice avec plusieurs variantes te laisse en choisir une à chaque séance.'));
  }

  function move(d, i, dir) {
    var j = i + dir;
    if (j < 0 || j >= d.slots.length) return;
    var t = d.slots[i]; d.slots[i] = d.slots[j]; d.slots[j] = t;
    persist(); render();
  }

  function editSlot(d, sl) {
    var isNew = !sl;
    var draft = sl ? JSON.parse(JSON.stringify(sl)) : { id: ui.uid(), category: 'secondary', sets: 3, repMin: 8, repMax: 12, options: [{ id: ui.uid(), name: '' }] };

    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var optWrap = h('div', { class: 'mu-opts' });

      function renderOpts() {
        optWrap.innerHTML = '';
        draft.options.forEach(function (o, i) {
          var inp = h('input', { class: 'input', type: 'text', value: o.name, autocomplete: 'off', autocapitalize: 'words',
            placeholder: i === 0 ? 'Nom de l’exercice' : 'Variante', 'aria-label': i === 0 ? 'Nom' : 'Variante ' + i });
          inp.addEventListener('input', function () { o.name = inp.value; });
          optWrap.appendChild(h('div', { class: 'mu-optrow' }, inp,
            draft.options.length > 1 ? h('button', { class: 'btn btn-icon', 'aria-label': 'Retirer cette variante',
              onclick: function () { draft.options.splice(i, 1); renderOpts(); } }, '×') : null));
        });
      }
      renderOpts();

      function numField(label, key, min, max) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', value: String(draft[key]), 'aria-label': label });
        inp.addEventListener('input', function () { draft[key] = ui.parseNum(inp.value); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }

      var catSeg = h('div', { class: 'segmented small cat-seg' });
      function renderCats() {
        catSeg.innerHTML = '';
        Object.keys(CATS).forEach(function (k) {
          catSeg.appendChild(h('button', { class: 'seg' + (draft.category === k ? ' is-active' : ''), type: 'button',
            onclick: function () { draft.category = k; renderCats(); } }, CATS[k].short));
        });
      }
      renderCats();

      function save() {
        draft.options = draft.options.map(function (o) { o.name = (o.name || '').trim(); return o; })
          .filter(function (o) { return o.name; });
        var problem = null;
        if (!draft.options.length) problem = 'Donne un nom à l’exercice.';
        else if (!draft.sets || draft.sets < 1 || draft.sets > 12) problem = 'Nombre de séries entre 1 et 12.';
        else if (!draft.repMin || !draft.repMax || draft.repMin < 1 || draft.repMax > 100) problem = 'Renseigne la fourchette de reps.';
        else if (draft.repMin > draft.repMax) problem = 'Le minimum de reps doit être ≤ au maximum.';
        if (problem) {
          if (!draft.options.length) draft.options.push({ id: ui.uid(), name: '' });
          err.textContent = problem; err.hidden = false; renderOpts(); return;
        }
        draft.sets = Math.round(draft.sets); draft.repMin = Math.round(draft.repMin); draft.repMax = Math.round(draft.repMax);
        if (isNew) d.slots.push(draft);
        else d.slots[d.slots.indexOf(sl)] = draft;
        persist(); close(); render();
        ui.toast(isNew ? 'Exercice ajouté' : 'Exercice modifié');
      }

      function remove() {
        ui.confirm({ title: 'Retirer cet exercice ?', message: 'Il sera retiré du programme ' + d.name + '. Son historique est conservé.',
          okLabel: 'Retirer', danger: true }).then(function (ok) {
          if (!ok) return;
          d.slots.splice(d.slots.indexOf(sl), 1);
          persist(); close(); render();
        });
      }

      return [
        h('h2', { class: 'sheet-title' }, isNew ? 'Nouvel exercice · ' + d.name : 'Modifier l’exercice'),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Nom (et variantes éventuelles)'), optWrap,
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () {
            draft.options.push({ id: ui.uid(), name: '' }); renderOpts();
            var ins = optWrap.querySelectorAll('input'); ins[ins.length - 1].focus();
          } }, '+ Ajouter une variante (au choix par séance)')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Catégorie'), catSeg),
        h('div', { class: 'form-grid' },
          numField('Séries', 'sets'), numField('Reps min', 'repMin'), numField('Reps max', 'repMax')),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, 'Enregistrer'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Annuler'),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: remove }, 'Retirer du programme'))
      ];
    }, { modal: true });
  }

  S2.app.registerTab({ id: 'muscu', label: 'Muscu', icon: ICON, mount: mount, order: 10 });

  /* Exposé pour les tests / la console. */
  S2.muscu = { e1rm: e1rm, progression: progression };
})();
