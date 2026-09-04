const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("live smoke script exposes reusable helpers for unit coverage", () => {
  const smoke = loadSmokeModule();

  assert.equal(Array.isArray(smoke.targets), true, "expected the smoke script to export its target list");
  assert.equal(
    typeof smoke.validateTargetResponse,
    "function",
    "expected the smoke script to export a reusable response validator"
  );
});

test("property-management smoke follows the current proof-first owner hub", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.notEqual(target, undefined, "expected property-management to stay in the smoke target list");

  const currentOwnerHubBody = `
    <main>
      <h1>Before you renew, what does your Gulf Coast home actually keep?</h1>
      <p>The Fee Comparison separates published platform charges from a property-specific management agreement.</p>
      <strong>15.5%</strong>
      <strong>2.9% + 30¢</strong>
      <strong>Property-specific</strong>
      <section>
        <p>Airbnb, Stripe, and a property manager charge for different services.</p>
      </section>
      <a href="#owner-cta">Request Your Revenue Review</a>
      <a href="/property-management/vacation-rental-management-sarasota/">Sarasota coverage</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentOwnerHubBody
    });
  });
});

test("property-management smoke rejects the retired explainer-hub surface", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>What Is Vacation Rental Property Management?</h1>
          <a href="/properties/">View All Properties</a>
        </main>
      `
    });
  }, /property-management hub is missing the proof-first owner revenue surface/);
});

test("properties smoke checks durable property detail hrefs instead of old CTA copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/properties/");

  assert.notEqual(target, undefined, "expected /properties/ to stay in the smoke target list");

  const currentPropertiesBody = `
    <main data-catalog-version="guest-journey-v1">
      <h1>A house everyone<br>can agree on.</h1>
      <form id="catalog-trip-form"></form><dialog id="catalog-comparison"></dialog>
      <p>Full price, fees and cancellation terms on the booking page.</p>
      <article><a href="/properties/dockside-dreams/">Dockside Dreams</a></article>
      <article><a href="/properties/the-oasis/">The Oasis</a></article>
      <article><a href="/properties/sarasota-luxe/">Sarasota Luxe</a></article>
      <article><a href="/properties/river-house/">River House</a></article>
      <article><a href="/properties/bradenton-pool-home/">Bradenton Pool Home</a></article>
      <a href="https://book.seascape-vacations.com">Book Direct</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentPropertiesBody
    });
  });

  assert.equal(currentPropertiesBody.includes("View Details"), false);
});

test("properties smoke rejects missing stable property detail hrefs", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/properties/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <article>Dockside Dreams</article>
          <article>The Oasis</article>
          <a href="https://book.seascape-vacations.com">Book Direct</a>
        </main>
      `
    });
  }, /properties page is missing stable property detail links/);
});

test("properties smoke accepts only current New York availability metadata on live cards", () => {
  const smoke = loadSmokeModule();
  const now = Date.parse("2026-07-17T00:30:00.000Z");
  const currentMarkup = `
    <article class="catalog-card" data-next-available-start="2026-07-16" data-next-available-end="2026-07-18">
      <span>Availability · live</span>
    </article>
  `;

  assert.doesNotThrow(() => smoke.validateLiveAvailabilityMarkup(currentMarkup, { now }));
  assert.throws(
    () =>
      smoke.validateLiveAvailabilityMarkup(
        currentMarkup.replace("2026-07-16", "2026-07-15"),
        { now }
      ),
    /expired or malformed live availability/
  );
  assert.throws(
    () =>
      smoke.validateLiveAvailabilityMarkup(
        currentMarkup.replace('data-next-available-start="2026-07-16"', ""),
        { now }
      ),
    /missing date metadata/
  );
  assert.throws(
    () =>
      smoke.validateLiveAvailabilityMarkup(
        currentMarkup.replace("2026-07-18", "not-a-date"),
        { now }
      ),
    /expired or malformed live availability/
  );
});

