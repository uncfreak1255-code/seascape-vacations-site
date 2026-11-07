const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}
test("properties smoke rejects a page without the Dates and guests pill", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/properties/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `<main><article>Dockside Dreams</article><article>The Oasis</article></main>`
    });
  }, /missing current live marker/);
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
        async newContext() { return this; },
        async route() {},
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
