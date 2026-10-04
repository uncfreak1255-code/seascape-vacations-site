import path from "node:path";
import { test as base } from "@e2e-dev/web";
import { expect } from "e2e";
import type { Browser } from "@e2e-dev/web";

type AvailabilityReply = {
  status?: number;
  bookable: boolean;
  reason?: string | null;
  minimumStay?: number | null;
};

type NetworkState = {
  availabilityCalls: string[];
  availabilityReplies: AvailabilityReply[];
  checkoutRequests: string[];
  ownerPosts: Array<{ method: string; path: string; body: string }>;
  ownerPostStatuses: number[];
  guestCaptures: Array<Record<string, unknown>>;
  guestCaptureStatuses: number[];
  blockedExternalRequests: string[];
};

const properties = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home",
  "blue-house",
];

const test = base.extend<{ network: NetworkState }>({
  network: async ({ browser }, use) => {
    const state: NetworkState = {
      availabilityCalls: [],
      availabilityReplies: [],
      checkoutRequests: [],
      ownerPosts: [],
      ownerPostStatuses: [],
      guestCaptures: [],
      guestCaptureStatuses: [],
      blockedExternalRequests: [],
    };

    await browser.addInitScript(`(() => {
      const NativeDate = Date;
      const fixedTime = NativeDate.parse("2026-10-04T12:00:00.000Z");
      function FixtureDate(...args) {
        if (!new.target) return new NativeDate(fixedTime).toString();
        return new NativeDate(...(args.length ? args : [fixedTime]));
      }
      FixtureDate.prototype = NativeDate.prototype;
      Object.setPrototypeOf(FixtureDate, NativeDate);
      FixtureDate.now = () => fixedTime;
      globalThis.Date = FixtureDate;
      Object.defineProperty(globalThis, "__siteE2eDateFixture", { value: fixedTime });
    })();`);
    await installLocalOnlyRoutes(browser, state);
    await use(state);
  },
});

async function installLocalOnlyRoutes(browser: Browser, state: NetworkState) {
  await browser.route("**/*", async (route) => {
    const url = new URL(route.request.url);
    const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";

    if (url.hostname === "api.open-meteo.com") {
      const body = url.searchParams.has("current")
        ? { current: { temperature_2m: 78.2, weather_code: 1 } }
        : { daily: { sunset: ["2026-11-06T19:58"] } };
      await route.fulfill({ json: body });
      return;
    }

    if (url.hostname === "book.seascape-vacations.com" && url.pathname.startsWith("/checkout/")) {
      state.checkoutRequests.push(url.href);
      await route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Local checkout fixture</title><h1>Simulated secure checkout</h1>",
      });
      return;
    }

    if (isLocal && url.pathname === "/.netlify/functions/booking-availability") {
      state.availabilityCalls.push(url.href);
      const reply = state.availabilityReplies.shift() ?? { bookable: true, reason: null, minimumStay: 2 };
      if (reply.status && reply.status >= 400) {
        await route.fulfill({ status: reply.status, json: { ok: false } });
        return;
      }

      await route.fulfill({
        json: {
          ok: true,
          arrive: url.searchParams.get("arrive"),
          depart: url.searchParams.get("depart"),
          homes: properties.map((slug) => ({
            slug,
            bookable: reply.bookable,
            reason: reply.reason ?? null,
            minimumStay: reply.minimumStay ?? 2,
          })),
        },
      });
      return;
    }

    if (isLocal && url.pathname === "/.netlify/functions/guest-email-capture") {
      try {
        state.guestCaptures.push(JSON.parse(route.request.postData ?? "{}"));
      } catch {
        state.guestCaptures.push({});
      }

      const status = state.guestCaptureStatuses.shift() ?? 200;
      await route.fulfill({
        status,
        json: status === 200
          ? { tagged: true, captureState: "guest_capture_tag_applied" }
          : { reason: "temporarily_unavailable" },
      });
      return;
    }

    if (isLocal && route.request.method === "POST" && url.pathname === "/property-management/revenue-review-requested/") {
      state.ownerPosts.push({
        method: route.request.method,
        path: url.pathname,
        body: route.request.postData ?? "",
      });
      const status = state.ownerPostStatuses.shift() ?? 200;
      await route.fulfill({
        status,
        contentType: "text/html",
        body: status === 200
          ? "<!doctype html><title>Local owner-intake fixture</title><h1>Mock owner request received</h1>"
          : "<!doctype html><title>Local owner-intake fixture unavailable</title><h1>Mock owner request temporarily unavailable</h1>",
      });
      return;
    }

    if (isLocal && url.pathname === "/.netlify/images") {
      const sourcePath = url.searchParams.get("url");
      if (sourcePath?.startsWith("/images/")) {
        await route.fulfill({ path: path.join(process.cwd(), sourcePath.slice(1)) });
      } else {
        await route.abort();
      }
      return;
    }

    if (isLocal) {
      await route.continue();
      return;
    }

    state.blockedExternalRequests.push(url.href);
    await route.abort();
  });
}

