const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
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
