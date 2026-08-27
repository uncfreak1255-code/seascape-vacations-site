const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const trackingScriptPath = path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js");

function trackedLink(eventName, href) {
  return {
    tagName: "A",
    href,
    target: "_blank",
    textContent: eventName,
    dataset: {
      trackEvent: eventName,
      guideSlug: "best-time-visit-anna-maria-island",
      trackLabel: eventName,
    },
    getAttribute(name) {
      if (name === "href") return this.href;
      if (name === "target") return this.target;
      return "";
    },
    setAttribute(name, value) {
      if (name === "href") this.href = value;
    },
    hasAttribute() {
      return false;
    },
  };
}

function setLocation(windowObject, href) {
  const url = new URL(href, windowObject.location.href);
  windowObject.location.href = url.toString();
  windowObject.location.pathname = url.pathname;
  windowObject.location.search = url.search;
}

function withTrackingRuntime(callback) {
  delete require.cache[require.resolve(trackingScriptPath)];
  const listeners = {};
  const fetchCalls = [];
  const storage = new Map();

  global.window = {
    dataLayer: [],
    location: {
      href: "https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/?utm_source=google&utm_medium=organic&utm_campaign=guide-winners",
      pathname: "/guides/best-time-visit-anna-maria-island/",
      search: "?utm_source=google&utm_medium=organic&utm_campaign=guide-winners",
      assign(nextHref) {
        setLocation(global.window, nextHref);
      },
    },
  };
  global.document = {
    readyState: "loading",
    referrer: "https://www.google.com/",
    addEventListener(eventName, handler) {
      listeners[eventName] = handler;
    },
    querySelectorAll() {
      return [];
    },
  };
  global.localStorage = {
    getItem(key) {
      return storage.get(key) || "";
    },
    setItem(key, value) {
      storage.set(key, value);
    },
  };
  global.fetch = (url, options = {}) => {
    fetchCalls.push({ url: String(url), options });
    return Promise.resolve({ ok: true, status: 200 });
  };
  global.FormData = class FormDataStub {};

  require(trackingScriptPath);
  listeners.DOMContentLoaded();

  function click(link) {
    listeners.click({
      target: {
        closest(selector) {
          return selector === "[data-track-event]" ? link : null;
        },
      },
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    });
  }

  try {
    return callback({ click, fetchCalls, window: global.window });
  } finally {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.fetch;
    delete global.FormData;
  }
}

test("guide lineage survives guide, stay, property, and explicit booking-engine links", () => {
  withTrackingRuntime(({ click, fetchCalls, window }) => {
    const guideLink = trackedLink("guide_stay_click", "/stays/anna-maria-island-vacation-rentals/");
    click(guideLink);

    const guideUrl = new URL(guideLink.href);
    const clickId = guideUrl.searchParams.get("sv_guide_click_id");
    assert.match(clickId, /^svg_/);
    assert.equal(guideUrl.searchParams.get("utm_source"), "google");

    setLocation(window, guideUrl.toString());
    const propertyLink = trackedLink("stay_view_property_click", "/properties/the-oasis/");
    click(propertyLink);
    const propertyUrl = new URL(propertyLink.href);
    assert.equal(propertyUrl.searchParams.get("sv_guide_click_id"), clickId);
    assert.equal(propertyUrl.searchParams.get("utm_campaign"), "guide-winners");

    setLocation(window, propertyUrl.toString());
    const bookingLink = trackedLink("property_booking_page_click", "https://book.seascape-vacations.com/listings/189511");
    click(bookingLink);
    const bookingUrl = new URL(bookingLink.href);
    assert.equal(bookingUrl.searchParams.get("sv_guide_click_id"), clickId);
    assert.equal(fetchCalls.filter((call) => call.url === "/.netlify/functions/booking-handoff").length, 1);
  });
});

test("external catalog booking emits its placement event and one named handoff", () => {
  withTrackingRuntime(({ click, fetchCalls, window }) => {
    setLocation(window, "https://seascape-vacations.com/properties/?sv_guide_click_id=svg_existing&utm_source=google");
    const bookingLink = trackedLink("catalog_book_direct_click", "https://book.seascape-vacations.com/listings/206016");
    click(bookingLink);

    assert.deepEqual(
      window.dataLayer.map((entry) => entry.event),
      ["catalog_book_direct_click", "booking_engine_handoff"]
    );
    assert.equal(fetchCalls.filter((call) => call.url === "/.netlify/functions/booking-handoff").length, 1);
    assert.equal(new URL(bookingLink.href).searchParams.get("sv_guide_click_id"), "svg_existing");
  });
});

test("same-page catalog links do not create false booking handoffs", () => {
  withTrackingRuntime(({ click, fetchCalls, window }) => {
    setLocation(window, "https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/?sv_guide_click_id=svg_existing");
    const hashLink = trackedLink("catalog_book_direct_click", "#featured-homes");
    click(hashLink);

    assert.deepEqual(window.dataLayer.map((entry) => entry.event), ["catalog_book_direct_click"]);
    assert.equal(fetchCalls.filter((call) => call.url === "/.netlify/functions/booking-handoff").length, 0);
  });
});

test("direct guide-to-property links start guide lineage", () => {
  withTrackingRuntime(({ click }) => {
    const propertyLink = trackedLink(
      "guide_property_check_dates_click",
      "/properties/sarasota-luxe/#check-availability"
    );
    click(propertyLink);

    const propertyUrl = new URL(propertyLink.href);
    assert.match(propertyUrl.searchParams.get("sv_guide_click_id"), /^svg_/);
    assert.equal(propertyUrl.hash, "#check-availability");
  });
});

test("catalog collection links preserve existing guide lineage", () => {
  withTrackingRuntime(({ click, window }) => {
    setLocation(
      window,
      "https://seascape-vacations.com/properties/?sv_guide_click_id=svg_existing&utm_source=google"
    );
    const collectionLink = trackedLink(
      "catalog_collection_click",
      "/stays/anna-maria-island-vacation-rentals/"
    );
    click(collectionLink);

    const collectionUrl = new URL(collectionLink.href);
    assert.equal(collectionUrl.searchParams.get("sv_guide_click_id"), "svg_existing");
    assert.equal(collectionUrl.searchParams.get("utm_source"), "google");
  });
});
