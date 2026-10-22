const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const missingTarget = "src/property-management/__missing-eval-target__.njk";

function evaluate({ blocking = true, explicitFiles = [missingTarget], changedFiles = [] } = {}) {
  // Isolate target discovery and block all network access while exercising the
  // real runner, rubric validation, lane filtering and client construction.
  const script = `
    const childProcess = require("node:child_process");
    childProcess.execSync = (command) => command.startsWith("git merge-base")
      ? "fixture-base\\n" : ${JSON.stringify(changedFiles.join("\n"))};
    let requests = 0;
    global.fetch = async () => {
      requests++;
      throw new Error("Network forbidden in offline eval regression");
    };
    const { runLane } = require("./scripts/evals/lib/run-lane.js");
    const { lanes } = require("./scripts/evals/evals.config.json");
    const lane = { ...lanes.find((lane) => lane.id === "owner"), blocking: ${blocking} };
    runLane(lane, {
      apiKey: "offline-test-key",
      explicitFiles: ${JSON.stringify(explicitFiles)}
    }).then((result) => console.log(JSON.stringify({ result, requests })));
  `;
  const child = spawnSync(process.execPath, ["-e", script], {
    cwd: projectRoot,
    env: { ...process.env, ANTHROPIC_API_KEY: "" },
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.equal(child.status, 0, child.stderr);
  const { result, requests } = JSON.parse(child.stdout.trim().split("\n").at(-1));
  assert.equal(requests, 0, "target validation must not call the model");
  return result;
}

test("blocking eval fails for an explicitly requested missing target", () => {
  const result = evaluate();
  assert.equal(result.ok, false);
  assert.equal(result.skipped, false);
  assert.deepEqual(result.failures, [missingTarget]);
});

test("score-only eval remains non-blocking for an explicitly requested missing target", () => {
  assert.equal(evaluate({ blocking: false }).ok, true);
});

test("blocking eval permits deleted targets discovered from the Git diff", () => {
  const result = evaluate({ explicitFiles: [], changedFiles: [missingTarget] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
});

test("blocking eval permits explicit files outside its lane", () => {
  const result = evaluate({ explicitFiles: ["docs/unrelated.md"] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
});
