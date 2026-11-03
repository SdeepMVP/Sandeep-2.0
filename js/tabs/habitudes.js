/* Onglet Habits : habitudes quotidiennes à cocher (créatine, médicaments, sommeil…) et arrêt du tabac.
   Données : localStorage "sandeep2:habitudes". */
(function () {
  'use strict';
  var S2 = window.S2;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var L = S2.L;
  var NS = 'habitudes';
  var SCHEMA = 1;
  var GRID_DAYS = 28;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.8-5"/></svg>';

  /* Repères santé après la dernière cigarette (OMS / American Cancer Society). */
  var MILESTONES = [
    { days: 1,   text: L('Carbon monoxide in your blood is back to normal.', 'Le monoxyde de carbone dans ton sang revient à la normale.') },
    { days: 3,   text: L('Nicotine is out of your body; taste and smell start to improve.', 'La nicotine a quitté ton corps ; le goût et l’odorat commencent à revenir.') },
    { days: 14,  text: L('Circulation and lung function begin to improve (2 weeks – 3 months).', 'La circulation et la fonction pulmonaire s’améliorent (2 semaines – 3 mois).') },
    { days: 30,  text: L('Coughing and shortness of breath start to decrease (1 – 9 months).', 'La toux et l’essoufflement diminuent (1 – 9 mois).') },
    { days: 365, text: L('Your excess risk of heart disease is half that of a smoker.', 'Ton risque supplémentaire de maladie cardiaque est divisé par deux par rapport à un fumeur.') }
  ];

  /* ---------- Langue ---------- */
  /* Pluriel : en anglais tout sauf 1, en français au-delà de 1 (0 et 1 au singulier). */
  function pl(n, one, many) { return (S2.lang === 'fr' ? n > 1 : n !== 1) ? many : one; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function longDay(k) { return cap(parseKey(k).toLocaleDateString(S2.locale, { weekday: 'long', day: 'numeric', month: 'long' })); }
  function money(x) { var v = x.toFixed(2); return (S2.lang === 'fr' ? v.replace('.', ',') : v) + ' €'; }
  /* Habitudes intégrées : enregistrées en anglais dans les données (l'utilisateur peut les renommer).
     On les traduit seulement à l'affichage, tant que le texte enregistré est encore celui d'origine. */
  var FR = {
    'Creatine': 'Créatine',
    'Daily dose': 'Dose du jour',
    'Medication': 'Médicaments',
    'Morning': 'Matin',
    'Evening': 'Soir',
    'Sleep schedule': 'Horaires de sommeil',
    'Bedtime counts for the night of that day.': 'Le coucher compte pour la nuit de ce jour-là.',
    'In bed before midnight': 'Au lit avant minuit',
    'Up before 9:00': 'Debout avant 9 h',
    'Pelvic floor routine': 'Routine périnée',
    'Kegels: squeeze 5 s, relax 5 s, 10 times, 3 sets spread over the day. Reverse Kegels: gently push as if to pee, then relax fully, 10 times. Breathing: 2 min from the belly, in 4 s, out 6 s.':
      'Kegels : contracte 5 s, relâche 5 s, 10 fois, 3 séries réparties dans la journée. Kegels inversés : pousse doucement comme pour faire pipi, puis relâche complètement, 10 fois. Respiration : 2 min par le ventre, inspire 4 s, expire 6 s.',
    'Reverse Kegels · 10': 'Kegels inversés · 10',
    'Belly breathing · 2 min': 'Respiration abdominale · 2 min',
    'Hair routine': 'Routine cheveux',
    'Tap ✎ to split it into steps (e.g. wash, condition, style).': 'Touche ✎ pour la découper en étapes (ex. lavage, après-shampooing, coiffage).',
    'Done': 'Fait',
    'Quit smoking': 'Arrêter de fumer',
    'Stop smoking completely: 0 cigarettes a day.': 'Arrêter complètement de fumer (0 cigarette par jour).'
  };
  var EN = {};
  Object.keys(FR).forEach(function (k) { EN[FR[k]] = k; });
  function tx(s) { return S2.lang === 'fr' && FR[s] || s; }
  /* Inverse, à l'enregistrement : un texte resté égal à la traduction reprend le texte d'origine (il suit la langue). */
  function untx(s) { return S2.lang === 'fr' && EN[s] || s; }

  /* ---------- Dates (jour local) ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function today() { return keyOf(new Date()); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }

  /* ---------- Données ---------- */
  /* Habitudes à cocher proposées par défaut (ajoutées aux données existantes si absentes). */
  var DEFAULT_CHECKS = [
    { id: 'creatine', type: 'check', name: 'Creatine', slots: [{ id: 'dose', label: 'Daily dose' }] },
    { id: 'medication', type: 'check', name: 'Medication', slots: [{ id: 'am', label: 'Morning' }, { id: 'pm', label: 'Evening' }] },
    { id: 'sleep', type: 'check', name: 'Sleep schedule', note: 'Bedtime counts for the night of that day.',
      slots: [{ id: 'bed', label: 'In bed before midnight' }, { id: 'wake', label: 'Up before 9:00' }] },
    { id: 'pelvic-floor', type: 'check', name: 'Pelvic floor routine',
      note: 'Kegels: squeeze 5 s, relax 5 s, 10 times, 3 sets spread over the day. Reverse Kegels: gently push as if to pee, then relax fully, 10 times. Breathing: 2 min from the belly, in 4 s, out 6 s.',
      slots: [{ id: 'kegel', label: 'Kegels · 3 × 10' }, { id: 'reverse', label: 'Reverse Kegels · 10' }, { id: 'breath', label: 'Belly breathing · 2 min' }] },
    { id: 'hair', type: 'check', name: 'Hair routine', note: 'Tap ✎ to split it into steps (e.g. wash, condition, style).',
      slots: [{ id: 'done', label: 'Done' }] }
  ];

  function defaults() {
    return {
      schema: SCHEMA,
      habits: [{
        id: 'quit-smoking', type: 'quit', name: 'Quit smoking', unit: 'cigarettes',
        goal: 'Stop smoking completely: 0 cigarettes a day.',
        startDate: today(), baselinePerDay: null, packPrice: null, perPack: 20
      }],
      /* logs[habitId][YYYY-MM-DD] = { count, cravings } (tabac) ou { done: { slotId: true } } (à cocher).
         Un jour absent = non renseigné. */
      logs: {},
      removedDefaults: []
    };
  }

  var data = null, root = null;
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.habits)) { d = defaults(); S2.storage.save(NS, d); }
    d.logs = d.logs || {};
    d.removedDefaults = d.removedDefaults || [];
    d.weekNotes = d.weekNotes || {};
    var added = false;
    DEFAULT_CHECKS.forEach(function (def) {
      if (d.habits.some(function (x) { return x.id === def.id; }) || d.removedDefaults.indexOf(def.id) > -1) return;
      var c = JSON.parse(JSON.stringify(def)); c.startDate = today(); d.habits.push(c); added = true;
    });
    d.schema = SCHEMA;
    if (added) S2.storage.save(NS, d);
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

  /* Habitudes à cocher : un jour est « complet » quand toutes ses cases sont cochées. */
  function doneCount(hb, k) {
    var l = dayLog(hb, k);
    if (!l || !l.done) return 0;
    return hb.slots.filter(function (sl) { return l.done[sl.id]; }).length;
  }
  function complete(hb, k) { return doneCount(hb, k) === hb.slots.length; }
  function toggleSlot(hb, k, slotId) {
    var l = logsOf(hb);
    var cur = l[k] || { done: {} };
    cur.done = cur.done || {};
    if (cur.done[slotId]) delete cur.done[slotId]; else cur.done[slotId] = true;
    if (Object.keys(cur.done).length) l[k] = cur; else delete l[k];
    persist();
  }
  function checkStreak(hb) {
    var k = today(), n = 0;
    if (!complete(hb, k)) k = addDays(k, -1); /* aujourd'hui pas fini ne casse pas la série */
    while (k >= hb.startDate && complete(hb, k)) { n++; k = addDays(k, -1); }
    return n;
  }
  function checkBest(hb) {
    var best = 0, run = 0, k = hb.startDate, end = today();
    while (k <= end) {
      if (complete(hb, k)) { run++; if (run > best) best = run; } else run = 0;
      k = addDays(k, 1);
    }
    return best;
  }

  /* ---------- Rendu ---------- */
  var view = 'daily'; // daily | weeks | quit
  var weekOffset = 0;  // 0 = semaine en cours, -1 = semaine précédente…

  function mount(container) {
    data = loadData();
    root = container;
    render();
  }

  function quitHabit() { return data.habits.filter(function (x) { return x.type === 'quit'; })[0]; }
  function checkHabits() { return data.habits.filter(function (x) { return x.type === 'check'; }); }

  function render() {
    root.innerHTML = '';
    var q = quitHabit();
    root.appendChild(h('div', { class: 'segmented hb-nav' },
      h('button', { class: 'seg' + (view === 'daily' ? ' is-active' : ''), onclick: function () { view = 'daily'; render(); } }, L('Daily', 'Jour')),
      h('button', { class: 'seg' + (view === 'weeks' ? ' is-active' : ''), onclick: function () { view = 'weeks'; render(); } }, L('Weeks', 'Semaines')),
      /* nom d'origine : libellé court « Tabac » en français pour que les trois boutons tiennent */
      q ? h('button', { class: 'seg' + (view === 'quit' ? ' is-active' : ''), onclick: function () { view = 'quit'; render(); } },
        q.name === 'Quit smoking' ? L('Quit smoking', 'Tabac') : q.name) : null));
    if (view === 'quit' && q) renderQuit(q);
    else if (view === 'weeks') renderWeeks();
    else renderDaily();
  }

  function renderDaily() {
    var tk = today();
    var list = checkHabits();
    var total = 0, done = 0;
    list.forEach(function (hb) { total += hb.slots.length; done += doneCount(hb, tk); });

    var card = h('section', { class: 'card hb-daily' },
      h('div', { class: 'hb-todayhead' },
        h('span', { class: 'card-title' }, L('Today · ', 'Aujourd’hui · ') + parseKey(tk).toLocaleDateString(S2.locale, { weekday: 'long', day: 'numeric', month: 'long' })),
        h('span', { class: 'hb-status ' + (total && done === total ? 'is-up' : 'is-info') }, done + ' / ' + total)),
      h('div', { class: 'hb-progress' }, h('span', { style: { width: (total ? done / total * 100 : 0) + '%' } })));
    list.forEach(function (hb) {
      if (hb.slots.length > 1) card.appendChild(h('div', { class: 'hb-group' }, tx(hb.name)));
      hb.slots.forEach(function (sl) {
        var on = !!(dayLog(hb, tk) && dayLog(hb, tk).done && dayLog(hb, tk).done[sl.id]);
        card.appendChild(h('button', { class: 'hb-check' + (on ? ' is-on' : ''), role: 'checkbox', 'aria-checked': on ? 'true' : 'false',
          onclick: function () { toggleSlot(hb, tk, sl.id); render(); if (!on && complete(hb, tk)) ui.toast(tx(hb.name) + L(': done for today ✓', ' : fait pour aujourd’hui ✓')); } },
          h('span', { class: 'hb-box', 'aria-hidden': 'true' }, on ? '✓' : ''),
          h('span', { class: 'hb-checktext' }, hb.slots.length > 1 ? tx(sl.label) : tx(hb.name))));
      });
    });
    if (!list.length) card.appendChild(h('p', { class: 'muted' }, L('No daily habits yet.', 'Aucune habitude quotidienne pour l’instant.')));
    var q = quitHabit();
    if (q) {
      var s = currentStreak(q);
      card.appendChild(h('button', { class: 'hb-quitlink', onclick: function () { view = 'quit'; render(); window.scrollTo(0, 0); } },
        h('span', null, '🚭 ' + tx(q.name)),
        h('span', { class: 'hb-quitstreak' }, s + ' ' + pl(s, L('day smoke-free', 'jour sans fumer'), L('days smoke-free', 'jours sans fumer')) + ' ›')));
    }
    root.appendChild(card);

    root.appendChild(h('h2', { class: 'section-title' }, L('Streaks · last 7 days', 'Séries · 7 derniers jours')));
    list.forEach(function (hb) {
      var streak = checkStreak(hb), best = checkBest(hb);
      var strip = h('div', { class: 'hb-week' });
      for (var i = 6; i >= 0; i--) {
        (function (k) {
          var n = doneCount(hb, k), before = k < hb.startDate;
          var cls = 'hb-day' + (before ? ' is-before' : n === hb.slots.length ? ' is-free' : n ? ' is-part' : ' is-empty') + (k === tk ? ' is-today' : '');
          var d = parseKey(k);
          strip.appendChild(h('button', { class: cls,
            'aria-label': longDay(k) + L(': ', ' : ') + n + L(' of ', ' sur ') + hb.slots.length,
            onclick: function () { editCheckDay(hb, k); } },
            h('span', { class: 'hb-dayname' }, d.toLocaleDateString(S2.locale, { weekday: 'narrow' })),
            h('span', { class: 'hb-dayval' }, before ? '' : n === hb.slots.length ? '✓' : n ? n + '/' + hb.slots.length : '')));
        })(addDays(tk, -i));
      }
      root.appendChild(h('div', { class: 'card hb-habit' },
        h('div', { class: 'hb-habithead' },
          h('div', null,
            h('div', { class: 'list-title' }, tx(hb.name)),
            h('div', { class: 'list-sub' }, hb.slots.length > 1 ? hb.slots.map(function (sl) { return tx(sl.label); }).join(' · ') : L('Once a day', 'Une fois par jour'))),
          h('div', { class: 'hb-habitstreak' },
            h('span', { class: 'hb-streaksmall' }, streak),
            h('span', { class: 'list-sub' }, pl(streak, L('day', 'jour'), L('days', 'jours')) + L(' · best ', ' · record ') + best)),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Edit ', 'Modifier ') + tx(hb.name), onclick: function () { editCheckHabit(hb); } }, '✎')),
        strip,
        hb.note ? h('p', { class: 'hint' }, tx(hb.note)) : null));
    });
    root.appendChild(h('p', { class: 'hint' }, L('Tap a day to fix it after the fact. A streak counts the days where every box was ticked; today only counts once it is complete.',
      'Touche un jour pour le corriger après coup. Une série compte les jours où toutes les cases sont cochées ; aujourd’hui ne compte qu’une fois complet.')));
    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editCheckHabit(null); } }, L('+ Add a habit', '+ Ajouter une habitude'))));
  }

  /* Modifier les cases d'un jour passé (ou d'aujourd'hui). */
  function editCheckDay(hb, k) {
    var draft = {};
    hb.slots.forEach(function (sl) { var l = dayLog(hb, k); draft[sl.id] = !!(l && l.done && l.done[sl.id]); });
    ui.sheet(function (close) {
      var box = h('div', { class: 'hb-sheetchecks' });
      function paint() {
        box.innerHTML = '';
        hb.slots.forEach(function (sl) {
          box.appendChild(h('button', { class: 'hb-check' + (draft[sl.id] ? ' is-on' : ''), type: 'button', role: 'checkbox',
            'aria-checked': draft[sl.id] ? 'true' : 'false', onclick: function () { draft[sl.id] = !draft[sl.id]; paint(); } },
            h('span', { class: 'hb-box', 'aria-hidden': 'true' }, draft[sl.id] ? '✓' : ''),
            h('span', { class: 'hb-checktext' }, hb.slots.length > 1 ? tx(sl.label) : tx(hb.name))));
        });
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, tx(hb.name)),
        h('p', { class: 'sheet-text' }, longDay(k)),
        box,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            var done = {};
            Object.keys(draft).forEach(function (id) { if (draft[id]) done[id] = true; });
            if (Object.keys(done).length) {
              logsOf(hb)[k] = { done: done };
              if (k < hb.startDate) hb.startDate = k; /* jour rattrapé avant le début : le suivi commence plus tôt */
            } else delete logsOf(hb)[k];
            persist(); close(); render();
          } }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* Ajouter / modifier / supprimer une habitude à cocher. */
  function editCheckHabit(hb) {
    var isNew = !hb;
    /* champs pré-remplis avec le texte affiché (traduit) ; untx() le ramène à l'original à l'enregistrement */
    var draft = { name: hb ? tx(hb.name) : '', slots: hb && hb.slots.length > 1 ? hb.slots.map(function (sl) { return tx(sl.label); }).join('\n') : '' };
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var name = h('input', { class: 'input', type: 'text', value: draft.name, placeholder: L('e.g. Drink 2 L of water', 'ex. Boire 2 L d’eau'), 'aria-label': L('Habit name', 'Nom de l’habitude'), autocapitalize: 'sentences' });
      name.addEventListener('input', function () { draft.name = name.value; });
      var slots = h('textarea', { class: 'input hb-textarea', rows: 3, placeholder: L('Morning\nEvening', 'Matin\nSoir'), 'aria-label': L('Times of day', 'Moments de la journée') });
      slots.value = draft.slots;
      slots.addEventListener('input', function () { draft.slots = slots.value; });
      function save() {
        var n = untx(draft.name.trim());
        if (!n) { err.textContent = L('Give the habit a name.', 'Donne un nom à l’habitude.'); err.hidden = false; return; }
        var labels = draft.slots.split('\n').map(function (x) { return untx(x.trim()); }).filter(Boolean);
        var old = hb ? hb.slots : [];
        var newSlots = labels.length > 1
          ? labels.map(function (lab) {
              var same = old.filter(function (sl) { return sl.label === lab; })[0];
              return same || { id: ui.uid(), label: lab };
            })
          : [old.length === 1 ? old[0] : { id: ui.uid(), label: labels[0] || 'Done' }];
        if (labels.length === 1) newSlots[0].label = labels[0];
        if (isNew) data.habits.push({ id: 'h-' + ui.uid(), type: 'check', name: n, slots: newSlots, startDate: today() });
        else { hb.name = n; hb.slots = newSlots; }
        persist(); close(); render(); ui.toast(isNew ? L('Habit added', 'Habitude ajoutée') : L('Habit updated', 'Habitude modifiée'));
      }
      function remove() {
        ui.confirm({ title: L('Delete “' + hb.name + '”?', 'Supprimer « ' + tx(hb.name) + ' » ?'),
          message: L('The habit and its history will be removed.', 'L’habitude et son historique seront supprimés.'), okLabel: L('Delete', 'Supprimer'), danger: true })
          .then(function (ok) {
            if (!ok) return;
            data.habits = data.habits.filter(function (x) { return x.id !== hb.id; });
            delete data.logs[hb.id];
            if (DEFAULT_CHECKS.some(function (d) { return d.id === hb.id; })) data.removedDefaults.push(hb.id);
            persist(); close(); render(); ui.toast(L('Habit deleted', 'Habitude supprimée'));
          });
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New habit', 'Nouvelle habitude') : L('Edit habit', 'Modifier l’habitude')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Name', 'Nom')), name),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Several times a day? One per line (optional)', 'Plusieurs fois par jour ? Une par ligne (facultatif)')), slots,
          h('span', { class: 'hint' }, L('Leave empty for a single box per day.', 'Laisse vide pour une seule case par jour.'))),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? L('Add the habit', 'Ajouter l’habitude') : L('Save changes', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: remove }, L('Delete this habit', 'Supprimer cette habitude')))
      ];
    }, { modal: true });
  }

  /* ---------- Progrès semaine par semaine (lundi → dimanche) ---------- */
  var TREND_WEEKS = 12;
  function weekStart(k) { var d = parseKey(k); return addDays(k, -((d.getDay() + 6) % 7)); }
  function shortDate(k) { return parseKey(k).toLocaleDateString(S2.locale, { day: 'numeric', month: 'short' }); }
  function weekLabel(ws) { return shortDate(ws) + ' – ' + shortDate(addDays(ws, 6)); }

  /* Cases cochées / cases possibles sur les jours suivis de la semaine (jours futurs et avant le début exclus). */
  function weekCheck(hb, ws) {
    var tk = today(), done = 0, possible = 0, full = 0, days = 0;
    for (var i = 0; i < 7; i++) {
      var k = addDays(ws, i);
      if (k > tk || k < hb.startDate) continue;
      var n = doneCount(hb, k);
      if (k === tk && n < hb.slots.length) continue; /* aujourd'hui ne compte qu'une fois complet, comme les séries */
      days++; possible += hb.slots.length; done += n;
      if (n === hb.slots.length) full++;
    }
    return { done: done, possible: possible, full: full, days: days, pct: possible ? done / possible : null };
  }
  function weekAll(ws) {
    var done = 0, possible = 0;
    checkHabits().forEach(function (hb) { var w = weekCheck(hb, ws); done += w.done; possible += w.possible; });
    return { done: done, possible: possible, pct: possible ? done / possible : null };
  }
  function weekQuit(hb, ws) {
    var tk = today(), logged = 0, smoked = 0, free = 0, cravings = 0, days = 0;
    for (var i = 0; i < 7; i++) {
      var k = addDays(ws, i);
      if (k > tk || k < hb.startDate) continue;
      days++;
      var l = dayLog(hb, k);
      if (!l) continue;
      logged++; smoked += l.count; cravings += l.cravings || 0;
      if (l.count === 0) free++;
    }
    return { days: days, logged: logged, smoked: smoked, free: free, cravings: cravings };
  }
  function pctText(p) { return p === null ? '—' : Math.round(p * 100) + L('%', '\u00a0%'); }
  /* Écart en points avec la semaine précédente. */
  function deltaChip(cur, prev) {
    if (cur === null || prev === null) return null;
    var d = Math.round((cur - prev) * 100);
    if (d === 0) return h('span', { class: 'hb-delta' }, L('= last week', '= semaine dernière'));
    return h('span', { class: 'hb-delta ' + (d > 0 ? 'is-up' : 'is-down') }, (d > 0 ? '▲ +' : '▼ ') + d + ' pts');
  }
  function earliestStart() {
    return data.habits.reduce(function (m, hb) { return hb.startDate < m ? hb.startDate : m; }, today());
  }

  function renderWeeks() {
    var tk = today(), cur = weekStart(tk);
    var first = weekStart(earliestStart());
    var minOffset = -Math.round(daysBetween(first, cur) / 7);
    if (weekOffset < minOffset) weekOffset = minOffset;
    if (weekOffset > 0) weekOffset = 0;
    var ws = addDays(cur, weekOffset * 7), prev = addDays(ws, -7);
    var all = weekAll(ws), allPrev = ws > first ? weekAll(prev) : { pct: null };
    var go = function (n) { weekOffset += n; render(); };

    /* En-tête : navigation entre semaines (gros boutons, à une main). */
    root.appendChild(h('div', { class: 'card hb-weekhead' },
      h('button', { class: 'btn btn-icon', 'aria-label': L('Previous week', 'Semaine précédente'), disabled: weekOffset <= minOffset, onclick: function () { go(-1); } }, '‹'),
      h('div', { class: 'hb-weektitle' },
        h('div', { class: 'list-title' }, weekOffset === 0 ? L('This week', 'Cette semaine') : weekOffset === -1 ? L('Last week', 'Semaine dernière') : weekLabel(ws)),
        h('div', { class: 'list-sub' }, weekOffset >= -1 ? weekLabel(ws) : L(Math.abs(weekOffset) + ' weeks ago', 'Il y a ' + Math.abs(weekOffset) + ' semaines'))),
      h('button', { class: 'btn btn-icon', 'aria-label': L('Next week', 'Semaine suivante'), disabled: weekOffset >= 0, onclick: function () { go(1); } }, '›')));

    /* Score de la semaine. */
    root.appendChild(h('section', { class: 'card hb-weekscore' },
      h('div', { class: 'hb-todayhead' },
        h('span', { class: 'card-title' }, L('Daily habits', 'Habitudes quotidiennes')),
        deltaChip(all.pct, allPrev.pct)),
      h('div', { class: 'hb-bignum' }, pctText(all.pct)),
      h('div', { class: 'hb-progress' }, h('span', { style: { width: (all.pct || 0) * 100 + '%' } })),
      h('p', { class: 'hint' }, all.possible
        ? L(all.done + ' of ' + all.possible + ' boxes ticked' + (weekOffset === 0 ? ' so far this week.' : '.'),
            all.done + ' ' + pl(all.done, 'case cochée', 'cases cochées') + ' sur ' + all.possible + (weekOffset === 0 ? ' pour l’instant cette semaine.' : '.'))
        : L('Nothing to track this week.', 'Rien à suivre cette semaine.'))));

    /* Détail par habitude. */
    root.appendChild(h('h2', { class: 'section-title' }, L('By habit', 'Par habitude')));
    var list = h('div', { class: 'list' });
    checkHabits().forEach(function (hb) {
      var w = weekCheck(hb, ws), wp = ws > first ? weekCheck(hb, prev) : { pct: null };
      var dots = h('div', { class: 'hb-dots', 'aria-hidden': 'true' });
      for (var i = 0; i < 7; i++) {
        var k = addDays(ws, i), n = doneCount(hb, k);
        dots.appendChild(h('i', { class: 'hb-dot ' + (k > tk || k < hb.startDate ? 'is-off' : n === hb.slots.length ? 'is-free' : n ? 'is-part' : 'is-empty') }));
      }
      list.appendChild(h('div', { class: 'list-row hb-weekrow' },
        h('div', { class: 'hb-weekrowmain' },
          h('div', { class: 'list-title' }, tx(hb.name)),
          h('div', { class: 'list-sub' }, w.days ? w.full + ' / ' + w.days + ' ' + pl(w.days, L('full day', 'jour complet'), L('full days', 'jours complets')) : L('Not started yet', 'Pas encore commencée')),
          dots),
        h('div', { class: 'hb-weekrowside' },
          h('span', { class: 'hb-weekpct' }, pctText(w.pct)),
          deltaChip(w.pct, wp.pct))));
    });
    root.appendChild(list);

    /* Tabac. */
    var q = quitHabit();
    if (q) {
      var qw = weekQuit(q, ws), qp = ws > first ? weekQuit(q, prev) : null;
      var avg = function (w) { return w && w.logged ? num(w.smoked / w.logged, 1) : '—'; };
      root.appendChild(h('h2', { class: 'section-title' }, '🚭 ' + tx(q.name)));
      root.appendChild(h('div', { class: 'stats hb-stats' },
        stat(L('Smoke-free days', 'Jours sans tabac'), qw.days ? qw.free + ' / ' + qw.days : '—'),
        stat(L('Cigarettes', 'Cigarettes'), qw.logged ? qw.smoked : '—'),
        stat(L('Cravings resisted', 'Envies résistées'), qw.cravings),
        stat(L('Per day (week before)', 'Par jour (sem. d’avant)'), avg(qw) + ' (' + avg(qp) + ')')));
      if (qw.days > qw.logged) {
        var nl = qw.days - qw.logged;
        root.appendChild(h('p', { class: 'hint' }, nl + ' ' + pl(nl, L('day not logged this week.', 'jour non renseigné cette semaine.'), L('days not logged this week.', 'jours non renseignés cette semaine.'))));
      }
    }

    /* Tendance : 12 dernières semaines (touchez une barre pour l'ouvrir). */
    root.appendChild(h('h2', { class: 'section-title' }, L('Last ' + TREND_WEEKS + ' weeks', TREND_WEEKS + ' dernières semaines')));
    var bars = h('div', { class: 'hb-bars', role: 'list' });
    var tracked = [];
    for (var j = TREND_WEEKS - 1; j >= 0; j--) {
      (function (off) {
        var s = addDays(cur, -off * 7), before = s < first;
        var p = before ? null : weekAll(s).pct;
        if (p !== null) tracked.push({ ws: s, pct: p, off: -off });
        bars.appendChild(h('button', { class: 'hb-bar' + (-off === weekOffset ? ' is-sel' : '') + (before ? ' is-before' : ''), role: 'listitem',
          disabled: before, 'aria-label': L('Week of ', 'Semaine du ') + weekLabel(s) + L(': ', ' : ') + pctText(p),
          onclick: function () { weekOffset = -off; render(); } },
          h('span', { class: 'hb-barval' }, p === null ? '' : Math.round(p * 100)),
          h('span', { class: 'hb-bartrack' }, h('span', { class: 'hb-barfill', style: { height: (p || 0) * 100 + '%' } })),
          h('span', { class: 'hb-barlabel' }, parseKey(s).getDate() + '/' + (parseKey(s).getMonth() + 1))));
      })(j);
    }
    root.appendChild(h('div', { class: 'card hb-trend' }, bars,
      tracked.length > 1 ? (function () {
        var done = tracked.filter(function (t) { return t.off < 0; });
        var avg = done.length ? done.reduce(function (n, t) { return n + t.pct; }, 0) / done.length : null;
        var best = tracked.reduce(function (b, t) { return !b || t.pct > b.pct ? t : b; }, null);
        return h('div', { class: 'hb-substats' },
          avg === null ? null : h('span', null, L('Average: ', 'Moyenne : ') + pctText(avg)),
          h('span', null, L('Best: ', 'Meilleure : ') + pctText(best.pct) + ' (' + shortDate(best.ws) + ')'));
      })() : null));

    /* Note de la semaine (facultative, saisie manuelle). */
    root.appendChild(h('h2', { class: 'section-title' }, L('Week notes', 'Notes de la semaine')));
    var note = h('textarea', { class: 'input hb-textarea', rows: 3, 'aria-label': L('Notes for this week', 'Notes de cette semaine'),
      placeholder: L('What went well? What got in the way? One thing to change next week…', 'Qu’est-ce qui a bien marché ? Qu’est-ce qui a coincé ? Une chose à changer la semaine prochaine…') });
    note.value = data.weekNotes[ws] || '';
    note.addEventListener('change', function () {
      var v = note.value.trim();
      if (v) data.weekNotes[ws] = v; else delete data.weekNotes[ws];
      persist(); ui.toast(L('Note saved', 'Note enregistrée'));
    });
    root.appendChild(h('div', { class: 'card' }, note,
      h('p', { class: 'hint' }, L('Saved when you leave the field. Weeks run Monday to Sunday; today counts once all its boxes are ticked, and days before a habit started are not counted.',
        'Enregistrée quand tu quittes le champ. Les semaines vont du lundi au dimanche ; aujourd’hui compte une fois toutes ses cases cochées, et les jours avant le début d’une habitude ne comptent pas.'))));
  }

  function renderQuit(hb) {
    var tk = today();
    var t = dayLog(hb, tk);
    var streak = currentStreak(hb), best = bestStreak(hb), tot = totals(hb);
    var sinceStart = daysBetween(hb.startDate, tk) + 1;

    var head = h('div', { class: 'card hb-hero' },
      h('div', { class: 'hb-herohead' },
        h('h2', { class: 'page-title' }, tx(hb.name)),
        h('button', { class: 'btn btn-icon', 'aria-label': L('Habit settings', 'Réglages de l’habitude'), onclick: function () { editHabit(hb); },
          html: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>' })),
      h('p', { class: 'hb-goal' }, L('Goal: ', 'Objectif : ') + tx(hb.goal)),
      h('div', { class: 'hb-streak' },
        h('span', { class: 'hb-streaknum' }, streak),
        h('span', { class: 'hb-streaklabel' }, pl(streak, L('day smoke-free', 'jour sans fumer'), L('days smoke-free', 'jours sans fumer')))),
      h('div', { class: 'hb-substats' },
        h('span', null, L('Best: ', 'Record : ') + best + ' ' + pl(best, L('day', 'jour'), L('days', 'jours'))),
        h('span', null, L('Day ', 'Jour ') + sinceStart + L(' since ', ' depuis le ') + ui.date(parseKey(hb.startDate).toISOString()))));
    root.appendChild(head);

    /* Aujourd'hui */
    var count = t ? t.count : 0;
    var todayCard = h('section', { class: 'card hb-today' },
      h('div', { class: 'hb-todayhead' },
        h('span', { class: 'card-title' }, L('Today', 'Aujourd’hui')),
        h('span', { class: 'hb-status ' + (!t ? 'is-info' : count === 0 ? 'is-up' : 'is-keep') },
          !t ? L('Not logged yet', 'Pas encore renseigné') : count === 0 ? L('Smoke-free so far', 'Sans tabac pour l’instant') : count + L(' smoked', pl(count, ' fumée', ' fumées')))),
      h('div', { class: 'hb-counter' },
        h('button', { class: 'btn btn-step', 'aria-label': L('One cigarette less', 'Une cigarette de moins'), disabled: !t || count === 0,
          onclick: function () { setDay(hb, tk, { count: Math.max(0, count - 1) }); render(); } }, '−'),
        h('div', { class: 'hb-countval' }, h('span', { class: 'hb-countnum' }, t ? count : '–'), h('span', { class: 'muted' }, L('cigarettes', pl(count, 'cigarette', 'cigarettes')))),
        h('button', { class: 'btn btn-step', 'aria-label': L('I smoked one cigarette', 'J’ai fumé une cigarette'),
          onclick: function () { setDay(hb, tk, { count: count + 1 }); render(); } }, '+')),
      h('div', { class: 'stack' },
        !t ? h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
          setDay(hb, tk, { count: 0 }); render(); ui.toast(L('Smoke-free day logged. Keep going!', 'Journée sans tabac enregistrée. Continue comme ça !'));
        } }, L('Smoke-free today ✓', 'Sans tabac aujourd’hui ✓')) : null,
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () {
          setDay(hb, tk, { cravings: ((t && t.cravings) || 0) + 1, count: count });
          render(); ui.toast(L('Well done! A craving usually passes within a few minutes.', 'Bien joué ! Une envie passe en général en quelques minutes.'));
        } }, L('I resisted a craving', 'J’ai résisté à une envie') + (t && t.cravings ? ' (' + t.cravings + L(' today)', ' aujourd’hui)') : ''))),
      h('p', { class: 'hint' }, L('Tap + each time you smoke. Log a smoke-free day at the end of the day, or come back to past days in the calendar.',
        'Touche + à chaque cigarette. Note ta journée sans tabac le soir, ou reviens sur les jours passés dans le calendrier.')));
    root.appendChild(todayCard);

    /* Bilan */
    root.appendChild(h('div', { class: 'stats hb-stats' },
      stat(L('Smoke-free days', 'Jours sans tabac'), tot.freeDays + ' / ' + tot.logged),
      stat(L('Cravings resisted', 'Envies résistées'), tot.cravings),
      stat(L('Cigarettes avoided', 'Cigarettes évitées'), tot.avoided === null ? '—' : tot.avoided),
      stat(L('Money saved', 'Argent économisé'), tot.saved === null ? '—' : money(tot.saved))));
    if (!hb.baselinePerDay || !hb.packPrice) {
      root.appendChild(h('button', { class: 'btn btn-ghost btn-block btn-sm', onclick: function () { editHabit(hb); } },
        L('Set your starting point to see cigarettes avoided and money saved ›', 'Indique ton point de départ pour voir les cigarettes évitées et l’argent économisé ›')));
    }

    /* Calendrier des 28 derniers jours */
    root.appendChild(h('h2', { class: 'section-title' }, L('Last ' + GRID_DAYS + ' days', GRID_DAYS + ' derniers jours')));
    var grid = h('div', { class: 'hb-grid' });
    for (var i = GRID_DAYS - 1; i >= 0; i--) {
      (function (k) {
        var l = dayLog(hb, k);
        var before = k < hb.startDate;
        var cls = 'hb-cell' + (before ? ' is-before' : !l ? ' is-empty' : l.count === 0 ? ' is-free' : ' is-smoked') + (k === tk ? ' is-today' : '');
        var d = parseKey(k);
        grid.appendChild(h('button', { class: cls, disabled: before,
          'aria-label': longDay(k) + L(': ', ' : ') +
            (!l ? L('not logged', 'non renseigné') : l.count === 0 ? L('smoke-free', 'sans tabac') : l.count + L(' cigarettes', pl(l.count, ' cigarette', ' cigarettes'))),
          onclick: function () { editDay(hb, k); } },
          h('span', { class: 'hb-cellday' }, d.getDate()),
          h('span', { class: 'hb-cellval' }, !l || before ? '' : l.count === 0 ? '✓' : l.count)));
      })(addDays(tk, -i));
    }
    root.appendChild(grid);
    root.appendChild(h('div', { class: 'hb-legend' },
      h('span', null, h('i', { class: 'hb-dot is-free' }), L('Smoke-free', 'Sans tabac')),
      h('span', null, h('i', { class: 'hb-dot is-smoked' }), L('Smoked', 'Fumé')),
      h('span', null, h('i', { class: 'hb-dot is-empty' }), L('Not logged', 'Non renseigné'))));

    /* Repères santé */
    root.appendChild(h('h2', { class: 'section-title' }, L('Health milestones', 'Repères santé')));
    root.appendChild(h('div', { class: 'list' }, MILESTONES.map(function (m) {
      var done = streak >= m.days;
      return h('div', { class: 'list-row hb-milestone' + (done ? ' is-done' : '') },
        h('div', null,
          h('div', { class: 'list-title' }, (done ? '✓ ' : '') + (m.days === 365 ? L('1 year', '1 an') : m.days + ' ' + pl(m.days, L('day', 'jour'), L('days', 'jours'))) + L(' smoke-free', ' sans fumer')),
          h('div', { class: 'list-sub' }, m.text)),
        done ? null : h('span', { class: 'muted hb-togo' }, L((m.days - streak) + ' to go', 'encore ' + (m.days - streak) + ' j')));
    })));
    root.appendChild(h('p', { class: 'hint' }, L('Milestones based on the WHO and the American Cancer Society, counted from your current smoke-free streak.',
      'Repères basés sur l’OMS et l’American Cancer Society, comptés depuis ta série actuelle sans tabac.')));
    root.appendChild(h('p', { class: 'hint' }, L('Need support? In France, Tabac Info Service: 39 89 (free).', 'Besoin d’aide ? Tabac Info Service : 39 89 (appel gratuit).')));
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
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': label + L(' minus one', ' : moins un'),
              onclick: function () { draft[key] = Math.max(0, draft[key] - 1); val.textContent = draft[key]; } }, '−'),
            val,
            h('button', { class: 'btn btn-step', type: 'button', 'aria-label': label + L(' plus one', ' : plus un'),
              onclick: function () { draft[key] += 1; val.textContent = draft[key]; } }, '+')));
      }
      body.appendChild(stepper(L('Cigarettes smoked', 'Cigarettes fumées'), 'count'));
      body.appendChild(stepper(L('Cravings resisted', 'Envies résistées'), 'cravings'));
      return [
        h('h2', { class: 'sheet-title' }, longDay(k)),
        h('p', { class: 'sheet-text' }, l ? L('Logged: ', 'Renseigné : ') + (l.count === 0 ? L('smoke-free', 'sans tabac') : l.count + ' ' + pl(l.count, 'cigarette', 'cigarettes')) + '.' : L('Not logged yet.', 'Pas encore renseigné.')),
        body,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            setDay(hb, k, { count: draft.count, cravings: draft.cravings }); close(); render();
          } }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          l ? h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            delete logsOf(hb)[k]; persist(); close(); render();
          } }, L('Clear this day', 'Effacer ce jour')) : null)
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
      var date = h('input', { class: 'input', type: 'date', value: draft.startDate, max: today(), 'aria-label': L('Start date', 'Date de début') });
      date.addEventListener('change', function () { draft.startDate = date.value; });
      return [
        h('h2', { class: 'sheet-title' }, tx(hb.name) + L(' · settings', ' · réglages')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Start date', 'Date de début')), date),
        numInput(L('Cigarettes per day before quitting', 'Cigarettes par jour avant d’arrêter'), 'baselinePerDay', 'numeric', L('e.g. 10', 'ex. 10')),
        h('div', { class: 'form-grid hb-grid2' },
          numInput(L('Pack price (€)', 'Prix du paquet (€)'), 'packPrice', 'decimal', L('e.g. 12.50', 'ex. 12,50')),
          numInput(L('Cigarettes per pack', 'Cigarettes par paquet'), 'perPack', 'numeric', '20')),
        h('p', { class: 'hint' }, L('Used only to estimate cigarettes avoided and money saved. Leave empty if you prefer.',
          'Sert seulement à estimer les cigarettes évitées et l’argent économisé. Laisse vide si tu préfères.')),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () {
            if (!draft.startDate || draft.startDate > today()) { err.textContent = L('Pick a start date that is not in the future.', 'Choisis une date de début qui n’est pas dans le futur.'); err.hidden = false; return; }
            if ((draft.baselinePerDay !== null && draft.baselinePerDay < 0) || (draft.packPrice !== null && draft.packPrice < 0) ||
                (draft.perPack !== null && draft.perPack < 1)) { err.textContent = L('Check the numbers.', 'Vérifie les nombres.'); err.hidden = false; return; }
            hb.startDate = draft.startDate;
            hb.baselinePerDay = draft.baselinePerDay === null ? null : Math.round(draft.baselinePerDay);
            hb.packPrice = draft.packPrice;
            hb.perPack = draft.perPack === null ? 20 : Math.round(draft.perPack);
            persist(); close(); render(); ui.toast(L('Settings saved', 'Réglages enregistrés'));
          } }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  S2.app.registerTab({ id: 'habitudes', label: L('Habits', 'Habitudes'), order: 40, icon: ICON, mount: mount });
})();
