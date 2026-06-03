"use strict";

const { execSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..", "..");

/**
 * globToRegExp(glob) -> RegExp
 *
 * Converts a glob pattern to a RegExp. Supports:
 * - ** (match zero or more path segments)
 * - * (match within a single segment, no /)
 * - {a,b,c} brace sets (converted to alternation)
 */
function globToRegExp(glob) {
  // Expand brace sets: {njk,html,md} -> (njk|html|md)
  let expanded = glob.replace(/\{([^}]+)\}/g, (_, inner) => {
    const alternatives = inner.split(",").map((s) => s.trim());
    return `(${alternatives.map(escapeForRegex).join("|")})`;
  });

  // Now convert glob metacharacters to regex pieces
  // We process character by character to handle ** vs *
  let regexStr = "";
  let i = 0;
  while (i < expanded.length) {
    const ch = expanded[i];

    // Check for already-expanded group (starts with '(')
    if (ch === "(") {
      // Find matching ')'
      let depth = 1;
      let j = i + 1;
      while (j < expanded.length && depth > 0) {
        if (expanded[j] === "(") depth++;
        else if (expanded[j] === ")") depth--;
        j++;
      }
      // This segment is already a regex group from brace expansion
      regexStr += expanded.slice(i, j);
      i = j;
      continue;
    }

    if (ch === "*" && expanded[i + 1] === "*") {
      // ** matches zero or more path segments (including nothing)
      // After **, there's often a / — match it optionally
      if (expanded[i + 2] === "/") {
        regexStr += "(?:.+/)?";
        i += 3;
      } else {
        regexStr += ".*";
        i += 2;
      }
    } else if (ch === "*") {
      // * matches anything except /
      regexStr += "[^/]*";
      i++;
    } else if (ch === ".") {
      regexStr += "\\.";
      i++;
    } else if (ch === "/") {
      regexStr += "/";
      i++;
    } else if ("/.*+?^${}()|[]\\".includes(ch) && ch !== "(") {
      // Escape other regex special chars (but not ( which we use for groups)
      regexStr += "\\" + ch;
      i++;
    } else {
      regexStr += ch;
      i++;
    }
  }

  return new RegExp("^" + regexStr + "$");
}

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * filterByLane(files, globs) -> files matching any of the globs
 */
function filterByLane(files, globs) {
  if (!files.length || !globs.length) return [];

  const regexps = globs.map(globToRegExp);

  const seen = new Set();
  const result = [];
  for (const file of files) {
    if (seen.has(file)) continue;
    if (regexps.some((re) => re.test(file))) {
      seen.add(file);
      result.push(file);
    }
  }
  return result;
}

/**
 * resolveTargets(lane, explicitFiles) -> filtered file list
 *
 * If explicitFiles non-empty: filter them by lane globs.
 * Else: run `git diff --name-only` against merge-base with origin/main
 *       (fallback to HEAD~1) and filter.
 */
function resolveTargets(lane, explicitFiles = []) {
  const globs = lane.targets || [];

  if (explicitFiles.length > 0) {
    return filterByLane(explicitFiles, globs);
  }

  // Try to get changed files from git
  let changedFiles = [];
  let resolved = false;
  try {
    const mergeBase = execSync("git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD HEAD~1", {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim();
    const diffOutput = execSync(`git diff --name-only ${mergeBase}`, {
      cwd: projectRoot,
      encoding: "utf8",
    });
    changedFiles = diffOutput.split("\n").filter(Boolean);
    resolved = true;
  } catch {
    try {
      const diffOutput = execSync("git diff --name-only HEAD~1", {
        cwd: projectRoot,
        encoding: "utf8",
      });
      changedFiles = diffOutput.split("\n").filter(Boolean);
      resolved = true;
    } catch {
      changedFiles = [];
    }
  }

  if (!resolved) {
    process.stderr.write(
      "[warn] could not resolve changed files vs origin/main; no targets evaluated\n"
    );
  }

  return filterByLane(changedFiles, globs);
}

module.exports = { filterByLane, resolveTargets, globToRegExp };
