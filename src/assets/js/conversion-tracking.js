(function () {
  "use strict";

  var MAILCHIMP_ENDPOINT = "https://seascape-vacations.us6.list-manage.com/subscribe/post";
  var MAILCHIMP_QUERY = "u=48f234eebd9cb530fd2f217fe&id=95e5a594d1&f_id=008996e5f0";
  var SUPPORTED_EVENTS = [
    "owner_primary_cta_click",
    "owner_phone_click",
    "owner_form_start",
    "owner_form_submit",
    "guide_stay_click",
    "guide_book_direct_click",
    "email_capture_submit",
    "booking_engine_handoff",
    "catalog_book_direct_click",
    "catalog_collection_click",
    "catalog_view_details_click",
    "stay_view_property_click",
    "property_check_availability_click",
    "property_booking_page_click"
  ];

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
  }

  function callOnce(callback) {
    var called = false;
    return function () {
      if (called || typeof callback !== "function") return;
      called = true;
      callback();
    };
  }

  function getNavigationHref(node) {
    if (!node) return "";
    if (node.href) return node.href;
    if (typeof node.getAttribute === "function") return node.getAttribute("href") || "";
    return "";
  }

  function shouldDelayTrackedNavigation(node, event) {
    var href = getNavigationHref(node);
    var target = node && node.target ? node.target : node && typeof node.getAttribute === "function" ? node.getAttribute("target") || "" : "";

    if (!node || String(node.tagName || "").toUpperCase() !== "A") return false;
    if (!href) return false;
    if (href.charAt(0) === "#") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (target && target.toLowerCase() !== "_self") return false;
    if (typeof node.hasAttribute === "function" && node.hasAttribute("download")) return false;
    if (event && typeof event.button === "number" && event.button !== 0) return false;
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return false;

    return true;
  }

  function continueTrackedNavigation(node) {
    var href = getNavigationHref(node);
    if (!href) return;

    if (window.location && typeof window.location.assign === "function") {
      window.location.assign(href);
      return;
    }

    if (window.location) {
      window.location.href = href;
    }
  }

  function trackEvent(eventName, payload, options) {
    if (!eventName) return;
    if (SUPPORTED_EVENTS.indexOf(eventName) === -1) {
      SUPPORTED_EVENTS.push(eventName);
    }

    var safePayload = Object.assign(
      {
        transport_type: "beacon"
      },
      payload || {}
    );
    var completion = callOnce(options && options.onComplete);
    var timeoutMs = (options && options.timeoutMs) || 800;

    if (typeof options === "object" && typeof options.onComplete === "function") {
      setTimeout(completion, timeoutMs);
      safePayload.event_callback = completion;
      safePayload.event_timeout = timeoutMs;
    }

    if (typeof window.seascapeTrackEvent === "function") {
      window.seascapeTrackEvent(eventName, safePayload);
      return;
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, safePayload);
      return;
    }

    ensureDataLayer().push({
      event: eventName,
      payload: safePayload
    });

    completion();
  }

  function getText(node) {
    return (node && node.textContent ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function getHiddenInputValue(form, name) {
    if (!form || typeof form.querySelector !== "function") return "";
    var field = form.querySelector('input[name="' + name + '"]');
    if (!field || typeof field.value !== "string") return "";
    return field.value.trim();
  }

  function setHiddenInputValue(form, name, value) {
    if (!form || typeof form.querySelector !== "function") return;
    var field = form.querySelector('input[name="' + name + '"]');
    if (!field) return;
    field.value = value;
  }

  function getOwnerSourceFromLocation() {
    if (!window.location || typeof window.location.search !== "string" || typeof URLSearchParams !== "function") {
      return "";
    }

    var params = new URLSearchParams(window.location.search);
    return (params.get("owner_source") || "").trim();
  }

  function syncOwnerSourcePage(form) {
    if (!form || !form.dataset) return;

    var sourcePageSlug =
      getOwnerSourceFromLocation() ||
      getHiddenInputValue(form, "source_page_slug") ||
      form.dataset.sourcePageSlug ||
      form.dataset.pageSlug ||
      "";

    if (!sourcePageSlug) return;

    form.dataset.sourcePageSlug = sourcePageSlug;
    setHiddenInputValue(form, "source_page_slug", sourcePageSlug);
  }

  function getPayloadFromElement(node) {
    var href = node && node.getAttribute ? node.getAttribute("href") : "";
    var sourcePageSlug = node && node.dataset ? node.dataset.sourcePageSlug || "" : "";

    if (!sourcePageSlug && node && String(node.tagName || "").toUpperCase() === "FORM") {
      sourcePageSlug = getHiddenInputValue(node, "source_page_slug");
    }

    return {
      guide_slug: node && node.dataset ? node.dataset.guideSlug || "" : "",
      page_slug: node && node.dataset ? node.dataset.pageSlug || "" : "",
      source_page_slug: sourcePageSlug,
      market: node && node.dataset ? node.dataset.market || "" : "",
      placement: node && node.dataset ? node.dataset.formPlacement || node.dataset.placement || "" : "",
      link_text: node && node.dataset && node.dataset.trackLabel ? node.dataset.trackLabel : getText(node),
      link_url: href || ""
    };
  }

  function bindTrackedClicks() {
    document.addEventListener("click", function (event) {
      if (!event.target || typeof event.target.closest !== "function") return;

      var target = event.target.closest("[data-track-event]");
      if (!target) return;

      if (shouldDelayTrackedNavigation(target, event)) {
        event.preventDefault();
        trackEvent(target.dataset.trackEvent, getPayloadFromElement(target), {
          onComplete: function () {
            continueTrackedNavigation(target);
          }
        });
        return;
      }

      trackEvent(target.dataset.trackEvent, getPayloadFromElement(target));
    });
  }

  function bindOwnerFormStarts() {
    var ownerForms = document.querySelectorAll('form[data-track-form="owner"]');
    ownerForms.forEach(function (form) {
      syncOwnerSourcePage(form);
      var started = false;
      form.addEventListener("focusin", function () {
        if (started) return;
        started = true;
        trackEvent(form.dataset.formStartEvent || "owner_form_start", getPayloadFromElement(form));
      });
    });
  }

  function showInlineEmailSuccess(form) {
    var success = form.parentElement && form.parentElement.querySelector("[data-email-capture-success]");
    if (!success && typeof form.closest === "function") {
      var captureRoot = form.closest("[data-email-capture-root]");
      if (captureRoot && typeof captureRoot.querySelector === "function") {
        success = captureRoot.querySelector("[data-email-capture-success]");
      }
    }
    if (!success) return;

    if (typeof form.closest === "function") {
      var captureContent = form.closest("[data-email-capture-content]");
      if (captureContent && captureContent.style) {
        captureContent.style.display = "none";
      }
    }

    success.classList.add("is-visible");
    success.classList.add("show");
    form.reset();
  }

  function submitInlineEmailForm(form) {
    var formData = new FormData(form);
    var email = formData.get("email");
    var name = formData.get("name");

    if (!email || !name) return;

    var endpoint =
      MAILCHIMP_ENDPOINT +
      "?" +
      MAILCHIMP_QUERY +
      "&EMAIL=" +
      encodeURIComponent(email) +
      "&FNAME=" +
      encodeURIComponent(name);

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors"
    }).catch(function () {
      return null;
    }).finally(function () {
      try {
        localStorage.setItem("seascape_email_popup_shown", "subscribed");
      } catch (error) {
        // Ignore private mode / storage failures.
      }
      showInlineEmailSuccess(form);
    });
  }

  function bindTrackedForms() {
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || !form.matches("form[data-track-form]")) return;

      syncOwnerSourcePage(form);
      trackEvent(form.dataset.formSubmitEvent, getPayloadFromElement(form));

      if (form.dataset.inlineEmailCapture === "true") {
        event.preventDefault();
        submitInlineEmailForm(form);
      }
    });
  }

  function init() {
    bindTrackedClicks();
    bindOwnerFormStarts();
    bindTrackedForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.SeascapeConversionTracking = {
    trackEvent: trackEvent,
    shouldDelayTrackedNavigation: shouldDelayTrackedNavigation,
    continueTrackedNavigation: continueTrackedNavigation
  };
})();
