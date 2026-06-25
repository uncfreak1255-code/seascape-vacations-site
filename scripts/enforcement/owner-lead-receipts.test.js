const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const {
  OWNER_LEAD_FORM_NAME,
  OWNER_LEAD_METRICS_KEY,
  buildOwnerLeadReceipt,
  mergeOwnerLeadMetrics,
  relabelOwnerLeadReceipts,
  formatOwnerLeadSummary,
  getOwnerLeadBlobsConfig,
  parseStoredMetrics,
  readAuthToken,
  readOwnerLeadMetrics
} = require("../../netlify/functions/_owner-lead-metrics");
const {
  handleSubmissionCreated
} = require("../../netlify/functions/submission-created");
const {
  handleOwnerLeadProofLabelRequest
} = require("../../netlify/functions/owner-lead-proof-label");

const projectRoot = path.resolve(__dirname, "..", "..");

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
      lead_type: "owner-revenue-teardown",
      proof_label: " Codex Owner Proof 2026 "
    }
  });

  assert.deepEqual(receipt, {
    submissionId: "submission-123",
    createdAt: "2026-05-12T12:00:00.000Z",
    formName: OWNER_LEAD_FORM_NAME,
    eventName: "owner_form_submit",
    pageSlug: "property-management",
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
    market: "florida-gulf-coast",
    leadType: "owner-revenue-teardown",
    proofLabel: "codex-owner-proof-2026"
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
  const proofLabelHandler = fs.readFileSync(
    path.join(projectRoot, "netlify", "functions", "owner-lead-proof-label.js"),
    "utf8"
  );
  const ownerLeadMetricsModule = require("../../netlify/functions/owner-lead-metrics");
  const submissionCreatedModule = require("../../netlify/functions/submission-created");
  const ownerLeadProofLabelModule = require("../../netlify/functions/owner-lead-proof-label");

  assert.equal(metricsHandler.includes("connectLambda(event);"), true);
  assert.equal(submissionHandler.includes("connectLambda(event);"), true);
  assert.equal(proofLabelHandler.includes("connectLambda(event);"), true);
  assert.equal(ownerLeadMetricsModule.handler.length, 2);
  assert.equal(ownerLeadMetricsModule.handleOwnerLeadMetricsRequest.length, 3);
  assert.equal(submissionCreatedModule.handler.length, 2);
  assert.equal(submissionCreatedModule.handleSubmissionCreated.length, 3);
  assert.equal(ownerLeadProofLabelModule.handler.length, 2);
  assert.equal(ownerLeadProofLabelModule.handleOwnerLeadProofLabelRequest.length, 3);
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

test("owner lead metrics keep source-page funnel counts without storing PII", () => {
  const clickReceipt = buildOwnerLeadReceipt({
    id: "event-click-1",
    created_at: "2026-05-12T11:50:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      event_name: "owner_primary_cta_click",
      page_slug: "property-management",
      source_page_slug: "owner-fee-revenue-leak-benchmark-2026",
      email: "owner@example.com",
      property_address: "123 Palm Ave"
    }
  });
  const startReceipt = buildOwnerLeadReceipt({
    id: "event-start-1",
    created_at: "2026-05-12T11:55:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      event_name: "owner_form_start",
      page_slug: "property-management",
      source_page_slug: "owner-fee-revenue-leak-benchmark-2026"
    }
  });
  const submitReceipt = buildOwnerLeadReceipt({
    id: "submission-1",
    created_at: "2026-05-12T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      event_name: "owner_form_submit",
      page_slug: "property-management",
      source_page_slug: "owner-fee-revenue-leak-benchmark-2026"
    }
  });

  const metrics = [clickReceipt, startReceipt, submitReceipt].reduce(
    (currentMetrics, receipt) => mergeOwnerLeadMetrics(currentMetrics, receipt),
    null
  );
  const summary = formatOwnerLeadSummary(metrics);

  assert.deepEqual(summary.funnelBySourcePageSlug["owner-fee-revenue-leak-benchmark-2026"], {
    owner_primary_cta_click: 1,
    owner_form_start: 1,
    owner_form_submit: 1
  });
  assert.equal(summary.totalSubmissions, 1);
  assert.equal(summary.totalEvents, 3);
  assert.equal(summary.receipts[0].eventName, "owner_primary_cta_click");
  assert.equal("email" in summary.receipts[0], false);
  assert.equal("property_address" in summary.receipts[0], false);
});

