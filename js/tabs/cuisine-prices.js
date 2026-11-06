/* Prix moyens indicatifs (supermarché en France, fin 2026) pour estimer le panier des Courses de la Cuisine.
   Module PUR (ni DOM ni stockage, testable sous Node) : aucune donnée n'est récupérée en ligne, ces prix sont
   intégrés à l'app et l'utilisateur peut remplacer n'importe quel prix par le sien (enregistré dans la Cuisine).
   Règle = [motif sur la clé du nom (sans accents, au singulier, voir nameKey de cuisine.js), modèle de prix] :
     kg / l     : prix au kilo / au litre        unit : prix à la pièce        w : grammes par pièce (pièces → poids)
     pack       : contenance vendue (g, ml ou pièces) : le panier compte les paquets entiers à acheter
     pantry     : produit de placard (huile, épices, sauces…) : compté au prorata, à part du panier
     flat       : prix fixe une fois (botte d'herbes, sachet de salade)          none : non compté (eau, glaçons)
   Le premier motif qui correspond gagne : les cas particuliers (« lait de coco », « pomme de terre ») d'abord. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  var RULES = [
    /* À ne pas compter */
    [/^(glacon|eau|ice|water)\b/, { none: true }],
    [/^(sel|poivre|salt)\b/, { none: true }],

    /* Viandes & poissons */
    [/^(haut de cuisse|blanc de poulet|filet de poulet|poulet|escalope de poulet|chicken)/, { kg: 12, pack: 500, w: 150 }],
    [/^(dinde hachee|poulet hache)/, { kg: 12.5, pack: 500 }],
    [/^escalope de dinde/, { unit: 2, w: 150, pack: 2 }],
    [/^tranche de blanc de dinde/, { unit: 0.45, pack: 4 }],
    [/^tranche de jambon|^jambon|^ham/, { unit: 0.6, pack: 4 }],
    [/^boeuf hache|^steak hache|^beef mince/, { kg: 16, pack: 500 }],
    [/^(steak|rumsteck|bavette)/, { kg: 22, pack: 300 }],
    [/^boeuf/, { kg: 22, pack: 300 }],
    [/^(filet mignon|porc|pork)/, { kg: 15, pack: 400, w: 400 }],
    [/^pave de saumon/, { unit: 3.5, w: 125, pack: 2 }],
    [/^saumon fume|^smoked salmon/, { kg: 40, pack: 120 }],
    [/^saumon|^salmon/, { kg: 26, pack: 250 }],
    [/^boite de thon/, { unit: 2, pack: 1 }],
    [/^thon|^tuna/, { kg: 14, pack: 140 }],
    [/^crevette|^shrimp|^prawn/, { kg: 22, pack: 250 }],
    [/^dos de cabillaud|^cabillaud|^cod/, { unit: 3.5, w: 130, pack: 2 }],

    /* Crèmerie & œufs */
    [/^oeuf|^egg/, { unit: 0.33, pack: 6 }],
    [/^skyr|^yaourt grec|^greek yog/, { kg: 4.5, pack: 450 }],
    [/^yaourt|^yogh?urt/, { kg: 3, pack: 500 }],
    [/^fromage blanc/, { kg: 3, pack: 500 }],
    [/^cottage/, { kg: 9.5, pack: 200 }],
    [/^fromage frai|^cream cheese/, { kg: 12, pack: 150 }],
    [/^boule de mozzarella/, { unit: 1.2, w: 125, pack: 1 }],
    [/^mozzarella/, { kg: 9.6, pack: 125 }],
    [/^tranche de cheddar/, { unit: 0.25, pack: 10 }],
    [/^cheddar/, { kg: 14, pack: 200 }],
    [/^parmesan/, { kg: 25, pack: 100 }],
    [/^feta/, { kg: 13, pack: 200 }],
    [/^ricotta/, { kg: 8, pack: 250 }],
    [/^fromage rape|^emmental/, { kg: 11, pack: 200 }],
    [/^creme|^cream/, { kg: 5.5, pack: 200 }],
    [/^lait de coco|^coconut milk/, { l: 4.5, pack: 400 }],
    [/^lait|^milk/, { l: 1.1, pack: 1000 }],
    [/^beurre de cacahuete|^peanut butter/, { kg: 10, pack: 350 }],
    [/^beurre|^butter/, { kg: 10, pack: 250 }],

    /* Boulangerie */
    [/^(grande )?tranche de pain|^slice/, { unit: 0.15, pack: 18 }],
    [/^tranche de brioche/, { unit: 0.15, pack: 18 }],
    [/^(grande )?tortilla/, { unit: 0.35, pack: 8 }],
    [/^pain a burger|^burger bun|^bun/, { unit: 0.45, pack: 4 }],
    [/^bagel/, { unit: 0.6, pack: 4 }],
    [/^feuille de lasagne/, { unit: 0.05, pack: 30 }],

    /* Fruits & légumes */
    [/^avocat|^avocado/, { unit: 1, pack: 1 }],
    [/^banane|^banana/, { unit: 0.25, pack: 1 }],
    [/^pomme de terre|^potato/, { kg: 1.6, pack: 1000, w: 150 }],
    [/^petite pomme de terre/, { kg: 3, pack: 750 }],
    [/^patate douce|^sweet potato/, { unit: 0.8, w: 300, pack: 1 }],
    [/^pomme|^apple/, { unit: 0.4, pack: 1 }],
    [/^citron|^lemon|^lime/, { unit: 0.45, pack: 1 }],
    [/^concombre|^cucumber/, { unit: 0.9, pack: 1 }],
    [/^poignee de tomate cerise|^tomate cerise|^cherry tomato/, { kg: 6, pack: 250, w: 80 }],
    [/^tomate concassee|^boite de tomate|^chopped tomato/, { kg: 2.5, pack: 400 }],
    [/^couli|^passata/, { kg: 2.5, pack: 500 }],
    [/^tomate|^tomato/, { unit: 0.4, w: 120, pack: 1 }],
    [/^poivron|^pepper/, { unit: 1, pack: 1 }],
    [/^cebette|^spring onion/, { unit: 0.25, pack: 5 }],
    [/^oignon rouge|^red onion/, { unit: 0.35, pack: 1 }],
    [/^oignon|^onion/, { unit: 0.25, pack: 1 }],
    [/^echalote|^shallot/, { unit: 0.25, pack: 1 }],
    [/^(petite )?gousse d ail|^garlic clove/, { unit: 0.12, pack: 1 }],
    [/^carotte|^carrot/, { unit: 0.15, pack: 1 }],
    [/^courgette/, { unit: 0.8, pack: 1 }],
    [/^champignon|^mushroom/, { unit: 0.2, w: 20, pack: 1 }],
    [/^pousse de soja|^bean sprout/, { kg: 6, pack: 200 }],
    [/^brocoli|^broccoli/, { kg: 4, pack: 500 }],
    [/^haricot vert|^green bean/, { kg: 4, pack: 500 }],
    [/^coeur de romaine/, { unit: 0.8, pack: 2 }],
    [/^poignee d|^handful/, { unit: 0.45, pack: 4 }],
    [/^(quelque feuille de )?(salade|roquette|epinard|lettuce|rocket|spinach)/, { flat: 1.5 }],
    [/^(ciboulette|persil|basilic|aneth|coriandre|chive|parsley|basil|dill|coriander)/, { flat: 1 }],
    [/^gingembre|^ginger/, { flat: 0.3 }],
    [/^(fraise|fruit rouge|strawberr|berr)/, { kg: 8, pack: 500 }],
    [/^edamame/, { kg: 8, pack: 400 }],
    [/^petit poi|^pea/, { kg: 3, pack: 1000 }],
    [/^legume a wok|^stir fry veg/, { kg: 4, pack: 600 }],

    /* Épicerie (achetée pour la recette) */
    [/^riz cuit|^riz ou 1 sachet|^cooked rice/, { kg: 8, pack: 250 }],
    [/^riz a risotto|^risotto rice/, { kg: 4, pack: 1000 }],
    [/^riz|^rice/, { kg: 2.5, pack: 1000 }],
    [/^quinoa/, { kg: 8, pack: 500 }],
    [/^(pate|spaghetti|penne|tagliatelle|pasta)/, { kg: 2, pack: 500 }],
    [/^(semoule|couscou)/, { kg: 2.5, pack: 500 }],
    [/^(mai\b|mais\b|sweetcorn|corn)/, { kg: 4, pack: 285 }],
    [/^(pain pita|pita)/, { unit: 0.4, pack: 6 }],
    [/^(boite de poi chiche|poi chiche|chickpea)/, { unit: 1, pack: 1 }],
    [/^(cacahuete|peanut)/, { kg: 8, pack: 200 }],
    [/^gnocchi/, { kg: 4, pack: 500 }],
    [/^nouille|^noodle/, { kg: 6, pack: 250 }],
    [/^flocon d avoine|^oat/, { kg: 2, pack: 500 }],
    [/^granola/, { kg: 8, pack: 500 }],
    [/^lentille cuite/, { kg: 5, pack: 400 }],
    [/^lentille|^lentil/, { kg: 4, pack: 500 }],
    [/^boite de haricot|^kidney|^black bean/, { unit: 1, pack: 1 }],
    [/^tofu/, { kg: 9, pack: 400 }],
    [/^pesto/, { kg: 12, pack: 190 }],
    [/^chapelure|^breadcrumb/, { kg: 4, pack: 250 }],
    [/^(noisette|cerneau de noi|noix|nut|walnut|hazelnut)/, { kg: 20, pack: 100 }],
    [/^(pepite de chocolat|quelque pepite|quelque carre de chocolat|chocolat|chocolate)/, { kg: 12, pack: 100, w: 5 }],
    [/^salsa|^sauce piquante|^hot sauce/, { flat: 0.5, pantry: true }],

    /* Placard : compté au prorata (un paquet sert plusieurs semaines) */
    [/^(filet d )?huile d olive|^olive oil/, { l: 10, pantry: true, w: 10 }],
    [/^huile de sesame|^sesame oil/, { l: 15, pantry: true }],
    [/^(filet d )?huile|^oil/, { l: 3, pantry: true, w: 10 }],
    [/^whey|^protein powder/, { kg: 30, pantry: true }],
    [/^cacao|^cocoa/, { kg: 10, pantry: true }],
    [/^miel|^honey|^sirop|^syrup/, { kg: 12, pantry: true, w: 15 }],
    [/^sauce soja|^soy sauce/, { l: 6, pantry: true }],
    [/^sauce d huitre|^oyster sauce/, { l: 10, pantry: true }],
    [/^vinaigre|^vinegar/, { l: 6, pantry: true }],
    [/^moutarde|^mustard/, { kg: 5, pantry: true }],
    [/^cornichon|^gherkin/, { unit: 0.08, pantry: true }],
    [/^farine|^flour/, { kg: 1, pantry: true }],
    [/^fecule|^maizena|^cornflour/, { kg: 5, pantry: true }],
    [/^levure|^baking powder/, { kg: 20, pantry: true }],
    [/^bouillon|^stock/, { l: 0.4, pantry: true }],
    [/^(curry|paprika|cumin|epice|pincee|origan|herbe|cannelle|graine de sesame|sesame|ras el hanout|thym|spice|oregano|cinnamon|thyme)/, { kg: 40, pantry: true, w: 1 }]
  ];

  /* Unité de la ligne → { kind: 'mass' | 'vol' | 'count' | 'none', factor vers g / ml / pièce }. */
  function measure(unit) {
    var u = String(unit || '').toLowerCase().trim();
    if (u === 'g') return { kind: 'mass', f: 1 };
    if (u === 'kg') return { kind: 'mass', f: 1000 };
    if (u === 'mg') return { kind: 'mass', f: 0.001 };
    if (u === 'ml') return { kind: 'vol', f: 1 };
    if (u === 'cl') return { kind: 'vol', f: 10 };
    if (u === 'dl') return { kind: 'vol', f: 100 };
    if (u === 'l') return { kind: 'vol', f: 1000 };
    if (/^(c\. a soupe|c\. à soupe|tbsp)$/.test(u)) return { kind: 'spoon', f: 15 };
    if (/^(c\. a cafe|c\. à café|tsp)$/.test(u)) return { kind: 'spoon', f: 5 };
    return { kind: 'count', f: 1 };
  }

  function rule(key) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(key)) return RULES[i][1];
    return null;
  }

  /* Estimation d'une ligne de courses.
     key = nom normalisé ; unit = unité de la ligne ('' si pièces) ; qty = quantité totale (null si « sel & poivre »…).
     own = prix saisi par l'utilisateur pour cet ingrédient (même base que `basis`), facultatif.
     Renvoie { price (€ à la caisse), used (€ réellement utilisés), pantry, basis: 'kg' | 'l' | 'unit' | 'flat', ref (prix de référence), known }. */
  function estimate(key, unit, qty, own) {
    var r = rule(key);
    if (r && r.none) return { price: 0, used: 0, pantry: false, known: true, none: true };
    var m = measure(unit);
    /* Assaisonnement sans quantité inconnu (« ail, paprika, citron ») : ignoré plutôt que compté comme inconnu. */
    if (!r && own === undefined && (qty === null || qty === undefined)) return { price: 0, used: 0, pantry: false, known: true, none: true };
    if (!r && own === undefined) return { price: 0, used: 0, pantry: false, known: false };
    r = r || {};
    if (r.flat !== undefined && own === undefined) return { price: r.flat, used: r.flat, pantry: !!r.pantry, basis: 'flat', ref: r.flat, known: true };

    /* Quantité ramenée à la base du prix. */
    var basis = r.kg !== undefined ? 'kg' : r.l !== undefined ? 'l' : r.unit !== undefined ? 'unit' : r.flat !== undefined ? 'flat' : (m.kind === 'vol' ? 'l' : m.kind === 'count' ? 'unit' : 'kg');
    var ref = own !== undefined ? own : (basis === 'kg' ? r.kg : basis === 'l' ? r.l : basis === 'unit' ? r.unit : r.flat);
    if (basis === 'flat') return { price: ref, used: ref, pantry: !!r.pantry, basis: 'flat', ref: ref, known: true };
    if (qty === null || qty === undefined) {
      /* Sans quantité (« quelques feuilles de roquette », « un filet d'huile ») : une pièce ou une petite dose. */
      qty = 1; m = { kind: 'count', f: 1 };
    }
    var amount; /* en g / ml (base kg ou l) ou en pièces (base unit) */
    if (basis === 'unit') {
      amount = m.kind === 'count' ? qty : r.w ? qty * m.f / r.w : qty;
    } else if (m.kind === 'count') {
      amount = qty * (r.w || 100);
    } else {
      amount = qty * m.f; /* g, ml, cuillères (≈ g ou ml) */
    }
    var per = basis === 'unit' ? ref : ref / 1000;
    var used = amount * per;
    var price = used;
    if (!r.pantry && r.pack) price = Math.ceil(amount / r.pack - 1e-9) * r.pack * per;
    return { price: round2(price), used: round2(used), pantry: !!r.pantry, basis: basis, ref: ref, known: true };
  }
  function round2(x) { return Math.round(x * 100) / 100; }

  /* Total d'une liste : items = [{ key, unit, qty, own?, done? }].
     basket = à acheter (paquets entiers, hors placard) ; pantry = placard au prorata ; left = reste à acheter (non coché). */
  function basket(items) {
    var out = { basket: 0, pantry: 0, used: 0, left: 0, unknown: 0, count: 0 };
    items.forEach(function (it) {
      var e = estimate(it.key, it.unit, it.qty, it.own);
      it.estimate = e;
      if (!e.known) { out.unknown++; return; }
      if (e.none) return;
      out.count++;
      out.used += e.used;
      if (e.pantry) { out.pantry += e.used; return; }
      out.basket += e.price;
      if (!it.done) out.left += e.price;
    });
    ['basket', 'pantry', 'used', 'left'].forEach(function (k) { out[k] = round2(out[k]); });
    out.low = Math.floor(out.basket * 0.85);
    out.high = Math.ceil(out.basket * 1.15);
    return out;
  }

  S2.cuisinePrices = { RULES: RULES, rule: rule, estimate: estimate, basket: basket, measure: measure };
})();
