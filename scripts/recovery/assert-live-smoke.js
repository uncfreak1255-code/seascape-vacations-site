const https = require("https");

const baseUrl = process.argv[2];

if (!baseUrl) {
  throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");
}

const targets = [
  { path: "/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/stays/anna-maria-island-vacation-rentals/", status: 200 },
  { path: "/property-management/vacation-rental-management-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-area-guide/", status: 200 },
  { path: "/property-owners/", status: 301 }
];

function check(target) {
  return new Promise((resolve, reject) => {
    https
      .get(`${baseUrl}${target.path}`, (res) => {
        if (res.statusCode !== target.status) {
          reject(new Error(`${target.path} expected ${target.status}, got ${res.statusCode}`));
          return;
        }
        resolve();
      })
      .on("error", reject);
  });
}

Promise.all(targets.map(check))
  .then(() => console.log("assert-live-smoke: all targets passed"))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
