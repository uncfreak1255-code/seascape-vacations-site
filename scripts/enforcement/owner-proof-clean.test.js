const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");

test("AMI income guide is demoted out of the owner-proof lane and routes to the benchmark", () => {
  const guide = fs.readFileSync(
    path.join(projectRoot, "src", "guides", "vacation-rental-income-anna-maria.html"),
    "utf8"
  );

  assert.equal(guide.includes('meta name="robots" content="noindex, follow"'), true);
  assert.equal(guide.includes("/research/owner-fee-revenue-leak-benchmark-2026/"), true);
  assert.equal(/PriceLabs|AirDNA/.test(guide), false);
  assert.equal(guide.includes("gold mine"), false);
});

test("property-management fee FAQ points owners to the benchmark instead of the AMI income guide", () => {
  const propertyManagement = fs.readFileSync(
    path.join(projectRoot, "src", "property-management", "index.njk"),
    "utf8"
  );

  assert.equal(
    propertyManagement.includes("/research/owner-fee-revenue-leak-benchmark-2026/"),
    true
  );
  assert.equal(
    propertyManagement.includes("/guides/vacation-rental-income-anna-maria/"),
    false
  );
});
