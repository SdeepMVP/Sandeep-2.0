/* Table nutritionnelle (valeurs moyennes pour 100 g ou 100 ml, aliments crus / secs sauf mention) et petite base
   d'aliments du quotidien pour le journal. Module PUR (ni DOM ni stockage, testable sous Node), rien n'est récupéré en ligne.
   - ingredient(key, unit, qty) : kcal, protéines, glucides, lipides d'une ligne d'ingrédient (clé = nameKey de cuisine.js)
   - recipe(r) : valeurs par portion calculées à partir des ingrédients (parse + key inclus ici, mêmes règles que cuisine.js)
   - FOODS : aliments courants avec une portion type, pour le journal de l'onglet Aujourd'hui
   Règle = [motif (début de la clé), [kcal, P, G, L] pour 100 g, options] ; w = grammes par pièce, spoon = [g c. à soupe, g c. à café].
   Le premier motif qui correspond gagne (cas particuliers d'abord). */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  var NONE = null;
  var RULES = [
    [/^(glacon|eau|ice|water|sel|poivre|salt)\b/, NONE],
    [/^levure|^baking powder/, NONE],

    /* Viandes & poissons */
    [/^haut de cuisse/, [120, 19.5, 0, 4.5], { w: 150 }],
    [/^(blanc de poulet|filet de poulet|escalope de poulet|poulet|chicken)/, [110, 23, 0, 1.5], { w: 150 }],
    [/^(dinde hachee|poulet hache)/, [140, 19.5, 0, 6.5]],
    [/^escalope de dinde/, [105, 24, 0, 1], { w: 150 }],
    [/^tranche de blanc de dinde/, [105, 20, 1.5, 2], { w: 30 }],
    [/^(tranche de )?jambon|^ham/, [115, 20, 1, 3.5], { w: 40 }],
    [/^boeuf hache|^steak hache|^beef mince/, [125, 21, 0, 5]],
    [/^(steak|rumsteck|bavette|boeuf|beef)/, [130, 22, 0, 4.5], { w: 150 }],
    [/^(filet mignon|porc|pork)/, [120, 21, 0, 4], { w: 400 }],
    [/^saumon fume|^smoked salmon/, [180, 22, 0, 10], { w: 30 }],
    [/^(pave de saumon|saumon|salmon)/, [200, 20, 0, 13], { w: 150 }],
    [/^(boite de thon|thon|tuna)/, [115, 26, 0, 1], { w: 110 }],
    [/^(crevette|shrimp|prawn)/, [95, 21, 0, 1]],
    [/^(dos de cabillaud|cabillaud|cod)/, [80, 18, 0, 0.7], { w: 150 }],

    /* Crèmerie & œufs */
    [/^(oeuf|egg)/, [140, 12.5, 0.5, 10], { w: 55 }],
    [/^skyr/, [62, 10.5, 4, 0.2]],
    [/^(yaourt grec|greek yog)/, [57, 10, 4, 0.2]],
    [/^(yaourt|yogh?urt)/, [60, 4.5, 5.5, 2]],
    [/^fromage blanc/, [55, 7.5, 4, 1]],
    [/^cottage/, [98, 11, 3.4, 4.3]],
    [/^(fromage frai|cream cheese)/, [200, 7, 4, 17], { spoon: [20, 7] }],
    [/^boule de mozzarella/, [165, 18, 1.5, 10], { w: 125 }],
    [/^mozzarella/, [230, 18, 1, 17]],
    [/^tranche de cheddar/, [400, 25, 0.5, 33], { w: 20 }],
    [/^cheddar/, [400, 25, 0.5, 33]],
    [/^parmesan/, [400, 33, 0, 29]],
    [/^feta/, [265, 14, 1, 22]],
    [/^ricotta/, [140, 10, 3.5, 10]],
    [/^(fromage rape|emmental)/, [380, 28, 0, 30]],
    [/^(creme|cream)/, [150, 2.8, 4, 14]],
    [/^lait de coco allege/, [75, 0.8, 2.5, 7]],
    [/^(lait de coco|coconut milk)/, [180, 1.6, 3, 18]],
    [/^(lait|milk)/, [46, 3.3, 4.8, 1.6]],
    [/^(beurre de cacahuete|peanut butter)/, [600, 25, 15, 50], { spoon: [15, 5] }],
    [/^(beurre|butter)/, [740, 0.7, 0.6, 82], { spoon: [12, 4] }],

    /* Boulangerie */
    [/^grande tranche de pain/, [250, 9, 43, 3.5], { w: 45 }],
    [/^(tranche de pain|pain complet|slice)/, [250, 9, 43, 3.5], { w: 35 }],
    [/^tranche de brioche/, [360, 8, 52, 13], { w: 30 }],
    [/^(grande )?tortilla/, [300, 8, 50, 7], { w: 60 }],
    [/^(pain a burger|burger bun|bun)/, [270, 9, 48, 5], { w: 60 }],
    [/^bagel/, [260, 10, 50, 1.5], { w: 90 }],
    [/^feuille de lasagne/, [355, 12.5, 72, 1.5], { w: 18 }],
    [/^(pain pita|pita)/, [275, 9, 55, 1.2], { w: 65 }],

    /* Fruits & légumes */
    [/^(avocat|avocado)/, [160, 2, 2, 15], { w: 140 }],
    [/^(banane|banana)/, [90, 1.1, 20, 0.3], { w: 120 }],
    [/^(petite )?pomme de terre|^potato/, [77, 2, 17, 0.1], { w: 150 }],
    [/^(patate douce|sweet potato)/, [86, 1.6, 20, 0.1], { w: 250 }],
    [/^(pomme|apple)/, [52, 0.3, 12, 0.2], { w: 150 }],
    [/^(citron|lemon|lime)/, [29, 1, 9, 0.3], { w: 60 }],
    [/^(concombre|cucumber)/, [15, 0.7, 3, 0.1], { w: 300 }],
    [/^poignee de tomate cerise/, [18, 0.9, 3.9, 0.2], { w: 80 }],
    [/^(tomate concassee|boite de tomate|chopped tomato|couli|passata)/, [25, 1.2, 4, 0.2], { spoon: [15, 5] }],
    [/^(tomate cerise|cherry tomato)/, [18, 0.9, 3.9, 0.2], { w: 15 }],
    [/^(tomate|tomato)/, [18, 0.9, 3.9, 0.2], { w: 120 }],
    [/^(poivron|pepper)/, [30, 1, 6, 0.3], { w: 150 }],
    [/^(cebette|spring onion)/, [30, 1.8, 7, 0.2], { w: 15 }],
    [/^(oignon|onion|red onion)/, [40, 1.1, 9, 0.1], { w: 110 }],
    [/^(echalote|shallot)/, [72, 2.5, 17, 0.1], { w: 30 }],
    [/^((petite )?gousse d ail|garlic)/, [140, 6, 30, 0.5], { w: 5 }],
    [/^(carotte|carrot)/, [41, 0.9, 10, 0.2], { w: 80 }],
    [/^courgette/, [17, 1.2, 3.1, 0.3], { w: 200 }],
    [/^(champignon|mushroom)/, [22, 3, 3.3, 0.3], { w: 20 }],
    [/^(brocoli|broccoli)/, [34, 2.8, 7, 0.4]],
    [/^(haricot vert|green bean)/, [31, 1.8, 7, 0.2]],
    [/^coeur de romaine/, [17, 1.2, 3.3, 0.3], { w: 150 }],
    [/^(poignee d|handful)/, [23, 2.9, 3.6, 0.4], { w: 30 }],
    [/^(quelque feuille de )?(salade|roquette|epinard|lettuce|rocket|spinach)/, [20, 2, 3, 0.3], { w: 30 }],
    [/^(ciboulette|persil|basilic|aneth|coriandre|chive|parsley|basil|dill|coriander)/, [30, 3, 4, 0.5], { w: 5, spoon: [3, 1] }],
    [/^(gingembre|ginger)/, [80, 1.8, 18, 0.8], { w: 5 }],
    [/^(fraise|fruit rouge|strawberr|berr)/, [40, 0.8, 8, 0.4]],
    [/^edamame/, [120, 11, 9, 5]],
    [/^(petit poi|pea)/, [80, 5, 14, 0.4]],
    [/^(legume a wok|stir fry veg)/, [35, 2, 6, 0.3]],
    [/^(pousse de soja|bean sprout)/, [30, 3, 6, 0.2]],
    [/^(mai\b|mais\b|sweetcorn|corn)/, [80, 2.7, 15, 1.2]],

    /* Épicerie */
    [/^(riz cuit|cooked rice)/, [150, 3, 32, 1.5]],
    [/^(riz|rice)/, [355, 7, 79, 0.6]],
    [/^quinoa/, [370, 14, 64, 6]],
    [/^(pate|spaghetti|penne|tagliatelle|pasta)/, [355, 13, 71, 1.5]],
    [/^(semoule|couscou)/, [360, 12.5, 73, 1]],
    [/^gnocchi/, [150, 4, 32, 0.4]],
    [/^nouille de riz|^rice noodle/, [360, 6, 80, 0.6]],
    [/^(nouille|noodle)/, [360, 10, 74, 2]],
    [/^(flocon d avoine|oat)/, [370, 13, 60, 7]],
    [/^granola/, [450, 9, 64, 16]],
    [/^lentille cuite/, [115, 9, 17, 0.4]],
    [/^(lentille|lentil)/, [350, 24, 55, 1.5]],
    [/^(boite de haricot|haricot rouge|haricot noir|kidney|black bean)/, [115, 8, 16, 0.5], { w: 250 }],
    [/^(boite de poi chiche|poi chiche|chickpea)/, [120, 7, 16, 2.5], { w: 265 }],
    [/^tofu/, [140, 14, 2, 8.5]],
    [/^pesto/, [450, 5, 6, 45]],
    [/^(chapelure|breadcrumb)/, [380, 13, 72, 4]],
    [/^(cacahuete|peanut)/, [590, 26, 13, 49]],
    [/^(noisette|cerneau de noi|noix|nut|walnut|hazelnut)/, [650, 15, 10, 62]],
    [/^(pepite de chocolat|quelque pepite|quelque carre de chocolat|chocolat|chocolate)/, [540, 6, 50, 33], { w: 5 }],
    [/^(salsa|sauce piquante|hot sauce)/, [30, 1, 6, 0.2], { w: 30 }],

    /* Placard */
    [/^(filet d )?huile|^(olive |sesame )?oil/, [900, 0, 0, 100], { w: 5, spoon: [10, 4] }],
    [/^(whey|protein powder)/, [380, 78, 8, 5]],
    [/^(cacao|cocoa)/, [230, 20, 55, 14], { spoon: [7, 3] }],
    [/^(miel|honey|sirop|syrup|sucre|sugar)/, [320, 0.4, 80, 0], { w: 7, spoon: [21, 7] }],
    [/^(sauce soja|soy sauce)/, [60, 8, 5, 0.5]],
    [/^(sauce d huitre|oyster sauce)/, [50, 1.3, 11, 0.2]],
    [/^(vinaigre|vinegar)/, [20, 0, 1, 0]],
    [/^(moutarde|mustard)/, [150, 7, 6, 11], { spoon: [15, 5] }],
    [/^(cornichon|gherkin)/, [15, 0.6, 2, 0.2], { w: 10 }],
    [/^(farine|flour)/, [360, 10, 75, 1.2], { spoon: [10, 3] }],
    [/^(fecule|maizena|cornflour)/, [360, 0.3, 88, 0.1], { spoon: [8, 3] }],
    [/^(bouillon|stock)/, [5, 0.5, 0.5, 0.2]],
    [/^(curry|paprika|cumin|epice|pincee|origan|herbe|cannelle|graine de sesame|sesame|ras el hanout|thym|spice|oregano|cinnamon|thyme)/, [300, 12, 50, 10], { w: 1, spoon: [6, 2] }]
  ];

  /* ---------- Analyse d'une ligne (mêmes règles que cuisine.js) ---------- */
  function norm(s) { return String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var UNIT_RE = /^(kg|g|mg|ml|cl|dl|l|tbsp|tsp|c\. à soupe|c\. à café)(\s+|$)/i;
  function parse(line) {
    var m = String(line).match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*)(.*)$/);
    if (!m) return { qty: null, unit: '', name: String(line) };
    var q = m[1].indexOf('/') > -1 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'));
    var rest = m[3], unit = '', u = rest.match(UNIT_RE);
    if (u) { unit = u[0]; rest = rest.slice(u[0].length); }
    var l = rest.match(/^(de |d’|d'|of )/i); if (l) rest = rest.slice(l[0].length);
    /* « 2 escalopes de dinde (environ 180 g) » : poids total indiqué entre parenthèses pour des pièces. */
    var hint = !unit && String(line).match(/\((?:environ |about |~ ?)?(\d+)\s?g\b/i);
    return { qty: q, unit: norm(unit).trim(), name: rest, grams: hint ? Number(hint[1]) : null };
  }
  function key(name) {
    return norm(String(name).replace(/\([^)]*\)/g, ' ')).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
      .map(function (w) { return w.length > 3 ? w.replace(/(s|x)$/, '') : w; }).join(' ');
  }

  function rule(k) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(k)) return { v: RULES[i][1], o: RULES[i][2] || {} };
    return null;
  }

  /* Grammes d'une ligne. qty null (« Parmesan », « Salade ») : une petite garniture (une demi-pièce ou 15 g). */
  function grams(r, unit, qty) {
    var o = r.o, u = String(unit || '').toLowerCase();
    if (qty === null || qty === undefined) return o.w ? Math.min(o.w * 0.5, 40) : 15;
    if (u === 'g') return qty;
    if (u === 'kg') return qty * 1000;
    if (u === 'mg') return qty / 1000;
    if (u === 'ml') return qty;
    if (u === 'cl') return qty * 10;
    if (u === 'dl') return qty * 100;
    if (u === 'l') return qty * 1000;
    if (/^(c\. a soupe|c\. à soupe|tbsp)$/.test(u)) return qty * (o.spoon ? o.spoon[0] : 15);
    if (/^(c\. a cafe|c\. à café|tsp)$/.test(u)) return qty * (o.spoon ? o.spoon[1] : 5);
    return qty * (o.w || 100);
  }

  /* Valeurs d'une ligne : { kcal, protein, carbs, fat, known }. Inconnu sans quantité (« ail, paprika ») : ignoré. */
  function ingredient(k, unit, qty, gramsHint) {
    var r = rule(k);
    if (!r) return { kcal: 0, protein: 0, carbs: 0, fat: 0, known: qty === null || qty === undefined };
    if (r.v === NONE) return { kcal: 0, protein: 0, carbs: 0, fat: 0, known: true };
    var g = (gramsHint ? gramsHint : grams(r, unit, qty)) / 100;
    return { kcal: r.v[0] * g, protein: r.v[1] * g, carbs: r.v[2] * g, fat: r.v[3] * g, known: true };
  }

  /* Recette (lignes d'ingrédients + nombre de portions) → valeurs par portion, arrondies. unknown = lignes sans valeur. */
  function recipe(r) {
    var t = { kcal: 0, protein: 0, carbs: 0, fat: 0 }, unknown = [];
    (r.ingredients || []).forEach(function (line) {
      var p = parse(line), e = ingredient(key(p.name), p.unit, p.qty, p.grams);
      if (!e.known) unknown.push(line);
      t.kcal += e.kcal; t.protein += e.protein; t.carbs += e.carbs; t.fat += e.fat;
    });
    var n = r.servings || 1;
    return { kcal: Math.round(t.kcal / n), protein: Math.round(t.protein / n), carbs: Math.round(t.carbs / n), fat: Math.round(t.fat / n), unknown: unknown };
  }

  /* Macros affichées pour une recette : calories et protéines enregistrées (vérifiées, modifiables) ;
     glucides et lipides calculés, puis ajustés pour que P×4 + G×4 + L×9 retombe sur les calories enregistrées. */
  function macros(r) {
    var c = recipe(r);
    var kcal = r.kcal || c.kcal, protein = r.protein || c.protein;
    var rest = kcal - protein * 4, calc = c.carbs * 4 + c.fat * 9;
    var f = calc > 0 && rest > 0 ? rest / calc : 1;
    return { kcal: kcal, protein: protein, carbs: Math.max(0, Math.round(c.carbs * f)), fat: Math.max(0, Math.round(c.fat * f)), calc: c };
  }

  /* ---------- Aliments du quotidien (journal) : valeurs pour UNE portion type ---------- */
  function F(id, fr, en, portionFr, portionEn, kcal, p, c, f, cat) { return { id: id, name: L2(en, fr), portion: L2(portionEn, portionFr), kcal: kcal, protein: p, carbs: c, fat: f, cat: cat }; }
  function L2(en, fr) { return S2.L ? S2.L(en, fr) : fr; }
  var FOODS = [
    F('egg', 'Œuf', 'Egg', '1 œuf', '1 egg', 77, 7, 0.5, 5.5, 'protein'),
    F('chicken', 'Blanc de poulet cuit', 'Cooked chicken breast', '150 g', '150 g', 225, 46, 0, 4, 'protein'),
    F('mince', 'Steak haché 5 %', 'Lean beef burger 5%', '1 steak (125 g)', '1 patty (125 g)', 160, 26, 0, 6, 'protein'),
    F('tuna', 'Thon au naturel', 'Tuna in water', '1 boîte (110 g)', '1 can (110 g)', 125, 28, 0, 1, 'protein'),
    F('salmon', 'Pavé de saumon', 'Salmon fillet', '1 pavé (130 g)', '1 fillet (130 g)', 260, 26, 0, 17, 'protein'),
    F('ham', 'Jambon blanc', 'Ham', '2 tranches (80 g)', '2 slices (80 g)', 90, 16, 1, 3, 'protein'),
    F('turkeyslice', 'Blanc de dinde', 'Turkey slices', '2 tranches (60 g)', '2 slices (60 g)', 65, 12, 1, 1, 'protein'),
    F('whey', 'Whey', 'Whey protein', '1 dose (30 g)', '1 scoop (30 g)', 115, 23, 2.5, 1.5, 'protein'),
    F('proteinbar', 'Barre protéinée', 'Protein bar', '1 barre (60 g)', '1 bar (60 g)', 210, 20, 20, 7, 'protein'),
    F('skyr', 'Skyr nature', 'Plain skyr', '1 pot (150 g)', '1 pot (150 g)', 95, 16, 6, 0.3, 'dairy'),
    F('greek', 'Yaourt grec 0 %', '0% Greek yoghurt', '1 pot (150 g)', '1 pot (150 g)', 85, 15, 6, 0.3, 'dairy'),
    F('yogurt', 'Yaourt nature', 'Plain yoghurt', '1 pot (125 g)', '1 pot (125 g)', 70, 5, 6, 2.5, 'dairy'),
    F('fromageblanc', 'Fromage blanc 0 %', '0% fromage blanc', '150 g', '150 g', 70, 11, 6, 0.3, 'dairy'),
    F('cottage', 'Cottage cheese', 'Cottage cheese', '100 g', '100 g', 98, 11, 3.5, 4.3, 'dairy'),
    F('milk', 'Lait demi-écrémé', 'Semi-skimmed milk', '1 verre (250 ml)', '1 glass (250 ml)', 115, 8, 12, 4, 'dairy'),
    F('cheese', 'Fromage (emmental, comté…)', 'Cheese (Emmental, Comté…)', '30 g', '30 g', 115, 8.5, 0, 9, 'dairy'),
    F('bread', 'Pain (baguette)', 'Bread (baguette)', '1/4 de baguette (60 g)', '1/4 baguette (60 g)', 160, 5, 33, 0.8, 'starch'),
    F('wholebread', 'Pain complet', 'Wholegrain bread', '1 tranche (35 g)', '1 slice (35 g)', 88, 3, 15, 1.2, 'starch'),
    F('rice', 'Riz cuit', 'Cooked rice', '1 assiette (200 g)', '1 plate (200 g)', 260, 5, 57, 0.6, 'starch'),
    F('pasta', 'Pâtes cuites', 'Cooked pasta', '1 assiette (200 g)', '1 plate (200 g)', 300, 10.5, 60, 1.6, 'starch'),
    F('potato', 'Pommes de terre cuites', 'Boiled potatoes', '200 g', '200 g', 165, 4, 36, 0.2, 'starch'),
    F('oats', 'Flocons d’avoine', 'Rolled oats', '50 g', '50 g', 185, 6.5, 30, 3.5, 'starch'),
    F('granola', 'Granola', 'Granola', '40 g', '40 g', 180, 3.6, 26, 6.4, 'starch'),
    F('banana', 'Banane', 'Banana', '1 banane', '1 banana', 105, 1.3, 24, 0.4, 'fruit'),
    F('apple', 'Pomme', 'Apple', '1 pomme', '1 apple', 80, 0.4, 18, 0.3, 'fruit'),
    F('orange', 'Orange', 'Orange', '1 orange', '1 orange', 65, 1.3, 14, 0.2, 'fruit'),
    F('berries', 'Fruits rouges', 'Berries', '100 g', '100 g', 40, 0.8, 8, 0.4, 'fruit'),
    F('compote', 'Compote sans sucre ajouté', 'Unsweetened apple sauce', '1 gourde (90 g)', '1 pouch (90 g)', 55, 0.3, 12, 0.2, 'fruit'),
    F('avocado', 'Avocat', 'Avocado', '1/2 avocat', '1/2 avocado', 115, 1.4, 1.5, 10.5, 'fruit'),
    F('salad', 'Salade composée (sans sauce)', 'Mixed salad (no dressing)', '1 bol', '1 bowl', 60, 3, 8, 1, 'veg'),
    F('veg', 'Légumes cuits', 'Cooked vegetables', '200 g', '200 g', 70, 4, 10, 0.6, 'veg'),
    F('almonds', 'Amandes', 'Almonds', '1 poignée (30 g)', '1 handful (30 g)', 175, 6.5, 2.5, 15, 'snack'),
    F('pb', 'Beurre de cacahuète', 'Peanut butter', '1 c. à soupe (15 g)', '1 tbsp (15 g)', 90, 3.8, 2.2, 7.5, 'snack'),
    F('darkchoc', 'Chocolat noir', 'Dark chocolate', '2 carrés (20 g)', '2 squares (20 g)', 110, 1.6, 8, 8, 'snack'),
    F('cookie', 'Cookie', 'Cookie', '1 cookie', '1 cookie', 140, 1.7, 18, 7, 'snack'),
    F('chips', 'Chips', 'Crisps', '1 petit paquet (30 g)', '1 small bag (30 g)', 160, 2, 15, 10, 'snack'),
    F('croissant', 'Croissant', 'Croissant', '1 croissant', '1 croissant', 230, 4.5, 26, 12, 'snack'),
    F('painchoc', 'Pain au chocolat', 'Pain au chocolat', '1 pièce', '1 piece', 270, 5, 30, 14, 'snack'),
    F('icecream', 'Glace', 'Ice cream', '2 boules', '2 scoops', 200, 3.5, 24, 10, 'snack'),
    F('oil', 'Huile (assaisonnement)', 'Oil (dressing)', '1 c. à soupe', '1 tbsp', 90, 0, 0, 10, 'extra'),
    F('coffee', 'Café noir', 'Black coffee', '1 tasse', '1 cup', 2, 0.3, 0, 0, 'drink'),
    F('latte', 'Café au lait / latte', 'Latte', '1 tasse (250 ml)', '1 cup (250 ml)', 110, 7, 11, 4, 'drink'),
    F('oj', 'Jus d’orange', 'Orange juice', '1 verre (200 ml)', '1 glass (200 ml)', 90, 1.4, 20, 0.2, 'drink'),
    F('soda', 'Soda', 'Soft drink', '1 canette (33 cl)', '1 can (330 ml)', 140, 0, 35, 0, 'drink'),
    F('beer', 'Bière', 'Beer', '1 demi (25 cl)', '1 half pint (250 ml)', 105, 1, 9, 0, 'drink'),
    F('wine', 'Vin', 'Wine', '1 verre (12 cl)', '1 glass (120 ml)', 85, 0.1, 3, 0, 'drink'),
    F('pizza', 'Pizza', 'Pizza', '1/2 pizza', '1/2 pizza', 550, 23, 65, 21, 'out'),
    F('burger', 'Burger + frites (fast-food)', 'Burger & fries (fast food)', '1 menu', '1 meal', 950, 33, 105, 43, 'out'),
    F('kebab', 'Kebab frites', 'Kebab with fries', '1 kebab', '1 kebab', 1000, 40, 95, 50, 'out'),
    F('sushi', 'Sushis / makis', 'Sushi / maki', '8 pièces', '8 pieces', 380, 16, 64, 6, 'out'),
    F('sandwich', 'Sandwich jambon-beurre', 'Ham & butter baguette', '1 sandwich', '1 sandwich', 450, 20, 55, 16, 'out'),
    F('restaurant', 'Plat au restaurant', 'Restaurant main course', '1 assiette', '1 plate', 750, 35, 70, 35, 'out')
  ];

  S2.nutritionTable = { RULES: RULES, parse: parse, key: key, ingredient: ingredient, recipe: recipe, macros: macros, FOODS: FOODS };
})();
