const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeComparablePath,
  readPageFamilyInventory
} = require("./page-family-inventory");
const { parseRedirects } = require("./validate-redirect-targets");

const projectRoot = path.resolve(__dirname, "..", "..");
const redirects = parseRedirects(path.join(projectRoot, "src", "_redirects"));
const winnerGuideEntries = readPageFamilyInventory(projectRoot).filter(
  (entry) => entry.family === "winner-guides"
);

test("winner-guide consolidation keeps duplicate .html aliases on direct canonical redirects", () => {
  for (const entry of winnerGuideEntries) {
    for (const alias of entry.aliases.filter((urlPath) => urlPath.endsWith(".html"))) {
      const rule = redirects.find((redirect) => redirect.from === alias);

      assert.ok(rule, `Expected redirects to include ${alias}`);
      assert.equal(rule.code, "301", `${alias} should be a permanent redirect`);
      assert.equal(
        normalizeComparablePath(rule.to),
        normalizeComparablePath(entry.winnerUrl),
        `${alias} should redirect directly to ${entry.winnerUrl}`
      );
    }
  }
});

test("winner-guide aliases stay out of the documented winner set", () => {
  const winnerUrls = new Set(winnerGuideEntries.map((entry) => entry.winnerUrl));

  for (const entry of winnerGuideEntries) {
    for (const alias of entry.aliases) {
      assert.equal(
        winnerUrls.has(alias),
        false,
        `${alias} is documented as an alias but also appears as a winner guide`
      );
    }
  }
});

test("best-time guide variants are documented and redirected to the slash canonical", () => {
  const bestTimeEntry = winnerGuideEntries.find(
    (entry) => entry.winnerUrl === "/guides/best-time-visit-anna-maria-island/"
  );

  assert.ok(bestTimeEntry, "best-time guide should be tracked as a winner guide");

  for (const alias of [
    "/guides/best-time-visit-anna-maria-island",
    "/guides/best-time-visit-anna-maria-island.html",
    "/guides/best-time-visit-anna-maria-island/index.html",
    "/guides/best-time-to-visit-anna-maria-island",
    "/guides/best-time-to-visit-anna-maria-island/",
    "/guides/best-time-to-visit-anna-maria-island.html",
    "/guides/best-time-to-visit-anna-maria-island/index.html"
  ]) {
    assert.ok(
      bestTimeEntry.aliases.includes(alias),
      `${alias} should be documented as a best-time guide alias`
    );

    const rule = redirects.find((redirect) => redirect.from === alias);
    assert.ok(rule, `Expected redirects to include ${alias}`);
    assert.equal(rule.code, "301", `${alias} should be a permanent redirect`);
    assert.equal(
      normalizeComparablePath(rule.to),
      normalizeComparablePath(bestTimeEntry.winnerUrl),
      `${alias} should redirect directly to ${bestTimeEntry.winnerUrl}`
    );
  }
});
