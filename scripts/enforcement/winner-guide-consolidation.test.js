const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");

test("winner-guide consolidation keeps duplicate .html aliases on direct canonical redirects", () => {
  for (const redirectRule of [
    "/guides/best-time-to-visit-anna-maria-island.html  /guides/best-time-visit-anna-maria-island/  301",
    "/guides/bradenton-vs-sarasota-vacation-rental-comparison.html  /guides/bradenton-vs-sarasota/  301"
  ]) {
    assert.equal(
      redirects.includes(redirectRule),
      true,
      `Expected redirects to include ${redirectRule}`
    );
  }
});
