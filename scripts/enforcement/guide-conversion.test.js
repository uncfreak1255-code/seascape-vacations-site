const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

const guideFiles = [
  {
    slug: "bradenton-vs-sarasota",
    file: path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota.html"),
    requiredLinks: [
      "/stays/bradenton-vacation-rentals-near-beaches/",
      "/stays/siesta-key-area-vacation-rentals/"
    ]
  },
  {
    slug: "anna-maria-island-vs-siesta-key",
    file: path.join(projectRoot, "src", "guides", "anna-maria-island-vs-siesta-key.html"),
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/vacation-rentals-near-siesta-key-beach/"
    ]
  },
  {
    slug: "booking-direct-vacation-rentals",
    file: path.join(projectRoot, "src", "guides", "booking-direct-vacation-rentals.html"),
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/bradenton-vacation-rentals-near-beaches/"
    ]
  },
  {
    slug: "anna-maria-island-vacation-cost",
    file: path.join(projectRoot, "src", "guides", "anna-maria-island-vacation-cost.html"),
    requiredLinks: [
      "/stays/affordable-vacation-rentals-florida-gulf-coast/",
      "/stays/extended-stay-vacation-rentals-florida/"
    ]
  },
  {
    slug: "best-time-visit-anna-maria-island",
    file: path.join(projectRoot, "src", "guides", "best-time-visit-anna-maria-island.html"),
    requiredLinks: [
      "/stays/winter-vacation-rentals-florida-gulf-coast/",
      "/stays/summer-vacation-rentals-florida-gulf-coast/"
    ]
  }
];

function loadConversionTrackingWithStubs() {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];

  global.window = {
    dataLayer: [],
    location: {
      href: "http://localhost/guides/bradenton-vs-sarasota/",
      assign(nextHref) {
        this.href = nextHref;
      }
    }
  };
  global.document = {
    readyState: "loading",
    addEventListener() {},
    querySelectorAll() {
      return [];
    }
  };
  global.localStorage = {
    setItem() {}
  };
  global.fetch = () => Promise.resolve();
  global.FormData = class FormDataStub {
    get() {
      return "";
    }
  };

  require(trackingScriptPath);
  const api = global.window.SeascapeConversionTracking;

  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.fetch;
  delete global.FormData;

  return api;
}

test("shared guide conversion kit exposes savings, stay, repeat-stay, and email capture modules", () => {
  const partialPath = path.join(projectRoot, "src", "_includes", "partials", "guide-conversion-kit.njk");
  assert.equal(fs.existsSync(partialPath), true, "guide conversion partial should exist");

  const partial = fs.readFileSync(partialPath, "utf8");
  for (const marker of [
    "guide-conversion-shell",
    "guide-book-direct-savings",
    "guide-stay-module",
    "guide-email-capture-form",
    "guide-repeat-stay-links",
    'data-track-event=\"guide_stay_click\"',
    'data-track-event=\"guide_book_direct_click\"',
    'data-track-event=\"booking_engine_handoff\"',
    'data-email-capture-form',
    "repeat-guest offers"
  ]) {
    assert.equal(partial.includes(marker), true, `guide conversion kit missing ${marker}`);
  }
});

test("conversion tracking supports both guide and owner measurement events", () => {
  const analyticsPartial = fs.readFileSync(
    path.join(projectRoot, "src", "_includes", "partials", "analytics-ga4.njk"),
    "utf8"
  );
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");

  assert.equal(analyticsPartial.includes("window.seascapeTrackEvent"), true);
  assert.equal(fs.existsSync(trackingScriptPath), true, "shared conversion tracking script should exist");

  const trackingScript = fs.readFileSync(trackingScriptPath, "utf8");
  for (const eventName of [
    "owner_primary_cta_click",
    "owner_phone_click",
    "owner_form_start",
    "owner_form_submit",
    "guide_stay_click",
    "guide_book_direct_click",
    "email_capture_submit",
    "booking_engine_handoff"
  ]) {
    assert.equal(trackingScript.includes(eventName), true, `tracking script missing ${eventName}`);
  }
});

test("shared conversion tracking exposes navigation-safe tracked-link helpers", () => {
  const api = loadConversionTrackingWithStubs();

  assert.equal(typeof api.trackEvent, "function");
  assert.equal(typeof api.shouldDelayTrackedNavigation, "function");
  assert.equal(typeof api.continueTrackedNavigation, "function");

  const sameTabGuideLink = {
    tagName: "A",
    href: "/stays/bradenton-vacation-rentals-near-beaches/",
    target: "",
    hasAttribute(name) {
      return name === "href";
    },
    getAttribute(name) {
      if (name === "href") return this.href;
      if (name === "target") return this.target;
      return null;
    }
  };

  const hashOnlyLink = {
    tagName: "A",
    href: "#owner-cta",
    target: "",
    hasAttribute(name) {
      return name === "href";
    },
    getAttribute(name) {
      if (name === "href") return this.href;
      if (name === "target") return this.target;
      return null;
    }
  };

  assert.equal(
    api.shouldDelayTrackedNavigation(sameTabGuideLink, { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }),
    true
  );
  assert.equal(
    api.shouldDelayTrackedNavigation(hashOnlyLink, { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }),
    false
  );
  assert.equal(
    api.shouldDelayTrackedNavigation(sameTabGuideLink, { button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }),
    false
  );
});

test("priority guides use the shared conversion kit with page-specific stay links", () => {
  for (const guide of guideFiles) {
    const source = fs.readFileSync(guide.file, "utf8");
    assert.equal(source.includes('from "partials/guide-conversion-kit.njk" import guideConversionKit'), true);
    assert.equal(source.includes("guideConversionKit({"), true);
    assert.equal(source.includes(`guideSlug: "${guide.slug}"`), true, `${guide.slug} should pass its slug`);
    assert.equal(source.includes('{% include "partials/analytics-ga4.njk" %}'), true, `${guide.slug} should load analytics`);

    for (const href of guide.requiredLinks) {
      assert.equal(source.includes(href), true, `${guide.slug} should include ${href}`);
    }
  }
});

test("priority guides do not keep the legacy popup email capture once the shared inline form exists", () => {
  for (const guide of guideFiles) {
    const source = fs.readFileSync(guide.file, "utf8");
    for (const forbiddenMarker of ['id="email-popup"', "showEmailPopup(", "handleEmailSubmit("]) {
      assert.equal(source.includes(forbiddenMarker), false, `${guide.slug} should not keep ${forbiddenMarker}`);
    }
  }
});
