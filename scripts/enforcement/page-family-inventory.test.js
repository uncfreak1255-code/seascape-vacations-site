const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  REQUIRED_COLUMNS,
  normalizeComparablePath,
  readPageFamilyInventory
} = require("./page-family-inventory");
const { parseRedirects } = require("./validate-redirect-targets");

const projectRoot = path.resolve(__dirname, "..", "..");
const inventory = readPageFamilyInventory(projectRoot);
const redirects = parseRedirects(path.join(projectRoot, "src", "_redirects"));
const seoPages = require(path.join(projectRoot, "src", "_data", "seoPages.json"));
const seoGovernance = require(path.join(projectRoot, "src", "_data", "seoGovernance.js"));
const conversionTracking = fs.readFileSync(
  path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
  "utf8"
);
const sitemapTemplate = fs.readFileSync(path.join(projectRoot, "src", "sitemap.njk"), "utf8");

function redirectFor(urlPath) {
  return redirects.find((rule) => rule.from === urlPath);
}

function guideSourcePath(slug) {
  return path.join(projectRoot, "src", "guides", `${slug}.html`);
}

test("portfolio page-family inventory exposes every required routing column", () => {
  assert.ok(inventory.length > 0, "portfolio inventory should not be empty");

  for (const entry of inventory) {
    for (const requiredColumn of REQUIRED_COLUMNS) {
      assert.equal(
        typeof entry.fields[requiredColumn],
        "string",
        `${entry.sourcePath} ${entry.winnerUrl} missing ${requiredColumn}`
      );
      assert.notEqual(
        entry.fields[requiredColumn].trim(),
        "",
        `${entry.sourcePath} ${entry.winnerUrl} has an empty ${requiredColumn}`
      );
    }
  }
});

test("documented portfolio aliases redirect directly to their winner URL", () => {
  for (const entry of inventory) {
    for (const alias of entry.aliases) {
      const rule = redirectFor(alias);
      assert.ok(rule, `${entry.winnerUrl} documents alias ${alias}, but src/_redirects has no rule`);
      assert.equal(rule.code, "301", `${alias} should be a permanent redirect`);
      assert.equal(
        normalizeComparablePath(rule.to),
        normalizeComparablePath(entry.winnerUrl),
        `${alias} should redirect directly to ${entry.winnerUrl}`
      );
    }
  }
});

test("portfolio winner URLs resolve through the current sitemap inputs", () => {
  assert.equal(sitemapTemplate.includes("collections.all"), true, "guide pages should flow through collections.all");
  assert.equal(sitemapTemplate.includes("staysPages"), true, "stay pages should flow through staysPages");
  assert.equal(sitemapTemplate.includes("seoPages.owner"), true, "owner pages should flow through seoPages.owner");

  for (const entry of inventory) {
    assert.equal(
      redirectFor(entry.winnerUrl),
      undefined,
      `${entry.winnerUrl} is documented as a winner but is also a redirect source`
    );

    if (entry.kind === "guide") {
      assert.equal(fs.existsSync(guideSourcePath(entry.slug)), true, `${entry.winnerUrl} needs a guide source file`);
      continue;
    }

    if (entry.kind === "stay") {
      const stayPage = seoPages.vacationer.find((page) => page.slug === entry.slug);
      assert.ok(stayPage, `${entry.winnerUrl} needs a vacationer seoPages entry`);
      assert.equal(
        seoGovernance.staysNoindexSlugs.includes(entry.slug),
        false,
        `${entry.winnerUrl} is documented as sitemap-visible but is noindexed`
      );
      continue;
    }

    if (entry.kind === "owner") {
      const ownerPage = seoPages.owner.find((page) => page.slug === entry.slug);
      assert.ok(ownerPage, `${entry.winnerUrl} needs an owner seoPages entry`);
      assert.notEqual(ownerPage.seoIndexable, false, `${entry.winnerUrl} is documented as sitemap-visible but is noindexed`);
      assert.notEqual(ownerPage.seoIndexable, "false", `${entry.winnerUrl} is documented as sitemap-visible but is noindexed`);
    }
  }
});

test("portfolio tracked events are supported by the conversion tracking surface", () => {
  for (const entry of inventory) {
    assert.equal(
      conversionTracking.includes(`"${entry.trackedEvent}"`),
      true,
      `${entry.winnerUrl} tracks ${entry.trackedEvent}, but conversion-tracking.js does not list it`
    );
  }
});
