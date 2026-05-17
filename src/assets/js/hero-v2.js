// Hero v2 — rotates phrase/ticker, hydrates live facts, drives cursor-haze + parallax
(function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var search = new URLSearchParams(window.location.search);
    var visualTestMode = search.get('visual-test') === '1';
    var phrases = hero.querySelectorAll('.hero-phrase');
    var facts = hero.querySelectorAll('.hero-ticker-fact');
    var tickerLabel = hero.querySelector('.hero-ticker-label');
    var haze = hero.querySelector('.hero-haze');
    var imgWrap = hero.querySelector('.hero-img-wrap');
    var reducedMotion = visualTestMode || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // -----------------------------------------------------------------
    // Booking bar — Where / Arrive / Depart / Guests / Search Homes
    // -----------------------------------------------------------------
    var booking = hero.querySelector('.hero-booking');
    if (!booking) return;

    function normalizeHomeArea(value) {
        var area = String(value || '').toLowerCase();
        if (area.indexOf('sarasota') !== -1) return 'sarasota';
        if (
            area.indexOf('bradenton') !== -1 ||
            area.indexOf('anna maria') !== -1 ||
            area === 'ami'
        ) {
            return 'bradenton';
        }
        return area;
    }

    function getHomes() {
        var source = document.getElementById('hero-property-source');
        if (!source) return [];
        try {
            var data = JSON.parse(source.textContent || '[]');
            if (!Array.isArray(data)) return [];
            return data.map(function (home) {
                return {
                    slug: home.slug || '',
                    area: normalizeHomeArea(home.area),
                    guests: Number(home.guests) || 0
                };
            }).filter(function (home) {
                return home.slug && home.area && home.guests > 0;
            });
        } catch (error) {
            return [];
        }
    }

    var homes = getHomes();
    var AREAS = [
        { value: 'all',       label: 'All Gulf Coast',  param: '' },
        { value: 'bradenton', label: 'Anna Maria area', param: 'anna-maria-island' },
        { value: 'sarasota',  label: 'Sarasota',        param: 'sarasota' }
    ];

    var state = { area: 'bradenton', arrive: '', depart: '', guests: 8 };

    var fields = booking.querySelectorAll('.hero-booking-field');
    var whereField  = fields[0];
    var arriveField = fields[1];
    var departField = fields[2];
    var guestsField = fields[3];
    var cta         = booking.querySelector('.hero-booking-cta');
    var hint        = booking.querySelector('.hero-booking-hint');
    var whereValue  = whereField.querySelector('.hero-booking-region');
    var arriveValue = arriveField.querySelector('.hero-booking-value');
    var departValue = departField.querySelector('.hero-booking-value');
    var guestsValue = guestsField.querySelector('.hero-booking-value');

    function homesMatching(area, guests) {
        return homes.filter(function (h) {
            if (area !== 'all' && h.area !== area) return false;
            if (guests && h.guests < guests) return false;
            return true;
        });
    }
    function fmtDate(iso) {
        if (!iso) return '';
        var d = new Date(iso + 'T00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    function todayISO() {
        var d = new Date();
        return d.toISOString().slice(0, 10);
    }
    function addDaysISO(iso, days) {
        var d = new Date(iso + 'T00:00');
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }

    function refresh() {
        var area = AREAS.filter(function (a) { return a.value === state.area; })[0] || AREAS[0];
        if (whereValue) whereValue.textContent = area.label;

        if (state.arrive) {
            arriveValue.classList.remove('hero-booking-value--empty');
            arriveValue.textContent = fmtDate(state.arrive);
        } else {
            arriveValue.classList.add('hero-booking-value--empty');
            arriveValue.textContent = 'Select dates';
        }
        if (state.depart) {
            departValue.classList.remove('hero-booking-value--empty');
            departValue.textContent = fmtDate(state.depart);
        } else {
            departValue.classList.add('hero-booking-value--empty');
            departValue.textContent = '—';
        }

        guestsValue.textContent = state.guests + (state.guests === 1 ? ' guest' : ' guests');

        var matches = homesMatching(state.area, state.guests);
        if (hint) {
            hint.textContent = matches.length + (matches.length === 1 ? ' home match' : ' homes match');
            hint.style.opacity = matches.length === 0 ? '0.55' : '1';
        }

        if (cta) {
            cta.disabled = matches.length === 0;
            cta.style.opacity = cta.disabled ? '0.6' : '1';
            cta.style.cursor = cta.disabled ? 'not-allowed' : 'pointer';
        }
    }

    var popover = null;
    function closePopover() {
        if (popover) {
            popover.remove();
            popover = null;
            document.removeEventListener('click', onDocClick, true);
            document.removeEventListener('keydown', onEsc, true);
        }
    }
    function onDocClick(e) {
        if (popover && !popover.contains(e.target) && !e.target.closest('.hero-booking-field')) {
            closePopover();
        }
    }
    function onEsc(e) { if (e.key === 'Escape') closePopover(); }

    function openPopover(anchor, contentEl) {
        closePopover();
        popover = document.createElement('div');
        popover.className = 'hero-booking-popover';
        popover.appendChild(contentEl);
        var rect = anchor.getBoundingClientRect();
        var gap = 12;
        var viewportPad = 16;
        popover.style.position = 'fixed';
        popover.style.zIndex = '50';
        document.body.appendChild(popover);
        var pRect = popover.getBoundingClientRect();
        var top = rect.bottom + gap;
        var left = rect.left;

        if (top + pRect.height > window.innerHeight - viewportPad) {
            top = rect.top - pRect.height - gap;
        }

        top = Math.max(viewportPad, Math.min(top, window.innerHeight - pRect.height - viewportPad));
        left = Math.max(viewportPad, Math.min(left, window.innerWidth - pRect.width - viewportPad));

        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
        setTimeout(function () {
            document.addEventListener('click', onDocClick, true);
            document.addEventListener('keydown', onEsc, true);
        }, 0);
    }

    whereField.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popover && popover.dataset.kind === 'where') { closePopover(); return; }
        var menu = document.createElement('div');
        menu.className = 'hero-booking-menu';
        AREAS.forEach(function (a) {
            var count = homesMatching(a.value, state.guests).length;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hero-booking-menu-item';
            if (a.value === state.area) btn.setAttribute('aria-current', 'true');
            btn.innerHTML =
                '<span class="hero-booking-menu-label">' + a.label + '</span>' +
                '<span class="hero-booking-menu-count">' + count + (count === 1 ? ' home' : ' homes') + '</span>';
            btn.addEventListener('click', function () {
                state.area = a.value;
                refresh();
                closePopover();
            });
            menu.appendChild(btn);
        });
        openPopover(whereField, menu);
        popover.dataset.kind = 'where';
    });

    function makeDateInput(name, value, min) {
        var wrap = document.createElement('div');
        wrap.className = 'hero-booking-datewrap';
        var label = document.createElement('label');
        label.textContent = name === 'arrive' ? 'Arrive date' : 'Depart date';
        label.className = 'hero-booking-datewrap-label';
        var input = document.createElement('input');
        input.type = 'date';
        input.className = 'hero-booking-dateinput';
        if (value) input.value = value;
        if (min) input.min = min;
        wrap.appendChild(label);
        wrap.appendChild(input);
        return { wrap: wrap, input: input };
    }

    arriveField.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popover && popover.dataset.kind === 'arrive') { closePopover(); return; }
        var di = makeDateInput('arrive', state.arrive, todayISO());
        di.input.addEventListener('change', function () {
            state.arrive = di.input.value;
            if (state.depart && state.depart <= state.arrive) state.depart = '';
            refresh();
            closePopover();
        });
        openPopover(arriveField, di.wrap);
        popover.dataset.kind = 'arrive';
        setTimeout(function () { try { di.input.showPicker && di.input.showPicker(); } catch (_) {} }, 0);
    });

    departField.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popover && popover.dataset.kind === 'depart') { closePopover(); return; }
        var min = state.arrive ? addDaysISO(state.arrive, 1) : addDaysISO(todayISO(), 1);
        var di = makeDateInput('depart', state.depart, min);
        di.input.addEventListener('change', function () {
            state.depart = di.input.value;
            refresh();
            closePopover();
        });
        openPopover(departField, di.wrap);
        popover.dataset.kind = 'depart';
        setTimeout(function () { try { di.input.showPicker && di.input.showPicker(); } catch (_) {} }, 0);
    });

    guestsField.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popover && popover.dataset.kind === 'guests') { closePopover(); return; }
        var stepper = document.createElement('div');
        stepper.className = 'hero-booking-stepper';
        var maxGuests = Math.max.apply(null, homes.map(function (h) { return h.guests; }));
        if (!Number.isFinite(maxGuests) || maxGuests < 1) maxGuests = state.guests;
        function render() {
            stepper.innerHTML =
                '<div class="hero-booking-stepper-row">' +
                  '<span class="hero-booking-stepper-label">Guests</span>' +
                  '<div class="hero-booking-stepper-controls">' +
                    '<button type="button" data-act="dec" aria-label="Decrease guests">−</button>' +
                    '<span class="hero-booking-stepper-count">' + state.guests + '</span>' +
                    '<button type="button" data-act="inc" aria-label="Increase guests">+</button>' +
                  '</div>' +
                '</div>' +
                '<p class="hero-booking-stepper-hint">Up to ' + maxGuests + ' guests across our homes</p>';
            stepper.querySelector('[data-act="dec"]').addEventListener('click', function () {
                state.guests = Math.max(1, state.guests - 1);
                render();
                refresh();
            });
            stepper.querySelector('[data-act="inc"]').addEventListener('click', function () {
                state.guests = Math.min(maxGuests, state.guests + 1);
                render();
                refresh();
            });
        }
        render();
        openPopover(guestsField, stepper);
        popover.dataset.kind = 'guests';
    });

    booking.addEventListener('submit', function (e) {
        e.preventDefault();
        if (cta && cta.disabled) return;
        var area = AREAS.filter(function (a) { return a.value === state.area; })[0] || AREAS[0];
        var url = '/properties/';
        var qs = [];
        if (area.param) qs.push('area=' + encodeURIComponent(area.param));
        if (state.arrive) qs.push('arrive=' + state.arrive);
        if (state.depart) qs.push('depart=' + state.depart);
        if (state.guests) qs.push('guests=' + state.guests);
        if (qs.length) url += '?' + qs.join('&');

        try {
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'hero_booking_search',
                    area: state.area,
                    arrive: state.arrive,
                    depart: state.depart,
                    guests: state.guests,
                    matches: homesMatching(state.area, state.guests).length
                });
            }
        } catch (_) {}

        window.location.href = url;
    });

    refresh();
})();
