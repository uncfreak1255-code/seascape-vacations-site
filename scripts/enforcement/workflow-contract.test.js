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

test("production Netlify Blobs stays on the audit-safe dependency line", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );
  const lockfile = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package-lock.json"), "utf8")
  );
  const packages = lockfile.packages;

  assert.equal(packageJson.dependencies["@netlify/blobs"], "9.1.5");
  assert.equal(packages["node_modules/@netlify/blobs"].version, "9.1.5");
  assert.equal(packages["node_modules/@netlify/dev-utils"].version, "3.1.1");
  assert.equal(packages["node_modules/image-size"], undefined);
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
