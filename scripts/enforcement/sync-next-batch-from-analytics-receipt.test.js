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
