const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const THREE_HOME_SLUG = "anna-maria-island-homes-with-pool";

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function directBookHomeCount(html) {
  const match = String(html || "").match(
    /<span class="stat-value">\s*([^<]+?)\s*<\/span>\s*<span class="stat-label">Direct-book homes<\/span>/i
  );
  return match ? match[1].trim() : null;
}

function assertListedHomeCount(html, expected) {
  const actual = directBookHomeCount(html);
  assert.equal(
    actual,
    String(expected),
    `Direct-book homes should be ${expected}, got ${actual}`
  );
}

test("stay template counts matched homes instead of the full portfolio", () => {
  const template = read(path.join("src", "stays", "stays.njk"));

  assert.match(
    template,
    /listedHomeCount/,
    "stays template should compute a listed-home count for the Direct-book homes stat"
  );
  assert.doesNotMatch(
    template,
    /stat-value">\{\{\s*properties\.length if properties else "5"\s*\}\}/,
    "stays template must not fall back to the full portfolio count for Direct-book homes"
  );
  assert.match(
    template,
    /seoPage\.matchingProperties\.length if seoPage\.matchingProperties and seoPage\.matchingProperties\.length else 0/,
    "listed-home count should use matchingProperties with a zero fallback"
  );
});

test("listed-home count helper fails when a 3-home page claims the full portfolio", () => {
  assert.throws(() => {
    assertListedHomeCount(
      '<span class="stat-value">5</span><span class="stat-label">Direct-book homes</span>',
      3
    );
  }, /Direct-book homes should be 3, got 5/);
});

test("a stay leaf that lists 3 homes does not claim 5 Direct-book homes", () => {
  const seoPages = JSON.parse(read(path.join("src", "_data", "seoPages.json")));
  const stayPage = seoPages.vacationer.find((entry) => entry.slug === THREE_HOME_SLUG);
  assert.ok(stayPage, `missing stay page ${THREE_HOME_SLUG}`);
  assert.equal(stayPage.matchingProperties.length, 3);

  const builtPath = path.join(
    projectRoot,
    "_site",
    "stays",
    THREE_HOME_SLUG,
    "index.html"
  );
  assert.equal(fs.existsSync(builtPath), true, `expected built stay page at ${builtPath}`);

  const html = fs.readFileSync(builtPath, "utf8");
  assertListedHomeCount(html, 3);
  assert.notEqual(directBookHomeCount(html), "5");
});
