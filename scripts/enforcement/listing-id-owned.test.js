const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  OWNER_FILE,
  TRACKING_FILE,
  listingIdBySlug,
  invertListingIdBySlug,
  generateClientListingIdMap,
  writeGeneratedClientListingIdMap
} = require("./listing-id-owned");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallbackPath = path.join(projectRoot, OWNER_FILE);
const trackingPath = path.join(projectRoot, TRACKING_FILE);
const propertiesPath = path.join(projectRoot, "src", "_data", "properties.js");
const eleventyPath = path.join(projectRoot, "eleventy.config.js");

function liveCatalog() {
  return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
}

function clientMapFrom(source) {
  const match = source.match(/var PROPERTY_SLUG_BY_LISTING_ID = (\{[^}]+\});/);
  assert.ok(match, "generated client map is missing");
  return JSON.parse(match[1]);
}

test("a fallback row without listingId fails with that slug", () => {
  const catalog = structuredClone(liveCatalog());
  const row = catalog.find((entry) => entry.slug === "coastal-stay");
  assert.ok(row, "live catalog must include coastal-stay");
  delete row.listingId;
  assert.throws(
    () => listingIdBySlug(catalog),
    /src\/_data\/properties-fallback\.json row coastal-stay is missing listingId/
  );
});

test("empty catalog input fails and names the owner file", () => {
  assert.throws(() => listingIdBySlug([]), /src\/_data\/properties-fallback\.json has no catalog rows/);
  assert.throws(() => listingIdBySlug(null), /src\/_data\/properties-fallback\.json has no catalog rows/);
  assert.throws(
    () => invertListingIdBySlug({}),
    /src\/_data\/properties-fallback\.json has no catalog rows/
  );
});

test("live fallback rows each own a listingId", () => {
  const catalog = liveCatalog();
  assert.equal(catalog.length, 7);
  const bySlug = listingIdBySlug(catalog);
  assert.equal(Object.keys(bySlug).length, 7);
  for (const row of catalog) {
    assert.match(String(row.listingId), /^\d+$/, `${row.slug} listingId`);
    assert.equal(bySlug[row.slug], String(row.listingId));
  }
});

test("generate overwrites a planted wrong client map", () => {
  const planted = "var PROPERTY_SLUG_BY_LISTING_ID = {\"1\":\"wrong\"};\n";
  const generated = generateClientListingIdMap(planted, liveCatalog());
  const inverted = invertListingIdBySlug(listingIdBySlug(liveCatalog()));
  assert.deepEqual(clientMapFrom(generated), inverted);
  assert.equal(Object.hasOwn(clientMapFrom(generated), "1"), false);
});

test("generate fails when the client map assignment is missing", () => {
  assert.throws(
    () => generateClientListingIdMap("var x = 1;\n", liveCatalog()),
    /src\/assets\/js\/conversion-tracking\.js is missing PROPERTY_SLUG_BY_LISTING_ID generate seam/
  );
});

test("source client map equals the invert of the derived server map", () => {
  const trackingSource = fs.readFileSync(trackingPath, "utf8");
  assert.deepEqual(
    clientMapFrom(trackingSource),
    invertListingIdBySlug(listingIdBySlug(liveCatalog()))
  );
});

test("properties.js derives LISTING_ID_BY_SLUG from the catalog", () => {
  const propertiesSource = fs.readFileSync(propertiesPath, "utf8");
  assert.doesNotMatch(propertiesSource, /const LISTING_ID_BY_SLUG = \{/);
  assert.match(propertiesSource, /listingIdBySlug\(/);
});

test("generated client map equals the invert of the derived server map", () => {
  const catalog = liveCatalog();
  const bySlug = listingIdBySlug(catalog);
  const trackingSource = fs.readFileSync(trackingPath, "utf8");
  const generated = generateClientListingIdMap(trackingSource, catalog);
  assert.deepEqual(clientMapFrom(generated), invertListingIdBySlug(bySlug));
  assert.equal(clientMapFrom(generated)["589288"], "blue-house");
});

test("eleventy writes the generated client map during build", () => {
  const eleventySource = fs.readFileSync(eleventyPath, "utf8");
  assert.match(eleventySource, /writeGeneratedClientListingIdMap/);
});

test("writeGeneratedClientListingIdMap injects the catalog invert", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "listing-id-owned-"));
  const srcJs = path.join(tmp, "src", "assets", "js");
  const srcData = path.join(tmp, "src", "_data");
  fs.mkdirSync(srcJs, { recursive: true });
  fs.mkdirSync(srcData, { recursive: true });
  fs.writeFileSync(path.join(srcJs, "conversion-tracking.js"), "var PROPERTY_SLUG_BY_LISTING_ID = null;\n");
  fs.copyFileSync(fallbackPath, path.join(srcData, "properties-fallback.json"));
  const outputPath = writeGeneratedClientListingIdMap(tmp);
  assert.deepEqual(
    clientMapFrom(fs.readFileSync(outputPath, "utf8")),
    invertListingIdBySlug(listingIdBySlug(liveCatalog()))
  );
});

test("writeGeneratedClientListingIdMap fails when the owner file is missing", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "listing-id-owned-missing-"));
  fs.mkdirSync(path.join(tmp, "src", "assets", "js"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, "src", "assets", "js", "conversion-tracking.js"),
    "var PROPERTY_SLUG_BY_LISTING_ID = null;\n"
  );
  assert.throws(
    () => writeGeneratedClientListingIdMap(tmp),
    /src\/_data\/properties-fallback\.json is missing/
  );
});