test("submission-created fails open when owner metrics storage is unavailable", async () => {
  const failingStore = {
    async get() {
      return null;
    },
    async set() {
      throw new Error("blob write failed");
    }
  };

  const response = await handleSubmissionCreated(
    {
      body: JSON.stringify({
        id: "submission-fail-open",
        created_at: "2026-05-12T12:00:00.000Z",
        form_name: OWNER_LEAD_FORM_NAME,
        data: {
          page_slug: "property-management",
          source_page_slug: "owner-fee-revenue-leak-benchmark-2026"
        }
      })
    },
    {},
    failingStore
  );
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.stored, false);
  assert.equal(body.reason, "metrics_write_failed");
  assert.equal(body.sourcePageSlug, "owner-fee-revenue-leak-benchmark-2026");
});

test("submission-created returns invalid_json and logs malformed request bodies", async () => {
  const errorLogs = patchConsoleMethod("error");

  try {
    const response = await handleSubmissionCreated(
      {
        body: "{not json"
      },
      undefined,
      {
        async get() {
          throw new Error("store should not be used");
        }
      }
    );

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), {
      stored: false,
      reason: "invalid_json"
    });
    assert.equal(errorLogs.calls.length, 1);
    assert.equal(errorLogs.calls[0][0], "owner_lead_invalid_json");
    assert.equal(errorLogs.calls[0][1].bodyLength, 9);
    assert.match(errorLogs.calls[0][1].message, /Unexpected token|Expected property name/);
  } finally {
    errorLogs.restore();
  }
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
        leadType: "owner-revenue-teardown",
        proofLabel: "codex-owner-proof-2026"
      }
    ]
  });

  assert.deepEqual(summary, {
    totalSubmissions: 1,
    totalEvents: 1,
    bySourcePageSlug: {
      "owner-fee-revenue-leak-benchmark-2026": 1
    },
    funnelBySourcePageSlug: {},
    receipts: [
      {
        submissionId: "submission-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        eventName: "owner_form_submit",
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown",
        proofLabel: "codex-owner-proof-2026"
      }
    ]
  });
});

