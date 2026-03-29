/**
 * Redirect target validator for _site build output.
 *
 * Parses _site/_redirects and checks:
 *   1. Each non-wildcard redirect target resolves to an actual file in _site
 *   2. Each redirect target is not itself a .html path that will chain-redirect
 *
 * Exit 0 = clean, exit 1 = dead targets found.
 */

const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve("_site");
const REDIRECTS_FILE = path.join(SITE_DIR, "_redirects");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseRedirects() {
  if (!fs.existsSync(REDIRECTS_FILE)) return [];
  const lines = fs.readFileSync(REDIRECTS_FILE, "utf8").split("\n");
  const rules = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      rules.push({ from: parts[0], to: parts[1], code: parts[2], line: i + 1 });
    }
  }
  return rules;
}

function isWildcard(pattern) {
  return pattern.includes("*") || pattern.includes(":id") || pattern.includes(":splat");
}

function targetIsExternal(target) {
  return target.startsWith("http://") || target.startsWith("https://") || target.startsWith("//");
}

function targetHasQueryString(target) {
  return target.includes("?");
}

function resolveTarget(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  if (!clean || clean === "/") return true; // root always exists

  // Try as directory with index.html
  const asDir = path.join(SITE_DIR, clean, "index.html");
  if (fs.existsSync(asDir)) return true;

  // Try exact file
  const exact = path.join(SITE_DIR, clean);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return true;

  // Try without trailing slash
  const noSlash = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  const noSlashDir = path.join(SITE_DIR, noSlash, "index.html");
  if (fs.existsSync(noSlashDir)) return true;
  const noSlashFile = path.join(SITE_DIR, noSlash);
  if (fs.existsSync(noSlashFile) && fs.statSync(noSlashFile).isFile()) return true;

  // Try with trailing slash
  const withSlash = clean.endsWith("/") ? clean : clean + "/";
  const withSlashDir = path.join(SITE_DIR, withSlash, "index.html");
  if (fs.existsSync(withSlashDir)) return true;

  // Try appending .html (Netlify Pretty URLs)
  const withHtml = path.join(SITE_DIR, clean + ".html");
  if (fs.existsSync(withHtml)) return true;

  return false;
}

function isHtmlHop(target) {
  return target.endsWith(".html") && !target.startsWith("/");
}

function isRedirectableHtml(target) {
  // Targets ending in .html that would be auto-redirected by Netlify Pretty URLs
  if (!target.endsWith(".html")) return false;
  const clean = target.split("?")[0].split("#")[0];
  const withoutHtml = clean.replace(/\.html$/, "");
  const dirPath = path.join(SITE_DIR, withoutHtml, "index.html");
  return fs.existsSync(dirPath);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error("validate-redirect-targets: _site directory not found. Run build first.");
    process.exit(1);
  }

  const redirects = parseRedirects();
  const deadTargets = [];
  const htmlHops = [];
  let checked = 0;

  for (const rule of redirects) {
    // Skip wildcards, external targets, and query string targets
    if (isWildcard(rule.from) || isWildcard(rule.to)) continue;
    if (targetIsExternal(rule.to)) continue;
    if (targetHasQueryString(rule.to)) continue;

    checked++;

    // Check if target resolves
    if (!resolveTarget(rule.to)) {
      deadTargets.push(rule);
      continue;
    }

    // Check for .html hop (target exists but only via Netlify auto-redirect)
    if (isRedirectableHtml(rule.to)) {
      htmlHops.push(rule);
    }
  }

  // Report results
  let failed = false;

  if (deadTargets.length > 0) {
    failed = true;
    console.error(`\n[REDIRECT VALIDATOR] ${deadTargets.length} redirect(s) point to dead targets:\n`);
    for (const rule of deadTargets) {
      console.error(`  line ${rule.line}: ${rule.from} -> ${rule.to} (target does not exist)`);
    }
  }

  if (htmlHops.length > 0) {
    console.error(`\n[REDIRECT VALIDATOR] ${htmlHops.length} redirect(s) create .html hop chains:\n`);
    for (const rule of htmlHops) {
      const canonical = rule.to.replace(/\.html$/, "/");
      console.error(`  line ${rule.line}: ${rule.from} -> ${rule.to} (should be ${canonical})`);
    }
    // .html hops are warnings, not failures — they work but waste a redirect hop
    // Uncomment the next line to make them blocking:
    // failed = true;
  }

  if (failed) {
    console.error("\nvalidate-redirect-targets: FAILED");
    process.exit(1);
  }

  const warnCount = htmlHops.length;
  const warnSuffix = warnCount > 0 ? `, ${warnCount} .html hop warning(s)` : "";
  console.log(`validate-redirect-targets: ${checked} redirect targets checked, all resolve${warnSuffix}`);
}

main();
