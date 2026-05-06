const fs = require("fs");
const path = require("path");

const PORTFOLIO_FILES = [
  {
    family: "winner-guides",
    path: path.join("docs", "portfolio", "winner-guides.md")
  },
  {
    family: "stay-money-pages",
    path: path.join("docs", "portfolio", "stay-money-pages.md")
  },
  {
    family: "owner-acquisition",
    path: path.join("docs", "portfolio", "owner-acquisition.md")
  }
];

const REQUIRED_COLUMNS = [
  "Winner URL",
  "Aliases / retired routes",
  "Feeder pages",
  "Money destination",
  "Primary CTA",
  "Tracked event",
  "Success metric",
  "Schema expectation",
  "Sitemap state"
];

function splitMarkdownRow(row) {
  return String(row || "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(row) {
  return splitMarkdownRow(row).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function normalizePortfolioPath(urlPath) {
  const clean = String(urlPath || "").trim();
  if (!clean || clean === "/") return clean;
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function normalizeComparablePath(urlPath) {
  const clean = String(urlPath || "").trim();
  if (!clean || clean === "/") return clean;
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

function extractBacktickPaths(cell) {
  const paths = [];
  const pattern = /`(\/[^`]+)`/g;
  let match;

  while ((match = pattern.exec(String(cell || ""))) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

function parseSchemaExpectation(cell) {
  return String(cell || "")
    .split("+")
    .map((schemaType) => schemaType.replace(/`/g, "").trim())
    .filter(Boolean);
}

function pageKindFromWinnerUrl(winnerUrl) {
  if (winnerUrl.startsWith("/guides/")) return "guide";
  if (winnerUrl.startsWith("/stays/")) return "stay";
  if (winnerUrl.startsWith("/property-management/")) return "owner";
  return "other";
}

function slugFromWinnerUrl(winnerUrl) {
  const clean = normalizeComparablePath(winnerUrl);
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function parsePortfolioMarkdown(markdown, { family, sourcePath }) {
  const lines = String(markdown || "").split("\n");
  const headerIndex = lines.findIndex((line) => line.includes("| Winner URL |"));
  if (headerIndex === -1) {
    throw new Error(`Portfolio table missing in ${sourcePath}`);
  }

  const headers = splitMarkdownRow(lines[headerIndex]);
  for (const requiredColumn of REQUIRED_COLUMNS) {
    if (!headers.includes(requiredColumn)) {
      throw new Error(`${sourcePath} missing required column: ${requiredColumn}`);
    }
  }

  const rows = [];
  for (const line of lines.slice(headerIndex + 1)) {
    if (!line.trim()) break;
    if (!line.trim().startsWith("|")) break;
    if (isSeparatorRow(line)) continue;

    const cells = splitMarkdownRow(line);
    const fields = Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
    const winnerUrl = normalizePortfolioPath(fields["Winner URL"].replace(/`/g, ""));

    rows.push({
      family,
      sourcePath,
      winnerUrl,
      kind: pageKindFromWinnerUrl(winnerUrl),
      slug: slugFromWinnerUrl(winnerUrl),
      aliases: extractBacktickPaths(fields["Aliases / retired routes"]),
      feederPages: extractBacktickPaths(fields["Feeder pages"]),
      moneyDestinations: extractBacktickPaths(fields["Money destination"]),
      primaryCta: fields["Primary CTA"].replace(/`/g, "").trim(),
      trackedEvent: fields["Tracked event"].replace(/`/g, "").trim(),
      successMetric: fields["Success metric"].trim(),
      schemaExpectation: parseSchemaExpectation(fields["Schema expectation"]),
      sitemapState: fields["Sitemap state"].trim(),
      fields
    });
  }

  return rows;
}

function readPageFamilyInventory(projectRoot = path.resolve(__dirname, "..", "..")) {
  return PORTFOLIO_FILES.flatMap((portfolioFile) => {
    const sourcePath = path.join(projectRoot, portfolioFile.path);
    const markdown = fs.readFileSync(sourcePath, "utf8");
    return parsePortfolioMarkdown(markdown, {
      family: portfolioFile.family,
      sourcePath
    });
  });
}

module.exports = {
  PORTFOLIO_FILES,
  REQUIRED_COLUMNS,
  extractBacktickPaths,
  normalizeComparablePath,
  normalizePortfolioPath,
  parsePortfolioMarkdown,
  readPageFamilyInventory,
  slugFromWinnerUrl
};
