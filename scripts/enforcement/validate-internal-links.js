/**
 * Internal link validator for _site build output.
 *
 * Crawls every HTML file in _site, extracts <a href="..."> links that point
 * to internal paths, and checks:
 *   1. The target path resolves to an actual file in _site
 *   2. The link does not point to a path that would be served via redirect
 *      (should point directly to the canonical URL instead)
 *
 * Exit 0 = clean, exit 1 = broken links found.
 */

const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve("_site");
const REDIRECTS_FILE = path.join(SITE_DIR, "_redirects");
const SAME_SITE_ORIGINS = [
  "https://seascape-vacations.com",
  "http://seascape-vacations.com",
  "https://www.seascape-vacations.com",
  "http://www.seascape-vacations.com"
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(full);
    return full.endsWith(".html") ? [full] : [];
  });
}

function extractInternalLinks(html) {
  const links = [];
  const pattern = /<a\b[^>]*\bhref=["']([^"']*?)["'][^>]*>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href) continue;

    // Fragment-only links (e.g. #contact)
    if (href.startsWith("#")) {
      links.push(href);
      continue;
    }

    // Internal links starting with /
    if (href.startsWith("/") && !href.startsWith("//")) {
      links.push(href);
      continue;
    }

    // Same-site absolute URLs — normalize to path
    for (const origin of SAME_SITE_ORIGINS) {
      if (href.startsWith(origin + "/") || href === origin) {
        const normalized = href.slice(origin.length) || "/";
        links.push(normalized);
        break;
      }
    }
  }
  return links;
}

function resolvePathInSite(urlPath) {
  // Strip query string and fragment
  const clean = urlPath.split("?")[0].split("#")[0];
  if (!clean) return null;

  // Try exact file
  const exact = path.join(SITE_DIR, clean);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return clean;

  // Try as directory with index.html
  const asDir = path.join(SITE_DIR, clean, "index.html");
  if (fs.existsSync(asDir)) return clean;

  // Try without trailing slash
  const noSlash = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  const noSlashFile = path.join(SITE_DIR, noSlash);
  if (fs.existsSync(noSlashFile) && fs.statSync(noSlashFile).isFile()) return clean;
  const noSlashDir = path.join(SITE_DIR, noSlash, "index.html");
  if (fs.existsSync(noSlashDir)) return clean;

  // Try with trailing slash
  const withSlash = clean.endsWith("/") ? clean : clean + "/";
  const withSlashDir = path.join(SITE_DIR, withSlash, "index.html");
  if (fs.existsSync(withSlashDir)) return clean;

  // Try appending .html
  const withHtml = path.join(SITE_DIR, clean + ".html");
  if (fs.existsSync(withHtml)) return clean;

  return null;
}

function parseRedirects() {
  if (!fs.existsSync(REDIRECTS_FILE)) return [];
  const lines = fs.readFileSync(REDIRECTS_FILE, "utf8").split("\n");
  const rules = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      rules.push({ from: parts[0], to: parts[1], code: parts[2] });
    }
  }
  return rules;
}

