const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const Module = require("module");

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "@netlify/blobs") {
    return {
      connectLambda() {},
      getStore() {
        return {
          async get() {
            return null;
          },
          async set() {}
        };
      }
    };
  }

  return originalLoad(request, parent, isMain);
};

const {
  GUEST_EMAIL_CAPTURE_FORM_NAME,
  GUEST_EMAIL_CAPTURE_METRICS_KEY,
  buildGuestEmailCaptureReceipt,
  buildGuestMailchimpEvent,
  buildGuestMailchimpTags,
  buildMailchimpSubscriberHash,
  deriveMailchimpAudienceId,
  deriveMailchimpServerPrefix,
  mergeGuestEmailCaptureMetrics,
  formatGuestEmailCaptureSummary,
  getGuestEmailCaptureBlobsConfig,
  parseStoredMetrics,
  readAuthToken,
  readGuestEmailCaptureMetrics,
  splitName,
  withMailchimpDelivery
} = require("../../netlify/functions/_guest-email-capture-metrics");
const {
  buildMailchimpConfig,
  handleGuestEmailCapture
} = require("../../netlify/functions/guest-email-capture");
const {
  handleGuestEmailCaptureMetricsRequest
} = require("../../netlify/functions/guest-email-capture-metrics");
const {
  handleGuestEmailCaptureProofLabelRequest
} = require("../../netlify/functions/guest-email-capture-proof-label");

const projectRoot = path.resolve(__dirname, "..", "..");

function restoreEnvValue(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

function patchConsoleMethod(methodName) {
  const original = console[methodName];
  const calls = [];
  console[methodName] = (...args) => {
    calls.push(args);
  };

  return {
    calls,
    restore() {
      console[methodName] = original;
    }
  };
}

test("guest capture helper strips PII and normalizes page fields", () => {
  const receipt = buildGuestEmailCaptureReceipt({
    name: "Sawyer Beck",
    email: "sawyer@example.com",
    pagePath: "https://seascape-vacations.com/guides/bradenton-vs-sarasota/",
    guideSlug: "bradenton-vs-sarasota",
    sourcePageSlug: "bradenton-vs-sarasota",
    market: "florida-gulf-coast",
    placement: "popup",
    createdAt: "2026-05-12T12:00:00.000Z"
  });

  assert.equal(receipt.formName, GUEST_EMAIL_CAPTURE_FORM_NAME);
  assert.equal(receipt.pagePath, "/guides/bradenton-vs-sarasota/");
  assert.equal(receipt.pageSlug, "bradenton-vs-sarasota");
  assert.equal(receipt.guideSlug, "bradenton-vs-sarasota");
  assert.equal(receipt.sourcePageSlug, "bradenton-vs-sarasota");
  assert.equal(receipt.placement, "popup");
  assert.equal(receipt.proofLabel, undefined);
  assert.equal("email" in receipt, false);
  assert.equal("name" in receipt, false);
});

test("guest capture helper builds Mailchimp-ready segmentation context", () => {
  const receipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-1",
    name: "Sawyer Beck",
    email: "sawyer@example.com",
    pagePath: "https://seascape-vacations.com/guides/bradenton-vs-sarasota/",
    guideSlug: "bradenton-vs-sarasota",
    sourcePageSlug: "bradenton-vs-sarasota",
    market: "florida-gulf-coast",
    placement: "popup",
    createdAt: "2026-05-12T12:00:00.000Z"
  });

  assert.deepEqual(splitName("Sawyer Beck"), {
    firstName: "Sawyer",
    lastName: "Beck"
  });
  assert.equal(deriveMailchimpServerPrefix("abc123-us6"), "us6");
  assert.equal(deriveMailchimpAudienceId(""), "95e5a594d1");
  assert.equal(buildMailchimpSubscriberHash("Sawyer@example.com"), "cb5448be66947681b58ce50db8c055ff");
  assert.deepEqual(buildGuestMailchimpTags(receipt), [
    "guest-capture",
    "guest-capture-form-email-capture",
    "guest-capture-source-site",
    "guest-capture-placement-popup",
    "guest-capture-market-florida-gulf-coast",
    "guest-capture-page-bradenton-vs-sarasota",
    "guest-capture-guide-bradenton-vs-sarasota"
  ]);
  assert.deepEqual(buildGuestMailchimpEvent(receipt), {
    name: "guest_email_capture",
    properties: {
      submissionId: "capture-1",
      formName: "email_capture",
      pagePath: "/guides/bradenton-vs-sarasota/",
      pageSlug: "bradenton-vs-sarasota",
      guideSlug: "bradenton-vs-sarasota",
      sourcePageSlug: "bradenton-vs-sarasota",
      market: "florida-gulf-coast",
      placement: "popup",
      createdAt: "2026-05-12T12:00:00.000Z"
    }
  });
});

