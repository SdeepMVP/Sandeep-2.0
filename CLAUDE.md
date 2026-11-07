# Habits (ex-Sandeep 2.0) — règles permanentes du projet

Application personnelle « hub de vie », utilisée uniquement sur iPhone, installée sur l'écran d'accueil.

## Règles produit
- **Nom de l'app principale : Habits** (ex-« Sandeep 2.0 », brièvement « Habit Tracker », renommée le 7 novembre 2026, v0.38 ; dépôt et URL inchangés). Elle ne contient que l'onglet **Habitudes** (+ Réglages). Le marqueur `app: 'Sandeep 2.0'` des sauvegardes JSON est un identifiant de format commun aux trois apps : ne jamais le changer. **Les trois apps (Habits, Dressing, Gym Food) sont en français uniquement** (demande du 7 novembre 2026, v0.39 ; avant : bilingue anglais / français au choix dans Réglages) : la langue est imposée dans `js/core/i18n.js`, plus de choix de langue dans Réglages. Tout texte visible passe toujours par `S2.L('English', 'Français')` (`js/core/i18n.js`, chargé en premier) : seul le français s'affiche, mais l'anglais reste dans le code (les tests Node tournent en anglais) ; ne jamais laisser un texte visible sans sa version française. Les dates utilisent `S2.locale` (`en-GB` / `fr-FR`), `S2.ui.num` affiche un point en anglais et une virgule en français (les deux acceptés à la saisie). En français : tutoiement, formulations **neutres en genre** (l'app est partagée), typographie française. **Les données enregistrées ne sont jamais traduites** : valeurs, clés et ids restent tels quels ; les libellés intégrés (habitudes par défaut, types de pièces, couleurs, recettes intégrées non modifiées…) sont traduits à l'affichage ; ce que l'utilisateur a saisi s'affiche tel quel. Les ids d'onglets et les clés de stockage (`muscu`, `garde-robe`…) ne changent pas.
- **App « Dressing » séparée, seule app qui contient la Garde-robe** (`dressing/`, créée le 7 novembre 2026, v0.37) : onglets **Garde-robe + Réglages**, en français, installable à part. Même principe que Gym Food : elle charge `../js`, `../css` avec `dressing/config.js` (`window.S2_APP` : stockage limité à `garde-robe`, `garde-robe-photos` et `settings`). Tout nouveau fichier utilisé par la Garde-robe va aussi dans `dressing/sw.js`. Ne pas remettre la Garde-robe dans `index.html` / `sw.js`.
- **App « Gym Food » séparée (ex-« SanEva », renommée le 7 novembre 2026, v0.38 ; avant : « SanEva Cooking »), seule app qui contient la Muscu et la Cuisine** (`cuisine/` — dossier gardé pour ne pas casser les apps installées ; créée le 5 novembre 2026 pour le téléphone de Maeva, devenue SanEva le 6 novembre 2026, puis Gym Food) : onglets **Aujourd'hui + Muscu + Objectif + Cuisine + Réglages**, en français, installable à part. Elle charge les mêmes fichiers (`../js`, `../css`, `../img`) avec `cuisine/config.js` (`window.S2_APP` : langue imposée, stockage limité à `aujourdhui`, `aujourdhui-photos`, `muscu`, `objectif`, `cuisine` et `settings`). Chaque onglet doit fonctionner sans les autres. **App entièrement personnelle, un téléphone = une personne** (décision du 7 novembre 2026, v0.36) : aucune 2e personne nulle part (ni Aujourd'hui, ni Muscu, ni Objectif, ni Cuisine) ; Maeva a son propre Gym Food sur son téléphone. Les courses à 2 passent par un échange de message entre les deux apps (v0.37 : Courses › « Envoyer mes courses » / « Ajouter les courses de quelqu'un », `js/tabs/cuisine-share.js`), pas par un profil de l'autre personne. Aujourd'hui lit les autres onglets uniquement via leurs API (`S2.objectif`, `S2.muscu`, `S2.cuisine`). Objectif (demande du 6 novembre 2026 : un profil par téléphone, Sandeep et Maeva) calcule les besoins du jour ; la Cuisine les lit via `S2.objectif.targets()` (jamais la clé `sandeep2:objectif`) et doit marcher sans. Tout nouveau fichier utilisé par la Muscu ou la Cuisine va aussi dans `cuisine/sw.js`.
- **Mobile-first (iPhone)** : grandes zones tactiles (≥ 44 px, idéalement 48 px), clavier numérique pour toute saisie de nombre (`inputmode="decimal"` pour les poids, `inputmode="numeric"` pour les entiers ; accepter la virgule), champs en 16 px minimum (pas de zoom iOS), utilisable **à une main à la salle** (actions principales en bas de l'écran), respect des safe areas (`env(safe-area-inset-*)`).
- **Ne jamais perdre les données** (v0.40, après la perte des séances de Sandeep le 7 novembre 2026) : supprimer l'icône d'une app sur iPhone efface ses données. Rappel de sauvegarde en haut des onglets après 7 jours (`js/settings.js` › `backupBanner`, inséré par `js/core/app.js`), avertissement dans Réglages, `navigator.storage.persist()` au démarrage. Ne pas retirer.
- **Contrôle manuel total** : aucune récupération automatique de données externes, aucune décision automatique. Les suggestions sont permises mais l'utilisateur confirme toujours (suppression, import, fin de séance… passent par une confirmation).

## Règles techniques
- **HTML/CSS/JavaScript simples, sans étape de build**, pour tourner tel quel sur GitHub Pages. Pas de framework, pas de npm, pas de dépendance CDN.
- Scripts classiques (pas de modules ES) sous l'espace de noms global `window.S2`. Chemins **relatifs** partout (l'app est servie sous `/Sandeep-2.0/`).
- **Modulaire** : chaque domaine de vie est un onglet **et** son propre fichier JS dans `js/tabs/`. Onglets de Habits : Habitudes, Réglages. **La Garde-robe n'est plus dans l'app principale depuis la v0.37** : elle vit seulement dans Dressing (`dressing/`) ; ses fichiers restent `js/tabs/garde-robe*.js`. **La Cuisine n'est plus dans Sandeep 2.0 depuis la v0.22** (5 novembre 2026) : elle vit seulement dans Gym Food (`cuisine/`) ; ses fichiers restent dans `js/tabs/cuisine*.js`. **La Muscu non plus depuis la v0.27** (6 novembre 2026) : elle vit seulement dans Gym Food ; son fichier reste `js/tabs/muscu.js`. Ne remettre ni l'une ni l'autre dans `index.html` / `sw.js`.
  - Un onglet s'enregistre via `S2.app.registerTab({ id, label, icon, soon, mount })`.
  - Chaque onglet stocke ses données sous **sa propre clé** localStorage (`sandeep2:<id>`) via `S2.storage`. Un onglet ne lit/écrit jamais les données d'un autre.
  - **Ajouter un onglet ne doit jamais casser les existants** : le rendu de chaque onglet est isolé (try/catch dans `js/core/app.js`), pas de CSS global non préfixé dans un onglet (préfixer les classes par l'id de l'onglet, ex. `.mu-`).
- **Données dans localStorage**, avec **Export / Import JSON** dans l'écran Réglages (l'export inclut automatiquement toutes les clés `sandeep2:*`, donc tout nouvel onglet est sauvegardé sans travail supplémentaire). Toute évolution du format de données doit rester compatible avec les anciens exports (migrations dans le `load` de l'onglet).
- Service worker (`sw.js`) pour un usage hors-ligne à la salle. Ajouter tout nouveau fichier à la liste `ASSETS` de `sw.js`. Ne pas toucher au jeton `__BUILD__` : le workflow Pages (`.github/workflows/pages.yml`) le remplace (dans `sw.js`, `cuisine/sw.js` et `dressing/sw.js`) par le SHA du commit, ce qui déclenche la mise à jour automatique de l'app installée (`js/main.js` recharge dès que l'utilisateur ne saisit rien). Tout ce qui est mergé sur `main` est publié sur https://sdeepmvp.github.io/Sandeep-2.0/.

