const fs = require("fs");
const path = require("path");
const {
  findMarkerMatches,
  findStandaloneShellMarkers,
  findTemplateLeakMarkers
} = require("../enforcement/lib");

const phase = process.argv[2] || "p0";
const HOMEPAGE_PUBLIC_EMOJI_MARKERS = ["📞", "✉", "✉️", "📍", "⭐ TOP 1% OCCUPANCY IN MANATEE COUNTY", "5.0 ⭐"];
const STAY_TEMPLATE_EMOJI_MARKERS = ["✍️", "⭐ "];
const PROPERTY_PAGE_EMOJI_MARKERS = [
  "🛏️",
  "🚿",
  "👥",
  "🏖️",
  "🏟️",
  "⚽",
  "✈️",
  "🏊",
  "♨️",
  "⚓",
  "🎱",
  "📺",
  "🍳",
  "🎮",
  "🔥",
  "👶",
  "📶",
  "👗",
  "👕",
  "⛳",
  "🎲",
  "🌴",
  "🎯",
  "🌽",
  "🍽️",
  "🏠",
  "🔒",
  "🚫",
  "📞",
  "✉",
  "✉️",
  "📍"
];
const PROPERTY_STALE_LINK_MARKERS = [
  "/stays/img-academy-vacation-rentals-bradenton/",
  "/stays/coquina-beach-vacation-rentals/",
  "/stays/vacation-rentals-with-heated-pool/",
  "/reviews/"
];
const PROPERTY_NAV_STALE_ROUTE_MARKERS = [
  'href="/stays/" class="nav-link">Local Guide</a>',
  'href="/stays/" class="mobile-item">Local Guide</a>',
  'href="/about-us/" class="nav-link">Contact</a>',
  'href="/about-us/" class="mobile-item">Contact</a>',
  'href="/property-management/vacation-rental-management-anna-maria-island/" class="nav-link">Property Owners</a>',
  'href="/property-management/vacation-rental-management-anna-maria-island/" class="mobile-item">Property Owners</a>',
  'href="/property-management/vacation-rental-management-anna-maria-island/" class="footer-link">For Owners</a>',
  'href="/about-us/" class="footer-link">Contact</a>',
  'href="/stays/anna-maria-island-homes-with-pool/" role="menuitem">Anna Maria Island</a>',
  'href="/stays/anna-maria-island-homes-with-pool/" class="mobile-item">Anna Maria Island</a>'
];
const PROPERTY_PAGE_FILES = [
  "_site/properties/bradenton-pool-home/index.html",
  "_site/properties/dockside-dreams/index.html",
  "_site/properties/river-house/index.html",
  "_site/properties/sarasota-luxe/index.html",
  "_site/properties/the-oasis/index.html"
];

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function expectExists(file) {
  if (!fs.existsSync(path.resolve(file))) {
    throw new Error(`Missing expected file: ${file}`);
  }
}

