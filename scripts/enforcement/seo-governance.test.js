const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const homepagePath = path.resolve(__dirname, "../../src/index.njk");
const bradentonGuidePath = path.resolve(__dirname, "../../src/guides/bradenton-vs-sarasota.html");
const amiVsSiestaGuidePath = path.resolve(__dirname, "../../src/guides/anna-maria-island-vs-siesta-key.html");

const homepageTemplate = fs.readFileSync(homepagePath, "utf8");
const bradentonGuide = fs.readFileSync(bradentonGuidePath, "utf8");
const amiVsSiestaGuide = fs.readFileSync(amiVsSiestaGuidePath, "utf8");

const HOMEPAGE_ALIAS_LINKS = [
  "area-guide-ami.html",
  "area-guide-bradenton.html",
  "area-guide-sarasota.html",
  "area-guide-siesta-key.html"
];

function countMatches(input, pattern) {
  const matches = String(input).match(pattern);
  return matches ? matches.length : 0;
}

test("homepage removes legacy destination aliases and blog-shell content", () => {
  for (const aliasHref of HOMEPAGE_ALIAS_LINKS) {
    assert.ok(
      !homepageTemplate.includes(aliasHref),
      `Expected homepage source to stop linking ${aliasHref}`
    );
  }

  assert.ok(
    !homepageTemplate.includes('id="page-blog"'),
    'Expected homepage source to remove the embedded "page-blog" shell'
  );

  assert.ok(
    !homepageTemplate.includes("Updated 2025"),
    "Expected homepage source to remove stale 2025 article metadata"
  );
});

test("homepage keeps a single document-level h1", () => {
  assert.equal(
    countMatches(homepageTemplate, /<h1\b/g),
    1,
    "Expected homepage source to contain exactly one h1"
  );
});

test("priority guides stop emitting internal .html guide links", () => {
  assert.equal(
    countMatches(bradentonGuide, /href="\/guides\/[^"]+\.html"/g),
    0,
    "Expected Bradenton vs Sarasota to stop linking internal .html guide routes"
  );

  assert.equal(
    countMatches(amiVsSiestaGuide, /href="\/guides\/[^"]+\.html"/g),
    0,
    "Expected Anna Maria Island vs Siesta Key to stop linking internal .html guide routes"
  );
});

test("priority guides add named author treatment and evidence blocks", () => {
  for (const [label, html] of [
    ["Bradenton vs Sarasota", bradentonGuide],
    ["Anna Maria Island vs Siesta Key", amiVsSiestaGuide]
  ]) {
    assert.match(
      html,
      /<meta name="author" content="Sawyer Beck">/,
      `Expected ${label} to expose Sawyer Beck in meta author`
    );

    assert.match(
      html,
      /data-guide-author="sawyer-beck"/,
      `Expected ${label} to include visible named-author treatment`
    );

    assert.match(
      html,
      /class="evidence-card"/,
      `Expected ${label} to include an evidence-forward block`
    );

    assert.match(
      html,
      /"@type": "Person"[\s\S]*"name": "Sawyer Beck"/,
      `Expected ${label} to upgrade article schema author to Sawyer Beck`
    );
  }
});
