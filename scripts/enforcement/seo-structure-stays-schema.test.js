const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("stays template can noindex weak template pages and avoids empty inventory schema", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");
  const itemListPartial = fs.readFileSync(
    path.join(projectRoot, "src", "_includes", "partials", "stay-itemlist-jsonld.njk"),
    "utf8"
  );

  assert.equal(staysTemplate.includes("data: staysPages"), true);
  assert.equal(staysTemplate.includes("seoGovernance.staysNoindexSlugs.indexOf(seoPage.slug) === -1"), true);
  assert.equal(staysTemplate.includes("noindex, follow"), true);
  assert.equal(staysTemplate.includes('{% include "partials/stay-itemlist-jsonld.njk" %}'), true);
  assert.equal(
    itemListPartial.includes("{% elif properties and properties | length and seoPage.matchingProperties and seoPage.matchingProperties.length > 0 %}"),
    true
  );
  assert.equal(itemListPartial.includes("{% elif properties and properties | length %}"), true);
});
