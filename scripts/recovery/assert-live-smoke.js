const {
  request,
  validateLiveAvailabilityMarkup,
  validateRenderedLiveAvailability,
  checkoutStayCandidates,
  pickOpenStays,
  classifyCheckoutText,
  validateRenderedCheckout
} = require("./live-smoke-rendered-checks");
const validateOwnerLiveSurface = require("./validate-owner-live-surface");

const targets = [
  { path: "/", status: 200 },
  { path: "/properties/", status: 200 },
  { path: "/properties/the-oasis/", status: 200 },
  { path: "/properties/river-house/", status: 200 },
  { path: "/properties/dockside-dreams/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/guides/", status: 200 },
  { path: "/stays/", status: 200 },
  { path: "/stays/anna-maria-island-vacation-rentals/", status: 200 },
  { path: "/stays/vacation-rentals-with-pool-and-hot-tub/", status: 200 },
  { path: "/property-management/vacation-rental-management-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-area-guide/", status: 200 },
  { path: "/guides/bradenton-vs-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-vs-siesta-key/", status: 200 },
  { path: "/guides/best-vacation-rental-companies-ami/", status: 200 },
  { path: "/guides/srq-airport-to-anna-maria-island/", status: 200 },
  { path: "/stays/sarasota-vacation-rentals-with-pool/", status: 200 },
  { path: "/property-management/vacation-rental-taxes-florida/", status: 200 },
  { path: "/property-management/vacation-rental-insurance-florida/", status: 200 },
  { path: "/guides/booking-direct-vacation-rentals/", status: 200 },
  { path: "/guides/florida-gulf-coast-vacation-rental-market-report-2026/", status: 200 },
  { path: "/guides/bradenton-vs-sarasota-restaurants/", status: 200 },
  { path: "/guides/anna-maria-island-vacation-cost/", status: 200 },
  { path: "/research/gulf-coast-vacation-booking-trends-2026/", status: 200 },
  { path: "/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/", status: 200 },
  { path: "/research/florida-gulf-coast-vacation-cost-calculator-2026/", status: 200 },
  { path: "/research/gulf-coast-vacation-rental-chart-pack-2026/", status: 200 },
  { path: "/contact", status: 301, followRedirects: false },
  { path: "/guides/bradenton-vs-sarasota-cost-of-living/", status: 301, followRedirects: false },
  { path: "/property-owners/", status: 301, followRedirects: false },
  { path: "/hero-mobile.webp", status: 200 },
  { path: "/hero-optimized.webp", status: 200 },
  { path: "/images/seascape-og-default.jpg", status: 200 },
  { path: "/images/anna-maria-island-og.jpg", status: 200 },
  { path: "/images/bradenton-og.jpg", status: 200 },
  { path: "/images/sarasota-og.jpg", status: 200 },
  { path: "/images/siesta-key-og.jpg", status: 200 }
];

const stablePropertyDetailLinks = require("./property-detail-links");

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

