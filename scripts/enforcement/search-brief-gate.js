const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SEARCH_DECISION_PATH_PATTERNS = [
  /^src\/guides\/.+\.(html|njk)$/i,
  /^src\/research\/.+\.njk$/i,
  /^src\/property-management\/.+\.njk$/i,
  /^src\/stays\/.+\.njk$/i,
  /^src\/index\.njk$/i,
  /^src\/_data\/seoPages\.json$/i,
  /^src\/_redirects$/i,
  /^src\/sitemap\.njk$/i
];

const BRIEF_PATH_PATTERN = /^docs\/briefs\/.+\.md$/i;
const REQUIRED_GATE0_FIELDS = [
  "Target query family",
  "Searcher intent",
  "Current Seascape URL",
  "Current proof",
  "Top visible competitors",
  "Competitor angle",
  "Seascape gap"
];
const ACTION_FIELD_ALIASES = ["Recommendation", "Recommended action"];
const PLACEHOLDER_VALUE_PATTERN =
  /^(?:<.+>|tbd|todo|pending|fill(?:ed)? after|fill this in|to capture\b|capture in\b)/i;

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

function getChangedFiles(range, cwd = process.cwd()) {
  if (!range) {
    return [];
  }

  const output = capture("git", ["diff", "--name-only", "--diff-filter=ACMR", range], { cwd });
  return output ? output.split("\n").filter(Boolean) : [];
}

function findSearchDecisionFiles(changedFiles) {
  return (changedFiles || []).filter((relativePath) =>
    SEARCH_DECISION_PATH_PATTERNS.some((pattern) => pattern.test(relativePath))
  );
}

function findChangedBriefFiles(changedFiles) {
  return (changedFiles || []).filter((relativePath) => BRIEF_PATH_PATTERN.test(relativePath));
}

function read(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function extractGate0Section(briefContent) {
  const lines = String(briefContent || "").split(/\r?\n/);
  const startIndex = lines.findIndex((line) => /^## Gate 0\b/i.test(line.trim()));

  if (startIndex === -1) {
    return "";
  }

  const collectedLines = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (index > startIndex && /^##\s+/i.test(line.trim())) {
      break;
    }

    collectedLines.push(line);
  }

  return collectedLines.join("\n").trim();
}

function normalizeValue(input) {
  return String(input || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGate0Rows(sectionContent) {
  const rows = [...String(sectionContent || "").matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|.*$/gm)];

  return rows
    .map((match) => ({
      field: normalizeValue(match[1]),
      value: normalizeValue(match[2]),
    }))
    .filter(({ field }) => field && field.toLowerCase() !== "field");
}

function findMissingGate0Fields(briefContent) {
  const gate0Section = extractGate0Section(briefContent);
  if (!gate0Section) {
    return ["Gate 0 block"];
  }

  const rows = parseGate0Rows(gate0Section);
  const rowMap = new Map(rows.map(({ field, value }) => [field.toLowerCase(), value]));
  const missingFields = [];

  for (const field of REQUIRED_GATE0_FIELDS) {
    const value = rowMap.get(field.toLowerCase());
    if (!value || PLACEHOLDER_VALUE_PATTERN.test(value)) {
      missingFields.push(field);
    }
  }

  const hasActionField = ACTION_FIELD_ALIASES.some((field) => {
    const value = rowMap.get(field.toLowerCase());
    return value && !PLACEHOLDER_VALUE_PATTERN.test(value);
  });

  if (!hasActionField) {
    missingFields.push("Recommendation or Recommended action");
  }

  return missingFields;
}

function assertSearchDecisionBriefContract({
  range,
  rootDir = process.cwd(),
  changedFiles = getChangedFiles(range, rootDir),
} = {}) {
  const searchDecisionFiles = findSearchDecisionFiles(changedFiles);
  if (searchDecisionFiles.length === 0) {
    return {
      changedFiles,
      searchDecisionFiles,
      changedBriefFiles: [],
      briefPath: "",
      missingFields: [],
      status: "skipped",
    };
  }

  const changedBriefFiles = findChangedBriefFiles(changedFiles);
  if (changedBriefFiles.length !== 1) {
    throw new Error(
      [
        "Search-driven page, metadata, redirect, and sitemap edits must change exactly one active brief.",
        `Found ${changedBriefFiles.length} changed brief file(s).`,
        ...searchDecisionFiles.map((relativePath) => `- ${relativePath}`)
      ].join("\n")
    );
  }

  const briefPath = changedBriefFiles[0];
  const missingFields = findMissingGate0Fields(read(rootDir, briefPath));
  if (missingFields.length > 0) {
    throw new Error(
      [
        `Active brief \`${briefPath}\` is missing the Gate 0 search block required for search-driven source edits.`,
        "Fill the block from `docs/process/seo-competitor-operating-loop.md` or `docs/process/ranking-regression-rescue.md` with live competitor evidence.",
        `Missing: ${missingFields.join(", ")}`
      ].join("\n")
    );
  }

  return {
    changedFiles,
    searchDecisionFiles,
    changedBriefFiles,
    briefPath,
    missingFields: [],
    status: "passed",
  };
}

module.exports = {
  ACTION_FIELD_ALIASES,
  BRIEF_PATH_PATTERN,
  PLACEHOLDER_VALUE_PATTERN,
  REQUIRED_GATE0_FIELDS,
  SEARCH_DECISION_PATH_PATTERNS,
  assertSearchDecisionBriefContract,
  extractGate0Section,
  findChangedBriefFiles,
  findMissingGate0Fields,
  findSearchDecisionFiles,
  getChangedFiles,
  parseGate0Rows,
};
