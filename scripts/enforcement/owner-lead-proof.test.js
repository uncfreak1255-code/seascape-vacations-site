const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const proofScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-owner-lead-proof.js");

function loadProofModule() {
  delete require.cache[require.resolve(proofScriptPath)];
  return require(proofScriptPath);
}

test("owner lead proof is exposed as an operator command", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));

  assert.equal(
    packageJson.scripts["verify:owner-lead-proof"],
    "node scripts/recovery/assert-owner-lead-proof.js https://seascape-vacations.com"
  );
});

test("owner lead proof refuses to submit when the metrics token is not configured", async () => {
  const proof = loadProofModule().createOwnerLeadProof({
    env: {},
    fetchImpl: async () => {
      throw new Error("fetch should not run before proof tokens are configured");
    }
  });

  await assert.rejects(
    proof.run({
      baseUrl: "https://seascape-vacations.com"
    }),
    /OWNER_LEAD_METRICS_TOKEN is required/
  );
});

test("owner lead proof posts a synthetic owner lead and waits for the matching receipt", async () => {
  const calls = [];
  const proof = loadProofModule().createOwnerLeadProof({
    env: {
      OWNER_LEAD_METRICS_TOKEN: "owner-token",
      LEAD_DELIVERY_PROOF_OWNER_EMAIL: "owner-proof@example.com"
    },
    now: () => new Date("2026-05-20T12:00:00.000Z"),
    sleep: async () => {},
    fetchImpl: async (url, options = {}) => {
      calls.push({ url: String(url), options });

      if (String(url).endsWith("/property-management/")) {
        assert.equal(options.method, "POST");
        assert.match(String(options.body), /form-name=owner-revenue-teardown/);
        assert.match(String(options.body), /proof_label=manual-proof/);
        assert.match(String(options.body), /source_page_slug=owner-fee-revenue-leak-benchmark-2026/);
        return { ok: true, status: 200, text: async () => "Thank you!" };
      }

      if (String(url).endsWith("/.netlify/functions/owner-lead-metrics")) {
        assert.equal(options.headers.authorization, "Bearer owner-token");
        return {
          ok: true,
          status: 200,
          json: async () => ({
            totalSubmissions: 1,
            receipts: [
              {
                submissionId: "owner-submission-1",
                createdAt: "2026-05-20T12:00:00.000Z",
                sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
                proofLabel: "manual-proof"
              }
            ]
          })
        };
      }

      throw new Error(`unexpected URL: ${url}`);
    }
  });

  const result = await proof.run({
    baseUrl: "https://seascape-vacations.com",
    proofLabel: "manual-proof",
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
    timeoutMs: 1_000,
    intervalMs: 1
  });

  assert.deepEqual(result, {
    proofLabel: "manual-proof",
    formPath: "/property-management/",
    metricsUrl: "https://seascape-vacations.com/.netlify/functions/owner-lead-metrics",
    pageSlug: "property-management",
    sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
    posted: true,
    receiptFound: true,
    submissionId: "owner-submission-1"
  });
  assert.deepEqual(calls.map((call) => call.url), [
    "https://seascape-vacations.com/property-management/",
    "https://seascape-vacations.com/.netlify/functions/owner-lead-metrics"
  ]);
});

test("owner lead proof fails loudly when the receipt never appears", async () => {
  const proof = loadProofModule().createOwnerLeadProof({
    env: {
      OWNER_LEAD_METRICS_TOKEN: "owner-token",
      LEAD_DELIVERY_PROOF_OWNER_EMAIL: "owner-proof@example.com"
    },
    sleep: async () => {},
    fetchImpl: async (url) => {
      if (String(url).endsWith("/property-management/")) {
        return { ok: true, status: 200, text: async () => "Thank you!" };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({ totalSubmissions: 0, receipts: [] })
      };
    }
  });

  await assert.rejects(
    proof.run({
      baseUrl: "https://seascape-vacations.com",
      proofLabel: "missing-owner-proof",
      timeoutMs: 5,
      intervalMs: 1
    }),
    /owner receipt with proof label missing-owner-proof was not found/
  );
});

test("owner lead proof CLI parser supports proof labels and source page overrides", () => {
  const proof = loadProofModule();

  assert.deepEqual(
    proof.parseArgs([
      "https://example.com",
      "--proof-label",
      "Manual Proof",
      "--source-page-slug",
      "owner-fee-revenue-leak-benchmark-2026"
    ]),
    {
      baseUrl: "https://example.com",
      formPath: "/property-management/",
      pageSlug: "property-management",
      sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026",
      proofLabel: "manual-proof"
    }
  );
});

test("owner lead proof labels are stable, lowercase, and timestamped", () => {
  const proof = loadProofModule();

  assert.equal(
    proof.buildProofLabel(new Date("2026-05-20T12:34:56.000Z")),
    "owner-lead-proof-20260520t123456000z"
  );
});
