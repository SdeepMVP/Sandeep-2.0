/* App « Dressing » (dossier dressing/) : onglet Garde-robe + Réglages, bilingue, installable à part.
   Créée le 7 novembre 2026 (v0.37) quand la Garde-robe a quitté l'app principale (devenue Habit Tracker).
   Réutilise les fichiers de l'app principale (../js, ../css). Chargé avant tout le reste. */
window.S2_APP = {
  id: 'dressing',
  name: 'Dressing',                                           /* nom affiché (écran d'accueil, en-tête, Réglages) */
  root: '../',                                                /* chemin vers la racine de l'app principale */
  storage: ['garde-robe', 'garde-robe-photos', 'settings']    /* export, import et effacement limités à ces données */
};
