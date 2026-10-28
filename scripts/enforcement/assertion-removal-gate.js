// Fails a release range that deletes more test assertions than it adds, unless a
// commit in the range carries an "Assertions-Removed: <reason>" trailer. Catches a
// change that quietly drops a passing check while updating the strings it guards.
const { spawnSync } = require("child_process");

const TEST_PATH_PATTERNS = [
  /\.test\.[cm]?[jt]s$/i,
  /\.spec\.[cm]?[jt]s$/i,
  /\.e2e\.[cm]?[jt]s$/i,
];
const ASSERTION_PATTERN = /\b(?:assert(?:\.\w+)?|expect)\s*\(/;
const TRAILER_PATTERN = /^Assertions-Removed:\s*\S.*$/im;
// A commented-out assertion no longer runs, so it never counts as an addition.
const COMMENT_LINE_PATTERN = /^\s*(?:\/\/|\/\*|\*)/;

function capture(args, cwd, env) {
  const result = spawnSync("git", args, { cwd, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function isTestPath(relativePath) {
  return TEST_PATH_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function countAssertionChanges(diffText) {
  const perFile = new Map();
  let currentFile = "";

  for (const line of String(diffText || "").split("\n")) {
    const header = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (header) {
      currentFile = header[2];
      continue;
    }
    if (!currentFile || !isTestPath(currentFile) || line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }
    const sign = line[0];
    const body = line.slice(1);
    if ((sign !== "+" && sign !== "-") || COMMENT_LINE_PATTERN.test(body) || !ASSERTION_PATTERN.test(body)) {
      continue;
    }
    const entry = perFile.get(currentFile) || { added: 0, removed: 0 };
    if (sign === "+") {
      entry.added += 1;
    } else {
      entry.removed += 1;
    }
    perFile.set(currentFile, entry);
  }

  let added = 0;
  let removed = 0;
  for (const entry of perFile.values()) {
    added += entry.added;
    removed += entry.removed;
  }
  return { added, removed, perFile };
}

function logRangeFor(range) {
  const value = String(range || "").trim();
  if (value.includes("...")) {
    return value.replace("...", "..");
  }
  return value.includes("..") ? value : `${value}..HEAD`;
}

function assertNoNetAssertionRemoval({ range, cwd = process.cwd(), env = process.env } = {}) {
  if (!range) {
    throw new Error("assertion removal gate requires a non-empty range");
  }

  const { added, removed, perFile } = countAssertionChanges(
    // --no-renames: a test renamed out of discovery shows as a deleted test file.
    capture(["diff", "--no-renames", range], cwd, env)
  );
  if (removed <= added) {
    return { added, removed, status: "passed" };
  }

  const messages = capture(["log", "--format=%B", logRangeFor(range)], cwd, env);
  if (TRAILER_PATTERN.test(messages)) {
    return { added, removed, status: "acknowledged" };
  }

  const lines = [...perFile.entries()]
    .filter(([, entry]) => entry.removed > entry.added)
    .map(([file, entry]) => `- ${file}: ${entry.removed} removed, ${entry.added} added`);
  throw new Error(
    [
      `This range removes ${removed} test assertions and adds ${added}.`,
      ...lines,
      "Restore the dropped assertions, or, if removing them is intended, add a commit trailer",
      '"Assertions-Removed: <why the checks no longer apply>" and say so in the PR body.',
    ].join("\n")
  );
}

module.exports = {
  assertNoNetAssertionRemoval,
  countAssertionChanges,
  isTestPath,
  logRangeFor,
};
