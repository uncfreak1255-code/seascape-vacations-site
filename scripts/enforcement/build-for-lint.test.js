const test = require("node:test");
const assert = require("node:assert/strict");

const { BUILD_SCRIPT, formatBuildFailure, runBuildForLint } = require("./build-for-lint");

test("build failure message carries stderr and status", () => {
  const message = formatBuildFailure({
    status: 1,
    signal: null,
    stdout: "",
    stderr: "Another repo-wide build or release check is already running in this worktree.\n"
  });

  assert.match(message, /already running in this worktree/);
  assert.match(message, /exited with code 1/);
});

test("build failure message carries stdout when stderr is empty", () => {
  const message = formatBuildFailure({
    status: 2,
    stdout: "validate-properties-availability-output: missing availability rows\n",
    stderr: ""
  });

  assert.match(message, /missing availability rows/);
  assert.match(message, /exited with code 2/);
});

test("build failure message reports no output plainly", () => {
  const message = formatBuildFailure({ status: 1, stdout: "", stderr: "" });

  assert.match(message, /produced no output/);
  assert.ok(!message.includes("undefined"));
});

test("build failure message preserves both streams and bounds long lines", () => {
  const message = formatBuildFailure({
    status: 1,
    stdout: "FATAL: availability output validation failed\n",
    stderr: `${"x".repeat(500000)}\n`
  });

  assert.match(message, /FATAL: availability output validation failed/);
  assert.ok(message.length < 200000, `evidence must be bounded, got ${message.length} chars`);
});

test("signal kills never read as success", () => {
  assert.throws(
    () => runBuildForLint({ spawn: () => ({ status: 0, signal: "SIGKILL", stdout: "", stderr: "" }) }),
    /terminated by signal SIGKILL/
  );
});

test("spawn errors are actionable", () => {
  assert.throws(
    () => runBuildForLint({ spawn: () => ({ error: new Error("spawn ENOENT"), status: null }) }),
    /could not be started: spawn ENOENT/
  );
});

test("successful runs capture the build entrypoint", () => {
  const calls = [];
  const result = runBuildForLint({
    cwd: "/tmp",
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, signal: null, stdout: "", stderr: "" };
    }
  });

  assert.equal(result.status, 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [BUILD_SCRIPT]);
  assert.equal(calls[0].options.cwd, "/tmp");
  assert.deepEqual(calls[0].options.stdio, ["ignore", "pipe", "pipe"]);
});
