const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parsePushRefs,
  isProtectedPush,
  findForbiddenSourcePaths,
  findMarkerMatches,
  findPlaceholderAnalyticsPaths,
  findTemplateLeakMarkers,
  findStandaloneShellMarkers
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

test("findPlaceholderAnalyticsPaths finds GA placeholder ids in source files", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-analytics-"));
  const cleanFile = path.join(tempRoot, "clean.html");
  const brokenFile = path.join(tempRoot, "broken.html");

  fs.writeFileSync(cleanFile, "<script>gtag('config', 'G-3VDV66S3DK');</script>");
  fs.writeFileSync(brokenFile, "<script>gtag('config', 'G-XXXXXXXXXX');</script>");

  const matches = findPlaceholderAnalyticsPaths(tempRoot);

  assert.deepEqual(matches, [brokenFile]);
});

test("findStandaloneShellMarkers flags legacy SPA shell markers in standalone HTML", () => {
  const html = `
    <div id="page-home" class="page"></div>
    <button onclick="showPage('properties')">Properties</button>
  `;

  assert.deepEqual(findStandaloneShellMarkers(html), ['id="page-home"', "showPage("]);
});

test("findTemplateLeakMarkers flags raw template syntax in generated HTML", () => {
  const html = `
    <section>{{ properties | length }}</section>
    {% for property in properties %}
  `;

  assert.deepEqual(findTemplateLeakMarkers(html), ["{{", "{%"]);
});

test("findMarkerMatches returns only the disallowed markers present in content", () => {
  const html = `
    <span>✍️ By Seascape Vacations</span>
    <a href="/stays/img-academy-vacation-rentals-bradenton/">IMG rentals</a>
  `;

  assert.deepEqual(
    findMarkerMatches(html, ["✍️", "/stays/img-academy-vacation-rentals-bradenton/", "📞"]),
    ["✍️", "/stays/img-academy-vacation-rentals-bradenton/"]
  );
});
