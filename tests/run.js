#!/usr/bin/env node
/* Tests automatiques du moteur Wardrobe (sans dépendance : `node tests/run.js`).
   Lancés par GitHub Actions sur chaque pull request (.github/workflows/tests.yml). */
'use strict';
var path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'js', 'tabs', 'garde-robe-combos.js'));
require(path.join(__dirname, '..', 'js', 'tabs', 'garde-robe-engine.js'));
var E = window.S2.wardrobeEngine;

var passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + (e && e.message || e)); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

/* ---------- Données de test ---------- */
var seq = 0;
function P(cat, color, extra) {
  return E.complete(Object.assign({ id: 'p' + (seq++), name: color + ' ' + cat, cat: cat, color: color, warmth: cat === 'outer' ? 2 : 1,
    occasions: ['chill', 'work', 'formal', 'date', 'club', 'travel'], rainOk: false, laundry: false, lastWorn: null, worn: 0,
    formality: 'smart', pattern: 'solid', fit: 'regular', subtype: null, material: null }, extra || {}));
}
function base() {
  return { top: P('top', 'white', { fit: 'slim' }), bottom: P('bottom', 'navy', { fit: 'wide', warmth: 2 }), shoes: P('shoes', 'brown', { subtype: 'Derbies' }), layer: null, outer: null };
}
function ctx(t, occId, extra) { return Object.assign({ temp: t, cond: 'clear', occasion: E.occ(occId || 'weekend'), worn: {} }, extra || {}); }
function sc(o, t, occId, extra) { var r = E.score(o, ctx(t, occId, extra)); return r ? r.score : null; }

/* Penderie synthétique réaliste (105 pièces). */
function bigCloset(seed) {
  var cols = ['white', 'cream', 'beige', 'sand', 'khaki', 'grey', 'black', 'brown', 'navy', 'taupe', 'charcoal', 'denim', 'olive'];
  var tags = [['chill', 'date'], ['work', 'date'], ['chill', 'club'], ['work', 'formal'], ['chill', 'travel'], ['date', 'club']];
  var pats = ['solid', 'solid', 'solid', 'solid', 'stripes', 'check', 'houndstooth'];
  var mats = [null, 'Cotton', 'Wool', 'Knit', 'Leather', 'Linen', 'Fleece', 'Denim'];
  var fits = ['slim', 'regular', 'wide'], items = [], n = seed || 0;
  function add(c, count, extra) {
    for (var i = 0; i < count; i++, n++) items.push(E.complete(Object.assign({ id: 'i' + n, name: c + ' ' + n, cat: c, color: cols[n % cols.length], warmth: 1 + (n % 3),
      occasions: tags[n % tags.length], rainOk: n % 4 === 0, laundry: n % 9 === 0, lastWorn: null, worn: 0, formality: ['casual', 'smart', 'smart', 'formal'][n % 4],
      pattern: pats[n % pats.length], material: mats[n % mats.length], fit: fits[n % 3], subtype: null }, extra(i))));
  }
  add('top', 40, function (i) { return { warmth: 1, subtype: ['T-shirt', 'Shirt', 'Polo', 'Oxford shirt'][i % 4] }; });
  add('bottom', 20, function (i) { return { warmth: i % 5 === 0 ? 1 : 2, subtype: ['Jeans', 'Chinos', 'Trousers', 'Cargo pants', 'Shorts'][i % 5] }; });
  add('layer', 15, function (i) { return { warmth: 2, subtype: ['Sweater', 'Cardigan', 'Overshirt'][i % 3] }; });
  add('outer', 10, function (i) { return { warmth: 1 + (i % 3), subtype: ['Bomber', 'Coat', 'Leather jacket', 'Rain jacket'][i % 4], length: ['waist', 'long', 'cropped', 'hip'][i % 4] }; });
  add('shoes', 12, function (i) { return { warmth: 1, subtype: ['Sneakers', 'Boots', 'Derbies', 'Loafers'][i % 4], color: ['black', 'brown', 'white', 'navy'][i % 4] }; });
  add('acc', 8, function (i) { return { subtype: ['Cap', 'Beanie', 'Scarf', 'Watch', 'Necklace', 'Chain wallet', 'Tote bag', 'Crossbody bag'][i] }; });
  return items;
}
function smallCloset() {
  return bigCloset(3).filter(function (x, i) { return i % 4 === 0; });
}

