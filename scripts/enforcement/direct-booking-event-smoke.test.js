const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-direct-booking-event-smoke.js");
const { buildRouteContract } = require("./rendered-route-contract");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("direct-booking event smoke is exposed as an operator command", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));

  assert.equal(
    packageJson.scripts["verify:direct-booking-events"],
    "node scripts/recovery/assert-direct-booking-event-smoke.js https://seascape-vacations.com"
  );
});

test("direct-booking event smoke runs in the post-deploy live-smoke flow", () => {
  const releaseGate = fs.readFileSync(path.join(projectRoot, "scripts", "enforcement", "verify-release.js"), "utf8");
  const liveSmoke = fs.readFileSync(path.join(projectRoot, ".github", "workflows", "live-smoke.yml"), "utf8");

  assert.doesNotMatch(releaseGate, /verify:direct-booking-events/);
  assert.match(liveSmoke, /run:\s*npm run verify:direct-booking-events/);
});

test("direct-booking event smoke supports optional popup enforcement", () => {
  const smoke = loadSmokeModule();

  assert.deepEqual(smoke.parseArgs(["https://seascape-vacations.com"]), {
    baseUrl: "https://seascape-vacations.com",
    requirePopupCapture: false
  });

  assert.deepEqual(smoke.parseArgs(["http://127.0.0.1:8123", "--require-popup-capture"]), {
    baseUrl: "http://127.0.0.1:8123",
    requirePopupCapture: true
  });
});

