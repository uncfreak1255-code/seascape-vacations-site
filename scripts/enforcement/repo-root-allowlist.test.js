const { execFileSync } = require("node:child_process");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

// Every tracked top-level entry in the repo root. Previews, reports, one-off
// scripts and stray HTML belong in a documented folder (docs/, scripts/,
// tests/) or stay uncommitted. To add a root entry on purpose, add it here in
// the same PR and say why in the PR description.
const ALLOWED_ROOT_ENTRIES = new Set([
  ".agents",
  ".claude",
  ".claude-plugin",
  ".codex",
  ".cursor",
  ".env.example",
  ".githooks",
  ".github",
  ".gitignore",
  ".guardrails.json",
  ".keel",
  ".mcp.json",
  ".nvmrc",
  ".playwright-mcp",
  "AGENTS.md",
  "CLAUDE.md",
  "DESIGN.md",
  "GLOSSARY.md",
  "_headers",
  "config",
  "content-priorities-2026-03.md",
  "content-priorities-2026-10.md",
  "dashboard",
  "docs",
  "e2e.config.ts",
  "eleventy.config.js",
  "emails",
  "favicon-32.png",
  "hero-mobile.avif",
  "hero-mobile.jpg",
  "hero-mobile.webp",
  "hero-optimized.avif",
  "hero-optimized.jpg",
  "hero-optimized.webp",
  "images",
  "lighthouserc.js",
  "logo-nav.png",
  "logo-optimized.png",
  "logo-white-optimized.png",
  "logo-white.png",
  "logo.png",
  "netlify",
  "netlify.toml",
  "package-lock.json",
  "package.json",
  "playwright.config.js",
  "plugins",
  "rank-tracker-latest.md",
  "scripts",
  "seo-findings",
  "skills",
  "skills-lock.json",
  "src",
  "tests",
  "workspace"
]);

test("repo root holds only allowlisted tracked entries", () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  })
    .split("\0")
    .filter(Boolean);
  const rootEntries = new Set(tracked.map((file) => file.split("/")[0]));
  const unknown = [...rootEntries].filter((entry) => !ALLOWED_ROOT_ENTRIES.has(entry)).sort();

  assert.deepEqual(
    unknown,
    [],
    `unexpected files in repo root: ${unknown.join(", ")}. Move them under docs/, scripts/ or tests/, or leave them uncommitted. If the root entry is intended, add it to ALLOWED_ROOT_ENTRIES.`
  );
});