test("browser date fixture is installed before site date validation runs", async ({ app, browser, screen }) => {
  await app.open("/properties/dockside-dreams/");
  const fixture = await browser.evaluate(() => ({
    now: Date.now(),
    installedAt: (globalThis as typeof globalThis & { __siteE2eDateFixture?: number }).__siteE2eDateFixture,
    arrivalMin: (document.querySelector('[data-guest-trip-form] .g-arrive') as HTMLInputElement).min,
  }));

  const expectedNow = Date.parse("2026-10-04T12:00:00.000Z");
  expect(fixture).toEqual({ now: expectedNow, installedAt: expectedNow, arrivalMin: "2026-10-04" });
  await expect(screen.getByLabel("Arrival")).toHaveAttribute("min", "2026-10-04");
});

test("guest searches, chooses the matching home, and reaches only the intercepted checkout", async ({ app, browser, screen, network }) => {
  await app.open("/");
  await screen.getByLabel("Arrival").fill("2026-11-07");
  await screen.getByLabel("Departure").fill("2026-11-14");
  await screen.getByLabel("Guests").selectOption({ value: "14" });
  await screen.getByRole("button", "Find my home").tap();

  await expect(browser).toHaveURL(/\/properties\/\?.*arrive=2026-11-07/);
  await expect(browser.locator(".catalog-card:visible")).toHaveCount(1);
  await expect(browser.locator('.catalog-card:visible[data-property="the-oasis"]')).toBeVisible();

  await screen.getByRole("link", "View The Oasis details").tap();
  await expect(screen.getByRole("heading", "The Oasis")).toBeVisible();
  await expect(screen.getByLabel("Arrival")).toHaveValue("2026-11-07");
  await expect(screen.getByLabel("Departure")).toHaveValue("2026-11-14");
  await expect(screen.getByLabel("Guests")).toHaveValue("14");
  await expect(browser.locator(".g-form-status")).toContainText(/dates are open/i);

  await screen.getByRole("link", /book these dates/i).tap();
  await expect(screen.getByRole("heading", "Simulated secure checkout")).toBeVisible();
  expect(network.checkoutRequests).toHaveLength(1);
  expect(network.blockedExternalRequests).toEqual([]);
});

test("invalid dates and an unavailable calendar keep guests on the property until corrected dates pass a fresh check", async ({ app, browser, screen, network }) => {
  network.availabilityReplies.push(
    { status: 503, bookable: false, reason: "no-calendar", minimumStay: null },
    { bookable: true, reason: null, minimumStay: 2 },
  );

  await app.open("/properties/dockside-dreams/?arrive=2026-11-14&depart=2026-11-07&guests=6");
  await expect(browser.locator(".g-form-status")).toHaveText(/dates are incomplete, past or out of order/i);
  await expect(browser.locator("[data-property-checkout]")).toHaveAttribute("href", /listings\/206016/);
  expect(network.availabilityCalls).toEqual([]);

  await screen.getByLabel("Arrival").fill("2026-11-08");
  await screen.getByLabel("Departure").fill("2026-11-15");
  await expect(browser.locator(".g-form-status")).toHaveText(/availability could not be checked/i);
  await expect(browser.locator("[data-property-checkout]")).toHaveAttribute("href", /listings\/206016/);

  await screen.getByLabel("Arrival").fill("2026-11-09");
  await screen.getByLabel("Departure").fill("2026-11-16");
  await expect(browser.locator(".g-form-status")).toHaveText(/these dates are open/i);
  await expect(browser.locator("[data-property-checkout]")).toHaveAttribute("href", /checkout\/206016/);
  expect(network.availabilityCalls.some((call) => {
    const dates = new URL(call).searchParams;
    return dates.get("arrive") === "2026-11-09" && dates.get("depart") === "2026-11-16";
  })).toBe(true);
  expect(network.checkoutRequests).toEqual([]);
});

