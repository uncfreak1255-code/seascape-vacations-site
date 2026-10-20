import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("Bradenton guide sticky CTA records one handoff and carries its lineage to the catalog", async ({ app, browser }) => {
  await browser.route("**/*", async (route) => {
    const host = new URL(route.request.url).hostname;
    if (host === "127.0.0.1" || host === "localhost") await route.continue();
    else await route.abort();
  });
  await browser.addInitScript(`(() => {
    const entries = [];
    entries.push = function (...items) {
      for (const item of items) {
        const name = item.event || (item[0] === "event" ? item[1] : "");
        if (name !== "guide_book_direct_click") continue;
        const payload = item.payload || item[2] || {};
        const recorded = JSON.parse(sessionStorage.getItem("guide-handoff-proof") || "[]");
        recorded.push({ event: name, payload });
        sessionStorage.setItem("guide-handoff-proof", JSON.stringify(recorded));
      }
      return Array.prototype.push.apply(this, items);
    };
    window.dataLayer = entries;
  })();`);

  await app.open("/guides/things-to-do-bradenton-fl/?utm_source=google&utm_medium=organic");
  await browser.locator("#sticky-book-bar a").tap();
  await expect(browser).toHaveURL(/\/properties\/\?/);
  await expect(browser).toHaveURL(/sv_guide_click_id=svg_/);
  const result = await browser.evaluate(() => ({
    url: window.location.href,
    events: JSON.parse(sessionStorage.getItem("guide-handoff-proof") || "[]"),
  }));
  expect(result.events.length).toBe(1);
  expect(result.events[0].event).toBe("guide_book_direct_click");
  expect(result.events[0].payload.guide_slug).toBe("things-to-do-bradenton-fl");
  expect(result.events[0].payload.placement).toBe("sticky_book_bar");
  expect(new URL(result.events[0].payload.link_url, result.url).searchParams.get("sv_guide_click_id")).toBe(
    new URL(result.url).searchParams.get("sv_guide_click_id"),
  );
  expect(new URL(result.url).searchParams.get("utm_source")).toBe("google");
});

for (const cta of [
  { name: "main", selector: ".btn-white", placement: "bottom_cta" },
  { name: "sticky", selector: "#sticky-book-bar a", placement: "sticky_book_bar" },
]) {
  test(`Rainy-day guide ${cta.name} CTA records one legacy handoff and carries its lineage to stays`, async ({ app, browser }) => {
    await browser.route("**/*", async (route) => {
      const host = new URL(route.request.url).hostname;
      if (host === "127.0.0.1" || host === "localhost") await route.continue();
      else await route.abort();
    });
    await browser.addInitScript(`(() => {
      const entries = [];
      entries.push = function (...items) {
        for (const item of items) {
          const name = item.event || (item[0] === "event" ? item[1] : "");
          if (!["guide_book_direct_click", "booking_engine_handoff"].includes(name)) continue;
          const payload = item.payload || item[2] || {};
          const recorded = JSON.parse(sessionStorage.getItem("rainy-handoff-proof") || "[]");
          recorded.push({ event: name, payload });
          sessionStorage.setItem("rainy-handoff-proof", JSON.stringify(recorded));
        }
        return Array.prototype.push.apply(this, items);
      };
      window.dataLayer = entries;
    })();`);

    await app.open("/guides/rainy-day-activities-bradenton-sarasota/?utm_source=google&utm_medium=organic");
    await browser.locator(cta.selector).tap();
    await expect(browser).toHaveURL(/\/stays\/bradenton-vacation-rentals-near-beaches\//);
    const result = await browser.evaluate(() => ({
      url: window.location.href,
      events: JSON.parse(sessionStorage.getItem("rainy-handoff-proof") || "[]"),
    }));
    expect(result.events.length).toBe(1);
    expect(result.events[0].event).toBe("guide_book_direct_click");
    expect(result.events[0].payload.guide_slug).toBe("rainy-day-activities-bradenton-sarasota");
    expect(result.events[0].payload.placement).toBe(cta.placement);
    const destination = new URL(result.url);
    expect(destination.searchParams.get("sv_guide_click_id")).toMatch(/^svg_/);
    expect(new URL(result.events[0].payload.link_url, result.url).searchParams.get("sv_guide_click_id")).toBe(
      destination.searchParams.get("sv_guide_click_id"),
    );
    expect(destination.searchParams.get("utm_source")).toBe("google");
    expect(destination.searchParams.get("utm_medium")).toBe("organic");
  });
}
