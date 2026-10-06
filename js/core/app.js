/* Registre des onglets et navigation. Chaque onglet est isolé :
   une erreur dans un onglet n'empêche jamais les autres de fonctionner. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  var h = S2.ui.h;
  var tabs = [];
  var current = null;

  /* tab = { id, label, icon (svg), soon (bool), title?, mount(container, ctx) } */
  function registerTab(tab) {
    if (!tab || !tab.id) return;
    if (tabs.some(function (t) { return t.id === tab.id; })) {
      console.warn('Onglet déjà enregistré :', tab.id);
      return;
    }
    tab.order = tab.order === undefined ? tabs.length * 10 : tab.order;
    tabs.push(tab);
  }

  function find(id) { return tabs.filter(function (t) { return t.id === id; })[0]; }

  function defaultTab() {
    return tabs.filter(function (t) { return !t.soon; })[0] || tabs[0];
  }

  function renderTabbar() {
    var bar = document.getElementById('tabbar');
    bar.innerHTML = '';
    tabs.slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (t) {
      bar.appendChild(h('a', {
        class: 'tab' + (t.soon ? ' is-soon' : '') + (current && current.id === t.id ? ' is-active' : ''),
        href: '#' + t.id,
        'aria-current': current && current.id === t.id ? 'page' : null
      },
        h('span', { class: 'tab-icon', html: t.icon || '', 'aria-hidden': 'true' }),
        h('span', { class: 'tab-label' }, t.label),
        t.soon ? h('span', { class: 'tab-badge' }, 'soon') : null
      ));
    });
  }

  function setTitle(text) {
    document.getElementById('screen-title').textContent = text;
  }

  function show(id) {
    var tab = find(id) || defaultTab();
    current = tab;
    renderTabbar();
    setTitle(tab.title || tab.label);
    var view = document.getElementById('view');
    view.innerHTML = '';
    view.scrollTop = 0;
    window.scrollTo(0, 0);
    var container = h('div', { class: 'tab-view tab-' + tab.id });
    view.appendChild(container);
    try {
      if (tab.soon) renderSoon(container, tab);
      else tab.mount(container, { setTitle: setTitle });
    } catch (e) {
      console.error('Erreur dans l’onglet', tab.id, e);
      container.innerHTML = '';
      container.appendChild(h('div', { class: 'card card-error' },
        h('h2', null, 'Oops, this tab ran into a problem'),
        h('p', null, 'Other tabs and your data are not affected. Export a backup in Settings to be safe.'),
        h('pre', { class: 'error-detail' }, String(e && e.message || e))));
    }
  }

  function renderSoon(container, tab) {
    container.appendChild(h('div', { class: 'empty-state' },
      h('div', { class: 'empty-icon', html: tab.icon || '', 'aria-hidden': 'true' }),
      h('h2', null, tab.label),
      h('p', null, 'Coming soon.'),
      tab.teaser ? h('p', { class: 'muted' }, tab.teaser) : null));
  }

  function route() {
    show((location.hash || '').replace('#', ''));
  }

  function start() {
    window.addEventListener('hashchange', route);
    route();
  }

  S2.app = {
    registerTab: registerTab, start: start, show: show,
    refresh: function () { if (current) show(current.id); },
    tabs: function () { return tabs.slice(); }
  };
})();
