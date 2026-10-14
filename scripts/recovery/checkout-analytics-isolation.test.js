const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRenderedCheckout } = require("./assert-live-smoke");

const now = Date.parse("2026-10-01T12:00:00Z");
const openStay = async () => ({ ok: true, homes: [{ slug: "dockside-dreams", bookable: true }] });

function checkoutHarness({ routeError } = {}) {
  const events = [];
  const requests = [];
  let handler;
  const attempts = [
    ["https://www.google-analytics.com/g/collect?tid=G-TEST", "GET", "image"],
    ["https://region1.google-analytics.com/g/collect", "POST", "fetch"],
    ["https://stats.g.doubleclick.net/j/collect", "POST", "beacon"],
    ["https://analytics.google.com/g/collect", "POST", "frame"],
    ["https://book.seascape-vacations.com/api/price", "GET", "price"],
    ["https://api.hostaway.com/v1/listings/206016/calendar", "GET", "availability"],
    ["https://book.seascape-vacations.com/assets/main.js", "GET", "asset"],
    ["https://book.seascape-vacations.com/api/collect", "POST", "booking"],
    ["https://google-analytics.com.evil.test/g/collect", "GET", "deceptive-host"],
    ["https://notgoogle-analytics.com/g/collect", "GET", "deceptive-host"],
    ["https://www.google-analytics.com@book.seascape-vacations.com/g/collect", "GET", "userinfo"],
    ["https://www.google-analytics.com/assets/collect.js", "GET", "non-measurement-path"]
  ];
  async function dispatch(url, method, kind) {
    const request = { url: () => url, method: () => method };
    const route = {
      request: () => request,
      async abort() { requests.push({ url, method, kind, action: "blocked" }); },
      async fallback() { requests.push({ url, method, kind, action: "continued" }); }
    };
    if (handler) await handler(route);
    else await route.fallback();
  }
  const context = {
    async route(pattern, callback) {
      events.push("route");
      assert.equal(pattern, "**/*");
      if (routeError) throw routeError;
      handler = callback;
    },
    async newPage() {
      events.push("page");
      return {
        async goto(url) {
          events.push("navigate");
          await dispatch(url, "GET", "checkout");
          for (const attempt of attempts) await dispatch(...attempt);
          return { status: () => 200 };
        },
        async evaluate() { return "Price details Total $2404"; },
        async close() {}
      };
    }
  };
  const chromium = {
    async launch() {
      return {
        async newContext(options) {
          events.push("context");
          assert.equal(options.serviceWorkers, "block");
          return context;
        },
        // Keep the old unisolated path runnable so baseline failure is behavioral.
        newPage: context.newPage,
        async close() { events.push("closed"); }
      };
    }
  };
  return { chromium, events, requests };
}

test("checkout smoke blocks measurement attempts before navigation and continues booking requests", async () => {
  const fixture = checkoutHarness();
  const result = await validateRenderedCheckout("https://example.test", { now, fetchJson: openStay, chromium: fixture.chromium });
  assert.match(result.checked, /\/checkout\/206016\?/);
  assert.deepEqual(fixture.requests.slice(1, 5).map((r) => r.action), Array(4).fill("blocked"));
  assert.equal(fixture.requests[0].action, "continued", "checkout document still loads");
  assert.ok(fixture.requests.slice(5).every((r) => r.action === "continued"), "price, calendar, assets and lookalike destinations still pass");
  assert.deepEqual(fixture.events, ["context", "route", "page", "navigate", "closed"]);
});

test("checkout smoke stops before opening a page if interception setup fails", async () => {
  const fixture = checkoutHarness({ routeError: new Error("interception unavailable") });
  await assert.rejects(
    validateRenderedCheckout("https://example.test", { now, fetchJson: openStay, chromium: fixture.chromium }),
    /interception unavailable/
  );
  assert.deepEqual(fixture.events, ["context", "route", "closed"]);
  assert.equal(fixture.requests.length, 0);
});
