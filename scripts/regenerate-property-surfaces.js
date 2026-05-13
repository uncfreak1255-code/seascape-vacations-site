#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_FALLBACK_PATH = path.join(DEFAULT_PROJECT_ROOT, "src", "_data", "properties-fallback.json");
const DEFAULT_LLMS_PATH = path.join(DEFAULT_PROJECT_ROOT, "src", "llms.txt");

const AMENITY_LABELS = {
  "private-heated-pool": "private heated pool",
  "hot-tub-spa": "hot tub/spa",
  "private-dock": "private dock",
  waterfront: "waterfront",
  "game-room": "game room",
  "outdoor-kitchen": "outdoor kitchen",
  "fast-wifi": "fast WiFi",
  "pet-friendly": "pet friendly",
  "single-level": "single-level layout",
  "outdoor-living": "outdoor living",
  grill: "grill",
  "fenced-yard": "fenced yard",
  "kid-friendly": "kid friendly",
  downtown: "downtown access",
  "putting-green": "putting green",
  "smart-tv": "smart TV",
  pool: "pool",
  dock: "dock",
  "hot-tub": "hot tub",
  spa: "spa",
  "outdoor-grill": "outdoor grill"
};

function formatCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number) ? String(number) : String(number);
}

function amenityLabel(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return AMENITY_LABELS[key] || key.replace(/[-_]+/g, " ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeHighlight(value) {
  return String(value || "").trim();
}

function renderAmenityLabels(property, limit = 3) {
  const source = Array.isArray(property.marketing_amenities) && property.marketing_amenities.length
    ? property.marketing_amenities
    : property.amenities || [];

  return unique(source.map(amenityLabel)).slice(0, limit);
}

function renderPropertyFactLabels(property, limit = 3) {
  const highlights = Array.isArray(property.highlights)
    ? property.highlights.map(normalizeHighlight)
    : [];
  const structuredAmenities = Array.isArray(property.amenities)
    ? property.amenities.map(amenityLabel)
    : [];
  const marketingAmenities = Array.isArray(property.marketing_amenities)
    ? property.marketing_amenities.map(amenityLabel)
    : [];

  return unique([...highlights, ...structuredAmenities, ...marketingAmenities]).slice(0, limit);
}

function renderSchemaAmenityLabels(property, limit = 12) {
  const structuredAmenities = Array.isArray(property.amenities)
    ? property.amenities.map(amenityLabel)
    : [];
  const marketingAmenities = Array.isArray(property.marketing_amenities)
    ? property.marketing_amenities.map(amenityLabel)
    : [];

  return unique([...structuredAmenities, ...marketingAmenities]).slice(0, limit);
}

function renderPropertySummary(property) {
  const bedrooms = formatCount(property.bedrooms);
  const bathrooms = formatCount(property.bathrooms);
  const guests = formatCount(property.guests);
  const amenities = renderPropertyFactLabels(property).join(", ");
  const amenityPhrase = amenities ? `, ${amenities}` : "";

  return `${bedrooms}BR/${bathrooms}BA in ${property.city || "Bradenton"}${amenityPhrase}, sleeps ${guests}`;
}

function generateLlmsPropertiesBlock(properties) {
  return [
    "## Properties",
    "",
    ...properties.map((property) => {
      return `- [${property.name}](https://seascape-vacations.com/properties/${property.slug}/): ${renderPropertySummary(property)}`;
    }),
    ""
  ].join("\n");
}

function replaceLlmsPropertiesBlock(text, properties) {
  const nextBlock = generateLlmsPropertiesBlock(properties);
  const pattern = /## Properties[\s\S]*?(?=\n## Book Direct\n)/;
  if (!pattern.test(text)) {
    throw new Error("Could not find ## Properties block before ## Book Direct in src/llms.txt");
  }
  return text.replace(pattern, nextBlock);
}

function renderJsonValue(value) {
  return JSON.stringify(Number.isFinite(Number(value)) ? Number(value) : value);
}

function renderAmenityFeatureArray(property) {
  return renderSchemaAmenityLabels(property, 12)
    .map((name) => [
      "      {",
      "        \"@type\": \"LocationFeatureSpecification\",",
      `        \"name\": ${JSON.stringify(name)},`,
      "        \"value\": true",
      "      }"
    ].join("\n"))
    .join(",\n");
}

function replaceFirstRequired(text, pattern, replacement, label) {
  if (!pattern.test(text)) {
    throw new Error(`Could not replace ${label}`);
  }
  return text.replace(pattern, replacement);
}

function replaceTemplateFacts(text, property) {
  let next = text;
  const bedrooms = formatCount(property.bedrooms);
  const bathrooms = formatCount(property.bathrooms);
  const guests = formatCount(property.guests);

  next = replaceFirstRequired(
    next,
    /"numberOfBedrooms":\s*[\d.]+/,
    `"numberOfBedrooms": ${renderJsonValue(property.bedrooms)}`,
    `${property.slug} JSON-LD bedroom count`
  );
  next = replaceFirstRequired(
    next,
    /"numberOfBathroomsTotal":\s*[\d.]+/,
    `"numberOfBathroomsTotal": ${renderJsonValue(property.bathrooms)}`,
    `${property.slug} JSON-LD bathroom count`
  );
  next = replaceFirstRequired(
    next,
    /"amenityFeature":\s*\[[\s\S]*?\]\s*,\s*"petsAllowed":/,
    `"amenityFeature": [\n${renderAmenityFeatureArray(property)}\n    ],\n    "petsAllowed":`,
    `${property.slug} JSON-LD amenityFeature`
  );

  next = replaceFirstRequired(
    next,
    /(<div class="stat-val">)[^<]+(<\/div><div class="stat-label">Bedrooms<\/div>)/,
    `$1${bedrooms}$2`,
    `${property.slug} bedroom stat`
  );
  next = replaceFirstRequired(
    next,
    /(<div class="stat-val">)[^<]+(<\/div><div class="stat-label">Bathrooms<\/div>)/,
    `$1${bathrooms}$2`,
    `${property.slug} bathroom stat`
  );
  next = replaceFirstRequired(
    next,
    /(<div class="stat-val">)[^<]+(<\/div><div class="stat-label">Max Guests<\/div>)/,
    `$1${guests}$2`,
    `${property.slug} guest stat`
  );
  next = replaceFirstRequired(
    next,
    /(Bedrooms \/ Bathrooms<\/td><td[^>]*>)[^<]+(<\/td>)/,
    `$1${bedrooms} BR / ${bathrooms} BA$2`,
    `${property.slug} comparison row`
  );

  return next;
}

function writeIfChanged(filePath, nextText, changed, dryRun, projectRoot) {
  const before = fs.readFileSync(filePath, "utf8");
  if (before === nextText) return;
  changed.push(path.relative(projectRoot, filePath));
  if (!dryRun) fs.writeFileSync(filePath, nextText);
}

function loadProperties(fallbackPath) {
  const properties = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  if (!Array.isArray(properties)) {
    throw new Error(`${fallbackPath} must contain a property array`);
  }
  return properties;
}

function regeneratePropertySurfaces({
  projectRoot = DEFAULT_PROJECT_ROOT,
  fallbackPath = path.join(projectRoot, "src", "_data", "properties-fallback.json"),
  llmsPath = path.join(projectRoot, "src", "llms.txt"),
  dryRun = false
} = {}) {
  const properties = loadProperties(fallbackPath);
  const changed = [];
  const llms = fs.readFileSync(llmsPath, "utf8");
  const nextLlms = replaceLlmsPropertiesBlock(llms, properties);
  writeIfChanged(llmsPath, nextLlms, changed, dryRun, projectRoot);

  for (const property of properties) {
    const templatePath = path.join(projectRoot, "src", "properties", property.slug, "index.njk");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Missing property template for ${property.slug}: ${templatePath}`);
    }
    const template = fs.readFileSync(templatePath, "utf8");
    const nextTemplate = replaceTemplateFacts(template, property);
    const before = fs.readFileSync(templatePath, "utf8");
    if (before !== nextTemplate) {
      changed.push(path.relative(projectRoot, templatePath));
      if (!dryRun) fs.writeFileSync(templatePath, nextTemplate);
    }
  }

  return { changed, properties: properties.map((property) => property.slug) };
}

function parseArgs(argv) {
  const args = { dryRun: false, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/regenerate-property-surfaces.js [--dry-run] [--check]

Regenerates property fact surfaces from src/_data/properties-fallback.json:
- src/llms.txt property bullets
- src/properties/<slug>/index.njk counts and JSON-LD amenity facts

Options:
  --dry-run  Report changed files without writing
  --check    Exit non-zero if regenerated surfaces would change`);
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }

  const result = regeneratePropertySurfaces({ dryRun: args.dryRun || args.check });
  if (result.changed.length) {
    console.log(`Property truth surfaces changed:\n${result.changed.join("\n")}`);
    if (args.check) {
      process.exitCode = 1;
    }
    return;
  }
  console.log("Property truth surfaces already match src/_data/properties-fallback.json");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  generateLlmsPropertiesBlock,
  regeneratePropertySurfaces,
  renderAmenityLabels,
  renderPropertyFactLabels,
  renderPropertySummary,
  renderSchemaAmenityLabels,
  replaceTemplateFacts
};
