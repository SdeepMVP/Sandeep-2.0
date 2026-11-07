/* Moteur PUR de la Muscu (v0.40–0.41) : groupes musculaires, volume par semaine, résumé de fin de séance, stagnation, force du mois,
   exercices au poids du corps, cycles de 12 semaines.
   Aucun DOM ni stockage : testable sous Node (tests/run.js). Les conseils ne sont que des propositions affichées ;
   rien n'est modifié dans le programme sans action de l'utilisateur.
   Séance = { id, startedAt, finishedAt, entries: { exId: { sets: [{ w, r, rpe }], snap: { name, category } } } }. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var L = S2.L || function (en) { return en; };

  /* Groupes musculaires, dans l'ordre d'affichage. */
  var GROUPS = [
    ['chest', L('Chest', 'Pectoraux')], ['back', L('Back', 'Dos')], ['shoulders', L('Shoulders', 'Épaules')],
    ['quads', L('Quads', 'Quadriceps')], ['hams', L('Hamstrings & glutes', 'Ischios & fessiers')],
    ['biceps', L('Biceps', 'Biceps')], ['triceps', L('Triceps', 'Triceps')], ['calves', L('Calves', 'Mollets')], ['abs', L('Abs', 'Abdos')]
  ];
  /* Muscle principal d'après le nom (français ou anglais). L'ordre compte : le premier motif trouvé l'emporte. */
  var RULES = [
    ['calves', /mollet|calf/],
    ['abs', /gainage|plank|crunch|abdo|relev[ée]s? de jambes|leg raise|ab wheel|russian/],
    ['triceps', /triceps|barre au front|skull|dips|prise serr[ée]e|close-grip|kickback triceps|pushdown/],
    ['hams', /hip thrust|pont fessier|glute|fessier|kickback|abduction|soulev[ée] de terre|deadlift|rdl|leg curl|ischio|good morning|rack pull/],
    ['biceps', /curl|biceps|marteau|hammer/],
    ['quads', /squat|presse|leg press|fente|lunge|split|step-up|leg extension|hack|adduction/],
    ['shoulders', /militaire|overhead|shoulder|[ée]paule|[ée]l[ée]vations? lat|lateral|oiseau|rear delt|face pull|arnold|shrug/],
    ['back', /tirage|traction|pull-?up|chin-?up|rowing|row\b|row |pulldown|lat |dorsal|pendlay|t-bar/],
    ['chest', /d[ée]velopp[ée]|bench|press|pompe|push-up|[ée]cart[ée]|fly|pec|crossover|chest/]
  ];
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function muscleOf(name) {
    var n = fold(name);
    for (var i = 0; i < RULES.length; i++) {
      var re = new RegExp(fold(RULES[i][1].source));
      if (re.test(n)) return RULES[i][0];
    }
    return 'other';
  }
  function groupLabel(id) { var g = GROUPS.filter(function (x) { return x[0] === id; })[0]; return g ? g[1] : L('Other', 'Autre'); }

  function e1rm(w, r) { return w && r ? w * (1 + r / 30) : 0; }
  function best(sets) { return (sets || []).reduce(function (m, s) { return Math.max(m, e1rm(s.w, s.r)); }, 0); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function nameOf(e, fallback) { return e && e.snap && e.snap.name || fallback || ''; }

  /* Séries par groupe musculaire entre deux dates (incluses). Repère conseillé : 10 à 20 séries par muscle et par semaine. */
  function weeklyVolume(sessions, from, to, names) {
    var a = new Date(from).getTime(), b = new Date(to).getTime(), out = {};
    (sessions || []).forEach(function (s) {
      if (!s.finishedAt) return;
      var t = new Date(s.startedAt).getTime();
      if (t < a || t > b) return;
      Object.keys(s.entries || {}).forEach(function (id) {
        var e = s.entries[id], g = muscleOf(nameOf(e, names && names[id]));
        out[g] = (out[g] || 0) + (e.sets || []).length;
      });
    });
    return out;
  }
  function volumeLevel(sets) { return sets < 10 ? 'low' : sets > 20 ? 'high' : 'ok'; }

  /* ---------- v0.41 : exercices au poids du corps ----------
     Pompes, tractions, dips, gainage… : sans charge saisie, le 1RM estimé valait 0 (ni record, ni courbe, ni stagnation).
     Désormais : avec le poids du corps connu (Objectif), charge = poids du corps + lest éventuel ; sinon, meilleure série en répétitions.
     Les exercices isométriques (gainage) se comptent toujours en répétitions / secondes. */
  var BODYWEIGHT = /pompe|push-up|traction|pull-?up|chin-?up|dips|gainage|plank|relev[ée]s? de jambes|leg raise|burpee|muscle-up|poids du corps|bodyweight|inverted row|rowing invers[ée]|australian/;
  var ISOMETRIC = /gainage|plank|chaise|wall sit|hollow|isom[ée]tri/;
  function isBodyweight(name) { return new RegExp(fold(BODYWEIGHT.source)).test(fold(name)); }
  function isIsometric(name) { return new RegExp(fold(ISOMETRIC.source)).test(fold(name)); }
  /* Performance d'un exercice dans une séance : { v, unit: 'kg' (1RM estimé) | 'reps' (meilleure série), bw (poids du corps compté) }. */
  function perf(sets, name, bw) {
    sets = sets || [];
    if (isBodyweight(name)) {
      if (bw && !isIsometric(name)) {
        return { v: sets.reduce(function (m, s) { return Math.max(m, s.r ? e1rm(bw + (s.w || 0), s.r) : 0); }, 0), unit: 'kg', bw: true };
      }
      return { v: sets.reduce(function (m, s) { return Math.max(m, s.r || 0); }, 0), unit: 'reps', bw: false };
    }
    if (sets.some(function (s) { return s.w > 0; })) return { v: best(sets), unit: 'kg', bw: false };
    return { v: sets.reduce(function (m, s) { return Math.max(m, s.r || 0); }, 0), unit: 'reps', bw: false };
  }

  /* Résumé de fin de séance : durée, séries, tonnage, et pour chaque exercice la meilleure performance comparée à la dernière fois
     et au record d'avant (🏆 si battu). previous = séances terminées avant celle-ci ; bw = poids du corps (kg) ou null. */
  function sessionSummary(session, previous, names, bw) {
    var sets = 0, tonnage = 0, ex = [];
    var prev = (previous || []).filter(function (p) { return p.finishedAt && p.id !== session.id; })
      .sort(function (x, y) { return x.startedAt < y.startedAt ? -1 : 1; });
    Object.keys(session.entries || {}).forEach(function (id) {
      var e = session.entries[id];
      if (!e.sets || !e.sets.length) return;
      var nm = nameOf(e, names && names[id]);
      sets += e.sets.length;
      e.sets.forEach(function (s) { tonnage += (s.w || 0) * (s.r || 0); });
      var now = perf(e.sets, nm, bw), last = null, record = 0;
      prev.forEach(function (p) {
        var pe = p.entries && p.entries[id];
        if (!pe || !pe.sets || !pe.sets.length) return;
        var b = perf(pe.sets, nm, bw);
        if (b.unit !== now.unit) return; /* on ne compare que des kg à des kg, des répétitions à des répétitions */
        last = b.v; record = Math.max(record, b.v);
      });
      var tol = now.unit === 'kg' ? 0.005 : 0;
      ex.push({ id: id, name: nm, e1rm: r1(now.v), value: r1(now.v), unit: now.unit, bw: now.bw, last: last === null ? null : r1(last),
        trend: last === null || !now.v ? 'new' : now.v > last * (1 + tol) ? 'up' : now.v < last * (1 - tol) ? 'down' : 'same',
        record: !!now.v && record > 0 && now.v > record * (1 + tol) });
    });
    var minutes = session.finishedAt ? Math.max(0, Math.round((new Date(session.finishedAt) - new Date(session.startedAt)) / 60000)) : null;
    return { sets: sets, tonnage: Math.round(tonnage), minutes: minutes, exercises: ex,
      records: ex.filter(function (x) { return x.record; }).length, ups: ex.filter(function (x) { return x.trend === 'up'; }).length };
  }

  /* Stagnation : un exercice fait au moins 4 fois, dont les 3 dernières séances (sur 2 semaines ou plus) n'ont pas battu
     la meilleure performance d'avant. Les semaines de décharge sont ignorées. Renvoie [{ id, name, category, sessions, best, unit, since }]. */
  function stagnation(sessions, names, bw) {
    var byEx = {};
    (sessions || []).filter(function (s) { return s.finishedAt && !s.deload; })
      .sort(function (x, y) { return x.startedAt < y.startedAt ? -1 : 1; })
      .forEach(function (s) {
        Object.keys(s.entries || {}).forEach(function (id) {
          var e = s.entries[id], nm = nameOf(e, names && names[id]), b = perf(e.sets, nm, bw);
          if (!b.v) return;
          var x = byEx[id] = byEx[id] || { id: id, name: nm, category: e.snap && e.snap.category, pts: [] };
          if (x.unit && x.unit !== b.unit) x.pts = []; /* l'unité a changé (poids du corps renseigné) : on repart de là */
          x.unit = b.unit; x.pts.push({ t: s.startedAt, v: b.v });
          if (e.snap && e.snap.name) x.name = e.snap.name;
        });
      });
    var out = [];
    Object.keys(byEx).forEach(function (id) {
      var x = byEx[id], p = x.pts;
      if (p.length < 4) return;
      var recent = p.slice(-3), before = p.slice(0, -3);
      var bestBefore = Math.max.apply(null, before.map(function (q) { return q.v; }));
      var bestRecent = Math.max.apply(null, recent.map(function (q) { return q.v; }));
      var span = (new Date(recent[2].t) - new Date(recent[0].t)) / 86400000;
      var tol = x.unit === 'kg' ? 0.005 : 0;
      if (span >= 14 && bestRecent <= bestBefore * (1 + tol)) {
        out.push({ id: id, name: x.name, category: x.category, sessions: p.length, best: r1(bestBefore), unit: x.unit, since: recent[0].t });
      }
    });
    return out;
  }

  /* Force sur une période : pour chaque exercice fait dans [from, to], meilleure performance, comparée à la période précédente
     de même durée. Classé par nombre de séances (les exercices principaux d'abord). */
  function strength(sessions, from, to, names, bw) {
    var a = new Date(from).getTime(), b = new Date(to).getTime(), len = b - a;
    var cur = {}, prev = {}, count = {}, label = {}, unit = {};
    (sessions || []).forEach(function (s) {
      if (!s.finishedAt) return;
      var t = new Date(s.startedAt).getTime();
      var bucket = t >= a && t <= b ? cur : t >= a - len && t < a ? prev : null;
      if (!bucket) return;
      Object.keys(s.entries || {}).forEach(function (id) {
        var e = s.entries[id], nm = nameOf(e, names && names[id]), v = perf(e.sets, nm, bw);
        if (!v.v) return;
        var k = id + '|' + v.unit;
        bucket[k] = Math.max(bucket[k] || 0, v.v);
        if (bucket === cur) { count[k] = (count[k] || 0) + 1; label[k] = nm; unit[k] = v.unit; }
      });
    });
    return Object.keys(cur).map(function (k) {
      return { id: k.split('|')[0], name: label[k], best: r1(cur[k]), unit: unit[k], prev: prev[k] ? r1(prev[k]) : null, sessions: count[k],
        delta: prev[k] ? r1(cur[k] - prev[k]) : null };
    }).sort(function (x, y) { return y.sessions - x.sessions || y.best - x.best; });
  }

  /* ---------- v0.41 : cycles de 12 semaines ----------
     Une séance porte week (1–12), cycle (1, 2… ; absent = 1) et deload (semaine de décharge).
     Renvoie le cycle en cours, la dernière semaine faite dans ce cycle, et done = cycle terminé (semaine `weeks` faite). */
  function cycleStatus(sessions, weeks) {
    weeks = weeks || 12;
    var fin = (sessions || []).filter(function (s) { return s.finishedAt; });
    var cycle = fin.reduce(function (m, s) { return Math.max(m, s.cycle || 1); }, 1);
    var inCycle = fin.filter(function (s) { return (s.cycle || 1) === cycle; });
    var normal = inCycle.filter(function (s) { return !s.deload; });
    var lastWeek = normal.reduce(function (m, s) { return Math.max(m, s.week || 1); }, 0);
    var lastNormal = normal.reduce(function (m, s) { return s.startedAt > m ? s.startedAt : m; }, '');
    var deloadAfter = inCycle.some(function (s) { return s.deload && s.startedAt > lastNormal; });
    return { cycle: cycle, lastWeek: lastWeek, done: lastWeek >= weeks, deloadDone: deloadAfter, sessions: inCycle.length };
  }

  S2.muscuEngine = { GROUPS: GROUPS, muscleOf: muscleOf, groupLabel: groupLabel, e1rm: e1rm, weeklyVolume: weeklyVolume, volumeLevel: volumeLevel,
    sessionSummary: sessionSummary, stagnation: stagnation, strength: strength,
    isBodyweight: isBodyweight, isIsometric: isIsometric, perf: perf, cycleStatus: cycleStatus };
})();
