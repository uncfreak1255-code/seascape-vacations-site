const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const {
  OWNER_LEAD_FORM_NAME,
  OWNER_LEAD_METRICS_KEY,
  buildOwnerLeadReceipt,
  mergeOwnerLeadMetrics,
  formatOwnerLeadSummary,
  readAuthToken
} = require("../../netlify/functions/_owner-lead-metrics");
const {
  handleSubmissionCreated
} = require("../../netlify/functions/submission-created");

const projectRoot = path.resolve(__dirname, "..", "..");

test("owner lead helper only accepts the owner revenue review form and strips PII", () => {
  const receipt = buildOwnerLeadReceipt({
    id: "submission-123",
    created_at: "2026-05-12T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      name: "Sawyer Beck",
      email: "sawyer@example.com",
      phone: "555-555-5555",
      property_address: "123 Palm Ave",
      page_slug: "property-management",
      source_page_slug: "owner-fee-revenue-leak-benchmark-2026",
      market: "florida-gulf-coast",
      lead_type: "owner-revenue-teardown"
    }
  });

  assert.deepEqual(receipt, {
    submissionId: "submission-123",
    createdAt: "2026-05-12T12:00:00.000Z",
    formName: OWNER_LEAD_FORM_NAME,
    pageSlug: "property-management",
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
    market: "florida-gulf-coast",
    leadType: "owner-revenue-teardown"
  });
  assert.equal("email" in receipt, false);
  assert.equal("name" in receipt, false);
  assert.equal("property_address" in receipt, false);
});

test("owner lead Netlify handlers initialize blobs lambda compatibility before calling getStore", () => {
  const metricsHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "owner-lead-metrics.js"),
    "utf8"
  );
  const submissionHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "submission-created.js"),
    "utf8"
  );

  assert.equal(metricsHandler.includes("connectLambda(event);"), true);
  assert.equal(submissionHandler.includes("connectLambda(event);"), true);
});

test("owner lead helper ignores non-owner forms", () => {
  assert.equal(
    buildOwnerLeadReceipt({
      id: "submission-999",
      form_name: "newsletter-signup",
      created_at: "2026-05-12T12:00:00.000Z",
      data: { email: "guest@example.com" }
    }),
    null
  );
});

test("owner lead metrics dedupe repeated submission ids and keep source totals", () => {
  const firstReceipt = buildOwnerLeadReceipt({
    id: "submission-1",
    created_at: "2026-05-12T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      page_slug: "property-management",
      source_page_slug: "owner-fee-revenue-leak-benchmark-2026",
      market: "florida-gulf-coast",
      lead_type: "owner-revenue-teardown"
    }
  });
  const secondReceipt = buildOwnerLeadReceipt({
    id: "submission-2",
    created_at: "2026-05-12T13:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      page_slug: "property-management",
      source_page_slug: "property-management",
      market: "florida-gulf-coast",
      lead_type: "owner-revenue-teardown"
    }
  });

  const emptyMetrics = mergeOwnerLeadMetrics(null, firstReceipt);
  const dedupedMetrics = mergeOwnerLeadMetrics(emptyMetrics, firstReceipt);
  const expandedMetrics = mergeOwnerLeadMetrics(dedupedMetrics, secondReceipt);

  assert.equal(OWNER_LEAD_METRICS_KEY, "owner_lead_metrics_v1.json");
  assert.equal(expandedMetrics.totalSubmissions, 2);
  assert.equal(expandedMetrics.bySourcePageSlug["owner-fee-revenue-leak-benchmark-2026"], 1);
  assert.equal(expandedMetrics.bySourcePageSlug["property-management"], 1);
  assert.deepEqual(expandedMetrics.receipts.map((receipt) => receipt.submissionId), [
    "submission-1",
    "submission-2"
  ]);
});

test("owner lead summary exposes only aggregate counts and sanitized receipts", () => {
  const summary = formatOwnerLeadSummary({
    totalSubmissions: 1,
    bySourcePageSlug: {
      "owner-fee-revenue-leak-benchmark-2026": 1
    },
    receipts: [
      {
        submissionId: "submission-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        formName: OWNER_LEAD_FORM_NAME,
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown"
      }
    ]
  });

  assert.deepEqual(summary, {
    totalSubmissions: 1,
    bySourcePageSlug: {
      "owner-fee-revenue-leak-benchmark-2026": 1
    },
    receipts: [
      {
        submissionId: "submission-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown"
      }
    ]
  });
});

