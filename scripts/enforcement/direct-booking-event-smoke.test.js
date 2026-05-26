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

test("direct-booking event smoke runs inside the release safety flow", () => {
  const releaseGate = fs.readFileSync(path.join(projectRoot, "scripts", "enforcement", "verify-release.js"), "utf8");

  assert.match(releaseGate, /run\("npm", \["run", "verify:direct-booking-events"\]\)/);
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
  assert.ok(bookingHandoff, "booking_engine_handoff event should be emitted");
  assert.match(bookingHandoff.payload.link_url, /utm_source=mcp/);
  assert.match(bookingHandoff.payload.link_url, /utm_medium=ai-assistant/);
  assert.match(bookingHandoff.payload.link_url, /utm_campaign=direct-booking-proof/);
  assert.match(bookingHandoff.payload.link_url, /utm_content=search-availability/);
  assert.match(bookingHandoff.payload.link_url, /checkin=2026-06-01/);
  assert.match(bookingHandoff.payload.link_url, /checkout=2026-06-05/);
  assert.match(bookingHandoff.payload.link_url, /guests=4/);

  const popupEvents = smoke.simulatePopupEmailCaptureEvent();
  assert.deepEqual(
    popupEvents.map((entry) => entry.event),
    ["email_capture_submit"]
  );
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
    assert.match(source, /Use code <strong>SAVE50<\/strong> at checkout to save \$50 on your stay \(3\+ nights\)\./);
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
  global.fetch = () => Promise.reject(new Error("network down"));
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "repeat@example.com";
      if (field === "name") return "Repeat Guest";
      return "";
    }
  };

  try {
    require(trackingScriptPath);
    listeners.DOMContentLoaded();
    listeners.submit({
      target: popupForm,
      preventDefault() {}
    });

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    assert.deepEqual(successClasses, []);
    assert.equal(popupContent.style.display, undefined);
    assert.equal(popupForm.wasReset, undefined);
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
});
