#!/usr/bin/env node
"use strict";

/*
 * apply-guest-shell — codemod that gives every standalone guide page
 * (src/guides/*.html with no `layout:` front matter) the Waterline guest
 * header and footer, so a guest who lands on a guide sees the same
 * navigation as the rest of the site.
 *
 * TARGETS
 *   src/guides/*.html and src/guides/<slug>/index.html whose first 400 bytes
 *   contain no `^layout:` line and no `permalink: false` (retired, unbuilt
 *   sources are left alone).
 *   A file that already declares a layout (e.g. layouts/guide-field-journal.njk)
 *   renders through that layout instead and is left alone here.
 *
 * TRANSFORM (idempotent — safe to run repeatedly)
 *   (a) insert <link rel="stylesheet" href="/css/guest.css?v=waterline-v3">
 *       immediately before </head>, unless already present.
 *   (b) <body> -> <body class="guest-shell">; if the body tag already has a
 *       class attribute, "guest-shell" is appended to it.
 *   (c) remove a legacy "back to Seascape" bar living right after the body
 *       tag (<nav class="guide-nav">...</nav> or <nav class="chart-nav">...
 *       </nav>) so it does not sit stacked under the new guest header, plus
 *       the orphaned .guide-nav/.chart-nav CSS declarations that styled it;
 *       also remove a hand-rolled copy of the old fixed site nav
 *       (<nav class="nav" id="mainNav">...</nav>) together with the inline
 *       margin-top:76px its breadcrumb used to clear it.
 *       An in-page breadcrumb or table-of-contents <nav> (class="breadcrumb",
 *       "journal-breadcrumbs", or no class) is a different, legitimate
 *       element and is left alone, CSS included.
 *   (d) insert {% include "partials/guest-header.njk" %} right after the
 *       body tag, unless the include is already present anywhere in the file.
 *   (e) if the file has a <footer>...</footer> element, replace that whole
 *       element with {% include "partials/guest-footer.njk" %}; otherwise
 *       insert the include right before </body>. Skipped if the footer
 *       include is already present anywhere in the file.
 *   (f) never creates a second header or footer: (c) clears the legacy bar
 *       before (d) inserts the new one, and both (d) and (e) are gated on
 *       their include not already being present in the file.
 *
 * USAGE
 *   node scripts/design/apply-guest-shell.js               # apply and write
 *   node scripts/design/apply-guest-shell.js --dry-run      # print, do not write
 *   node scripts/design/apply-guest-shell.js --check        # exit 1 if any
 *                                                            # target lacks the shell
 */

const fs = require("fs");
const path = require("path");

const GUIDES_DIR = path.join(__dirname, "..", "..", "src", "guides");
const GUEST_CSS_LINK = '<link rel="stylesheet" href="/css/guest.css?v=waterline-v3">';
const HEADER_INCLUDE = '{% include "partials/guest-header.njk" %}';
const FOOTER_INCLUDE = '{% include "partials/guest-footer.njk" %}';