test("guest capture helper preserves a sanitized proof label without storing PII", () => {
  const receipt = buildGuestEmailCaptureReceipt({
    name: "Sawyer Beck",
    email: "sawyer@example.com",
    pagePath: "/",
    placement: "popup",
    createdAt: "2026-05-12T12:00:00.000Z",
    proofLabel: "Codex Guest Proof 2026"
  });

  assert.equal(receipt.proofLabel, "codex-guest-proof-2026");
  assert.equal("email" in receipt, false);
  assert.equal("name" in receipt, false);
});

test("guest capture helper preserves sanitized utility context for reviewed proof loops", () => {
  const receipt = buildGuestEmailCaptureReceipt({
    name: "Sawyer Beck",
    email: "sawyer@example.com",
    pagePath: "/guides/best-time-visit-anna-maria-island/",
    guideSlug: "best-time-visit-anna-maria-island",
    placement: "inline",
    utilityMoment: "Guide Direct Booking Help",
    utilitySourceLabel: "guide_conversion_direct_booking_list",
    requestedValue: "Direct booking savings and local stay ideas",
    guestIntent: "Planning Gulf Coast stay",
    deliveryChannel: "Email",
    consentBasis: "Guest requested email follow-up",
    createdAt: "2026-05-12T12:00:00.000Z"
  });

  assert.deepEqual(receipt.utilityContext, {
    moment: "guide-direct-booking-help",
    sourceLabel: "guide-conversion-direct-booking-list",
    requestedValue: "Direct booking savings and local stay ideas",
    guestIntent: "Planning Gulf Coast stay",
    deliveryChannel: "email",
    consentBasis: "guest-requested-email-follow-up"
  });
  assert.equal("email" in receipt, false);
  assert.equal("name" in receipt, false);

  assert.equal(
    buildGuestMailchimpTags(receipt).includes("guest-capture-utility-guide-conversion-direct-booking-list"),
    true
  );
  assert.deepEqual(buildGuestMailchimpEvent(receipt).properties, {
    submissionId: receipt.submissionId,
    formName: "email_capture",
    pagePath: "/guides/best-time-visit-anna-maria-island/",
    pageSlug: "best-time-visit-anna-maria-island",
    guideSlug: "best-time-visit-anna-maria-island",
    sourcePageSlug: "best-time-visit-anna-maria-island",
    market: "florida-gulf-coast",
    placement: "inline",
    createdAt: "2026-05-12T12:00:00.000Z",
    utilityMoment: "guide-direct-booking-help",
    utilitySourceLabel: "guide-conversion-direct-booking-list",
    requestedValue: "Direct booking savings and local stay ideas",
    guestIntent: "Planning Gulf Coast stay",
    deliveryChannel: "email",
    consentBasis: "guest-requested-email-follow-up"
  });
});

test("guest capture helper returns null without a valid email payload", () => {
  assert.equal(
    buildGuestEmailCaptureReceipt({
      name: "Missing Email",
      pagePath: "/guides/example/"
    }),
    null
  );
});

test("guest capture metrics dedupe repeated submission ids and keep aggregates", () => {
  const firstReceipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-1",
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/guides/bradenton-vs-sarasota/",
    placement: "inline",
    createdAt: "2026-05-12T12:00:00.000Z"
  });
  const secondReceipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-2",
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/",
    placement: "popup",
    createdAt: "2026-05-12T13:00:00.000Z"
  });

  const firstMetrics = mergeGuestEmailCaptureMetrics(null, firstReceipt);
  const dedupedMetrics = mergeGuestEmailCaptureMetrics(firstMetrics, firstReceipt);
  const expandedMetrics = mergeGuestEmailCaptureMetrics(dedupedMetrics, secondReceipt);

  assert.equal(GUEST_EMAIL_CAPTURE_METRICS_KEY, "guest_email_capture_metrics_v1.json");
  assert.equal(expandedMetrics.totalCaptures, 2);
  assert.equal(expandedMetrics.byPagePath["/guides/bradenton-vs-sarasota/"], 1);
  assert.equal(expandedMetrics.byPagePath["/"], 1);
  assert.equal(expandedMetrics.byPlacement.inline, 1);
  assert.equal(expandedMetrics.byPlacement.popup, 1);
});