console.log('\nStyle guidelines');
test('signature contrast (slim top, wide bottom) scores above slim/slim and wide/wide', function () {
  var ref = sc(base(), 18);
  var o = base(); o.bottom.fit = 'slim'; ok(sc(o, 18) !== null && sc(o, 18) < ref, 'slim/slim');
  o = base(); o.top.fit = 'wide'; ok(sc(o, 18) < ref, 'wide/wide');
});
test('tonal volume-on-volume is a creative pick', function () {
  var o = { top: P('top', 'black', { fit: 'wide' }), bottom: P('bottom', 'black', { fit: 'wide', warmth: 2 }), shoes: P('shoes', 'black', { subtype: 'Boots' }), layer: null, outer: null };
  var r = E.score(o, ctx(18));
  ok(/tonal/.test(r.why[0]) || r.why.some(function (w) { return /tonal/.test(w); }), 'tonal reason');
  ok(r.bends.length === 1, 'creative pick');
});
test('guidelines never exclude, except shorts for formal occasions', function () {
  var o = base(); ok(sc(o, 13) !== null, 'no layer at 13 °C');
  o = base(); o.layer = P('layer', 'grey', { warmth: 2 }); ok(sc(o, 27) !== null, 'layer at 27 °C');
  o = base(); o.bottom.warmth = 1; ok(E.score(o, ctx(25, 'wedding')) === null, 'formal shorts');
});
test('bright colours and logos rank lower', function () {
  var ref = sc(base(), 18), o = base(); o.top.color = 'red'; ok(sc(o, 18) < ref - 15, 'bright');
  o = base(); o.top.pattern = 'graphic'; ok(sc(o, 18) < ref, 'logo');
});
test('layering guidance: outerwear favoured below 14 °C, base only above 22 °C', function () {
  var o = base(), withOuter = base(); withOuter.outer = P('outer', 'navy', { length: 'waist' });
  ok(sc(withOuter, 10) > sc(o, 10), 'outer at 10 °C');
  ok(sc(withOuter, 26) < sc(o, 26), 'no outer at 26 °C');
});

console.log('\nSearch');
test('fast search finds an outfit as good as the exhaustive search (small closets)', function () {
  [5, 12, 18, 26].forEach(function (t) {
    ['weekend', 'office', 'datenight'].forEach(function (occId) {
      var items = smallCloset(), c = ctx(t, occId);
      var fast = E.candidates(items, c), full = E.candidates(items, c, { exhaustive: true });
      if (!full.length) return;
      ok(fast.length, 'no result at ' + t + ' °C ' + occId);
      ok(fast[0].score >= full[0].score - 6, 'best ' + fast[0].score + ' vs ' + full[0].score + ' at ' + t + ' °C ' + occId);
    });
  });
});
test('105-piece closet: suggestions in well under 300 ms', function () {
  var items = bigCloset(), c = ctx(9, 'weekend'), t0 = Date.now();
  var res = E.candidates(items, c);
  var ms = Date.now() - t0;
  ok(res.length > 5, 'results');
  ok(ms < 300, ms + ' ms');
  console.log('      (' + ms + ' ms for 105 pieces)');
});
test('pieces in the laundry are never suggested', function () {
  var items = bigCloset(), res = E.candidates(items, ctx(15, 'weekend'));
  res.slice(0, 20).forEach(function (r) { E.CORE.forEach(function (c) { ok(!(r.o[c.id] && r.o[c.id].laundry), 'laundry piece suggested'); }); });
});

console.log('\nLearning & rotation');
test('👍 boosts and 👎 buries an outfit', function () {
  var o = base(), prefs = {};
  var before = sc(o, 18, 'weekend', { prefs: prefs });
  E.learn(prefs, o, 1); var liked = sc(o, 18, 'weekend', { prefs: prefs });
  E.learn(prefs, o, -1); E.learn(prefs, o, -1); var disliked = sc(o, 18, 'weekend', { prefs: prefs });
  ok(liked > before, 'like'); ok(disliked < before - 40, 'dislike');
});
test('pieces worn in the last 3 days go down, favourites less so', function () {
  var o = base(), y = E.keyOf(new Date(Date.now() - 86400000));
  var fresh = sc(o, 18), worn = {}; worn[o.top.id] = y;
  var recent = sc(o, 18, 'weekend', { worn: worn });
  o.top.fav = true; var fav = sc(o, 18, 'weekend', { worn: worn });
  ok(recent < fresh - 30, 'recent'); ok(fav > recent, 'favourite');
});

console.log('\nData');
test('defaults by kind (jeans: wide, denim, 6 wears; leather jacket: never washed)', function () {
  var j = E.applyDefaults({}, 'Jeans'); ok(j.cat === 'bottom' && j.fit === 'wide' && j.material === 'Denim' && j.washEvery === 6, JSON.stringify(j));
  var l = E.applyDefaults({}, 'Leather jacket'); ok(l.cat === 'outer' && l.washEvery === 0 && l.length === 'waist', JSON.stringify(l));
});
test('migration completes old pieces without losing data', function () {
  var x = E.complete({ id: 'x', name: 'Wide black jeans', cat: 'bottom', color: 'black', warmth: 2, occasions: ['chill'] });
  ok(x.fit === 'wide' && x.subtype === 'Jeans' && x.washEvery === 6 && x.wearsSinceWash === 0 && x.fav === false, JSON.stringify(x));
});
test('accessories: at most 2, scarf first when cold', function () {
  var items = bigCloset(), c = ctx(5, 'weekend'), res = E.candidates(items, c);
  var acc = E.accessorySuggestions(items.map(function (x) { var y = Object.assign({}, x); y.laundry = false; return y; }), res[0].o, c, {});
  ok(acc.length <= 2 && acc.length > 0, 'count ' + acc.length);
  ok(acc[0].x.subtype === 'Scarf', 'first is ' + acc[0].x.subtype);
});

