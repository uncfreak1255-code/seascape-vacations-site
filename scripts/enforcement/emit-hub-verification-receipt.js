#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const DEFAULT_OWNER_METRICS_URL =
  "https://seascape-vacations.com/.netlify/functions/owner-lead-metrics";
// Receipts emit to the ops staging root and reach seascape-hub only through
// the PR-gated hub-refresh promotion lane — the live hub checkout must never
// be a reachable default (SEASCAPE_HUB_PATH is deliberately not consulted).
const DEFAULT_OUTPUT_ROOT = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "seascape-ops",
  "state",
  "staging",
  "hub-refresh"
);

function resolveOutputRoot(hubPath) {
  return hubPath || DEFAULT_OUTPUT_ROOT;
}

function usage(message = null) {
  if (message) {
    console.error(message);
  }
  console.error(
    "Usage: emit-hub-verification-receipt.js owner-lead-metrics [--hub-path <path>] [--metrics-url <url>] [--token <token>] [--emitted-at <iso>]"
  );
  process.exit(1);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toIso(value) {
  if (!value) {
    return new Date().toISOString();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
}

function dateStamp(value) {
  return toIso(value).slice(0, 10);
}

function addDays(value, days) {
  const parsed = Date.parse(toIso(value));
  return new Date(parsed + days * 86400000).toISOString().slice(0, 10);
}

function readEnvFileValue(key) {
  const candidates = [
    path.join(projectRoot, ".secrets.env"),
    path.join(projectRoot, ".env"),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }
    const lines = fs.readFileSync(candidate, "utf8").split(/\r?\n/);
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index];
      if (!line.startsWith(`${key}=`)) {
        continue;
      }
      return normalizeText(line.slice(key.length + 1)).replace(/^['"]|['"]$/g, "");
    }
  }

  return "";
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function fetchOwnerLeadSummary({
  fetchImpl = fetch,
  metricsUrl,
  token,
} = {}) {
  if (!normalizeText(token)) {
    throw new Error("OWNER_LEAD_METRICS_TOKEN is required to read owner lead metrics");
  }

  const response = await fetchImpl(metricsUrl, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Owner lead metrics request failed: ${response.status}`);
  }

  return response.json();
}

function buildOwnerLeadMetricsReceipt({
  summary,
  hubPath,
  metricsUrl,
  emittedAt,
} = {}) {
  const emittedIso = toIso(emittedAt);
  const totalSubmissions = Number(summary?.totalSubmissions || 0);
  const receipts = Array.isArray(summary?.receipts) ? summary.receipts : [];
  const testReceipts = receipts.filter((receipt) => normalizeText(receipt?.proofLabel)).length;
  const realReceipts = Math.max(0, totalSubmissions - testReceipts);
  const newestReceipt = receipts.length > 0 ? receipts[receipts.length - 1] : null;
  const bySourcePageSlug =
    summary && summary.bySourcePageSlug && typeof summary.bySourcePageSlug === "object"
      ? summary.bySourcePageSlug
      : {};
  const fileName = `${dateStamp(emittedIso)}-seascape-vacations-site-owner-lead-metrics.json`;

  return {
    fileName,
    payload: {
      receipt_id: `REC-${dateStamp(emittedIso).replace(/-/g, "")}-SITE-OWNER-LEAD-METRICS`,
      owning_repo: "seascape-vacations-site",
      source_path: "netlify/functions/owner-lead-metrics.js",
      verification_command: `node scripts/enforcement/emit-hub-verification-receipt.js owner-lead-metrics --metrics-url ${metricsUrl}`,
      date_or_window: emittedIso,
      proof_type: "measurement",
      claim_ids: ["CLM-OWNER-MEASUREMENT-PATH-LIVE"],
      stale_after: addDays(emittedIso, 14),
      summary:
        `Deployed owner-lead metrics report ${totalSubmissions} total receipt(s), ` +
        `${testReceipts} proof-labeled test receipt(s), and ${realReceipts} unlabeled receipt(s). ` +
        "This proves the live measurement surface and sanitized endpoint shape. " +
        "It does not prove booked teardowns, trust outcomes, or closed-won owner demand by itself.",
      promotion_target: [
        "projects/claim-freshness-registry.md",
        "projects/owner-demand-trust-outcome-register.md",
      ],
      details: {
        hub_path: hubPath,
        metrics_url: metricsUrl,
        total_submissions: totalSubmissions,
        proof_labeled_test_submissions: testReceipts,
        unlabeled_submissions: realReceipts,
        by_source_page_slug: bySourcePageSlug,
        newest_receipt_created_at: newestReceipt?.createdAt || null,
      },
    },
  };
}

function writeHubReceipt({ hubPath, fileName, payload }) {
  const receiptsDir = path.join(hubPath, "intelligence", "verification-receipts");
  ensureDir(receiptsDir);
  const receiptPath = path.join(receiptsDir, fileName);
  fs.writeFileSync(receiptPath, `${JSON.stringify(payload, null, 2)}\n`);
  return receiptPath;
}

async function emitOwnerLeadMetricsReceipt({
  hubPath,
  metricsUrl,
  token,
  fetchImpl = fetch,
  emittedAt,
} = {}) {
  const resolvedHubPath = resolveOutputRoot(hubPath);
  const resolvedMetricsUrl =
    metricsUrl ||
    process.env.OWNER_LEAD_METRICS_URL ||
    readEnvFileValue("OWNER_LEAD_METRICS_URL") ||
    DEFAULT_OWNER_METRICS_URL;
  const resolvedToken =
    token ||
    process.env.OWNER_LEAD_METRICS_TOKEN ||
    readEnvFileValue("OWNER_LEAD_METRICS_TOKEN");

  const summary = await fetchOwnerLeadSummary({
    fetchImpl,
    metricsUrl: resolvedMetricsUrl,
    token: resolvedToken,
  });
  const receipt = buildOwnerLeadMetricsReceipt({
    summary,
    hubPath: resolvedHubPath,
    metricsUrl: resolvedMetricsUrl,
    emittedAt,
  });
  const receiptPath = writeHubReceipt({
    hubPath: resolvedHubPath,
    fileName: receipt.fileName,
    payload: receipt.payload,
  });

  return {
    hubPath: resolvedHubPath,
    metricsUrl: resolvedMetricsUrl,
    receiptPath,
    receipt: receipt.payload,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args.shift();
  if (mode !== "owner-lead-metrics") {
    usage("Missing or unsupported receipt mode");
  }

  let hubPath = null;
  let metricsUrl = null;
  let token = null;
  let emittedAt = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    switch (arg) {
      case "--hub-path":
        hubPath = next;
        index += 1;
        break;
      case "--metrics-url":
        metricsUrl = next;
        index += 1;
        break;
      case "--token":
        token = next;
        index += 1;
        break;
      case "--emitted-at":
        emittedAt = next;
        index += 1;
        break;
      default:
        usage(`Unknown flag: ${arg}`);
    }
  }

  emitOwnerLeadMetricsReceipt({ hubPath, metricsUrl, token, emittedAt })
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  buildOwnerLeadMetricsReceipt,
  emitOwnerLeadMetricsReceipt,
  fetchOwnerLeadSummary,
  readEnvFileValue,
  resolveOutputRoot,
  writeHubReceipt,
};