test("owner lead auth token reader accepts bearer header or query token", () => {
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

test("submission-created stores sanitized owner lead metrics and ignores duplicates", async () => {
  let storedMetrics = null;
  const mockStore = {
    async get(key) {
      assert.equal(key, OWNER_LEAD_METRICS_KEY);
      return storedMetrics;
    },
    async set(key, value) {
      assert.equal(key, OWNER_LEAD_METRICS_KEY);
      storedMetrics = value;
    }
  };

  const ownerEvent = {
    body: JSON.stringify({
      payload: {
        id: "submission-1",
        created_at: "2026-05-12T12:00:00.000Z",
        form_name: OWNER_LEAD_FORM_NAME,
        data: {
          page_slug: "property-management",
          source_page_slug: "owner-fee-revenue-leak-benchmark-2026",
          market: "florida-gulf-coast",
          lead_type: "owner-revenue-teardown",
          email: "hidden@example.com"
        }
      }
    })
  };

  const firstResponse = await handleSubmissionCreated(ownerEvent, mockStore);
  const duplicateResponse = await handleSubmissionCreated(ownerEvent, mockStore);
  const ignoredResponse = await handleSubmissionCreated(
    {
      body: JSON.stringify({
        payload: {
          id: "submission-2",
          form_name: "newsletter-signup",
          created_at: "2026-05-12T13:00:00.000Z",
          data: { email: "guest@example.com" }
        }
      })
    },
    mockStore
  );

  assert.deepEqual(JSON.parse(firstResponse.body), {
    stored: true,
    totalSubmissions: 1,
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026"
  });
  assert.deepEqual(JSON.parse(duplicateResponse.body), {
    stored: true,
    totalSubmissions: 1,
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026"
  });
  assert.deepEqual(JSON.parse(ignoredResponse.body), {
    stored: false,
    reason: "ignored_form"
  });
  assert.equal(storedMetrics.totalSubmissions, 1);
  assert.equal(storedMetrics.receipts[0].sourcePageSlug, "owner-fee-revenue-leak-benchmark-2026");
  assert.equal("email" in storedMetrics.receipts[0], false);
});

test("submission-created ignores the Netlify context object and still uses an injected mock store when provided separately", async () => {
  let storedMetrics = null;
  const mockStore = {
    async get() {
      return storedMetrics;
    },
    async set(_key, value) {
      storedMetrics = value;
    }
  };

  const response = await handleSubmissionCreated(
    {
      body: JSON.stringify({
        payload: {
          id: "submission-context",
          created_at: "2026-05-12T12:00:00.000Z",
          form_name: OWNER_LEAD_FORM_NAME,
          data: {
            page_slug: "property-management",
            source_page_slug: "owner-fee-revenue-leak-benchmark-2026"
          }
        }
      })
    },
    { account: { slug: "seascape" } },
    mockStore
  );

  assert.equal(response.statusCode, 200);
  assert.equal(storedMetrics.totalSubmissions, 1);
});

test("owner lead metrics handler requires auth token and returns sanitized summary", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const metricsModulePath = require.resolve("../../netlify/functions/owner-lead-metrics");
  delete require.cache[metricsModulePath];
  const { handleOwnerLeadMetricsRequest } = require("../../netlify/functions/owner-lead-metrics");

  const mockStore = {
    async get(key) {
      assert.equal(key, OWNER_LEAD_METRICS_KEY);
      return {
        totalSubmissions: 1,
        bySourcePageSlug: {
          "owner-fee-revenue-leak-benchmark-2026": 1
        },
        receipts: [
          {
            submissionId: "submission-1",
            createdAt: "2026-05-12T12:00:00.000Z",
            formName: OWNER_LEAD_FORM_NAME,
            pageSlug: "property-management",
            sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
            market: "florida-gulf-coast",
            leadType: "owner-revenue-teardown"
          }
        ]
      };
    }
  };

  const unauthorized = await handleOwnerLeadMetricsRequest(
    { httpMethod: "GET", headers: {}, queryStringParameters: null },
    mockStore
  );
  const authorized = await handleOwnerLeadMetricsRequest(
    {
      httpMethod: "GET",
      headers: { authorization: "Bearer owner-secret" },
      queryStringParameters: null
    },
    mockStore
  );

  assert.equal(unauthorized.statusCode, 401);
  assert.equal(authorized.statusCode, 200);
  assert.deepEqual(JSON.parse(authorized.body), {
    totalSubmissions: 1,
    bySourcePageSlug: {
      "owner-fee-revenue-leak-benchmark-2026": 1
    },
    receipts: [
      {
        submissionId: "submission-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown"
      }
    ]
  });

  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete require.cache[metricsModulePath];
});

test("owner lead metrics handler ignores Netlify context objects and still honors an injected mock store", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const metricsModulePath = require.resolve("../../netlify/functions/owner-lead-metrics");
  delete require.cache[metricsModulePath];
  const { handleOwnerLeadMetricsRequest } = require("../../netlify/functions/owner-lead-metrics");

  const mockStore = {
    async get() {
      return {
        totalSubmissions: 0,
        bySourcePageSlug: {},
        receipts: []
      };
    }
  };

  const response = await handleOwnerLeadMetricsRequest(
    {
      httpMethod: "GET",
      headers: { authorization: "Bearer owner-secret" },
      queryStringParameters: null
    },
    { site: { name: "cozy-licorice-e83928" } },
    mockStore
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    totalSubmissions: 0,
    bySourcePageSlug: {},
    receipts: []
  });

  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete require.cache[metricsModulePath];
});
