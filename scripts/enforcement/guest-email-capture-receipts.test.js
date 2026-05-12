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
  mergeGuestEmailCaptureMetrics,
  formatGuestEmailCaptureSummary,
  getGuestEmailCaptureBlobsConfig,
  parseStoredMetrics,
  readAuthToken,
  readGuestEmailCaptureMetrics
} = require("../../netlify/functions/_guest-email-capture-metrics");
const {
  handleGuestEmailCapture
} = require("../../netlify/functions/guest-email-capture");

const projectRoot = path.resolve(__dirname, "..", "..");

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
  assert.equal("email" in receipt, false);
  assert.equal("name" in receipt, false);
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
        placement: "inline"
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
        placement: "inline"
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

test("guest email capture stores sanitized metrics after a successful Mailchimp proxy call", async () => {
  let storedMetrics = null;
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
    async () => ({ ok: true, status: 200 })
  );

  assert.deepEqual(JSON.parse(response.body), {
    stored: true,
    totalCaptures: 1,
    pagePath: "/guides/bradenton-vs-sarasota/",
    placement: "inline"
  });

  const parsedMetrics = JSON.parse(storedMetrics);
  assert.equal(parsedMetrics.totalCaptures, 1);
  assert.equal(parsedMetrics.receipts[0].pagePath, "/guides/bradenton-vs-sarasota/");
  assert.equal("email" in parsedMetrics.receipts[0], false);
});

test("guest email capture returns invalid payload when name/email are missing", async () => {
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

  assert.equal(metricsHandler.includes("connectLambda(event);"), true);
  assert.equal(captureHandler.includes("connectLambda(event);"), true);
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