console.log('\nShopping');
function kit() {
  function it(id, color, kind) { return E.complete(E.applyDefaults({ id: id, name: color + ' ' + kind, color: color, laundry: false, lastWorn: null, worn: 0, pattern: 'solid' }, kind)); }
  return [it('k1', 'white', 'T-shirt'), it('k2', 'black', 'Jeans'), it('k3', 'black', 'Sneakers'), it('k4', 'grey', 'Sweater')];
}
test('suggests purchases with a positive impact, one colour per kind', function () {
  var res = E.shoppingSuggestions(kit());
  ok(res.length >= 4, 'count ' + res.length);
  ok(res[0].gain > 0 && res[0].unlocked > 0, 'impact');
  var kinds = res.map(function (r) { return r.piece.subtype + r.piece.pattern; });
  ok(kinds.length === new Set(kinds).size, 'duplicate kinds');
  res.forEach(function (r) { ok(r.piece.color !== 'white' || r.piece.cat !== 'outer', 'white jacket'); });
});
test('buying the top suggestion really improves the outfits', function () {
  var items = kit(), res = E.shoppingSuggestions(items), c = ctx(16, 'weekend');
  var before = E.candidates(items, c)[0].score;
  var bought = Object.assign({}, res[0].piece, { id: 'bought', virtual: false });
  var after = E.candidates(items.concat([bought]), c);
  ok(after[0].score > before, 'best ' + after[0].score + ' vs ' + before);
  ok(E.CORE.some(function (k) { return after[0].o[k.id] && after[0].o[k.id].id === 'bought'; }), 'bought piece not used');
});
test('detects occasions that need several pieces (office, formal)', function () {
  var gaps = E.contextGaps(E.planShopping(kit()));
  var office = gaps.filter(function (g) { return g.occasion.id === 'office'; })[0];
  ok(office && office.pieces.length === office.slots.length && office.slots.length > 0, JSON.stringify(gaps.map(function (g) { return g.label; })));
});
test('style essentials checklist recognises owned pieces', function () {
  var ess = E.essentials(kit()), have = ess.filter(function (x) { return x.have.length; }).map(function (x) { return x.e.id; });
  ok(have.indexOf('tee-white') > -1 && have.indexOf('wide-jeans') > -1 && have.indexOf('dark-sneakers') > -1, have.join());
  ok(have.indexOf('long-coat') < 0, 'long coat');
});
test('105-piece closet: full shopping analysis in under 2 s', function () {
  var t0 = Date.now(), res = E.shoppingSuggestions(bigCloset());
  var ms = Date.now() - t0;
  ok(ms < 2000, ms + ' ms');
  console.log('      (' + ms + ' ms, ' + res.length + ' suggestions)');
});

