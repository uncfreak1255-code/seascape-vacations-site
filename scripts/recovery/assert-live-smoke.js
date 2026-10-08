const https = require("https");
const { isCurrentAvailabilityRange } = require("../cache/normalize-hostaway");
const { LISTINGS } = require("../booking/stay-availability");

// "Book these dates" on a home's page and on a catalog card opens this Hostaway address. Hostaway does
// not document it, so the daily smoke loads it for an open stay and fails when the priced checkout stops appearing.
// Rollback: make checkoutUrl() in src/assets/js/guest.js return the listing address, and remove the
// "/checkout/" line in syncLinks() in src/assets/js/catalog.js.
const CHECKOUT_ORIGIN = "https://book.seascape-vacations.com";
const CHECKOUT_STAY_OFFSETS = [120, 150, 180, 210, 240, 270];
const CHECKOUT_RENDER_TIMEOUT_MS = 30000;

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
  { path: "/stays/sarasota-vacation-rentals-with-pool/", status: 200 },
  { path: "/property-management/vacation-rental-taxes-florida/", status: 200 },
  { path: "/property-management/vacation-rental-insurance-florida/", status: 200 },
  { path: "/guides/booking-direct-vacation-rentals/", status: 200 },
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

const stablePropertyDetailLinks = [
  { href: "/properties/dockside-dreams/", label: "View Dockside Dreams details" },
  { href: "/properties/the-oasis/", label: "View The Oasis details" },
  { href: "/properties/sarasota-luxe/", label: "View Sarasota Luxe details" },
  { href: "/properties/river-house/", label: "View River House details" },
  { href: "/properties/bradenton-pool-home/", label: "View Bradenton Pool Home details" },
  { href: "/properties/blue-house/", label: "View Pickleball Pool Home Retreat details" },
  { href: "/properties/coastal-stay/", label: "View Coastal Stay details" }
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

function checkoutStayCandidates(now = Date.now()) {
  return CHECKOUT_STAY_OFFSETS.map((offset) => {
    const day = (extra) => new Date(now + (offset + extra) * 86400000).toISOString().slice(0, 10);
    return { arrive: day(0), depart: day(7) };
  });
}

function pickOpenStays(answers) {
  const stays = [];
  for (const answer of answers) {
    const home = answer.homes.find((entry) => entry.bookable === true);
    const listing = home && LISTINGS.find((entry) => entry.slug === home.slug);
    if (listing) stays.push({ listingId: String(listing.id), arrive: answer.arrive, depart: answer.depart });
  }
  return stays;
}

// "priced" = Hostaway took the dates from the address; "unpriced" = it rendered but ignored them.
function classifyCheckoutText(text) {
  if (/Price details/i.test(text) && /\bTotal\b/.test(text) && !/Select dates/i.test(text)) return "priced";
  if (/Select dates/i.test(text)) return "unpriced";
  return "pending";
}

async function validateRenderedCheckout(baseUrl, options = {}) {
  const fetchJson = options.fetchJson || (async (path) => JSON.parse((await request(baseUrl, path)).body));
  const timeout = options.timeout || CHECKOUT_RENDER_TIMEOUT_MS;
  const answers = [];
  let unread = 0;
  for (const stay of checkoutStayCandidates(options.now)) {
    try {
      const answer = await fetchJson(`/.netlify/functions/booking-availability?arrive=${stay.arrive}&depart=${stay.depart}`);
      if (answer && answer.ok === true && Array.isArray(answer.homes)) answers.push({ ...stay, homes: answer.homes });
      else unread += 1;
    } catch (error) {
      // One slow or unreadable answer must not end the check; the next date range is tried.
      unread += 1;
    }
  }
  const stays = pickOpenStays(answers).slice(0, 2);
  if (!stays.length) {
    throw new Error(
      `checkout smoke found no open stay to test in ${CHECKOUT_STAY_OFFSETS.length} date ranges (${unread} could not be read); the checkout address was not checked`
    );
  }

  const chromium = options.chromium || require("@playwright/test").chromium;
  const browser = await chromium.launch({ headless: true });
  try {
    const seen = [];
    for (const stay of stays) {
      const url = `${CHECKOUT_ORIGIN}/checkout/${stay.listingId}?start=${stay.arrive}&end=${stay.depart}&numberOfGuests=2`;
      // Read only: the page is loaded and its text read. Nothing is typed or submitted.
      const page = await browser.newPage();
      let state = "pending";
      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout });
        const status = response ? response.status() : 200;
        // Only "not found" says the address is gone. A block, a rate limit or a server error says nothing about it.
        if (status === 404 || status === 410) state = "unpriced";
        else if (status >= 400) state = `status ${status}`;
        const deadline = Date.now() + timeout;
        // The page may show its empty form before it reads the address, so only a priced page ends the wait early.
        while (status < 400 && state !== "priced" && Date.now() < deadline) {
          state = classifyCheckoutText(await page.evaluate(() => document.body.innerText));
          if (state !== "priced") await page.waitForTimeout(500);
        }
      } catch (error) {
        state = "pending";
      }
      await page.close();
      if (state === "priced") return { checked: url };
      seen.push(state);
    }
    // The rollback instruction needs every page tried to have rendered without the stay.
    if (seen.every((state) => state === "unpriced")) {
      throw new Error(
        "Hostaway checkout no longer shows a priced stay from start/end/numberOfGuests in the address; switch checkoutUrl() in src/assets/js/guest.js back to the listing address and remove the /checkout/ line in syncLinks() in src/assets/js/catalog.js"
      );
    }
    throw new Error(
      `Hostaway checkout could not be judged within ${timeout / 1000}s per page (saw: ${seen.join(", ")}); the checkout address was not confirmed either way`
    );
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

    // The hero scene counter ships its denominator as `01<small>/05</small>`.
    // #559 shipped the styling with no markup, so the denominator was silently
    // absent in production until someone looked; this marker is what notices.
    // It deliberately stops before the total: the denominator is computed from
    // the scene list, so onboarding a sixth home makes it `/06` and pinning the
    // count here would turn the daily smoke red on a healthy site.
    requireIncludes(target.path, response.body, ['data-guest-version="waterline-v3"', 'id="home-heading"', 'href="/properties/" data-trip-link>Find your home</a>', "Your people.", "Your place.", "Our homes", 'data-guest-trip-form', '/images/homes/the-oasis/01.webp', 'href="/guest-support/"', 'href="/terms/#booking-and-confirmation"', 'Explore', 'Where we are', 'href="/guides/anna-maria-island-area-guide/"', 'id="email-signup"', 'data-inline-email-capture="true"', 'data-placement="home_owner_section"', '>01<small>/']);
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
    const hasOwnerOfferSurface =
      /\b\w+ homes\. One local team\./.test(response.body)
      && response.body.includes("What we do for your home")
      && /Why a \w+-home operator/.test(response.body)
      && response.body.includes("The homes we manage")
      && response.body.includes("Request your 48-hour revenue review")
      && response.body.includes('name="submitter_authority" value="owner_or_authorized_representative" required')
      && response.body.includes("I confirm I am the property owner or an authorized representative for this property.")
      && response.body.includes("Owner statement, optional")
      && /name=["']owner-revenue-teardown["']/.test(response.body)
      && response.body.includes('href="#owner-cta"');

    if (!hasOwnerOfferSurface) {
      throw new Error("property-management hub is missing the Waterline owner offer surface");
    }

    if (
      response.body.includes("What Is Vacation Rental Property Management?")
      || response.body.includes("View All Properties")
      || response.body.includes("Request a property evaluation")
      || response.body.includes("$119,923")
      || response.body.includes("13.4%")
      || response.body.includes("Reply guaranteed")
      || response.body.includes("The Fee Comparison")
      || response.body.includes("Before you renew,")
    ) {
      throw new Error("property-management hub is serving retired owner copy");
    }

    requireExcludes(target.path, response.body, [
      "/property-management/vacation-rental-taxes-florida/",
      "/property-management/vacation-rental-insurance-florida/",
      "Average Guest Rating"
    ]);
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
      "are reached by car from Sarasota Luxe"
    ]);
    requireExcludes(target.path, response.body, [
      "short drive or walk",
      "walkable to downtown",
      "walkable to St. Armands",
      "walking distance"
    ]);
  }

  if (target.path === "/property-management/vacation-rental-taxes-florida/") {
    requireIncludes(target.path, response.body, [
      '<meta name="robots" content="noindex, nofollow">',
      "This tax guide is not available for reliance.",
      "Please consult a qualified tax professional."
    ]);
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
