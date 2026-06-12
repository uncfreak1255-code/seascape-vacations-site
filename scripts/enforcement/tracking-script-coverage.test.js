const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { readBuiltRoute } = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

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
