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

var legalContent = {
    privacy: {
        title: 'Privacy Policy',
        content: '<p>At Seascape Vacations, we prioritize your privacy. We collect only necessary information to process your bookings and improve your experience. We do not sell your data to third parties.</p><p><strong>Data Collection:</strong> We collect name, email, and phone number for booking purposes.</p><p><strong>Security:</strong> Your data is encrypted and stored securely.</p>'
    },
    terms: {
        title: 'Terms of Service',
        content: '<p>By using this website, you agree to our terms. Bookings are subject to availability and confirmation.</p><p><strong>Cancellations:</strong> Please review the cancellation policy on the booking checkout page.</p><p><strong>Check-in/Out:</strong> Standard check-in is 4PM, check-out is 10AM.</p>'
    },
    cookies: {
        title: 'Cookie Policy',
        content: '<p>We use cookies to enhance your browsing experience and analyze site traffic. By continuing to use our site, you consent to our use of cookies.</p>'
    },
    support: {
        title: 'Support Center',
        content: '<p>Need help? Our local team is available 24/7.</p><p><strong>Phone:</strong> (941) 555-0123</p><p><strong>Email:</strong> <a href="mailto:support@seascape-vacations.com" style="color:var(--brand)">support@seascape-vacations.com</a></p><p>For urgent maintenance issues, please call the emergency line provided in your check-in instructions.</p>'
    }
};

window.openLegalModal = function(type) {
    var modal = document.getElementById('legal-modal');
    var data = legalContent[type];

    if (!modal || !data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-body').innerHTML = data.content;
    modal.style.display = 'flex';
    window.requestAnimationFrame(function() {
        modal.classList.add('active');
    });
};

window.closeLegalModal = function() {
    var modal = document.getElementById('legal-modal');
    if (!modal) return;

    modal.classList.remove('active');
    window.setTimeout(function() {
        modal.style.display = 'none';
    }, 300);
};

document.querySelectorAll('[data-legal-modal]').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
        window.openLegalModal(trigger.getAttribute('data-legal-modal'));
    });
});

var EMAIL_POPUP_KEY = 'seascape_email_popup_shown';
var EMAIL_POPUP_DELAY = 30000;
var emailPopupReady = false;
var emailPopupShown = false;

function showEmailPopup() {
    if (emailPopupShown) return;

    var lastShown = localStorage.getItem(EMAIL_POPUP_KEY);
    if (lastShown === 'subscribed') return;

    if (lastShown) {
        var daysSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return;
    }

    var popup = document.getElementById('email-popup');
    if (!popup) return;

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

function handleEmailSubmit(event) {
    event.preventDefault();

    var form = event.target;
    var formData = new FormData(form);
    var name = formData.get('name');
    var email = formData.get('email');
    var mailchimpUrl = 'https://seascape-vacations.us6.list-manage.com/subscribe/post?u=48f234eebd9cb530fd2f217fe&id=95e5a594d1&f_id=008996e5f0';
    var mailchimpData = new FormData();

    mailchimpData.append('EMAIL', email);
    mailchimpData.append('FNAME', name);

    fetch(mailchimpUrl, {
        method: 'POST',
        body: mailchimpData,
        mode: 'no-cors'
    }).catch(function(err) {
        console.log('Mailchimp submission:', err);
    });

    localStorage.setItem(EMAIL_POPUP_KEY, 'subscribed');

    var formContent = document.getElementById('email-form-content');
    var successContent = document.getElementById('email-success-content');
    if (formContent) formContent.style.display = 'none';
    if (successContent) successContent.classList.add('show');

    console.log('Email submitted to Mailchimp:', { name: name, email: email });
}

window.closeEmailPopup = closeEmailPopup;
window.handleEmailSubmit = handleEmailSubmit;

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
