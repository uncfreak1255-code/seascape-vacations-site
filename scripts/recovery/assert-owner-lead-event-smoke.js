const http = require("http");
const https = require("https");

const seoPages = require("../../src/_data/seoPages.json");

const REQUIRED_EVENTS = [
  "owner_primary_cta_click",
  "owner_form_submit"
];

function buildOwnerRoutes() {
  return [
    "/property-management/",
    ...((seoPages.owner || []).map((page) => `/property-management/${page.slug}/`)),
    "/research/owner-fee-revenue-leak-benchmark-2026/",
    "/research/how-seascape-protects-owner-net-2026/"
  ].filter((route, index, routes) => routes.indexOf(route) === index);
}

function request(baseUrl, targetPath) {
  const client = baseUrl.startsWith("http://") ? http : https;
  return new Promise((resolve, reject) => {
    client
      .get(`${baseUrl}${targetPath}`, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body
          });
        });
      })
      .on("error", reject);
  });
}

function validateOwnerEventMarkup(body, targetPath) {
  const missingEvents = REQUIRED_EVENTS.filter((eventName) => {
    const attributePattern = new RegExp(
      `data-(?:track-event|form-submit-event)=["']${eventName}["']`
    );
    return !attributePattern.test(body);
  });

  if (missingEvents.length > 0) {
    throw new Error(`${targetPath} is missing owner lead event markup: ${missingEvents.join(", ")}`);
  }
}

function parseArgs(argv) {
  const baseUrl = String(argv[0] || "").trim();
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-owner-lead-event-smoke.js <base-url>");
  }

  return { baseUrl };
}

async function run({ baseUrl }) {
  for (const route of buildOwnerRoutes()) {
    const response = await request(baseUrl, route);
    if (response.statusCode !== 200) {
      throw new Error(`${route} returned status ${response.statusCode}`);
    }

    validateOwnerEventMarkup(response.body, route);
  }
}

async function main() {
  await run(parseArgs(process.argv.slice(2)));
  console.log("assert-owner-lead-event-smoke: all routes passed");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  REQUIRED_EVENTS,
  buildOwnerRoutes,
  parseArgs,
  request,
  run,
  validateOwnerEventMarkup
};
