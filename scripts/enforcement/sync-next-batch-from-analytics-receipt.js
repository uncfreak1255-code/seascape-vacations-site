#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const allowedStatuses = new Set([
  "blocked by freshness",
  "fresh but below threshold",
  "open next batch"
]);

function usage(message = null) {
  if (message) {
    console.error(message);
  }
  console.error(
    "Usage: sync-next-batch-from-analytics-receipt.js --receipt <path> --receipt-url <commit-pinned GitHub URL> --analytics-root <path> [--next-batch <path>] [--check]"
  );
  process.exit(1);
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    receipt: "",
    receiptUrl: "",
    analyticsRoot: "",
    nextBatch: path.join(projectRoot, "docs", "status", "next-batch.md"),
    check: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--receipt") {
      args.receipt = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--receipt-url") {
      args.receiptUrl = argv[++index] || "";
    } else if (arg === "--analytics-root") {
      args.analyticsRoot = argv[++index] || "";
    } else if (arg === "--next-batch") {
      args.nextBatch = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--check") {
      args.check = true;
    } else {
      usage(`Unknown argument: ${arg}`);
    }
  }

  if (!args.receipt || !args.receiptUrl || !args.analyticsRoot) {
    usage("--receipt, --receipt-url, and --analytics-root are required.");
  }
  return args;
}

const analyticsReceiptUrl = /^https:\/\/github\.com\/uncfreak1255-code\/seascape-analytics\/blob\/([a-f0-9]{40})\/(docs\/status\/[A-Za-z0-9_.-]+\.json)$/;
// Analytics #430's merged decision-freshness implementation.
const requiredAnalyticsRevision = "3236b73d84691658d04ba508bb9f8b0cae13e302";

function hasNumericTrafficClaim(line) {
  const claim = line.replace(/\]\([^)]*\)/g, "]").replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
  return /\d/.test(claim) &&
    /\b(?:traffic|sessions?|users?|visitors?|impressions?|clicks?|ctr|positions?|handoffs?|pageviews?|views?|conversions?|bookings?|leads?|revenue|bounce|engagement)\b/i.test(claim);
}

function uncitedAnalyticsLines(markdown) {
  const receiptLink = /\[Analytics receipt\]\((https:\/\/github\.com\/uncfreak1255-code\/seascape-analytics\/blob\/[a-f0-9]{40}\/docs\/status\/[A-Za-z0-9_.-]+\.json)\)/;
  const lines = markdown.split("\n");
  const failures = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("|")) {
      const isHeader = /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || "");
      if (isHeader) {
        let caption = i - 1;
        while (caption >= 0 && !lines[caption].trim()) caption -= 1;
        if (caption < 0 || !receiptLink.test(lines[caption])) failures.push(line);
      }
    } else if (hasNumericTrafficClaim(line) && !receiptLink.test(line)) {
      failures.push(line);
    }
  }
  return failures;
}

function verifyReceipt({ receiptPath, receiptUrl, analyticsRoot }) {
  const ref = analyticsReceiptUrl.exec(receiptUrl || "");
  if (!ref) {
    throw new Error("Receipt needs a commit-pinned Analytics docs/status JSON URL");
  }
  try {
    execFileSync("git", ["-C", analyticsRoot, "merge-base", "--is-ancestor", requiredAnalyticsRevision, "HEAD"], {
      stdio: "pipe", timeout: 10000
    });
  } catch {
    throw new Error("Analytics checkout lacks the required decision-freshness verifier revision");
  }
  try {
    execFileSync("git", ["-C", analyticsRoot, "diff", "--quiet", requiredAnalyticsRevision, "HEAD", "--", "scripts", "queries"], {
      stdio: "pipe", timeout: 10000
    });
  } catch {
    throw new Error("Analytics verifier source differs from the tested revision; revalidate before syncing");
  }
  const dirty = execFileSync("git", ["-C", analyticsRoot, "status", "--porcelain", "--untracked-files=all", "--", "scripts", "queries"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 10000
  });
  if (dirty.trim()) {
    throw new Error("Analytics verifier source is modified or untracked; use a clean verified checkout");
  }
  const committed = execFileSync("git", ["-C", analyticsRoot, "show", `${ref[1]}:${ref[2]}`], {
    stdio: ["ignore", "pipe", "pipe"], timeout: 10000
  });
  const local = fs.readFileSync(receiptPath);
  if (!committed.equals(local)) {
    throw new Error("Local receipt differs from its cited GitHub receipt");
  }
  // Use the exact committed bytes for both checks and rendering.
  execFileSync("python3", [
    path.join(analyticsRoot, "scripts", "weekly_kpi_receipt.py"), "--check-ga4-receipt", "-"
  ], { input: committed, stdio: ["pipe", "pipe", "pipe"], timeout: 130000 });
  return JSON.parse(committed);
}

