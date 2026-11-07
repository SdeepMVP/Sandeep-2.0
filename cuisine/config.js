/* App « Gym Food » (dossier cuisine/, nom gardé pour ne pas casser les apps déjà installées) : onglets Aujourd'hui, Muscu,
   Objectif et Cuisine + Réglages, en français, installable à part (ex. sur le téléphone de Maeva).
   Réutilise les fichiers de l'app complète (../js, ../css, ../img). Chargé avant tout le reste. */
window.S2_APP = {
  id: 'saneva',
  name: 'Gym Food',                              /* nom affiché (écran d'accueil, en-tête, Réglages) */
  root: '../',                                 /* chemin vers la racine de l'app complète (photos des recettes) */
  lang: 'fr',                                  /* langue imposée : pas de choix de langue dans Réglages */
  storage: ['aujourdhui', 'muscu', 'objectif', 'cuisine', 'settings']    /* export, import et effacement limités à ces données */
};
