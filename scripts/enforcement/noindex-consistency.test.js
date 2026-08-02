"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const seoPages = require(path.join(projectRoot, "src", "_data", "seoPages.json"));
const seoGovernance = require(path.join(projectRoot, "src", "_data", "seoGovernance.js"));

// Why this exists: `seoGovernance.staysNoindexSlugs` marks stay pages Google is
// told NOT to index. Every internal reference pointing at one of those pages
// spends crawl budget and link equity on a destination that cannot rank. That
// failure already shipped once - redirects were 301'ing into noindexed pages and
// had to be hand-fixed on 2026-07-24 - and on 2026-07-27 three more surfaces were
// found still doing it: src/llms.txt steering AI crawlers to a noindexed page,
// 15 relatedStaySlugs references from indexable pages, and guide body links.
//
// Nothing compared these surfaces against the noindex set, so each was invisible.

const NOINDEX_SLUGS = new Set(seoGovernance.staysNoindexSlugs || []);

function noindexRoutes() {
  return [...NOINDEX_SLUGS].map((slug) => `/stays/${slug}/`);
}

function indexableVacationerEntries() {
  return (seoPages.vacationer || []).filter(
    (entry) => entry.slug && !NOINDEX_SLUGS.has(entry.slug) && !entry.rehomeTo
  );
}

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

test("the noindex set is non-empty and every slug resolves to a real stay entry", () => {
  // Guards the guard: if staysNoindexSlugs were emptied or its slugs renamed, every
  // assertion below would pass vacuously while the real leak went unchecked.
  assert.ok(NOINDEX_SLUGS.size > 0, "staysNoindexSlugs is empty - the checks below would be vacuous");

  const known = new Set((seoPages.vacationer || []).map((entry) => entry.slug));
  const orphans = [...NOINDEX_SLUGS].filter((slug) => !known.has(slug));
  assert.deepEqual(
    orphans,
    [],
    `staysNoindexSlugs names slug(s) with no seoPages.vacationer entry: ${orphans.join(", ")}. ` +
      "Either the page was retired (drop the slug) or it was renamed (update the slug)."
  );
});

test("indexable stay pages do not link noindexed siblings via relatedStaySlugs", () => {
  const offenders = [];
  for (const entry of indexableVacationerEntries()) {
    for (const related of entry.relatedStaySlugs || []) {
      if (NOINDEX_SLUGS.has(related)) {
        offenders.push(`${entry.slug} -> ${related}`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "Indexable stay page(s) route related-stay cards into noindexed pages, spending " +
      "crawl budget and link equity on destinations that cannot rank. Remove the " +
      `reference (each page keeps its remaining siblings):\n  ${offenders.join("\n  ")}`
  );
});

test("src/llms.txt does not steer AI crawlers to noindexed pages", () => {
  const llms = read("src/llms.txt");
  const offenders = noindexRoutes().filter((route) => llms.includes(route));

  assert.deepEqual(
    offenders,
    [],
    "src/llms.txt links route(s) excluded from the index. This file exists to point " +
      "AI crawlers at canonical content, so listing a noindexed page is a direct " +
      `contradiction:\n  ${offenders.join("\n  ")}`
  );
});

test("no redirect targets a noindexed stay page", () => {
  const redirects = read("src/_redirects");
  const offenders = [];

  for (const line of redirects.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const [, target] = trimmed.split(/\s+/);
    if (!target) {
      continue;
    }
    const normalized = target.endsWith("/") ? target : `${target}/`;
    if (noindexRoutes().includes(normalized)) {
      offenders.push(trimmed);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "Redirect rule(s) send traffic and equity into a noindexed page - the exact bug " +
      `hand-fixed on 2026-07-24:\n  ${offenders.join("\n  ")}`
  );
});

test("every rehomed stay page has redirect parity to its rehomeTo target", () => {
  // staysPages.js drops rehomeTo records from the build, so without a matching
  // redirect the live URL 404s. Today all six have rules only because someone
  // remembered by hand.
  const redirects = read("src/_redirects");
  const rules = redirects
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/));

  const missing = [];
  for (const entry of seoPages.vacationer || []) {
    if (!entry.rehomeTo) {
      continue;
    }
    const source = `/stays/${entry.slug}/`;
    const matched = rules.find(([from]) => {
      const normalized = from.endsWith("/") ? from : `${from}/`;
      return normalized === source;
    });
    if (!matched) {
      missing.push(`${source} (rehomeTo ${entry.rehomeTo}) has no redirect rule`);
      continue;
    }
    const target = matched[1] || "";
    if (!target.includes(entry.rehomeTo)) {
      missing.push(`${source} redirects to ${target}, expected rehomeTo ${entry.rehomeTo}`);
    }
  }

  assert.deepEqual(
    missing,
    [],
    `Rehomed stay page(s) would 404 or land on the wrong target:\n  ${missing.join("\n  ")}`
  );
});

// Guide BODY links are reader copy: changing them requires the voice order and a
// brief, so they are pinned here rather than fixed in the same change. This list
// MAY ONLY SHRINK - a file whose links are cleaned must be deleted from it.
const KNOWN_GUIDE_NOINDEX_LINKS = new Set([
  "src/guides/anna-maria-island-area-guide/index.html",
  "src/guides/anna-maria-island-weather.html",
  "src/guides/best-restaurants-anna-maria-island.html",
  "src/guides/best-time-visit-anna-maria-island.html",
  "src/guides/bradenton-beach.html",
  "src/guides/family-vacation-anna-maria-island.html",
  "src/guides/spring-break-activities-bradenton-anna-maria-island/index.html",
]);

function guideSources() {
  const results = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(html|njk)$/i.test(entry.name)) {
        results.push(path.relative(projectRoot, full).split(path.sep).join("/"));
      }
    }
  };
  walk(path.join(projectRoot, "src", "guides"));
  return results.sort();
}

test("guides do not link noindexed stay pages, except known pinned files", () => {
  const routes = noindexRoutes();
  const offenders = [];
  const stale = new Set(KNOWN_GUIDE_NOINDEX_LINKS);

  for (const rel of guideSources()) {
    const source = read(rel);
    const hits = routes.filter(
      (route) => source.includes(`href="${route}"`) || source.includes(`href='${route}'`)
    );
    if (hits.length) {
      if (KNOWN_GUIDE_NOINDEX_LINKS.has(rel)) {
        stale.delete(rel);
      } else {
        offenders.push(`${rel}: ${hits.join(", ")}`);
      }
    }
    // A clean file is deliberately NOT cleared from `stale`. If it is also pinned,
    // the pin is unnecessary and the assertion below reports it - otherwise anyone
    // could pre-pin a clean guide and silence the gate before adding a bad link.
  }

  assert.deepEqual(
    offenders,
    [],
    "Guide(s) link stay pages excluded from the index. Point the link at an " +
      "indexable stay collection instead of adding to KNOWN_GUIDE_NOINDEX_LINKS:\n  " +
      offenders.join("\n  ")
  );

  assert.deepEqual(
    [...stale],
    [],
    "KNOWN_GUIDE_NOINDEX_LINKS pins file(s) that no longer link a noindexed page. " +
      `The list may only shrink - delete these entries:\n  ${[...stale].join("\n  ")}`
  );
});
