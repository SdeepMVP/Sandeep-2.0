/* Onglet Aujourd'hui (SanEva) : le suivi du jour, pour la personne du téléphone et la 2e personne (Objectif › Cuisiner à 2).
   - Journal : repas prévus par le planning (Cuisine) à cocher, aliments du quotidien, recettes, saisie rapide ; eau.
   - Entraînement du jour (Muscu › jours d'entraînement) et activités (cardio, marche…).
   - Bilan de la semaine : séances, nutrition, courbes du poids et du tour de taille, ajustement proposé des calories.
   Données : localStorage "sandeep2:aujourdhui". Les autres onglets sont lus via leurs API (S2.objectif, S2.muscu, S2.cuisine).
   Calculs : js/tabs/aujourdhui-engine.js ; aliments : js/tabs/cuisine-nutrition.js. */
(function () {
  'use strict';
  var S2 = window.S2;
  var L = S2.L;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var TE = S2.todayEngine, NT = S2.nutritionTable;
  var NS = 'aujourdhui';
  var SCHEMA = 1;
  var WATER_GOAL = 8;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9 14.5l2 2 4-4"/></svg>';

  var ACTIVITIES = [['run', L('Running', 'Course'), '🏃'], ['bike', L('Cycling', 'Vélo'), '🚴'], ['walk', L('Walking', 'Marche'), '🚶'],
    ['swim', L('Swimming', 'Natation'), '🏊'], ['team', L('Team sport', 'Sport collectif'), '⚽'], ['other', L('Other', 'Autre'), '✨']];
  function activityOf(id) { return ACTIVITIES.filter(function (a) { return a[0] === id; })[0] || ACTIVITIES[5]; }

  /* ---------- Données ---------- */
  function defaults() { return { schema: SCHEMA, days: {}, custom: [], recent: { me: [], partner: [] } }; }
  function load() {
    var d = S2.storage.load(NS, null);
    if (!d || typeof d !== 'object') d = defaults();
    d.days = d.days || {}; d.custom = Array.isArray(d.custom) ? d.custom : [];
    d.recent = d.recent || {}; d.recent.me = d.recent.me || []; d.recent.partner = d.recent.partner || [];
    /* Futures migrations : if (d.schema < 2) { ... } */
    d.schema = SCHEMA;
    return d;
  }
  var data = null, root = null;
  function persist() { S2.storage.save(NS, data); }
  function slot(date, who) {
    var k = TE.dayKey(date);
    var day = data.days[k] || (data.days[k] = {});
    var s = day[who] || (day[who] = {});
    s.entries = s.entries || []; s.activities = s.activities || []; s.water = s.water || 0;
    return s;
  }
  function peek(date, who) { var d = data.days[TE.dayKey(date)]; return d && d[who] || { entries: [], activities: [], water: 0 }; }

  /* ---------- État de l'écran ---------- */
  var view = 'today';   // today | review
  var who = 'me';
  var date = midnight(new Date());
  var weekOffset = 0;   // bilan : 0 = semaine en cours
  function midnight(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return midnight(x); }
  function isToday(d) { return TE.dayKey(d) === TE.dayKey(new Date()); }

  function api(name) { return S2[name] || null; }
  function hasPartner() { try { return !!(S2.objectif && S2.objectif.hasPartner()); } catch (e) { return false; } }
  function nameOf(w) {
    try { return w === 'partner' ? S2.objectif.partnerName() : S2.objectif.myName(); } catch (e) { return w === 'partner' ? L('Other person', 'L’autre') : L('You', 'Toi'); }
  }
  function targetsOf(w) { try { return S2.objectif ? S2.objectif.targets(w) : null; } catch (e) { return null; } }

  function mount(container) {
    data = load();
    root = container;
    if (who === 'partner' && !hasPartner()) who = 'me';
    render();
  }

  function render() {
    root.innerHTML = '';
    var tMe = targetsOf('me');
    if (!tMe) { renderWelcome(); return; }
    root.appendChild(h('div', { class: 'segmented to-nav' },
      [['today', L('Today', 'Aujourd’hui')], ['review', L('Review', 'Bilan')]].map(function (x) {
        return h('button', { class: 'seg' + (view === x[0] ? ' is-active' : ''), 'aria-pressed': view === x[0] ? 'true' : 'false',
          onclick: function () { view = x[0]; render(); window.scrollTo(0, 0); } }, x[1]);
      })));
    if (hasPartner()) {
      root.appendChild(h('div', { class: 'segmented small' },
        [['me', nameOf('me')], ['partner', nameOf('partner')]].map(function (x) {
          return h('button', { class: 'seg' + (who === x[0] ? ' is-active' : ''), 'aria-pressed': who === x[0] ? 'true' : 'false',
            onclick: function () { who = x[0]; render(); } }, x[1]);
        })));
    }
    if (view === 'review') renderReview(); else renderToday();
  }

  function renderWelcome() {
    root.appendChild(h('div', { class: 'empty-state small to-welcome' },
      h('div', { class: 'empty-icon', html: ICON, 'aria-hidden': 'true' }),
      h('h2', null, L('Welcome to SanEva', 'Bienvenue sur SanEva')),
      h('p', null, L('Tell the app who you are, your sport and your goals: it suggests your calories, your program and your training days. Then follow each day what you eat and your workouts, here.',
        'Dis à l’app qui tu es, ton sport et tes objectifs : elle te propose tes calories, ton programme et tes jours d’entraînement. Ensuite, tu suis ici chaque jour ce que tu manges et tes séances.')),
      h('button', { class: 'btn btn-primary btn-lg', onclick: function () { S2.objectif.startWizard('me', render); } }, L('Start (2 min)', 'Commencer (2 min)'))));
  }

  /* ---------- Aujourd'hui ---------- */
  function renderToday() {
    var t = targetsOf(who);
    if (!t) {
      root.appendChild(h('div', { class: 'empty-state small' }, h('p', null, L('This person’s profile is incomplete.', 'Le profil de cette personne est incomplet.')),
        h('button', { class: 'btn btn-secondary', onclick: function () { S2.objectif.startWizard(who, render); } }, L('Complete the profile', 'Compléter le profil'))));
      return;
    }
    var day = peek(date, who);
    var tot = TE.totals(day.entries);

    /* Date */
    var label = date.toLocaleDateString(S2.locale, { weekday: 'long', day: 'numeric', month: 'long' });
    root.appendChild(h('div', { class: 'card to-daterow' },
      h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('Previous day', 'Jour précédent'), onclick: function () { date = addDays(date, -1); render(); } }, '‹'),
      h('button', { class: 'to-datelabel', onclick: function () { date = midnight(new Date()); render(); } },
        h('span', { class: 'to-today' }, isToday(date) ? L('Today', 'Aujourd’hui') : TE.dayKey(date) < TE.dayKey(new Date()) ? L('Past day · back to today', 'Jour passé · revenir à aujourd’hui') : L('Upcoming · back to today', 'À venir · revenir à aujourd’hui')),
        h('span', { class: 'to-date' }, label.charAt(0).toUpperCase() + label.slice(1))),
      h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('Next day', 'Jour suivant'), disabled: TE.dayKey(date) >= TE.dayKey(addDays(new Date(), 7)),
        onclick: function () { date = addDays(date, 1); render(); } }, '›')));

    /* Bilan du jour */
    var left = t.kcal - tot.kcal;
    root.appendChild(h('div', { class: 'card to-summary' },
      h('div', { class: 'to-kcalrow' },
        h('div', null, h('span', { class: 'to-kcalnum' }, fmt(tot.kcal)), h('span', { class: 'to-kcalof' }, ' / ' + fmt(t.kcal) + ' kcal')),
        h('div', { class: 'to-left' + (left < 0 ? ' is-over' : '') }, left >= 0 ? L('left ', 'reste ') + fmt(left) : '+' + fmt(-left) + L(' over', ' en trop'))),
      bar(tot.kcal / t.kcal, 'kcal'),
      h('div', { class: 'to-macros' },
        macro(L('Protein', 'Protéines'), tot.protein, t.protein, 'p'),
        macro(L('Carbs', 'Glucides'), tot.carbs, t.carbs, 'c'),
        macro(L('Fat', 'Lipides'), tot.fat, t.fat, 'f'))));

    renderTraining(day);
    renderMeals(day, t);

    root.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () { addFood(); } }, L('+ Add food', '+ Ajouter un aliment'))));

    /* Eau et pesée */
    var water = day.water || 0;
    root.appendChild(h('div', { class: 'card to-water' },
      h('div', null, h('div', { class: 'card-title' }, L('💧 Water', '💧 Eau')),
        h('div', { class: 'list-sub' }, water + ' / ' + WATER_GOAL + L(' glasses (25 cl)', ' verres (25 cl)'))),
      h('div', { class: 'stepper to-waterstep' },
        h('button', { class: 'btn btn-step', 'aria-label': L('One glass less', 'Un verre de moins'), disabled: water <= 0, onclick: function () { slot(date, who).water = Math.max(0, water - 1); persist(); render(); } }, '−'),
        h('span', { class: 'stepper-num' }, water),
        h('button', { class: 'btn btn-step', 'aria-label': L('One glass more', 'Un verre de plus'), onclick: function () { slot(date, who).water = water + 1; persist(); render(); } }, '+'))));
    var prof = S2.objectif.profile(who), lastW = prof && prof.weights[prof.weights.length - 1];
    root.appendChild(h('div', { class: 'card to-weigh' },
      h('div', null, h('div', { class: 'card-title' }, L('⚖️ Weight', '⚖️ Poids')),
        h('div', { class: 'list-sub' }, prof ? num(prof.weight, 1) + ' kg' + (lastW ? L(' · weighed ', ' · pesée le ') + ui.date(lastW.date) : '') : '')),
      h('button', { class: 'btn btn-secondary', onclick: function () { S2.objectif.logWeight(who, render); } }, L('Weigh in', 'Me peser'))));
  }

  function fmt(n) { return Math.round(n).toLocaleString(S2.locale); }
  function bar(share, cls) {
    var pct = Math.max(0, share || 0);
    return h('span', { class: 'to-bar to-bar-' + cls + (pct > 1.1 ? ' is-over' : ''), 'aria-hidden': 'true' }, h('span', { style: 'width:' + Math.min(100, Math.round(pct * 100)) + '%' }));
  }
  function macro(label, val, target, k) {
    return h('div', { class: 'to-macro' },
      h('span', { class: 'stat-label' }, label),
      h('span', { class: 'to-macroval' }, String(val), h('span', { class: 'to-macroof' }, ' / ' + target + ' g')),
      bar(target ? val / target : 0, k));
  }

  /* Entraînement du jour + activités */
  function renderTraining(day) {
    var mu = api('muscu');
    var st = mu ? mu.dayStatus(date, who) : null;
    var card = h('div', { class: 'card to-training' });
    card.appendChild(h('div', { class: 'card-title' }, L('🏋️ Training', '🏋️ Entraînement')));
    if (st) {
      if (st.done.length) {
        st.done.forEach(function (d) { card.appendChild(h('div', { class: 'to-done' }, '✓ ' + d.name + L(' · week ', ' · semaine ') + d.week + ' · ' + d.sets + L(' sets', ' séries'))); });
      } else if (st.inProgress) {
        card.appendChild(h('div', { class: 'to-planned' }, L('In progress: ', 'En cours : ') + st.inProgress));
        card.appendChild(h('button', { class: 'btn btn-primary btn-block', onclick: function () { mu.open(who); } }, L('Resume the workout ›', 'Reprendre la séance ›')));
      } else if (st.planned) {
        card.appendChild(h('div', { class: 'to-planned' }, L('Planned: ', 'Prévu : ') + st.planned.name + ' · ' + st.planned.exercises + L(' exercises', ' exercices')));
        if (isToday(date)) card.appendChild(h('button', { class: 'btn btn-primary btn-block', onclick: function () { mu.open(who, st.planned.id); } }, L('Start the workout ›', 'Commencer la séance ›')));
        else if (TE.dayKey(date) < TE.dayKey(new Date())) card.appendChild(h('p', { class: 'hint' }, L('Not done.', 'Pas faite.')));
      } else if (!st.hasProgram) {
        card.appendChild(h('p', { class: 'hint' }, L('No program yet.', 'Pas encore de programme.')));
        card.appendChild(h('button', { class: 'btn btn-secondary btn-block', onclick: function () { mu.open(who); } }, L('Set up my program ›', 'Préparer mon programme ›')));
      } else {
        card.appendChild(h('div', { class: 'to-planned is-rest' }, L('Rest day', 'Jour de repos')));
        if (isToday(date)) card.appendChild(h('button', { class: 'btn btn-ghost btn-block', onclick: function () { mu.open(who); } }, L('Train anyway ›', 'M’entraîner quand même ›')));
      }
    }
    day.activities.forEach(function (a) {
      var act = activityOf(a.type);
      card.appendChild(h('div', { class: 'to-activity' },
        h('span', null, act[2] + ' ' + act[1] + ' · ' + a.minutes + ' min' + (a.note ? ' · ' + a.note : '')),
        h('button', { class: 'btn btn-icon', 'aria-label': L('Remove', 'Retirer'), onclick: function () {
          ui.confirm({ title: L('Remove this activity?', 'Retirer cette activité ?'), okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) {
            if (!ok) return; var s = slot(date, who); s.activities = s.activities.filter(function (x) { return x.id !== a.id; }); persist(); render();
          });
        } }, '✕')));
    });
    card.appendChild(h('button', { class: 'btn btn-ghost btn-sm to-addact', onclick: addActivity }, L('+ Activity (cardio, walk…)', '+ Activité (cardio, marche…)')));
    root.appendChild(card);
  }

  function addActivity() {
    var type = 'walk', minutes = 30;
    ui.sheet(function (close) {
      var box = h('div', { class: 'ob-choices to-acts' });
      function paint() {
        box.innerHTML = '';
        ACTIVITIES.forEach(function (a) {
          box.appendChild(h('button', { class: 'ob-choice' + (type === a[0] ? ' is-on' : ''), type: 'button', onclick: function () { type = a[0]; paint(); } },
            h('span', { class: 'ob-choicename' }, a[2] + ' ' + a[1])));
        });
      }
      paint();
      var inp = h('input', { class: 'input', type: 'text', inputmode: 'numeric', value: '30', 'aria-label': L('Minutes', 'Minutes') });
      var note = h('input', { class: 'input', type: 'text', placeholder: L('Optional (e.g. 5 km)', 'Facultatif (ex. 5 km)'), 'aria-label': L('Note', 'Note') });
      var err = h('p', { class: 'form-error', hidden: true });
      function save() {
        minutes = ui.parseNum(inp.value);
        if (!minutes || minutes < 1 || minutes > 600) { err.textContent = L('Duration between 1 and 600 minutes.', 'Durée entre 1 et 600 minutes.'); err.hidden = false; return; }
        slot(date, who).activities.push({ id: ui.uid(), type: type, minutes: Math.round(minutes), note: note.value.trim() });
        persist(); close(); render(); ui.toast(L('Activity added', 'Activité ajoutée'));
      }
      return [
        h('h2', { class: 'sheet-title' }, L('Activity', 'Activité')), box,
        h('div', { class: 'form-grid ob-grid2' }, h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Minutes', 'Minutes')), inp), h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Note', 'Note')), note)),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Add', 'Ajouter')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* Repas : prévus par le planning (à cocher) + ce qui a été noté */
  function renderMeals(day, t) {
    var cu = api('cuisine');
    var planned = cu ? cu.plannedMeals(date) : [];
    var card = h('div', { class: 'card to-meals' });
    card.appendChild(h('div', { class: 'card-title' }, L('🍽️ Meals', '🍽️ Repas')));
    if (planned.length) {
      planned.forEach(function (m) {
        var portion = who === 'partner' ? (m.portion2 || m.portion) : m.portion;
        var logged = day.entries.filter(function (e) { return e.planned === m.slotIndex && e.ref === m.id; })[0];
        card.appendChild(h('div', { class: 'to-planrow' + (logged ? ' is-done' : '') },
          h('button', { class: 'to-planmain', onclick: function () { cu.open(m.id); } },
            h('span', { class: 'ck-dayslot' }, m.slot),
            h('span', { class: 'to-planname' }, m.name),
            h('span', { class: 'list-sub' }, logged ? '✓ ' + qtyText(logged.qty) + ' · ' + Math.round(logged.kcal) + ' kcal · ' + Math.round(logged.protein) + ' g'
              : qtyText(portion) + ' · ' + Math.round(m.kcal * portion) + ' kcal · ' + Math.round(m.protein * portion) + ' g')),
          logged ? h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { removeEntry(logged); } }, L('Undo', 'Annuler'))
            : h('div', { class: 'to-planbtns' },
              h('button', { class: 'btn btn-secondary btn-sm', 'aria-label': L('Change the serving', 'Changer la portion'), onclick: function () { pickQty(m, portion, true, function (q) { logRecipe(m, q, m.slotIndex); }); } }, '×'),
              h('button', { class: 'btn btn-primary btn-sm', onclick: function () { logRecipe(m, portion, m.slotIndex); } }, L('✓ Eaten', '✓ Mangé')))));
      });
    } else {
      card.appendChild(h('p', { class: 'hint' }, L('No meal planned for this day. ', 'Aucun repas prévu ce jour-là. '),
        h('a', { href: '#cuisine' }, L('Plan in Kitchen › Planning', 'Prévoir dans Cuisine › Planning'))));
    }
    var extra = day.entries.filter(function (e) { return e.planned === null || e.planned === undefined; });
    if (extra.length) {
      card.appendChild(h('div', { class: 'to-extrahead' }, L('Also eaten', 'Aussi mangé')));
      extra.forEach(function (e) {
        card.appendChild(h('div', { class: 'to-entry' },
          h('div', { class: 'to-entrymain' }, h('span', { class: 'to-entryname' }, e.name),
            h('span', { class: 'list-sub' }, (e.portion ? e.portion + (e.qty !== 1 ? ' ×' + num(e.qty) : '') : qtyText(e.qty)) + ' · ' + Math.round(e.kcal) + ' kcal · ' + Math.round(e.protein) + L(' g protein', ' g prot.'))),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Remove', 'Retirer'), onclick: function () { removeEntry(e); } }, '✕')));
      });
    }
    root.appendChild(card);
  }
  function qtyText(q) { return q === 1 ? L('1 serving', '1 portion') : '×' + num(q) + L(' serving', ' portion'); }

  function logRecipe(m, qty, plannedIdx) {
    addEntry({ type: 'recipe', ref: m.id, name: m.name, qty: qty, planned: plannedIdx === undefined ? null : plannedIdx,
      kcal: m.kcal * qty, protein: m.protein * qty, carbs: m.carbs * qty, fat: m.fat * qty });
  }
  function addEntry(e) {
    e.id = ui.uid(); e.at = new Date().toISOString();
    ['kcal', 'protein', 'carbs', 'fat'].forEach(function (k) { e[k] = Math.round((e[k] || 0) * 10) / 10; });
    slot(date, who).entries.push(e);
    if (e.type !== 'quick') {
      var key = e.type + ':' + e.ref, rec = data.recent[who];
      data.recent[who] = [key].concat(rec.filter(function (x) { return x !== key; })).slice(0, 12);
    }
    persist(); render();
    ui.toast(L('Added · ', 'Ajouté · ') + Math.round(e.kcal) + ' kcal');
  }
  function removeEntry(e) {
    ui.confirm({ title: L('Remove “' + e.name + '”?', 'Retirer « ' + e.name + ' » ?'), okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) {
      if (!ok) return;
      var s = slot(date, who); s.entries = s.entries.filter(function (x) { return x.id !== e.id; }); persist(); render();
    });
  }

  /* Choix de la quantité (portions). */
  var QTYS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  function pickQty(item, start, isRecipe, done) {
    var i = Math.max(0, QTYS.indexOf(start)); if (QTYS.indexOf(start) < 0) i = 3;
    ui.sheet(function (close) {
      var val = h('div', { class: 'to-qtyval' }), info = h('div', { class: 'list-sub' });
      function paint() {
        var q = QTYS[i];
        val.textContent = '×' + num(q);
        info.textContent = (isRecipe ? '' : (item.portion ? item.portion + ' · ' : '')) + Math.round(item.kcal * q) + ' kcal · ' + Math.round(item.protein * q) + L(' g protein · ', ' g de protéines · ') +
          Math.round(item.carbs * q) + L(' g carbs · ', ' g de glucides · ') + Math.round(item.fat * q) + L(' g fat', ' g de lipides');
      }
      paint();
      return [
        h('h2', { class: 'sheet-title' }, item.name),
        h('div', { class: 'stepper' },
          h('button', { class: 'btn btn-step', type: 'button', 'aria-label': L('Less', 'Moins'), onclick: function () { if (i > 0) { i--; paint(); } } }, '−'),
          val,
          h('button', { class: 'btn btn-step', type: 'button', 'aria-label': L('More', 'Plus'), onclick: function () { if (i < QTYS.length - 1) { i++; paint(); } } }, '+')),
        info,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: function () { close(); done(QTYS[i]); } }, L('Add', 'Ajouter')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ---------- Ajouter un aliment : récents, aliments du quotidien, recettes, mes aliments, saisie rapide ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe'); }
  function addFood() {
    var tab = 'foods', q = '';
    var cu = api('cuisine'), recipes = cu ? cu.recipes() : [];
    function foodItem(f) { return { kind: 'food', id: f.id, name: f.name, portion: f.portion, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat }; }
    function customItem(f) { return { kind: 'custom', id: f.id, name: f.name, portion: f.portion, kcal: f.kcal, protein: f.protein, carbs: f.carbs || 0, fat: f.fat || 0 }; }
    function recipeItem(r) { return { kind: 'recipe', id: r.id, name: r.name, portion: L('1 serving', '1 portion'), kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat }; }
    function findRecent(key) {
      var p = key.split(':'), type = p[0], id = p.slice(1).join(':');
      if (type === 'food') { var f = NT.FOODS.filter(function (x) { return x.id === id; })[0]; return f && foodItem(f); }
      if (type === 'custom') { var c = data.custom.filter(function (x) { return x.id === id; })[0]; return c && customItem(c); }
      if (type === 'recipe') { var r = recipes.filter(function (x) { return x.id === id; })[0]; return r && recipeItem(r); }
      return null;
    }
    ui.sheet(function (close) {
      var list = h('div', { class: 'to-foodlist' });
      var search = h('input', { class: 'input', type: 'search', placeholder: L('Search (e.g. banana, skyr, pizza)', 'Rechercher (ex. banane, skyr, pizza)'), 'aria-label': L('Search', 'Rechercher'), autocomplete: 'off' });
      search.addEventListener('input', function () { q = search.value; paint(); });
      var tabs = h('div', { class: 'segmented small' });
      function paintTabs() {
        tabs.innerHTML = '';
        [['foods', L('Foods', 'Aliments')], ['recipes', L('Recipes', 'Recettes')], ['mine', L('Mine', 'Les miens')]].forEach(function (x) {
          tabs.appendChild(h('button', { class: 'seg' + (tab === x[0] ? ' is-active' : ''), type: 'button', onclick: function () { tab = x[0]; paintTabs(); paint(); } }, x[1]));
        });
      }
      function row(it) {
        return h('button', { class: 'to-food', type: 'button', onclick: function () {
          close();
          pickQty(it, 1, it.kind === 'recipe', function (qty) {
            addEntry({ type: it.kind, ref: it.id, name: it.name, portion: it.kind === 'recipe' ? null : it.portion, qty: qty, planned: null,
              kcal: it.kcal * qty, protein: it.protein * qty, carbs: it.carbs * qty, fat: it.fat * qty });
          });
        } },
          h('span', { class: 'to-foodname' }, it.name, h('span', { class: 'list-sub' }, it.portion)),
          h('span', { class: 'to-foodkcal' }, Math.round(it.kcal) + ' kcal', h('span', { class: 'list-sub' }, Math.round(it.protein) + L(' g prot.', ' g prot.'))));
      }
      function paint() {
        list.innerHTML = '';
        var n = norm(q).trim();
        function match(it) { return !n || n.split(/\s+/).every(function (w) { return norm(it.name).indexOf(w) > -1; }); }
        if (!n && tab === 'foods' && data.recent[who].length) {
          var rec = data.recent[who].map(findRecent).filter(Boolean);
          if (rec.length) { list.appendChild(h('div', { class: 'to-extrahead' }, L('Recent', 'Récents'))); rec.forEach(function (it) { list.appendChild(row(it)); }); list.appendChild(h('div', { class: 'to-extrahead' }, L('All foods', 'Tous les aliments'))); }
        }
        var items = tab === 'foods' ? NT.FOODS.map(foodItem) : tab === 'recipes' ? recipes.map(recipeItem) : data.custom.map(customItem);
        items = items.filter(match);
        items.forEach(function (it) { list.appendChild(row(it)); });
        if (tab === 'mine') list.appendChild(h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: function () { close(); editCustom(null); } }, L('+ Create a food', '+ Créer un aliment')));
        if (!items.length && tab !== 'mine') list.appendChild(h('p', { class: 'hint' }, L('Nothing found. Try “Mine” or a quick entry.', 'Rien trouvé. Essaie « Les miens » ou une saisie rapide.')));
      }
      paintTabs(); paint();
      setTimeout(function () { search.focus(); }, 250);
      return [
        h('h2', { class: 'sheet-title' }, L('Add food · ', 'Ajouter · ') + nameOf(who)),
        search, tabs, list,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-secondary btn-block', onclick: function () { close(); quickEntry(); } }, L('⚡ Quick entry (calories only)', '⚡ Saisie rapide (calories seulement)')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Close', 'Fermer')))
      ];
    });
  }

  function numInput(label, ph) { return h('input', { class: 'input', type: 'text', inputmode: 'decimal', placeholder: ph || '', 'aria-label': label, autocomplete: 'off' }); }
  function field(label, inp) { return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp); }

  function quickEntry() {
    ui.sheet(function (close) {
      var name = h('input', { class: 'input', type: 'text', placeholder: L('e.g. Lunch out', 'ex. Déjeuner au resto'), 'aria-label': L('Name', 'Nom') });
      var k = numInput('kcal', '600'), p = numInput(L('Protein (g)', 'Protéines (g)'), L('optional', 'facultatif')), c = numInput(L('Carbs (g)', 'Glucides (g)'), L('optional', 'facultatif')), f = numInput(L('Fat (g)', 'Lipides (g)'), L('optional', 'facultatif'));
      var err = h('p', { class: 'form-error', hidden: true });
      function save() {
        var kv = ui.parseNum(k.value);
        if (!kv || kv < 1 || kv > 5000) { err.textContent = L('Calories between 1 and 5000.', 'Calories entre 1 et 5000.'); err.hidden = false; return; }
        close();
        addEntry({ type: 'quick', ref: null, name: name.value.trim() || L('Quick entry', 'Saisie rapide'), portion: null, qty: 1, planned: null,
          kcal: kv, protein: ui.parseNum(p.value) || 0, carbs: ui.parseNum(c.value) || 0, fat: ui.parseNum(f.value) || 0 });
      }
      return [
        h('h2', { class: 'sheet-title' }, L('Quick entry', 'Saisie rapide')),
        field(L('Name', 'Nom'), name),
        h('div', { class: 'form-grid ob-grid2' }, field(L('Calories (kcal)', 'Calories (kcal)'), k), field(L('Protein (g)', 'Protéines (g)'), p), field(L('Carbs (g)', 'Glucides (g)'), c), field(L('Fat (g)', 'Lipides (g)'), f)),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Add', 'Ajouter')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* Mes aliments : créés une fois, réutilisables (ex. ton shaker, ton plat préféré du resto). */
  function editCustom(f) {
    var isNew = !f;
    f = f || { id: 'c-' + ui.uid(), name: '', portion: '', kcal: null, protein: null, carbs: null, fat: null };
    ui.sheet(function (close) {
      var name = h('input', { class: 'input', type: 'text', value: f.name, placeholder: L('e.g. My protein shake', 'ex. Mon shaker protéiné'), 'aria-label': L('Name', 'Nom') });
      var portion = h('input', { class: 'input', type: 'text', value: f.portion, placeholder: L('e.g. 1 shaker (300 ml)', 'ex. 1 shaker (300 ml)'), 'aria-label': L('Serving', 'Portion') });
      var k = numInput('kcal'), p = numInput(L('Protein (g)', 'Protéines (g)')), c = numInput(L('Carbs (g)', 'Glucides (g)')), fa = numInput(L('Fat (g)', 'Lipides (g)'));
      [[k, 'kcal'], [p, 'protein'], [c, 'carbs'], [fa, 'fat']].forEach(function (x) { if (f[x[1]] !== null && f[x[1]] !== undefined) x[0].value = num(f[x[1]]); });
      var err = h('p', { class: 'form-error', hidden: true });
      function save() {
        var kv = ui.parseNum(k.value), pv = ui.parseNum(p.value);
        if (!name.value.trim()) { err.textContent = L('Give it a name.', 'Donne-lui un nom.'); err.hidden = false; return; }
        if (!kv || kv > 5000 || pv === null || pv < 0) { err.textContent = L('Fill in calories and protein (per serving).', 'Renseigne les calories et les protéines (par portion).'); err.hidden = false; return; }
        f.name = name.value.trim(); f.portion = portion.value.trim() || L('1 serving', '1 portion');
        f.kcal = kv; f.protein = pv; f.carbs = ui.parseNum(c.value) || 0; f.fat = ui.parseNum(fa.value) || 0;
        if (isNew) data.custom.push(f);
        persist(); close(); ui.toast(L('Food saved', 'Aliment enregistré')); addFood();
      }
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New food', 'Nouvel aliment') : L('Edit food', 'Modifier l’aliment')),
        field(L('Name', 'Nom'), name), field(L('Serving', 'Portion'), portion),
        h('p', { class: 'hint' }, L('Values for one serving (read them on the packaging).', 'Valeurs pour une portion (lis-les sur l’emballage).')),
        h('div', { class: 'form-grid ob-grid2' }, field('kcal', k), field(L('Protein (g)', 'Protéines (g)'), p), field(L('Carbs (g)', 'Glucides (g)'), c), field(L('Fat (g)', 'Lipides (g)'), fa)),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
            ui.confirm({ title: L('Delete this food?', 'Supprimer cet aliment ?'), message: L('Days where you logged it are not changed.', 'Les jours où tu l’as noté ne changent pas.'), okLabel: L('Delete', 'Supprimer'), danger: true }).then(function (ok) {
              if (!ok) return; data.custom = data.custom.filter(function (x) { return x.id !== f.id; }); persist(); close();
            });
          } }, L('Delete', 'Supprimer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ---------- Bilan de la semaine ---------- */
  function renderReview() {
    var t = targetsOf(who), prof = S2.objectif.profile(who);
    if (!t || !prof) return;
    var mon = addDays(TE.monday(new Date()), weekOffset * 7), sun = addDays(mon, 6);
    var fmtD = function (d) { return d.toLocaleDateString(S2.locale, { day: 'numeric', month: 'short' }); };
    root.appendChild(h('div', { class: 'card to-daterow' },
      h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('Previous week', 'Semaine précédente'), onclick: function () { weekOffset--; render(); } }, '‹'),
      h('div', { class: 'to-datelabel' }, h('span', { class: 'to-today' }, weekOffset === 0 ? L('This week', 'Cette semaine') : weekOffset === -1 ? L('Last week', 'La semaine dernière') : L('Week', 'Semaine')),
        h('span', { class: 'to-date' }, fmtD(mon) + ' → ' + fmtD(sun))),
      h('button', { class: 'btn btn-secondary btn-icon', 'aria-label': L('Next week', 'Semaine suivante'), disabled: weekOffset >= 0, onclick: function () { weekOffset++; render(); } }, '›')));

    /* Entraînement */
    var mu = api('muscu'), ws = mu ? mu.weekStats(mon, sun, who) : null;
    var acts = [], days = [];
    for (var i = 0; i < 7; i++) { var dd = addDays(mon, i), pd = peek(dd, who); days.push(pd); acts = acts.concat(pd.activities || []); }
    var actMin = acts.reduce(function (n, a) { return n + (a.minutes || 0); }, 0);
    var tc = h('div', { class: 'card to-review' }, h('div', { class: 'card-title' }, L('🏋️ Training', '🏋️ Entraînement')));
    if (ws) {
      var goal = ws.perWeek || ws.planned;
      tc.appendChild(statRow(L('Workouts done', 'Séances faites'), ws.done + (goal ? ' / ' + goal : ''), goal ? ws.done / goal : null));
      ws.lifts.forEach(function (lf) { tc.appendChild(statRow(lf.name, (lf.best === null ? '—' : num(lf.best)) + ' / ' + num(lf.target) + ' kg', lf.best === null ? 0 : lf.best / lf.target)); });
    }
    tc.appendChild(statRow(L('Other activities', 'Autres activités'), acts.length ? acts.length + ' · ' + actMin + ' min' : '—', null));
    root.appendChild(tc);

    /* Nutrition */
    var ns = TE.nutritionSummary(days.filter(function (_, k) { return TE.dayKey(addDays(mon, k)) <= TE.dayKey(new Date()); }), t);
    var nc = h('div', { class: 'card to-review' }, h('div', { class: 'card-title' }, L('🍽️ Nutrition', '🍽️ Nutrition')));
    nc.appendChild(statRow(L('Days tracked', 'Jours suivis'), ns.logged + ' / ' + ns.days, ns.days ? ns.logged / ns.days : 0));
    if (ns.logged) {
      nc.appendChild(statRow(L('Calories per day (average)', 'Calories par jour (moyenne)'), fmt(ns.kcal) + ' / ' + fmt(t.kcal), ns.kcal / t.kcal));
      nc.appendChild(statRow(L('Protein per day (average)', 'Protéines par jour (moyenne)'), ns.protein + ' / ' + t.protein + ' g', ns.protein / t.protein));
      nc.appendChild(statRow(L('Days on target (kcal ±10 %, protein ≥ 90 %)', 'Jours dans la cible (kcal ±10 %, protéines ≥ 90 %)'), ns.inTarget + ' / ' + ns.logged, ns.inTarget / ns.logged));
    } else nc.appendChild(h('p', { class: 'hint' }, L('Log your meals in Today to see your averages here.', 'Note tes repas dans Aujourd’hui pour voir tes moyennes ici.')));
    root.appendChild(nc);

    /* Poids et tour de taille (12 dernières semaines) */
    var from = addDays(new Date(), -84);
    var wpts = prof.weights.filter(function (w) { return new Date(w.date) >= from; }).map(function (w) { return { t: new Date(w.date), v: w.kg }; });
    var trend = TE.weightTrend(prof.weights, new Date(), 28);
    var wc = h('div', { class: 'card to-review' }, h('div', { class: 'card-title' }, L('⚖️ Weight (12 weeks)', '⚖️ Poids (12 semaines)')));
    if (wpts.length >= 2) wc.appendChild(chart(wpts, 'kg', prof.targetWeight));
    else wc.appendChild(h('p', { class: 'hint' }, L('Weigh yourself 2 to 3 times a week, in the morning: the curve appears here.', 'Pèse-toi 2 à 3 fois par semaine, le matin : la courbe apparaît ici.')));
    if (trend) wc.appendChild(h('p', { class: 'sheet-text' }, L('Trend over 4 weeks: ', 'Tendance sur 4 semaines : ') + (trend.perWeek > 0 ? '+' : trend.perWeek < 0 ? '−' : '') + num(Math.abs(trend.perWeek), 2) +
      L(' kg / week (', ' kg / semaine (') + (trend.pct > 0 ? '+' : trend.pct < 0 ? '−' : '') + num(Math.abs(trend.pct), 1) + ' %)'));
    wc.appendChild(h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { S2.objectif.logWeight(who, render); } }, L('+ Weigh in', '+ Me peser')));
    root.appendChild(wc);
    var mpts = prof.measures.filter(function (m) { return m.waist; }).map(function (m) { return { t: new Date(m.date), v: m.waist }; });
    var mc = h('div', { class: 'card to-review' }, h('div', { class: 'card-title' }, L('📏 Waist', '📏 Tour de taille')));
    if (mpts.length >= 2) mc.appendChild(chart(mpts, 'cm'));
    else mc.appendChild(h('p', { class: 'hint' }, mpts.length ? L('Last: ', 'Dernier : ') + num(mpts[0].v, 1) + ' cm. ' + L('Measure again in a few weeks.', 'Remesure dans quelques semaines.') : L('Measure your waist once a month: it shows fat loss even when the scale does not move.', 'Mesure ton tour de taille une fois par mois : il montre la perte de gras même quand la balance ne bouge pas.')));
    mc.appendChild(h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { S2.objectif.logMeasures(who, render); } }, L('+ Measurements', '+ Mensurations')));
    root.appendChild(mc);

    /* Ajustement proposé (sur les 2 dernières semaines de suivi) */
    var last14 = [];
    for (var j = 13; j >= 0; j--) last14.push(peek(addDays(new Date(), -j), who));
    var sug = TE.suggestion(prof.goal, trend, TE.nutritionSummary(last14, t), t.kcal);
    var range = sug.range.map(function (x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + num(Math.abs(x), 2); }).join(L(' to ', ' à ')) + L(' % a week', ' % par semaine');
    var sc = h('div', { class: 'card to-suggest is-' + sug.kind }, h('div', { class: 'card-title' }, L('🎯 Adjustment', '🎯 Ajustement')));
    var goalName = S2.objectif.goalLabel(prof.goal);
    var msg = {
      wait: L('Not enough weigh-ins yet: at least 3 over 10 days. Expected for “' + goalName + '”: ', 'Pas encore assez de pesées : au moins 3 sur 10 jours. Attendu pour « ' + goalName + ' » : ') + range + '.',
      log: L('Log your meals on most days for 2 weeks before changing your calories: the trend only means something if you eat close to your target.', 'Note tes repas la plupart des jours pendant 2 semaines avant de changer tes calories : la tendance n’a de sens que si tu manges proche de ta cible.'),
      keep: L('On track for “' + goalName + '” (expected ', 'Dans les clous pour « ' + goalName + ' » (attendu ') + range + L('). Keep your calories.', '). Garde tes calories.'),
      up: L('Your weight moves less than expected for “' + goalName + '” (', 'Ton poids évolue moins que prévu pour « ' + goalName + ' » (') + range + L('). Suggestion: +', '). Suggestion : +') + TE.STEP + ' kcal.',
      down: L('Your weight moves more than expected for “' + goalName + '” (', 'Ton poids évolue plus que prévu pour « ' + goalName + ' » (') + range + L('). Suggestion: −', '). Suggestion : −') + TE.STEP + ' kcal.'
    }[sug.kind];
    if (sug.kind === 'up' && prof.goal === 'cut') msg = L('You are losing faster than 1 % a week: risk of losing muscle. Suggestion: +', 'Tu perds plus de 1 % par semaine : risque de perdre du muscle. Suggestion : +') + TE.STEP + ' kcal.';
    sc.appendChild(h('p', { class: 'sheet-text' }, msg));
    if (sug.kind === 'up' || sug.kind === 'down') {
      sc.appendChild(h('button', { class: 'btn btn-primary btn-block', onclick: function () {
        ui.confirm({ title: L('Set ' + fmt(sug.newKcal) + ' kcal a day?', 'Passer à ' + fmt(sug.newKcal) + ' kcal par jour ?'),
          message: L('Your daily target is set by hand to this value (Goal tab, where you can go back to the calculation).', 'Ton objectif du jour est fixé à la main à cette valeur (onglet Objectif, où tu peux revenir au calcul).'),
          okLabel: L('Apply', 'Appliquer') }).then(function (ok) {
          if (!ok) return; S2.objectif.setCustomKcal(who, sug.newKcal); render(); ui.toast(L('Target updated', 'Objectif mis à jour'));
        });
      } }, L('Apply: ', 'Appliquer : ') + fmt(sug.newKcal) + ' kcal'));
    }
    root.appendChild(sc);
  }

  function statRow(label, value, share) {
    return h('div', { class: 'to-stat' },
      h('div', { class: 'to-statline' }, h('span', null, label), h('span', { class: 'to-statval' }, value)),
      share === null || share === undefined ? null : bar(share, share >= 0.9 ? 'ok' : 'kcal'));
  }

  /* Courbe simple (SVG) : points { t: Date, v }, ligne de l'objectif facultative. */
  function chart(pts, unit, target) {
    var W = 340, H = 150, P = { l: 36, r: 8, t: 10, b: 22 };
    var vs = pts.map(function (p) { return p.v; }).concat(target ? [target] : []);
    var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    if (max - min < 1) { max += 0.5; min -= 0.5; }
    var t0 = pts[0].t.getTime(), t1 = pts[pts.length - 1].t.getTime(); if (t1 === t0) t1 = t0 + 86400000;
    function x(p) { return P.l + (p.t.getTime() - t0) / (t1 - t0) * (W - P.l - P.r); }
    function y(v) { return P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b); }
    var ns = 'http://www.w3.org/2000/svg';
    function s(tag, attrs, text) { var e = document.createElementNS(ns, tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (text !== undefined) e.textContent = text; return e; }
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart-svg to-chart', role: 'img', 'aria-label': L('Curve', 'Courbe') });
    [min, (min + max) / 2, max].forEach(function (v) {
      svg.appendChild(s('line', { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v), class: 'chart-grid' }));
      svg.appendChild(s('text', { x: P.l - 4, y: y(v) + 4, 'text-anchor': 'end', class: 'chart-axis' }, num(v, 1)));
    });
    if (target) svg.appendChild(s('line', { x1: P.l, x2: W - P.r, y1: y(target), y2: y(target), class: 'to-target' }));
    svg.appendChild(s('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' '), class: 'chart-line' }));
    pts.forEach(function (p) { svg.appendChild(s('circle', { cx: x(p), cy: y(p.v), r: 3.5, class: 'chart-dot' })); });
    var fd = function (d) { return d.toLocaleDateString(S2.locale, { day: 'numeric', month: 'short' }); };
    svg.appendChild(s('text', { x: P.l, y: H - 4, class: 'chart-axis' }, fd(pts[0].t)));
    svg.appendChild(s('text', { x: W - P.r, y: H - 4, 'text-anchor': 'end', class: 'chart-axis' }, fd(pts[pts.length - 1].t)));
    var first = pts[0].v, last = pts[pts.length - 1].v, d = Math.round((last - first) * 10) / 10;
    return h('div', { class: 'to-chartwrap' }, svg,
      h('div', { class: 'list-sub' }, num(first, 1) + ' → ' + num(last, 1) + ' ' + unit + ' (' + (d > 0 ? '+' : d < 0 ? '−' : '') + num(Math.abs(d), 1) + ')' +
        (target ? L(' · target ', ' · objectif ') + num(target, 1) + ' ' + unit : '')));
  }

  S2.app.registerTab({ id: 'aujourdhui', label: L('Today', 'Aujourd’hui'), title: L('Today', 'Aujourd’hui'), icon: ICON, mount: mount, order: 5 });
})();
