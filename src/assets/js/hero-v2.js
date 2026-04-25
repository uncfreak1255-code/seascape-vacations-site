(function () {
    var hero = document.querySelector('[data-hero-v2]');
    var form = document.querySelector('[data-hero-booking]');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
    var WEATHER_LOCATIONS = [
        { label: 'Anna Maria Island', latitude: 27.5311, longitude: -82.7334 },
        { label: 'Bradenton', latitude: 27.4989, longitude: -82.5748 },
        { label: 'Sarasota', latitude: 27.3364, longitude: -82.5307 }
    ];
    var WEATHER_CODE_LABELS = {
        0: { day: 'Sunny', night: 'Clear' },
        1: { day: 'Mostly sunny', night: 'Mostly clear' },
        2: 'Partly cloudy',
        3: 'Cloudy',
        45: 'Fog',
        48: 'Fog',
        51: 'Light drizzle',
        53: 'Drizzle',
        55: 'Heavy drizzle',
        56: 'Freezing drizzle',
        57: 'Freezing drizzle',
        61: 'Light rain',
        63: 'Rain',
        65: 'Heavy rain',
        66: 'Freezing rain',
        67: 'Freezing rain',
        71: 'Light snow',
        73: 'Snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Rain showers',
        81: 'Rain showers',
        82: 'Heavy showers',
        85: 'Snow showers',
        86: 'Snow showers',
        95: 'Thunderstorms',
        96: 'Thunderstorms',
        99: 'Thunderstorms'
    };

    function rotateActive(selector, intervalMs) {
        if (reducedMotion) return;

        var index = 0;
        window.setInterval(function () {
            var items = Array.from(document.querySelectorAll(selector));
            if (!items.length) return;

            index = Math.min(index, items.length - 1);
            items[index].classList.remove('is-active');
            index = (index + 1) % items.length;
            items[index].classList.add('is-active');
        }, intervalMs);
    }

    rotateActive('.hero-v2-phrase', 5200);
    rotateActive('[data-hero-ticker] .hero-v2-ticker-fact', 4200);

    function getWeatherCondition(code, isDay) {
        var label = WEATHER_CODE_LABELS[code];
        if (!label) return 'Current';
        if (typeof label === 'string') return label;
        return isDay ? label.day : label.night;
    }

    function buildWeatherUrl(location) {
        var url = new URL(WEATHER_ENDPOINT);
        url.searchParams.set('latitude', location.latitude);
        url.searchParams.set('longitude', location.longitude);
        url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
        url.searchParams.set('temperature_unit', 'fahrenheit');
        url.searchParams.set('timezone', 'auto');
        url.searchParams.set('forecast_days', '1');
        return url;
    }

    function createTickerFact(label, value) {
        var fact = document.createElement('div');
        var labelNode = document.createElement('span');
        var valueNode = document.createElement('strong');

        fact.className = 'hero-v2-ticker-fact';
        fact.setAttribute('data-hero-ticker-weather', '');
        labelNode.textContent = label;
        valueNode.textContent = value;
        fact.append(labelNode, valueNode);
        return fact;
    }

    function readWeatherPayload(location, payload) {
        var current = payload && payload.current;
        var temperature = current && Number(current.temperature_2m);
        var code = current && Number(current.weather_code);

        if (!Number.isFinite(temperature) || !Number.isFinite(code)) return null;

        return {
            label: location.label,
            value: Math.round(temperature) + '\u00b0F' + ' \u2022 ' + getWeatherCondition(code, Number(current.is_day) === 1)
        };
    }

    function fetchLocationWeather(location) {
        if (!window.fetch || !window.URL) return Promise.resolve(null);

        return window.fetch(buildWeatherUrl(location).toString(), { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) return null;
                return response.json();
            })
            .then(function (payload) {
                return readWeatherPayload(location, payload);
            })
            .catch(function () {
                return null;
            });
    }

    function setTickerBadge(label) {
        var badge = document.querySelector('[data-hero-ticker-badge]');
        var badgeLabel = badge && badge.querySelector('[data-hero-ticker-badge-label]');
        if (!badge || !badgeLabel) return;

        badgeLabel.textContent = label;
        badge.toggleAttribute('data-hero-ticker-live', label === 'Live');
    }

    function hydrateLiveTicker() {
        var ticker = document.querySelector('[data-hero-ticker]');
        if (!ticker) return;

        Promise.all(WEATHER_LOCATIONS.map(fetchLocationWeather)).then(function (weatherFacts) {
            var liveFacts = weatherFacts.filter(Boolean);
            if (!liveFacts.length) return;

            var staticFacts = Array.from(ticker.querySelectorAll('[data-hero-ticker-static]'));
            var fragment = document.createDocumentFragment();

            liveFacts.forEach(function (fact) {
                fragment.appendChild(createTickerFact(fact.label, fact.value));
            });

            staticFacts.forEach(function (fact) {
                fact.classList.remove('is-active');
                fragment.appendChild(fact);
            });

            ticker.replaceChildren(fragment);
            ticker.querySelector('.hero-v2-ticker-fact').classList.add('is-active');
            setTickerBadge('Live');
        });
    }

    hydrateLiveTicker();

    if (hero && !reducedMotion) {
        var scheduled = false;

        hero.addEventListener('pointermove', function (event) {
            if (scheduled) return;

            scheduled = true;
            window.requestAnimationFrame(function () {
                var rect = hero.getBoundingClientRect();
                var x = ((event.clientX - rect.left) / rect.width) * 100;
                var y = ((event.clientY - rect.top) / rect.height) * 100;
                hero.style.setProperty('--hero-haze-x', x.toFixed(2) + '%');
                hero.style.setProperty('--hero-haze-y', y.toFixed(2) + '%');
                scheduled = false;
            });
        }, { passive: true });
    }

    function parseDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;

        var parts = value.split('-').map(Number);
        var date = new Date(parts[0], parts[1] - 1, parts[2]);
        if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) {
            return null;
        }

        return date;
    }

    function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function addDays(date, days) {
        var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        next.setDate(next.getDate() + days);
        return next;
    }

    function normalizeDateRange() {
        if (!form) return;

        var checkin = form.querySelector('[data-hero-checkin]');
        var checkout = form.querySelector('[data-hero-checkout]');
        if (!checkin || !checkout) return;

        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayValue = formatDate(today);

        checkin.min = todayValue;
        checkout.min = todayValue;

        var arrival = parseDate(checkin.value);
        if (!arrival) return;

        var minimumCheckout = addDays(arrival, 1);
        checkout.min = formatDate(minimumCheckout);

        var departure = parseDate(checkout.value);
        if (!departure || departure <= arrival) {
            checkout.value = formatDate(addDays(arrival, 7));
        }
    }

    function updateAreaStatus() {
        if (!form) return;

        var area = form.querySelector('[data-hero-area]');
        var status = form.querySelector('[data-hero-area-status]');
        if (!area || !status) return;

        status.textContent = area.value === 'sarasota' ? '1 Sarasota home' : '4 homes near AMI';
    }

    function buildSearchUrl() {
        var url = new URL('/properties/', window.location.origin);

        if (!form) {
            var legacyLocation = document.getElementById('location-select');
            var legacyArea = legacyLocation && legacyLocation.value === 'sarasota' ? 'sarasota' : 'anna-maria-island';
            url.searchParams.set('area', legacyArea);
            return url.pathname + url.search;
        }

        var formData = new FormData(form);
        var area = formData.get('area');
        var checkin = formData.get('checkin');
        var checkout = formData.get('checkout');
        var guests = formData.get('guests');

        if (area) url.searchParams.set('area', area);
        if (parseDate(checkin)) url.searchParams.set('checkin', checkin);
        if (parseDate(checkout)) url.searchParams.set('checkout', checkout);
        if (/^\d+$/.test(guests || '')) url.searchParams.set('guests', guests);

        return url.pathname + url.search;
    }

    if (form) {
        normalizeDateRange();
        updateAreaStatus();

        form.addEventListener('change', function (event) {
            if (event.target.matches('[data-hero-checkin], [data-hero-checkout]')) {
                normalizeDateRange();
            }

            if (event.target.matches('[data-hero-area]')) {
                updateAreaStatus();
            }
        });
    }

    window.SeascapeHeroV2 = {
        buildSearchUrl: buildSearchUrl,
        normalizeDateRange: normalizeDateRange,
        buildWeatherUrl: buildWeatherUrl,
        getWeatherCondition: getWeatherCondition
    };

    if (!window.handleSearch) {
        window.handleSearch = function (event) {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            normalizeDateRange();
            window.location.href = buildSearchUrl();
        };
    }
})();
