const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  collectStaticFindings,
  extractFindingsFromText,
  isIndexableStaticSource,
  parseArgs,
  parseTriageClassMap,
  renderPatrol,
  routeFromSourcePath,
} = require("../seo/content-decay-patrol");

test("routeFromSourcePath maps common source files to public routes", () => {
  assert.equal(routeFromSourcePath("src/index.njk"), "/");
  assert.equal(routeFromSourcePath("src/guides/bradenton-vs-sarasota.html"), "/guides/bradenton-vs-sarasota/");
  assert.equal(routeFromSourcePath("src/guides/bradenton-area-guide/index.html"), "/guides/bradenton-area-guide/");
  assert.equal(routeFromSourcePath("src/research/owner-fee-revenue-leak-benchmark-2026.njk"), "/research/owner-fee-revenue-leak-benchmark-2026/");
  assert.equal(routeFromSourcePath("src/stays/stays.njk"), "template: src/stays/stays.njk");
});

test("static source patrol skips ignored, permalink false, and noindex pages", () => {
  assert.equal(
    isIndexableStaticSource(
      "src/guides/best-time-to-visit-anna-maria-island/index.html",
      `---
permalink: false
eleventyExcludeFromCollections: true
---
<meta name="robots" content="noindex, follow">
<p>Updated March 2026</p>`,
    ),
    false,
  );
  assert.equal(
    isIndexableStaticSource(
      "src/guides/live-guide.html",
      `<meta name="robots" content="index, follow"><p>Updated March 2026</p>`,
    ),
    true,
  );
  assert.equal(
    isIndexableStaticSource(
      "src/guides/collection-hidden-live-guide.html",
      `---
eleventyExcludeFromCollections: true
---
<meta name="robots" content="index, follow"><p>Updated March 2026</p>`,
    ),
    true,
  );

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "content-decay-patrol-"));
  try {
    fs.mkdirSync(path.join(tempRoot, "src/guides/ignored-guide"), { recursive: true });
    fs.writeFileSync(
      path.join(tempRoot, "src/guides/ignored-guide/index.html"),
      `---
permalink: false
eleventyExcludeFromCollections: true
---
<meta name="robots" content="noindex, follow">
<p>Updated March 2026</p>`,
    );
    fs.writeFileSync(
      path.join(tempRoot, "src/guides/live-guide.html"),
      `<meta name="robots" content="index, follow"><p>Updated March 2026</p>`,
    );

    const findings = collectStaticFindings({
      root: tempRoot,
      asOf: new Date("2026-06-20T00:00:00Z"),
      staleDays: 90,
    });

    assert.deepEqual(
      findings.map((finding) => finding.source),
      ["src/guides/live-guide.html"],
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("extractFindingsFromText flags stale updated labels and dateModified values", () => {
  const findings = extractFindingsFromText({
    route: "/guides/bradenton-vs-sarasota/",
    source: "src/guides/bradenton-vs-sarasota.html",
    asOf: new Date("2026-06-20T00:00:00Z"),
    staleDays: 90,
    text: `
      <p class="guide-meta">Updated March 2026 - 8 min read</p>
      <script>{"dateModified": "2026-03-03T12:00:00-04:00"}</script>
    `,
  });

  assert.deepEqual(
    findings.map((finding) => finding.issueType),
    [
      "dated-proof-label-over-threshold",
      "stale-date-modified",
    ],
  );
  assert.equal(findings.every((finding) => finding.severity === "high"), true);
});

test("extractFindingsFromText does not flag fresh current-month labels", () => {
  const findings = extractFindingsFromText({
    route: "/research/owner-fee-revenue-leak-benchmark-2026/",
    source: "src/research/owner-fee-revenue-leak-benchmark-2026.njk",
    asOf: new Date("2026-06-20T00:00:00Z"),
    staleDays: 90,
    text: `<p>Last refreshed: June 2026</p><script>{"dateModified": "2026-06-15"}</script>`,
  });

  assert.deepEqual(findings, []);
});

test("extractFindingsFromText flags old visible updated labels", () => {
  const findings = extractFindingsFromText({
    route: "/guides/example/",
    source: "src/guides/example.html",
    asOf: new Date("2026-06-20T00:00:00Z"),
    staleDays: 90,
    text: `<p>Updated 2025</p>`,
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].issueType, "old-visible-updated-label");
  assert.equal(findings[0].severity, "medium");
});

test("extractFindingsFromText treats historical ranges by their ending date", () => {
  const findings = extractFindingsFromText({
    route: "/research/gulf-coast-vacation-booking-trends-2026/",
    source: "src/research/gulf-coast-vacation-booking-trends-2026.njk",
    asOf: new Date("2026-06-20T00:00:00Z"),
    staleDays: 90,
    text: `The dataset covers confirmed bookings from June 2022 through March 2026.`,
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].issueType, "dated-proof-label-over-threshold");
  assert.equal(findings[0].ageDays, 111);
});

test("parseTriageClassMap reads pSEO classes from the generated inventory", () => {
  const map = parseTriageClassMap(`
| URL | Class | Evidence | Next action |
| --- | --- | --- | --- |
| /stays/pet-friendly-vacation-rentals-bradenton/ | consolidate | Thin one-property amenity page. | Wait for proof. |
| /stays/holiday-vacation-rentals-anna-maria-island/ -> /stays/anna-maria-island-vacation-rentals/ | redirect | Rehome. | Keep redirect. |
`);

  assert.equal(map.get("/stays/pet-friendly-vacation-rentals-bradenton/"), "consolidate");
  assert.equal(map.get("/stays/holiday-vacation-rentals-anna-maria-island/"), "redirect");
});

test("renderPatrol includes gate warning and sorted priority rows", () => {
  const markdown = renderPatrol({
    asOf: new Date("2026-06-20T00:00:00Z"),
    staleDays: 90,
    findings: [
      {
        route: "/guides/example/",
        source: "src/guides/example.html",
        issueType: "old-visible-updated-label",
        severity: "medium",
        ageDays: 200,
        evidence: "Updated 2025",
        nextAction: "Review before edit.",
      },
      {
        route: "/guides/bradenton-vs-sarasota/",
        source: "src/guides/bradenton-vs-sarasota.html",
        issueType: "stale-date-modified",
        severity: "high",
        ageDays: 109,
        evidence: "dateModified 2026-03-03",
        nextAction: "Run rescue check.",
      },
    ],
  });

  assert.match(markdown, /Gate: this is a patrol queue, not source-edit approval/);
  assert.match(markdown, /High-priority findings on tracked winner\/money routes: `1`/);
  assert.ok(
    markdown.indexOf("/guides/bradenton-vs-sarasota/") < markdown.indexOf("/guides/example/"),
    "high-priority route should sort before medium watch rows",
  );
});

test("parseArgs validates stale threshold and as-of date", () => {
  assert.equal(parseArgs(["--as-of", "2026-06-20", "--stale-days", "45"]).staleDays, 45);
  assert.throws(() => parseArgs(["--as-of", "2026/06/20"]), /YYYY-MM-DD/);
  assert.throws(() => parseArgs(["--as-of", "2026-02-31"]), /real date/);
  assert.throws(() => parseArgs(["--stale-days", "0"]), /positive integer/);
});
