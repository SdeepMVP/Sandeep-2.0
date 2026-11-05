/* App « Cuisine » : l'onglet Cuisine seul, en français, installable à part (ex. sur le téléphone de Maeva).
   Réutilise les fichiers de l'app complète (../js, ../css, ../img). Chargé avant tout le reste. */
window.S2_APP = {
  id: 'cuisine',
  root: '../',                       /* chemin vers la racine de l'app complète (photos des recettes) */
  lang: 'fr',                        /* langue imposée : pas de choix de langue dans Réglages */
  storage: ['cuisine', 'settings']   /* export, import et effacement limités à ces données */
};
