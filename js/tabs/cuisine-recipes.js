/* Recettes intégrées de l'onglet Cuisine / Kitchen (copiées dans les données de l'utilisateur au premier lancement).
   Pour en ajouter : nouvel id unique ; elles seront ajoutées automatiquement aux données existantes.
   Bilingue : les champs principaux (name, tags, ingredients, steps, tips) sont en français et servent de
   référence enregistrée ; `en` contient la version anglaise, affichée quand l'app est en anglais tant que
   la recette n'a pas été modifiée. `en.ingredients` et `en.steps` doivent avoir EXACTEMENT le même nombre
   de lignes, dans le même ordre (les cases cochées sont enregistrées par position), et commencer par la
   quantité quand la ligne française le fait (ajustement aux portions). `keywords` = mots en plus pour la recherche.
   Valeurs nutritionnelles approximatives, par portion. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  S2.cuisineRecipes = [
    /* ---------- Petit-déjeuner & en-cas ---------- */
    {
      id: 'b-cottage-eggs', name: 'Œufs brouillés au cottage cheese', category: 'breakfast',
      time: 10, servings: 1, protein: 34, kcal: 450,
      tags: ['œufs', 'cottage cheese'], keywords: ['eggs', 'cottage cheese', 'scrambled'],
      ingredients: [
        '3 œufs',
        '100 g de cottage cheese',
        '1 tranche de pain complet',
        '5 g de beurre',
        '1 c. à soupe de ciboulette ciselée',
        'Sel & poivre'
      ],
      steps: [
        'Casse les œufs dans un bol, ajoute le cottage cheese, une pincée de sel et de poivre, puis bats à la fourchette.',
        'Mets le pain à griller.',
        'Fais fondre le beurre dans une poêle antiadhésive à feu moyen-doux.',
        'Verse les œufs. Attends 20 secondes, puis ramène-les doucement des bords vers le centre avec une spatule.',
        'Continue de plier lentement 2 à 3 minutes. Retire du feu quand les œufs sont encore un peu baveux : ils finissent de cuire tout seuls.',
        'Sers sur la tartine et parsème de ciboulette.'
      ],
      tips: 'Feu doux et arrêt tôt : des œufs crémeux, pas caoutchouteux.',
      en: {
        name: 'Cottage Cheese Scrambled Eggs',
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
      }
    },
    {
      id: 'b-skyr-bowl', name: 'Bowl skyr énergie', category: 'breakfast',
      time: 5, servings: 1, protein: 32, kcal: 450,
      tags: ['skyr', 'yaourt', 'fruits rouges', 'beurre de cacahuète'], keywords: ['yogurt', 'berries', 'peanut butter', 'granola'],
      ingredients: [
        '250 g de skyr nature (ou yaourt grec 0 %)',
        '30 g de granola',
        '100 g de fruits rouges (frais ou surgelés)',
        '15 g de beurre de cacahuète',
        '1 c. à café de miel',
        '1 pincée de cannelle'
      ],
      steps: [
        'Verse le skyr dans un bol et mélange-le avec la cannelle.',
        'Ajoute les fruits rouges. S’ils sont surgelés, passe-les 30 secondes au micro-ondes pour qu’ils rendent leur jus.',
        'Parsème de granola.',
        'Arrose de beurre de cacahuète et de miel. Mange tout de suite pour que le granola reste croquant.'
      ],
      tips: 'Ajoute 15 g de whey dans le skyr pour environ 12 g de protéines en plus.',
      en: {
        name: 'Skyr Power Bowl',
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
      }
    },
    {
      id: 'b-salmon-wrap', name: 'Wrap saumon fumé & cottage cheese', category: 'breakfast',
      time: 5, servings: 1, protein: 31, kcal: 400,
      tags: ['saumon fumé', 'saumon', 'cottage cheese', 'wrap'], keywords: ['smoked salmon', 'salmon', 'tortilla'],
      ingredients: [
        '1 grande tortilla (complète)',
        '80 g de cottage cheese',
        '75 g de saumon fumé',
        '1/4 de concombre',
        '1 poignée de roquette ou d’épinards',
        '1/2 citron',
        'Aneth (frais ou séché) & poivre noir'
      ],
      steps: [
        'Coupe le concombre en fins bâtonnets.',
        'Mélange le cottage cheese avec l’aneth, un filet de citron et du poivre.',
        'Étale le mélange sur la tortilla en laissant 2 cm libres sur le bord.',
        'Dispose le saumon, le concombre et la roquette sur le tiers du bas.',
        'Rabats les côtés, puis roule bien serré en partant du bas. Coupe en deux.'
      ],
      tips: 'Emballé dans de l’aluminium, il se garde quelques heures au frigo : un en-cas facile pour le travail.',
      en: {
        name: 'Smoked Salmon & Cottage Cheese Wrap',
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
      }
    },
    {
      id: 'b-pb-smoothie', name: 'Smoothie banane & cacahuète', category: 'breakfast',
      time: 5, servings: 1, protein: 40, kcal: 470,
      tags: ['banane', 'beurre de cacahuète', 'whey', 'lait'], keywords: ['smoothie', 'shake', 'banana', 'peanut butter', 'protein powder'],
      ingredients: [
        '1 banane (idéalement congelée en morceaux)',
        '30 g de whey (vanille ou chocolat)',
        '250 ml de lait demi-écrémé',
        '15 g de beurre de cacahuète',
        '20 g de flocons d’avoine',
        '3 glaçons (si la banane n’est pas congelée)'
      ],
      steps: [
        'Mets tous les ingrédients dans le blender, le lait en premier.',
        'Mixe 45 secondes jusqu’à ce que ce soit bien lisse.',
        'Goûte : ajoute un trait de lait s’il est trop épais. Bois tout de suite.'
      ],
      tips: 'Garde des rondelles de banane au congélateur : le smoothie devient épais comme un milkshake.',
      en: {
        name: 'Banana Peanut Butter Smoothie',
        tags: ['banana', 'peanut butter', 'whey', 'milk'],
        ingredients: [
          '1 banana (ideally frozen in chunks)',
          '30 g whey protein (vanilla or chocolate)',
          '250 ml semi-skimmed milk',
          '15 g peanut butter',
          '20 g oat flakes',
          '3 ice cubes (if the banana is not frozen)'
        ],
        steps: [
          'Put all the ingredients in the blender, milk first.',
          'Blend for 45 seconds until completely smooth.',
          'Taste: add a splash of milk if it is too thick. Drink right away.'
        ],
        tips: 'Keep banana slices in the freezer: the smoothie gets as thick as a milkshake.'
      }
    },
    {
      id: 'b-choco-porridge', name: 'Porridge protéiné au chocolat', category: 'breakfast',
      time: 8, servings: 1, protein: 35, kcal: 470,
      tags: ['flocons d’avoine', 'whey', 'chocolat', 'banane'], keywords: ['porridge', 'oatmeal', 'oats', 'chocolate', 'protein powder'],
      ingredients: [
        '50 g de flocons d’avoine',
        '250 ml de lait demi-écrémé',
        '25 g de whey (chocolat)',
        '1 c. à café de cacao non sucré',
        '1/2 banane',
        '10 g de noisettes concassées'
      ],
      steps: [
        'Mets les flocons et le lait dans une casserole à feu moyen.',
        'Cuis 4 à 5 minutes en remuant, jusqu’à ce que ce soit crémeux.',
        'Hors du feu, ajoute la whey et le cacao et mélange bien (la whey fait des grumeaux si elle cuit).',
        'Verse dans un bol, ajoute la banane en rondelles et les noisettes.'
      ],
      tips: 'Au micro-ondes : 2 minutes en 2 fois, en remuant entre les deux.',
      en: {
        name: 'Chocolate Protein Porridge',
        tags: ['oats', 'whey', 'chocolate', 'banana'],
        ingredients: [
          '50 g oat flakes',
          '250 ml semi-skimmed milk',
          '25 g whey protein (chocolate)',
          '1 tsp unsweetened cocoa powder',
          '1/2 banana',
          '10 g chopped hazelnuts'
        ],
        steps: [
          'Put the oats and milk in a saucepan over medium heat.',
          'Cook for 4–5 minutes, stirring, until creamy.',
          'Off the heat, add the whey and cocoa and stir well (whey goes lumpy if it cooks).',
          'Pour into a bowl and top with the sliced banana and hazelnuts.'
        ],
        tips: 'In the microwave: 2 minutes in two goes, stirring in between.'
      }
    },
    {
      id: 'b-fromage-blanc-apple', name: 'Fromage blanc, pomme & noix', category: 'breakfast',
      time: 5, servings: 1, protein: 23, kcal: 360,
      tags: ['fromage blanc', 'pomme', 'noix', 'en-cas'], keywords: ['cottage', 'quark', 'yogurt', 'apple', 'walnuts', 'snack'],
      ingredients: [
        '250 g de fromage blanc 0 %',
        '1 pomme',
        '15 g de cerneaux de noix',
        '1 c. à café de miel',
        '1 pincée de cannelle'
      ],
      steps: [
        'Coupe la pomme en petits dés (garde la peau).',
        'Verse le fromage blanc dans un bol avec la cannelle.',
        'Ajoute la pomme, les noix concassées et le miel.'
      ],
      tips: 'Avec une poire ou des fruits rouges, ça marche aussi très bien.',
      en: {
        name: 'Fromage Blanc, Apple & Walnuts',
        tags: ['fromage blanc', 'apple', 'walnuts', 'snack'],
        ingredients: [
          '250 g 0% fromage blanc (or quark)',
          '1 apple',
          '15 g walnut halves',
          '1 tsp honey',
          '1 pinch cinnamon'
        ],
        steps: [
          'Dice the apple small (keep the skin on).',
          'Spoon the fromage blanc into a bowl with the cinnamon.',
          'Add the apple, the crushed walnuts and the honey.'
        ],
        tips: 'A pear or berries work very well too.'
      }
    },
    {
      id: 'b-tuna-toast', name: 'Tartines thon, skyr & concombre', category: 'breakfast',
      time: 5, servings: 1, protein: 39, kcal: 380,
      tags: ['thon', 'skyr', 'pain', 'en-cas'], keywords: ['tuna', 'toast', 'yogurt', 'cucumber', 'snack'],
      ingredients: [
        '1 boîte de thon au naturel (environ 110 g égoutté)',
        '40 g de skyr',
        '1 c. à café de moutarde',
        '2 tranches de pain complet',
        '1/4 de concombre',
        'Ciboulette, sel & poivre'
      ],
      steps: [
        'Égoutte le thon et émiette-le dans un bol.',
        'Ajoute le skyr, la moutarde, la ciboulette, le sel et le poivre, et mélange.',
        'Fais griller le pain si tu veux et coupe le concombre en fines rondelles.',
        'Étale le thon sur les tartines et ajoute le concombre.'
      ],
      tips: 'La préparation au thon se garde 2 jours au frigo dans une boîte fermée.',
      en: {
        name: 'Tuna, Skyr & Cucumber Toast',
        tags: ['tuna', 'skyr', 'bread', 'snack'],
        ingredients: [
          '1 can tuna in water (about 110 g drained)',
          '40 g skyr',
          '1 tsp mustard',
          '2 slices wholegrain bread',
          '1/4 cucumber',
          'Chives, salt & pepper'
        ],
        steps: [
          'Drain the tuna and flake it into a bowl.',
          'Add the skyr, mustard, chives, salt and pepper, and mix.',
          'Toast the bread if you like and slice the cucumber thinly.',
          'Spread the tuna on the toast and top with the cucumber.'
        ],
        tips: 'The tuna mix keeps for 2 days in the fridge in a closed container.'
      }
    },
    {
      id: 'b-breakfast-burrito', name: 'Burrito petit-déj œufs & dinde', category: 'breakfast',
      time: 10, servings: 1, protein: 32, kcal: 520,
      tags: ['œufs', 'dinde', 'wrap', 'fromage'], keywords: ['breakfast burrito', 'eggs', 'turkey', 'tortilla', 'cheese'],
      ingredients: [
        '2 œufs',
        '2 tranches de blanc de dinde',
        '1 grande tortilla (complète)',
        '20 g de fromage râpé',
        '1/2 poivron',
        '1 c. à café d’huile',
        'Salsa ou sauce piquante (facultatif)'
      ],
      steps: [
        'Coupe le poivron en petits dés et la dinde en lanières.',
        'Fais chauffer l’huile dans une poêle à feu moyen et fais revenir le poivron 2 minutes.',
        'Ajoute les œufs battus et brouille-les doucement 2 minutes avec la dinde.',
        'Réchauffe la tortilla 20 secondes, garnis-la avec les œufs, le fromage et la salsa.',
        'Rabats les côtés et roule bien serré.'
      ],
      tips: 'Emballé dans du papier aluminium, il se mange facilement sur le pouce.',
      en: {
        name: 'Egg & Turkey Breakfast Burrito',
        tags: ['eggs', 'turkey', 'wrap', 'cheese'],
        ingredients: [
          '2 eggs',
          '2 slices turkey breast',
          '1 large wholegrain tortilla',
          '20 g grated cheese',
          '1/2 pepper',
          '1 tsp oil',
          'Salsa or hot sauce (optional)'
        ],
        steps: [
          'Dice the pepper small and cut the turkey into strips.',
          'Heat the oil in a pan over medium heat and cook the pepper for 2 minutes.',
          'Add the beaten eggs and gently scramble them with the turkey for 2 minutes.',
          'Warm the tortilla for 20 seconds, then fill it with the eggs, cheese and salsa.',
          'Fold in the sides and roll it up tightly.'
        ],
        tips: 'Wrapped in foil, it is easy to eat on the go.'
      }
    },
    {
      id: 'b-protein-bars', name: 'Barres protéinées sans cuisson', category: 'breakfast',
      time: 15, servings: 6, protein: 15, kcal: 230,
      tags: ['flocons d’avoine', 'whey', 'beurre de cacahuète', 'en-cas'], keywords: ['protein bars', 'no bake', 'oats', 'peanut butter', 'snack', 'meal prep'],
      ingredients: [
        '120 g de flocons d’avoine',
        '60 g de whey (vanille ou chocolat)',
        '100 g de beurre de cacahuète',
        '50 g de miel',
        '60 ml de lait',
        '30 g de pépites de chocolat noir'
      ],
      steps: [
        'Tapisse un petit plat (environ 20 × 15 cm) de papier cuisson.',
        'Dans un saladier, mélange les flocons et la whey.',
        'Fais tiédir 20 secondes au micro-ondes le beurre de cacahuète et le miel, puis ajoute-les avec le lait.',
        'Mélange jusqu’à obtenir une pâte épaisse (ajoute un trait de lait si elle s’effrite), puis les pépites.',
        'Tasse bien la pâte dans le plat et mets au frigo au moins 1 heure.',
        'Découpe en 6 barres.'
      ],
      tips: 'Elles se gardent 1 semaine au frigo, emballées une par une.',
      en: {
        name: 'No-Bake Protein Bars',
        tags: ['oats', 'whey', 'peanut butter', 'snack'],
        ingredients: [
          '120 g oat flakes',
          '60 g whey protein (vanilla or chocolate)',
          '100 g peanut butter',
          '50 g honey',
          '60 ml milk',
          '30 g dark chocolate chips'
        ],
        steps: [
          'Line a small dish (about 20 × 15 cm) with baking paper.',
          'In a large bowl, mix the oats and whey.',
          'Warm the peanut butter and honey for 20 seconds in the microwave, then add them with the milk.',
          'Stir into a thick dough (add a splash of milk if it crumbles), then the chocolate chips.',
          'Press the dough firmly into the dish and chill for at least 1 hour.',
          'Cut into 6 bars.'
        ],
        tips: 'They keep for 1 week in the fridge, wrapped individually.'
      }
    },
    {
      id: 'b-shakshuka', name: 'Shakshuka express', category: 'breakfast',
      time: 20, servings: 1, protein: 27, kcal: 420,
      tags: ['œufs', 'tomates', 'poivron', 'feta'], keywords: ['shakshuka', 'eggs', 'tomatoes', 'peppers', 'feta', 'brunch'],
      ingredients: [
        '3 œufs',
        '200 g de tomates concassées en boîte',
        '1/2 poivron',
        '1/2 oignon',
        '1 gousse d’ail',
        '20 g de feta',
        '1 c. à café d’huile d’olive',
        'Cumin, paprika, sel & persil'
      ],
      steps: [
        'Émince l’oignon, coupe le poivron en dés et hache l’ail.',
        'Fais chauffer l’huile dans une petite poêle à feu moyen. Fais revenir l’oignon et le poivron 4 minutes, puis l’ail et les épices 30 secondes.',
        'Ajoute les tomates, sale, et laisse mijoter 5 minutes.',
        'Creuse 3 petits puits et casse un œuf dans chacun.',
        'Couvre et cuis 5 à 6 minutes, jusqu’à ce que les blancs soient pris et les jaunes encore coulants.',
        'Émiette la feta, parsème de persil et mange avec du pain.'
      ],
      tips: 'Parfait pour un brunch du week-end : double les quantités dans une grande poêle.',
      en: {
        name: 'Quick Shakshuka',
        tags: ['eggs', 'tomatoes', 'peppers', 'feta'],
        ingredients: [
          '3 eggs',
          '200 g canned chopped tomatoes',
          '1/2 pepper',
          '1/2 onion',
          '1 garlic clove',
          '20 g feta',
          '1 tsp olive oil',
          'Cumin, paprika, salt & parsley'
        ],
        steps: [
          'Slice the onion, dice the pepper and mince the garlic.',
          'Heat the oil in a small pan over medium heat. Cook the onion and pepper for 4 minutes, then the garlic and spices for 30 seconds.',
          'Add the tomatoes, season with salt and simmer for 5 minutes.',
          'Make 3 small wells and crack an egg into each.',
          'Cover and cook for 5–6 minutes, until the whites are set and the yolks still runny.',
          'Crumble over the feta, sprinkle with parsley and eat with bread.'
        ],
        tips: 'Perfect for a weekend brunch: double the quantities in a large pan.'
      }
    },

    /* ---------- Livret « Recettes protéinées » (PDF, 4 nov. 2026) : petits-déjeuners & brunchs, pour 2 personnes ---------- */
    {
      id: 'b-banana-skyr-pancakes', name: 'Pancakes protéinés à la banane', category: 'breakfast',
      time: 20, servings: 2, protein: 32, kcal: 480, photo: 'img/recettes/b-banana-skyr-pancakes.jpg',
      tags: ['banane', 'œufs', 'flocons d’avoine', 'skyr'], keywords: ['pancakes', 'banana', 'eggs', 'oats', 'skyr'],
      ingredients: ['2 bananes', '4 œufs', '80 g de flocons d’avoine mixés', '200 g de skyr', '1 c. à café de levure chimique', 'Miel ou sirop d’érable'],
      steps: [
        'Écrase les bananes dans un saladier. Ajoute les œufs, les flocons d’avoine et la levure, puis mélange.',
        'Fais chauffer une poêle légèrement huilée. Verse de petites portions de pâte et fais cuire les pancakes 2 à 3 minutes par face.',
        'Sers avec le skyr et un filet de miel.'
      ],
      tips: 'Retourne les pancakes quand de petites bulles apparaissent sur le dessus.',
      en: {
        name: 'Banana Protein Pancakes', tags: ['banana', 'eggs', 'oats', 'skyr'],
        ingredients: ['2 bananas', '4 eggs', '80 g blended oat flakes', '200 g skyr', '1 tsp baking powder', 'Honey or maple syrup'],
        steps: [
          'Mash the bananas in a bowl. Add the eggs, oats and baking powder, then mix.',
          'Heat a lightly oiled pan. Pour in small amounts of batter and cook the pancakes for 2–3 minutes per side.',
          'Serve with the skyr and a drizzle of honey.'
        ],
        tips: 'Flip the pancakes when small bubbles appear on top.'
      }
    },
    {
      id: 'b-choco-pb-bowlcake', name: 'Bowlcake chocolat & beurre de cacahuète', category: 'breakfast',
      time: 10, servings: 2, protein: 30, kcal: 470, photo: 'img/recettes/b-choco-pb-bowlcake.jpg',
      tags: ['flocons d’avoine', 'chocolat', 'beurre de cacahuète', 'skyr'], keywords: ['bowlcake', 'mug cake', 'chocolate', 'peanut butter', 'oats', 'microwave'],
      ingredients: ['80 g de flocons d’avoine', '2 œufs', '200 g de skyr', '20 g de cacao non sucré', '30 g de beurre de cacahuète', '1 c. à café de levure chimique', 'Quelques pépites de chocolat'],
      steps: [
        'Répartis les flocons, les œufs, le skyr, le cacao et la levure dans deux bols adaptés au micro-ondes. Mélange chaque portion.',
        'Fais cuire chaque bol environ 2 à 3 minutes, selon la puissance du micro-ondes. Le centre doit être pris.',
        'Ajoute le beurre de cacahuète et quelques pépites de chocolat sur le dessus.'
      ],
      tips: 'Prends des bols assez grands : la pâte gonfle pendant la cuisson.',
      en: {
        name: 'Chocolate & Peanut Butter Bowl Cake', tags: ['oats', 'chocolate', 'peanut butter', 'skyr'],
        ingredients: ['80 g oat flakes', '2 eggs', '200 g skyr', '20 g unsweetened cocoa', '30 g peanut butter', '1 tsp baking powder', 'A few chocolate chips'],
        steps: [
          'Share the oats, eggs, skyr, cocoa and baking powder between two microwave-safe bowls. Mix each one.',
          'Microwave each bowl for about 2–3 minutes, depending on the power. The centre should be set.',
          'Top with the peanut butter and a few chocolate chips.'
        ],
        tips: 'Use big enough bowls: the batter rises as it cooks.'
      }
    },
    {
      id: 'b-cheesecake-oats', name: 'Overnight oats façon cheesecake', category: 'breakfast',
      time: 5, servings: 2, protein: 27, kcal: 420, photo: 'img/recettes/b-cheesecake-oats.jpg',
      tags: ['flocons d’avoine', 'skyr', 'fromage frais', 'fruits rouges'], keywords: ['overnight oats', 'cheesecake', 'oats', 'skyr', 'berries'],
      ingredients: ['80 g de flocons d’avoine', '300 g de skyr', '100 ml de lait', '100 g de fromage frais', '100 g de fraises ou de fruits rouges', 'Miel'],
      steps: [
        'Dans deux pots, répartis les flocons d’avoine, le skyr et le lait. Mélange.',
        'Ajoute le fromage frais et les fruits sur le dessus. Sucre légèrement avec du miel si tu le souhaites.',
        'Couvre et laisse reposer au réfrigérateur toute la nuit.'
      ],
      tips: 'Un biscuit émietté sur le dessus au moment de servir, et c’est encore plus « cheesecake ».',
      en: {
        name: 'Cheesecake Overnight Oats', tags: ['oats', 'skyr', 'cream cheese', 'berries'],
        ingredients: ['80 g oat flakes', '300 g skyr', '100 ml milk', '100 g cream cheese', '100 g strawberries or berries', 'Honey'],
        steps: [
          'Share the oats, skyr and milk between two jars. Stir.',
          'Top with the cream cheese and fruit. Sweeten lightly with honey if you like.',
          'Cover and leave in the fridge overnight.'
        ],
        tips: 'Crumble a biscuit on top when serving for an even more cheesecake feel.'
      }
    },
    {
      id: 'b-choco-protein-crepes', name: 'Crêpes protéinées au chocolat', category: 'breakfast',
      time: 20, servings: 2, protein: 30, kcal: 520, photo: 'img/recettes/b-choco-protein-crepes.jpg',
      tags: ['crêpes', 'œufs', 'skyr', 'chocolat'], keywords: ['crepes', 'pancakes', 'chocolate', 'eggs', 'skyr'],
      ingredients: ['4 œufs', '80 g de farine', '200 ml de lait', '200 g de skyr', '1 c. à soupe de cacao non sucré', 'Quelques carrés de chocolat'],
      steps: [
        'Dans un saladier, fouette les œufs avec la farine et le lait jusqu’à obtenir une pâte lisse.',
        'Fais cuire les crêpes dans une poêle chaude légèrement graissée.',
        'Mélange le skyr avec le cacao. Garnis les crêpes de cette crème et ajoute un peu de chocolat fondu.'
      ],
      tips: 'Ajoute la farine petit à petit en fouettant pour éviter les grumeaux.',
      en: {
        name: 'Chocolate Protein Crêpes', tags: ['crêpes', 'eggs', 'skyr', 'chocolate'],
        ingredients: ['4 eggs', '80 g flour', '200 ml milk', '200 g skyr', '1 tbsp unsweetened cocoa', 'A few squares of chocolate'],
        steps: [
          'In a bowl, whisk the eggs with the flour and milk until smooth.',
          'Cook the crêpes in a hot, lightly greased pan.',
          'Mix the skyr with the cocoa. Fill the crêpes with this cream and add a little melted chocolate.'
        ],
        tips: 'Add the flour gradually while whisking to avoid lumps.'
      }
    },
    {
      id: 'b-protein-french-toast', name: 'French toast brioché protéiné', category: 'breakfast',
      time: 15, servings: 2, protein: 38, kcal: 560, photo: 'img/recettes/b-protein-french-toast.jpg',
      tags: ['brioche', 'œufs', 'skyr', 'fruits'], keywords: ['french toast', 'pain perdu', 'brioche', 'eggs', 'skyr'],
      ingredients: ['4 tranches de brioche', '4 œufs', '200 ml de lait', '300 g de skyr', '1 pincée de cannelle', 'Fruits & miel'],
      steps: [
        'Bats les œufs avec le lait et la cannelle dans une assiette creuse.',
        'Trempe les tranches de brioche dans le mélange, sans les laisser se défaire.',
        'Fais-les dorer à la poêle quelques minutes de chaque côté.',
        'Sers avec le skyr, des fruits et un filet de miel.'
      ],
      tips: 'Une brioche de la veille, un peu sèche, absorbe mieux sans se défaire.',
      en: {
        name: 'Protein Brioche French Toast', tags: ['brioche', 'eggs', 'skyr', 'fruit'],
        ingredients: ['4 slices brioche', '4 eggs', '200 ml milk', '300 g skyr', '1 pinch cinnamon', 'Fruit & honey'],
        steps: [
          'Beat the eggs with the milk and cinnamon in a shallow dish.',
          'Dip the brioche slices in the mix without letting them fall apart.',
          'Fry them for a few minutes on each side until golden.',
          'Serve with the skyr, fruit and a drizzle of honey.'
        ],
        tips: 'Day-old brioche, slightly dry, soaks up the mix without falling apart.'
      }
    },
    {
      id: 'b-avocado-egg-toasts', name: 'Toasts avocat, œufs & fromage frais', category: 'breakfast',
      time: 15, servings: 2, protein: 28, kcal: 560, photo: 'img/recettes/b-avocado-egg-toasts.jpg',
      tags: ['avocat', 'œufs', 'fromage frais', 'pain'], keywords: ['avocado toast', 'eggs', 'cream cheese', 'toast'],
      ingredients: ['4 grandes tranches de pain aux céréales', '2 avocats', '4 œufs', '120 g de fromage frais nature', '1/2 citron', 'Sel, poivre & piment doux (facultatif)'],
      steps: [
        'Fais griller les tranches de pain aux céréales.',
        'Écrase les avocats avec le jus de citron, du sel et du poivre.',
        'Fais cuire les œufs au plat ou pochés, selon ta préférence.',
        'Tartine chaque tranche de fromage frais, ajoute l’avocat puis un œuf. Termine avec du poivre ou du piment doux.'
      ],
      tips: 'Œufs pochés : un filet de vinaigre dans l’eau frémissante, 3 minutes de cuisson.',
      en: {
        name: 'Avocado, Egg & Cream Cheese Toasts', tags: ['avocado', 'eggs', 'cream cheese', 'bread'],
        ingredients: ['4 large slices seeded bread', '2 avocados', '4 eggs', '120 g plain cream cheese', '1/2 lemon', 'Salt, pepper & mild chilli (optional)'],
        steps: [
          'Toast the slices of seeded bread.',
          'Mash the avocados with the lemon juice, salt and pepper.',
          'Fry or poach the eggs, as you prefer.',
          'Spread each slice with cream cheese, add the avocado, then an egg. Finish with pepper or mild chilli.'
        ],
        tips: 'Poached eggs: a dash of vinegar in simmering water, 3 minutes.'
      }
    },
    {
      id: 'b-avocado-scrambled-feta', name: 'Toasts avocat, œufs brouillés & feta', category: 'breakfast',
      time: 15, servings: 2, protein: 27, kcal: 520,
      tags: ['avocat', 'œufs', 'feta', 'pain'], keywords: ['avocado toast', 'scrambled eggs', 'feta', 'toast'],
      ingredients: ['4 tranches de pain aux céréales', '1 avocat', '4 œufs', '80 g de feta', '2 c. à soupe de fromage frais', 'Citron, poivre & ciboulette'],
      steps: [
        'Fais griller le pain et tartine-le avec le fromage frais.',
        'Écrase l’avocat avec un peu de citron et répartis-le sur les tartines.',
        'Bats les œufs et fais-les cuire doucement à la poêle en remuant pour obtenir des œufs brouillés moelleux.',
        'Répartis les œufs sur les tartines. Émiette la feta et ajoute la ciboulette et le poivre.'
      ],
      tips: 'Pas de sel dans les œufs : la feta l’est déjà.',
      en: {
        name: 'Avocado, Scrambled Egg & Feta Toasts', tags: ['avocado', 'eggs', 'feta', 'bread'],
        ingredients: ['4 slices seeded bread', '1 avocado', '4 eggs', '80 g feta', '2 tbsp cream cheese', 'Lemon, pepper & chives'],
        steps: [
          'Toast the bread and spread it with the cream cheese.',
          'Mash the avocado with a little lemon and spread it over the toast.',
          'Beat the eggs and cook them gently in a pan, stirring, for soft scrambled eggs.',
          'Share the eggs over the toast. Crumble over the feta and add chives and pepper.'
        ],
        tips: 'No salt in the eggs: the feta is salty enough.'
      }
    },
    {
      id: 'b-salmon-avocado-toasts', name: 'Tartines saumon fumé, avocat & fromage frais', category: 'breakfast',
      time: 15, servings: 2, protein: 30, kcal: 540, photo: 'img/recettes/b-salmon-avocado-toasts.jpg',
      tags: ['saumon fumé', 'avocat', 'fromage frais', 'œufs'], keywords: ['smoked salmon', 'avocado', 'cream cheese', 'eggs', 'toast'],
      ingredients: ['4 tranches de pain aux céréales', '1 avocat', '100 g de saumon fumé', '100 g de fromage frais', '2 œufs', 'Citron, aneth & poivre'],
      steps: [
        'Fais griller le pain et tartine chaque tranche de fromage frais mélangé à un peu de citron et d’aneth.',
        'Ajoute l’avocat coupé en tranches et le saumon fumé.',
        'Fais cuire les œufs mollets ou au plat, puis dépose-les sur les tartines. Ajoute du poivre.'
      ],
      tips: 'Œufs mollets : 6 minutes dans l’eau bouillante, puis eau froide.',
      en: {
        name: 'Smoked Salmon, Avocado & Cream Cheese Toasts', tags: ['smoked salmon', 'avocado', 'cream cheese', 'eggs'],
        ingredients: ['4 slices seeded bread', '1 avocado', '100 g smoked salmon', '100 g cream cheese', '2 eggs', 'Lemon, dill & pepper'],
        steps: [
          'Toast the bread and spread each slice with cream cheese mixed with a little lemon and dill.',
          'Add the sliced avocado and the smoked salmon.',
          'Soft-boil or fry the eggs, then place them on the toast. Add pepper.'
        ],
        tips: 'Soft-boiled eggs: 6 minutes in boiling water, then cold water.'
      }
    },
    {
      id: 'b-cottage-egg-muffins', name: 'Muffins salés aux œufs, cottage cheese & légumes', category: 'breakfast',
      time: 30, servings: 2, protein: 36, kcal: 380,
      tags: ['œufs', 'cottage cheese', 'poivron', 'fromage'], keywords: ['egg muffins', 'eggs', 'cottage cheese', 'peppers', 'meal prep'],
      ingredients: ['6 œufs', '150 g de cottage cheese', '60 g de fromage râpé', '1 poivron', '1 poignée de tomates cerises', 'Sel, poivre & herbes'],
      steps: [
        'Préchauffe le four à 180 °C. Coupe le poivron et les tomates en petits morceaux.',
        'Bats les œufs avec le cottage cheese, le fromage râpé, le sel, le poivre et les herbes.',
        'Répartis les légumes dans 6 moules à muffins légèrement huilés, puis verse le mélange aux œufs.',
        'Enfourne environ 18 à 22 minutes, jusqu’à ce que les muffins soient pris. Sers-en trois par personne.'
      ],
      tips: 'Ils se gardent 3 à 4 jours au frigo : 20 secondes au micro-ondes le matin.',
      en: {
        name: 'Savoury Egg, Cottage Cheese & Veggie Muffins', tags: ['eggs', 'cottage cheese', 'peppers', 'cheese'],
        ingredients: ['6 eggs', '150 g cottage cheese', '60 g grated cheese', '1 pepper', '1 handful cherry tomatoes', 'Salt, pepper & herbs'],
        steps: [
          'Preheat the oven to 180 °C. Cut the pepper and tomatoes into small pieces.',
          'Beat the eggs with the cottage cheese, grated cheese, salt, pepper and herbs.',
          'Share the vegetables between 6 lightly oiled muffin moulds, then pour in the egg mix.',
          'Bake for about 18–22 minutes, until set. Serve three per person.'
        ],
        tips: 'They keep 3–4 days in the fridge: 20 seconds in the microwave in the morning.'
      }
    },
    {
      id: 'b-egg-avocado-bagel', name: 'Bagel œuf, avocat & fromage frais', category: 'breakfast',
      time: 10, servings: 2, protein: 28, kcal: 560,
      tags: ['bagel', 'œufs', 'avocat', 'fromage frais'], keywords: ['bagel', 'egg', 'avocado', 'cream cheese', 'breakfast sandwich'],
      ingredients: ['2 bagels', '4 œufs', '1 avocat', '100 g de fromage frais', 'Quelques feuilles de roquette', 'Citron, sel & poivre'],
      steps: [
        'Coupe les bagels en deux et fais-les griller.',
        'Fais cuire les œufs au plat ou brouillés.',
        'Écrase l’avocat avec un peu de citron, du sel et du poivre.',
        'Tartine les bagels de fromage frais, ajoute l’avocat, l’œuf et quelques feuilles de roquette. Referme et sers chaud.'
      ],
      tips: 'Emballé dans du papier aluminium, il se mange facilement sur le pouce.',
      en: {
        name: 'Egg, Avocado & Cream Cheese Bagel', tags: ['bagel', 'eggs', 'avocado', 'cream cheese'],
        ingredients: ['2 bagels', '4 eggs', '1 avocado', '100 g cream cheese', 'A few rocket leaves', 'Lemon, salt & pepper'],
        steps: [
          'Halve the bagels and toast them.',
          'Fry or scramble the eggs.',
          'Mash the avocado with a little lemon, salt and pepper.',
          'Spread the bagels with cream cheese, add the avocado, the egg and a few rocket leaves. Close and serve warm.'
        ],
        tips: 'Wrapped in foil, it is easy to eat on the go.'
      }
    },
    {
      id: 'b-tomato-mozza-egg-toast', name: 'Toast chaud tomate, mozzarella & œuf', category: 'breakfast',
      time: 15, servings: 2, protein: 34, kcal: 520,
      tags: ['œufs', 'mozzarella', 'tomates', 'pain'], keywords: ['toast', 'mozzarella', 'tomato', 'egg', 'oven'],
      ingredients: ['4 grandes tranches de pain aux céréales', '4 œufs', '125 g de mozzarella', '2 tomates', '60 g de fromage frais', 'Basilic, sel & poivre'],
      steps: [
        'Préchauffe le four à 190 °C. Tartine le pain de fromage frais.',
        'Ajoute les rondelles de tomate et la mozzarella. Assaisonne avec du basilic, du sel et du poivre.',
        'Enfourne 8 à 10 minutes, jusqu’à ce que le fromage commence à fondre.',
        'Pendant ce temps, fais cuire les œufs au plat. Dépose un œuf sur chaque tartine avant de servir.'
      ],
      tips: 'Égoutte bien la mozzarella sur du papier absorbant : le pain reste croustillant.',
      en: {
        name: 'Hot Tomato, Mozzarella & Egg Toast', tags: ['eggs', 'mozzarella', 'tomatoes', 'bread'],
        ingredients: ['4 large slices seeded bread', '4 eggs', '125 g mozzarella', '2 tomatoes', '60 g cream cheese', 'Basil, salt & pepper'],
        steps: [
          'Preheat the oven to 190 °C. Spread the bread with cream cheese.',
          'Add the tomato slices and mozzarella. Season with basil, salt and pepper.',
          'Bake for 8–10 minutes, until the cheese starts to melt.',
          'Meanwhile, fry the eggs. Put an egg on each toast before serving.'
        ],
        tips: 'Pat the mozzarella dry with kitchen paper so the bread stays crisp.'
      }
    },

    /* ---------- Déjeuner & dîner ---------- */
    {
      id: 'm-honey-garlic-chicken', name: 'Bowl poulet miel-ail & riz', category: 'main',
      time: 20, servings: 1, protein: 55, kcal: 630,
      tags: ['poulet', 'riz', 'brocoli'], keywords: ['chicken', 'rice', 'broccoli', 'honey', 'garlic'],
      ingredients: [
        '200 g de blanc de poulet',
        '75 g de riz (cru), ou 1 sachet de riz express',
        '150 g de brocoli',
        '2 gousses d’ail',
        '1 c. à soupe de miel',
        '2 c. à soupe de sauce soja',
        '1 c. à café de fécule de maïs (Maïzena)',
        '1 c. à café d’huile',
        'Graines de sésame & 1 cébette (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz selon le paquet (ou prends un sachet express).',
        'Coupe le poulet en morceaux et hache l’ail.',
        'Dans un petit bol, mélange le miel, la sauce soja, la fécule, l’ail et 3 c. à soupe d’eau : c’est la sauce.',
        'Coupe le brocoli en petits bouquets. Passe-les 3 à 4 minutes au micro-ondes dans un bol couvert avec un peu d’eau.',
        'Fais chauffer l’huile dans une poêle à feu moyen-vif. Cuis le poulet 5 à 6 minutes, jusqu’à ce qu’il soit doré et cuit à cœur (plus de rose à l’intérieur).',
        'Verse la sauce et remue 1 minute, jusqu’à ce qu’elle épaississe et enrobe le poulet.',
        'Sers le riz, le brocoli et le poulet dans un bol. Parsème de sésame et d’oignon nouveau émincé.'
      ],
      tips: 'Fais 3 portions d’un coup : elles se gardent 3 jours au frigo.',
      en: {
        name: 'Honey Garlic Chicken Rice Bowl',
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
      }
    },
    {
      id: 'm-korean-beef', name: 'Bowl de bœuf à la coréenne', category: 'main',
      time: 15, servings: 1, protein: 42, kcal: 600,
      tags: ['bœuf', 'bœuf haché', 'riz', 'œuf'], keywords: ['beef', 'ground beef', 'mince', 'rice', 'egg', 'korean'],
      ingredients: [
        '150 g de bœuf haché maigre (5 %)',
        '75 g de riz (cru), ou 1 sachet de riz express',
        '1 œuf',
        '2 gousses d’ail',
        '1 c. à café de gingembre frais râpé (ou 1/2 c. à café en poudre)',
        '2 c. à soupe de sauce soja',
        '1 c. à café de miel ou de sucre roux',
        '1 c. à café d’huile de sésame',
        '1/4 de concombre',
        '1 cébette (oignon nouveau), sésame & piment en flocons (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz.',
        'Dans un petit bol, mélange la sauce soja, le miel, l’ail haché et le gingembre.',
        'Fais chauffer une poêle à feu vif et ajoute le bœuf. Émiette-le à la spatule et cuis 5 minutes jusqu’à ce qu’il soit bien doré.',
        'Verse la sauce sur le bœuf et cuis 1 à 2 minutes jusqu’à ce qu’il soit laqué. Ajoute l’huile de sésame.',
        'Dans une autre poêle, fais cuire l’œuf au plat (ou 7 minutes dans l’eau bouillante pour un jaune fondant).',
        'Émince le concombre et l’oignon nouveau.',
        'Sers le bœuf sur le riz avec l’œuf, le concombre, l’oignon nouveau, le sésame et le piment.'
      ],
      tips: 'La dinde hachée marche aussi bien, et elle est encore plus maigre.',
      en: {
        name: 'Korean-Style Beef Bowl',
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
      }
    },
    {
      id: 'm-lemon-salmon', name: 'Saumon ail-citron & pommes de terre', category: 'main',
      time: 25, servings: 1, protein: 49, kcal: 680,
      tags: ['saumon', 'poisson', 'pommes de terre', 'haricots verts'], keywords: ['salmon', 'fish', 'potatoes', 'green beans', 'lemon'],
      ingredients: [
        '1 pavé de saumon (environ 180 g)',
        '250 g de petites pommes de terre',
        '150 g de haricots verts',
        '1 c. à soupe d’huile d’olive',
        '1 gousse d’ail',
        '1/2 citron',
        '50 g de skyr ou de yaourt grec',
        'Aneth, sel, poivre & paprika'
      ],
      steps: [
        'Préchauffe le four (ou l’air fryer) à 200 °C.',
        'Coupe les pommes de terre en deux. Passe-les 5 minutes au micro-ondes dans un bol couvert avec un peu d’eau pour avancer la cuisson.',
        'Mets les pommes de terre et les haricots verts sur une plaque. Mélange avec la moitié de l’huile, du sel, du poivre et du paprika. Enfourne 10 minutes.',
        'Mélange le reste de l’huile avec l’ail râpé, le zeste de citron, du sel et du poivre. Badigeonne le saumon.',
        'Ajoute le saumon sur la plaque et cuis 10 à 12 minutes, jusqu’à ce qu’il s’effeuille facilement à la fourchette.',
        'Pour la sauce, mélange le skyr avec l’aneth, un filet de citron et une pincée de sel.',
        'Sers avec la sauce et des quartiers de citron.'
      ],
      tips: 'Le saumon surgelé marche : décongèle-le au frigo la veille, ou ajoute 5 minutes de cuisson.',
      en: {
        name: 'Lemon Garlic Salmon & Potatoes',
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
      }
    },
    {
      id: 'm-shrimp-fried-rice', name: 'Riz sauté aux crevettes & œufs', category: 'main',
      time: 15, servings: 1, protein: 50, kcal: 650,
      tags: ['crevettes', 'œufs', 'riz', 'petits pois'], keywords: ['shrimp', 'prawns', 'eggs', 'rice', 'peas', 'fried rice'],
      ingredients: [
        '150 g de crevettes crues décortiquées',
        '2 œufs',
        '150 g de riz cuit (froid, idéalement de la veille)',
        '80 g de petits pois surgelés',
        '1 gousse d’ail',
        '2 c. à soupe de sauce soja',
        '2 c. à café d’huile',
        '1 cébette (oignon nouveau) & quelques gouttes d’huile de sésame (facultatif)'
      ],
      steps: [
        'Hache l’ail et émince l’oignon nouveau.',
        'Fais chauffer 1 c. à café d’huile dans une grande poêle ou un wok à feu vif. Cuis les crevettes 2 minutes jusqu’à ce qu’elles soient roses, puis réserve-les dans une assiette.',
        'Ajoute le reste de l’huile, l’ail et les petits pois. Remue 1 minute.',
        'Ajoute le riz froid et fais-le sauter 2 à 3 minutes en l’écrasant contre la poêle pour qu’il croustille un peu.',
        'Pousse le riz sur le côté, casse les œufs et brouille-les, puis mélange le tout.',
        'Remets les crevettes, ajoute la sauce soja et remue 1 minute. Termine avec l’oignon nouveau et quelques gouttes d’huile de sésame.'
      ],
      tips: 'Le secret, c’est le riz froid : le riz chaud devient pâteux. Un sachet de riz express marche aussi.',
      en: {
        name: 'Shrimp Egg Fried Rice',
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
    },
    {
      id: 'm-chili', name: 'Chili con carne express', category: 'main',
      time: 25, servings: 2, protein: 44, kcal: 640,
      tags: ['bœuf haché', 'haricots rouges', 'riz', 'tomates'], keywords: ['chili', 'beef', 'ground beef', 'mince', 'kidney beans', 'rice'],
      ingredients: [
        '300 g de bœuf haché maigre (5 %)',
        '1 boîte de haricots rouges (environ 250 g égouttés)',
        '400 g de tomates concassées en boîte',
        '1 oignon',
        '1 poivron',
        '2 gousses d’ail',
        '2 c. à café d’épices chili (ou paprika fumé + cumin + piment)',
        '150 g de riz (cru)',
        '1 c. à café d’huile',
        'Yaourt grec, coriandre & cheddar râpé (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz. Émince l’oignon, coupe le poivron en dés et hache l’ail.',
        'Fais chauffer l’huile dans une sauteuse à feu moyen-vif. Fais revenir l’oignon et le poivron 4 minutes.',
        'Ajoute le bœuf et l’ail. Émiette et cuis 5 minutes jusqu’à ce que la viande soit dorée.',
        'Ajoute les épices et remue 30 secondes.',
        'Verse les tomates et les haricots rincés. Laisse mijoter 10 minutes à feu doux, en remuant de temps en temps.',
        'Sale, goûte, puis sers sur le riz avec une cuillère de yaourt grec, la coriandre et un peu de cheddar.'
      ],
      tips: 'Il se congèle très bien : fais une double dose.',
      en: {
        name: 'Quick Chilli con Carne',
        tags: ['ground beef', 'kidney beans', 'rice', 'tomatoes'],
        ingredients: [
          '300 g lean ground beef (5% fat)',
          '1 can kidney beans (about 250 g drained)',
          '400 g canned chopped tomatoes',
          '1 onion',
          '1 pepper',
          '2 garlic cloves',
          '2 tsp chilli spice mix (or smoked paprika + cumin + chilli)',
          '150 g rice (uncooked)',
          '1 tsp oil',
          'Greek yogurt, coriander & grated cheddar (optional)'
        ],
        steps: [
          'Start the rice. Slice the onion, dice the pepper and mince the garlic.',
          'Heat the oil in a deep pan over medium-high heat. Cook the onion and pepper for 4 minutes.',
          'Add the beef and garlic. Break it up and cook for 5 minutes until browned.',
          'Add the spices and stir for 30 seconds.',
          'Pour in the tomatoes and the rinsed beans. Simmer for 10 minutes over low heat, stirring now and then.',
          'Season, taste, then serve over the rice with a spoonful of Greek yogurt, coriander and a little cheddar.'
        ],
        tips: 'It freezes very well: make a double batch.'
      }
    },
    {
      id: 'm-turkey-meatballs', name: 'Boulettes de dinde, sauce tomate & pâtes', category: 'main',
      time: 25, servings: 2, protein: 61, kcal: 650,
      tags: ['dinde', 'pâtes', 'tomates', 'parmesan'], keywords: ['turkey', 'meatballs', 'pasta', 'tomato', 'parmesan'],
      ingredients: [
        '400 g de dinde hachée',
        '1 œuf',
        '30 g de parmesan râpé',
        '2 gousses d’ail',
        '400 g de coulis de tomate (passata)',
        '160 g de pâtes (complètes ou protéinées)',
        '1 c. à soupe d’huile d’olive',
        'Origan, basilic, sel & poivre'
      ],
      steps: [
        'Lance la cuisson des pâtes dans l’eau bouillante salée.',
        'Dans un saladier, mélange la dinde, l’œuf, la moitié du parmesan, 1 gousse d’ail râpée, l’origan, le sel et le poivre.',
        'Forme environ 16 boulettes avec les mains mouillées.',
        'Fais chauffer l’huile dans une sauteuse à feu moyen-vif et dore les boulettes 5 minutes en les retournant.',
        'Ajoute le reste de l’ail, puis le coulis de tomate. Couvre et laisse mijoter 8 minutes : les boulettes finissent de cuire dans la sauce.',
        'Sers sur les pâtes égouttées avec le reste du parmesan et du basilic.'
      ],
      tips: 'Le poulet haché ou le bœuf 5 % marchent aussi.',
      en: {
        name: 'Turkey Meatballs, Tomato Sauce & Pasta',
        tags: ['turkey', 'pasta', 'tomatoes', 'parmesan'],
        ingredients: [
          '400 g ground turkey',
          '1 egg',
          '30 g grated parmesan',
          '2 garlic cloves',
          '400 g tomato passata',
          '160 g pasta (wholewheat or protein pasta)',
          '1 tbsp olive oil',
          'Oregano, basil, salt & pepper'
        ],
        steps: [
          'Start cooking the pasta in salted boiling water.',
          'In a large bowl, mix the turkey, egg, half the parmesan, 1 grated garlic clove, oregano, salt and pepper.',
          'Shape about 16 meatballs with wet hands.',
          'Heat the oil in a deep pan over medium-high heat and brown the meatballs for 5 minutes, turning them.',
          'Add the rest of the garlic, then the passata. Cover and simmer for 8 minutes: the meatballs finish cooking in the sauce.',
          'Serve over the drained pasta with the rest of the parmesan and basil.'
        ],
        tips: 'Ground chicken or 5% beef work too.'
      }
    },
    {
      id: 'm-cod-quinoa', name: 'Cabillaud au four, quinoa & courgettes', category: 'main',
      time: 25, servings: 1, protein: 46, kcal: 520,
      tags: ['cabillaud', 'poisson', 'quinoa', 'courgette'], keywords: ['cod', 'white fish', 'fish', 'quinoa', 'zucchini', 'courgette'],
      ingredients: [
        '1 dos de cabillaud (environ 180 g)',
        '60 g de quinoa (cru)',
        '1 courgette',
        '1 c. à soupe d’huile d’olive',
        '1/2 citron',
        '1 gousse d’ail',
        'Paprika, herbes de Provence, sel & poivre'
      ],
      steps: [
        'Préchauffe le four à 200 °C. Rince le quinoa et cuis-le 12 minutes dans 2 fois son volume d’eau salée.',
        'Coupe la courgette en demi-rondelles et mets-la sur une plaque avec la moitié de l’huile, du sel et des herbes. Enfourne 8 minutes.',
        'Mélange le reste de l’huile avec l’ail râpé, le paprika et le zeste de citron. Badigeonne le cabillaud.',
        'Pose le cabillaud sur la plaque à côté des courgettes et cuis 10 à 12 minutes, jusqu’à ce qu’il soit blanc et s’effeuille.',
        'Sers sur le quinoa avec un filet de citron.'
      ],
      tips: 'Le cabillaud surgelé marche : compte 5 minutes de plus.',
      en: {
        name: 'Baked Cod, Quinoa & Courgette',
        tags: ['cod', 'fish', 'quinoa', 'courgette'],
        ingredients: [
          '1 cod fillet (about 180 g)',
          '60 g quinoa (uncooked)',
          '1 courgette',
          '1 tbsp olive oil',
          '1/2 lemon',
          '1 garlic clove',
          'Paprika, dried herbs, salt & pepper'
        ],
        steps: [
          'Preheat the oven to 200 °C. Rinse the quinoa and cook it for 12 minutes in twice its volume of salted water.',
          'Cut the courgette into half-moons and put it on a tray with half the oil, salt and herbs. Roast for 8 minutes.',
          'Mix the rest of the oil with the grated garlic, paprika and lemon zest. Brush it over the cod.',
          'Put the cod on the tray next to the courgette and roast for 10–12 minutes, until white and flaky.',
          'Serve over the quinoa with a squeeze of lemon.'
        ],
        tips: 'Frozen cod works: allow 5 extra minutes.'
      }
    },
    {
      id: 'm-chicken-caesar', name: 'Salade César au poulet (version légère)', category: 'main',
      time: 20, servings: 1, protein: 65, kcal: 520,
      tags: ['poulet', 'salade', 'parmesan', 'œuf'], keywords: ['chicken', 'caesar', 'salad', 'lettuce', 'parmesan'],
      ingredients: [
        '180 g de blanc de poulet',
        '1 cœur de romaine',
        '1 œuf',
        '20 g de parmesan',
        '1 tranche de pain complet',
        '60 g de skyr ou de yaourt grec',
        '1 c. à café de moutarde',
        '1/2 citron',
        '1 c. à café d’huile',
        '1 petite gousse d’ail, sel & poivre'
      ],
      steps: [
        'Fais cuire l’œuf 9 minutes dans l’eau bouillante, puis passe-le sous l’eau froide.',
        'Aplatis légèrement le poulet, sale, poivre, et cuis-le 5 à 6 minutes par face dans une poêle huilée à feu moyen-vif.',
        'Coupe le pain en dés et fais-les griller 2 minutes dans la même poêle : ce sont les croûtons.',
        'Pour la sauce, mélange le skyr, la moutarde, le jus du demi-citron, l’ail râpé, la moitié du parmesan râpé et un peu de poivre.',
        'Coupe la romaine, le poulet en tranches et l’œuf en quartiers.',
        'Mélange la salade avec la sauce, puis ajoute le poulet, l’œuf, les croûtons et le reste du parmesan en copeaux.'
      ],
      tips: 'Une sauce au skyr à la place de la mayonnaise : bien plus de protéines, beaucoup moins de gras.',
      en: {
        name: 'Light Chicken Caesar Salad',
        tags: ['chicken', 'salad', 'parmesan', 'egg'],
        ingredients: [
          '180 g chicken breast',
          '1 romaine heart',
          '1 egg',
          '20 g parmesan',
          '1 slice wholegrain bread',
          '60 g skyr or Greek yogurt',
          '1 tsp mustard',
          '1/2 lemon',
          '1 tsp oil',
          '1 small garlic clove, salt & pepper'
        ],
        steps: [
          'Boil the egg for 9 minutes, then run it under cold water.',
          'Flatten the chicken slightly, season and cook for 5–6 minutes per side in an oiled pan over medium-high heat.',
          'Cut the bread into cubes and toast them for 2 minutes in the same pan: these are the croutons.',
          'For the dressing, mix the skyr, mustard, juice of the half lemon, grated garlic, half the grated parmesan and a little pepper.',
          'Chop the romaine, slice the chicken and cut the egg into quarters.',
          'Toss the salad with the dressing, then add the chicken, egg, croutons and the rest of the parmesan in shavings.'
        ],
        tips: 'A skyr dressing instead of mayonnaise: much more protein, far less fat.'
      }
    },
    {
      id: 'm-peanut-tofu', name: 'Tofu croustillant, sauce cacahuète & riz', category: 'main',
      time: 25, servings: 1, protein: 36, kcal: 640,
      tags: ['tofu', 'végétarien', 'riz', 'brocoli', 'cacahuète'], keywords: ['tofu', 'vegetarian', 'vegan', 'peanut', 'rice', 'broccoli'],
      ingredients: [
        '200 g de tofu ferme',
        '60 g de riz (cru)',
        '150 g de brocoli',
        '1 c. à soupe de fécule de maïs (Maïzena)',
        '1 c. à soupe d’huile',
        '20 g de beurre de cacahuète',
        '1 c. à soupe de sauce soja',
        '1 c. à café de miel ou de sirop d’érable',
        '1/2 citron vert & sésame (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz. Égoutte le tofu, presse-le entre deux torchons 5 minutes, puis coupe-le en cubes.',
        'Roule les cubes dans la fécule avec une pincée de sel.',
        'Fais chauffer l’huile dans une poêle antiadhésive à feu moyen-vif et dore le tofu 8 à 10 minutes, en le retournant pour qu’il croustille de tous les côtés.',
        'Pendant ce temps, passe le brocoli 3 à 4 minutes au micro-ondes dans un bol couvert avec un peu d’eau.',
        'Pour la sauce, mélange le beurre de cacahuète, la sauce soja, le miel, le jus de citron vert et 2 c. à soupe d’eau chaude.',
        'Sers le riz, le brocoli et le tofu, nappe de sauce et parsème de sésame.'
      ],
      tips: 'Plus le tofu est sec, plus il croustille : ne saute pas l’étape du torchon.',
      en: {
        name: 'Crispy Tofu, Peanut Sauce & Rice',
        tags: ['tofu', 'vegetarian', 'rice', 'broccoli', 'peanut'],
        ingredients: [
          '200 g firm tofu',
          '60 g rice (uncooked)',
          '150 g broccoli',
          '1 tbsp cornflour',
          '1 tbsp oil',
          '20 g peanut butter',
          '1 tbsp soy sauce',
          '1 tsp honey or maple syrup',
          '1/2 lime & sesame seeds (optional)'
        ],
        steps: [
          'Start the rice. Drain the tofu, press it between two tea towels for 5 minutes, then cut it into cubes.',
          'Roll the cubes in the cornflour with a pinch of salt.',
          'Heat the oil in a non-stick pan over medium-high heat and brown the tofu for 8–10 minutes, turning it so it crisps on all sides.',
          'Meanwhile, microwave the broccoli for 3–4 minutes in a covered bowl with a splash of water.',
          'For the sauce, mix the peanut butter, soy sauce, honey, lime juice and 2 tbsp of hot water.',
          'Serve the rice, broccoli and tofu, pour over the sauce and sprinkle with sesame seeds.'
        ],
        tips: 'The drier the tofu, the crispier it gets: do not skip the tea towel step.'
      }
    },
    {
      id: 'm-paprika-chicken-tray', name: 'Poulet au paprika & patates douces sur plaque', category: 'main',
      time: 30, servings: 2, protein: 57, kcal: 560,
      tags: ['poulet', 'patate douce', 'poivron', 'four'], keywords: ['chicken', 'sweet potato', 'tray bake', 'sheet pan', 'peppers'],
      ingredients: [
        '400 g de hauts de cuisse ou de blancs de poulet',
        '2 patates douces (environ 500 g)',
        '1 poivron',
        '1 oignon (rouge)',
        '2 c. à soupe d’huile d’olive',
        '2 c. à café de paprika fumé',
        '100 g de skyr',
        '1/2 citron, ail en poudre, sel & poivre'
      ],
      steps: [
        'Préchauffe le four à 210 °C.',
        'Coupe les patates douces en cubes de 2 cm, le poivron et l’oignon en morceaux.',
        'Sur une grande plaque, mélange les légumes avec la moitié de l’huile, du sel et du poivre. Enfourne 10 minutes.',
        'Coupe le poulet en gros morceaux et mélange-le avec le reste de l’huile, le paprika, l’ail en poudre et du sel.',
        'Ajoute le poulet sur la plaque et cuis encore 15 à 18 minutes, jusqu’à ce qu’il soit doré et cuit à cœur.',
        'Mélange le skyr avec le jus du citron et une pincée de sel, et sers en sauce.'
      ],
      tips: 'Une seule plaque, presque pas de vaisselle : idéal en semaine.',
      en: {
        name: 'Paprika Chicken & Sweet Potato Tray Bake',
        tags: ['chicken', 'sweet potato', 'peppers', 'oven'],
        ingredients: [
          '400 g chicken thighs or breasts',
          '2 sweet potatoes (about 500 g)',
          '1 pepper',
          '1 red onion',
          '2 tbsp olive oil',
          '2 tsp smoked paprika',
          '100 g skyr',
          '1/2 lemon, garlic powder, salt & pepper'
        ],
        steps: [
          'Preheat the oven to 210 °C.',
          'Cut the sweet potatoes into 2 cm cubes, and the pepper and onion into chunks.',
          'On a large tray, toss the vegetables with half the oil, salt and pepper. Roast for 10 minutes.',
          'Cut the chicken into large pieces and toss with the rest of the oil, the paprika, garlic powder and salt.',
          'Add the chicken to the tray and roast for another 15–18 minutes, until golden and cooked through.',
          'Mix the skyr with the lemon juice and a pinch of salt, and serve as a sauce.'
        ],
        tips: 'One tray, hardly any washing-up: ideal on weeknights.'
      }
    },
    {
      id: 'm-beef-noodles', name: 'Wok de bœuf aux nouilles & légumes', category: 'main',
      time: 20, servings: 1, protein: 42, kcal: 620,
      tags: ['bœuf', 'nouilles', 'brocoli', 'wok'], keywords: ['beef', 'noodles', 'stir fry', 'wok', 'broccoli'],
      ingredients: [
        '150 g de bœuf à wok (rumsteck ou bavette) en lanières',
        '70 g de nouilles chinoises (sèches)',
        '150 g de légumes à wok (brocoli, carotte, poivron, frais ou surgelés)',
        '1 gousse d’ail',
        '1 c. à café de gingembre râpé',
        '2 c. à soupe de sauce soja',
        '1 c. à soupe de sauce d’huître (ou 1 c. à café de miel)',
        '1 c. à café d’huile'
      ],
      steps: [
        'Cuis les nouilles selon le paquet, égoutte-les et passe-les sous l’eau froide.',
        'Mélange la sauce soja, la sauce d’huître, l’ail haché, le gingembre et 2 c. à soupe d’eau.',
        'Fais chauffer l’huile dans un wok à feu très vif. Saisis le bœuf 1 à 2 minutes, puis réserve-le.',
        'Fais sauter les légumes 3 à 4 minutes : ils doivent rester croquants.',
        'Ajoute les nouilles, le bœuf et la sauce, et fais sauter 1 minute en remuant.'
      ],
      tips: 'Le wok doit être très chaud : la viande saisit au lieu de bouillir.',
      en: {
        name: 'Beef Noodle Stir-Fry',
        tags: ['beef', 'noodles', 'broccoli', 'wok'],
        ingredients: [
          '150 g beef stir-fry strips (rump or flank)',
          '70 g egg noodles (dry)',
          '150 g stir-fry vegetables (broccoli, carrot, pepper, fresh or frozen)',
          '1 garlic clove',
          '1 tsp grated ginger',
          '2 tbsp soy sauce',
          '1 tbsp oyster sauce (or 1 tsp honey)',
          '1 tsp oil'
        ],
        steps: [
          'Cook the noodles following the pack, drain and rinse them under cold water.',
          'Mix the soy sauce, oyster sauce, minced garlic, ginger and 2 tbsp of water.',
          'Heat the oil in a wok over very high heat. Sear the beef for 1–2 minutes, then set it aside.',
          'Stir-fry the vegetables for 3–4 minutes: they should stay crunchy.',
          'Add the noodles, beef and sauce, and stir-fry for 1 minute.'
        ],
        tips: 'The wok must be very hot so the meat sears instead of stewing.'
      }
    },
    {
      id: 'm-teriyaki-salmon', name: 'Saumon teriyaki, riz & edamame', category: 'main',
      time: 20, servings: 1, protein: 48, kcal: 690,
      tags: ['saumon', 'poisson', 'riz', 'edamame'], keywords: ['salmon', 'teriyaki', 'fish', 'rice', 'edamame'],
      ingredients: [
        '1 pavé de saumon (environ 180 g)',
        '75 g de riz (cru), ou 1 sachet de riz express',
        '80 g d’edamame surgelés',
        '2 c. à soupe de sauce soja',
        '1 c. à soupe de miel',
        '1 c. à café de vinaigre de riz (ou de citron)',
        '1 c. à café d’huile',
        'Sésame & 1 cébette (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz. Fais cuire les edamame 4 minutes dans l’eau bouillante.',
        'Mélange la sauce soja, le miel et le vinaigre.',
        'Fais chauffer l’huile dans une poêle à feu moyen-vif. Cuis le saumon 4 minutes côté peau, puis 2 minutes de l’autre côté.',
        'Baisse le feu, verse la sauce et laisse-la réduire 1 à 2 minutes en arrosant le saumon : il devient brillant.',
        'Sers sur le riz avec les edamame, le sésame et la cébette émincée.'
      ],
      tips: 'La sauce caramélise vite : baisse bien le feu avant de la verser.',
      en: {
        name: 'Teriyaki Salmon, Rice & Edamame',
        tags: ['salmon', 'fish', 'rice', 'edamame'],
        ingredients: [
          '1 salmon fillet (about 180 g)',
          '75 g rice (uncooked), or 1 microwave rice pouch',
          '80 g frozen edamame',
          '2 tbsp soy sauce',
          '1 tbsp honey',
          '1 tsp rice vinegar (or lemon juice)',
          '1 tsp oil',
          'Sesame seeds & 1 spring onion (optional)'
        ],
        steps: [
          'Start the rice. Cook the edamame for 4 minutes in boiling water.',
          'Mix the soy sauce, honey and vinegar.',
          'Heat the oil in a pan over medium-high heat. Cook the salmon for 4 minutes skin side down, then 2 minutes on the other side.',
          'Lower the heat, pour in the sauce and let it reduce for 1–2 minutes, basting the salmon: it turns glossy.',
          'Serve over the rice with the edamame, sesame seeds and sliced spring onion.'
        ],
        tips: 'The sauce caramelises fast: turn the heat right down before pouring it in.'
      }
    },
    {
      id: 'm-lentil-dahl', name: 'Dahl de lentilles corail & œufs', category: 'main',
      time: 25, servings: 2, protein: 36, kcal: 560,
      tags: ['lentilles', 'végétarien', 'œufs', 'épinards'], keywords: ['dahl', 'dal', 'lentils', 'vegetarian', 'eggs', 'spinach'],
      ingredients: [
        '160 g de lentilles corail',
        '4 œufs',
        '200 ml de lait de coco allégé',
        '200 g de tomates concassées en boîte',
        '1 oignon',
        '2 gousses d’ail',
        '2 c. à café de curry en poudre',
        '2 poignées d’épinards',
        '1 c. à café d’huile',
        '100 g de yaourt grec, coriandre & citron (facultatif)'
      ],
      steps: [
        'Émince l’oignon et hache l’ail. Rince les lentilles.',
        'Fais chauffer l’huile dans une casserole à feu moyen et fais revenir l’oignon 3 minutes, puis l’ail et le curry 1 minute.',
        'Ajoute les lentilles, le lait de coco, les tomates et 300 ml d’eau. Laisse mijoter 15 minutes en remuant, jusqu’à ce que les lentilles fondent.',
        'Pendant ce temps, cuis les œufs 7 minutes dans l’eau bouillante, puis écale-les.',
        'Ajoute les épinards au dahl et sale. Sers avec les œufs coupés en deux, le yaourt et la coriandre.'
      ],
      tips: 'Les lentilles corail n’ont pas besoin de trempage : elles cuisent en 15 minutes.',
      en: {
        name: 'Red Lentil Dahl & Eggs',
        tags: ['lentils', 'vegetarian', 'eggs', 'spinach'],
        ingredients: [
          '160 g red lentils',
          '4 eggs',
          '200 ml light coconut milk',
          '200 g canned chopped tomatoes',
          '1 onion',
          '2 garlic cloves',
          '2 tsp curry powder',
          '2 handfuls spinach',
          '1 tsp oil',
          '100 g Greek yogurt, coriander & lemon (optional)'
        ],
        steps: [
          'Slice the onion and mince the garlic. Rinse the lentils.',
          'Heat the oil in a saucepan over medium heat and cook the onion for 3 minutes, then the garlic and curry powder for 1 minute.',
          'Add the lentils, coconut milk, tomatoes and 300 ml of water. Simmer for 15 minutes, stirring, until the lentils break down.',
          'Meanwhile, boil the eggs for 7 minutes, then peel them.',
          'Stir the spinach into the dahl and season with salt. Serve with the halved eggs, yogurt and coriander.'
        ],
        tips: 'Red lentils need no soaking: they cook in 15 minutes.'
      }
    },
    {
      id: 'm-shrimp-poke', name: 'Poke bowl crevettes & edamame', category: 'main',
      time: 15, servings: 1, protein: 42, kcal: 600,
      tags: ['crevettes', 'riz', 'edamame', 'avocat'], keywords: ['poke', 'bowl', 'shrimp', 'prawns', 'rice', 'edamame', 'avocado'],
      ingredients: [
        '150 g de crevettes cuites décortiquées',
        '75 g de riz (cru), ou 1 sachet de riz express',
        '80 g d’edamame surgelés',
        '1/2 avocat',
        '1/4 de concombre',
        '1 carotte',
        '2 c. à soupe de sauce soja',
        '1 c. à café d’huile de sésame',
        'Sésame & 1/2 citron vert'
      ],
      steps: [
        'Cuis le riz et laisse-le tiédir. Cuis les edamame 4 minutes dans l’eau bouillante.',
        'Coupe le concombre et l’avocat en dés, râpe la carotte.',
        'Mélange la sauce soja, l’huile de sésame et le jus du citron vert.',
        'Mets le riz au fond du bol et dispose dessus les crevettes, les edamame et les légumes.',
        'Arrose de sauce et parsème de sésame.'
      ],
      tips: 'Le thon en boîte remplace très bien les crevettes.',
      en: {
        name: 'Shrimp & Edamame Poke Bowl',
        tags: ['shrimp', 'rice', 'edamame', 'avocado'],
        ingredients: [
          '150 g cooked peeled prawns (shrimp)',
          '75 g rice (uncooked), or 1 microwave rice pouch',
          '80 g frozen edamame',
          '1/2 avocado',
          '1/4 cucumber',
          '1 carrot',
          '2 tbsp soy sauce',
          '1 tsp sesame oil',
          'Sesame seeds & 1/2 lime'
        ],
        steps: [
          'Cook the rice and let it cool slightly. Cook the edamame for 4 minutes in boiling water.',
          'Dice the cucumber and avocado, and grate the carrot.',
          'Mix the soy sauce, sesame oil and lime juice.',
          'Put the rice at the bottom of the bowl and arrange the prawns, edamame and vegetables on top.',
          'Drizzle with the sauce and sprinkle with sesame seeds.'
        ],
        tips: 'Canned tuna is a great swap for the prawns.'
      }
    },
    {
      id: 'm-bolognese', name: 'Pâtes bolognaise express', category: 'main',
      time: 25, servings: 2, protein: 45, kcal: 640,
      tags: ['bœuf haché', 'pâtes', 'tomates', 'parmesan'], keywords: ['bolognese', 'pasta', 'beef', 'ground beef', 'mince', 'spaghetti'],
      ingredients: [
        '300 g de bœuf haché maigre (5 %)',
        '160 g de spaghettis (complets ou protéinés)',
        '400 g de coulis de tomate (passata)',
        '1 oignon',
        '1 carotte',
        '2 gousses d’ail',
        '1 c. à café d’huile d’olive',
        '20 g de parmesan râpé',
        'Origan, basilic, sel & poivre'
      ],
      steps: [
        'Hache finement l’oignon, la carotte et l’ail (ou râpe la carotte).',
        'Fais chauffer l’huile dans une sauteuse à feu moyen et fais revenir les légumes 4 minutes.',
        'Ajoute le bœuf, émiette-le et cuis 5 minutes jusqu’à ce qu’il soit doré.',
        'Verse le coulis, ajoute l’origan, sale, poivre, et laisse mijoter 12 minutes à feu doux.',
        'Pendant ce temps, cuis les pâtes dans l’eau bouillante salée.',
        'Mélange les pâtes à la sauce et sers avec le parmesan et le basilic.'
      ],
      tips: 'La sauce se congèle très bien : fais-en une grande casserole.',
      en: {
        name: 'Quick Pasta Bolognese',
        tags: ['ground beef', 'pasta', 'tomatoes', 'parmesan'],
        ingredients: [
          '300 g lean ground beef (5% fat)',
          '160 g spaghetti (wholewheat or protein pasta)',
          '400 g tomato passata',
          '1 onion',
          '1 carrot',
          '2 garlic cloves',
          '1 tsp olive oil',
          '20 g grated parmesan',
          'Oregano, basil, salt & pepper'
        ],
        steps: [
          'Finely chop the onion, carrot and garlic (or grate the carrot).',
          'Heat the oil in a deep pan over medium heat and cook the vegetables for 4 minutes.',
          'Add the beef, break it up and cook for 5 minutes until browned.',
          'Pour in the passata, add the oregano, salt and pepper, and simmer for 12 minutes over low heat.',
          'Meanwhile, cook the pasta in salted boiling water.',
          'Toss the pasta with the sauce and serve with the parmesan and basil.'
        ],
        tips: 'The sauce freezes very well: make a big pot.'
      }
    },
    {
      id: 'm-mustard-turkey', name: 'Escalopes de dinde à la moutarde & haricots verts', category: 'main',
      time: 20, servings: 1, protein: 50, kcal: 520,
      tags: ['dinde', 'moutarde', 'haricots verts', 'pommes de terre'], keywords: ['turkey', 'mustard', 'green beans', 'potatoes'],
      ingredients: [
        '2 escalopes de dinde (environ 180 g)',
        '200 g de pommes de terre',
        '150 g de haricots verts',
        '1 c. à soupe de moutarde à l’ancienne',
        '50 g de crème légère (ou de skyr)',
        '1 échalote',
        '1 c. à café d’huile',
        'Sel, poivre & persil'
      ],
      steps: [
        'Coupe les pommes de terre en morceaux et cuis-les 12 minutes dans l’eau bouillante salée avec les haricots verts ajoutés pour les 6 dernières minutes.',
        'Émince l’échalote.',
        'Fais chauffer l’huile dans une poêle à feu moyen-vif. Sale les escalopes et cuis-les 3 minutes par face. Réserve-les.',
        'Fais revenir l’échalote 1 minute dans la même poêle, puis ajoute la moutarde, la crème et 2 c. à soupe d’eau. Remue 1 minute.',
        'Remets les escalopes dans la sauce, poivre et sers avec les légumes et le persil.'
      ],
      tips: 'Avec du skyr, ajoute-le hors du feu pour que la sauce ne tranche pas.',
      en: {
        name: 'Mustard Turkey Escalopes & Green Beans',
        tags: ['turkey', 'mustard', 'green beans', 'potatoes'],
        ingredients: [
          '2 turkey escalopes (about 180 g)',
          '200 g potatoes',
          '150 g green beans',
          '1 tbsp wholegrain mustard',
          '50 g light cream (or skyr)',
          '1 shallot',
          '1 tsp oil',
          'Salt, pepper & parsley'
        ],
        steps: [
          'Cut the potatoes into chunks and boil them for 12 minutes in salted water, adding the green beans for the last 6 minutes.',
          'Slice the shallot.',
          'Heat the oil in a pan over medium-high heat. Season the escalopes and cook for 3 minutes per side. Set them aside.',
          'Cook the shallot for 1 minute in the same pan, then add the mustard, cream and 2 tbsp of water. Stir for 1 minute.',
          'Return the escalopes to the sauce, season with pepper and serve with the vegetables and parsley.'
        ],
        tips: 'If using skyr, add it off the heat so the sauce does not split.'
      }
    },
    {
      id: 'm-chicken-ramen', name: 'Ramen express au poulet & œuf', category: 'main',
      time: 20, servings: 1, protein: 46, kcal: 580,
      tags: ['poulet', 'nouilles', 'œuf', 'soupe'], keywords: ['ramen', 'noodle soup', 'chicken', 'egg', 'soup'],
      ingredients: [
        '150 g de blanc de poulet',
        '1 œuf',
        '60 g de nouilles ramen ou de nouilles chinoises (sèches)',
        '500 ml de bouillon de volaille',
        '2 c. à soupe de sauce soja',
        '1 gousse d’ail',
        '1 c. à café de gingembre râpé',
        '1 poignée de pousses d’épinards ou de bok choy',
        '1 cébette, sésame & piment (facultatif)'
      ],
      steps: [
        'Porte le bouillon à frémissement avec la sauce soja, l’ail écrasé et le gingembre.',
        'Ajoute le poulet entier et laisse pocher 10 à 12 minutes à petit feu, jusqu’à ce qu’il soit cuit à cœur. Sors-le et coupe-le en tranches.',
        'Pendant ce temps, cuis l’œuf 7 minutes dans l’eau bouillante, puis passe-le sous l’eau froide et écale-le.',
        'Cuis les nouilles dans le bouillon 3 minutes, en ajoutant les épinards à la fin.',
        'Verse dans un grand bol, ajoute le poulet, l’œuf coupé en deux, la cébette, le sésame et le piment.'
      ],
      tips: 'Pocher le poulet dans le bouillon le garde tendre et parfume la soupe.',
      en: {
        name: 'Quick Chicken & Egg Ramen',
        tags: ['chicken', 'noodles', 'egg', 'soup'],
        ingredients: [
          '150 g chicken breast',
          '1 egg',
          '60 g ramen or egg noodles (dry)',
          '500 ml chicken stock',
          '2 tbsp soy sauce',
          '1 garlic clove',
          '1 tsp grated ginger',
          '1 handful baby spinach or bok choy',
          '1 spring onion, sesame seeds & chilli (optional)'
        ],
        steps: [
          'Bring the stock to a simmer with the soy sauce, crushed garlic and ginger.',
          'Add the whole chicken breast and poach for 10–12 minutes over low heat, until cooked through. Take it out and slice it.',
          'Meanwhile, boil the egg for 7 minutes, then run it under cold water and peel it.',
          'Cook the noodles in the stock for 3 minutes, adding the spinach at the end.',
          'Pour into a large bowl, add the chicken, halved egg, spring onion, sesame seeds and chilli.'
        ],
        tips: 'Poaching the chicken in the stock keeps it tender and flavours the soup.'
      }
    },
    {
      id: 'm-lentil-feta-salad', name: 'Salade de lentilles, feta & œufs', category: 'main',
      time: 15, servings: 1, protein: 36, kcal: 560,
      tags: ['lentilles', 'feta', 'œufs', 'végétarien', 'salade'], keywords: ['lentil salad', 'lentils', 'feta', 'eggs', 'vegetarian', 'salad'],
      ingredients: [
        '200 g de lentilles cuites (en boîte ou sous vide, égouttées)',
        '2 œufs',
        '40 g de feta',
        '100 g de tomates cerises',
        '1/4 de concombre',
        '1/4 d’oignon rouge',
        '1 c. à soupe d’huile d’olive',
        '1 c. à café de moutarde, 1/2 citron, sel & poivre'
      ],
      steps: [
        'Cuis les œufs 9 minutes dans l’eau bouillante, puis passe-les sous l’eau froide.',
        'Rince et égoutte les lentilles.',
        'Coupe les tomates en deux, le concombre en dés et l’oignon très finement.',
        'Dans le saladier, mélange l’huile, la moutarde, le jus du citron, le sel et le poivre.',
        'Ajoute les lentilles et les légumes et mélange. Termine avec la feta émiettée et les œufs en quartiers.'
      ],
      tips: 'Elle se garde 2 jours au frigo : parfaite à emporter.',
      en: {
        name: 'Lentil, Feta & Egg Salad',
        tags: ['lentils', 'feta', 'eggs', 'vegetarian', 'salad'],
        ingredients: [
          '200 g cooked lentils (canned or pouch, drained)',
          '2 eggs',
          '40 g feta',
          '100 g cherry tomatoes',
          '1/4 cucumber',
          '1/4 red onion',
          '1 tbsp olive oil',
          '1 tsp mustard, 1/2 lemon, salt & pepper'
        ],
        steps: [
          'Boil the eggs for 9 minutes, then run them under cold water.',
          'Rinse and drain the lentils.',
          'Halve the tomatoes, dice the cucumber and slice the onion very thinly.',
          'In the salad bowl, mix the oil, mustard, lemon juice, salt and pepper.',
          'Add the lentils and vegetables and toss. Finish with the crumbled feta and the egg quarters.'
        ],
        tips: 'It keeps for 2 days in the fridge: perfect to take with you.'
      }
    },
    {
      id: 'm-tortilla-pizza', name: 'Pizza tortilla protéinée', category: 'main',
      time: 15, servings: 1, protein: 53, kcal: 560,
      tags: ['pizza', 'jambon', 'mozzarella', 'wrap'], keywords: ['pizza', 'tortilla', 'ham', 'mozzarella', 'cheese'],
      ingredients: [
        '2 tortillas complètes',
        '4 c. à soupe de coulis de tomate',
        '3 tranches de jambon blanc',
        '1 boule de mozzarella light (125 g)',
        '4 champignons',
        '1 poignée de roquette',
        'Origan & huile d’olive'
      ],
      steps: [
        'Préchauffe le four (ou l’air fryer) à 220 °C.',
        'Pose les tortillas sur une plaque et étale le coulis de tomate jusqu’au bord.',
        'Ajoute le jambon déchiré, les champignons émincés et la mozzarella en morceaux. Parsème d’origan.',
        'Enfourne 7 à 9 minutes, jusqu’à ce que le bord soit croustillant et le fromage fondu.',
        'Ajoute la roquette et un filet d’huile d’olive à la sortie du four.'
      ],
      tips: 'Remplace le jambon par du poulet cuit ou du thon pour varier.',
      en: {
        name: 'Protein Tortilla Pizza',
        tags: ['pizza', 'ham', 'mozzarella', 'wrap'],
        ingredients: [
          '2 wholegrain tortillas',
          '4 tbsp tomato passata',
          '3 slices cooked ham',
          '1 ball light mozzarella (125 g)',
          '4 mushrooms',
          '1 handful rocket',
          'Oregano & olive oil'
        ],
        steps: [
          'Preheat the oven (or air fryer) to 220 °C.',
          'Lay the tortillas on a tray and spread the passata right to the edge.',
          'Add the torn ham, sliced mushrooms and mozzarella pieces. Sprinkle with oregano.',
          'Bake for 7–9 minutes, until the edge is crisp and the cheese melted.',
          'Top with the rocket and a drizzle of olive oil straight out of the oven.'
        ],
        tips: 'Swap the ham for cooked chicken or tuna for variety.'
      }
    },
    /* ---------- Livret « Recettes protéinées » (PDF, 4 nov. 2026) : plats salés, pour 2 personnes ---------- */
    {
      id: 'm-creamy-chicken-pasta', name: 'Pâtes crémeuses au poulet, parmesan & tomates', category: 'main',
      time: 25, servings: 2, protein: 58, kcal: 680, photo: 'img/recettes/m-creamy-chicken-pasta.jpg',
      tags: ['poulet', 'pâtes', 'cottage cheese', 'parmesan', 'tomates'], keywords: ['chicken', 'pasta', 'creamy', 'cottage cheese', 'parmesan', 'tomatoes'],
      ingredients: ['200 g de pâtes', '240 g de blanc de poulet', '200 g de tomates cerises', '200 g de cottage cheese', '30 g de parmesan râpé', '2 gousses d’ail', '1 filet d’huile d’olive', 'Basilic, sel & poivre'],
      steps: [
        'Fais cuire les pâtes dans une grande casserole d’eau salée. Avant de les égoutter, garde une petite tasse d’eau de cuisson.',
        'Pendant ce temps, coupe le poulet en morceaux. Fais-le dorer dans une poêle avec un filet d’huile et l’ail haché. Vérifie qu’il est bien cuit à cœur.',
        'Ajoute les tomates cerises coupées en deux et laisse cuire 3 à 4 minutes.',
        'Mixe le cottage cheese avec 3 à 4 cuillères à soupe d’eau de cuisson pour obtenir une sauce lisse.',
        'Ajoute les pâtes et la sauce dans la poêle. Mélange doucement, ajuste la texture avec un peu d’eau de cuisson, puis termine avec le parmesan et le basilic.'
      ],
      tips: 'Ajoute l’eau de cuisson petit à petit : la sauce doit napper les pâtes sans être liquide.',
      en: {
        name: 'Creamy Chicken, Parmesan & Tomato Pasta', tags: ['chicken', 'pasta', 'cottage cheese', 'parmesan', 'tomatoes'],
        ingredients: ['200 g pasta', '240 g chicken breast', '200 g cherry tomatoes', '200 g cottage cheese', '30 g grated parmesan', '2 garlic cloves', '1 drizzle of olive oil', 'Basil, salt & pepper'],
        steps: [
          'Cook the pasta in a large pan of salted water. Before draining, keep a small cup of the cooking water.',
          'Meanwhile, cut the chicken into pieces. Brown it in a pan with a drizzle of oil and the chopped garlic. Make sure it is cooked through.',
          'Add the halved cherry tomatoes and cook for 3–4 minutes.',
          'Blend the cottage cheese with 3–4 tbsp of the cooking water until smooth.',
          'Add the pasta and the sauce to the pan. Stir gently, loosen with a little cooking water, then finish with the parmesan and basil.'
        ],
        tips: 'Add the cooking water little by little: the sauce should coat the pasta without being runny.'
      }
    },
    {
      id: 'm-chicken-avocado-bowl', name: 'Bowl poulet, avocat & sauce au fromage blanc', category: 'main',
      time: 25, servings: 2, protein: 45, kcal: 640, photo: 'img/recettes/m-chicken-avocado-bowl.jpg',
      tags: ['poulet', 'riz', 'avocat', 'fromage blanc'], keywords: ['chicken', 'rice', 'avocado', 'bowl', 'quark'],
      ingredients: ['240 g de blanc de poulet', '200 g de riz (cru)', '1 avocat', '200 g de fromage blanc', '1 poignée de tomates cerises', '1 citron', '1 gousse d’ail', 'Paprika, sel & poivre'],
      steps: [
        'Fais cuire le riz selon les indications du paquet.',
        'Coupe le poulet en morceaux. Assaisonne-le avec le paprika, du sel et du poivre, puis fais-le cuire à la poêle jusqu’à ce qu’il soit bien cuit à cœur.',
        'Mélange le fromage blanc avec un peu de jus de citron, l’ail pressé, du sel et du poivre.',
        'Coupe l’avocat et les tomates. Répartis le riz, le poulet et les légumes dans deux bols, puis ajoute la sauce.'
      ],
      tips: 'Coupe l’avocat au dernier moment pour qu’il ne noircisse pas.',
      en: {
        name: 'Chicken & Avocado Bowl with Fromage Blanc Sauce', tags: ['chicken', 'rice', 'avocado', 'fromage blanc'],
        ingredients: ['240 g chicken breast', '200 g rice (uncooked)', '1 avocado', '200 g fromage blanc (or quark)', '1 handful cherry tomatoes', '1 lemon', '1 garlic clove', 'Paprika, salt & pepper'],
        steps: [
          'Cook the rice following the pack instructions.',
          'Cut the chicken into pieces. Season with paprika, salt and pepper, then pan-fry until cooked through.',
          'Mix the fromage blanc with a little lemon juice, the crushed garlic, salt and pepper.',
          'Slice the avocado and tomatoes. Share the rice, chicken and vegetables between two bowls, then add the sauce.'
        ],
        tips: 'Cut the avocado at the last minute so it does not brown.'
      }
    },
    {
      id: 'm-chicken-cheddar-wraps', name: 'Wraps poulet, cheddar & sauce crémeuse', category: 'main',
      time: 20, servings: 2, protein: 55, kcal: 620, photo: 'img/recettes/m-chicken-cheddar-wraps.jpg',
      tags: ['poulet', 'wrap', 'cheddar', 'skyr'], keywords: ['chicken', 'wrap', 'tortilla', 'cheddar', 'cheese'],
      ingredients: ['4 tortillas', '240 g de blanc de poulet', '60 g de cheddar', '160 g de skyr nature', '2 tomates', 'Quelques feuilles de salade', 'Ail, paprika & citron'],
      steps: [
        'Coupe le poulet en fines lamelles. Assaisonne-le avec le paprika et fais-le cuire à la poêle jusqu’à ce qu’il soit bien cuit.',
        'Prépare la sauce en mélangeant le skyr, un peu de jus de citron et l’ail pressé.',
        'Répartis le poulet, le cheddar, les tomates et la salade sur les tortillas. Ajoute la sauce.',
        'Roule les wraps et fais-les dorer quelques minutes à la poêle, sur chaque face.'
      ],
      tips: 'Pose les wraps côté fermeture contre la poêle en premier : ils restent bien fermés.',
      en: {
        name: 'Chicken & Cheddar Wraps with Creamy Sauce', tags: ['chicken', 'wrap', 'cheddar', 'skyr'],
        ingredients: ['4 tortillas', '240 g chicken breast', '60 g cheddar', '160 g plain skyr', '2 tomatoes', 'A few lettuce leaves', 'Garlic, paprika & lemon'],
        steps: [
          'Slice the chicken into thin strips. Season with paprika and pan-fry until cooked through.',
          'Make the sauce by mixing the skyr with a little lemon juice and the crushed garlic.',
          'Share the chicken, cheddar, tomatoes and lettuce between the tortillas. Add the sauce.',
          'Roll up the wraps and toast them in the pan for a few minutes on each side.'
        ],
        tips: 'Put the wraps seam-side down in the pan first so they stay closed.'
      }
    },
    {
      id: 'm-creamy-chicken-gnocchi', name: 'Gnocchis crémeux au poulet & parmesan', category: 'main',
      time: 20, servings: 2, protein: 54, kcal: 700, photo: 'img/recettes/m-creamy-chicken-gnocchi.jpg',
      tags: ['poulet', 'gnocchis', 'cottage cheese', 'parmesan'], keywords: ['chicken', 'gnocchi', 'creamy', 'cottage cheese', 'parmesan'],
      ingredients: ['400 g de gnocchis', '240 g de blanc de poulet', '200 g de cottage cheese', '40 g de parmesan râpé', '1 poignée de tomates cerises', '2 gousses d’ail'],
      steps: [
        'Fais dorer les gnocchis dans une grande poêle, selon les indications du paquet. Réserve-les.',
        'Coupe le poulet en morceaux et fais-le cuire dans la même poêle avec l’ail.',
        'Mixe le cottage cheese avec 4 à 5 cuillères à soupe d’eau pour obtenir une sauce crémeuse.',
        'Remets les gnocchis dans la poêle. Ajoute la sauce, les tomates coupées en deux et le parmesan. Réchauffe doucement sans faire bouillir.'
      ],
      tips: 'Ne fais pas bouillir la sauce : le cottage cheese resterait granuleux.',
      en: {
        name: 'Creamy Chicken & Parmesan Gnocchi', tags: ['chicken', 'gnocchi', 'cottage cheese', 'parmesan'],
        ingredients: ['400 g gnocchi', '240 g chicken breast', '200 g cottage cheese', '40 g grated parmesan', '1 handful cherry tomatoes', '2 garlic cloves'],
        steps: [
          'Brown the gnocchi in a large pan, following the pack instructions. Set aside.',
          'Cut the chicken into pieces and cook it in the same pan with the garlic.',
          'Blend the cottage cheese with 4–5 tbsp of water until creamy.',
          'Return the gnocchi to the pan. Add the sauce, the halved tomatoes and the parmesan. Warm through gently without boiling.'
        ],
        tips: 'Do not let the sauce boil or the cottage cheese turns grainy.'
      }
    },
    {
      id: 'm-garlic-shrimp-rice', name: 'Riz crémeux aux crevettes & à l’ail', category: 'main',
      time: 20, servings: 2, protein: 43, kcal: 600, photo: 'img/recettes/m-garlic-shrimp-rice.jpg',
      tags: ['crevettes', 'riz', 'fromage blanc', 'parmesan'], keywords: ['shrimp', 'prawns', 'rice', 'garlic', 'creamy'],
      ingredients: ['300 g de crevettes décortiquées', '200 g de riz (cru)', '200 g de fromage blanc', '30 g de parmesan râpé', '2 gousses d’ail', '1/2 citron', 'Persil'],
      steps: [
        'Fais cuire le riz dans une casserole d’eau salée.',
        'Fais revenir les crevettes dans une poêle avec l’ail haché, jusqu’à ce qu’elles soient bien cuites.',
        'Baisse le feu. Ajoute le fromage blanc et le parmesan. Mélange doucement pour obtenir une sauce. Si elle est trop épaisse, ajoute une cuillère d’eau chaude.',
        'Sers les crevettes en sauce sur le riz et ajoute un peu de citron et de persil.'
      ],
      tips: 'Les crevettes sont cuites dès qu’elles sont roses : ne les laisse pas plus longtemps.',
      en: {
        name: 'Creamy Garlic Shrimp Rice', tags: ['shrimp', 'rice', 'fromage blanc', 'parmesan'],
        ingredients: ['300 g peeled prawns (shrimp)', '200 g rice (uncooked)', '200 g fromage blanc (or quark)', '30 g grated parmesan', '2 garlic cloves', '1/2 lemon', 'Parsley'],
        steps: [
          'Cook the rice in a pan of salted water.',
          'Fry the prawns in a pan with the chopped garlic until cooked through.',
          'Lower the heat. Add the fromage blanc and parmesan. Stir gently into a sauce. If it is too thick, add a spoonful of hot water.',
          'Serve the prawns and sauce over the rice with a little lemon and parsley.'
        ],
        tips: 'Prawns are done as soon as they turn pink: do not cook them longer.'
      }
    },
    {
      id: 'm-chicken-mozza-quesadillas', name: 'Quesadillas au poulet & mozzarella', category: 'main',
      time: 20, servings: 2, protein: 55, kcal: 620, photo: 'img/recettes/m-chicken-mozza-quesadillas.jpg',
      tags: ['poulet', 'mozzarella', 'wrap', 'skyr'], keywords: ['quesadilla', 'chicken', 'mozzarella', 'cheese', 'tortilla'],
      ingredients: ['4 tortillas', '240 g de blanc de poulet', '120 g de mozzarella', '100 g de skyr', '2 tomates', 'Paprika, ail & poivre'],
      steps: [
        'Coupe le poulet en petits morceaux. Assaisonne-le et fais-le cuire à la poêle.',
        'Mélange le skyr avec un peu d’ail et de poivre pour préparer la sauce.',
        'Répartis le poulet, la mozzarella et les tomates en petits dés sur deux tortillas. Referme avec les deux autres tortillas.',
        'Fais dorer à la poêle à feu moyen, environ 2 à 3 minutes de chaque côté, jusqu’à ce que la mozzarella soit fondue. Coupe en parts et sers avec la sauce.'
      ],
      tips: 'Retourne-les à l’aide d’une assiette posée sur la poêle.',
      en: {
        name: 'Chicken & Mozzarella Quesadillas', tags: ['chicken', 'mozzarella', 'tortilla', 'skyr'],
        ingredients: ['4 tortillas', '240 g chicken breast', '120 g mozzarella', '100 g skyr', '2 tomatoes', 'Paprika, garlic & pepper'],
        steps: [
          'Cut the chicken into small pieces. Season and pan-fry.',
          'Mix the skyr with a little garlic and pepper for the sauce.',
          'Spread the chicken, mozzarella and diced tomatoes over two tortillas. Cover with the other two.',
          'Toast in a pan over medium heat for about 2–3 minutes per side, until the mozzarella melts. Cut into wedges and serve with the sauce.'
        ],
        tips: 'Flip them with the help of a plate placed over the pan.'
      }
    },
    {
      id: 'm-salmon-lemon-pasta', name: 'Pâtes au saumon, citron & fromage frais', category: 'main',
      time: 20, servings: 2, protein: 42, kcal: 700,
      tags: ['saumon', 'poisson', 'pâtes', 'fromage frais'], keywords: ['salmon', 'fish', 'pasta', 'lemon', 'cream cheese'],
      ingredients: ['200 g de pâtes', '240 g de saumon', '120 g de fromage frais', '20 g de parmesan râpé', '1 citron', '1 gousse d’ail', 'Ciboulette'],
      steps: [
        'Fais cuire les pâtes. Garde une petite tasse d’eau de cuisson avant de les égoutter.',
        'Fais cuire le saumon à la poêle, puis émiette-le en retirant la peau et les éventuelles arêtes.',
        'Dans la poêle, mélange le fromage frais avec un peu de jus et de zeste de citron, l’ail et quelques cuillères d’eau de cuisson.',
        'Ajoute les pâtes et le saumon. Mélange délicatement et termine avec le parmesan et la ciboulette.'
      ],
      tips: 'Râpe le zeste avant de presser le citron, c’est bien plus facile.',
      en: {
        name: 'Salmon, Lemon & Cream Cheese Pasta', tags: ['salmon', 'fish', 'pasta', 'cream cheese'],
        ingredients: ['200 g pasta', '240 g salmon', '120 g cream cheese', '20 g grated parmesan', '1 lemon', '1 garlic clove', 'Chives'],
        steps: [
          'Cook the pasta. Keep a small cup of the cooking water before draining.',
          'Pan-fry the salmon, then flake it, removing the skin and any bones.',
          'In the pan, mix the cream cheese with a little lemon juice and zest, the garlic and a few spoonfuls of cooking water.',
          'Add the pasta and salmon. Stir gently and finish with the parmesan and chives.'
        ],
        tips: 'Zest the lemon before squeezing it: much easier.'
      }
    },
    {
      id: 'm-chicken-coconut-curry', name: 'Poulet façon curry coco', category: 'main',
      time: 25, servings: 2, protein: 53, kcal: 690, photo: 'img/recettes/m-chicken-coconut-curry.jpg',
      tags: ['poulet', 'curry', 'riz', 'lait de coco'], keywords: ['chicken', 'curry', 'coconut', 'rice'],
      ingredients: ['300 g de blanc de poulet', '200 g de riz (cru)', '200 ml de lait de coco', '160 g de skyr', '1 oignon', '2 gousses d’ail', '2 c. à café de curry'],
      steps: [
        'Fais cuire le riz.',
        'Émince l’oignon et coupe le poulet en morceaux. Fais revenir l’oignon, l’ail et le poulet dans une sauteuse avec le curry.',
        'Quand le poulet est doré, ajoute le lait de coco. Laisse mijoter jusqu’à ce que le poulet soit bien cuit.',
        'Coupe le feu et incorpore le skyr pour garder une sauce onctueuse. Sers avec le riz.'
      ],
      tips: 'Le skyr ajouté hors du feu rend la sauce crémeuse sans la faire trancher.',
      en: {
        name: 'Coconut Curry Chicken', tags: ['chicken', 'curry', 'rice', 'coconut milk'],
        ingredients: ['300 g chicken breast', '200 g rice (uncooked)', '200 ml coconut milk', '160 g skyr', '1 onion', '2 garlic cloves', '2 tsp curry powder'],
        steps: [
          'Cook the rice.',
          'Slice the onion and cut the chicken into pieces. Fry the onion, garlic and chicken in a deep pan with the curry powder.',
          'When the chicken is golden, add the coconut milk. Simmer until the chicken is cooked through.',
          'Turn off the heat and stir in the skyr for a smooth sauce. Serve with the rice.'
        ],
        tips: 'Adding the skyr off the heat keeps the sauce creamy and stops it splitting.'
      }
    },
    {
      id: 'm-tuna-baked-potatoes', name: 'Pommes de terre gratinées au thon & cottage cheese', category: 'main',
      time: 55, servings: 2, protein: 51, kcal: 560, photo: 'img/recettes/m-tuna-baked-potatoes.jpg',
      tags: ['thon', 'poisson', 'pommes de terre', 'cottage cheese', 'four'], keywords: ['tuna', 'fish', 'baked potatoes', 'jacket potatoes', 'cottage cheese', 'cheddar'],
      ingredients: ['500 g de pommes de terre', '240 g de thon égoutté', '200 g de cottage cheese', '40 g de cheddar râpé', '1 gousse d’ail', 'Ciboulette'],
      steps: [
        'Préchauffe le four à 200 °C. Lave les pommes de terre, pique-les avec une fourchette et fais-les cuire jusqu’à ce qu’elles soient tendres (environ 35 à 50 minutes selon leur taille).',
        'Mélange le thon égoutté avec le cottage cheese, l’ail et la ciboulette.',
        'Ouvre les pommes de terre en deux et répartis la préparation au thon dessus.',
        'Ajoute le cheddar et remets au four 5 à 10 minutes, le temps de faire fondre le fromage.'
      ],
      tips: 'Pour gagner du temps, précuis les pommes de terre 8 à 10 minutes au micro-ondes avant le four.',
      en: {
        name: 'Tuna & Cottage Cheese Baked Potatoes', tags: ['tuna', 'fish', 'potatoes', 'cottage cheese', 'oven'],
        ingredients: ['500 g potatoes', '240 g drained tuna', '200 g cottage cheese', '40 g grated cheddar', '1 garlic clove', 'Chives'],
        steps: [
          'Preheat the oven to 200 °C. Wash the potatoes, prick them with a fork and bake until tender (about 35–50 minutes depending on size).',
          'Mix the drained tuna with the cottage cheese, garlic and chives.',
          'Split the potatoes in half and spoon the tuna mix on top.',
          'Add the cheddar and return to the oven for 5–10 minutes, until the cheese melts.'
        ],
        tips: 'To save time, microwave the potatoes for 8–10 minutes before they go in the oven.'
      }
    },
    {
      id: 'm-mozza-cottage-omelette', name: 'Omelette mozzarella & cottage cheese', category: 'main',
      time: 15, servings: 2, protein: 45, kcal: 520,
      tags: ['œufs', 'mozzarella', 'cottage cheese', 'tomates'], keywords: ['omelette', 'eggs', 'mozzarella', 'cottage cheese'],
      ingredients: ['6 œufs', '200 g de cottage cheese', '80 g de mozzarella', '1 poignée de tomates cerises', '4 tranches de pain complet', 'Sel & poivre'],
      steps: [
        'Bats les œufs dans un saladier avec du sel et du poivre.',
        'Verse la moitié du mélange dans une grande poêle antiadhésive légèrement huilée. Fais cuire à feu doux.',
        'Ajoute la moitié du cottage cheese, de la mozzarella et des tomates coupées. Laisse prendre doucement, puis replie l’omelette.',
        'Répète avec le reste des ingrédients pour préparer la deuxième omelette. Sers avec le pain grillé.'
      ],
      tips: 'Garde la première omelette au chaud dans une assiette couverte pendant que tu fais la deuxième.',
      en: {
        name: 'Mozzarella & Cottage Cheese Omelette', tags: ['eggs', 'mozzarella', 'cottage cheese', 'tomatoes'],
        ingredients: ['6 eggs', '200 g cottage cheese', '80 g mozzarella', '1 handful cherry tomatoes', '4 slices wholegrain bread', 'Salt & pepper'],
        steps: [
          'Beat the eggs in a bowl with salt and pepper.',
          'Pour half the mix into a large, lightly oiled non-stick pan. Cook over low heat.',
          'Add half the cottage cheese, mozzarella and chopped tomatoes. Let it set gently, then fold the omelette.',
          'Repeat with the rest of the ingredients for the second omelette. Serve with the toast.'
        ],
        tips: 'Keep the first omelette warm under a covered plate while you make the second.'
      }
    },
    {
      id: 'm-creamy-pesto-chicken-pasta', name: 'Pâtes au poulet façon pesto crémeux', category: 'main',
      time: 20, servings: 2, protein: 58, kcal: 690, photo: 'img/recettes/m-creamy-pesto-chicken-pasta.jpg',
      tags: ['poulet', 'pâtes', 'pesto', 'skyr'], keywords: ['chicken', 'pasta', 'pesto', 'creamy'],
      ingredients: ['200 g de pâtes', '240 g de blanc de poulet', '200 g de skyr', '40 g de pesto', '30 g de parmesan râpé', '1 poignée de tomates cerises'],
      steps: [
        'Fais cuire les pâtes et garde un peu d’eau de cuisson.',
        'Coupe le poulet en morceaux et fais-le cuire à la poêle jusqu’à ce qu’il soit bien cuit.',
        'Mélange le skyr et le pesto dans un bol. Ajoute progressivement un peu d’eau de cuisson pour fluidifier la sauce.',
        'Mélange les pâtes, le poulet et la sauce hors du feu. Ajoute les tomates et le parmesan.'
      ],
      tips: 'Mélange hors du feu : le skyr reste onctueux.',
      en: {
        name: 'Creamy Pesto Chicken Pasta', tags: ['chicken', 'pasta', 'pesto', 'skyr'],
        ingredients: ['200 g pasta', '240 g chicken breast', '200 g skyr', '40 g pesto', '30 g grated parmesan', '1 handful cherry tomatoes'],
        steps: [
          'Cook the pasta and keep a little of the cooking water.',
          'Cut the chicken into pieces and pan-fry until cooked through.',
          'Mix the skyr and pesto in a bowl. Gradually add a little cooking water to loosen the sauce.',
          'Toss the pasta, chicken and sauce off the heat. Add the tomatoes and parmesan.'
        ],
        tips: 'Mix off the heat so the skyr stays smooth.'
      }
    },
    {
      id: 'm-chicken-burger-bowl', name: 'Bowl façon burger au poulet', category: 'main',
      time: 40, servings: 2, protein: 60, kcal: 650,
      tags: ['poulet', 'pommes de terre', 'cheddar', 'skyr', 'four'], keywords: ['chicken', 'burger bowl', 'potatoes', 'cheddar'],
      ingredients: ['300 g de blanc de poulet', '500 g de pommes de terre', '60 g de cheddar râpé', '200 g de skyr', '2 tomates', 'Salade', '1 c. à café de moutarde', 'Paprika & ail'],
      steps: [
        'Préchauffe le four à 200 °C. Coupe les pommes de terre en cubes, assaisonne-les et fais-les cuire 25 à 35 minutes en les retournant à mi-cuisson.',
        'Coupe le poulet en morceaux et fais-le dorer à la poêle avec le paprika. Vérifie la cuisson à cœur.',
        'Mélange le skyr avec la moutarde et l’ail pour préparer une sauce façon burger.',
        'Répartis les pommes de terre et le poulet dans deux bols. Ajoute le cheddar, les tomates, la salade et la sauce.'
      ],
      tips: 'Un cornichon haché dans la sauce, et c’est encore plus « burger ».',
      en: {
        name: 'Chicken Burger Bowl', tags: ['chicken', 'potatoes', 'cheddar', 'skyr', 'oven'],
        ingredients: ['300 g chicken breast', '500 g potatoes', '60 g grated cheddar', '200 g skyr', '2 tomatoes', 'Lettuce', '1 tsp mustard', 'Paprika & garlic'],
        steps: [
          'Preheat the oven to 200 °C. Cut the potatoes into cubes, season and roast for 25–35 minutes, turning halfway.',
          'Cut the chicken into pieces and brown it in a pan with the paprika. Check it is cooked through.',
          'Mix the skyr with the mustard and garlic for a burger-style sauce.',
          'Share the potatoes and chicken between two bowls. Add the cheddar, tomatoes, lettuce and sauce.'
        ],
        tips: 'A chopped gherkin in the sauce makes it even more burger-like.'
      }
    },
    {
      id: 'm-chicken-lasagna', name: 'Lasagnes poulet, ricotta & mozzarella', category: 'main',
      time: 50, servings: 2, protein: 53, kcal: 720, photo: 'img/recettes/m-chicken-lasagna.jpg',
      tags: ['poulet', 'lasagnes', 'ricotta', 'mozzarella', 'four'], keywords: ['lasagna', 'lasagne', 'chicken', 'ricotta', 'mozzarella'],
      ingredients: ['240 g de poulet haché', '6 feuilles de lasagnes (selon le plat)', '200 g de ricotta', '80 g de mozzarella', '400 g de coulis de tomate', 'Parmesan', '1 gousse d’ail', 'Basilic'],
      steps: [
        'Préchauffe le four à 180 °C. Fais revenir le poulet haché avec l’ail, puis ajoute le coulis de tomate et laisse mijoter 5 minutes.',
        'Dans un plat, étale une fine couche de sauce. Ajoute des feuilles de lasagnes, une couche de poulet à la tomate et quelques cuillerées de ricotta.',
        'Répète les couches jusqu’à épuisement des ingrédients. Termine par la mozzarella et un peu de parmesan.',
        'Enfourne 25 à 35 minutes, selon les feuilles utilisées. Laisse reposer 5 minutes avant de servir.'
      ],
      tips: 'Le repos de 5 minutes permet de couper des parts nettes.',
      en: {
        name: 'Chicken, Ricotta & Mozzarella Lasagne', tags: ['chicken', 'lasagne', 'ricotta', 'mozzarella', 'oven'],
        ingredients: ['240 g minced chicken', '6 lasagne sheets (depending on the dish)', '200 g ricotta', '80 g mozzarella', '400 g tomato passata', 'Parmesan', '1 garlic clove', 'Basil'],
        steps: [
          'Preheat the oven to 180 °C. Brown the minced chicken with the garlic, then add the passata and simmer for 5 minutes.',
          'Spread a thin layer of sauce in a dish. Add lasagne sheets, a layer of chicken in tomato and a few spoonfuls of ricotta.',
          'Repeat the layers until everything is used. Finish with the mozzarella and a little parmesan.',
          'Bake for 25–35 minutes, depending on the sheets. Rest for 5 minutes before serving.'
        ],
        tips: 'Resting for 5 minutes gives clean slices.'
      }
    },
    {
      id: 'm-tuna-pasta-bake', name: 'Gratin de pâtes au thon & mozzarella', category: 'main',
      time: 30, servings: 2, protein: 65, kcal: 690, photo: 'img/recettes/m-tuna-pasta-bake.jpg',
      tags: ['thon', 'poisson', 'pâtes', 'mozzarella', 'four'], keywords: ['tuna', 'pasta bake', 'pasta', 'mozzarella', 'cottage cheese'],
      ingredients: ['200 g de pâtes', '240 g de thon égoutté', '200 g de cottage cheese', '100 g de mozzarella', '300 g de coulis de tomate', '1 gousse d’ail', 'Parmesan'],
      steps: [
        'Préchauffe le four à 190 °C. Fais cuire les pâtes 1 à 2 minutes de moins que le temps indiqué sur le paquet.',
        'Mélange le thon égoutté avec le cottage cheese, le coulis de tomate et l’ail.',
        'Ajoute les pâtes égouttées et mélange. Verse le tout dans un plat à gratin.',
        'Répartis la mozzarella et un peu de parmesan sur le dessus. Fais gratiner 10 à 15 minutes.'
      ],
      tips: 'Les pâtes finissent de cuire au four : c’est pour ça qu’on les égoutte un peu fermes.',
      en: {
        name: 'Tuna & Mozzarella Pasta Bake', tags: ['tuna', 'fish', 'pasta', 'mozzarella', 'oven'],
        ingredients: ['200 g pasta', '240 g drained tuna', '200 g cottage cheese', '100 g mozzarella', '300 g tomato passata', '1 garlic clove', 'Parmesan'],
        steps: [
          'Preheat the oven to 190 °C. Cook the pasta 1–2 minutes less than the pack says.',
          'Mix the drained tuna with the cottage cheese, passata and garlic.',
          'Add the drained pasta and stir. Tip everything into a baking dish.',
          'Top with the mozzarella and a little parmesan. Bake for 10–15 minutes until golden.'
        ],
        tips: 'The pasta finishes cooking in the oven, which is why you drain it slightly firm.'
      }
    },
    {
      id: 'm-crispy-chicken-cheddar', name: 'Poulet croustillant, pommes de terre & sauce cheddar', category: 'main',
      time: 45, servings: 2, protein: 60, kcal: 700,
      tags: ['poulet', 'pommes de terre', 'cheddar', 'skyr', 'four'], keywords: ['crispy chicken', 'chicken', 'potatoes', 'cheddar sauce', 'oven'],
      ingredients: ['300 g de blanc de poulet', '500 g de pommes de terre', '60 g de cheddar râpé', '200 g de skyr', '40 g de chapelure', 'Paprika, ail & poivre'],
      steps: [
        'Préchauffe le four à 200 °C. Coupe les pommes de terre en quartiers, assaisonne-les et enfourne 25 à 35 minutes.',
        'Coupe le poulet en morceaux. Passe-les dans un peu de skyr assaisonné, puis dans la chapelure.',
        'Dépose le poulet sur une plaque et fais cuire environ 15 à 20 minutes, en vérifiant qu’il est bien cuit à cœur.',
        'Fais fondre doucement le cheddar avec le reste du skyr et une ou deux cuillères d’eau chaude. Sers avec le poulet et les pommes de terre.'
      ],
      tips: 'Enfourne le poulet quand les pommes de terre ont déjà 10 à 15 minutes de cuisson : tout est prêt en même temps.',
      en: {
        name: 'Crispy Chicken, Potatoes & Cheddar Sauce', tags: ['chicken', 'potatoes', 'cheddar', 'skyr', 'oven'],
        ingredients: ['300 g chicken breast', '500 g potatoes', '60 g grated cheddar', '200 g skyr', '40 g breadcrumbs', 'Paprika, garlic & pepper'],
        steps: [
          'Preheat the oven to 200 °C. Cut the potatoes into wedges, season and roast for 25–35 minutes.',
          'Cut the chicken into pieces. Dip them in a little seasoned skyr, then in the breadcrumbs.',
          'Lay the chicken on a tray and bake for about 15–20 minutes, checking it is cooked through.',
          'Gently melt the cheddar with the rest of the skyr and a spoonful or two of hot water. Serve with the chicken and potatoes.'
        ],
        tips: 'Put the chicken in once the potatoes have had 10–15 minutes, so everything is ready together.'
      }
    },
    {
      id: 'm-shrimp-risotto', name: 'Risotto crémeux aux crevettes & parmesan', category: 'main',
      time: 35, servings: 2, protein: 46, kcal: 640, photo: 'img/recettes/m-shrimp-risotto.jpg',
      tags: ['crevettes', 'riz', 'risotto', 'parmesan'], keywords: ['risotto', 'shrimp', 'prawns', 'rice', 'parmesan'],
      ingredients: ['200 g de riz à risotto', '300 g de crevettes décortiquées', '40 g de parmesan râpé', '100 g de cottage cheese', '700 ml de bouillon chaud (environ)', '1 gousse d’ail', '1 c. à café d’huile', '1/2 citron'],
      steps: [
        'Fais chauffer le bouillon dans une casserole. Dans une autre sauteuse, fais revenir l’ail avec un peu d’huile, puis ajoute le riz et mélange une minute.',
        'Ajoute le bouillon chaud louche après louche, en remuant régulièrement. Attends que le liquide soit absorbé avant d’en rajouter.',
        'Fais cuire les crevettes à part dans une poêle.',
        'Quand le riz est tendre et crémeux, ajoute le cottage cheese et le parmesan. Incorpore les crevettes et termine avec un peu de citron.'
      ],
      tips: 'Compte environ 18 minutes de cuisson pour le riz, en remuant souvent.',
      en: {
        name: 'Creamy Shrimp & Parmesan Risotto', tags: ['shrimp', 'rice', 'risotto', 'parmesan'],
        ingredients: ['200 g risotto rice', '300 g peeled prawns (shrimp)', '40 g grated parmesan', '100 g cottage cheese', '700 ml hot stock (about)', '1 garlic clove', '1 tsp oil', '1/2 lemon'],
        steps: [
          'Heat the stock in a pan. In another deep pan, fry the garlic in a little oil, then add the rice and stir for a minute.',
          'Add the hot stock one ladle at a time, stirring often. Wait until it is absorbed before adding more.',
          'Cook the prawns separately in a frying pan.',
          'When the rice is tender and creamy, stir in the cottage cheese and parmesan. Fold in the prawns and finish with a little lemon.'
        ],
        tips: 'Allow about 18 minutes for the rice, stirring often.'
      }
    },
    {
      id: 'm-chicken-burger', name: 'Burger maison au poulet & sauce spéciale', category: 'main',
      time: 20, servings: 2, protein: 53, kcal: 620, photo: 'img/recettes/m-chicken-burger.jpg',
      tags: ['poulet', 'burger', 'cheddar', 'skyr'], keywords: ['burger', 'chicken burger', 'cheddar', 'skyr'],
      ingredients: ['300 g de filets de poulet', '2 pains à burger', '2 tranches de cheddar', '160 g de skyr', 'Salade', '1 tomate', '1 c. à café de moutarde', '2 cornichons', 'Paprika'],
      steps: [
        'Fais cuire les filets de poulet à la poêle avec du paprika, jusqu’à ce qu’ils soient bien cuits à cœur.',
        'Mélange le skyr avec la moutarde et les cornichons finement hachés.',
        'Fais griller légèrement les pains burger. Garnis-les avec la sauce, le poulet, le cheddar, la salade et les rondelles de tomate.'
      ],
      tips: 'Aplatis un peu les filets de poulet : ils cuisent plus vite et plus régulièrement.',
      en: {
        name: 'Homemade Chicken Burger with Special Sauce', tags: ['chicken', 'burger', 'cheddar', 'skyr'],
        ingredients: ['300 g chicken fillets', '2 burger buns', '2 slices cheddar', '160 g skyr', 'Lettuce', '1 tomato', '1 tsp mustard', '2 gherkins', 'Paprika'],
        steps: [
          'Pan-fry the chicken fillets with paprika until cooked through.',
          'Mix the skyr with the mustard and finely chopped gherkins.',
          'Lightly toast the buns. Fill them with the sauce, chicken, cheddar, lettuce and tomato slices.'
        ],
        tips: 'Flatten the chicken fillets a little: they cook faster and more evenly.'
      }
    }
  ];
})();
