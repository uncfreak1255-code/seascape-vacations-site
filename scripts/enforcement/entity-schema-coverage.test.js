const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const buildRoot = path.join(projectRoot, "_site");

const REQUIRED_ROUTES = [
  "/guides/2026-bradenton-vacation-rental-market-analysis/",
  "/guides/anna-maria-island-vacation-cost/",
  "/guides/anna-maria-island-vs-clearwater-beach/",
  "/guides/best-vacation-rental-companies-ami/",
  "/guides/booking-direct-vacation-rentals/",
  "/guides/bradenton-vs-sarasota-beaches/",
  "/guides/bradenton-vs-sarasota-for-families/",
  "/guides/bradenton-vs-sarasota-restaurants/",
  "/guides/bradenton-vs-sarasota-retirement/",
  "/guides/",
  "/guides/spring-break-activities-bradenton-anna-maria-island/",
  "/guides/where-to-stay-near-anna-maria-island/",
  "/properties/the-oasis/",
  "/research/florida-gulf-coast-vacation-cost-calculator-2026/",
  "/research/gulf-coast-vacation-booking-trends-2026/",
  "/research/gulf-coast-vacation-rental-chart-pack-2026/",
  "/research/",
  "/research/owner-fee-revenue-leak-benchmark-2026/",
  "/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/",
];

function routeToFile(route) {
  const normalizedRoute = route.replace(/^\/+/, "").replace(/\/+$/, "");
  return path.join(buildRoot, normalizedRoute, "index.html");
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = regex.exec(html);

  while (match) {
    const raw = match[1].trim();
    if (raw) {
      blocks.push(raw);
    }
    match = regex.exec(html);
  }

  return blocks;
}

function collectTypes(node, types) {
  if (!node || typeof node !== "object") {
    return;
  }

  const currentType = node["@type"];
  if (typeof currentType === "string") {
    types.add(currentType);
  } else if (Array.isArray(currentType)) {
    for (const typeEntry of currentType) {
      if (typeof typeEntry === "string") {
        types.add(typeEntry);
      }
    }
  }

  if (Array.isArray(node)) {
    for (const entry of node) {
      collectTypes(entry, types);
    }
    return;
  }

  for (const value of Object.values(node)) {
    collectTypes(value, types);
  }
}

test("required routes include entity schema coverage", () => {
  const entityFailures = [];
  const parseFailures = [];

  for (const route of REQUIRED_ROUTES) {
    const filePath = routeToFile(route);
    assert.equal(fs.existsSync(filePath), true, `Missing built route: ${route}`);

    const html = fs.readFileSync(filePath, "utf8");
    const blocks = extractJsonLdBlocks(html);
    const seenTypes = new Set();

    for (const [index, block] of blocks.entries()) {
      let parsed;
      try {
        parsed = JSON.parse(block);
      } catch (error) {
        parseFailures.push(`${route} block #${index + 1}: ${error.message}`);
        continue;
      }
      collectTypes(parsed, seenTypes);
    }

    if (!seenTypes.has("Organization") && !seenTypes.has("LocalBusiness")) {
      entityFailures.push(route);
    }
  }

  assert.deepEqual(parseFailures, [], `JSON-LD parse failures:\n${parseFailures.join("\n")}`);
  assert.deepEqual(
    entityFailures,
    [],
    `Routes missing Organization/LocalBusiness entity schema:\n${entityFailures.join("\n")}`
  );
});
