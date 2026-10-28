// Fast brief check: reports every content-gate and Gate 0 problem in one pass,
// without the site build. `npm run check:brief -- [brief.md ...] [--gate0]`.
// With no paths it checks briefs changed against origin/main plus untracked briefs.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseMissingBriefFields, parseRequiredLinksFromBrief } = require("./brief-contract");
const {
  BRIEF_PATH_PATTERN,
  BRIEF_TEMPLATE_PATH_PATTERN,
  findMissingGate0Fields,
} = require("./search-brief-gate");

const GATE0_HEADING_PATTERN = /^## Gate 0\b/im;

function gitLines(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  }
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function isCheckableBrief(relativePath) {
  return (
    BRIEF_PATH_PATTERN.test(relativePath) &&
    !BRIEF_TEMPLATE_PATH_PATTERN.test(relativePath) &&
    !/\/_[^/]+\.md$/.test(relativePath) &&
    !/\/README\.md$/i.test(relativePath)
  );
}

function findDefaultBriefs(rootDir, base = "origin/main") {
  const changed = gitLines(["diff", "--name-only", "--diff-filter=ACMR", base], rootDir);
  const untracked = gitLines(["ls-files", "--others", "--exclude-standard", "docs/briefs"], rootDir);
  return [...new Set([...changed, ...untracked])].filter(isCheckableBrief).sort();
}

function checkBriefContent(briefContent, { gate0 = false } = {}) {
  const problems = parseMissingBriefFields(briefContent).map(
    (field) => `content gate: missing "- ${field}: ..." line`
  );


  if (gate0 || GATE0_HEADING_PATTERN.test(briefContent)) {
    for (const field of findMissingGate0Fields(briefContent)) {
      problems.push(`Gate 0: ${field}`);
    }
  }

  return problems;
}

// lint:content enforces this only when the PR changes visible reader copy.
function checkBriefNotes(briefContent) {
  if (parseRequiredLinksFromBrief(briefContent).length >= 2) {
    return [];
  }
  return [
    'if this PR changes visible reader copy, "- required internal links:" must list at least two comma-separated site paths starting with "/"',
  ];
}

function parseArgs(argv) {
  const parsed = { gate0: false, paths: [] };
  for (const arg of argv) {
    if (arg === "--gate0") {
      parsed.gate0 = true;
    } else {
      parsed.paths.push(arg);
    }
  }
  return parsed;
}

function main() {
  const rootDir = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const briefPaths = args.paths.length > 0 ? args.paths : findDefaultBriefs(rootDir);

  if (briefPaths.length === 0) {
    console.log("check-brief: no changed briefs to check (pass a path to check one)");
    return;
  }

  let failed = 0;
  for (const briefPath of briefPaths) {
    const problems = checkBriefContent(fs.readFileSync(path.resolve(rootDir, briefPath), "utf8"), {
      gate0: args.gate0,
    });
    const content = fs.readFileSync(path.resolve(rootDir, briefPath), "utf8");
    const notes = checkBriefNotes(content);
    if (problems.length === 0) {
      console.log(`ok   ${briefPath}`);
    } else {
      failed += 1;
      console.log(`FAIL ${briefPath}`);
      for (const problem of problems) {
        console.log(`  - ${problem}`);
      }
    }
    for (const note of notes) {
      console.log(`  note: ${note}`);
    }
  }

  if (failed > 0) {
    console.log(
      "check-brief: Gate 0 rules live in docs/briefs/_template.md and scripts/enforcement/search-brief-gate.js; verify:release and lint:content still run the full gate."
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkBriefContent, checkBriefNotes, findDefaultBriefs, isCheckableBrief, parseArgs };
