# Sandeep 2.0

My personal life hub — a mobile-first web app for iPhone (plain HTML/CSS/JS, no build step).

- Live: https://sdeepmvp.github.io/Sandeep-2.0/
- Project rules: [CLAUDE.md](CLAUDE.md) · Changes: [CHANGELOG.md](CHANGELOG.md)

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000

## Publishing
Settings → Pages → Source: **GitHub Actions**. Every push to `main` is published automatically (`.github/workflows/pages.yml`), and the installed app updates itself on next launch.