function assertReceipt(receipt) {
  if (receipt?.receipt_type !== "next_batch_decision") {
    throw new Error("Receipt must have receipt_type next_batch_decision");
  }
  if (receipt.owning_repo !== "seascape-analytics") {
    throw new Error("Receipt must be owned by seascape-analytics");
  }
  if (!allowedStatuses.has(receipt.reread_status)) {
    throw new Error(`Unsupported reread status: ${receipt.reread_status}`);
  }
  if (!receipt.date_or_window?.window_start || !receipt.date_or_window?.window_end) {
    throw new Error("Receipt must include date_or_window.window_start and window_end");
  }
  if (!receipt.concrete_next_move) {
    throw new Error("Receipt must include concrete_next_move");
  }
  if (receipt.reread_status === "open next batch" && !String(receipt.next_branch || "").trim()) {
    throw new Error("Receipt with reread_status open next batch must include next_branch");
  }
}

function formatNumber(value, digits = 2) {
  const number = Number(value || 0);
  return number.toFixed(digits);
}

function formatPct(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") {
    return "unavailable";
  }
  return String(value).replace(/\|/g, "\\|");
}

function runDate(receipt) {
  const emittedAt = receipt.date_or_window?.emitted_at;
  return emittedAt ? String(emittedAt).slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function renderClusterSummary(receipt, receiptUrl) {
  const clusters = Array.isArray(receipt.cluster_summary) ? receipt.cluster_summary : [];
  if (clusters.length === 0) {
    return "";
  }

  return [
    "",
    `Cluster read from the analytics receipt:${receiptUrl ? ` [Analytics receipt](${receiptUrl}).` : ""}`,
    "",
    "| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...clusters.map((cluster) =>
      `| ${cluster.cluster} | ${Number(cluster.pages || 0)} | ${Number(cluster.gsc_clicks || 0)} | ${Number(cluster.gsc_impressions || 0)} | ${formatPct(cluster.gsc_ctr)} | ${formatNumber(cluster.gsc_position)} | ${Number(cluster.ga4_sessions || 0)} |`
    )
  ].join("\n");
}

function renderSeoQueueSummary(receipt, receiptUrl) {
  const queues = Array.isArray(receipt.seo_queue_summary) ? receipt.seo_queue_summary : [];
  if (queues.length === 0) {
    return "";
  }

  return [
    "",
    `SEO queue read from the analytics receipt:${receiptUrl ? ` [Analytics receipt](${receiptUrl}).` : ""}`,
    "",
    "| queue_bucket | pages | gsc_clicks | gsc_impressions | ga4_sessions |",
    "|---|---:|---:|---:|---:|",
    ...queues.map((queue) =>
      `| ${formatCell(queue.seo_queue_bucket)} | ${Number(queue.pages || 0)} | ${Number(queue.gsc_clicks || 0)} | ${Number(queue.gsc_impressions || 0)} | ${Number(queue.ga4_sessions || 0)} |`
    )
  ].join("\n");
}

