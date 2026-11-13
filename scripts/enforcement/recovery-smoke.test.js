const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("live smoke rejects stale pet approval at Oasis and River House", () => {
  const smoke = loadSmokeModule();
  for (const route of ["/properties/the-oasis/", "/properties/river-house/"]) {
    const target = smoke.targets.find(entry => entry.path === route);
    assert.ok(target);
    const body = "Pets are not permitted at this home. Service animals are welcome without a pet fee";
    assert.doesNotThrow(() => smoke.validateTargetResponse(target, { statusCode: 200, body }));
    assert.throws(() => smoke.validateTargetResponse(target, { statusCode: 200, body: "Ask us to confirm pet approval" }), /missing current live marker/);
    assert.throws(() => smoke.validateTargetResponse(target, { statusCode: 200, body: body + ' <option value="pet approval">Bringing a dog</option>' }), /stale live marker/);
  }
});

test("live smoke script exposes reusable helpers for unit coverage", () => {
  const smoke = loadSmokeModule();

  assert.equal(Array.isArray(smoke.targets), true, "expected the smoke script to export its target list");
  assert.equal(
    typeof smoke.validateTargetResponse,
    "function",
    "expected the smoke script to export a reusable response validator"
  );
});

test("pool-heat smoke requires the cap in page copy, not just FAQ schema", () => {
  const smoke = loadSmokeModule();
  const cap = "$40 per night, capped at $280 per stay";
  const exceptions = "There is no charge for pool heat at The Coastal. Approved long-stay flat rates still apply.";
  for (const route of ["/properties/dockside-dreams/", "/stays/vacation-rentals-with-pool-and-hot-tub/"]) {
    const target = smoke.targets.find((entry) => entry.path === route);
    assert.ok(target);
    assert.doesNotThrow(() => smoke.validateTargetResponse(target, { statusCode: 200, body: `<p>${cap}. ${exceptions}</p>` }));
    assert.throws(() => smoke.validateTargetResponse(target, {
      statusCode: 200, body: `<script type="application/ld+json">"${cap}"</script><p>${exceptions}</p>`
    }), /missing current live marker/);
  }
});

test("properties smoke checks durable property detail hrefs instead of old CTA copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/properties/");

  assert.notEqual(target, undefined, "expected /properties/ to stay in the smoke target list");

  const currentPropertiesBody = `
    <main data-catalog-version="waterline-v3">
      <h1>Find the house.<br>Bring your people.</h1>
      <form id="catalog-trip-form"></form><dialog id="catalog-comparison"></dialog>
      <button type="button" data-trip-sheet-open>Dates and guests</button>
      <p class="g-card-source">Ratings from Airbnb</p>
      <button id="reset-filter" type="button">Show all stays</button>
      <span class="g-card-rating" aria-hidden="true">★ 5.0 (112)</span>
      <p>Full price, fees and cancellation terms on the booking page.</p>
      <article><a href="/properties/dockside-dreams/">Dockside Dreams</a></article>
      <article><a href="/properties/the-oasis/">The Oasis</a></article>
      <article><a href="/properties/sarasota-luxe/">Sarasota Luxe</a></article>
      <article><a href="/properties/river-house/">River House</a></article>
      <article><a href="/properties/bradenton-pool-home/">Bradenton Pool Home</a></article>
      <article data-property="blue-house" data-max-guests="11"><a href="/properties/blue-house/">Pickleball Pool Home Retreat</a><p>Up to 11 guests</p></article>
      <article><a href="/properties/coastal-stay/">The Coastal</a></article>
      <article><a href="/properties/relaxing-oasis/">Relaxing Oasis</a></article>
      <a class="catalog-check-dates" href="https://book.seascape-vacations.com">Check dates</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentPropertiesBody
    });
  });

  assert.throws(() => smoke.validateTargetResponse(target, {
    statusCode: 200,
    location: null,
    body: currentPropertiesBody.replace('<p class="g-card-source">Ratings from Airbnb</p>', "")
  }), /missing current live marker\(s\): <p class="g-card-source">Ratings from Airbnb<\/p>/);
  assert.equal(currentPropertiesBody.includes("View Details"), false);
  assert.throws(() => smoke.validateTargetResponse(target, {
    statusCode: 200,
    location: null,
    body: currentPropertiesBody.replace('<article><a href="/properties/coastal-stay/">The Coastal</a></article>', "")
  }), /properties page is missing stable property detail links/);
  for (const staleBody of [
    currentPropertiesBody.replace('data-max-guests="11"', 'data-max-guests="10"'),
    currentPropertiesBody.replace("Up to 11 guests", "Up to 10 guests")
  ]) {
    assert.throws(() => smoke.validateTargetResponse(target, {
      statusCode: 200, location: null, body: staleBody
    }), /Blue House capacity must be 11 guests/);
  }
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
          <button type="button" data-trip-sheet-open>Dates and guests</button>
          <p class="g-card-source">Ratings from Airbnb</p>
          <button id="reset-filter" type="button">Show all stays</button>
          <span class="g-card-rating" aria-hidden="true">★ 5.0 (112)</span>
          <article>Dockside Dreams</article>
          <article>The Oasis</article>
          <a class="catalog-check-dates" href="https://book.seascape-vacations.com">Check dates</a>
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

test("stays smoke locks the customer-facing stay-collection hub", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/");

  assert.notEqual(target, undefined, "expected /stays/ to stay in the smoke target list");

  const currentStayHubBody = `
    <main>
      <p>Stay Collections</p>
      <h1>Compare Gulf Coast private-pool homes by area, group size, and trip priorities</h1>
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

test("Sarasota pool stay smoke locks resolved occupancy and heat copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/sarasota-vacation-rentals-with-pool/");

  assert.notEqual(target, undefined, "expected Sarasota pool stay to stay in the smoke target list");

  const currentSarasotaStayBody = `
    <main>
      <h2>Private pool, sleeps 12</h2>
      <p>St. Armands Circle is also reached by car</p>
      <p>are reached by car from Sarasota Luxe</p>
      <p>plus a hot tub (confirm heat terms when booking).</p>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentSarasotaStayBody
    });
  });
});

test("Sarasota pool stay smoke rejects stale included-heat copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/sarasota-vacation-rentals-with-pool/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h2>Private pool, sleeps 12</h2>
          <p>St. Armands Circle is also reached by car</p>
          <p>are reached by car from Sarasota Luxe</p>
          <p>plus a hot tub included all year.</p>
        </main>
      `
    });
  }, /missing current live marker|stale live marker/);
});

test("stays smoke rejects leaked internal hub copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/stays/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
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
      `
    });
  }, /stale live marker|missing the live stay-collection hub surface/);
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

test("homepage smoke validates the rendered home journey and rejects missing trip controls", () => {
  const fs=require("fs");const smoke=loadSmokeModule();const target=smoke.targets.find(entry=>entry.path==="/");
  const body=fs.readFileSync(path.join(projectRoot,"_site/index.html"),"utf8");
  assert.doesNotThrow(()=>smoke.validateTargetResponse(target,{statusCode:200,body}));
  assert.throws(()=>smoke.validateTargetResponse(target,{statusCode:200,body:body.replace(/data-guest-trip-form/g,"removed-control")}));
});
