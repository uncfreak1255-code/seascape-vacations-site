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

test("perf budget watches one page per guest and owner journey", () => {
  const { journeyRoutes } = require(path.join(projectRoot, "scripts/perf/money-routes.js"));

  // Why these two: see the comment on journeyRoutes in money-routes.js.
  assert.deepEqual(journeyRoutes, ["/properties/", "/property-management/"]);
});

test("lighthouserc uses built site output and local homepage, journey and money-route URLs", () => {
  const config = require(path.join(projectRoot, "lighthouserc.js"));
  const { journeyRoutes, moneyRoutes } = require(path.join(projectRoot, "scripts/perf/money-routes.js"));

  assert.equal(config.ci.collect.staticDistDir, "./_site");
  assert.equal(config.ci.collect.numberOfRuns, 3);
  assert.deepEqual(
    config.ci.collect.url,
    ["/", ...journeyRoutes, ...moneyRoutes].map((route) => `http://localhost${route}`)
  );
  assert.equal(config.ci.collect.settings && config.ci.collect.settings.budgetPath, undefined);
  assert.equal(config.ci.assert.budgetPath, "./config/perf-budget.json");
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

  const byType = Object.fromEntries(budget.resourceSizes.map((entry) => [entry.resourceType, entry.budget]));
  assert.equal(byType.image, 800);
  assert.equal(byType.total, 1000);
  assert.equal(byType.script, 100);
  assert.equal(byType.stylesheet, 50);

  const config = require(path.join(projectRoot, "lighthouserc.js"));
  const assertions = config.ci.assert.assertions;
  assert.deepEqual(assertions["resource-summary:image:size"], ["error", { maxNumericValue: byType.image * 1024 }]);
  assert.deepEqual(assertions["resource-summary:total:size"], ["error", { maxNumericValue: byType.total * 1024 }]);
  assert.deepEqual(assertions["resource-summary:script:size"], ["error", { maxNumericValue: 100000 }]);
  assert.deepEqual(assertions["resource-summary:stylesheet:size"], ["error", { maxNumericValue: 50000 }]);
});

test("image and total caps fail closed on oversized bytes and pass under the cap", () => {
  const { getAllAssertionResults } = require("@lhci/utils/src/assertions.js");
  const config = require(path.join(projectRoot, "lighthouserc.js"));

  function lhr(imageBytes, totalBytes) {
    return {
      finalUrl: "http://localhost/",
      audits: {
        "resource-summary": {
          details: {
            items: [
              { resourceType: "image", transferSize: imageBytes },
              { resourceType: "total", transferSize: totalBytes },
              { resourceType: "script", transferSize: 20000 },
              { resourceType: "stylesheet", transferSize: 20000 },
              { resourceType: "font", transferSize: 40000 },
              { resourceType: "third-party", requestCount: 0 }
            ]
          }
        }
      }
    };
  }

  function failed(results, property) {
    return results.filter((row) => row.auditProperty === property && row.passed === false);
  }

  const over = getAllAssertionResults(config.ci.assert, [lhr(2_610_000, 2_787_000)]);
  assert.ok(failed(over, "image.size").length >= 1, "2.6 MB of images must fail the 800 KB cap");
  assert.ok(failed(over, "total.size").length >= 1, "2.8 MB total must fail the 1000 KB cap");

  const empty = getAllAssertionResults(config.ci.assert, [lhr(0, 0)]);
  assert.equal(failed(empty, "image.size").length, 0, "zero image bytes must not trip the image cap");
  assert.equal(failed(empty, "total.size").length, 0);

  const under = getAllAssertionResults(config.ci.assert, [lhr(754_000, 931_000)]);
  assert.equal(failed(under, "image.size").length, 0);
  assert.equal(failed(under, "total.size").length, 0);
});
