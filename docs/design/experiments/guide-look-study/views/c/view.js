// View c, Fact strips. Moves existing elements only; the two toggles are the only new text.
(function () {
  var toggle = window.studyToggle; // ../toggle.js

  // Opening: the first paragraph stays as the lede, the second goes behind a toggle.
  var intro = document.querySelector('.pg-open .guide-intro');
  var second = intro && intro.querySelectorAll(':scope > p')[1];
  if (second) {
    var more = toggle('More about the island', 'sf-more sf-island');
    second.before(more);
    more.append(second);
  }

  // Beaches: number, h2, fact strip, then the toggle holding the remaining paragraphs.
  for (var i = 1; i <= 5; i++) {
    var section = document.getElementById('pg-' + i);
    if (!section) continue;
    var heading = section.querySelector(':scope > h2');
    var paras = Array.prototype.slice.call(section.querySelectorAll(':scope > p:not(.pg-num)'));
    var facts = paras.filter(function (p) {
      var first = p.firstElementChild;
      return first && first.tagName === 'STRONG' && p.firstChild === first;
    });
    var prose = paras.filter(function (p) { return facts.indexOf(p) < 0; });
    if (!heading) continue;

    var strip = document.createElement('div');
    strip.className = 'sf-strip sf-count-' + facts.length;
    heading.after(strip);
    facts.forEach(function (p, n) {
      p.classList.add('sf-fact');
      if (n === 0) p.classList.add('sf-lead');
      strip.append(p);
    });

    var details = toggle('More about this beach', 'sf-more');
    strip.after(details);
    prose.forEach(function (p) { details.append(p); });
  }

  document.documentElement.dataset.studyReady = '1';
})();
