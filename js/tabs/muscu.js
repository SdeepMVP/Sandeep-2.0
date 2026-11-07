/* Onglet Muscu : programme 12 semaines, saisie des séances, progression, historique.
   Données : localStorage "sandeep2:muscu". */
(function () {
  'use strict';
  var S2 = window.S2;
  var L = S2.L;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var NS = 'muscu';
  var SCHEMA = 1;
  var WEEKS = 12;
  var RPE_CUTOFF = 9.5;
  var RPE_VALUES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  var CATS = {
    main:      { label: L('Main lift', 'Mouvement principal'), short: L('Main', 'Principal'),  rpe: [7.5, 8],  inc: L('+2.5 kg', '+2,5 kg') },
    secondary: { label: L('Secondary compound', 'Polyarticulaire secondaire'),  short: L('Secondary', 'Secondaire'), rpe: [8, 8.5],  inc: L('+2.5 kg', '+2,5 kg') },
    isolation: { label: L('Isolation', 'Isolation'),           short: L('Isolation', 'Isolation'),  rpe: [8.5, 9],  inc: L('+1 to 2 kg', '+1 à 2 kg') }
  };

  /* Traduction À L'AFFICHAGE des noms intégrés (jours et exercices du programme par défaut).
     Les données gardent le nom anglais ; un nom saisi ou modifié par l'utilisateur s'affiche tel quel. */
  var FR_DAY = { 'Legs': 'Jambes', 'Push': 'Poussée', 'Pull': 'Tirage', 'Shoulders': 'Épaules' };
  var FR_EX = {
    'Barbell Bench Press': 'Développé couché barre',
    'Incline DB Press': 'Développé incliné haltères',
    'Decline Barbell Press': 'Développé décliné barre',
    'Cable Crossover': 'Écarté poulie vis-à-vis',
    'Close-Grip Bench': 'Développé couché prise serrée',
    'Skull Crusher': 'Barre au front',
    'Rack Pull': 'Rack pull',
    'Barbell Shrug': 'Shrug barre',
    'Pendlay Row': 'Rowing Pendlay',
    'Cable Face Pull': 'Face pull poulie',
    'DB Farmer Carry Shrug': 'Shrug marche du fermier haltères',
    'Overhead Press': 'Développé militaire'
  };
  function trEx(n) { return S2.lang === 'fr' && FR_EX[n] || n; }
  function dayName(d) { return S2.lang === 'fr' && FR_DAY[d.name] || d.name; }

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

  /* ---------- Modèles de programme (v0.28) ----------
     Noms écrits dans la langue de l'app au moment du choix (ce sont ensuite des données de l'utilisateur,
     modifiables comme celles qu'il saisit). x(en, fr, catégorie, séries, rép. min, rép. max). */
  function x(en, fr, cat, sets, a, b) { return { n: L(en, fr), c: cat, s: sets, a: a, b: b }; }
  var TEMPLATES = [
    { id: 'fullbody', name: L('Full body A / B', 'Full body A / B'), sub: L('2 to 3 workouts a week, the whole body each time.', '2 à 3 séances par semaine, tout le corps à chaque fois.'),
      days: [
        [L('Full body A', 'Full body A'), [x('Back Squat', 'Squat', 'main', 4, 6, 8), x('DB Bench Press', 'Développé couché haltères', 'secondary', 3, 8, 10),
          x('One-Arm DB Row', 'Rowing haltère un bras', 'secondary', 3, 8, 12), x('Hip Thrust', 'Hip thrust', 'secondary', 3, 8, 12), x('Lateral Raise', 'Élévations latérales', 'isolation', 3, 12, 15)]],
        [L('Full body B', 'Full body B'), [x('Romanian Deadlift', 'Soulevé de terre jambes tendues', 'main', 4, 6, 8), x('DB Shoulder Press', 'Développé militaire haltères', 'secondary', 3, 8, 10),
          x('Lat Pulldown', 'Tirage vertical', 'secondary', 3, 8, 12), x('Bulgarian Split Squat', 'Fentes bulgares', 'secondary', 3, 8, 12),
          x('Biceps Curl', 'Curl biceps', 'isolation', 3, 10, 15), x('Cable Triceps Extension', 'Extension triceps poulie', 'isolation', 3, 10, 15)]]
      ] },
    { id: 'upperlower', name: L('Upper / Lower', 'Haut / Bas'), sub: L('4 workouts a week: 2 lower body, 2 upper body.', '4 séances par semaine : 2 bas du corps, 2 haut du corps.'),
      days: [
        [L('Lower A', 'Bas A'), [x('Back Squat', 'Squat', 'main', 4, 6, 8), x('Hip Thrust', 'Hip thrust', 'secondary', 3, 8, 12),
          x('Leg Curl', 'Leg curl', 'isolation', 3, 10, 15), x('Standing Calf Raise', 'Mollets debout', 'isolation', 3, 12, 15)]],
        [L('Upper A', 'Haut A'), [x('Barbell Bench Press', 'Développé couché barre', 'main', 4, 6, 8), x('Barbell Row', 'Rowing barre', 'secondary', 3, 8, 10),
          x('DB Shoulder Press', 'Développé militaire haltères', 'secondary', 3, 8, 10), x('Lateral Raise', 'Élévations latérales', 'isolation', 3, 12, 15), x('Biceps Curl', 'Curl biceps', 'isolation', 3, 10, 15)]],
        [L('Lower B', 'Bas B'), [x('Romanian Deadlift', 'Soulevé de terre jambes tendues', 'main', 4, 6, 8), x('Leg Press', 'Presse à cuisses', 'secondary', 3, 10, 12),
          x('Walking Lunge', 'Fentes marchées', 'secondary', 3, 10, 12), x('Leg Extension', 'Leg extension', 'isolation', 3, 12, 15), x('Hip Abduction Machine', 'Abduction machine', 'isolation', 3, 12, 20)]],
        [L('Upper B', 'Haut B'), [x('Lat Pulldown', 'Tirage vertical', 'main', 4, 6, 10), x('Incline DB Press', 'Développé incliné haltères', 'secondary', 3, 8, 10),
          x('Seated Cable Row', 'Rowing poulie basse', 'secondary', 3, 8, 12), x('Cable Face Pull', 'Face pull poulie', 'isolation', 3, 12, 15), x('Cable Triceps Extension', 'Extension triceps poulie', 'isolation', 3, 10, 15)]]
      ] },
    { id: 'glutes', name: L('Glutes & legs focus', 'Fessiers & jambes'), sub: L('3 workouts a week, priority on glutes and legs, one upper body day.', '3 séances par semaine, priorité fessiers et jambes, un jour haut du corps.'),
      days: [
        [L('Glutes', 'Fessiers'), [x('Hip Thrust', 'Hip thrust', 'main', 4, 6, 10), x('Romanian Deadlift', 'Soulevé de terre jambes tendues', 'secondary', 3, 8, 10),
          x('Bulgarian Split Squat', 'Fentes bulgares', 'secondary', 3, 8, 12), x('Hip Abduction Machine', 'Abduction machine', 'isolation', 3, 12, 20), x('Cable Glute Kickback', 'Kickback poulie', 'isolation', 3, 12, 15)]],
        [L('Upper body', 'Haut du corps'), [x('Lat Pulldown', 'Tirage vertical', 'secondary', 3, 8, 12), x('DB Bench Press', 'Développé couché haltères', 'secondary', 3, 8, 10),
          x('Seated Cable Row', 'Rowing poulie basse', 'secondary', 3, 10, 12), x('Lateral Raise', 'Élévations latérales', 'isolation', 3, 12, 15), x('Cable Triceps Extension', 'Extension triceps poulie', 'isolation', 3, 10, 15)]],
        [L('Legs', 'Jambes'), [x('Back Squat', 'Squat', 'main', 4, 6, 8), x('Leg Press', 'Presse à cuisses', 'secondary', 3, 10, 12),
          x('Leg Curl', 'Leg curl', 'isolation', 3, 10, 15), x('Leg Extension', 'Leg extension', 'isolation', 3, 12, 15), x('Standing Calf Raise', 'Mollets debout', 'isolation', 3, 12, 15)]]
      ] },
    { id: 'ppl', name: L('Push / Pull / Legs', 'Poussée / Tirage / Jambes'), sub: L('3 (or 6) workouts a week, one muscle group pattern per day.', '3 (ou 6) séances par semaine, un type de mouvement par jour.'),
      days: [
        [L('Push', 'Poussée'), [x('Barbell Bench Press', 'Développé couché barre', 'main', 4, 6, 8), x('Overhead Press', 'Développé militaire', 'secondary', 3, 8, 10),
          x('Incline DB Press', 'Développé incliné haltères', 'secondary', 3, 8, 10), x('Lateral Raise', 'Élévations latérales', 'isolation', 3, 12, 15), x('Cable Triceps Extension', 'Extension triceps poulie', 'isolation', 3, 10, 15)]],
        [L('Pull', 'Tirage'), [x('Barbell Row', 'Rowing barre', 'main', 4, 6, 8), x('Lat Pulldown', 'Tirage vertical', 'secondary', 3, 8, 12),
          x('Seated Cable Row', 'Rowing poulie basse', 'secondary', 3, 10, 12), x('Cable Face Pull', 'Face pull poulie', 'isolation', 3, 12, 15), x('Biceps Curl', 'Curl biceps', 'isolation', 3, 10, 15)]],
        [L('Legs', 'Jambes'), [x('Back Squat', 'Squat', 'main', 4, 6, 8), x('Romanian Deadlift', 'Soulevé de terre jambes tendues', 'secondary', 3, 8, 10),
          x('Leg Press', 'Presse à cuisses', 'secondary', 3, 10, 12), x('Leg Curl', 'Leg curl', 'isolation', 3, 10, 15), x('Standing Calf Raise', 'Mollets debout', 'isolation', 3, 12, 15)]]
      ] },
    { id: 'sandeep', name: L('Sandeep’s program', 'Programme de Sandeep'), sub: L('Legs / Push / Pull / Shoulders, 12 weeks.', 'Jambes / Poussée / Tirage / Épaules, 12 semaines.'), builtin: true },
    { id: 'home', name: L('Home, dumbbells', 'À la maison (haltères)'), sub: L('2 to 3 workouts a week with a pair of dumbbells and your bodyweight.', '2 à 3 séances par semaine avec une paire d’haltères et le poids du corps.'),
      days: [
        [L('Home A', 'Maison A'), [x('Goblet Squat', 'Goblet squat', 'main', 4, 8, 12), x('Push-up', 'Pompes', 'secondary', 3, 8, 15),
          x('One-Arm DB Row', 'Rowing haltère un bras', 'secondary', 3, 10, 12), x('Glute Bridge', 'Pont fessier', 'secondary', 3, 12, 15), x('Lateral Raise', 'Élévations latérales', 'isolation', 3, 12, 15)]],
        [L('Home B', 'Maison B'), [x('DB Reverse Lunge', 'Fentes arrière haltères', 'main', 4, 8, 12), x('DB Shoulder Press', 'Développé militaire haltères', 'secondary', 3, 8, 12),
          x('DB Romanian Deadlift', 'Soulevé de terre jambes tendues haltères', 'secondary', 3, 10, 12), x('Biceps Curl', 'Curl biceps', 'isolation', 3, 10, 15), x('Chair Dips', 'Dips sur chaise', 'isolation', 3, 8, 15)]]
      ] },
    { id: 'blank', name: L('Blank page', 'Page blanche'), sub: L('One empty day: create your own days and exercises.', 'Un jour vide : crée toi-même tes jours et tes exercices.'),
      days: [[L('Day 1', 'Jour 1'), []]] }
  ];
  function templateDays(t) {
    if (t.builtin) return defaults().days;
    return t.days.map(function (dd) {
      return { id: 'd' + ui.uid(), name: dd[0], slots: dd[1].map(function (e) { return slot(e.n, e.c, e.s, e.a, e.b); }) };
    });
  }
  /* Suggestions pour le nom d'un exercice (liste déroulante du clavier). */
  var LIBRARY = [L('Back Squat', 'Squat'), L('Front Squat', 'Squat avant'), L('Goblet Squat', 'Goblet squat'), L('Hack Squat', 'Hack squat'),
    L('Leg Press', 'Presse à cuisses'), L('Bulgarian Split Squat', 'Fentes bulgares'), L('Walking Lunge', 'Fentes marchées'), L('Reverse Lunge', 'Fentes arrière'),
    L('Step-up', 'Step-up'), L('Romanian Deadlift', 'Soulevé de terre jambes tendues'), L('Deadlift', 'Soulevé de terre'), L('Sumo Deadlift', 'Soulevé de terre sumo'),
    L('Hip Thrust', 'Hip thrust'), L('Glute Bridge', 'Pont fessier'), L('Cable Glute Kickback', 'Kickback poulie'), L('Hip Abduction Machine', 'Abduction machine'),
    L('Hip Adduction Machine', 'Adduction machine'), L('Leg Curl', 'Leg curl'), L('Leg Extension', 'Leg extension'), L('Standing Calf Raise', 'Mollets debout'),
    L('Seated Calf Raise', 'Mollets assis'), L('Barbell Bench Press', 'Développé couché barre'), L('DB Bench Press', 'Développé couché haltères'),
    L('Incline DB Press', 'Développé incliné haltères'), L('Chest Press Machine', 'Développé machine'), L('Push-up', 'Pompes'), L('Cable Crossover', 'Écarté poulie vis-à-vis'),
    L('Pec Deck', 'Pec deck'), L('Overhead Press', 'Développé militaire'), L('DB Shoulder Press', 'Développé militaire haltères'), L('Lateral Raise', 'Élévations latérales'),
    L('Rear Delt Fly', 'Oiseau'), L('Cable Face Pull', 'Face pull poulie'), L('Pull-up', 'Tractions'), L('Assisted Pull-up', 'Tractions assistées'),
    L('Lat Pulldown', 'Tirage vertical'), L('Barbell Row', 'Rowing barre'), L('One-Arm DB Row', 'Rowing haltère un bras'), L('Seated Cable Row', 'Rowing poulie basse'),
    L('Biceps Curl', 'Curl biceps'), L('Hammer Curl', 'Curl marteau'), L('Cable Triceps Extension', 'Extension triceps poulie'), L('Skull Crusher', 'Barre au front'),
    L('Dips', 'Dips'), L('Plank', 'Gainage'), L('Cable Crunch', 'Crunch poulie'), L('Hanging Leg Raise', 'Relevés de jambes suspendu')];

  /* store = toutes les données de l'onglet ; data = celles de la personne affichée (store lui-même, ou store.partner).
     v0.33 (ajouts compatibles) : schedule = { 0..6 (dimanche = 0) : id du jour du programme }, goals = { perWeek, lifts: [{ id, name, target }] },
     partner = { days, sessions, activeId, schedule, goals } pour la 2e personne (onglet Objectif › Cuisiner à 2). */
  var store = null, data = null, person = 'me';
  function normPerson(d) {
    d.days = Array.isArray(d.days) ? d.days : [];
    d.sessions = d.sessions || [];
    d.activeId = d.activeId || null;
    d.schedule = d.schedule || {};
    d.goals = d.goals || {};
    d.goals.lifts = Array.isArray(d.goals.lifts) ? d.goals.lifts : [];
    if (d.goals.perWeek === undefined) d.goals.perWeek = null;
    return d;
  }
  function loadData() {
    var d = S2.storage.load(NS, null);
    if (!d || !Array.isArray(d.days)) {
      d = defaults();
      S2.storage.save(NS, d);
    }
    normPerson(d);
    if (d.partner !== undefined) { delete d.partner; S2.storage.save(NS, d); } /* v0.36 : app personnelle, plus de 2e personne */
    /* Futures migrations : if (d.schema < 2) { ... } */
    d.schema = SCHEMA;
    return d;
  }
  function personData(st, who) {
    if (who !== 'partner') return st;
    if (!st.partner) st.partner = normPerson({ days: [], sessions: [], activeId: null, schedule: {}, goals: {} });
    return st.partner;
  }
  /* Suivi personnel : chaque téléphone suit sa propre musculation (demande du 7 novembre 2026). Les données d'une 2e personne
     éventuellement saisies en v0.33 (store.partner) restent dans la sauvegarde mais ne sont plus affichées. */
  function hasPartner() { return false; }
  function personName(who) {
    try {
      if (who === 'partner') return S2.objectif.partnerName();
      return S2.objectif && S2.objectif.myName ? S2.objectif.myName() : L('Me', 'Moi');
    } catch (e) { return who === 'partner' ? L('Other person', 'L’autre') : L('Me', 'Moi'); }
  }
  function persist() { S2.storage.save(NS, store); }

  function day(id) { return data.days.filter(function (d) { return d.id === id; })[0]; }
  /* Nom du jour d'une séance, même si ce jour a été retiré du programme depuis (nom gardé dans la séance). */
  function sessionDay(s) {
    var d = day(s.dayId);
    if (d) return dayName(d);
    return s.dayName ? (S2.lang === 'fr' && FR_DAY[s.dayName] || s.dayName) : L('Deleted day', 'Jour supprimé');
  }
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
    if (f) return trEx(f.option.name);
    var hist = finished().reverse();
    for (var i = 0; i < hist.length; i++) {
      var e = hist[i].entries[exId];
      if (e && e.snap) return trEx(e.snap.name);
    }
    return L('Deleted exercise', 'Exercice supprimé');
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
    var wTxt = topW ? num(topW) + ' kg' : L('the same weight', 'le même poids');
    var keepTxt = L('Keep ', 'Garde ') + wTxt;
    if (sets.some(function (s) { return s.r === null || s.w === null; })) {
      return { type: 'info', text: L('Fill in weight and reps to get a suggestion.', 'Saisis le poids et les répétitions pour avoir une suggestion.') };
    }
    if (sets.some(function (s) { return s.rpe === null; })) {
      return { type: 'info', text: L('Enter the RPE for every set to get a suggestion.', 'Saisis le RPE de chaque série pour avoir une suggestion.') };
    }
    if (sets.length < snap.sets) {
      var pl = sets.length > 1 ? 's' : '';
      return { type: 'keep', text: keepTxt,
        detail: L(sets.length + ' of ' + snap.sets + ' set(s) done.',
          sets.length + ' série' + pl + ' faite' + pl + ' sur ' + snap.sets + '.') };
    }
    var high = sets.some(function (s) { return s.rpe >= RPE_CUTOFF; });
    var allTop = sets.every(function (s) { return s.r >= snap.repMax; });
    if (allTop && !high) {
      return { type: 'up', text: L('Increase the weight (', 'Augmente la charge (') + cat.inc + ')',
        detail: L('All sets at ' + snap.repMax + ' reps with RPE below 9.5.',
          'Toutes les séries à ' + snap.repMax + ' répétitions avec un RPE sous 9,5.') };
    }
    if (high) {
      return { type: 'keep', text: keepTxt,
        detail: L('RPE 9.5+ on at least one set: consolidate before going up.',
          'RPE 9,5+ sur au moins une série : consolide avant de monter.') };
    }
    return { type: 'keep', text: keepTxt,
      detail: L('Aim for ' + snap.repMax + ' reps on every set.', 'Vise ' + snap.repMax + ' répétitions sur chaque série.') };
  }

  function rpeRange(cat) {
    var c = CATS[cat] || CATS.secondary;
    return num(c.rpe[0]) + '–' + num(c.rpe[1]);
  }
  function setsSummary(sets) {
    return sets.map(function (s) {
      return (s.w === null ? '?' : num(s.w)) + '×' + (s.r === null ? '?' : s.r) + (s.rpe !== null && s.rpe !== undefined ? ' @' + num(s.rpe) : '');
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
    store = loadData();
    if (person === 'partner' && !hasPartner()) person = 'me';
    data = personData(store, person);
    root = container;
    if (pickDay && !day(pickDay)) pickDay = null;
    render();
  }
  function switchPerson(who) {
    person = who; data = personData(store, who);
    pickDay = null; pickWeek = null; programDay = null; historyEx = null;
    render(); window.scrollTo(0, 0);
  }

  function go(v, opts) {
    view = v;
    if (opts && opts.ex !== undefined) historyEx = opts.ex;
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    root.innerHTML = '';
    if (hasPartner()) {
      root.appendChild(h('div', { class: 'segmented small mu-people' },
        [['me', personName('me')], ['partner', personName('partner')]].map(function (x) {
          return h('button', { class: 'seg' + (person === x[0] ? ' is-active' : ''), 'aria-pressed': person === x[0] ? 'true' : 'false',
            onclick: function () { if (person !== x[0]) switchPerson(x[0]); } }, x[1]);
        })));
    }
    var tabs = [['session', active() ? L('Workout in progress', 'Séance en cours') : L('Workout', 'Séance')],
      ['history', L('History', 'Historique')], ['program', L('Program', 'Programme')]];
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
    /* Séance prévue aujourd'hui (jours d'entraînement) : présélectionnée, modifiable. */
    var todayId = data.schedule[new Date().getDay()];
    if (pickDay === null && todayId && day(todayId)) pickDay = todayId;
    body.appendChild(goalsCard());

    if (!done.length && !Object.keys(data.schedule).length) {
      body.appendChild(h('div', { class: 'card mu-firstrun' },
        h('div', { class: 'card-title' }, L('Is this your program?', 'C’est bien ton programme ?')),
        h('p', { class: 'sheet-text' }, L('Pick a ready-made program (full body, upper / lower, glutes & legs…) or create your own days, then adjust the exercises.',
          'Choisis un programme tout prêt (full body, haut / bas, fessiers & jambes…) ou crée tes propres jours, puis ajuste les exercices.')),
        h('div', { class: 'stack' },
          h('button', { class: 'btn btn-secondary btn-block', onclick: pickTemplate }, L('Choose a program', 'Choisir un programme')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { go('program'); } }, L('Edit my days and exercises', 'Modifier mes jours et exercices')))));
    }
    body.appendChild(h('h2', { class: 'section-title' }, L('New workout', 'Nouvelle séance')));

    var grid = h('div', { class: 'mu-daygrid' });
    data.days.forEach(function (d) {
      var lastOfDay = done.filter(function (s) { return s.dayId === d.id; }).pop();
      grid.appendChild(h('button', {
        class: 'mu-daybtn' + (pickDay === d.id ? ' is-active' : ''),
        'aria-pressed': pickDay === d.id ? 'true' : 'false',
        onclick: function () { pickDay = d.id; render(); }
      },
        h('span', { class: 'mu-dayname' }, dayName(d), todayId === d.id ? h('span', { class: 'mu-todaytag' }, L('today', 'aujourd’hui')) : null),
        h('span', { class: 'mu-daymeta' }, L(d.slots.length + ' exercise' + (d.slots.length === 1 ? '' : 's'),
          d.slots.length + ' exercice' + (d.slots.length > 1 ? 's' : ''))),
        h('span', { class: 'mu-daymeta' }, lastOfDay
          ? L('Last: ', 'Dernière : ') + ui.date(lastOfDay.startedAt) + ' (' + L('W', 'S') + lastOfDay.week + ')'
          : L('Never done', 'Jamais faite'))));
    });
    body.appendChild(grid);

    body.appendChild(h('div', { class: 'card mu-weekcard' },
      h('div', { class: 'field-label' }, L('Program week', 'Semaine du programme')),
      h('div', { class: 'stepper' },
        h('button', { class: 'btn btn-step', 'aria-label': L('Previous week', 'Semaine précédente'), disabled: pickWeek <= 1,
          onclick: function () { pickWeek = Math.max(1, pickWeek - 1); render(); } }, '−'),
        h('div', { class: 'stepper-value' }, h('span', { class: 'stepper-num' }, pickWeek), h('span', { class: 'muted' }, ' / ' + WEEKS)),
        h('button', { class: 'btn btn-step', 'aria-label': L('Next week', 'Semaine suivante'), disabled: pickWeek >= WEEKS,
          onclick: function () { pickWeek = Math.min(WEEKS, pickWeek + 1); render(); } }, '+')),
      h('p', { class: 'hint' }, pickWeek === 1
        ? L('Week 1 = baseline: no targets or suggestions.', 'Semaine 1 = référence : ni objectifs ni suggestions.')
        : (last ? L('Last saved workout: week ', 'Dernière séance enregistrée : semaine ') + last.week + '.' : ''))));

    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', disabled: !pickDay, onclick: startSession },
        pickDay ? L('Start ', 'Démarrer ') + dayName(day(pickDay)) + ' · ' + L('W', 'S') + pickWeek : L('Pick a day', 'Choisis un jour'))));

    if (done.length) {
      body.appendChild(h('h2', { class: 'section-title' }, L('Recent workouts', 'Séances récentes')));
      body.appendChild(h('div', { class: 'list' }, done.slice(-4).reverse().map(sessionRow)));
    }
  }

  function sessionRow(s) {
    var d = day(s.dayId);
    var nSets = Object.keys(s.entries).reduce(function (n, k) { return n + s.entries[k].sets.length; }, 0);
    return h('div', { class: 'list-row' },
      h('div', null,
        h('div', { class: 'list-title' }, sessionDay(s) + L(' · Week ', ' · Semaine ') + s.week),
        h('div', { class: 'list-sub' }, ui.longDate(s.startedAt) + ' · ' + nSets + L(' sets', nSets > 1 ? ' séries' : ' série'))));
  }

  function startSession() {
    var d = day(pickDay);
    var s = { id: ui.uid(), dayId: d.id, dayName: d.name, week: pickWeek, startedAt: new Date().toISOString(),
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
        h('div', { class: 'mu-sessiontitle' }, sessionDay(s) + L(' · Week ', ' · Semaine ') + s.week),
        h('div', { class: 'list-sub' }, L('Started ', 'Commencée le ') + ui.longDate(s.startedAt) + L(' at ', ' à ') +
          new Date(s.startedAt).toLocaleTimeString(S2.locale, { hour: '2-digit', minute: '2-digit' }))),
      h('div', { class: 'autosave', id: 'mu-autosave' }, L('Auto-save on', 'Sauvegarde auto'))));

    if (s.week === 1) {
      body.appendChild(h('p', { class: 'note' }, L('Week 1: baseline workout. Just log what you do, no targets.', 'Semaine 1 : séance de référence. Note juste ce que tu fais, sans objectif.')));
    }
    body.appendChild(h('p', { class: 'hint' }, L('Grey values = last time. Tap ✓ to reuse them, or type only what changes.', 'Valeurs grises = la dernière fois. Touche ✓ pour les reprendre, ou saisis seulement ce qui change.')));

    if (!d || !d.slots.length) {
      body.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('No exercises for this day.', 'Aucun exercice pour ce jour.')),
        h('button', { class: 'btn btn-secondary', onclick: function () { programDay = s.dayId; go('program'); } }, L('Add exercises', 'Ajouter des exercices'))));
    } else {
      d.slots.forEach(function (sl) { body.appendChild(exerciseCard(s, sl)); });
    }

    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: finishSession }, L('Finish workout', 'Terminer la séance')),
      h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: abandonSession }, L('Discard workout', 'Abandonner la séance'))));
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
      h('h3', { class: 'mu-exname' }, trEx(option.name)),
      h('button', { class: 'btn btn-icon', 'aria-label': L('History of ', 'Historique : ') + trEx(option.name),
        onclick: function () { historyEx = option.id; go('history'); } , html: chartIcon() })));

    if (sl.options.length > 1) {
      card.appendChild(h('div', { class: 'segmented small' }, sl.options.map(function (o) {
        return h('button', { class: 'seg' + (o.id === option.id ? ' is-active' : ''),
          onclick: function () { s.choices[sl.id] = o.id; persist(); replaceCard(card, s, sl); } }, trEx(o.name));
      })));
    }

    card.appendChild(h('div', { class: 'mu-meta' },
      h('span', { class: 'badge badge-' + sl.category }, cat.short),
      h('span', null, sl.sets + ' × ' + sl.repMin + '–' + sl.repMax + L(' reps', ' rép.')),
      baseline ? h('span', { class: 'muted' }, L('Baseline', 'Référence')) : h('span', null, L('Target RPE ', 'RPE cible ') + rpeRange(sl.category))));

    if (prev) {
      card.appendChild(h('div', { class: 'mu-last' },
        h('span', { class: 'muted' }, L('Last time (', 'La dernière fois (') + ui.date(prev.session.startedAt) + ', ' + L('W', 'S') + prev.session.week + L('): ', ') : ')),
        setsSummary(prevEntry.sets)));
      if (!baseline && prev.session.week !== 1) {
        var ps = progression(prevEntry.sets, prevEntry.snap || snapOf(sl, option));
        if (ps && ps.type !== 'info') {
          card.appendChild(h('div', { class: 'mu-prevsugg is-' + ps.type },
            h('strong', null, L('Suggestion for today: ', 'Suggestion du jour : ')), ps.text));
        }
      }
    } else {
      card.appendChild(h('div', { class: 'mu-last muted' }, L('First time on this exercise.', 'Première fois sur cet exercice.')));
    }

    var table = h('div', { class: 'mu-sets' },
      h('div', { class: 'mu-setrow mu-sethead' },
        h('span', null, L('Set', 'Série')), h('span', null, 'kg'), h('span', null, L('Reps', 'Rép.')), h('span', null, 'RPE'),
        h('span', { class: 'sr-only' }, L('Confirm', 'Valider'))));
    for (var i = 0; i < nSets; i++) table.appendChild(setRow(s, sl, option, i, prevSet(prevEntry, i), card));
    card.appendChild(table);

    var extra = entry ? entry.sets.length - sl.sets : 0;
    card.appendChild(h('div', { class: 'mu-setbtns' },
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
        var e = entryFor(s, sl, option);
        while (e.sets.length < nSets) e.sets.push(emptySet());
        e.sets.push(emptySet());
        persist(); replaceCard(card, s, sl);
      } }, L('+ Set', '+ Série')),
      extra > 0 ? h('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
        var e = entryFor(s, sl, option);
        e.sets.pop(); persist(); replaceCard(card, s, sl);
      } }, L('− Set', '− Série')) : null));

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
      'aria-label': L('Set ' + (i + 1) + ' weight in kg', 'Série ' + (i + 1) + ', poids en kg'),
      placeholder: prev && prev.w !== null ? num(prev.w) : 'kg', value: cur.w !== null ? num(cur.w) : '' });
    w.addEventListener('input', function () { getSet(s, sl, option, i).w = ui.parseNum(w.value); changed(); });

    var r = h('input', { class: 'input mu-in', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off',
      'aria-label': L('Set ' + (i + 1) + ' reps', 'Série ' + (i + 1) + ', répétitions'),
      placeholder: prev && prev.r !== null ? String(prev.r) : L('reps', 'rép.'), value: cur.r !== null ? String(cur.r) : '' });
    r.addEventListener('input', function () {
      var n = ui.parseNum(r.value);
      getSet(s, sl, option, i).r = n === null ? null : Math.round(n);
      changed();
    });

    var sel = h('select', { class: 'input mu-in mu-rpe' + (cur.rpe === null ? ' is-placeholder' : ''),
      'aria-label': L('Set ' + (i + 1) + ' RPE', 'Série ' + (i + 1) + ', RPE') },
      h('option', { value: '' }, prev && prev.rpe !== null && prev.rpe !== undefined ? num(prev.rpe) : '—'),
      RPE_VALUES.map(function (v) { return h('option', { value: String(v) }, num(v)); }));
    sel.value = cur.rpe === null ? '' : String(cur.rpe);
    sel.addEventListener('change', function () {
      getSet(s, sl, option, i).rpe = sel.value === '' ? null : Number(sel.value);
      sel.classList.toggle('is-placeholder', sel.value === '');
      changed();
    });

    var check = h('button', { class: 'btn btn-check' + (cur.done ? ' is-on' : ''),
      'aria-label': (cur.done ? L('Unconfirm set ', 'Annuler la série ') : L('Confirm set ', 'Valider la série ')) + (i + 1),
      'aria-pressed': cur.done ? 'true' : 'false',
      onclick: function () {
        var set = getSet(s, sl, option, i);
        if (!set.done) {
          var eff = effective(set, prev);
          set.w = eff.w; set.r = eff.r; set.rpe = eff.rpe;
          set.done = true;
          startRest(sl.category);
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
    box.appendChild(h('div', null, h('strong', null, L('Next workout: ', 'Prochaine séance : ')), p.text));
    if (p.detail) box.appendChild(h('div', { class: 'mu-suggdetail' }, p.detail));
  }

  var savedTimer;
  function flashSaved() {
    var el = document.getElementById('mu-autosave');
    if (!el) return;
    el.textContent = L('Saved ✓', 'Enregistré ✓');
    el.classList.add('is-saved');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { el.classList.remove('is-saved'); el.textContent = L('Auto-save on', 'Sauvegarde auto'); }, 1500);
  }

  function finishSession() {
    var s = active();
    var d = day(s.dayId);
    var count = 0;
    Object.keys(s.entries).forEach(function (k) {
      count += s.entries[k].sets.filter(isLogged).length;
    });
    ui.confirm({
      title: L('Finish the workout?', 'Terminer la séance ?'),
      message: count
        ? L(count + ' set(s) will be saved. Untouched sets are skipped; fields left grey take last time’s value.',
          count + (count > 1 ? ' séries seront enregistrées' : ' série sera enregistrée') +
          '. Les séries non touchées sont ignorées ; les champs restés gris prennent la valeur de la dernière fois.')
        : L('No sets logged: the workout will be saved empty.', 'Aucune série saisie : la séance sera enregistrée vide.'),
      okLabel: L('Finish and save', 'Terminer et enregistrer')
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
      ui.toast(L('Workout saved', 'Séance enregistrée'));
      pickWeek = s.week;
      render();
      window.scrollTo(0, 0);
    });
  }

  function abandonSession() {
    ui.confirm({ title: L('Discard the workout?', 'Abandonner la séance ?'),
      message: L('All sets logged in this workout will be deleted.', 'Toutes les séries saisies dans cette séance seront supprimées.'),
      okLabel: L('Delete workout', 'Supprimer la séance'), danger: true }).then(function (ok) {
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
        onclick: function () { historyMode = 'exercises'; render(); } }, L('By exercise', 'Par exercice')),
      h('button', { class: 'seg' + (historyMode === 'sessions' ? ' is-active' : ''),
        onclick: function () { historyMode = 'sessions'; render(); } }, L('Workouts', 'Séances'))));

    if (historyMode === 'sessions') return renderSessionsList(body);

    var seen = {};
    data.days.forEach(function (d) {
      var rows = [];
      d.slots.forEach(function (sl) {
        sl.options.forEach(function (o) { seen[o.id] = true; rows.push(exerciseRow(o.id, trEx(o.name))); });
      });
      if (!rows.length) return;
      body.appendChild(h('h2', { class: 'section-title' }, dayName(d)));
      body.appendChild(h('div', { class: 'list' }, rows));
    });
    var orphans = {};
    finished().forEach(function (s) {
      Object.keys(s.entries).forEach(function (id) { if (!seen[id]) orphans[id] = true; });
    });
    var ids = Object.keys(orphans);
    if (ids.length) {
      body.appendChild(h('h2', { class: 'section-title' }, L('Exercises removed from the program', 'Exercices retirés du programme')));
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
          ? L(hist.length + ' workout' + (hist.length === 1 ? '' : 's') + ' · Est. 1RM ',
              hist.length + ' séance' + (hist.length > 1 ? 's' : '') + ' · 1RM est. ') + num(last.best ? last.best.value : 0, 1) + ' kg'
          : L('No data yet', 'Pas encore de données'))),
      h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
  }

  function renderExerciseHistory(body, exId) {
    var name = exName(exId);
    var hist = historyFor(exId);
    body.appendChild(h('button', { class: 'btn btn-ghost btn-sm back', onclick: function () { historyEx = null; render(); } }, L('‹ Back', '‹ Retour')));
    body.appendChild(h('h2', { class: 'page-title' }, name));

    if (!hist.length) {
      body.appendChild(h('p', { class: 'muted' }, L('No workouts saved for this exercise.', 'Aucune séance enregistrée pour cet exercice.')));
      return;
    }
    var pts = hist.filter(function (x) { return x.best; }).map(function (x) {
      return { t: new Date(x.session.startedAt).getTime(), v: x.best.value, label: ui.date(x.session.startedAt), week: x.session.week };
    });
    var best = Math.max.apply(null, pts.map(function (p) { return p.v; }).concat([0]));
    var last = pts[pts.length - 1];

    body.appendChild(h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, L('Est. 1RM (latest)', '1RM est. (dernier)')), h('div', { class: 'stat-value' }, last ? num(last.v, 1) + ' kg' : '—')),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, L('All-time best', 'Record')), h('div', { class: 'stat-value' }, best ? num(best, 1) + ' kg' : '—'))));

    body.appendChild(h('div', { class: 'card' },
      h('div', { class: 'card-title' }, L('Estimated 1RM over time', 'Évolution du 1RM estimé')),
      lineChart(pts),
      h('p', { class: 'hint' }, L('Epley formula on the best set: weight × (1 + reps / 30).', 'Formule d’Epley sur la meilleure série : poids × (1 + rép. / 30).'))));

    body.appendChild(h('h2', { class: 'section-title' }, L('Workouts', 'Séances')));
    hist.slice().reverse().forEach(function (x) {
      body.appendChild(h('div', { class: 'card mu-histcard' },
        h('div', { class: 'mu-histhead' },
          h('span', { class: 'list-title' }, ui.longDate(x.session.startedAt)),
          h('span', { class: 'muted' }, L('W', 'S') + x.session.week)),
        h('ol', { class: 'mu-histsets' }, x.entry.sets.map(function (st, i) {
          var isBest = x.best && x.best.index === i;
          return h('li', { class: isBest ? 'is-best' : '' },
            h('span', null, (st.w === null ? '?' : num(st.w)) + ' kg × ' + (st.r === null ? '?' : st.r) + (st.rpe !== null && st.rpe !== undefined ? ' @ RPE ' + num(st.rpe) : '')),
            isBest ? h('span', { class: 'mu-e1rm' }, '1RM ≈ ' + num(x.best.value, 1)) : null);
        }))));
    });
  }

  /* Graphique en ligne simple (SVG), une série, info-bulle au toucher. */
  function lineChart(pts) {
    var W = 340, H = 190, ML = 44, R = 14, T = 16, B = 28;
    var wrap = h('div', { class: 'chart' });
    if (pts.length === 0) { wrap.appendChild(h('p', { class: 'muted' }, L('No data.', 'Aucune donnée.'))); return wrap; }
    var vs = pts.map(function (p) { return p.v; });
    var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    var pad = Math.max((max - min) * 0.15, 2.5);
    min = Math.max(0, min - pad); max = max + pad;
    var t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    function x(p, i) {
      if (pts.length === 1) return ML + (W - ML - R) / 2;
      return t1 === t0 ? ML + i * (W - ML - R) / (pts.length - 1) : ML + (p.t - t0) / (t1 - t0) * (W - ML - R);
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
      'aria-label': L('Estimated 1RM: from ', '1RM estimé : de ') + num(pts[0].v, 1) + L(' to ', ' à ') + num(pts[pts.length - 1].v, 1) + ' kg' });
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * g / 3;
      svg.appendChild(s('line', { x1: ML, x2: W - R, y1: y(gv), y2: y(gv), class: 'chart-grid' }));
      svg.appendChild(s('text', { x: ML - 6, y: y(gv) + 4, 'text-anchor': 'end', class: 'chart-axis' }, num(gv, 0)));
    }
    svg.appendChild(s('text', { x: ML, y: H - 8, 'text-anchor': 'start', class: 'chart-axis' }, pts[0].label));
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
      tip.textContent = p.label + ' · ' + L('W', 'S') + p.week + ' · ' + num(p.v, 1) + ' kg';
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
    if (!list.length) { body.appendChild(h('p', { class: 'muted' }, L('No finished workouts yet.', 'Aucune séance terminée pour l’instant.'))); return; }
    list.forEach(function (s) {
      var d = day(s.dayId);
      var card = h('details', { class: 'card mu-sesscard' },
        h('summary', null,
          h('span', { class: 'list-title' }, sessionDay(s) + ' · ' + L('W', 'S') + s.week),
          h('span', { class: 'list-sub' }, ui.longDate(s.startedAt))));
      Object.keys(s.entries).forEach(function (exId) {
        var e = s.entries[exId];
        card.appendChild(h('div', { class: 'mu-sessex' },
          h('div', { class: 'mu-sessexname' }, (e.snap && e.snap.name) ? trEx(e.snap.name) : exName(exId)),
          h('div', { class: 'list-sub' }, setsSummary(e.sets))));
      });
      if (!Object.keys(s.entries).length) card.appendChild(h('p', { class: 'muted' }, L('Empty workout.', 'Séance vide.')));
      card.appendChild(h('button', { class: 'btn btn-ghost btn-sm danger-text', onclick: function () {
        ui.confirm({ title: L('Delete this workout?', 'Supprimer cette séance ?'),
          message: L('It will be removed from your history. This cannot be undone.', 'Elle sera retirée de ton historique. C’est définitif.'),
          okLabel: L('Delete', 'Supprimer'), danger: true }).then(function (ok) {
          if (!ok) return;
          data.sessions = data.sessions.filter(function (x) { return x.id !== s.id; });
          persist(); render();
        });
      } }, L('Delete workout', 'Supprimer la séance')));
      body.appendChild(card);
    });
  }

  /* ---------- Programme (édition) ---------- */

  function renderProgram(body) {
    if (!data.days.length) {
      body.appendChild(h('div', { class: 'empty-state small' },
        h('p', null, L('Your program has no days yet.', 'Ton programme n’a encore aucun jour.')),
        h('button', { class: 'btn btn-primary', onclick: function () { editDay(null); } }, L('+ Add a day', '+ Ajouter un jour')),
        h('button', { class: 'btn btn-secondary', onclick: pickTemplate }, L('Choose a ready-made program', 'Choisir un programme tout prêt'))));
      return;
    }
    var d = day(programDay) || data.days[0];
    programDay = d.id;
    body.appendChild(h('div', { class: 'mu-daytabs' },
      h('div', { class: 'segmented small' }, data.days.map(function (dd) {
        return h('button', { class: 'seg' + (d.id === dd.id ? ' is-active' : ''),
          onclick: function () { programDay = dd.id; render(); } }, dayName(dd));
      })),
      h('button', { class: 'btn btn-secondary mu-adddaybtn', 'aria-label': L('Add a day', 'Ajouter un jour'), onclick: function () { editDay(null); } }, '+')));
    body.appendChild(h('div', { class: 'mu-dayhead' },
      h('h2', { class: 'mu-dayheadname' }, dayName(d)),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editDay(d); } }, L('✎ Day', '✎ Jour'))));
    if (active() && active().dayId === d.id) {
      body.appendChild(h('p', { class: 'note' }, L('Workout in progress on this day: changes apply right away.', 'Séance en cours sur ce jour : les changements s’appliquent tout de suite.')));
    }
    if (!d.slots.length) {
      body.appendChild(h('div', { class: 'empty-state small' }, h('p', null, L('No exercises for ', 'Aucun exercice pour ') + dayName(d) + '.')));
    }
    var list = h('div', { class: 'list' });
    d.slots.forEach(function (sl, i) {
      var cat = CATS[sl.category] || CATS.secondary;
      list.appendChild(h('div', { class: 'list-row mu-progrow' },
        h('div', { class: 'mu-progmain' },
          h('div', { class: 'list-title' }, sl.options.map(function (o) { return trEx(o.name); }).join(L(' OR ', ' OU '))),
          h('div', { class: 'list-sub' },
            h('span', { class: 'badge badge-' + sl.category }, cat.short), ' ',
            sl.sets + ' × ' + sl.repMin + '–' + sl.repMax + ' · RPE ' + rpeRange(sl.category))),
        h('div', { class: 'mu-progbtns' },
          h('button', { class: 'btn btn-icon', 'aria-label': L('Move up', 'Monter'), disabled: i === 0, onclick: function () { move(d, i, -1); } }, '↑'),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Move down', 'Descendre'), disabled: i === d.slots.length - 1, onclick: function () { move(d, i, 1); } }, '↓'),
          h('button', { class: 'btn btn-icon', 'aria-label': L('Edit', 'Modifier'), onclick: function () { editSlot(d, sl); } }, '✎'))));
    });
    body.appendChild(list);
    body.appendChild(h('div', { class: 'bottom-actions' },
      h('button', { class: 'btn btn-secondary btn-block btn-lg', onclick: function () { editSlot(d, null); } }, L('+ Add an exercise', '+ Ajouter un exercice'))));
    body.appendChild(h('p', { class: 'hint' }, L('Target RPE by category: main 7.5–8 · secondary 8–8.5 · isolation 8.5–9. An exercise with several variants lets you pick one each workout.',
      'RPE cible par catégorie : principal 7,5–8 · secondaire 8–8,5 · isolation 8,5–9. Un exercice à plusieurs variantes te laisse en choisir une à chaque séance.')));
    body.appendChild(h('h2', { class: 'section-title' }, L('My training days', 'Mes jours d’entraînement')));
    body.appendChild(scheduleCard());
    body.appendChild(h('h2', { class: 'section-title' }, L('Whole program', 'Programme entier')));
    body.appendChild(h('div', { class: 'stack' },
      h('button', { class: 'btn btn-secondary btn-block', onclick: pickTemplate }, L('Change program (ready-made)', 'Changer de programme (modèles)'))));
  }

  /* ---------- Jours du programme ---------- */
  function editDay(d) {
    var isNew = !d;
    var idx = isNew ? -1 : data.days.indexOf(d);
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var inp = h('input', { class: 'input', type: 'text', value: isNew ? '' : dayName(d), autocapitalize: 'sentences', autocomplete: 'off',
        placeholder: L('e.g. Glutes, Upper body, Full body A', 'ex. Fessiers, Haut du corps, Full body A'), 'aria-label': L('Day name', 'Nom du jour') });
      function save() {
        var name = inp.value.trim();
        if (!name) { err.textContent = L('Give the day a name.', 'Donne un nom au jour.'); err.hidden = false; return; }
        if (isNew) {
          var nd = { id: 'd' + ui.uid(), name: name, slots: [] };
          data.days.push(nd); programDay = nd.id;
        } else if (name !== dayName(d)) d.name = name;
        persist(); close(); view = 'program'; render();
        ui.toast(isNew ? L('Day added: now add its exercises', 'Jour ajouté : ajoute maintenant ses exercices') : L('Day renamed', 'Jour renommé'));
      }
      function moveDay(dir) {
        var j = idx + dir;
        if (j < 0 || j >= data.days.length) return;
        var t = data.days[idx]; data.days[idx] = data.days[j]; data.days[j] = t;
        persist(); close(); render();
      }
      function remove() {
        if (active() && active().dayId === d.id) { ui.toast(L('Finish or discard the workout in progress first', 'Termine ou abandonne d’abord la séance en cours')); return; }
        ui.confirm({ title: L('Delete this day?', 'Supprimer ce jour ?'),
          message: L('“' + dayName(d) + '” and its ' + d.slots.length + ' exercise(s) will be removed from the program. Workouts already done stay in the history.',
            '« ' + dayName(d) + ' » et ses ' + d.slots.length + ' exercice(s) seront retirés du programme. Les séances déjà faites restent dans l’historique.'),
          okLabel: L('Delete the day', 'Supprimer le jour'), danger: true }).then(function (ok) {
          if (!ok) return;
          data.days.splice(data.days.indexOf(d), 1);
          if (pickDay === d.id) pickDay = null;
          programDay = data.days[0] ? data.days[0].id : null;
          persist(); close(); render();
        });
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      if (isNew) setTimeout(function () { inp.focus(); }, 250);
      return [
        h('h2', { class: 'sheet-title' }, isNew ? L('New day', 'Nouveau jour') : L('Edit the day', 'Modifier le jour')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Name', 'Nom')), inp),
        isNew ? null : h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Order in the program', 'Place dans le programme')),
          h('div', { class: 'mu-moveday' },
            h('button', { class: 'btn btn-secondary', type: 'button', disabled: idx <= 0, onclick: function () { moveDay(-1); } }, L('‹ Earlier', '‹ Avant')),
            h('span', { class: 'muted' }, (idx + 1) + ' / ' + data.days.length),
            h('button', { class: 'btn btn-secondary', type: 'button', disabled: idx >= data.days.length - 1, onclick: function () { moveDay(1); } }, L('Later ›', 'Après ›')))),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, isNew ? L('Add the day', 'Ajouter le jour') : L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: remove }, L('Delete this day', 'Supprimer ce jour')))
      ];
    }, { modal: true });
  }

  /* ---------- Modèles : remplace les jours du programme (l'historique est gardé) ---------- */
  function pickTemplate() {
    ui.sheet(function (close) {
      return [
        h('h2', { class: 'sheet-title' }, L('Choose a program', 'Choisir un programme')),
        h('p', { class: 'sheet-text' }, L('It replaces your current days and exercises. Your workout history is kept. You can then change everything.',
          'Il remplace tes jours et exercices actuels. L’historique de tes séances est gardé. Tu pourras ensuite tout modifier.')),
        h('div', { class: 'mu-templates' }, TEMPLATES.map(function (t) {
          var days = templateDays(t);
          return h('button', { class: 'mu-template', type: 'button', onclick: function () { close(); applyTemplate(t); } },
            h('span', { class: 'list-title' }, t.name),
            h('span', { class: 'list-sub' }, t.sub),
            h('span', { class: 'mu-templatedays' }, days.map(function (dd) { return dayName(dd) + (dd.slots.length ? ' (' + dd.slots.length + ')' : ''); }).join(' · ')));
        })),
        h('div', { class: 'sheet-actions' }, h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    });
  }
  function applyTemplate(t) {
    if (active()) { ui.toast(L('Finish or discard the workout in progress first', 'Termine ou abandonne d’abord la séance en cours')); return; }
    ui.confirm({ title: L('Use “' + t.name + '”?', 'Utiliser « ' + t.name + ' » ?'),
      message: L('Your current days and exercises will be replaced. Workouts already done stay in the history.',
        'Tes jours et exercices actuels seront remplacés. Les séances déjà faites restent dans l’historique.'),
      okLabel: L('Use this program', 'Utiliser ce programme') }).then(function (ok) {
      if (!ok) return;
      data.days = templateDays(t);
      programDay = data.days[0].id; pickDay = null;
      persist(); view = 'program'; render(); window.scrollTo(0, 0);
      ui.toast(L('Program ready: adjust it as you like', 'Programme prêt : ajuste-le comme tu veux'));
    });
  }

  function move(d, i, dir) {
    var j = i + dir;
    if (j < 0 || j >= d.slots.length) return;
    var t = d.slots[i]; d.slots[i] = d.slots[j]; d.slots[j] = t;
    persist(); render();
  }

  /* Noms proposés : la bibliothèque + les exercices déjà dans le programme. */
  function libraryNames() {
    var seen = {}, out = [];
    LIBRARY.concat([].concat.apply([], data.days.map(function (dd) {
      return [].concat.apply([], dd.slots.map(function (sl) { return sl.options.map(function (o) { return trEx(o.name); }); }));
    }))).forEach(function (n) { var k = n.toLowerCase(); if (!seen[k]) { seen[k] = true; out.push(n); } });
    return out.sort(function (a, b) { return a.localeCompare(b, S2.lang); });
  }

  function editSlot(d, sl) {
    var isNew = !sl;
    var draft = sl ? JSON.parse(JSON.stringify(sl)) : { id: ui.uid(), category: 'secondary', sets: 3, repMin: 8, repMax: 12, options: [{ id: ui.uid(), name: '' }] };
    /* Noms d'origine (anglais) : affichés traduits dans le champ, ré-enregistrés tels quels s'ils ne sont pas modifiés. */
    var origName = {};
    draft.options.forEach(function (o) { origName[o.id] = o.name; o.name = trEx(o.name); });

    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var optWrap = h('div', { class: 'mu-opts' });

      function renderOpts() {
        optWrap.innerHTML = '';
        draft.options.forEach(function (o, i) {
          var inp = h('input', { class: 'input', type: 'text', value: o.name, autocomplete: 'off', autocapitalize: 'words', list: 'mu-library',
            placeholder: i === 0 ? L('Exercise name', 'Nom de l’exercice') : L('Variant', 'Variante'),
            'aria-label': i === 0 ? L('Name', 'Nom') : L('Variant ', 'Variante ') + i });
          inp.addEventListener('input', function () { o.name = inp.value; });
          optWrap.appendChild(h('div', { class: 'mu-optrow' }, inp,
            draft.options.length > 1 ? h('button', { class: 'btn btn-icon', 'aria-label': L('Remove this variant', 'Retirer cette variante'),
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
        draft.options = draft.options.map(function (o) {
          o.name = (o.name || '').trim();
          if (origName[o.id] !== undefined && o.name === trEx(origName[o.id])) o.name = origName[o.id];
          return o;
        })
          .filter(function (o) { return o.name; });
        var problem = null;
        if (!draft.options.length) problem = L('Give the exercise a name.', 'Donne un nom à l’exercice.');
        else if (!draft.sets || draft.sets < 1 || draft.sets > 12) problem = L('Number of sets between 1 and 12.', 'Nombre de séries entre 1 et 12.');
        else if (!draft.repMin || !draft.repMax || draft.repMin < 1 || draft.repMax > 100) problem = L('Fill in the rep range.', 'Renseigne la fourchette de répétitions.');
        else if (draft.repMin > draft.repMax) problem = L('Min reps must be ≤ max reps.', 'Rép. min doit être ≤ rép. max.');
        if (problem) {
          if (!draft.options.length) draft.options.push({ id: ui.uid(), name: '' });
          err.textContent = problem; err.hidden = false; renderOpts(); return;
        }
        draft.sets = Math.round(draft.sets); draft.repMin = Math.round(draft.repMin); draft.repMax = Math.round(draft.repMax);
        if (isNew) d.slots.push(draft);
        else d.slots[d.slots.indexOf(sl)] = draft;
        persist(); close(); render();
        ui.toast(isNew ? L('Exercise added', 'Exercice ajouté') : L('Exercise updated', 'Exercice modifié'));
      }

      function remove() {
        ui.confirm({ title: L('Remove this exercise?', 'Retirer cet exercice ?'),
          message: L('It will be removed from the ' + d.name + ' program. Its history is kept.',
            'Il sera retiré du programme ' + dayName(d) + '. Son historique est conservé.'),
          okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) {
          if (!ok) return;
          d.slots.splice(d.slots.indexOf(sl), 1);
          persist(); close(); render();
        });
      }

      var library = h('datalist', { id: 'mu-library' }, libraryNames().map(function (n) { return h('option', { value: n }); }));
      return [
        library,
        h('h2', { class: 'sheet-title' }, isNew ? L('New exercise · ', 'Nouvel exercice · ') + dayName(d) : L('Edit exercise', 'Modifier l’exercice')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Name (and optional variants)', 'Nom (et variantes éventuelles)')), optWrap,
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () {
            draft.options.push({ id: ui.uid(), name: '' }); renderOpts();
            var ins = optWrap.querySelectorAll('input'); ins[ins.length - 1].focus();
          } }, L('+ Add a variant (pick one per workout)', '+ Ajouter une variante (une par séance)'))),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Category', 'Catégorie')), catSeg),
        h('div', { class: 'form-grid' },
          numField(L('Sets', 'Séries'), 'sets'), numField(L('Min reps', 'Rép. min'), 'repMin'), numField(L('Max reps', 'Rép. max'), 'repMax')),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')),
          isNew ? null : h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: remove }, L('Remove from program', 'Retirer du programme')))
      ];
    }, { modal: true });
  }

  /* ---------- Jours d'entraînement (semaine type) ---------- */
  var WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
  function weekdayName(n, short) {
    var d = new Date(2026, 10, 1 + ((n - 0 + 7) % 7)); /* 1er nov. 2026 = dimanche */
    var s = d.toLocaleDateString(S2.locale, { weekday: short ? 'short' : 'long' }).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function scheduleCard() {
    var card = h('div', { class: 'card mu-schedule' });
    WEEKDAYS.forEach(function (wd) {
      var d = day(data.schedule[wd]);
      card.appendChild(h('button', { class: 'mu-schedrow', onclick: function () { pickScheduleDay(wd); } },
        h('span', { class: 'mu-schedday' }, weekdayName(wd)),
        h('span', { class: 'mu-schedval' + (d ? '' : ' is-rest') }, d ? dayName(d) : L('Rest', 'Repos')),
        h('span', { class: 'chev', 'aria-hidden': 'true' }, '›')));
    });
    card.appendChild(h('p', { class: 'hint' }, L('The planned workout shows up in Today and is preselected here.', 'La séance prévue apparaît dans Aujourd’hui et est présélectionnée ici.')));
    return card;
  }
  function pickScheduleDay(wd) {
    ui.sheet(function (close) {
      function choose(id) { if (id) data.schedule[wd] = id; else delete data.schedule[wd]; persist(); close(); render(); }
      return [
        h('h2', { class: 'sheet-title' }, weekdayName(wd)),
        h('div', { class: 'mu-templates' },
          [h('button', { class: 'mu-template', type: 'button', onclick: function () { choose(null); } }, h('span', { class: 'list-title' }, L('Rest', 'Repos')))].concat(
            data.days.map(function (d) {
              return h('button', { class: 'mu-template' + (data.schedule[wd] === d.id ? ' is-on' : ''), type: 'button', onclick: function () { choose(d.id); } },
                h('span', { class: 'list-title' }, dayName(d)), h('span', { class: 'list-sub' }, d.slots.length + L(' exercise(s)', ' exercice(s)')));
            }))),
        h('div', { class: 'sheet-actions' }, h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    });
  }

  /* ---------- Objectifs sportifs : séances par semaine, charges visées ---------- */
  function mondayOf(date) { var d = new Date(date); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
  function bestWeight(name) {
    var k = String(name || '').trim().toLowerCase(), best = null;
    if (!k) return null;
    finished().forEach(function (s) {
      Object.keys(s.entries).forEach(function (exId) {
        var e = s.entries[exId], n = (e.snap && e.snap.name) || exName(exId);
        if (String(n).toLowerCase() !== k && String(trEx(n)).toLowerCase() !== k) return;
        e.sets.forEach(function (st) { if (st.done !== false && st.w !== null && st.r) best = best === null ? st.w : Math.max(best, st.w); });
      });
    });
    return best;
  }
  function weekCount() {
    var from = mondayOf(new Date());
    return finished().filter(function (s) { return new Date(s.startedAt) >= from; }).length;
  }
  function goalsCard() {
    var g = data.goals, has = g.perWeek || g.lifts.length;
    var card = h('div', { class: 'card mu-goals' }, h('div', { class: 'mu-goalshead' },
      h('div', { class: 'card-title' }, L('My goals', 'Mes objectifs')),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: editGoals }, has ? L('✎ Edit', '✎ Modifier') : L('+ Set', '+ Fixer'))));
    if (!has) { card.appendChild(h('p', { class: 'hint' }, L('Workouts per week, a weight to reach on a lift…', 'Séances par semaine, une charge à atteindre sur un exercice…'))); return card; }
    if (g.perWeek) {
      var n = weekCount();
      card.appendChild(goalRow(L('Workouts this week', 'Séances cette semaine'), n + ' / ' + g.perWeek, n / g.perWeek));
    }
    g.lifts.forEach(function (lf) {
      var b = bestWeight(lf.name);
      card.appendChild(goalRow(lf.name, (b === null ? '—' : num(b)) + ' / ' + num(lf.target) + ' kg', b === null ? 0 : b / lf.target));
    });
    return card;
  }
  function goalRow(label, value, share) {
    var pct = Math.max(0, Math.min(1, share || 0));
    return h('div', { class: 'mu-goalrow' + (share >= 1 ? ' is-done' : '') },
      h('div', { class: 'mu-goalline' }, h('span', null, (share >= 1 ? '✓ ' : '') + label), h('span', { class: 'mu-goalval' }, value)),
      h('span', { class: 'mu-goalbar', 'aria-hidden': 'true' }, h('span', { style: 'width:' + Math.round(pct * 100) + '%' })));
  }
  function editGoals() {
    var draft = JSON.parse(JSON.stringify(data.goals));
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var per = h('div', { class: 'segmented small' });
      function paintPer() {
        per.innerHTML = '';
        [[null, '—'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6']].forEach(function (x) {
          per.appendChild(h('button', { class: 'seg' + (draft.perWeek === x[0] ? ' is-active' : ''), type: 'button', onclick: function () { draft.perWeek = x[0]; paintPer(); } }, x[1]));
        });
      }
      paintPer();
      var list = h('div', { class: 'mu-liftgoals' });
      function paintLifts() {
        list.innerHTML = '';
        draft.lifts.forEach(function (lf, i) {
          var nm = h('input', { class: 'input', type: 'text', value: lf.name, list: 'mu-library', autocomplete: 'off', placeholder: L('Exercise', 'Exercice'), 'aria-label': L('Exercise', 'Exercice') });
          nm.addEventListener('input', function () { lf.name = nm.value; });
          var kg = h('input', { class: 'input mu-in', type: 'text', inputmode: 'decimal', value: lf.target ? num(lf.target) : '', placeholder: 'kg', 'aria-label': L('Target in kg', 'Objectif en kg') });
          kg.addEventListener('input', function () { lf.target = ui.parseNum(kg.value); });
          list.appendChild(h('div', { class: 'mu-liftrow' }, nm, kg,
            h('button', { class: 'btn btn-icon', type: 'button', 'aria-label': L('Remove', 'Retirer'), onclick: function () { draft.lifts.splice(i, 1); paintLifts(); } }, '×')));
        });
      }
      paintLifts();
      function save() {
        draft.lifts = draft.lifts.map(function (lf) { return { id: lf.id || ui.uid(), name: String(lf.name || '').trim(), target: lf.target }; })
          .filter(function (lf) { return lf.name || lf.target; });
        var bad = draft.lifts.filter(function (lf) { return !lf.name || !lf.target || lf.target <= 0 || lf.target > 500; });
        if (bad.length) { err.textContent = L('Each goal needs an exercise and a weight (kg).', 'Chaque objectif a besoin d’un exercice et d’une charge (kg).'); err.hidden = false; return; }
        data.goals = draft; persist(); close(); render();
        ui.toast(L('Goals saved', 'Objectifs enregistrés'));
      }
      return [
        h('datalist', { id: 'mu-library' }, libraryNames().map(function (n) { return h('option', { value: n }); })),
        h('h2', { class: 'sheet-title' }, L('My sport goals', 'Mes objectifs sportifs')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Workouts per week', 'Séances par semaine')), per),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Weights to reach (best set logged)', 'Charges à atteindre (meilleure série enregistrée)')), list,
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: function () { draft.lifts.push({ id: ui.uid(), name: '', target: null }); paintLifts(); } }, L('+ Add a lift', '+ Ajouter un exercice'))),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ---------- Minuteur de repos (après chaque série validée ; touche pour l'arrêter) ---------- */
  var REST = { main: 150, secondary: 120, isolation: 75 };
  var rest = null;
  function startRest(cat) {
    stopRest();
    var secs = REST[cat] || 90, end = Date.now() + secs * 1000;
    var pill = h('button', { class: 'mu-restpill', type: 'button', 'aria-live': 'polite', onclick: stopRest });
    document.body.appendChild(pill);
    function tick() {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      pill.textContent = left > 0 ? L('Rest ', 'Repos ') + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + ' ✕' : L('Rest over: next set!', 'Repos fini : série suivante !');
      if (left <= 0) {
        clearInterval(rest.iv); pill.classList.add('is-done');
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* rien */ }
        rest.to = setTimeout(stopRest, 4000);
      }
    }
    rest = { pill: pill, iv: setInterval(tick, 250) };
    tick();
  }
  function stopRest() {
    if (!rest) return;
    clearInterval(rest.iv); clearTimeout(rest.to); rest.pill.remove(); rest = null;
  }

  /* ---------- Proposition de programme (questionnaire de démarrage, onglet Objectif) ---------- */
  /* opts : level (beginner | intermediate | advanced), sportGoal (muscle | strength | fatloss | glutes | endurance),
     perWeek (2 à 6), place (gym | home), weekdays = [n° de jours de la semaine, dimanche = 0]. */
  function chooseTemplate(o) {
    if (o.place === 'home') return 'home';
    if (o.sportGoal === 'glutes') return 'glutes';
    if (o.perWeek >= 5) return 'ppl';
    if (o.perWeek === 4) return 'upperlower';
    return 'fullbody';
  }
  function proposalDays(o) {
    var t = TEMPLATES.filter(function (x) { return x.id === chooseTemplate(o); })[0];
    var days = templateDays(t);
    days.forEach(function (d) {
      d.slots.forEach(function (sl) {
        if (o.sportGoal === 'strength' && sl.category === 'main') { sl.sets = 5; sl.repMin = 3; sl.repMax = 5; }
        if (o.sportGoal === 'strength' && sl.category === 'secondary') { sl.repMin = 6; sl.repMax = 8; }
        if (o.sportGoal === 'fatloss' || o.sportGoal === 'endurance') { sl.repMin = Math.max(sl.repMin, 10); sl.repMax = Math.max(sl.repMax, 15); }
        if (o.level === 'beginner') sl.sets = Math.min(sl.sets, 3);
      });
    });
    return { template: t, days: days };
  }
  function proposalSchedule(days, weekdays) {
    var sch = {};
    (weekdays || []).slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); })
      .forEach(function (wd, i) { if (days.length) sch[wd] = days[i % days.length].id; });
    return sch;
  }

  S2.app.registerTab({ id: 'muscu', label: L('Gym', 'Muscu'), icon: ICON, mount: mount, order: 10 });

  /* Exposé pour les tests / la console. */
  /* API en lecture (onglet Aujourd'hui, bilan) et proposition de programme (questionnaire). Chaque appel relit les données. */
  function withPerson(who, fn) {
    var saveStore = store, saveData = data;
    store = loadData(); data = personData(store, 'me');
    try { return fn(); } finally { if (saveStore) { store = saveStore; data = saveData; } }
  }
  function dayKey(d) { var x = new Date(d); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); }
  S2.muscu = {
    e1rm: e1rm, progression: progression,
    /* Séance prévue ce jour-là (jours d'entraînement) et séances faites ce jour-là. */
    dayStatus: function (date, who) {
      return withPerson(who, function () {
        var d = day(data.schedule[new Date(date).getDay()]);
        var k = dayKey(date);
        var doneList = finished().filter(function (s) { return dayKey(s.startedAt) === k; }).map(function (s) { return { name: sessionDay(s), week: s.week, sets: Object.keys(s.entries).reduce(function (n, e) { return n + s.entries[e].sets.length; }, 0) }; });
        var act = active();
        return { planned: d ? { id: d.id, name: dayName(d), exercises: d.slots.length } : null, done: doneList,
          inProgress: act && dayKey(act.startedAt) === k ? sessionDay(act) : null, hasProgram: data.days.length > 0 };
      });
    },
    /* Pour le bilan : séances prévues et faites entre deux dates (incluses), objectif de séances par semaine. */
    weekStats: function (from, to, who) {
      return withPerson(who, function () {
        var a = new Date(from); a.setHours(0, 0, 0, 0); var b = new Date(to); b.setHours(23, 59, 59, 999);
        var planned = 0;
        for (var d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) if (day(data.schedule[d.getDay()])) planned++;
        var done = finished().filter(function (s) { var t = new Date(s.startedAt); return t >= a && t <= b; }).length;
        return { planned: planned, done: done, perWeek: data.goals.perWeek, lifts: data.goals.lifts.map(function (lf) { return { name: lf.name, target: lf.target, best: bestWeight(lf.name) }; }) };
      });
    },
    /* Ouvre l'onglet Muscu sur la bonne personne, avec ce jour présélectionné. */
    open: function (who, dayId) {
      person = 'me';
      pickDay = dayId || null; view = 'session';
      if (location.hash === '#muscu' && root) mount(root); else location.hash = '#muscu';
    },
    /* Questionnaire : aperçu puis application d'un programme proposé (remplace les jours, garde l'historique). */
    preview: function (o) {
      var p = proposalDays(o);
      return { name: p.template.name, days: p.days.map(function (d) { return { name: dayName(d), exercises: d.slots.length }; }) };
    },
    apply: function (who, o) {
      var st = loadData(), d = personData(st, 'me');
      if (d.activeId) return false;
      var p = proposalDays(o);
      d.days = p.days;
      d.schedule = proposalSchedule(p.days, o.weekdays);
      d.goals.perWeek = o.perWeek || null;
      S2.storage.save(NS, st);
      if (store) { store = st; data = personData(store, person); }
      return true;
    }
  };
})();
