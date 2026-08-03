const fs = require("node:fs");
const os = require("node:os");
const path = require("path");
const { spawnSync } = require("node:child_process");

const BUILD_SCRIPT = "scripts/enforcement/build-site.js";
const EVIDENCE_LINE_LIMIT = 12;
const FAILURE_TAIL_BYTES = 64 * 1024;

function lastLines(text, limit) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .slice(-limit)
    .join("\n");
}

// The build wrapper reports real causes on stderr - a held worktree lock, a
// Hostaway cache failure, a failed availability validation. Discarding that
// output makes every one of them look like a content-lint defect, so the
// failure message has to carry the child's own words.
function formatBuildFailure(result) {
  const status = result && result.status;
  const signal = result && result.signal;
  const reason = signal ? `terminated by signal ${signal}` : `exited with code ${status}`;
  const evidence = lastLines(result && result.stderr, EVIDENCE_LINE_LIMIT)
    || lastLines(result && result.stdout, EVIDENCE_LINE_LIMIT);

  if (!evidence) {
    return `${BUILD_SCRIPT} ${reason} and produced no output to explain why.`;
  }

  return `${BUILD_SCRIPT} ${reason}:\n${evidence}`;
}

function readFailureTail(filePath) {
  let descriptor;

  try {
    const { size } = fs.statSync(filePath);
    const start = Math.max(0, size - FAILURE_TAIL_BYTES);
    const buffer = Buffer.alloc(size - start);
    descriptor = fs.openSync(filePath, "r");
    fs.readSync(descriptor, buffer, 0, buffer.length, start);
    return buffer.toString("utf8");
  } catch {
    return "";
  } finally {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
    }
  }
}

function runStreamingBuild(cwd) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-build-for-lint-"));
  const outputPath = path.join(outputDir, "build.log");

  try {
    // bash owns the pipe so the build's output reaches the caller immediately;
    // the log file is only read back when a failure needs a bounded evidence
    // tail. This avoids spawnSync's 1 MiB pipe buffer entirely.
    const result = spawnSync(
      "bash",
      [
        "-o",
        "pipefail",
        "-c",
        '"$1" "$2" 2>&1 | tee "$3"',
        "build-for-lint",
        process.execPath,
        BUILD_SCRIPT,
        outputPath
      ],
      {
        cwd,
        stdio: "inherit"
      }
    );

    if (result.error || result.status !== 0 || result.signal) {
      return {
        ...result,
        stdout: readFailureTail(outputPath),
        stderr: ""
      };
    }

    return { ...result, stdout: "", stderr: "" };
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
}

function runBuildForLint(options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..", "..");
  const result = options.spawn
    ? options.spawn(process.execPath, [BUILD_SCRIPT], {
        cwd,
        encoding: "utf8"
      })
    : runStreamingBuild(cwd);

  if (result && result.error) {
    throw new Error(`${BUILD_SCRIPT} could not be started: ${result.error.message}`);
  }

  // Keep the build's own progress output visible; the lint run is long enough
  // that a silent child reads as a hang.
  if (result && result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result && result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (!result || result.status !== 0) {
    throw new Error(formatBuildFailure(result));
  }

  return result;
}

module.exports = {
  BUILD_SCRIPT,
  formatBuildFailure,
  readFailureTail,
  runBuildForLint
};
