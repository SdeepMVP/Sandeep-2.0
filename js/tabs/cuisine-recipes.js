/* Recettes intégrées de l'onglet Kitchen (copiées dans les données de l'utilisateur au premier lancement).
   Pour en ajouter : nouvel id unique ; elles seront ajoutées automatiquement aux données existantes.
   Valeurs nutritionnelles approximatives, par portion. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  S2.cuisineRecipes = [
    /* ---------- Breakfast & snacks ---------- */
    {
      id: 'b-cottage-eggs', name: 'Cottage Cheese Scrambled Eggs', category: 'breakfast',
      time: 10, servings: 1, protein: 34, kcal: 450,
      tags: ['eggs', 'cottage cheese'],
      ingredients: [
        '3 eggs',
        '100 g cottage cheese',
        '1 slice wholegrain bread',
        '5 g butter',
        '1 tbsp chopped chives',
        'Salt & pepper'
      ],
      steps: [
        'Crack the eggs into a bowl, add the cottage cheese, a pinch of salt and pepper, and whisk with a fork.',
        'Put the bread in the toaster.',
        'Melt the butter in a non-stick pan over medium-low heat.',
        'Pour in the eggs. Wait 20 seconds, then gently push them from the edges to the centre with a spatula.',
        'Keep folding slowly for 2–3 minutes. Take the pan off the heat while the eggs still look slightly wet: they finish cooking on their own.',
        'Serve on the toast and sprinkle with chives.'
      ],
      tips: 'Low heat and stopping early give creamy eggs, not rubbery ones.'
    },
    {
      id: 'b-skyr-bowl', name: 'Skyr Power Bowl', category: 'breakfast',
      time: 5, servings: 1, protein: 32, kcal: 450,
      tags: ['skyr', 'yogurt', 'berries', 'peanut butter'],
      ingredients: [
        '250 g plain skyr (or 0% Greek yogurt)',
        '30 g granola',
        '100 g berries (fresh or frozen)',
        '15 g peanut butter',
        '1 tsp honey',
        '1 pinch cinnamon'
      ],
      steps: [
        'Spoon the skyr into a bowl and stir in the cinnamon.',
        'Add the berries. If they are frozen, microwave them for 30 seconds first so they get juicy.',
        'Sprinkle the granola on top.',
        'Drizzle with the peanut butter and honey. Eat right away so the granola stays crunchy.'
      ],
      tips: 'Stir 15 g of whey into the skyr for about 12 g of extra protein.'
    },
    {
      id: 'b-banana-pancakes', name: 'Banana Protein Pancakes', category: 'breakfast',
      time: 15, servings: 1, protein: 41, kcal: 560,
      tags: ['banana', 'eggs', 'oats', 'whey'],
      ingredients: [
        '1 ripe banana',
        '2 eggs',
        '40 g oat flakes',
        '30 g whey protein (vanilla or plain)',
        '1/2 tsp baking powder',
        '1 pinch cinnamon',
        '5 g oil or butter for the pan',
        'Toppings: skyr, berries or a little maple syrup'
      ],
      steps: [
        'Put the banana, eggs, oats, whey, baking powder and cinnamon in a blender. Blend for 30 seconds until smooth. (No blender? Mash the banana with a fork and use fine oats.)',
        'Let the batter rest for 2 minutes; it thickens slightly.',
        'Heat a non-stick pan over medium heat and brush it with a little oil.',
        'Pour small pancakes, about 2 tablespoons of batter each.',
        'Cook for about 2 minutes, until bubbles appear on top, then flip and cook 1 more minute.',
        'Stack them up and add your toppings.'
      ],
      tips: 'Keep the heat at medium, not high: whey burns quickly.'
    },
    {
      id: 'b-salmon-wrap', name: 'Smoked Salmon & Cottage Cheese Wrap', category: 'breakfast',
      time: 5, servings: 1, protein: 31, kcal: 400,
      tags: ['smoked salmon', 'salmon', 'cottage cheese', 'wrap'],
      ingredients: [
        '1 large wholegrain tortilla',
        '80 g cottage cheese',
        '75 g smoked salmon',
        '1/4 cucumber',
        '1 handful rocket or spinach',
        '1/2 lemon',
        'Dill (fresh or dried) & black pepper'
      ],
      steps: [
        'Slice the cucumber into thin sticks.',
        'Mix the cottage cheese with dill, a squeeze of lemon and black pepper.',
        'Spread the mix over the tortilla, leaving 2 cm free around the edge.',
        'Lay the salmon, cucumber and rocket on the lower third.',
        'Fold in the sides, then roll it up tightly from the bottom. Cut in half.'
      ],
      tips: 'Wrapped in foil, it keeps for a few hours in the fridge: an easy work snack.'
    },

    /* ---------- Lunch & dinner ---------- */
    {
      id: 'm-honey-garlic-chicken', name: 'Honey Garlic Chicken Rice Bowl', category: 'main',
      time: 20, servings: 1, protein: 55, kcal: 630,
      tags: ['chicken', 'rice', 'broccoli'],
      ingredients: [
        '200 g chicken breast',
        '75 g rice (uncooked), or 1 microwave rice pouch',
        '150 g broccoli',
        '2 garlic cloves',
        '1 tbsp honey',
        '2 tbsp soy sauce',
        '1 tsp cornflour',
        '1 tsp oil',
        'Sesame seeds & 1 spring onion (optional)'
      ],
      steps: [
        'Start the rice following the pack instructions (or use a microwave pouch).',
        'Cut the chicken into bite-size pieces and mince the garlic.',
        'In a small bowl, mix the honey, soy sauce, cornflour, garlic and 3 tbsp of water: this is the sauce.',
        'Cut the broccoli into small florets. Microwave them for 3–4 minutes in a covered bowl with a splash of water.',
        'Heat the oil in a pan over medium-high heat. Cook the chicken for 5–6 minutes until golden and cooked through (no pink inside).',
        'Pour in the sauce and stir for 1 minute until it thickens and coats the chicken.',
        'Serve the rice, broccoli and chicken in a bowl. Top with sesame seeds and sliced spring onion.'
      ],
      tips: 'Make 3 portions at once for meal prep: they keep for 3 days in the fridge.'
    },
    {
      id: 'm-chicken-fajitas', name: 'Chicken Fajita Wraps', category: 'main',
      time: 20, servings: 1, protein: 55, kcal: 700,
      tags: ['chicken', 'peppers', 'wrap', 'cheese'],
      ingredients: [
        '180 g chicken breast',
        '1 red pepper',
        '1/2 onion',
        '2 wholegrain tortillas',
        '1 tsp fajita spice mix (or paprika, cumin & garlic powder)',
        '1 tsp oil',
        '50 g 0% Greek yogurt (or skyr)',
        '30 g grated cheese',
        '1/2 lime',
        'Salsa or hot sauce (optional)'
      ],
      steps: [
        'Slice the chicken, pepper and onion into thin strips.',
        'Toss the chicken with the spice mix and a pinch of salt.',
        'Heat the oil in a large pan over high heat. Cook the pepper and onion for 3–4 minutes until slightly charred, then push them to the side.',
        'Add the chicken and cook for 5–6 minutes, stirring, until cooked through. Squeeze the lime over it.',
        'Warm the tortillas for 20 seconds in the microwave or 30 seconds in a dry pan.',
        'Spread the yogurt on each tortilla, add the chicken and vegetables, top with the cheese and salsa, and roll up.'
      ],
      tips: 'Yogurt instead of sour cream: just as creamy, with more protein and fewer calories.'
    },
    {
      id: 'm-korean-beef', name: 'Korean-Style Beef Bowl', category: 'main',
      time: 15, servings: 1, protein: 42, kcal: 600,
      tags: ['beef', 'ground beef', 'rice', 'egg'],
      ingredients: [
        '150 g lean ground beef (5% fat)',
        '75 g rice (uncooked), or 1 microwave rice pouch',
        '1 egg',
        '2 garlic cloves',
        '1 tsp grated fresh ginger (or 1/2 tsp ground ginger)',
        '2 tbsp soy sauce',
        '1 tsp honey or brown sugar',
        '1 tsp sesame oil',
        '1/4 cucumber',
        '1 spring onion, sesame seeds & chilli flakes (optional)'
      ],
      steps: [
        'Start the rice.',
        'In a small bowl, mix the soy sauce, honey, minced garlic and ginger.',
        'Heat a pan over high heat and add the beef. Break it up with a spatula and cook for 5 minutes until browned.',
        'Pour the sauce over the beef and cook for 1–2 minutes until sticky. Stir in the sesame oil.',
        'In another pan, fry the egg (or boil it for 7 minutes for a jammy yolk).',
        'Slice the cucumber and spring onion.',
        'Serve the beef over the rice with the egg, cucumber, spring onion, sesame seeds and chilli flakes.'
      ],
      tips: 'Ground turkey works just as well and is even leaner.'
    },
    {
      id: 'm-lemon-salmon', name: 'Lemon Garlic Salmon & Potatoes', category: 'main',
      time: 25, servings: 1, protein: 49, kcal: 680,
      tags: ['salmon', 'fish', 'potatoes', 'green beans'],
      ingredients: [
        '1 salmon fillet (about 180 g)',
        '250 g small potatoes',
        '150 g green beans',
        '1 tbsp olive oil',
        '1 garlic clove',
        '1/2 lemon',
        '50 g skyr or Greek yogurt',
        'Dill, salt, pepper & paprika'
      ],
      steps: [
        'Preheat the oven (or air fryer) to 200 °C.',
        'Cut the potatoes in half. Microwave them for 5 minutes in a covered bowl with a splash of water to give them a head start.',
        'Put the potatoes and green beans on a tray. Toss with half the olive oil, salt, pepper and paprika. Roast for 10 minutes.',
        'Mix the rest of the oil with the grated garlic, lemon zest, salt and pepper. Brush it over the salmon.',
        'Add the salmon to the tray and roast for 10–12 minutes, until it flakes easily with a fork.',
        'For the sauce, mix the skyr with dill, a squeeze of lemon and a pinch of salt.',
        'Serve with the sauce and lemon wedges.'
      ],
      tips: 'Frozen salmon works: thaw it in the fridge overnight, or add 5 minutes of cooking.'
    },
    {
      id: 'm-tuna-pasta', name: 'Creamy Tuna Pasta', category: 'main',
      time: 15, servings: 1, protein: 54, kcal: 650,
      tags: ['tuna', 'fish', 'pasta', 'cottage cheese', 'tomatoes'],
      ingredients: [
        '80 g pasta (wholewheat or protein pasta)',
        '1 can tuna in water (about 110 g drained)',
        '100 g cottage cheese',
        '15 g grated parmesan',
        '150 g cherry tomatoes',
        '1 garlic clove',
        '1 tsp olive oil',
        '1 handful spinach, chilli flakes & basil (optional)'
      ],
      steps: [
        'Cook the pasta in salted boiling water following the pack time. Keep a small cup of the cooking water before draining.',
        'Meanwhile, halve the tomatoes and slice the garlic.',
        'Heat the olive oil in a pan over medium heat. Cook the garlic for 30 seconds, then the tomatoes for 3–4 minutes until soft.',
        'Blend or mash the cottage cheese with the parmesan and 2–3 tbsp of pasta water until smooth.',
        'Take the pan off the heat. Add the drained pasta, tuna and spinach, then stir in the cottage cheese sauce.',
        'Season with pepper and chilli flakes, and top with basil.'
      ],
      tips: 'Add the sauce off the heat so it stays creamy and does not split.'
    },
    {
      id: 'm-shrimp-fried-rice', name: 'Shrimp Egg Fried Rice', category: 'main',
      time: 15, servings: 1, protein: 50, kcal: 650,
      tags: ['shrimp', 'prawns', 'eggs', 'rice', 'peas'],
      ingredients: [
        '150 g raw peeled prawns (shrimp)',
        '2 eggs',
        '150 g cooked rice (cold, ideally from the day before)',
        '80 g frozen peas',
        '1 garlic clove',
        '2 tbsp soy sauce',
        '2 tsp oil',
        '1 spring onion & a few drops of sesame oil (optional)'
      ],
      steps: [
        'Mince the garlic and slice the spring onion.',
        'Heat 1 tsp of oil in a large pan or wok over high heat. Cook the prawns for 2 minutes until pink, then set them aside on a plate.',
        'Add the rest of the oil, the garlic and the peas. Stir for 1 minute.',
        'Add the cold rice and fry for 2–3 minutes, pressing it against the pan so it gets slightly crispy.',
        'Push the rice to the side, crack in the eggs and scramble them, then mix everything together.',
        'Return the prawns, add the soy sauce and stir for 1 minute. Finish with the spring onion and a few drops of sesame oil.'
      ],
      tips: 'Cold rice is the secret: fresh rice turns mushy. A microwave rice pouch also works.'
    }
  ];
})();
