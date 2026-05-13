const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generateLlmsPropertiesBlock,
  regeneratePropertySurfaces,
  renderAmenityLabels,
  renderPropertySummary,
  renderSchemaAmenityLabels
} = require("../../scripts/regenerate-property-surfaces");

const projectRoot = path.resolve(__dirname, "..", "..");

const properties = [
  {
    slug: "dockside-dreams",
    name: "Dockside Dreams",
    city: "Bradenton",
    bedrooms: 4,
    bathrooms: 3,
    guests: 12,
    amenities: ["pool", "waterfront", "dock", "hot-tub"],
    marketing_amenities: ["private-heated-pool", "private-dock", "waterfront"]
  },
  {
    slug: "bradenton-pool-home",
    name: "Bradenton Pool Home",
    city: "Bradenton",
    bedrooms: 3,
    bathrooms: 3.5,
    guests: 10,
    amenities: ["pool", "spa", "outdoor-grill"],
    marketing_amenities: ["private-heated-pool", "hot-tub-spa", "grill"]
  }
];

test("renders llms property bullets from fallback property facts", () => {
  const block = generateLlmsPropertiesBlock(properties);

  assert.match(block, /Bradenton Pool Home.*3BR\/3\.5BA.*sleeps 10/);
  assert.match(block, /Dockside Dreams.*4BR\/3BA.*sleeps 12/);
  assert.match(block, /outdoor grill/);
  assert.match(block, /dock/);
});

test("renders human amenity labels from structured fallback amenity keys", () => {
  assert.deepEqual(renderAmenityLabels(properties[1]), [
    "private heated pool",
    "hot tub/spa",
    "grill"
  ]);
});

test("renders schema amenity labels from amenities before broader marketing tags", () => {
  assert.deepEqual(renderSchemaAmenityLabels(properties[1], 4), [
    "pool",
    "spa",
    "outdoor grill",
    "private heated pool"
  ]);
});

test("regenerates llms and property template fact surfaces from fallback JSON", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-surfaces-"));
  const fallbackPath = path.join(dir, "src", "_data", "properties-fallback.json");
  const llmsPath = path.join(dir, "src", "llms.txt");
  const templatePath = path.join(dir, "src", "properties", "bradenton-pool-home", "index.njk");
  fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
  fs.mkdirSync(path.dirname(templatePath), { recursive: true });
  fs.writeFileSync(fallbackPath, `${JSON.stringify([properties[1]], null, 2)}\n`);
  fs.writeFileSync(
    llmsPath,
    "# Seascape Vacations\n\n## Properties\n\n- stale property text\n\n## Book Direct\n\n- keep this\n"
  );
  fs.writeFileSync(
    templatePath,
    [
      `<script type="application/ld+json">{"numberOfBedrooms": 9,"numberOfBathroomsTotal": 9,"amenityFeature": [{"@type":"LocationFeatureSpecification","name":"stale"}],"petsAllowed": false}</script>`,
      `<div class="stat-val">9</div><div class="stat-label">Bedrooms</div>`,
      `<div class="stat-val">9</div><div class="stat-label">Bathrooms</div>`,
      `<div class="stat-val">9</div><div class="stat-label">Max Guests</div>`,
      `<tr><td>Bedrooms / Bathrooms</td><td>9 BR / 9 BA</td></tr>`
    ].join("")
  );

  const result = regeneratePropertySurfaces({
    projectRoot: dir,
    fallbackPath,
    llmsPath
  });

  assert.deepEqual(result.changed.sort(), [
    "src/llms.txt",
    "src/properties/bradenton-pool-home/index.njk"
  ]);

  const llms = fs.readFileSync(llmsPath, "utf8");
  assert.match(llms, /Bradenton Pool Home.*3BR\/3\.5BA.*sleeps 10/);
  assert.doesNotMatch(llms, /stale property text/);
  assert.match(llms, /## Book Direct\n\n- keep this/);

  const template = fs.readFileSync(templatePath, "utf8");
  assert.match(template, /"numberOfBedrooms": 3/);
  assert.match(template, /"numberOfBathroomsTotal": 3\.5/);
  assert.match(template, /"name": "outdoor grill"/);
  assert.doesNotMatch(template, /"name": "Closest Home to IMG Academy"/);
  assert.match(template, /<div class="stat-val">3<\/div><div class="stat-label">Bedrooms<\/div>/);
  assert.match(template, /<div class="stat-val">3\.5<\/div><div class="stat-label">Bathrooms<\/div>/);
  assert.match(template, /<div class="stat-val">10<\/div><div class="stat-label">Max Guests<\/div>/);
  assert.match(template, /3 BR \/ 3\.5 BA/);
});

test("property summary stays compact and sourceable", () => {
  assert.equal(
    renderPropertySummary(properties[1]),
    "3BR/3.5BA in Bradenton, pool, spa, outdoor grill, sleeps 10"
  );
});

test("checked-in property truth surfaces are regenerated from fallback data", () => {
  const result = regeneratePropertySurfaces({ projectRoot, dryRun: true });

  assert.deepEqual(result.changed, []);
});
