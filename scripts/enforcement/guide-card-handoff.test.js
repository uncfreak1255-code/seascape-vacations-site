const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const template = fs.readFileSync(path.join(__dirname, "../../src/_includes/partials/analytics-ga4.njk"), "utf8");
const script = template.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replaceAll("{{ site.analytics.ga4MeasurementId }}", "G-TEST");
const guide = "https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/";
const destination = "https://seascape-vacations.com/properties/river-house/?sv_guide_click_id=svg_test#check-availability";
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function load(href, sessionStorage, { suppressed = false, date = Date } = {}) {
  const window = { location: new URL(href), sessionStorage, __seascapeAnalyticsSuppressed: suppressed };
  const document = { title: "Guide title", referrer: "https://www.google.com/", createElement: () => ({}), head: { appendChild() {} } };
  vm.runInNewContext(script, { window, document, URL, Date: date });
  return window;
}
function click(window, extra = {}) {
  let continued = 0;
  window.seascapeTrackEvent("guide_property_check_dates_click", {
    guide_slug: "anna-maria-island-vs-siesta-key", property_slug: "river-house", placement: "guide_stay_here",
    link_url: destination, transport_type: "beacon", event_callback: () => { continued++; }, ...extra
  });
  return continued;
}
function events(window) { return window.dataLayer.filter(entry => entry[0] === "event"); }

test("a card event survives same-tab teardown and is delivered once with its guide identity", () => {
  const state = storage();
  const source = load(guide, state);
  click(source);
  // Source-page tag processing can finish before its queued network batch is sent.
  // Discard that document, just as the observed normal same-tab navigation does.
  const target = load(destination, state);
  const received = events(target);
  assert.equal(received.length, 1, "destination must dispatch the card event lost during source teardown");
  assert.equal(received[0][1], "guide_property_check_dates_click");
  const payload = received[0][2];
  assert.equal(payload.guide_slug, "anna-maria-island-vs-siesta-key");
  assert.equal(payload.property_slug, "river-house");
  assert.equal(payload.placement, "guide_stay_here");
  assert.equal(payload.link_url, destination);
  assert.equal(payload.page_location, guide);
  assert.equal(payload.page_referrer, "https://www.google.com/");
  assert.equal(events(load(destination, state)).length, 0, "reload must not replay it");
});

test("new-tab and external events retain direct delivery", () => {
  for (const extra of [{ event_callback: undefined }, { link_url: "https://example.com/" }]) {
    const state = storage();
    const source = load(guide, state);
    click(source, extra);
    assert.equal(events(source).length, 1);
    assert.equal(events(load(destination, state)).length, 0);
  }
});

test("a suppressed destination drops the pending card without sending or later replay", () => {
  const state = storage();
  click(load(guide, state));
  assert.equal(events(load(destination, state, { suppressed: true })).length, 0);
  assert.equal(events(load(destination, state)).length, 0);
});

test("a pending event is sanitized, expires, and cannot leak into a different property", () => {
  for (const target of ["https://seascape-vacations.com/properties/the-oasis/", destination]) {
    const state = storage();
    click(load(guide, state), { email: "private@example.com", link_url: destination.replace("#", "&email=private@example.com#") });
    const later = target === destination ? class extends Date { static now() { return Date.now() + 120000; } } : Date;
    assert.equal(events(load(target, state, { date: later })).length, 0);
    assert.equal(events(load(destination, state)).length, 0);
  }
  const state = storage();
  click(load(guide + "?email=private@example.com", state), { email: "private@example.com", guest_name: "Private Guest" });
  const payload = events(load(destination, state))[0][2];
  assert.equal(payload.email, undefined);
  assert.equal(payload.guest_name, undefined);
  assert.equal(new URL(payload.page_location).searchParams.has("email"), false);
});

test("unavailable tab storage falls back to the existing direct analytics path", () => {
  const state = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); }, removeItem() { throw Error("blocked"); } };
  const source = load(guide, state);
  click(source);
  assert.equal(events(source).length, 1);
});
