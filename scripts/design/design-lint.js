#!/usr/bin/env node
"use strict";

/*
 * design-lint — machine enforcement of the DESIGN.md visual law for guide pages.
 *
 * WHY THIS EXISTS
 * The repo has a rich design SYSTEM (DESIGN.md), a specialist -> critic PROCESS,
 * and machine gates for content, JSON-LD, links, and SEO — but nothing enforces
 * the visual law. A page can ship with off-brand color, Google Fonts loaded
 * in-page, or emoji decoration and pass build + npm test + lint:content. This
 * script closes that gap the same way the other enforcement gates work: a plain
 * node scan that returns a non-zero exit on new violations.
 *
 * WHAT IT CHECKS (per guide source file)
 *   offBrandHex : hex color literals inside style="" / <style> that are NOT part
 *                 of the sanctioned palette (derived from DESIGN.md + the shared
 *                 CSS + shared partials, so approved colors never false-positive).
 *   googleFonts : fonts.googleapis.com / fonts.gstatic.com loaded in-page instead
 *                 of the self-hosted local-font-head.njk partial.
 *   emoji       : emoji glyphs in visible markup (DESIGN.md: SVG icons only).
 *
 * BASELINE + RATCHET
 * The corpus has ~53 legacy standalone guides that predate the design system.
 * A one-time baseline (design-lint-baseline.json) grandfathers each currently
 * failing file per check, so the gate is green today. Any NEW violation (a file
 * not grandfathered for that check) fails. The baseline can only shrink: a file
 * that no longer violates is reported as "ready to graduate".
 *
 * MIGRATE-ON-TOUCH is per check and evidence-based. A grandfathered file keeps
 * its exemption for a check unless the current branch made THAT CHECK worse than
 * the merge base: a new off-brand hex, a newly added Google Fonts tag, or a newly
 * added emoji. Editing a <title>, a meta description, or a paragraph adds no
 * design debt, so it no longer demands a full design migration of the page.
 * Newly added files have no base version and are never exempt. The ratchet still
 * only turns one way — you cannot add design debt to a legacy page and stay green,
 * and you cannot introduce a non-compliant new page at all.
 *
 * USAGE
 *   node scripts/design/design-lint.js                 # lint (exit 1 on new violations)
 *   node scripts/design/design-lint.js --base <ref>    # compare migrate-on-touch against a stacked PR base
 *   node scripts/design/design-lint.js --update-baseline  # re-record the baseline
 *   node scripts/design/design-lint.js --json          # machine-readable report
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const baselinePath = path.join(__dirname, "design-lint-baseline.json");

// Files whose hex values define the sanctioned palette. Any hex used here is allowed.
const PALETTE_SOURCE_FILES = [
  "DESIGN.md",
  "src/css/base.css",
  "src/css/guide-field-journal.css",
  "src/_includes/partials/guide-conversion-kit.njk",
  "src/_includes/partials/site-header-styles.njk",
];

// Universally safe values that need no palette membership.
const ALWAYS_ALLOWED_HEX = new Set([
  "#fff", "#ffffff", "#000", "#000000",
]);

// 3, 4, 6 or 8 digits. The previous trailing \b silently skipped CSS Color 4
// alpha forms: #ff00ff80 renders magenta and matched NOTHING (adversarial
// review, 2026-07-28). Longest-first so #ff00ff80 is not read as #ff00ff.
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
// Match default-presentation emoji directly, plus text-default codepoints only
// when an explicit emoji variation selector is present. This keeps ordinary
// symbols such as bare ™, ℹ, and ↩ as typography while still rejecting ™️, ℹ️,
// and ↩️ when authors explicitly request emoji presentation.
const EMOJI_RE = /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function normalizeHex(hex) {
  const lower = hex.toLowerCase();
  // Compare on the RGB triplet so alpha variants cannot smuggle an off-brand
  // color past a palette that lists only its opaque form.
  if (lower.length === 4 || lower.length === 5) {
    // #abc / #abcd -> #aabbcc
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  if (lower.length === 9) {
    // #rrggbbaa -> #rrggbb
    return lower.slice(0, 7);
  }
  return lower;
}

function buildPaletteAllowlist() {
  const allowed = new Set([...ALWAYS_ALLOWED_HEX].map(normalizeHex));
  for (const rel of PALETTE_SOURCE_FILES) {
    let content;
    try {
      content = read(rel);
    } catch {
      continue;
    }
    for (const match of content.match(HEX_RE) || []) {
      allowed.add(normalizeHex(match));
    }
  }
  return allowed;
}

// Extract only the CSS/style contexts so we never flag hex inside JSON-LD, URLs,
// SVG path data, or tracking IDs.
//
// KNOWN, DELIBERATE GAP: SVG paint attributes (fill=, stroke=) are NOT treated as
// style contexts, and design-lint.test.js asserts that explicitly. An adversarial
// review on 2026-07-28 showed off-brand color CAN therefore ship via <rect fill="...">.
// Closing it would flag legitimate multi-colour brand illustrations, so it stays a
// documented gap rather than an unreviewed expansion of the rule.
function extractStyleContexts(source) {
  const chunks = [];
  const styleBlocks = source.match(/<style[\s\S]*?<\/style>/gi) || [];
  chunks.push(...styleBlocks);
  const styleAttrs = source.match(/style\s*=\s*"[^"]*"/gi) || [];
  chunks.push(...styleAttrs);
  const styleAttrsSingle = source.match(/style\s*=\s*'[^']*'/gi) || [];
  chunks.push(...styleAttrsSingle);
  // Unquoted style attributes are valid HTML5 and rendered <p style=color:#ff00ff>
  // straight past the gate until 2026-07-28.
  const styleAttrsBare = source.match(/style\s*=\s*[^"'\s>][^\s>]*/gi) || [];
  chunks.push(...styleAttrsBare);
  return chunks.join("\n");
}