/* ---------- Objectif (Gym Food) : besoins et recettes ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'objectif-engine.js'));
require(path.join(__dirname, '..', 'js', 'tabs', 'cuisine-recipes.js'));
var N = window.S2.nutritionEngine, RECIPES = window.S2.cuisineRecipes;
console.log('\nNutrition');
function prof(extra) { return Object.assign({ sex: 'm', age: 30, height: 180, weight: 80, activity: 'moderate', goal: 'maintain', meals: 3 }, extra || {}); }
test('Mifflin-St Jeor base metabolism (man and woman)', function () {
  ok(N.bmr(prof()) === 1780, 'man ' + N.bmr(prof()));
  ok(Math.abs(N.bmr(prof({ sex: 'f', weight: 60, height: 165 })) - 1320.25) < 0.01, 'woman');
});
test('incomplete or implausible profile gives no targets', function () {
  ok(N.targets(prof({ height: null })) === null, 'no height');
  ok(N.targets(prof({ weight: 500 })) === null, 'weight 500');
  ok(N.targets(prof({ goal: 'x' })) === null, 'unknown goal');
});
test('goals order the calories: bulk > maintain > recomp > cut', function () {
  var k = {}; ['bulk', 'maintain', 'recomp', 'cut'].forEach(function (g) { k[g] = N.targets(prof({ goal: g })).kcal; });
  ok(k.bulk > k.maintain && k.maintain > k.recomp && k.recomp > k.cut, JSON.stringify(k));
  ok(N.targets(prof()).kcal === 2760, 'maintain ' + N.targets(prof()).kcal);
});
test('macros add up to the calories and protein follows bodyweight', function () {
  ['bulk', 'maintain', 'recomp', 'cut'].forEach(function (g) {
    var t = N.targets(prof({ goal: g }));
    var sum = t.protein * 4 + t.carbs * 4 + t.fat * 9;
    ok(Math.abs(sum - t.kcal) <= 6, g + ' ' + sum + ' vs ' + t.kcal);
    ok(t.protein === Math.round(80 * N.GOALS[g].protein), g + ' protein');
  });
});
test('calories never go below the safety floor', function () {
  var t = N.targets(prof({ sex: 'f', age: 60, height: 150, weight: 42, activity: 'sedentary', goal: 'cut' }));
  ok(t.kcal === 1200, 'floor ' + t.kcal);
});
test('values set by hand replace the calculation', function () {
  var t = N.targets(prof({ custom: { kcal: 2500, protein: 180 } }));
  ok(t.kcal === 2500 && t.protein === 180 && t.custom && t.auto.kcal === 2760, JSON.stringify(t));
  ok(N.targets(prof({ custom: { kcal: 50 } })).kcal === 2760, 'absurd value ignored');
});
test('recipe fit: lean protein recipe beats a light one for a cut', function () {
  var t = N.targets(prof({ goal: 'cut' }));
  var lean = N.recipeFit({ kcal: 500, protein: 55 }, t), poor = N.recipeFit({ kcal: 700, protein: 20 }, t);
  ok(lean.level === 'good' && poor.level === 'low' && lean.score < poor.score, JSON.stringify([lean, poor]));
  ok(N.recipeFit({ kcal: 0, protein: 10 }, t) === null, 'no kcal');
});
test('suggested portion brings a recipe close to one meal', function () {
  var bulk = N.targets(prof({ goal: 'bulk', weight: 90, activity: 'high' }));
  ok(N.portionFor({ kcal: 450 }, bulk) === 2, 'bulk 450 kcal → ' + N.portionFor({ kcal: 450 }, bulk));
  var small = N.targets(prof({ sex: 'f', weight: 55, height: 160, goal: 'cut', activity: 'light' }));
  ok(N.portionFor({ kcal: 900 }, small) === 0.5, 'cut 900 kcal → ' + N.portionFor({ kcal: 900 }, small));
});
test('day plans from the built-in recipes land near the targets', function () {
  [prof({ goal: 'bulk' }), prof({ sex: 'f', weight: 58, height: 165, goal: 'cut', meals: 4 }), prof({ goal: 'recomp', meals: 5 })].forEach(function (p) {
    var t = N.targets(p), t0 = Date.now(), plans = N.dayPlans(RECIPES, t, 6), ms = Date.now() - t0;
    ok(plans.length >= 3, 'plans ' + plans.length);
    var best = plans[0];
    ok(best.meals.length === t.meals, 'meals');
    ok(Math.abs(best.kcal - t.kcal) / t.kcal < 0.12, p.goal + ' kcal ' + best.kcal + ' vs ' + t.kcal);
    ok(best.protein >= 0.85 * t.protein, p.goal + ' protein ' + best.protein + ' vs ' + t.protein);
    ok(ms < 300, ms + ' ms');
    var ids = best.meals.map(function (m) { return m.recipe.id; });
    ok(ids.length === new Set(ids).size, 'same recipe twice');
  });
});
test('week plan: 7 varied days near the targets, quickly', function () {
  [prof({ goal: 'bulk' }), prof({ sex: 'f', weight: 58, height: 165, goal: 'cut', meals: 4 }), prof({ goal: 'recomp', meals: 5 })].forEach(function (p) {
    var t = N.targets(p), t0 = Date.now(), week = N.weekPlan(RECIPES, t), ms = Date.now() - t0;
    ok(week.length === 7, 'days ' + week.length);
    ok(ms < 300, p.goal + ' ' + ms + ' ms');
    week.forEach(function (d, i) {
      ok(Math.abs(d.kcal - t.kcal) / t.kcal < 0.15, p.goal + ' day ' + i + ' kcal ' + d.kcal + ' vs ' + t.kcal);
      ok(d.protein >= 0.8 * t.protein, p.goal + ' day ' + i + ' protein ' + d.protein);
    });
    var tot = N.weekTotals(week);
    ok(tot.length >= 10, p.goal + ' only ' + tot.length + ' different recipes');
    tot.forEach(function (x) { ok(x.days.length <= 4, x.recipe.id + ' on ' + x.days.length + ' days'); });
    var meals = week.reduce(function (n, d) { return n + d.meals.length; }, 0);
    var portions = tot.reduce(function (n, x) { return n + x.portions; }, 0);
    ok(Math.abs(portions - week.reduce(function (n, d) { return n + d.meals.reduce(function (a, m) { return a + m.portion; }, 0); }, 0)) < 1e-9 && meals === 7 * t.meals, 'totals');
  });
});
test('week plan: batch cooking uses far fewer recipes, each at most 3 days', function () {
  [prof({ goal: 'bulk' }), prof({ sex: 'f', weight: 58, height: 165, goal: 'cut', meals: 4 })].forEach(function (p) {
    var t = N.targets(p);
    var varied = N.weekTotals(N.weekPlan(RECIPES, t)), week = N.weekPlan(RECIPES, t, { batch: true }), batch = N.weekTotals(week);
    ok(batch.length <= varied.length * 0.6, p.goal + ' batch ' + batch.length + ' vs varied ' + varied.length);
    batch.forEach(function (x) { ok(x.days.length <= 3, x.recipe.id + ' on ' + x.days.length + ' days'); });
    week.forEach(function (d, i) { ok(Math.abs(d.kcal - t.kcal) / t.kcal < 0.15 && d.protein >= 0.8 * t.protein, p.goal + ' day ' + i); });
  });
});
test('3- and 4-day plans; the next period avoids the recipes of the previous one', function () {
  var t = N.targets(prof({ goal: 'recomp' }));
  var a = N.weekPlan(RECIPES, t, { days: 3, seed: 5 }), b = N.weekPlan(RECIPES, t, { days: 4, seed: 6 });
  ok(a.length === 3 && b.length === 4, 'lengths');
  var avoid = {}; N.weekTotals(a).forEach(function (x) { avoid[x.recipe.id] = true; });
  var c = N.weekPlan(RECIPES, t, { days: 4, seed: 6, avoid: avoid });
  function overlap(w) { return N.weekTotals(w).filter(function (x) { return avoid[x.recipe.id]; }).length; }
  ok(overlap(c) < overlap(b) || overlap(c) === 0, 'overlap ' + overlap(c) + ' vs ' + overlap(b));
  c.forEach(function (d, i) { ok(Math.abs(d.kcal - t.kcal) / t.kcal < 0.15, 'day ' + i + ' ' + d.kcal); });
});
test('cooking for two: second person gets portions matching their own calories', function () {
  var t1 = N.targets(prof({ goal: 'bulk' })), t2 = N.targets(prof({ sex: 'f', weight: 58, height: 165, age: 27, goal: 'cut' }));
  var week = N.weekPlan(RECIPES, t1, { days: 3 }), two = N.forTwo(week, t2);
  ok(two.length === 3 && week[0].meals[0].portion2 === undefined, 'original untouched');
  two.forEach(function (d, i) {
    ok(Math.abs(d.kcal2 - t2.kcal) / t2.kcal < 0.08, 'day ' + i + ' partner ' + d.kcal2 + ' vs ' + t2.kcal);
    ok(d.kcal === week[i].kcal, 'first person unchanged');
  });
  var one = N.weekTotals(week).reduce(function (n, x) { return n + x.portions; }, 0);
  var both = N.weekTotals(two).reduce(function (n, x) { return n + x.portions; }, 0);
  var p2 = two.reduce(function (n, d) { return n + d.meals.reduce(function (a, m) { return a + m.portion2; }, 0); }, 0);
  ok(Math.abs(both - one - p2) < 1e-9, 'totals include both people');
  ok(N.forTwo(week, null) === week, 'no partner');
});
test('week plan: another week and another day change the suggestion, deterministically', function () {
  var t = N.targets(prof({ goal: 'cut' }));
  var a = N.weekPlan(RECIPES, t, { seed: 0 }), a2 = N.weekPlan(RECIPES, t, { seed: 0 }), b = N.weekPlan(RECIPES, t, { seed: 1 });
  function ids(w) { return w.map(function (d) { return d.meals.map(function (m) { return m.recipe.id; }).join(','); }).join('|'); }
  ok(ids(a) === ids(a2), 'not deterministic');
  ok(ids(a) !== ids(b), 'seed has no effect');
  var c = N.weekPlan(RECIPES, t, { seed: 0, picks: [0, 0, 1] });
  ok(c[2].pick === 1 && ids([a[0], a[1]]) === ids([c[0], c[1]]) && ids([a[2]]) !== ids([c[2]]), 'day 3 not changed alone');
});

/* ---------- Cuisine (Gym Food) : prix du panier ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'cuisine-prices.js'));
var PR = window.S2.cuisinePrices;
console.log('\nGrocery prices');
/* Même analyse de ligne que cuisine.js (parseLine + nameKey). */
function pNorm(s) { return String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function pLine(line) {
  var m = String(line).match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*)(.*)$/);
  if (!m) return { qty: null, unit: '', name: line };
  var q = m[1].indexOf('/') > -1 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'));
  var rest = m[3], unit = '', u = rest.match(/^(kg|g|mg|ml|cl|dl|l|tbsp|tsp|c\. à soupe|c\. à café)(\s+|$)/i);
  if (u) { unit = u[0]; rest = rest.slice(u[0].length); }
  var l = rest.match(/^(de |d’|d'|of )/i); if (l) rest = rest.slice(l[0].length);
  return { qty: q, unit: pNorm(unit).trim(), name: rest };
}
function pKey(n) { return pNorm(String(n).replace(/\([^)]*\)/g, ' ')).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).map(function (w) { return w.length > 3 ? w.replace(/(s|x)$/, '') : w; }).join(' '); }
function itemsOf(recipe, factor) { return recipe.ingredients.map(function (line) { var p = pLine(line); return { key: pKey(p.name), unit: p.unit, qty: p.qty === null ? null : p.qty * (factor || 1) }; }); }
test('every built-in ingredient has a price (or is seasoning)', function () {
  var missing = [];
  RECIPES.forEach(function (r) { itemsOf(r).forEach(function (it) { if (!PR.estimate(it.key, it.unit, it.qty).known) missing.push(it.key); }); });
  ok(!missing.length, missing.join(', '));
});
test('whole packs are bought: 3 eggs → a box of 6, 7 eggs → 2 boxes', function () {
  ok(PR.estimate('oeuf', '', 3).price === 1.98, '3 eggs ' + PR.estimate('oeuf', '', 3).price);
  ok(PR.estimate('oeuf', '', 7).price === 3.96, '7 eggs');
  var chicken = PR.estimate('blanc de poulet', 'g', 240);
  ok(chicken.price === 6 && chicken.used === 2.88, JSON.stringify(chicken));
});
test('pantry items are pro rata and outside the basket; own prices replace the average', function () {
  var b = PR.basket([{ key: 'huile d olive', unit: 'c. a soupe', qty: 1 }, { key: 'oeuf', unit: '', qty: 2 }]);
  ok(b.basket === 1.98 && b.pantry === 0.15, JSON.stringify(b));
  ok(PR.estimate('oeuf', '', 6, 0.5).price === 3, 'own price');
  ok(PR.estimate('produit inconnu', 'g', 100).known === false && PR.estimate('produit inconnu', 'g', 100, 10).price === 1, 'unknown + own');
  var done = PR.basket([{ key: 'oeuf', unit: '', qty: 6, done: true }, { key: 'skyr', unit: 'g', qty: 450 }]);
  ok(done.left === 2.03 && done.basket === 4.01, JSON.stringify(done));
});
test('a weekly basket for one person costs a plausible amount', function () {
  var t = N.targets(prof({ goal: 'bulk' }));
  [false, true].forEach(function (batch) {
    var items = [];
    N.weekTotals(N.weekPlan(RECIPES, t, { batch: batch })).forEach(function (x) {
      items = items.concat(itemsOf(x.recipe, Math.ceil(x.portions) / (x.recipe.servings || 1)));
    });
    /* Additionne comme la liste de courses (même nom, même unité). */
    var g = {};
    items.forEach(function (it) { var k = it.unit + '|' + it.key; if (!g[k]) g[k] = { key: it.key, unit: it.unit, qty: it.qty === null ? null : 0 }; if (it.qty !== null && g[k].qty !== null) g[k].qty += it.qty; });
    var b = PR.basket(Object.keys(g).map(function (k) { return g[k]; }));
    ok(b.basket > 60 && b.basket < 260 && b.unknown === 0, (batch ? 'batch ' : 'varied ') + JSON.stringify(b));
    console.log('      (' + (batch ? 'batch' : 'varied') + ' week, bulk 3000 kcal: ≈ ' + Math.round(b.basket) + ' € + ' + Math.round(b.pantry) + ' € pantry)');
  });
});

