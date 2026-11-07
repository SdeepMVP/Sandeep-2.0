/* Échange de listes de courses entre deux téléphones (SanEva est personnelle : chacun a son app).
   Module PUR (ni DOM ni stockage, testable sous Node) : rien ne passe par un serveur. La liste voyage dans un message
   (iMessage, WhatsApp, AirDrop…) : un texte lisible + une ligne « SANEVA1:… » que l'autre app sait relire.
   L'utilisateur colle le message et confirme avant que quoi que ce soit soit ajouté. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var TAG = 'SANEVA1:';
  var MAX_ITEMS = 300;

  function b64encode(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64decode(b64) { return decodeURIComponent(escape(atob(b64))); }
  function clean(s, max) { return String(s === undefined || s === null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').slice(0, max || 120); }
  function numOrNull(x) { return typeof x === 'number' && isFinite(x) && x >= 0 && x < 1e6 ? Math.round(x * 100) / 100 : null; }

  /* items = groupes de la liste de courses : { key, qty, first: { qty, unit, link, name }, aisle, text } */
  function pack(from, items, now) {
    return {
      v: 1, from: clean(from, 40) || '?', at: (now || new Date()).toISOString(),
      items: items.slice(0, MAX_ITEMS).map(function (g) {
        return { k: clean(g.key, 160), q: numOrNull(g.qty), fq: numOrNull(g.first.qty), u: clean(g.first.unit, 20), l: clean(g.first.link, 6),
          n: clean(g.first.name, 120), a: clean(g.aisle, 12) };
      })
    };
  }

  /* Message à envoyer : titre, liste lisible (pour qui n'a pas l'app), puis la ligne codée. */
  function message(payload, title, lines) {
    return title + '\n' + lines.map(function (l) { return '• ' + l; }).join('\n') + '\n\n' + TAG + b64encode(JSON.stringify(payload));
  }

  /* Relit un message collé. Renvoie le contenu vérifié, ou null si le message n'est pas une liste SanEva valide. */
  function read(text) {
    var m = String(text || '').match(/SANEVA1:([A-Za-z0-9+/=]+)/);
    if (!m) return null;
    var p;
    try { p = JSON.parse(b64decode(m[1])); } catch (e) { return null; }
    if (!p || p.v !== 1 || !Array.isArray(p.items) || !p.items.length) return null;
    var items = [];
    for (var i = 0; i < p.items.length && i < MAX_ITEMS; i++) {
      var it = p.items[i];
      if (!it || typeof it.k !== 'string' || typeof it.n !== 'string' || !it.k || !it.n) return null;
      items.push({ key: clean(it.k, 160), qty: numOrNull(it.q), first: { qty: numOrNull(it.fq), unit: clean(it.u, 20), link: clean(it.l, 6), name: clean(it.n, 120) }, aisle: clean(it.a, 12) });
    }
    var at = new Date(p.at);
    return { from: clean(p.from, 40) || '?', at: isNaN(at) ? null : at.toISOString(), items: items };
  }

  /* Ajoute des listes reçues à ses propres groupes (même clé = même ingrédient dans la même unité : quantités additionnées).
     groups : tableau de groupes (modifié) ; lists : [{ from, items }] ; me = nom affiché pour ses propres articles. */
  function merge(groups, lists, me) {
    var by = {};
    groups.forEach(function (g) { by[g.key] = g; g.people = [me]; });
    lists.forEach(function (s) {
      s.items.forEach(function (it) {
        var g = by[it.key];
        if (!g) {
          g = by[it.key] = { key: it.key, qty: it.qty, first: it.first, recipes: [], aisle: it.aisle, people: [] };
          groups.push(g);
        } else if (g.qty !== null && it.qty !== null) g.qty += it.qty;
        if (g.people.indexOf(s.from) < 0) g.people.push(s.from);
      });
    });
    return groups;
  }

  S2.cuisineShare = { TAG: TAG, pack: pack, message: message, read: read, merge: merge };
})();
