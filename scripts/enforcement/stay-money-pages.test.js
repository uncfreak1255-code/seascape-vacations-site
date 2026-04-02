const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const stayPages = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src", "_data", "seoPages.json"), "utf8")
).vacationer;

function getStayPage(slug) {
  const page = stayPages.find((entry) => entry.slug === slug);
  assert.ok(page, `missing stay page ${slug}`);
  return page;
}

test("stays template exposes the shared modules required for money-page landers", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  for (const marker of [
    "seoPage.tripMatchCards",
    "seoPage.valueComparison",
    "seoPage.relatedGuideLinks",
    "Choose this page if",
    "How this stay path compares",
    "Use these guides before you book"
  ]) {
    assert.equal(staysTemplate.includes(marker), true, `stays template missing ${marker}`);
  }
});

test("priority AMI stay money pages carry trip-match, value-comparison, and guide-routing data", () => {
  for (const slug of [
    "anna-maria-island-vacation-rentals",
    "anna-maria-island-beachfront-rentals"
  ]) {
    const page = getStayPage(slug);

    assert.equal(Array.isArray(page.tripMatchCards), true, `${slug} missing tripMatchCards`);
    assert.equal(page.tripMatchCards.length >= 3, true, `${slug} should carry at least 3 tripMatchCards`);
    assert.equal(typeof page.valueComparison, "object", `${slug} missing valueComparison`);
    assert.equal(Array.isArray(page.valueComparison?.rows), true, `${slug} missing valueComparison rows`);
    assert.equal(page.valueComparison.rows.length >= 3, true, `${slug} should carry at least 3 valueComparison rows`);
    assert.equal(Array.isArray(page.relatedGuideLinks), true, `${slug} missing relatedGuideLinks`);
    assert.equal(page.relatedGuideLinks.length >= 3, true, `${slug} should carry at least 3 relatedGuideLinks`);
  }
});

test("AMI beachfront page stays honest about near-island positioning instead of faking walk-out beachfront inventory", () => {
  const beachfrontPage = getStayPage("anna-maria-island-beachfront-rentals");
  const serialized = JSON.stringify(beachfrontPage).toLowerCase();

  assert.match(
    serialized,
    /(12-25 minutes|12\u201325 minutes|not directly on the beach|not directly on the sand|off-island|near-island)/,
    "beachfront page should explicitly explain the near-island tradeoff"
  );
});

test("AMI comparison and planning guides route into the rebuilt AMI stay money pages", () => {
  const guides = [
    "src/guides/anna-maria-island-vs-siesta-key.html",
    "src/guides/siesta-key-vs-anna-maria-island-families.html",
    "src/guides/best-time-visit-anna-maria-island.html"
  ];

  for (const guide of guides) {
    const source = fs.readFileSync(path.join(projectRoot, guide), "utf8");

    for (const href of [
      "/stays/anna-maria-island-vacation-rentals/",
      "/stays/anna-maria-island-beachfront-rentals/"
    ]) {
      assert.equal(source.includes(href), true, `${guide} should include ${href}`);
    }
  }
});
