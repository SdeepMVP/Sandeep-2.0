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
      tips: 'Œufs mollets : 6 minutes pile depuis l’eau qui bout, pour un jaune coulant.'
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
      tips: 'Au micro-ondes : 2 minutes en 2 fois, en remuant entre les deux.'
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
      tips: 'Avec une poire ou des fruits rouges, ça marche aussi très bien.'
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
      tips: 'La préparation au thon se garde 2 jours au frigo dans une boîte fermée.'
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
      tips: 'Emballé dans du papier aluminium, il se mange facilement sur le pouce.'
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
      tips: 'Elles se gardent 1 semaine au frigo, emballées une par une.'
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
      tips: 'Parfait pour un brunch du week-end : double les quantités dans une grande poêle.'
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
      tips: 'Une seule plaque, presque pas de vaisselle : idéal en semaine.'
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
      tips: 'Le wok doit être très chaud : la viande saisit au lieu de bouillir.'
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
      tips: 'Une salade ou des légumes rôtis à côté plutôt que des frites pour rester léger.'
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
      tips: 'La sauce caramélise vite : baisse bien le feu avant de la verser.'
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
      tips: 'Les lentilles corail n’ont pas besoin de trempage : elles cuisent en 15 minutes.'
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
      tips: 'Le thon en boîte remplace très bien les crevettes.'
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
      tips: 'La sauce se congèle très bien : fais-en une grande casserole.'
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
      tips: 'Un bon moyen d’utiliser un reste de poulet rôti.'
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
      tips: 'Les gnocchis poêlés deviennent croustillants dehors et fondants dedans.'
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
      tips: 'Avec du skyr, ajoute-le hors du feu pour que la sauce ne tranche pas.'
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
      tips: 'Pocher le poulet dans le bouillon le garde tendre et parfume la soupe.'
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
      tips: 'Elle se garde 2 jours au frigo : parfaite à emporter.'
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
      tips: 'Remplace le jambon par du poulet cuit ou du thon pour varier.'
    }
  ];
})();
