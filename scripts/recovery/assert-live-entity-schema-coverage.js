const http = require("http");
const https = require("https");

const requiredRoutes = [
  "/guides/2026-bradenton-vacation-rental-market-analysis/",
  "/guides/anna-maria-island-vacation-cost/",
  "/guides/anna-maria-island-vs-clearwater-beach/",
  "/guides/best-vacation-rental-companies-ami/",
  "/guides/booking-direct-vacation-rentals/",
  "/guides/bradenton-vs-sarasota-beaches/",
  "/guides/bradenton-vs-sarasota-cost-of-living/",
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

function request(baseUrl, route) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(route, baseUrl);
    const client = targetUrl.protocol === "http:" ? http : https;

    client
      .get(targetUrl, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body,
          });
        });
      })
      .on("error", reject);
  });
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

function analyzeEntityCoverage(html, route) {
  const blocks = extractJsonLdBlocks(html);
  const parseFailures = [];
  const seenTypes = new Set();

  for (const [index, block] of blocks.entries()) {
    try {
      const parsed = JSON.parse(block);
      collectTypes(parsed, seenTypes);
    } catch (error) {
      parseFailures.push(`${route} block #${index + 1}: ${error.message}`);
    }
  }

  return {
    parseFailures,
    hasEntityCoverage: seenTypes.has("Organization") || seenTypes.has("LocalBusiness"),
  };
}

async function run(baseUrl) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-live-entity-schema-coverage.js <base-url>");
  }

  const statusFailures = [];
  const parseFailures = [];
  const entityFailures = [];

  for (const route of requiredRoutes) {
    const response = await request(baseUrl, route);
    if (response.statusCode !== 200) {
      statusFailures.push(`${route} expected 200, got ${response.statusCode}`);
      continue;
    }

    const analysis = analyzeEntityCoverage(response.body, route);
    parseFailures.push(...analysis.parseFailures);

    if (!analysis.hasEntityCoverage) {
      entityFailures.push(route);
    }
  }

  const failureMessages = [];
  if (statusFailures.length > 0) {
    failureMessages.push(`status failures:\n${statusFailures.join("\n")}`);
  }
  if (parseFailures.length > 0) {
    failureMessages.push(`json-ld parse failures:\n${parseFailures.join("\n")}`);
  }
  if (entityFailures.length > 0) {
    failureMessages.push(
      `routes missing Organization/LocalBusiness entity schema:\n${entityFailures.join("\n")}`
    );
  }

  if (failureMessages.length > 0) {
    throw new Error(failureMessages.join("\n\n"));
  }

  return {
    checkedRoutes: requiredRoutes.length,
  };
}

if (require.main === module) {
  run(process.argv[2])
    .then((result) => {
      console.log(`assert-live-entity-schema-coverage: ${result.checkedRoutes} routes passed`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  requiredRoutes,
  request,
  extractJsonLdBlocks,
  collectTypes,
  analyzeEntityCoverage,
  run,
};
