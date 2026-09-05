const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const uuid = "aaaaaaaa-aaaa-4aaa-8aaa-123456789012";
function loadRuntime(file, { storedId = "", randomUUID = () => uuid } = {}) {
  let source = fs.readFileSync(path.join(__dirname, "../../src/assets/js", file), "utf8");
  // The homepage's first IIFE owns its privacy filter before the shared runtime loads.
  if (file === "homepage.js") source = source.split("(function loadConversionTracking()")[0];
  const storage = new Map(storedId ? [["seascape_booking_handoff_session_id", storedId]] : []);
  const context = {
    URL, URLSearchParams,
    window: {
      location: { href: "https://seascape-vacations.com/" }, addEventListener() {},
      crypto: { randomUUID },
      localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }
    },
    document: { readyState: "loading", addEventListener() {} }
  };
  vm.runInNewContext(source, context);
  return context.window;
}

for (const file of ["conversion-tracking.js", "homepage.js"]) {
  test(`${file}: phone-like values remain private even inside valid UUID shapes`, () => {
    const sanitize = loadRuntime(file).seascapeSanitizeAnalyticsPayload;
    for (const value of [
      "+1 941 555 0123", "svs_9415550123", `svs_${uuid}`, `svh_${uuid}`,
      "svs_aaaaaaaa-aaaa-4aaa-8aaa-9415550123aa",
      `svs_${uuid}suffix`, `svs_${uuid.replace("4aaa", "1aaa")}`,
      `svs_${uuid.replace("8aaa", "1aaa")}`
    ]) {
      assert.equal(sanitize({ sessionId: value }).sessionId, undefined);
      const linkUrl = `https://book.seascape-vacations.com/?sv_session_id=${encodeURIComponent(value)}`;
      assert.equal(new URL(sanitize({ linkUrl }).linkUrl).searchParams.has("sv_session_id"), false);
    }
    assert.equal(sanitize({ link_text: `svs_${uuid}` }).link_text, undefined);
    assert.equal(sanitize({ phone: `svs_${uuid}` }).phone, undefined);
    assert.equal(sanitize({ sessionId: "private@example.com" }).sessionId, undefined);
  });
}

function bookingUrl(window) {
  return new URL(window.SeascapeConversionTracking.buildBookingEngineHandoffUrl(
    "https://book.seascape-vacations.com/listings/487798"
  ));
}

test("generated IDs retain their full random token and survive both privacy filters", () => {
  const window = loadRuntime("conversion-tracking.js");
  const url = bookingUrl(window);
  const sessionId = url.searchParams.get("sv_session_id");
  const handoffId = url.searchParams.get("sv_handoff_id");
  for (const id of [sessionId, handoffId]) {
    assert.match(id, /^sv[sh]_[a-z-]+$/);
    assert.ok(id.length <= 96);
    const decoded = id.slice(4).replace(/q([a-jq])/g, (_, letter) => letter === "q" ? "q" : String(letter.charCodeAt(0) - 97));
    assert.equal(decoded, uuid, "encoding preserves every random UUID character");
  }
  for (const file of ["conversion-tracking.js", "homepage.js"]) {
    const payload = loadRuntime(file).seascapeSanitizeAnalyticsPayload({ sessionId, handoffId, linkUrl: url.href });
    assert.equal(payload.sessionId, sessionId);
    assert.equal(payload.handoffId, handoffId);
    assert.equal(new URL(payload.linkUrl).searchParams.get("sv_session_id"), sessionId);
  }
});

test("a stored phone-like session ID is replaced once; safe existing IDs stay stable", () => {
  const window = loadRuntime("conversion-tracking.js", { storedId: `svs_${uuid}` });
  const id = bookingUrl(window).searchParams.get("sv_session_id");
  assert.notEqual(id, `svs_${uuid}`);
  assert.equal(bookingUrl(window).searchParams.get("sv_session_id"), id);
  const existing = "svs_aaaaaaaa-aaaa-4aaa-8aaa-abcdefabcdef";
  const olderWindow = loadRuntime("conversion-tracking.js", { storedId: existing });
  assert.equal(bookingUrl(olderWindow).searchParams.get("sv_session_id"), existing);
});

test("a public query cannot inject a phone number through a UUID-shaped tracking ID", () => {
  const window = loadRuntime("conversion-tracking.js");
  window.location.search = "?sv_session_id=svs_aaaaaaaa-aaaa-4aaa-8aaa-9415550123aa";
  const id = bookingUrl(window).searchParams.get("sv_session_id");
  assert.ok(id);
  assert.equal(id.includes("9415550123"), false);
});

test("legacy generation without randomUUID also survives the privacy filter", () => {
  const window = loadRuntime("conversion-tracking.js", { randomUUID: undefined });
  window.crypto.randomUUID = undefined;
  const url = bookingUrl(window);
  const sessionId = url.searchParams.get("sv_session_id");
  assert.match(sessionId, /^svs_[a-z-]+$/);
  assert.equal(window.seascapeSanitizeAnalyticsPayload({ sessionId }).sessionId, sessionId);
});
