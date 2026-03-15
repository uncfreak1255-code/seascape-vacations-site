const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parsePushRefs,
  isProtectedPush,
  findForbiddenSourcePaths
} = require("./lib");

test("parsePushRefs converts pre-push stdin lines into structured refs", () => {
  const refs = parsePushRefs(
    "refs/heads/codex/site-recovery abc123 refs/heads/main def456\n"
  );

  assert.deepEqual(refs, [
    {
      localRef: "refs/heads/codex/site-recovery",
      localSha: "abc123",
      remoteRef: "refs/heads/main",
      remoteSha: "def456"
    }
  ]);
});

test("isProtectedPush returns true when any push targets main", () => {
  assert.equal(
    isProtectedPush([
      {
        localRef: "refs/heads/codex/site-recovery",
        localSha: "abc123",
        remoteRef: "refs/heads/main",
        remoteSha: "def456"
      }
    ]),
    true
  );

  assert.equal(
    isProtectedPush([
      {
        localRef: "refs/heads/codex/site-recovery",
        localSha: "abc123",
        remoteRef: "refs/heads/codex/site-recovery",
        remoteSha: "0000000000000000000000000000000000000000"
      }
    ]),
    false
  );
});

test("findForbiddenSourcePaths flags legacy source-of-truth violations only", () => {
  const violations = findForbiddenSourcePaths([
    "DEPLOY THIS FOLDER TO NETLIFY/index.html",
    "index.html",
    "stays/example/index.html",
    "property-management/example/index.html",
    "src/index.njk",
    "src/stays/stays.njk",
    "docs/process/before-merge-checklist.md"
  ]);

  assert.deepEqual(violations, [
    "DEPLOY THIS FOLDER TO NETLIFY/index.html",
    "index.html",
    "stays/example/index.html",
    "property-management/example/index.html"
  ]);
});
