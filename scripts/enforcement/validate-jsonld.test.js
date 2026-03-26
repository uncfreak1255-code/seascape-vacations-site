const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");

function runValidator(cwd) {
  try {
    const out = execFileSync("node", [
      path.resolve(__dirname, "validate-jsonld.js")
    ], {
      encoding: "utf8",
      cwd,
      env: { ...process.env }
    });
    return { status: 0, output: out };
  } catch (err) {
    return { status: err.status, output: (err.stderr || "") + (err.stdout || "") };
  }
}

function makeSite(tmpDir, files) {
  const siteDir = path.join(tmpDir, "_site");
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(siteDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return tmpDir;
}

test("validate-jsonld recurses into nested objects and finds nested AggregateOffer", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonld-nested-"));
  // AggregateOffer nested under offers in a VacationRental — should be validated
  const html = `<html><head>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "name": "Test Property",
  "address": { "@type": "PostalAddress", "addressLocality": "Bradenton" },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD"
  }
}</script>
</head><body></body></html>`;

  makeSite(tmp, { "index.html": html });
  const result = runValidator(tmp);
  // Should fail: AggregateOffer is missing lowPrice and highPrice
  assert.notEqual(result.status, 0, "should fail for incomplete nested AggregateOffer");
  assert.ok(result.output.includes('missing required field "lowPrice"'));
  assert.ok(result.output.includes('missing required field "highPrice"'));
});

test("validate-jsonld passes when nested AggregateOffer is complete", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonld-nested-ok-"));
  const html = `<html><head>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "name": "Test Property",
  "address": { "@type": "PostalAddress", "addressLocality": "Bradenton" },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "350",
    "highPrice": "900",
    "priceCurrency": "USD"
  }
}</script>
</head><body></body></html>`;

  makeSite(tmp, { "index.html": html });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass for complete nested AggregateOffer");
});

test("validate-jsonld recurses into nested SearchAction under WebSite", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonld-search-"));
  // WebSite with nested SearchAction (which itself has nested EntryPoint)
  const html = `<html><head>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Test Site",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/search?q={q}"
    },
    "query-input": "required name=q"
  }
}</script>
</head><body></body></html>`;

  makeSite(tmp, { "index.html": html });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass for WebSite with nested SearchAction");
});

test("validate-jsonld skips required-field checks on reference properties (itemReviewed)", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonld-ref-"));
  // Review with itemReviewed VacationRental that has name but no address
  const html = `<html><head>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Review",
  "reviewBody": "Great stay!",
  "author": { "@type": "Person", "name": "Jane" },
  "itemReviewed": {
    "@type": "VacationRental",
    "name": "Test Place",
    "url": "https://example.com/test"
  }
}</script>
</head><body></body></html>`;

  makeSite(tmp, { "index.html": html });
  const result = runValidator(tmp);
  // Should pass: itemReviewed is a reference, address not required
  assert.equal(result.status, 0, "should pass — itemReviewed VacationRental is a reference");
});

test("validate-jsonld validates @graph nodes", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonld-graph-"));
  const html = `<html><head>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "Test",
      "url": "https://example.com"
    }
  ]
}</script>
</head><body></body></html>`;

  makeSite(tmp, { "index.html": html });
  const result = runValidator(tmp);
  // WebSite missing potentialAction
  assert.notEqual(result.status, 0, "should fail for WebSite missing potentialAction in @graph");
  assert.ok(result.output.includes('missing required field "potentialAction"'));
});
