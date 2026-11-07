# Habit Tracker (repo Sandeep-2.0)

Mobile-first web apps for iPhone (plain HTML/CSS/JS, no build step).

- Habit Tracker: https://sdeepmvp.github.io/Sandeep-2.0/
- Dressing (wardrobe): https://sdeepmvp.github.io/Sandeep-2.0/dressing/
- SanEva (gym, kitchen, goals): https://sdeepmvp.github.io/Sandeep-2.0/cuisine/
- Project rules: [CLAUDE.md](CLAUDE.md) · Changes: [CHANGELOG.md](CHANGELOG.md)

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000

## Publishing
Settings → Pages → Source: **GitHub Actions**. Every push to `main` is published automatically (`.github/workflows/pages.yml`), and the installed app updates itself on next launch.
