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

function listHtmlFiles(dir) {
  const absolute = path.resolve(dir);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      return listHtmlFiles(fullPath);
    }
    return fullPath.endsWith(".html") ? [fullPath] : [];
  });
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
  expectExists("_site/images/anna-maria-island-og.jpg");
  expectExists("_site/images/bradenton-og.jpg");
  expectExists("_site/images/sarasota-og.jpg");
  expectExists("_site/images/siesta-key-og.jpg");
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

  const guideFiles = listHtmlFiles("_site/guides");
  for (const file of guideFiles) {
    expectContains(file, '<meta property="og:image"');
    expectContains(file, '<meta name="twitter:image"');
    expectNotContains(file, "images.unsplash.com");
    expectNotContains(file, "/images/logo.png");
  }
}

if (phase === "remediation") {
  expectExists("_site/robots.txt");
  expectExists("_site/hero-mobile.webp");
  expectExists("_site/hero-optimized.webp");
  expectExists("_site/images/seascape-og-default.jpg");
  expectExists("_site/images/anna-maria-island-og.jpg");
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
  expectNotContains(
    "_site/index.html",
    "wp-content/uploads/2025/03/51916-206016-xNIrPl9kvF0vllYFzSL7Lm0Gl4eOGxLIN--wmPlCT3NY-6536bca493945.jpg"
  );
  expectContains("_site/index.html", "images/seascape-og-default.jpg");
  expectContains("_site/index.html", "hero-optimized.webp");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'rel="preconnect" href="https://images.weserv.nl"');
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'fetchpriority="high"');
  expectContains(
    "_site/property-management/vacation-rental-management-sarasota/index.html",
    'rel="stylesheet" media="print" onload="this.media=\'all\'"'
  );
  expectNotContains("_site/robots.txt", "LLMs-txt:");
}

console.log(`assert-build-output: ${phase} checks passed`);
