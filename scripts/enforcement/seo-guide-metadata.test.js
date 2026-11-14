const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function getFirstMatch(source, regex) {
  const match = source.match(regex);
  return match ? match[1] : "";
}

test("priority guides ship complete metadata instead of truncated titles or broken descriptions", () => {
  const guideExpectations = [
    {
      relativePath: ["src", "guides", "anna-maria-island-vs-longboat-key.html"],
      expectedTitle: "Anna Maria Island vs Longboat Key — Which Beach Is Right for You?"
    },
    {
      relativePath: ["src", "guides", "best-waterfront-restaurants-with-boat-dock.html"],
      expectedTitle: "Best Waterfront Restaurants with Boat Dock Access Near AMI | 2026",
      expectedDescription:
        "The best waterfront restaurants near Bradenton and Anna Maria Island where you can pull up by boat. Dockside dining with Gulf views and fresh seafood."
    },
    {
      relativePath: ["src", "guides", "fishing-guide-anna-maria-sarasota.html"],
      expectedTitle: "Complete Fishing Guide: Anna Maria Island, Bradenton & Sarasota",
      expectedDescription:
        "Complete fishing guide for Anna Maria Island, Bradenton, and Sarasota. Inshore, offshore, pier fishing, best charters, seasonal species, and license tips."
    },
    {
      relativePath: ["src", "guides", "florida-gulf-coast-vacation-rental-market-report-2026.html"],
      expectedTitle: "Bradenton-Sarasota Vacation Rental Benchmark 2026"
    }
  ];

  for (const expectation of guideExpectations) {
    const source = fs.readFileSync(path.join(projectRoot, ...expectation.relativePath), "utf8");
    // Guides on a shared layout carry these as quoted front-matter values.
    const frontMatterValue = (key) => {
      const quoted = getFirstMatch(source, new RegExp(`^${key}: (".*")$`, "m"));
      return quoted ? JSON.parse(quoted) : "";
    };
    const title =
      getFirstMatch(source, /<title>([\s\S]*?)<\/title>/i) || frontMatterValue("pageTitle");
    const description =
      getFirstMatch(source, /<meta name="description" content="([\s\S]*?)"/i) ||
      frontMatterValue("pageDescription");

    assert.equal(title, expectation.expectedTitle);

    if (expectation.expectedDescription) {
      assert.equal(description, expectation.expectedDescription);
    }
  }
});
