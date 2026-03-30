const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerData = require(path.join(projectRoot, "src", "_data", "seoPages.json")).owner;

function readSource(...parts) {
  return fs.readFileSync(path.join(projectRoot, ...parts), "utf8");
}

function findMetaContent(source, pattern) {
  const match = source.match(pattern);
  return match ? match[1] : null;
}

test("anna-maria-city ships parseable primary head tags", () => {
  const source = readSource("src", "guides", "anna-maria-city.html");

  const title = findMetaContent(source, /<title>([^<]+)<\/title>/i);
  const description = findMetaContent(source, /<meta\s+name="description"\s+content="([^"]+)">/i);
  const canonical = findMetaContent(source, /<link\s+rel="canonical"\s+href="([^"]+)">/i);
  const ogTitle = findMetaContent(source, /<meta\s+property="og:title"\s+content="([^"]+)">/i);
  const ogDescription = findMetaContent(source, /<meta\s+property="og:description"\s+content="([^"]+)">/i);

  assert.equal(title, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(
    description,
    "Discover Anna Maria City at the northern tip of Anna Maria Island — secluded Bean Point, the historic Rod & Reel Pier, Pine Avenue shops, and vacation rentals. AMI's quietest gem."
  );
  assert.equal(canonical, "https://seascape-vacations.com/guides/anna-maria-city/");
  assert.equal(ogTitle, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(ogDescription, "AMI's quietest gem — Bean Point, Rod & Reel Pier, and true Old Florida.");
});

test("priority owner money-page metadata stays non-empty and query-aligned", () => {
  const feePage = ownerData.find((entry) => entry.slug === "vacation-rental-management-fees-florida");
  const licensingPage = ownerData.find((entry) => entry.slug === "vacation-rental-licensing-florida");
  const vrboPage = ownerData.find((entry) => entry.slug === "vrbo-management-services-florida");

  assert.ok(feePage, "fee page should exist");
  assert.ok(licensingPage, "licensing page should exist");
  assert.ok(vrboPage, "VRBO page should exist");

  assert.match(feePage.title, /fees/i);
  assert.match(feePage.title, /hidden costs/i);
  assert.match(feePage.description, /average/i);
  assert.match(feePage.description, /charge/i);

  assert.match(licensingPage.title, /DBPR/i);
  assert.match(licensingPage.description, /DBPR/i);
  assert.match(licensingPage.description, /county/i);

  assert.match(vrboPage.title, /VRBO/i);
  assert.match(vrboPage.title, /owners/i);
  assert.match(vrboPage.description, /owners/i);
  assert.match(vrboPage.description, /Florida/i);
});
