/* Loads group-fit.js only when a guest reaches for the planner (or a party is
 * already remembered this session), so the planner costs nothing on page load. */
(function () {
  'use strict';
  var roots = document.querySelectorAll('[data-group-fit]');
  if (!roots.length) return;
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    ['/assets/js/group-fit-party.js', '/assets/js/group-fit.js'].forEach(function (src) { var s = document.createElement('script'); s.src = src; s.async = false; document.head.appendChild(s); });
  }
  Array.prototype.forEach.call(roots, function (root) {
    root.hidden = false;
    root.addEventListener('focusin', load, { once: true });
    root.addEventListener('pointerdown', load, { once: true });
    var form = root.querySelector('form');
    if (form) form.addEventListener('submit', function (e) { if (!window.SeascapeGroupFit) { e.preventDefault(); load(); var tries = 0; var t = setInterval(function () { tries += 1; if (window.SeascapeGroupFit) { clearInterval(t); form.dispatchEvent(new Event('submit', { cancelable: true })); } else if (tries > 40) clearInterval(t); }, 50); } });
  });
  try { if (window.sessionStorage.getItem('seascape_party')) load(); } catch (e) { /* storage blocked */ }
})();
