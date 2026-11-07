/* Booking-first prototype 4 (noindex): sheet, photo-strip cue, filter chips, sticky bar. No dependencies. */
(function () {
  var dialog = document.querySelector('[data-bk4-dialog]');
  var bar = document.querySelector('[data-bk4-bar]');
  var pill = document.querySelector('.bk4-pill');

  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-bk4-open]').forEach(function (button) {
      button.addEventListener('click', function () { dialog.showModal(); });
    });
    dialog.querySelector('[data-bk4-close]').addEventListener('click', function () { dialog.close(); });
    // A click on the backdrop lands on the dialog element itself.
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  }

  // The sticky bar appears once the search pill has scrolled out of view.
  if (bar && pill && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { bar.hidden = entries[0].isIntersecting; }).observe(pill);
  }

  // Count and dots follow the photo strip's scroll position.
  document.querySelectorAll('[data-bk4-strip]').forEach(function (strip) {
    var wrap = strip.parentNode;
    var count = wrap.querySelector('[data-bk4-count]');
    var dots = wrap.querySelectorAll('.bk4-dots span');
    var total = strip.children.length;
    var ticking = false;
    strip.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var index = Math.min(total - 1, Math.max(0, Math.round(strip.scrollLeft / strip.clientWidth)));
        count.textContent = (index + 1) + ' / ' + total;
        dots.forEach(function (dot, i) { dot.className = i === index ? 'on' : ''; });
      });
    }, { passive: true });
  });

  // Filter chips: tokens come from each home's real amenity, area and city data.
  var chips = document.querySelectorAll('[data-bk4-filter]');
  var cards = document.querySelectorAll('[data-bk4-card]');
  var status = document.querySelector('[data-bk4-status]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key = chip.dataset.bk4Filter;
      chips.forEach(function (other) { other.setAttribute('aria-pressed', String(other === chip)); });
      var shown = 0;
      cards.forEach(function (card) {
        var match = key === 'all' || card.dataset.filters.split('|').indexOf(key) !== -1;
        card.hidden = !match;
        if (match) shown += 1;
      });
      status.textContent = shown + (shown === 1 ? ' home' : ' homes');
    });
  });
})();
