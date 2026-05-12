const fs = require("fs");

function parseNetlifyHeaderPolicies(contents) {
  const policies = new Map();
  const blockPattern = /\[\[headers\]\]([\s\S]*?)(?=\n\[\[headers\]\]|\n\[functions\.|$)/g;
  let blockMatch;

  while ((blockMatch = blockPattern.exec(contents)) !== null) {
    const block = blockMatch[1];
    const routeMatch = block.match(/for = "([^"]+)"/);

    if (!routeMatch) {
      continue;
    }

    const route = routeMatch[1].trim();
    const cacheControlMatch = block.match(/Cache-Control = "([^"]+)"/);
    policies.set(route, {
      "Cache-Control": cacheControlMatch ? cacheControlMatch[1].trim() : null
    });
  }

  return policies;
}

function parseHeadersPolicies(contents) {
  const policies = new Map();
  const blocks = contents
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length || lines[0].startsWith("#")) {
      continue;
    }

    const route = lines[0];
    const values = {};

    for (const line of lines.slice(1)) {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      values[key] = value;
    }

    policies.set(route, values);
  }

  return policies;
}

function isHtmlLikeHeadersRoute(route) {
  return !/\*\.(?:avif|css|jpg|js|png|svg|webp|woff2)$/i.test(route);
}

function assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents }) {
  const netlifyPolicies = parseNetlifyHeaderPolicies(netlifyTomlContents);
  const headersPolicies = parseHeadersPolicies(headersContents);
  const canonicalHtmlPolicy = netlifyPolicies.get("/*.html")?.["Cache-Control"];

  if (!canonicalHtmlPolicy) {
    throw new Error('netlify.toml is missing a canonical Cache-Control policy for "/*.html"');
  }

  const drift = [];

  for (const [route, values] of headersPolicies.entries()) {
    if (!isHtmlLikeHeadersRoute(route)) {
      continue;
    }

    const routePolicy = values["Cache-Control"] || null;

    if (routePolicy !== canonicalHtmlPolicy) {
      drift.push(`${route}: ${routePolicy || "(missing)"} != ${canonicalHtmlPolicy}`);
    }
  }

  if (drift.length) {
    throw new Error(
      [
        "HTML cache policy drift detected between _headers and netlify.toml.",
        `Canonical netlify.toml HTML policy: ${canonicalHtmlPolicy}`,
        ...drift.map((entry) => `- ${entry}`)
      ].join("\n")
    );
  }
}

function assertRepoHtmlCachePolicyConsistency() {
  const netlifyTomlContents = fs.readFileSync("netlify.toml", "utf8");
  const headersContents = fs.readFileSync("_headers", "utf8");

  assertConsistentHtmlCachePolicy({ netlifyTomlContents, headersContents });
}

module.exports = {
  parseNetlifyHeaderPolicies,
  parseHeadersPolicies,
  isHtmlLikeHeadersRoute,
  assertConsistentHtmlCachePolicy,
  assertRepoHtmlCachePolicyConsistency
};
