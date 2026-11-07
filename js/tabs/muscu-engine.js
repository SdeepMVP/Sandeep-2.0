/* Moteur PUR de la Muscu (v0.40) : groupes musculaires, volume par semaine, résumé de fin de séance, stagnation, force du mois.
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

  /* Résumé de fin de séance : durée, séries, tonnage, et pour chaque exercice la meilleure série comparée à la dernière fois
     et au record d'avant (🏆 si battu). previous = séances terminées avant celle-ci. */
  function sessionSummary(session, previous, names) {
    var sets = 0, tonnage = 0, ex = [];
    var prev = (previous || []).filter(function (p) { return p.finishedAt && p.id !== session.id; })
      .sort(function (x, y) { return x.startedAt < y.startedAt ? -1 : 1; });
    Object.keys(session.entries || {}).forEach(function (id) {
      var e = session.entries[id];
      if (!e.sets || !e.sets.length) return;
      sets += e.sets.length;
      e.sets.forEach(function (s) { tonnage += (s.w || 0) * (s.r || 0); });
      var now = best(e.sets), last = null, record = 0;
      prev.forEach(function (p) {
        var pe = p.entries && p.entries[id];
        if (!pe || !pe.sets || !pe.sets.length) return;
        var b = best(pe.sets);
        last = b; record = Math.max(record, b);
      });
      ex.push({ id: id, name: nameOf(e, names && names[id]), e1rm: r1(now), last: last === null ? null : r1(last),
        trend: last === null || !now ? 'new' : now > last * 1.005 ? 'up' : now < last * 0.995 ? 'down' : 'same',
        record: !!now && record > 0 && now > record * 1.005 });
    });
    var minutes = session.finishedAt ? Math.max(0, Math.round((new Date(session.finishedAt) - new Date(session.startedAt)) / 60000)) : null;
    return { sets: sets, tonnage: Math.round(tonnage), minutes: minutes, exercises: ex,
      records: ex.filter(function (x) { return x.record; }).length, ups: ex.filter(function (x) { return x.trend === 'up'; }).length };
  }

  /* Stagnation : un exercice fait au moins 4 fois, dont les 3 dernières séances (sur 3 semaines ou plus) n'ont pas battu
     le meilleur 1RM estimé d'avant. Renvoie [{ id, name, category, sessions, best, since }]. */
  function stagnation(sessions, names) {
    var byEx = {};
    (sessions || []).filter(function (s) { return s.finishedAt; })
      .sort(function (x, y) { return x.startedAt < y.startedAt ? -1 : 1; })
      .forEach(function (s) {
        Object.keys(s.entries || {}).forEach(function (id) {
          var e = s.entries[id], b = best(e.sets);
          if (!b) return;
          (byEx[id] = byEx[id] || { id: id, name: nameOf(e, names && names[id]), category: e.snap && e.snap.category, pts: [] }).pts.push({ t: s.startedAt, v: b });
          if (e.snap && e.snap.name) byEx[id].name = e.snap.name;
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
      if (span >= 14 && bestRecent <= bestBefore * 1.005) {
        out.push({ id: id, name: x.name, category: x.category, sessions: p.length, best: r1(bestBefore), since: recent[0].t });
      }
    });
    return out;
  }

  /* Force sur une période : pour chaque exercice fait dans [from, to], meilleur 1RM estimé, comparé à la période précédente
     de même durée. Classé par nombre de séances (les exercices principaux d'abord). */
  function strength(sessions, from, to, names) {
    var a = new Date(from).getTime(), b = new Date(to).getTime(), len = b - a;
    var cur = {}, prev = {}, count = {}, label = {};
    (sessions || []).forEach(function (s) {
      if (!s.finishedAt) return;
      var t = new Date(s.startedAt).getTime();
      var bucket = t >= a && t <= b ? cur : t >= a - len && t < a ? prev : null;
      if (!bucket) return;
      Object.keys(s.entries || {}).forEach(function (id) {
        var e = s.entries[id], v = best(e.sets);
        if (!v) return;
        bucket[id] = Math.max(bucket[id] || 0, v);
        if (bucket === cur) { count[id] = (count[id] || 0) + 1; label[id] = nameOf(e, names && names[id]); }
      });
    });
    return Object.keys(cur).map(function (id) {
      return { id: id, name: label[id], best: r1(cur[id]), prev: prev[id] ? r1(prev[id]) : null, sessions: count[id],
        delta: prev[id] ? r1(cur[id] - prev[id]) : null };
    }).sort(function (x, y) { return y.sessions - x.sessions || y.best - x.best; });
  }

  S2.muscuEngine = { GROUPS: GROUPS, muscleOf: muscleOf, groupLabel: groupLabel, e1rm: e1rm, weeklyVolume: weeklyVolume, volumeLevel: volumeLevel,
    sessionSummary: sessionSummary, stagnation: stagnation, strength: strength };
})();
