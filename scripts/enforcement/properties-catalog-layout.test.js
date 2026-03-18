const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const propertiesTemplatePath = path.resolve(__dirname, "../../src/properties/index.njk");
const propertiesTemplate = fs.readFileSync(propertiesTemplatePath, "utf8");

test("properties catalog reserves action-row space and normalizes title height", () => {
  assert.match(
    propertiesTemplate,
    /\.catalog-card-inner\s*\{[\s\S]*min-height:\s*100%;[\s\S]*grid-template-rows:\s*auto auto auto auto auto 1fr auto;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card h3\s*\{[\s\S]*-webkit-line-clamp:\s*2;[\s\S]*min-height:\s*1\.9em;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/
  );
});
