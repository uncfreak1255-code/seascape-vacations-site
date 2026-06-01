const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve("_site");
const REDIRECTS_FILE = path.join(SITE_DIR, "_redirects");

function normalizeUrlPath(urlPath) {
  return String(urlPath || "").trim().split("?")[0].split("#")[0];
}

function listBuiltUrlPaths(siteDir = SITE_DIR, currentDir = siteDir) {
  if (!fs.existsSync(currentDir)) return [];

  return fs.readdirSync(currentDir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      return listBuiltUrlPaths(siteDir, full);
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      return [];
    }

    const relative = path.relative(siteDir, full).replace(/\\/g, "/");
    if (relative === "index.html") return ["/"];
    if (relative.endsWith("/index.html")) {
      return [`/${relative.slice(0, -"index.html".length)}`];
    }
    return [`/${relative}`];
  });
}

function hasDynamicSegment(urlPath) {
  return /(^|\/):[^/]+/.test(urlPath) || urlPath.includes("*");
}

function patternToRegex(urlPath) {
  const normalized = normalizeUrlPath(urlPath);
  const placeholderToken = "__DYNAMIC_SEGMENT__";
  const wildcardToken = "__DYNAMIC_WILDCARD__";
  const tokenized = normalized
    .replace(/:[^/]+/g, placeholderToken)
    .replace(/\*/g, wildcardToken);
  const escaped = tokenized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escaped
      .replace(new RegExp(placeholderToken, "g"), "[^/]+")
      .replace(new RegExp(wildcardToken, "g"), ".*")}$`
  );
}

function parseRedirects(redirectsFile = REDIRECTS_FILE) {
  if (!fs.existsSync(redirectsFile)) return [];

  return fs
    .readFileSync(redirectsFile, "utf8")
    .split("\n")
    .map((line, index) => ({ line, index: index + 1 }))
    .filter(({ line }) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("#");
    })
    .map(({ line, index }) => {
      const parts = line.trim().split(/\s+/);
      return {
        from: parts[0],
        to: parts[1],
        code: parts[2],
        line: index
      };
    });
}

function resolvePathInSite(urlPath, siteDir = SITE_DIR) {
  const clean = normalizeUrlPath(urlPath);
  if (!clean) return null;

  if (hasDynamicSegment(clean)) {
    const matcher = patternToRegex(clean);
    const builtUrlPaths = listBuiltUrlPaths(siteDir);
    return builtUrlPaths.some((candidate) => matcher.test(candidate)) ? clean : null;
  }

  if (clean === "/") {
    return fs.existsSync(path.join(siteDir, "index.html")) ? "/" : null;
  }

  const candidates = new Set([clean]);
  const noSlash = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  const withSlash = clean.endsWith("/") ? clean : `${clean}/`;

  if (noSlash) candidates.add(noSlash);
  candidates.add(withSlash);
  candidates.add(`${clean}.html`);

  if (clean.endsWith(".html")) {
    const withoutHtml = clean.slice(0, -5);
    if (withoutHtml) {
      candidates.add(withoutHtml);
      candidates.add(`${withoutHtml}/`);
    }
  }

  for (const candidate of candidates) {
    const exact = path.join(siteDir, candidate);
    if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return clean;

    const asDir = path.join(siteDir, candidate, "index.html");
    if (fs.existsSync(asDir)) return clean;
  }

  return null;
}

function matchesRedirect(urlPath, redirects) {
  const clean = normalizeUrlPath(urlPath);
  for (const rule of redirects) {
    if (rule.from === clean) return rule;
    if (rule.from.endsWith("/*")) {
      const prefix = rule.from.slice(0, -1);
      if (clean.startsWith(prefix)) return rule;
    }
  }
  return null;
}

function validateRedirectTargets({
  siteDir = SITE_DIR,
  redirectsFile = REDIRECTS_FILE
} = {}) {
  const redirects = parseRedirects(redirectsFile);
  const missingTargets = [];
  const chainedTargets = [];

  for (const rule of redirects) {
    if (!rule.to || !rule.to.startsWith("/")) {
      continue;
    }

    if (!resolvePathInSite(rule.to, siteDir)) {
      missingTargets.push(rule);
      continue;
    }

    const downstream = matchesRedirect(rule.to, redirects);
    if (downstream && downstream.from !== rule.from) {
      chainedTargets.push({ rule, downstream });
    }
  }

  return { redirects, missingTargets, chainedTargets };
}

function main() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error("validate-redirect-targets: _site directory not found. Run build first.");
    process.exit(1);
  }

  const { redirects, missingTargets, chainedTargets } = validateRedirectTargets();
  let failed = false;

  if (missingTargets.length) {
    failed = true;
    console.error(`\n[REDIRECT VALIDATOR] ${missingTargets.length} redirect target(s) do not resolve to built pages:\n`);
    for (const rule of missingTargets) {
      console.error(`  ${rule.from} -> ${rule.to} (line ${rule.line})`);
    }
  }

  if (chainedTargets.length) {
    failed = true;
    console.error(`\n[REDIRECT VALIDATOR] ${chainedTargets.length} redirect target(s) create avoidable redirect hops:\n`);
    for (const { rule, downstream } of chainedTargets) {
      console.error(`  ${rule.from} -> ${rule.to} -> ${downstream.to} (lines ${rule.line}, ${downstream.line})`);
    }
  }

  if (failed) {
    console.error("validate-redirect-targets: FAILED");
    process.exit(1);
  }

  console.log(`validate-redirect-targets: ${redirects.length} redirect rules validated`);
}

if (require.main === module) {
  main();
}

module.exports = {
  matchesRedirect,
  normalizeUrlPath,
  parseRedirects,
  resolvePathInSite,
  validateRedirectTargets
};