function renderSerpEvidence(receipt, receiptUrl) {
  const serp = receipt.serp_evidence;
  if (!serp || typeof serp !== "object") {
    return "";
  }

  const lines = [
    "",
    `SERP evidence from the analytics receipt:${receiptUrl ? ` [Analytics receipt](${receiptUrl}).` : ""}`,
    "",
    `- Evidence status: \`${formatCell(serp.serp_evidence_status)}\`.`,
    `- Mode: \`${formatCell(serp.mode)}\`.`,
    `- Task count: ${Number(serp.task_count || 0)}.`
  ];

  if (serp.error_kind) {
    lines.push(`- Error kind: \`${formatCell(serp.error_kind)}\`.`);
  }
  if (serp.requested_cost !== null && serp.requested_cost !== undefined) {
    lines.push(`- Requested cost: ${formatNumber(serp.requested_cost, 4)}.`);
  }

  const support = Array.isArray(serp.support) ? serp.support : [];
  const evidenceAvailable = serp.serp_evidence_status === "available";
  if (support.length > 0) {
    lines.push(
      "",
      `SERP result table:${receiptUrl ? ` [Analytics receipt](${receiptUrl}).` : ""}`,
      "",
      "| query | page_path | seascape_rank | classification_support | top_visible_competitors | serp_features |",
      "|---|---|---|---|---|---|",
      ...support.map((target) => {
        if (!evidenceAvailable) {
          return `| ${formatCell(target.query)} | ${formatCell(target.page_path)} | unavailable | unavailable | unavailable | unavailable |`;
        }

        const competitors = Array.isArray(target.top_visible_competitors)
          ? target.top_visible_competitors
              .map((competitor) => competitor?.domain || competitor?.url || competitor)
              .filter(Boolean)
              .slice(0, 3)
              .join(", ")
          : "";
        const features = Array.isArray(target.serp_features) ? target.serp_features.join(", ") : "";
        const rank =
          target.seascape_rank && typeof target.seascape_rank === "object"
            ? target.seascape_rank.rank_group || target.seascape_rank.rank_absolute || target.seascape_rank.status
            : target.seascape_rank;
        return `| ${formatCell(target.query)} | ${formatCell(target.page_path)} | ${formatCell(rank)} | ${formatCell(target.classification_support)} | ${formatCell(competitors)} | ${formatCell(features)} |`;
      })
    );
  }

  return lines.join("\n");
}

function renderSourceIntro(receipt) {
  const format = receipt.source_report?.format || "";
  if (format === "weekly_ai_visibility_receipt") {
    return [
      "The weekly AI visibility read was executed in `seascape-analytics` and",
      "rendered here from its machine-readable next-batch decision receipt."
    ].join("\n");
  }

  return [
    "The targeted joined operator read was executed in `seascape-analytics` and",
    "rendered here from its machine-readable next-batch decision receipt."
  ].join("\n");
}

function renderAiVisibilitySummary(receipt) {
  const summary = receipt.ai_visibility_summary;
  if (!summary || typeof summary !== "object") {
    return "";
  }

  const lines = [
    "",
    "AI visibility read from the analytics receipt:",
    "",
    `- Status: \`${formatCell(summary.status)}\`.`,
    `- Direct AI/local measured rows: ${Number(summary.direct_ai_local_measured_rows || 0)} of ${Number(summary.direct_ai_local_observation_rows || 0)}.`,
    `- Explicit AI-referrer external-candidate sessions: ${Number(summary.explicit_ai_referrers_external_candidate_sessions || 0)}.`
  ];

  if (summary.analytics_quality_status) {
    lines.push(`- Analytics quality status: \`${formatCell(summary.analytics_quality_status)}\`.`);
  }
  if (receipt.recommended_batch_type) {
    lines.push(`- Recommended batch type: \`${formatCell(receipt.recommended_batch_type)}\`.`);
  }
  if (receipt.recommended_page_or_cluster) {
    lines.push(`- Recommended page or cluster: \`${formatCell(receipt.recommended_page_or_cluster)}\`.`);
  }
  if (receipt.wait) {
    lines.push(`- Still waiting on: ${receipt.wait}`);
  }

  return lines.join("\n");
}

function renderBranchInstruction(receipt) {
  if (receipt.reread_status === "open next batch") {
    return [
      `Open \`${receipt.next_branch}\` from this read, using one narrow active brief and the matching release gate.`,
      "Do not use this as permission for unrelated owner, stay, guide, GEO, or SEO expansion."
    ].join("\n");
  }

  return [
    "Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read.",
    "Existing-page rescue and AEO drafts require Gate 0 or defect evidence. Ranked ideas and experiment proposals remain allowed during a hold.",
    "If a tracked winner or money page has regressed, use `docs/process/ranking-regression-rescue.md` for a bounded rescue brief instead of waiting passively.",
    "`docs/status/next-batch.md` should move to `open next batch` only when the analytics receipt says so."
  ].join("\n");
}

