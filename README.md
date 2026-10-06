# Sandeep 2.0

Mon hub de vie personnel — web app mobile-first pour iPhone (HTML/CSS/JS, sans build).

- En ligne : https://sdeepmvp.github.io/Sandeep-2.0/ (une fois GitHub Pages activé)
- Règles du projet : [CLAUDE.md](CLAUDE.md) · Historique : [CHANGELOG.md](CHANGELOG.md)

## Lancer en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Publier avec GitHub Pages
Settings → Pages → *Build and deployment* → Source : **GitHub Actions**. Chaque push sur `main` publie automatiquement (workflow `.github/workflows/pages.yml`).
