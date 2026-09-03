const https = require("https");
const { isCurrentAvailabilityRange } = require("../cache/normalize-hostaway");

const targets = [
  { path: "/", status: 200 },
  { path: "/properties/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/guides/", status: 200 },
  { path: "/stays/", status: 200 },
  { path: "/stays/anna-maria-island-vacation-rentals/", status: 200 },
  { path: "/property-management/vacation-rental-management-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-area-guide/", status: 200 },
  { path: "/guides/bradenton-vs-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-vs-siesta-key/", status: 200 },
  { path: "/guides/best-vacation-rental-companies-ami/", status: 200 },
  { path: "/guides/srq-airport-to-anna-maria-island/", status: 200 },
  { path: "/property-owners/", status: 301, followRedirects: false },
  { path: "/hero-mobile.webp", status: 200 },
  { path: "/hero-optimized.webp", status: 200 },
  { path: "/images/seascape-og-default.jpg", status: 200 },
  { path: "/images/anna-maria-island-og.jpg", status: 200 },
  { path: "/images/bradenton-og.jpg", status: 200 },
  { path: "/images/sarasota-og.jpg", status: 200 },
  { path: "/images/siesta-key-og.jpg", status: 200 }
];

const stablePropertyDetailLinks = [
  { href: "/properties/dockside-dreams/", label: "View Dockside Dreams details" },
  { href: "/properties/the-oasis/", label: "View The Oasis details" },
  { href: "/properties/sarasota-luxe/", label: "View Sarasota Luxe details" },
  { href: "/properties/river-house/", label: "View River House details" },
  { href: "/properties/bradenton-pool-home/", label: "View Bradenton Pool Home details" }
];

function requireIncludes(path, body, fragments) {
  const missing = fragments.filter((fragment) => !body.includes(fragment));
  if (missing.length > 0) {
    throw new Error(`${path} is missing current live marker(s): ${missing.join(", ")}`);
  }
}

function requireExcludes(path, body, fragments) {
  const present = fragments.filter((fragment) => body.includes(fragment));
  if (present.length > 0) {
    throw new Error(`${path} is still serving stale live marker(s): ${present.join(", ")}`);
  }
}

function attributeValue(markup, name) {
  const match = markup.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? match[1] : "";
}

function queryDateValue(markup, name) {
  const match = markup.match(new RegExp(`${name}=([0-9-]+)`, "i"));
  return match ? match[1] : "";
}

function validateLiveAvailabilityMarkup(body, options = {}) {
  const cardMarkup = body.match(/<article\b[^>]*class=["'][^"']*\bcatalog-card\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi) || [];
  const liveCards = cardMarkup.filter((card) => card.includes("Availability · live"));
  const liveBadgeCount = (body.match(/Availability · live/g) || []).length;

  if (liveCards.length !== liveBadgeCount) {
    throw new Error("properties page has live availability outside a catalog card");
  }

  liveCards.forEach((card, index) => {
    const openingTag = card.slice(0, card.indexOf(">") + 1);
    const startDate =
      attributeValue(openingTag, "data-next-available-start") ||
      queryDateValue(card, "startingDate");
    const endDate =
      attributeValue(openingTag, "data-next-available-end") ||
      queryDateValue(card, "endingDate");

    if (!startDate || !endDate) {
      throw new Error(`properties page live availability card ${index + 1} is missing date metadata`);
    }

    if (!isCurrentAvailabilityRange({ startDate, endDate }, options)) {
      throw new Error(
        `properties page live availability card ${index + 1} has expired or malformed live availability`
      );
    }
  });

  return { checked: liveCards.length };
}

async function validateRenderedLiveAvailability(baseUrl, options = {}) {
  const chromium = options.chromium || require("@playwright/test").chromium;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/properties/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelectorAll("article.catalog-card").length > 0);
    const cardMarkup = await page
      .locator("article.catalog-card")
      .evaluateAll((cards) => cards.map((card) => card.outerHTML).join("\n"));

    return validateLiveAvailabilityMarkup(cardMarkup, options);
  } finally {
    await browser.close();
  }
}