/* ---------- Table nutritionnelle des ingrédients ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'cuisine-nutrition.js'));
var NT = window.S2.nutritionTable;
console.log('\nNutrition table');
test('every built-in ingredient has nutrition values (or is seasoning)', function () {
  var missing = [];
  RECIPES.forEach(function (r) { missing = missing.concat(NT.recipe(r).unknown); });
  ok(!missing.length, missing.join(' | '));
});
test('calculated values match the checked ones: calories ±15 %, protein ±20 % for every recipe', function () {
  RECIPES.forEach(function (r) {
    var c = NT.recipe(r);
    ok(Math.abs(c.kcal - r.kcal) / r.kcal <= 0.15, r.id + ' kcal ' + c.kcal + ' vs ' + r.kcal);
    ok(Math.abs(c.protein - r.protein) / r.protein <= 0.2, r.id + ' protein ' + c.protein + ' vs ' + r.protein);
  });
});
test('macros add up to the stored calories; weights in brackets are used', function () {
  RECIPES.forEach(function (r) {
    var m = NT.macros(r), sum = m.protein * 4 + m.carbs * 4 + m.fat * 9;
    ok(Math.abs(sum - r.kcal) / r.kcal < 0.04, r.id + ' ' + sum + ' vs ' + r.kcal);
  });
  var a = NT.recipe({ ingredients: ['2 escalopes de dinde (environ 180 g)'], servings: 1 }), b = NT.recipe({ ingredients: ['2 escalopes de dinde'], servings: 1 });
  ok(a.protein === 43 && b.protein === 72, a.protein + ' / ' + b.protein);
});
test('everyday foods for the journal are consistent (kcal ≈ P×4 + C×4 + F×9)', function () {
  ok(NT.FOODS.length >= 40, 'count');
  NT.FOODS.forEach(function (f) {
    var sum = f.protein * 4 + f.carbs * 4 + f.fat * 9;
    ok(f.kcal < 20 || Math.abs(sum - f.kcal) / f.kcal < 0.2 || /beer|wine/.test(f.id), f.id + ' ' + sum + ' vs ' + f.kcal);
  });
});

/* ---------- Aujourd'hui : journal, bilan, tendance du poids ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'aujourdhui-engine.js'));
var TE = window.S2.todayEngine;
console.log('\nToday & review');
test('day totals and target check', function () {
  var tot = TE.totals([{ kcal: 500, protein: 40, carbs: 50, fat: 10 }, { kcal: 1300.4, protein: 80.2, carbs: 120, fat: 50 }]);
  ok(tot.kcal === 1800 && tot.protein === 120, JSON.stringify(tot));
  var t = { kcal: 2000, protein: 140 };
  ok(TE.inTarget(tot, t).kcal && !TE.inTarget(tot, t).protein, 'in target');
  ok(TE.inTarget({ kcal: 2150, protein: 130 }, t).both && !TE.inTarget({ kcal: 2300, protein: 150 }, t).kcal, 'both');
});
test('weekly nutrition summary ignores days without entries', function () {
  var t = { kcal: 2000, protein: 130 };
  var s = TE.nutritionSummary([{ entries: [{ kcal: 2000, protein: 140 }] }, { entries: [] }, { entries: [{ kcal: 1500, protein: 90 }] }], t);
  ok(s.logged === 2 && s.kcal === 1750 && s.inTarget === 1, JSON.stringify(s));
});
function weighIns(start, perWeek, n, every) {
  var out = []; for (var i = 0; i < n; i++) out.push({ date: new Date(2026, 9, 1 + i * every).toISOString(), kg: Math.round((start + perWeek / 7 * i * every) * 10) / 10 });
  return out;
}
test('weight trend: kg and % per week; needs 3 weigh-ins over 10+ days', function () {
  var w = weighIns(80, -0.6, 8, 3), now = new Date(2026, 9, 22);
  var tr = TE.weightTrend(w, now, 28);
  ok(tr && Math.abs(tr.perWeek + 0.6) < 0.08 && tr.pct < -0.6 && tr.pct > -0.9, JSON.stringify(tr));
  ok(TE.weightTrend(w.slice(0, 2), now) === null, 'two weigh-ins');
  ok(TE.weightTrend(weighIns(80, 0, 4, 2), new Date(2026, 9, 8)) === null, 'only 6 days');
});
test('suggestion follows the goal and asks for tracking first', function () {
  var good = { days: 14, logged: 12, kcalOk: 10 };
  var flat = { perWeek: 0, pct: 0 }, losing = { perWeek: -0.8, pct: -1 }, gaining = { perWeek: 0.8, pct: 1 };
  ok(TE.suggestion('bulk', flat, good, 3000).kind === 'up' && TE.suggestion('bulk', flat, good, 3000).newKcal === 3150, 'bulk flat → up');
  ok(TE.suggestion('cut', flat, good, 1800).kind === 'down', 'cut flat → down');
  ok(TE.suggestion('cut', { pct: -1.5 }, good, 1800).kind === 'up', 'cut too fast → up');
  ok(TE.suggestion('cut', losing, good, 1800).kind === 'keep', 'cut on track');
  ok(TE.suggestion('maintain', gaining, good, 2500).kind === 'down', 'maintain gaining → down');
  ok(TE.suggestion('bulk', null, good, 3000).kind === 'wait', 'no trend');
  ok(TE.suggestion('bulk', flat, { days: 14, logged: 3, kcalOk: 3 }, 3000).kind === 'log', 'not enough tracking');
});

/* ---------- Table Ciqual (journal) ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'ciqual-data.js'));
var CQ = window.S2.ciqual;
console.log('\nCiqual foods');
test('about 1,000 Ciqual foods with valid values and a typical serving', function () {
  ok(CQ.foods.length >= 950 && CQ.foods.length <= 1100, 'count ' + CQ.foods.length);
  var ids = {};
  CQ.foods.forEach(function (r) {
    ok(!ids[r[0]], 'duplicate ' + r[0]); ids[r[0]] = true;
    ok(typeof r[1] === 'string' && r[1].length > 2 && CQ.groups[r[2]], 'name/group ' + r[0]);
    [3, 4, 5, 6].forEach(function (i) { ok(isFinite(r[i]) && r[i] >= 0 && r[i] <= 900, r[1] + ' value ' + i); });
    ok(r[7] > 0 && r[7] <= 400, r[1] + ' serving ' + r[7]);
  });
  /* Calories cohérentes avec les macros pour la grande majorité (alcool et fibres expliquent les écarts restants). */
  var off = CQ.foods.filter(function (r) { var s = r[4] * 4 + r[5] * 4 + r[6] * 9; return r[3] > 40 && Math.abs(s - r[3]) / r[3] > 0.2; });
  ok(off.length < CQ.foods.length * 0.05, off.length + ' inconsistent: ' + off.slice(0, 5).map(function (r) { return r[1]; }).join(' | '));
});
test('search finds everyday foods first (eggs, cooked rice, cola, chicken…), quickly', function () {
  var items = NT.FOODS.map(function (f) { return { name: f.name, curated: true }; }).concat(CQ.foods.map(function (r) { return { name: r[1] }; }));
  function first(q) { var r = TE.searchFoods(items, q, 5); return r.length ? r[0].name : ''; }
  var t0 = Date.now();
  ok(/^(Œuf|Oeuf)/.test(first('oeuf')), first('oeuf'));
  ok(/^Riz.*cuit/i.test(first('riz cuit')), first('riz cuit'));
  ok(/^Cola/.test(first('coca')), first('coca'));
  ok(/^Pâte à tartiner/.test(first('nutella')), first('nutella'));
  ok(/^Poulet/.test(first('poulet')) && !/cru$/.test(first('poulet')), first('poulet'));
  ok(/^Banane/.test(first('bananes')), first('bananes'));
  ok(TE.searchFoods(items, 'xyzabc', 5).length === 0, 'nonsense');
  ok(TE.searchFoods(items, 'fromage blanc', 5).every(function (x) { return /fromage blanc/i.test(x.name); }), 'all words required');
  ok(Date.now() - t0 < 300, (Date.now() - t0) + ' ms');
});

