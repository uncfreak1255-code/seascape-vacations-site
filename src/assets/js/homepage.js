(function deferGa4() {
    var measurementId = 'G-3VDV66S3DK';
    var SENSITIVE_ANALYTICS_KEY_PATTERN = /(^|[-_])(email|e-mail|phone|tel|mobile|first-name|last-name|full-name|guest-name|name|address|property-address|street|zip|postal|message|comment|note|concern|concerns|details|description|what-feels-off|free-text)($|[-_])/i;
    var EMAIL_VALUE_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    var PHONE_VALUE_PATTERN = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
    var ADDRESS_VALUE_PATTERN = /\d{2,6}\s+[a-z0-9 .'-]+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd|way|place|pl)\b/i;

    function normalizeAnalyticsKey(key) {
        return String(key || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    function isSensitiveAnalyticsKey(key) {
        return SENSITIVE_ANALYTICS_KEY_PATTERN.test(normalizeAnalyticsKey(key));
    }

    function sanitizeAnalyticsUrl(value) {
        if (typeof URL !== 'function') return '';
        try {
            var url = new URL(String(value), window.location && window.location.href ? window.location.href : 'https://seascape-vacations.com/');
            Array.from(url.searchParams.keys()).forEach(function(key) {
                var paramValue = url.searchParams.get(key) || '';
                if (isSensitiveAnalyticsKey(key) || EMAIL_VALUE_PATTERN.test(paramValue) || PHONE_VALUE_PATTERN.test(paramValue) || ADDRESS_VALUE_PATTERN.test(paramValue)) {
                    url.searchParams.delete(key);
                }
            });
            return url.toString();
        } catch (error) {
            return '';
        }
    }

    function sanitizeAnalyticsValue(key, value) {
        if (typeof value === 'function' || typeof value === 'number' || typeof value === 'boolean') return value;
        if (value === null || typeof value === 'undefined') return value;
        if (Array.isArray(value)) {
            return value.map(function(item) {
                return sanitizeAnalyticsValue(key, item);
            }).filter(function(item) {
                return item !== '';
            });
        }
        if (typeof value === 'object') return sanitizeAnalyticsPayload(value);

        var stringValue = String(value).trim();
        if (!stringValue) return '';
        if (/url$/i.test(key)) return sanitizeAnalyticsUrl(stringValue);
        if (EMAIL_VALUE_PATTERN.test(stringValue) || PHONE_VALUE_PATTERN.test(stringValue) || ADDRESS_VALUE_PATTERN.test(stringValue)) return '';
        return stringValue.slice(0, 160);
    }

    function sanitizeAnalyticsPayload(payload) {
        var safePayload = {};
        if (!payload || typeof payload !== 'object') return safePayload;

        Object.keys(payload).forEach(function(key) {
            if (isSensitiveAnalyticsKey(key)) return;
            var value = sanitizeAnalyticsValue(key, payload[key]);
            if (value === '' || typeof value === 'undefined' || value === null) return;
            safePayload[key] = value;
        });

        return safePayload;
    }

    window.seascapeSanitizeAnalyticsPayload = window.seascapeSanitizeAnalyticsPayload || sanitizeAnalyticsPayload;

    window.__seascapeGaQueue = window.__seascapeGaQueue || [];
    window.seascapeTrackEvent = function(eventName, params) {
        if (!eventName) return;
        var safeParams = window.seascapeSanitizeAnalyticsPayload(params || {});
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, safeParams);
            return;
        }
        window.__seascapeGaQueue.push([eventName, safeParams]);
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
