const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function expectFixture(skill, fixture, expected) {
  const rowPattern = new RegExp(
    `\\| ${fixture} \\|[^\\n]+\\| \`${expected}\` \\|`,
  );
  assert.match(skill, rowPattern);
}

test("owner outbound skill is permissioned-intake only and retains approved proof boundaries", () => {
  const skill = read(".agents/skills/owner-outbound-batch/SKILL.md");

  assert.match(skill, /^name: owner-outbound-batch$/m);
  assert.match(skill, /This skill never sends or creates outreach drafts/i);
  assert.match(skill, /docs\/status\/owner-direct-outbound\.md/);
  assert.match(skill, /src\/_data\/ownerProofAssets\.json/);
  assert.match(skill, /\/research\/owner-fee-revenue-leak-benchmark-2026\//);
  assert.match(skill, /Never send outreach/);
  assert.match(skill, /Never schedule or automate sends or follow-ups/);
  assert.match(skill, /Never create a mailbox draft or prospect-facing outreach draft/);
  assert.match(skill, /Never count an intake row, prepared message, sent message, test send,/);
});

test("owner outbound skill refuses platform-only, permissionless, and tool-expansion paths", () => {
  const skill = read(".agents/skills/owner-outbound-batch/SKILL.md");

  assert.match(skill, /Airbnb, Vrbo, Booking\.com, or another OTA host-message/);
  assert.match(skill, /property listing, directory, property record, or[\s\S]+without an invitation to contact/);
  assert.match(skill, /private, guessed, scraped, purchased, enriched, or not[\s\S]+reopenable/);
  assert.match(skill, /generic property-management target rather than an owner or[\s\S]+authorized representative/);
  assert.match(skill, /no explicit contact permission or invitation exists/);
  assert.match(skill, /Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard/);
});

test("owner outbound archive holds OTA-only candidates and points to a permissioned list", () => {
  const archive = read("docs/status/owner-outbound.md");
  const intake = read("docs/status/owner-direct-outbound.md");

  assert.match(archive, /research-only archive — HOLD \/ DO NOT SEND/);
  assert.match(archive, /Airbnb- and Vrbo-only host-message paths are \*\*not approved outreach paths\*\*/);
  assert.match(archive, /Previous platform-message drafts are intentionally retired/);
  assert.match(archive, /Owner-Direct, Permissioned Outbound List/);
  assert.match(intake, /intake-only — empty — founder review required/);
  assert.match(intake, /No outbound message may be drafted, sent, scheduled, automated/);
  assert.match(intake, /Airbnb, Vrbo, Booking\.com, or other OTA host-message surfaces/);
  assert.match(intake, /No qualified owner-direct, permissioned prospect is currently recorded/);
});

test("skill policy records the permissioned-intake authority and audit receipt", () => {
  const policy = read("docs/process/skill-policy.md");

  assert.match(policy, /use `owner-outbound-batch` to qualify owner-direct,[\s\S]+permissioned signals without creating outreach drafts/);
  assert.match(policy, /2026-07-17 — restricted `owner-outbound-batch` to permissioned intake/);
  assert.match(policy, /Agent-surface audit verdict: \*\*KEEP\*\*/);
  assert.match(policy, /create no new[\s\S]+agent, skill, workflow, scraper, or automation/);
  assert.match(policy, /require Sawyer's separate approval/);
});

test("owner reply intake skill refuses test and labeled demand evidence", () => {
  const skill = read(".agents/skills/owner-reply-intake/SKILL.md");

  assert.match(skill, /^name: owner-reply-intake$/m);
  assert.match(skill, /The real guard is the Hub register Validation Standard plus this intake refusal/);
  assert.match(skill, /proof-label-blind `owner_form_submits` counter is not enough/);
  assert.match(skill, /Any TEST, labeled, internal, helper, or synthetic signal is refused/);
  expectFixture(skill, "test-labeled-submit", "REFUSE_TEST");
  expectFixture(skill, "internal-helper-submit", "REFUSE_TEST");
});

test("owner reply intake skill marks email-origin demand provisional", () => {
  const skill = read(".agents/skills/owner-reply-intake/SKILL.md");

  assert.match(skill, /Mark email-origin demand `PROVISIONAL_EMAIL`/);
  expectFixture(skill, "email-origin-complete", "PROVISIONAL_EMAIL");
});

test("owner reply intake skill allows register rows only with the full validation standard", () => {
  const skill = read(".agents/skills/owner-reply-intake/SKILL.md");

  assert.match(skill, /unlabeled owner signal with named pain, source, date\/window, next action, and reopenable evidence path/);
  expectFixture(skill, "sent-row-only", "REFUSE_INCOMPLETE");
  expectFixture(skill, "vague-reply", "REFUSE_INCOMPLETE");
  expectFixture(skill, "unlabeled-complete", "REAL_REGISTER_READY");
});

test("owner reply intake skill writes only to the hand-authored Hub register region", () => {
  const skill = read(".agents/skills/owner-reply-intake/SKILL.md");

  assert.match(skill, /only inside the hand-authored `## Register` section/);
  assert.match(skill, /Never edit the generated `owner-receipt-projection` block by hand/);
  assert.match(skill, /ingest-verification-receipts\.py/);
});