/* ---------- Courses à 2 : échange de listes par message ---------- */
require(path.join(__dirname, '..', 'js', 'tabs', 'cuisine-share.js'));
var SHR = window.S2.cuisineShare;
console.log('\nGroceries for two');
function grp(key, qty, unit, name, aisle) { return { key: key, qty: qty, first: { qty: qty, unit: unit, link: unit ? 'de ' : '', name: name }, aisle: aisle || 'meat', recipes: ['R'] }; }
test('a groceries message round-trips (accents included) and stays readable', function () {
  var items = [grp('g|blanc de poulet', 240, 'g', 'blanc de poulet'), grp('#|oeuf', 3, '', 'œufs', 'dairy'), grp('x|sel poivre', null, '', 'Sel & poivre', 'grocery')];
  var msg = SHR.message(SHR.pack('Maëva', items), 'Courses de Maëva', items.map(function (g) { return g.name || g.first.name; }));
  ok(/• blanc de poulet/.test(msg) && msg.indexOf('SANEVA1:') > 0, 'readable + tag');
  var back = SHR.read('Message reçu :\n' + msg + '\n— envoyé de mon iPhone');
  ok(back && back.from === 'Maëva' && back.items.length === 3, JSON.stringify(back));
  ok(back.items[1].first.name === 'œufs' && back.items[0].qty === 240 && back.items[2].qty === null, 'values');
});
test('invalid or tampered messages are refused', function () {
  ok(SHR.read('Courses : poulet, riz') === null, 'plain text');
  ok(SHR.read('SANEVA1:!!!') === null, 'garbage');
  ok(SHR.read('SANEVA1:' + btoa('{"v":2,"items":[]}')) === null, 'wrong version');
  ok(SHR.read('SANEVA1:' + btoa('{"v":1,"items":[{"k":5}]}')) === null, 'bad item');
});
test('received groceries merge with mine: same ingredient added up, who it is for', function () {
  var mine = [grp('g|blanc de poulet', 240, 'g', 'blanc de poulet'), grp('g|riz', 150, 'g', 'riz', 'grocery')];
  var theirs = SHR.read(SHR.message(SHR.pack('Maeva', [grp('g|blanc de poulet', 300, 'g', 'blanc de poulet'), grp('g|skyr', 450, 'g', 'skyr', 'dairy')]), 't', []));
  var all = SHR.merge(mine, [theirs], 'Sandeep');
  var chicken = all.filter(function (g) { return g.key === 'g|blanc de poulet'; })[0];
  ok(all.length === 3 && chicken.qty === 540 && chicken.people.join() === 'Sandeep,Maeva', JSON.stringify(chicken));
  var skyr = all.filter(function (g) { return g.key === 'g|skyr'; })[0];
  ok(skyr.people.join() === 'Maeva' && skyr.aisle === 'dairy', 'new item');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
