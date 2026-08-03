const path = require("path");
const { spawn } = require("node:child_process");

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
  const error = result && result.error;
  const reason = signal
    ? `terminated by signal ${signal}`
    : error
      ? "failed"
      : `exited with code ${status}`;
  const sections = [
    [
      "error",
      error
        ? `${error.code ? `${error.code}: ` : ""}${error.message || String(error)}`
        : ""
    ],
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

function createEvidenceCollector() {
  const head = [];
  const tail = [];
  let pending = "";
  let discardLongLine = false;
  let totalLines = 0;

  function addLine(line) {
    const normalized = String(line || "")
      .trimEnd()
      .slice(0, EVIDENCE_LINE_CHARS);

    if (!normalized) {
      return;
    }

    totalLines += 1;
    if (head.length < EVIDENCE_HEAD_LINES) {
      head.push(normalized);
      return;
    }

    if (tail.length === EVIDENCE_TAIL_LINES) {
      tail.shift();
    }
    tail.push(normalized);
  }

  function write(chunk) {
    let remaining = String(chunk || "");

    while (remaining.length > 0) {
      if (discardLongLine) {
        const newlineIndex = remaining.indexOf("\n");
        if (newlineIndex === -1) {
          return;
        }

        discardLongLine = false;
        remaining = remaining.slice(newlineIndex + 1);
        continue;
      }

      const newlineIndex = remaining.indexOf("\n");
      const fragment = newlineIndex === -1 ? remaining : remaining.slice(0, newlineIndex);
      const remainingLineChars = Math.max(EVIDENCE_LINE_CHARS - pending.length, 0);
      pending += fragment.slice(0, remainingLineChars);

      if (newlineIndex === -1) {
        discardLongLine = fragment.length > remainingLineChars;
        return;
      }

      addLine(pending);
      pending = "";
      remaining = remaining.slice(newlineIndex + 1);
    }
  }

  function finish() {
    if (pending) {
      addLine(pending);
    }
    pending = "";
    discardLongLine = false;
  }

  function toString() {
    const omitted = totalLines - head.length - tail.length;
    const lines = [...head];

    if (omitted > 0) {
      lines.push(`  ... ${omitted} more line(s) ...`);
    }

    lines.push(...tail);
    return lines.join("\n");
  }

  return {
    finish,
    toString,
    write
  };
}

async function runBuildForLint(options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..", "..");
  const spawnProcess = options.spawn || spawn;
  const writeStdout = options.writeStdout || ((chunk) => process.stdout.write(chunk));
  const writeStderr = options.writeStderr || ((chunk) => process.stderr.write(chunk));
  const stdoutEvidence = createEvidenceCollector();
  const stderrEvidence = createEvidenceCollector();

  let child;
  try {
    child = spawnProcess(process.execPath, [BUILD_SCRIPT], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    throw new Error(formatBuildFailure({ error }));
  }

  if (child.stdout && typeof child.stdout.setEncoding === "function") {
    child.stdout.setEncoding("utf8");
  }
  if (child.stderr && typeof child.stderr.setEncoding === "function") {
    child.stderr.setEncoding("utf8");
  }

  return new Promise((resolve, reject) => {
    let childError = null;

    child.stdout.on("data", (chunk) => {
      writeStdout(chunk);
      stdoutEvidence.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      writeStderr(chunk);
      stderrEvidence.write(chunk);
    });
    child.once("error", (error) => {
      childError = error;
    });
    child.once("close", (status, signal) => {
      stdoutEvidence.finish();
      stderrEvidence.finish();

      const result = {
        error: childError,
        signal,
        status,
        stderr: stderrEvidence.toString(),
        stdout: stdoutEvidence.toString()
      };

      if (childError || status !== 0 || signal) {
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
