"use strict";

const { moneyRoutes } = require("./money-routes.js");

const DEFAULT_ORIGIN = "https://seascape-vacations.com";
const API_ENDPOINT =
  process.env.PAGESPEED_API_ENDPOINT ||
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function parseArgs(argv) {
  const args = {
    origin: DEFAULT_ORIGIN,
    routes: [],
    strategy: "mobile",
    category: "performance",
    all: false,
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) {
        throw new Error(`${arg} requires a value`);
      }
      return argv[index];
    };

    if (arg === "--origin") {
      args.origin = next();
    } else if (arg === "--route") {
      args.routes.push(next());
    } else if (arg === "--strategy") {
      args.strategy = next();
    } else if (arg === "--category") {
      args.category = next();
    } else if (arg === "--all") {
      args.all = true;
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["mobile", "desktop"].includes(args.strategy)) {
    throw new Error("--strategy must be mobile or desktop");
  }

  return args;
}

function usage() {
  return [
    "Usage: node scripts/perf/pagespeed-insights-status.js [options]",
    "",
    "Options:",
    "  --route <path>       Route path to check. Can be repeated.",
    "  --all                Check all configured money routes.",
    "  --strategy <value>   mobile or desktop. Default: mobile.",
    "  --category <value>   PageSpeed category. Default: performance.",
    "  --origin <url>       Site origin. Default: https://seascape-vacations.com.",
    "  --strict             Exit non-zero for blocked/unavailable PageSpeed responses.",
  ].join("\n");
}

function routeUrl(origin, route) {
  if (/^https?:\/\//.test(route)) {
    return route;
  }
  const cleanOrigin = origin.replace(/\/$/, "");
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `${cleanOrigin}${cleanRoute}`;
}

function selectedRoutes(args) {
  if (args.routes.length > 0) {
    return args.routes;
  }
  if (args.all) {
    return moneyRoutes;
  }
  return [moneyRoutes[0]];
}

function buildApiUrl({ pageUrl, strategy, category }) {
  const url = new URL(API_ENDPOINT);
  url.searchParams.set("url", pageUrl);
  url.searchParams.set("strategy", strategy);
  url.searchParams.set("category", category);
  if (process.env.PAGESPEED_API_KEY) {
    url.searchParams.set("key", process.env.PAGESPEED_API_KEY);
  }
  return url;
}

function classifyApiError(response, body) {
  const error = body && body.error ? body.error : {};
  const message = error.message || response.statusText || "PageSpeed request failed";
  const reason = error.status || error.errors?.[0]?.reason || "UNKNOWN";

  if (response.status === 429 || /quota/i.test(message) || /RATE_LIMIT/i.test(reason)) {
    return {
      status: "blocked_by_quota",
      reason,
      message,
    };
  }

  if (response.status === 403) {
    return {
      status: "blocked_by_auth",
      reason,
      message,
    };
  }

  return {
    status: "unavailable",
    reason,
    message,
  };
}

async function runOne({ pageUrl, strategy, category }) {
  const apiUrl = buildApiUrl({ pageUrl, strategy, category });
  const response = await fetch(apiUrl, {
    headers: { "User-Agent": "SeascapePageSpeedStatus/1.0" },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }

  if (!response.ok) {
    return {
      url: pageUrl,
      strategy,
      api_key_configured: Boolean(process.env.PAGESPEED_API_KEY),
      ...classifyApiError(response, body),
    };
  }

  const lighthouse = body.lighthouseResult || {};
  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};
  return {
    url: pageUrl,
    strategy,
    status: "available",
    api_key_configured: Boolean(process.env.PAGESPEED_API_KEY),
    performance_score: categories.performance?.score ?? null,
    largest_contentful_paint_ms: audits["largest-contentful-paint"]?.numericValue ?? null,
    cumulative_layout_shift: audits["cumulative-layout-shift"]?.numericValue ?? null,
    total_blocking_time_ms: audits["total-blocking-time"]?.numericValue ?? null,
    crux_origin_available: Boolean(body.originLoadingExperience),
    crux_url_available: Boolean(body.loadingExperience),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return 0;
  }

  const routes = selectedRoutes(args);
  const results = [];
  for (const route of routes) {
    results.push(
      await runOne({
        pageUrl: routeUrl(args.origin, route),
        strategy: args.strategy,
        category: args.category,
      })
    );
  }

  const blocked = results.filter((result) => result.status !== "available");
  const payload = {
    checked_at: new Date().toISOString(),
    source: "PageSpeed Insights API",
    status: blocked.length === 0 ? "available" : "degraded",
    api_key_configured: Boolean(process.env.PAGESPEED_API_KEY),
    results,
  };
  console.log(JSON.stringify(payload, null, 2));

  return args.strict && blocked.length > 0 ? 2 : 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
