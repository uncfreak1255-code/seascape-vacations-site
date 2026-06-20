const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../..");
const defaultOutputPath = path.join(rootDir, "docs/status/content-decay-patrol.md");
const defaultTriagePath = path.join(rootDir, "docs/portfolio/pseo-inventory-triage.md");
const defaultSeoPagesPath = path.join(rootDir, "src/_data/seoPages.json");
const defaultSeoGovernancePath = path.join(rootDir, "src/_data/seoGovernance.js");

const monthIndexes = new Map([
  ["january", 0],
  ["february", 1],
  ["march", 2],
  ["april", 3],
  ["may", 4],
  ["june", 5],
  ["july", 6],
  ["august", 7],
  ["september", 8],
  ["october", 9],
  ["november", 10],
  ["december", 11],
]);

const priorityRoutes = new Set([
  "/",
  "/property-management/",
  "/property-management/vacation-rental-management-fees-florida/",
  "/property-management/vacation-rental-licensing-florida/",
  "/property-management/vrbo-management-services-florida/",
  "/property-management/vacation-rental-management-bradenton/",
  "/property-management/vacation-rental-management-anna-maria-island/",
  "/property-management/vacation-rental-management-sarasota/",
  "/stays/anna-maria-island-vacation-rentals/",
  "/stays/anna-maria-island-beachfront-rentals/",
  "/stays/vacation-rentals-near-anna-maria-island/",
  "/guides/bradenton-vs-sarasota/",
  "/guides/anna-maria-island-vs-siesta-key/",
  "/guides/srq-airport-to-anna-maria-island/",
  "/guides/best-vacation-rental-companies-ami/",
  "/guides/florida-gulf-coast-vacation-rental-market-report-2026/",
  "/research/owner-fee-revenue-leak-benchmark-2026/",
]);

function parseArgs(argv) {
  const args = {
    asOf: new Date(),
    output: defaultOutputPath,
    staleDays: 90,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--as-of") {
      args.asOf = parseDateArg(argv[++index], "--as-of");
    } else if (arg === "--output") {
      args.output = path.resolve(rootDir, argv[++index]);
    } else if (arg === "--stale-days") {
      args.staleDays = Number.parseInt(argv[++index], 10);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(args.staleDays) || args.staleDays < 1) {
    throw new Error("--stale-days must be a positive integer");
  }
  return args;
}

function parseDateArg(raw, label) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || dateOnly(parsed) !== raw) {
    throw new Error(`${label} must be a real date`);
  }
  return parsed;
}

function dateOnly(value) {
  return value.toISOString().slice(0, 10);
}

function daysBetween(startDate, endDate) {
  const ms = endDate.getTime() - startDate.getTime();
  return Math.floor(ms / 86400000);
}

function monthYearDate(month, year) {
  const monthIndex = monthIndexes.get(String(month || "").toLowerCase());
  if (monthIndex === undefined) {
    return null;
  }
  return new Date(Date.UTC(Number(year), monthIndex, 1));
}