function request(baseUrl, path) {
  return new Promise((resolve, reject) => {
    const request = https
      .get(`${baseUrl}${path}`, { timeout: 10000 }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            location: res.headers.location || null,
            body
          });
        });
      });

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out fetching ${baseUrl}${path}`));
    });
    request.on("error", reject);
  });
}

function validateTargetResponse(target, response) {
  if (response.statusCode !== target.status) {
    throw new Error(`${target.path} expected ${target.status}, got ${response.statusCode}`);
  }

  if (target.path === "/") {
    if (!response.body.includes("Dockside Dreams") || !response.body.includes("/properties/dockside-dreams/")) {
      throw new Error("homepage is missing stable featured property markup");
    }

    if (response.body.includes("undefined BR")) {
      throw new Error("homepage featured properties still contain undefined specs");
    }

    if (response.body.includes("prop-card-carousel") || response.body.includes("nextCardImage(")) {
      throw new Error("properties card renderer still includes the brittle in-card carousel stack");
    }

    if (response.body.includes("images.weserv.nl")) {
      throw new Error("homepage still depends on the external weserv image proxy");
    }

    requireIncludes(target.path, response.body, ["Direct booking, local support", "Platform Fees Removed"]);
    requireExcludes(target.path, response.body, ["Best rates guaranteed", "Best Price Guaranteed", "save up to 20%"]);
  }

  if (target.path === "/properties/") {
    if (!response.body.includes("Dockside Dreams") || !response.body.includes("The Oasis")) {
      throw new Error("properties page is missing premium catalog property cards");
    }

    const missingPropertyLinks = stablePropertyDetailLinks.filter((link) => !response.body.includes(link.href));
    if (missingPropertyLinks.length > 0) {
      throw new Error("properties page is missing stable property detail links");
    }

    if (!response.body.includes("Book Direct")) {
      throw new Error("properties page is missing direct-book CTAs");
    }

    if (response.body.includes("/.netlify/functions/get-properties") || response.body.includes("api.hostaway.com")) {
      throw new Error("properties page still depends on a public runtime property API");
    }

    if (response.body.includes("hostaway-platform.s3.us-west-2.amazonaws.com")) {
      throw new Error("properties page still leaks raw Hostaway S3 URLs");
    }

    if (
      response.body.includes("Florida Gulf Coast homes, controlled from one catalog.") ||
      response.body.includes("Use this table before opening detail pages") ||
      response.body.includes("collection-strip") ||
      response.body.includes("compare-table")
    ) {
      throw new Error("properties page still exposes the old utility/catalog-copy surface");
    }

  }

  if (target.path === "/property-management/") {
    const hasProofFirstOwnerSurface =
      response.body.includes("Before you renew,")
      && response.body.includes("actually keep?")
      && response.body.includes("15.5%")
      && response.body.includes("2.9% + 30¢")
      && response.body.includes("Property-specific")
      && response.body.includes("The Fee Comparison")
      && response.body.includes("Request Your Revenue Review")
      && response.body.includes('href="#owner-cta"');

    if (!hasProofFirstOwnerSurface) {
      throw new Error("property-management hub is missing the proof-first owner revenue surface");
    }

    if (
      response.body.includes("What Is Vacation Rental Property Management?")
      || response.body.includes("View All Properties")
      || response.body.includes("Request a property evaluation")
      || response.body.includes("$119,923")
      || response.body.includes("13.4%")
    ) {
      throw new Error("property-management hub is serving retired owner copy");
    }
  }

  if (target.path === "/stays/") {
    const hasStayHubSurface =
      response.body.includes("Stay Collections")
      && response.body.includes("Destination collections")
      && response.body.includes("/stays/anna-maria-island-vacation-rentals/")
      && response.body.includes("/stays/bradenton-vacation-rentals-near-beaches/")
      && response.body.includes("/properties/");

    if (!hasStayHubSurface) {
      throw new Error("/stays/ is missing the live stay-collection hub surface");
    }
  }

  if (target.path === "/guides/anna-maria-island-area-guide/" || target.path === "/guides/bradenton-vs-sarasota/" || target.path === "/guides/anna-maria-island-vs-siesta-key/") {
    if (response.body.includes("hostaway-platform.s3.us-west-2.amazonaws.com")) {
      throw new Error(`${target.path} still depends on raw Hostaway S3 image URLs`);
    }

    if (/(?:src|href)=["']images\//i.test(response.body) || /url\((["']?)images\//i.test(response.body)) {
      throw new Error(`${target.path} still contains broken relative images/ asset paths`);
    }
  }

  if (target.path === "/guides/anna-maria-island-vs-siesta-key/") {
    requireIncludes(target.path, response.body, [
      "Reviewed June 2026",
      "Sarasota County",
      "about 950 free spaces",
      "Nearly pure quartz crystal",
      "Early-2026 Seascape rate checks used as planning context, not a live quote"
    ]);
    requireExcludes(target.path, response.body, [
      "Updated April 2026",
      "99% pure quartz",
      "20–30% lower",
      "$250–$700/night",
      "$250–$800/night"
    ]);
  }

  if (target.path === "/guides/best-vacation-rental-companies-ami/") {
    requireIncludes(target.path, response.body, [
      "Reviewed June 20, 2026 using public company pages",
      "direct-booking option that does not bury the value under platform fees",
      "Those are not the same job, and bad guides blur them together"
    ]);
    requireExcludes(target.path, response.body, [
      "March 2026 walkthroughs of public booking flows"
    ]);
  }

  if (target.path === "/guides/srq-airport-to-anna-maria-island/") {
    requireIncludes(target.path, response.body, [
      "Reviewed August 19, 2026",
      "<strong>August 2026 review:</strong>",
      "planning ranges, not live quotes"
    ]);
    requireExcludes(target.path, response.body, [
      "Updated March 2026"
    ]);
  }

  if (target.path === "/guides/anna-maria-island-area-guide/" || target.path === "/guides/bradenton-area-guide/" || target.path === "/guides/sarasota-area-guide/" || target.path === "/guides/siesta-key-area-guide/") {
    if (response.body.includes('href="index.html"') || response.body.includes('href="#destinations"') || response.body.includes("area-guide-")) {
      throw new Error(`${target.path} still contains legacy relative guide links`);
    }

    if (/\bhref=\/[^"'\s>]+/i.test(response.body)) {
      throw new Error(`${target.path} still contains unquoted absolute href attributes`);
    }
  }
}

async function check(baseUrl, target, currentPath = target.path, redirectDepth = 0) {
  const response = await request(baseUrl, currentPath);

  if (
    target.followRedirects !== false &&
    response.statusCode >= 300 &&
    response.statusCode < 400 &&
    response.location
  ) {
    if (redirectDepth >= 5) {
      throw new Error(`${target.path} exceeded redirect limit`);
    }

    const nextPath = response.location.startsWith("http")
      ? response.location.replace(baseUrl, "")
      : response.location;

    return check(baseUrl, target, nextPath, redirectDepth + 1);
  }

  validateTargetResponse(target, response);
}

async function run(baseUrl) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");
  }

  await Promise.all(targets.map((target) => check(baseUrl, target)));
  await validateRenderedLiveAvailability(baseUrl);
}

if (require.main === module) {
  run(process.argv[2])
    .then(() => console.log("assert-live-smoke: all targets passed"))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  targets,
  request,
  validateTargetResponse,
  validateLiveAvailabilityMarkup,
  validateRenderedLiveAvailability,
  stablePropertyDetailLinks,
  requireIncludes,
  requireExcludes,
  check,
  run
};
