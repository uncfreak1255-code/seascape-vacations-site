"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
  run,
  loadBaseline,
  evaluate,
  buildPaletteAllowlist,
  lintSource,
  resolveBaseRef,
} = require("../design/design-lint.js");
const { designLintBaseFromRange, buildCommandSteps } = require("./verify-release.js");

test("design-lint resolves the actual PR base without hardcoding main", () => {
  assert.equal(resolveBaseRef([], {}), "origin/main");
  assert.equal(resolveBaseRef([], { GITHUB_BASE_REF: "codex/guide-content-role-base" }), "origin/codex/guide-content-role-base");
  assert.equal(resolveBaseRef([], { DESIGN_LINT_BASE: "origin/release" }), "origin/release");
  assert.equal(
    resolveBaseRef(["--json", "--base", "origin/stack-base"], { DESIGN_LINT_BASE: "origin/release" }),
    "origin/stack-base"
  );
  assert.throws(() => resolveBaseRef(["--base"], {}), /requires a Git ref/);
});

test("release verification enforces migrate-on-touch against its exact range base", () => {
  assert.equal(designLintBaseFromRange("origin/stack-base...deadbeef"), "origin/stack-base");
  assert.equal(designLintBaseFromRange("HEAD^..HEAD"), "HEAD^");

  const designStep = buildCommandSteps("origin/stack-base...deadbeef").find((step) => step.label === "lint:design");
  assert.deepEqual(designStep, {
    label: "lint:design",
    command: "npm",
    args: ["run", "lint:design", "--", "--base", "origin/stack-base"],
  });
});

test("design-lint --json writes one parseable JSON document", () => {
  const script = path.join(__dirname, "..", "design", "design-lint.js");
  const result = spawnSync(process.execPath, [script, "--json", "--base", "HEAD"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.baseRef, "HEAD");
  assert.ok(Array.isArray(report.newViolations));
});

test("guide corpus has no design-law violations outside the grandfathered baseline", () => {
  const state = run();
  // Deterministic: ignore git-touched status here; assert the stable property that
  // no un-baselined guide introduces a new off-brand hex, Google Fonts load, or emoji.
  const { newViolations } = evaluate(state, loadBaseline(), new Set());
  assert.deepEqual(
    newViolations,
    [],
    `New design-law violations must be fixed or the file migrated onto the shared system:\n${newViolations
      .map((v) => `  ${v.file} [${v.check}]`)
      .join("\n")}`
  );
});

test("design-lint detects the exact violations that shipped on the legacy page", () => {
  const allowlist = buildPaletteAllowlist();

  // Off-brand Airbnb blue + cool gray that the legacy page carried.
  const offBrand = lintSource('<div class="related-guides" style="background:#f8f9fa;border-left:4px solid #2c5f7c;">x</div>', allowlist);
  assert.ok(offBrand.offBrandHex.includes("#2c5f7c"), "should flag off-brand blue #2c5f7c");
  assert.ok(offBrand.offBrandHex.includes("#f8f9fa"), "should flag off-brand gray #f8f9fa");

  // Google Fonts loaded in-page.
  const gfonts = lintSource('<link href="https://fonts.googleapis.com/css2?family=Poppins" rel="stylesheet">', allowlist);
  assert.equal(gfonts.googleFonts, true, "should flag Google Fonts in-page");

  // Emoji decoration in visible markup.
  const emoji = lintSource("<span>Beach day \u{1F3D6}\u{FE0F}</span>", allowlist);
  assert.equal(emoji.emoji, true, "should flag emoji in visible markup");
});

test("design-lint does not false-positive on sanctioned tokens, palette hex, or non-style hex", () => {
  const allowlist = buildPaletteAllowlist();

  // Tokens + rgba + the DESIGN.md-approved gold-foil hexes used by .btn-gold and the VS badge.
  const clean = lintSource(
    '<style>.x{color:var(--brand-dark);background:rgba(20,34,35,0.9)}' +
      ".vs{background:linear-gradient(135deg,#E3C47A 0%,#C9A962 42%,#8E6D28 66%,#C9A962 100%);color:#2A2014}</style>",
    allowlist
  );
  assert.deepEqual(clean.offBrandHex, [], `sanctioned palette hex must not be flagged, got ${clean.offBrandHex.join(", ")}`);

  // Hex outside a style context (JSON-LD, SVG path fill via attribute, tracking id) must be ignored.
  const nonStyle = lintSource(
    '<script type="application/ld+json">{"color":"#2c5f7c"}</script>' +
      '<svg><path fill="#123456" d="M0 0"/></svg>' +
      '<meta property="og:image" content="https://x/#abcdef">',
    allowlist
  );
  assert.deepEqual(nonStyle.offBrandHex, [], "hex outside style contexts must not be flagged");
});