test("guest capture summary exposes only aggregate counts and sanitized receipts", () => {
  const summary = formatGuestEmailCaptureSummary({
    totalCaptures: 1,
    byPagePath: {
      "/guides/bradenton-vs-sarasota/": 1
    },
    byPlacement: {
      inline: 1
    },
    receipts: [
      {
        submissionId: "capture-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pagePath: "/guides/bradenton-vs-sarasota/",
        pageSlug: "bradenton-vs-sarasota",
        guideSlug: "bradenton-vs-sarasota",
        sourcePageSlug: "bradenton-vs-sarasota",
        market: "florida-gulf-coast",
        placement: "inline",
        proofLabel: "codex-guest-proof-2026",
        mailchimp: {
          mode: "marketing_api",
          eventName: "guest_email_capture",
          tags: ["guest-capture", "guest-capture-page-bradenton-vs-sarasota"],
          warnings: ["mailchimp_event_sync_failed"]
        }
      }
    ]
  });

  assert.deepEqual(summary, {
    totalCaptures: 1,
    byPagePath: {
      "/guides/bradenton-vs-sarasota/": 1
    },
    byPlacement: {
      inline: 1
    },
    receipts: [
      {
        submissionId: "capture-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pagePath: "/guides/bradenton-vs-sarasota/",
        pageSlug: "bradenton-vs-sarasota",
        guideSlug: "bradenton-vs-sarasota",
        sourcePageSlug: "bradenton-vs-sarasota",
        market: "florida-gulf-coast",
        placement: "inline",
        proofLabel: "codex-guest-proof-2026",
        mailchimp: {
          mode: "marketing-api",
          eventName: "guest_email_capture",
          tags: ["guest-capture", "guest-capture-page-bradenton-vs-sarasota"],
          warnings: ["mailchimp-event-sync-failed"]
        }
      }
    ]
  });
});

test("guest capture auth token reader accepts bearer header or query token", () => {
  assert.equal(
    readAuthToken({
      headers: { authorization: "Bearer secret-token" },
      queryStringParameters: null
    }),
    "secret-token"
  );
  assert.equal(
    readAuthToken({
      headers: {},
      queryStringParameters: { token: "query-token" }
    }),
    "query-token"
  );
});

test("guest capture blobs config helper reads explicit server-side fallback credentials", () => {
  process.env.GUEST_EMAIL_CAPTURE_BLOBS_SITE_ID = "site-123";
  process.env.GUEST_EMAIL_CAPTURE_BLOBS_TOKEN = "token-abc";

  assert.deepEqual(getGuestEmailCaptureBlobsConfig(), {
    name: "seascape-guest-email-captures",
    siteID: "site-123",
    token: "token-abc"
  });

  delete process.env.GUEST_EMAIL_CAPTURE_BLOBS_SITE_ID;
  delete process.env.GUEST_EMAIL_CAPTURE_BLOBS_TOKEN;
});

