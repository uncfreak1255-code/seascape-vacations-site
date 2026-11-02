const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { REQUIRED_BRIEF_FIELDS } = require("./brief-contract");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function assertEditorialStepsInOrder(source, label) {
  const orderedSteps = ["**Draft the copy**", "**Remove internal wording**", "**Check voice and specificity**"];
  let lastIndex = -1;

  for (const step of orderedSteps) {
    const currentIndex = source.indexOf(step);
    assert.notEqual(currentIndex, -1, `${label} should mention ${step}`);
    assert.ok(currentIndex > lastIndex, `${label} should mention ${step} in visible-copy order`);
    lastIndex = currentIndex;
  }
}

test("content quality gate doc defines reader, proof, and agent copy plus the visible-copy lane", () => {
  const gateDoc = read(path.join("docs", "process", "content-quality-gate.md"));

  assert.equal(gateDoc.includes("reader copy"), true);
  assert.equal(gateDoc.includes("proof copy"), true);
  assert.equal(gateDoc.includes("agent copy"), true);
  assert.equal(gateDoc.includes("No Brief, No Writing"), true);
  assert.equal(gateDoc.includes("`offer claim:`"), true, "content gate must document the owner-lane offer claim field");
  assert.equal(gateDoc.includes("Visible Copy Lane"), true);
  assertEditorialStepsInOrder(gateDoc, "content quality gate doc");
  assert.equal(gateDoc.includes("npm run lint:content"), true);
});

test("brief template carries the required content-gate inputs", () => {
  const briefTemplate = read(path.join("docs", "briefs", "_template.md"));

  for (const field of REQUIRED_BRIEF_FIELDS) {
    assert.equal(
      briefTemplate.includes(`- ${field}:`),
      true,
      `brief template should include ${field}`
    );
  }
});

test("repo instructions require the content gate and lint command for content PRs", () => {
  const agents = read("AGENTS.md");
  const claude = read("CLAUDE.md");
  const contentGate = read(path.join("docs", "agents", "rules", "content-gate.md"));
  const claudeContentRule = fs.readlinkSync(path.join(projectRoot, ".claude", "rules", "content-gate.md"));
  const reviewChecklist = read(path.join("docs", "process", "before-user-review-checklist.md"));
  const workflowPointer = claude.match(/\[[^\]]+\]\((AGENTS\.md)#required-batch-workflow\)/);
  assert.ok(workflowPointer, "CLAUDE must route content work to the canonical workflow");
  assert.equal(claude.includes("@AGENTS.md"), true);
  const canonicalWorkflow = read(workflowPointer[1]).split("## Required Batch Workflow")[1]?.split("\n## ")[0] || "";

  assert.equal(agents.includes("docs/agents/rules/content-gate.md"), true);
  assert.equal(claudeContentRule, "../../docs/agents/rules/content-gate.md");
  assert.match(contentGate, /^---\npaths:\n(?:  - .+\n)*  - "src\/\*\*\/\*\.njk"\n/);
  assert.equal(contentGate.includes("docs/process/content-quality-gate.md"), true);
  assert.equal(contentGate.includes("npm run lint:content"), true);
  assert.equal(agents.includes("npm run lint:content"), true);
  assertEditorialStepsInOrder(contentGate, "content gate rule");
  assertEditorialStepsInOrder(canonicalWorkflow, "canonical content workflow");
  assertEditorialStepsInOrder(reviewChecklist, "before user review checklist");
});