function hasElementWithId(html, id) {
  // Match id="value" or id='value' in any HTML element
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\bid=["']${escaped}["']`, "i");
  return pattern.test(html);
}

function readTargetHtml(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  if (!clean) return null;

  // Try as directory with index.html
  const asDir = path.join(SITE_DIR, clean, "index.html");
  if (fs.existsSync(asDir)) return fs.readFileSync(asDir, "utf8");

  // Try exact file
  const exact = path.join(SITE_DIR, clean);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return fs.readFileSync(exact, "utf8");

  // Try without trailing slash
  const noSlash = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  const noSlashDir = path.join(SITE_DIR, noSlash, "index.html");
  if (fs.existsSync(noSlashDir)) return fs.readFileSync(noSlashDir, "utf8");

  return null;
}

function matchesRedirect(urlPath, redirects) {
  const clean = urlPath.split("?")[0].split("#")[0];
  for (const rule of redirects) {
    // Exact match
    if (rule.from === clean) return rule;
    // Wildcard match (e.g., /blog/*)
    if (rule.from.endsWith("/*")) {
      const prefix = rule.from.slice(0, -1); // strip the *
      if (clean.startsWith(prefix)) return rule;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error("validate-internal-links: _site directory not found. Run build first.");
    process.exit(1);
  }

  const htmlFiles = listHtmlFiles(SITE_DIR);
  const redirects = parseRedirects();

  const brokenLinks = [];     // { source, href, reason }
  const redirectLinks = [];   // { source, href, redirectTo }
  const brokenFragments = []; // { source, href, reason }

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const links = extractInternalLinks(html);
    const relativeSource = path.relative(SITE_DIR, file);

    for (const href of links) {
      // Fragment-only links: check the current page for the target id
      if (href.startsWith("#")) {
        const fragment = href.slice(1);
        if (fragment && !hasElementWithId(html, fragment)) {
          brokenFragments.push({
            source: relativeSource,
            href,
            reason: `no element with id="${fragment}" in this page`
          });
        }
        continue;
      }

      // Split path from fragment for path+fragment links (e.g. /foo/#bar)
      const hashIdx = href.indexOf("#");
      const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
      const fragmentPart = hashIdx >= 0 ? href.slice(hashIdx + 1) : null;

      // Check if the link target is a redirect
      const redirect = matchesRedirect(pathPart, redirects);
      if (redirect) {
        redirectLinks.push({
          source: relativeSource,
          href,
          redirectTo: redirect.to
        });
        continue;
      }

      // Check if the link target exists
      const resolved = resolvePathInSite(pathPart);
      if (!resolved) {
        brokenLinks.push({
          source: relativeSource,
          href: pathPart,
          reason: "target does not exist in _site"
        });
        continue;
      }

      // If there's a fragment, verify the target page has that id
      if (fragmentPart) {
        const targetHtml = readTargetHtml(pathPart);
        if (targetHtml !== null && !hasElementWithId(targetHtml, fragmentPart)) {
          brokenFragments.push({
            source: relativeSource,
            href,
            reason: `no element with id="${fragmentPart}" in target page`
          });
        }
      }
    }
  }

  // Report results
  let failed = false;

  if (brokenLinks.length > 0) {
    failed = true;
    console.error(`\n[LINK VALIDATOR] ${brokenLinks.length} broken internal link(s):\n`);
    // Deduplicate by href for cleaner output
    const byHref = new Map();
    for (const link of brokenLinks) {
      if (!byHref.has(link.href)) byHref.set(link.href, []);
      byHref.get(link.href).push(link.source);
    }
    for (const [href, sources] of byHref) {
      console.error(`  ${href}`);
      for (const source of sources.slice(0, 3)) {
        console.error(`    <- ${source}`);
      }
      if (sources.length > 3) {
        console.error(`    ... and ${sources.length - 3} more`);
      }
    }
  }

  if (redirectLinks.length > 0) {
    failed = true;
    console.error(`\n[LINK VALIDATOR] ${redirectLinks.length} internal link(s) pointing to redirects:\n`);
    const byHref = new Map();
    for (const link of redirectLinks) {
      if (!byHref.has(link.href)) {
        byHref.set(link.href, { redirectTo: link.redirectTo, sources: [] });
      }
      byHref.get(link.href).sources.push(link.source);
    }
    for (const [href, data] of byHref) {
      console.error(`  ${href} -> ${data.redirectTo}`);
      for (const source of data.sources.slice(0, 3)) {
        console.error(`    <- ${source}`);
      }
      if (data.sources.length > 3) {
        console.error(`    ... and ${data.sources.length - 3} more`);
      }
    }
  }

  if (brokenFragments.length > 0) {
    failed = true;
    console.error(`\n[LINK VALIDATOR] ${brokenFragments.length} broken fragment link(s):\n`);
    const byHref = new Map();
    for (const link of brokenFragments) {
      if (!byHref.has(link.href)) byHref.set(link.href, { reason: link.reason, sources: [] });
      byHref.get(link.href).sources.push(link.source);
    }
    for (const [href, data] of byHref) {
      console.error(`  ${href} — ${data.reason}`);
      for (const source of data.sources.slice(0, 3)) {
        console.error(`    <- ${source}`);
      }
      if (data.sources.length > 3) {
        console.error(`    ... and ${data.sources.length - 3} more`);
      }
    }
  }

  if (failed) {
    console.error("\nvalidate-internal-links: FAILED");
    process.exit(1);
  }

  console.log(`validate-internal-links: ${htmlFiles.length} pages crawled, all internal links valid`);
}

main();
