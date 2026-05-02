// Hero v2 — rotates phrase/ticker, hydrates live facts, drives cursor-haze + parallax
(function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var phrases = hero.querySelectorAll('.hero-phrase');
    var facts = hero.querySelectorAll('.hero-ticker-fact');
    var tickerLabel = hero.querySelector('.hero-ticker-label');
    var haze = hero.querySelector('.hero-haze');
    var imgWrap = hero.querySelector('.hero-img-wrap');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setTickerLabel(fact) {
        if (!tickerLabel || !fact) return;
        tickerLabel.textContent = fact.getAttribute('data-source-label') || 'DATA';
    }

    // Rotate headline phrase every 5.5s
    if (!reducedMotion && phrases.length > 1) {
        var phraseIdx = 0;
        setInterval(function () {
            phrases[phraseIdx].classList.remove('is-active');
            phraseIdx = (phraseIdx + 1) % phrases.length;
            phrases[phraseIdx].classList.add('is-active');
        }, 5500);
    }

    // Rotate ticker fact every 4s
    if (facts.length) {
        setTickerLabel(facts[0]);
    }

    if (!reducedMotion && facts.length > 1) {
        var factIdx = 0;
        setInterval(function () {
            facts[factIdx].classList.remove('is-active');
            factIdx = (factIdx + 1) % facts.length;
            facts[factIdx].classList.add('is-active');
            setTickerLabel(facts[factIdx]);
        }, 4000);
    }

    function getLiveConfig() {
        var source = document.getElementById('hero-live-source');
        if (!source) return {};
        try {
            return JSON.parse(source.textContent || '{}');
        } catch (error) {
            return {};
        }
    }

    function updateFact(name, key, value, label) {
        var fact = hero.querySelector('[data-live-fact="' + name + '"]');
        if (!fact) return;
        var keyEl = fact.querySelector('.hero-ticker-k');
        var valueEl = fact.querySelector('.hero-ticker-v');
        if (keyEl && key) keyEl.textContent = key;
        if (valueEl && value) valueEl.textContent = value;
        if (label) fact.setAttribute('data-source-label', label);
        if (fact.classList.contains('is-active')) setTickerLabel(fact);
    }

    function formatTemperature(value) {
        var numeric = Number(value);
        if (!Number.isFinite(numeric)) return '';
        return Math.round(numeric) + '\u00B0F';
    }

    function weatherSummary(code) {
        var numeric = Number(code);
        if ([0].indexOf(numeric) !== -1) return 'clear';
        if ([1, 2].indexOf(numeric) !== -1) return 'mostly clear';
        if (numeric === 3) return 'cloudy';
        if ([45, 48].indexOf(numeric) !== -1) return 'fog';
        if ([51, 53, 55, 56, 57].indexOf(numeric) !== -1) return 'drizzle';
        if ([61, 63, 65, 66, 67, 80, 81, 82].indexOf(numeric) !== -1) return 'rain';
        if ([71, 73, 75, 77, 85, 86].indexOf(numeric) !== -1) return 'snow';
        if ([95, 96, 99].indexOf(numeric) !== -1) return 'storms';
        return 'local weather';
    }

    function formatLocalTime(value) {
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
        }).format(date);
    }

    function hydrateWeather(config) {
        if (!config.weatherUrl || typeof fetch !== 'function') {
            updateFact('weather', 'Anna Maria area', 'Local weather', 'SITE DATA');
            return;
        }

        fetch(config.weatherUrl, { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) throw new Error('weather unavailable');
                return response.json();
            })
            .then(function (data) {
                var current = data && data.current ? data.current : {};
                var temp = formatTemperature(current.temperature_2m);
                var summary = weatherSummary(current.weather_code);
                if (!temp) throw new Error('weather payload missing temperature');
                updateFact('weather', 'Anna Maria area', temp + ' \u00B7 ' + summary, 'LIVE');
            })
            .catch(function () {
                updateFact('weather', 'Anna Maria area', 'Local weather', 'SITE DATA');
            });
    }

    function hydrateSunset(config) {
        if (!config.sunsetUrl || typeof fetch !== 'function') {
            updateFact('sunset', 'Sunset tonight', 'Local forecast', 'SITE DATA');
            return;
        }

        fetch(config.sunsetUrl, { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) throw new Error('sunset unavailable');
                return response.json();
            })
            .then(function (data) {
                var sunset = data && data.daily && Array.isArray(data.daily.sunset)
                    ? data.daily.sunset[0]
                    : '';
                var localTime = formatLocalTime(sunset);
                if (!localTime) throw new Error('sunset payload missing time');
                updateFact('sunset', 'Sunset tonight', localTime, 'LIVE');
            })
            .catch(function () {
                updateFact('sunset', 'Sunset tonight', 'Local forecast', 'SITE DATA');
            });
    }

    var liveConfig = getLiveConfig();
    hydrateWeather(liveConfig);
    hydrateSunset(liveConfig);

    // Cursor-follow gold haze
    if (!reducedMotion && haze && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            var mx = ((e.clientX - r.left) / r.width) * 100;
            var my = ((e.clientY - r.top) / r.height) * 100;
            haze.style.background =
                'radial-gradient(circle at ' + mx + '% ' + my + '%, rgba(255, 221, 160, 0.18) 0%, rgba(255, 221, 160, 0) 40%)';
        });
    }

    // Parallax on scroll (image only, multiplier -0.35)
    if (!reducedMotion && imgWrap) {
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
