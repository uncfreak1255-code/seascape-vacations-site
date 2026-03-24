const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
const robots = fs.readFileSync(path.join(projectRoot, "src", "robots.txt"), "utf8");
const propertyPages = [
  "bradenton-pool-home",
  "dockside-dreams",
  "river-house",
  "sarasota-luxe",
  "the-oasis"
].map((slug) => ({
  slug,
  source: fs.readFileSync(path.join(projectRoot, "src", "properties", slug, "index.njk"), "utf8")
}));
const guideDir = path.join(projectRoot, "src", "guides");

function listGuideFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listGuideFiles(fullPath);
    if (!fullPath.endsWith(".html")) return [];
    return [fullPath];
  });
}

const guideFiles = listGuideFiles(guideDir).map((fullPath) => ({
  path: path.relative(projectRoot, fullPath),
  source: fs.readFileSync(fullPath, "utf8")
}));

test("robots.txt stays within supported directives", () => {
  assert.equal(
    robots.includes("LLMs-txt:"),
    false,
    "robots.txt should not emit unsupported LLMs-txt directives"
  );
});

test("property pages do not hardcode placeholder review schema", () => {
  for (const page of propertyPages) {
    assert.equal(
      page.source.includes("TODO: Replace with real Hostaway reviews"),
      false,
      `${page.slug} should not ship placeholder review TODO markers`
    );
    assert.equal(
      page.source.includes('"@type": "Review"'),
      false,
      `${page.slug} should not hardcode review schema into the source template`
    );
  }
});

test("homepage does not ship hidden FAQ schema without visible FAQ content", () => {
  assert.equal(
    homepage.includes('"@type": "FAQPage"'),
    false,
    "Homepage should not ship FAQPage schema unless the FAQ content is actually present on the page"
  );
});

test("property pages with AggregateOffer do not also ship a stale priceRange", () => {
  for (const page of propertyPages) {
    if (!page.source.includes('"@type": "AggregateOffer"')) continue;
    assert.equal(
      page.source.includes('"priceRange"'),
      false,
      `${page.slug} should not mix AggregateOffer with a separate stale priceRange string`
    );
  }
});

test("guide pages only claim Sawyer authorship when the page visibly supports it", () => {
  for (const guide of guideFiles) {
    const claimsSawyer =
      guide.source.includes('"author": {"@type": "Person", "name": "Sawyer Beck"') ||
      guide.source.includes('"author":{"@type":"Person","name":"Sawyer Beck"');

    if (!claimsSawyer) continue;

    const showsSawyer =
      guide.source.includes('meta name="author" content="Sawyer Beck"') ||
      guide.source.includes('data-guide-author="sawyer-beck"') ||
      guide.source.includes("By Sawyer Beck");

    assert.equal(
      showsSawyer,
      true,
      `${guide.path} claims Sawyer Beck in JSON-LD without visible page-level authorship support`
    );
  }
});
