const http = require("http");
const https = require("https");

const BOOKING_HANDOFF_MARKER = "book.seascape-vacations.com/listings/";

const SURFACES = [
  {
    path: "/",
    mustInclude: ["Seascape", "/properties/"]
  },
  {
    path: "/properties/river-house/",
    mustInclude: ["River House", BOOKING_HANDOFF_MARKER]
  }
];

function requireBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || !baseUrl.trim()) {
    throw new Error("Usage: node scripts/recovery/assert-preview-surface.js <base-url>");
  }

  return baseUrl.replace(/\/$/, "");
}

function request(baseUrl, pathname) {
  const target = new URL(pathname, `${baseUrl}/`);
  const client = target.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(target, { timeout: 15000 }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 0,
          body: Buffer.concat(chunks).toString("utf8")
        });
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error(`${pathname} timed out`));
    });
    req.on("error", reject);
  });
}

function assertSurfaceBody(target, response) {
  if (response.statusCode !== 200) {
    throw new Error(`${target.path} returned ${response.statusCode}`);
  }

  const missing = target.mustInclude.filter((fragment) => !response.body.includes(fragment));
  if (missing.length) {
    throw new Error(`${target.path} is missing ${missing.join(", ")}`);
  }
}

async function assertPreviewSurface(baseUrl) {
  const root = requireBaseUrl(baseUrl);

  for (const target of SURFACES) {
    const response = await request(root, target.path);
    assertSurfaceBody(target, response);
  }
}

async function main(argv = process.argv.slice(2)) {
  await assertPreviewSurface(argv[0]);
  console.log("assert-preview-surface: homepage, property page, and booking handoff passed");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  BOOKING_HANDOFF_MARKER,
  SURFACES,
  requireBaseUrl,
  assertSurfaceBody,
  assertPreviewSurface,
  request
};
