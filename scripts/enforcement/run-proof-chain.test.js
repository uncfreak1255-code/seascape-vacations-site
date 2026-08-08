const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");

const { DEFAULT_COMMANDS, runProofChain } = require("./run-proof-chain");

const RUNNER_MODULE_PATH = path.join(__dirname, "run-proof-chain.js");

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// These budgets cover process startup, not the property under test. The whole
// suite runs test files in parallel, so two workers each spawning their own
// child can easily need more than 5s just to reach the inspect stage on a
// saturated machine - which timed the test out before it asserted anything.
// The serialization assertion below is unchanged and still strict.
const STARTUP_TIMEOUT_MS = 30000;

function waitForFile(filePath, timeoutMs = STARTUP_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) {
      return;
    }

    sleepSync(10);
  }

  throw new Error(`expected ${filePath} to appear`);
}

function waitForChild(child, timeoutMs = STARTUP_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null) {
      resolve(child.exitCode);
      return;
    }

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`child process did not exit within ${timeoutMs}ms`));
    }, timeoutMs);

    child.once("exit", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });
}

function proofCommandSource({ siteDir, label, buildStartedPath, inspectStartedPath, logPath }) {
  const buildCommand = `
    const fs = require("node:fs");
    fs.rmSync(${JSON.stringify(siteDir)}, { recursive: true, force: true });
    fs.mkdirSync(${JSON.stringify(siteDir)}, { recursive: true });
    fs.writeFileSync(${JSON.stringify(path.join(siteDir, "index.html"))}, ${JSON.stringify(label)});
    fs.writeFileSync(${JSON.stringify(buildStartedPath)}, "");
  `;
  const inspectCommand = `
    const fs = require("node:fs");
    fs.writeFileSync(${JSON.stringify(inspectStartedPath)}, "");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    const seen = fs.readFileSync(${JSON.stringify(path.join(siteDir, "index.html"))}, "utf8");
    fs.appendFileSync(${JSON.stringify(logPath)}, ${JSON.stringify(label)} + ":" + seen + String.fromCharCode(10));
    if (seen !== ${JSON.stringify(label)}) process.exitCode = 1;
  `;

  return [
    { command: process.execPath, args: ["-e", buildCommand] },
    { command: process.execPath, args: ["-e", inspectCommand] }
  ];
}

function startProofWorker({ projectRootDir, lockRootDir, commands }) {
  const source = `
    const { runProofChain } = require(${JSON.stringify(RUNNER_MODULE_PATH)});
    runProofChain({
      projectRootDir: ${JSON.stringify(projectRootDir)},
      lockOptions: {
        lockRootDir: ${JSON.stringify(lockRootDir)},
        pollIntervalMs: 10,
        waitTimeoutMs: 5000
      },
      commands: ${JSON.stringify(commands)}
    });
  `;

  return spawn(process.execPath, ["-e", source], {
    stdio: "ignore"
  });
}

test(".keel verify delegates the full chain to one proof runner", () => {
  const keelVerify = fs.readFileSync(path.join(__dirname, "..", "..", ".keel", "verify"), "utf8");

  assert.match(keelVerify, /run-proof-chain\.js/);
  assert.deepEqual(DEFAULT_COMMANDS, [
    { command: "npm", args: ["run", "lint:content"] },
    { command: "npm", args: ["test"] },
    { command: "npm", args: ["run", "verify:links"] }
  ]);
});

test("overlapping proof chains cannot rewrite _site during rendered inspection", async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-proof-chain-"));
  const lockRootDir = path.join(rootDir, "locks");
  const siteDir = path.join(rootDir, "_site");
  const firstBuildStartedPath = path.join(rootDir, "first-build-started");
  const firstInspectStartedPath = path.join(rootDir, "first-inspect-started");
  const secondBuildStartedPath = path.join(rootDir, "second-build-started");
  const secondInspectStartedPath = path.join(rootDir, "second-inspect-started");
  const logPath = path.join(rootDir, "inspection.log");
  const firstCommands = proofCommandSource({
    siteDir,
    label: "first",
    buildStartedPath: firstBuildStartedPath,
    inspectStartedPath: firstInspectStartedPath,
    logPath
  });
  const secondCommands = proofCommandSource({
    siteDir,
    label: "second",
    buildStartedPath: secondBuildStartedPath,
    inspectStartedPath: secondInspectStartedPath,
    logPath
  });

  const first = startProofWorker({
    projectRootDir: rootDir,
    lockRootDir,
    commands: firstCommands
  });
  let second;

  try {
    waitForFile(firstInspectStartedPath);
    second = startProofWorker({
      projectRootDir: rootDir,
      lockRootDir,
      commands: secondCommands
    });

    sleepSync(100);
    assert.equal(
      fs.existsSync(secondBuildStartedPath),
      false,
      "the queued proof chain must not rebuild _site during the first inspection"
    );
    assert.equal(fs.existsSync(secondInspectStartedPath), false);

    assert.deepEqual(await Promise.all([waitForChild(first), waitForChild(second)]), [0, 0]);
    assert.deepEqual(
      fs.readFileSync(logPath, "utf8").trim().split("\n"),
      ["first:first", "second:second"]
    );
  } finally {
    for (const child of [first, second]) {
      if (child && child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }

    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});
