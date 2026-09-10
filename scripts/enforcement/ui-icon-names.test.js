"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");
const iconPartialPath = path.join(repoRoot, "src", "_includes", "partials", "ui-icon.njk");
const srcDir = path.join(repoRoot, "src");

/*
 * Iconography rule (DESIGN.md "Iconography Rule", "Floors"): SVG icons only
 * come through the uiIcon/uiLabel macros in
 * src/_includes/partials/ui-icon.njk. A call site that names an icon the
 * partial does not define renders the generic fallback circle (the
 * `{% else %}` branch) instead of failing the build — a silent, invisible
 * defect. This statically pairs every uiIcon('name')/uiLabel('name') call in
 * src/ against the names the partial actually defines.
 */

function definedIconNames() {
  const content = fs.readFileSync(iconPartialPath, "utf8");
  const names = new Set();
  const pattern = /name\s*==\s*"([^"]+)"/g;
  let match = pattern.exec(content);
  while (match) {
    names.add(match[1]);
    match = pattern.exec(content);
  }
  return names;
}

function listSourceFiles(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && (entry.name.endsWith(".njk") || entry.name.endsWith(".html"))) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

function findIconUsages(dir) {
  const usages = [];
  // Only literal-string calls are checkable statically: uiIcon('name'),
  // uiIcon("name"), uiLabel('name'), uiLabel("name"). A call built from a
  // variable (e.g. the uiIcon(name, iconClass) inside the uiLabel macro
  // itself) has no literal to check and is intentionally not matched.
  const callPattern = /(uiIcon|uiLabel)\(\s*(['"])([a-zA-Z0-9_-]+)\2/g;

  for (const filePath of listSourceFiles(dir)) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const relativePath = path.relative(repoRoot, filePath).split(path.sep).join("/");

    lines.forEach((line, index) => {
      callPattern.lastIndex = 0;
      let match = callPattern.exec(line);
      while (match) {
        usages.push({
          file: relativePath,
          line: index + 1,
          macro: match[1],
          name: match[3],
        });
        match = callPattern.exec(line);
      }
    });
  }

  return usages;
}

test("ui-icon.njk defines at least one icon name", () => {
  const names = definedIconNames();
  assert.ok(names.size > 0, `Could not parse any name == "..." branch from ${iconPartialPath}`);
});

test("every uiIcon()/uiLabel() call in src references a name defined in ui-icon.njk", () => {
  const definedNames = definedIconNames();
  const usages = findIconUsages(srcDir);

  assert.ok(usages.length > 0, `Found no uiIcon()/uiLabel() calls under ${srcDir} — the scan may be broken`);

  const unknown = usages.filter((usage) => !definedNames.has(usage.name));

  assert.equal(
    unknown.length,
    0,
    `Unknown icon name(s) — not defined in src/_includes/partials/ui-icon.njk (${unknown.length} found):\n` +
      unknown.map((u) => `  ${u.file}:${u.line} — ${u.macro}('${u.name}') has no matching icon, renders the fallback circle`).join("\n")
  );
});
