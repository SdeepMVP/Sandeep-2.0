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
    /* v0.33 : mensurations et poids de la 2e personne, réponses du questionnaire (level, place, sportGoal, perWeek, weekdays, job, targetWeight). */
    d.measures = Array.isArray(d.measures) ? d.measures : [];
    if (d.partner) {
      d.partner.weights = Array.isArray(d.partner.weights) ? d.partner.weights : [];
      d.partner.measures = Array.isArray(d.partner.measures) ? d.partner.measures : [];
      d.partner.custom = d.partner.custom || { kcal: null, protein: null };
    }
    /* Futures migrations : if (d.schema < 2) { ... } */
    d.schema = SCHEMA;
    return d;
  }
  var data = null, root = null;
  function persist() { S2.storage.save(NS, data); }
  function refresh() { if (root && root.isConnected && location.hash.replace('#', '') === 'objectif') render(); }
  function prof(who) { return who === 'partner' ? data.partner : data; }
  function whoName(who) { return who === 'partner' ? partnerName() : (data.name || L('You', 'Toi')); }

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
    root.appendChild(h('h2', { class: 'section-title' }, L('Measurements', 'Mensurations')));
    root.appendChild(measuresCard('me'));

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
      h('button', { class: 'btn btn-secondary btn-block', onclick: function () { startWizard('me'); } }, L('Redo the questionnaire (sport & nutrition)', 'Refaire le questionnaire (sport & nutrition)')),
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
      h('h2', null, L('Let’s get to know you', 'Faisons connaissance')),
      h('p', null, L('A few questions about you, your sport and your goals (2 minutes): the app then suggests your calories, your program and your training days. You confirm everything.',
        'Quelques questions sur toi, ton sport et tes objectifs (2 minutes) : l’app te propose ensuite tes calories, ton programme et tes jours d’entraînement. Tu valides tout.')),
      h('button', { class: 'btn btn-primary btn-lg', onclick: function () { startWizard('me'); } }, L('Start', 'Commencer'))));
  }

  /* ---------- Poids ---------- */
  function weightCard() {
    var list = data.weights.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var tw = data.targetWeight, gap = tw ? Math.round((data.weight - tw) * 10) / 10 : null;
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
      tw ? h('p', { class: 'note' }, L('Target weight: ', 'Poids visé : ') + num(tw, 1) + ' kg' + (gap ? ' (' + (gap > 0 ? '−' : '+') + num(Math.abs(gap), 1) + L(' kg to go)', ' kg à faire)') : L(' — reached!', ' — atteint !'))) : null,
      h('div', { class: 'stack' }, h('button', { class: 'btn btn-secondary btn-block', onclick: function () { addWeight('me'); } }, L('Update my weight', 'Mettre à jour mon poids'))),
      h('p', { class: 'hint' }, L('Your targets follow your current weight. The curve is in Today › Review.', 'Tes objectifs suivent ton poids actuel. La courbe est dans Aujourd’hui › Bilan.')));
  }

  /* ---------- Mensurations (cm) ---------- */
  var MEASURES = [['waist', L('Waist', 'Tour de taille')], ['hips', L('Hips', 'Hanches')], ['chest', L('Chest', 'Poitrine')], ['arm', L('Arm', 'Bras')], ['thigh', L('Thigh', 'Cuisse')]];
  function measuresCard(who) {
    var p = prof(who), list = (p.measures || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var last = list[list.length - 1], first = list[0];
    var card = h('div', { class: 'card' });
    if (!last) card.appendChild(h('p', { class: 'hint' }, L('Waist, hips, arms… measured once a month, they show progress the scale does not.', 'Tour de taille, hanches, bras… mesurés une fois par mois, ils montrent ce que la balance ne montre pas.')));
    else {
      card.appendChild(h('div', { class: 'list-sub' }, L('Last: ', 'Dernières : ') + ui.date(last.date, true)));
      card.appendChild(h('div', { class: 'list ob-calc' }, MEASURES.filter(function (m) { return last[m[0]]; }).map(function (m) {
        var d = first !== last && first[m[0]] ? last[m[0]] - first[m[0]] : null;
        return row(m[1], num(last[m[0]], 1) + ' cm' + (d ? ' (' + (d > 0 ? '+' : '−') + num(Math.abs(d), 1) + ')' : ''));
      })));
    }
    card.appendChild(h('div', { class: 'stack' }, h('button', { class: 'btn btn-secondary btn-block', onclick: function () { addMeasures(who); } }, L('Add measurements', 'Ajouter des mensurations'))));
    return card;
  }
  function addMeasures(who, onDone) {
    data = load();
    var p = prof(who);
    if (!p) return;
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true }), inputs = {};
      var fields = MEASURES.map(function (m) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: 'decimal', placeholder: 'cm', 'aria-label': m[1] + L(' in cm', ' en cm') });
        inputs[m[0]] = inp;
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, m[1]), inp);
      });
      function save() {
        var e = { date: new Date().toISOString() }, any = false, bad = false;
        MEASURES.forEach(function (m) {
          var v = ui.parseNum(inputs[m[0]].value);
          if (inputs[m[0]].value.trim() === '') return;
          if (v === null || v < 10 || v > 250) { bad = true; return; }
          e[m[0]] = Math.round(v * 10) / 10; any = true;
        });
        if (bad || !any) { err.textContent = L('Fill in at least one measurement, in cm.', 'Renseigne au moins une mesure, en cm.'); err.hidden = false; return; }
        var today = e.date.slice(0, 10);
        p.measures = (p.measures || []).filter(function (x) { return x.date.slice(0, 10) !== today; });
        p.measures.push(e);
        persist(); close(); refresh(); if (onDone) onDone();
        ui.toast(L('Measurements saved', 'Mensurations enregistrées'));
      }
      return [
        h('h2', { class: 'sheet-title' }, L('Measurements · ', 'Mensurations · ') + whoName(who)),
        h('p', { class: 'sheet-text' }, L('Measure in the morning, tape snug but not tight. Leave empty what you do not measure.', 'Mesure le matin, mètre ruban ajusté sans serrer. Laisse vide ce que tu ne mesures pas.')),
        h('div', { class: 'form-grid ob-grid2' }, fields), err,
        h('div', { class: 'sheet-actions' },
          h('button', { class: 'btn btn-primary btn-block', onclick: save }, L('Save', 'Enregistrer')),
          h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')))
      ];
    }, { modal: true });
  }

  function addWeight(who, onDone) {
    data = load();
    var p = prof(who);
    if (!p) return;
    ui.sheet(function (close) {
      var err = h('p', { class: 'form-error', hidden: true });
      var inp = h('input', { class: 'input', type: 'text', inputmode: 'decimal', value: num(p.weight, 1), 'aria-label': L('Weight in kg', 'Poids en kg') });
      function save() {
        var v = ui.parseNum(inp.value);
        if (v === null || v < 30 || v > 250) { err.textContent = L('Weight between 30 and 250 kg.', 'Poids entre 30 et 250 kg.'); err.hidden = false; return; }
        v = Math.round(v * 10) / 10;
        var today = new Date().toISOString().slice(0, 10);
        p.weights = (p.weights || []).filter(function (w) { return w.date.slice(0, 10) !== today; });
        p.weights.push({ date: new Date().toISOString(), kg: v });
        p.weight = v;
        persist(); close(); refresh(); if (onDone) onDone();
        ui.toast(L('Weight saved, targets updated', 'Poids enregistré, objectifs mis à jour'));
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      setTimeout(function () { inp.focus(); inp.select(); }, 250);
      return [
        h('h2', { class: 'sheet-title' }, who === 'partner' ? L('Weight today · ', 'Poids du jour · ') + whoName(who) : L('My weight today', 'Mon poids aujourd’hui')),
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
      h('p', { class: 'hint' }, L('Only used by Kitchen: servings and groceries for two in the Planning (“For two”). Their own tracking (meals, workouts, weight) stays on their phone, in their own SanEva.',
        'Sert seulement à la Cuisine : portions et courses à 2 dans le Planning (« À 2 »). Son suivi (repas, séances, poids) reste sur son téléphone, dans son propre SanEva.')),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-secondary btn-block', onclick: function () { editProfile('partner'); } }, L('Update (weight, goal…)', 'Mettre à jour (poids, objectif…)')),
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
          var prev = data.partner || {};
          data.partner = Object.assign({}, prev, { name: d.name || '', sex: d.sex, age: d.age, height: d.height, weight: d.weight, activity: d.activity, goal: d.goal, meals: d.meals || 3,
            weights: prev.weights || [], measures: prev.measures || [], custom: prev.custom || { kcal: null, protein: null } });
          if (d.weight !== prev.weight) {
            var td = new Date().toISOString().slice(0, 10);
            data.partner.weights = data.partner.weights.filter(function (w) { return w.date.slice(0, 10) !== td; });
            data.partner.weights.push({ date: new Date().toISOString(), kg: d.weight });
          }
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

  /* ---------- Questionnaire de démarrage : qui tu es, ton sport, tes objectifs → proposition (validée par toi) ---------- */
  var SPORT_GOALS = [
    { id: 'muscle', label: L('Build muscle', 'Prendre du muscle'), sub: L('Gain muscle and size.', 'Gagner en muscle et en volume.'), nutrition: 'bulk' },
    { id: 'strength', label: L('Get stronger', 'Gagner en force'), sub: L('Lift heavier on the big lifts.', 'Soulever plus lourd sur les grands mouvements.'), nutrition: 'maintain' },
    { id: 'fatloss', label: L('Lose fat, tone up', 'Perdre du gras, me tonifier'), sub: L('Get leaner while keeping your muscle.', 'Affiner la silhouette en gardant le muscle.'), nutrition: 'cut' },
    { id: 'glutes', label: L('Glutes & legs', 'Fessiers & jambes'), sub: L('Priority on the lower body.', 'Priorité au bas du corps.'), nutrition: 'recomp' },
    { id: 'endurance', label: L('Fitness & endurance', 'Forme & endurance'), sub: L('Feel fit, move better, more cardio.', 'Être en forme, mieux bouger, plus de cardio.'), nutrition: 'maintain' }
  ];
  var LEVELS = [['beginner', L('Just starting (under 1 year)', 'Je débute (moins d’1 an)')], ['intermediate', L('1 to 3 years of training', '1 à 3 ans d’entraînement')], ['advanced', L('Over 3 years', 'Plus de 3 ans')]];
  var PLACES = [['gym', L('At the gym', 'En salle')], ['home', L('At home, with dumbbells', 'À la maison, avec des haltères')]];
  var JOBS = [['sitting', L('Mostly sitting', 'Plutôt assis')], ['standing', L('On my feet, walking a lot', 'Debout, je marche beaucoup')], ['physical', L('Physical job', 'Travail physique')]];
  var DEFAULT_DAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };
  var ACT_ORDER = ['sedentary', 'light', 'moderate', 'high', 'very'];
  function activityFrom(perWeek, job) {
    var i = perWeek <= 2 ? 1 : perWeek <= 4 ? 2 : 3;
    if (job === 'physical') i++;
    if (job === 'sitting' && perWeek <= 2) i = 1;
    return ACT_ORDER[Math.min(4, i)];
  }
  function wdName(n) { var s = new Date(2026, 10, 1 + n).toLocaleDateString(S2.locale, { weekday: 'short' }).replace('.', ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  function startWizard(who, onDone) {
    data = load();
    var isPartner = who === 'partner', src = isPartner ? (data.partner || {}) : data;
    var firstTime = !E.isComplete(src);
    var w = {
      name: src.name || '', sex: src.sex || null, age: src.age || null, height: src.height || null, weight: src.weight || null,
      level: src.level || 'beginner', place: src.place || 'gym', perWeek: src.perWeek || 3, weekdays: (src.weekdays || DEFAULT_DAYS[src.perWeek || 3]).slice(),
      job: src.job || 'sitting', sportGoal: src.sportGoal || null, goal: src.goal || null, targetWeight: src.targetWeight || null, meals: src.meals || 3,
      applyProgram: firstTime || isPartner
    };
    var step = 0;
    ui.sheet(function (close) {
      var body = h('div', { class: 'ob-wiz' });
      var err = h('p', { class: 'form-error', hidden: true });
      var nav = h('div', { class: 'sheet-actions' });
      function choice(list, cur, onPick, cls) {
        return h('div', { class: 'ob-choices' + (cls ? ' ' + cls : '') }, list.map(function (x) {
          var id = x.id || x[0], on = cur === id;
          return h('button', { class: 'ob-choice' + (on ? ' is-on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: function () { onPick(id); paint(); } },
            h('span', { class: 'ob-choicename' }, x.label || x[1]), x.sub ? h('span', { class: 'ob-choicesub' }, x.sub) : null);
        }));
      }
      function seg(list, cur, onPick) {
        return h('div', { class: 'segmented' }, list.map(function (x) {
          return h('button', { class: 'seg' + (cur === x[0] ? ' is-active' : ''), type: 'button', 'aria-pressed': cur === x[0] ? 'true' : 'false', onclick: function () { onPick(x[0]); paint(); } }, x[1]);
        }));
      }
      function numField(label, key, mode, ph) {
        var inp = h('input', { class: 'input', type: 'text', inputmode: mode, value: w[key] === null || w[key] === undefined ? '' : (mode === 'decimal' ? num(w[key]) : String(w[key])), placeholder: ph || '', 'aria-label': label, autocomplete: 'off' });
        inp.addEventListener('input', function () { w[key] = ui.parseNum(inp.value); });
        return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), inp);
      }
      function draftProfile() {
        return { name: w.name, sex: w.sex, age: w.age, height: w.height, weight: w.weight, activity: activityFrom(w.perWeek, w.job), goal: w.goal, meals: w.meals,
          custom: { kcal: null, protein: null } };
      }
      function check() {
        if (step === 0) {
          if (w.sex !== 'm' && w.sex !== 'f') return L('Choose the formula (woman or man).', 'Choisis la formule (femme ou homme).');
          if (w.age === null || w.age < 14 || w.age > 90) return L('Age between 14 and 90.', 'Âge entre 14 et 90 ans.');
          if (w.height === null || w.height < 120 || w.height > 230) return L('Height in cm, between 120 and 230.', 'Taille en cm, entre 120 et 230.');
          if (w.weight === null || w.weight < 30 || w.weight > 250) return L('Weight between 30 and 250 kg.', 'Poids entre 30 et 250 kg.');
        }
        if (step === 1 && w.weekdays.length !== w.perWeek) return L('Pick ' + w.perWeek + ' training days.', 'Choisis ' + w.perWeek + ' jours d’entraînement.');
        if (step === 2) {
          if (!w.sportGoal) return L('Choose a sport goal.', 'Choisis un objectif sportif.');
          if (!w.goal) return L('Choose a nutrition goal.', 'Choisis un objectif nutrition.');
          if (w.targetWeight !== null && (w.targetWeight < 30 || w.targetWeight > 250)) return L('Target weight between 30 and 250 kg.', 'Poids visé entre 30 et 250 kg.');
        }
        return null;
      }
      function paint() {
        body.innerHTML = ''; err.hidden = true; nav.innerHTML = '';
        var titles = [L('Who are you?', 'Qui es-tu ?'), L('Your sport', 'Ton sport'), L('Your goals', 'Tes objectifs'), L('My suggestion', 'Ma proposition')];
        body.appendChild(h('div', { class: 'ob-wizstep' }, (step + 1) + ' / 4' + (isPartner ? ' · ' + (w.name || L('other person', 'l’autre personne')) : '')));
        body.appendChild(h('h2', { class: 'sheet-title' }, titles[step]));
        if (step === 0) {
          var nm = h('input', { class: 'input', type: 'text', value: w.name, autocapitalize: 'words', autocomplete: 'off', placeholder: L('First name', 'Prénom'), 'aria-label': L('First name', 'Prénom') });
          nm.addEventListener('input', function () { w.name = nm.value.trim(); });
          body.appendChild(h('label', { class: 'field' }, h('span', { class: 'field-label' }, L('First name', 'Prénom')), nm));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Formula (base metabolism)', 'Formule (métabolisme de base)')),
            seg([['f', L('Woman', 'Femme')], ['m', L('Man', 'Homme')]], w.sex, function (v) { w.sex = v; })));
          body.appendChild(h('div', { class: 'form-grid' }, numField(L('Age', 'Âge'), 'age', 'numeric'), numField(L('Height (cm)', 'Taille (cm)'), 'height', 'numeric'), numField(L('Weight (kg)', 'Poids (kg)'), 'weight', 'decimal')));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Outside sport, your day is…', 'En dehors du sport, ta journée est…')),
            choice(JOBS, w.job, function (v) { w.job = v; })));
        } else if (step === 1) {
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Your level', 'Ton niveau')), choice(LEVELS, w.level, function (v) { w.level = v; })));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Where you train', 'Où tu t’entraînes')), seg(PLACES, w.place, function (v) { w.place = v; })));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Workouts per week', 'Séances par semaine')),
            seg([[2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6']], w.perWeek, function (v) { w.perWeek = v; w.weekdays = DEFAULT_DAYS[v].slice(); })));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Which days? (' + w.weekdays.length + ' / ' + w.perWeek + ')', 'Quels jours ? (' + w.weekdays.length + ' / ' + w.perWeek + ')')),
            h('div', { class: 'ob-days' }, [1, 2, 3, 4, 5, 6, 0].map(function (d) {
              var on = w.weekdays.indexOf(d) > -1;
              return h('button', { class: 'ob-day' + (on ? ' is-on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: function () {
                if (on) w.weekdays = w.weekdays.filter(function (x) { return x !== d; }); else if (w.weekdays.length < w.perWeek) w.weekdays.push(d);
                paint();
              } }, wdName(d));
            }))));
        } else if (step === 2) {
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Sport goal', 'Objectif sportif')),
            choice(SPORT_GOALS, w.sportGoal, function (v) { w.sportGoal = v; var sg = SPORT_GOALS.filter(function (x) { return x.id === v; })[0]; if (sg) w.goal = sg.nutrition; })));
          body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Nutrition goal (suggested, you can change it)', 'Objectif nutrition (proposé, modifiable)')),
            goalPicker(function (id) { w.goal = id; paint(); }, w.goal)));
          body.appendChild(h('div', { class: 'form-grid ob-grid2' }, numField(L('Target weight (optional)', 'Poids visé (facultatif)'), 'targetWeight', 'decimal', 'kg'),
            h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Meals a day', 'Repas par jour')), seg([[2, '2'], [3, '3'], [4, '4'], [5, '5']], w.meals, function (v) { w.meals = v; }))));
        } else {
          var t = E.targets(draftProfile());
          body.appendChild(h('div', { class: 'card ob-hero' },
            h('div', { class: 'ob-who' }, L('Nutrition · ', 'Nutrition · ') + goalOf(w.goal).label),
            h('div', { class: 'ob-kcal' }, h('span', { class: 'ob-kcalnum' }, fmtInt(t.kcal)), h('span', { class: 'ob-kcalunit' }, L(' kcal / day', ' kcal / jour'))),
            h('div', { class: 'list-sub' }, L('Protein ', 'Protéines ') + t.protein + ' g · ' + L('carbs ', 'glucides ') + t.carbs + ' g · ' + L('fat ', 'lipides ') + t.fat + ' g'),
            h('div', { class: 'list-sub' }, L('Activity: ', 'Activité : ') + activityOf(activityFrom(w.perWeek, w.job)).label + ' · ' + w.meals + L(' meals', ' repas'))));
          var opts = { level: w.level, sportGoal: w.sportGoal, perWeek: w.perWeek, place: w.place, weekdays: w.weekdays };
          if (S2.muscu && S2.muscu.preview) {
            var pv = S2.muscu.preview(opts);
            var sorted = w.weekdays.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); });
            body.appendChild(h('div', { class: 'card' },
              h('div', { class: 'ob-who' }, L('Training · ', 'Entraînement · ') + pv.name),
              h('div', { class: 'list ob-calc' }, sorted.map(function (d, i) { var x = pv.days[i % pv.days.length]; return row(wdName(d), x.name + ' (' + x.exercises + ')'); })),
              h('p', { class: 'hint' }, L('Goal: ' + w.perWeek + ' workouts a week. You can change every exercise afterwards in Gym › Program.', 'Objectif : ' + w.perWeek + ' séances par semaine. Tu pourras changer chaque exercice ensuite dans Muscu › Programme.'))));
            body.appendChild(h('div', { class: 'field' }, h('span', { class: 'field-label' }, L('Gym program', 'Programme Muscu')),
              seg([[true, L('Use this program', 'Utiliser ce programme')], [false, L('Keep mine', 'Garder le mien')]], w.applyProgram, function (v) { w.applyProgram = v; })));
            if (w.applyProgram && !firstTime) body.appendChild(h('p', { class: 'hint' }, L('Your current days and exercises are replaced; your workout history is kept.', 'Tes jours et exercices actuels sont remplacés ; l’historique de tes séances est gardé.')));
          }
        }
        body.appendChild(err);
        if (step < 3) nav.appendChild(h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: function () {
          var problem = check();
          if (problem) { err.textContent = problem; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
          step++; paint(); body.parentNode.scrollTop = 0;
        } }, L('Next ›', 'Suivant ›')));
        else nav.appendChild(h('button', { class: 'btn btn-primary btn-block btn-lg', onclick: apply }, L('✓ Confirm', '✓ Valider')));
        nav.appendChild(step > 0 ? h('button', { class: 'btn btn-ghost btn-block', onclick: function () { step--; paint(); } }, L('‹ Back', '‹ Retour'))
          : h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(); } }, L('Cancel', 'Annuler')));
      }
      function apply() {
        data = load();
        var fields = { name: w.name, sex: w.sex, age: Math.round(w.age), height: Math.round(w.height), weight: Math.round(w.weight * 10) / 10,
          activity: activityFrom(w.perWeek, w.job), goal: w.goal, meals: w.meals, level: w.level, place: w.place, perWeek: w.perWeek,
          weekdays: w.weekdays.slice(), job: w.job, sportGoal: w.sportGoal, targetWeight: w.targetWeight ? Math.round(w.targetWeight * 10) / 10 : null };
        var p = isPartner ? (data.partner || { weights: [], measures: [], custom: { kcal: null, protein: null } }) : data;
        var oldW = p.weight;
        Object.keys(fields).forEach(function (k) { p[k] = fields[k]; });
        p.weights = p.weights || []; p.measures = p.measures || [];
        if (fields.weight !== oldW) {
          var td = new Date().toISOString().slice(0, 10);
          p.weights = p.weights.filter(function (x) { return x.date.slice(0, 10) !== td; });
          p.weights.push({ date: new Date().toISOString(), kg: fields.weight });
        }
        if (isPartner) data.partner = p;
        persist();
        var msg = L('Profile saved', 'Profil enregistré');
        if (w.applyProgram && S2.muscu && S2.muscu.apply) {
          var ok = S2.muscu.apply(who, { level: w.level, sportGoal: w.sportGoal, perWeek: w.perWeek, place: w.place, weekdays: w.weekdays });
          msg = ok ? L('Profile and program ready', 'Profil et programme prêts') : L('Profile saved (workout in progress: program not replaced)', 'Profil enregistré (séance en cours : programme non remplacé)');
        }
        close(); refresh(); if (onDone) onDone();
        ui.toast(msg);
      }
      paint();
      return [body, nav];
    }, { modal: true });
  }

  S2.app.registerTab({ id: 'objectif', label: L('Goal', 'Objectif'), icon: ICON, mount: mount, order: 20 });

  /* Lecture (et quelques écritures déclenchées par l'utilisateur) pour les autres onglets. who = 'me' (défaut) ou 'partner'. */
  function snapshot(who) {
    var d = load(), p = who === 'partner' ? d.partner : d;
    if (!p) return null;
    return { name: p.name || '', goal: p.goal, weight: p.weight, targetWeight: p.targetWeight || null, sportGoal: p.sportGoal || null,
      weights: (p.weights || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }),
      measures: (p.measures || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }),
      custom: p.custom || {}, complete: E.isComplete(p) };
  }
  S2.objectif = {
    targets: function (who) { var d = load(); return who === 'partner' ? (d.partner ? E.targets(d.partner) : null) : E.targets(d); },
    goalLabel: function (id) { var g = goalOf(id); return g ? g.label : ''; },
    partnerTargets: function () { var d = load(); return d.partner ? E.targets(d.partner) : null; },
    partnerName: function () { var d = load(); return d.partner && d.partner.name || L('Other person', 'L’autre'); },
    myName: function () { return load().name || L('You', 'Toi'); },
    /* La 2e personne ne sert qu'à la Cuisine (portions et courses à 2) : le suivi (Aujourd'hui, Muscu, poids) est personnel à chaque téléphone. */
    hasPartner: function () { var d = load(); return !!(d.partner && E.isComplete(d.partner)); },
    profile: function () { return snapshot('me'); },
    logWeight: function (who, onDone) { addWeight('me', onDone); },
    logMeasures: function (who, onDone) { addMeasures('me', onDone); },
    startWizard: function (who, onDone) { startWizard('me', onDone); },
    /* Ajustement proposé par le bilan et confirmé par l'utilisateur. */
    setCustomKcal: function (who, kcal) {
      data = load(); var p = prof('me'); if (!p) return;
      p.custom = p.custom || { kcal: null, protein: null }; p.custom.kcal = Math.round(kcal); persist(); refresh();
    }
  };
})();
