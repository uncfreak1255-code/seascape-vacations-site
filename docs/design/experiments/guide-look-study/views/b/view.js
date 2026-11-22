/* View b: Photo cards. Moves the page's own elements; the only text it adds is
   named in strings.json (alt text and photo credits). */
(function () {
  var P = '/__study/photos/';
  var C = 'https://commons.wikimedia.org/wiki/';
  var BY40 = { name: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0' };
  var BY30 = { name: 'CC BY-SA 3.0', href: 'https://creativecommons.org/licenses/by-sa/3.0' };

  var PHOTOS = {
    open: { who: 'Gzzz, 2016', page: C + 'File:Anna_Maria_island.jpg', lic: BY40 },
    'pg-1': {
      file: 'bean-point-1200.jpg', w: 1200, h: 800, who: 'Gzzz, 2016',
      page: C + 'File:Anna_Maria_Bean_Point_Beach.jpg', lic: BY40,
      alt: 'People walking across white sand toward dune grass and the water at Bean Point Beach'
    },
    'pg-3': {
      file: 'coquina-1200.jpg', w: 1200, h: 800, who: 'Fred Hsu, 2017',
      page: C + 'File:2017_Sarasota_Coquina_Beach_Lifeguard_Station_FRD_9077.jpg', lic: BY30,
      alt: 'Wooden lifeguard station on the sand, with the water behind it, at Coquina Beach'
    },
    'pg-4': {
      file: 'holmes-beach-1200.jpg', w: 1200, h: 800, who: 'Ann Caron, 2011',
      page: C + 'File:Tranquil_Anna_Maria_Island.jpg', lic: BY30,
      alt: 'Sea oats on a dune, with beach umbrellas on the sand and the water behind, at Holmes Beach'
    },
    'pg-5': {
      file: 'bridge-street-pier-960.jpg', w: 960, h: 640, who: 'Wolfgang Moroder, 2017',
      page: C + 'File:Florida_pier_Bradenton_Beach.jpg', lic: BY30,
      alt: 'White clock tower beside two palm trees at the Bridge Street Pier, Bradenton Beach'
    }
  };

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }
  function link(href, text) {
    var a = el('a');
    a.href = href;
    a.textContent = text;
    return a;
  }
  function credit(p) {
    var cap = el('figcaption', 'pgb-credit');
    var span = el('span');
    span.append('Photo: ', link(p.page, p.who), ', ', link(p.lic.href, p.lic.name), '. Cropped and resized.');
    cap.append(span);
    return cap;
  }

  var open = document.querySelector('section.pg-open');
  var body = document.querySelector('div.pg-body');
  if (open && body) {
    /* Opening photo, edge to edge, first thing in the section. */
    var hero = el('figure', 'pgb-hero');
    var picture = el('picture');
    var source = el('source');
    source.media = '(min-width: 700px)';
    source.srcset = P + 'opening-dune-1800.jpg';
    var himg = el('img');
    himg.src = P + 'opening-dune-900.jpg';
    himg.width = 900;
    himg.height = 720;
    himg.alt = 'Sea oats growing on white sand dunes under a blue sky, north end of Anna Maria Island';
    picture.append(source, himg);
    hero.append(picture, credit(PHOTOS.open));
    open.prepend(hero);

    /* The five beaches become cards in a band of their own. */
    var band = el('div', 'pg-wrap pgb-band');
    open.after(band);
    ['pg-1', 'pg-2', 'pg-3', 'pg-4', 'pg-5'].forEach(function (id) {
      var card = document.getElementById(id);
      if (!card) return;
      card.classList.add('pgb-card');
      var text = el('div', 'pgb-text');
      var dock = el('div', 'pgb-dock');
      Array.prototype.slice.call(card.children).forEach(function (child) {
        var first = child.firstChild;
        var isFact = child.tagName === 'P' && first && first.nodeType === 1 && first.tagName === 'STRONG' && /:$/.test(first.textContent.trim());
        (isFact ? dock : text).append(child);
      });
      if (dock.children.length) text.append(dock);
      var photo = PHOTOS[id];
      if (photo) {
        var fig = el('figure', 'pgb-fig');
        var ph = el('div', 'pgb-ph');
        var img = el('img');
        img.src = P + photo.file;
        img.width = photo.w;
        img.height = photo.h;
        img.alt = photo.alt;
        img.loading = 'lazy';
        ph.append(img);
        fig.append(ph, credit(photo));
        card.append(fig);
      } else {
        card.classList.add('pgb-card-text');
      }
      card.append(text);
      band.append(card);
    });

    /* Motion pass: mark each photo frame, then release it the first time it is on screen. */
    if ('IntersectionObserver' in window) {
      var watch = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('pgb-in');
          watch.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('.pgb-hero picture, .pgb-ph'), function (frame) {
        frame.classList.add('pgb-settle');
        watch.observe(frame);
      });
    }
  }
  document.documentElement.dataset.studyReady = '1';
})();
