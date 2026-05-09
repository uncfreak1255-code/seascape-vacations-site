const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-direct-booking-event-smoke.js");

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

  const observedEvents = smoke.simulateDirectBookingEvents();
  assert.deepEqual(
    observedEvents.map((entry) => entry.event),
    ["email_capture_submit", "guide_book_direct_click", "booking_engine_handoff"]
  );

  const handoffEvent = observedEvents.find((entry) => entry.event === "booking_engine_handoff");
  assert.equal(handoffEvent.payload.utm_campaign, "direct_booking_site_handoff");
  assert.match(handoffEvent.payload.link_url, /utm_source=seascape_site/);
  assert.match(handoffEvent.payload.link_url, /utm_medium=direct_booking_link/);
  assert.match(handoffEvent.payload.link_url, /utm_campaign=direct_booking_site_handoff/);
});