test("direct-booking event smoke validates the three funnel event surfaces", () => {
  const smoke = loadSmokeModule();

  assert.deepEqual(smoke.REQUIRED_EVENTS, [
    "email_capture_submit",
    "guide_book_direct_click",
    "booking_engine_handoff"
  ]);

  const guideBody = `
    <main>
      <form data-track-form="guide-email" data-form-submit-event="email_capture_submit" data-inline-email-capture="true">
        <input name="name" value="Test Guest">
        <input name="email" value="guest@example.com">
      </form>
      <a href="/stays/anna-maria-island-vacation-rentals/" data-track-event="guide_book_direct_click">Browse Direct Homes</a>
      <a href="https://book.seascape-vacations.com/listings/206016" data-track-event="booking_engine_handoff">Open Direct Availability</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateGuideEventMarkup(guideBody, "/guides/best-time-visit-anna-maria-island/");
  });

  const popupBody = `
    <div data-email-capture-root>
      <div data-email-capture-content>
        <form data-track-form="email_capture" data-form-submit-event="email_capture_submit" data-inline-email-capture="true"></form>
      </div>
      <div data-email-capture-success></div>
    </div>
    <script defer src="/assets/js/conversion-tracking.js"></script>
  `;

  assert.doesNotThrow(() => {
    smoke.validatePopupMarkup(popupBody, "/guides/bradenton-area-guide/");
  });

  const observedEvents = smoke.simulateDirectBookingEvents();
  assert.deepEqual(
    observedEvents.map((entry) => entry.event),
    ["email_capture_submit", "guide_book_direct_click", "booking_engine_handoff"]
  );

  const bookingHandoff = observedEvents.find((entry) => entry.event === "booking_engine_handoff");
  const guideDirectClick = observedEvents.find((entry) => entry.event === "guide_book_direct_click");
  assert.ok(guideDirectClick, "guide_book_direct_click event should be emitted");
  assert.ok(bookingHandoff, "booking_engine_handoff event should be emitted");
  assert.match(guideDirectClick.payload.link_url, /sv_guide_click_id=svg_/);
  assert.match(bookingHandoff.payload.link_url, /utm_source=mcp/);
  assert.match(bookingHandoff.payload.link_url, /utm_medium=ai-assistant/);
  assert.match(bookingHandoff.payload.link_url, /utm_campaign=direct-booking-proof/);
  assert.match(bookingHandoff.payload.link_url, /utm_content=search-availability/);
  assert.match(bookingHandoff.payload.link_url, /checkin=2026-06-01/);
  assert.match(bookingHandoff.payload.link_url, /checkout=2026-06-05/);
  assert.match(bookingHandoff.payload.link_url, /guests=4/);
  assert.match(bookingHandoff.payload.link_url, /sv_handoff_id=svh_/);
  assert.match(bookingHandoff.payload.link_url, /sv_session_id=svs_/);
  assert.match(bookingHandoff.payload.link_url, /sv_guide_click_id=svg_/);
  assert.match(bookingHandoff.payload.booking_handoff_id, /^svh_/);
  assert.match(bookingHandoff.payload.booking_session_id, /^svs_/);
  assert.match(bookingHandoff.payload.guide_direct_click_id, /^svg_/);
  assert.equal(bookingHandoff.payload.booking_listing_id, "206016");

  const popupEvents = smoke.simulatePopupEmailCaptureEvent();
  assert.deepEqual(
    popupEvents.map((entry) => entry.event),
    ["email_capture_submit"]
  );
});

test("inline email capture requires tagged Netlify success and never uses untagged embed fallback", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const fetchCalls = [];
  const warnings = [];
  const successClasses = [];
  const originalWarn = console.warn;
  const popupSuccess = {
    classList: {
      add(className) {
        successClasses.push(className);
      }
    }
  };
  const popupContent = { style: {} };
  const popupRoot = {
    querySelector(selector) {
      return selector === "[data-email-capture-success]" ? popupSuccess : null;
    }
  };
  const emailForm = {
    tagName: "FORM",
    textContent: "Email capture",
    dataset: {
      trackForm: "guide-email",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      guideSlug: "bradenton-vs-sarasota",
      formPlacement: "guide_conversion"
    },
    parentElement: {
      querySelector() {
        return null;
      }
    },
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-root]") return popupRoot;
      if (selector === "[data-email-capture-content]") return popupContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    crypto: {
      randomUUID() {
        return "capture-browser-1";
      }
    },
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      pathname: "/guides/bradenton-vs-sarasota/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {
      throw new Error("failed capture must not mark the popup as subscribed");
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.fetch = (url, options = {}) => {
    fetchCalls.push({
      url: String(url),
      method: options.method || "GET",
      mode: options.mode || null,
      body: options.body ? JSON.parse(options.body) : null
    });
    if (String(url) === "/.netlify/functions/guest-email-capture") {
      return Promise.reject(new Error("function unavailable"));
    }
    return Promise.resolve({ ok: true, status: 200 });
  };
  console.warn = function patchedWarn(label, payload) {
    warnings.push({ label, payload });
    if (label === "email_capture_failed") {
      settleCapture();
    }
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("capture failure was not reported")), 1000))
    ]);

    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(fetchCalls.length, 2);
    assert.equal(fetchCalls[0].url, "/.netlify/functions/guest-email-capture");
    assert.equal(fetchCalls[0].method, "POST");
    assert.equal(fetchCalls[0].body.submissionId, "capture-browser-1");
    assert.equal(fetchCalls[1].body.submissionId, fetchCalls[0].body.submissionId);
    assert.equal(fetchCalls[1].body.createdAt, fetchCalls[0].body.createdAt);
    assert.equal(
      fetchCalls.some((call) => /list-manage\.com/.test(call.url)),
      false,
      "untagged embed fallback must not run"
    );
    assert.ok(
      window.dataLayer.some((entry) => entry.event === "email_capture_failed"),
      "failed capture should emit a visible analytics event"
    );
    assert.deepEqual(warnings.map((entry) => entry.label), [
      "email_capture_failed",
      "email_capture_failed"
    ]);
    assert.deepEqual(successClasses, []);
    assert.equal(popupContent.style.display, undefined);
    assert.equal(emailForm.wasReset, undefined);
  } finally {
    console.warn = originalWarn;
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});

test("inline email capture does not treat untagged function responses as success", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const warnings = [];
  const successClasses = [];
  const originalWarn = console.warn;
  const popupSuccess = {
    classList: {
      add(className) {
        successClasses.push(className);
      }
    }
  };
  const popupContent = { style: {} };
  const popupRoot = {
    querySelector(selector) {
      return selector === "[data-email-capture-success]" ? popupSuccess : null;
    }
  };
  const emailForm = {
    tagName: "FORM",
    textContent: "Email capture",
    dataset: {
      trackForm: "guide-email",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      guideSlug: "bradenton-vs-sarasota",
      formPlacement: "guide_conversion"
    },
    parentElement: {
      querySelector() {
        return null;
      }
    },
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-root]") return popupRoot;
      if (selector === "[data-email-capture-content]") return popupContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      pathname: "/guides/bradenton-vs-sarasota/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {
      throw new Error("untagged capture must not mark the popup as subscribed");
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json() {
        return Promise.resolve({
          stored: true,
          tagged: false,
          deliveryMode: "legacy_form",
          reason: "marketing_api_unconfigured"
        });
      }
    });
  console.warn = function patchedWarn(label, payload) {
    warnings.push({ label, payload });
    if (label === "email_capture_failed") {
      settleCapture();
    }
  };

  try {
    require(trackingScriptPath);
    assert.equal(typeof listeners.DOMContentLoaded, "function");
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("capture failure was not reported")), 1000))
    ]);

    assert.ok(window.dataLayer.some((entry) => entry.event === "email_capture_failed"));
    assert.equal(warnings[0].label, "email_capture_failed");
    assert.equal(warnings[0].payload.reason, "marketing_api_unconfigured");
    assert.deepEqual(successClasses, []);
    assert.equal(popupContent.style.display, undefined);
    assert.equal(emailForm.wasReset, undefined);
  } finally {
    console.warn = originalWarn;
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});

test("guide inline email capture shows sibling success and clears in-flight after accept", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const fetchCalls = [];
  const successClasses = [];
  const storage = {};
  const guideSuccess = {
    classList: {
      add(className) {
        successClasses.push(className);
      }
    }
  };
  const guideContent = {
    style: {},
    querySelector() {
      return null;
    },
    parentElement: {
      querySelector(selector) {
        return selector === "[data-email-capture-success]" ? guideSuccess : null;
      }
    }
  };
  const emailForm = {
    tagName: "FORM",
    textContent: "Guide email capture",
    dataset: {
      trackForm: "email_capture",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      guideSlug: "bradenton-vs-sarasota",
      formPlacement: "inline"
    },
    parentElement: guideContent,
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-content]") return guideContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    crypto: {
      randomUUID() {
        return "capture-guide-accept-1";
      }
    },
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      pathname: "/guides/bradenton-vs-sarasota/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem(key, value) {
      storage[key] = value;
      settleCapture();
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.fetch = (url, options = {}) => {
    fetchCalls.push({
      url: String(url),
      method: options.method || "GET",
      body: options.body ? JSON.parse(options.body) : null
    });
    return Promise.resolve({
      ok: true,
      status: 202,
      json() {
        return Promise.resolve({
          tagged: true,
          captureState: "guest_capture_tag_applied"
        });
      }
    });
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("accepted capture did not settle")), 1000))
    ]);
    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(successClasses, ["is-visible", "show"]);
    assert.equal(guideContent.style.display, "none");
    assert.equal(emailForm.wasReset, true);
    assert.equal(storage.seascape_email_popup_shown, "subscribed");
    assert.equal(emailForm.dataset.guestCaptureInFlight, "false");

    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(fetchCalls.length, 2, "cleared in-flight lock must allow a later submit");
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});

test("inline email capture preserves server failure reasons on non-OK responses", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const warnings = [];
  const originalWarn = console.warn;
  const emailForm = {
    tagName: "FORM",
    textContent: "Email capture",
    dataset: {
      trackForm: "email_capture",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      guideSlug: "bradenton-vs-sarasota",
      formPlacement: "inline"
    },
    parentElement: {
      querySelector() {
        return null;
      }
    },
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest() {
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    crypto: {
      randomUUID() {
        return "capture-http-error-1";
      }
    },
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      pathname: "/guides/bradenton-vs-sarasota/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {
      throw new Error("failed capture must not mark the popup as subscribed");
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.fetch = () =>
    Promise.resolve({
      ok: false,
      status: 503,
      json() {
        return Promise.resolve({
          stored: false,
          tagged: false,
          captureState: "visible_failure",
          reason: "retry_persistence_failed"
        });
      }
    });
  console.warn = function patchedWarn(label, payload) {
    warnings.push({ label, payload });
    if (label === "email_capture_failed") {
      settleCapture();
    }
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("capture failure was not reported")), 1000))
    ]);

    const failedEvent = window.dataLayer.find((entry) => entry.event === "email_capture_failed");
    assert.ok(failedEvent, "failed capture should emit email_capture_failed");
    assert.equal(failedEvent.payload.capture_failure_reason, "retry_persistence_failed");
    assert.equal(warnings[0].label, "email_capture_failed");
    assert.equal(warnings[0].payload.reason, "retry_persistence_failed");
    assert.equal(emailForm.wasReset, undefined);
  } finally {
    console.warn = originalWarn;
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});


test("retry_queued shows pending state instead of completed success", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const successClasses = [];
  const pendingClasses = [];
  const storage = {};
  const guideSuccess = {
    classList: {
      add(className) {
        successClasses.push(className);
      },
      remove() {}
    },
    hidden: true
  };
  const guidePending = {
    classList: {
      add(className) {
        pendingClasses.push(className);
      },
      remove() {}
    },
    hidden: true
  };
  const guideContent = {
    style: {},
    classList: { add() {}, remove() {} },
    hidden: false,
    parentElement: {
      querySelector(selector) {
        if (selector === "[data-email-capture-success]") return guideSuccess;
        if (selector === "[data-email-capture-pending]") return guidePending;
        if (selector === "[data-email-capture-content]") return guideContent;
        return null;
      }
    }
  };
  const emailForm = {
    tagName: "FORM",
    textContent: "Guide email capture",
    dataset: {
      trackForm: "email_capture",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      formPlacement: "inline"
    },
    parentElement: guideContent,
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-content]") return guideContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    crypto: {
      randomUUID() {
        return "capture-pending-1";
      }
    },
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      pathname: "/guides/bradenton-vs-sarasota/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.localStorage = {
    setItem(key, value) {
      storage[key] = value;
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 202,
      json() {
        return Promise.resolve({
          tagged: false,
          captureState: "retry_queued",
          reason: "mailchimp_tags_sync_failed"
        }).then((data) => {
          settleCapture();
          return data;
        });
      }
    });

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("pending capture did not settle")), 1000))
    ]);
    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(successClasses, []);
    assert.deepEqual(pendingClasses, ["is-visible", "show"]);
    assert.equal(guideContent.style.display, "none");
    assert.equal(guidePending.hidden, false);
    assert.equal(emailForm.wasReset, undefined);
    assert.equal(storage.seascape_email_popup_shown, undefined);
    assert.equal(emailForm.dataset.guestCaptureInFlight, "false");
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});

test("visible failure shows accessible inline retry guidance", async () => {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const warnings = [];
  const originalWarn = console.warn;
  const captureError = {
    classList: {
      add(className) {
        this.added = (this.added || []).concat(className);
      },
      remove() {}
    },
    hidden: true
  };
  const captureContent = {
    style: { display: "none" },
    classList: { add() {}, remove() {} },
    hidden: false
  };
  const emailForm = {
    tagName: "FORM",
    textContent: "Email capture",
    dataset: {
      trackForm: "email_capture",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      formPlacement: "popup"
    },
    parentElement: {
      querySelector(selector) {
        if (selector === "[data-email-capture-error]") return captureError;
        if (selector === "[data-email-capture-content]") return captureContent;
        return null;
      }
    },
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-content]") return captureContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  global.window = {
    dataLayer: [],
    crypto: {
      randomUUID() {
        return "capture-visible-failure-1";
      }
    },
    location: {
      href: "http://localhost/",
      pathname: "/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {
      throw new Error("failed capture must not mark the popup as subscribed");
    }
  };
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  global.fetch = () =>
    Promise.resolve({
      ok: false,
      status: 502,
      json() {
        return Promise.resolve({
          stored: false,
          tagged: false,
          captureState: "visible_failure",
          reason: "marketing_api_unconfigured"
        });
      }
    });
  console.warn = function patchedWarn(label, payload) {
    warnings.push({ label, payload });
    if (label === "email_capture_failed") {
      settleCapture();
    }
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: emailForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("capture failure was not reported")), 1000))
    ]);

    assert.equal(captureError.hidden, false);
    assert.deepEqual(captureError.classList.added, ["is-visible", "show"]);
    assert.equal(captureContent.style.display, "");
    assert.equal(emailForm.wasReset, undefined);
    assert.equal(warnings[0].payload.reason, "marketing_api_unconfigured");
  } finally {
    console.warn = originalWarn;
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});

test("conversion tracking scrubs obvious PII before analytics payloads reach dataLayer", () => {
  const smoke = loadSmokeModule();
  const events = smoke.simulateSanitizedAnalyticsPayload({
    page_slug: "property-management",
    source_page_slug: "owner-review",
    email: "owner@example.com",
    phone: "941-555-1212",
    name: "Owner Name",
    first_name: "Owner",
    last_name: "Guest",
    what_feels_off: "The numbers feel off",
    property_address: "123 Palm Street",
    concerns: "Please call me about this listing.",
    link_url: "https://book.seascape-vacations.com/listings/206016?utm_source=google&utm_content=owner%40example.com&phone=9415551212&checkin=2026-06-01&guests=4&setup_intent=seti_123&setup_intent_client_secret=seti_secret_123&payment_intent=pi_123&payment_intent_client_secret=pi_secret_123&client_secret=secret_123&redirect_status=succeeded"
  });
  const event = events.find((entry) => entry.event === "owner_form_submit");

  assert.ok(event, "owner_form_submit should still be emitted");
  assert.equal(event.payload.page_slug, "property-management");
  assert.equal(event.payload.source_page_slug, "owner-review");
  assert.equal(event.payload.transport_type, "beacon");
  assert.match(event.payload.link_url, /utm_source=google/);
  assert.match(event.payload.link_url, /checkin=2026-06-01/);
  assert.match(event.payload.link_url, /guests=4/);
  assert.doesNotMatch(event.payload.link_url, /owner%40example\.com|owner@example\.com|9415551212|phone=|setup_intent|setup_intent_client_secret|payment_intent|payment_intent_client_secret|client_secret|redirect_status/i);
  assert.doesNotMatch(JSON.stringify(event.payload), /owner@example\.com|941-555-1212|Owner Name|123 Palm Street|The numbers feel off|Please call me/i);
});

test("homepage and shared popup partial use the tracked email capture path", () => {
  const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
  const homepageScript = fs.readFileSync(path.join(projectRoot, "src", "assets", "js", "homepage.js"), "utf8");
  const popupPartial = fs.readFileSync(path.join(projectRoot, "src", "_includes", "partials", "email-popup.njk"), "utf8");
  const trackingScript = fs.readFileSync(path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"), "utf8");
  const homepageContract = buildRouteContract({
    html: homepage,
    routePath: "/",
    sourcePath: "src/index.njk"
  });
  const popupContract = buildRouteContract({
    html: popupPartial,
    routePath: "/partials/email-popup/",
    sourcePath: "src/_includes/partials/email-popup.njk"
  });

  for (const source of [homepage, popupPartial]) {
    assert.match(source, /data-track-form="email_capture"/);
    assert.match(source, /data-inline-email-capture="true"/);
    assert.match(source, /data-email-capture-success/);
    assert.match(source, /data-email-capture-pending/);
    assert.match(source, /data-email-capture-error/);
    assert.doesNotMatch(source, /onsubmit="handleEmailSubmit\(event\)"/);
  }

  assert.ok(homepageContract.trackedEvents.includes("email_capture_submit"));
  assert.ok(popupContract.trackedEvents.includes("email_capture_submit"));
  assert.match(homepage, /\/assets\/js\/homepage\.js/);
  assert.match(homepageScript, /\/assets\/js\/conversion-tracking\.js/);
  assert.match(popupPartial, /\/assets\/js\/conversion-tracking\.js/);
  assert.match(trackingScript, /__seascapeConversionTrackingLoaded/);
});

test("SAVE50 popup success state stays honest for repeat subscribers and delivery failures", async () => {
  const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
  const popupPartial = fs.readFileSync(path.join(projectRoot, "src", "_includes", "partials", "email-popup.njk"), "utf8");
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  const listeners = {};
  const successClasses = [];
  const popupContent = { style: {} };
  const popupSuccess = {
    classList: {
      add(className) {
        successClasses.push(className);
      }
    }
  };
  const popupRoot = {
    querySelector(selector) {
      return selector === "[data-email-capture-success]" ? popupSuccess : null;
    }
  };
  const popupForm = {
    tagName: "FORM",
    textContent: "Popup email capture",
    dataset: {
      trackForm: "email_capture",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      formPlacement: "popup"
    },
    parentElement: {
      querySelector() {
        return null;
      }
    },
    matches(selector) {
      return selector === "form[data-track-form]";
    },
    closest(selector) {
      if (selector === "[data-email-capture-root]") return popupRoot;
      if (selector === "[data-email-capture-content]") return popupContent;
      return null;
    },
    getAttribute() {
      return "";
    },
    reset() {
      this.wasReset = true;
    }
  };

  for (const source of [homepage, popupPartial]) {
    assert.doesNotMatch(source, /We also sent it to your email so you won't lose it\./);
    assert.match(source, /Use code <strong>SAVE50<\/strong> on your first direct booking of 3 nights or more\. Enter it on the secure booking page, and save this code before you browse\./);
    assert.match(source, /data-email-capture-browse/);
    assert.match(source, /href="\/properties\/\?promo=save50"/);
  }

  delete require.cache[require.resolve(trackingScriptPath)];
  global.window = {
    dataLayer: [],
    location: {
      href: "http://localhost/",
      pathname: "/",
      search: ""
    }
  };
  global.document = {
    readyState: "loading",
    referrer: "",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {
      throw new Error("delivery failure should not mark the popup as subscribed");
    }
  };
  let settleCapture;
  const captureSettled = new Promise((resolve) => {
    settleCapture = resolve;
  });
  const originalWarn = console.warn;
  global.fetch = () => Promise.reject(new Error("network down"));
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "repeat@example.com";
      if (field === "name") return "Repeat Guest";
      return "";
    }
  };
  console.warn = function patchedWarn(label, payload) {
    if (label === "email_capture_failed") {
      settleCapture();
    }
    if (typeof originalWarn === "function") {
      originalWarn(label, payload);
    }
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: popupForm,
      preventDefault() {}
    });

    await Promise.race([
      captureSettled,
      new Promise((_, reject) => setTimeout(() => reject(new Error("capture failure was not reported")), 1000))
    ]);

    assert.deepEqual(successClasses, []);
    assert.equal(popupContent.style.display, undefined);
    assert.equal(popupForm.wasReset, undefined);
  } finally {
    console.warn = originalWarn;
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});
