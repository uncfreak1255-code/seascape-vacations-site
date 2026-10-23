"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const approved = require("./fixtures/stay-number-baseline-approved.json");

const STAY_BASELINE_FILE = "src/_data/stayNumberBaseline.json";
const BASELINE_TAGS = new Set(["non-claim", "suspected-claim"]);

function sentenceHash(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function baselineKey(row) {
  return `${row.slug}:${row.hash}`;
}

function assertStayBaselineRatchet(currentRows, previousRows = approved.sentences) {
  if (!Array.isArray(currentRows) || !Array.isArray(previousRows)) {
    throw new Error(`stayFacts: ${STAY_BASELINE_FILE} ratchet needs current and approved sentences`);
  }
  const previous = new Set(previousRows.map(baselineKey));
  for (const row of currentRows) {
    if (!previous.has(baselineKey(row))) {
      throw new Error(
        `${STAY_BASELINE_FILE} can only shrink; new page/hash ${baselineKey(row)} needs a sourced token`
      );
    }
  }
}

function loadStayNumberBaseline(root = path.resolve(__dirname, "..", "..")) {
  const file = path.join(root, STAY_BASELINE_FILE);
  if (!fs.existsSync(file)) {
    throw new Error(`stayFacts: ${STAY_BASELINE_FILE} is missing`);
  }
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(rows.sentences)) {
    throw new Error(`stayFacts: ${STAY_BASELINE_FILE} is missing sentences`);
  }
  const keys = new Set();
  for (const row of rows.sentences) {
    if (!row || row.hash !== sentenceHash(row.sentence)) {
      throw new Error(`stayFacts: ${STAY_BASELINE_FILE} hash does not match sentence`);
    }
    if (!String(row.slug || "").trim()) {
      throw new Error(`stayFacts: ${STAY_BASELINE_FILE} row is missing its original page slug`);
    }
    if (!BASELINE_TAGS.has(row.tag) || !String(row.reason || "").trim()) {
      throw new Error(`stayFacts: ${STAY_BASELINE_FILE} row is missing a reviewed tag`);
    }
    keys.add(baselineKey(row));
  }
  // Every content/build consumer loads through this check; additions cannot
  // become valid merely by adding another row to the editable baseline.
  assertStayBaselineRatchet(rows.sentences);
  return { rows: rows.sentences, keys };
}

module.exports = {
  STAY_BASELINE_FILE,
  assertStayBaselineRatchet,
  loadStayNumberBaseline,
  sentenceHash
};
