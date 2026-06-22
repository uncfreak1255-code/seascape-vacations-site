/**
 * JSON-LD validator for _site build output.
 *
 * Scans every HTML file in _site for <script type="application/ld+json">
 * blocks and validates:
 *   1. Valid JSON (no parse errors)
 *   2. Priority schema types have required fields:
 *      - WebSite: name, url, potentialAction
 *      - Article: headline, image, datePublished, dateModified, author, publisher
 *      - FAQPage: mainEntity with acceptedAnswer
 *      - BreadcrumbList: itemListElement with position, name, item
 *      - LocalBusiness: name, address, telephone
 *      - LodgingBusiness: name, address, telephone
 *      - VacationRental: name, address
 *      - AggregateOffer: lowPrice, highPrice, priceCurrency
 *      - Review: reviewBody, author
 *
 * Exit 0 = clean, exit 1 = errors found.
 */

const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve("_site");

// ---------------------------------------------------------------------------
// Schema validation rules
// ---------------------------------------------------------------------------

const SCHEMA_RULES = {
  Article: {
    required: ["headline", "image", "datePublished", "dateModified", "author", "publisher"],
    label: "Article"
  },
  WebSite: {
    required: ["name", "url", "potentialAction"],
    label: "WebSite"
  },
  FAQPage: {
    required: ["mainEntity"],
    nested: {
      mainEntity: {
        arrayItemFields: ["acceptedAnswer"]
      }
    },
    label: "FAQPage"
  },
  BreadcrumbList: {
    required: ["itemListElement"],
    nested: {
      itemListElement: {
        arrayItemFields: ["position", "name", "item"]
      }
    },
    label: "BreadcrumbList"
  },
  LocalBusiness: {
    required: ["name", "address", "telephone"],
    label: "LocalBusiness"
  },
  LodgingBusiness: {
    required: ["name", "address", "telephone"],
    label: "LodgingBusiness"
  },
  VacationRental: {
    required: ["name", "address"],
    label: "VacationRental"
  },
  AggregateOffer: {
    required: ["lowPrice", "highPrice", "priceCurrency"],
    label: "AggregateOffer"
  },
  Review: {
    required: ["reviewBody", "author"],
    label: "Review"
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(full);
    return full.endsWith(".html") ? [full] : [];
  });
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function getSchemaType(obj) {
  if (!obj || typeof obj !== "object") return null;
  const raw = obj["@type"];
  if (!raw) return null;
  // Can be a string or array
  if (Array.isArray(raw)) return raw;
  return [String(raw)];
}

// Properties whose values are compact references, not full entities.
// Objects under these keys get recursed but skip required-field checks.
const REFERENCE_PROPERTIES = new Set([
  "itemReviewed", "author", "provider", "brand", "publisher",
  "creator", "contributor", "editor", "funder", "sponsor",
  "reviewRating", "aggregateRating"
]);

function validateSchema(obj, errors, filePath, visited, parentKey) {
  if (!obj || typeof obj !== "object") return;
  if (!visited) visited = new Set();

  // Guard against circular references
  if (visited.has(obj)) return;
  visited.add(obj);

  const isReference = REFERENCE_PROPERTIES.has(parentKey);

  // Validate @type rules on this node (skip for reference objects)
  const types = getSchemaType(obj);
  if (types && !isReference) {
    for (const type of types) {
      const rule = SCHEMA_RULES[type];
      if (!rule) continue;

      for (const field of rule.required) {
        if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
          errors.push({
            file: filePath,
            type: rule.label,
            message: `missing required field "${field}"`
          });
        }
      }

      // Nested validation (e.g., FAQPage mainEntity items need acceptedAnswer)
      if (rule.nested) {
        for (const [parentField, nestedRule] of Object.entries(rule.nested)) {
          const value = obj[parentField];
          if (!value) continue;
          const items = Array.isArray(value) ? value : [value];
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || typeof item !== "object") continue;
            if (nestedRule.arrayItemFields) {
              for (const nestedField of nestedRule.arrayItemFields) {
                if (item[nestedField] === undefined || item[nestedField] === null) {
                  errors.push({
                    file: filePath,
                    type: rule.label,
                    message: `mainEntity[${i}] missing required field "${nestedField}"`
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // Recurse into every nested object and array value
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object") {
          validateSchema(item, errors, filePath, visited, key);
        }
      }
    } else if (value && typeof value === "object") {
      validateSchema(value, errors, filePath, visited, key);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error("validate-jsonld: _site directory not found. Run build first.");
    process.exit(1);
  }

  const htmlFiles = listHtmlFiles(SITE_DIR);
  const errors = [];
  let totalBlocks = 0;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const blocks = extractJsonLdBlocks(html);
    const relativeFile = path.relative(SITE_DIR, file);

    for (let i = 0; i < blocks.length; i++) {
      totalBlocks++;
      let parsed;
      try {
        parsed = JSON.parse(blocks[i]);
      } catch (err) {
        errors.push({
          file: relativeFile,
          type: "JSON",
          message: `malformed JSON-LD block #${i + 1}: ${err.message}`
        });
        continue;
      }

      // Handle both single objects and arrays of objects
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        validateSchema(item, errors, relativeFile);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\n[JSON-LD VALIDATOR] ${errors.length} error(s):\n`);
    for (const err of errors) {
      console.error(`  [${err.type}] ${err.file}: ${err.message}`);
    }
    console.error("\nvalidate-jsonld: FAILED");
    process.exit(1);
  }

  console.log(`validate-jsonld: ${htmlFiles.length} pages scanned, ${totalBlocks} JSON-LD blocks validated`);
}

main();
