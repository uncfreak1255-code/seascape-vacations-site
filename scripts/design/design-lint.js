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

const HEX_RE = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
// Emoji: pictographic + regional + dingbat ranges (conservative; excludes plain symbols).
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/u;

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function normalizeHex(hex) {
  const lower = hex.toLowerCase();
  if (lower.length === 4) {
    // #abc -> #aabbcc
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
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
function extractStyleContexts(source) {
  const chunks = [];
  const styleBlocks = source.match(/<style[\s\S]*?<\/style>/gi) || [];
  chunks.push(...styleBlocks);
  const styleAttrs = source.match(/style\s*=\s*"[^"]*"/gi) || [];
  chunks.push(...styleAttrs);
  const styleAttrsSingle = source.match(/style\s*=\s*'[^']*'/gi) || [];
  chunks.push(...styleAttrsSingle);
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
  const violations = { offBrandHex: [], googleFonts: false, emoji: false };

  const styleContext = extractStyleContexts(source);
  const seen = new Set();
  for (const match of styleContext.match(HEX_RE) || []) {
    const norm = normalizeHex(match);
    if (!allowlist.has(norm) && !seen.has(norm)) {
      seen.add(norm);
      violations.offBrandHex.push(norm);
    }
  }

  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(source)) {
    violations.googleFonts = true;
  }

  if (EMOJI_RE.test(stripToVisibleText(source))) {
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
function checkWorsened(working, base, check) {
  if (!base) {
    return true;
  }
  if (check === "offBrandHex") {
    const alreadyPresent = new Set(base.offBrandHex);
    return working.offBrandHex.some((hex) => !alreadyPresent.has(hex));
  }
  return Boolean(working[check]) && !base[check];
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
  const baseReport = buildBaseReport(state, touched, baseRef);
  const { newViolations, graduated, debt } = evaluate(state, baseline, touched, baseReport);

  if (args.includes("--json")) {
    console.log(JSON.stringify({ baseRef, newViolations, graduated, debt, palette: [...state.allowlist].sort() }, null, 2));
    return newViolations.length === 0 ? 0 : 1;
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
};
