const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const seoPages = require("../../src/_data/seoPages.json");
const seoGovernance = require("../../src/_data/seoGovernance.js");

const rootDir = path.resolve(__dirname, "../..");
const triagePath = path.join(rootDir, "docs/portfolio/pseo-inventory-triage.md");

test("pSEO triage inventory covers generated stay and owner pages", () => {
  const triage = fs.readFileSync(triagePath, "utf8");
  const stayRecords = seoPages.vacationer || [];
  const ownerRecords = seoPages.owner || [];
  const totalRecords = stayRecords.length + ownerRecords.length;

  assert.match(triage, new RegExp(`All generated pSEO records: ${totalRecords}\\b`));
  assert.match(triage, new RegExp(`Stay records: ${stayRecords.length}\\b`));
  assert.match(triage, new RegExp(`Owner records: ${ownerRecords.length}\\b`));

  for (const page of stayRecords) {
    assert.match(triage, new RegExp(`/stays/${page.slug}/`), `missing stay page ${page.slug}`);
  }

  for (const page of ownerRecords) {
    assert.match(
      triage,
      new RegExp(`/property-management/${page.slug}/`),
      `missing owner page ${page.slug}`,
    );
  }
});

test("pSEO triage inventory preserves noindex and redirect classifications", () => {
  const triage = fs.readFileSync(triagePath, "utf8");

  for (const slug of seoGovernance.staysNoindexSlugs) {
    assert.match(
      triage,
      new RegExp(`/stays/${slug}/ \\| noindex \\|`),
      `missing noindex classification for ${slug}`,
    );
  }

  for (const page of seoPages.vacationer.filter((record) => record.rehomeTo)) {
    assert.match(
      triage,
      new RegExp(`/stays/${page.slug}/ -> ${page.rehomeTo.replace(/\//g, "\\/")} \\| redirect \\|`),
      `missing redirect classification for ${page.slug}`,
    );
  }
});

test("pSEO triage inventory documents the measured branch gate", () => {
  const triage = fs.readFileSync(triagePath, "utf8");

  assert.match(triage, /Current decision source: `docs\/status\/next-batch\.md`/);
  assert.match(triage, /Current reread status: `fresh but below threshold`/);
  assert.match(triage, /do not open a new owner, stay, guide, GEO, or SEO expansion branch/);
});
