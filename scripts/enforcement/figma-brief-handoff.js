const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const BRIEFS_DIR = path.join("docs", "briefs");
const STATE_PATH = path.join(BRIEFS_DIR, "figma-mcp-state.json");
const IGNORED_BRIEF_FILES = new Set(["README.md", "_template.md"]);
const PLACEHOLDER_VALUES = new Set(["", "tbd", "todo", "pending", "none", "n/a", "na", "unknown"]);

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripCodeFence(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function normalize(value) {
  return stripCodeFence(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function isPlaceholder(value) {
  const normalized = normalize(value);
  return PLACEHOLDER_VALUES.has(normalized) || (normalized.startsWith("<") && normalized.endsWith(">"));
}

function parseArgs(argv) {
  const parsed = {
    all: false,
    range: "origin/main...HEAD",
    rootDir: process.cwd()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--all") {
      parsed.all = true;
      continue;
    }

    if (arg === "--range") {
      parsed.range = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--root") {
      parsed.rootDir = path.resolve(argv[index + 1]);
      index += 1;
    }
  }

  return parsed;
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(stderr || `Command failed: ${command} ${args.join(" ")}`);
  }

  return (result.stdout || "").trim();
}

function getChangedFiles(range, rootDir) {
  if (!range) {
    return [];
  }

  const output = capture("git", ["diff", "--name-only", "--diff-filter=ACMR", range], {
    cwd: rootDir
  });
  return output ? output.split("\n").filter(Boolean) : [];
}

function extractField(text, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+?)\\s*$`, "m");
  const match = pattern.exec(text);
  return match ? match[1].trim() : "";
}

function parseFigmaFileKey(value) {
  const cleaned = stripCodeFence(value);
  const match = cleaned.match(/figma\.com\/design\/([^/?#]+)/i);
  return match ? match[1] : null;
}

function parseFrames(value) {
  return stripCodeFence(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isBriefPath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  if (!normalized.startsWith(`${BRIEFS_DIR}/`) || !normalized.endsWith(".md")) {
    return false;
  }

  return !IGNORED_BRIEF_FILES.has(path.basename(normalized));
}

function listBriefPaths(rootDir) {
  return fs
    .readdirSync(path.join(rootDir, BRIEFS_DIR))
    .filter((entry) => entry.endsWith(".md") && !IGNORED_BRIEF_FILES.has(entry))
    .map((entry) => path.join(BRIEFS_DIR, entry));
}

function parseBrief(rootDir, relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  const figmaCapture = extractField(text, "Figma capture");
  if (!figmaCapture) {
    return null;
  }

  return {
    absolutePath,
    relativePath: relativePath.split(path.sep).join("/"),
    figmaCapture,
    figmaFrames: extractField(text, "Figma frames"),
    figmaProof: extractField(text, "Figma proof"),
    fileKey: parseFigmaFileKey(figmaCapture),
    frames: parseFrames(extractField(text, "Figma frames"))
  };
}

function loadFigmaState(rootDir) {
  const absoluteStatePath = path.join(rootDir, STATE_PATH);
  if (!fs.existsSync(absoluteStatePath)) {
    return {
      checkedAt: null,
      source: null,
      targets: []
    };
  }

  return JSON.parse(fs.readFileSync(absoluteStatePath, "utf8"));
}

function getTargetByFileKey(snapshot, fileKey) {
  return (snapshot.targets || []).find((target) => target.fileKey === fileKey) || null;
}

function isEmptyPageOneTarget(target) {
  const topLevelPages = Array.isArray(target?.topLevelPages) ? target.topLevelPages : [];
  const pageProbe = target?.pageProbe || {};
  const firstPageName = topLevelPages[0]?.name || "";
  const childNames = Array.isArray(pageProbe.visibleChildNames)
    ? pageProbe.visibleChildNames.filter(Boolean)
    : [];

  return (
    topLevelPages.length === 1 &&
    firstPageName === "Page 1" &&
    pageProbe.name === "Page 1" &&
    childNames.length === 0
  );
}

function parseProofReference(value) {
  if (!value.includes(":")) {
    return null;
  }

  const separatorIndex = value.indexOf(":");
  const proofType = value.slice(0, separatorIndex).trim().toLowerCase();
  const detail = value.slice(separatorIndex + 1).trim();

  if (!["screenshot", "desktop", "mcp"].includes(proofType)) {
    return null;
  }

  return { proofType, detail };
}

function looksLikeUrl(value) {
  return value.startsWith("https://") || value.startsWith("http://");
}

function validateProof(proof, briefAbsolutePath) {
  const parsed = parseProofReference(proof);
  if (!parsed) {
    return "Figma proof must use `screenshot:`, `desktop:`, or `mcp:`.";
  }

  if (isPlaceholder(parsed.detail)) {
    return "Figma proof cannot be empty or placeholder text.";
  }

  if (parsed.proofType === "screenshot") {
    if (looksLikeUrl(parsed.detail)) {
      return null;
    }

    let proofPath = path.resolve(parsed.detail);
    if (!path.isAbsolute(parsed.detail)) {
      proofPath = path.resolve(path.dirname(briefAbsolutePath), parsed.detail);
    }

    if (!fs.existsSync(proofPath)) {
      return `Screenshot proof path does not exist: ${proofPath}`;
    }

    return null;
  }

  if (parsed.proofType === "desktop") {
    if (parsed.detail.length < 16) {
      return "Desktop proof must name the visible frame plus when it was checked.";
    }

    return null;
  }

  if (!parsed.detail.includes("get_screenshot") && !parsed.detail.includes("get_design_context")) {
    return "MCP proof must mention `get_screenshot` or `get_design_context`.";
  }

  if (!parsed.detail.includes("node=") && !parsed.detail.includes("node:")) {
    return "MCP proof must include the exact node reference.";
  }

  return null;
}

function renderProofRequirement(brief, snapshot) {
  const checkedAt = snapshot.checkedAt || "YYYY-MM-DD";
  const firstFrame = brief.frames[0] || "<frame name>";
  const frameList = brief.frames.length
    ? brief.frames.map((frame) => `\`${frame}\``).join(", ")
    : "the exact frame named in the brief";

  return [
    `Figma MCP state for \`${brief.fileKey}\` still only exposes empty \`Page 1\`.`,
    "Before this brief is a valid Figma-to-repo handoff, add `Figma proof:` with one of:",
    `- \`screenshot:/absolute/path/to/fresh-capture.png\` showing ${frameList}`,
    `- \`desktop:${checkedAt} Figma Desktop visible frame ${firstFrame}\``,
    `- \`mcp:get_screenshot file=${brief.fileKey} node=<node-id> frame=${firstFrame}\``
  ].join("\n");
}

