"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { loadRubric } = require(path.resolve(__dirname, "lib/rubric.js"));
const { computeOverall } = require(path.resolve(__dirname, "lib/score.js"));

const projectRoot = path.resolve(__dirname, "..", "..");
const RUBRIC_PATH = path.join(projectRoot, "docs/process/guest-stay-eval-rubric.md");
const CONFIG_PATH = path.join(__dirname, "evals.config.json");

// FULL live copy: the complete src/_data/seoPages.json vacationer geoIntro for
// anna-maria-island-homes-with-pool (all three paragraphs). It is NOT
// information-free — paragraph two names Bradenton, beach proximity, Seascape,
// 16-guest capacity, and the 10-15% direct-book saving. Its real failure is a
// buried answer behind a generic destination-admiration opener.
const CODEX_LIVE_COPY =
  "Anna Maria Island is one of Florida's most sought-after vacation destinations, and booking a private pool home nearby means getting the best of both worlds: Gulf Coast beach days and your own pool at night. Unlike crowded resort pools, Seascape's near-AMI private-pool homes offer privacy, heated water for year-round comfort, and enough space for the whole family to spread out. Located in Bradenton just minutes from Holmes Beach, Bradenton Beach, and Coquina Beach, our pool homes near Anna Maria Island range from practical family bases to spacious estates sleeping up to 16 guests. Every property is professionally managed by Seascape Vacations, a locally owned company with deep roots in the Bradenton-AMI corridor. When you book direct with us, you save 10-15% compared to Airbnb and VRBO - no service fees, no markups, just honest Gulf Coast hospitality. Whether you're planning a family beach vacation, a romantic couples getaway, or a multi-family reunion, our near-AMI pool homes deliver the space, privacy, and local support that make the trip easier to run.";

// Claude rewrite: decision-first, named drive times, stated tradeoff.
const CLAUDE_COPY =
  "A pool home near Anna Maria Island gets you the beach without the island's two real costs: nightly rates and parking. Seascape's homes sit in Bradenton, 10-15 minutes from Holmes Beach, Bradenton Beach, and Coquina Beach, close enough for a sunrise beach run, far enough that you get a private heated pool and room for up to 16 guests instead of a tight on-island condo. The tradeoff is plain: you give up a sand-out-the-front-door address, and in return you get more house, easier parking, and a lower total at checkout. Book direct with Seascape Vacations and you pay 10-15% less than the same dates on Airbnb or VRBO.";

test("guest rubric: loads and declares hard floors on the two required dimensions", () => {
  const rubric = loadRubric(RUBRIC_PATH);
  assert.equal(rubric.id, "guest-stay-quality");
  const byId = Object.fromEntries(rubric.dimensions.map((d) => [d.id, d]));
  assert.equal(byId["standalone-answer"].autoFailBelow, 2, "buried-answer hard floor");
  assert.equal(byId["information-gain"].autoFailBelow, 2, "zero-information-gain hard floor");
});

test("guest lane is wired and blocking in evals.config.json", () => {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const lane = config.lanes.find((l) => l.id === "guest");
  assert.ok(lane, "guest lane present");
  assert.equal(lane.blocking, true);
  assert.equal(lane.rubric, "docs/process/guest-stay-eval-rubric.md");
});

test("the content gate is blind to it, but the judge lane is not: live copy fails, rewrite passes", () => {
  const rubric = loadRubric(RUBRIC_PATH);

  // Honest judge verdict for the FULL live copy. information-gain is weak (2),
  // NOT zero — it has direct-book + capacity facts. The page fails on the buried
  // answer (standalone-answer 1, below its hard floor) and the slop opener.
  const codexScores = {
    "standalone-answer": 1,
    "information-gain": 2,
    "decision-first": 1,
    "factual-density": 4,
    "named-entity": 5,
    "no-fluff-intro": 1,
  };
  const codex = computeOverall(codexScores, rubric, CODEX_LIVE_COPY);
  assert.equal(codex.pass, false, "live AMI-pool copy must fail the judge lane");
  assert.ok(
    codex.autoFails.some((f) => f.startsWith("standalone-answer")),
    "fails on the buried answer (hard floor)"
  );
  assert.ok(
    codex.autoFails.includes("best of both worlds"),
    "fails on the slop-opener autoFail pattern"
  );
  assert.ok(
    !codex.autoFails.some((f) => f.startsWith("information-gain")),
    "does NOT fail on information-gain: the full copy is weak, not zero (honest framing)"
  );

  const claudeScores = {
    "standalone-answer": 5,
    "information-gain": 4,
    "decision-first": 5,
    "factual-density": 5,
    "named-entity": 5,
    "no-fluff-intro": 5,
  };
  const claude = computeOverall(claudeScores, rubric, CLAUDE_COPY);
  assert.equal(claude.pass, true, "Claude rewrite must pass");
  assert.equal(claude.autoFails.length, 0);
  assert.ok(claude.overall >= rubric.passFloor);
});

test("guest rubric: rejects an invalid autoFailBelow (validation guard)", () => {
  const bad = `# bad
\`\`\`json eval-spec
{
  "id": "x", "version": "1.0.0", "judgeModel": "claude-sonnet-4-6", "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": 1.0, "max": 5, "autoFailBelow": 9, "criteria": "c" }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmp = path.join(os.tmpdir(), `bad-rubric-${Date.now()}.md`);
  fs.writeFileSync(tmp, bad);
  assert.throws(() => loadRubric(tmp), /autoFailBelow must be an integer between 0 and 5/);
  fs.unlinkSync(tmp);
});
