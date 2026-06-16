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

test("owner outbound batch skill is draft-only and uses approved owner proof", () => {
  const skill = read(".agents/skills/owner-outbound-batch/SKILL.md");

  assert.match(skill, /^name: owner-outbound-batch$/m);
  assert.match(skill, /This skill drafts only; it never sends/i);
  assert.match(skill, /src\/_data\/ownerProofAssets\.json/);
  assert.match(skill, /\/research\/owner-fee-revenue-leak-benchmark-2026\//);
  assert.match(skill, /Never send outreach/);
  assert.match(skill, /Never schedule or automate sends/);
  assert.match(skill, /Never count a draft, prepared row, sent message, test send, labeled send, or internal helper submit as owner demand/);
});

test("owner outbound batch skill refuses bad prospect and tool expansion paths", () => {
  const skill = read(".agents/skills/owner-outbound-batch/SKILL.md");

  assert.match(skill, /generic property-management outreach rather than homeowner outreach/);
  assert.match(skill, /private, guessed, scraped, or not reopenable/);
  assert.match(skill, /Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard/);
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
