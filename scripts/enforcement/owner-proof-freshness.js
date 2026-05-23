const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerOperatorProofAssetsPath = path.join(projectRoot, "src", "_data", "ownerOperatorProofAssets.json");

function parseDateOnly(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`owner operator proof ${label} must be a YYYY-MM-DD date`);
  }

  return new Date(`${value}T23:59:59.999Z`);
}

function assertFreshOwnerOperatorProof(proofAssets, now = new Date()) {
  if (!proofAssets || typeof proofAssets !== "object") {
    throw new Error("owner operator proof assets must be an object");
  }

  if (proofAssets.freshnessPolicy !== "fail-after-staleAfter") {
    throw new Error("owner operator proof freshnessPolicy must be fail-after-staleAfter");
  }

  const staleAt = parseDateOnly(proofAssets.staleAfter, "staleAfter");
  if (now.getTime() > staleAt.getTime()) {
    throw new Error(`owner operator proof is stale after ${proofAssets.staleAfter}; refresh proof before reuse`);
  }

  if (!Array.isArray(proofAssets.modules) || proofAssets.modules.length === 0) {
    throw new Error("owner operator proof modules must be present before reuse");
  }

  for (const module of proofAssets.modules) {
    if (!module.id || !module.evidencePath || !module.proofLabel) {
      throw new Error("owner operator proof modules need id, evidencePath, and proofLabel");
    }
  }
}

function readOwnerOperatorProofAssets() {
  return JSON.parse(fs.readFileSync(ownerOperatorProofAssetsPath, "utf8"));
}

if (require.main === module) {
  try {
    assertFreshOwnerOperatorProof(readOwnerOperatorProofAssets());
    console.log("owner-proof-freshness: operator proof is fresh");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  assertFreshOwnerOperatorProof,
  readOwnerOperatorProofAssets
};
