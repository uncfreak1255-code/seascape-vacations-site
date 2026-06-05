const http = require("http");
const https = require("https");
const path = require("path");

const REQUIRED_EVENTS = [
  "email_capture_submit",
  "guide_book_direct_click",
  "booking_engine_handoff"
];

const TARGET_GUIDE_PATH = "/guides/best-time-visit-anna-maria-island/";
const POPUP_GUIDE_PATH = "/guides/bradenton-area-guide/";
const HOMEPAGE_PATH = "/";

function request(baseUrl, targetPath) {
  const client = baseUrl.startsWith("http://") ? http : https;
  return new Promise((resolve, reject) => {
    client
      .get(`${baseUrl}${targetPath}`, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body
          });
        });
      })
      .on("error", reject);
  });
}

function validateGuideEventMarkup(body, targetPath = TARGET_GUIDE_PATH) {
  const missingEvents = REQUIRED_EVENTS.filter((eventName) => {
    return !body.includes(`data-track-event="${eventName}"`) && !body.includes(`data-form-submit-event="${eventName}"`);
  });

  if (missingEvents.length > 0) {
    throw new Error(`${targetPath} is missing direct-booking event markup: ${missingEvents.join(", ")}`);
  }
}

function validatePopupMarkup(body, targetPath, options = {}) {
  const requiredMarkers = [
    'data-email-capture-root',
    'data-email-capture-content',
    'data-track-form="email_capture"',
    'data-form-submit-event="email_capture_submit"',
    'data-inline-email-capture="true"',
    'data-email-capture-success'
  ];

  for (const marker of requiredMarkers) {
    if (!body.includes(marker)) {
      throw new Error(`${targetPath} is missing popup email capture marker: ${marker}`);
    }
  }

  if (body.includes('onsubmit="handleEmailSubmit(event)"')) {
    throw new Error(`${targetPath} still uses legacy popup submit handling instead of shared conversion tracking`);
  }

  if (!body.includes('/assets/js/conversion-tracking.js') && !options.hasRuntimeLoader) {
    throw new Error(`${targetPath} has popup email capture markup but does not load shared conversion tracking`);
  }
}

async function validatePopupRuntime(baseUrl, body, targetPath) {
  let hasRuntimeLoader = false;

  if (targetPath === HOMEPAGE_PATH && !body.includes('/assets/js/conversion-tracking.js') && body.includes('/assets/js/homepage.js')) {
    const homepageScript = await request(baseUrl, "/assets/js/homepage.js");
    hasRuntimeLoader =
      homepageScript.statusCode === 200 &&
      homepageScript.body.includes('/assets/js/conversion-tracking.js');
  }

  validatePopupMarkup(body, targetPath, { hasRuntimeLoader });
}

