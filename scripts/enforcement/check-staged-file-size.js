#!/usr/bin/env node
"use strict";

// Pre-commit gate: keeps agent-authored files small enough for an agent to read
// whole. Tokens are estimated as bytes / 4. Files already over the limit before
// this gate existed may stay as they are or shrink, but may not grow.

const { execFileSync } = require("child_process");

const MAX_TOKENS = 5000;
const BYTES_PER_TOKEN = 4;
const MAX_BYTES = MAX_TOKENS * BYTES_PER_TOKEN;

// Machine-written or exempt files: lockfiles, minified bundles, guide pages
// (long-form articles by design), design mockups, pulled data, perf baseline.
const IGNORED = [
  /(^|\/)package-lock\.json$/,
  /(^|\/)(yarn\.lock|pnpm-lock\.yaml|bun\.lockb)$/,
  /(^|\/)node_modules\//,
  /^_site\//,
  /^src\/guides\//,
  /^docs\/mockups\//,
  /^src\/_data\/[^/]+\.json$/,
  /^config\/perf-ratchet\.json$/,
  /\.min\.(js|css)$/,
  /\.map$/,
];

function git(args, repoRoot) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "buffer",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function blobSize(spec, repoRoot) {
  return Number(git(["cat-file", "-s", spec], repoRoot).toString().trim());
}

// Size at HEAD, or null when the path is new (or there is no HEAD yet). A
// null baseline is the strict case: the file gets no legacy allowance.
function headSize(path, repoRoot) {
  try {
    return blobSize(`HEAD:${path}`, repoRoot);
  } catch {
    return null;
  }
}

// Read only the prefix; a large blob is never buffered whole.
function isBinary(spec, repoRoot) {
  const head = execFileSync("sh", ["-c", 'git cat-file blob "$1" | head -c 8000', "sh", spec], {
    cwd: repoRoot,
    encoding: "buffer",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return head.includes(0);
}

// Returns [{ path, previousPath }] for staged additions, copies, edits, renames.
function stagedFiles(repoRoot) {
  const fields = git(
    ["diff", "--cached", "--name-status", "-z", "-M", "--diff-filter=ACMR"],
    repoRoot
  )
    .toString()
    .split("\0")
    .filter(Boolean);
  const files = [];
  for (let i = 0; i < fields.length; ) {
    const status = fields[i];
    if (status.startsWith("R") || status.startsWith("C")) {
      files.push({ previousPath: fields[i + 1], path: fields[i + 2] });
      i += 3;
    } else {
      files.push({ previousPath: fields[i + 1], path: fields[i + 1] });
      i += 2;
    }
  }
  return files;
}

// A merge commit stages work that already passed this gate on its own branch;
// diffing it against HEAD would charge that work to the merge.
function mergeInProgress(repoRoot) {
  try {
    git(["rev-parse", "-q", "--verify", "MERGE_HEAD"], repoRoot);
    return true;
  } catch {
    return false;
  }
}

function findViolations(repoRoot) {
  const violations = [];
  if (mergeInProgress(repoRoot)) return violations;
  for (const { path, previousPath } of stagedFiles(repoRoot)) {
    if (IGNORED.some((pattern) => pattern.test(path))) continue;
    // A staged blob that cannot be read throws: the gate blocks, never passes.
    const size = blobSize(`:0:${path}`, repoRoot);
    if (size <= MAX_BYTES) continue;
    if (isBinary(`:0:${path}`, repoRoot)) continue;
    const before = headSize(previousPath, repoRoot);
    const legacy = before !== null && before > MAX_BYTES;
    if (legacy && size <= before) continue;
    violations.push({ path, size, before: legacy ? before : null });
  }
  return violations;
}

function tokens(bytes) {
  return Math.ceil(bytes / BYTES_PER_TOKEN).toLocaleString("en-US");
}

function formatMessage(violations) {
  const lines = [
    `Commit blocked: staged file(s) exceed ${MAX_TOKENS.toLocaleString("en-US")} tokens (tokens = bytes / 4).`,
    "",
  ];
  for (const v of violations) {
    lines.push(
      v.before === null
        ? `  ${v.path}: ~${tokens(v.size)} tokens`
        : `  ${v.path}: ~${tokens(v.size)} tokens, grew from ~${tokens(v.before)} (oversized files may not grow)`
    );
  }
  lines.push(
    "",
    "How to fix (split, do not compress):",
    "  1. Find the seams: group the file's functions, sections, or test cases by the",
    "     one job each serves (parsing, rendering, I/O, one feature, one scenario).",
    "  2. Move each group into its own file next to the original, named for that job",
    "     (e.g. scripts/<area>/<job>.js, scripts/enforcement/<area>-<scenario>.test.js,",
    "     docs/<topic>/<subtopic>.md, src/_includes/partials/<part>.njk). Keep every new file under the limit.",
    "  3. Leave the original as a thin entry point that requires/re-exports the moved",
    "     pieces, so existing callers and imports keep working unchanged.",
    "  4. For an oversized file you only needed to edit: extract at least as many",
    "     bytes as you added into a new module, so the file does not grow.",
    "  5. Update references (includes, package.json scripts, docs),",
    "     run npm run build and the affected tests, re-stage, and commit again.",
    "Do not minify, strip comments, or join lines to get under the limit.",
    "Machine-written files, guide pages and mockups are ignored; to exempt",
    "another generated path, add it to IGNORED in scripts/enforcement/check-staged-file-size.js."
  );
  return lines.join("\n");
}

function main() {
  const repoRoot = git(["rev-parse", "--show-toplevel"], process.cwd()).toString().trim();
  const violations = findViolations(repoRoot);
  if (violations.length) {
    console.error(formatMessage(violations));
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { MAX_BYTES, findViolations };
