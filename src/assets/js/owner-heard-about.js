// Owner-form "how did you hear about us" (#heard-about): show the AI prompt
// when an AI source is picked. Without JS the prompt stays visible and optional.
(function (root) {
  "use strict";

  var AI_VALUES = {
    chatgpt: true,
    google_ai: true,
    other_ai: true
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
      heard_about: heard,
      heard_about_prompt: isAi(heard) && asked ? asked.slice(0, 160) : ""
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

  function attachTracking(win) {
    var api = win.SeascapeConversionTracking;
    if (!api || typeof api.trackEvent !== "function" || api.trackEvent._heardAboutWrapped) return;
    var original = api.trackEvent;
    function wrapped(eventName, payload, options) {
      if (eventName === "owner_form_submit") {
        var form = win.document && typeof win.document.querySelector === "function"
          ? win.document.querySelector('form[data-track-form="owner"]')
          : null;
        var extra = readHeardAbout(form);
        payload = Object.assign({}, payload || {});
        if (extra.heard_about) payload.heard_about = extra.heard_about;
        if (extra.heard_about_prompt) payload.heard_about_prompt = extra.heard_about_prompt;
      }
      return original.call(api, eventName, payload, options);
    }
    wrapped._heardAboutWrapped = true;
    api.trackEvent = wrapped;
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
    attachTracking(win);
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
