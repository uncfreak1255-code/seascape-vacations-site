// Local-only network fixture for site-flows.e2e.ts: every request is answered here or blocked.
import path from "node:path";
import type { Browser } from "@e2e-dev/web";

export type AvailabilityReply = {
  status?: number;
  bookable: boolean;
  reason?: string | null;
  minimumStay?: number | null;
};

export type NetworkState = {
  availabilityCalls: string[];
  availabilityReplies: AvailabilityReply[];
  checkoutRequests: string[];
  ownerPosts: Array<{ method: string; path: string; body: string }>;
  ownerPostStatuses: number[];
  guestCaptures: Array<Record<string, unknown>>;
  guestCaptureStatuses: number[];
  blockedExternalRequests: string[];
};

export const properties = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home",
  "blue-house",
];

export async function installLocalOnlyRoutes(browser: Browser, state: NetworkState) {
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
