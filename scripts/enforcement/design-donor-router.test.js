const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const designLane = require("../design/seascape-design-lane");
const donorRouter = require("../design/design-donor-router");

const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

// Same description and source for every name, so only the name can change the rank.
function scoreWhenAlone(name) {
  const candidate = donorRouter.classifySkill({
    name,
    description: "Distinctive website and interface design.",
    path: `/${name}/SKILL.md`,
    source: "claude-plugin-cache",
    sourcePriority: 20,
  });
  const route = donorRouter.routeDesignTask("refresh the owner hero", {
    discovery: { roots: [], scannedSkillFiles: 1, candidates: [candidate] },
  });
  assert.equal(route.selectedDonors.length, 1, `${name} should be the one selected donor`);
  return route.selectedDonors[0].score;
}

test("frontend-design ranks no higher than a peer interface skill with the same metadata", () => {
  assert.equal(scoreWhenAlone("frontend-design"), scoreWhenAlone("web-design"));
});

test("the route, its report and the lane prompt point at the component catalog", () => {
  const route = donorRouter.routeDesignTask("refresh the owner hero", {
    discovery: { roots: [], scannedSkillFiles: 0, candidates: [] },
  });
  assert.match(route.chooseByTask, /Choose by task/);
  const prompt = designLane.buildPrompt({
    repoRoot: "/repo",
    taskText: "refresh the owner hero",
    taskName: "design-refresh-the-owner-hero",
    branchName: "codex/design-refresh-the-owner-hero",
    worktreePath: "/repo/.worktrees/design-refresh-the-owner-hero",
    designRoute: route,
  });

  for (const text of [donorRouter.formatRoute(route), prompt]) {
    assert.match(text, /Choose by task/);
    assert.match(text, /docs\/design\/component-patterns\.md/);
  }
});

test("the design rules carry the choose-by-task step and the process docs prefer no outside interface skill", () => {
  const rule = read("docs/agents/rules/design.md");
  assert.match(rule, /Choose by task/);
  assert.match(rule, /say why/);

  for (const doc of ["docs/process/design-review-workflow.md", "docs/process/seascape-design-studio.md"]) {
    const text = read(doc);
    assert.match(text, /[Cc]hoose by task/, `${doc} must point at the choose-by-task step`);
    assert.doesNotMatch(
      text,
      /donors are preferred for (?:a )?distinctive/,
      `${doc} must not prefer an outside skill for interface direction`
    );
  }
});

test("CLAUDE.md and AGENTS.md agree that the Emil craft skill is required", () => {
  assert.match(read("AGENTS.md"), /required Emil craft skill/);
  const claude = read("CLAUDE.md").replace(/\s+/g, " ");
  assert.match(claude, /`emil-design-eng` is the craft skill `docs\/agents\/rules\/design\.md` requires/);
});
