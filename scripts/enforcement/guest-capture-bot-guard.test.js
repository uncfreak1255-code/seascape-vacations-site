const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { assessGuestCaptureBotSignals, MIN_FORM_DWELL_MS } = require("../../netlify/functions/_guest-capture-bot-guard");
const { handleGuestEmailCapture, CAPTURE_STATES } = require("../../netlify/functions/guest-email-capture");

const projectRoot = path.resolve(__dirname, "..", "..");
const NOW = Date.parse("2026-09-16T12:00:00.000Z");

function cleanPayload(overrides = {}) {
  return {
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/",
    placement: "home_inline",
    submissionId: "capture-test-1",
    formOpenedAt: new Date(NOW - 45000).toISOString(),
    trip_url: "",
    ...overrides
  };
}

const siteHeaders = { origin: "https://seascape-vacations.com" };

test("a normal guest submission from the site passes every signal", () => {
  assert.deepEqual(assessGuestCaptureBotSignals({ payload: cleanPayload(), headers: siteHeaders, now: NOW }), {
    rejected: false,
    reasons: []
  });
});

test("a POST with neither Origin nor Referer is rejected; missing dwell time alone is not", () => {
  const noOrigin = cleanPayload({ formOpenedAt: undefined, trip_url: undefined });
  assert.deepEqual(assessGuestCaptureBotSignals({ payload: noOrigin, headers: {}, now: NOW }), {
    rejected: true,
    reasons: ["origin_missing"]
  });
  assert.equal(assessGuestCaptureBotSignals({ payload: noOrigin, headers: siteHeaders, now: NOW }).rejected, false);
  assert.equal(assessGuestCaptureBotSignals({ payload: noOrigin, headers: undefined, now: NOW }).reasons[0], "origin_missing");
});

test("single-token names with almost no vowels are rejected; short or real names are not", () => {
  for (const name of ["Kbnyhkm", "Wprhd", "Hgvnw", "Mnzydgv", "Wrfxq", "Gphfmp", "Wdgvd", "Qcdzxdlu"]) {
    assert.deepEqual(assessGuestCaptureBotSignals({ payload: cleanPayload({ name }), headers: siteHeaders, now: NOW }).reasons, ["vowelless_name"], name);
  }
  for (const name of ["Lynn", "Flynn", "Brynn", "Scott", "Grant", "Fritz", "Krystl", "Sawyer", "Mary Beth", "Myqz"]) {
    assert.equal(assessGuestCaptureBotSignals({ payload: cleanPayload({ name }), headers: siteHeaders, now: NOW }).rejected, false, name);
  }
});

test("a filled honeypot is rejected", () => {
  const result = assessGuestCaptureBotSignals({ payload: cleanPayload({ trip_url: "http://spam.example" }), headers: siteHeaders, now: NOW });
  assert.equal(result.rejected, true);
  assert.deepEqual(result.reasons, ["honeypot"]);
});

test("a submission faster than the dwell floor is rejected, one at the floor is not", () => {
  const fast = cleanPayload({ formOpenedAt: new Date(NOW - MIN_FORM_DWELL_MS + 1).toISOString() });
  assert.deepEqual(assessGuestCaptureBotSignals({ payload: fast, headers: siteHeaders, now: NOW }).reasons, ["too_fast"]);
  const atFloor = cleanPayload({ formOpenedAt: new Date(NOW - MIN_FORM_DWELL_MS).toISOString() });
  assert.equal(assessGuestCaptureBotSignals({ payload: atFloor, headers: siteHeaders, now: NOW }).rejected, false);
});

test("an unparseable formOpenedAt is ignored rather than rejected", () => {
  const payload = cleanPayload({ formOpenedAt: "not-a-date" });
  assert.equal(assessGuestCaptureBotSignals({ payload, headers: siteHeaders, now: NOW }).rejected, false);
});

test("a present Origin from another site is rejected; site, previews, and localhost are allowed", () => {
  for (const origin of [
    "https://seascape-vacations.com",
    "https://www.seascape-vacations.com",
    "https://deploy-preview-583--seascape-vacations.netlify.app",
    "http://localhost:8080"
  ]) {
    assert.equal(assessGuestCaptureBotSignals({ payload: cleanPayload(), headers: { Origin: origin }, now: NOW }).rejected, false, origin);
  }
  const foreign = assessGuestCaptureBotSignals({ payload: cleanPayload(), headers: { origin: "https://evil.example" }, now: NOW });
  assert.deepEqual(foreign.reasons, ["origin_mismatch"]);
  const refererOnly = assessGuestCaptureBotSignals({ payload: cleanPayload(), headers: { referer: "https://evil.example/page" }, now: NOW });
  assert.deepEqual(refererOnly.reasons, ["origin_mismatch"]);
});

