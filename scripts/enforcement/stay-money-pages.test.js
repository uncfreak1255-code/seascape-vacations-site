const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("node:child_process");
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
    "This trip fits best when",
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

  assert.equal(
    beachfrontPage.matchingProperties.includes("sarasota-luxe"),
    false,
    "beachfront alternative should not feature Sarasota Luxe as an AMI beach-base fit"
  );

  assert.equal(
    Array.isArray(beachfrontPage.propertyFacts),
    true,
    "beachfront alternative should expose source-backed beach distance facts"
  );
  assert.equal(beachfrontPage.propertyFacts.length >= 3, true);
  assert.match(serialized, /2\.9 mi|5\.4 mi|about 5 mi \/ 15 min/);
});

test("AMI vacation rentals page does not promise free water-sports gear that is not actually included", () => {
  const amiPage = getStayPage("anna-maria-island-vacation-rentals");
  const serialized = JSON.stringify(amiPage).toLowerCase();

  for (const staleClaim of [
    "complimentary kayaks",
    "complimentary beach gear, kayaks, and fishing equipment",
    "we also provide complimentary beach gear, kayaks, and fishing equipment"
  ]) {
    assert.equal(serialized.includes(staleClaim), false, `AMI stay page should not include ${staleClaim}`);
  }
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

test("best-time guide exposes an early tracked seasonal stay choice", () => {
  const guidePath = path.join(
    projectRoot,
    "src",
    "guides",
    "best-time-visit-anna-maria-island.html"
  );
  const source = fs.readFileSync(guidePath, "utf8");
  const decisionSurface = source.match(
    /<section[^>]*data-season-stay-choice[^>]*>[\s\S]*?<\/section>/
  );

  assert.ok(decisionSurface, "best-time guide should expose data-season-stay-choice");

  for (const href of [
    "/stays/anna-maria-island-vacation-rentals/",
    "/stays/anna-maria-island-beachfront-rentals/"
  ]) {
    assert.match(decisionSurface[0], new RegExp(`href=["']${href}["']`));
  }

  assert.equal(
    (decisionSurface[0].match(/data-track-event="guide_book_direct_click"/g) || []).length,
    2,
    "both seasonal stay choices should emit guide_book_direct_click"
  );
  assert.equal(
    (decisionSurface[0].match(/data-guide-slug="best-time-visit-anna-maria-island"/g) || []).length,
    2,
    "both seasonal stay choices should retain the guide slug"
  );
  assert.equal(
    (decisionSurface[0].match(/data-placement="best_time_season_choice"/g) || []).length,
    2,
    "only the early seasonal choices should carry the scoped readback placement"
  );
  assert.match(
    decisionSurface[0],
    /show the same near-island homes[\s\S]*shows the same homes/,
    "the module must state plainly that both choices currently show the same homes"
  );
});

test("best-time guide uses its valid seasonal hero and current article metadata", () => {
  const guidePath = path.join(
    projectRoot,
    "src",
    "guides",
    "best-time-visit-anna-maria-island.html"
  );
  const source = fs.readFileSync(guidePath, "utf8");
  const seasonalHero = "anna-maria-island-seasonal-hero.jpg";

  assert.equal(
    (source.match(new RegExp(seasonalHero, "g")) || []).length,
    4,
    "the visible hero, Open Graph, Twitter, and Article metadata should use the seasonal image"
  );
  assert.equal(
    source.includes("anna-maria-island-og.jpg"),
    false,
    "the guide should not replace the shared Anna Maria Island image"
  );
  assert.match(source, /"dateModified": "2026-07-28"/);

  for (const filename of ["anna-maria-island-og.jpg", seasonalHero]) {
    const image = fs.readFileSync(path.join(projectRoot, "images", filename));

    assert.ok(image.length > 100_000, `${filename} should contain a complete image payload`);
    assert.deepEqual(
      Array.from(image.subarray(0, 3)),
      [0xff, 0xd8, 0xff],
      `${filename} should begin with a JPEG signature`
    );
    assert.deepEqual(
      Array.from(image.subarray(-2)),
      [0xff, 0xd9],
      `${filename} should end with a JPEG marker`
    );
  }
});

test("guide normalization preserves all seasonal hero references on the best-time guide", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "best-time-guide-normalize-"));
  const tempGuideRoot = path.join(tempRoot, "src", "guides");
  const tempDataRoot = path.join(tempRoot, "src", "_data");
  const guideFilename = "best-time-visit-anna-maria-island.html";

  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
  fs.mkdirSync(tempGuideRoot, { recursive: true });
  fs.mkdirSync(tempDataRoot, { recursive: true });
  fs.copyFileSync(
    path.join(projectRoot, "src", "guides", guideFilename),
    path.join(tempGuideRoot, guideFilename)
  );
  fs.copyFileSync(
    path.join(projectRoot, "src", "_data", "site.json"),
    path.join(tempDataRoot, "site.json")
  );

  execFileSync(
    process.execPath,
    [path.join(projectRoot, "scripts", "guides", "normalize-guides.js")],
    {
      env: { ...process.env, SEASCAPE_NORMALIZE_ROOT: tempRoot },
      stdio: "pipe"
    }
  );

  const normalized = fs.readFileSync(path.join(tempGuideRoot, guideFilename), "utf8");
  assert.equal(
    (normalized.match(/anna-maria-island-seasonal-hero\.jpg/g) || []).length,
    4
  );
  assert.equal(normalized.includes("anna-maria-island-og.jpg"), false);
});
