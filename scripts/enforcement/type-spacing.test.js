"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const assert = require("node:assert/strict");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function systemBlock(design) {
  const fm = String(design || "").match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const doc = yaml.load(fm[1]) || {};
  return doc.system || null;
}

test("empty or missing v4 type tokens fail the gate", () => {
  assert.equal(systemBlock(""), null);
  assert.equal(systemBlock("---\nname: x\n---\n"), null);
  const emptyColors = systemBlock("---\nsystem:\n  colors: {}\n---\n");
  assert.ok(emptyColors);
  assert.equal(Object.keys(emptyColors.colors || {}).length, 0);
  assert.equal(systemBlock("---\nsystem:\n  typography:\n    display:\n      fontFamily: \"\"\n---\n").typography.display.fontFamily, "");
});

test("DESIGN.md v4 type tokens and live guest.css sizes stay in lockstep this PR", () => {
  const design = read("DESIGN.md");
  const system = systemBlock(design);
  assert.ok(system && system.typography && system.typography.body, "missing system.typography.body");

  const body = system.typography.body;
  const display = system.typography.display;
  assert.equal(body.fontFamily, "Inter");
  assert.equal(body.fontSize, "15px");
  assert.equal(body.lineHeight, "1.55");
  assert.equal(display.fontFamily, "Inter");
  assert.equal(display.fontWeight, 600);
  assert.equal(display.fontStyle, "normal");
  assert.equal(display.lineHeight, "1.08");
  assert.equal(display.letterSpacing, "-0.03em");
  assert.equal(display.h1, "clamp(44px,5vw,72px)");
  assert.equal(system.space.section, "60px");
  assert.equal(system.space["section-mobile"], "36px");
  assert.ok(Number.parseFloat(body.fontSize) >= 12, "body size must stay at or above the 12px floor");

  const css = read("src/css/guest.css");
  assert.match(css, /font-size:15px;line-height:1\.55/);
  assert.match(css, /letter-spacing:-\.03em;line-height:1\.08/);
  assert.match(css, /h1\{font-size:clamp\(44px,5vw,72px\)\}/);
  assert.match(css, /\.g-section\{padding:60px 0\}/);
  assert.match(css, /\.g-section\{padding:36px 0\}/);
  assert.doesNotMatch(css, /font-size:1[01]px/);
  assert.match(css, /font-family:Inter,system-ui,sans-serif/);
  assert.match(css, /\.guest-site :is\(h1,h2,h3\),.guest-site :is\(h1,h2,h3\) em\{font-family:Inter,sans-serif;font-weight:600;font-style:normal/);
  assert.doesNotMatch(css, /h1,h2,h3\{[^}]*Instrument Serif/);
});

test("button shape stays locked while type tokens change", () => {
  const css = read("src/css/guest.css");
  assert.doesNotMatch(css, /--g-control-treatment|--g-control-radius|--g-button-arrow/);
  assert.match(css, /min-height:48px;padding:14px 24px;[^}]*border-radius:4px;font:500 14px\/1\.35 Inter,sans-serif/);
  assert.doesNotMatch(read("DESIGN.md"), /control-treatment/);
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

test("Inter is self-hosted with font-display swap and no heading italics", () => {
  const fonts = read("src/css/guest-fonts.css");
  assert.match(fonts, /font-family:Inter/);
  assert.match(fonts, /font-display:swap/);
  assert.match(fonts, /font-weight:100 900/);
  assert.doesNotMatch(fonts, /Instrument Serif[\s\S]{0,80}font-style:italic/);
  assert.match(fonts, /inter-latin-wght-3100e775e861\.woff2/);
});

test("guest-fonts.css ships live v4 colors without unused scale tokens", () => {
  const fonts = read("src/css/guest-fonts.css");
  assert.match(fonts, /--g-bg:#fff/);
  assert.match(fonts, /--g-ink:#1e2324/);
  assert.match(fonts, /--g-line:#e6e6e6/);
  assert.match(fonts, /--g-line-control:#ddd/);
  assert.match(fonts, /--g-accent:#173d42/);
  assert.doesNotMatch(fonts, /--g-space-1|--g-fs-display|--g-radius-card|--g-dur-press|--g-font-ui/);
});

test("concatenated guest.css stays at or under origin/main (stylesheet ratchet)", () => {
  const concatNow =
    read("src/css/guest-fonts.css") + "\n" + read("src/css/guest.css") + "\n" + read("src/css/motion.css");
  const show = (file) =>
    execFileSync("git", ["show", `origin/main:${file}`], {
      cwd: projectRoot,
      encoding: "utf8",
    });
  const concatMain =
    show("src/css/guest-fonts.css") + "\n" + show("src/css/guest.css") + "\n" + show("src/css/motion.css");
  assert.ok(
    concatNow.length <= concatMain.length,
    `concat guest.css grew from ${concatMain.length} to ${concatNow.length}; stylesheet ratchet forbids this`
  );
});

test("guest pages preload Inter, including the owner hub", () => {
  const layout = read("src/_includes/layouts/guest.njk");
  assert.match(layout, /inter-latin-wght-3100e775e861\.woff2/);
  assert.doesNotMatch(layout, /pageStylesheet and 'owner\.css'/);
});

test("owner landers preload Inter for ALL-SANS headings", () => {
  const lander = read("src/property-management/property-management.njk");
  const preloads = read("src/_includes/partials/guest-font-preloads.njk");
  assert.doesNotMatch(lander, /partials\/local-font-head\.njk/);
  assert.match(lander, /partials\/guest-font-preloads\.njk/);
  assert.match(preloads, /inter-latin-wght-3100e775e861\.woff2/);
});