function escapeCell(value) {
  return String(value || "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function snippet(text, matchIndex, length = 120) {
  const start = Math.max(0, matchIndex - 45);
  const end = Math.min(text.length, matchIndex + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function monthYearIsRangeStart(text, match) {
  const after = text.slice(match.index + match[0].length, match.index + match[0].length + 40);
  return /^\s*(?:-|–|—|&ndash;|to|through)\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}/i.test(after);
}

function routeFromSourcePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized === "src/index.njk" || normalized === "src/index.html") {
    return "/";
  }
  if (normalized === "src/property-management/index.njk") {
    return "/property-management/";
  }
  if (normalized === "src/stays/stays.njk") {
    return "template: src/stays/stays.njk";
  }
  if (normalized === "src/property-management/property-management.njk") {
    return "template: src/property-management/property-management.njk";
  }
  const withoutSrc = normalized.replace(/^src\//, "");
  const withoutExtension = withoutSrc.replace(/\.(njk|html|md)$/, "");
  if (withoutExtension.endsWith("/index")) {
    return `/${withoutExtension.replace(/\/index$/, "")}/`;
  }
  return `/${withoutExtension}/`;
}

function severityFor(route, issueType) {
  if (priorityRoutes.has(route) && issueType !== "pseo-consolidation-candidate") {
    return "high";
  }
  if (priorityRoutes.has(route)) {
    return "medium";
  }
  if (issueType === "old-visible-updated-label" || issueType === "expired-stale-after-label") {
    return "medium";
  }
  return "watch";
}

function nextActionFor(issueType, route) {
  if (issueType === "pseo-consolidation-candidate") {
    return "Keep as candidate only; require page-level GSC plus SERP proof before redirect/noindex/merge.";
  }
  if (priorityRoutes.has(route)) {
    return "Run the ranking-regression or Gate 0 rescue check before editing public copy; refresh dates only with real source proof.";
  }
  if (issueType === "stale-date-modified") {
    return "Review source claims, then update dateModified only after a real content or proof refresh.";
  }
  if (issueType === "dated-proof-label-over-threshold") {
    return "Review the dated claim or source note; refresh, downgrade, or label it stale before promotion.";
  }
  return "Review before the next content batch; do not publish a cosmetic date change as proof.";
}

function addFinding(findings, { route, source, issueType, evidence, asOf, staleDate, staleDays }) {
  const ageDays = staleDate ? daysBetween(staleDate, asOf) : null;
  findings.push({
    route,
    source,
    issueType,
    severity: severityFor(route, issueType),
    ageDays,
    staleDays,
    evidence,
    nextAction: nextActionFor(issueType, route),
  });
}

function extractFindingsFromText({ text, route, source, asOf, staleDays }) {
  const findings = [];

  for (const match of text.matchAll(/\bUpdated\s+((January|February|March|April|May|June|July|August|September|October|November|December)\s+)?(20\d{2})\b/gi)) {
    const month = match[2] || "January";
    const year = Number(match[3]);
    const date = monthYearDate(month, year);
    if (!date) {
      continue;
    }
    const issueType = year < asOf.getUTCFullYear()
      ? "old-visible-updated-label"
      : "dated-proof-label-over-threshold";
    if (issueType === "old-visible-updated-label" || daysBetween(date, asOf) >= staleDays) {
      addFinding(findings, {
        route,
        source,
        issueType,
        evidence: snippet(text, match.index),
        asOf,
        staleDate: date,
        staleDays,
      });
    }
  }

  for (const match of text.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/gi)) {
    if (monthYearIsRangeStart(text, match)) {
      continue;
    }
    const date = monthYearDate(match[1], Number(match[2]));
    if (date && daysBetween(date, asOf) >= staleDays) {
      addFinding(findings, {
        route,
        source,
        issueType: "dated-proof-label-over-threshold",
        evidence: snippet(text, match.index),
        asOf,
        staleDate: date,
        staleDays,
      });
    }
  }

  for (const match of text.matchAll(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/g)) {
    const date = parseDateArg(match[1], "dateModified");
    if (daysBetween(date, asOf) >= staleDays) {
      addFinding(findings, {
        route,
        source,
        issueType: "stale-date-modified",
        evidence: snippet(text, match.index),
        asOf,
        staleDate: date,
        staleDays,
      });
    }
  }

  for (const match of text.matchAll(/stale-after[^0-9]*(\d{4}-\d{2}-\d{2})/gi)) {
    const date = parseDateArg(match[1], "stale-after");
    if (date < asOf) {
      addFinding(findings, {
        route,
        source,
        issueType: "expired-stale-after-label",
        evidence: snippet(text, match.index),
        asOf,
        staleDate: date,
        staleDays,
      });
    }
  }

  return dedupeFindings(findings);
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.route}|${finding.source}|${finding.issueType}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function listSourceFiles(startPath) {
  if (!fs.existsSync(startPath)) {
    return [];
  }
  const stat = fs.statSync(startPath);
  if (stat.isFile()) {
    return [startPath];
  }
  const entries = fs.readdirSync(startPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolute = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(absolute);
    }
    if (/\.(njk|html|md)$/.test(entry.name)) {
      return [absolute];
    }
    return [];
  });
}

function parseTriageClassMap(triageMarkdown) {
  const rows = new Map();
  for (const line of triageMarkdown.split(/\r?\n/)) {
    if (!line.startsWith("| /")) {
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim());
    const urlCell = cells[1] || "";
    const classCell = cells[2] || "";
    const route = urlCell.split(" -> ")[0];
    if (route && classCell) {
      rows.set(route, classCell);
    }
  }
  return rows;
}

function collectStaticFindings({ root = rootDir, asOf, staleDays }) {
  const sourceRoots = [
    "src/index.njk",
    "src/guides",
    "src/research",
    "src/property-management",
    "src/stays",
  ];
  const files = sourceRoots.flatMap((relative) => listSourceFiles(path.join(root, relative)));
  return files.flatMap((absolutePath) => {
    const relativePath = path.relative(root, absolutePath);
    const text = fs.readFileSync(absolutePath, "utf8");
    return extractFindingsFromText({
      text,
      route: routeFromSourcePath(relativePath),
      source: relativePath,
      asOf,
      staleDays,
    });
  });
}

