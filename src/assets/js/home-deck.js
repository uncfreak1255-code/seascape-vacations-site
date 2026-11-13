/* Approved After A: manual progressive enhancement of the real homepage cards. */
(function () {
  'use strict';
  var root = document.querySelector('[data-home-deck]');
  if (!root) return;
  var stage = root.querySelector('.g-postcards');
  var cards = Array.from(stage.children);
  var names = Array.from(root.querySelectorAll('[data-deck-go]'));
  var controls = root.querySelector('[data-deck-controls]');
  var all = root.querySelector('[data-deck-all]');
  var back = root.querySelector('[data-deck-back]');
  var position = root.querySelector('[data-deck-position]');
  var status = root.querySelector('[data-deck-status]');
  var phone = matchMedia('(max-width:700px)');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)');
  var active = cards[0], open = false, pending = false;
  function visible() { return cards.filter(function (c) { return !c.classList.contains('ts-filtered'); }); }
  function height() {
    stage.style.height = !open && active ? (phone.matches ? active.offsetHeight + 16 : Math.max(512, active.offsetHeight + 36)) + 'px' : '';
  }
  function draw(instant) {
    var list = visible();
    if (list.indexOf(active) < 0) active = list[0];
    var index = list.indexOf(active);
    root.classList.toggle('hd-instant', Boolean(instant || reduce.matches));
    cards.forEach(function (card, i) {
      var n = list.indexOf(card), d = (n - index + list.length) % list.length;
      if (d > list.length / 2) d -= list.length;
      var focused = card === active, distance = Math.abs(d);
      card.dataset.active = String(focused);
      card.style.setProperty('--hd-x', (d * Math.min(165, innerWidth * 0.12)) + 'px');
      card.style.setProperty('--hd-y', (distance * 18) + 'px');
      card.style.setProperty('--hd-angle', (d * 7) + 'deg');
      card.style.setProperty('--hd-scale', String(1 - distance * 0.12));
      card.style.zIndex = String(20 - distance);
      card.classList.toggle('hd-away', !open && !phone.matches && distance > 2);
      card.setAttribute('aria-hidden', String(n < 0 || (!open && !focused)));
      card.querySelectorAll('a').forEach(function (a) { a.tabIndex = n < 0 || (!open && !focused) ? -1 : 0; });
      names[i].hidden = n < 0;
      names[i].setAttribute('aria-pressed', String(focused));
    });
    position.textContent = (index + 1) + ' / ' + list.length;
    controls.querySelectorAll('[data-deck-step]').forEach(function (b) { b.disabled = list.length < 2; });
    status.textContent = active ? active.querySelector('h3').textContent + ', ' + (index + 1) + ' of ' + list.length : 'No homes';
    height();
  }
  function align() { if (phone.matches && !open && active) stage.scrollTo({ left: active.offsetLeft, behavior: 'instant' }); }
  function go(index, instant) {
    var list = visible();
    if (!list.length) return;
    var moveFocus = active && active.contains(document.activeElement);
    active = list[(index + list.length) % list.length];
    draw(instant); align();
    if (moveFocus) active.querySelector('[data-deck-explore]').focus({ preventScroll: true });
  }
  root.querySelectorAll('[data-deck-step]').forEach(function (b) {
    b.addEventListener('click', function (e) { go(visible().indexOf(active) + Number(b.dataset.deckStep), e.detail === 0); });
  });
  names.forEach(function (b, i) { b.addEventListener('click', function (e) { go(visible().indexOf(cards[i]), e.detail === 0); }); });
  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (!open && card !== active) { e.preventDefault(); go(visible().indexOf(card), e.detail === 0); }
    }, true);
  });
  function mode(value) {
    open = value; root.classList.toggle('hd-open', open);
    all.setAttribute('aria-expanded', String(open));
    back.hidden = !open; controls.hidden = open;
    root.querySelector('[data-deck-names]').hidden = open;
    if (!open) cards.forEach(function (c) { c.querySelector('[data-ts-strip]').scrollLeft = 0; });
    draw(true); align();
    (open ? back : all).focus({ preventScroll: true });
  }
  all.addEventListener('click', function () { mode(true); });
  back.addEventListener('click', function () { mode(false); });
  root.addEventListener('keydown', function (e) {
    if (open || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    var list = visible();
    go(e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : list.indexOf(active) + (e.key === 'ArrowRight' ? 1 : -1), true);
  });
  stage.addEventListener('scroll', function () {
    if (!phone.matches || open || pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      var nearest = visible().reduce(function (best, card) { return !best || Math.abs(card.offsetLeft - stage.scrollLeft) < Math.abs(best.offsetLeft - stage.scrollLeft) ? card : best; }, null);
      if (nearest && nearest !== active) { active = nearest; draw(true); }
    });
  }, { passive: true });
  // Existing trip-sheet handlers own filtering; observe only their class changes.
  new MutationObserver(function (records) {
    if (records.some(function (r) { return r.target.hasAttribute('data-ts-card') && (r.oldValue || '').split(' ').includes('ts-filtered') !== r.target.classList.contains('ts-filtered'); })) { draw(true); align(); }
  }).observe(stage, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  if ('ResizeObserver' in window) { var observer = new ResizeObserver(height); cards.forEach(function (c) { observer.observe(c); }); }
  window.addEventListener('resize', function () { draw(true); align(); });
  reduce.addEventListener('change', function () { draw(true); });
  root.classList.add('hd-ready'); controls.hidden = false;
  root.querySelector('[data-deck-names]').hidden = false;
  draw(true);
})();