function renderLatestExecutionRead(receipt, receiptUrl) {
  assertReceipt(receipt);

  const latestGsc = receipt.latest_gsc_data_date || "unavailable";
  const gateLabel = receipt.site_work_gate?.label || "`blocked` - analytics receipt did not include a gate label.";
  const freshnessWarning = receipt.site_work_gate?.freshness_warning;
  const clusterSummary = renderClusterSummary(receipt, receiptUrl);
  const seoQueueSummary = renderSeoQueueSummary(receipt, receiptUrl);
  const serpEvidence = renderSerpEvidence(receipt, receiptUrl);
  const aiVisibilitySummary = renderAiVisibilitySummary(receipt);
  const reportRecommendation = receipt.report_recommendation || receipt.next_branch;

  const lines = [
    `Run date: ${runDate(receipt)}.`,
    "",
    renderSourceIntro(receipt),
    "",
    `- Requested last-7-complete-day window: ${receipt.date_or_window.window_start} to ${receipt.date_or_window.window_end}.`,
    `- Latest BigQuery GSC \`data_date\`: ${latestGsc}.`,
    `- Site work gate: ${gateLabel}`,
    `- Reread status: \`${receipt.reread_status}\`.`,
    `- Concrete next move: ${receipt.concrete_next_move}`,
    `- Report recommendation: \`${reportRecommendation}\`.`,
    `- Reason: ${receipt.reason}`
  ];

  if (receiptUrl) lines.push(`- Evidence for this read: [Analytics receipt](${receiptUrl}).`);

  if (freshnessWarning) {
    lines.push(`- GSC freshness warning: ${freshnessWarning}`);
  }

  lines.push(clusterSummary, seoQueueSummary, serpEvidence, aiVisibilitySummary, "", renderBranchInstruction(receipt));

  return lines.join("\n").split("\n")
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .map((line) => receiptUrl && line.startsWith("- ") && hasNumericTrafficClaim(line)
      ? `${line} [Analytics receipt](${receiptUrl}).` : line)
    .join("\n").trim();
}

function replaceLatestExecutionRead(markdown, receipt, receiptUrl) {
  const replacement = renderLatestExecutionRead(receipt, receiptUrl);
  const startMarker = "## Latest Execution Read";
  const nextMarker = "\n## Likely Priorities";
  const start = markdown.indexOf(startMarker);
  const next = markdown.indexOf(nextMarker, start);

  if (start === -1 || next === -1) {
    throw new Error("next-batch markdown must include Latest Execution Read before Likely Priorities");
  }

  return `${markdown.slice(0, start + startMarker.length).trimEnd()}\n\n${replacement}\n${markdown.slice(next)}`;
}

function syncNextBatch({ receiptPath, receiptUrl, analyticsRoot, nextBatchPath, check = false }) {
  const receipt = verifyReceipt({ receiptPath, receiptUrl, analyticsRoot });
  const original = fs.readFileSync(nextBatchPath, "utf8");
  const updated = replaceLatestExecutionRead(original, receipt, receiptUrl);

  if (check) {
    if (updated !== original) {
      throw new Error(`${nextBatchPath} is not synced with ${receiptPath}`);
    }
    return { changed: false, nextBatchPath };
  }

  fs.writeFileSync(nextBatchPath, updated);
  return { changed: updated !== original, nextBatchPath };
}

async function main() {
  const args = parseArgs();
  const result = syncNextBatch({
    receiptPath: path.resolve(args.receipt),
    receiptUrl: args.receiptUrl,
    analyticsRoot: path.resolve(args.analyticsRoot),
    nextBatchPath: path.resolve(args.nextBatch),
    check: args.check
  });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  hasNumericTrafficClaim,
  uncitedAnalyticsLines,
  renderLatestExecutionRead,
  replaceLatestExecutionRead,
  syncNextBatch
};
