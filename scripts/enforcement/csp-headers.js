"use strict";

const SITEWIDE_ROUTE = "/*";

const REQUIRED_RECAPTCHA = {
  "script-src": [
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/"
  ],
  "frame-src": [
    "https://www.google.com/recaptcha/"
  ],
  "connect-src": [
    "https://www.google.com/recaptcha/"
  ]
};

const REQUIRED_HOSTAWAY = {
  "img-src": ["https://bookingenginecdn.hostaway.com"],
  "connect-src": ["https://bookingenginecdn.hostaway.com"],
  "frame-src": ["https://book.seascape-vacations.com"],
  "form-action": ["https://book.seascape-vacations.com"]
};

const REQUIRED_ANALYTICS = {
  "script-src": [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com"
  ],
  "connect-src": [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
    "https://stats.g.doubleclick.net"
  ]
};

function parseNetlifyHeaderValues(contents, route) {
  const headers = {};
  const blockPattern = /\[\[headers\]\]([\s\S]*?)(?=\n\[\[headers\]\]|\n\[functions\.|$)/g;
  let blockMatch;

  while ((blockMatch = blockPattern.exec(String(contents || ""))) !== null) {
    const block = blockMatch[1];
    const routeMatch = block.match(/for = "([^"]+)"/);
    if (!routeMatch || routeMatch[1].trim() !== route) {
      continue;
    }

    const valuePattern = /^\s*([A-Za-z0-9-]+)\s*=\s*"([^"]*)"/gm;
    let valueMatch;
    while ((valueMatch = valuePattern.exec(block)) !== null) {
      headers[valueMatch[1]] = valueMatch[2];
    }
  }

  return headers;
}

function parseCspDirectives(policy) {
  const directives = new Map();

  for (const part of String(policy || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    const tokens = trimmed.split(/\s+/);
    const name = tokens.shift();
    if (!name) {
      continue;
    }

    directives.set(name, tokens);
  }

  return directives;
}

function hasBroadHttpsWildcard(sources) {
  return (sources || []).some((source) => source === "https:" || source === "http:" || source === "*");
}

function missingSources(directives, required) {
  const missing = [];

  for (const [directive, origins] of Object.entries(required)) {
    const sources = directives.get(directive) || [];
    for (const origin of origins) {
      if (!sources.includes(origin)) {
        missing.push(`${directive} ${origin}`);
      }
    }
  }

  return missing;
}

function assertEnforcedCsp(tomlContents) {
  const contents = String(tomlContents || "");
  const headers = parseNetlifyHeaderValues(contents, SITEWIDE_ROUTE);
  const enforced = headers["Content-Security-Policy"];
  const reportOnly = headers["Content-Security-Policy-Report-Only"];
  const hsts = headers["Strict-Transport-Security"] || "";

  if (!enforced || !enforced.trim()) {
    throw new Error("enforced Content-Security-Policy is missing or empty");
  }

  if (reportOnly) {
    const pairingDocumented = /stricter report-only|report-only pairing/i.test(contents);
    if (!pairingDocumented) {
      throw new Error(
        "Content-Security-Policy-Report-Only is present without a documented stricter pairing"
      );
    }
    if (reportOnly.trim() === enforced.trim()) {
      throw new Error(
        "Content-Security-Policy-Report-Only duplicates the enforced policy instead of a stricter pairing"
      );
    }
  }

  const directives = parseCspDirectives(enforced);
  if (directives.size === 0) {
    throw new Error("enforced Content-Security-Policy parsed to zero directives");
  }

  const frameAncestors = directives.get("frame-ancestors") || [];
  if (!frameAncestors.includes("'none'")) {
    throw new Error("Content-Security-Policy must keep frame-ancestors 'none'");
  }

  for (const [directive, sources] of directives.entries()) {
    if (hasBroadHttpsWildcard(sources)) {
      throw new Error(`${directive} must not use a broad https: or * wildcard`);
    }
  }

  const missingRecaptcha = missingSources(directives, REQUIRED_RECAPTCHA);
  if (missingRecaptcha.length) {
    throw new Error(`CSP is missing required reCAPTCHA origins: ${missingRecaptcha.join(", ")}`);
  }

  const missingHostaway = missingSources(directives, REQUIRED_HOSTAWAY);
  if (missingHostaway.length) {
    throw new Error(`CSP is missing required Hostaway origins: ${missingHostaway.join(", ")}`);
  }

  const missingAnalytics = missingSources(directives, REQUIRED_ANALYTICS);
  if (missingAnalytics.length) {
    throw new Error(`CSP is missing required GTM/GA origins: ${missingAnalytics.join(", ")}`);
  }

  if (/\bpreload\b/i.test(hsts)) {
    throw new Error("HSTS preload must not be added in this change");
  }

  return {
    policy: enforced,
    directives,
    reportOnly: reportOnly || null
  };
}

module.exports = {
  REQUIRED_ANALYTICS,
  REQUIRED_HOSTAWAY,
  REQUIRED_RECAPTCHA,
  assertEnforcedCsp,
  parseCspDirectives,
  parseNetlifyHeaderValues
};
