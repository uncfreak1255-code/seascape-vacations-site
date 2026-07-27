const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");

const projectRoot = path.resolve(__dirname, "..", "..");
const EVALS_DIR = path.resolve(__dirname);
// Use the node binary running this test, not a hardcoded path — the absolute
// path differs across machines and CI runners (a hardcoded path makes
// spawnSync fail with status null off this container).
const NODE = process.execPath;

function runScript(scriptPath, args = [], env = {}) {
  const result = spawnSync(NODE, [scriptPath, ...args], {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    status: result.status,
  };
}

test("run-owner-eval.js: exits 0 with a skip message when no API key is set", () => {
  const { stdout, status } = runScript(path.join(EVALS_DIR, "run-owner-eval.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0, `Expected exit 0, got ${status}`);
  assert.ok(
    stdout.includes("[skip]") || stdout.includes("skip"),
    `Expected skip message, got: ${stdout}`
  );
});

test("run-aeo-eval.js: exits 0 with a skip message when no API key is set", () => {
  const { stdout, status } = runScript(path.join(EVALS_DIR, "run-aeo-eval.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0, `Expected exit 0, got ${status}`);
  assert.ok(
    stdout.includes("[skip]") || stdout.includes("skip"),
    `Expected skip message, got: ${stdout}`
  );
});

test("lint-evals.js: exits 0 when no API key is set", () => {
  const { stdout, status } = runScript(path.join(EVALS_DIR, "lint-evals.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0, `Expected exit 0, got ${status}. stdout: ${stdout}`);
});

test("lint-evals.js: exits 0 with no API key (skip judge mode)", () => {
  const { stdout, status } = runScript(path.join(EVALS_DIR, "lint-evals.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0);
  // Should mention skipping or rubric not authored
  assert.ok(
    stdout.includes("skip") || stdout.includes("[skip"),
    `Expected skip indication, got: ${stdout}`
  );
});

test("anthropic-client: refuses opus model at creation time", () => {
  const script = `
const { createClient } = require(${JSON.stringify(path.join(EVALS_DIR, "lib/anthropic-client.js"))});
try {
  createClient({ apiKey: "test", model: "claude-opus-4-8" });
  process.exit(1); // should not reach here
} catch (e) {
  if (e.message.includes("Opus") || e.message.includes("opus")) {
    process.exit(0);
  }
  process.exit(2);
}
`;
  const tmpScript = path.join(EVALS_DIR, "__fixtures__", "_test-opus-refuse.js");
  fs.writeFileSync(tmpScript, script, "utf8");
  const result = spawnSync(NODE, [tmpScript], { encoding: "utf8" });
  fs.unlinkSync(tmpScript);
  assert.equal(result.status, 0, `createClient should throw for opus model. Got status ${result.status}, stderr: ${result.stderr}`);
});

test("evals.config.json: has correct structure", () => {
  const configPath = path.join(EVALS_DIR, "evals.config.json");
  assert.ok(fs.existsSync(configPath), "evals.config.json must exist");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.ok(Array.isArray(config.lanes), "lanes must be an array");
  assert.equal(config.lanes.length, 3, "should have 3 lanes");
  const owner = config.lanes.find((l) => l.id === "owner");
  const aeo = config.lanes.find((l) => l.id === "aeo");
  assert.ok(owner, "owner lane must exist");
  assert.ok(aeo, "aeo lane must exist");
  assert.equal(owner.blocking, true, "owner lane must be blocking");
  assert.equal(aeo.blocking, false, "aeo lane must be non-blocking");
  const guest = config.lanes.find((l) => l.id === "guest");
  assert.ok(guest, "guest lane must exist");
  assert.equal(guest.blocking, true, "guest lane must be blocking");
  assert.ok(Array.isArray(owner.targets), "owner targets must be array");
  assert.ok(Array.isArray(aeo.targets), "aeo targets must be array");
  assert.ok(
    owner.targets.includes("src/_data/seoPages.json"),
    "owner lane must include data-backed owner page copy"
  );
  assert.ok(
    owner.targets.includes("src/research/owner-fee-revenue-leak-benchmark-2026.njk"),
    "owner lane must include the owner fee research route"
  );
  assert.ok(Array.isArray(owner.dataSources), "owner lane must define dataSources");
  assert.ok(typeof owner.rubric === "string");
  assert.ok(typeof aeo.rubric === "string");
});

// Fix 6 & 7: missing/renamed lane skip, --require with no key → nonzero for blocking lanes

test("run-owner-eval.js: exits 0 (skip) with no API key", () => {
  // Rubric does not exist → skip exit 0 regardless of key
  const { stdout, status } = runScript(path.join(EVALS_DIR, "run-owner-eval.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0, `Expected exit 0, got ${status}`);
  assert.ok(stdout.includes("skip"), `Expected skip message, got: ${stdout}`);
});

test("lint-evals.js: missing-rubric skip exits 0", () => {
  const { stdout, status } = runScript(path.join(EVALS_DIR, "lint-evals.js"), [], {
    ANTHROPIC_API_KEY: "",
  });
  assert.equal(status, 0, `Expected exit 0, got ${status}. stdout: ${stdout}`);
  assert.ok(stdout.includes("skip"), `Expected skip mention, got: ${stdout}`);
});

test("lint-evals.js: --require with no API key exits nonzero for blocking lane (if rubric exists)", () => {
  // The owner rubric (docs/process/owner-copy-eval-rubric.md) is authored, so the
  // blocking owner lane reaches the key check; --require with no key must fail it.
  // The repo-state-independent version of this is covered by the
  // "run-lane: --require ... returns failure for blocking lane" test below.
  const { status, stdout } = runScript(path.join(EVALS_DIR, "lint-evals.js"), ["--require"], {
    ANTHROPIC_API_KEY: "",
  });
  assert.notEqual(status, 0, `Expected nonzero exit with --require and no key when the owner rubric exists, got ${status}. stdout: ${stdout}`);
});

test("run-lane: missing/undefined lane config results in skip exit 0 for run-owner-eval", () => {
  // Simulate a missing lane ID by using a temp script
  const tempScript = `
const { runLane } = require(${JSON.stringify(path.join(EVALS_DIR, "lib/run-lane.js"))});
runLane(undefined, { apiKey: "", require: false }).then(r => {
  if (r.skipped && r.ok) process.exit(0);
  process.exit(1);
}).catch(() => process.exit(2));
`;
  const tmpPath = path.join(EVALS_DIR, "__fixtures__", "_test-missing-lane.js");
  fs.writeFileSync(tmpPath, tempScript, "utf8");
  const result = spawnSync(NODE, [tmpPath], { encoding: "utf8" });
  fs.unlinkSync(tmpPath);
  assert.equal(result.status, 0, `Expected exit 0 for missing lane, got ${result.status}. stderr: ${result.stderr}`);
});

test("run-lane: --require with no API key returns failure for blocking lane (when rubric exists)", () => {
  // Create a minimal valid rubric, run runLane with require=true, no key
  // and verify ok=false is returned.
  const rubricMd = `# Require test rubric
\`\`\`json eval-spec
{
  "id": "require-test",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [{ "id": "a", "weight": 1.0, "max": 5, "criteria": "Test." }],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpRubricPath = path.join(EVALS_DIR, "__fixtures__", "_require-test-rubric.md");
  fs.writeFileSync(tmpRubricPath, rubricMd, "utf8");
  // The rubric path relative to projectRoot (as used by run-lane)
  const rubricRelPath = path.relative(projectRoot, tmpRubricPath);
  const tempScript = `
const { runLane } = require(${JSON.stringify(path.join(EVALS_DIR, "lib/run-lane.js"))});
const lane = {
  id: "require-test",
  rubric: ${JSON.stringify(rubricRelPath)},
  golden: "scripts/evals/golden/owner",
  targets: ["src/property-management/**/*.njk"],
  blocking: true
};
runLane(lane, { apiKey: "", require: true }).then(r => {
  if (!r.ok) process.exit(0); // ok=false means failure was correctly detected
  process.exit(1);
}).catch((e) => {
  process.exit(2);
});
`;
  const tmpScriptPath = path.join(EVALS_DIR, "__fixtures__", "_test-require-flag.js");
  fs.writeFileSync(tmpScriptPath, tempScript, "utf8");
  const result = spawnSync(NODE, [tmpScriptPath], { encoding: "utf8", cwd: projectRoot });
  fs.unlinkSync(tmpScriptPath);
  try { fs.unlinkSync(tmpRubricPath); } catch (_) {}
  assert.equal(result.status, 0, `Expected runLane to return ok=false for require+no-key. Got status ${result.status}, stderr: ${result.stderr}`);
});
