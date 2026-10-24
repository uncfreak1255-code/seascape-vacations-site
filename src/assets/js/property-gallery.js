(function () {
  'use strict';
  var root = document.querySelector('.g-gallery');
  if (!root) return;
  var slides = root.querySelectorAll('.g-gallery-photo');
  var count = document.querySelector('[data-gallery-count]');
  var total = slides.length;
  function hydrate(image) {
    if (!image || (image.getAttribute && image.getAttribute('src'))) return;
    if (image.dataset.srcset) image.srcset = image.dataset.srcset;
    if (image.dataset.sizes) image.sizes = image.dataset.sizes;
    if (image.dataset.src) image.src = image.dataset.src;
  }
  function hydrateAround(index) {
    [index - 1, index, index + 1].forEach(function (i) {
      if (slides[i]) hydrate(slides[i].querySelector('img'));
    });
  }
  function setCount(index) {
    if (count && total) count.textContent = index + ' / ' + total;
    hydrateAround(index - 1);
  }
  setCount(1);
  if (total && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setCount(Array.prototype.indexOf.call(slides, entry.target) + 1);
      });
    }, { root: root, threshold: 0.6 });
    slides.forEach(function (slide) { io.observe(slide); });
  }
  root.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    root.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * root.clientWidth, behavior: 'auto' });
  });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  root.querySelectorAll('.g-gallery-photo img').forEach(function (image) {
    if (image.complete) return;
    function show() { image.classList.add('is-loaded'); }
    image.classList.add('g-gallery-fade');
    image.addEventListener('load', show, { once: true });
  });
})();
