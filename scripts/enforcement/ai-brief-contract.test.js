const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

const REQUIRED_MEASUREMENT_FIELDS = [
  "hypothesis",
  "primary event",
  "guardrail event",
  "entry criteria",
  "readback window",
  "decision rule"
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function listBriefFiles() {
  return fs.readdirSync(path.join(projectRoot, "docs", "briefs"))
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join("docs", "briefs", entry));
}

function parseMissingMeasurementFields(briefContent) {
  return REQUIRED_MEASUREMENT_FIELDS.filter((field) => {
    const expression = new RegExp(`^- ${field}:\\s+.+$`, "im");
    return !expression.test(briefContent);
  });
}

function assertOrderedTerms(content, terms, message) {
  const normalized = content.toLowerCase().replace(/\s+/g, " ");
  let cursor = 0;

  for (const term of terms) {
    const index = normalized.indexOf(term.toLowerCase().replace(/\s+/g, " "), cursor);
    assert.notEqual(index, -1, message ?? `expected to find "${term}" after position ${cursor}`);
    cursor = index + term.length;
  }
}

function requiresMeasurementContract(relativePath, briefContent) {
  if (/docs\/briefs\/_ai-visibility-batch-template\.md$/i.test(relativePath)) {
    return true;
  }

  return (
    /docs\/briefs\/.*ai-search.*\.md$/i.test(relativePath) ||
    /^# Brief:\s*AI\b/im.test(briefContent) ||
    /\bAI visibility receipt\b/i.test(briefContent)
  );
}

test("brief templates document the measurement contract for AI-search and experiment batches", () => {
  const contentGate = read(path.join("docs", "process", "content-quality-gate.md"));
  const aiAudit = read(path.join("docs", "process", "ai-citation-audit-usage.md"));
  const mergeChecklist = read(path.join("docs", "process", "before-merge-checklist.md"));

  for (const field of REQUIRED_MEASUREMENT_FIELDS) {
    assert.match(contentGate, new RegExp(`\`${field}:`));
  }

  assertOrderedTerms(aiAudit, REQUIRED_MEASUREMENT_FIELDS, "AI audit doc should document the full readback contract");
  assertOrderedTerms(mergeChecklist, REQUIRED_MEASUREMENT_FIELDS, "merge checklist should document the full readback contract");
});

test("AI-search and AI-visibility briefs carry the measurement contract and analytics ownership boundary", () => {
  const violations = [];

  for (const relativePath of listBriefFiles()) {
    const briefContent = read(relativePath);
    if (!requiresMeasurementContract(relativePath, briefContent)) {
      continue;
    }

    const missingFields = parseMissingMeasurementFields(briefContent);
    if (missingFields.length > 0) {
      violations.push(`${relativePath}: missing ${missingFields.join(", ")}`);
    }

    if (!/seascape-analytics/i.test(briefContent)) {
      violations.push(`${relativePath}: should name seascape-analytics as the analytics proof owner`);
    }
  }

  assert.deepEqual(violations, []);
});
