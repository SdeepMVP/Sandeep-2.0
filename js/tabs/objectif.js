/* Onglet Objectif (SanEva) : profil (taille, poids, âge, activité), objectif sportif et besoins du jour
   (calories, protéines, glucides, lipides). Suivi du poids. Calculs : js/tabs/objectif-engine.js.
   Données : localStorage "sandeep2:objectif" (un profil par téléphone).
   Expose S2.objectif.targets() pour la Cuisine (qui ne lit jamais ces données directement). */
(function () {
  'use strict';
  var S2 = window.S2;
  var L = S2.L;
  var ui = S2.ui, h = ui.h, num = ui.num;
  var E = S2.nutritionEngine;
  var NS = 'objectif';
  var SCHEMA = 1;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>';

  var GOALS = [
    { id: 'bulk', label: L('Muscle gain', 'Prise de masse'), sub: L('+10 % calories: build muscle while limiting fat gain.', '+10 % de calories : gagner du muscle en limitant le gras.') },
    { id: 'recomp', label: L('Body recomposition', 'Transformation musculaire'), sub: L('−5 % calories, high protein: lose fat and build muscle at the same time.', '−5 % de calories, protéines hautes : perdre du gras et gagner du muscle en même temps.') },
    { id: 'cut', label: L('Cut', 'Sèche'), sub: L('−20 % calories, very high protein: lose fat and keep your muscle.', '−20 % de calories, protéines très hautes : perdre du gras en gardant le muscle.') },
    { id: 'maintain', label: L('Maintenance', 'Maintien'), sub: L('Keep your weight and your shape.', 'Garder ton poids et ta forme.') }
  ];
  var ACTIVITIES = [
    { id: 'sedentary', label: L('Little or no sport', 'Peu ou pas de sport'), sub: L('Office job, under 1 workout a week', 'Travail assis, moins d’1 séance par semaine') },
    { id: 'light', label: L('Light', 'Léger'), sub: L('1 to 3 workouts a week', '1 à 3 séances par semaine') },
    { id: 'moderate', label: L('Moderate', 'Modéré'), sub: L('3 to 5 workouts a week', '3 à 5 séances par semaine') },
    { id: 'high', label: L('High', 'Élevé'), sub: L('6 to 7 workouts a week', '6 à 7 séances par semaine') },
    { id: 'very', label: L('Very high', 'Très élevé'), sub: L('Intense sport every day or physical job', 'Sport intense tous les jours ou métier physique') }
  ];
  function goalOf(id) { return GOALS.filter(function (g) { return g.id === id; })[0]; }
  function activityOf(id) { return ACTIVITIES.filter(function (a) { return a.id === id; })[0]; }

  /* ---------- Données ---------- */
  function defaults() {
    return { schema: SCHEMA, name: '', sex: null, age: null, height: null, weight: null,
      activity: 'moderate', goal: null, meals: 3, custom: { kcal: null, protein: null }, weights: [] };
  }
  function load() {
    var d = S2.storage.load(NS, null);
    if (!d || typeof d !== 'object') d = defaults();
    var def = defaults();
    Object.keys(def).forEach(function (k) { if (d[k] === undefined) d[k] = def[k]; });
    d.custom = d.custom || { kcal: null, protein: null };
    d.weights = Array.isArray(d.weights) ? d.weights : [];
    /* v0.32 : 2e personne pour cuisiner à 2 (même forme que le profil, sans suivi du poids). null = personne. */
    d.partner = d.partner && typeof d.partner === 'object' ? d.partner : null;
    /* Futures migrations : if (d.schema < 2) { ... } */
    d.schema = SCHEMA;
    return d;
  }
  var data = null, root = null;
  function persist() { S2.storage.save(NS, data); }

  /* ---------- Affichage ---------- */
  function mount(container) {
    data = load();
    root = container;
    render();
  }

  function render() {
    root.innerHTML = '';
    var t = E.targets(data);
    if (!E.isComplete(data)) { renderWelcome(); return; }

    var g = goalOf(data.goal);
    /* Bloc principal : calories du jour et macros. */
    root.appendChild(h('div', { class: 'card ob-hero' },
      h('div', { class: 'ob-herohead' },
        h('span', { class: 'ob-who' }, (data.name ? data.name + ' · ' : '') + g.label),
        t.custom ? h('span', { class: 'badge' }, L('set by hand', 'fixé à la main')) : null),
      h('div', { class: 'ob-kcal' }, h('span', { class: 'ob-kcalnum' }, fmtInt(t.kcal)), h('span', { class: 'ob-kcalunit' }, L(' kcal / day', ' kcal / jour'))),
      h('div', { class: 'ob-macros' },
        macro(L('Protein', 'Protéines'), t.protein, t.protein * 4 / t.kcal, 'p'),
        macro(L('Carbs', 'Glucides'), t.carbs, t.carbs * 4 / t.kcal, 'c'),
        macro(L('Fat', 'Lipides'), t.fat, t.fat * 9 / t.kcal, 'f')),
      h('p', { class: 'hint ob-permeal' }, L('Per meal (' + t.meals + ' a day): ≈ ', 'Par repas (' + t.meals + ' par jour) : ≈ ') +
        fmtInt(t.perMeal.kcal) + ' kcal · ' + t.perMeal.protein + L(' g protein', ' g de protéines'))));

    root.appendChild(h('div', { class: 'bottom-actions ob-actions' },
      h('a', { class: 'btn btn-primary btn-block btn-lg', href: '#cuisine' }, L('🍳 Recipes for my goal ›', '🍳 Recettes pour mon objectif ›'))));

    /* Objectif : changement en un geste. */
    root.appendChild(h('h2', { class: 'section-title' }, L('My goal', 'Mon objectif')));
    root.appendChild(goalPicker(function (id) { data.goal = id; persist(); render(); }));

    /* Poids. */
    root.appendChild(h('h2', { class: 'section-title' }, L('Weight', 'Poids')));
    root.appendChild(weightCard());

    /* Profil. */
    root.appendChild(h('h2', { class: 'section-title' }, L('My profile', 'Mon profil')));
    var act = activityOf(data.activity);
    root.appendChild(h('div', { class: 'list' },
      row(L('Height', 'Taille'), data.height + ' cm'),
      row(L('Age', 'Âge'), data.age + L(' years', ' ans')),
      row(L('Formula', 'Formule'), data.sex === 'm' ? L('Man', 'Homme') : L('Woman', 'Femme')),
      row(L('Activity', 'Activité'), act.label + ' · ' + act.sub),
      row(L('Meals per day', 'Repas par jour'), String(t.meals))));
    root.appendChild(h('div', { class: 'stack' },
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editProfile(); } }, L('Edit my profile', 'Modifier mon profil')),
      h('button', { class: 'btn btn-ghost btn-block', onclick: editCustom }, t.custom ? L('Change the values set by hand', 'Changer les valeurs fixées à la main') : L('Set my targets by hand', 'Fixer mes objectifs à la main'))));

    /* Cuisiner à 2. */
    root.appendChild(h('h2', { class: 'section-title' }, L('Cooking for two', 'Cuisiner à 2')));
    root.appendChild(partnerCard());

    /* Explication du calcul. */
    root.appendChild(h('h2', { class: 'section-title' }, L('How it is calculated', 'Comment c’est calculé')));
    var adj = E.GOALS[data.goal].kcal;
    root.appendChild(h('div', { class: 'card' },
      h('div', { class: 'list ob-calc' },
        row(L('Base metabolism (Mifflin-St Jeor)', 'Métabolisme de base (Mifflin-St Jeor)'), fmtInt(t.bmr) + ' kcal'),
        row(L('Daily expenditure (× activity ', 'Dépense du jour (× activité ') + num(E.ACTIVITY[data.activity]) + ')', fmtInt(t.tdee) + ' kcal'),
        row(L('Goal adjustment', 'Ajustement objectif'), (adj > 0 ? '+' : adj < 0 ? '−' : '') + Math.abs(Math.round(adj * 100)) + ' %'),
        row(L('Protein', 'Protéines'), num(E.GOALS[data.goal].protein) + L(' g per kg', ' g par kg')),
        row(L('Fat', 'Lipides'), num(E.GOALS[data.goal].fat) + L(' g per kg (min. 20 % of calories)', ' g par kg (min. 20 % des calories)'))),
      t.custom ? h('p', { class: 'note' }, L('Calculated values: ', 'Valeurs calculées : ') + fmtInt(t.auto.kcal) + ' kcal · ' + t.auto.protein + L(' g protein. You use your own values.', ' g de protéines. Tu utilises tes propres valeurs.')) : null,
      h('p', { class: 'hint' }, L('Estimates to adjust over time: if your weight does not move as planned after 2 to 3 weeks, adjust by about 150 kcal.',
        'Ce sont des estimations à ajuster : si ton poids n’évolue pas comme prévu après 2 à 3 semaines, ajuste d’environ 150 kcal.'))));
  }

  function fmtInt(n) { return Math.round(n).toLocaleString(S2.locale); }
  function row(label, value) {
    return h('div', { class: 'list-row ob-row' }, h('span', { class: 'list-sub' }, label), h('span', { class: 'ob-val' }, value));
  }
  function macro(label, grams, share, k) {
    return h('div', { class: 'ob-macro ob-macro-' + k },
      h('span', { class: 'stat-label' }, label),
      h('span', { class: 'ob-macroval' }, grams + ' g'),
      h('span', { class: 'ob-bar', 'aria-hidden': 'true' }, h('span', { style: 'width:' + Math.round(share * 100) + '%' })),
      h('span', { class: 'ob-share' }, Math.round(share * 100) + ' %'));
  }

  function goalPicker(onPick, current) {
    current = current === undefined ? data.goal : current;
    return h('div', { class: 'ob-choices', role: 'radiogroup' }, GOALS.map(function (g) {
      var on = current === g.id;
      return h('button', { class: 'ob-choice' + (on ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false',
        onclick: function () { onPick(g.id); } },
        h('span', { class: 'ob-choicename' }, g.label), h('span', { class: 'ob-choicesub' }, g.sub));
    }));
  }

  function renderWelcome() {
    root.appendChild(h('div', { class: 'empty-state small ob-welcome' },
      h('div', { class: 'empty-icon', html: ICON, 'aria-hidden': 'true' }),
      h('h2', null, L('Your daily needs', 'Tes besoins du jour')),
      h('p', null, L('Enter your height, weight and goal: the app calculates your calories and protein, then suggests recipes that match.',
        'Entre ta taille, ton poids et ton objectif : l’app calcule tes calories et tes protéines, puis te propose les recettes qui collent.')),
      h('button', { class: 'btn btn-primary btn-lg', onclick: function () { editProfile(); } }, L('Fill in my profile', 'Remplir mon profil'))));
  }

  /* ---------- Poids ---------- */
  function weightCard() {
    var list = data.weights.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var first = list[0], last = list[list.length - 1];
    var diff = first && last && list.length > 1 ? last.kg - first.kg : null;
    return h('div', { class: 'card' },
      h('div', { class: 'ob-weighthead' },
        h('div', null,
          h('div', { class: 'ob-weightnum' }, num(data.weight, 1) + ' kg'),
          h('div', { class: 'list-sub' }, last ? L('Updated ', 'Mis à jour le ') + ui.date(last.date, true) : '')),
        diff !== null ? h('div', { class: 'ob-diff' }, (diff > 0 ? '+' : diff < 0 ? '−' : '') + num(Math.abs(diff), 1) + ' kg',
          h('div', { class: 'list-sub' }, L('since ', 'depuis le ') + ui.date(first.date))) : null),
      list.length > 1 ? h('ol', { class: 'ob-weights' }, list.slice(-5).reverse().map(function (w) {
        return h('li', null, h('span', null, ui.date(w.date, true)), h('span', null, num(w.kg, 1) + ' kg'));
      })) : null,
      h('div', { class: 'stack' }, h('button', { class: 'btn btn-secondary btn-block', onclick: addWeight }, L('Update my weight', 'Mettre à jour mon poids'))),
      h('p', { class: 'hint' }, L('Your targets follow your current weight.', 'Tes objectifs suivent ton poids actuel.')));
  }

  function addWeight() {
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var inp = h('input', { class: 'input', type: 'text', inputmode: 'decimal', value: num(data.weight, 1), 'aria-label': L('Weight in kg', 'Poids en kg') });
      function save() {
        var v = ui.parseNum(inp.value);
        if (v === null || v < 30 || v > 250) { err.textContent = L('Weight between 30 and 250 kg.', 'Poids entre 30 et 250 kg.'); err.hidden = false; return; }
        v = Math.round(v * 10) / 10;
        var today = new Date().toISOString().slice(0, 10);
        data.weights = data.weights.filter(function (w) { return w.date.slice(0, 10) !== today; });
        data.weights.push({ date: new Date().toISOString(), kg: v });
        data.weight = v;
        persist(); close(); render();
        ui.toast(L('Weight saved, targets updated', 'Poids enregistré, objectifs mis à jour'));
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      setTimeout(function () { inp.focus(); inp.select(); }, 250);
      return [
        h('h2', { class: 'sheet-title' }, L('My weight today', 'Mon poids aujourd’hui')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('Weight (kg)', 'Poids (kg)')), inp),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* ---------- 2e personne (cuisiner à 2) ---------- */
  function partnerName() { return data.partner && data.partner.name || L('The other person', 'L’autre personne'); }
  function partnerCard() {
    var p = data.partner, t2 = p && E.targets(p);
    if (!t2) {
      return h('div', { class: 'card' },
        h('p', { class: 'sheet-text' }, L('Shopping and cooking for two? Add the other person (height, weight, goal): the Planning in Kitchen then gives each of you the right serving, and the groceries cover both.',
          'Tu fais les courses et la cuisine à 2 ? Ajoute l’autre personne (taille, poids, objectif) : le Planning de la Cuisine donne alors à chacun la bonne portion, et les courses couvrent les deux.')),
        h('div', { class: 'stack' }, h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editProfile('partner'); } }, L('+ Add the other person', '+ Ajouter l’autre personne'))));
    }
    return h('div', { class: 'card ob-partner' },
      h('div', { class: 'ob-who' }, partnerName() + ' · ' + goalOf(p.goal).label),
      h('div', { class: 'ob-partnernum' }, fmtInt(t2.kcal) + L(' kcal / day · ', ' kcal / jour · ') + t2.protein + L(' g protein', ' g de protéines')),
      h('div', { class: 'list-sub' }, p.height + ' cm · ' + num(p.weight, 1) + ' kg · ' + p.age + L(' years · ', ' ans · ') + activityOf(p.activity).label),
      h('p', { class: 'hint' }, L('Used by the Planning when you choose “For two”. Their own phone keeps their own profile.', 'Utilisé par le Planning quand tu choisis « À 2 ». Son téléphone garde son propre profil.')),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editProfile('partner'); } }, L('Edit', 'Modifier')),
        h('button', { class: 'btn btn-ghost btn-block danger-text', onclick: function () {
          ui.confirm({ title: L('Remove ' + partnerName() + '?', 'Retirer ' + partnerName() + ' ?'), message: L('Plans will be for you only again. Plans already confirmed are not changed.', 'Les plannings seront de nouveau pour toi uniquement. Les plannings déjà validés ne changent pas.'),
            okLabel: L('Remove', 'Retirer'), danger: true }).then(function (ok) { if (!ok) return; data.partner = null; persist(); render(); });
        } }, L('Remove', 'Retirer'))));
  }

  /* ---------- Profil (feuille) : le sien, ou celui de la 2e personne ---------- */
  function editProfile(who) {
    var isPartner = who === 'partner';
    var d = JSON.parse(JSON.stringify(isPartner ? (data.partner || { name: '', sex: null, age: null, height: null, weight: null, activity: 'moderate', goal: null, meals: data.meals || 3 }) : data));
    if (!d.goal) d.goal = null;
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      function text(label, key, mode, ph) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: mode, value: d[key] === null || d[key] === undefined ? '' : (mode === 'decimal' ? num(d[key]) : String(d[key])),
          placeholder: ph || '', 'aria-label': label, autocomplete: 'off' });
        inp.addEventListener('input', function () { d[key] = ui.parseNum(inp.value); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      var nameInp = h('input', { class: 'input', type: 'text', value: d.name || '', autocapitalize: 'words', autocomplete: 'off',
        placeholder: L('Optional', 'Facultatif'), 'aria-label': L('First name', 'Prénom') });
      nameInp.addEventListener('input', function () { d.name = nameInp.value.trim(); });

      var sexSeg = h('div', { class: 'segmented' });
      function paintSex() {
        sexSeg.innerHTML = '';
        [['f', L('Woman', 'Femme')], ['m', L('Man', 'Homme')]].forEach(function (x) {
          sexSeg.appendChild(h('button', { class: 'seg' + (d.sex === x[0] ? ' is-active' : ''), type: 'button', 'aria-pressed': d.sex === x[0] ? 'true' : 'false',
            onclick: function () { d.sex = x[0]; paintSex(); } }, x[1]));
        });
      }
      paintSex();

      var actBox = h('div', { class: 'ob-choices' });
      function paintAct() {
        actBox.innerHTML = '';
        ACTIVITIES.forEach(function (a) {
          var on = d.activity === a.id;
          actBox.appendChild(h('button', { class: 'ob-choice' + (on ? ' is-on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
            onclick: function () { d.activity = a.id; paintAct(); } },
            h('span', { class: 'ob-choicename' }, a.label), h('span', { class: 'ob-choicesub' }, a.sub)));
        });
      }
      paintAct();

      var goalBox = h('div');
      function paintGoal() { goalBox.innerHTML = ''; goalBox.appendChild(goalPicker(function (id) { d.goal = id; paintGoal(); }, d.goal)); }
      paintGoal();

      var mealSeg = h('div', { class: 'segmented' });
      function paintMeals() {
        mealSeg.innerHTML = '';
        [2, 3, 4, 5].forEach(function (n) {
          mealSeg.appendChild(h('button', { class: 'seg' + (d.meals === n ? ' is-active' : ''), type: 'button', 'aria-pressed': d.meals === n ? 'true' : 'false',
            onclick: function () { d.meals = n; paintMeals(); } }, String(n)));
        });
      }
      paintMeals();

      function save() {
        var problem = null;
        if (d.sex !== 'm' && d.sex !== 'f') problem = L('Choose the formula (woman or man).', 'Choisis la formule (femme ou homme).');
        else if (d.age === null || d.age < 14 || d.age > 90) problem = L('Age between 14 and 90.', 'Âge entre 14 et 90 ans.');
        else if (d.height === null || d.height < 120 || d.height > 230) problem = L('Height in cm, between 120 and 230.', 'Taille en cm, entre 120 et 230.');
        else if (d.weight === null || d.weight < 30 || d.weight > 250) problem = L('Weight between 30 and 250 kg.', 'Poids entre 30 et 250 kg.');
        else if (!d.goal) problem = L('Choose a goal.', 'Choisis un objectif.');
        if (problem) { err.textContent = problem; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
        d.age = Math.round(d.age); d.height = Math.round(d.height); d.weight = Math.round(d.weight * 10) / 10;
        if (isPartner) {
          data.partner = { name: d.name || '', sex: d.sex, age: d.age, height: d.height, weight: d.weight, activity: d.activity, goal: d.goal, meals: d.meals || 3 };
          persist(); close(); render();
          ui.toast(L('Saved', 'Enregistré'));
          return;
        }
        if (d.weight !== data.weight) {
          var today = new Date().toISOString().slice(0, 10);
          d.weights = d.weights.filter(function (w) { return w.date.slice(0, 10) !== today; });
          d.weights.push({ date: new Date().toISOString(), kg: d.weight });
        }
        data = d; persist(); close(); render(); window.scrollTo(0, 0);
        ui.toast(L('Profile saved', 'Profil enregistré'));
      }

      return [
        h('h2', { class: 'sheet-title' }, isPartner ? L('The other person', 'L’autre personne') : L('My profile', 'Mon profil')),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('First name', 'Prénom')), nameInp),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Formula (base metabolism)', 'Formule (métabolisme de base)')), sexSeg),
        h('div', { class: 'form-grid' },
          text(L('Age', 'Âge'), 'age', 'numeric'), text(L('Height (cm)', 'Taille (cm)'), 'height', 'numeric'), text(L('Weight (kg)', 'Poids (kg)'), 'weight', 'decimal')),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Activity', 'Activité')), actBox),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Goal', 'Objectif')), goalBox),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Meals per day (snacks included)', 'Repas par jour (en-cas compris)')), mealSeg),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  /* Valeurs fixées à la main (ex. conseillées par un coach). Vides = calcul automatique. */
  function editCustom() {
    var t = E.targets(data);
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      function field(label, key, autoVal) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: 'numeric', value: data.custom[key] === null ? '' : String(data.custom[key]),
          placeholder: String(autoVal), 'aria-label': label });
        return { inp: inp, el: h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp) };
      }
      var k = field(L('Calories per day', 'Calories par jour'), 'kcal', t.auto.kcal), p = field(L('Protein per day (g)', 'Protéines par jour (g)'), 'protein', t.auto.protein);
      function save() {
        var kv = ui.parseNum(k.inp.value), pv = ui.parseNum(p.inp.value);
        if (kv !== null && (kv < 800 || kv > 6000)) { err.textContent = L('Calories between 800 and 6000.', 'Calories entre 800 et 6000.'); err.hidden = false; return; }
        if (pv !== null && (pv < 20 || pv > 400)) { err.textContent = L('Protein between 20 and 400 g.', 'Protéines entre 20 et 400 g.'); err.hidden = false; return; }
        data.custom = { kcal: kv === null ? null : Math.round(kv), protein: pv === null ? null : Math.round(pv) };
        persist(); close(); render();
      }
      return [
        h('h2', { class: 'sheet-title' }, L('Targets set by hand', 'Objectifs fixés à la main')),
        h('p', { class: 'sheet-text' }, L('Leave empty to use the calculation (shown in grey).', 'Laisse vide pour garder le calcul (affiché en gris).')),
        h('div', { class: 'form-grid ob-grid2' }, k.el, p.el),
        err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          t.custom ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { k.inp.value = ''; p.inp.value = ''; save(); } }, L('Back to the calculation', 'Revenir au calcul')) : null,
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  S2.app.registerTab({ id: 'objectif', label: L('Goal', 'Objectif'), icon: ICON, mount: mount, order: 20 });

  /* Lecture seule pour les autres onglets (Cuisine) : objectifs du jour, ou null si le profil n'est pas rempli. */
  S2.objectif = {
    targets: function () { return E.targets(load()); },
    goalLabel: function (id) { var g = goalOf(id); return g ? g.label : ''; },
    /* Cuisiner à 2 : objectifs et prénom de la 2e personne (null si aucune), prénom de la personne du téléphone. */
    partnerTargets: function () { var d = load(); return d.partner ? E.targets(d.partner) : null; },
    partnerName: function () { var d = load(); return d.partner && d.partner.name || L('Other person', 'L’autre'); },
    myName: function () { return load().name || L('You', 'Toi'); }
  };
})();
