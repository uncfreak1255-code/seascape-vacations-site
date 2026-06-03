(function deferGa4() {
    var measurementId = 'G-3VDV66S3DK';

    window.__seascapeGaQueue = window.__seascapeGaQueue || [];
    window.seascapeTrackEvent = function(eventName, params) {
        if (!eventName) return;
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params || {});
            return;
        }
        window.__seascapeGaQueue.push([eventName, params || {}]);
    };

    function loadGa4() {
        if (window.__seascapeGaLoaded) return;
        window.__seascapeGaLoaded = true;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        script.onload = function() {
            window.gtag('js', new Date());
            window.gtag('config', measurementId);
            (window.__seascapeGaQueue || []).forEach(function(entry) {
                window.gtag('event', entry[0], entry[1]);
            });
            window.__seascapeGaQueue = [];
        };
        document.head.appendChild(script);
    }

    ['pointerdown', 'keydown', 'submit'].forEach(function(eventName) {
        window.addEventListener(eventName, loadGa4, { once: true, passive: eventName === 'pointerdown' });
    });

    window.addEventListener('load', function() {
        window.setTimeout(loadGa4, 4000);
    }, { once: true });
})();

(function loadConversionTracking() {
    if (window.__seascapeConversionTrackingLoaded) return;
    if (document.querySelector('script[src="/assets/js/conversion-tracking.js"]')) return;

    var script = document.createElement('script');
    script.src = '/assets/js/conversion-tracking.js';
    script.defer = true;
    document.head.appendChild(script);
})();

(function deferMetaPixel() {
    function loadMetaPixel() {
        if (window.__seascapeMetaPixelLoaded) return;

        window.__seascapeMetaPixelLoaded = true;

        if (!window.fbq) {
            var fbq = function() {
                fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
            };

            fbq.queue = [];
            fbq.loaded = true;
            fbq.version = '2.0';
            window.fbq = fbq;
            window._fbq = fbq;

            var script = document.createElement('script');
            script.async = true;
            script.src = 'https://connect.facebook.net/en_US/fbevents.js';
            document.head.appendChild(script);
        }

        window.fbq('init', '2748551298816267');
        window.fbq('track', 'PageView');
    }

    window.addEventListener('pointerdown', loadMetaPixel, { once: true, passive: true });
    window.addEventListener('keydown', loadMetaPixel, { once: true });
    window.addEventListener('scroll', loadMetaPixel, { once: true, passive: true });
})();

var EMAIL_POPUP_KEY = 'seascape_email_popup_shown';
var EMAIL_POPUP_DELAY = 30000;
var SAVE50_POPUP_CAMPAIGNS = ['save50_welcome', 'guest_social_proof'];
var SAVE50_POPUP_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'promo'];
var emailPopupReady = false;
var emailPopupShown = false;

function getSave50PopupContext() {
    if (typeof URLSearchParams !== 'function' || !window.location) return null;

    var params = new URLSearchParams(window.location.search || '');
    var campaign = (params.get('utm_campaign') || '').trim().toLowerCase();
    var promo = (params.get('promo') || '').trim().toLowerCase();

    if (SAVE50_POPUP_CAMPAIGNS.indexOf(campaign) === -1 && promo !== 'save50') {
        return null;
    }

    return {
        params: params,
        campaign: campaign
    };
}

function applySave50PopupReminder() {
    var context = getSave50PopupContext();
    var popup = document.getElementById('email-popup');

    if (!context || !popup) return;

    var popupContent = popup.querySelector('[data-email-capture-content]');
    var popupReminder = popup.querySelector('[data-email-capture-success]');
    var browseLink = popup.querySelector('[data-email-capture-browse]');

    if (popupContent && popupContent.style) {
        popupContent.style.display = 'none';
    }

    if (popupReminder && popupReminder.classList) {
        popupReminder.classList.add('is-visible');
        popupReminder.classList.add('show');
    }

    if (!browseLink || typeof URL !== 'function') return;

    var baseHref = browseLink.getAttribute('data-email-capture-default-href') || browseLink.getAttribute('href') || '/properties/';
    var nextUrl = new URL(baseHref, window.location.href);

    SAVE50_POPUP_PARAM_KEYS.forEach(function(key) {
        var value = (context.params.get(key) || '').trim();

        if (!value && key === 'utm_campaign' && SAVE50_POPUP_CAMPAIGNS.indexOf(context.campaign) !== -1) {
            value = context.campaign;
        }

        if (value && !nextUrl.searchParams.get(key)) {
            nextUrl.searchParams.set(key, value);
        }
    });

    browseLink.setAttribute('href', nextUrl.pathname + nextUrl.search + nextUrl.hash);
}

function showEmailPopup() {
    if (emailPopupShown) return;

    var campaignContext = getSave50PopupContext();
    var lastShown = localStorage.getItem(EMAIL_POPUP_KEY);
    if (!campaignContext && lastShown === 'subscribed') return;

    if (!campaignContext && lastShown) {
        var daysSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return;
    }

    var popup = document.getElementById('email-popup');
    if (!popup) return;

    applySave50PopupReminder();
    emailPopupShown = true;
    popup.style.display = 'flex';
    window.requestAnimationFrame(function() {
        popup.classList.add('active');
    });
}

function closeEmailPopup() {
    var popup = document.getElementById('email-popup');
    if (!popup) return;

    popup.classList.remove('active');
    window.setTimeout(function() {
        popup.style.display = 'none';
    }, 400);
    localStorage.setItem(EMAIL_POPUP_KEY, Date.now().toString());
}

window.closeEmailPopup = closeEmailPopup;

window.setTimeout(function() {
    emailPopupReady = true;
    if (document.getElementById('page-home')?.classList.contains('active')) {
        showEmailPopup();
    }
}, EMAIL_POPUP_DELAY);

document.addEventListener('mouseleave', function(event) {
    if (emailPopupReady && event.clientY <= 0) {
        showEmailPopup();
    }
});
