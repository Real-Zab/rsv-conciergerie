(function () {
  'use strict';
  var root = document.documentElement;
  function $(s, el) { return (el || document).querySelector(s); }
  function $all(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

  /* Mode sombre */
  var themeBtn = $('[data-theme-toggle]');
  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', dark ? themeBtn.dataset.light : themeBtn.dataset.dark);
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      if (dark) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('rsv-theme', dark ? 'light' : 'dark'); } catch (e) {}
      syncTheme();
    });
    syncTheme();
  }

  /* Volet du hamburger */
  var burger = $('[data-burger]'), drawer = $('[data-drawer]'), veil = $('[data-veil]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open; veil.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) {
    burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
    veil.addEventListener('click', function () { setDrawer(false); });
  }

  /* Choix de la langue */
  var lang = $('[data-lang]');
  if (lang) {
    var langBtn = $('button', lang);
    langBtn.addEventListener('click', function () {
      var open = lang.classList.toggle('is-open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!lang.contains(e.target)) { lang.classList.remove('is-open'); langBtn.setAttribute('aria-expanded', 'false'); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setDrawer(false);
    if (lang) lang.classList.remove('is-open');
  });

  /* Résidences : une adresse à la fois */
  var picks = $all('[data-pick]');
  picks.forEach(function (b) {
    b.addEventListener('click', function () {
      picks.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      $all('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.pick; });
    });
  });

  /* Envoi des formulaires vers le serveur */
  function send(url, data) {
    return fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    });
  }
  function values(form) {
    var o = {};
    $all('input,textarea,select', form).forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') { if (el.checked) (o[el.name] = o[el.name] || []).push(el.value); }
      else o[el.name] = el.value.trim ? el.value.trim() : el.value;
    });
    return o;
  }
  function wire(form, onOk) {
    var msg = $('[data-msg]', form), btn = $('button[type="submit"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true; btn.disabled = true;
      var data = values(form);
      data.langue = root.lang;
      send(form.dataset.api, data).then(function (res) {
        btn.disabled = false;
        if (res.ok) return onOk(res.body, form);
        var key = 'e' + res.status;
        msg.textContent = form.dataset[key] || form.dataset.e0;
        msg.hidden = false;
      }).catch(function () {
        btn.disabled = false;
        msg.textContent = form.dataset.e0; msg.hidden = false;
      });
    });
  }

  /* Demande de réservation */
  var ask = $('[data-form="demande"]');
  if (ask) {
    var done = $('[data-done]');
    wire(ask, function () { ask.hidden = true; done.hidden = false; done.focus(); window.scrollTo(0, 0); });
    $('[data-again]').addEventListener('click', function () { done.hidden = true; ask.hidden = false; });
  }

  /* Espace membre */
  var member = $('[data-member]');
  if (member) {
    var guest = $('[data-guest]'), account = $('[data-account]');
    var show = function (m) {
      guest.hidden = !!m; account.hidden = !m;
      if (!m) return;
      $('[data-m-nom]').textContent = m.nom;
      $('[data-m-email]').textContent = m.email;
      $('[data-m-formule]').textContent = account.dataset['f' + m.formule] || m.formule;
      $('[data-m-statut]').textContent = account.dataset['s' + m.statut.replace('_', '')] || m.statut;
    };
    fetch('/api/moi', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : { membre: null }; })
      .then(function (j) { show(j.membre); })
      .catch(function () { show(null); });
    wire($('[data-form="connexion"]'), function (j) { show(j.membre); });
    wire($('[data-form="inscription"]'), function (j) { show(j.membre); });
    $('[data-logout]').addEventListener('click', function () {
      send('/api/deconnexion', {}).then(function () { show(null); });
    });
  }
})();
