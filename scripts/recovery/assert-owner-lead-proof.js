#!/usr/bin/env node

const path = require("path");
const { readEnvFileValue } = require("../enforcement/repo-env");

const projectRoot = path.resolve(__dirname, "..", "..");
const DEFAULT_BASE_URL = "https://seascape-vacations.com";
const DEFAULT_FORM_PATH = "/property-management/";
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_INTERVAL_MS = 3_000;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProofLabel(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 64);
}

function buildProofLabel(now = new Date()) {
  return `owner-lead-proof-${now.toISOString().replace(/[-:.]/g, "").toLowerCase()}`;
}

function cleanBaseUrl(baseUrl) {
  return (normalizeText(baseUrl) || DEFAULT_BASE_URL).replace(/\/+$/g, "");
}

function cleanFormPath(formPath) {
  const normalized = normalizeText(formPath) || DEFAULT_FORM_PATH;
  const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJsonResponse(response) {
  if (response && typeof response.json === "function") {
    return response.json();
  }

  throw new Error("expected JSON response");
}

function findReceiptByProofLabel(summary, proofLabel) {
  const receipts = Array.isArray(summary && summary.receipts) ? summary.receipts : [];
  return receipts.find((receipt) => normalizeProofLabel(receipt.proofLabel) === proofLabel) || null;
}

function assertOkResponse(response, label) {
  if (!response || !response.ok) {
    const status = response && response.status ? response.status : "unknown";
    throw new Error(`${label} failed with status ${status}`);
  }
}

function createOwnerLeadProof(options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  const now = options.now || (() => new Date());
  const sleepImpl = options.sleep || sleep;

  function readLocalEnv(key) {
    return readEnvFileValue(key, { projectRoot, cwd: projectRoot });
  }

  function requireToken() {
    const token = normalizeText(env.OWNER_LEAD_METRICS_TOKEN) || readLocalEnv("OWNER_LEAD_METRICS_TOKEN");
    if (!token) {
      throw new Error("OWNER_LEAD_METRICS_TOKEN is required before sending owner proof submissions");
    }

    return token;
  }

  function readProofEmail(proofLabel) {
    const email =
      normalizeText(env.LEAD_DELIVERY_PROOF_OWNER_EMAIL) ||
      readLocalEnv("LEAD_DELIVERY_PROOF_OWNER_EMAIL") ||
      `owner-proof+${proofLabel}@example.com`;

    if (!email.includes("@")) {
      throw new Error("LEAD_DELIVERY_PROOF_OWNER_EMAIL must be a deliverable test email address");
    }

    return email;
  }

  async function pollForReceipt({
    metricsUrl,
    token,
    proofLabel,
    sourcePageSlug,
    timeoutMs,
    intervalMs
  }) {
    const deadline = Date.now() + timeoutMs;
    let lastSummary = null;

    while (Date.now() <= deadline) {
      const response = await fetchImpl(metricsUrl, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      assertOkResponse(response, "owner metrics request");

      lastSummary = await readJsonResponse(response);
      const receipt = findReceiptByProofLabel(lastSummary, proofLabel);
      if (receipt) {
        if (sourcePageSlug && receipt.sourcePageSlug !== sourcePageSlug) {
          throw new Error(
            `owner receipt ${receipt.submissionId} resolved with source ${receipt.sourcePageSlug}, expected ${sourcePageSlug}`
          );
        }

        return receipt;
      }

      await sleepImpl(intervalMs);
    }

    const count = lastSummary && lastSummary.totalSubmissions;
    throw new Error(
      `owner receipt with proof label ${proofLabel} was not found before timeout` +
      (typeof count === "number" ? `; latest count was ${count}` : "")
    );
  }

  async function run(config = {}) {
    const baseUrl = cleanBaseUrl(config.baseUrl);
    const formPath = cleanFormPath(config.formPath);
    const pageSlug = normalizeText(config.pageSlug) || "property-management";
    const sourcePageSlug = normalizeText(config.sourcePageSlug) || pageSlug;
    const proofLabel = normalizeProofLabel(config.proofLabel) || buildProofLabel(now());
    const timeoutMs = Number(config.timeoutMs) || DEFAULT_TIMEOUT_MS;
    const intervalMs = Number(config.intervalMs) || DEFAULT_INTERVAL_MS;
    const metricsUrl =
      normalizeText(config.metricsUrl) ||
      normalizeText(env.OWNER_LEAD_METRICS_URL) ||
      readLocalEnv("OWNER_LEAD_METRICS_URL") ||
      `${baseUrl}/.netlify/functions/owner-lead-metrics`;
    const token = requireToken();
    const ownerEmail = readProofEmail(proofLabel);
    const body = new URLSearchParams({
      "form-name": "owner-revenue-teardown",
      name: "Seascape Owner Lead Proof",
      email: ownerEmail,
      phone: "941-555-0100",
      property_address: "Owner lead proof synthetic submission",
      page_slug: pageSlug,
      source_page_slug: sourcePageSlug,
      market: "florida-gulf-coast",
      lead_type: "owner-revenue-teardown",
      proof_label: proofLabel
    });

    const response = await fetchImpl(`${baseUrl}${formPath}`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      body: body.toString(),
      redirect: "follow"
    });
    assertOkResponse(response, "owner Netlify form submission");

    const receipt = await pollForReceipt({
      metricsUrl,
      token,
      proofLabel,
      sourcePageSlug,
      timeoutMs,
      intervalMs
    });

    return {
      proofLabel,
      formPath,
      metricsUrl,
      pageSlug,
      sourcePageSlug,
      posted: true,
      receiptFound: true,
      submissionId: receipt.submissionId
    };
  }

  return { run };
}

function parseArgs(argv) {
  const config = {
    baseUrl: DEFAULT_BASE_URL,
    formPath: DEFAULT_FORM_PATH,
    pageSlug: "property-management",
    sourcePageSlug: "property-management",
    proofLabel: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (index === 0 && !arg.startsWith("--")) {
      config.baseUrl = arg;
    } else if (arg === "--proof-label") {
      config.proofLabel = normalizeProofLabel(argv[++index] || "");
    } else if (arg === "--form-path") {
      config.formPath = cleanFormPath(argv[++index] || DEFAULT_FORM_PATH);
    } else if (arg === "--metrics-url") {
      config.metricsUrl = argv[++index] || "";
    } else if (arg === "--page-slug") {
      config.pageSlug = normalizeText(argv[++index] || "") || "property-management";
    } else if (arg === "--source-page-slug") {
      config.sourcePageSlug = normalizeText(argv[++index] || "") || config.pageSlug;
    } else if (arg === "--timeout-ms") {
      config.timeoutMs = Number(argv[++index] || DEFAULT_TIMEOUT_MS);
    } else if (arg === "--interval-ms") {
      config.intervalMs = Number(argv[++index] || DEFAULT_INTERVAL_MS);
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return config;
}

async function main() {
  const proof = createOwnerLeadProof();
  const result = await proof.run(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildProofLabel,
  createOwnerLeadProof,
  normalizeProofLabel,
  parseArgs
};
