const https = require("https");

const HOSTS = [
  "https://seascape-vacations.com",
  "https://www.seascape-vacations.com"
];

const ROUTES = [
  "/property-management/",
  "/research/owner-fee-revenue-leak-benchmark-2026/",
  "/research/how-seascape-protects-owner-net-2026/"
];

function fetchText(url, redirectsRemaining = 3) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 10000 }, (response) => {
      const statusCode = response.statusCode || 0;
      const location = response.headers.location;

      if (statusCode >= 300 && statusCode < 400 && location && redirectsRemaining > 0) {
        response.resume();
        const nextUrl = new URL(location, url).toString();
        fetchText(nextUrl, redirectsRemaining - 1).then(resolve, reject);
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({ url, statusCode, body });
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out fetching ${url}`));
    });
    request.on("error", reject);
  });
}

function assertOwnerRouteResponse(result) {
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`${result.url} returned HTTP ${result.statusCode}`);
  }

  if (/window\.location\.href=["']\/lander["']|\/lander/i.test(result.body)) {
    throw new Error(`${result.url} returned the owner-route /lander shell`);
  }

  if (!/owner|revenue|property management|teardown/i.test(result.body)) {
    throw new Error(`${result.url} did not render owner-funnel content`);
  }
}

async function assertOwnerFunnelRoutes(hosts = HOSTS, routes = ROUTES) {
  const failures = [];

  for (const host of hosts) {
    for (const route of routes) {
      const url = `${host}${route}`;
      try {
        assertOwnerRouteResponse(await fetchText(url));
      } catch (error) {
        failures.push(error.message);
      }
    }
  }

  if (failures.length) {
    throw new Error(`Owner funnel route canary failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
}

if (require.main === module) {
  assertOwnerFunnelRoutes()
    .then(() => {
      console.log(`owner-funnel-routes: ${HOSTS.length * ROUTES.length} routes passed`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  HOSTS,
  ROUTES,
  assertOwnerRouteResponse,
  assertOwnerFunnelRoutes
};
