const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertConsistentHtmlCachePolicy
} = require("./release-cache-policy");

const projectRoot = path.resolve(__dirname, "..", "..");

test("repo cache policy keeps _headers HTML routes aligned with netlify.toml", () => {
  const netlifyTomlContents = fs.readFileSync(path.join(projectRoot, "netlify.toml"), "utf8");
  const headersContents = fs.readFileSync(path.join(projectRoot, "_headers"), "utf8");

  assert.doesNotThrow(() => {
    assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents });
  });
});

test("cache policy guard rejects HTML-family overrides that drift from netlify.toml", () => {
  const netlifyTomlContents = `
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`;

  const headersContents = `
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

/property-management/*
  Cache-Control: public, max-age=3600, must-revalidate

/*.css
  Cache-Control: public, max-age=31536000, immutable
`;

  assert.throws(() => {
    assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents });
  }, /HTML cache policy drift/);
});

test("cache policy guard accepts css/js routes when they match the canonical revalidation policy", () => {
  const netlifyTomlContents = `
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`;

  const headersContents = `
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.css
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=0, must-revalidate
`;

  assert.doesNotThrow(() => {
    assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents });
  });
});

test("cache policy guard rejects css/js asset drift even when HTML routes align", () => {
  const netlifyTomlContents = `
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`;

  const headersContents = `
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=31536000, immutable
`;

  assert.throws(() => {
    assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents });
  }, /HTML cache policy drift/);
});
