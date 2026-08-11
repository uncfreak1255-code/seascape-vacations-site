const test = require("node:test");
const assert = require("node:assert/strict");

const { renderLatestExecutionRead, replaceLatestExecutionRead } = require("./sync-next-batch-from-analytics-receipt");

const receipt = {
  receipt_type: "next_batch_decision",
  owning_repo: "seascape-analytics",
  date_or_window: {
    window_start: "2026-05-10",
    window_end: "2026-05-16",
    emitted_at: "2026-05-17T19:30:00Z"
  },
  latest_gsc_data_date: "2026-05-15",
  site_work_gate: {
    status: "blocked",
    label: "`blocked` - GSC export freshness does not cover the requested window.",
    freshness_warning:
      "Requested window ends `2026-05-16`, but BigQuery GSC data is only current through `2026-05-15`. Treat the trailing day as unavailable."
  },
  reread_status: "blocked by freshness",
  next_branch: "hold-and-reread",
  reason: "No cluster cleared the bar for a stronger next branch than holding for more readback.",
  concrete_next_move: "rerun the targeted operator read after BigQuery GSC covers 2026-05-16.",
  cluster_summary: [
    {
      cluster: "owner_money",
      pages: 4,
      gsc_clicks: 0,
      gsc_impressions: 146,
      gsc_ctr: 0,
      gsc_position: 5.32,
      ga4_sessions: 1
    },
    {
      cluster: "stay_money",
      pages: 2,
      gsc_clicks: 0,
      gsc_impressions: 7,
      gsc_ctr: 0,
      gsc_position: 32.57,
      ga4_sessions: 3
    }
  ],
  seo_queue_summary: [
    {
      seo_queue_bucket: "CTR issue",
      pages: 1,
      gsc_clicks: 2,
      gsc_impressions: 1902,
      ga4_sessions: 23
    },
    {
      seo_queue_bucket: "too thin to call",
      pages: 2,
      gsc_clicks: 0,
      gsc_impressions: 51,
      ga4_sessions: 0
    }
  ],
  serp_evidence: {
    receipt_type: "dataforseo_serp_receipt",
    serp_evidence_status: "available",
    error_kind: null,
    mode: "standard_queue",
    task_count: 1,
    max_depth: 10,
    requested_cost: 0.0006,
    raw_receipt_path: "tmp/dataforseo-redacted.json",
    support: [
      {
        query: "Bradenton vs Sarasota vacation",
        page_path: "/guides/bradenton-vs-sarasota/",
        seascape_rank: {
          status: "present",
          rank_group: 4
        },
        classification_support: "supports_ctr_issue",
        top_visible_competitors: [{ domain: "example.com" }],
        serp_features: ["organic"]
      }
    ]
  }
};

const legacyReceipt = {
  receipt_type: "next_batch_decision",
  owning_repo: "seascape-analytics",
  date_or_window: {
    window_start: "2026-05-10",
    window_end: "2026-05-16",
    emitted_at: "2026-05-17T19:30:00Z"
  },
  latest_gsc_data_date: "2026-05-15",
  site_work_gate: {
    status: "blocked",
    label: "`blocked` - GSC export freshness does not cover the requested window."
  },
  reread_status: "blocked by freshness",
  next_branch: "hold-and-reread",
  reason: "No cluster cleared the bar for a stronger next branch than holding for more readback.",
  concrete_next_move: "rerun the targeted operator read after BigQuery GSC covers 2026-05-16.",
  cluster_summary: [
    {
      cluster: "owner_money",
      pages: 4,
      gsc_clicks: 0,
      gsc_impressions: 146,
      gsc_ctr: 0,
      gsc_position: 5.32,
      ga4_sessions: 1
    }
  ]
};

test("renderLatestExecutionRead turns analytics receipt into the status contract", () => {
  const rendered = renderLatestExecutionRead(receipt);

  assert.match(rendered, /Run date: 2026-05-17\./);
  assert.match(rendered, /Requested last-7-complete-day window: 2026-05-10 to 2026-05-16\./);
  assert.match(rendered, /Latest BigQuery GSC `data_date`: 2026-05-15\./);
  assert.match(rendered, /- Reread status: `blocked by freshness`\./);
  assert.match(rendered, /- Concrete next move: rerun the targeted operator read after BigQuery GSC covers 2026-05-16\./);
  assert.match(rendered, /Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read\./);
  assert.match(rendered, /ranking-regression-rescue\.md/);
});

test("renderLatestExecutionRead renders PR 115 SEO queue and SERP receipt fields", () => {
  const rendered = renderLatestExecutionRead(receipt);

  assert.match(rendered, /SEO queue read from the analytics receipt:/);
  assert.match(rendered, /\| CTR issue \| 1 \| 2 \| 1902 \| 23 \|/);
  assert.match(rendered, /SERP evidence from the analytics receipt:/);
  assert.match(rendered, /- Evidence status: `available`\./);
  assert.match(rendered, /- Mode: `standard_queue`\./);
  assert.match(rendered, /- Requested cost: 0\.0006\./);
  assert.match(
    rendered,
    /\| Bradenton vs Sarasota vacation \| \/guides\/bradenton-vs-sarasota\/ \| 4 \| supports_ctr_issue \| example\.com \| organic \|/
  );
});

test("renderLatestExecutionRead keeps legacy receipts valid when PR 115 fields are absent", () => {
  const rendered = renderLatestExecutionRead(legacyReceipt);

  assert.doesNotMatch(rendered, /SEO queue read from the analytics receipt:/);
  assert.doesNotMatch(rendered, /SERP evidence from the analytics receipt:/);
  assert.match(rendered, /Cluster read from the analytics receipt:/);
});

