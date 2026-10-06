/* Helpers d'interface partagés : création DOM, feuilles, confirmations, toasts, formats FR. */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});

  /* h('div', {class: 'x', onclick: fn}, 'texte', enfant, [enfants]) */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }

  function root() { return document.getElementById('overlay-root'); }

  /* Feuille du bas (bottom sheet). build(close) renvoie le contenu. */
  function sheet(build, opts) {
    opts = opts || {};
    var backdrop = h('div', { class: 'sheet-backdrop' });
    var panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' });
    var closed = false;
    function close(result) {
      if (closed) return;
      closed = true;
      backdrop.classList.remove('is-open');
      setTimeout(function () { backdrop.remove(); }, 200);
      if (opts.onClose) opts.onClose(result);
    }
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop && !opts.modal) close(undefined);
    });
    panel.appendChild(h('div', { class: 'sheet-grip', 'aria-hidden': 'true' }));
    append(panel, build(close));
    backdrop.appendChild(panel);
    root().appendChild(backdrop);
    requestAnimationFrame(function () { backdrop.classList.add('is-open'); });
    return close;
  }

  /* Confirmation : renvoie une Promise<boolean>. */
  function confirm(o) {
    return new Promise(function (resolve) {
      sheet(function (close) {
        return [
          h('h2', { class: 'sheet-title' }, o.title || 'Confirmer'),
          o.message ? h('p', { class: 'sheet-text' }, o.message) : null,
          h('div', { class: 'sheet-actions' },
            h('button', { class: 'btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + ' btn-block',
              onclick: function () { close(true); } }, o.okLabel || 'Confirmer'),
            h('button', { class: 'btn btn-ghost btn-block', onclick: function () { close(false); } },
              o.cancelLabel || 'Annuler'))
        ];
      }, { onClose: function (r) { resolve(r === true); } });
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { t = h('div', { id: 'toast', class: 'toast', role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2200);
  }

  /* Nombres et dates au format français. */
  function num(n, digits) {
    if (n === null || n === undefined || isNaN(n)) return '';
    var r = digits === undefined ? Math.round(n * 100) / 100 : Number(n.toFixed(digits));
    return String(r).replace('.', ',');
  }
  function parseNum(s) {
    if (s === null || s === undefined) return null;
    s = String(s).trim().replace(',', '.');
    if (s === '') return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  }
  function date(iso, withYear) {
    var d = new Date(iso);
    var o = { day: '2-digit', month: '2-digit' };
    if (withYear) o.year = '2-digit';
    return d.toLocaleDateString('fr-FR', o);
  }
  function longDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  S2.ui = {
    h: h, sheet: sheet, confirm: confirm, toast: toast,
    num: num, parseNum: parseNum, date: date, longDate: longDate, uid: uid
  };
})();
