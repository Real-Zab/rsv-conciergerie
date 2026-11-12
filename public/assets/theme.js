// Applique le mode choisi avant l'affichage. Blanc par défaut : le mode sombre ne s'active que si le visiteur l'a demandé.
(function () {
  try {
    if (localStorage.getItem('rsv-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
