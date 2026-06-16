const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { readBuiltRoute } = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

function listFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });
}

function scanFiles(relativeRoots, patterns) {
  const offenders = [];
  const textFilePattern = /\.(html|njk|js|json|css|txt|xml|md)$/i;

  for (const relativeRoot of relativeRoots) {
    const absoluteRoot = path.join(projectRoot, relativeRoot);
    if (!fs.existsSync(absoluteRoot)) continue;

    const files = fs.statSync(absoluteRoot).isDirectory()
      ? listFiles(absoluteRoot)
      : [absoluteRoot];

    for (const file of files.filter((candidate) => textFilePattern.test(candidate))) {
      const body = fs.readFileSync(file, "utf8");
      for (const pattern of patterns) {
        if (pattern.test(body)) {
          offenders.push(path.relative(projectRoot, file));
          break;
        }
      }
    }
  }

  return [...new Set(offenders)].sort();
}

function readSitemapRoutes() {
  const sitemapPath = path.join(projectRoot, "_site", "sitemap.xml");
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return locs
    .map((loc) => loc.replace(/<\/?loc>/g, "").trim())
    .map((url) => (url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) : url));
}

test("rendered routes with tracked events load the shared tracking runtime", () => {
  const routes = readSitemapRoutes();
  assert.ok(routes.length > 0, "sitemap.xml should list at least one route");

  const offenders = [];
  for (const routePath of routes) {
    const contract = readBuiltRoute(projectRoot, routePath);
    if (!contract.trackedEvents.length) {
      continue;
    }

    const html = fs.readFileSync(path.join(projectRoot, contract.sourcePath), "utf8");
    const hasTrackingScript = html.includes('/assets/js/conversion-tracking.js');

    // The homepage loads the shared tracking script through homepage.js at runtime.
    const hasRuntimeLoader = html.includes('/assets/js/homepage.js');

    if (!hasTrackingScript && !hasRuntimeLoader) {
      offenders.push(`${routePath} -> tracked events ${contract.trackedEvents.join(", ")}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Routes with tracked events must load shared tracking:\n- ${offenders.join("\n- ")}`
  );
});

test("production source and build do not include Meta Pixel or PostHog tracking", () => {
  const metaPixelPatterns = [
    /connect\.facebook\.net/i,
    /fbevents\.js/i,
    /\bfbq\s*\(/i,
    /facebook\.com\/tr\b/i,
    /2748551298816267/,
    /deferred-meta-pixel/i
  ];
  const posthogRuntimePatterns = [
    /posthog-js/i,
    /posthog\.init/i,
    /app\.posthog\.com/i,
    /us\.i\.posthog\.com/i,
    /eu\.i\.posthog\.com/i
  ];

  assert.deepEqual(
    scanFiles(["src", "_site"], metaPixelPatterns),
    [],
    "Meta Pixel/fbevents tracking code should not remain in production source or built output"
  );

  assert.deepEqual(
    scanFiles(["src", "_site", "package.json", "package-lock.json"], posthogRuntimePatterns),
    [],
    "PostHog scripts or dependencies should not be added to production source, build output, or package manifests"
  );
});
