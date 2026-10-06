# Changelog — Sandeep 2.0

## 0.11.0 — 2026-10-06
- Wardrobe **performance**: 3-stage search with per-piece shortlists instead of trying every combination. A 105-piece closet went from ~4 s to well under 0.3 s; “Show another one” is instant (cached). Quality checked against the exhaustive search in tests.
- **Learns your taste**: 👍 / 👎 on each suggestion (the outfit and its pairs of pieces), wearing an outfit counts as a small 👍; disliked outfits never come back. ★ **Favourite** pieces rotate back more often.
- **Today** puts the outfit first: occasion and weather collapse into one tappable bar.
- **Faster entry**: picking a kind fills fit, material, style, contexts, washing and length; **Duplicate** a piece; **Select** several pieces to send to the laundry, mark clean, favourite, set contexts or storage place, or delete.
- **Photos** for each piece (compressed, shown in outfits, closet and laundry; included in backups).
- **Wears before washing** per piece (e.g. jeans 6, T-shirt 1, leather never): the evening laundry sheet pre-ticks pieces that are due.
- **Insights** in History: most worn, never worn, forgotten for 2 months, cost per wear (optional price).
- Engine split into `garde-robe-engine.js` (pure, testable) with an automated test suite (`node tests/run.js`) run by GitHub on every pull request.

## 0.10.0 — 2026-10-06
- Wardrobe Style DNA rewritten as **creative guidelines** (structured street smart, oversized tailoring): rules now rank outfits instead of excluding them, so a great outfit that bends one can win. Such outfits show a “✦ Creative pick” note.
- New preferences: **tonal looks** (all black / cream / brown / grey) and shades of the same family, signature fitted-top / wide-bottom contrast (volume on volume allowed when tonal), **cropped / waist-length outerwear** (new Length field; long coats “wear it open”), visible layers, **one subtle statement pattern** (thin stripe, tonal pinstripe, plaid, houndstooth), **one statement texture** (leather, suede, fleece, knit, wool, corduroy, shearling) over smooth pieces; loud prints, logos and bright colours ranked lower.
- Palette: white, cream, beige, sand, khaki, grey, black, chocolate brown, dark navy, taupe (sand and taupe added). A subtle extra colour carried by a pattern is tolerated.
- Softer layering guidance: base only above 22 °C, mid layer 14–22 °C, outerwear below 14 °C, “the right call” below 6 °C. Shoes: dark and structured as a tendency; light sneakers allowed (not for formal).
- Accessories: necklace and chain wallet added; up to 2 subtle details per outfit. My Style screen updated.

## 0.9.0 — 2026-10-06
- Wardrobe **Style DNA** (smart casual + street smart) applied to every suggestion: slim top → wide bottom (never both slim or both loose), palette white/black/beige/brown/cream/navy/khaki/grey with 3 colours max, dark structured shoes (sport shoes only for sport), mid layer below 14 °C, outerwear below 6 °C, base layer only above 22 °C. Read-only **My Style** screen (Wardrobe › Today, and Settings).
- **21 occasions** in 6 groups (Work, Daily life, Social, Formal, Sport & wellness, Travel) in a scrollable chip row; per-type rules (sport only from activewear, no sneakers for formal, no hoodies/joggers for work).
- Weather is now a **temperature slider (°C)** plus a condition (clear, cloudy, rain, wind, snow). Pieces get a **Fit** (slim / regular / wide) and a new **Accessories** type (cap, beanie, scarf, bags, watch); “Good for” gains Dressed up and Travel.
- **Complete your look**: up to 2 optional accessories under the outfit (scarf when cold or windy, beanie below 10 °C or cap, watch, bag), each to add or dismiss.
- **History** journal: “I wore this” logs date, time, pieces, accessories, occasion and weather; entries can be deleted. Pieces worn in the last 3 days are suggested last, pieces not worn for 7+ days first.
- Existing data migrated (old weather and occasions mapped, fits inferred from names, past history kept).

## 0.8.0 — 2026-10-06
- Wardrobe: **saved outfits**. Create them from scratch, from a suggestion or from what you wore; see which are ready (nothing in the laundry), filter by occasion, wear them in one tap. Ready outfits for the chosen occasion appear first in Today.
- Each piece can have a **storage place** (shown in outfits so you can find the clothes), plus kind (shirt, chinos, boots…), pattern, style (sport → formal), material, brand and notes. Existing pieces are completed automatically.
- Colour rules extended with proven combinations from menswear guides: 44 colour pairs, 9 trios, shoe colour by trouser colour, light–dark balance, one pattern at a time, dress code per occasion, linen/wool by weather, no suede in the rain. Browse them in the new Colour guide.
- Closet search (name, colour, kind, place…) and filters (clean, laundry, occasion).

## 0.7.0 — 2026-10-06
- New **Wardrobe** tab (no longer “soon”). Closet with type, colour, warmth, occasions (work, gym, clubbing, date, chilling out) and rain-proof flag; optional starter set of 23 basics.
- **Today**: pick the weather (cold / cool / mild / hot, rain) and the occasion, get a suggested outfit with matching colours and the reasons why; show another one, swap a piece yourself, then “Wear this”.
- Rotation: pieces worn in the last two days are suggested less.
- **Laundry**: in the evening, choose which worn pieces go in the laundry; they are not suggested until marked clean.

## 0.6.0 — 2026-10-06
- Habits: new **Daily** view with a checklist for today: Creatine, Medication (morning + evening), Sleep schedule (in bed before midnight, up before 9:00).
- Streak and best streak per habit, last 7 days strip (tap a day to fix it).
- Add, edit (single box or several times a day) and delete your own daily habits. Quit smoking moves to its own view, with a shortcut from Daily.

## 0.5.0 — 2026-10-06
- New **Kitchen** tab (no longer “soon”) with 10 easy, fast, high-protein recipes: 4 breakfast & snacks, 6 lunch & dinner.
- Search by recipe name or ingredient (e.g. “chicken”), filters by category.
- Each recipe: grocery checklist (saved ticks, share the missing items), servings that adjust quantities, steps to tick off, and a full-screen step-by-step cooking guide that keeps the screen on.
- Add, edit and delete your own recipes.

## 0.4.0 — 2026-10-06
- New **Habits** tab (no longer “soon”) with a first habit: **Quit smoking**, goal 0 cigarettes a day.
- Smoke-free streak (current and best), today counter (+/− per cigarette), “Smoke-free today” and “I resisted a craving” buttons.
- Last 28 days calendar (tap a day to edit it), totals, and optional starting point (cigarettes per day, pack price) to estimate cigarettes avoided and money saved.
- Health milestones (WHO / American Cancer Society) and the Tabac Info Service number (39 89).

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