test("owner lead receipt relabel helper applies a sanitized proof label only to requested submission ids", () => {
  const relabeled = relabelOwnerLeadReceipts(
    {
      totalSubmissions: 2,
      bySourcePageSlug: {
        "owner-fee-revenue-leak-benchmark-2026": 2
      },
      receipts: [
        {
          submissionId: "submission-1",
          createdAt: "2026-05-12T12:00:00.000Z",
          pageSlug: "property-management",
          sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
          market: "florida-gulf-coast",
          leadType: "owner-revenue-teardown"
        },
        {
          submissionId: "submission-2",
          createdAt: "2026-05-12T12:05:00.000Z",
          pageSlug: "property-management",
          sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
          market: "florida-gulf-coast",
          leadType: "owner-revenue-teardown"
        }
      ]
    },
    ["submission-2"],
    " Codex Owner Proof 2026 "
  );

  assert.equal(relabeled.updatedCount, 1);
  assert.deepEqual(relabeled.updatedSubmissionIds, ["submission-2"]);
  assert.equal(relabeled.metrics.receipts[0].proofLabel, undefined);
  assert.equal(relabeled.metrics.receipts[1].proofLabel, "codex-owner-proof-2026");
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

test("owner lead blobs config helper reads explicit server-side fallback credentials", () => {
  process.env.OWNER_LEAD_BLOBS_SITE_ID = "site-123";
  process.env.OWNER_LEAD_BLOBS_TOKEN = "token-abc";

  assert.deepEqual(getOwnerLeadBlobsConfig(), {
    name: "seascape-owner-leads",
    siteID: "site-123",
    token: "token-abc"
  });

  delete process.env.OWNER_LEAD_BLOBS_SITE_ID;
  delete process.env.OWNER_LEAD_BLOBS_TOKEN;
});

test("owner lead proof label handler requires auth and relabels the requested stored receipts", async () => {
  const warningLogs = patchConsoleMethod("warn");
  const infoLogs = patchConsoleMethod("log");
  let storedMetrics = JSON.stringify({
    totalSubmissions: 2,
    bySourcePageSlug: {
      "owner-fee-revenue-leak-benchmark-2026": 2
    },
    receipts: [
      {
        submissionId: "submission-1",
        createdAt: "2026-05-12T12:00:00.000Z",
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown"
      },
      {
        submissionId: "submission-2",
        createdAt: "2026-05-12T12:05:00.000Z",
        pageSlug: "property-management",
        sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
        market: "florida-gulf-coast",
        leadType: "owner-revenue-teardown"
      }
    ]
  });

  const mockStore = {
    async get() {
      return storedMetrics;
    },
    async set(_key, value) {
      storedMetrics = value;
    }
  };

  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";

  const unauthorized = await handleOwnerLeadProofLabelRequest(
    {
      httpMethod: "POST",
      headers: { authorization: "Bearer wrong-secret" },
      body: JSON.stringify({
        submissionIds: ["submission-1"],
        proofLabel: "Codex Owner Proof 2026"
      })
    },
    undefined,
    mockStore
  );

  const response = await handleOwnerLeadProofLabelRequest(
    {
      httpMethod: "POST",
      headers: { authorization: "Bearer owner-secret" },
      body: JSON.stringify({
        submissionIds: ["submission-1", "missing-id"],
        proofLabel: "Codex Owner Proof 2026"
      })
    },
    undefined,
    mockStore
  );

  delete process.env.OWNER_LEAD_METRICS_TOKEN;

  try {
    assert.equal(unauthorized.statusCode, 401);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body).updatedSubmissionIds, ["submission-1"]);
    const parsedMetrics = JSON.parse(storedMetrics);
    assert.equal(parsedMetrics.receipts[0].proofLabel, "codex-owner-proof-2026");
    assert.equal(parsedMetrics.receipts[1].proofLabel, undefined);
    assert.deepEqual(warningLogs.calls, [[
      "owner_lead_proof_label_unauthorized",
      { hasAuthToken: true }
    ]]);
    assert.deepEqual(infoLogs.calls, [[
      "owner_lead_proof_label_updated",
      {
        requestedSubmissionIdsCount: 2,
        updatedCount: 1
      }
    ]]);
  } finally {
    warningLogs.restore();
    infoLogs.restore();
  }
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
          proof_label: "Codex Owner Proof 2026",
          email: "hidden@example.com"
        }
      }
    })
  };
  const warningLogs = patchConsoleMethod("warn");

  try {
    const firstResponse = await handleSubmissionCreated(ownerEvent, undefined, mockStore);
    const duplicateResponse = await handleSubmissionCreated(ownerEvent, undefined, mockStore);
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
      undefined,
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
    const parsedMetrics = JSON.parse(storedMetrics);
    assert.equal(parsedMetrics.totalSubmissions, 1);
    assert.equal(parsedMetrics.receipts[0].sourcePageSlug, "owner-fee-revenue-leak-benchmark-2026");
    assert.equal(parsedMetrics.receipts[0].proofLabel, "codex-owner-proof-2026");
    assert.equal("email" in parsedMetrics.receipts[0], false);
    assert.deepEqual(warningLogs.calls, [[
      "owner_lead_payload_ignored",
      {
        formName: "newsletter-signup",
        hasSubmissionId: true
      }
    ]]);
  } finally {
    warningLogs.restore();
  }
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
  assert.equal(JSON.parse(storedMetrics).totalSubmissions, 1);
});

test("stored owner lead metrics parse only valid JSON payloads", () => {
  const metrics = {
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
  };

  assert.deepEqual(parseStoredMetrics(JSON.stringify(metrics)), metrics);
  assert.equal(parseStoredMetrics("[object Object]"), null);
});

test("owner lead metrics reader falls back safely when stored blob is malformed", async () => {
  const mockStore = {
    async get(_key, options) {
      if (options.type === "json") {
        throw new SyntaxError('"[object Object]" is not valid JSON');
      }

      return "[object Object]";
    }
  };

  assert.equal(await readOwnerLeadMetrics(mockStore), null);
});

