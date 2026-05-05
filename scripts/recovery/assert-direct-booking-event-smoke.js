const https = require("https");
const path = require("path");

const REQUIRED_EVENTS = [
  "email_capture_submit",
  "guide_book_direct_click",
  "booking_engine_handoff"
];

const TARGET_GUIDE_PATH = "/guides/best-time-visit-anna-maria-island/";

function request(baseUrl, targetPath) {
  return new Promise((resolve, reject) => {
    https
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
      href: "http://localhost/guides/best-time-visit-anna-maria-island/",
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

async function run(baseUrl) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-direct-booking-event-smoke.js <base-url>");
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
}

if (require.main === module) {
  run(process.argv[2])
    .then(() => console.log("assert-direct-booking-event-smoke: all events passed"))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  REQUIRED_EVENTS,
  TARGET_GUIDE_PATH,
  request,
  validateGuideEventMarkup,
  simulateDirectBookingEvents,
  run
};
