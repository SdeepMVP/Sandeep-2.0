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
      id: 'b-banana-pancakes', name: 'Pancakes protéinés à la banane', category: 'breakfast',
      time: 15, servings: 1, protein: 41, kcal: 560,
      tags: ['banane', 'œufs', 'flocons d’avoine', 'whey'], keywords: ['banana', 'eggs', 'oats', 'pancakes', 'protein powder'],
      ingredients: [
        '1 banane (bien mûre)',
        '2 œufs',
        '40 g de flocons d’avoine',
        '30 g de whey (vanille ou nature)',
        '1/2 c. à café de levure chimique',
        '1 pincée de cannelle',
        '5 g d’huile ou de beurre pour la poêle',
        'Garniture : skyr, fruits rouges ou un peu de sirop d’érable'
      ],
      steps: [
        'Mets la banane, les œufs, les flocons, la whey, la levure et la cannelle dans un blender. Mixe 30 secondes jusqu’à obtenir une pâte lisse. (Pas de blender ? Écrase la banane à la fourchette et prends des flocons fins.)',
        'Laisse reposer la pâte 2 minutes : elle épaissit un peu.',
        'Fais chauffer une poêle antiadhésive à feu moyen et huile-la légèrement.',
        'Verse des petits pancakes, environ 2 cuillères à soupe de pâte chacun.',
        'Cuis environ 2 minutes, jusqu’à ce que des bulles apparaissent, puis retourne et cuis encore 1 minute.',
        'Empile-les et ajoute ta garniture.'
      ],
      tips: 'Reste à feu moyen, pas fort : la whey brûle vite.',
      en: {
        name: 'Banana Protein Pancakes',
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
      id: 'b-overnight-oats', name: 'Overnight oats protéinés', category: 'breakfast',
      time: 5, servings: 1, protein: 36, kcal: 480,
      tags: ['flocons d’avoine', 'skyr', 'whey', 'chia'], keywords: ['overnight oats', 'oats', 'yogurt', 'protein powder', 'chia'],
      ingredients: [
        '50 g de flocons d’avoine',
        '150 g de skyr nature',
        '20 g de whey (vanille)',
        '100 ml de lait (ou boisson végétale)',
        '1 c. à soupe de graines de chia',
        '80 g de fruits (banane, pomme râpée ou fruits rouges)',
        '1 c. à café de miel (facultatif)'
      ],
      steps: [
        'La veille, mélange dans un bocal les flocons, le skyr, la whey, le lait et le chia jusqu’à ce qu’il n’y ait plus de grumeaux.',
        'Ferme le bocal et laisse au frigo toute la nuit (au moins 4 heures).',
        'Le matin, mélange : si c’est trop épais, ajoute un trait de lait.',
        'Ajoute les fruits et le miel, et mange froid.'
      ],
      tips: 'Prépare 3 bocaux d’un coup : ils se gardent 3 jours au frigo.',
      en: {
        name: 'Protein Overnight Oats',
        tags: ['oats', 'skyr', 'whey', 'chia'],
        ingredients: [
          '50 g oat flakes',
          '150 g plain skyr',
          '20 g whey protein (vanilla)',
          '100 ml milk (or plant milk)',
          '1 tbsp chia seeds',
          '80 g fruit (banana, grated apple or berries)',
          '1 tsp honey (optional)'
        ],
        steps: [
          'The night before, mix the oats, skyr, whey, milk and chia in a jar until there are no lumps.',
          'Close the jar and leave it in the fridge overnight (at least 4 hours).',
          'In the morning, stir: if it is too thick, add a splash of milk.',
          'Add the fruit and honey, and eat cold.'
        ],
        tips: 'Make 3 jars at once: they keep for 3 days in the fridge.'
      }
    },
    {
      id: 'b-ham-omelette', name: 'Omelette jambon, fromage & épinards', category: 'breakfast',
      time: 10, servings: 1, protein: 38, kcal: 420,
      tags: ['œufs', 'jambon', 'fromage', 'épinards'], keywords: ['omelette', 'eggs', 'ham', 'cheese', 'spinach'],
      ingredients: [
        '3 œufs',
        '2 tranches de jambon blanc',
        '20 g de fromage râpé',
        '1 poignée d’épinards',
        '5 g de beurre',
        'Sel & poivre'
      ],
      steps: [
        'Bats les œufs avec une pincée de sel et de poivre.',
        'Coupe le jambon en lanières.',
        'Fais fondre le beurre dans une poêle antiadhésive à feu moyen. Fais tomber les épinards 1 minute.',
        'Verse les œufs et laisse prendre 1 minute en ramenant les bords vers le centre.',
        'Quand le dessus est presque pris, ajoute le jambon et le fromage sur une moitié.',
        'Replie l’omelette, laisse 30 secondes pour faire fondre le fromage, puis fais glisser dans l’assiette.'
      ],
      tips: 'Une tranche de pain complet à côté pour un petit-déjeuner complet.',
      en: {
        name: 'Ham, Cheese & Spinach Omelette',
        tags: ['eggs', 'ham', 'cheese', 'spinach'],
        ingredients: [
          '3 eggs',
          '2 slices cooked ham',
          '20 g grated cheese',
          '1 handful spinach',
          '5 g butter',
          'Salt & pepper'
        ],
        steps: [
          'Whisk the eggs with a pinch of salt and pepper.',
          'Cut the ham into strips.',
          'Melt the butter in a non-stick pan over medium heat. Wilt the spinach for 1 minute.',
          'Pour in the eggs and let them set for 1 minute, pushing the edges towards the centre.',
          'When the top is almost set, add the ham and cheese on one half.',
          'Fold the omelette, leave it 30 seconds for the cheese to melt, then slide it onto the plate.'
        ],
        tips: 'Add a slice of wholegrain bread on the side for a complete breakfast.'
      }
    },
    {
      id: 'b-pb-smoothie', name: 'Smoothie banane & cacahuète', category: 'breakfast',
      time: 5, servings: 1, protein: 35, kcal: 470,
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
      id: 'b-egg-muffins', name: 'Muffins aux œufs (à préparer à l’avance)', category: 'breakfast',
      time: 25, servings: 2, protein: 30, kcal: 330,
      tags: ['œufs', 'poivron', 'fromage', 'jambon'], keywords: ['egg muffins', 'eggs', 'meal prep', 'peppers', 'ham', 'cheese'],
      ingredients: [
        '6 œufs',
        '100 g de dés de jambon (ou de dinde)',
        '1/2 poivron',
        '1 poignée d’épinards',
        '30 g de fromage râpé',
        '1 c. à café d’huile pour le moule',
        'Sel, poivre & paprika'
      ],
      steps: [
        'Préchauffe le four à 180 °C et huile 6 empreintes d’un moule à muffins (ou utilise des caissettes en silicone).',
        'Coupe le poivron en petits dés et hache grossièrement les épinards.',
        'Répartis le jambon, le poivron et les épinards dans les empreintes.',
        'Bats les œufs avec le sel, le poivre et le paprika, puis verse-les par-dessus aux trois quarts.',
        'Parsème de fromage et enfourne 18 à 20 minutes, jusqu’à ce qu’ils soient gonflés et pris au centre.',
        'Laisse tiédir 5 minutes avant de démouler.'
      ],
      tips: 'Ils se gardent 4 jours au frigo : 20 secondes au micro-ondes le matin.',
      en: {
        name: 'Make-Ahead Egg Muffins',
        tags: ['eggs', 'peppers', 'cheese', 'ham'],
        ingredients: [
          '6 eggs',
          '100 g diced ham (or turkey)',
          '1/2 pepper',
          '1 handful spinach',
          '30 g grated cheese',
          '1 tsp oil for the tin',
          'Salt, pepper & paprika'
        ],
        steps: [
          'Preheat the oven to 180 °C and oil 6 holes of a muffin tin (or use silicone cases).',
          'Dice the pepper finely and roughly chop the spinach.',
          'Share the ham, pepper and spinach between the holes.',
          'Whisk the eggs with salt, pepper and paprika, then pour over until three-quarters full.',
          'Sprinkle with cheese and bake for 18–20 minutes, until puffed and set in the centre.',
          'Let them cool for 5 minutes before turning out.'
        ],
        tips: 'They keep for 4 days in the fridge: 20 seconds in the microwave in the morning.'
      }
    },
    {
      id: 'b-avocado-toast', name: 'Tartines avocat, œufs mollets & cottage', category: 'breakfast',
      time: 12, servings: 1, protein: 30, kcal: 520,
      tags: ['avocat', 'œufs', 'cottage cheese', 'pain'], keywords: ['avocado toast', 'eggs', 'cottage cheese', 'bread'],
      ingredients: [
        '2 œufs',
        '2 tranches de pain complet',
        '1/2 avocat',
        '80 g de cottage cheese',
        '1/2 citron',
        'Piment en flocons, sel & poivre'
      ],
      steps: [
        'Plonge les œufs dans l’eau bouillante et compte 6 minutes, puis passe-les sous l’eau froide.',
        'Fais griller le pain.',
        'Écrase l’avocat à la fourchette avec un filet de citron, du sel et du poivre.',
        'Étale l’avocat sur les tartines, puis le cottage cheese.',
        'Écale les œufs, coupe-les en deux et pose-les dessus. Termine avec le piment.'
      ],
      tips: 'Œufs mollets : 6 minutes pile depuis l’eau qui bout, pour un jaune coulant.',
      en: {
        name: 'Avocado Toast, Soft-Boiled Eggs & Cottage Cheese',
        tags: ['avocado', 'eggs', 'cottage cheese', 'bread'],
        ingredients: [
          '2 eggs',
          '2 slices wholegrain bread',
          '1/2 avocado',
          '80 g cottage cheese',
          '1/2 lemon',
          'Chilli flakes, salt & pepper'
        ],
        steps: [
          'Lower the eggs into boiling water and time 6 minutes, then run them under cold water.',
          'Toast the bread.',
          'Mash the avocado with a fork with a squeeze of lemon, salt and pepper.',
          'Spread the avocado on the toast, then the cottage cheese.',
          'Peel the eggs, halve them and lay them on top. Finish with the chilli flakes.'
        ],
        tips: 'Soft-boiled eggs: exactly 6 minutes from boiling water for a runny yolk.'
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
      time: 5, servings: 1, protein: 26, kcal: 360,
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
      time: 5, servings: 1, protein: 33, kcal: 380,
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
      time: 10, servings: 1, protein: 38, kcal: 520,
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
      id: 'm-chicken-fajitas', name: 'Wraps fajitas au poulet', category: 'main',
      time: 20, servings: 1, protein: 55, kcal: 700,
      tags: ['poulet', 'poivron', 'wrap', 'fromage'], keywords: ['chicken', 'fajitas', 'peppers', 'tortilla', 'cheese'],
      ingredients: [
        '180 g de blanc de poulet',
        '1 poivron (rouge)',
        '1/2 oignon',
        '2 tortillas complètes',
        '1 c. à café d’épices fajitas (ou paprika, cumin & ail en poudre)',
        '1 c. à café d’huile',
        '50 g de yaourt grec 0 % (ou skyr)',
        '30 g de fromage râpé',
        '1/2 citron vert',
        'Salsa ou sauce piquante (facultatif)'
      ],
      steps: [
        'Coupe le poulet, le poivron et l’oignon en fines lanières.',
        'Mélange le poulet avec les épices et une pincée de sel.',
        'Fais chauffer l’huile dans une grande poêle à feu vif. Fais revenir le poivron et l’oignon 3 à 4 minutes jusqu’à ce qu’ils grillent un peu, puis pousse-les sur le côté.',
        'Ajoute le poulet et cuis 5 à 6 minutes en remuant, jusqu’à ce qu’il soit cuit à cœur. Presse le citron vert par-dessus.',
        'Réchauffe les tortillas 20 secondes au micro-ondes ou 30 secondes dans une poêle sèche.',
        'Étale le yaourt sur chaque tortilla, ajoute le poulet et les légumes, le fromage et la salsa, puis roule.'
      ],
      tips: 'Le yaourt à la place de la crème : aussi onctueux, avec plus de protéines et moins de calories.',
      en: {
        name: 'Chicken Fajita Wraps',
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
      id: 'm-tuna-pasta', name: 'Pâtes crémeuses au thon', category: 'main',
      time: 15, servings: 1, protein: 54, kcal: 650,
      tags: ['thon', 'poisson', 'pâtes', 'cottage cheese', 'tomates'], keywords: ['tuna', 'fish', 'pasta', 'cottage cheese', 'tomatoes'],
      ingredients: [
        '80 g de pâtes (complètes ou protéinées)',
        '1 boîte de thon au naturel (environ 110 g égoutté)',
        '100 g de cottage cheese',
        '15 g de parmesan râpé',
        '150 g de tomates cerises',
        '1 gousse d’ail',
        '1 c. à café d’huile d’olive',
        '1 poignée d’épinards, piment en flocons & basilic (facultatif)'
      ],
      steps: [
        'Cuis les pâtes dans l’eau bouillante salée selon le temps du paquet. Garde une petite tasse d’eau de cuisson avant d’égoutter.',
        'Pendant ce temps, coupe les tomates en deux et émince l’ail.',
        'Fais chauffer l’huile d’olive dans une poêle à feu moyen. Fais revenir l’ail 30 secondes, puis les tomates 3 à 4 minutes jusqu’à ce qu’elles ramollissent.',
        'Mixe ou écrase le cottage cheese avec le parmesan et 2 à 3 c. à soupe d’eau de cuisson jusqu’à ce que ce soit lisse.',
        'Retire la poêle du feu. Ajoute les pâtes égouttées, le thon et les épinards, puis la sauce au cottage cheese.',
        'Poivre, ajoute le piment et termine avec le basilic.'
      ],
      tips: 'Ajoute la sauce hors du feu pour qu’elle reste crémeuse et ne tranche pas.',
      en: {
        name: 'Creamy Tuna Pasta',
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
      id: 'm-coconut-curry', name: 'Curry de poulet express au lait de coco', category: 'main',
      time: 20, servings: 2, protein: 45, kcal: 620,
      tags: ['poulet', 'curry', 'riz', 'épinards'], keywords: ['chicken', 'curry', 'coconut', 'rice', 'spinach'],
      ingredients: [
        '350 g de blanc de poulet',
        '150 g de riz basmati (cru)',
        '1 oignon',
        '2 gousses d’ail',
        '1 c. à soupe de pâte de curry (ou 2 c. à café de curry en poudre)',
        '200 ml de lait de coco allégé',
        '200 g de tomates concassées en boîte',
        '2 poignées d’épinards',
        '1 c. à café d’huile',
        'Coriandre & 1/2 citron vert (facultatif)'
      ],
      steps: [
        'Lance la cuisson du riz.',
        'Émince l’oignon, hache l’ail et coupe le poulet en morceaux.',
        'Fais chauffer l’huile dans une sauteuse à feu moyen. Fais revenir l’oignon 3 minutes, puis l’ail et la pâte de curry 1 minute.',
        'Ajoute le poulet et fais-le dorer 4 minutes en remuant.',
        'Verse le lait de coco et les tomates, puis laisse mijoter 8 minutes jusqu’à ce que le poulet soit cuit à cœur.',
        'Ajoute les épinards et remue jusqu’à ce qu’ils tombent. Sale, puis sers sur le riz avec la coriandre et le citron vert.'
      ],
      tips: 'Encore meilleur le lendemain : parfait pour emporter au travail.',
      en: {
        name: 'Quick Coconut Chicken Curry',
        tags: ['chicken', 'curry', 'rice', 'spinach'],
        ingredients: [
          '350 g chicken breast',
          '150 g basmati rice (uncooked)',
          '1 onion',
          '2 garlic cloves',
          '1 tbsp curry paste (or 2 tsp curry powder)',
          '200 ml light coconut milk',
          '200 g canned chopped tomatoes',
          '2 handfuls spinach',
          '1 tsp oil',
          'Coriander & 1/2 lime (optional)'
        ],
        steps: [
          'Start the rice.',
          'Slice the onion, mince the garlic and cut the chicken into pieces.',
          'Heat the oil in a deep pan over medium heat. Cook the onion for 3 minutes, then the garlic and curry paste for 1 minute.',
          'Add the chicken and brown it for 4 minutes, stirring.',
          'Pour in the coconut milk and tomatoes, then simmer for 8 minutes until the chicken is cooked through.',
          'Stir in the spinach until it wilts. Season with salt, then serve over the rice with coriander and lime.'
        ],
        tips: 'Even better the next day: perfect to take to work.'
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
      time: 25, servings: 2, protein: 52, kcal: 650,
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
      time: 20, servings: 1, protein: 52, kcal: 520,
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
      time: 30, servings: 2, protein: 46, kcal: 560,
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
      id: 'm-lean-burgers', name: 'Burgers maison maigres', category: 'main',
      time: 15, servings: 1, protein: 45, kcal: 610,
      tags: ['bœuf haché', 'burger', 'fromage', 'salade'], keywords: ['burger', 'beef', 'ground beef', 'cheese'],
      ingredients: [
        '150 g de bœuf haché maigre (5 %)',
        '1 pain à burger (complet)',
        '1 tranche de cheddar',
        '1 tomate',
        '2 feuilles de salade',
        '30 g de skyr',
        '1 c. à café de moutarde',
        '1 cornichon, sel & poivre'
      ],
      steps: [
        'Forme un steak un peu plus large que le pain et creuse légèrement le centre avec le pouce (il ne gonflera pas).',
        'Mélange le skyr, la moutarde et le cornichon haché : c’est la sauce.',
        'Fais chauffer une poêle à feu vif. Sale le steak et cuis-le 3 minutes, retourne-le, pose le cheddar et cuis encore 2 à 3 minutes.',
        'Pendant ce temps, toaste le pain coupé en deux dans la poêle ou le grille-pain.',
        'Monte le burger : sauce, salade, steak, tomate en rondelles, et referme.'
      ],
      tips: 'Une salade ou des légumes rôtis à côté plutôt que des frites pour rester léger.',
      en: {
        name: 'Lean Homemade Burgers',
        tags: ['ground beef', 'burger', 'cheese', 'lettuce'],
        ingredients: [
          '150 g lean ground beef (5% fat)',
          '1 wholegrain burger bun',
          '1 slice cheddar',
          '1 tomato',
          '2 lettuce leaves',
          '30 g skyr',
          '1 tsp mustard',
          '1 gherkin, salt & pepper'
        ],
        steps: [
          'Shape a patty slightly wider than the bun and press a small dip in the centre with your thumb (so it does not puff up).',
          'Mix the skyr, mustard and chopped gherkin: this is the sauce.',
          'Heat a pan over high heat. Salt the patty and cook for 3 minutes, flip it, add the cheddar and cook 2–3 more minutes.',
          'Meanwhile, toast the halved bun in the pan or toaster.',
          'Build the burger: sauce, lettuce, patty, sliced tomato, and close.'
        ],
        tips: 'A salad or roasted vegetables on the side instead of fries keeps it light.'
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
      time: 25, servings: 2, protein: 32, kcal: 560,
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
      id: 'm-chicken-quesadillas', name: 'Quesadillas poulet & haricots noirs', category: 'main',
      time: 15, servings: 1, protein: 50, kcal: 680,
      tags: ['poulet', 'haricots noirs', 'fromage', 'wrap'], keywords: ['quesadilla', 'chicken', 'black beans', 'cheese', 'tortilla'],
      ingredients: [
        '150 g de poulet cuit (reste ou blanc grillé)',
        '2 tortillas complètes',
        '80 g de haricots noirs en boîte (rincés)',
        '40 g de mozzarella râpée',
        '50 g de maïs',
        '1 c. à café d’épices fajitas (ou paprika & cumin)',
        '50 g de skyr ou de yaourt grec',
        'Salsa (facultatif)'
      ],
      steps: [
        'Effiloche ou coupe le poulet en petits morceaux et mélange-le avec les haricots, le maïs et les épices.',
        'Répartis la moitié du fromage sur une tortilla, ajoute la garniture puis le reste du fromage. Couvre avec la deuxième tortilla.',
        'Fais chauffer une grande poêle sèche à feu moyen. Cuis 2 à 3 minutes jusqu’à ce que le dessous soit doré.',
        'Retourne-la à l’aide d’une assiette et cuis encore 2 minutes, jusqu’à ce que le fromage fonde.',
        'Coupe en 4 parts et sers avec le skyr et la salsa.'
      ],
      tips: 'Un bon moyen d’utiliser un reste de poulet rôti.',
      en: {
        name: 'Chicken & Black Bean Quesadillas',
        tags: ['chicken', 'black beans', 'cheese', 'wrap'],
        ingredients: [
          '150 g cooked chicken (leftovers or grilled breast)',
          '2 wholegrain tortillas',
          '80 g canned black beans (rinsed)',
          '40 g grated mozzarella',
          '50 g sweetcorn',
          '1 tsp fajita spice mix (or paprika & cumin)',
          '50 g skyr or Greek yogurt',
          'Salsa (optional)'
        ],
        steps: [
          'Shred or chop the chicken into small pieces and mix it with the beans, sweetcorn and spices.',
          'Spread half the cheese over one tortilla, add the filling, then the rest of the cheese. Cover with the second tortilla.',
          'Heat a large dry pan over medium heat. Cook for 2–3 minutes until the underside is golden.',
          'Flip it with the help of a plate and cook 2 more minutes, until the cheese melts.',
          'Cut into 4 wedges and serve with the skyr and salsa.'
        ],
        tips: 'A great way to use up leftover roast chicken.'
      }
    },
    {
      id: 'm-pesto-gnocchi', name: 'Gnocchis poêlés, poulet & pesto', category: 'main',
      time: 15, servings: 1, protein: 44, kcal: 690,
      tags: ['poulet', 'gnocchis', 'pesto', 'tomates'], keywords: ['gnocchi', 'chicken', 'pesto', 'tomatoes'],
      ingredients: [
        '150 g de blanc de poulet',
        '200 g de gnocchis',
        '1 c. à soupe de pesto',
        '100 g de tomates cerises',
        '1 poignée d’épinards',
        '1 c. à café d’huile d’olive',
        '15 g de parmesan râpé'
      ],
      steps: [
        'Coupe le poulet en dés et les tomates en deux.',
        'Fais chauffer l’huile dans une poêle à feu moyen-vif et cuis le poulet 5 à 6 minutes jusqu’à ce qu’il soit doré et cuit à cœur. Réserve.',
        'Mets les gnocchis directement dans la poêle (sans les cuire avant) et fais-les dorer 5 minutes en remuant.',
        'Ajoute les tomates et les épinards 1 minute, puis remets le poulet.',
        'Hors du feu, mélange avec le pesto et parsème de parmesan.'
      ],
      tips: 'Les gnocchis poêlés deviennent croustillants dehors et fondants dedans.',
      en: {
        name: 'Pan-Fried Gnocchi, Chicken & Pesto',
        tags: ['chicken', 'gnocchi', 'pesto', 'tomatoes'],
        ingredients: [
          '150 g chicken breast',
          '200 g gnocchi',
          '1 tbsp pesto',
          '100 g cherry tomatoes',
          '1 handful spinach',
          '1 tsp olive oil',
          '15 g grated parmesan'
        ],
        steps: [
          'Dice the chicken and halve the tomatoes.',
          'Heat the oil in a pan over medium-high heat and cook the chicken for 5–6 minutes until golden and cooked through. Set aside.',
          'Put the gnocchi straight into the pan (no boiling first) and fry them for 5 minutes, stirring, until golden.',
          'Add the tomatoes and spinach for 1 minute, then return the chicken.',
          'Off the heat, stir in the pesto and sprinkle with parmesan.'
        ],
        tips: 'Pan-fried gnocchi turn crispy outside and soft inside.'
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
      time: 15, servings: 1, protein: 42, kcal: 560,
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
    }
  ];
})();
