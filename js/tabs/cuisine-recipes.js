/* Recettes intégrées de l'onglet Cuisine (copiées dans les données de l'utilisateur au premier lancement).
   Pour en ajouter : nouvel id unique ; elles seront ajoutées automatiquement aux données existantes.
   Textes en français (onglet utilisé aussi par la compagne de l'utilisateur) ; `keywords` = mots anglais
   pour la recherche. Valeurs nutritionnelles approximatives, par portion.
   Les 10 premières recettes gardent le même nombre d'ingrédients et d'étapes que leur version anglaise
   (les cases cochées sont enregistrées par position). */
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
      tips: 'Feu doux et arrêt tôt : des œufs crémeux, pas caoutchouteux.'
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
      tips: 'Ajoute 15 g de whey dans le skyr pour environ 12 g de protéines en plus.'
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
      tips: 'Reste à feu moyen, pas fort : la whey brûle vite.'
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
      tips: 'Emballé dans de l’aluminium, il se garde quelques heures au frigo : un en-cas facile pour le travail.'
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
      tips: 'Prépare 3 bocaux d’un coup : ils se gardent 3 jours au frigo.'
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
      tips: 'Une tranche de pain complet à côté pour un petit-déjeuner complet.'
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
      tips: 'Garde des rondelles de banane au congélateur : le smoothie devient épais comme un milkshake.'
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
      tips: 'Ils se gardent 4 jours au frigo : 20 secondes au micro-ondes le matin.'
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
      tips: 'Fais 3 portions d’un coup : elles se gardent 3 jours au frigo.'
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
      tips: 'Le yaourt à la place de la crème : aussi onctueux, avec plus de protéines et moins de calories.'
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
      tips: 'La dinde hachée marche aussi bien, et elle est encore plus maigre.'
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
      tips: 'Le saumon surgelé marche : décongèle-le au frigo la veille, ou ajoute 5 minutes de cuisson.'
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
      tips: 'Ajoute la sauce hors du feu pour qu’elle reste crémeuse et ne tranche pas.'
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
      tips: 'Le secret, c’est le riz froid : le riz chaud devient pâteux. Un sachet de riz express marche aussi.'
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
      tips: 'Encore meilleur le lendemain : parfait pour emporter au travail.'
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
      tips: 'Il se congèle très bien : fais une double dose.'
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
      tips: 'Le poulet haché ou le bœuf 5 % marchent aussi.'
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
      tips: 'Le cabillaud surgelé marche : compte 5 minutes de plus.'
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
      tips: 'Une sauce au skyr à la place de la mayonnaise : bien plus de protéines, beaucoup moins de gras.'
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
      tips: 'Plus le tofu est sec, plus il croustille : ne saute pas l’étape du torchon.'
    }
  ];
})();