test("guest email capture stores sanitized metrics after a successful Mailchimp marketing API sync", async () => {
  let storedMetrics = null;
  const fetchCalls = [];
  const mockStore = {
    async get(key) {
      assert.equal(key, GUEST_EMAIL_CAPTURE_METRICS_KEY);
      return storedMetrics;
    },
    async set(key, value) {
      assert.equal(key, GUEST_EMAIL_CAPTURE_METRICS_KEY);
      storedMetrics = value;
    }
  };

  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;

  try {
    assert.deepEqual(buildMailchimpConfig(), {
      apiKey: "test-key-us6",
      serverPrefix: "us6",
      audienceId: "95e5a594d1"
    });

    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/guides/bradenton-vs-sarasota/",
          guideSlug: "bradenton-vs-sarasota",
          sourcePageSlug: "bradenton-vs-sarasota",
          market: "florida-gulf-coast",
          placement: "inline",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      mockStore,
      async (url, options = {}) => {
        fetchCalls.push({
          url: String(url),
          method: options.method || "GET",
          body: options.body ? JSON.parse(options.body) : null
        });

        const parsed = new URL(url);
        if (parsed.pathname.endsWith("/events") || parsed.pathname.endsWith("/tags")) {
          return {
            ok: true,
            status: 204,
            async text() {
              return "";
            }
          };
        }

        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: "member-1" });
          }
        };
      }
    );

    assert.deepEqual(JSON.parse(response.body), {
      stored: true,
      tagged: true,
      totalCaptures: 1,
      pagePath: "/guides/bradenton-vs-sarasota/",
      placement: "inline",
      deliveryMode: "marketing_api"
    });

    const parsedMetrics = JSON.parse(storedMetrics);
    assert.equal(parsedMetrics.totalCaptures, 1);
    assert.equal(parsedMetrics.receipts[0].pagePath, "/guides/bradenton-vs-sarasota/");
    assert.equal(parsedMetrics.receipts[0].mailchimp.mode, "marketing-api");
    assert.equal(parsedMetrics.receipts[0].mailchimp.eventName, "guest_email_capture");
    assert.equal(parsedMetrics.receipts[0].mailchimp.tags.includes("guest-capture-page-bradenton-vs-sarasota"), true);
    assert.equal("email" in parsedMetrics.receipts[0], false);
    assert.deepEqual(
      fetchCalls.map((call) => call.method),
      ["PUT", "POST", "POST"]
    );
    assert.equal(
      fetchCalls[0].url,
      "https://us6.api.mailchimp.com/3.0/lists/95e5a594d1/members/cb5448be66947681b58ce50db8c055ff"
    );
    assert.deepEqual(fetchCalls[1].body, {
      tags: [
        { name: "guest-capture", status: "active" },
        { name: "guest-capture-form-email-capture", status: "active" },
        { name: "guest-capture-source-site", status: "active" },
        { name: "guest-capture-placement-inline", status: "active" },
        { name: "guest-capture-market-florida-gulf-coast", status: "active" },
        { name: "guest-capture-page-bradenton-vs-sarasota", status: "active" },
        { name: "guest-capture-guide-bradenton-vs-sarasota", status: "active" }
      ]
    });
    assert.equal(fetchCalls[2].body.name, "guest_email_capture");
  } finally {
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture fails closed when marketing API credentials are missing", async () => {
  let storeTouched = false;
  const errors = [];
  const originalError = console.error;
  const mockStore = {
    async get() {
      storeTouched = true;
      return null;
    },
    async set() {
      storeTouched = true;
    }
  };

  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  delete process.env.MAILCHIMP_API_KEY;
  delete process.env.MAILCHIMP_AUDIENCE_ID;
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;
  console.error = function patchedError(label, payload) {
    errors.push({ label, payload });
  };

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      mockStore,
      async () => {
        assert.fail("untagged legacy Mailchimp form must not be used");
      }
    );

    assert.equal(response.statusCode, 502);
    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      tagged: false,
      pagePath: "/",
      placement: "popup",
      deliveryMode: null,
      reason: "marketing_api_unconfigured"
    });
    assert.equal(storeTouched, false);
    assert.equal(errors.some((entry) => entry.label === "marketing_api_unconfigured"), true);
    assert.equal(errors.some((entry) => entry.label === "guest_capture_mailchimp_incomplete"), true);
  } finally {
    console.error = originalError;
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture fails closed when marketing API submit fails", async () => {
  let storedMetrics = null;
  const errors = [];
  const fetchCalls = [];
  const originalError = console.error;
  const mockStore = {
    async get() {
      return storedMetrics;
    },
    async set(_key, value) {
      storedMetrics = value;
    }
  };

  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;
  console.error = function patchedError(label, payload) {
    errors.push({ label, payload });
  };

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      mockStore,
      async (url) => {
        fetchCalls.push({ url: String(url), method: "PUT" });
        assert.match(String(url), /api\.mailchimp\.com/);
        assert.doesNotMatch(String(url), /list-manage\.com/);
        return {
          ok: false,
          status: 503
        };
      }
    );

    assert.equal(response.statusCode, 502);
    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      tagged: false,
      pagePath: "/",
      placement: "popup",
      deliveryMode: null,
      reason: "marketing_api_submit_failed"
    });
    assert.equal(storedMetrics, null);
    assert.deepEqual(fetchCalls.map((call) => call.method), ["PUT"]);
    assert.equal(errors.some((entry) => entry.label === "marketing_api_submit_failed"), true);
    assert.equal(errors.some((entry) => entry.label === "guest_capture_mailchimp_incomplete"), true);
  } finally {
    console.error = originalError;
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture persists tag failure without claiming tagged success", async () => {
  let storedMetrics = null;
  const errors = [];
  const originalError = console.error;
  const mockStore = {
    async get() {
      return storedMetrics;
    },
    async set(_key, value) {
      storedMetrics = value;
    }
  };

  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;
  console.error = function patchedError(label, payload) {
    errors.push({ label, payload });
  };

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      mockStore,
      async (url) => {
        const parsed = new URL(url);
        if (parsed.pathname.endsWith("/tags")) {
          return {
            ok: false,
            status: 500,
            async text() {
              return JSON.stringify({ detail: "tag sync failed" });
            }
          };
        }
        if (parsed.pathname.endsWith("/events")) {
          return {
            ok: true,
            status: 204,
            async text() {
              return "";
            }
          };
        }
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: "member-1" });
          }
        };
      }
    );

    assert.equal(response.statusCode, 502);
    assert.deepEqual(JSON.parse(response.body), {
      stored: true,
      tagged: false,
      totalCaptures: 1,
      pagePath: "/",
      placement: "popup",
      deliveryMode: "marketing_api",
      reason: "mailchimp_tags_sync_failed"
    });

    const parsedMetrics = JSON.parse(storedMetrics);
    assert.equal(parsedMetrics.receipts[0].mailchimp.mode, "marketing-api");
    assert.deepEqual(parsedMetrics.receipts[0].mailchimp.warnings, ["mailchimp-tags-sync-failed"]);
    assert.equal("tags" in parsedMetrics.receipts[0].mailchimp, false);
    assert.equal(errors.some((entry) => entry.label === "mailchimp_tags_sync_failed"), true);
    assert.equal(errors.some((entry) => entry.label === "guest_capture_tagging_incomplete"), true);
  } finally {
    console.error = originalError;
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest capture relabel updates only matching submission ids", () => {
  const firstReceipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-1",
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/",
    placement: "popup",
    createdAt: "2026-05-12T12:00:00.000Z"
  });
  const secondReceipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-2",
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/guides/bradenton-vs-sarasota/",
    placement: "inline",
    createdAt: "2026-05-12T13:00:00.000Z"
  });

  const initialMetrics = mergeGuestEmailCaptureMetrics(
    mergeGuestEmailCaptureMetrics(null, firstReceipt),
    secondReceipt
  );

  const {
    relabelGuestEmailCaptureReceipts
  } = require("../../netlify/functions/_guest-email-capture-metrics");
  const relabeled = relabelGuestEmailCaptureReceipts(
    initialMetrics,
    ["capture-2"],
    "Codex Guest Proof 2026"
  );

  assert.equal(relabeled.updatedCount, 1);
  assert.equal(relabeled.metrics.receipts[0].proofLabel, undefined);
  assert.equal(relabeled.metrics.receipts[1].proofLabel, "codex-guest-proof-2026");
});

