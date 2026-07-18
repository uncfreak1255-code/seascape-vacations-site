const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerOperatorProofAssetsPath = path.join(projectRoot, "src", "_data", "ownerOperatorProofAssets.json");
const ownerProofAssetsPath = path.join(projectRoot, "src", "_data", "ownerProofAssets.json");
const ownerBenchmarkKey = "gulf-coast-owner-benchmark-2026";

function parseDateOnly(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`owner operator proof ${label} must be a YYYY-MM-DD date`);
  }

  return new Date(`${value}T23:59:59.999Z`);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`owner benchmark proof ${label} must be a non-empty string`);
  }
}

function assertOwnerBenchmarkProof(proofAsset, now = new Date()) {
  if (!proofAsset || typeof proofAsset !== "object") {
    throw new Error("owner benchmark proof asset must be an object");
  }

  for (const field of [
    "status",
    "dataPeriod",
    "pricingStatus",
    "pricingReviewedDate",
    "pricingStaleAfter",
    "scopeLabel",
    "basis",
    "sourceNote",
    "reviewedDate",
    "staleAfter",
    "reuseStatus"
  ]) {
    assertNonEmptyString(proofAsset[field], field);
  }

  if (!Array.isArray(proofAsset.antiClaims) || proofAsset.antiClaims.length === 0) {
    throw new Error("owner benchmark proof antiClaims must be a non-empty string array");
  }
  for (const antiClaim of proofAsset.antiClaims) {
    assertNonEmptyString(antiClaim, "antiClaims entry");
  }

  const reviewedAt = parseDateOnly(proofAsset.reviewedDate, "reviewedDate");
  const staleAt = parseDateOnly(proofAsset.staleAfter, "staleAfter");
  if (staleAt.getTime() < reviewedAt.getTime()) {
    throw new Error("owner benchmark proof staleAfter cannot be before reviewedDate");
  }

  const blocksPublicReuse = ["retired", "retired-stale", "not-approved"].includes(proofAsset.reuseStatus);
  if (now.getTime() > staleAt.getTime() && !blocksPublicReuse) {
    throw new Error(`owner benchmark proof is stale after ${proofAsset.staleAfter}; retire or refresh before reuse`);
  }

  if (blocksPublicReuse) {
    if (Array.isArray(proofAsset.stats) && proofAsset.stats.length > 0) {
      throw new Error("retired owner benchmark proof cannot keep public stats");
    }
    if (Array.isArray(proofAsset.examples) && proofAsset.examples.length > 0) {
      throw new Error("retired owner benchmark proof cannot keep public examples");
    }
  }

  if (proofAsset.pricingStatus !== "active") {
    throw new Error("owner benchmark published pricing must set pricingStatus active");
  }
  const pricingReviewedAt = parseDateOnly(proofAsset.pricingReviewedDate, "pricingReviewedDate");
  const pricingStaleAt = parseDateOnly(proofAsset.pricingStaleAfter, "pricingStaleAfter");
  if (pricingStaleAt.getTime() < pricingReviewedAt.getTime()) {
    throw new Error("owner benchmark pricingStaleAfter cannot be before pricingReviewedDate");
  }
  if (now.getTime() > pricingStaleAt.getTime()) {
    throw new Error(
      `owner benchmark published pricing is stale after ${proofAsset.pricingStaleAfter}; recheck the linked sources`
    );
  }

  if (!Array.isArray(proofAsset.sources) || proofAsset.sources.length < 2) {
    throw new Error("owner benchmark published pricing must include at least two sources");
  }
  for (const source of proofAsset.sources) {
    assertNonEmptyString(source && source.label, "sources label");
    if (!source || typeof source.url !== "string" || !/^https:\/\//.test(source.url)) {
      throw new Error("owner benchmark source URLs must use https");
    }
  }
}

function assertFreshOwnerOperatorProof(proofAssets, now = new Date()) {
  if (!proofAssets || typeof proofAssets !== "object") {
    throw new Error("owner operator proof assets must be an object");
  }

  if (proofAssets.freshnessPolicy === "retired-no-public-reuse") {
    if (proofAssets.reuseStatus !== "retired-stale") {
      throw new Error("retired owner operator proof must set reuseStatus retired-stale");
    }

    if (!proofAssets.retiredAfter || proofAssets.retiredAfter !== proofAssets.staleAfter) {
      throw new Error("retired owner operator proof must preserve the staleAfter date as retiredAfter");
    }

    assertNonEmptyString(proofAssets.retirementReason, "retirementReason");

    parseDateOnly(proofAssets.staleAfter, "staleAfter");
    if (!Array.isArray(proofAssets.modules) || proofAssets.modules.length !== 0) {
      throw new Error("retired owner operator proof cannot keep public modules");
    }
    return;
  }

  if (proofAssets.freshnessPolicy !== "fail-after-staleAfter") {
    throw new Error("owner operator proof freshnessPolicy must be fail-after-staleAfter");
  }

  const staleAt = parseDateOnly(proofAssets.staleAfter, "staleAfter");
  if (now.getTime() > staleAt.getTime()) {
    throw new Error(`owner operator proof is stale after ${proofAssets.staleAfter}; refresh proof before reuse`);
  }

  assertReusableModules(proofAssets);
}

function assertReusableModules(proofAssets) {
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

function readOwnerBenchmarkProofAsset() {
  const proofAssets = JSON.parse(fs.readFileSync(ownerProofAssetsPath, "utf8"));
  return proofAssets[ownerBenchmarkKey];
}

if (require.main === module) {
  try {
    const proofAssets = readOwnerOperatorProofAssets();
    assertFreshOwnerOperatorProof(proofAssets);
    assertOwnerBenchmarkProof(readOwnerBenchmarkProofAsset());
    if (proofAssets.freshnessPolicy === "retired-no-public-reuse") {
      console.log("owner-proof-freshness: retired performance proof is blocked; published pricing is fresh");
    } else {
      console.log("owner-proof-freshness: operator proof is fresh");
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  assertOwnerBenchmarkProof,
  assertFreshOwnerOperatorProof,
  readOwnerBenchmarkProofAsset,
  readOwnerOperatorProofAssets
};
