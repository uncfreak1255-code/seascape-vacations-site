(() => {
  const choices = document.querySelector('.fx-choices');
  if (!choices) return;
  const buttons = [...choices.querySelectorAll('[data-plan]')];
  const panels = [...document.querySelectorAll('[data-plan-panel]')];
  const select = button => {
    for (const control of buttons) control.setAttribute('aria-pressed', String(control === button));
    for (const panel of panels) panel.hidden = panel.dataset.planPanel !== button.dataset.plan;
  };
  for (const button of buttons) button.addEventListener('click', () => select(button));
  select(buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0]);
  choices.hidden = false;

  const dates = document.querySelector('.guide-stay-here .guide-stay-here__btn');
  const bar = document.querySelector('#sticky-book-bar');
  if (dates && bar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      bar.hidden = entry.isIntersecting && entry.intersectionRatio >= 0.75;
    }, {threshold:[0, 0.75, 1]}).observe(dates);
  }
})();
