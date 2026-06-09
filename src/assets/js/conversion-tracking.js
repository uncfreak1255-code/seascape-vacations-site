(function () {
  "use strict";

  if (window.__seascapeConversionTrackingLoaded) return;
  window.__seascapeConversionTrackingLoaded = true;

  var MAILCHIMP_ENDPOINT = "https://seascape-vacations.us6.list-manage.com/subscribe/post";
  var MAILCHIMP_QUERY = "u=48f234eebd9cb530fd2f217fe&id=95e5a594d1&f_id=008996e5f0";
  var GUEST_EMAIL_CAPTURE_ENDPOINT = "/.netlify/functions/guest-email-capture";
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
  var AI_SOURCE_HOSTS = [
    "chatgpt.com",
    "perplexity.ai",
    "claude.ai",
    "gemini.google.com",
    "copilot.microsoft.com"
  ];
  var ORGANIC_SEARCH_HOSTS = [
    "google.",
    "bing.com",
    "duckduckgo.com",
    "yahoo.com"
  ];
  var BOOKING_ENGINE_HOST = "book.seascape-vacations.com";
  var BOOKING_ENGINE_HANDOFF_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "ref",
    "checkin",
    "checkout",
    "guests"
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

  function normalizeTrackingValue(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function getNavigationHref(node) {
    if (!node) return "";
    if (node.href) return node.href;
    if (typeof node.getAttribute === "function") return node.getAttribute("href") || "";
    return "";
  }

  function buildBookingEngineHandoffUrl(href, node) {
    if (!href || typeof URL !== "function") return href || "";

    var currentHref = window.location && typeof window.location.href === "string"
      ? window.location.href
      : "https://seascape-vacations.com/";
    var locationSearch = window.location && typeof window.location.search === "string"
      ? window.location.search
      : "";
    var currentParams = typeof URLSearchParams === "function"
      ? new URLSearchParams(locationSearch)
      : null;
    var url;

    try {
      url = new URL(href, currentHref);
    } catch (error) {
      return href;
    }

    if (url.hostname.replace(/^www\./, "").toLowerCase() !== BOOKING_ENGINE_HOST) {
      return url.toString();
    }

    if (currentParams) {
      BOOKING_ENGINE_HANDOFF_KEYS.forEach(function (key) {
        var value = (currentParams.get(key) || "").trim();
        if (value && !url.searchParams.get(key)) {
          url.searchParams.set(key, value);
        }
      });
    }

    var sourceContext = getSourceContext();
    if (!url.searchParams.get("utm_source") && sourceContext.ai_platform) {
      url.searchParams.set("utm_source", normalizeTrackingValue(sourceContext.ai_platform));
    }
    if (!url.searchParams.get("utm_medium") && sourceContext.source_context === "ai_referral") {
      url.searchParams.set("utm_medium", "ai-referral");
    }
    if (!url.searchParams.get("utm_campaign") && sourceContext.source_context === "ai_referral") {
      url.searchParams.set("utm_campaign", "site-handoff");
    }
    if (!url.searchParams.get("utm_content")) {
      var contentSource = node && node.dataset
        ? node.dataset.pageSlug || node.dataset.guideSlug || node.dataset.trackLabel || node.dataset.placement || ""
        : "";
      var normalizedContent = normalizeTrackingValue(contentSource || slugFromPath(getCurrentPagePath()));
      if (normalizedContent) {
        url.searchParams.set("utm_content", normalizedContent);
      }
    }
    if (!url.searchParams.get("ref") && sourceContext.source_context === "ai_referral") {
      url.searchParams.set("ref", "ai-site-handoff");
    }

    return url.toString();
  }

  function syncBookingEngineLink(node) {
    var href = getNavigationHref(node);
    if (!href) return "";

    var nextHref = buildBookingEngineHandoffUrl(href, node);
    if (!nextHref || nextHref === href) return href;

    if (typeof node.setAttribute === "function") {
      node.setAttribute("href", nextHref);
    }
    if ("href" in node) {
      node.href = nextHref;
    }

    return nextHref;
  }

  function decorateBookingEngineLinks() {
    if (!document || typeof document.querySelectorAll !== "function") return;

    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (node) {
      syncBookingEngineLink(node);
    });
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
    var href = syncBookingEngineLink(node) || getNavigationHref(node);
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

  function resolveOwnerSourcePage(node) {
    if (!node || !node.dataset) return getOwnerSourceFromLocation();

    return (
      getOwnerSourceFromLocation() ||
      getHiddenInputValue(node, "source_page_slug") ||
      node.dataset.sourcePageSlug ||
      node.dataset.pageSlug ||
      ""
    );
  }

  function syncOwnerSourcePage(form) {
    if (!form || !form.dataset) return;

    var sourcePageSlug = resolveOwnerSourcePage(form);

    if (!sourcePageSlug) return;

    form.dataset.sourcePageSlug = sourcePageSlug;
    setHiddenInputValue(form, "source_page_slug", sourcePageSlug);
  }

  function ownerContextValue(field) {
    if (!field || typeof field.value !== "string") return "";
    return field.value.trim();
  }

  function ownerFormHasContext(form) {
    if (!form || typeof form.querySelectorAll !== "function") return true;

    var fields = form.querySelectorAll("[data-owner-context-field]");
    if (!fields.length) {
      fields = form.querySelectorAll('[name="property_address"], [name="listing_url"], [name="what_feels_off"], [name="concerns"]');
    }

    for (var i = 0; i < fields.length; i += 1) {
      if (ownerContextValue(fields[i])) return true;
    }

    return false;
  }

  function validateOwnerFormContext(form) {
    if (!form || !form.dataset || form.dataset.trackForm !== "owner") return true;
    if (form.dataset.ownerContextRequired !== "true") return true;
    if (ownerFormHasContext(form)) return true;

    var field = form.querySelector("[data-owner-context-field]") || form.querySelector('[name="property_address"]');
    if (!field) return false;

    field.setCustomValidity("Send the listing or address, or tell us what feels off.");
    field.reportValidity();
    field.addEventListener("input", function clearOwnerContextValidity() {
      field.setCustomValidity("");
      field.removeEventListener("input", clearOwnerContextValidity);
    });
    return false;
  }

  function getPayloadFromElement(node) {
    var href = syncBookingEngineLink(node) || (node && node.getAttribute ? node.getAttribute("href") : "");
    var sourcePageSlug = resolveOwnerSourcePage(node);
    var dataset = node && node.dataset ? node.dataset : {};

    return Object.assign({
      guide_slug: dataset.guideSlug || "",
      page_slug: dataset.pageSlug || "",
      source_page_slug: sourcePageSlug,
      market: dataset.market || "",
      placement: dataset.formPlacement || dataset.placement || "",
      link_text: dataset.trackLabel || getText(node),
      link_url: href || "",
      utility_moment: dataset.utilityMoment || dataset.captureMoment || "",
      utility_source_label: dataset.utilitySourceLabel || dataset.sourceLabel || dataset.captureSourceLabel || "",
      requested_value: dataset.requestedValue || dataset.utilityValue || "",
      guest_intent: dataset.guestIntent || "",
      delivery_channel: dataset.deliveryChannel || "",
      consent_basis: dataset.consentBasis || ""
    }, getSourceContext());
  }

  function getCurrentPagePath() {
    var path = window.location && typeof window.location.pathname === "string"
      ? window.location.pathname
      : "/";

    if (!path) return "/";
    if (path.charAt(0) !== "/") return "/" + path;
    return path;
  }

  function getHostname(url) {
    if (!url || typeof URL !== "function") return "";
    try {
      return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function getSourceContext() {
    var search = window.location && typeof window.location.search === "string" ? window.location.search : "";
    var params = typeof URLSearchParams === "function" ? new URLSearchParams(search) : null;
    var utmSource = params ? (params.get("utm_source") || "").trim().toLowerCase() : "";
    var utmMedium = params ? (params.get("utm_medium") || "").trim().toLowerCase() : "";
    var utmCampaign = params ? (params.get("utm_campaign") || "").trim().toLowerCase() : "";
    var utmContent = params ? (params.get("utm_content") || "").trim().toLowerCase() : "";
    var ref = params ? (params.get("ref") || "").trim().toLowerCase() : "";
    var referrerHost = typeof document !== "undefined" ? getHostname(document.referrer) : "";
    var sourceHost = utmSource || referrerHost;
    var aiPlatform = "";
    var sourceType = "direct_or_unknown";

    for (var i = 0; i < AI_SOURCE_HOSTS.length; i += 1) {
      if (sourceHost.indexOf(AI_SOURCE_HOSTS[i]) !== -1) {
        aiPlatform = AI_SOURCE_HOSTS[i];
        sourceType = "ai_referral";
        break;
      }
    }

    if (!aiPlatform && /^(chatgpt|perplexity|claude|gemini|copilot|ai_mode|google_ai)$/i.test(utmSource)) {
      aiPlatform = utmSource;
      sourceType = "ai_referral";
    }

    if (!aiPlatform && /^(ai|ai-assistant|assistant|ai-referral)$/i.test(utmMedium)) {
      aiPlatform = utmSource || "ai";
      sourceType = "ai_referral";
    }

    if (sourceType === "direct_or_unknown") {
      for (var j = 0; j < ORGANIC_SEARCH_HOSTS.length; j += 1) {
        if (referrerHost.indexOf(ORGANIC_SEARCH_HOSTS[j]) !== -1) {
          sourceType = "organic_search";
          break;
        }
      }
    }

    return {
      source_context: sourceType,
      ai_platform: aiPlatform,
      referrer_host: referrerHost,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      ref: ref,
      landing_page_path: getCurrentPagePath()
    };
  }

  function slugFromPath(path) {
    if (!path || path === "/") return "home";
    var normalized = path;
    if (/\.html$/i.test(normalized)) {
      normalized = normalized.replace(/\.html$/i, "");
    }
    normalized = normalized.replace(/^\/+|\/+$/g, "");
    if (!normalized) return "home";
    var segments = normalized.split("/");
    return segments[segments.length - 1] || "home";
  }

  function bindTrackedClicks() {
    document.addEventListener("click", function (event) {
      if (!event.target || typeof event.target.closest !== "function") return;

      var target = event.target.closest("[data-track-event]");
      if (!target) return;

      syncBookingEngineLink(target);

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

    var mailchimpEndpoint =
      MAILCHIMP_ENDPOINT +
      "?" +
      MAILCHIMP_QUERY +
      "&EMAIL=" +
      encodeURIComponent(email) +
      "&FNAME=" +
      encodeURIComponent(name);

    var currentPagePath = getCurrentPagePath();
    var trackingPayload = getPayloadFromElement(form);
    var submissionPayload = {
      formName: form.dataset.trackForm || "email_capture",
      name: name,
      email: email,
      pagePath: currentPagePath,
      pageSlug: trackingPayload.page_slug || slugFromPath(currentPagePath),
      guideSlug: trackingPayload.guide_slug || "",
      sourcePageSlug: trackingPayload.source_page_slug || trackingPayload.page_slug || trackingPayload.guide_slug || slugFromPath(currentPagePath),
      market: trackingPayload.market || "florida-gulf-coast",
      placement: trackingPayload.placement || "inline",
      utilityMoment: trackingPayload.utility_moment,
      utilitySourceLabel: trackingPayload.utility_source_label,
      requestedValue: trackingPayload.requested_value,
      guestIntent: trackingPayload.guest_intent,
      deliveryChannel: trackingPayload.delivery_channel,
      consentBasis: trackingPayload.consent_basis
    };

    fetch(GUEST_EMAIL_CAPTURE_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(submissionPayload),
      keepalive: true
    }).then(function (response) {
      if (response && typeof response.ok === "boolean" && !response.ok) {
        throw new Error("Guest email capture failed");
      }
      return response;
    }).catch(function () {
      return fetch(mailchimpEndpoint, {
        method: "POST",
        mode: "no-cors"
      });
    }).then(function () {
      try {
        localStorage.setItem("seascape_email_popup_shown", "subscribed");
      } catch (error) {
        // Ignore private mode / storage failures.
      }
      showInlineEmailSuccess(form);
    }).catch(function () {});
  }

  function bindTrackedForms() {
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || !form.matches("form[data-track-form]")) return;

      syncOwnerSourcePage(form);
      if (!validateOwnerFormContext(form)) {
        event.preventDefault();
        return;
      }
      if (form.dataset.skipGlobalSubmitTrack !== "true") {
        trackEvent(form.dataset.formSubmitEvent, getPayloadFromElement(form));
      }

      if (form.dataset.inlineEmailCapture === "true") {
        event.preventDefault();
        submitInlineEmailForm(form);
      }
    });
  }

  function init() {
    decorateBookingEngineLinks();
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
    continueTrackedNavigation: continueTrackedNavigation,
    getSourceContext: getSourceContext,
    buildBookingEngineHandoffUrl: buildBookingEngineHandoffUrl
  };
})();
