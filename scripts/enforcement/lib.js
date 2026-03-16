const fs = require("fs");
const path = require("path");

const FORBIDDEN_SOURCE_PATH_PATTERNS = [
  /^DEPLOY THIS FOLDER TO NETLIFY\//,
  /^index\.html$/,
  /^stays\//,
  /^property-management\//
];

const PROTECTED_REMOTE_REFS = new Set(["refs/heads/main"]);
const PLACEHOLDER_ANALYTICS_PATTERN = /G-XXXXXXXXXX/;

function parsePushRefs(input) {
  return String(input || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef, localSha, remoteRef, remoteSha] = line.split(/\s+/);
      return { localRef, localSha, remoteRef, remoteSha };
    });
}

function isProtectedPush(refs) {
  return refs.some((ref) => PROTECTED_REMOTE_REFS.has(ref.remoteRef));
}

function findForbiddenSourcePaths(changedFiles) {
  return changedFiles.filter((file) =>
    FORBIDDEN_SOURCE_PATH_PATTERNS.some((pattern) => pattern.test(file))
  );
}

function findPlaceholderAnalyticsPaths(rootDir) {
  const matches = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      if (PLACEHOLDER_ANALYTICS_PATTERN.test(content)) {
        matches.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return matches;
}

module.exports = {
  findForbiddenSourcePaths,
  findPlaceholderAnalyticsPaths,
  isProtectedPush,
  parsePushRefs
};
