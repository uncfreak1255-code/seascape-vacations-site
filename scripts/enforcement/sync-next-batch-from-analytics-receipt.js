#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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
    "Usage: sync-next-batch-from-analytics-receipt.js --receipt <path> [--next-batch <path>] [--check]"
  );
  process.exit(1);
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    receipt: "",
    nextBatch: path.join(projectRoot, "docs", "status", "next-batch.md"),
    check: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--receipt") {
      args.receipt = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--next-batch") {
      args.nextBatch = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--check") {
      args.check = true;
    } else {
      usage(`Unknown argument: ${arg}`);
    }
  }

  if (!args.receipt) {
    usage("--receipt is required");
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function renderClusterSummary(receipt) {
  const clusters = Array.isArray(receipt.cluster_summary) ? receipt.cluster_summary : [];
  if (clusters.length === 0) {
    return "";
  }

  return [
    "",
    "Cluster read from the analytics receipt:",
    "",
    "| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...clusters.map((cluster) =>
      `| ${cluster.cluster} | ${Number(cluster.pages || 0)} | ${Number(cluster.gsc_clicks || 0)} | ${Number(cluster.gsc_impressions || 0)} | ${formatPct(cluster.gsc_ctr)} | ${formatNumber(cluster.gsc_position)} | ${Number(cluster.ga4_sessions || 0)} |`
    )
  ].join("\n");
}

function renderSeoQueueSummary(receipt) {
  const queues = Array.isArray(receipt.seo_queue_summary) ? receipt.seo_queue_summary : [];
  if (queues.length === 0) {
    return "";
  }

  return [
    "",
    "SEO queue read from the analytics receipt:",
    "",
    "| queue_bucket | pages | gsc_clicks | gsc_impressions | ga4_sessions |",
    "|---|---:|---:|---:|---:|",
    ...queues.map((queue) =>
      `| ${formatCell(queue.seo_queue_bucket)} | ${Number(queue.pages || 0)} | ${Number(queue.gsc_clicks || 0)} | ${Number(queue.gsc_impressions || 0)} | ${Number(queue.ga4_sessions || 0)} |`
    )
  ].join("\n");
}

function renderSerpEvidence(receipt) {
  const serp = receipt.serp_evidence;
  if (!serp || typeof serp !== "object") {
    return "";
  }

  const lines = [
    "",
    "SERP evidence from the analytics receipt:",
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
  if (support.length > 0) {
    lines.push(
      "",
      "| query | page_path | seascape_rank | classification_support | top_visible_competitors | serp_features |",
      "|---|---|---|---|---|---|",
      ...support.map((target) => {
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

function renderBranchInstruction(receipt) {
  if (receipt.reread_status === "open next batch") {
    return [
      `Open \`${receipt.next_branch}\` from this read, using one narrow active brief and the matching release gate.`,
      "Do not use this as permission for unrelated owner, stay, guide, GEO, or SEO expansion."
    ].join("\n");
  }

  return [
    "Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read.",
    "If a tracked winner or money page has regressed, use `docs/process/ranking-regression-rescue.md` for a bounded rescue brief instead of waiting passively.",
    "`docs/status/next-batch.md` should move to `open next batch` only when the analytics receipt says so."
  ].join("\n");
}

function renderLatestExecutionRead(receipt) {
  assertReceipt(receipt);

  const latestGsc = receipt.latest_gsc_data_date || "unavailable";
  const gateLabel = receipt.site_work_gate?.label || "`blocked` - analytics receipt did not include a gate label.";
  const freshnessWarning = receipt.site_work_gate?.freshness_warning;
  const clusterSummary = renderClusterSummary(receipt);
  const seoQueueSummary = renderSeoQueueSummary(receipt);
  const serpEvidence = renderSerpEvidence(receipt);

  const lines = [
    `Run date: ${runDate(receipt)}.`,
    "",
    "The targeted joined operator read was executed in `seascape-analytics` and",
    "rendered here from its machine-readable next-batch decision receipt.",
    "",
    `- Requested last-7-complete-day window: ${receipt.date_or_window.window_start} to ${receipt.date_or_window.window_end}.`,
    `- Latest BigQuery GSC \`data_date\`: ${latestGsc}.`,
    `- Site work gate: ${gateLabel}`,
    `- Reread status: \`${receipt.reread_status}\`.`,
    `- Concrete next move: ${receipt.concrete_next_move}`,
    `- Report recommendation: \`${receipt.next_branch}\`.`,
    `- Reason: ${receipt.reason}`
  ];

  if (freshnessWarning) {
    lines.push(`- GSC freshness warning: ${freshnessWarning}`);
  }

  lines.push(clusterSummary, seoQueueSummary, serpEvidence, "", renderBranchInstruction(receipt));

  return lines.filter((line, index) => line !== "" || lines[index - 1] !== "").join("\n").trim();
}

function replaceLatestExecutionRead(markdown, receipt) {
  const replacement = renderLatestExecutionRead(receipt);
  const startMarker = "## Latest Execution Read";
  const nextMarker = "\n## Likely Priorities";
  const start = markdown.indexOf(startMarker);
  const next = markdown.indexOf(nextMarker, start);

  if (start === -1 || next === -1) {
    throw new Error("next-batch markdown must include Latest Execution Read before Likely Priorities");
  }

  return `${markdown.slice(0, start + startMarker.length).trimEnd()}\n\n${replacement}\n${markdown.slice(next)}`;
}

function syncNextBatch({ receiptPath, nextBatchPath, check = false }) {
  const receipt = readJson(receiptPath);
  const original = fs.readFileSync(nextBatchPath, "utf8");
  const updated = replaceLatestExecutionRead(original, receipt);

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
  renderLatestExecutionRead,
  replaceLatestExecutionRead,
  syncNextBatch
};
