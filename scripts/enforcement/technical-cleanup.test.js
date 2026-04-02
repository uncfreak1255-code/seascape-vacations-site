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
  "/guides/bradenton-vs-sarasota.html",
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

test("priority canonical guide families 301 their .html aliases to the slash route", () => {
  const redirects = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8");

  for (const redirectRule of [
    "/guides/best-time-visit-anna-maria-island.html  /guides/best-time-visit-anna-maria-island/  301",
    "/guides/srq-airport-to-anna-maria-island.html  /guides/srq-airport-to-anna-maria-island/  301",
    "/guides/anna-maria-island-weather.html  /guides/anna-maria-island-weather/  301",
    "/guides/bradenton-vs-sarasota.html  /guides/bradenton-vs-sarasota/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});

test("priority canonical guide families 301 plain guide aliases to the slash route", () => {
  const redirects = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8");

  for (const redirectRule of [
    "/guides/best-time-visit-anna-maria-island  /guides/best-time-visit-anna-maria-island/  301",
    "/guides/srq-airport-to-anna-maria-island  /guides/srq-airport-to-anna-maria-island/  301",
    "/guides/anna-maria-island-weather  /guides/anna-maria-island-weather/  301",
    "/guides/bradenton-vs-sarasota  /guides/bradenton-vs-sarasota/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});

test("retired Bradenton money slug 301s to the current canonical stay page", () => {
  const redirects = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8");

  for (const redirectRule of [
    "/stays/vacation-rentals-bradenton-florida  /stays/bradenton-vacation-rentals-near-beaches  301",
    "/stays/vacation-rentals-bradenton-florida/  /stays/bradenton-vacation-rentals-near-beaches/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});

test("stale owner licensing aliases 301 to the canonical licensing route", () => {
  const redirects = fs.readFileSync(path.join(sourceRoot, "_redirects"), "utf8");

  for (const redirectRule of [
    "/property-management/vacation-rental-management-licensing-florida  /property-management/vacation-rental-licensing-florida/  301",
    "/property-management/vacation-rental-management-licensing-florida/  /property-management/vacation-rental-licensing-florida/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});

test("priority canonical guide families keep schema and breadcrumb copy aligned with route intent", () => {
  const bestTimeGuide = fs.readFileSync(path.join(sourceRoot, "guides", "best-time-visit-anna-maria-island.html"), "utf8");
  const srqGuide = fs.readFileSync(path.join(sourceRoot, "guides", "srq-airport-to-anna-maria-island.html"), "utf8");
  const weatherGuide = fs.readFileSync(path.join(sourceRoot, "guides", "anna-maria-island-weather.html"), "utf8");
  const bradentonGuide = fs.readFileSync(path.join(sourceRoot, "guides", "bradenton-vs-sarasota.html"), "utf8");

  assert.equal(
    bestTimeGuide.includes('"name":"Best Time to Visit Anna Maria Island","item":"https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/"'),
    true
  );
  assert.equal(bestTimeGuide.includes(">Best Time to Visit Anna Maria Island</div>"), true);

  assert.equal(
    srqGuide.includes('"headline": "SRQ Airport to Anna Maria Island: 30-Min Route & Tips"'),
    true
  );
  assert.equal(
    srqGuide.includes('"name": "SRQ Airport to Anna Maria Island", "item": "https://seascape-vacations.com/guides/srq-airport-to-anna-maria-island/"'),
    true
  );
  assert.equal(srqGuide.includes("Anna Maria Island Beaches"), false);
  assert.equal(srqGuide.includes("What are the best beaches on Anna Maria Island?"), false);

  assert.equal(
    weatherGuide.includes('"name": "Anna Maria Island Weather", "item": "https://seascape-vacations.com/guides/anna-maria-island-weather/"'),
    true
  );
  assert.equal(weatherGuide.includes(">Anna Maria Island Weather</li>"), true);
  assert.equal(weatherGuide.includes("AMI Weather"), false);

  assert.equal(
    bradentonGuide.includes('"item": "https://seascape-vacations.com/guides/bradenton-vs-sarasota/"'),
    true
  );
  assert.equal(
    bradentonGuide.includes('"url": "https://seascape-vacations.com/guides/bradenton-vs-sarasota/"'),
    true
  );
  assert.equal(
    bradentonGuide.includes('"item": "https://seascape-vacations.com/guides/bradenton-vs-sarasota"'),
    false
  );
  assert.equal(
    bradentonGuide.includes('"url": "https://seascape-vacations.com/guides/bradenton-vs-sarasota"'),
    false
  );
});

test("guide hubs link priority canonical winners directly instead of through redirect aliases", () => {
  const bradentonAreaGuide = fs.readFileSync(path.join(sourceRoot, "guides", "bradenton-area-guide", "index.html"), "utf8");

  assert.equal(
    bradentonAreaGuide.includes('href="/guides/bradenton-vs-sarasota/"'),
    true
  );
  assert.equal(
    bradentonAreaGuide.includes('href="/guides/bradenton-vs-sarasota"'),
    false
  );
  assert.equal(
    bradentonAreaGuide.includes('href="/stays/bradenton-vacation-rentals-near-beaches/""'),
    false
  );
});
