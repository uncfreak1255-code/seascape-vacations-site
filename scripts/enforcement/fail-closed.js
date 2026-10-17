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

function sourceHasRunnableTest(source, title) {
  const escaped = String(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(`^\\s*test\\(\\s*(["'\`])${escaped}\\1`);
  const withoutBlocks = String(source).replace(/\/\*[\s\S]*?\*\//g, "\n");
  const lines = withoutBlocks.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/^\s*\/\/.*$/, "");
    if (!declaration.test(line)) {
      continue;
    }
    const window = [line, lines[index + 1] || "", lines[index + 2] || ""].join("\n");
    if (/^\s*test\([\s\S]*?,\s*\{[\s\S]*?\bskip\s*:\s*true\b/.test(window)) {
      continue;
    }
    return true;
  }
  return false;
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

  for (const filePath of listProveRedTestFiles(areaDir)) {
    if (sourceHasRunnableTest(fs.readFileSync(filePath, "utf8"), title)) {
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
  if (!findProveRedTest(proveRedTest, areaDir)) {
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
