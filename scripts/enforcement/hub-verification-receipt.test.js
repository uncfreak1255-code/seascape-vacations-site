const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  buildOwnerLeadMetricsReceipt,
  emitOwnerLeadMetricsReceipt,
  resolveOutputRoot,
} = require("./emit-hub-verification-receipt");

test("receipt output defaults to ops staging and never the hub checkout", () => {
  const previousHubPath = process.env.SEASCAPE_HUB_PATH;
  process.env.SEASCAPE_HUB_PATH = path.join(os.tmpdir(), "hub-checkout-must-not-be-default");
  try {
    const resolved = resolveOutputRoot(null);
    assert.match(resolved, /seascape-ops\/state\/staging\/hub-refresh/);
    assert.doesNotMatch(resolved, /Projects\/seascape-hub/);
    assert.doesNotMatch(resolved, /hub-checkout-must-not-be-default/);
    assert.equal(resolveOutputRoot("/explicit/override"), "/explicit/override");
  } finally {
    if (previousHubPath === undefined) {
      delete process.env.SEASCAPE_HUB_PATH;
    } else {
      process.env.SEASCAPE_HUB_PATH = previousHubPath;
    }
  }
});

test("owner lead hub receipt keeps measurement boundary explicit", () => {
  const hubPath = path.join(os.tmpdir(), "hub-receipt-boundary");
  const { fileName, payload } = buildOwnerLeadMetricsReceipt({
    summary: {
      totalSubmissions: 2,
      bySourcePageSlug: {
        "owner-fee-revenue-leak-benchmark-2026": 2,
      },
      receipts: [
        {
          submissionId: "submission-1",
          createdAt: "2026-05-16T12:00:00.000Z",
          sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
          leadType: "owner-revenue-teardown",
          market: "florida-gulf-coast",
          pageSlug: "property-management",
          proofLabel: "codex-owner-proof-2026",
        },
        {
          submissionId: "submission-2",
          createdAt: "2026-05-16T12:05:00.000Z",
          sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
          leadType: "owner-revenue-teardown",
          market: "florida-gulf-coast",
          pageSlug: "property-management",
        },
      ],
    },
    hubPath,
    metricsUrl: "https://example.test/.netlify/functions/owner-lead-metrics",
    emittedAt: "2026-05-17T14:00:00Z",
  });

  assert.equal(fileName, "2026-05-17-seascape-vacations-site-owner-lead-metrics.json");
  assert.equal(payload.owning_repo, "seascape-vacations-site");
  assert.equal(payload.claim_ids[0], "CLM-OWNER-MEASUREMENT-PATH-LIVE");
  assert.match(payload.summary, /does not prove booked teardowns/i);
  assert.equal(payload.details.proof_labeled_test_submissions, 1);
  assert.equal(payload.details.unlabeled_submissions, 1);
});

test("owner lead hub receipt emitter fetches summary and writes hub artifact", async () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "site-hub-receipt-"));
  const result = await emitOwnerLeadMetricsReceipt({
    hubPath: hubRoot,
    metricsUrl: "https://example.test/.netlify/functions/owner-lead-metrics",
    token: "owner-secret",
    emittedAt: "2026-05-17T14:00:00Z",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://example.test/.netlify/functions/owner-lead-metrics");
      assert.equal(options.headers.authorization, "Bearer owner-secret");
      return {
        ok: true,
        json: async () => ({
          totalSubmissions: 1,
          bySourcePageSlug: {
            "property-management": 1,
          },
          receipts: [
            {
              submissionId: "submission-1",
              createdAt: "2026-05-17T13:30:00.000Z",
              pageSlug: "property-management",
              sourcePageSlug: "property-management",
              market: "florida-gulf-coast",
              leadType: "owner-revenue-teardown",
            },
          ],
        }),
      };
    },
  });

  assert.equal(fs.existsSync(result.receiptPath), true);
  const written = JSON.parse(fs.readFileSync(result.receiptPath, "utf8"));
  assert.equal(written.details.total_submissions, 1);
  assert.equal(written.details.unlabeled_submissions, 1);
});
