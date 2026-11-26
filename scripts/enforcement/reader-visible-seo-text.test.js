const test = require("node:test");
const assert = require("node:assert/strict");
const { readerVisibleSeoText } = require("./reader-visible-seo-text");
const performanceClaimScan = require("./performance-claim-scan");

test("keeps nested reader strings and skips URL fields and URL values", () => {
  const text = readerVisibleSeoText({
    slug: "x-page",
    title: "Visible title",
    image: "photo.jpg",
    faqs: [{ q: "Question?", a: "Answer.", sourceUrl: "/source/" }],
    links: ["https://example.com/", "//cdn.example.com/x.jpg", "Plain label"]
  });
  assert.equal(text, "Visible title\nQuestion?\nAnswer.\nPlain label");
});

test("performance-claim-scan re-exports the shared walker", () => {
  assert.equal(performanceClaimScan.readerVisibleSeoText, readerVisibleSeoText);
});
