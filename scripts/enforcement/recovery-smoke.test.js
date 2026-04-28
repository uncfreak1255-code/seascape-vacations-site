const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("live smoke script exposes reusable helpers for unit coverage", () => {
  const smoke = loadSmokeModule();

  assert.equal(Array.isArray(smoke.targets), true, "expected the smoke script to export its target list");
  assert.equal(
    typeof smoke.validateTargetResponse,
    "function",
    "expected the smoke script to export a reusable response validator"
  );
});

test("property-management smoke follows the current proof-first owner hub", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.notEqual(target, undefined, "expected property-management to stay in the smoke target list");

  const currentOwnerHubBody = `
    <main>
      <h1>Property management for owners who care about net revenue</h1>
      <p>Seascape's current Gulf Coast portfolio runs at $1.4M in annual rental revenue and $119,923 in direct bookings.</p>
      <strong>13.4% → 2.9%</strong>
      <section>
        <h3>Where Owner Revenue Actually Leaks</h3>
      </section>
      <a href="#owner-cta">Request Your Revenue Review</a>
      <a href="/property-management/vacation-rental-management-sarasota/">Sarasota coverage</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentOwnerHubBody
    });
  });
});

test("property-management smoke rejects the retired explainer-hub surface", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>What Is Vacation Rental Property Management?</h1>
          <a href="/properties/">View All Properties</a>
        </main>
      `
    });
  }, /property-management hub is missing the proof-first owner revenue surface/);
});

test("stays smoke follows the live stay-collection hub instead of a dead prefix", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/");

  assert.notEqual(target, undefined, "expected /stays/ to stay in the smoke target list");

  const currentStayHubBody = `
    <main>
      <p>Stay Collections</p>
      <h1>Use the live stay pages as a real collection hub, not a dead prefix</h1>
      <section>
        <h2>Destination collections</h2>
        <a href="/stays/anna-maria-island-vacation-rentals/">Anna Maria Island Vacation Rentals</a>
        <a href="/stays/bradenton-vacation-rentals-near-beaches/">Bradenton Vacation Rentals Near Beaches</a>
      </section>
      <a href="/properties/">Browse Direct-Book Homes</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentStayHubBody
    });
  });
});
