const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");

function readWorkflow(filename) {
  return fs.readFileSync(path.join(projectRoot, ".github", "workflows", filename), "utf8");
}

test("release safety preserves main coverage and both required check names", () => {
  const workflow = readWorkflow("release-safety.yml");

  assert.match(workflow, /pull_request:\s*\n\s+branches:/);
  assert.match(workflow, /push:\s*\n\s+branches:/);
  assert.match(workflow, /group:\s*release-safety-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
  assert.match(workflow, /release-safety:\s*\n\s+name:\s*release-safety/);
  assert.match(workflow, /timeout-minutes:\s*\d+/);
  assert.match(workflow, /\n  build:\s*\n\s+name:\s*build\s*\n\s+needs:\s*release-safety/);
  assert.match(workflow, /\n\s+if:\s*always\(\)/);
  assert.match(workflow, /needs\.release-safety\.result[^\n]+success/);
});

test("release safety audits dependency changes and runs tests without rebuilding", () => {
  const workflow = readWorkflow("release-safety.yml");
  const releaseVerifier = fs.readFileSync(
    path.join(projectRoot, "scripts", "enforcement", "verify-release.js"),
    "utf8"
  );

  assert.match(workflow, /Detect dependency manifest changes/);
  assert.match(workflow, /steps\.dependency_changes\.outputs\.changed == 'true'/);
  assert.match(workflow, /run:\s*npm run audit:deps/);
  assert.match(releaseVerifier, /label:\s*"test"[\s\S]*args:\s*\["run",\s*"test:unit"\]/);

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );
  assert.equal(
    packageJson.scripts["audit:deps"],
    "npm audit --audit-level=moderate --omit=dev"
  );
});

test("performance budget keeps PR proof and full scheduled proof bounded", () => {
  const workflow = readWorkflow("performance-budget.yml");

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /group:\s*performance-budget-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
  assert.match(workflow, /timeout-minutes:\s*\d+/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /run:\s*npm run perf:budget:check/);
  for (const assetPath of [
    '"images/**"',
    '"css/**"',
    '"js/**"',
    '"hero-optimized.jpg"',
    '"hero-mobile.jpg"',
    '"*.png"',
    '"*.webp"',
    '"*.avif"',
  ]) {
    assert.ok(workflow.includes(assetPath), `performance workflow should watch ${assetPath}`);
  }
});

test("visual regression cancels superseded pull request runs", () => {
  const workflow = readWorkflow("playwright-visual.yml");

  assert.match(workflow, /group:\s*playwright-visual-\$\{\{ github\.event\.pull_request\.number \}\}/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
});

test("self-hosted workflows keep untrusted branch code off Sawyer's Mac", () => {
  const visual = readWorkflow("playwright-visual.yml");
  const release = readWorkflow("release-safety.yml");
  const performance = readWorkflow("performance-budget.yml");
  const liveSmoke = readWorkflow("live-smoke.yml");
  const baselines = readWorkflow("update-visual-baselines.yml");

  for (const workflow of [visual, release, performance]) {
    assert.match(workflow, /pull_request\.author_association != 'OWNER'/);
    assert.match(workflow, /github\.actor != 'uncfreak1255-code'/);
    assert.match(workflow, /github\.triggering_actor != 'uncfreak1255-code'/);
  }

  assert.match(performance, /github\.triggering_actor != 'uncfreak1255-code'/);
  assert.match(liveSmoke, /github\.triggering_actor == 'uncfreak1255-code'/);
  assert.match(baselines, /github\.triggering_actor == 'uncfreak1255-code'/);
  assert.match(baselines, /github\.actor == 'uncfreak1255-code'/);
});

// These routing expressions use only string equality, booleans and &&/||,
// whose semantics match JavaScript for the non-empty string fixtures below.
function routingValues(filename, key, github) {
  const expressions = [...readWorkflow(filename).matchAll(
    new RegExp(`^ +${key}: \\$\\{\\{ (.+) \\}\\}$`, "gm")
  )];
  assert.ok(expressions.length, `${filename}: missing ${key} expressions`);
  return expressions.map(([, expression]) =>
    require("node:vm").runInNewContext(expression, { github }, { timeout: 100 })
  );
}

function ownerEvent(eventName, overrides = {}) {
  return {
    event_name: eventName,
    repository: "uncfreak1255-code/seascape-vacations-site",
    actor: "uncfreak1255-code",
    triggering_actor: "uncfreak1255-code",
    event: { pull_request: {
      head: { repo: { full_name: "uncfreak1255-code/seascape-vacations-site" } },
      author_association: "OWNER",
    } },
    ...overrides,
  };
}

test("actual PR routing selects the Mac only for trusted owner events", () => {
  for (const [file, hosted] of [
    ["release-safety.yml", "ubuntu-latest"],
    ["performance-budget.yml", "ubuntu-latest"],
    ["playwright-visual.yml", "macos-latest"],
  ]) {
    const trusted = ownerEvent("pull_request");
    for (const runner of routingValues(file, "runs-on", trusted)) {
      assert.equal(runner, "mac-sawbeck-seascape-vacations-site", file);
    }
    const fork = ownerEvent("pull_request");
    fork.event.pull_request.head.repo.full_name = "outsider/fork";
    const collaborator = ownerEvent("pull_request");
    collaborator.event.pull_request.author_association = "COLLABORATOR";
    for (const untrusted of [fork, collaborator,
      ownerEvent("pull_request", { actor: "outsider" }),
      ownerEvent("pull_request", { triggering_actor: "outsider" }),
      ownerEvent("pull_request", { actor: "uncfreak1255", triggering_actor: "uncfreak1255" }),
    ]) {
      for (const runner of routingValues(file, "runs-on", untrusted)) {
        assert.equal(runner, hosted, file);
      }
    }
  }
});

test("manual routing checks both actors and preserves scheduled routes", () => {
  const trusted = ownerEvent("workflow_dispatch", { event: {} });
  for (const file of ["live-smoke.yml", "update-visual-baselines.yml"]) {
    assert.ok(routingValues(file, "if", trusted).every(value => value === true));
    for (const field of ["actor", "triggering_actor"]) {
      const untrusted = { ...trusted, [field]: "outsider" };
      assert.ok(routingValues(file, "if", untrusted).every(value => value === false));
    }
  }
  assert.deepEqual(routingValues("performance-budget.yml", "runs-on", trusted),
    ["mac-sawbeck-seascape-vacations-site"]);
  for (const field of ["actor", "triggering_actor"]) {
    assert.deepEqual(routingValues("performance-budget.yml", "runs-on",
      { ...trusted, [field]: "outsider" }), ["ubuntu-latest"]);
  }
  const scheduled = ownerEvent("schedule", { event: {} });
  assert.deepEqual(routingValues("performance-budget.yml", "runs-on", scheduled),
    ["mac-sawbeck-seascape-vacations-site"]);
  assert.deepEqual(routingValues("live-smoke.yml", "if", scheduled), [true]);
  assert.ok(routingValues("release-safety.yml", "runs-on",
    ownerEvent("push", { event: {} })).every(value => value === "mac-sawbeck-seascape-vacations-site"));
});
