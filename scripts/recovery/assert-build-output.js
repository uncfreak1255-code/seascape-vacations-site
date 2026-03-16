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

function expectNotMatches(file, pattern, description) {
  const contents = read(file);
  if (pattern.test(contents)) {
    throw new Error(`Unexpected pattern in ${file}: ${description}`);
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
  expectNotContains("_site/index.html", 'id="featured-property-grid"');
  expectNotContains("_site/index.html", "prop-card-carousel");
  expectNotContains("_site/index.html", "nextCardImage(");
  expectNotContains(
    "_site/index.html",
    "wp-content/uploads/2025/03/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2.jpg"
  );
  expectContains("_site/index.html", "Partner With Seascape Vacations");
  expectContains("_site/index.html", 'href="/properties/dockside-dreams/"');
  expectContains("_site/index.html", 'href="/properties/the-oasis/"');
  expectContains("_site/index.html", "Dockside Dreams");
  expectContains("_site/index.html", "The Oasis");
  expectContains("_site/index.html", "prop-desc-snippet");
  expectContains("_site/property-management/index.html", "Property Management");
}

if (phase === "guides") {
  expectExists("_site/guides/anna-maria-island-area-guide/index.html");
  expectExists("_site/guides/bradenton-vs-sarasota/index.html");
  expectExists("_site/guides/anna-maria-island-vs-siesta-key/index.html");
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
  expectContains("_site/guides/index.html", "Start Here");
  expectContains("_site/guides/index.html", '<meta property="og:title"');
  expectContains("_site/guides/index.html", '<meta property="og:description"');
  expectNotContains("_site/guides/index.html", '<a" class="btn"');
  expectNotContains("_site/guides/index.html", 'href=/property-management/');
  expectContains("_site/guides/bradenton-vs-sarasota/index.html", "<main>");
  expectContains("_site/guides/bradenton-vs-sarasota/index.html", "Why trust this comparison:");
  expectContains("_site/guides/anna-maria-island-vs-siesta-key/index.html", "<main>");
  expectContains("_site/guides/anna-maria-island-vs-siesta-key/index.html", "Direct answer:");

  const guideFiles = listHtmlFiles("_site/guides");
  for (const file of guideFiles) {
    expectContains(file, '<meta property="og:image"');
    expectContains(file, '<meta name="twitter:image"');
    expectNotContains(file, "images.unsplash.com");
    expectNotContains(file, "/images/logo.png");
    expectNotContains(file, "hostaway-platform.s3.us-west-2.amazonaws.com");
    expectNotContains(file, 'href="index.html"');
    expectNotContains(file, 'href="#destinations"');
    expectNotContains(file, "area-guide-");
    expectNotMatches(file, /(?:src|href)=["']images\//i, "relative images/ asset path");
    expectNotMatches(file, /url\((["']?)images\//i, "relative images/ CSS url");
    expectNotMatches(file, /\bhref=\/[^"'\s>]+/i, "unquoted absolute href");
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
  expectContains("_site/index.html", "kgmid=%2Fg%2F11y4vdnsfp");
  expectContains("_site/index.html", "bookingenginecdn.hostaway.com");
  expectNotContains("_site/index.html", "images.weserv.nl");
  expectContains("_site/property-management/index.html", "images/seascape-og-default.jpg");
  expectContains(
    "_site/property-management/index.html",
    'rel="stylesheet" media="print" onload="this.media=\'all\'"'
  );
  expectContains(
    "_site/guides/bradenton-vs-sarasota/index.html",
    "kgmid=%2Fg%2F11y4vdnsfp"
  );
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'rel="preconnect" href="https://bookingenginecdn.hostaway.com"');
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "bookingenginecdn.hostaway.com");
  expectNotContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "images.weserv.nl");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'fetchpriority="high"');
  expectContains(
    "_site/property-management/vacation-rental-management-sarasota/index.html",
    'rel="stylesheet" media="print" onload="this.media=\'all\'"'
  );
  expectContains("_site/property-management/index.html", "Updated March 2026");
  expectContains("_site/property-management/index.html", "What Is Vacation Rental Property Management?");
  expectContains("_site/property-management/index.html", "Owner Questions");
  expectContains("_site/robots.txt", "OAI-SearchBot");
  expectContains("_site/robots.txt", "ChatGPT-User");
  expectContains("_site/robots.txt", "ClaudeBot");
  expectContains("_site/robots.txt", "Google-Extended");
  expectContains("_site/llms.txt", "## Property Management");
  expectContains("_site/llms.txt", "## Comparison Guides");
  expectNotContains("_site/robots.txt", "LLMs-txt:");
}

console.log(`assert-build-output: ${phase} checks passed`);