function stripToVisibleText(source) {
  return source
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/\{[%#][\s\S]*?[%#]\}/g, " ")
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    .replace(/<[^>]+>/g, " ");
}

function listGuideFiles() {
  const guidesDir = path.join(projectRoot, "src", "guides");
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(html|njk)$/i.test(entry.name)) {
        results.push(path.relative(projectRoot, full).split(path.sep).join("/"));
      }
    }
  }
  walk(guidesDir);
  return results.sort();
}

function lintSource(source, allowlist) {
  // counts back the per-check ratchet: hexCounts maps each off-brand hex to how
  // many times it appears in style contexts, so migrate-on-touch can tell "same
  // debt as the base" apart from "one more use of the same debt".
  const violations = {
    offBrandHex: [],
    googleFonts: false,
    emoji: false,
    counts: { hex: {}, googleFonts: 0, emoji: 0 },
  };

  const styleContext = extractStyleContexts(source);
  for (const match of styleContext.match(HEX_RE) || []) {
    const norm = normalizeHex(match);
    if (!allowlist.has(norm)) {
      if (!(norm in violations.counts.hex)) {
        violations.offBrandHex.push(norm);
      }
      violations.counts.hex[norm] = (violations.counts.hex[norm] || 0) + 1;
    }
  }

  violations.counts.googleFonts = (source.match(/fonts\.googleapis\.com|fonts\.gstatic\.com/gi) || []).length;
  if (violations.counts.googleFonts > 0) {
    violations.googleFonts = true;
  }

  const emojiMatches = stripToVisibleText(source).match(new RegExp(EMOJI_RE.source, "gu")) || [];
  violations.counts.emoji = emojiMatches.length;
  if (violations.counts.emoji > 0) {
    violations.emoji = true;
  }

  return violations;
}

function lintFile(rel, allowlist) {
  return lintSource(read(rel), allowlist);
}

function hasViolation(v, check) {
  if (check === "offBrandHex") return v.offBrandHex.length > 0;
  return Boolean(v[check]);
}

function resolveBaseRef(args = process.argv.slice(2), env = process.env) {
  const baseIndex = args.indexOf("--base");
  if (baseIndex !== -1) {
    const explicitBase = args[baseIndex + 1];
    if (!explicitBase || explicitBase.startsWith("--")) {
      throw new Error("design-lint --base requires a Git ref");
    }
    return explicitBase;
  }

  if (env.DESIGN_LINT_BASE && env.DESIGN_LINT_BASE.trim()) {
    return env.DESIGN_LINT_BASE.trim();
  }

  if (env.GITHUB_BASE_REF && env.GITHUB_BASE_REF.trim()) {
    const githubBase = env.GITHUB_BASE_REF.trim();
    return githubBase.startsWith("origin/") ? githubBase : `origin/${githubBase}`;
  }

  return "origin/main";
}

