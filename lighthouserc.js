"use strict";

const { moneyRoutes } = require("./scripts/perf/money-routes.js");

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      url: moneyRoutes.map((route) => `http://localhost${route}`),
      numberOfRuns: 3,
      settings: {
        budgetPath: "./config/perf-budget.json",
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "performance-budget": "error",
        "largest-contentful-paint": ["error", { maxNumericValue: 4500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.2 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 100000 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 50000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
