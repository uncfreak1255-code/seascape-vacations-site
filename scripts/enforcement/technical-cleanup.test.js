const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const sourceRoot = path.join(projectRoot, "src");

const LEGACY_GUIDE_PATHS = [
  "/guides/best-time-visit-anna-maria-island.html",
  "/guides/srq-airport-to-anna-maria-island.html",
  "/guides/anna-maria-island-weather.html",
  "/guides/bradenton-vs-sarasota-vacation-rental-comparison/"
];

function collectSourceFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (entryPath.endsWith(".html") || entryPath.endsWith(".njk") || entryPath.endsWith(".md") || entryPath.endsWith(".txt") || entryPath.endsWith(".js")) {
      files.push(entryPath);
    }
  }

  return files;
}

test("priority legacy guide families are not linked from live source files", () => {
  const sourceFiles = collectSourceFiles(sourceRoot).filter((filePath) => !filePath.endsWith(path.join("src", "_redirects")));

  for (const legacyPath of LEGACY_GUIDE_PATHS) {
    const offenders = sourceFiles.filter((filePath) => fs.readFileSync(filePath, "utf8").includes(legacyPath));
    assert.deepEqual(
      offenders,
      [],
      `Expected no live source file to include ${legacyPath}, found: ${offenders.map((filePath) => path.relative(projectRoot, filePath)).join(", ")}`
    );
  }
});

test("highest-priority weather redirects point to the canonical slash route", () => {
  const redirects = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8");

  for (const redirectRule of [
    "/travel-spot-guide/tide-tables   /guides/anna-maria-island-weather/   301",
    "/travel-spot-guide/tide-tables/   /guides/anna-maria-island-weather/   301",
    "/anna-maria-island-weather.html   /guides/anna-maria-island-weather/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});