function changedFiles(baseRef = "origin/main") {
  try {
    const git = (args) => execFileSync("git", args, { cwd: projectRoot, encoding: "utf8" });
    const base = git(["merge-base", "HEAD", baseRef]).trim();
    const ranges = [
      base ? ["diff", "--name-only", `${base}...HEAD`] : null,
      ["diff", "--name-only"],
      ["diff", "--cached", "--name-only"],
    ];
    const out = ranges
      .filter(Boolean)
      .flatMap((args) => git(args).split("\n"))
      .map((s) => s.trim())
      .filter(Boolean);
    return new Set(out);
  } catch (error) {
    const detail = String(error.stderr || error.message || error).trim();
    throw new Error(`design-lint could not compare against ${baseRef}: ${detail}`);
  }
}

const CHECKS = ["offBrandHex", "googleFonts", "emoji"];

function resolveMergeBase(baseRef) {
  try {
    return execFileSync("git", ["merge-base", "HEAD", baseRef], {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function readSourceAtRef(ref, rel) {
  if (!ref) {
    return null;
  }
  try {
    return execFileSync("git", ["show", `${ref}:${rel}`], {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    return null; // the file did not exist at that ref
  }
}

// Lint the BASE version of each touched, still-violating file, so migrate-on-touch
// can ask "did this edit add design debt?" instead of "was this file edited at all".
// Only touched violating files are fetched, so this is a handful of git calls.
function buildBaseReport({ files, report, allowlist }, touched, baseRef) {
  const mergeBase = resolveMergeBase(baseRef);
  const baseReport = {};
  for (const rel of files) {
    if (!touched.has(rel)) {
      continue;
    }
    if (!CHECKS.some((check) => hasViolation(report[rel], check))) {
      continue;
    }
    const baseSource = readSourceAtRef(mergeBase, rel);
    baseReport[rel] = baseSource === null ? null : lintSource(baseSource, allowlist);
  }
  return baseReport;
}

// True when this edit made the file WORSE for this check. A file with no base
// version (newly added) is always treated as worsened, so new files must comply.
// Comparison is by OCCURRENCE COUNT, not category presence: a second Google
// Fonts tag, an additional emoji, or one more use of an already-present
// off-brand hex all count as new debt. Counts going down or staying equal keep
// the exemption, so partial cleanup is never punished.
function checkWorsened(working, base, check) {
  if (!base) {
    return true;
  }
  const workingCounts = working.counts || { hex: {}, googleFonts: 0, emoji: 0 };
  const baseCounts = base.counts || { hex: {}, googleFonts: 0, emoji: 0 };
  if (check === "offBrandHex") {
    return Object.entries(workingCounts.hex).some(
      ([hex, count]) => count > (baseCounts.hex[hex] || 0)
    );
  }
  return workingCounts[check] > baseCounts[check];
}

// Fails when the scanned corpus no longer covers what the baseline describes.
// A file may legitimately leave the scan (retired page, rename) — but then the
// baseline must shrink through `--update-baseline` in the same change, which is
// the only sanctioned way it moves.
function checkCoverage({ files, report }, baseline) {
  const failures = [];

  if (!files.length) {
    failures.push(
      "0 guide sources scanned. listGuideFiles() found nothing under src/guides, " +
        "so every check below would pass vacuously."
    );
    return failures;
  }

  const scanned = new Set(files);
  const orphaned = [];
  for (const check of CHECKS) {
    for (const rel of baseline[check] || []) {
      if (!scanned.has(rel) && !orphaned.includes(rel)) {
        orphaned.push(rel);
      }
    }
  }

  if (orphaned.length) {
    failures.push(
      `${orphaned.length} baseline entr${orphaned.length === 1 ? "y" : "ies"} no longer resolve to a scanned file. ` +
        "If those pages were retired or renamed, re-record the baseline in the same " +
        "change: node scripts/design/design-lint.js --update-baseline"
    );
    for (const rel of orphaned.slice(0, 10)) {
      failures.push(`  orphaned: ${rel}`);
    }
    if (orphaned.length > 10) {
      failures.push(`  ...and ${orphaned.length - 10} more`);
    }
  }

  return failures;
}

// Fails when this branch both WIDENS the palette and USES a newly-legalized hex
// in a touched guide. Editing the palette alone stays allowed (real palette work
// happens); using a color you legalized in the same breath does not.
function paletteUsageFiles(files, touched, changedPaletteSources) {
  return [
    ...new Set([
      ...files.filter((rel) => touched.has(rel)),
      // Shared style partials and CSS files are consumers too. Once any
      // palette source changes, audit every shared consumer: a branch can
      // widen the allowlist in DESIGN.md while an unchanged partial already
      // uses the newly legalized color.
      ...(changedPaletteSources.length ? PALETTE_SOURCE_FILES.filter((rel) => rel !== "DESIGN.md") : []),
    ]),
  ];
}

function paletteUsesAddedHexes(source, addedHexes) {
  const styleContext = extractStyleContexts(source);
  const used = new Set((styleContext.match(HEX_RE) || []).map(normalizeHex));
  return [...addedHexes].filter((hex) => used.has(hex));
}

function checkPaletteIntegrity(touched, baseRef, { files, report }) {
  const changedPaletteSources = PALETTE_SOURCE_FILES.filter((rel) => touched.has(rel));
  if (!changedPaletteSources.length) {
    return [];
  }

  const mergeBase = resolveMergeBase(baseRef);
  if (!mergeBase) {
    return [
      `palette source(s) changed (${changedPaletteSources.join(", ")}) but the merge base ` +
        `against ${baseRef} could not be resolved, so the widening cannot be audited.`,
    ];
  }

  const baseAllowed = new Set([...ALWAYS_ALLOWED_HEX].map(normalizeHex));
  for (const rel of PALETTE_SOURCE_FILES) {
    const source = readSourceAtRef(mergeBase, rel);
    if (!source) {
      continue;
    }
    for (const match of source.match(HEX_RE) || []) {
      baseAllowed.add(normalizeHex(match));
    }
  }

  const addedHexes = new Set();
  for (const rel of PALETTE_SOURCE_FILES) {
    let source;
    try {
      source = read(rel);
    } catch {
      continue;
    }
    for (const match of source.match(HEX_RE) || []) {
      const norm = normalizeHex(match);
      if (!baseAllowed.has(norm)) {
        addedHexes.add(norm);
      }
    }
  }

  if (!addedHexes.size) {
    return [];
  }

  // A newly-legalized hex is only a problem if this branch also puts it into a
  // rendered design surface. Re-lint each touched guide and changed shared
  // style source against the BASE allowlist: anything that would have been a
  // violation before the palette moved is the abuse case.
  const failures = [];
  for (const rel of paletteUsageFiles(files, touched, changedPaletteSources)) {
    let source;
    try {
      source = read(rel);
    } catch {
      continue;
    }
    const abused = paletteUsesAddedHexes(source, addedHexes);
    if (abused.length) {
      failures.push(
        `${rel} uses ${abused.join(", ")}, legalized in this same branch by ` +
          `${changedPaletteSources.join(", ")}. Use an existing palette value, or land the ` +
          "palette change on its own and let it be reviewed as a design decision."
      );
    }
  }

  return failures;
}

function run() {
  const allowlist = buildPaletteAllowlist();
  const files = listGuideFiles();
  const report = {};
  for (const rel of files) {
    report[rel] = lintFile(rel, allowlist);
  }
  return { allowlist, files, report };
}

function loadBaseline() {
  try {
    return JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  } catch {
    return { offBrandHex: [], googleFonts: [], emoji: [] };
  }
}

function buildBaseline({ files, report }) {
  const baseline = { offBrandHex: [], googleFonts: [], emoji: [] };
  for (const rel of files) {
    for (const check of CHECKS) {
      if (hasViolation(report[rel], check)) baseline[check].push(rel);
    }
  }
  for (const check of CHECKS) baseline[check].sort();
  return baseline;
}

function evaluate({ files, report }, baseline, touched, baseReport = {}) {
  const newViolations = [];
  const graduated = [];
  let debt = 0;
  for (const check of CHECKS) {
    const grandfathered = new Set(baseline[check] || []);
    for (const rel of files) {
      const violates = hasViolation(report[rel], check);
      // Migrate-on-touch is per check and evidence-based: a grandfathered file
      // keeps its exemption for a check unless this branch made that check worse.
      // Editing a title or a paragraph adds no design debt and must not demand a
      // full design migration; adding an off-brand hex, a Google Fonts tag, or an
      // emoji does, and still fails here.
      const worsened = touched.has(rel) && checkWorsened(report[rel], baseReport[rel], check);
      const exempt = grandfathered.has(rel) && !worsened;
      if (violates && !exempt) {
        newViolations.push({ file: rel, check, detail: report[rel] });
      } else if (violates) {
        debt += 1;
      } else if (grandfathered.has(rel)) {
        graduated.push({ file: rel, check });
      }
    }
  }
  return { newViolations, graduated, debt };
}

function buildJsonReport({
  baseRef,
  newViolations,
  graduated,
  debt,
  palette,
  coverageFailures = [],
  paletteFailures = [],
}) {
  return {
    baseRef,
    newViolations,
    graduated,
    debt,
    palette,
    coverageFailures,
    paletteFailures,
  };
}

function main() {
  const args = process.argv.slice(2);
  const state = run();

  if (args.includes("--update-baseline")) {
    const baseline = buildBaseline(state);
    baseline._note =
      "Grandfathered legacy design-law violations. Only shrinks: migrate a file onto the shared system, then run --update-baseline. Migrate-on-touch is per check: an exemption is lost only when a branch makes that check worse than the merge base (new off-brand hex, newly added Google Fonts tag, newly added emoji). New files have no base version and are never exempt.";
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
    const total = CHECKS.reduce((n, c) => n + baseline[c].length, 0);
    console.log(`design-lint: baseline written with ${total} grandfathered entries across ${CHECKS.length} checks.`);
    return 0;
  }

  const baseline = loadBaseline();
  const baseRef = resolveBaseRef(args);
  const touched = changedFiles(baseRef);

  // COVERAGE FLOOR. Adversarial review, 2026-07-28: thinning or emptying
  // src/guides made listGuideFiles() return [], the evaluate() loop never ran,
  // and the gate printed "0 guide sources scanned, 0 new violations" and exited
  // 0 — a required CI check reporting success after checking nothing. A baseline
  // entry that no longer resolves to a scanned file is the signal: the corpus
  // shrank without going through --update-baseline.
  const coverageFailures = checkCoverage(state, baseline);

  // PALETTE INTEGRITY. Same review: appending two hex values to DESIGN.md widened
  // the allowlist, so off-brand hex in a guide passed as "on-brand" and both the
  // gate and its unit test went green. The palette is the gate's own definition
  // of correct, so a branch that edits it must not simultaneously introduce the
  // colors it just legalized.
  const paletteFailures = checkPaletteIntegrity(touched, baseRef, state);

  const baseReport = buildBaseReport(state, touched, baseRef);
  const { newViolations, graduated, debt } = evaluate(state, baseline, touched, baseReport);

  if (args.includes("--json")) {
    console.log(
      JSON.stringify(
        buildJsonReport({
          baseRef,
          newViolations,
          graduated,
          debt,
          palette: [...state.allowlist].sort(),
          coverageFailures,
          paletteFailures,
        }),
        null,
        2
      )
    );
    return newViolations.length === 0 && coverageFailures.length === 0 && paletteFailures.length === 0 ? 0 : 1;
  }

  if (coverageFailures.length) {
    console.error("design-lint FAILED: coverage collapse — the scan cannot be trusted:");
    for (const line of coverageFailures) {
      console.error(`  ${line}`);
    }
    return 1;
  }

  if (paletteFailures.length) {
    console.error("design-lint FAILED: palette widened to legalize new debt:");
    for (const line of paletteFailures) {
      console.error(`  ${line}`);
    }
    return 1;
  }

  if (newViolations.length === 0) {
    console.log(
      `design-lint OK against ${baseRef}: ${state.files.length} guide sources scanned, 0 new violations (${debt} grandfathered legacy entries remain; ${graduated.length} ready to graduate).`
    );
    return 0;
  }

  console.error(`design-lint FAILED: ${newViolations.length} new design-law violation(s):`);
  for (const v of newViolations) {
    if (v.check === "offBrandHex") {
      console.error(`  ${v.file}: off-brand hex ${v.detail.offBrandHex.join(", ")} (not in the DESIGN.md palette)`);
    } else if (v.check === "googleFonts") {
      console.error(`  ${v.file}: loads Google Fonts in-page; use partials/local-font-head.njk (self-hosted woff2)`);
    } else if (v.check === "emoji") {
      console.error(`  ${v.file}: emoji in visible markup; use SVG icons from partials/ui-icon.njk`);
    }
  }
  return 1;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  run,
  buildBaseline,
  evaluate,
  loadBaseline,
  buildPaletteAllowlist,
  lintFile,
  lintSource,
  listGuideFiles,
  resolveBaseRef,
  changedFiles,
  buildBaseReport,
  checkWorsened,
  checkCoverage,
  checkPaletteIntegrity,
  paletteUsageFiles,
  paletteUsesAddedHexes,
  buildJsonReport,
};
