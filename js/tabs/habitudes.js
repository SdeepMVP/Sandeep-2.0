/* Onglet Habits : suivi d'habitudes. Première habitude : arrêter de fumer (objectif 0 cigarette).
   Données : localStorage "sandeep2:habitudes". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'habitudes';
  var SCHEMA = 1;
  var GRID_DAYS = 28;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.8-5"/></svg>';

  /* Repères santé après la dernière cigarette (OMS / American Cancer Society). */
  var MILESTONES = [
    { days: 1,   text: 'Carbon monoxide in your blood is back to normal.' },
    { days: 3,   text: 'Nicotine is out of your body; taste and smell start to improve.' },
    { days: 14,  text: 'Circulation and lung function begin to improve (2 weeks – 3 months).' },
    { days: 30,  text: 'Coughing and shortness of breath start to decrease (1 – 9 months).' },
    { days: 365, text: 'Your excess risk of heart disease is half that of a smoker.' }
  ];

  /* ---------- Dates (jour local) ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function today() { return keyOf(new Date()); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }

  /* ---------- Données ---------- */
  function defaults() {
    return {
      schema: SCHEMA,
      habits: [{
        id: 'quit-smoking', type: 'quit', name: 'Quit smoking', unit: 'cigarettes',
        goal: 'Stop smoking completely: 0 cigarettes a day.',
        startDate: today(), baselinePerDay: null, packPrice: null, perPack: 20
      }],
      /* logs[habitId][YYYY-MM-DD] = { count, cravings } — un jour absent = non renseigné */
      logs: {}
    };
  }

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.habits)) { d = defaults(); S2.storage.save(NS, d); }
    d.logs = d.logs || {};
    d.schema = SCHEMA;
    return d;
  }
  function persist() { S2.storage.save(NS, data); }
  function logsOf(hb) { return data.logs[hb.id] || (data.logs[hb.id] = {}); }
  function dayLog(hb, k) { return logsOf(hb)[k] || null; }
  function setDay(hb, k, patch) {
    var l = logsOf(hb);
    var cur = l[k] || { count: 0, cravings: 0 };
    Object.keys(patch).forEach(function (p) { cur[p] = patch[p]; });
    l[k] = cur;
    persist();
  }

  /* ---------- Calculs ---------- */
  /* Série en cours : jours consécutifs à 0, en remontant depuis aujourd'hui.
     Aujourd'hui non renseigné ne casse pas la série (la journée n'est pas finie). */
  function currentStreak(hb) {
    var k = today(), n = 0;
    var t = dayLog(hb, k);
    if (!t) k = addDays(k, -1);
    while (k >= hb.startDate) {
      var l = dayLog(hb, k);
      if (!l || l.count > 0) break;
      n++; k = addDays(k, -1);
    }
    return n;
  }
  function bestStreak(hb) {
    var best = 0, run = 0, k = hb.startDate, end = today();
    while (k <= end) {
      var l = dayLog(hb, k);
      if (l && l.count === 0) { run++; if (run > best) best = run; } else run = 0;
      k = addDays(k, 1);
    }
    return best;
  }
  function totals(hb) {
    var l = logsOf(hb), smoked = 0, logged = 0, freeDays = 0, cravings = 0, avoided = 0;
    Object.keys(l).forEach(function (k) {
      if (k < hb.startDate || k > today()) return;
      logged++; smoked += l[k].count; cravings += l[k].cravings || 0;
      if (l[k].count === 0) freeDays++;
      if (hb.baselinePerDay) avoided += Math.max(0, hb.baselinePerDay - l[k].count);
    });
    var saved = hb.baselinePerDay && hb.packPrice && hb.perPack ? avoided / hb.perPack * hb.packPrice : null;
    return { smoked: smoked, logged: logged, freeDays: freeDays, cravings: cravings,
      avoided: hb.baselinePerDay ? avoided : null, saved: saved };
  }

  /* ---------- Rendu ---------- */
  function mount(container) {
    data = loadData();
    root = container;
    render();
  }

  function render() {
    root.innerHTML = '';
    data.habits.forEach(function (hb) {
      if (hb.type === 'quit') renderQuit(hb);
    });
  }

  function renderQuit(hb) {
    var tk = today();
    var t = dayLog(hb, tk);
    var streak = currentStreak(hb), best = bestStreak(hb), tot = totals(hb);
    var sinceStart = daysBetween(hb.startDate, tk) + 1;

    var head = h('div', { class: 'card hb-hero' },
      h('div', { class: 'hb-herohead' },
        h('h2', { class: 'page-title' }, hb.name),
        h('button', { class: 'btn btn-icon', 'aria-label': 'Habit settings', onclick: function () { editHabit(hb); },
          html: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>' })),
      h('p', { class: 'hb-goal' }, 'Goal: ' + hb.goal),
      h('div', { class: 'hb-streak' },
        h('span', { class: 'hb-streaknum' }, streak),
        h('span', { class: 'hb-streaklabel' }, streak === 1 ? 'day smoke-free' : 'days smoke-free')),
      h('div', { class: 'hb-substats' },
        h('span', null, 'Best: ' + best + ' day' + (best === 1 ? '' : 's')),
        h('span', null, 'Day ' + sinceStart + ' since ' + ui.date(parseKey(hb.startDate).toISOString()))));
    root.appendChild(head);

    /* Aujourd'hui */
    var count = t ? t.count : 0;
    var todayCard = h('section', { class: 'card hb-today' },
      h('div', { class: 'hb-todayhead' },
        h('span', { class: 'card-title' }, 'Today'),
        h('span', { class: 'hb-status ' + (!t ? 'is-info' : count === 0 ? 'is-up' : 'is-keep') },
          !t ? 'Not logged yet' : count === 0 ? 'Smoke-free so far' : count + ' smoked')),
      h('div', { class: 'hb-counter' },
        h('button', { class: 'btn btn-step', 'aria-label': 'One cigarette less', disabled: !t || count === 0,
          onclick: function () { setDay(hb, tk, { count: Math.max(0, count - 1) }); render(); } }, '−'),
        h('div', { class: 'hb-countval' }, h('span', { class: 'hb-countnum' }, t ? count : '–'), h('span', { class: 'muted' }, 'cigarettes')),
        h('button', { class: 'btn btn-step', 'aria-label': 'I smoked one cigarette',
          onclick: function () { setDay(hb, tk, { count: count + 1 }); render(); } }, '+')),
      h('div', { class: 'stack' },
        !t ? h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
          setDay(hb, tk, { count: 0 }); render(); ui.toast('Smoke-free day logged. Keep going!');
        } }, 'Smoke-free today ✓') : null,
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
          setDay(hb, tk, { cravings: ((t && t.cravings) || 0) + 1, count: count });
          render(); ui.toast('Well done! A craving usually passes within a few minutes.');
        } }, 'I resisted a craving' + (t && t.cravings ? ' (' + t.cravings + ' today)' : ''))),
      h('p', { class: 'hint' }, 'Tap + each time you smoke. Log a smoke-free day at the end of the day, or come back to past days in the calendar.'));
    root.appendChild(todayCard);

    /* Bilan */
    root.appendChild(h('div', { class: 'stats hb-stats' },
      stat('Smoke-free days', tot.freeDays + ' / ' + tot.logged),
      stat('Cravings resisted', tot.cravings),
      stat('Cigarettes avoided', tot.avoided === null ? '—' : tot.avoided),
      stat('Money saved', tot.saved === null ? '—' : tot.saved.toFixed(2) + ' €')));
    if (!hb.baselinePerDay || !hb.packPrice) {
      root.appendChild(h('button', { class: 'btn btn-ghost btn-block btn-sm', onclick: function () { editHabit(hb); } },
        'Set your starting point to see cigarettes avoided and money saved ›'));
    }

    /* Calendrier des 28 derniers jours */
    root.appendChild(h('h2', { class: 'section-title' }, 'Last ' + GRID_DAYS + ' days'));
    var grid = h('div', { class: 'hb-grid' });
    for (var i = GRID_DAYS - 1; i >= 0; i--) {
      (function (k) {
        var l = dayLog(hb, k);
        var before = k < hb.startDate;
        var cls = 'hb-cell' + (before ? ' is-before' : !l ? ' is-empty' : l.count === 0 ? ' is-free' : ' is-smoked') + (k === tk ? ' is-today' : '');
        var d = parseKey(k);
        grid.appendChild(h('button', { class: cls, disabled: before,
          'aria-label': d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ': ' +
            (!l ? 'not logged' : l.count === 0 ? 'smoke-free' : l.count + ' cigarettes'),
          onclick: function () { editDay(hb, k); } },
          h('span', { class: 'hb-cellday' }, d.getDate()),
          h('span', { class: 'hb-cellval' }, !l || before ? '' : l.count === 0 ? '✓' : l.count)));
      })(addDays(tk, -i));
    }
    root.appendChild(grid);
    root.appendChild(h('div', { class: 'hb-legend' },
      h('span', null, h('i', { class: 'hb-dot is-free' }), 'Smoke-free'),
      h('span', null, h('i', { class: 'hb-dot is-smoked' }), 'Smoked'),
      h('span', null, h('i', { class: 'hb-dot is-empty' }), 'Not logged')));

    /* Repères santé */
    root.appendChild(h('h2', { class: 'section-title' }, 'Health milestones'));
    root.appendChild(h('div', { class: 'list' }, MILESTONES.map(function (m) {
      var done = streak >= m.days;
      return h('div', { class: 'list-row hb-milestone' + (done ? ' is-done' : '') },
        h('div', null,
          h('div', { class: 'list-title' }, (done ? '✓ ' : '') + (m.days === 365 ? '1 year' : m.days + ' day' + (m.days === 1 ? '' : 's')) + ' smoke-free'),
          h('div', { class: 'list-sub' }, m.text)),
        done ? null : h('span', { class: 'muted hb-togo' }, (m.days - streak) + ' to go'));
    })));
    root.appendChild(h('p', { class: 'hint' }, 'Milestones based on the WHO and the American Cancer Society, counted from your current smoke-free streak.'));
    root.appendChild(h('p', { class: 'hint' }, 'Need support? In France, Tabac Info Service: 39 89 (free).'));
  }

  function stat(label, value) {
    return h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, label), h('div', { class: 'stat-value' }, value));
  }

  /* Modifier un jour passé (ou aujourd'hui). */
  function editDay(hb, k) {
    var l = dayLog(hb, k);
    var draft = { count: l ? l.count : 0, cravings: l ? (l.cravings || 0) : 0 };
    ui.sheet(function (close) {
      var body = h('div');
      function stepper(label, key) {
        var val = h('span', { class: 'hb-countnum' }, draft[key]);
        return h('div', { class: 'field' }, h('span', { class: 'field-label' }, label),
          h('div', { class: 'stepper' },
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': label + ' minus one',
              onclick: function () { draft[key] = Math.max(0, draft[key] - 1); val.textContent = draft[key]; } }, '−'),
            val,
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': label + ' plus one',
              onclick: function () { draft[key] += 1; val.textContent = draft[key]; } }, '+')));
      }
      body.appendChild(stepper('Cigarettes smoked', 'count'));
      body.appendChild(stepper('Cravings resisted', 'cravings'));
      return [
        h('h2', { class: 'sheet-title' }, parseKey(k).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })),
        h('p', { class: 'sheet-text' }, l ? 'Logged: ' + (l.count === 0 ? 'smoke-free' : l.count + ' cigarette' + (l.count === 1 ? '' : 's')) + '.' : 'Not logged yet.'),
        body,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            setDay(hb, k, { count: draft.count, cravings: draft.cravings }); close(); render();
          } }, 'Save'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'),
          l ? h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            delete logsOf(hb)[k]; persist(); close(); render();
          } }, 'Clear this day') : null)
      ];
    }, { modal: true });
  }

  /* Réglages de l'habitude : date de départ, consommation de référence, prix. */
  function editHabit(hb) {
    var draft = { startDate: hb.startDate, baselinePerDay: hb.baselinePerDay, packPrice: hb.packPrice, perPack: hb.perPack };
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      function numInput(label, key, mode, hint) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: mode, autocomplete: 'off', 'aria-label': label,
          value: draft[key] === null || draft[key] === undefined ? '' : num(draft[key]), placeholder: hint || '' });
        inp.addEventListener('input', function () { draft[key] = ui.parseNum(inp.value); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      var date = h('input', { class: 'input', type: 'date', value: draft.startDate, max: today(), 'aria-label': 'Start date' });
      date.addEventListener('change', function () { draft.startDate = date.value; });
      return [
        h('h2', { class: 'sheet-title' }, hb.name + ' · settings'),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Start date'), date),
        numInput('Cigarettes per day before quitting', 'baselinePerDay', 'numeric', 'e.g. 10'),
        h('div', { class: 'form-grid hb-grid2' },
          numInput('Pack price (€)', 'packPrice', 'decimal', 'e.g. 12.50'),
          numInput('Cigarettes per pack', 'perPack', 'numeric', '20')),
        h('p', { class: 'hint' }, 'Used only to estimate cigarettes avoided and money saved. Leave empty if you prefer.'),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.startDate || draft.startDate > today()) { err.textContent = 'Pick a start date that is not in the future.'; err.hidden = false; return; }
            if ((draft.baselinePerDay !== null && draft.baselinePerDay < 0) || (draft.packPrice !== null && draft.packPrice < 0) ||
                (draft.perPack !== null && draft.perPack < 1)) { err.textContent = 'Check the numbers.'; err.hidden = false; return; }
            hb.startDate = draft.startDate;
            hb.baselinePerDay = draft.baselinePerDay === null ? null : Math.round(draft.baselinePerDay);
            hb.packPrice = draft.packPrice;
            hb.perPack = draft.perPack === null ? 20 : Math.round(draft.perPack);
            persist(); close(); render(); ui.toast('Settings saved');
          } }, 'Save'),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, 'Cancel'))
      ];
    }, { modal: true });
  }

  S2.app.registerTab({ id: 'habitudes', label: 'Habits', order: 40, icon: ICON, mount: mount });
})();
