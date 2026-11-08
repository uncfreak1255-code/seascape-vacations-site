/* Phone booking flow on the homepage and /properties/: dates-and-guests sheet, sticky trip bar, photo-strip cues, homepage filter chips.
 * Every piece is progressive. Without this script, or on a wider screen, the plain trip form stays on the page. */
(function () {
  'use strict';
  var phone = window.matchMedia('(max-width:700px)');
  var root = document.documentElement;
  var dialog = document.querySelector('[data-trip-sheet]');
  var source = document.querySelector('[data-trip-sheet-source]');
  var body = dialog && dialog.querySelector('[data-trip-sheet-body]');
  var bar = document.querySelector('[data-trip-bar]');
  var pills = Array.prototype.slice.call(document.querySelectorAll('.ts-pill'));
  var canSheet = Boolean(dialog && source && body && typeof dialog.showModal === 'function');
  var marker = null;
  var pillSeen = true;
  var scrolled = false;

  function form() { return source && (source.tagName === 'FORM' ? source : source.querySelector('form')); }

  // The form moves into the sheet on phones and goes back to its place everywhere else.
  function place() {
    if (!canSheet) return;
    var on = phone.matches;
    if (on && !marker) {
      marker = document.createComment('trip-sheet');
      source.parentNode.insertBefore(marker, source);
      body.appendChild(source);
    } else if (!on && marker) {
      if (dialog.open) dialog.close();
      marker.parentNode.insertBefore(source, marker);
      marker.parentNode.removeChild(marker);
      marker = null;
    }
    pills.forEach(function (pill) { pill.hidden = !on; });
    root.classList.toggle('ts-sheet-on', on);
    root.classList.add('ts-ready');
    showBar();
  }

  function showBar() {
    if (!bar) return;
    var show = canSheet && phone.matches && scrolled && !pillSeen;
    bar.hidden = !show;
    root.classList.toggle('ts-bar-on', show);
  }

  function open() { if (canSheet && phone.matches && !dialog.open) dialog.showModal(); }

  if (canSheet) {
    document.querySelectorAll('[data-trip-sheet-open]').forEach(function (button) { button.addEventListener('click', open); });
    dialog.querySelector('[data-trip-sheet-close]').addEventListener('click', function () { dialog.close(); });
    // A click on the backdrop lands on the dialog element itself.
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    document.addEventListener('trip-applied', function () { if (dialog.open) dialog.close(); });
    window.addEventListener('pageshow', function (event) { if (event.persisted && dialog.open) dialog.close(); });
    // A link to the trip form or one of its fields (the catalog header button, a card asking for the group size) opens the sheet on phones.
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href^="#"]');
      var target = link && link.getAttribute('href').length > 1 && document.getElementById(link.getAttribute('href').slice(1));
      if (!target || !phone.matches || (target !== source && !source.contains(target))) return;
      event.preventDefault();
      open();
      if (target !== source) target.focus();
    });
    var action = bar && bar.querySelector('[data-trip-bar-action]');
    if (action) action.addEventListener('click', function () {
      var f = form();
      var dates = f ? f.querySelectorAll('input[type="date"]') : [];
      // Valid dates set: run the search. Otherwise (missing, past or invalid) open the sheet,
      // where the browser can show why; a closed sheet cannot show a validation message.
      if (f && f.checkValidity() && dates.length === 2 && dates[0].value && dates[1].value > dates[0].value) {
        if (f.requestSubmit) f.requestSubmit();
        else f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      } else open();
    });
    if (phone.addEventListener) phone.addEventListener('change', place); else phone.addListener(place);
    place();
  }

  // The bar appears once the pill has scrolled out of view.
  var anchor = pills[0];
  if (bar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { pillSeen = entries[0].isIntersecting; showBar(); }).observe(anchor);
    window.addEventListener('scroll', function () {
      var next = window.scrollY > 40;
      if (next !== scrolled) { scrolled = next; showBar(); }
    }, { passive: true });
  }

  // Count and dots follow each photo strip's scroll position.
  document.querySelectorAll('[data-ts-strip]').forEach(function (strip) {
    var wrap = strip.parentNode;
    var count = wrap.querySelector('[data-ts-count]');
    var dots = wrap.querySelectorAll('.ts-dots i');
    var total = dots.length;
    var ticking = false;
    if (!count || total < 2) return;
    strip.addEventListener('scroll', function () {
      if (ticking || !strip.clientWidth) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var index = Math.min(total - 1, Math.max(0, Math.round(strip.scrollLeft / strip.clientWidth)));
        count.setAttribute('data-n', index + 1);
        dots.forEach(function (dot, i) { dot.className = i === index ? 'on' : ''; });
      });
    }, { passive: true });
  });

  // Homepage filter chips: tokens come from each home's real amenity, area and city data.
  var chipRow = document.querySelector('[data-ts-chips]');
  var cards = document.querySelectorAll('[data-ts-card]');
  var status = document.querySelector('[data-ts-status]');
  if (chipRow && cards.length) {
    var chips = chipRow.querySelectorAll('[data-ts-filter]');
    chipRow.hidden = false;
    if (status) status.hidden = false;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-ts-filter');
        var shown = 0;
        chips.forEach(function (other) { other.setAttribute('aria-pressed', String(other === chip)); });
        cards.forEach(function (card) {
          var match = key === 'all' || card.getAttribute('data-filters').split('|').indexOf(key) !== -1;
          card.classList.toggle('ts-filtered', !match);
          if (match) shown += 1;
        });
        if (status) status.textContent = shown + (shown === 1 ? ' home' : ' homes');
      });
    });
  }
})();
