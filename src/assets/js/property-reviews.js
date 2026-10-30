// Enhance the existing sourced reviews; without JavaScript they remain readable.
addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-review-carousel]');
  if (!section) return;
  const figures = [...section.querySelectorAll('figure')];
  if (figures.length < 2) return;
  const total = figures.length;
  const lead = Math.min(total - 1, Math.max(0, Number(section.dataset.reviewLead) || 0));
  const cards = [...figures.slice(lead), ...figures.slice(0, lead)];
  const number = value => String(value).padStart(2, '0');

  section.classList.add('review-swipe');
  section.setAttribute('aria-label', 'Guest reviews');
  section.setAttribute('aria-roledescription', 'carousel');
  section.querySelector('.g-label').textContent = 'Notes from the coast';
  const track = document.createElement('div');
  track.className = 'review-track';
  track.id = 'review-track';
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Guest reviews. Swipe or use left and right arrow keys.');
  section.querySelector('h2').after(track);
  cards.forEach((card, index) => {
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `Review ${index + 1} of ${total}`);
    track.append(card);
  });
  const controls = document.createElement('div');
  controls.className = 'review-controls';
  controls.innerHTML = `
    <button type="button" aria-label="Previous review" aria-controls="review-track"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
    <div class="review-position"><div class="review-progress" aria-hidden="true">${cards.map(() => '<span></span>').join('')}</div><span class="review-count" aria-live="polite" aria-atomic="true">01 / ${number(total)}</span></div>
    <button type="button" aria-label="Next review" aria-controls="review-track"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>`;
  track.after(controls);
  const [prev, next] = controls.querySelectorAll('button');
  const count = controls.querySelector('.review-count');
  const dots = [...controls.querySelectorAll('.review-progress span')];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let active = 0, target = 0, drag = null;
  const clamp = index => Math.max(0, Math.min(total - 1, index));
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  function update() {
    active = clamp(Math.round(track.scrollLeft / step()));
    prev.disabled = active === 0;
    next.disabled = active === total - 1;
    count.textContent = `${number(active + 1)} / ${number(total)}`;
    dots.forEach((dot, index) => dot.classList.toggle('active', index === active));
  }
  function go(index) {
    target = clamp(index);
    track.scrollTo({ left: target * step(), behavior: reduce.matches ? 'instant' : 'smooth' });
  }
  prev.addEventListener('click', () => go(target - 1));
  next.addEventListener('click', () => go(target + 1));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? total - 1 : target + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('scrollend', () => { target = active; });
  track.addEventListener('pointerdown', event => {
    target = active;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  function release() {
    if (!drag) return;
    drag = null;
    track.classList.remove('dragging');
    go(Math.round(track.scrollLeft / step()));
  }
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  new ResizeObserver(() => {
    track.scrollLeft = active * step();
    update();
    target = active;
  }).observe(track);
  update();
});
