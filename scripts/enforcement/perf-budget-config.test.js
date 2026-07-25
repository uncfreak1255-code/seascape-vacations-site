const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");

test("perf budget watches the tracked money routes", () => {
  const { moneyRoutes } = require(path.join(projectRoot, "scripts/perf/money-routes.js"));

  assert.deepEqual(moneyRoutes, [
    "/property-management/vacation-rental-management-fees-florida/",
    "/property-management/vacation-rental-licensing-florida/",
    "/property-management/vrbo-management-services-florida/",
    "/stays/anna-maria-island-vacation-rentals/",
    "/stays/anna-maria-island-beachfront-rentals/",
  ]);
});

test("lighthouserc uses built site output and local homepage plus money-route URLs", () => {
  const config = require(path.join(projectRoot, "lighthouserc.js"));
  const { moneyRoutes } = require(path.join(projectRoot, "scripts/perf/money-routes.js"));

  assert.equal(config.ci.collect.staticDistDir, "./_site");
  assert.equal(config.ci.collect.numberOfRuns, 3);
  assert.deepEqual(
    config.ci.collect.url,
    ["/", ...moneyRoutes].map((route) => `http://localhost${route}`)
  );
  assert.equal(config.ci.collect.settings.budgetPath, "./config/perf-budget.json");
  assert.equal(config.ci.assert.assertions["performance-budget"], "error");
});

test("package scripts expose local and CI perf-budget commands", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );

  assert.equal(
    packageJson.scripts["perf:budget"],
    "npm run build && lhci autorun --config=./lighthouserc.js"
  );
  assert.equal(
    packageJson.scripts["perf:budget:check"],
    "lhci autorun --config=./lighthouserc.js"
  );
});

test("perf budget file keeps LCP, CLS, TBT, and resource budgets explicit", () => {
  const budgetPath = path.join(projectRoot, "config/perf-budget.json");
  const [budget] = JSON.parse(fs.readFileSync(budgetPath, "utf8"));

  const timingMetrics = new Set(budget.timings.map((entry) => entry.metric));
  assert.ok(timingMetrics.has("largest-contentful-paint"));
  assert.ok(timingMetrics.has("cumulative-layout-shift"));
  assert.ok(timingMetrics.has("total-blocking-time"));

  const resourceTypes = new Set(budget.resourceSizes.map((entry) => entry.resourceType));
  assert.ok(resourceTypes.has("script"));
  assert.ok(resourceTypes.has("stylesheet"));
  assert.ok(resourceTypes.has("image"));
  assert.ok(resourceTypes.has("total"));
});
