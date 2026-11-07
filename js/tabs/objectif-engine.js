/* Moteur PUR de l'onglet Objectif (SanEva) : besoins caloriques et macros, adéquation des recettes, journée type.
   Aucun DOM ni stockage : testable sous Node (tests/run.js). Utilisé par js/tabs/objectif.js et js/tabs/cuisine.js.
   Formule : Mifflin-St Jeor (métabolisme de base) × niveau d'activité = dépense du jour, puis ajustement selon l'objectif.
   Protéines et lipides en g par kg de poids de corps, glucides = le reste des calories. Valeurs indicatives. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  var ACTIVITY = {
    sedentary: 1.2,   /* peu ou pas de sport */
    light: 1.375,     /* 1 à 3 séances par semaine */
    moderate: 1.55,   /* 3 à 5 séances */
    high: 1.725,      /* 6 à 7 séances */
    very: 1.9         /* sport intense tous les jours ou métier physique */
  };
  /* kcal = ajustement de la dépense du jour ; protein / fat = g par kg de poids de corps. */
  var GOALS = {
    bulk:     { kcal: 0.10,  protein: 1.8, fat: 1.0 },  /* prise de masse */
    recomp:   { kcal: -0.05, protein: 2.0, fat: 0.9 },  /* transformation / recomposition */
    cut:      { kcal: -0.20, protein: 2.2, fat: 0.8 },  /* sèche */
    maintain: { kcal: 0,     protein: 1.6, fat: 1.0 }   /* maintien */
  };
  var MIN_KCAL = { f: 1200, m: 1500 };
  var PORTIONS = [0.5, 1, 1.5, 2];
  /* Organisation des repas selon leur nombre : petit-déj / en-cas (breakfast) et repas (main). */
  var STRUCTURE = {
    2: ['main', 'main'],
    3: ['breakfast', 'main', 'main'],
    4: ['breakfast', 'main', 'breakfast', 'main'],
    5: ['breakfast', 'breakfast', 'main', 'breakfast', 'main']
  };

  function num(x) { return typeof x === 'number' && isFinite(x) ? x : null; }
  function round(x, step) { return Math.round(x / step) * step; }

  /* Profil complet et plausible ? */
  function isComplete(p) {
    if (!p) return false;
    var age = num(p.age), hgt = num(p.height), w = num(p.weight);
    return (p.sex === 'm' || p.sex === 'f') && age !== null && age >= 14 && age <= 90 &&
      hgt !== null && hgt >= 120 && hgt <= 230 && w !== null && w >= 30 && w <= 250 &&
      !!ACTIVITY[p.activity] && !!GOALS[p.goal];
  }

  function bmr(p) {
    return 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  }

  /* Objectifs du jour. p.custom = { kcal, protein } : valeurs fixées à la main (remplacent le calcul). */
  function targets(p) {
    if (!isComplete(p)) return null;
    var g = GOALS[p.goal];
    var base = bmr(p);
    var tdee = base * ACTIVITY[p.activity];
    var kcal = Math.max(MIN_KCAL[p.sex], round(tdee * (1 + g.kcal), 10));
    var protein = Math.round(p.weight * g.protein);
    var auto = { kcal: kcal, protein: protein };
    var c = p.custom || {};
    var custom = false;
    if (num(c.kcal) !== null && c.kcal >= 800 && c.kcal <= 6000) { kcal = Math.round(c.kcal); custom = true; }
    if (num(c.protein) !== null && c.protein >= 20 && c.protein <= 400) { protein = Math.round(c.protein); custom = true; }
    var fat = Math.round(p.weight * g.fat);
    /* Les lipides ne descendent pas sous 20 % des calories ; les glucides prennent le reste. */
    fat = Math.max(fat, Math.round(kcal * 0.2 / 9));
    var carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    var meals = STRUCTURE[p.meals] ? p.meals : 3;
    return {
      bmr: Math.round(base), tdee: round(tdee, 10), kcal: kcal, protein: protein, fat: fat, carbs: carbs,
      auto: auto, custom: custom, goal: p.goal, meals: meals,
      perMeal: { kcal: Math.round(kcal / meals), protein: Math.round(protein / meals) }
    };
  }

  /* ---------- Recettes ---------- */

  /* Portion conseillée (0,5 / 1 / 1,5 / 2) pour qu'une portion de recette fasse environ un repas. */
  function portionFor(recipe, t) {
    if (!recipe || !recipe.kcal || !t) return 1;
    var want = t.perMeal.kcal / recipe.kcal;
    var best = 1, bd = Infinity;
    PORTIONS.forEach(function (x) { var d = Math.abs(Math.log(x / want)); if (d < bd) { bd = d; best = x; } });
    return best;
  }

  /* Adéquation d'une recette à l'objectif : densité en protéines (g / kcal) comparée à celle de l'objectif,
     portion conseillée et part de la journée. level : good | ok | low. */
  function recipeFit(recipe, t) {
    if (!recipe || !t || !recipe.kcal || !recipe.protein) return null;
    var density = (recipe.protein / recipe.kcal) / (t.protein / t.kcal);
    var portion = portionFor(recipe, t);
    var kcal = Math.round(recipe.kcal * portion), protein = Math.round(recipe.protein * portion);
    var level = density >= 0.95 ? 'good' : density >= 0.75 ? 'ok' : 'low';
    var score = Math.max(0, 1 - density) * 2 + Math.abs(Math.log(recipe.kcal / t.perMeal.kcal)) * 0.25;
    return {
      density: density, level: level, portion: portion, kcal: kcal, protein: protein, score: score,
      dayKcal: kcal / t.kcal, dayProtein: protein / t.protein
    };
  }

  function comboScore(totK, totP, t) {
    var kErr = Math.abs(totK - t.kcal) / t.kcal;
    var pShort = Math.max(0, (t.protein - totP) / t.protein);
    var pOver = Math.max(0, (totP - 1.4 * t.protein) / t.protein);
    return kErr + 1.5 * pShort + 0.3 * pOver;
  }

  /* Journées types : une recette par repas (selon STRUCTURE), portion conseillée pour chacune.
     recipes = recettes déjà filtrées par l'appelant (exclusions, végétarien…). Renvoie jusqu'à `count`
     journées classées, assez différentes les unes des autres (au moins 2 recettes changent). */
  /* Petit bruit déterministe (0 à 1) par recette et par graine : varie les propositions sans hasard. */
  function noise(id, seed) {
    var x = 2166136261, str = String(id) + '#' + seed;
    for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
    return ((x >>> 0) % 1000) / 1000;
  }

  /* opts (facultatif) : used = { id: nombre de fois déjà prévue } (pénalise les répétitions),
     seed = graine de variation, pool = [nb petits-déj, nb repas] retenus avant la recherche. */
  function dayPlans(recipes, t, count, opts) {
    if (!t) return [];
    count = count || 8;
    opts = opts || {};
    var used = opts.used || {};
    var hasSeed = opts.seed !== undefined && opts.seed !== null;
    /* Variété : chaque répétition coûte. Batch : une recette déjà prévue est favorisée (jusqu'à 3 jours). */
    function extra(r) {
      var c = used[r.id] || 0;
      var rep = opts.batch ? (c >= 3 ? 1 : c > 0 ? -0.15 : 0) : c * 0.15;
      /* avoid = recettes du planning précédent : pénalisées pour ne pas manger la même chose à la période suivante. */
      var av = opts.avoid && opts.avoid[r.id] ? 0.25 : 0;
      return rep + av + (hasSeed ? noise(r.id, opts.seed) * 0.12 : 0);
    }
    var slots = STRUCTURE[t.meals] || STRUCTURE[3];
    var usable = recipes.filter(function (r) { return r && r.kcal > 0 && r.protein > 0 && (r.category === 'breakfast' || r.category === 'main'); });
    function top(cat, n) {
      return usable.filter(function (r) { return r.category === cat; })
        .map(function (r) { return { r: r, f: recipeFit(r, t), x: extra(r) }; })
        .sort(function (a, b) { return (a.f.score + a.x) - (b.f.score + b.x); }).slice(0, n);
    }
    var sizes = opts.pool || [10, 12];
    var pools = { breakfast: top('breakfast', sizes[0]), main: top('main', sizes[1]) };
    var need = { breakfast: 0, main: 0 };
    slots.forEach(function (c) { need[c]++; });
    if (pools.breakfast.length < need.breakfast || pools.main.length < need.main) return [];

    function choose(list, k) {
      var out = [];
      (function rec(start, acc) {
        if (acc.length === k) { out.push(acc.slice()); return; }
        for (var i = start; i < list.length; i++) { acc.push(list[i]); rec(i + 1, acc); acc.pop(); }
      })(0, []);
      return out;
    }
    var bs = choose(pools.breakfast, need.breakfast), ms = choose(pools.main, need.main);
    var all = [];
    bs.forEach(function (b) {
      ms.forEach(function (m) {
        var items = b.concat(m), K = 0, P = 0, X = 0;
        items.forEach(function (x) { K += x.r.kcal * x.f.portion; P += x.r.protein * x.f.portion; X += x.x; });
        all.push({ items: items, kcal: K, protein: P, score: comboScore(K, P, t) + X / items.length });
      });
    });
    all.sort(function (a, b) { return a.score - b.score; });

    var picked = [];
    for (var i = 0; i < all.length && picked.length < count; i++) {
      var ids = all[i].items.map(function (x) { return x.r.id; });
      var distinct = picked.every(function (p) {
        var same = p.items.filter(function (x) { return ids.indexOf(x.r.id) > -1; }).length;
        return ids.length - same >= Math.min(2, ids.length);
      });
      if (distinct) picked.push(all[i]);
    }
    /* Remet les recettes dans l'ordre de la journée (petit-déj, repas, en-cas…). */
    return picked.map(function (p) {
      var b = p.items.filter(function (x) { return x.r.category === 'breakfast'; });
      var m = p.items.filter(function (x) { return x.r.category === 'main'; });
      var ordered = slots.map(function (c) { return (c === 'breakfast' ? b : m).shift(); });
      return {
        meals: ordered.map(function (x, k) {
          return { recipe: x.r, slot: slots[k], portion: x.f.portion,
            kcal: Math.round(x.r.kcal * x.f.portion), protein: Math.round(x.r.protein * x.f.portion) };
        }),
        kcal: Math.round(p.kcal), protein: Math.round(p.protein), score: p.score
      };
    });
  }

  /* Semaine : une journée par jour, enchaînées pour varier (une recette déjà prévue est pénalisée).
     opts : days (7), seed (variation de toute la semaine), picks = [n° de proposition choisi pour chaque jour],
     batch = true pour moins de recettes différentes (mêmes plats sur 2 à 3 jours : courses et cuisine simplifiées)
     (« autre proposition » pour un seul jour). Chaque jour renvoie aussi `choices` = nombre de propositions. */
  function weekPlan(recipes, t, opts) {
    if (!t) return [];
    opts = opts || {};
    var n = opts.days || 7, seed = opts.seed || 0, picks = opts.picks || [];
    var used = {}, out = [];
    for (var d = 0; d < n; d++) {
      var plans = dayPlans(recipes, t, 5, { used: used, seed: seed * 31 + d, pool: [8, 10], batch: !!opts.batch, avoid: opts.avoid });
      if (!plans.length) return [];
      var k = (picks[d] || 0) % plans.length;
      var day = plans[k];
      day.choices = plans.length; day.pick = k;
      day.meals.forEach(function (m) { used[m.recipe.id] = (used[m.recipe.id] || 0) + 1; });
      out.push(day);
    }
    return out;
  }

  /* Regroupe la semaine par recette (pour le menu et les courses) : portions additionnées, jours concernés. */
  function weekTotals(week) {
    var by = {}, order = [];
    week.forEach(function (day, d) {
      day.meals.forEach(function (m) {
        var id = m.recipe.id;
        if (!by[id]) { by[id] = { recipe: m.recipe, portions: 0, days: [] }; order.push(id); }
        by[id].portions += m.portion + (m.portion2 || 0);
        if (by[id].days.indexOf(d) < 0) by[id].days.push(d);
      });
    });
    return order.map(function (id) { return by[id]; });
  }

  /* Portion la plus proche (0,5 / 1 / 1,5 / 2) pour qu'une recette fasse `mealKcal`. */
  function portionForKcal(recipe, mealKcal) {
    if (!recipe || !recipe.kcal || !mealKcal) return 1;
    var want = mealKcal / recipe.kcal, best = 1, bd = Infinity;
    PORTIONS.forEach(function (x) { var d = Math.abs(Math.log(x / want)); if (d < bd) { bd = d; best = x; } });
    return best;
  }

  /* Cuisiner à 2 : les recettes sont choisies pour la 1re personne ; on ajoute la portion de la 2e (t2 = ses objectifs).
     Portions par quart (0,5 à 2), d'abord repas par repas, puis ajustées sur la journée pour coller à ses calories.
     Renvoie des copies (portion2, kcal2, protein2 ; kcal2 / protein2 par jour). */
  var PORTIONS2 = [0.5, 0.75, 1, 1.25, 1.5, 2];
  function forTwo(days, t2) {
    if (!t2) return days;
    return days.map(function (day) {
      var ms = day.meals, mealKcal = t2.kcal / Math.max(1, ms.length);
      var idx = ms.map(function (m) {
        var want = m.recipe.kcal ? mealKcal / m.recipe.kcal : 1, best = 2, bd = Infinity;
        PORTIONS2.forEach(function (x, i) { var d = Math.abs(Math.log(x / want)); if (d < bd) { bd = d; best = i; } });
        return best;
      });
      function total(ix) { return ms.reduce(function (n, m, k) { return n + (m.recipe.kcal || 0) * PORTIONS2[ix[k]]; }, 0); }
      /* Ajustement : un quart de plus ou de moins sur le repas qui rapproche le plus du total visé. */
      for (var it = 0; it < 8; it++) {
        var cur = Math.abs(total(idx) - t2.kcal), bestGain = 0, bestK = -1, bestI = 0;
        for (var k = 0; k < ms.length; k++) {
          [-1, 1].forEach(function (dir) {
            var j = idx[k] + dir;
            if (j < 0 || j >= PORTIONS2.length) return;
            var trial = idx.slice(); trial[k] = j;
            var gain = cur - Math.abs(total(trial) - t2.kcal);
            if (gain > bestGain + 1e-9) { bestGain = gain; bestK = k; bestI = j; }
          });
        }
        if (bestK < 0) break;
        idx[bestK] = bestI;
      }
      var meals = ms.map(function (m, k) {
        var p2 = PORTIONS2[idx[k]];
        var c = {}; Object.keys(m).forEach(function (key) { c[key] = m[key]; });
        c.portion2 = p2; c.kcal2 = Math.round((m.recipe.kcal || 0) * p2); c.protein2 = Math.round((m.recipe.protein || 0) * p2);
        return c;
      });
      var out = {}; Object.keys(day).forEach(function (key) { out[key] = day[key]; });
      out.meals = meals;
      out.kcal2 = meals.reduce(function (n, m) { return n + m.kcal2; }, 0);
      out.protein2 = meals.reduce(function (n, m) { return n + m.protein2; }, 0);
      return out;
    });
  }

  S2.nutritionEngine = {
    ACTIVITY: ACTIVITY, GOALS: GOALS, PORTIONS: PORTIONS, STRUCTURE: STRUCTURE,
    isComplete: isComplete, bmr: bmr, targets: targets,
    portionFor: portionFor, recipeFit: recipeFit, dayPlans: dayPlans,
    weekPlan: weekPlan, weekTotals: weekTotals, forTwo: forTwo, portionForKcal: portionForKcal
  };
})();
