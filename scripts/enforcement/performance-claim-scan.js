const fs = require("fs");
const path = require("path");

const OCCUPANCY_ADR_REVENUE_PATTERNS = [
  { id: "occupancy-percent", pattern: /\d+\s*%?\s*(?:-|–|to)?\s*\d*\s*%\+?\s*(?:annual\s+)?occupancy/i },
  { id: "occupancy-of", pattern: /occupancy\s+(?:to|of|at)\s+\d+/i },
  { id: "adr-dollar", pattern: /\bADR\b[^.\n]{0,48}\$[\d,]+/i },
  { id: "dollar-adr", pattern: /\$[\d,]+(?:\.\d+)?[^.\n]{0,48}\bADR\b/i },
  { id: "revenue-percent", pattern: /\d+\s*(?:-|–|to)\s*\d+\s*%\s+(?:of\s+)?(?:potential\s+)?(?:annual\s+)?(?:income|revenue)/i },
  { id: "annual-revenue", pattern: /\$[\d,]+(?:k|K|m|M)?\s+(?:gross\s+)?(?:annual\s+)?revenue/i }
];

const PUBLIC_COPY_PATH_PATTERNS = [
  /^src\/guides\/.+\.(html|njk)$/i,
  /^src\/research\/.+\.njk$/i,
  /^src\/property-management\/.+\.njk$/i,
  /^src\/stays\/.+\.njk$/i,
  /^src\/index\.njk$/i,
  /^src\/properties\/.+\.njk$/i,
  /^src\/_includes\/.+\.njk$/i
];

const PUBLIC_COPY_DATA_FILES = [path.join("src", "_data", "seoPages.json")];

const NON_READER_SEO_FIELDS = new Set([
  "slug",
  "canonical",
  "image",
  "ogImage",
  "url",
  "ctaPath",
  "benchmarkUrl",
  "sourceUrl"
]);

function findPerformanceClaimHits(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("findPerformanceClaimHits requires non-empty text");
  }

  const hits = [];
  for (const { id, pattern } of OCCUPANCY_ADR_REVENUE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      hits.push({ id, match: match[0] });
    }
  }
  return hits;
}

function lintPerformanceClaims(relativePath, text) {
  return findPerformanceClaimHits(text).map(
    (hit) => `${relativePath}: unsourced occupancy/ADR/revenue claim "${hit.match}"`
  );
}

function readerVisibleSeoText(entry) {
  const parts = [];
  const walk = (key, value) => {
    if (typeof value === "string") {
      if (NON_READER_SEO_FIELDS.has(key)) return;
      if (/^(https?:)?\/\//i.test(value.trim())) return;
      parts.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(key, item));
      return;
    }
    if (value && typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        walk(childKey, childValue);
      }
    }
  };
  walk("", entry);
  return parts.join("\n");
}

function listFilesRecursive(rootDir) {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      files.push(fullPath);
    }
  }

  walk(rootDir);
  return files;
}

function collectPublicCopyFiles(projectRoot = process.cwd()) {
  const files = listFilesRecursive(path.join(projectRoot, "src"))
    .map((fullPath) => path.relative(projectRoot, fullPath).split(path.sep).join("/"))
    .filter((relativePath) => PUBLIC_COPY_PATH_PATTERNS.some((pattern) => pattern.test(relativePath)));

  return [...files, ...PUBLIC_COPY_DATA_FILES];
}

function scanPublicCopyFile(relativePath, projectRoot = process.cwd()) {
  const fullPath = path.join(projectRoot, relativePath);
  const raw = fs.readFileSync(fullPath, "utf8");
  if (!raw.trim()) {
    return [];
  }

  if (relativePath.endsWith("seoPages.json")) {
    const seoPages = JSON.parse(raw);
    const hits = [];
    for (const [family, entries] of Object.entries(seoPages)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const readerText = readerVisibleSeoText(entry);
        if (!readerText.trim()) continue;
        for (const hit of findPerformanceClaimHits(readerText)) {
          hits.push({
            path: `${relativePath}#${family}/${entry.slug || "unknown"}`,
            id: hit.id,
            match: hit.match
          });
        }
      }
    }
    return hits;
  }

  return findPerformanceClaimHits(raw).map((hit) => ({
    path: relativePath,
    id: hit.id,
    match: hit.match
  }));
}

function scanRepoPublicCopy(projectRoot = process.cwd()) {
  const files = collectPublicCopyFiles(projectRoot);
  if (!files.length) {
    throw new Error("scanRepoPublicCopy found no public copy files");
  }

  return files.flatMap((relativePath) => scanPublicCopyFile(relativePath, projectRoot));
}

function formatPerformanceClaimReport(hits) {
  if (!hits.length) {
    return "occupancy/ADR/revenue scan: 0 hits in public copy";
  }

  const lines = [`occupancy/ADR/revenue scan: ${hits.length} hit(s) (reported, not rewritten)`];
  for (const hit of hits) {
    lines.push(`- ${hit.path}: ${hit.id} "${hit.match}"`);
  }
  return lines.join("\n");
}

module.exports = {
  OCCUPANCY_ADR_REVENUE_PATTERNS,
  findPerformanceClaimHits,
  lintPerformanceClaims,
  collectPublicCopyFiles,
  scanPublicCopyFile,
  scanRepoPublicCopy,
  formatPerformanceClaimReport,
  readerVisibleSeoText
};
