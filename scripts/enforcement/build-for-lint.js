const path = require("path");
const { spawn: spawnChild } = require("node:child_process");

const BUILD_SCRIPT = "scripts/enforcement/build-site.js";
const EVIDENCE_HEAD_LINES = 80;
const EVIDENCE_TAIL_LINES = 80;
const EVIDENCE_LINE_CHARS = 2000;
const CAPTURE_LIMIT_CHARS = 400000;
const CAPTURE_HEAD_CHARS = CAPTURE_LIMIT_CHARS / 2;
const CAPTURE_TAIL_CHARS = CAPTURE_LIMIT_CHARS / 2;

function createBoundedCapture() {
  let complete = "";
  let tail = "";
  let truncated = false;

  return {
    append(value) {
      const text = String(value);

      if (!truncated) {
        const combined = complete + text;
        if (combined.length <= CAPTURE_LIMIT_CHARS) {
          complete = combined;
          return;
        }

        complete = combined.slice(0, CAPTURE_HEAD_CHARS);
        tail = combined.slice(-CAPTURE_TAIL_CHARS);
        truncated = true;
        return;
      }

      tail = (tail + text).slice(-CAPTURE_TAIL_CHARS);
    },

    text() {
      if (!truncated) {
        return complete;
      }

      return `${complete}\n  ... output truncated for bounded evidence ...\n${tail}`;
    }
  };
}

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

function formatSpawnFailure(error, result) {
  const sections = [
    ["stderr", evidenceFrom(result && result.stderr)],
    ["stdout", evidenceFrom(result && result.stdout)]
  ].filter(([, evidence]) => evidence);

  const evidence = sections
    .map(([label, output]) => `--- ${label} ---\n${output}`)
    .join("\n");

  return `${BUILD_SCRIPT} could not be started: ${error.message}${evidence ? `\n${evidence}` : ""}`;
}

function runBuildForLint(options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..", "..");
  const spawn = options.spawn || spawnChild;
  const output = options.output || { stdout: process.stdout, stderr: process.stderr };

  return new Promise((resolve, reject) => {
    const stdout = createBoundedCapture();
    const stderr = createBoundedCapture();
    let child;
    let settled = false;

    const rejectOnce = (error) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    };

    try {
      child = spawn(process.execPath, [BUILD_SCRIPT], {
        cwd,
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch (error) {
      rejectOnce(new Error(formatSpawnFailure(error, { stdout: "", stderr: "" })));
      return;
    }

    const captureStream = (stream, capture, destination) => {
      stream.on("data", (chunk) => {
        const text = String(chunk);
        capture.append(text);
        destination.write(text);
      });
    };

    captureStream(child.stdout, stdout, output.stdout);
    captureStream(child.stderr, stderr, output.stderr);

    child.on("error", (error) => {
      rejectOnce(
        new Error(
          formatSpawnFailure(error, {
            stdout: stdout.text(),
            stderr: stderr.text()
          })
        )
      );
    });

    child.on("close", (status, signal) => {
      const result = {
        status,
        signal,
        stdout: stdout.text(),
        stderr: stderr.text()
      };

      if (settled) {
        return;
      }

      settled = true;
      if (status !== 0 || signal) {
        reject(new Error(formatBuildFailure(result)));
        return;
      }

      resolve(result);
    });
  });
}

module.exports = {
  BUILD_SCRIPT,
  formatBuildFailure,
  runBuildForLint
};