function validateTargetResponse(target, response) {
  if (response.statusCode !== target.status) {
    throw new Error(`${target.path} expected ${target.status}, got ${response.statusCode}`);
  }

  if (["/properties/dockside-dreams/", "/stays/vacation-rentals-with-pool-and-hot-tub/"].includes(target.path)) {
    const pageCopy = response.body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    requireIncludes(target.path, pageCopy, [
      "$40 per night, capped at $280 per stay",
      "There is no charge for pool heat at The Coastal.",
      "Approved long-stay flat rates still apply"
    ]);
  }
  if (["/properties/the-oasis/", "/properties/river-house/"].includes(target.path)) {
    requireIncludes(target.path, response.body, ["Pets are not permitted at this home.", "Service animals are welcome without a pet fee"]);
    requireExcludes(target.path, response.body, ["One dog under 30 lb may stay", "Ask us to confirm pet approval", "Dog approval, boat size", 'value="pet approval"']);
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

    // Manual hero controls keep their scene-list-derived counter and real home imagery.
    requireIncludes(target.path, response.body, ['data-guest-version="waterline-v3"', 'id="home-heading"', 'href="/properties/" data-trip-link>Find your home</a>', "Your people.", "Your place.", "Our homes", 'data-guest-trip-form', '/images/homes/the-oasis/01.webp', 'href="/guest-support/"', 'href="/terms/#booking-and-confirmation"', 'Explore', 'Where we are', 'href="/guides/anna-maria-island-area-guide/"', 'id="email-signup"', 'data-inline-email-capture="true"', 'data-placement="home_owner_section"', 'Home 1 of ', 'data-scene-step="-1"', 'data-scene-step="1"', '/images/homes/the-oasis/hero-clarity.webp', 'data-home-deck', 'data-deck-step="-1"', 'data-deck-step="1"', 'See all homes', 'Back to focused deck', 'data-trip-sheet-open', 'Dates and guests', '<p class="g-card-source">Ratings from Airbnb</p>', '<span class="g-card-rating" aria-hidden="true">★ ']);
    requireExcludes(target.path, response.body, ["Best rates guaranteed", "Best Price Guaranteed", "save up to 20%"]);
  }

  if (target.path === "/properties/") {
    requireIncludes(target.path, response.body, ['data-trip-sheet-open', 'Dates and guests', '<p class="g-card-source">Ratings from Airbnb</p>', '<span class="g-card-rating" aria-hidden="true">★ ']);
    requireIncludes(target.path, response.body, ['id="reset-filter" type="button">Show all stays</button>']);
    if (!response.body.includes("Dockside Dreams") || !response.body.includes("The Oasis")) {
      throw new Error("properties page is missing premium catalog property cards");
    }

    const missingPropertyLinks = stablePropertyDetailLinks.filter((link) => !response.body.includes(link.href));
    if (missingPropertyLinks.length > 0) {
      throw new Error("properties page is missing stable property detail links");
    }

    requireIncludes(target.path, response.body, [
      'data-catalog-version="waterline-v3"', 'id="catalog-trip-form"',
      'id="catalog-comparison"', "Find the house.", "Bring your people.",
      "Full price, fees and cancellation terms on the booking page."
    ]);
    requireExcludes(target.path, response.body, ["Availability · live", "catalog-card-price"]);
    const blueHouseCard = response.body.match(/<article\b[^>]*\bdata-property=["']blue-house["'][^>]*>[\s\S]*?<\/article>/i);
    if (!blueHouseCard || !/\bdata-max-guests=["']11["']/.test(blueHouseCard[0]) || !blueHouseCard[0].includes("Up to 11 guests")) {
      throw new Error("properties page Blue House capacity must be 11 guests");
    }
    if (!response.body.includes("catalog-check-dates")) {
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
    validateOwnerLiveSurface(response.body, { requireIncludes, requireExcludes });
  }

  if (target.path === "/research/gulf-coast-vacation-booking-trends-2026/") {
    requireIncludes(target.path, response.body, [
      "Seascape Booking Research: Scope and Evidence", "archived reservation export",
      "inclusion rules", "reviewed calculations", "cannot establish an Anna Maria Island"
    ]);
    requireExcludes(target.path, response.body, ["$1.7M", "87%", "82%", "74-day"]);
  }

  if (target.path.startsWith("/research/") && /\b(?:545|1,492)\b/.test(response.body)) {
    throw new Error(`${target.path} still publishes withdrawn reservation counts`);
  }

  if (["/guides/booking-direct-vacation-rentals/", "/guides/anna-maria-island-vacation-cost/",
    "/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/"].includes(target.path)) {
    requireIncludes(target.path, response.body, ["complete checkout total"]);
    requireExcludes(target.path, response.body, ["$300", "$600", "10–15%", "30–40%", "$6,000"]);
  }

  if (["/research/florida-gulf-coast-vacation-cost-calculator-2026/",
    "/research/gulf-coast-vacation-rental-chart-pack-2026/"].includes(target.path)) {
    requireIncludes(target.path, response.body, ['<meta name="robots" content="noindex, follow">',
      "figures are withdrawn"]);
    requireExcludes(target.path, response.body, ["totalEstimate", "feeLow", "74-day"]);
  }

  if (target.path === "/contact" && response.location !== "/#contact") {
    throw new Error(`/contact expected Location /#contact, got ${response.location || "no Location header"}`);
  }

  if (
    target.path === "/guides/bradenton-vs-sarasota-cost-of-living/"
    && response.location !== "/guides/bradenton-vs-sarasota/"
  ) {
    throw new Error(`retired cost page has unexpected redirect target: ${response.location || "no Location header"}`);
  }

  if (target.path === "/stays/sarasota-vacation-rentals-with-pool/") {
    requireIncludes(target.path, response.body, [
      "St. Armands Circle is also reached by car",
      "are reached by car from Sarasota Luxe",
      "Private pool, sleeps 12",
      "hot tub (confirm heat terms when booking)"
    ]);
    requireExcludes(target.path, response.body, [
      "short drive or walk",
      "walkable to downtown",
      "walkable to St. Armands",
      "walking distance",
      "hot tub included all year"
    ]);
  }

  if (target.path === "/property-management/vacation-rental-taxes-florida/") {
    requireIncludes(target.path, response.body, [
      '<meta name="robots" content="noindex, nofollow">',
      "This tax guide is not available for reliance.",
      "Please consult a qualified tax professional."
    ]);
  }

  if (target.path === "/guides/florida-gulf-coast-vacation-rental-market-report-2026/") {
    requireIncludes(target.path, response.body, ["Numeric findings are withheld", "archived reservation export", "reviewed calculations"]);
    requireExcludes(target.path, response.body, ["from five", "545 confirmed", "value of this small dataset", "records the fixed dataset and method"]);
  }

  if (target.path === "/guides/bradenton-vs-sarasota-restaurants/") {
    requireIncludes(target.path, response.body, ["Compare current menus"]);
    requireExcludes(target.path, response.body, ["$15-30", "$25-60", "Average Dinner", "Generally yes. Expect to spend"]);
  }

  if (target.path === "/property-management/vacation-rental-insurance-florida/") {
    requireIncludes(target.path, response.body, [
      '<meta name="robots" content="noindex, nofollow">',
      "This insurance guide is not available for reliance.",
      "Please consult a licensed insurance professional."
    ]);
  }

  if (target.path === "/stays/") {
    const hasStayHubSurface =
      response.body.includes("Stay Collections")
      && response.body.includes("Destination collections")
      && response.body.includes("Compare Gulf Coast private-pool homes by area, group size, and trip priorities")
      && response.body.includes("/stays/anna-maria-island-vacation-rentals/")
      && response.body.includes("/stays/bradenton-vacation-rentals-near-beaches/")
      && response.body.includes("/properties/");

    if (!hasStayHubSurface) {
      throw new Error("/stays/ is missing the live stay-collection hub surface");
    }

    requireExcludes(target.path, response.body, [
      "dead prefix",
      "/stays/<slug>/",
      "/stays/&lt;slug&gt;/",
      "When to leave the hub",
      "collection logic"
    ]);
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
  await validateRenderedCheckout(baseUrl);
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
  checkoutStayCandidates,
  pickOpenStays,
  classifyCheckoutText,
  validateRenderedCheckout,
  stablePropertyDetailLinks,
  requireIncludes,
  requireExcludes,
  check,
  run
};
