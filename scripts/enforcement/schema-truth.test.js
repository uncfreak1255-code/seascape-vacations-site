const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function readSource(...parts) {
  return fs.readFileSync(path.join(projectRoot, ...parts), "utf8");
}

test("stays and property templates do not ship unverifiable aggregate ratings", () => {
  const files = [
    ["src", "stays", "stays.njk"],
    ["src", "properties", "dockside-dreams", "index.njk"],
    ["src", "properties", "river-house", "index.njk"],
    ["src", "properties", "sarasota-luxe", "index.njk"],
    ["src", "properties", "the-oasis", "index.njk"],
  ];

  for (const fileParts of files) {
    const source = readSource(...fileParts);
    assert.equal(
      source.includes('"aggregateRating"'),
      false,
      `${fileParts.join("/")} should not ship aggregateRating markup without complete first-party review proof`
    );
  }
});

test("freshness-critical templates stop using the global site.dateUpdated fallback", () => {
  const files = [
    ["src", "sitemap.njk"],
    ["src", "stays", "stays.njk"],
    ["src", "stays", "index.njk"],
    ["src", "guides", "index.njk"],
    ["src", "guides", "hurricane-preparedness-florida-vacation.html"],
    ["src", "property-management", "property-management.njk"],
  ];

  for (const fileParts of files) {
    const source = readSource(...fileParts);
    assert.equal(
      source.includes("site.dateUpdated"),
      false,
      `${fileParts.join("/")} should use git-backed freshness signals instead of the global site.dateUpdated fallback`
    );
  }
});

test("site metadata no longer hardcodes a stale global dateUpdated field", () => {
  const siteData = readSource("src", "_data", "site.json");
  assert.equal(
    siteData.includes('"dateUpdated"'),
    false,
    "src/_data/site.json should not ship a hardcoded global dateUpdated field"
  );
});
