const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const propertiesTemplatePath = path.resolve(__dirname, "../../src/properties/index.njk");
const propertiesTemplate = fs.readFileSync(propertiesTemplatePath, "utf8");

test("properties catalog keeps filtered result cards compact and scannable", () => {
  assert.match(
    propertiesTemplate,
    /\.catalog-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(min\(100%, 340px\), 1fr\)\);/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card\s*\{[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*white;[\s\S]*flex-direction:\s*column;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card img\s*\{[\s\S]*height:\s*238px;[\s\S]*object-fit:\s*cover;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card-inner\s*\{[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card h3\s*\{[\s\S]*-webkit-line-clamp:\s*2;[\s\S]*min-height:\s*2\.16em;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-actions\s*\{[\s\S]*display:\s*flex;[\s\S]*margin-top:\s*auto;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-actions \.btn,[\s\S]*?\.catalog-secondary\s*\{[\s\S]*border-radius:\s*8px;/
  );
});
