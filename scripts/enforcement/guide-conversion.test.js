const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

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

const winnerGuideEarlyTransferLinks = [
  {
    slug: "bradenton-vs-sarasota",
    file: path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota.html"),
    beforeMarker: "<h2>If You Are Vacationing, Not Moving</h2>",
    requiredLinks: [
      "/stays/bradenton-vacation-rentals-near-beaches/",
      "/stays/siesta-key-area-vacation-rentals/"
    ]
  },
  {
    slug: "anna-maria-island-vs-siesta-key",
    file: path.join(projectRoot, "src", "guides", "anna-maria-island-vs-siesta-key.html"),
    beforeMarker: "<h2>Quick Comparison at a Glance</h2>",
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/siesta-key-area-vacation-rentals/"
    ]
  },
  {
    slug: "best-time-visit-anna-maria-island",
    file: path.join(projectRoot, "src", "guides", "best-time-visit-anna-maria-island.html"),
    beforeMarker: "<h2>Peak Season: December Through April</h2>",
    requiredLinks: [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/anna-maria-island-beachfront-rentals/"
    ]
  }
];

function withConversionTrackingStubs(callback) {
  const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};

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
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
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

  require(trackingScriptPath);
  const api = global.window.SeascapeConversionTracking;

  try {
    return callback({ api, listeners, window: global.window });
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
}

function loadConversionTrackingWithStubs() {
  return withConversionTrackingStubs(({ api }) => api);
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
    'data-email-capture-content',
    'data-utility-moment=\"{{ config.utilityMoment or \'guide_direct_booking_help\' }}\"',
    'data-utility-source-label=\"{{ config.utilitySourceLabel or \'guide_conversion_direct_booking_list\' }}\"',
    'data-requested-value=\"{{ config.requestedValue or \'direct_booking_savings_and_local_stay_ideas\' }}\"',
    'data-consent-basis=\"{{ config.consentBasis or \'guest_requested_email_followup\' }}\"',
    'data-save50-state=\"cold\"',
    'data-save50-state=\"warm\"',
    "save-module",
    "save-chip",
    "save-copy",
    "save-sticky",
    "Direct Booking List",
    "Join The Direct-Booking List",
    "email_capture_submit",
    'campaign !== "guest_social_proof"',
    "Your <em>$50 off</em> is waiting on this trip"
  ]) {
    assert.equal(partial.includes(marker), true, `guide conversion kit missing ${marker}`);
  }

  for (const staleOfferLanguage of ["Stay Alerts", "date alerts", "matching homes", "We will send", "check your inbox", "sent to your email"]) {
    assert.equal(
      partial.includes(staleOfferLanguage),
      false,
      `guide conversion kit should not promise ${staleOfferLanguage}`
    );
  }
});