test("guest capture mailchimp delivery metadata is sanitized before storage", () => {
  const receipt = buildGuestEmailCaptureReceipt({
    submissionId: "capture-3",
    name: "Sawyer",
    email: "sawyer@example.com",
    pagePath: "/",
    placement: "popup",
    createdAt: "2026-05-12T12:00:00.000Z"
  });

  const enriched = withMailchimpDelivery(receipt, {
    mode: "marketing_api",
    eventName: "guest_email_capture",
    tags: ["Guest Capture", "guest-capture", "guest capture"],
    warnings: ["mailchimp_event_sync_failed", "mailchimp event sync failed"]
  });

  assert.deepEqual(enriched.mailchimp, {
    mode: "marketing-api",
    eventName: "guest_email_capture",
    tags: ["guest-capture"],
    warnings: ["mailchimp-event-sync-failed"]
  });
});

test("guest email capture returns invalid payload when name/email are missing", async () => {
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          pagePath: "/guides/bradenton-vs-sarasota/"
        })
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      },
      async () => ({ ok: true, status: 200 })
    );

    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      reason: "invalid_payload"
    });
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_invalid_payload",
      {
        hasPagePath: true,
        hasPlacement: false,
        hasSourcePageSlug: false,
        hasName: false,
        hasEmail: false
      }
    ]]);
  } finally {
    warningLogs.restore();
  }
});

