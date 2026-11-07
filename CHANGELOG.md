# Changelog — Habits (ex-Sandeep 2.0), Gym Food (ex-SanEva), Dressing

## 0.42.0 — 2026-11-07
- Today › Add food: **196 brands and everyday dishes** on top of the Ciqual table (1,274 foods in all): sodas (Coca-Cola, Coca Zero, Fanta, Sprite, Orangina, Oasis, Ice Tea, Schweppes, Pepsi…), energy and sports drinks (Red Bull, Monster, Powerade…), beers and cocktails, fast food (McDonald's, Burger King, KFC, French tacos, kebab, sushi, poke, pizza by the slice…), bars and sweets (Kinder, Twix, Mars, Snickers, M&M's, Haribo, Nutella…), crisps, biscuits, cereals, dairy desserts, ice creams and everyday dishes. Values are average label values, for guidance.
- Search: brands come first, synonyms now add to the typed word (“nutella” finds Nutella and spreads; “mcdo”, “bk”, “redbull”, “mms”…).
- Drinks are counted in ml.

## 0.41.0 — 2026-11-07
- Gym: **bodyweight exercises** (push-ups, pull-ups, dips…) now have records, curves, end-of-workout comparison and stall detection: estimated 1RM with your bodyweight (Goal) + any extra weight, or best set in reps if your weight is unknown. Plank and other holds count in reps/seconds. Leave “kg” empty (shown as “BW”) or type the extra weight.
- Gym: **after the 12 weeks**: a “cycle done” card suggests a **deload week** (−10 % weights, one set less, no suggestions, ignored for stalls), then a **new cycle** (same program from week 1, history kept) or another program. Deload can also be picked any week.
- Today: **activity calories**: estimated burn for each activity (by type, duration, weight), and you choose to add half of it to the day's target (ticked by default when adding). The weekly review uses each day's target.
- Today: foods logged outside the plan are grouped by **meal** (breakfast, lunch, snack, dinner), chosen when adding (suggested from the time), with a “+” per meal.
- Today: adjustable **water goal** (4 to 16 glasses), **sleep and steps** typed by hand, with averages in the weekly and monthly reviews; the Gym stall tip shows your average sleep.

## 0.40.0 — 2026-11-07
- **Never lose your data again** (all three apps): a reminder at the top of each tab after 7 days without a backup (“Back up now” / “Later”), a clear warning in Settings that deleting the app icon erases its data, and the app asks iOS to keep its storage.
- Gym Food › Today:
  - **My day** checklist: calories, protein, workout (or rest), water; the day is “achieved” when all are ticked, with the week shown as 7 dots;
  - **What you are missing**: when protein is short, 1 or 2 of your usual foods that fit the calories left, added in one tap after confirming;
  - **Same as yesterday**: tick what you ate again and add it at once;
  - **Leftovers in the fridge**: servings cooked in Kitchen (“I cooked” / “✓ Cooked”) not eaten yet, for 3 days;
  - **What can I cook with what I have?** link to Kitchen when nothing is planned.
