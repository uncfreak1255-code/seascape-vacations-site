const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-owner-lead-event-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("owner lead event smoke is exposed as an operator command", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));

  assert.equal(
    packageJson.scripts["verify:owner-lead-events"],
    "node scripts/recovery/assert-owner-lead-event-smoke.js https://seascape-vacations.com"
  );
});

test("owner lead event smoke runs inside the release safety flow", () => {
  const releaseGate = fs.readFileSync(path.join(projectRoot, "scripts", "enforcement", "verify-release.js"), "utf8");

  assert.match(releaseGate, /run\("npm", \["run", "verify:owner-lead-events"\]\)/);
});

test("owner lead event smoke builds the full live owner-route inventory", () => {
  const smoke = loadSmokeModule();
  const routes = smoke.buildOwnerRoutes();

  assert.equal(routes.includes("/property-management/"), true);
  assert.equal(routes.includes("/research/owner-fee-revenue-leak-benchmark-2026/"), true);
  assert.equal(routes.includes("/research/how-seascape-protects-owner-net-2026/"), true);
  assert.equal(routes.includes("/property-management/vacation-rental-management-fees-florida/"), true);
  assert.equal(routes.length, 30);
});

test("owner lead event smoke validates the CTA and form submit markers", () => {
  const smoke = loadSmokeModule();
  const body = `
    <main>
      <a href="#owner-cta" data-track-event="owner_primary_cta_click">Request Your Revenue Teardown</a>
      <form data-track-form='owner' data-form-submit-event='owner_form_submit'></form>
    </main>
  `;

  assert.deepEqual(smoke.REQUIRED_EVENTS, [
    "owner_primary_cta_click",
    "owner_form_submit"
  ]);
  assert.deepEqual(smoke.parseArgs(["https://seascape-vacations.com"]), {
    baseUrl: "https://seascape-vacations.com"
  });
  assert.doesNotThrow(() => {
    smoke.validateOwnerEventMarkup(body, "/property-management/");
  });
});
