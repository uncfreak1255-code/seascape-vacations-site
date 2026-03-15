const fs = require("fs");
const path = require("path");

const phase = process.argv[2] || "p0";

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function expectExists(file) {
  if (!fs.existsSync(path.resolve(file))) {
    throw new Error(`Missing expected file: ${file}`);
  }
}

function expectNotContains(file, needle) {
  const contents = read(file);
  if (contents.includes(needle)) {
    throw new Error(`Unexpected content in ${file}: ${needle}`);
  }
}

function expectContains(file, needle) {
  const contents = read(file);
  if (!contents.includes(needle)) {
    throw new Error(`Missing expected content in ${file}: ${needle}`);
  }
}

if (phase === "p0") {
  expectExists("_site/index.html");
  expectExists("_site/property-management/index.html");
  expectNotContains("eleventy.config.js", 'addPassthroughCopy({"index.html": "index.html"})');
  expectNotContains(
    "_site/index.html",
    "wp-content/uploads/2025/03/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2.jpg"
  );
  expectContains("_site/index.html", "Partner With Seascape Vacations");
  expectContains("_site/property-management/index.html", "Property Management");
}

if (phase === "guides") {
  expectExists("_site/guides/anna-maria-island-area-guide/index.html");
  expectExists("_site/llms.txt");
  expectExists("_site/_redirects");
  expectNotContains("_site/_redirects", "/property-management   /property-management/   301");
  expectContains(
    "_site/guides/anna-maria-island-area-guide/index.html",
    '<link rel="canonical" href="https://seascape-vacations.com/guides/anna-maria-island-area-guide/">'
  );
  expectNotContains(
    "_site/guides/anna-maria-island-area-guide/index.html",
    'content="https://seascape-vacations.com/area-guide-ami"'
  );
  expectNotContains(
    "_site/guides/anna-maria-island-area-guide/index.html",
    'href=/guides/best-time-visit-anna-maria-island'
  );
  expectNotContains(
    "_site/guides/anna-maria-island-area-guide/index.html",
    'href=/stays/anna-maria-island-homes-with-pool/"'
  );
}

if (phase === "remediation") {
  expectExists("_site/robots.txt");
  expectNotContains(
    "_site/stays/anna-maria-island-vacation-rentals/index.html",
    '"text": "Manatee Public Beach in <a href='
  );
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "srcset=");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'width="800"');
  expectExists("_site/properties/dockside-dreams/index.html");
  expectNotContains(
    "_site/stays/anna-maria-island-vacation-rentals/index.html",
    'href="/" class="btn" style="padding: 10px 20px; font-size: 13px;">View Details</a>'
  );
  expectNotContains(
    "_site/property-management/vacation-rental-management-sarasota/index.html",
    "!function (f, b, e, v, n, t, s) {"
  );
  expectNotContains(
    "_site/property-management/vacation-rental-management-sarasota/index.html",
    "/property-owners/"
  );
  expectNotContains("_site/robots.txt", "LLMs-txt:");
}

console.log(`assert-build-output: ${phase} checks passed`);
