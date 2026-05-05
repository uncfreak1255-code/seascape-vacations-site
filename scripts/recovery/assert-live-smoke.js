const https = require("https");

const targets = [
  { path: "/", status: 200 },
  { path: "/properties/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/guides/", status: 200 },
  { path: "/stays/", status: 200 },
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

const stablePropertyDetailLinks = [
  { href: "/properties/dockside-dreams/", label: "View Dockside Dreams details" },
  { href: "/properties/the-oasis/", label: "View The Oasis details" },
  { href: "/properties/sarasota-luxe/", label: "View Sarasota Luxe details" },
  { href: "/properties/river-house/", label: "View River House details" },
  { href: "/properties/bradenton-pool-home/", label: "View Bradenton Pool Home details" }
];

function request(baseUrl, path) {
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

function validateTargetResponse(target, response) {
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

    const missingPropertyLinks = stablePropertyDetailLinks.filter((link) => !response.body.includes(link.href));
    if (missingPropertyLinks.length > 0) {
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
    const hasProofFirstOwnerSurface =
      response.body.includes("Property management for owners who care about net revenue")
      && response.body.includes("$119,923")
      && response.body.includes("13.4%")
      && response.body.includes("2.9%")
      && response.body.includes("Where Owner Revenue Actually Leaks")
      && response.body.includes("Request Your Revenue Review")
      && response.body.includes('href="#owner-cta"');

    if (!hasProofFirstOwnerSurface) {
      throw new Error("property-management hub is missing the proof-first owner revenue surface");
    }

    if (
      response.body.includes("What Is Vacation Rental Property Management?")
      || response.body.includes("View All Properties")
      || response.body.includes("Request a property evaluation")
    ) {
      throw new Error("property-management hub is still serving the retired explainer-hub surface");
    }
  }

  if (target.path === "/stays/") {
    const hasStayHubSurface =
      response.body.includes("Stay Collections")
      && response.body.includes("Destination collections")
      && response.body.includes("/stays/anna-maria-island-vacation-rentals/")
      && response.body.includes("/stays/bradenton-vacation-rentals-near-beaches/")
      && response.body.includes("/properties/");

    if (!hasStayHubSurface) {
      throw new Error("/stays/ is missing the live stay-collection hub surface");
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

async function check(baseUrl, target, currentPath = target.path, redirectDepth = 0) {
  const response = await request(baseUrl, currentPath);

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

    return check(baseUrl, target, nextPath, redirectDepth + 1);
  }

  validateTargetResponse(target, response);
}

async function run(baseUrl) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");
  }

  await Promise.all(targets.map((target) => check(baseUrl, target)));
}

if (require.main === module) {
  run(process.argv[2])
    .then(() => console.log("assert-live-smoke: all targets passed"))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  targets,
  request,
  validateTargetResponse,
  stablePropertyDetailLinks,
  check,
  run
};
