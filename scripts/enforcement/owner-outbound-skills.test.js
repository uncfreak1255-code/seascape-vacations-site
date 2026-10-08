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

test("owner opportunity intake skill retains approved proof boundaries", () => {
  const skill = read(".agents/skills/owner-opportunity-intake/SKILL.md");

  assert.match(skill, /^name: owner-opportunity-intake$/m);
  assert.match(skill, /This skill never sends\./);
  assert.match(skill, /Drafts exist only inside an[\s\S]+approved batch/);
  assert.match(skill, /docs\/status\/owner-direct-intake-policy\.md/);
  assert.match(skill, /src\/_data\/ownerProofAssets\.json/);
  assert.match(skill, /\/research\/owner-fee-revenue-leak-benchmark-2026\//);
  assert.match(skill, /Never send outreach/);
  assert.match(skill, /Never schedule or automate sends or follow-ups/);
  assert.match(skill, /Never create a mailbox draft or personalized outreach draft outside a batch/);
  assert.match(skill, /Never build an email, phone,[\s\S]+or text contact from a property record/);
  assert.match(skill, /Never name software or vendors/);
  assert.match(skill, /Never persist a named candidate, permission receipt, fit note, or contact/);
  assert.match(skill, /Never count a qualification decision, prepared message, sent message, test send,/);
});

test("owner opportunity intake refuses platform-only, permissionless, and tool-expansion paths", () => {
  const skill = read(".agents/skills/owner-opportunity-intake/SKILL.md");

  assert.match(skill, /Airbnb, Vrbo, Booking\.com, or another OTA host-message/);
  assert.match(skill, /property listing, directory, property record, or[\s\S]+without an invitation to contact/);
  assert.match(skill, /private, guessed, scraped, purchased, enriched, or not[\s\S]+reopenable/);
  assert.match(skill, /generic property-management target rather than an owner or[\s\S]+authorized representative/);
  assert.match(skill, /no explicit contact permission or invitation exists/);
  assert.match(skill, /Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard/);
});

test("owner outbound archive holds OTA-only candidates and points to a public qualification policy", () => {
  const archive = read("docs/status/owner-outbound.md");
  const policy = read("docs/status/owner-direct-intake-policy.md");

  assert.match(archive, /research-only archive — HOLD \/ DO NOT SEND/);
  assert.match(archive, /Airbnb- and Vrbo-only host-message paths are \*\*not approved outreach paths\*\*/);
  assert.match(archive, /Previous platform-message drafts are intentionally retired/);
  assert.match(archive, /Owner-Direct Intake Policy/);
  assert.match(archive, /Named prospects, listing URLs, contact-path labels/);
  assert.doesNotMatch(archive, /https?:\/\//);
  assert.match(policy, /public policy only - no candidate records - batch approval required/);
  assert.match(policy, /Agents never send/);
  assert.match(policy, /Airbnb, Vrbo, Booking\.com, or other OTA host-message surfaces/);
  assert.match(policy, /must never contain a named candidate record/);
});

test("skill policy records the permissioned-intake authority and audit receipt", () => {
  const policy = read("docs/process/skill-policy.md");

  assert.match(policy, /use `owner-opportunity-intake` to qualify owner-direct,[\s\S]+with drafts only inside[\s\S]+a batch that Sawyer approved/);
  assert.match(policy, /2026-10-07 — owner-intake policy version 2/);
  assert.match(policy, /2026-07-17 — restricted `owner-outbound-batch` to permissioned intake/);
  assert.match(policy, /Agent-surface audit verdict: \*\*KEEP\*\*/);
  assert.match(policy, /create no new[\s\S]+agent, skill, workflow, scraper, or automation/);
  assert.match(policy, /website repository is public/);
  assert.match(policy, /never persists a named candidate/);
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