function expectNotExists(file) {
  if (fs.existsSync(path.resolve(file))) {
    throw new Error(`Unexpected stale file remains in build output: ${file}`);
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

function expectMatches(file, pattern, description) {
  const contents = read(file);
  if (!pattern.test(contents)) {
    throw new Error(`Missing expected pattern in ${file}: ${description}`);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAnchorPattern({ href, className, text, extraAttributes = "" }) {
  const hrefPattern = `href="${escapeRegex(href)}"`;
  const classPattern = className ? `(?=[^>]*class="(?:[^"]*\\s)?${escapeRegex(className)}(?:\\s|"))` : "";
  const extraPattern = extraAttributes ? `(?=[^>]*${extraAttributes})` : "";
  const textPattern = escapeRegex(text);

  return new RegExp(
    `<a\\b(?=[^>]*${hrefPattern})${classPattern}${extraPattern}[^>]*>${textPattern}<\\/a>`
  );
}

function expectNoMarkers(file, markers, description) {
  const matches = findMarkerMatches(read(file), markers);
  if (matches.length) {
    throw new Error(`Unexpected ${description} in ${file}: ${matches.join(", ")}`);
  }
}

function expectNoStandaloneShellMarkers(file) {
  const markers = findStandaloneShellMarkers(read(file));
  if (markers.length) {
    throw new Error(
      `Standalone route leaked legacy SPA shell markers in ${file}: ${markers.join(", ")}`
    );
  }
}

function expectNoTemplateLeakMarkers(file) {
  const markers = findTemplateLeakMarkers(read(file));
  if (markers.length) {
    throw new Error(
      `Generated output leaked raw template markers in ${file}: ${markers.join(", ")}`
    );
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

function expectNotContainsInHtml(dir, needle) {
  const files = listHtmlFiles(dir);
  for (const file of files) {
    expectNotContains(file, needle);
  }
}

if (phase === "p0") {
  expectExists("_site/index.html");
  expectExists("_site/properties/index.html");
  expectExists("_site/property-management/index.html");
  expectNotExists("_site/netlify/functions/get-properties.js");
  expectNotExists("_site/stays/hurricane-preparedness-florida-vacation/index.html");
  expectNotExists("_site/stays/concierge-luxury-services/index.html");
  expectNotExists("_site/stays/travel-insurance-florida-vacation/index.html");
  expectNotExists("_site/stays/vacation-rentals-with-heated-pool/index.html");
  expectNotContains("eleventy.config.js", 'addPassthroughCopy({"index.html": "index.html"})');
  expectNotContains("_site/index.html", 'id="featured-property-grid"');
  expectNotContains("_site/index.html", "prop-card-carousel");
  expectNotContains("_site/index.html", "nextCardImage(");
  expectNotContains("_site/index.html", "/.netlify/functions/get-properties");
  expectNotContains("_site/index.html", "api.hostaway.com");
  expectNotContains("_site/index.html", "hostaway-platform.s3.us-west-2.amazonaws.com");
  expectNotContains("_site/index.html", "images.unsplash.com");
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
  expectContains("_site/index.html", "bookingenginecdn.hostaway.com");
  expectContains("_site/properties/index.html", 'href="/properties/dockside-dreams/"');
  expectNotContains("_site/properties/index.html", "/.netlify/functions/get-properties");
  expectNotContains("_site/properties/index.html", "api.hostaway.com");
  expectNotContains("_site/properties/index.html", "hostaway-platform.s3.us-west-2.amazonaws.com");
  expectContains("_site/property-management/index.html", "Property Management");
  expectContains("_site/properties/index.html", 'href="/css/base.css"');
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", ".nav-logo img");
  expectContains("_site/property-management/index.html", 'href="/css/base.css"');
  expectContains("_site/css/base.css", ".nav-logo img");
  expectNotContains("_site/index.html", '<button class="mobile-btn" onclick="toggleMenu()">☰</button>');
  expectNotContains("_site/index.html", '<span class="star">★</span>');
  expectNotContains("_site/index.html", "<div class=\"review-stars\">★★★★★</div>");
  expectNotContains("_site/index.html", "<div class=\"email-popup-success-icon\">✓</div>");
  expectNotContains("_site/index.html", "checkboxSpan.innerHTML = '✓'");
  expectNotContains("_site/index.html", "btn.textContent = '✓ Request Sent!'");
  expectNotContains("_site/index.html", "btn.textContent = '✓ Sent!'");
  expectNotContains("_site/index.html", "const icons = { success: '✓', error: '✕', info: 'ℹ' };");
  expectNotContains("_site/index.html", '<span style="color:var(--gold)">✓</span>');
  expectNotContainsInHtml("_site/properties", "content:'✓'");
  expectNotContainsInHtml("_site/properties", "&#10003;");
  expectNotContainsInHtml("_site/properties", "&#9989;");
  expectNotContainsInHtml("_site/properties", "&#10060;");
  expectNotContainsInHtml("_site/properties", 'aria-controls="mobileMenu">☰</button>');
  expectNotContainsInHtml("_site/properties", 'onclick="closeGallery()">✕</button>');
  expectNotContains("_site/property-management/index.html", ">✓<");
  expectNotContains("_site/property-management/index.html", "5.0★");
  expectNoStandaloneShellMarkers("_site/properties/index.html");
  expectNoTemplateLeakMarkers("_site/properties/index.html");
  expectNotContains("_site/properties/index.html", "rendered from one source of truth");
  expectNotContains("_site/properties/index.html", "Every home is rendered at build time");
  expectNotContains("_site/properties/index.html", "No client-side card injection");
  expectNotContains("_site/properties/index.html", "Use this table before opening detail pages");
  expectNotContains("_site/properties/index.html", "collection-strip");
  expectNotContains("_site/properties/index.html", "compare-table");
  expectNotContains("_site/properties/index.html", "decision-panel");
}

if (["p0", "guides", "remediation"].includes(phase)) {
  expectNotContainsInHtml("_site", "/.netlify/functions/get-properties");
  expectNotContainsInHtml("_site", "api.hostaway.com");
  expectNotContainsInHtml("_site", "hostaway-platform.s3.us-west-2.amazonaws.com");
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
  expectContains("_site/_redirects", "/stays/hurricane-preparedness-florida-vacation/  /guides/hurricane-preparedness-florida-vacation/  301");
  expectContains("_site/_redirects", "/stays/travel-insurance-florida-vacation/  /guides/hurricane-preparedness-florida-vacation/  301");
  expectContains("_site/_redirects", "/stays/vacation-rentals-with-heated-pool/  /stays/vacation-rentals-with-pool-and-hot-tub/  301");
  expectContains("_site/_redirects", "/stays/concierge-luxury-services/  /services/concierge-services/  301");
  expectExists("_site/images/seascape-og-default.jpg");
  expectExists("_site/images/anna-maria-island-og.jpg");
  expectMatches("_site/index.html", /Local Gulf Coast hosting team/, "homepage local-hosting trust badge");
  expectMatches("_site/index.html", /5[\s\S]{0,120}Managed Homes/, "homepage managed homes stat");
  expectMatches("_site/index.html", /4-16[\s\S]{0,120}Guests Per Stay/, "homepage guests-per-stay stat");
  expectMatches("_site/index.html", /10-15%[\s\S]{0,120}Book Direct Savings/, "homepage 10-15% Book Direct Savings stat");
  expectMatches("_site/index.html", /24\/7[\s\S]{0,120}Local Support/, "homepage 24/7 Local Support stat");
  expectNotMatches(
    "_site/index.html",
    /class="stat-value">0<\/div>\s*<div class="stat-label">Airbnb Rating<\/div>/,
    "homepage Airbnb Rating zero fallback"
  );
  expectNotMatches(
    "_site/index.html",
    /class="stat-value">0<\/div>\s*<div class="stat-label">5-Star Reviews<\/div>/,
    "homepage 5-Star Reviews zero fallback"
  );
  expectNotMatches(
    "_site/index.html",
    /class="stat-value">0<\/div>\s*<div class="stat-label">Book Direct Savings<\/div>/,
    "homepage Book Direct Savings zero fallback"
  );
  expectNotMatches(
    "_site/index.html",
    /class="stat-value">0<\/div>\s*<div class="stat-label">Local Support<\/div>/,
    "homepage Local Support zero fallback"
  );
  expectNotMatches("_site/index.html", /4\.98[\s\S]{0,120}Airbnb Rating/, "homepage fake Airbnb rating stat");
  expectNotMatches("_site/index.html", /650\+[\s\S]{0,120}5-Star Reviews/, "homepage fake 5-star review stat");
  expectNoMarkers("_site/index.html", HOMEPAGE_PUBLIC_EMOJI_MARKERS, "homepage emoji markers");
  expectNotContains(
    "_site/stays/anna-maria-island-vacation-rentals/index.html",
    '"text": "Manatee Public Beach in <a href='
  );
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "srcset=");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'width="800"');
  expectNoMarkers(
    "_site/stays/anna-maria-island-vacation-rentals/index.html",
    STAY_TEMPLATE_EMOJI_MARKERS,
    "stay template emoji markers"
  );
  expectExists("_site/properties/dockside-dreams/index.html");
  for (const file of PROPERTY_PAGE_FILES) {
    expectNoMarkers(file, PROPERTY_PAGE_EMOJI_MARKERS, "property page emoji markers");
    expectNoMarkers(file, PROPERTY_STALE_LINK_MARKERS, "stale property-page related links");
    expectNoMarkers(file, PROPERTY_NAV_STALE_ROUTE_MARKERS, "stale property-page navigation/footer routes");
    expectNotMatches(file, /\/guides\/[^"'\s>]+\.html/i, "legacy .html guide link");
    expectNotMatches(
      file,
      /<a\b(?=[^>]*href="\/stays\/")(?=[^>]*class="(?:nav-link|mobile-item)")/i,
      "stale local guide nav route"
    );
    expectNotMatches(
      file,
      /<a\b(?=[^>]*href="\/about-us\/")(?=[^>]*class="(?:nav-link|mobile-item|footer-link)")/i,
      "stale contact route"
    );
    expectNotMatches(
      file,
      /<a\b(?=[^>]*href="\/property-management\/vacation-rental-management-anna-maria-island\/")(?=[^>]*class="(?:nav-link|mobile-item|footer-link)")/i,
      "stale deep owner route"
    );
    expectNotMatches(
      file,
      /<a\b(?=[^>]*href="\/stays\/anna-maria-island-homes-with-pool\/")(?=[^>]*role="menuitem"|[^>]*class="mobile-item")/i,
      "stale Anna Maria destination route"
    );
    expectNoTemplateLeakMarkers(file);
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/property-management/",
        className: "nav-link",
        text: "Property Owners"
      }),
      "property owners nav link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/property-management/",
        className: "mobile-item",
        text: "Property Owners"
      }),
      "property owners mobile link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/property-management/",
        className: "footer-link",
        text: "For Owners"
      }),
      "property owners footer link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/guides/",
        className: "nav-link",
        text: "Guides"
      }),
      "guides nav link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/guides/",
        className: "mobile-item",
        text: "Guides"
      }),
      "guides mobile link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "mailto:info@seascape-vacations.com",
        className: "nav-link",
        text: "Contact"
      }),
      "contact nav link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "mailto:info@seascape-vacations.com",
        className: "mobile-item",
        text: "Contact"
      }),
      "contact mobile link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "mailto:info@seascape-vacations.com",
        className: "footer-link",
        text: "Contact"
      }),
      "contact footer link"
    );
    expectMatches(
      file,
      buildAnchorPattern({
        href: "/guides/anna-maria-island-area-guide/",
        text: "Anna Maria Island"
      }),
      "Anna Maria destination menu link"
    );
  }
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
  expectNotContains("_site/index.html", "images.unsplash.com");
  expectContains("_site/properties/index.html", "bookingenginecdn.hostaway.com");
  expectNotContains("_site/properties/index.html", "images.unsplash.com");
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
  expectContains(
    "_site/property-management/index.html",
    "Property management for owners who care about net revenue"
  );
  expectContains(
    "_site/property-management/index.html",
    "What owners miss when they compare management fees"
  );
  expectContains("_site/property-management/index.html", "What Gulf Coast owners usually ask first");
  expectContains("_site/property-management/index.html", "Commission Reality");
  expectNotContains("_site/property-management/index.html", "What Is Vacation Rental Property Management?");
  expectNotContains("_site/property-management/index.html", "Owner Questions");
  expectMatches(
    "_site/property-management/index.html",
    buildAnchorPattern({
      href: "#owner-cta",
      className: "btn",
      text: "Request Your Revenue Review"
    }),
    "property management nav CTA"
  );
  expectNotMatches(
    "_site/property-management/index.html",
    /<a\b(?=[^>]*href="\/")(?=[^>]*class="btn")[^>]*>View All Properties<\/a>/,
    "stale property management nav CTA target"
  );
  expectContains("_site/robots.txt", "OAI-SearchBot");
  expectContains("_site/robots.txt", "ChatGPT-User");
  expectContains("_site/robots.txt", "ClaudeBot");
  expectContains("_site/robots.txt", "Google-Extended");
  expectContains("_site/llms.txt", "## Property Management");
  expectContains("_site/llms.txt", "## Comparison Guides");
  expectNotContains("_site/robots.txt", "LLMs-txt:");
}

console.log(`assert-build-output: ${phase} checks passed`);
