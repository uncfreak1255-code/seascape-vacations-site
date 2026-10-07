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

test("property-management smoke follows the current Waterline owner offer hub", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.notEqual(target, undefined, "expected property-management to stay in the smoke target list");

  const currentOwnerHubBody = `
    <main>
      <h1>Seven homes. One local team. <em>Your call gets answered.</em></h1>
      <a href="#owner-cta">Request your 48-hour revenue review</a>
      <form name="owner-revenue-teardown" method="POST"></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <h2>What we do for your home</h2>
      <h2>Why a seven-home operator</h2>
      <h2>The homes we manage</h2>
      <a href="/property-management/vacation-rental-management-sarasota/">Sarasota</a>
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

test("property-management smoke accepts the live minified single-quoted form name", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  const minifiedOwnerHubBody = `
    <main>
      <h1>Seven homes. One local team. <em>Your call gets answered.</em></h1>
      <a href="#owner-cta">Request your 48-hour revenue review</a>
      <form name='owner-revenue-teardown' method='POST'></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <h2>What we do for your home</h2>
      <h2>Why a seven-home operator</h2>
      <h2>The homes we manage</h2>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: minifiedOwnerHubBody
    });
  });
});

test("property-management smoke fails when the owner form name is missing", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>Seven homes. One local team. <em>Your call gets answered.</em></h1>
          <a href="#owner-cta">Request your 48-hour revenue review</a>
          <h2>What we do for your home</h2>
          <h2>Why a seven-home operator</h2>
          <h2>The homes we manage</h2>
        </main>
      `
    });
  }, /property-management hub is missing the Waterline owner offer surface/);
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
  }, /property-management hub is missing the Waterline owner offer surface/);
});

test("properties smoke checks durable property detail hrefs instead of old CTA copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/properties/");

  assert.notEqual(target, undefined, "expected /properties/ to stay in the smoke target list");

  const currentPropertiesBody = `
    <main data-catalog-version="waterline-v3">
      <h1>Find the house.<br>Bring your people.</h1>
      <form id="catalog-trip-form"></form><dialog id="catalog-comparison"></dialog>
      <p>Full price, fees and cancellation terms on the booking page.</p>
      <article><a href="/properties/dockside-dreams/">Dockside Dreams</a></article>
      <article><a href="/properties/the-oasis/">The Oasis</a></article>
      <article><a href="/properties/sarasota-luxe/">Sarasota Luxe</a></article>
      <article><a href="/properties/river-house/">River House</a></article>
      <article><a href="/properties/bradenton-pool-home/">Bradenton Pool Home</a></article>
      <article data-property="blue-house" data-max-guests="11"><a href="/properties/blue-house/">Pickleball Pool Home Retreat</a><p>Up to 11 guests</p></article>
      <article><a href="/properties/coastal-stay/">Pickleball, Pool, Spa, Hoops &amp; Mini Golf</a></article>
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

  assert.equal(currentPropertiesBody.includes("View Details"), false);
  assert.throws(() => smoke.validateTargetResponse(target, {
    statusCode: 200,
    location: null,
    body: currentPropertiesBody.replace('<article><a href="/properties/coastal-stay/">Pickleball, Pool, Spa, Hoops &amp; Mini Golf</a></article>', "")
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

test("checkout smoke tells a priced checkout, a changed address format, a blank page and no open stay apart", async () => {
  const smoke = loadSmokeModule();
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const open = async () => ({ ok: true, homes: [{ slug: "the-oasis", bookable: false }, { slug: "dockside-dreams", bookable: true }] });
  const visited = [];
  let closed = 0;
  // Each page opened takes the next text and status; the last pair repeats.
  const chromiumShowing = (text, status = 200) => ({
    async launch() {
      let opened = 0;
      return {
        async newPage() {
          const index = opened++;
          const pick = (value) => (Array.isArray(value) ? value[Math.min(index, value.length - 1)] : value);
          return {
            async goto(url) {
              visited.push(url);
              if (pick(status) === "throws") throw new Error("net::ERR_CONNECTION_RESET");
              return { status: () => pick(status) };
            },
            async evaluate() {
              return pick(text);
            },
            async waitForTimeout() {},
            async close() {}
          };
        },
        async close() {
          closed += 1;
        }
      };
    }
  });
  const check = (text, extra = {}) =>
    smoke.validateRenderedCheckout("https://example.test", { now, timeout: 20, fetchJson: open, chromium: chromiumShowing(text), ...extra });

  const priced = await check("Finalize your booking Trip details 2 guests Price details Total $2,404.00 Continue to payment");
  assert.equal(priced.checked, "https://book.seascape-vacations.com/checkout/206016?start=2027-01-29&end=2027-02-05&numberOfGuests=2");
  assert.equal(visited.length, 1);

  // The rollback names both pages that open the checkout address.
  await assert.rejects(check("Finalize your booking Select dates Add payment method"), /no longer shows a priced stay.*guest\.js.*catalog\.js/);
  await assert.rejects(
    check("Finalize your booking Price details Total", { chromium: chromiumShowing("Not found", 404) }),
    /no longer shows a priced stay/
  );
  await assert.rejects(check(""), /could not be judged within .*saw: pending, pending/);
  await assert.rejects(
    check("Price details Total", { fetchJson: async () => ({ ok: true, homes: [{ slug: "dockside-dreams", bookable: false }] }) }),
    /found no open stay to test in 6 date ranges \(0 could not be read\)/
  );
  await assert.rejects(
    check("Price details Total", { fetchJson: async () => ({ ok: false }) }),
    /found no open stay to test in 6 date ranges \(6 could not be read\)/
  );
  assert.equal(closed, 4, "every launched browser is closed");

  // Only a rendered page without the stay, or "not found", is evidence that the address changed.
  const rollback = /switch checkoutUrl\(\)/;
  const unjudged = async (chromium, saw) => {
    const error = await check("", { chromium }).then(() => null, (caught) => caught);
    assert.match(error.message, /could not be judged/);
    assert.match(error.message, saw);
    assert.doesNotMatch(error.message, rollback, "a page that was never read must not order a rollback");
  };
  await unjudged(chromiumShowing("Access denied", 403), /saw: status 403, status 403/);
  await unjudged(chromiumShowing("Too many requests", 429), /saw: status 429/);
  await unjudged(chromiumShowing("Bad gateway", 502), /saw: status 502/);
  await unjudged(chromiumShowing("", "throws"), /saw: pending, pending/);
  await unjudged(chromiumShowing(["Finalize your booking Select dates", ""]), /saw: unpriced, pending/);
  await unjudged(chromiumShowing(["", "Not found"], [503, 404]), /saw: status 503, unpriced/);

  // One unreadable availability answer moves on to the next date range.
  let asked = 0;
  const flaky = async () => {
    asked += 1;
    if (asked === 1) throw new Error("Timed out fetching");
    if (asked === 2) throw new SyntaxError("Unexpected token < in JSON");
    return open();
  };
  const later = await check("Price details Total $2,404.00", { fetchJson: flaky });
  assert.equal(asked, 6);
  assert.equal(later.checked, "https://book.seascape-vacations.com/checkout/206016?start=2027-03-30&end=2027-04-06&numberOfGuests=2");
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
