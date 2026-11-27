// Owner-form "how did you hear about us" (#heard-about): show the AI prompt
// when an AI source is picked. Without JS the prompt stays visible and optional.
(function (root) {
  "use strict";

  var AI_VALUES = {
    chatgpt: true,
    google_ai: true,
    other_ai: true
  };
  var ALLOWED_HEARD_ABOUT = {
    google: true,
    google_maps: true,
    chatgpt: true,
    google_ai: true,
    other_ai: true,
    referral: true,
    airbnb_vrbo: true,
    social: true,
    other: true
  };

  function isAi(value) {
    return Boolean(AI_VALUES[String(value || "")]);
  }

  function readHeardAbout(form) {
    if (!form || typeof form.querySelector !== "function") {
      return { heard_about: "", heard_about_prompt: "" };
    }
    var select = form.querySelector('[name="heard_about"]');
    var prompt = form.querySelector('[name="heard_about_prompt"]');
    var heard = select && typeof select.value === "string" ? select.value.trim() : "";
    var asked = prompt && typeof prompt.value === "string" ? prompt.value.trim() : "";
    return {
      heard_about: ALLOWED_HEARD_ABOUT[heard] ? heard : "",
      heard_about_prompt: isAi(heard) && asked ? asked : ""
    };
  }

  function syncPrompt(form) {
    if (!form || typeof form.querySelector !== "function") return;
    var promptField = form.querySelector(".owner-heard-about-prompt");
    var select = form.querySelector('[name="heard_about"]');
    if (!promptField) return;
    var open = isAi(select && select.value);
    promptField.classList.toggle("is-open", open);
    if (open) promptField.removeAttribute("hidden");
    else promptField.setAttribute("hidden", "");
  }

  function ownerForm(win) {
    var doc = win && win.document;
    if (!doc || typeof doc.querySelector !== "function") return null;
    return doc.querySelector('form[data-track-form="owner"]');
  }

  // Allowlisted source only. The free-text prompt stays on Netlify / the
  // contact blob / Graph email. Google forbids PII in Analytics, and the
  // sanitizer runs before this wrap, so the prompt must never be attached here.
  function enrichSubmitPayload(win, eventName, payload) {
    if (eventName !== "owner_form_submit") return payload;
    var extra = readHeardAbout(ownerForm(win));
    var next = Object.assign({}, payload || {});
    if (extra.heard_about) next.heard_about = extra.heard_about;
    return next;
  }

  // conversion-tracking.js's submit listener calls a closed-over trackEvent, not
  // the exported property. That closed-over function looks up seascapeTrackEvent
  // (then gtag) at send time, so wrapping those is the live submit path.
  function wrapTrackSender(win) {
    if (!win) return;
    var original = win.seascapeTrackEvent;
    if (typeof original === "function" && !original._heardAboutWrapped) {
      function wrapped(eventName, params) {
        return original.call(win, eventName, enrichSubmitPayload(win, eventName, params));
      }
      wrapped._heardAboutWrapped = true;
      win.seascapeTrackEvent = wrapped;
      return;
    }
    var gtag = win.gtag;
    if (typeof gtag !== "function" || gtag._heardAboutWrapped) return;
    function wrappedGtag(command, eventName, params) {
      if (command === "event") {
        return gtag.call(win, command, eventName, enrichSubmitPayload(win, eventName, params));
      }
      return gtag.apply(win, arguments);
    }
    wrappedGtag._heardAboutWrapped = true;
    win.gtag = wrappedGtag;
  }

  function bind(win) {
    var doc = win && win.document;
    if (!doc || typeof doc.querySelectorAll !== "function") return;
    if (doc.documentElement) doc.documentElement.classList.add("sv-js");
    var forms = doc.querySelectorAll('form[data-track-form="owner"]');
    Array.prototype.forEach.call(forms, function (form) {
      var select = form.querySelector('[name="heard_about"]');
      if (select && !select._heardAboutBound) {
        select.addEventListener("change", function () {
          syncPrompt(form);
        });
        select._heardAboutBound = true;
      }
      syncPrompt(form);
    });
    wrapTrackSender(win);
    if (typeof doc.addEventListener === "function") {
      doc.addEventListener("DOMContentLoaded", function () {
        wrapTrackSender(win);
      }, { once: true });
    }
  }

  var api = {
    bind: bind,
    readHeardAbout: readHeardAbout,
    isAi: isAi,
    syncPrompt: syncPrompt
  };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    bind(root);
  }
})(typeof window !== "undefined" ? window : globalThis);
