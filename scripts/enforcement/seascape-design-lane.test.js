const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const designLane = require("../design/seascape-design-lane");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("design critic skill keeps the blunt four-state taste gate", () => {
  const skill = read(".agents/skills/seascape-design-critic/SKILL.md");

  assert.match(skill, /^name: seascape-design-critic$/m);
  assert.match(skill, /generic SaaS card-grid energy/);
  assert.match(skill, /Reject/);
  assert.match(skill, /Needs another pass/);
  assert.match(skill, /Approved with edge/);
  assert.match(skill, /Approved/);
});

test("design specialist skill requires critic first and names donor lenses", () => {
  const skill = read(".agents/skills/seascape-design-specialist/SKILL.md");

  assert.match(skill, /^name: seascape-design-specialist$/m);
  assert.match(skill, /Run `seascape-design-critic` first/);
  assert.match(skill, /product-design:ideate/);
  assert.match(skill, /creative-production:moodboard-explorer/);
  assert.match(skill, /Figma is optional/);
});

test("design lane parser keeps --prepare and builds a stable task slug", () => {
  const parsed = designLane.parseArgs([
    "refresh",
    "the",
    "owner",
    "hero",
    "layout",
    "--prepare",
    "--allow-fallback",
  ]);

  assert.equal(parsed.taskText, "refresh the owner hero layout");
  assert.equal(parsed.options.prepareOnly, true);
  assert.equal(parsed.options.allowFallback, true);
  assert.equal(designLane.parseArgs(["--help"]).options.help, true);
  assert.equal(
    designLane.buildTaskName("Refresh the owner hero layout"),
    "design-refresh-the-owner-hero-layout"
  );
  assert.equal(
    designLane.deriveRepoRoot("/repo/.worktrees/design-hero", "../../.git"),
    "/repo"
  );
});

test("design lane prompt wires the repo-local skills and proof contract", () => {
  const prompt = designLane.buildPrompt({
    repoRoot: "/repo",
    taskText: "refresh the owner hero layout",
    taskName: "design-refresh-the-owner-hero-layout",
    branchName: "codex/design-refresh-the-owner-hero-layout",
    worktreePath: "/repo/.worktrees/design-refresh-the-owner-hero-layout",
  });

  assert.match(prompt, /seascape-design-specialist/);
  assert.match(prompt, /seascape-design-critic/);
  assert.match(prompt, /product-design:audit/);
  assert.match(prompt, /npm run test:visual/);
  assert.match(prompt, /Figma is optional/);
});

test("design lane worktree parser finds existing linked worktrees", () => {
  const parsed = designLane.parseWorktreeList(
    [
      "worktree /repo",
      "HEAD 123",
      "branch refs/heads/main",
      "",
      "worktree /repo/.worktrees/design-owner-hero",
      "HEAD 456",
      "branch refs/heads/codex/design-owner-hero",
      "",
    ].join("\n")
  );

  assert.equal(
    designLane.findWorktreePathForBranch(parsed, "codex/design-owner-hero"),
    "/repo/.worktrees/design-owner-hero"
  );
});

test("design workflow docs and claude compatibility layer advertise the local lane", () => {
  const agents = read("AGENTS.md");
  const workflow = read("docs/process/design-review-workflow.md");
  const studio = read("docs/process/seascape-design-studio.md");
  const readme = read(".claude/skills/README.md");
  const packageJson = read("package.json");
  const criticLink = fs.readlinkSync(
    path.join(projectRoot, ".claude/skills/seascape-design-critic")
  );
  const specialistLink = fs.readlinkSync(
    path.join(projectRoot, ".claude/skills/seascape-design-specialist")
  );

  assert.match(agents, /seascape-design-specialist/);
  assert.match(agents, /npm run design:lane/);
  assert.match(workflow, /seascape-design-critic/);
  assert.match(workflow, /npm run design:lane/);
  assert.match(studio, /creative-production:scene-explorer/);
  assert.match(studio, /--allow-fallback/);
  assert.match(studio, /Do not implement from `Reject` or `Needs another pass`/);
  assert.match(readme, /seascape-design-specialist/);
  assert.match(packageJson, /"design:lane": "\.\/scripts\/design\/codex-seascape-design"/);
  assert.equal(criticLink, "../../.agents/skills/seascape-design-critic");
  assert.equal(specialistLink, "../../.agents/skills/seascape-design-specialist");
});
