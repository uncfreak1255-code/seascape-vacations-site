const FORBIDDEN_SOURCE_PATH_PATTERNS = [
  /^DEPLOY THIS FOLDER TO NETLIFY\//,
  /^index\.html$/,
  /^stays\//,
  /^property-management\//
];

const PROTECTED_REMOTE_REFS = new Set(["refs/heads/main"]);

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

module.exports = {
  findForbiddenSourcePaths,
  isProtectedPush,
  parsePushRefs
};
