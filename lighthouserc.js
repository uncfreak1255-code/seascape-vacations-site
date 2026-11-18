"use strict";

const { journeyRoutes, moneyRoutes } = require("./scripts/perf/money-routes.js");
const [perfBudget] = require("./config/perf-budget.json");

const budgetRoutes = ["/", ...journeyRoutes, ...moneyRoutes];

function sizeCap(resourceType) {
  const entry = perfBudget.resourceSizes.find((row) => row.resourceType === resourceType);
  if (!entry) {
    throw new Error(`config/perf-budget.json is missing a ${resourceType} size budget`);
  }
  return entry.budget * 1024;
}

function countCap(resourceType) {
  const entry = perfBudget.resourceCounts.find((row) => row.resourceType === resourceType);
  if (!entry) {
    throw new Error(`config/perf-budget.json is missing a ${resourceType} count budget`);
  }
  return entry.budget;
}

// LHCI's working budget hook is assert.budgetsFile, but that cannot be combined
// with assert.assertions. Keep the existing tighter script/stylesheet caps and
// apply the rest of config/perf-budget.json here. assert.budgetPath names the
// file this config is enforcing (Lighthouse 12 dropped collect.settings.budgetPath).
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      url: budgetRoutes.map((route) => `http://localhost${route}`),
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      budgetPath: "./config/perf-budget.json",
      assertions: {
        "performance-budget": "error",
        "largest-contentful-paint": ["error", { maxNumericValue: 4500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.2 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 100000 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 50000 }],
        "resource-summary:font:size": ["error", { maxNumericValue: sizeCap("font") }],
        "resource-summary:image:size": ["error", { maxNumericValue: sizeCap("image") }],
        "resource-summary:total:size": ["error", { maxNumericValue: sizeCap("total") }],
        "resource-summary:third-party:count": ["error", { maxNumericValue: countCap("third-party") }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
