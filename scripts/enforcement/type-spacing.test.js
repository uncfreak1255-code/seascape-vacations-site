"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function waterlineBlock(design) {
  const match = String(design || "").match(/waterline:\n([\s\S]*?)\n# LEGACY/);
  return match ? match[1] : "";
}

function yamlValue(block, key) {
  const match = String(block || "").match(new RegExp(`(?:^|\\n)\\s+${key}:\\s*"([^"]*)"`, "m"));
  return match ? match[1] : "";
}

test("empty or missing Waterline type tokens fail the gate", () => {
  assert.equal(waterlineBlock(""), "");
  assert.equal(yamlValue("", "lineHeight"), "");
  assert.ok(!yamlValue("typography:\n    body:\n      fontSize: \"\"\n", "fontSize"), "empty fontSize must fail");
});

test("DESIGN.md Waterline type and spacing match guest.css", () => {
  const design = read("DESIGN.md");
  const waterline = waterlineBlock(design);
  assert.ok(waterline, "missing waterline block");

  const bodySize = yamlValue(waterline, "fontSize");
  const bodyLead = yamlValue(waterline.match(/body:\n([\s\S]*?)\n    lede:/)[1], "lineHeight");
  const displayLead = yamlValue(waterline.match(/display:\n([\s\S]*?)\n    body:/)[1], "lineHeight");
  const displayTrack = yamlValue(waterline.match(/display:\n([\s\S]*?)\n    body:/)[1], "letterSpacing");
  const h1 = yamlValue(waterline, "h1");
  const section = yamlValue(waterline, "section");
  const sectionPhone = yamlValue(waterline, "section-phone");

  assert.equal(bodySize, "15px");
  assert.equal(bodyLead, "1.55");
  assert.equal(displayLead, "1.08");
  assert.equal(displayTrack, "-0.03em");
  assert.equal(h1, "clamp(44px,5vw,72px)");
  assert.equal(section, "60px");
  assert.equal(sectionPhone, "36px");
  assert.ok(Number.parseFloat(bodySize) >= 12, "body size must stay at or above the 12px floor");

  const css = read("src/css/guest.css");
  assert.match(css, /font-size:15px;line-height:1\.55/);
  assert.match(css, /letter-spacing:-\.03em;line-height:1\.08/);
  assert.match(css, /h1\{font-size:clamp\(44px,5vw,72px\)\}/);
  assert.match(css, /\.g-section\{padding:60px 0\}/);
  assert.match(css, /\.g-section\{padding:36px 0\}/);
  assert.doesNotMatch(css, /font-size:1[01]px/);
});

test("button and pill treatment stay locked while type tokens change", () => {
  const css = read("src/css/guest.css");
  assert.match(css, /--g-control-treatment:sliding-arrow-pill/);
  assert.match(css, /--g-control-radius:999px/);
  assert.match(css, /--g-button-arrow:1/);
  assert.match(css, /min-height:48px;padding:14px 24px/);
  assert.match(css, /font:500 14px\/1\.35 Poppins,sans-serif/);
  const design = read("DESIGN.md");
  assert.match(design, /control-treatment:\s*"sliding-arrow-pill"/);
});

test("guest.css cannot grow when type tokens change", () => {
  const now = fs.statSync(path.join(projectRoot, "src/css/guest.css")).size;
  const before = Number(
    execFileSync("git", ["cat-file", "-s", "HEAD:src/css/guest.css"], {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim()
  );
  assert.ok(now <= before, `guest.css grew from ${before} to ${now}; oversized files may not grow`);
});