test("guest email capture logs method mismatches before returning 405", async () => {
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "GET",
        body: ""
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      },
      async () => ({ ok: true, status: 200 })
    );

    assert.equal(response.statusCode, 405);
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_method_not_allowed",
      { httpMethod: "GET" }
    ]]);
  } finally {
    warningLogs.restore();
  }
});

test("guest email capture rejects malformed json before touching the store", async () => {
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: "{not json"
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      },
      async () => ({ ok: true, status: 200 })
    );

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), {
      error: "invalid_json"
    });
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_invalid_json",
      { bodyLength: 9 }
    ]]);
  } finally {
    warningLogs.restore();
  }
});

test("guest email capture does not use untagged legacy Mailchimp form when marketing API is unconfigured", async () => {
  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const errorLogs = patchConsoleMethod("error");
  delete process.env.MAILCHIMP_API_KEY;
  delete process.env.MAILCHIMP_AUDIENCE_ID;
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup"
        })
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      },
      async () => {
        assert.fail("legacy list-manage form must not be called");
      }
    );

    assert.equal(response.statusCode, 502);
    assert.equal(JSON.parse(response.body).reason, "marketing_api_unconfigured");
    assert.equal(JSON.parse(response.body).tagged, false);
    assert.equal(
      errorLogs.calls.some((entry) => entry[0] === "marketing_api_unconfigured"),
      true
    );
  } finally {
    errorLogs.restore();
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture returns stored false when metrics write fails after Mailchimp success", async () => {
  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const originalConsoleError = console.error;
  const consoleErrors = [];
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;
  console.error = (...args) => {
    consoleErrors.push(args);
  };

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      {
        async get() {
          return null;
        },
        async set() {
          throw new Error("blob write failed");
        }
      },
      async (url, options = {}) => {
        const parsed = new URL(url);
        if (parsed.pathname.endsWith("/events") || parsed.pathname.endsWith("/tags")) {
          return {
            ok: true,
            status: 204,
            async text() {
              return "";
            }
          };
        }

        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: "member-1" });
          }
        };
      }
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      tagged: true,
      pagePath: "/",
      placement: "popup",
      deliveryMode: "marketing_api"
    });
    assert.equal(consoleErrors.length > 0, true);
    assert.equal(consoleErrors[0][0], "guest_capture_metrics_write_failed");
  } finally {
    console.error = originalConsoleError;
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture returns stored false when metrics read fails after Mailchimp success", async () => {
  const previousApiKey = process.env.MAILCHIMP_API_KEY;
  const previousAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const previousAudienceIds = process.env.MAILCHIMP_AUDIENCE_IDS;
  const previousServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const originalConsoleError = console.error;
  const consoleErrors = [];
  process.env.MAILCHIMP_API_KEY = "test-key-us6";
  process.env.MAILCHIMP_AUDIENCE_ID = "95e5a594d1";
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  delete process.env.MAILCHIMP_SERVER_PREFIX;
  console.error = (...args) => {
    consoleErrors.push(args);
  };

  try {
    const response = await handleGuestEmailCapture(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          name: "Sawyer",
          email: "sawyer@example.com",
          pagePath: "/",
          placement: "popup",
          createdAt: "2026-05-12T12:00:00.000Z"
        })
      },
      undefined,
      {
        async get() {
          throw new Error("blob read failed");
        },
        async set() {
          throw new Error("store write should not run");
        }
      },
      async (url) => {
        const parsed = new URL(url);
        if (parsed.pathname.endsWith("/events") || parsed.pathname.endsWith("/tags")) {
          return {
            ok: true,
            status: 204,
            async text() {
              return "";
            }
          };
        }

        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: "member-1" });
          }
        };
      }
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      tagged: true,
      pagePath: "/",
      placement: "popup",
      deliveryMode: "marketing_api"
    });
    assert.equal(consoleErrors.length > 0, true);
    assert.equal(consoleErrors[0][0], "guest_capture_metrics_write_failed");
  } finally {
    console.error = originalConsoleError;
    restoreEnvValue("MAILCHIMP_API_KEY", previousApiKey);
    restoreEnvValue("MAILCHIMP_AUDIENCE_ID", previousAudienceId);
    restoreEnvValue("MAILCHIMP_AUDIENCE_IDS", previousAudienceIds);
    restoreEnvValue("MAILCHIMP_SERVER_PREFIX", previousServerPrefix);
  }
});

