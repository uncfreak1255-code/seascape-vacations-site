// Study tooling, not part of any design: a floating bar and the arrow keys flip between views.
(function () {
  var views = [
    ['control', 'Today’s page'],
    ['a', 'A · Map first'],
    ['b', 'B · Photo cards'],
    ['c', 'C · Fact strips'],
    ['d', 'D · Map with toggle'],
  ];
  var current = document.body.getAttribute('data-study-view') || 'control';
  var index = Math.max(0, views.findIndex(function (view) { return view[0] === current; }));

  function go(step) {
    var next = views[(index + step + views.length) % views.length][0];
    var url = new URL(window.location.href);
    url.searchParams.set('view', next);
    url.hash = '';
    window.location.assign(url.toString());
  }

  function button(label, glyph, step) {
    var el = document.createElement('button');
    el.type = 'button';
    el.setAttribute('aria-label', label);
    el.textContent = glyph;
    el.addEventListener('click', function () { go(step); });
    return el;
  }

  var bar = document.createElement('div');
  bar.className = 'study-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Study view switcher');
  var label = document.createElement('span');
  label.className = 'study-bar-label';
  label.textContent = views[index][1];
  var count = document.createElement('span');
  count.className = 'study-bar-count';
  count.textContent = (index + 1) + ' of ' + views.length + ' · arrow keys';
  label.appendChild(count);
  bar.appendChild(button('Previous view', '←', -1));
  bar.appendChild(label);
  bar.appendChild(button('Next view', '→', 1));
  document.body.appendChild(bar);

  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    var target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  });
})();
