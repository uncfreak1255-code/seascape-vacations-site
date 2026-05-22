const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const srcRoot = path.join(projectRoot, "src");
const demotedGuidePath = path.join(srcRoot, "guides", "vacation-rental-income-anna-maria.html");

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return fullPath;
  });
}

test("AMI income guide is demoted out of the owner-proof lane and routes to the benchmark", () => {
  const guide = fs.readFileSync(
    demotedGuidePath,
    "utf8"
  );

  assert.equal(guide.includes('meta name="robots" content="noindex, follow"'), true);
  assert.equal(guide.includes("/research/owner-fee-revenue-leak-benchmark-2026/"), true);
  assert.equal(/PriceLabs|AirDNA/.test(guide), false);
  assert.equal(guide.includes("gold mine"), false);
});

test("public source pages route owner proof to the benchmark instead of the AMI income guide", () => {
  const propertyManagement = fs.readFileSync(
    path.join(projectRoot, "src", "property-management", "index.njk"),
    "utf8"
  );
  const publicFiles = collectFiles(srcRoot).filter((filePath) => {
    if (filePath === demotedGuidePath) return false;
    return /\.(html|njk|md|json)$/.test(filePath);
  });
  const staleLinks = publicFiles.filter((filePath) =>
    fs.readFileSync(filePath, "utf8").includes("/guides/vacation-rental-income-anna-maria/")
  );

  assert.equal(
    propertyManagement.includes("/research/owner-fee-revenue-leak-benchmark-2026/"),
    true
  );
  assert.deepEqual(staleLinks, []);
});
