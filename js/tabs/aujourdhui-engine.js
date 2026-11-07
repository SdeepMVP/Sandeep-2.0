/* Moteur PUR de l'onglet Aujourd'hui (Gym Food) : totaux du journal, bilan de la semaine, tendance du poids et
   suggestion d'ajustement des calories. Aucun DOM ni stockage : testable sous Node (tests/run.js).
   La suggestion n'est qu'une proposition : l'utilisateur la confirme (ou non) dans l'app. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  /* Évolution attendue du poids, en % du poids de corps par semaine, selon l'objectif nutrition. */
  var RATES = {
    bulk: [0.1, 0.5],
    recomp: [-0.25, 0.1],
    cut: [-1.0, -0.4],
    maintain: [-0.2, 0.2]
  };
  var STEP = 150; /* kcal par ajustement proposé */

  function r1(x) { return Math.round(x * 10) / 10; }

  /* Clé de jour locale « AAAA-MM-JJ ». */
  function dayKey(d) {
    var x = new Date(d);
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }

  /* Somme des entrées du journal (aliments, recettes, saisies rapides). */
  function totals(entries) {
    var t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    (entries || []).forEach(function (e) {
      t.kcal += e.kcal || 0; t.protein += e.protein || 0; t.carbs += e.carbs || 0; t.fat += e.fat || 0;
    });
    return { kcal: Math.round(t.kcal), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
  }

  /* Journée dans la cible : calories à ±10 % et protéines à au moins 90 %. */
  function inTarget(tot, t) {
    if (!t || !tot) return { kcal: false, protein: false, both: false };
    var k = Math.abs(tot.kcal - t.kcal) <= t.kcal * 0.1, p = tot.protein >= t.protein * 0.9;
    return { kcal: k, protein: p, both: k && p };
  }

  /* Bilan nutrition d'une période : days = [{ entries }] (jours sans entrée = non suivis, exclus des moyennes). */
  function nutritionSummary(days, t) {
    var logged = days.filter(function (d) { return d.entries && d.entries.length; });
    var tots = logged.map(function (d) { return totals(d.entries); });
    var n = tots.length;
    function avg(k) { return n ? Math.round(tots.reduce(function (s, x) { return s + x[k]; }, 0) / n) : 0; }
    var hit = tots.filter(function (x) { return inTarget(x, t).both; }).length;
    var kOk = tots.filter(function (x) { return inTarget(x, t).kcal; }).length;
    var pOk = tots.filter(function (x) { return inTarget(x, t).protein; }).length;
    return { days: days.length, logged: n, kcal: avg('kcal'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat'), inTarget: hit, kcalOk: kOk, proteinOk: pOk };
  }

  /* Tendance du poids (régression linéaire) sur les `windowDays` derniers jours avant `now`.
     null s'il y a moins de 3 pesées ou si elles couvrent moins de 10 jours. */
  function weightTrend(weights, now, windowDays) {
    windowDays = windowDays || 28;
    var end = new Date(now).getTime(), start = end - windowDays * 86400000;
    var pts = (weights || []).filter(function (w) { var t = new Date(w.date).getTime(); return t >= start && t <= end + 86400000; })
      .map(function (w) { return { x: (new Date(w.date).getTime() - start) / 86400000, y: w.kg }; });
    if (pts.length < 3) return null;
    var span = Math.max.apply(null, pts.map(function (p) { return p.x; })) - Math.min.apply(null, pts.map(function (p) { return p.x; }));
    if (span < 10) return null;
    var n = pts.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    pts.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; });
    var slope = (n * sxy - sx * sy) / (n * sxx - sx * sx); /* kg par jour */
    var mean = sy / n;
    return { perWeek: Math.round(slope * 7 * 100) / 100, pct: Math.round(slope * 7 / mean * 1000) / 10, n: n, span: Math.round(span), mean: r1(mean) };
  }

  /* Suggestion d'ajustement : kind = 'up' | 'down' | 'keep' | 'wait' (pas assez de pesées) | 'log' (pas assez de suivi). */
  function suggestion(goal, trend, nutrition, currentKcal) {
    var range = RATES[goal] || RATES.maintain;
    if (!trend) return { kind: 'wait', range: range };
    if (nutrition && nutrition.days >= 7 && (nutrition.logged < Math.ceil(nutrition.days * 0.5) || nutrition.kcalOk < Math.ceil(nutrition.logged * 0.6))) {
      return { kind: 'log', range: range, pct: trend.pct };
    }
    if (trend.pct < range[0]) return { kind: 'up', delta: STEP, newKcal: currentKcal + STEP, range: range, pct: trend.pct };
    if (trend.pct > range[1]) return { kind: 'down', delta: -STEP, newKcal: currentKcal - STEP, range: range, pct: trend.pct };
    return { kind: 'keep', range: range, pct: trend.pct };
  }

  /* Lundi de la semaine d'une date (minuit local). */
  function monday(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

  /* ---------- Recherche d'aliments (journal) ----------
     items = [{ name, curated? }] ; chaque mot cherché doit commencer un mot du nom (sans accents, singulier/pluriel confondus).
     Classement : nom qui commence par la recherche, puis premier mot, puis noms courts ; aliments « du quotidien » de l'app en premier. */
  var SYNONYMS = { coca: 'cola', nutella: 'pate a tartiner', yogourt: 'yaourt', yogurt: 'yaourt', ketchup: 'ketchup', pates: 'pates', spaghettis: 'pates',
    frite: 'frites', burger: 'burger', mcdo: 'hamburger', steak: 'steak', cafe: 'cafe', the: 'the', oeufs: 'oeuf', patate: 'pomme de terre', cereale: 'cereales' };
  function fold(s) { return String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function stem(w) { return w.length > 3 ? w.replace(/(s|x)$/, '') : w; }
  function words(s) { return fold(s).split(/[^a-z0-9%]+/).filter(Boolean).map(stem); }
  function searchFoods(items, query, limit) {
    var q = fold(query).trim();
    if (!q) return [];
    var qw = [];
    q.split(/\s+/).forEach(function (w) { (SYNONYMS[w] || w).split(' ').forEach(function (x) { if (x) qw.push(stem(x)); }); });
    var scored = [];
    items.forEach(function (it) {
      var nw = it._w || (it._w = words(it.name));
      var pos = [];
      for (var i = 0; i < qw.length; i++) {
        var k = -1;
        for (var j = 0; j < nw.length; j++) if (nw[j].indexOf(qw[i]) === 0) { k = j; break; }
        if (k < 0) return;
        pos.push(k);
      }
      var name = fold(it.name), first = name.split(',')[0];
      var score = 0;
      if (pos[0] === 0) score += 6;
      if (first.indexOf(qw.join(' ')) === 0) score += 3;
      score -= pos.reduce(function (a, b) { return a + b; }, 0) * 0.5;
      score -= name.length * 0.03;
      if (it.curated) score += 2.5;
      /* Le journal note surtout des aliments prêts à manger : cuit plutôt que cru, sauf si « cru » est cherché. */
      if (qw.indexOf('cru') < 0 && qw.indexOf('crue') < 0) {
        if (/\bcrue?s?\b/.test(name) && !/^(fruit|pomme|poire|banane|fraise|tomate|carotte|concombre|salade|avocat)/.test(name)) score -= 1;
        if (/cuit|grill|roti|poele|vapeur/.test(name)) score += 0.5;
      }
      scored.push({ it: it, s: score });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, limit || 50).map(function (x) { return x.it; });
  }

  S2.todayEngine = { RATES: RATES, STEP: STEP, dayKey: dayKey, totals: totals, inTarget: inTarget, nutritionSummary: nutritionSummary,
    weightTrend: weightTrend, suggestion: suggestion, monday: monday, searchFoods: searchFoods };
})();
