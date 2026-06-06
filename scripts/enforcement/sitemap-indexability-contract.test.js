const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { readBuiltRoute } = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

// These checks read the RENDERED build (_site), not source flags or the
// sitemap template. The point is to catch the exact class of bug that
// silently demoted the AMI income guide: a page can carry an inline
// `<meta name="robots" content="noindex">` while still being listed in
// sitemap.xml, because the two facts are produced by different layers and
// nothing compared the rendered output of both. That collision shipped and
// was only cleaned up by hand in #247. These guards make it impossible to
// reintroduce without a red test.

function readSitemapRoutes() {
  const sitemapPath = path.join(projectRoot, "_site", "sitemap.xml");
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return locs
    .map((loc) => loc.replace(/<\/?loc>/g, "").trim())
    .map((url) => (url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) : url));
}

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/$/, "");
}

test("every URL listed in sitemap.xml renders as indexable (no noindex)", () => {
  const routes = readSitemapRoutes();
  assert.ok(routes.length > 0, "sitemap.xml should list at least one route");

  const offenders = [];
  for (const routePath of routes) {
    let contract;
    try {
      contract = readBuiltRoute(projectRoot, routePath);
    } catch (error) {
      offenders.push(
        `${routePath} -> sitemap lists this URL but no page was built for it (${error.code || error.message})`
      );
      continue;
    }

    const robots = String(contract.head.robots || "").toLowerCase();
    if (robots.includes("noindex")) {
      offenders.push(
        `${routePath} -> rendered robots meta is "${contract.head.robots}" but the page is advertised in sitemap.xml`
      );
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Sitemap / indexability collision. A page that is noindexed (or missing) must not appear in sitemap.xml:\n- ${offenders.join(
      "\n- "
    )}`
  );
});

test("every URL listed in sitemap.xml is self-canonical", () => {
  const routes = readSitemapRoutes();
  const offenders = [];

  for (const routePath of routes) {
    let contract;
    try {
      contract = readBuiltRoute(projectRoot, routePath);
    } catch {
      // The missing-page case is already reported by the indexability test.
      continue;
    }

    const canonical = contract.head.canonical;
    if (!canonical) {
      offenders.push(`${routePath} -> no canonical tag rendered`);
      continue;
    }

    const expected = `${SITE_ORIGIN}${routePath}`;
    if (stripTrailingSlash(canonical) !== stripTrailingSlash(expected)) {
      offenders.push(`${routePath} -> canonical points to "${canonical}", not to itself`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Sitemap canonical leak. A page in sitemap.xml must canonicalize to itself, or it sends Google contradictory signals:\n- ${offenders.join(
      "\n- "
    )}`
  );
});
