const path = require("path");
const { spawnSync } = require("node:child_process");

const BUILD_SCRIPT = "scripts/enforcement/build-site.js";
const EVIDENCE_HEAD_LINES = 80;
const EVIDENCE_TAIL_LINES = 80;
const EVIDENCE_LINE_CHARS = 2000;

function evidenceFrom(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trimEnd().slice(0, EVIDENCE_LINE_CHARS))
    .filter((line) => line.length > 0);

  if (lines.length <= EVIDENCE_HEAD_LINES + EVIDENCE_TAIL_LINES) {
    return lines.join("\n");
  }

  const head = lines.slice(0, EVIDENCE_HEAD_LINES);
  const tail = lines.slice(-EVIDENCE_TAIL_LINES);
  const omitted = lines.length - head.length - tail.length;

  return [...head, `  ... ${omitted} more line(s) ...`, ...tail].join("\n");
}

function formatBuildFailure(result) {
  const status = result && result.status;
  const signal = result && result.signal;
  const reason = signal ? `terminated by signal ${signal}` : `exited with code ${status}`;
  const sections = [
    ["stderr", evidenceFrom(result && result.stderr)],
    ["stdout", evidenceFrom(result && result.stdout)]
  ].filter(([, evidence]) => evidence);

  if (!sections.length) {
    return `${BUILD_SCRIPT} ${reason} and produced no output to explain why.`;
  }

  const body = sections
    .map(([label, evidence]) => `--- ${label} ---\n${evidence}`)
    .join("\n");

  return `${BUILD_SCRIPT} ${reason}:\n${body}`;
}

function runBuildForLint(options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..", "..");
  const spawn = options.spawn || spawnSync;
  const result = spawn(process.execPath, [BUILD_SCRIPT], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result && result.error) {
    throw new Error(`${BUILD_SCRIPT} could not be started: ${result.error.message}`);
  }

  if (result && result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result && result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (!result || result.status !== 0 || result.signal) {
    throw new Error(formatBuildFailure(result));
  }

  return result;
}

module.exports = {
  BUILD_SCRIPT,
  formatBuildFailure,
  runBuildForLint
};
