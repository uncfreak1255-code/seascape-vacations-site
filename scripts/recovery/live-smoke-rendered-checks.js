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
    // Hostaway is a separate origin: the site's agent opt-out cannot isolate it.
    // Context routing covers frames/popups; service workers must not bypass it.
    const context = await browser.newContext({ serviceWorkers: "block" });
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      const analyticsHost = url.hostname === "google-analytics.com" ||
        url.hostname.endsWith(".google-analytics.com") ||
        /^(?:region\d+\.)?analytics\.google\.com$/.test(url.hostname) ||
        url.hostname === "stats.g.doubleclick.net";
      const collectionPath = /^\/(?:[gjr]\/)?collect\/?$/.test(url.pathname);
      if (analyticsHost && collectionPath) await route.abort();
      else await route.fallback();
    });
    const seen = [];
    for (const stay of stays) {
      const url = `${CHECKOUT_ORIGIN}/checkout/${stay.listingId}?start=${stay.arrive}&end=${stay.depart}&numberOfGuests=2`;
      // Read only: the page is loaded and its text read. Nothing is typed or submitted.
      const page = await context.newPage();
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


module.exports = {
  request,
  validateLiveAvailabilityMarkup,
  validateRenderedLiveAvailability,
  checkoutStayCandidates,
  pickOpenStays,
  classifyCheckoutText,
  validateRenderedCheckout
};
