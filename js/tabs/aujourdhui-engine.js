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

  /* ---------- Check-list du jour (v0.40) ----------
     o = { tot, t (cibles), water, waterGoal, training: 'done' | 'rest' | 'planned' | 'missed' | 'none' }.
     Une journée est « réussie » quand chaque point applicable est coché : calories (±10 %), protéines (≥ 90 %),
     séance faite (ou jour de repos / pas de programme), eau à l'objectif. */
  function checklist(o) {
    var it = inTarget(o.tot, o.t);
    var tr = o.training || 'none';
    var items = [
      { id: 'kcal', ok: it.kcal },
      { id: 'protein', ok: it.protein },
      { id: 'training', ok: tr === 'done' || tr === 'rest' || tr === 'none', state: tr },
      { id: 'water', ok: (o.water || 0) >= (o.waterGoal || 8) }
    ];
    var n = items.filter(function (x) { return x.ok; }).length;
    var logged = o.tot && o.tot.kcal > 0;
    return { items: items, done: n, total: items.length, success: !!logged && n === items.length };
  }

  /* ---------- « Ce qu'il te manque » (v0.40) ----------
     Propose 1 ou 2 aliments (1 portion chacun) pour combler les protéines qui manquent sans dépasser les calories restantes.
     foods = [{ key, name, kcal, protein }] (aliments habituels de l'utilisateur d'abord). Renvoie { kind, gap, left, options }.
     kind : 'none' (rien à suggérer), 'protein' (options proposées), 'kcal' (protéines OK, il reste des calories), 'over' (au-dessus). */
  function missing(tot, t, foods, maxOptions) {
    if (!t || !tot) return { kind: 'none', options: [] };
    var gap = Math.round(t.protein - tot.protein), left = Math.round(t.kcal - tot.kcal);
    if (left < -t.kcal * 0.1) return { kind: 'over', gap: gap, left: left, options: [] };
    if (gap < 10) return { kind: left > 250 ? 'kcal' : 'none', gap: gap, left: left, options: [] };
    var budget = Math.max(left, 0) * 1.1 + 50; /* petite marge : quelques kcal de plus valent mieux qu'il manque des protéines */
    var cands = (foods || []).filter(function (f) { return f.protein >= 5 && f.kcal > 0 && f.kcal <= budget; })
      .sort(function (a, b) { return b.protein / b.kcal - a.protein / a.kcal; }).slice(0, 14);
    var combos = [];
    function add(list) {
      var k = 0, p = 0; list.forEach(function (f) { k += f.kcal; p += f.protein; });
      if (k > budget) return;
      var cover = Math.min(p, gap) / gap;              /* part du manque comblée */
      var over = Math.max(0, p - gap * 1.4) / gap;      /* bien trop de protéines : moins utile */
      combos.push({ items: list, kcal: Math.round(k), protein: Math.round(p), score: cover * 10 - over * 3 - k / 400 - (list.length - 1) * 0.6 });
    }
    for (var i = 0; i < cands.length; i++) {
      add([cands[i]]);
      for (var j = i + 1; j < cands.length; j++) add([cands[i], cands[j]]);
    }
    combos.sort(function (a, b) { return b.score - a.score; });
    var out = [], used = {};
    combos.forEach(function (c) {
      if (out.length >= (maxOptions || 3)) return;
      var sig = c.items.map(function (f) { return f.key; });
      if (sig.some(function (k) { return used[k]; })) return; /* options variées : un aliment n'apparaît qu'une fois */
      sig.forEach(function (k) { used[k] = true; });
      out.push({ items: c.items, kcal: c.kcal, protein: c.protein });
    });
    return { kind: out.length ? 'protein' : 'none', gap: gap, left: left, options: out };
  }

  /* ---------- Restes (v0.40) ----------
     cooked = [{ recipeId, servings, date }] (Cuisine › « J'ai cuisiné ») ; entries = entrées du journal depuis (type, ref, qty, at).
     Une portion notée comme mangée après la cuisson est retirée des restes ; les restes de plus de `maxDays` jours ne sont plus proposés
     (3 jours au frigo). Le repas du jour de la cuisson compte : il en reste servings − portions mangées. */
  function leftovers(cooked, entries, now, maxDays) {
    var end = new Date(now).getTime(), lim = (maxDays || 3) * 86400000;
    var seen = {};
    return (cooked || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .filter(function (c) {
        var age = end - new Date(c.date).getTime();
        if (age < 0 || age > lim || seen[c.recipeId]) return false;
        seen[c.recipeId] = true; /* dernière cuisson seulement */
        return true;
      })
      .map(function (c) {
        var from = new Date(c.date).getTime();
        var eaten = (entries || []).filter(function (e) { return e.type === 'recipe' && e.ref === c.recipeId && new Date(e.at).getTime() >= from; })
          .reduce(function (n, e) { return n + (e.qty || 1); }, 0);
        return { recipeId: c.recipeId, date: c.date, cooked: c.servings || 1, left: Math.round(((c.servings || 1) - eaten) * 100) / 100 };
      })
      .filter(function (x) { return x.left >= 0.5; });
  }

  /* ---------- Bilan du mois (v0.40) ---------- */
  function monthRange(d) {
    var x = new Date(d), a = new Date(x.getFullYear(), x.getMonth(), 1), b = new Date(x.getFullYear(), x.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: a, to: b, days: b.getDate() };
  }
  /* Évolution d'une mesure sur une période : première et dernière valeur dans [from, to]. pts = [{ date, v }]. */
  function periodChange(pts, from, to) {
    var a = new Date(from).getTime(), b = new Date(to).getTime();
    var inP = (pts || []).filter(function (p) { var t = new Date(p.date).getTime(); return t >= a && t <= b && typeof p.v === 'number'; })
      .sort(function (x, y) { return new Date(x.date) - new Date(y.date); });
    if (!inP.length) return null;
    var f = inP[0].v, l = inP[inP.length - 1].v;
    return { first: f, last: l, delta: Math.round((l - f) * 10) / 10, n: inP.length };
  }

  S2.todayEngine = { RATES: RATES, STEP: STEP, dayKey: dayKey, totals: totals, inTarget: inTarget, nutritionSummary: nutritionSummary,
    weightTrend: weightTrend, suggestion: suggestion, monday: monday, searchFoods: searchFoods,
    checklist: checklist, missing: missing, leftovers: leftovers, monthRange: monthRange, periodChange: periodChange };
})();