function buildTrackedLink(eventName, href) {
  return {
    tagName: "A",
    href,
    target: "_blank",
    textContent: eventName,
    dataset: {
      trackEvent: eventName,
      guideSlug: "best-time-visit-anna-maria-island",
      trackLabel: eventName
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
  };
}

function buildTrackedEmailForm() {
  return {
    tagName: "FORM",
    textContent: "Email capture",
    dataset: {
      trackForm: "guide-email",
      formSubmitEvent: "email_capture_submit",
      inlineEmailCapture: "true",
      guideSlug: "best-time-visit-anna-maria-island",
      formPlacement: "guide_conversion",
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
}

function buildTrackedPopupForm() {
  const successNode = {
    classList: {
      added: [],
      add(name) {
        this.added.push(name);
      }
    }
  };

  const popupRoot = {
    querySelector(selector) {
      return selector === "[data-email-capture-success]" ? successNode : null;
    }
  };

  const popupContent = {
    style: {}
  };

  return {
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
    reset() {}
  };
}

function withTrackingRuntime(callback) {
  const trackingScriptPath = path.resolve(__dirname, "..", "..", "src", "assets", "js", "conversion-tracking.js");
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};

  global.window = {
    dataLayer: [],
    location: {
      href: "http://localhost/guides/best-time-visit-anna-maria-island/?utm_source=mcp&utm_medium=ai-assistant&utm_campaign=direct-booking-proof&utm_content=search-availability&ref=mcp-distribution&checkin=2026-06-01&checkout=2026-06-05&guests=4",
      pathname: "/guides/best-time-visit-anna-maria-island/",
      search: "?utm_source=mcp&utm_medium=ai-assistant&utm_campaign=direct-booking-proof&utm_content=search-availability&ref=mcp-distribution&checkin=2026-06-01&checkout=2026-06-05&guests=4",
      assign(nextHref) {
        this.href = nextHref;
      }
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
    setItem() {}
  };
  global.fetch = () => Promise.resolve();
  global.FormData = class FormDataStub {
    get(field) {
      if (field === "email") return "guest@example.com";
      if (field === "name") return "Test Guest";
      return "";
    }
  };

  require(trackingScriptPath);

  try {
    return callback({ listeners, window: global.window });
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
}

function simulateDirectBookingEvents() {
  return withTrackingRuntime(({ listeners, window }) => {
    if (typeof listeners.DOMContentLoaded !== "function") {
      throw new Error("conversion tracking did not register DOMContentLoaded");
    }

    listeners.DOMContentLoaded();

    if (typeof listeners.submit !== "function" || typeof listeners.click !== "function") {
      throw new Error("conversion tracking did not bind submit and click listeners");
    }

    listeners.submit({
      target: buildTrackedEmailForm(),
      preventDefault() {}
    });

    for (const link of [
      buildTrackedLink("guide_book_direct_click", "/stays/anna-maria-island-vacation-rentals/"),
      buildTrackedLink("booking_engine_handoff", "https://book.seascape-vacations.com/listings/206016")
    ]) {
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
        altKey: false
      });
    }

    return window.dataLayer;
  });
}

function simulatePopupEmailCaptureEvent() {
  return withTrackingRuntime(({ listeners, window }) => {
    if (typeof listeners.DOMContentLoaded !== "function") {
      throw new Error("conversion tracking did not register DOMContentLoaded");
    }

    listeners.DOMContentLoaded();

    if (typeof listeners.submit !== "function") {
      throw new Error("conversion tracking did not bind submit listener");
    }

    listeners.submit({
      target: buildTrackedPopupForm(),
      preventDefault() {}
    });

    return window.dataLayer;
  });
}

function parseArgs(argv) {
  const parsed = {
    baseUrl: "",
    requirePopupCapture: false
  };

  for (const arg of argv) {
    if (arg === "--require-popup-capture") {
      parsed.requirePopupCapture = true;
      continue;
    }

    if (!parsed.baseUrl) {
      parsed.baseUrl = arg;
    }
  }

  return parsed;
}

async function run(baseUrl, options = {}) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-direct-booking-event-smoke.js <base-url> [--require-popup-capture]");
  }

  const response = await request(baseUrl, TARGET_GUIDE_PATH);
  if (response.statusCode !== 200) {
    throw new Error(`${TARGET_GUIDE_PATH} expected 200, got ${response.statusCode}`);
  }

  validateGuideEventMarkup(response.body, TARGET_GUIDE_PATH);

  const observedEvents = simulateDirectBookingEvents().map((entry) => entry.event);
  for (const eventName of REQUIRED_EVENTS) {
    if (!observedEvents.includes(eventName)) {
      throw new Error(`conversion tracking did not emit ${eventName}`);
    }
  }

  if (options.requirePopupCapture) {
    for (const popupPath of [POPUP_GUIDE_PATH, HOMEPAGE_PATH]) {
      const popupResponse = await request(baseUrl, popupPath);
      if (popupResponse.statusCode !== 200) {
        throw new Error(`${popupPath} expected 200, got ${popupResponse.statusCode}`);
      }

      await validatePopupRuntime(baseUrl, popupResponse.body, popupPath);
    }

    const popupEvents = simulatePopupEmailCaptureEvent().map((entry) => entry.event);
    if (!popupEvents.includes("email_capture_submit")) {
      throw new Error("conversion tracking did not emit email_capture_submit for the popup capture path");
    }
  }
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));

  run(parsed.baseUrl, { requirePopupCapture: parsed.requirePopupCapture })
    .then(() => console.log("assert-direct-booking-event-smoke: all events passed"))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  REQUIRED_EVENTS,
  TARGET_GUIDE_PATH,
  parseArgs,
  request,
  validateGuideEventMarkup,
  validatePopupMarkup,
  validatePopupRuntime,
  simulateDirectBookingEvents,
  simulatePopupEmailCaptureEvent,
  run
};
