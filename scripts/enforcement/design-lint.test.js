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
  lintFile,
  resolveBaseRef,
  checkWorsened,
} = require("../design/design-lint.js");
const { designLintBaseFromRange, buildCommandSteps } = require("./verify-release.js");

const AMI_GUIDE = "src/guides/anna-maria-island-vs-siesta-key.html";

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

  // This test owns ONE property: --json emits a single parseable report. It must not
  // also assert a clean exit. `--json` exits 1 whenever it finds new violations, which
  // is correct behaviour and is separately enforced by `npm run lint:design`. Asserting
  // exit 0 here made the pre-commit gate unsatisfiable: the hook runs `npm test`, and
  // with staged-but-uncommitted edits to any grandfathered file `--base HEAD` reports
  // those edits as touched, so the run exited 1 and blocked the very commit that would
  // have made it pass. Any edit to one of the ~52 grandfathered guides was uncommittable.
  assert.equal(typeof result.status, "number", result.error?.message || "design-lint did not run");
  assert.ok([0, 1].includes(result.status), `unexpected exit ${result.status}: ${result.stderr}`);

  const report = JSON.parse(result.stdout);
  assert.equal(report.baseRef, "HEAD");
  assert.ok(Array.isArray(report.newViolations));
  assert.ok(Array.isArray(report.graduated));
  assert.equal(typeof report.debt, "number");
  // Exit code must agree with the report, so a violation can never pass silently.
  assert.equal(result.status === 0, report.newViolations.length === 0);
});

// ---------------------------------------------------------------------------
// Migrate-on-touch is per check and evidence-based. These tests pin BOTH
// directions: a metadata-only edit keeps its exemption, and any added design
// debt still fails. If the ratchet ever loosens, one of these goes red.
// ---------------------------------------------------------------------------

const LEGACY = "src/guides/legacy-page.html";

function legacyState(workingViolations) {
  return {
    files: [LEGACY],
    report: { [LEGACY]: workingViolations },
    allowlist: new Set(),
  };
}

const BASELINE_ALL = { offBrandHex: [LEGACY], googleFonts: [LEGACY], emoji: [LEGACY] };

function violations({ hex = [], googleFonts = false, emoji = false } = {}) {
  return { offBrandHex: hex, googleFonts, emoji };
}

test("touching a grandfathered file without changing design surfaces keeps its exemption", () => {
  // The exact CTR case: a <title> rewrite. Same off-brand hexes, same fonts, same emoji.
  const working = violations({ hex: ["#f0f7f7", "#f8f9fa"], googleFonts: true });
  const base = violations({ hex: ["#f0f7f7", "#f8f9fa"], googleFonts: true });

  const { newViolations, debt } = evaluate(
    legacyState(working),
    BASELINE_ALL,
    new Set([LEGACY]),
    { [LEGACY]: base }
  );

  assert.deepEqual(newViolations, [], "a metadata-only edit must not demand a design migration");
  assert.equal(debt, 2, "the pre-existing debt is still counted, not forgiven");
});

test("adding a new off-brand hex to a grandfathered file loses the exemption", () => {
  const working = violations({ hex: ["#f0f7f7", "#f8f9fa", "#ff00ff"] });
  const base = violations({ hex: ["#f0f7f7", "#f8f9fa"] });

  const { newViolations } = evaluate(legacyState(working), BASELINE_ALL, new Set([LEGACY]), {
    [LEGACY]: base,
  });

  assert.equal(newViolations.length, 1);
  assert.equal(newViolations[0].check, "offBrandHex");
});

test("removing some off-brand hex from a grandfathered file still keeps the exemption", () => {
  // Partial progress must not be punished, or nobody will ever start migrating.
  const working = violations({ hex: ["#f0f7f7"] });
  const base = violations({ hex: ["#f0f7f7", "#f8f9fa"] });

  const { newViolations } = evaluate(legacyState(working), BASELINE_ALL, new Set([LEGACY]), {
    [LEGACY]: base,
  });

  assert.deepEqual(newViolations, []);
});

test("newly adding a Google Fonts tag or an emoji loses the exemption for that check only", () => {
  const working = violations({ hex: ["#f0f7f7"], googleFonts: true, emoji: true });
  const base = violations({ hex: ["#f0f7f7"], googleFonts: false, emoji: false });

  const { newViolations } = evaluate(legacyState(working), BASELINE_ALL, new Set([LEGACY]), {
    [LEGACY]: base,
  });

  const failed = newViolations.map((v) => v.check).sort();
  assert.deepEqual(failed, ["emoji", "googleFonts"]);
  assert.ok(!failed.includes("offBrandHex"), "the untouched check keeps its exemption");
});

test("a file with no base version is never exempt, so new pages must comply", () => {
  const working = violations({ hex: ["#ff00ff"], googleFonts: true });

  const { newViolations } = evaluate(legacyState(working), BASELINE_ALL, new Set([LEGACY]), {
    [LEGACY]: null,
  });

  assert.equal(newViolations.length, 2, "a newly added file cannot inherit a grandfathered pass");
});

test("an untouched grandfathered file stays exempt, as before", () => {
  const working = violations({ hex: ["#f0f7f7"], googleFonts: true });

  const { newViolations, debt } = evaluate(legacyState(working), BASELINE_ALL, new Set(), {});

  assert.deepEqual(newViolations, []);
  assert.equal(debt, 2);
});

test("a non-grandfathered file that violates still fails even when unchanged", () => {
  const working = violations({ hex: ["#ff00ff"] });

  const { newViolations } = evaluate(
    legacyState(working),
    { offBrandHex: [], googleFonts: [], emoji: [] },
    new Set(),
    {}
  );

  assert.equal(newViolations.length, 1);
  assert.equal(newViolations[0].check, "offBrandHex");
});

test("checkWorsened treats a missing base as worsened and compares hex sets by membership", () => {
  assert.equal(checkWorsened(violations({ hex: ["#aaa111"] }), null, "offBrandHex"), true);
  assert.equal(
    checkWorsened(violations({ hex: ["#aaa111"] }), violations({ hex: ["#aaa111"] }), "offBrandHex"),
    false
  );
  assert.equal(
    checkWorsened(violations({ hex: ["#aaa111", "#bbb222"] }), violations({ hex: ["#aaa111"] }), "offBrandHex"),
    true
  );
  assert.equal(
    checkWorsened(violations({ googleFonts: true }), violations({ googleFonts: true }), "googleFonts"),
    false
  );
  assert.equal(
    checkWorsened(violations({ googleFonts: true }), violations({ googleFonts: false }), "googleFonts"),
    true
  );
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

test("the recreated AMI vs Siesta guide passes design-lint on merit (not grandfathered)", () => {
  const allowlist = buildPaletteAllowlist();
  const v = lintFile(AMI_GUIDE, allowlist);
  assert.equal(v.offBrandHex.length, 0, `expected no off-brand hex, found ${v.offBrandHex.join(", ")}`);
  assert.equal(v.googleFonts, false, "expected self-hosted fonts, not Google Fonts in-page");
  assert.equal(v.emoji, false, "expected SVG icons, not emoji");

  const baseline = loadBaseline();
  for (const check of ["offBrandHex", "googleFonts", "emoji"]) {
    assert.equal(
      (baseline[check] || []).includes(AMI_GUIDE),
      false,
      `${AMI_GUIDE} should pass on merit, not be grandfathered for ${check}`
    );
  }
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