test("guest-social-proof guide state renders a value-led SAVE50 redemption module", () => {
  const partialPath = path.join(projectRoot, "src", "_includes", "partials", "guide-conversion-kit.njk");
  const partial = fs.readFileSync(partialPath, "utf8");

  for (const token of ["SAVE50", "first direct booking", "3 nights or more"]) {
    assert.equal(partial.includes(token), true, `SAVE50 redemption module missing ${token}`);
  }

  for (const bannedDeliveryCopy of ["we just emailed you", "check your inbox", "sent to your email", "on its way"]) {
    assert.equal(
      partial.toLowerCase().includes(bannedDeliveryCopy),
      false,
      `SAVE50 redemption module should not imply new delivery: ${bannedDeliveryCopy}`
    );
  }

  assert.equal(partial.includes("Welcome back &middot; code saved"), true);
  assert.equal(partial.includes('aria-label=\"Copy code SAVE50 to clipboard\"'), true);
  assert.equal(partial.includes("Copied"), true);
  assert.equal(partial.includes("save50-live"), true);
  assert.equal((partial.match(/\bsave-cta\b/g) || []).length, 1, "warm rail should define exactly one filled SAVE50 CTA");
  assert.equal(partial.includes('class=\"guide-cta-row\" data-save50-state=\"cold\"'), true);
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

test("guide email capture carries utility context for reviewed agent-data proof", () => {
  const observed = withConversionTrackingStubs(({ listeners, window }) => {
    const form = {
      tagName: "FORM",
      textContent: "Guide email capture",
      dataset: {
        trackForm: "email_capture",
        formSubmitEvent: "email_capture_submit",
        inlineEmailCapture: "true",
        guideSlug: "best-time-visit-anna-maria-island",
        formPlacement: "inline",
        utilityMoment: "guide_direct_booking_help",
        utilitySourceLabel: "guide_conversion_direct_booking_list",
        requestedValue: "direct_booking_savings_and_local_stay_ideas",
        guestIntent: "planning_gulf_coast_stay",
        deliveryChannel: "email",
        consentBasis: "guest_requested_email_followup"
      },
      parentElement: {
        querySelector() {
          return null;
        }
      },
      matches(selector) {
        return selector === "form[data-track-form]";
      },
      getAttribute() {
        return "";
      },
      reset() {}
    };

    listeners.DOMContentLoaded();
    listeners.submit({
      target: form,
      preventDefault() {}
    });

    return window.dataLayer[0];
  });

  assert.equal(observed.event, "email_capture_submit");
  assert.equal(observed.payload.utility_moment, "guide_direct_booking_help");
  assert.equal(observed.payload.utility_source_label, "guide_conversion_direct_booking_list");
  assert.equal(observed.payload.requested_value, "direct_booking_savings_and_local_stay_ideas");
  assert.equal(observed.payload.guest_intent, "planning_gulf_coast_stay");
  assert.equal(observed.payload.delivery_channel, "email");
  assert.equal(observed.payload.consent_basis, "guest_requested_email_followup");
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

test("booking-engine handoff click emits the GA4 event with the target booking URL", () => {
  const observed = withConversionTrackingStubs(({ listeners, window }) => {
    assert.equal(typeof listeners.DOMContentLoaded, "function", "tracking script should wait for DOM ready");
    listeners.DOMContentLoaded();
    assert.equal(typeof listeners.click, "function", "tracking script should bind click tracking");

    const bookingLink = {
      tagName: "A",
      href: "https://book.seascape-vacations.com",
      target: "_blank",
      textContent: "Open Direct Availability",
      dataset: {
        trackEvent: "booking_engine_handoff",
        guideSlug: "best-time-visit-anna-maria-island",
        trackLabel: "Open Direct Availability"
      },
      hasAttribute() {
        return false;
      },
      getAttribute(name) {
        if (name === "href") return this.href;
        if (name === "target") return this.target;
        return null;
      }
    };

    listeners.click({
      target: {
        closest(selector) {
          return selector === "[data-track-event]" ? bookingLink : null;
        }
      },
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false
    });

    return window.dataLayer[0];
  });

  assert.equal(observed.event, "booking_engine_handoff");
  assert.equal(observed.payload.guide_slug, "best-time-visit-anna-maria-island");
  assert.equal(
    observed.payload.link_url,
    "https://book.seascape-vacations.com/?utm_content=best-time-visit-anna-maria-island"
  );
  assert.equal(observed.payload.link_text, "Open Direct Availability");
});

test("first tracked navigation click is delivered before same-tab navigation continues", () => {
  const observed = withConversionTrackingStubs(({ listeners, window }) => {
    const timeline = [];
    const pendingCallbacks = [];
    const navigations = [];
    window.location.assign = function (nextHref) {
      timeline.push(`navigate:${nextHref}`);
      navigations.push(nextHref);
      this.href = nextHref;
    };
    window.gtag = function (command, eventName, params) {
      if (command !== "event") return;
      timeline.push(`track:${eventName}`);
      pendingCallbacks.push({ eventName, callback: params && params.event_callback });
    };
    window.seascapeTrackEvent = function (eventName, params) {
      window.gtag("event", eventName, params || {});
    };
    listeners.DOMContentLoaded();

    const links = [
      {
        tagName: "A",
        href: "/property-management/#owner-cta",
        target: "",
        textContent: "Request Your Revenue Teardown",
        dataset: {
          trackEvent: "owner_primary_cta_click",
          pageSlug: "property-management",
          trackLabel: "Request Your Revenue Teardown"
        },
        hasAttribute() {
          return false;
        },
        getAttribute(name) {
          if (name === "href") return this.href;
          if (name === "target") return this.target;
          return null;
        }
      },
      {
        tagName: "A",
        href: "https://book.seascape-vacations.com/listings/206016",
        target: "",
        textContent: "Open Direct Availability",
        dataset: {
          trackEvent: "booking_engine_handoff",
          guideSlug: "best-time-visit-anna-maria-island"
        },
        hasAttribute() {
          return false;
        },
        getAttribute(name) {
          if (name === "href") return this.href;
          if (name === "target") return this.target;
          return null;
        },
        setAttribute(name, value) {
          if (name === "href") this.href = value;
        }
      },
      {
        tagName: "A",
        href: "https://book.seascape-vacations.com/listings/487798",
        target: "",
        textContent: "Book Bradenton Pool Home",
        dataset: {
          trackEvent: "property_booking_page_click",
          pageSlug: "bradenton-pool-home"
        },
        hasAttribute() {
          return false;
        },
        getAttribute(name) {
          if (name === "href") return this.href;
          if (name === "target") return this.target;
          return null;
        },
        setAttribute(name, value) {
          if (name === "href") this.href = value;
        }
      }
    ];

    const preventedEvents = [];
    const originalSetTimeout = global.setTimeout;
    links.forEach((link) => {
      try {
        global.setTimeout = function () {
          return 1;
        };
        listeners.click({
          target: {
            closest(selector) {
              return selector === "[data-track-event]" ? link : null;
            }
          },
          button: 0,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          preventDefault() {
            timeline.push(`prevent:${link.dataset.trackEvent}`);
            preventedEvents.push(link.dataset.trackEvent);
          }
        });
      } finally {
        global.setTimeout = originalSetTimeout;
      }
      const pending = pendingCallbacks.shift();
      assert.equal(pending.eventName, link.dataset.trackEvent);
      assert.equal(navigations.length, preventedEvents.length - 1);
      pending.callback();
      assert.equal(navigations.length, preventedEvents.length);
    });

    return {
      timeline,
      navigations,
      preventedEvents
    };
  });

  assert.deepEqual(observed.preventedEvents, [
    "owner_primary_cta_click",
    "booking_engine_handoff",
    "property_booking_page_click"
  ]);
  observed.preventedEvents.forEach((eventName, index) => {
    const trackIndex = observed.timeline.indexOf(`track:${eventName}`);
    const nextTrackIndex =
      index + 1 < observed.preventedEvents.length
        ? observed.timeline.indexOf(`track:${observed.preventedEvents[index + 1]}`)
        : observed.timeline.length;
    const navigateIndex = observed.timeline.findIndex(
      (entry, entryIndex) =>
        entryIndex > trackIndex && entryIndex < nextTrackIndex && entry.startsWith("navigate:")
    );
    assert.equal(trackIndex > -1, true, `${eventName} should dispatch through the GA wrapper`);
    assert.equal(navigateIndex > trackIndex, true, `${eventName} should dispatch before navigation`);
  });
  assert.equal(observed.navigations.length, 3);
  assert.match(observed.navigations[1], /utm_content=best-time-visit-anna-maria-island/);
  assert.match(observed.navigations[2], /utm_content=bradenton-pool-home/);
});

test("owner form tracking preserves owner_source attribution from email follow-up on start and submit", () => {
  const observed = withConversionTrackingStubs(({ listeners, window }) => {
    const hiddenSourceField = { value: "property-management" };
    const ownerForm = {
      tagName: "FORM",
      dataset: {
        formStartEvent: "owner_form_start",
        formSubmitEvent: "owner_form_submit",
        pageSlug: "property-management",
        sourcePageSlug: "property-management",
        market: "florida-gulf-coast"
      },
      addEventListener(eventName, handler) {
        if (eventName === "focusin") {
          this.focusinHandler = handler;
        }
      },
      querySelector(selector) {
        if (selector === 'input[name="source_page_slug"]') {
          return hiddenSourceField;
        }
        return null;
      },
      matches(selector) {
        return selector === "form[data-track-form]";
      }
    };

    window.location.href = "http://localhost/property-management/?owner_source=owner-revenue-review-follow-up#owner-cta";
    window.location.search = "?owner_source=owner-revenue-review-follow-up";
    global.document.querySelectorAll = function (selector) {
      return selector === 'form[data-track-form="owner"]' ? [ownerForm] : [];
    };

    listeners.DOMContentLoaded();
    ownerForm.focusinHandler();
    listeners.submit({ target: ownerForm });

    return {
      hiddenValue: hiddenSourceField.value,
      startEvent: window.dataLayer[0],
      submitEvent: window.dataLayer[1]
    };
  });

  assert.equal(observed.hiddenValue, "owner-revenue-review-follow-up");
  assert.equal(observed.startEvent.event, "owner_form_start");
  assert.equal(observed.startEvent.payload.source_page_slug, "owner-revenue-review-follow-up");
  assert.equal(observed.submitEvent.event, "owner_form_submit");
  assert.equal(observed.submitEvent.payload.source_page_slug, "owner-revenue-review-follow-up");
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

test("proven winner guides expose tracked stay-path links before the main guide body", () => {
  for (const guide of winnerGuideEarlyTransferLinks) {
    const source = fs.readFileSync(guide.file, "utf8");
    const markerIndex = source.indexOf(guide.beforeMarker);
    assert.notEqual(markerIndex, -1, `${guide.slug} should keep the expected body marker`);

    const earlySource = source.slice(0, markerIndex);
    assert.equal(
      (earlySource.match(/data-track-event=\"guide_book_direct_click\"/g) || []).length >= guide.requiredLinks.length,
      true,
      `${guide.slug} should track early stay-path links as guide_book_direct_click`
    );

    for (const href of guide.requiredLinks) {
      assert.equal(
        earlySource.includes(`href=\"${href}\"`),
        true,
        `${guide.slug} should link to ${href} before the main guide body`
      );
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
        '<meta name="author" content="Sawyer Beckett">',
        '"@type": "Person"',
        '"name": "Sawyer Beckett"',
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
        '<meta name="author" content="Sawyer Beckett">',
        '"@type":"Person"',
        '"name":"Sawyer Beckett"',
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
        '<meta name="author" content="Sawyer Beckett">',
        '"@type": "Person"',
        '"name": "Sawyer Beckett"',
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