## Style visuel
- Minimal, palette neutre et terreuse : crème, beige, camel, brun chocolat, bleu marine. Typographie propre (police système), chiffres tabulaires.
- Mode clair **et** sombre : couleurs définies comme variables CSS dans `:root` (`css/app.css`), thème Auto / Clair / Sombre réglable dans Réglages.

## Process
- Après chaque changement, ajouter une entrée courte (en anglais) dans **CHANGELOG.md** (date, version, quoi) et incrémenter `VERSION` dans `js/settings.js`.
- Tester sur un viewport iPhone (390 × 844) avant de pousser.
- Lancer `node tests/run.js` avant de pousser ; toute nouvelle règle d'un moteur pur (Wardrobe, Muscu `muscu-engine.js`, rappel de sauvegarde `S2.storage.backupDue`, nutrition `objectif-engine.js`, table `cuisine-nutrition.js`, prix `cuisine-prices.js`, bilan `aujourdhui-engine.js`) s'accompagne d'un test. Garder le moteur pur (testable sous Node) et la recherche de tenues sous 300 ms pour 100+ pièces.
- Les photos de Wardrobe sont compressées (320 px, JPEG) dans `sandeep2:garde-robe-photos` : elles sont incluses dans l'export JSON.

## Structure
```
index.html            coquille de l'app (barre d'onglets, zone de vue)
manifest.webmanifest  installation écran d'accueil
sw.js                 cache hors-ligne
css/app.css           thème + composants partagés (+ styles préfixés par onglet)
js/core/i18n.js       langue (S2.L, S2.lang, S2.locale) : français imposé
js/core/storage.js    stockage par espace de noms, export/import
js/core/ui.js         helpers DOM, feuilles (bottom sheets), confirmations, toasts
js/core/app.js        registre des onglets, navigation
js/tabs/*.js          un fichier par onglet (muscu.js, garde-robe.js, …)
js/tabs/cuisine-recipes.js  recettes intégrées de Kitchen/Cuisine, en français + `en` (mêmes nombres de lignes ; nouvel id = ajoutée aux données existantes ; recette retirée = empreinte dans REMOVED de cuisine.js)
dressing/             app « Dressing » : Garde-robe (index.html, config.js, manifest, sw.js, icônes)
cuisine/              app « Gym Food » : Muscu + Cuisine (index.html, config.js, manifest, sw.js, icônes)
img/recettes/         photos des recettes intégrées (champ `photo`, lu depuis la source, ajoutées à cuisine/sw.js)
js/tabs/cuisine-share.js    module PUR des courses à 2 : liste envoyée par message (texte lisible + ligne SANEVA1:…, marqueur de format à ne jamais changer), relue et additionnée à la sienne
js/tabs/cuisine-prices.js   moteur PUR des prix moyens (panier estimé des Courses, paquets entiers, placard au prorata) ; prix saisis par l'utilisateur dans `sandeep2:cuisine` (prices)
js/tabs/garde-robe-combos.js  combinaisons de couleurs (paires, trios, chaussures) utilisées par Wardrobe
js/tabs/aujourdhui.js       onglet Aujourd'hui de Gym Food (journal du jour, séance du jour, eau, pesée, bilan de la semaine)
js/tabs/aujourdhui-engine.js moteur PUR : totaux du journal, bilan, tendance du poids, ajustement proposé, check-list du jour, « ce qu'il te manque », restes, bilan du mois, calories d'activité (cible du jour), moments des repas, sommeil et pas
js/tabs/muscu-engine.js     moteur PUR de la Muscu : groupe musculaire d'un exercice, séries par muscle, résumé de fin de séance, stagnation, force du mois, exercices au poids du corps (perf : 1RM avec le poids du corps ou répétitions), cycles de 12 semaines (cycleStatus, décharge)
(photos de progression d'Aujourd'hui : `sandeep2:aujourdhui-photos`, 480 px JPEG, incluses dans la sauvegarde)
js/tabs/cuisine-nutrition.js table nutritionnelle PURE des ingrédients + aliments du quotidien (journal)
js/tabs/ciqual-data.js      ~1 000 aliments de la table Ciqual 2025 (Anses, Licence Ouverte), valeurs pour 100 g + portion type ; fichier généré, citer la source
js/tabs/produits-data.js    ~200 produits de marque et plats du quotidien (sodas, fast-food, barres…), même format que Ciqual, ids `p-…` ; valeurs moyennes d'étiquette INDICATIVES ; généré par `tools/gen-produits.py` (modifier le script puis relancer `python3 tools/gen-produits.py js/tabs/produits-data.js`)
js/tabs/objectif.js         onglet Objectif de Gym Food (questionnaire, profil, besoins du jour, poids, mensurations, 2e personne) ; expose S2.objectif
js/tabs/objectif-engine.js  moteur PUR nutrition : besoins (Mifflin-St Jeor), adéquation des recettes, journées types
js/tabs/garde-robe-engine.js  moteur PUR de Wardrobe (règles, notes, recherche, apprentissage) : pas de DOM ni de stockage
tests/run.js          tests automatiques du moteur (`node tests/run.js`, sans dépendance), lancés par GitHub sur chaque PR
js/settings.js        écran Réglages
js/main.js            démarrage
```
