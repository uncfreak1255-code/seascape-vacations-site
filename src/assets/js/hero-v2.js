(function () {
    var hero = document.querySelector('[data-hero-v2]');
    var form = document.querySelector('[data-hero-booking]');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function rotateActive(items, intervalMs) {
        if (!items.length || reducedMotion) return;

        var index = 0;
        window.setInterval(function () {
            items[index].classList.remove('is-active');
            index = (index + 1) % items.length;
            items[index].classList.add('is-active');
        }, intervalMs);
    }

    rotateActive(Array.from(document.querySelectorAll('.hero-v2-phrase')), 5200);
    rotateActive(Array.from(document.querySelectorAll('[data-hero-ticker] span')), 4200);

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
        normalizeDateRange: normalizeDateRange
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