test("rendered properties smoke validates the post-hydration catalog state", async () => {
  const smoke = loadSmokeModule();
  let closed = false;
  let navigatedTo = "";
  const now = Date.parse("2026-07-17T00:30:00.000Z");
  const chromium = {
    async launch() {
      return {
        async newPage() {
          return {
            async goto(url) {
              navigatedTo = url;
            },
            async waitForFunction() {},
            locator() {
              return {
                async evaluateAll() {
                  return `
                    <article class="catalog-card" data-next-available-start="2026-07-16" data-next-available-end="2026-07-18">
                      <span>Availability · live</span>
                    </article>
                    <article class="catalog-card">
                      <span>Calendar · secure</span>
                    </article>
                  `;
                }
              };
            }
          };
        },
        async close() {
          closed = true;
        }
      };
    }
  };

  const report = await smoke.validateRenderedLiveAvailability("https://example.test", { chromium, now });
  assert.equal(navigatedTo, "https://example.test/properties/");
  assert.deepEqual(report, { checked: 1 });
  assert.equal(closed, true);
});

test("stays smoke follows the live stay-collection hub instead of a dead prefix", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/");

  assert.notEqual(target, undefined, "expected /stays/ to stay in the smoke target list");

  const currentStayHubBody = `
    <main>
      <p>Stay Collections</p>
      <h1>Use the live stay pages as a real collection hub, not a dead prefix</h1>
      <section>
        <h2>Destination collections</h2>
        <a href="/stays/anna-maria-island-vacation-rentals/">Anna Maria Island Vacation Rentals</a>
        <a href="/stays/bradenton-vacation-rentals-near-beaches/">Bradenton Vacation Rentals Near Beaches</a>
      </section>
      <a href="/properties/">Browse Direct-Book Homes</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentStayHubBody
    });
  });
});

test("live smoke locks the refreshed AMI vs Siesta SEO markers", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/anna-maria-island-vs-siesta-key/");

  assert.notEqual(target, undefined, "expected AMI vs Siesta to stay in the smoke target list");

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>Reviewed June 2026</p>
          <p>Sarasota County's Siesta Beach page for current parking, sand, and award notes</p>
          <p>Siesta Beach has about 950 free spaces, but they can fill during busy periods.</p>
          <p>Nearly pure quartz crystal</p>
          <p>Early-2026 Seascape rate checks used as planning context, not a live quote</p>
        </main>
      `
    });
  });
});

test("live smoke rejects stale AMI vs Siesta proof and rate copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/anna-maria-island-vs-siesta-key/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>Updated April 2026</p>
          <p>We built this comparison from March 2026 rate checks.</p>
          <p>Siesta Key's fame rests on 99% pure quartz.</p>
          <p>Mainland Bradenton properties are 20–30% lower and AMI rentals run $250–$700/night.</p>
        </main>
      `
    });
  }, /missing current live marker/);
});

test("live smoke locks the refreshed AMI rental companies markers", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/best-vacation-rental-companies-ami/");

  assert.notEqual(target, undefined, "expected AMI rental companies guide to stay in the smoke target list");

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>Reviewed June 20, 2026 using public company pages, vacation-rental category pages, owner-service pages, and the Anna Maria Island Chamber vacation-rental directory.</p>
          <p>It is who gives guests a clear all-in price, local support when something breaks, and a direct-booking option that does not bury the value under platform fees.</p>
          <p>This guide is for two different decisions. Those are not the same job, and bad guides blur them together.</p>
        </main>
      `
    });
  });
});

test("live smoke rejects stale AMI rental companies proof copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/best-vacation-rental-companies-ami/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>March 2026 walkthroughs of public booking flows, cancellation language, and how quickly each company surfaces the real total.</p>
        </main>
      `
    });
  }, /missing current live marker/);
});

test("live smoke locks the refreshed SRQ airport guide markers", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/srq-airport-to-anna-maria-island/");

  assert.notEqual(target, undefined, "expected SRQ airport guide to stay in the smoke target list");

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p class="guide-meta">Reviewed August 19, 2026 • 8 min read</p>
          <p><strong>August 2026 review:</strong> SRQ still lists rental cars, taxis, airport shuttles, Uber, and Lyft as ground transportation options. Treat any fare ranges below as planning ranges, not live quotes.</p>
        </main>
      `
    });
  });
});

test("live smoke rejects stale SRQ airport freshness copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/srq-airport-to-anna-maria-island/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p class="guide-meta">Updated March 2026 • 8 min read</p>
        </main>
      `
    });
  }, /missing current live marker/);
});