test("guest email capture metrics endpoint initializes blobs lambda compatibility before calling getStore", () => {
  const metricsHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "guest-email-capture-metrics.js"),
    "utf8"
  );
  const captureHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "guest-email-capture.js"),
    "utf8"
  );
  const proofLabelHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "guest-email-capture-proof-label.js"),
    "utf8"
  );
  const guestEmailCaptureMetricsModule = require("../../netlify/functions/guest-email-capture-metrics");
  const guestEmailCaptureModule = require("../../netlify/functions/guest-email-capture");
  const guestEmailCaptureProofLabelModule = require("../../netlify/functions/guest-email-capture-proof-label");

  assert.equal(metricsHandler.includes("connectLambda(event);"), true);
  assert.equal(captureHandler.includes("connectLambda(event);"), true);
  assert.equal(proofLabelHandler.includes("connectLambda(event);"), true);
  assert.equal(guestEmailCaptureMetricsModule.handler.length, 2);
  assert.equal(handleGuestEmailCaptureMetricsRequest.length, 3);
  assert.equal(guestEmailCaptureModule.handler.length, 2);
  assert.equal(handleGuestEmailCapture.length, 4);
  assert.equal(guestEmailCaptureProofLabelModule.handler.length, 2);
  assert.equal(handleGuestEmailCaptureProofLabelRequest.length, 3);
});

test("guest capture metrics are readable from stored JSON strings", async () => {
  const storedMetrics = JSON.stringify({
    totalCaptures: 1,
    byPagePath: { "/": 1 },
    byPlacement: { popup: 1 },
    receipts: [
      {
        submissionId: "capture-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pagePath: "/",
        pageSlug: "home",
        guideSlug: "",
        sourcePageSlug: "home",
        market: "florida-gulf-coast",
        placement: "popup"
      }
    ]
  });

  const metrics = await readGuestEmailCaptureMetrics({
    async get(_key, options) {
      return options.type === "json" ? JSON.parse(storedMetrics) : storedMetrics;
    }
  });

  assert.equal(parseStoredMetrics(storedMetrics).totalCaptures, 1);
  assert.equal(metrics.totalCaptures, 1);
  assert.equal(metrics.receipts[0].pageSlug, "home");
});

test("guest capture metrics endpoint falls back to the owner metrics token", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  delete process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN;

  const metricsModulePath = require.resolve("../../netlify/functions/guest-email-capture-metrics");
  delete require.cache[metricsModulePath];
  const { handleGuestEmailCaptureMetricsRequest } = require("../../netlify/functions/guest-email-capture-metrics");

  const response = await handleGuestEmailCaptureMetricsRequest(
    {
      httpMethod: "GET",
      headers: { authorization: "Bearer owner-secret" }
    },
    undefined,
    {
      async get() {
        return {
          totalCaptures: 0,
          byPagePath: {},
          byPlacement: {},
          receipts: []
        };
      }
    }
  );

  assert.equal(response.statusCode, 200);
  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete require.cache[metricsModulePath];
});

test("guest capture metrics endpoint logs missing token configuration", async () => {
  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN;

  const metricsModulePath = require.resolve("../../netlify/functions/guest-email-capture-metrics");
  delete require.cache[metricsModulePath];
  const { handleGuestEmailCaptureMetricsRequest } = require("../../netlify/functions/guest-email-capture-metrics");
  const errorLogs = patchConsoleMethod("error");

  try {
    const response = await handleGuestEmailCaptureMetricsRequest(
      {
        httpMethod: "GET",
        headers: {}
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 503);
    assert.deepEqual(errorLogs.calls, [["guest_capture_metrics_token_missing"]]);
  } finally {
    errorLogs.restore();
    delete require.cache[metricsModulePath];
  }
});

test("guest capture metrics endpoint logs unauthorized reads", async () => {
  process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN = "guest-secret";

  const metricsModulePath = require.resolve("../../netlify/functions/guest-email-capture-metrics");
  delete require.cache[metricsModulePath];
  const { handleGuestEmailCaptureMetricsRequest } = require("../../netlify/functions/guest-email-capture-metrics");
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCaptureMetricsRequest(
      {
        httpMethod: "GET",
        headers: {}
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 401);
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_metrics_unauthorized",
      { hasAuthToken: false }
    ]]);
  } finally {
    warningLogs.restore();
    delete process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN;
    delete require.cache[metricsModulePath];
  }
});

