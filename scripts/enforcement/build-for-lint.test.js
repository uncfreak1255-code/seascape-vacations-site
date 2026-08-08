const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");

const { BUILD_SCRIPT, formatBuildFailure, runBuildForLint } = require("./build-for-lint");

function fakeChild({ status = 0, signal = null, stdout = "", stderr = "", error = null }) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();

  process.nextTick(() => {
    child.stdout.end(stdout);
    child.stderr.end(stderr);
    if (error) {
      child.emit("error", error);
    } else {
      child.emit("close", status, signal);
    }
  });

  return child;
}

const quietOutput = {
  stdout: { write() {} },
  stderr: { write() {} }
};

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

test("signal kills never read as success", async () => {
  await assert.rejects(
    () =>
      runBuildForLint({
        output: quietOutput,
        spawn: () => fakeChild({ status: 0, signal: "SIGKILL" })
      }),
    /terminated by signal SIGKILL/
  );
});

test("spawn errors are actionable", async () => {
  await assert.rejects(
    () =>
      runBuildForLint({
        output: quietOutput,
        spawn: () => fakeChild({ error: new Error("spawn ENOENT") })
      }),
    /could not be started: spawn ENOENT/
  );
});

test("large output stays bounded while preserving the failure tail", async () => {
  const output = `HEAD diagnostic\n${"x".repeat(500000)}\nTAIL diagnostic\n`;

  await assert.rejects(
    () =>
      runBuildForLint({
        output: quietOutput,
        spawn: () => fakeChild({ status: 1, stdout: output })
      }),
    (error) => {
      assert.match(error.message, /HEAD diagnostic/);
      assert.match(error.message, /TAIL diagnostic/);
      assert.match(error.message, /output truncated for bounded evidence/);
      assert.ok(error.message.length < 200000, `evidence must be bounded, got ${error.message.length}`);
      return true;
    }
  );
});

test("successful runs capture the build entrypoint", async () => {
  const calls = [];
  const result = await runBuildForLint({
    cwd: "/tmp",
    output: quietOutput,
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return fakeChild({});
    }
  });

  assert.equal(result.status, 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [BUILD_SCRIPT]);
  assert.equal(calls[0].options.cwd, "/tmp");
  assert.deepEqual(calls[0].options.stdio, ["ignore", "pipe", "pipe"]);
});
