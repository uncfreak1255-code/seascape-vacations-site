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
const BRIEF_TEMPLATE_PATH_PATTERN = /^docs\/briefs\/_template\.md$/i;
const REQUIRED_GATE0_FIELDS = [
  "Target query family",
  "Searcher intent",
  "Current Seascape URL",
  "SERP observed date",
  "SERP stale after",
  "Current proof",
  "Top visible competitors",
  "Competitor angle",
  "Seascape gap",
  "Search fit",
  "Local/GBP proof",
  "AEO/readback note"
];
const ACTION_FIELD_ALIASES = ["Recommendation", "Recommended action"];
const PLACEHOLDER_VALUE_PATTERN =
  /^(?:<.+>|tbd|todo|pending|fill(?:ed)? after|fill this in|to capture\b|capture in\b)/i;
const DATE_GATE0_FIELDS = new Set(["SERP observed date", "SERP stale after"]);
const EXPLAINED_NA_FIELDS = new Set(["Local/GBP proof", "AEO/readback note"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TOKEN_PATTERN = /\b\d{4}-\d{2}-\d{2}\b/;
const BARE_NA_PATTERN = /^(?:n\/?a|not applicable)$/i;
const GENERIC_LATEST_PROOF_PATTERN = /\blatest\b/i;
const AUTHORIZED_SOURCE_SECTION_PATTERN =
  /\b(?:source files?\s+(?:likely to change|changed(?:\s+in\s+this\s+batch)?)|changed public source files?)\b/i;

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
  return (changedFiles || []).filter(
    (relativePath) => BRIEF_PATH_PATTERN.test(relativePath) && !BRIEF_TEMPLATE_PATH_PATTERN.test(relativePath)
  );
}

function extractAuthorizedSourceSectionText(briefContent) {
  const lines = String(briefContent || "").split(/\r?\n/);
  const collectedLines = [];
  let collecting = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (AUTHORIZED_SOURCE_SECTION_PATTERN.test(trimmed)) {
      collectedLines.push(line);
      collecting = true;
      continue;
    }

    if (!collecting) {
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      collecting = false;
      continue;
    }

    if (!trimmed) {
      collectedLines.push(line);
      continue;
    }

    if (/^\s+[-*]\s+/.test(line) || /^\s{2,}\S/.test(line)) {
      collectedLines.push(line);
      continue;
    }

    collecting = false;
  }

  return collectedLines.join("\n");
}

function briefMentionsSearchDecisionFile(briefContent, relativePath) {
  return extractAuthorizedSourceSectionText(briefContent).includes(relativePath);
}

function findUncoveredSearchDecisionFiles(rootDir, searchDecisionFiles, changedBriefFiles) {
  if (changedBriefFiles.length <= 1) {
    return [];
  }

  const briefContents = changedBriefFiles.map((briefPath) => read(rootDir, briefPath));

  return searchDecisionFiles.filter(
    (relativePath) =>
      !briefContents.some((briefContent) =>
        briefMentionsSearchDecisionFile(briefContent, relativePath)
      )
  );
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
  const dateValues = {};

  for (const field of REQUIRED_GATE0_FIELDS) {
    const value = rowMap.get(field.toLowerCase());
    if (!value || PLACEHOLDER_VALUE_PATTERN.test(value)) {
      missingFields.push(field);
      continue;
    }

    if (DATE_GATE0_FIELDS.has(field) && !ISO_DATE_PATTERN.test(value)) {
      missingFields.push(`${field} (YYYY-MM-DD)`);
      continue;
    }

    if (DATE_GATE0_FIELDS.has(field)) {
      dateValues[field] = value;
    }

    if (EXPLAINED_NA_FIELDS.has(field) && BARE_NA_PATTERN.test(value)) {
      missingFields.push(`${field} (explain N/A)`);
    }

    if (
      field === "Current proof" &&
      GENERIC_LATEST_PROOF_PATTERN.test(value) &&
      !DATE_TOKEN_PATTERN.test(value)
    ) {
      missingFields.push("Current proof (dated receipt/window)");
    }
  }

  if (
    dateValues["SERP observed date"] &&
    dateValues["SERP stale after"] &&
    dateValues["SERP stale after"] < dateValues["SERP observed date"]
  ) {
    missingFields.push("SERP stale after (on/after observed date)");
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
  if (changedBriefFiles.length === 0) {
    throw new Error(
      [
        "Search-driven page, metadata, redirect, and sitemap edits must change at least one active brief.",
        "Found 0 changed active brief files.",
        ...searchDecisionFiles.map((relativePath) => `- ${relativePath}`)
      ].join("\n")
    );
  }

  for (const briefPath of changedBriefFiles) {
    const missingFields = findMissingGate0Fields(read(rootDir, briefPath));
    if (missingFields.length === 0) {
      continue;
    }

    throw new Error(
      [
        `Active brief \`${briefPath}\` is missing the Gate 0 search block required for search-driven source edits.`,
        "Fill the block from `docs/process/seo-competitor-operating-loop.md` or `docs/process/ranking-regression-rescue.md` with live competitor evidence.",
        `Missing: ${missingFields.join(", ")}`
      ].join("\n")
    );
  }

  const uncoveredSearchDecisionFiles = findUncoveredSearchDecisionFiles(
    rootDir,
    searchDecisionFiles,
    changedBriefFiles
  );
  if (uncoveredSearchDecisionFiles.length > 0) {
    throw new Error(
      [
        "Multiple active briefs changed, so each search-driven source edit must be named in at least one active brief.",
        "Add each source path under the matching brief's source-file/task section, or split the PR into one search lane.",
        ...uncoveredSearchDecisionFiles.map((relativePath) => `- ${relativePath}`)
      ].join("\n")
    );
  }

  return {
    changedFiles,
    searchDecisionFiles,
    changedBriefFiles,
    briefPath: changedBriefFiles.length === 1 ? changedBriefFiles[0] : "",
    briefPaths: changedBriefFiles,
    missingFields: [],
    status: "passed",
  };
}

module.exports = {
  ACTION_FIELD_ALIASES,
  BARE_NA_PATTERN,
  BRIEF_PATH_PATTERN,
  BRIEF_TEMPLATE_PATH_PATTERN,
  DATE_GATE0_FIELDS,
  DATE_TOKEN_PATTERN,
  EXPLAINED_NA_FIELDS,
  GENERIC_LATEST_PROOF_PATTERN,
  ISO_DATE_PATTERN,
  PLACEHOLDER_VALUE_PATTERN,
  REQUIRED_GATE0_FIELDS,
  SEARCH_DECISION_PATH_PATTERNS,
  assertSearchDecisionBriefContract,
  extractGate0Section,
  extractAuthorizedSourceSectionText,
  findChangedBriefFiles,
  findMissingGate0Fields,
  findSearchDecisionFiles,
  findUncoveredSearchDecisionFiles,
  getChangedFiles,
  parseGate0Rows,
};