function validateBrief(brief, snapshot) {
  const issues = [];

  if (!brief.fileKey) {
    issues.push("Figma capture must use a `figma.com/design/...` URL with a parseable file key.");
  }

  if (!brief.frames.length) {
    issues.push("Figma frames must name the exact frame or frames this repo is allowed to implement.");
  }

  const target = brief.fileKey ? getTargetByFileKey(snapshot, brief.fileKey) : null;
  if (brief.fileKey && !target) {
    issues.push(
      `No saved Figma MCP state exists for \`${brief.fileKey}\`. Add this capture to \`${STATE_PATH}\` before treating the brief as implementation-ready.`
    );
  }

  const blocked = Boolean(target && isEmptyPageOneTarget(target));
  const hasProof = brief.figmaProof && !isPlaceholder(brief.figmaProof);

  if (blocked) {
    if (!hasProof) {
      issues.push(renderProofRequirement(brief, snapshot));
    } else {
      const proofIssue = validateProof(brief.figmaProof, brief.absolutePath);
      if (proofIssue) {
        issues.push(proofIssue);
      }
    }
  } else if (hasProof) {
    const proofIssue = validateProof(brief.figmaProof, brief.absolutePath);
    if (proofIssue) {
      issues.push(proofIssue);
    }
  }

  return {
    brief,
    target,
    blocked,
    issues
  };
}

function buildFigmaBriefReport(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const range = options.range || "origin/main...HEAD";
  const all = Boolean(options.all);
  const relativePaths = all
    ? listBriefPaths(rootDir)
    : getChangedFiles(range, rootDir).filter(isBriefPath);
  const briefs = relativePaths.map((relativePath) => parseBrief(rootDir, relativePath)).filter(Boolean);
  const snapshot = loadFigmaState(rootDir);
  const results = briefs.map((brief) => validateBrief(brief, snapshot));

  return {
    rootDir,
    range,
    snapshot,
    results,
    issueCount: results.reduce((total, result) => total + result.issues.length, 0)
  };
}

function renderFigmaBriefReport(report) {
  if (!report.results.length) {
    return "figma-brief-handoff: no changed Figma briefs";
  }

  const status = report.issueCount ? "blocked" : "passed";
  const lines = [`figma-brief-handoff: ${status}`];
  if (report.snapshot.checkedAt || report.snapshot.source) {
    lines.push(
      `Snapshot: ${report.snapshot.checkedAt || "unknown date"}${report.snapshot.source ? ` (${report.snapshot.source})` : ""}`
    );
  }

  for (const result of report.results) {
    const stateLabel = result.blocked
      ? "empty Page 1 via MCP"
      : result.target
        ? `inspectable via MCP (${result.target.pageProbe?.name || "page"})`
        : "unknown MCP state";
    lines.push(`- ${result.brief.relativePath}: ${result.issues.length ? "INVALID" : "OK"} (${stateLabel})`);

    for (const issue of result.issues) {
      for (const line of issue.split("\n")) {
        lines.push(`  ${line}`);
      }
    }
  }

  return lines.join("\n");
}

function assertValidFigmaBriefHandoffs(options = {}) {
  const report = buildFigmaBriefReport(options);
  if (report.issueCount) {
    throw new Error(renderFigmaBriefReport(report));
  }

  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildFigmaBriefReport(args);
  console.log(renderFigmaBriefReport(report));
  if (report.issueCount) {
    process.exit(1);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  BRIEFS_DIR,
  STATE_PATH,
  assertValidFigmaBriefHandoffs,
  buildFigmaBriefReport,
  isEmptyPageOneTarget,
  loadFigmaState,
  parseBrief,
  parseFigmaFileKey,
  renderFigmaBriefReport,
  validateBrief,
  validateProof
};
