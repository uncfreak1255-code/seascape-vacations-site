(function () {
  'use strict';
  var root = document.querySelector('.g-gallery');
  if (!root) return;
  var slides = root.querySelectorAll('.g-gallery-photo');
  var count = document.querySelector('[data-gallery-count]');
  var total = slides.length;
  var mq = window.matchMedia && window.matchMedia('(max-width:700px)');
  function hydrate(img) {
    if (!img || img.getAttribute('src')) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.sizes) img.sizes = img.dataset.sizes;
    if (img.dataset.src) img.src = img.dataset.src;
  }
  function around(i) {
    [i - 1, i, i + 1].forEach(function (n) {
      if (slides[n]) hydrate(slides[n].querySelector('img'));
    });
  }
  function setCount(i) {
    if (count && total) count.textContent = i + ' / ' + total;
    around(i - 1);
  }
  function sync() {
    if (mq.matches) setCount(Math.round(root.scrollLeft / (root.clientWidth || 1)) + 1);
  }
  setCount(1);
  if (total && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCount([].indexOf.call(slides, entry.target) + 1);
      });
    }, { root: root, threshold: 0.6 });
    slides.forEach(function (slide) { io.observe(slide); });
  } else for (var i = 0; i < total; i++) around(i);
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);
  root.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    root.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * root.clientWidth, behavior: 'auto' });
  });
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('.g-gallery-photo img').forEach(function (img) {
    if (img.complete) return;
    img.classList.add('g-gallery-fade');
    img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
  });
})();
