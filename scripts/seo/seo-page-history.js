"use strict";

/**
 * Per-entry modification history for the data-driven owner and stay pages.
 *
 * gitLastModifiedDate() resolves the mtime of whole FILES. Every owner page is
 * generated from the same three files, so all 27 owner URLs used to emit one
 * identical <lastmod>, and all 58 stay URLs another. This module resolves the
 * last commit that touched each entry's own JSON in seoPages.json instead, by
 * walking that file's history once and comparing serialized entries against
 * the actual first parent of each revision.
 *
 * Correctness notes, each of which exists because a review caught the naive
 * version being wrong:
 *
 * - The walk uses `git log --first-parent`. Plain `git log -- <path>` interleaves
 *   sibling commits from merged branches, and consecutive rows are then not
 *   parent/child, so a blob diff between them attributes one branch's change to
 *   its sibling's timestamp. First-parent rows on the deployed branch ARE
 *   consecutive states of that branch, so the comparison is sound, and a side
 *   branch's changes land with its merge commit's date - which is when they
 *   actually reached the deployed branch.
 *
 * - A SHALLOW clone exposes only the truncated tip of history. Walking it would
 *   fabricate one uniform date for every entry while looking healthy. In that
 *   case this module returns an empty map so callers fall back to the old
 *   per-file behaviour: degraded but honest, never invented.
 *
 * - Blobs are fetched through ONE `git cat-file --batch` process. Spawning
 *   `git show` per revision costs ~100ms each inside a loaded build process
 *   (vs ~9ms standalone) and added ~6.4s to the site build.
 */

const { execFileSync } = require("node:child_process");

const SEO_PAGES_PATH = "src/_data/seoPages.json";
const SEO_PAGE_GROUPS = ["owner", "vacationer"];

// Git hooks export repo-location variables (GIT_DIR, GIT_INDEX_FILE, ...).
// Inherited, they override `cwd` discovery and silently point every git call
// here at the HOOK'S repository instead of the requested one — which is how a
// pre-commit run once aimed a caller's `git init` at the main repo and flipped
// its config to bare=true. Location vars are stripped; everything else
// (credentials, tracing) passes through.
const GIT_LOCATION_VARS = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_COMMON_DIR",
]);

function cleanGitEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !GIT_LOCATION_VARS.has(key))
  );
}

function git(cwd, args, options = {}) {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: cleanGitEnv(), ...options });
}

function isShallowRepository(cwd) {
  try {
    return git(cwd, ["rev-parse", "--is-shallow-repository"]).trim() === "true";
  } catch {
    return false;
  }
}

// Resolve many git objects in a single subprocess. `git cat-file --batch`
// takes one revision spec per line on stdin and replies with
// "<oid> <type> <size>\n<contents>\n" per hit, or "<spec> missing\n".
// Returns contents positionally, with null for anything missing.
function readBlobBatch(cwd, specs) {
  if (!specs.length) {
    return [];
  }

  let stdout;
  try {
    stdout = execFileSync("git", ["cat-file", "--batch"], {
      cwd,
      input: `${specs.join("\n")}\n`,
      maxBuffer: 512 * 1024 * 1024,
      env: cleanGitEnv(),
    });
  } catch {
    return specs.map(() => null);
  }

  const results = [];
  let cursor = 0;
  for (let index = 0; index < specs.length; index += 1) {
    const newline = stdout.indexOf(0x0a, cursor);
    if (newline === -1) {
      results.push(null);
      continue;
    }

    const header = stdout.toString("utf8", cursor, newline);
    if (header.endsWith(" missing")) {
      results.push(null);
      cursor = newline + 1;
      continue;
    }

    const size = Number.parseInt(header.slice(header.lastIndexOf(" ") + 1), 10);
    if (!Number.isFinite(size)) {
      results.push(null);
      cursor = newline + 1;
      continue;
    }

    const start = newline + 1;
    results.push(stdout.toString("utf8", start, start + size));
    cursor = start + size + 1; // trailing newline after contents
  }

  return results;
}

function entryMap(doc) {
  const entries = new Map();
  for (const group of SEO_PAGE_GROUPS) {
    for (const entry of doc?.[group] || []) {
      if (entry?.slug) {
        entries.set(`${group}/${entry.slug}`, JSON.stringify(entry));
      }
    }
  }
  return entries;
}

/**
 * Map of "group/slug" -> ISO timestamp of the newest first-parent revision in
 * which that entry's serialized JSON differs from the previous revision.
 * Returns an empty map (with `degraded: true` on the result) when history is
 * unavailable or shallow, so callers can fall back rather than fabricate.
 */
function buildSeoPageHistory({ cwd, seoPagesPath = SEO_PAGES_PATH, warn = () => {} } = {}) {
  const history = new Map();

  if (isShallowRepository(cwd)) {
    warn(
      `seo-page-history: ${cwd} is a shallow clone; per-entry lastmod dates cannot be derived ` +
        "from truncated history. Falling back to per-file dates. Fetch full history " +
        "(git fetch --unshallow) to restore per-page discrimination."
    );
    history.degraded = true;
    return history;
  }

  let log;
  try {
    log = git(cwd, ["log", "--first-parent", "--format=%H %P %cI", "--", seoPagesPath], {
      maxBuffer: 16 * 1024 * 1024,
    }).trim();
  } catch {
    history.degraded = true;
    return history;
  }
  if (!log) {
    history.degraded = true;
    return history;
  }

  const revisions = log.split("\n").map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      sha: parts[0],
      parents: parts.slice(1, -1),
      iso: parts[parts.length - 1],
    };
  });

  const specs = [];
  for (const revision of revisions) {
    specs.push(`${revision.sha}:${seoPagesPath}`);
    if (revision.parents[0]) {
      specs.push(`${revision.parents[0]}:${seoPagesPath}`);
    }
  }
  const blobs = readBlobBatch(cwd, specs);
  const blobBySpec = new Map(specs.map((spec, index) => [spec, blobs[index]]));

  // Compare each revision with its actual first parent. Consecutive rows from
  // a path-limited log are not a safe substitute for parent relationships.
  for (const revision of revisions) {
    const currentBlob = blobBySpec.get(`${revision.sha}:${seoPagesPath}`);
    if (!currentBlob) {
      continue;
    }

    let currentDocument;
    try {
      currentDocument = JSON.parse(currentBlob);
    } catch {
      continue;
    }

    let parentDocument = null;
    if (revision.parents[0]) {
      const parentBlob = blobBySpec.get(`${revision.parents[0]}:${seoPagesPath}`);
      if (!parentBlob) {
        continue;
      }
      try {
        parentDocument = JSON.parse(parentBlob);
      } catch {
        // A missing parent blob cannot prove an entry changed at this revision.
        continue;
      }
    }

    const currentEntries = entryMap(currentDocument);
    const parentEntries = entryMap(parentDocument);
    for (const [key, value] of currentEntries.entries()) {
      if (parentEntries.get(key) !== value && !history.has(key)) {
        history.set(key, revision.iso);
      }
    }
  }

  return history;
}

module.exports = {
  SEO_PAGES_PATH,
  SEO_PAGE_GROUPS,
  buildSeoPageHistory,
  isShallowRepository,
  readBlobBatch,
};
