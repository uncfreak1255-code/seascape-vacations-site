// Owner-form first-touch source (#826): external referrer host + utm_*; no contact details.
(function () {
  "use strict";
  var KEY = "sv_owner_first_touch";
  var FIELDS = ["referrer", "utm_source", "utm_medium", "utm_campaign"];

  function clean(value) {
    var text = String(value || "").trim().toLowerCase().slice(0, 100);
    if (text.indexOf("@") !== -1 || /\d[\d\s().+-]{6,}\d/.test(text)) return "";
    return text;
  }

  function referrerHost(referrer, ownHost) {
    try {
      var host = new URL(referrer).hostname;
      return host && host !== ownHost ? host : "";
    } catch (_error) {
      return "";
    }
  }

  function readTouch(win) {
    var params = new URLSearchParams(win.location.search || "");
    var touch = { referrer: clean(referrerHost(win.document.referrer, win.location.hostname)) };
    FIELDS.slice(1).forEach(function (key) {
      touch[key] = clean(params.get(key));
    });
    return touch;
  }

  function firstTouch(win) {
    var stored = null;
    try {
      stored = JSON.parse(win.sessionStorage.getItem(KEY) || "null");
    } catch (_error) {
      stored = null;
    }
    if (stored && typeof stored === "object") return stored;
    var touch = readTouch(win);
    try {
      win.sessionStorage.setItem(KEY, JSON.stringify(touch));
    } catch (_error) {
      // Storage blocked: this page still fills the form.
    }
    return touch;
  }

  function fill(win) {
    var touch = firstTouch(win);
    var forms = win.document.querySelectorAll('form[data-track-form="owner"]');
    Array.prototype.forEach.call(forms, function (form) {
      FIELDS.forEach(function (name) {
        var input = form.querySelector('input[type="hidden"][name="' + name + '"]');
        if (input) input.value = clean(touch[name]);
      });
    });
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { fill: fill, firstTouch: firstTouch, clean: clean, KEY: KEY };
  } else {
    fill(window);
  }
})();
