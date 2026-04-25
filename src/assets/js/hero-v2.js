// Hero v2 — rotates phrase, rotates ticker, drives cursor-haze + parallax
(function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var phrases = hero.querySelectorAll('.hero-phrase');
    var facts = hero.querySelectorAll('.hero-ticker-fact');
    var haze = hero.querySelector('.hero-haze');
    var imgWrap = hero.querySelector('.hero-img-wrap');

    // Rotate headline phrase every 5.5s
    if (phrases.length > 1) {
        var phraseIdx = 0;
        setInterval(function () {
            phrases[phraseIdx].classList.remove('is-active');
            phraseIdx = (phraseIdx + 1) % phrases.length;
            phrases[phraseIdx].classList.add('is-active');
        }, 5500);
    }

    // Rotate ticker fact every 4s
    if (facts.length > 1) {
        var factIdx = 0;
        setInterval(function () {
            facts[factIdx].classList.remove('is-active');
            factIdx = (factIdx + 1) % facts.length;
            facts[factIdx].classList.add('is-active');
        }, 4000);
    }

    // Cursor-follow gold haze
    if (haze && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            var mx = ((e.clientX - r.left) / r.width) * 100;
            var my = ((e.clientY - r.top) / r.height) * 100;
            haze.style.background =
                'radial-gradient(circle at ' + mx + '% ' + my + '%, rgba(255, 221, 160, 0.18) 0%, rgba(255, 221, 160, 0) 40%)';
        });
    }

    // Parallax on scroll (image only, multiplier -0.35)
    if (imgWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    imgWrap.style.transform = 'translate3d(0, ' + (window.scrollY * -0.35) + 'px, 0)';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
})();
