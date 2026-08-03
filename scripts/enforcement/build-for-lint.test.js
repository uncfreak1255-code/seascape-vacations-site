const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  BUILD_SCRIPT,
  formatBuildFailure,
  readFailureTail,
  runBuildForLint
} = require("./build-for-lint");

// Regression: the content lint used to shell out with stdio "inherit", so a
// failing build threw `Command failed: node scripts/enforcement/build-site.js`
// with stdout and stderr both null. A held worktree lock then read as a
// content-lint defect, and the real cause never reached the proof gate.
test("build failure message carries the child stderr instead of dropping it", () => {
  const message = formatBuildFailure({
    status: 1,
    signal: null,
    stdout: "",
    stderr:
      "Another repo-wide build or release check is already running in this worktree (pid 4242).\n"
  });

  assert.match(message, /already running in this worktree/);
  assert.match(message, /pid 4242/);
  assert.match(message, /exited with code 1/);
});

test("build failure message falls back to stdout when stderr is empty", () => {
  const message = formatBuildFailure({
    status: 2,
    stdout: "validate-properties-availability-output: missing availability rows\n",
    stderr: ""
  });

  assert.match(message, /missing availability rows/);
  assert.match(message, /exited with code 2/);
});

test("build failure message says so plainly when the child produced no output", () => {
  const message = formatBuildFailure({ status: 1, stdout: "", stderr: "" });

  assert.match(message, /produced no output/);
  assert.ok(!message.includes("undefined"));
});

test("build failure message names the signal when the child was killed", () => {
  const message = formatBuildFailure({ status: null, signal: "SIGKILL", stderr: "" });

  assert.match(message, /terminated by signal SIGKILL/);
});

test("runBuildForLint throws with the child stderr on a non-zero exit", () => {
  const spawn = () => ({
    status: 1,
    signal: null,
    stdout: "",
    stderr: "Another repo-wide build or release check is already running in this worktree (pid 99).\n"
  });

  assert.throws(
    () => runBuildForLint({ cwd: "/tmp", spawn }),
    /already running in this worktree/
  );
});

test("runBuildForLint reports a spawn error instead of a bare exit code", () => {
  const spawn = () => ({ error: new Error("spawn ENOENT"), status: null });

  assert.throws(() => runBuildForLint({ cwd: "/tmp", spawn }), /could not be started: spawn ENOENT/);
});

test("runBuildForLint returns the result and runs the build script on success", () => {
  const calls = [];
  const spawn = (command, args, options) => {
    calls.push({ command, args, options });
    return { status: 0, stdout: "", stderr: "" };
  };

  const result = runBuildForLint({ cwd: "/tmp", spawn });

  assert.equal(result.status, 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [BUILD_SCRIPT]);
  assert.equal(calls[0].options.cwd, "/tmp");
  assert.equal(calls[0].options.encoding, "utf8");
});

test("readFailureTail keeps only the bounded end of a streamed build log", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "build-for-lint-tail-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const logPath = path.join(directory, "build.log");
  fs.writeFileSync(logPath, `${"x".repeat(100_000)}\nlast useful failure\n`);

  const tail = readFailureTail(logPath);
  assert.match(tail, /last useful failure/);
  assert.ok(Buffer.byteLength(tail, "utf8") <= 64 * 1024);
});