- Review › **Month**: consistency (workouts done vs planned, days tracked, on target, achieved), body (weight and waist over the month), strength (best estimated 1RM per exercise vs the month before) and **progress photos** (compressed, kept on the phone and in backups, first vs latest side by side).
- Gym: **end-of-workout summary** (duration, sets, tonnage, records 🏆, better or lower than last time), **My week** (this week's training days done / missed / to come, and next week), History › **Review**: sets per muscle this week vs the 4 weeks before (guide 10–20), and exercises that **stall** (3 workouts over 2+ weeks without a new best) with a suggestion. New pure engine `muscu-engine.js`, with tests.

## 0.39.0 — 2026-11-07
- **Habits, Dressing and Gym Food are now in French only.** The language choice is removed from Settings; an English choice saved earlier is ignored. Your data is unchanged.

## 0.38.0 — 2026-11-07
- The main app is renamed **Habits** (ex-Sandeep 2.0) and now only has the **Habits** tab (+ Settings). New icon.
- **SanEva is renamed Gym Food** (same address `cuisine/`, same data). The groceries-for-two message format is unchanged, so messages from older versions still work.
- **Wardrobe moves to Dressing**, its own app (`dressing/`, English or French, installable on the Home Screen, own icon): Wardrobe + Settings (with My Style). Its backups only take Wardrobe, its photos and settings.
- Habits › Settings links to Dressing and Gym Food. To bring your clothes over on iPhone: export a backup in Habits and import it in Dressing. Old backups still import everywhere.

## 0.37.0 — 2026-11-07
- SanEva Kitchen › Groceries: **groceries for two, by message**. Each person plans in their own app, then:
  - **📤 Send my groceries** opens the iPhone share sheet (iMessage, WhatsApp, AirDrop…) with a readable list and a SanEva line;
  - **📥 Add someone’s groceries**: paste the message, check the preview, confirm.
- The received list merges with yours: same ingredients are added up, each line shows who it is for, and the basket price covers both. **Remove** takes their part out after shopping. A new message from the same person replaces their previous list.
- No server and no account. Only your unticked items are sent, and invalid messages are refused. Tests for the message format and the merge.

## 0.36.0 — 2026-11-07
- SanEva is now **fully personal**: one phone, one person. The other person is removed everywhere: Goal (“Cooking for two”), Kitchen Planning (“For two”) and leftover data in Gym and Today. Their profile is deleted from the phone's data on first launch. Menus and groceries already confirmed are kept as they are.

## 0.35.0 — 2026-11-07
- SanEva: **tracking is personal again**: Today (journal, workout of the day, review) and Gym (program, history, goals) are only for the person whose phone it is; each person uses SanEva on their own phone. The person switch is removed from Today and Gym.
- The other person (Goal › Cooking for two) is now **only used by Kitchen**: servings for two in the Planning and one grocery list for both. Adding or updating them is a simple form (no questionnaire, no gym program, no weigh-in for them).
- Data entered for the other person in Gym or Today in v0.33 stays in backups but is no longer shown.

## 0.34.0 — 2026-11-07
- SanEva Today: **about 1,080 foods** to log. 1,026 come from the official **Ciqual 2025 table (Anses, Licence Ouverte)**, picked from the 3,484 for everyday eating in France (fruit, vegetables, meat, fish, dairy, cheese, bread, pasta, ready meals, fast food, drinks, desserts…), plus the app's 52 everyday foods. Baby foods, mineral waters, rare offal and overseas-only items are left out. Data is built into the app; nothing is fetched online.
- **Search** across all of them, accent and plural-insensitive, with synonyms (coca → cola, nutella → chocolate spread). Everyday and cooked foods come first, and results show in a few milliseconds.
- Ciqual foods are logged **in grams**: typical serving (1 egg, 1 pot, 1 slice, 1/2 pizza…), ½, ×2, 100 g, ±10 g or any amount typed. Recent foods include them.
- The app's cooked rice and pasta now use the Ciqual values. Tests for the Ciqual data and the search.

## 0.33.0 — 2026-11-07
- SanEva: new **Today** tab, first in the bar, for daily tracking of you and the other person (switch at the top):
  - calories, protein, carbs and fat eaten vs target;
  - meals planned by Kitchen › Planning to tick (**✓ Eaten**, or another serving);
  - **add food**: about 50 everyday foods (eggs, skyr, banana, coffee, pizza, kebab…), recipes, your own foods, or a **quick entry** with calories only; recent items first;
  - the **planned workout** (start or resume it in one tap) and other **activities** (running, cycling, walking…);
  - **water** and **weigh-in**.
- **Review** of the week: workouts done vs planned and lift goals, days tracked and on target, average calories and protein, **weight curve** (12 weeks, with target weight), **waist curve**, 4-week weight trend. It then **suggests ±150 kcal** when the trend does not match the goal; you confirm it, and it asks for 2 weeks of tracking first.
- **Getting-started questionnaire**, also in Goal for you and for the other person, in 4 steps:
  1. who you are, and how active you are outside sport;
  2. your sport: level, gym or home, workouts per week and which days;
  3. your sport and nutrition goals, with an optional target weight;
  4. a suggestion to confirm: calories and macros, plus a program and training days. The program is picked by sessions per week, place and goal: Full body, Upper/Lower, PPL, Glutes, or a new **home dumbbell** program.
- Gym: tracks **both people** (each has their own program and history). **Training days** of the week (the planned workout is preselected and shown in Today), **sport goals** (workouts per week, weight to reach on a lift, with progress) and a **rest timer** after each confirmed set (2:30 / 2:00 / 1:15).
- Goal: **measurements** (waist, hips, chest, arm, thigh), weight and measurements for the other person too, target weight.
- Kitchen: **nutrition table** for ingredients. Recipes now show **carbs and fat**, and the recipe editor can **calculate calories and protein from the ingredients**. Shrimp poke bowl protein corrected (42 → 50 g).
- The app opens on the first tab of the bar. Tests for the nutrition table, daily totals, weekly review, weight trend and suggestions.

## 0.32.0 — 2026-11-07
- SanEva Kitchen Planning: **1 day · 3 days · 4 days · Week**, to shop twice a week. A new plan starts the day after the confirmed one (or today), with ‹ › to move the start, and **avoids the dishes of the previous plan**; “Plan the next days” on a confirmed plan. Any length can be confirmed into the menu and groceries.
- **Cooking for two**: in Goal, add the other person (height, weight, age, activity, goal). Planning then offers **For me / For two**: recipes are chosen for you and the other person gets their own serving (×0.5 to ×2 in quarters, adjusted over the day to their calories), shown on every meal with both people's day totals; the menu and groceries cover both.
- Tests for 3/4-day plans, avoiding the previous plan and cooking for two.

## 0.31.0 — 2026-11-06
- SanEva Kitchen: **15 new lunch & dinner recipes** (all for 2, in French and English, protein and calories per serving calculated from the ingredients): light chicken tikka masala, steak with sweet potato fries, tofu & chickpea curry (vegetarian), light shepherd’s pie, turkey in creamy mushroom sauce, honey mustard pork tenderloin, chicken & chickpea couscous, beef & black bean burrito bowl, chicken souvlaki with tzatziki, chicken pad thai, light beef stroganoff, pesto-crusted salmon traybake, oven chicken nuggets & fries, crustless courgette & feta quiche (vegetarian), Basque-style chicken. Now 72 recipes (51 lunch & dinner); they are added to existing data automatically.
- Basket prices for their new ingredients (pork, steak, chickpeas, couscous, sweetcorn, pita, bean sprouts, peanuts…); pork and steak count as meat for the Vegetarian filter and the meat aisle.

## 0.30.0 — 2026-11-06
- SanEva Kitchen: **estimated basket price** at the top of Groceries as soon as the list has items: total in euros with a range (±15 % depending on the shop), what the menu actually uses, price per serving, pantry items (oil, spices, sauces) counted apart pro rata, and **left to buy** once items are ticked. Subtotal per aisle and a price on each line.
- Prices are built-in averages for French supermarkets (about 100 ingredient rules, whole packs: 6 eggs, 500 g of chicken…); nothing is fetched online. **Adjust my prices** lets you type what you pay (per kg, litre or piece), saved on the phone, or go back to the averages.
- Tests for the price estimates (every built-in ingredient priced, packs, pantry, own prices, plausible weekly basket).

## 0.29.0 — 2026-11-06
- SanEva Kitchen: **plan the whole week**. The “My day” section becomes **Planning** with **One day / The week**: 7 days of recipes from today, each close to your calories and protein, with day totals and weekly averages.
- **Varied** (a different menu every day) or **Batch cooking** (the same dishes 2 to 3 days in a row: about half as many recipes to buy and cook); “↻ Change” replaces one day only, “↻ Another week” the whole week.
- **Confirm the week**: each recipe goes once into the menu with all its servings for the week (rounded up) and the days it is planned (e.g. “Fri, Sat, Sun”), so the groceries add everything up; if the menu already has meals you choose to replace it or add to it. The confirmed week stays visible in Planning until you plan a new one or remove it.
- Menu servings now go up to 24. Tests for the week planner.

## 0.28.0 — 2026-11-06
- SanEva: new **Goal tab** (one profile per phone): height, weight, age, activity, meals per day and goal (**muscle gain, body recomposition, cut, maintenance**). It calculates **calories, protein, carbs and fat per day** (Mifflin-St Jeor × activity, then −20 % to +10 % by goal; protein 1.6 to 2.2 g/kg), shows how it is calculated, lets you **set targets by hand**, and keeps a **weight log** (targets follow your current weight).
- SanEva Gym: **your own program**. Add, rename, reorder and delete days; **ready-made programs** (Full body A/B, Upper/Lower, Glutes & legs, Push/Pull/Legs, Sandeep's program, blank page) replace the days while keeping the history; exercise names are suggested as you type (about 50 common exercises). A new phone gets a “Is this your program?” card. Workouts remember their day's name even if the day is deleted later.
- SanEva Kitchen: **🎯 My goal** filter (on by default once the profile is filled in) sorts recipes by protein per calorie compared with your targets, with **your serving** (×0.5 to ×2, about one meal) and its share of your day on each recipe. New **My day** section suggests a full day of recipes (one per meal) close to your calories and protein, with **Another suggestion** and **Add this day to the menu**; it follows the vegetarian, no-oven, 15-min and “Without…” filters.
- Recipes only have calories and protein, so matching uses those two; carbs and fat are shown as targets in the Goal tab.
- Tests for the nutrition engine (`node tests/run.js`).

## 0.27.0 — 2026-11-06
- The **Gym tab is removed from Sandeep 2.0**: workouts now live only in **SanEva** (`/cuisine/`), with the Kitchen. The full app keeps Wardrobe, Habits and Settings, and opens on Wardrobe.
- Workouts saved in Sandeep 2.0 are kept in its data and backups: export a backup and import it in SanEva to get them there.
- Settings: the SanEva card explains this.

## 0.26.0 — 2026-11-06
- **SanEva Cooking becomes SanEva**: the separate app (`/Sandeep-2.0/cuisine/`, same address so installed copies keep working) now has **Gym + Kitchen + Settings**, still in French. Gym is the same tab as in Sandeep 2.0 (program, sessions, history), with its own data on each phone.
- SanEva's export, import and “Erase everything” now cover Gym, Kitchen and settings; importing a Sandeep 2.0 backup brings its workouts and recipes, never wardrobe or habits.
- New SanEva icon (bowl + dumbbell). Sandeep 2.0 keeps its Gym tab; its Settings card now points to SanEva.

## 0.25.0 — 2026-11-05
- SanEva Cooking: **calories per serving checked** against the ingredients (standard values, raw/dry; oil, butter, honey, avocado and cheese counted; optional toppings not counted): 31 recipes were within ±10 %, **26 corrected**, mostly upwards (e.g. avocado, egg & cream cheese toasts 560 → 750 kcal, crispy tofu 640 → 860 kcal), a few downwards (homemade chicken burger 620 → 510 kcal). Saved copies are updated unless you changed the value yourself.

## 0.24.0 — 2026-11-05
- SanEva Cooking: **protein per serving fixed**. Recipe pages showed the per-person value as if it were the total for all servings (e.g. 50 g “for 2 servings” instead of 50 g per person); values are now always shown **per serving (one person)**, with the total for the chosen servings in the hint. Cards say “per serving”.
- **Protein values checked against the ingredients** (standard nutrition values, raw/dry weights): 30 recipes were within ±10 %, **27 were corrected** (mostly booklet recipes that underestimated chicken, tuna and cheese), e.g. tuna & mozzarella pasta bake 43 → 65 g, chicken Caesar 52 → 65 g, crispy chicken 45 → 60 g. Saved copies are updated unless you changed the value yourself.

## 0.23.0 — 2026-11-05
- SanEva Cooking: **Recipes · Menu · Groceries** at the top of the Kitchen tab.
- **Weekly menu**: “+ Add to the menu” on any recipe (with its number of servings, changeable in the menu), “✓ Cooked” or ✕ per meal, **Recently cooked** history (one tap to plan it again); a recipe shows how many times it was cooked and when.
- **One grocery list for the whole menu**: same ingredients added up (e.g. 240 g + 240 g of chicken = 480 g), sorted by aisle (fruit & veg, meat & fish, dairy & eggs, bakery, pantry), tickable and shareable.
- **Find the right recipe**: filters ♥ Favourites, ⏱ 15 min max, No oven, Vegetarian; **What I have** (tick your main ingredients, recipes sorted by what's missing); **Without…** (hide recipes with an ingredient); ♥ favourite and **personal notes** on each recipe.
- **Cooking guide**: the quantities used in each step are shown under it, and durations in the text become **timers** (⏱ 3–4 min) with an on-screen countdown and a beep; finishing the guide logs the meal and removes it from the menu.

## 0.22.0 — 2026-11-05
- The **Kitchen tab is removed from Sandeep 2.0**: recipes now live only in **SanEva Cooking** (`/cuisine/`). The full app keeps Gym, Wardrobe, Habits and Settings.
- Recipes saved in Sandeep 2.0 are kept in its data and backups, so they can be imported into SanEva Cooking (Settings › Import there only takes the recipes and settings).
- Settings: the SanEva Cooking card explains this and gains an **Open SanEva Cooking** button.

## 0.21.0 — 2026-11-05
- The separate Cuisine app is now called **SanEva Cooking** (home screen name, header and Settings); the full app's Settings card uses the new name.

## 0.20.0 — 2026-11-05
- New separate **Cuisine app** at `/Sandeep-2.0/cuisine/`: only the Kitchen tab (plus a small Settings screen: theme, backup, updates), always in French, with its own name, icon and offline cache, so it can be installed on another phone (Maeva's). It uses the same recipes and code as the Kitchen tab, so improvements reach both apps.
- Its export, import and “Erase everything” only touch its own data (recipes and settings), never the gym, wardrobe or habits data of the full app.
- Full app Settings: new **Kitchen app** card with a button to share its link.
- Both service workers now only clean up their own caches.

## 0.19.0 — 2026-11-04
- Kitchen: the **28 recipes from the “Recettes protéinées” booklet** (17 savoury dishes, 11 breakfasts & brunches, all for 2 people), in French and English, with their photo when the booklet's photo matches the recipe (20 of them, shown on the card and at the top of the recipe).
- **11 similar recipes removed** (banana pancakes, overnight oats, ham omelette, egg muffins, avocado toast with soft eggs, fajita wraps, tuna pasta, coconut curry, lean burgers, chicken & black bean quesadillas, gnocchi with pesto). Copies you never edited are removed from your data with their ticks; a recipe you edited is kept.
- Now 57 recipes: 21 breakfast & snacks, 36 lunch & dinner.

## 0.18.0 — 2026-11-03
- **Language switch** in Settings: **English / Français** for the whole app (Gym, Wardrobe, Kitchen, Habits, Settings), so it can follow whoever is using it. The app reloads in the chosen language; English stays the default.
- Built-in texts are translated (default habits, wardrobe kinds, colours and reasons, the 40 built-in recipes in both languages); your data is never changed, and names you typed yourself are shown as you wrote them. Dates and decimals follow the language (e.g. 1.5 vs 1,5, “12 Oct” vs « 12 oct. »).
- Kitchen follows the app language instead of always being French.

## 0.17.0 — 2026-11-03
- Cuisine: **40 recipes** (15 breakfast & snacks, 25 lunch & dinner), all in French and high in protein. New: avocado toast with soft eggs, chocolate protein porridge, fromage blanc with apple & walnuts, tuna & skyr toast, breakfast burrito, no-bake protein bars, express shakshuka; paprika chicken & sweet potato tray bake, beef noodle stir-fry, lean homemade burgers, teriyaki salmon, red lentil dahl with eggs, shrimp poke bowl, express bolognese, chicken & black bean quesadillas, pan-fried gnocchi with chicken & pesto, mustard turkey escalopes, express chicken ramen, lentil, feta & egg salad, tortilla pizza. Added automatically to existing data.

## 0.16.0 — 2026-11-03
- Kitchen is now **in French** and renamed **Cuisine** in the tab bar (requested so it can be shared): screens, buttons, messages, recipes, decimal comma in quantities. Built-in recipes you never edited switch to French automatically, with your ingredient and step ticks kept; recipes you edited or added stay as they are. English words (e.g. “chicken”) still find recipes in search.
- **10 new recipes** (20 in total): protein overnight oats, ham, cheese & spinach omelette, banana & peanut smoothie, make-ahead egg muffins, express chicken coconut curry, express chili con carne, turkey meatballs with tomato sauce & pasta, baked cod with quinoa & courgette, light chicken Caesar salad, crispy tofu with peanut sauce & rice.
- The rest of the app stays in English.

## 0.15.0 — 2026-10-22
- Habits: new built-in daily habit **Hair routine** (one box a day, with its streak, 7-day strip and weekly score). Added automatically to existing data; tap ✎ to split it into steps or delete it.

## 0.14.0 — 2026-10-22
- Habits: new **Weeks** view to follow your progress week by week (Monday → Sunday): overall completion of your daily habits with the change vs last week, a score per habit with its 7-day dots, the smoke-free week (smoke-free days, cigarettes, cravings, vs last week), a 12-week trend chart (tap a bar to open that week; average and best week), and an optional note per week. Browse back to the first week you tracked.

## 0.13.0 — 2026-10-19
- Habits: new built-in daily habit **Pelvic floor routine** with three boxes (Kegels 3 × 10, reverse Kegels 10, belly breathing 2 min), its streak, last-7-days strip and how-to note. Added automatically to existing data; can be edited or deleted like any habit.

## 0.12.0 — 2026-10-06
- Wardrobe **Complete your wardrobe** (from the Closet): ranks the purchases that would unlock the most new good outfits across 6 typical days (weekend, office, date night, summer weekend, cold city day, wedding), with the reason (new outfits with your pieces, first outfit possible for an occasion, upgraded best look) and alternative colours.
- **Days you can’t dress for yet**: when an occasion needs several missing pieces, a simple starter set is proposed.
- **Style essentials** checklist (18 items for structured street smart / oversized tailoring) showing what you own and what's missing.
- **Wishlist** with share, and “I bought it”, which opens the new piece pre-filled (kind, colour, fit, defaults) and removes it from the wishlist.
- Engine: pure shopping analysis (virtual pieces in credible palette colours per kind), covered by 5 new tests; ~0.5 s for 105 pieces, run in small chunks with a progress bar.

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
