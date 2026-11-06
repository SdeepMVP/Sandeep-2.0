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

/* ---------- Objectif (SanEva) : besoins et recettes ---------- */
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
test('week plan: another week and another day change the suggestion, deterministically', function () {
  var t = N.targets(prof({ goal: 'cut' }));
  var a = N.weekPlan(RECIPES, t, { seed: 0 }), a2 = N.weekPlan(RECIPES, t, { seed: 0 }), b = N.weekPlan(RECIPES, t, { seed: 1 });
  function ids(w) { return w.map(function (d) { return d.meals.map(function (m) { return m.recipe.id; }).join(','); }).join('|'); }
  ok(ids(a) === ids(a2), 'not deterministic');
  ok(ids(a) !== ids(b), 'seed has no effect');
  var c = N.weekPlan(RECIPES, t, { seed: 0, picks: [0, 0, 1] });
  ok(c[2].pick === 1 && ids([a[0], a[1]]) === ids([c[0], c[1]]) && ids([a[2]]) !== ids([c[2]]), 'day 3 not changed alone');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
