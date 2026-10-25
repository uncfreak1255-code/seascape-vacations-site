"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ALLOWED = new Set(["sliding-arrow-pill", "ink-pill", "ink-rounded"]);

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function readTreatment(css) {
  const match = String(css || "").match(/--g-control-treatment:([^;\s]+)/);
  return match ? match[1].trim() : "";
}

test("empty or missing control-treatment fails the gate", () => {
  assert.equal(readTreatment(""), "");
  assert.equal(readTreatment(".guest-site{color:red}"), "");
  assert.equal(readTreatment("--g-control-treatment:;"), "");
  assert.ok(!readTreatment(""), "empty CSS must fail");
});

test("guest.css ships one named --g-control-treatment token", () => {
  const css = read("src/css/guest.css");
  const treatment = readTreatment(css);
  assert.ok(treatment, "missing --g-control-treatment");
  assert.equal(ALLOWED.has(treatment), true, `unknown treatment ${treatment}`);
  assert.equal(treatment, "sliding-arrow-pill");
  assert.match(css, /--g-control-radius:999px/);
  assert.match(css, /--g-button-arrow:1/);
  assert.match(css, /border-radius:var\(--g-control-radius\)/);
  assert.match(css, /\.g-button::after\{content:"";position:static;inset:auto;border:0;border-radius:0/);
  assert.match(css, /ink-pill/);
  assert.match(css, /ink-rounded/);
});

test("DESIGN.md waterline token matches the CSS default", () => {
  const design = read("DESIGN.md");
  assert.match(design, /control-treatment:\s*"sliding-arrow-pill"/);
  assert.match(design, /button:\s*"999px"/);
  const css = read("src/css/guest.css");
  assert.equal(readTreatment(css), "sliding-arrow-pill");
});