test("a guide detour through a stay collection preserves the trip and campaign into property checkout", async ({ app, browser }) => {
  await app.open("/?arrive=2026-11-07&depart=2026-11-14&guests=8&promo=save50&utm_source=mailchimp");
  await browser.locator('main a[href*="/guides/bradenton-vs-sarasota/"]').first().tap();
  await expect(browser).toHaveURL(/arrive=2026-11-07/);
  await expect(browser).toHaveURL(/promo=save50/);

  await browser.locator('a[href*="/stays/bradenton-vacation-rentals-near-beaches/"]').first().tap();
  await expect(browser).toHaveURL(/guests=8/);
  await expect(browser).toHaveURL(/utm_campaign=save50_welcome/);
  await browser.locator('a[href*="/properties/dockside-dreams/"]').first().tap();

  await expect(browser.locator(".g-arrive")).toHaveValue("2026-11-07");
  await expect(browser.locator(".g-depart")).toHaveValue("2026-11-14");
  await expect(browser.locator(".g-guests")).toHaveValue("8");
  const checkoutHref = await browser.locator("[data-property-checkout]").getAttribute("href");
  const checkout = new URL(checkoutHref ?? "", "http://127.0.0.1");
  expect(checkout.searchParams.get("start")).toBe("2026-11-07");
  expect(checkout.searchParams.get("end")).toBe("2026-11-14");
  expect(checkout.searchParams.get("numberOfGuests")).toBe("8");
  expect(checkout.searchParams.get("promo")).toBe("save50");
  expect(checkout.searchParams.get("utm_campaign")).toBe("save50_welcome");
});

test("oversized groups cannot reach a property checkout and correcting the group restores the listing link", async ({ app, browser, screen }) => {
  await app.open("/properties/dockside-dreams/?guests=17");
  await expect(screen.getByLabel("Guests")).toHaveValue("17");
  await expect(browser.locator(".g-form-status")).toContainText(/up to 12 guests/i);
  await expect(browser.locator("[data-property-checkout]")).not.toHaveAttribute("href", /./);

  await screen.getByLabel("Guests").selectOption({ value: "8" });
  await expect(browser.locator("[data-property-checkout]")).toHaveAttribute("href", /listings\/206016/);
});

test("owner revenue review validates authority and posts only to the intercepted local form endpoint", async ({ app, browser, screen, network }) => {
  await app.open("/property-management/");
  await screen.getByRole("link", "Revenue Review").tap();

  const form = browser.locator('form[name="owner-revenue-teardown"]');
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="0"]')).toBeVisible();
  await form.getByLabel("Listing link or street address").fill("4250 Palm Ave, Sarasota");
  await form.getByRole("button", "Continue").tap();
  await form.getByRole("button", "Booking-site fees feel heavy").tap();
  await form.getByLabel("One line in your own words").fill("The current payout looks lower than expected.");
  await form.getByRole("button", "Continue").tap();
  await form.getByLabel("Your name").fill("Test Owner");
  await form.getByLabel("Email").fill("owner@example.test");
  await form.getByRole("button", "Continue").tap();

  const authority = browser.locator('form[name="owner-revenue-teardown"] [name="submitter_authority"]');
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="2"]')).toBeVisible();
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="3"]')).toBeHidden();
  await form.getByRole("button", "Continue").tap();
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="2"]')).toBeVisible();
  await authority.check();
  await form.getByRole("button", "Continue").tap();
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-confirm-authority]')).toHaveText("Confirmed");
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-confirm-url]')).toHaveText("4250 Palm Ave, Sarasota");

  await form.getByRole("button", "Send my review request").tap();
  await expect(screen.getByRole("heading", "Mock owner request received")).toBeVisible();
  expect(network.ownerPosts).toHaveLength(1);
  expect(network.ownerPosts[0].method).toBe("POST");
  expect(network.ownerPosts[0].path).toBe("/property-management/revenue-review-requested/");
  expect(network.ownerPosts[0].body).toContain("owner_or_authorized_representative");
  expect(network.blockedExternalRequests).toEqual([]);
});

test("an owner request that cannot be saved can be retried after returning to the form", async ({ app, browser, screen, network }) => {
  network.ownerPostStatuses.push(503, 200);
  await app.open("/property-management/#owner-cta");
  await completeOwnerReview(browser);
  await expect(screen.getByRole("heading", "Mock owner request temporarily unavailable")).toBeVisible();

  await browser.back();
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="0"]')).toBeVisible();
  await completeOwnerReview(browser);

  await expect(screen.getByRole("heading", "Mock owner request received")).toBeVisible();
  expect(network.ownerPosts).toHaveLength(2);
  expect(network.ownerPosts.every((post) => post.body.includes("owner_or_authorized_representative"))).toBe(true);
});