test("guest capture proof-label endpoint logs invalid payloads", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCaptureProofLabelRequest(
      {
        httpMethod: "POST",
        headers: { authorization: "Bearer owner-secret" },
        body: JSON.stringify({ proofLabel: "Codex Guest Proof 2026" })
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), {
      updated: false,
      reason: "invalid_payload"
    });
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_proof_label_invalid_payload",
      {
        requestedSubmissionIdsCount: 0,
        hasProofLabel: true
      }
    ]]);
  } finally {
    warningLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
  }
});

test("guest capture proof-label endpoint logs missing token configuration", async () => {
  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN;
  const errorLogs = patchConsoleMethod("error");

  try {
    const response = await handleGuestEmailCaptureProofLabelRequest(
      {
        httpMethod: "POST",
        headers: {},
        body: JSON.stringify({
          submissionIds: ["capture-1"],
          proofLabel: "Codex Guest Proof 2026"
        })
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 503);
    assert.deepEqual(errorLogs.calls, [["guest_capture_proof_label_token_missing"]]);
  } finally {
    errorLogs.restore();
  }
});

test("guest capture proof-label endpoint logs unauthorized writes", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleGuestEmailCaptureProofLabelRequest(
      {
        httpMethod: "POST",
        headers: { authorization: "Bearer wrong-secret" },
        body: JSON.stringify({
          submissionIds: ["capture-1"],
          proofLabel: "Codex Guest Proof 2026"
        })
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        },
        async set() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 401);
    assert.deepEqual(warningLogs.calls, [[
      "guest_capture_proof_label_unauthorized",
      { hasAuthToken: true }
    ]]);
  } finally {
    warningLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
  }
});

test("guest capture proof-label endpoint relabels matching receipts behind owner token fallback", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const infoLogs = patchConsoleMethod("log");

  try {
    const response = await handleGuestEmailCaptureProofLabelRequest(
      {
        httpMethod: "POST",
        headers: { authorization: "Bearer owner-secret" },
        body: JSON.stringify({
          submissionIds: ["capture-1"],
          proofLabel: "Codex Guest Proof 2026"
        })
      },
      undefined,
      {
        async get() {
          return {
            totalCaptures: 1,
            byPagePath: { "/": 1 },
            byPlacement: { popup: 1 },
            receipts: [
              {
                submissionId: "capture-1",
                createdAt: "2026-05-12T12:00:00.000Z",
                pagePath: "/",
                pageSlug: "home",
                guideSlug: "",
                sourcePageSlug: "home",
                market: "florida-gulf-coast",
                placement: "popup"
              }
            ]
          };
        },
        async set() {}
      }
    );

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(body.updated, true);
    assert.equal(body.updatedCount, 1);
    assert.equal(body.summary.receipts[0].proofLabel, "codex-guest-proof-2026");
    assert.deepEqual(infoLogs.calls, [[
      "guest_capture_proof_label_updated",
      {
        requestedSubmissionIdsCount: 1,
        updatedCount: 1
      }
    ]]);
  } finally {
    infoLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
  }
});

test("guest capture proof-label endpoint logs update failures", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const errorLogs = patchConsoleMethod("error");

  try {
    await assert.rejects(
      handleGuestEmailCaptureProofLabelRequest(
        {
          httpMethod: "POST",
          headers: { authorization: "Bearer owner-secret" },
          body: JSON.stringify({
            submissionIds: ["capture-1"],
            proofLabel: "Codex Guest Proof 2026"
          })
        },
        undefined,
        {
          async get() {
            return {
              totalCaptures: 1,
              byPagePath: { "/": 1 },
              byPlacement: { popup: 1 },
              receipts: []
            };
          },
          async set() {
            throw new Error("guest proof label write failed");
          }
        }
      ),
      /guest proof label write failed/
    );

    assert.deepEqual(errorLogs.calls, [[
      "guest_capture_proof_label_update_failed",
      {
        requestedSubmissionIdsCount: 1,
        message: "guest proof label write failed"
      }
    ]]);
  } finally {
    errorLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
  }
});
