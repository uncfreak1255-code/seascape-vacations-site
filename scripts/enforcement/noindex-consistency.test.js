"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const seoPages = require(path.join(projectRoot, "src", "_data", "seoPages.json"));
const seoGovernance = require(path.join(projectRoot, "src", "_data", "seoGovernance.js"));
const SITE_ORIGIN = "https://seascape-vacations.com";
const SAME_SITE_HOSTS = new Set(["seascape-vacations.com", "www.seascape-vacations.com"]);
const SAME_SITE_PROTOCOLS = new Set(["http:", "https:"]);
const HREF_RE = /\bhref\s*=\s*(["'])(.*?)\1/gi;
const TEXT_LINK_RE = /(?:https?:\/\/[^\s<>()"']+|\/[A-Za-z0-9][^\s<>()"']*)/gi;

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
const NOINDEX_ROUTES = new Set([...NOINDEX_SLUGS].map((slug) => `/stays/${slug}/`));

function noindexRoutes() {
  return [...NOINDEX_ROUTES];
}

function indexableVacationerEntries() {
  return (seoPages.vacationer || []).filter(
    (entry) => entry.slug && !NOINDEX_SLUGS.has(entry.slug) && !entry.rehomeTo
  );
}

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function normalizeInternalRoute(href) {
  const raw = String(href || "")
    .trim()
    .replace(/&amp;/gi, "&")
    .replace(/&#x2f;/gi, "/")
    .replace(/&#47;/gi, "/");
  if (!raw || raw.startsWith("#")) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(raw, SITE_ORIGIN);
  } catch {
    return null;
  }
  if (!SAME_SITE_PROTOCOLS.has(parsed.protocol) || !SAME_SITE_HOSTS.has(parsed.hostname.toLowerCase())) {
    return null;
  }

  const pathname = parsed.pathname.replace(/\/{2,}/g, "/");
  if (!pathname.startsWith("/")) {
    return null;
  }
  return pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
}

function noindexHits(rel, source) {
  const matcher = new RegExp(HREF_RE.source, HREF_RE.flags);
  const hits = [];
  for (const match of source.matchAll(matcher)) {
    const route = normalizeInternalRoute(match[2]);
    if (route && NOINDEX_ROUTES.has(route)) {
      hits.push({ rel, href: match[2], route });
    }
  }
  return hits;
}

function noindexTextHits(rel, source) {
  const matcher = new RegExp(TEXT_LINK_RE.source, TEXT_LINK_RE.flags);
  const hits = [];
  for (const match of source.matchAll(matcher)) {
    // Markdown and prose commonly put links before punctuation. Strip only
    // terminal punctuation so normalization sees the URL, not its sentence.
    const href = match[0].replace(/[.,;:!?]+$/g, "");
    const route = normalizeInternalRoute(href);
    if (route && NOINDEX_ROUTES.has(route)) {
      hits.push({ rel, href, route });
    }
  }
  return hits;
}

function sourceFiles(rootDir) {
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
  if (fs.existsSync(rootDir)) {
    walk(rootDir);
  }
  return results.sort();
}

function publicTemplateSources() {
  // Scan every public HTML/Nunjucks source, not only guide files. Property
  // templates and shared public templates can emit the same links into the
  // rendered site and must not escape this consistency gate.
  return sourceFiles(path.join(projectRoot, "src"));
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
  const offenders = noindexTextHits("src/llms.txt", llms);

  assert.deepEqual(
    offenders,
    [],
    "src/llms.txt links route(s) excluded from the index. This file exists to point " +
      "AI crawlers at canonical content, so listing a noindexed page is a direct " +
      `contradiction:\n  ${offenders.map(({ href, route }) => `${href} -> ${route}`).join("\n  ")}`
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
const KNOWN_GUIDE_NOINDEX_LINK_COUNTS = new Map([
  ["src/guides/anna-maria-island-area-guide/index.html|/stays/pet-friendly-vacation-rentals-bradenton/", 1],
  ["src/guides/anna-maria-island-weather.html|/stays/spring-break-rentals-anna-maria-island/", 2],
  ["src/guides/anna-maria-island-weather.html|/stays/summer-vacation-rentals-florida-gulf-coast/", 1],
  ["src/guides/best-restaurants-anna-maria-island.html|/stays/anniversary-trip-rentals-florida/", 1],
  ["src/guides/best-time-visit-anna-maria-island.html|/stays/new-years-eve-rentals-florida/", 1],
  ["src/guides/best-time-visit-anna-maria-island.html|/stays/beach-wedding-vacation-rentals-florida/", 1],
  ["src/guides/bradenton-beach.html|/stays/pet-friendly-vacation-rentals-bradenton/", 1],
  ["src/guides/family-vacation-anna-maria-island.html|/stays/babymoon-vacation-rentals-florida/", 1],
  ["src/guides/pet-friendly-anna-maria-island.html|/stays/pet-friendly-vacation-rentals-bradenton/", 2],
  ["src/guides/spring-break-activities-bradenton-anna-maria-island/index.html|/stays/spring-break-rentals-anna-maria-island/", 1],
]);
const KNOWN_GUIDE_NOINDEX_LINKS = new Set(KNOWN_GUIDE_NOINDEX_LINK_COUNTS.keys());

function guideSources() {
  return publicTemplateSources().filter((rel) => rel.startsWith("src/guides/"));
}

function findPublicTemplateNoindexFindings(entries = publicTemplateSources().map((rel) => ({ rel, source: read(rel) }))) {
  const offenders = [];
  const stale = new Set(KNOWN_GUIDE_NOINDEX_LINK_COUNTS.keys());
  const observed = new Map();

  for (const { rel, source } of entries) {
    for (const hit of noindexHits(rel, source)) {
      const pair = `${rel}|${hit.route}`;
      if (rel.startsWith("src/guides/") && KNOWN_GUIDE_NOINDEX_LINK_COUNTS.has(pair)) {
        const occurrence = (observed.get(pair) || 0) + 1;
        observed.set(pair, occurrence);
        const pinnedCount = KNOWN_GUIDE_NOINDEX_LINK_COUNTS.get(pair);
        if (occurrence <= pinnedCount) {
          stale.delete(pair);
        } else {
          offenders.push(
            `${rel}: ${hit.href} -> ${hit.route} (occurrence ${occurrence} exceeds pinned ${pinnedCount})`
          );
        }
      } else {
        offenders.push(`${rel}: ${hit.href} -> ${hit.route}`);
      }
    }
  }

  return { offenders, stale };
}

test("public templates do not link noindexed stay pages, except exact pinned guide pairs", () => {
  const { offenders, stale } = findPublicTemplateNoindexFindings();

  assert.deepEqual(
    offenders,
    [],
    "Public template(s) link stay pages excluded from the index. Point the link at an " +
      "indexable stay collection; only the exact pre-existing guide file-and-route pairs " +
      `may remain pinned:\n  ` +
      offenders.join("\n  ")
  );

  assert.deepEqual(
    [...stale],
    [],
    "KNOWN_GUIDE_NOINDEX_LINKS pins file-and-route pair(s) that no longer link a noindexed page. " +
      `The list may only shrink - delete these entries:\n  ${[...stale].join("\n  ")}`
  );
});

test("slashless internal stay links normalize to the noindex route", () => {
  const rel = "src/guides/pet-friendly-anna-maria-island.html";
  const hits = noindexHits(rel, '<a href="/stays/pet-friendly-vacation-rentals-bradenton">Pets</a>');
  assert.deepEqual(hits, [
    {
      rel,
      href: "/stays/pet-friendly-vacation-rentals-bradenton",
      route: "/stays/pet-friendly-vacation-rentals-bradenton/",
    },
  ]);
});

test("property-template noindex links are detectable outside the guide corpus", () => {
  const rel = "src/properties/example/index.njk";
  const hits = noindexHits(rel, '<a href="/stays/pet-friendly-vacation-rentals-bradenton">Pets</a>');
  assert.equal(publicTemplateSources().some((source) => source.startsWith("src/properties/")), true);
  assert.deepEqual(hits.map(({ route }) => route), ["/stays/pet-friendly-vacation-rentals-bradenton/"]);
});

test("guide noindex pins are exact file-and-route pairs", () => {
  const rel = "src/guides/bradenton-beach.html";
  const knownRoute = "/stays/pet-friendly-vacation-rentals-bradenton/";
  const newRoute = "/stays/spring-break-rentals-anna-maria-island/";
  assert.equal(KNOWN_GUIDE_NOINDEX_LINKS.has(`${rel}|${knownRoute}`), true);
  assert.equal(KNOWN_GUIDE_NOINDEX_LINKS.has(`${rel}|${newRoute}`), false);
});

test("llms links normalize absolute slashless stay routes", () => {
  const hits = noindexTextHits(
    "src/llms.txt",
    "- [Pet-Friendly Rentals](https://seascape-vacations.com/stays/pet-friendly-vacation-rentals-bradenton)"
  );

  assert.deepEqual(hits, [
    {
      rel: "src/llms.txt",
      href: "https://seascape-vacations.com/stays/pet-friendly-vacation-rentals-bradenton",
      route: "/stays/pet-friendly-vacation-rentals-bradenton/",
    },
  ]);
});

test("same-site alternate origins normalize to noindex routes", () => {
  const route = "/stays/pet-friendly-vacation-rentals-bradenton/";
  for (const origin of [
    "https://www.seascape-vacations.com",
    "http://seascape-vacations.com",
    "http://www.seascape-vacations.com",
  ]) {
    assert.equal(normalizeInternalRoute(`${origin}${route}`), route, `${origin} must be treated as internal`);
  }
});

test("guide noindex pins reject extra occurrences of an existing pair", () => {
  const rel = "src/guides/bradenton-beach.html";
  const route = "/stays/pet-friendly-vacation-rentals-bradenton/";
  const source = `<a href="${route}">one</a><a href="${route}">two</a>`;
  const { offenders } = findPublicTemplateNoindexFindings([{ rel, source }]);

  assert.equal(KNOWN_GUIDE_NOINDEX_LINK_COUNTS.get(`${rel}|${route}`), 1);
  assert.equal(offenders.length, 1);
  assert.match(offenders[0], /occurrence 2 exceeds pinned 1/);
});

module.exports = {
  normalizeInternalRoute,
  noindexHits,
  noindexTextHits,
  noindexRoutes,
  publicTemplateSources,
  guideSources,
  KNOWN_GUIDE_NOINDEX_LINKS,
  KNOWN_GUIDE_NOINDEX_LINK_COUNTS,
  findPublicTemplateNoindexFindings,
};
