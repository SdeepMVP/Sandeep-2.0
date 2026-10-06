# Changelog — Sandeep 2.0

## 0.3.0 — 2026-10-06
- The whole interface is now in English (tabs: Gym, Wardrobe, Kitchen, Habits, Settings). Numbers use a decimal point; commas are still accepted when typing. Existing data is untouched.
- Fix: a set saved without reps or weight showed “null” in the history; it now shows “?”.

## 0.2.0 — 2026-10-06
- Mise à jour automatique : l'app installée détecte chaque nouvelle version publiée et se recharge toute seule (en attendant la fin d'une saisie), avec le message « Application mise à jour ».
- Réglages : bouton « Vérifier maintenant » et affichage de la version.

## 0.1.1 — 2026-10-06
- Publication automatique sur GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`).

## 0.1.0 — 2026-10-06
- Première version de l'app : coquille avec barre d'onglets (Muscu actif ; Garde-robe, Cuisine, Habitudes « bientôt » ; Réglages).
- Onglet **Muscu** : programme 4 jours (Legs / Push / Pull / Shoulders) entièrement modifiable (ajout, suppression, ordre, séries, fourchette de reps, catégorie, variantes au choix par séance).
- Saisie de séance : jour + semaine (1–12), poids / reps / RPE (6 à 10 par 0,5) par série, valeurs de la dernière fois en gris, bouton ✓ pour les reprendre, sauvegarde automatique à chaque frappe.
- RPE cible par catégorie et double progression (suggestion d'augmenter si toutes les séries au haut de la fourchette avec RPE < 9,5). Semaine 1 = référence sans objectif.
- Historique par exercice avec 1RM estimé (Epley, meilleure série) et graphique ; liste des séances avec suppression.
- Réglages : thème Auto / Clair / Sombre, export / import JSON, copie du JSON, tout effacer.
- Installable sur l'écran d'accueil (manifest, icônes, service worker hors-ligne).