test("dot-stuffed Gmail local parts seen in the live audience are rejected; ordinary Gmail is not", () => {
  for (const email of [
    "b.e.r.ohiy.edo.6.20@gmail.com",
    "max.pa.go.ag.a3.5@gmail.com",
    "k.i.c.k.b.o.x.er.an.g.e.l2@googlemail.com"
  ]) {
    assert.deepEqual(assessGuestCaptureBotSignals({ payload: cleanPayload({ email }), headers: siteHeaders, now: NOW }).reasons, ["dot_stuffed_gmail"], email);
  }
  for (const email of ["jane.doe@gmail.com", "first.middle.last@gmail.com", "a.b.c.d@example.com"]) {
    assert.equal(assessGuestCaptureBotSignals({ payload: cleanPayload({ email }), headers: siteHeaders, now: NOW }).rejected, false, email);
  }
});

test("random-case single-token names are rejected; real names are not", () => {
  for (const name of ["mUjaxXCWuMTyQDTX", "RiykEmxgaWwNrFJaEwZOa"]) {
    assert.deepEqual(assessGuestCaptureBotSignals({ payload: cleanPayload({ name }), headers: siteHeaders, now: NOW }).reasons, ["random_case_name"], name);
  }
  for (const name of ["Sawyer", "Mary-Kate", "McDonald", "DeShawn", "Jean Luc Picard", "Rvfla"]) {
    assert.equal(assessGuestCaptureBotSignals({ payload: cleanPayload({ name }), headers: siteHeaders, now: NOW }).rejected, false, name);
  }
});

test("the capture handler returns 422 for a rejected submission and never reaches Mailchimp or the store", async () => {
  const previousFetch = global.fetch;
  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error("Mailchimp must not be called for a rejected submission");
  };
  const store = {
    async get() {
      throw new Error("store must not be read for a rejected submission");
    },
    async set() {
      throw new Error("store must not be written for a rejected submission");
    }
  };
  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        headers: { origin: "https://seascape-vacations.com" },
        body: JSON.stringify(cleanPayload({ trip_url: "filled-by-bot" }))
      },
      {},
      store
    );
    assert.equal(response.statusCode, 422);
    const body = JSON.parse(response.body);
    assert.deepEqual(body, { stored: false, tagged: false, captureState: CAPTURE_STATES.REJECTED, reason: "rejected" });
    assert.equal(fetchCalls, 0);
  } finally {
    global.fetch = previousFetch;
    if (previousApiKey === undefined) delete process.env.MAILCHIMP_API_KEY;
    else process.env.MAILCHIMP_API_KEY = previousApiKey;
    if (previousAudienceId === undefined) delete process.env.MAILCHIMP_AUDIENCE_ID;
    else process.env.MAILCHIMP_AUDIENCE_ID = previousAudienceId;
  }
});

test("every guest capture form carries the honeypot and the browser sends dwell time", () => {
  const forms = [
    "src/_includes/partials/email-popup.njk",
    "src/_includes/partials/guide-conversion-kit.njk",
    "src/index.njk"
  ];
  for (const relativePath of forms) {
    const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
    const formCount = (source.match(/data-inline-email-capture="true"/g) || []).length;
    const honeypotCount = (source.match(/name="trip_url"[^>]*data-guest-capture-honeypot/g) || []).length;
    assert.ok(formCount >= 1, `${relativePath} should contain a guest capture form`);
    assert.equal(honeypotCount, formCount, `${relativePath} should carry one honeypot per capture form`);
    assert.match(source, /tabindex="-1" autocomplete="off" aria-hidden="true" data-guest-capture-honeypot/);
  }
  const browser = fs.readFileSync(path.join(projectRoot, "src/assets/js/conversion-tracking.js"), "utf8");
  assert.match(browser, /formOpenedAt: form\.dataset\.guestCaptureOpenedAt \|\| ""/);
  assert.match(browser, /trip_url: formData\.get\("trip_url"\) \|\| ""/);
  assert.match(browser, /markInlineEmailFormsOpened\(\);/);
});
