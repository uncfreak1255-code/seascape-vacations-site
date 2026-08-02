const path = require("path");
const { spawnSync } = require("node:child_process");

const BUILD_SCRIPT = "scripts/enforcement/build-site.js";
const EVIDENCE_LINE_LIMIT = 12;

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

function runBuildForLint(options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..", "..");
  const spawn = options.spawn || spawnSync;

  const result = spawn(process.execPath, [BUILD_SCRIPT], {
    cwd,
    encoding: "utf8"
  });

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
  runBuildForLint
};