const BODY_TAG_RE = /<body(\s[^>]*)?>/i;
const HEAD_CLOSE_RE = /<\/head>/i;
const BODY_CLOSE_RE = /<\/body>/i;
const FOOTER_ELEMENT_RE = /<footer(\s[^>]*)?>[\s\S]*?<\/footer>/i;
// Legacy "back to Seascape" bar: a <nav> whose class is (or includes, as a
// whole word) guide-nav or chart-nav. Deliberately does not match a bare
// <nav>, class="breadcrumb", or class="journal-breadcrumbs" — those are
// in-page wayfinding, not a duplicate site header, and stay untouched.
const LEGACY_NAV_BAR_RE = /\s*<nav\b[^>]*\bclass="[^"]*\b(?:guide-nav|chart-nav)\b[^"]*"[^>]*>[\s\S]*?<\/nav>/i;
// A hand-rolled copy of the old fixed site nav (<nav class="nav" id="mainNav">
// … </nav>, no nested <nav>) found in three area guides. Its breadcrumb bar
// compensates for the fixed nav with an inline margin-top:76px, which becomes
// a bare gap once the static guest header replaces it.
const LEGACY_MAIN_NAV_RE = /\s*<nav\b[^>]*\bid="mainNav"[^>]*>[\s\S]*?<\/nav>/i;
const LEGACY_MAIN_NAV_OFFSET_RE = /;?margin-top:76px(?=")/g;
// Orphaned CSS for that same removed bar (.guide-nav{...}, .guide-nav a{...},
// .guide-nav a:hover{...}, .guide-nav .logo{...}, and the .chart-nav
// equivalents) left behind in the page's own <style> block. Matches one
// compact one-line-per-rule declaration at a time; each capture stops at the
// first "}" so it never reaches past its own rule.
const ORPHANED_NAV_CSS_RE = /\.(?:guide|chart)-nav(?:\s+\.?[a-zA-Z][\w-]*)?(?::[a-zA-Z-]+)?\s*\{[^}]*\}\n?/g;

function readHeadBytes(fullPath, n) {
  const fd = fs.openSync(fullPath, "r");
  try {
    const buf = Buffer.alloc(n);
    const bytesRead = fs.readSync(fd, buf, 0, n, 0);
    return buf.slice(0, bytesRead).toString("utf8");
  } finally {
    fs.closeSync(fd);
  }
}

function isStandaloneTarget(fullPath) {
  const head = readHeadBytes(fullPath, 400);
  // A file that declares a layout renders through that layout; a file with
  // `permalink: false` is never built (eleventy.config.js also ignores two
  // such retired guides), so neither is a target.
  return !/^layout:/m.test(head) && !/^permalink:\s*false\b/m.test(head);
}

function listTargets() {
  const topLevel = fs
    .readdirSync(GUIDES_DIR)
    .filter((name) => name.endsWith(".html"));
  // Guides also live one level down as src/guides/<slug>/index.html.
  const nested = fs
    .readdirSync(GUIDES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(entry.name, "index.html"))
    .filter((rel) => fs.existsSync(path.join(GUIDES_DIR, rel)));
  return [...topLevel, ...nested]
    .filter((rel) => isStandaloneTarget(path.join(GUIDES_DIR, rel)))
    .sort();
}

function hasShell(html) {
  return (
    html.includes(GUEST_CSS_LINK) &&
    /<body[^>]*\bclass="[^"]*\bguest-shell\b[^"]*"[^>]*>/i.test(html) &&
    html.includes(HEADER_INCLUDE) &&
    html.includes(FOOTER_INCLUDE) &&
    !LEGACY_NAV_BAR_RE.test(html) &&
    !LEGACY_MAIN_NAV_RE.test(html)
  );
}

// Returns { out, changed, notes[] }. Throws on a file too malformed to shell
// (no <head>, <body> or </body>) so a broken source fails loudly instead of
// being silently skipped.
function transform(html, fileLabel) {
  let out = html;
  let changed = false;
  const notes = [];

  // (a) stylesheet link before </head>
  if (!out.includes(GUEST_CSS_LINK)) {
    if (!HEAD_CLOSE_RE.test(out)) {
      throw new Error(`${fileLabel}: no </head> found, cannot insert stylesheet link`);
    }
    out = out.replace(HEAD_CLOSE_RE, `${GUEST_CSS_LINK}\n</head>`);
    changed = true;
    notes.push("added guest.css link");
  }

  // (b) guest-shell body class
  const bodyMatch = out.match(BODY_TAG_RE);
  if (!bodyMatch) {
    throw new Error(`${fileLabel}: no <body> tag found`);
  }
  const bodyAttrs = bodyMatch[1] || "";
  const classMatch = bodyAttrs.match(/\sclass="([^"]*)"/i);
  if (classMatch) {
    const classes = classMatch[1].split(/\s+/).filter(Boolean);
    if (!classes.includes("guest-shell")) {
      classes.push("guest-shell");
      const newAttrs = bodyAttrs.replace(/\sclass="([^"]*)"/i, ` class="${classes.join(" ")}"`);
      out = out.replace(bodyMatch[0], `<body${newAttrs}>`);
      changed = true;
      notes.push("appended guest-shell to existing body class");
    }
  } else {
    const newAttrs = `${bodyAttrs} class="guest-shell"`;
    out = out.replace(bodyMatch[0], `<body${newAttrs}>`);
    changed = true;
    notes.push("added guest-shell body class");
  }

  // (c) strip a legacy "back to Seascape" nav bar so the guest header does
  // not land stacked on top of it (see LEGACY_NAV_BAR_RE for what counts).
  const legacyNavMatch = out.match(LEGACY_NAV_BAR_RE);
  if (legacyNavMatch) {
    out = out.replace(legacyNavMatch[0], "");
    changed = true;
    notes.push("removed legacy back-to-Seascape nav bar");
  }
  const legacyMainNavMatch = out.match(LEGACY_MAIN_NAV_RE);
  if (legacyMainNavMatch) {
    out = out.replace(legacyMainNavMatch[0], "");
    out = out.replace(LEGACY_MAIN_NAV_OFFSET_RE, "");
    changed = true;
    notes.push("removed hand-rolled legacy site nav and its fixed-nav breadcrumb offset");
  }

  // Orphaned CSS for a bar removed just now, or in an earlier run of this
  // script before it also swept up the CSS — nothing selects these rules
  // once the bar markup is gone, so they just sit dead in the page's own
  // <style> block. Checked unconditionally so a re-run still catches it.
  const beforeCssStrip = out;
  out = out.replace(ORPHANED_NAV_CSS_RE, "");
  if (out !== beforeCssStrip) {
    changed = true;
    notes.push("removed orphaned nav-bar CSS declarations");
  }

  // (d) guest header, right after the (possibly just-updated) body tag
  if (!out.includes(HEADER_INCLUDE)) {
    const currentBodyMatch = out.match(BODY_TAG_RE);
    if (!currentBodyMatch) {
      throw new Error(`${fileLabel}: lost <body> tag mid-transform`);
    }
    out = out.replace(currentBodyMatch[0], `${currentBodyMatch[0]}\n${HEADER_INCLUDE}`);
    changed = true;
    notes.push("inserted guest header include");
  }

  // (e) guest footer: replace an existing <footer>, else insert before </body>
  if (!out.includes(FOOTER_INCLUDE)) {
    const footerMatch = out.match(FOOTER_ELEMENT_RE);
    if (footerMatch) {
      out = out.replace(footerMatch[0], FOOTER_INCLUDE);
      changed = true;
      notes.push("replaced legacy <footer> with guest footer include");
    } else {
      if (!BODY_CLOSE_RE.test(out)) {
        throw new Error(`${fileLabel}: no </body> found, cannot insert footer include`);
      }
      out = out.replace(BODY_CLOSE_RE, `${FOOTER_INCLUDE}\n</body>`);
      changed = true;
      notes.push("inserted guest footer include before </body> (no legacy footer found)");
    }
  }

  return { out, changed, notes };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const check = args.includes("--check");

  const targets = listTargets();
  console.log(`apply-guest-shell: ${targets.length} standalone guide file(s) targeted.`);

  if (check) {
    let missing = 0;
    for (const name of targets) {
      const full = path.join(GUIDES_DIR, name);
      const html = fs.readFileSync(full, "utf8");
      if (!hasShell(html)) {
        missing += 1;
        console.log(`MISSING SHELL: src/guides/${name}`);
      }
    }
    if (missing > 0) {
      console.log(`apply-guest-shell --check: ${missing} file(s) missing the guest shell.`);
      process.exit(1);
    }
    console.log("apply-guest-shell --check: all target files carry the guest shell.");
    return;
  }

  let changedCount = 0;
  let errors = 0;
  for (const name of targets) {
    const full = path.join(GUIDES_DIR, name);
    const original = fs.readFileSync(full, "utf8");
    let result;
    try {
      result = transform(original, `src/guides/${name}`);
    } catch (err) {
      errors += 1;
      console.error(`ERROR: ${err.message}`);
      continue;
    }
    if (result.changed) {
      changedCount += 1;
      console.log(`${dryRun ? "[dry-run] " : ""}UPDATED src/guides/${name}: ${result.notes.join("; ")}`);
      if (!dryRun) {
        fs.writeFileSync(full, result.out, "utf8");
      }
    } else {
      console.log(`OK (already shelled) src/guides/${name}`);
    }
  }

  console.log(
    `apply-guest-shell: ${changedCount} file(s) ${dryRun ? "would be " : ""}updated, ` +
      `${targets.length - changedCount} already shelled, ${errors} error(s).`
  );

  if (errors > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { listTargets, transform, hasShell };