test("guest email capture retries a temporary failure before revealing SAVE50 and browsing homes", async ({ app, browser, screen, network }) => {
  network.guestCaptureStatuses.push(503, 200);
  await app.open("/");
  await browser.evaluate(() => document.querySelector("#email-signup")?.scrollIntoView());
  const signup = browser.locator('#email-signup form[data-inline-email-capture]');
  await signup.getByLabel("First name").fill("Test Guest");
  await signup.getByLabel("Email address").fill("guest@example.test");
  const submit = signup.getByRole("button", "Get my $50 code");

  await submit.tap();
  await expect(browser.locator('#email-signup [data-email-capture-error]')).toBeVisible();
  await expect(browser.locator('#email-signup [data-email-capture-success]')).toBeHidden();
  await expect(signup.getByLabel("Email address")).toHaveValue("guest@example.test");

  await submit.tap();
  const success = browser.locator('#email-signup [data-email-capture-success]');
  await expect(success).toBeVisible();
  await expect(success).toContainText(/SAVE50/);
  expect(network.guestCaptures).toHaveLength(2);
  expect(network.guestCaptures[0]).toMatchObject({ formName: "email_capture", consentBasis: "guest_requested_email_followup" });
  expect(network.guestCaptures[1].submissionId).toBe(network.guestCaptures[0].submissionId);

  await browser.locator("[data-email-capture-browse]").first().tap();
  await expect(browser).toHaveURL(/\/properties\/\?.*promo=save50/);
  await expect(browser.locator("[data-save50-offer]")).toBeVisible();
  expect(network.blockedExternalRequests).toEqual([]);
});

test("guest contact link carries only the chosen question and trip context", async ({ app, browser }) => {
  await app.open("/properties/dockside-dreams/?arrive=2026-11-07&depart=2026-11-14&guests=8&email=guest%40example.test&sv_session_id=secret&payment_intent=private");
  await browser.locator("#question-topic").selectOption({ value: "boat and parking space" });
  const href = await browser.locator("[data-question-email]").getAttribute("href");

  expect(href).toContain("mailto:info@seascape-vacations.com");
  const question = decodeURIComponent(href ?? "");
  expect(question).toContain("Dockside Dreams");
  expect(question).toContain("8 guests");
  expect(question).not.toMatch(/guest@example|sv_session_id|payment_intent|secret|private/);
});

test("phone-sized visitors can open navigation and reach the owner review", async ({ app, browser, screen }) => {
  await app.open("/");
  test.skip(await browser.evaluate(() => window.innerWidth > 700), "phone-sized viewport only");
  await screen.getByRole("button", "Open menu").tap();
  await expect(browser.locator("#guest-menu")).toBeVisible();
  await browser.locator('#guest-menu a[href="/property-management/"]').tap();
  await expect(browser).toHaveURL(/\/property-management\/$/);
  await expect(browser.locator("#owner-cta form[name=\"owner-revenue-teardown\"]")).toBeVisible();
});

async function completeOwnerReview(browser: Browser) {
  const form = browser.locator('form[name="owner-revenue-teardown"]');
  await form.getByLabel("Listing link or street address").fill("4250 Palm Ave, Sarasota");
  await form.getByRole("button", "Continue").tap();
  await form.getByRole("button", "Booking-site fees feel heavy").tap();
  await form.getByLabel("One line in your own words").fill("The current payout looks lower than expected.");
  await form.getByRole("button", "Continue").tap();
  await form.getByLabel("Your name").fill("Test Owner");
  await form.getByLabel("Email").fill("owner@example.test");
  await form.getByRole("button", "Continue").tap();
  const authority = await browser.evaluate(() =>
    (document.querySelector('form[name="owner-revenue-teardown"] [name="submitter_authority"]') as HTMLInputElement).checked,
  );
  if (!authority) {
    await form.getByRole("button", "Continue").tap();
    await expect(browser.locator('form[name="owner-revenue-teardown"] [data-form-step="2"]')).toBeVisible();
    await browser.locator('form[name="owner-revenue-teardown"] [name="submitter_authority"]').check();
    await form.getByRole("button", "Continue").tap();
  }
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-confirm-authority]')).toHaveText("Confirmed");
  await expect(browser.locator('form[name="owner-revenue-teardown"] [data-confirm-url]')).toHaveText("4250 Palm Ave, Sarasota");
  await form.getByRole("button", "Send my review request").tap();
}
