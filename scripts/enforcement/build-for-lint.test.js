const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");

const { BUILD_SCRIPT, formatBuildFailure, runBuildForLint } = require("./build-for-lint");

function createFakeChild({ stdout = "", stderr = "", status = 0, signal = null, error = null }) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdout.setEncoding = () => {};
  child.stderr.setEncoding = () => {};

  queueMicrotask(() => {
    if (stdout) {
      child.stdout.emit("data", stdout);
    }
    if (stderr) {
      child.stderr.emit("data", stderr);
    }
    if (error) {
      child.emit("error", error);
    }
    child.emit("close", status, signal);
  });

  return child;
}

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
    () => runBuildForLint({ spawn: () => createFakeChild({ status: 0, signal: "SIGKILL" }) }),
    /terminated by signal SIGKILL/
  );
});

test("spawn errors are actionable", async () => {
  await assert.rejects(
    () => runBuildForLint({ spawn: () => createFakeChild({ error: new Error("spawn ENOENT"), status: null }) }),
    /ENOENT/
  );
});

test("successful runs capture the build entrypoint", async () => {
  const calls = [];
  const result = await runBuildForLint({
    cwd: "/tmp",
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return createFakeChild({ status: 0 });
    },
    writeStderr: () => {},
    writeStdout: () => {}
  });

  assert.equal(result.status, 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [BUILD_SCRIPT]);
  assert.equal(calls[0].options.cwd, "/tmp");
  assert.deepEqual(calls[0].options.stdio, ["ignore", "pipe", "pipe"]);
});

test("ENOBUFS streams output and preserves bounded head and tail evidence", async () => {
  const lines = `${Array.from({ length: 170 }, (_, index) => `line-${index}-${"x".repeat(40)}`).join("\n")}\n`;
  const error = Object.assign(new Error("spawn node ENOBUFS"), { code: "ENOBUFS" });
  const writtenStdout = [];
  let thrown;

  await assert.rejects(
    async () => {
      try {
        await runBuildForLint({
          spawn: () => createFakeChild({ stdout: lines, status: null, signal: "SIGTERM", error }),
          writeStderr: () => {},
          writeStdout: (chunk) => writtenStdout.push(chunk)
        });
      } catch (caught) {
        thrown = caught;
        throw caught;
      }
    },
    /ENOBUFS/
  );

  assert.equal(writtenStdout.join(""), lines);
  assert.match(thrown.message, /ENOBUFS/);
  assert.match(thrown.message, /line-0-/);
  assert.match(thrown.message, /line-169-/);
  assert.doesNotMatch(thrown.message, /line-85-/);
  assert.ok(thrown.message.length < 200000, `evidence must be bounded, got ${thrown.message.length} chars`);
});
