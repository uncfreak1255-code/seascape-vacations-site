const https = require("https");

const baseUrl = process.argv[2];

if (!baseUrl) {
  throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");
}

const targets = [
  { path: "/", status: 200 },
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
        resolve({
          statusCode: res.statusCode,
          location: res.headers.location || null
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
}

Promise.all(targets.map((target) => check(target)))
  .then(() => console.log("assert-live-smoke: all targets passed"))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
