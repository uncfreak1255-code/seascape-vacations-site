const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..", "..");
const seoPages = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src", "_data", "seoPages.json"), "utf8")
);

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
      "/stays/anna-maria-island-beachfront-rentals/",
      "/stays/siesta-key-area-vacation-rentals/"
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
    slug: "best-vacation-rental-companies-ami",
    file: path.join(projectRoot, "src", "guides", "best-vacation-rental-companies-ami.html"),
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/book-direct-anna-maria-island/"
    ]
  },
  {
    slug: "best-time-visit-anna-maria-island",
    file: path.join(projectRoot, "src", "guides", "best-time-visit-anna-maria-island.html"),
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/anna-maria-island-beachfront-rentals/"
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

function loadConversionTrackingFallbackHarness() {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];

  global.window = {
    dataLayer: [],
    location: {
      href: "http://localhost/property-management/",
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

  return {
    api: global.window.SeascapeConversionTracking,
    window: global.window,
    cleanup() {
      delete require.cache[require.resolve(trackingScriptPath)];
      delete global.window;
      delete global.document;
      delete global.localStorage;
      delete global.fetch;
      delete global.FormData;
    }
  };
}

function extractAnalyticsInlineScript() {
  const analyticsPartial = fs.readFileSync(
    path.join(projectRoot, "src", "_includes", "partials", "analytics-ga4.njk"),
    "utf8"
  );
  const inlineScriptMatch = analyticsPartial.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
  assert.notEqual(inlineScriptMatch, null, "analytics partial should expose an inline tracker script");
  return inlineScriptMatch[1].replaceAll("{{ site.analytics.ga4MeasurementId }}", "G-TEST123");
}

function loadTrackedNavigationHarness(options = {}) {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];

  const originals = {};
  for (const key of [
    "window",
    "document",
    "localStorage",
    "fetch",
    "FormData",
    "setTimeout",
    "clearTimeout",
    "location",
    "dataLayer",
    "gtag",
    "seascapeTrackEvent",
    "SeascapeConversionTracking"
  ]) {
    originals[key] = Object.prototype.hasOwnProperty.call(global, key) ? global[key] : undefined;
  }

  const listeners = new Map();
  const timers = [];
  const navigationCalls = [];

  global.window = global;
  global.location = {
    href: "http://localhost/property-management/",
    assign(nextHref) {
      navigationCalls.push(nextHref);
      this.href = nextHref;
    }
  };
  global.document = {
    readyState: "complete",
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
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
  global.setTimeout = (callback, delay) => {
    timers.push({ callback, delay, cleared: false });
    return timers.length - 1;
  };
  global.clearTimeout = (timerId) => {
    if (timers[timerId]) timers[timerId].cleared = true;
  };
  global.dataLayer = [];

  if (options.loadAnalytics !== false) {
    vm.runInThisContext(extractAnalyticsInlineScript(), {
      filename: path.join(projectRoot, "src", "_includes", "partials", "analytics-ga4.inline.test.js")
    });
  }

  require(trackingScriptPath);

  return {
    navigationCalls,
    timers,
    getClickHandler() {
      const clickHandlers = listeners.get("click") || [];
      assert.equal(clickHandlers.length > 0, true, "conversion tracking should bind a click listener");
      return clickHandlers[0];
    },
    findGtagEvent(eventName) {
      return global.dataLayer.find((entry) => {
        if (!entry || typeof entry.length !== "number") return false;
        const call = Array.from(entry);
        return call[0] === "event" && call[1] === eventName;
      });
    },
    cleanup() {
      delete require.cache[require.resolve(trackingScriptPath)];
      for (const key of Object.keys(originals)) {
        if (originals[key] === undefined) {
          delete global[key];
          continue;
        }
        global[key] = originals[key];
      }
    }
  };
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

test("tracked owner clicks wait for analytics handoff before navigation resumes", () => {
  const harness = loadTrackedNavigationHarness();
  try {
    const trackedLink = {
      tagName: "A",
      href: "/owners/get-started/",
      target: "",
      dataset: {
        trackEvent: "owner_primary_cta_click",
        pageSlug: "property-management",
        placement: "hero",
        trackLabel: "Get started"
      },
      textContent: "Get started",
      hasAttribute(name) {
        return name === "href";
      },
      getAttribute(name) {
        if (name === "href") return this.href;
        if (name === "target") return this.target;
        return null;
      }
    };
    const clickEvent = {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      target: {
        closest(selector) {
          return selector === "[data-track-event]" ? trackedLink : null;
        }
      }
    };

    harness.getClickHandler()(clickEvent);

    assert.equal(clickEvent.defaultPrevented, true, "tracked navigations should pause page exit");
    assert.deepEqual(harness.navigationCalls, [], "navigation should not resume before analytics handoff");
    assert.equal(harness.timers.length, 1, "tracked navigations should arm a delivery timeout");

    const eventCall = harness.findGtagEvent("owner_primary_cta_click");
    assert.notEqual(eventCall, undefined, "same click should hand off the owner CTA event to GA");

    const [, , payload] = Array.from(eventCall);
    assert.equal(payload.page_slug, "property-management");
    assert.equal(payload.placement, "hero");
    assert.equal(payload.transport_type, "beacon");
    assert.equal(payload.event_timeout, 800);
    assert.equal(typeof payload.event_callback, "function");

    payload.event_callback();

    assert.deepEqual(
      harness.navigationCalls,
      ["/owners/get-started/"],
      "navigation should resume once the analytics callback confirms handoff"
    );

    harness.timers[0].callback();
    assert.deepEqual(harness.navigationCalls, ["/owners/get-started/"], "callback and timeout should not double-navigate");
  } finally {
    harness.cleanup();
  }
});

test("tracked navigations fall back to a dataLayer handoff instead of silently dropping events", () => {
  const harness = loadConversionTrackingFallbackHarness();
  try {
    const trackedLink = {
      tagName: "A",
      href: "/owners/get-started/",
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
    const navigationCalls = [];
    let capturedBeforeNavigation = false;
    harness.window.location.assign = (nextHref) => {
      capturedBeforeNavigation = harness.window.dataLayer.some((entry) => entry && entry.event === "owner_primary_cta_click");
      navigationCalls.push(nextHref);
      harness.window.location.href = nextHref;
    };

    harness.api.trackEvent(
      "owner_primary_cta_click",
      {
        page_slug: "property-management",
        placement: "hero",
        link_text: "Get started",
        link_url: "/owners/get-started/"
      },
      {
        onComplete() {
          harness.api.continueTrackedNavigation(trackedLink);
        }
      }
    );

    assert.equal(capturedBeforeNavigation, true, "fallback path should capture the event before navigation resumes");
    assert.equal(harness.window.dataLayer.length, 1, "fallback path should persist a single event payload");
    assert.equal(harness.window.dataLayer[0].event, "owner_primary_cta_click");
    assert.equal(harness.window.dataLayer[0].payload.page_slug, "property-management");
    assert.equal(harness.window.dataLayer[0].payload.placement, "hero");
    assert.equal(harness.window.dataLayer[0].payload.link_text, "Get started");
    assert.equal(harness.window.dataLayer[0].payload.link_url, "/owners/get-started/");
    assert.equal(harness.window.dataLayer[0].payload.transport_type, "beacon");
    assert.equal(harness.window.dataLayer[0].payload.event_timeout, 800);
    assert.equal(typeof harness.window.dataLayer[0].payload.event_callback, "function");
    assert.deepEqual(
      navigationCalls,
      ["/owners/get-started/"],
      "fallback handoff should resume navigation after the payload is captured"
    );
  } finally {
    harness.cleanup();
  }
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

test("priority guide stay links resolve to real vacationer SEO pages", () => {
  for (const guide of guideFiles) {
    for (const href of guide.requiredLinks) {
      const match = href.match(/^\/stays\/([^/]+)\/$/);
      assert.notEqual(match, null, `${guide.slug} stay link should use a canonical /stays/<slug>/ route`);

      const staySlug = match[1];
      const matchingSeoPage = (seoPages.vacationer || []).find((page) => page.slug === staySlug);
      assert.notEqual(
        matchingSeoPage,
        undefined,
        `${guide.slug} stay link ${href} should map to a real vacationer entry in seoPages.json`
      );
    }
  }
});

test("week 2 booking guides use named authorship and retire legacy conversion clutter", () => {
  const weekTwoGuides = [
    {
      slug: "best-vacation-rental-companies-ami",
      file: path.join(projectRoot, "src", "guides", "best-vacation-rental-companies-ami.html"),
      requiredMarkers: [
        '<meta name="author" content="Sawyer Beck">',
        '"@type": "Person"',
        '"name": "Sawyer Beck"',
        'data-guide-author="sawyer-beck"',
        "How We Ranked These Companies",
        "If You Are Booking a Stay",
        "If You Own on Anna Maria Island"
      ],
      forbiddenMarkers: [
        'id="email-popup"',
        "showEmailPopup",
        "handleEmailSubmit",
        "guide-related-stays",
        "/stays/luxury-vacation-rentals-sarasota/"
      ]
    },
    {
      slug: "booking-direct-vacation-rentals",
      file: path.join(projectRoot, "src", "guides", "booking-direct-vacation-rentals.html"),
      requiredMarkers: [
        '<meta name="author" content="Sawyer Beck">',
        '"@type":"Person"',
        '"name":"Sawyer Beck"',
        'data-guide-author="sawyer-beck"'
      ],
      forbiddenMarkers: [
        "guide-related-stays",
        "/stays/last-minute-vacation-rentals-florida/"
      ]
    },
    {
      slug: "anna-maria-island-vacation-cost",
      file: path.join(projectRoot, "src", "guides", "anna-maria-island-vacation-cost.html"),
      requiredMarkers: [
        '<title>How Much Does a Vacation to Anna Maria Island Cost? (2026 Budget Guide)</title>',
        '<meta name="author" content="Sawyer Beck">',
        '"@type": "Person"',
        '"name": "Sawyer Beck"',
        'data-guide-author="sawyer-beck"'
      ],
      forbiddenMarkers: [
        "guide-related-stays",
        "/property-management/vacation-rental-pricing-strategy/"
      ]
    }
  ];

  for (const guide of weekTwoGuides) {
    const source = fs.readFileSync(guide.file, "utf8");

    for (const marker of guide.requiredMarkers) {
      assert.equal(source.includes(marker), true, `${guide.slug} should include ${marker}`);
    }

    for (const marker of guide.forbiddenMarkers) {
      assert.equal(source.includes(marker), false, `${guide.slug} should not keep ${marker}`);
    }
  }
});

test("winner guides surface the shared conversion kit before late-stage related content", () => {
  const winnerGuides = [
    {
      slug: "bradenton-vs-sarasota",
      file: path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota.html"),
      mustAppearBefore: ['<section id="faq"', '<div class="related-guides"'],
      forbiddenMarkers: ["guide-related-stays", "Gulf Coast Vacation Rentals", "Downtown Sarasota Rentals"]
    },
    {
      slug: "anna-maria-island-vs-siesta-key",
      file: path.join(projectRoot, "src", "guides", "anna-maria-island-vs-siesta-key.html"),
      mustAppearBefore: ['<div class="related-guides"', '<div class="container" style="padding-bottom:20px;">'],
      forbiddenMarkers: ["/stays/vacation-rentals-near-siesta-key-beach/"]
    }
  ];

  for (const guide of winnerGuides) {
    const source = fs.readFileSync(guide.file, "utf8");
    const conversionIndex = source.indexOf("{{ guideConversionKit({");
    assert.notEqual(conversionIndex, -1, `${guide.slug} should include the shared conversion kit`);

    for (const marker of guide.mustAppearBefore) {
      const markerIndex = source.indexOf(marker);
      assert.notEqual(markerIndex, -1, `${guide.slug} should still include ${marker}`);
      assert.equal(
        conversionIndex < markerIndex,
        true,
        `${guide.slug} should place the shared conversion kit before ${marker}`
      );
    }

    for (const forbiddenMarker of guide.forbiddenMarkers) {
      assert.equal(
        source.includes(forbiddenMarker),
        false,
        `${guide.slug} should not keep ${forbiddenMarker} once the shared conversion kit is the primary booking handoff`
      );
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