test("renderLatestExecutionRead opens exactly the branch named by an open receipt", () => {
  const openReceipt = {
    ...receipt,
    latest_gsc_data_date: "2026-05-16",
    site_work_gate: {
      status: "clear",
      label: "`clear` - joined GSC + GA4 read covers the requested window."
    },
    reread_status: "open next batch",
    next_branch: "winner-regression-rescue",
    reason: "rank_history shows /guides/bradenton-vs-sarasota/ fell from position 1.0 to 5.0.",
    concrete_next_move: "open `winner-regression-rescue` from the joined operator read."
  };

  const rendered = renderLatestExecutionRead(openReceipt);

  assert.match(rendered, /- Reread status: `open next batch`\./);
  assert.match(rendered, /Open `winner-regression-rescue` from this read/);
  assert.match(rendered, /Do not use this as permission for unrelated owner, stay, guide, GEO, or SEO expansion\./);
  assert.doesNotMatch(rendered, /Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read\./);
});

test("renderLatestExecutionRead renders weekly AI visibility decision receipts", () => {
  const aiReceipt = {
    ...receipt,
    latest_gsc_data_date: "2026-06-18",
    source_report: {
      format: "weekly_ai_visibility_receipt",
      generated_at: "2026-06-20T21:15:00Z"
    },
    site_work_gate: {
      status: "clear",
      label: "`clear` - joined GSC + GA4 read covers the requested window."
    },
    reread_status: "open next batch",
    next_branch: "anna-maria-island-vs-siesta-key-distribution-content",
    report_recommendation: "open distribution/content batch",
    recommended_batch_type: "distribution/content",
    recommended_page_or_cluster: "/guides/anna-maria-island-vs-siesta-key/",
    reason:
      "`/guides/anna-maria-island-vs-siesta-key/` gained demand but still shows a page-angle or transfer gap worth a narrow site batch",
    concrete_next_move: "open a narrow site batch around `/guides/anna-maria-island-vs-siesta-key/`",
    wait: "broader guide rewrites and any unsupported booking claim",
    ai_visibility_summary: {
      status: "fresh",
      direct_ai_local_observation_rows: 4,
      direct_ai_local_measured_rows: 4,
      explicit_ai_referrers_external_candidate_sessions: 5,
      analytics_quality_status: "blocked"
    }
  };

  const rendered = renderLatestExecutionRead(aiReceipt);

  assert.match(rendered, /The weekly AI visibility read was executed in `seascape-analytics`/);
  assert.match(rendered, /- Report recommendation: `open distribution\/content batch`\./);
  assert.match(rendered, /AI visibility read from the analytics receipt:/);
  assert.match(rendered, /- Direct AI\/local measured rows: 4 of 4\./);
  assert.match(rendered, /- Analytics quality status: `blocked`\./);
  assert.match(rendered, /- Recommended batch type: `distribution\/content`\./);
  assert.match(rendered, /- Recommended page or cluster: `\/guides\/anna-maria-island-vs-siesta-key\/`\./);
  assert.match(rendered, /Open `anna-maria-island-vs-siesta-key-distribution-content` from this read/);
});

test("renderLatestExecutionRead rejects an open receipt without next_branch", () => {
  const malformedOpenReceipt = {
    ...receipt,
    reread_status: "open next batch",
    next_branch: "   "
  };

  assert.throws(
    () => renderLatestExecutionRead(malformedOpenReceipt),
    /Receipt with reread_status open next batch must include next_branch/
  );
});

test("replaceLatestExecutionRead updates only the latest execution read block", () => {
  const original = [
    "# Next Batch",
    "",
    "## Reread Contract",
    "",
    "- allowed statuses stay above",
    "",
    "## Latest Execution Read",
    "",
    "old volatile read",
    "",
    "## Likely Priorities",
    "",
    "1. keep this section",
    ""
  ].join("\n");

  const updated = replaceLatestExecutionRead(original, receipt);

  assert.match(updated, /## Reread Contract/);
  assert.match(updated, /## Latest Execution Read\n\nRun date: 2026-05-17\./);
  assert.doesNotMatch(updated, /old volatile read/);
  assert.match(updated, /## Likely Priorities\n\n1\. keep this section/);
});


test("unavailable SERP receipts cannot render rank or competitor evidence", () => {
  const unavailableReceipt = {
    ...receipt,
    serp_evidence: {
      ...receipt.serp_evidence,
      serp_evidence_status: "unavailable",
      error_kind: "auth_missing",
      support: [
        {
          query: "fake query",
          page_path: "/stays/fake/",
          seascape_rank: { status: "present", rank_group: 3 },
          classification_support: "supports_ctr_issue",
          top_visible_competitors: [{ domain: "competitor.example" }],
          serp_features: ["organic"]
        }
      ]
    }
  };

  const rendered = renderLatestExecutionRead(unavailableReceipt);

  assert.match(rendered, /- Evidence status: `unavailable`./);
  assert.match(
    rendered,
    /\| fake query \| \/stays\/fake\/ \| unavailable \| unavailable \| unavailable \| unavailable \|/
  );
  assert.doesNotMatch(rendered, /\| fake query \| \/stays\/fake\/ \| 3 \|/);
  assert.doesNotMatch(rendered, /competitor\.example/);
  assert.doesNotMatch(rendered, /supports_ctr_issue/);
});
