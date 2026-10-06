# Sandeep 2.0 — règles permanentes du projet

Application personnelle « hub de vie », utilisée uniquement sur iPhone, installée sur l'écran d'accueil.

## Règles produit
- **Nom de l'app : Sandeep 2.0.** L'interface est **entièrement en anglais** (libellés, messages, aide, confirmations), à la demande de l'utilisateur le 6 octobre 2026 (elle était en français jusqu'à la v0.2.0). Nombres avec point décimal (la virgule reste acceptée à la saisie, clavier iPhone FR), dates au format `en-GB` (jj/mm). Les noms d'exercices saisis par l'utilisateur restent tels quels. Les ids d'onglets et les clés de stockage (`muscu`, `garde-robe`…) ne changent pas, pour ne pas perdre de données.
- **Mobile-first (iPhone)** : grandes zones tactiles (≥ 44 px, idéalement 48 px), clavier numérique pour toute saisie de nombre (`inputmode="decimal"` pour les poids, `inputmode="numeric"` pour les entiers ; accepter la virgule), champs en 16 px minimum (pas de zoom iOS), utilisable **à une main à la salle** (actions principales en bas de l'écran), respect des safe areas (`env(safe-area-inset-*)`).
- **Contrôle manuel total** : aucune récupération automatique de données externes, aucune décision automatique. Les suggestions sont permises mais l'utilisateur confirme toujours (suppression, import, fin de séance… passent par une confirmation).

## Règles techniques
- **HTML/CSS/JavaScript simples, sans étape de build**, pour tourner tel quel sur GitHub Pages. Pas de framework, pas de npm, pas de dépendance CDN.
- Scripts classiques (pas de modules ES) sous l'espace de noms global `window.S2`. Chemins **relatifs** partout (l'app est servie sous `/Sandeep-2.0/`).
- **Modulaire** : chaque domaine de vie est un onglet **et** son propre fichier JS dans `js/tabs/`. Onglets prévus : Muscu (actif), Garde-robe, Cuisine, Habitudes, puis d'autres plus tard.
  - Un onglet s'enregistre via `S2.app.registerTab({ id, label, icon, soon, mount })`.
  - Chaque onglet stocke ses données sous **sa propre clé** localStorage (`sandeep2:<id>`) via `S2.storage`. Un onglet ne lit/écrit jamais les données d'un autre.
  - **Ajouter un onglet ne doit jamais casser les existants** : le rendu de chaque onglet est isolé (try/catch dans `js/core/app.js`), pas de CSS global non préfixé dans un onglet (préfixer les classes par l'id de l'onglet, ex. `.mu-`).
- **Données dans localStorage**, avec **Export / Import JSON** dans l'écran Réglages (l'export inclut automatiquement toutes les clés `sandeep2:*`, donc tout nouvel onglet est sauvegardé sans travail supplémentaire). Toute évolution du format de données doit rester compatible avec les anciens exports (migrations dans le `load` de l'onglet).
- Service worker (`sw.js`) pour un usage hors-ligne à la salle. Ajouter tout nouveau fichier à la liste `ASSETS` de `sw.js`. Ne pas toucher au jeton `__BUILD__` : le workflow Pages (`.github/workflows/pages.yml`) le remplace par le SHA du commit, ce qui déclenche la mise à jour automatique de l'app installée (`js/main.js` recharge dès que l'utilisateur ne saisit rien). Tout ce qui est mergé sur `main` est publié sur https://sdeepmvp.github.io/Sandeep-2.0/.

## Style visuel
- Minimal, palette neutre et terreuse : crème, beige, camel, brun chocolat, bleu marine. Typographie propre (police système), chiffres tabulaires.
- Mode clair **et** sombre : couleurs définies comme variables CSS dans `:root` (`css/app.css`), thème Auto / Clair / Sombre réglable dans Réglages.

## Process
- Après chaque changement, ajouter une entrée courte (en anglais) dans **CHANGELOG.md** (date, version, quoi) et incrémenter `VERSION` dans `js/settings.js`.
- Tester sur un viewport iPhone (390 × 844) avant de pousser.

## Structure
```
index.html            coquille de l'app (barre d'onglets, zone de vue)
manifest.webmanifest  installation écran d'accueil
sw.js                 cache hors-ligne
css/app.css           thème + composants partagés (+ styles préfixés par onglet)
js/core/storage.js    stockage par espace de noms, export/import
js/core/ui.js         helpers DOM, feuilles (bottom sheets), confirmations, toasts
js/core/app.js        registre des onglets, navigation
js/tabs/*.js          un fichier par onglet (muscu.js, garde-robe.js, …)
js/tabs/cuisine-recipes.js  recettes intégrées de Kitchen (nouvel id = ajoutée aux données existantes)
js/settings.js        écran Réglages
js/main.js            démarrage
```
