// View a, Map first. Moves existing elements; the only text it adds is listed in strings.json.
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function svg(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    for (var key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // The comparison table becomes a band between the opening and the guide.
  function moveChooser() {
    var body = document.querySelector('div.pg-body');
    var section = document.getElementById('pg-10');
    if (!body || !section) return;
    var num = section.querySelector('.pg-num');
    if (num) num.remove();
    var band = el('div', 'pg-wrap a-band');
    band.append(section);
    body.before(band);
    var link = document.querySelector('nav.pg-rail a[href="#pg-10"]');
    if (!link) return;
    var first = link.querySelector('span');
    if (first && /^\d+$/.test(first.textContent.trim())) first.remove();
    link.classList.add('a-rail-first');
    var item = link.closest('li');
    item.parentElement.prepend(item);
  }

  function islandSvg(data, cls) {
    var root = svg('svg', { viewBox: '0 0 ' + data.width + ' ' + data.height, 'aria-hidden': 'true', focusable: 'false', 'class': cls });
    root.appendChild(svg('path', { d: data.path }));
    return root;
  }

  function beachName(k) {
    var h2 = document.querySelector('#pg-' + k + ' h2');
    return h2 ? h2.textContent.split(':')[0].trim() : '';
  }

  function buildMap(data) {
    var grid = document.querySelector('.pg-open-grid');
    var intro = grid && grid.querySelector('.guide-intro');
    if (!grid || !intro) return;
    grid.firstElementChild.classList.add('a-title');

    var figure = el('figure', 'a-map');
    var plot = el('div', 'a-plot');
    var stage = el('div', 'a-stage');
    stage.setAttribute('aria-hidden', 'true');
    stage.appendChild(islandSvg(data, 'a-island'));

    var key = el('nav', 'a-key');
    key.setAttribute('aria-label', 'Beaches on the map');

    for (var k = 1; k <= 5; k++) {
      var m = data.markers[String(k)];
      var name = beachName(k);
      if (!m || !name || !document.getElementById('pg-' + k)) continue;
      var fx = m.x / data.width;
      var fy = m.y / data.height;

      var dot = el('span', 'a-dot');
      dot.dataset.k = k;
      dot.dataset.n = pad(k);
      dot.style.setProperty('--fx', fx);
      dot.style.setProperty('--fy', fy);
      stage.appendChild(dot);

      var link = el('a', 'a-link');
      link.href = '#pg-' + k;
      link.dataset.k = k;
      link.style.setProperty('--fx', fx);
      link.style.setProperty('--fy', fy);
      var text = el('span', 'a-txt');
      text.appendChild(el('span', 'a-n', pad(k)));
      text.appendChild(el('span', 'a-name', name));
      link.appendChild(text);
      key.appendChild(link);
    }

    var gulf = el('span', 'a-water a-gulf', 'Gulf of Mexico');
    var bay = el('span', 'a-water a-bay', 'Tampa Bay');
    var pass = el('span', 'a-water a-pass', 'Longboat Pass');
    stage.append(gulf, bay, pass);

    var scale = el('div', 'a-scale');
    var line = el('i', 'a-line');
    line.style.setProperty('--m', data.mile / data.width);
    scale.append(line, el('span', 'a-scale-label', '1 mile'));
    stage.appendChild(scale);

    var north = el('div', 'a-north');
    var arrow = svg('svg', { viewBox: '0 0 12 16', width: 12, height: 16, 'aria-hidden': 'true', focusable: 'false' });
    arrow.appendChild(svg('path', { d: 'M6 0L12 15L6 11.5L0 15Z' }));
    north.append(arrow, el('span', 'a-north-label', 'N'));
    stage.appendChild(north);

    plot.append(stage, key);

    var credit = el('figcaption', 'a-credit');
    credit.appendChild(document.createTextNode('Map data © '));
    var osm = el('a', '', 'OpenStreetMap contributors');
    osm.href = 'https://www.openstreetmap.org/copyright';
    credit.appendChild(osm);

    figure.append(plot, credit);
    intro.before(figure);

    // On each beach: the whole island with this beach marked, beside the beach's own fact lines.
    for (var j = 1; j <= 5; j++) {
      var section = document.getElementById('pg-' + j);
      var heading = section && section.querySelector(':scope > h2');
      if (!heading || !data.markers[String(j)]) continue;
      var facts = [];
      var paras = section.querySelectorAll(':scope > p');
      for (var p = 0; p < paras.length; p++) {
        var lead = paras[p].firstElementChild;
        if (lead && lead.tagName === 'STRONG' && /:\s*$/.test(lead.textContent) && paras[p].firstChild === lead) facts.push(paras[p]);
      }
      var panel = el('aside', 'a-panel');
      var loc = islandSvg(data, 'a-loc');
      for (var q = 1; q <= 5; q++) {
        var pt = data.markers[String(q)];
        if (!pt || q === j) continue;
        loc.appendChild(svg('circle', { 'class': 'a-loc-other', cx: pt.x, cy: pt.y, r: 34 }));
      }
      var own = data.markers[String(j)];
      loc.appendChild(svg('circle', { 'class': 'a-loc-own', cx: own.x, cy: own.y, r: 80 }));
      panel.appendChild(loc);
      var list = el('div', 'a-facts');
      for (var f = 0; f < facts.length; f++) list.appendChild(facts[f]);
      panel.appendChild(list);
      if (!facts.length) panel.classList.add('a-panel-bare');
      heading.after(panel);
    }
  }

  function done() { document.documentElement.dataset.studyReady = '1'; }
  // A failure leaves the page readable. It is thrown again out of band so verify.cjs reports a
  // half-built view as a script error and does not pass it.
  function report(error) { setTimeout(function () { throw error; }, 0); }

  try { moveChooser(); } catch (error) { report(error); }

  fetch('/__study/island-data.json')
    .then(function (res) { if (!res.ok) throw new Error('no map data'); return res.json(); })
    .then(buildMap)
    // A view built on this one (view d) finishes the page here, before the ready flag is set.
    .then(function () { if (window.studyAfterMap) window.studyAfterMap(); })
    .catch(report)
    .then(done, done);
})();
