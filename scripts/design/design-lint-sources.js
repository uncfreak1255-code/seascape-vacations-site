"use strict";

// What design-lint scans. Guides were the original corpus (2026-07); the scan
// widened on 2026-10-25 to every stylesheet and shared template, because an
// off-brand hex in a partial or a sheet reaches every page that includes it.
// Legacy files that still violate are named exceptions in
// design-lint-baseline.json, not exemptions of a whole folder.
const fs = require("fs");
const path = require("path");

const SOURCE_ROOTS = ["src/guides", "src/css", "src/_includes"];
const SOURCE_RE = /\.(html|njk|css)$/i;

// A .css file is style from top to bottom; a template only inside <style> and
// style="" (see extractStyleContexts in design-lint.js).
const isStylesheet = (rel) => /\.css$/i.test(rel);

function listSourceFiles(projectRoot) {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (SOURCE_RE.test(entry.name)) results.push(path.relative(projectRoot, full).split(path.sep).join("/"));
    }
  }
  for (const root of SOURCE_ROOTS) walk(path.join(projectRoot, root));
  return results.sort();
}

module.exports = { SOURCE_ROOTS, listSourceFiles, isStylesheet };