function collectGeneratedPageFindings({ root = rootDir, asOf, staleDays }) {
  const seoPages = JSON.parse(fs.readFileSync(path.join(root, path.relative(rootDir, defaultSeoPagesPath)), "utf8"));
  const seoGovernance = require(path.join(root, path.relative(rootDir, defaultSeoGovernancePath)));
  const noindexSlugs = new Set(seoGovernance.staysNoindexSlugs || []);
  const triageMarkdown = fs.readFileSync(path.join(root, path.relative(rootDir, defaultTriagePath)), "utf8");
  const triageClasses = parseTriageClassMap(triageMarkdown);
  const rows = [];

  for (const page of seoPages.vacationer || []) {
    const route = `/stays/${page.slug}/`;
    const source = `src/_data/seoPages.json#${page.slug}`;
    rows.push(...extractFindingsFromText({
      text: JSON.stringify(page),
      route,
      source,
      asOf,
      staleDays,
    }));
    const classification = page.rehomeTo
      ? "redirect"
      : noindexSlugs.has(page.slug)
        ? "noindex"
        : triageClasses.get(route);
    if (classification === "consolidate") {
      addFinding(rows, {
        route,
        source,
        issueType: "pseo-consolidation-candidate",
        evidence: "Current pSEO triage class is `consolidate`.",
        asOf,
        staleDate: null,
        staleDays,
      });
    }
  }

  for (const page of seoPages.owner || []) {
    const route = `/property-management/${page.slug}/`;
    const source = `src/_data/seoPages.json#${page.slug}`;
    rows.push(...extractFindingsFromText({
      text: JSON.stringify(page),
      route,
      source,
      asOf,
      staleDays,
    }));
    if (triageClasses.get(route) === "consolidate") {
      addFinding(rows, {
        route,
        source,
        issueType: "pseo-consolidation-candidate",
        evidence: "Current pSEO triage class is `consolidate`.",
        asOf,
        staleDate: null,
        staleDays,
      });
    }
  }

  return dedupeFindings(rows);
}

function severityRank(severity) {
  return {
    high: 0,
    medium: 1,
    watch: 2,
  }[severity] ?? 9;
}

function issueRank(issueType) {
  return {
    "old-visible-updated-label": 0,
    "expired-stale-after-label": 1,
    "stale-date-modified": 2,
    "dated-proof-label-over-threshold": 3,
    "pseo-consolidation-candidate": 4,
  }[issueType] ?? 9;
}

function sortFindings(findings) {
  return [...findings].sort((a, b) => (
    severityRank(a.severity) - severityRank(b.severity)
    || issueRank(a.issueType) - issueRank(b.issueType)
    || (b.ageDays || 0) - (a.ageDays || 0)
    || a.route.localeCompare(b.route)
  ));
}

function countBy(findings, key) {
  return findings.reduce((counts, finding) => {
    const value = finding[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function renderCounts(counts) {
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function renderTable(findings) {
  const header = "| Severity | URL | Issue | Age | Evidence | Next action | Source |\n| --- | --- | --- | ---: | --- | --- | --- |";
  const body = findings.map((finding) => {
    const age = finding.ageDays === null || finding.ageDays === undefined ? "" : `${finding.ageDays}d`;
    return [
      finding.severity,
      finding.route,
      finding.issueType,
      age,
      finding.evidence,
      finding.nextAction,
      finding.source,
    ].map(escapeCell);
  }).map((cells) => `| ${cells.join(" | ")} |`).join("\n");
  return `${header}\n${body || "|  |  | no findings |  |  |  |  |"}`;
}

function renderPatrol({ findings, asOf, staleDays }) {
  const sorted = sortFindings(findings);
  const highPriority = sorted.filter((finding) => finding.severity === "high");
  const topRows = sorted.slice(0, 60);
  return `# Content Decay Patrol

Generated by \`node scripts/seo/content-decay-patrol.js --as-of ${dateOnly(asOf)}\`.

## Read

- As of: \`${dateOnly(asOf)}\`.
- Stale threshold: \`${staleDays}\` days.
- Scope: static guide, research, stay, owner, homepage source plus generated stay/owner pSEO records in \`src/_data/seoPages.json\`.
- Gate: this is a patrol queue, not source-edit approval. Public page edits still need \`docs/status/next-batch.md\`, one active brief, and the Gate 0 block required by \`docs/process/content-quality-gate.md\`.

## Counts

- Total findings: \`${sorted.length}\`.
- High-priority findings on tracked winner/money routes: \`${highPriority.length}\`.
- By severity: ${renderCounts(countBy(sorted, "severity")) || "none"}.
- By issue: ${renderCounts(countBy(sorted, "issueType")) || "none"}.

## Priority Queue

${renderTable(topRows)}
`;
}

function buildPatrol({ asOf, staleDays }) {
  const findings = [
    ...collectStaticFindings({ asOf, staleDays }),
    ...collectGeneratedPageFindings({ asOf, staleDays }),
  ];
  return {
    findings: sortFindings(dedupeFindings(findings)),
    markdown: renderPatrol({ findings, asOf, staleDays }),
  };
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = buildPatrol({ asOf: args.asOf, staleDays: args.staleDays });
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, result.markdown);
  console.log(`Wrote ${path.relative(rootDir, args.output)} with ${result.findings.length} finding(s)`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

module.exports = {
  buildPatrol,
  extractFindingsFromText,
  parseArgs,
  parseTriageClassMap,
  renderPatrol,
  routeFromSourcePath,
};
