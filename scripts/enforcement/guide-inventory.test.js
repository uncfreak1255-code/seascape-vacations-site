const path = require("path");
const assert = require("node:assert/strict");
const test = require("node:test");

const { extractGuideInventoryFromHtml } = require("../seo/guide-inventory");

test("extracts guide inventory from HTML with complete guide elements", () => {
  const html = [
    "<html><head>",
    '<title>Siesta Key Luxury Guide</title>',
    '<meta name="description" content="A guide to planning your Siesta Key stay.">',
    '<meta property="og:title" content="Fallback OG Guide Title">',
    '<meta property="og:description" content="Fallback OG description">',
    '<link rel="canonical" href="https://seascape-vacations.com/guides/siesta-key-vacation-rentals/">',
    "</head><body>",
    '<h1>Siesta Key Vacation Rentals</h1>',
    "<p>The first intro paragraph gives context.</p>",
    "<p>The second intro paragraph adds more context.</p>",
    "<h2>Highlights</h2>",
    "<p>Body paragraph that should not be in intro.</p>",
    "<script type=\"application/ld+json\">",
    '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Are kids welcome?","acceptedAnswer":{"@type":"Answer","text":"Yes."}}]}',
    "</script>",
    '<section class="guide-links">',
    '<a href="/guides/guide-a/">Guide A</a>',
    '<a href="/guides/guide-b/">Guide B</a>',
    '<a href="/stays/siesta-key-area-vacation-rentals/">Stay Index</a>',
    "</section>",
    "</body></html>"
  ].join("");

  const result = extractGuideInventoryFromHtml(
    path.join("src", "guides", "siesta-key-area-guide", "index.html"),
    html
  );

  assert.equal(result.filePath, path.join("src", "guides", "siesta-key-area-guide", "index.html"));
  assert.equal(result.slug, "/guides/siesta-key-area-guide/");
  assert.equal(result.url, "https://seascape-vacations.com/guides/siesta-key-vacation-rentals/");
  assert.equal(result.title, "Siesta Key Luxury Guide");
  assert.equal(result.metaDescription, "A guide to planning your Siesta Key stay.");
  assert.equal(result.firstH1, "Siesta Key Vacation Rentals");
  assert.deepEqual(result.introParagraphs, [
    "The first intro paragraph gives context.",
    "The second intro paragraph adds more context."
  ]);
  assert.equal(result.faqJsonLd.present, true);
  assert.equal(result.faqJsonLd.count, 1);
  assert.equal(result.faqJsonLd.schemas[0].parsed["@type"], "FAQPage");
  assert.equal(result.faqJsonLd.schemas[0].questionCount, 1);
  assert.deepEqual(result.relatedGuideLinks, [
    "/guides/guide-a/",
    "/guides/guide-b/"
  ]);
  assert.equal(result.bodyTextWordCount, 32);
  assert.equal(result.canPatchMetadata, true);
  assert.equal(result.canPatchIntro, true);
  assert.equal(result.canPatchFaq, true);
  assert.equal(result.canPatchRelatedLinks, true);
});

test("derives slug and fallback metadata from non-canonical OG tags", () => {
  const html = [
    "<html><head>",
    '<meta property="og:title" content="Legacy Guide Title">',
    '<meta property="og:description" content="Legacy OG description.">',
    "</head>",
    "<body><h1>Legacy Guide</h1>",
    "<p>Only one intro paragraph here.</p></body></html>"
  ].join("");

  const result = extractGuideInventoryFromHtml(
    path.join("src", "guides", "legacy-guide.html"),
    html
  );

  assert.equal(result.slug, "/guides/legacy-guide/");
  assert.equal(result.url, "https://seascape-vacations.com/guides/legacy-guide/");
  assert.equal(result.title, "Legacy Guide Title");
  assert.equal(result.metaDescription, "Legacy OG description.");
  assert.equal(result.introParagraphs[0], "Only one intro paragraph here.");
  assert.deepEqual(result.relatedGuideLinks, []);
  assert.equal(result.canPatchMetadata, true);
  assert.equal(result.canPatchIntro, true);
  assert.equal(result.canPatchFaq, false);
  assert.equal(result.canPatchRelatedLinks, false);
});

test("detects malformed FAQ JSON-LD as present but not patch-safe", () => {
  const html = [
    "<html><head>",
    '<title>Broken FAQ Guide</title>',
    '<meta name="description" content="Guide with malformed FAQ JSON-LD.">',
    "</head><body>",
    "<h1>Broken FAQ Guide</h1><p>Intro text for fallback.</p><h2>Body</h2>",
    '<script type="application/ld+json">{ "@context":"https://schema.org", "@type":"FAQPage", "mainEntity":[{ "broken": "json" }</script>',
    "</body></html>"
  ].join("");

  const result = extractGuideInventoryFromHtml(
    path.join("src", "guides", "broken-faq-guide.html"),
    html
  );

  assert.equal(result.faqJsonLd.present, true);
  assert.equal(result.faqJsonLd.count, 1);
  assert.equal(result.canPatchFaq, false);
  assert.equal(result.canPatchMetadata, true);
});
