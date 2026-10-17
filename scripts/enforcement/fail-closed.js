"use strict";

const fs = require("node:fs");
const path = require("node:path");

const AREA_DIR = __dirname;

function skipMessage(owner, detail) {
  const prefix = owner ? `${owner}: ` : "";
  const body = String(detail || "").trim() || "refusing empty skip";
  if (body.includes("cannot skip-as-pass")) {
    return `${prefix}${body}`;
  }
  return `${prefix}${body}; cannot skip-as-pass`;
}

function refuseSkip(owner, detail) {
  throw new Error(skipMessage(owner, detail));
}

function testTitlePattern(title) {
  const escaped = String(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\btest\\(\\s*["'\`]${escaped}["'\`]`);
}

function listProveRedTestFiles(areaDir = AREA_DIR) {
  if (!fs.existsSync(areaDir)) {
    return [];
  }
  return fs
    .readdirSync(areaDir)
    .filter((name) => name.endsWith(".test.js"))
    .sort()
    .map((name) => path.join(areaDir, name));
}

function findProveRedTest(proveRedTest, areaDir = AREA_DIR) {
  const title = String(proveRedTest || "").trim();
  if (!title) {
    return "";
  }

  const matcher = testTitlePattern(title);
  for (const filePath of listProveRedTestFiles(areaDir)) {
    if (matcher.test(fs.readFileSync(filePath, "utf8"))) {
      return filePath;
    }
  }
  return "";
}

/**
 * Permit an empty-state skip that exits 0. The prove-red test must already
 * exist in the same area, or this throws and the skip cannot pass.
 */
function allowEmptyState({ owner, reason, proveRedTest, areaDir = AREA_DIR } = {}) {
  if (!String(owner || "").trim()) {
    refuseSkip("fail-closed", "empty-state skip is missing owner");
  }
  if (!String(reason || "").trim()) {
    refuseSkip(owner, "empty-state skip is missing reason");
  }
  if (!String(proveRedTest || "").trim()) {
    refuseSkip(owner, `empty-state skip "${reason}" is missing proveRedTest`);
  }
  const testFiles = listProveRedTestFiles(areaDir);
  if (testFiles.length > 0 && !findProveRedTest(proveRedTest, areaDir)) {
    refuseSkip(
      owner,
      `empty state "${reason}" names missing prove-red test "${proveRedTest}"`
    );
  }
  return { skipped: true, owner, reason, proveRedTest };
}

module.exports = {
  allowEmptyState,
  findProveRedTest,
  listProveRedTestFiles,
  refuseSkip,
  skipMessage
};
