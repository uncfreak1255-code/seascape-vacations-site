#!/usr/bin/env node
"use strict";

// Netlify `[build] ignore` command. Exit 0 skips the build, exit 1 builds.
// A production deploy costs credits, so merges that only touch agent docs,
// tooling or CI skip it. Availability is baked in at build time and merges
// are the only thing that rebuilds it, so a skip also requires the live
// availability snapshot to be fresh. Any doubt builds.

const { execFileSync } = require("node:child_process");

const SKIP_PREFIXES = [
  "docs/",
  ".agents/",
  ".claude/",
  ".cursor/",
  ".github/",
  ".githooks/",
  "plugins/",
  "skills/",
  "seo-findings/",
  "workspace/",
];
const LIVE_URL = "https://seascape-vacations.com/properties/";
const MAX_SNAPSHOT_AGE_MS = 12 * 60 * 60 * 1000;

function isSkippablePath(file) {
  if (!file.includes("/") && file.endsWith(".md")) return true;
  return SKIP_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function parseSyncedAt(html) {
  const match = /data-opening-synced="([^"]+)"/.exec(String(html || ""));
  if (!match) return null;
  const time = Date.parse(match[1]);
  return Number.isNaN(time) ? null : time;
}

// Pure decision. changedFiles is null when the diff could not be read.
function decide({ context, cachedRef, commitRef, changedFiles, syncedAt, now }) {
  if (context !== "production") return { build: true, reason: `context is ${context || "unset"}` };
  if (!cachedRef || !commitRef) return { build: true, reason: "no previous deploy commit to compare" };
  if (cachedRef === commitRef) return { build: true, reason: "same commit as last build" };
  if (!Array.isArray(changedFiles)) return { build: true, reason: "could not read changed files" };
  if (changedFiles.length === 0) return { build: true, reason: "no changed files reported" };
  const buildFiles = changedFiles.filter((file) => !isSkippablePath(file));
  if (buildFiles.length > 0) return { build: true, reason: `site-affecting change: ${buildFiles.slice(0, 5).join(", ")}` };
  if (syncedAt === null || syncedAt === undefined) return { build: true, reason: "live availability marker missing" };
  const age = now - syncedAt;
  if (!(age >= 0 && age <= MAX_SNAPSHOT_AGE_MS)) {
    return { build: true, reason: `live availability is ${Math.round(age / 3600000)}h old` };
  }
  return { build: false, reason: `only non-site files changed (${changedFiles.length}); live availability is ${Math.round(age / 60000)}m old` };
}

function readChangedFiles(from, to) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", from, to], { encoding: "utf8" });
    return out.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch (error) {
    console.log(`[netlify-ignore] git diff failed: ${error.message}`);
    return null;
  }
}

async function readSyncedAt() {
  try {
    const response = await fetch(LIVE_URL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    return parseSyncedAt(await response.text());
  } catch (error) {
    console.log(`[netlify-ignore] live fetch failed: ${error.message}`);
    return null;
  }
}

async function main() {
  const { CONTEXT: context, CACHED_COMMIT_REF: cachedRef, COMMIT_REF: commitRef } = process.env;
  let changedFiles = null;
  let syncedAt = null;
  if (context === "production" && cachedRef && commitRef && cachedRef !== commitRef) {
    changedFiles = readChangedFiles(cachedRef, commitRef);
    if (changedFiles && changedFiles.length > 0 && changedFiles.every(isSkippablePath)) {
      syncedAt = await readSyncedAt();
    }
  }
  const result = decide({ context, cachedRef, commitRef, changedFiles, syncedAt, now: Date.now() });
  console.log(`[netlify-ignore] ${result.build ? "BUILD" : "SKIP"}: ${result.reason}`);
  process.exit(result.build ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    console.log(`[netlify-ignore] BUILD: unexpected error ${error.message}`);
    process.exit(1);
  });
}

module.exports = { decide, isSkippablePath, parseSyncedAt, MAX_SNAPSHOT_AGE_MS };
