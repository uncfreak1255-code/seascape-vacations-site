const https = require("https");

const baseUrl = process.argv[2];

if (!baseUrl) {
  throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");
}

const targets = [
  { path: "/", status: 200 },
  { path: "/properties/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/guides/", status: 200 },
  { path: "/stays/anna-maria-island-vacation-rentals/", status: 200 },
  { path: "/property-management/vacation-rental-management-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-area-guide/", status: 200 },
  { path: "/guides/bradenton-vs-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-vs-siesta-key/", status: 200 },
  { path: "/property-owners/", status: 301, followRedirects: false },
  { path: "/hero-mobile.webp", status: 200 },
  { path: "/hero-optimized.webp", status: 200 },
  { path: "/images/seascape-og-default.jpg", status: 200 },
  { path: "/images/anna-maria-island-og.jpg", status: 200 },
  { path: "/images/bradenton-og.jpg", status: 200 },
  { path: "/images/sarasota-og.jpg", status: 200 },
  { path: "/images/siesta-key-og.jpg", status: 200 }
];

function request(path) {
  return new Promise((resolve, reject) => {
    https
      .get(`${baseUrl}${path}`, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            location: res.headers.location || null,
            body
          });
        });
      })
      .on("error", reject);
  });
}

async function check(target, currentPath = target.path, redirectDepth = 0) {
  const response = await request(currentPath);

  if (
    target.followRedirects !== false &&
    response.statusCode >= 300 &&
    response.statusCode < 400 &&
    response.location
  ) {
    if (redirectDepth >= 5) {
      throw new Error(`${target.path} exceeded redirect limit`);
    }

    const nextPath = response.location.startsWith("http")
      ? response.location.replace(baseUrl, "")
      : response.location;

    return check(target, nextPath, redirectDepth + 1);
  }

  if (response.statusCode !== target.status) {
    throw new Error(`${target.path} expected ${target.status}, got ${response.statusCode}`);
  }

  if (target.path === "/") {
    if (!response.body.includes("Dockside Dreams") || !response.body.includes("/properties/dockside-dreams/")) {
      throw new Error("homepage is missing stable featured property markup");
    }

    if (response.body.includes("undefined BR")) {
      throw new Error("homepage featured properties still contain undefined specs");
    }

    if (response.body.includes("prop-card-carousel") || response.body.includes("nextCardImage(")) {
      throw new Error("properties card renderer still includes the brittle in-card carousel stack");
    }

    if (response.body.includes("images.weserv.nl")) {
      throw new Error("homepage still depends on the external weserv image proxy");
    }
  }

  if (target.path === "/properties/") {
    if (!response.body.includes("Dockside Dreams") || !response.body.includes("The Oasis")) {
      throw new Error("properties page is missing premium catalog property cards");
    }

    if (!response.body.includes("/properties/dockside-dreams/") || !response.body.includes("View Details")) {
      throw new Error("properties page is missing stable property detail links");
    }

    if (!response.body.includes("Book Direct")) {
      throw new Error("properties page is missing direct-book CTAs");
    }

    if (response.body.includes("/.netlify/functions/get-properties") || response.body.includes("api.hostaway.com")) {
      throw new Error("properties page still depends on a public runtime property API");
    }

    if (response.body.includes("hostaway-platform.s3.us-west-2.amazonaws.com")) {
      throw new Error("properties page still leaks raw Hostaway S3 URLs");
    }

    if (
      response.body.includes("Florida Gulf Coast homes, controlled from one catalog.") ||
      response.body.includes("Use this table before opening detail pages") ||
      response.body.includes("collection-strip") ||
      response.body.includes("compare-table")
    ) {
      throw new Error("properties page still exposes the old utility/catalog-copy surface");
    }
  }

  if (target.path === "/property-management/") {
    if (!response.body.includes("What Is Vacation Rental Property Management?")) {
      throw new Error("property-management hub is missing the owner explainer content");
    }

    if (!response.body.includes('href="/properties/"') || !response.body.includes("View All Properties")) {
      throw new Error("property-management hub is missing the corrected view-all-properties CTA");
    }
  }

  if (target.path === "/guides/anna-maria-island-area-guide/" || target.path === "/guides/bradenton-vs-sarasota/" || target.path === "/guides/anna-maria-island-vs-siesta-key/") {
    if (response.body.includes("hostaway-platform.s3.us-west-2.amazonaws.com")) {
      throw new Error(`${target.path} still depends on raw Hostaway S3 image URLs`);
    }

    if (/(?:src|href)=["']images\//i.test(response.body) || /url\((["']?)images\//i.test(response.body)) {
      throw new Error(`${target.path} still contains broken relative images/ asset paths`);
    }
  }

  if (target.path === "/guides/anna-maria-island-area-guide/" || target.path === "/guides/bradenton-area-guide/" || target.path === "/guides/sarasota-area-guide/" || target.path === "/guides/siesta-key-area-guide/") {
    if (response.body.includes('href="index.html"') || response.body.includes('href="#destinations"') || response.body.includes("area-guide-")) {
      throw new Error(`${target.path} still contains legacy relative guide links`);
    }

    if (/\bhref=\/[^"'\s>]+/i.test(response.body)) {
      throw new Error(`${target.path} still contains unquoted absolute href attributes`);
    }
  }
}

Promise.all(targets.map((target) => check(target)))
  .then(() => console.log("assert-live-smoke: all targets passed"))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