test("owner lead metrics handler requires auth token and returns sanitized summary", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const metricsModulePath = require.resolve("../../netlify/functions/owner-lead-metrics");
  delete require.cache[metricsModulePath];
  const { handleOwnerLeadMetricsRequest } = require("../../netlify/functions/owner-lead-metrics");
  const warningLogs = patchConsoleMethod("warn");

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
    undefined,
    mockStore
  );
  const authorized = await handleOwnerLeadMetricsRequest(
    {
      httpMethod: "GET",
      headers: { authorization: "Bearer owner-secret" },
      queryStringParameters: null
    },
    undefined,
    mockStore
  );

  try {
    assert.equal(unauthorized.statusCode, 401);
    assert.equal(authorized.statusCode, 200);
    assert.deepEqual(JSON.parse(authorized.body), {
      totalSubmissions: 1,
      totalEvents: 1,
      bySourcePageSlug: {
        "owner-fee-revenue-leak-benchmark-2026": 1
      },
      funnelBySourcePageSlug: {},
      receipts: [
        {
          submissionId: "submission-1",
          createdAt: "2026-05-12T12:00:00.000Z",
          eventName: "owner_form_submit",
          pageSlug: "property-management",
          sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
          market: "florida-gulf-coast",
          leadType: "owner-revenue-teardown"
        }
      ]
    });
    assert.deepEqual(warningLogs.calls, [[
      "owner_lead_metrics_unauthorized",
      { hasAuthToken: false }
    ]]);
  } finally {
    warningLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
    delete require.cache[metricsModulePath];
  }
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
    totalEvents: 0,
    bySourcePageSlug: {},
    funnelBySourcePageSlug: {},
    receipts: []
  });

  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  delete require.cache[metricsModulePath];
});

test("owner lead metrics handler logs missing token configuration", async () => {
  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  const metricsModulePath = require.resolve("../../netlify/functions/owner-lead-metrics");
  delete require.cache[metricsModulePath];
  const { handleOwnerLeadMetricsRequest } = require("../../netlify/functions/owner-lead-metrics");
  const errorLogs = patchConsoleMethod("error");

  try {
    const response = await handleOwnerLeadMetricsRequest(
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
    assert.deepEqual(errorLogs.calls, [["owner_lead_metrics_token_missing"]]);
  } finally {
    errorLogs.restore();
    delete require.cache[metricsModulePath];
  }
});

test("owner lead proof label handler logs missing token configuration", async () => {
  delete process.env.OWNER_LEAD_METRICS_TOKEN;
  const errorLogs = patchConsoleMethod("error");

  try {
    const response = await handleOwnerLeadProofLabelRequest(
      {
        httpMethod: "POST",
        headers: {},
        body: JSON.stringify({
          submissionIds: ["submission-1"],
          proofLabel: "Codex Owner Proof 2026"
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
    assert.deepEqual(errorLogs.calls, [["owner_lead_proof_label_token_missing"]]);
  } finally {
    errorLogs.restore();
  }
});

test("owner lead proof label handler logs invalid payloads", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const warningLogs = patchConsoleMethod("warn");

  try {
    const response = await handleOwnerLeadProofLabelRequest(
      {
        httpMethod: "POST",
        headers: { authorization: "Bearer owner-secret" },
        body: JSON.stringify({ proofLabel: "Codex Owner Proof 2026" })
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
      "owner_lead_proof_label_invalid_payload",
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

test("owner lead proof label handler logs update failures", async () => {
  process.env.OWNER_LEAD_METRICS_TOKEN = "owner-secret";
  const errorLogs = patchConsoleMethod("error");

  try {
    await assert.rejects(
      handleOwnerLeadProofLabelRequest(
        {
          httpMethod: "POST",
          headers: { authorization: "Bearer owner-secret" },
          body: JSON.stringify({
            submissionIds: ["submission-1"],
            proofLabel: "Codex Owner Proof 2026"
          })
        },
        undefined,
        {
          async get() {
            return {
              totalSubmissions: 1,
              bySourcePageSlug: {
                "owner-fee-revenue-leak-benchmark-2026": 1
              },
              receipts: []
            };
          },
          async set() {
            throw new Error("owner proof label write failed");
          }
        }
      ),
      /owner proof label write failed/
    );

    assert.deepEqual(errorLogs.calls, [[
      "owner_lead_proof_label_update_failed",
      {
        requestedSubmissionIdsCount: 1,
        message: "owner proof label write failed"
      }
    ]]);
  } finally {
    errorLogs.restore();
    delete process.env.OWNER_LEAD_METRICS_TOKEN;
  }
});
