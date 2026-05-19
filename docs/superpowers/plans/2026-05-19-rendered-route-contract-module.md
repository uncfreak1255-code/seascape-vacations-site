# Rendered Route Contract Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1A from the route/domain truth roadmap: a deep rendered route contract Module that extracts route facts from source or built HTML through one small Interface.

**Architecture:** Create `scripts/enforcement/rendered-route-contract.js` as the route-fact Module. Keep it CommonJS like the rest of `scripts/enforcement`, make it filesystem-light, and consume the existing marker helpers from `scripts/enforcement/lib.js` instead of duplicating marker constants. Refactor only the narrow tests that already parse head tags or route facts by hand; do not change page-family inventory yet.

**Tech Stack:** Node.js CommonJS, `node:test`, `node:assert/strict`, built `_site` HTML, source Nunjucks/HTML files, existing npm/guardrail scripts.

---

## File Structure

- Create `scripts/enforcement/rendered-route-contract.js`
  - Owns route text loading and extraction.
  - Exports pure helpers for tests and future enforcement scripts.
  - Does not call `process.exit`.
- Create `scripts/enforcement/rendered-route-contract.test.js`
  - Unit tests for extraction from inline fixtures.
  - Integration-style tests against current source files.
  - Built-output tests should run after `npm run build`; keep them explicit.
- Modify `scripts/enforcement/metadata-integrity.test.js`
  - Replace local `findMetaContent` and ad hoc JSON-LD checks with the new Interface for the head-tag cases it already covers.
  - Keep owner-data checks that inspect `seoPages.json` as-is.
- Modify `scripts/enforcement/direct-booking-event-smoke.test.js`
  - Use the new tracked-event extractor for the static homepage/popup assertions only.
  - Leave smoke-script simulation tests alone.
- Do not modify `scripts/enforcement/page-family-inventory.js` in this phase.
- Do not change public source pages, copy, redirects, schema content, or generated `_site`.

## Interface Contract

The new Module exports:

```js
{
  buildRouteContract,
  extractHeadTags,
  extractJsonLdObjects,
  extractJsonLdBlocks,
  extractTrackedEvents,
  extractRoutePathFacts,
  readRouteSource,
  readBuiltRoute,
  assertRequiredHeadTags
}
```

The central Interface is `buildRouteContract({ html, routePath, sourcePath })`, returning:

```js
{
  routePath,
  sourcePath,
  head: {
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription
  },
  jsonLdBlocks,
  jsonLdObjects,
  trackedEvents,
  templateLeakMarkers,
  standaloneShellMarkers,
  pathFacts: {
    isHomepage,
    isGuide,
    isStay,
    isOwner,
    isProperty,
    slug
  }
}
```

## Task 1: Create Failing Unit Tests For The Module Interface

**Files:**
- Create: `scripts/enforcement/rendered-route-contract.test.js`
- Create later: `scripts/enforcement/rendered-route-contract.js`

- [ ] **Step 1: Write the failing test file**

Create `scripts/enforcement/rendered-route-contract.test.js` with this content:

```js
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertRequiredHeadTags,
  buildRouteContract,
  extractHeadTags,
  extractJsonLdObjects,
  extractRoutePathFacts,
  extractTrackedEvents
} = require("./rendered-route-contract");

const SAMPLE_HTML = `
<!doctype html>
<html lang="en">
<head>
  <title>Sample Guide Title</title>
  <meta name="description" content="Sample guide description.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://seascape-vacations.com/guides/sample-guide/">
  <meta property="og:title" content="Sample OG Title">
  <meta property="og:description" content="Sample OG description.">
  <meta name="twitter:title" content="Sample Twitter Title">
  <meta name="twitter:description" content="Sample Twitter description.">
  <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"Sample Guide Title"}
  </script>
  <script type="application/ld+json">
    [{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[]}]
  </script>
</head>
<body>
  <a href="/stays/sample/" data-track-event="guide_book_direct_click">Browse stays</a>
  <form data-track-form="email_capture" data-form-submit-event="email_capture_submit"></form>
  <div>{{ leakedTemplateMarker }}</div>
</body>
</html>`;

test("extractHeadTags reads primary, Open Graph, Twitter, canonical, and robots tags", () => {
  assert.deepEqual(extractHeadTags(SAMPLE_HTML), {
    title: "Sample Guide Title",
    description: "Sample guide description.",
    canonical: "https://seascape-vacations.com/guides/sample-guide/",
    robots: "index, follow",
    ogTitle: "Sample OG Title",
    ogDescription: "Sample OG description.",
    twitterTitle: "Sample Twitter Title",
    twitterDescription: "Sample Twitter description."
  });
});

test("extractJsonLdObjects parses single objects and arrays from JSON-LD blocks", () => {
  assert.deepEqual(
    extractJsonLdObjects(SAMPLE_HTML).map((object) => object["@type"]),
    ["Article", "BreadcrumbList"]
  );
});

test("extractTrackedEvents reads link and form tracking events without inventing names", () => {
  assert.deepEqual(extractTrackedEvents(SAMPLE_HTML), [
    "guide_book_direct_click",
    "email_capture_submit"
  ]);
});

test("extractRoutePathFacts classifies route families and slugs", () => {
  assert.deepEqual(extractRoutePathFacts("/guides/sample-guide/"), {
    isHomepage: false,
    isGuide: true,
    isStay: false,
    isOwner: false,
    isProperty: false,
    slug: "sample-guide"
  });

  assert.deepEqual(extractRoutePathFacts("/"), {
    isHomepage: true,
    isGuide: false,
    isStay: false,
    isOwner: false,
    isProperty: false,
    slug: "home"
  });
});

test("buildRouteContract returns the small route fact Interface", () => {
  const contract = buildRouteContract({
    html: SAMPLE_HTML,
    routePath: "/guides/sample-guide/",
    sourcePath: "src/guides/sample-guide.html"
  });

  assert.equal(contract.routePath, "/guides/sample-guide/");
  assert.equal(contract.sourcePath, "src/guides/sample-guide.html");
  assert.equal(contract.head.title, "Sample Guide Title");
  assert.equal(contract.jsonLdBlocks.length, 2);
  assert.deepEqual(contract.jsonLdObjects.map((object) => object["@type"]), ["Article", "BreadcrumbList"]);
  assert.deepEqual(contract.trackedEvents, ["guide_book_direct_click", "email_capture_submit"]);
  assert.deepEqual(contract.templateLeakMarkers, ["{{"]);
  assert.deepEqual(contract.standaloneShellMarkers, []);
  assert.equal(contract.pathFacts.isGuide, true);
});

test("assertRequiredHeadTags fails loud with route context", () => {
  assert.throws(
    () => assertRequiredHeadTags({ routePath: "/broken/", head: { title: "Only title" } }),
    /\/broken\/ missing required head tag: description/
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test scripts/enforcement/rendered-route-contract.test.js
```

Expected: FAIL with `Cannot find module './rendered-route-contract'`.

## Task 2: Implement The Rendered Route Contract Module

**Files:**
- Create: `scripts/enforcement/rendered-route-contract.js`
- Test: `scripts/enforcement/rendered-route-contract.test.js`

- [ ] **Step 1: Add the Module implementation**

Create `scripts/enforcement/rendered-route-contract.js`:

```js
const fs = require("fs");
const path = require("path");
const {
  findStandaloneShellMarkers,
  findTemplateLeakMarkers
} = require("./lib");

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function findFirst(html, pattern) {
  const match = String(html || "").match(pattern);
  return match ? decodeHtmlAttribute(match[1]) : null;
}

function extractHeadTags(html) {
  return {
    title: findFirst(html, /<title>([\s\S]*?)<\/title>/i),
    description: findFirst(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i),
    canonical: findFirst(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["'][^>]*>/i),
    robots: findFirst(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["'][^>]*>/i),
    ogTitle: findFirst(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["'][^>]*>/i),
    ogDescription: findFirst(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["'][^>]*>/i),
    twitterTitle: findFirst(html, /<meta\s+name=["']twitter:title["']\s+content=["']([^"']*)["'][^>]*>/i),
    twitterDescription: findFirst(html, /<meta\s+name=["']twitter:description["']\s+content=["']([^"']*)["'][^>]*>/i)
  };
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(String(html || ""))) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

function extractJsonLdObjects(html) {
  return extractJsonLdBlocks(html).flatMap((block) => {
    const parsed = JSON.parse(block);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

function extractTrackedEvents(html) {
  const events = [];
  const patterns = [
    /\bdata-track-event=["']([^"']+)["']/gi,
    /\bdata-form-submit-event=["']([^"']+)["']/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(String(html || ""))) !== null) {
      events.push(match[1]);
    }
  }

  return [...new Set(events)];
}

function normalizeRoutePath(routePath) {
  const value = String(routePath || "/").trim();
  if (!value || value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function extractRoutePathFacts(routePath) {
  const normalized = normalizeRoutePath(routePath);
  const parts = normalized.split("/").filter(Boolean);
  const slug = normalized === "/" ? "home" : parts[parts.length - 1] || "home";

  return {
    isHomepage: normalized === "/",
    isGuide: normalized.startsWith("/guides/"),
    isStay: normalized.startsWith("/stays/"),
    isOwner: normalized.startsWith("/property-management/"),
    isProperty: normalized.startsWith("/properties/"),
    slug
  };
}

function buildRouteContract({ html, routePath = "/", sourcePath = null } = {}) {
  const contents = String(html || "");
  const normalizedRoutePath = normalizeRoutePath(routePath);

  return {
    routePath: normalizedRoutePath,
    sourcePath,
    head: extractHeadTags(contents),
    jsonLdBlocks: extractJsonLdBlocks(contents),
    jsonLdObjects: extractJsonLdObjects(contents),
    trackedEvents: extractTrackedEvents(contents),
    templateLeakMarkers: findTemplateLeakMarkers(contents),
    standaloneShellMarkers: findStandaloneShellMarkers(contents),
    pathFacts: extractRoutePathFacts(normalizedRoutePath)
  };
}

function readRouteSource(projectRoot, relativePath) {
  const fullPath = path.join(projectRoot, relativePath);
  return buildRouteContract({
    html: fs.readFileSync(fullPath, "utf8"),
    routePath: routePathFromSourcePath(relativePath),
    sourcePath: relativePath
  });
}

function readBuiltRoute(projectRoot, routePath) {
  const normalized = normalizeRoutePath(routePath);
  const builtPath = normalized === "/"
    ? path.join(projectRoot, "_site", "index.html")
    : path.join(projectRoot, "_site", normalized, "index.html");

  return buildRouteContract({
    html: fs.readFileSync(builtPath, "utf8"),
    routePath: normalized,
    sourcePath: path.relative(projectRoot, builtPath)
  });
}

function routePathFromSourcePath(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (normalized === "src/index.njk") return "/";
  if (normalized.endsWith("/index.njk") || normalized.endsWith("/index.html")) {
    return `/${normalized.replace(/^src\//, "").replace(/\/index\.(njk|html)$/, "")}/`;
  }
  return `/${normalized.replace(/^src\//, "").replace(/\.(njk|html|md)$/, "")}/`;
}

function assertRequiredHeadTags(contract, required = ["title", "description", "canonical"]) {
  for (const field of required) {
    if (!normalizeText(contract?.head?.[field])) {
      throw new Error(`${contract?.routePath || "unknown route"} missing required head tag: ${field}`);
    }
  }
}

module.exports = {
  assertRequiredHeadTags,
  buildRouteContract,
  extractHeadTags,
  extractJsonLdBlocks,
  extractJsonLdObjects,
  extractRoutePathFacts,
  extractTrackedEvents,
  readBuiltRoute,
  readRouteSource,
  routePathFromSourcePath
};
```

- [ ] **Step 2: Run the new tests**

Run:

```bash
node --test scripts/enforcement/rendered-route-contract.test.js
```

Expected: PASS.

- [ ] **Step 3: Run the existing helper tests**

Run:

```bash
node --test scripts/enforcement/lib.test.js scripts/enforcement/rendered-route-contract.test.js
```

Expected: PASS.

## Task 3: Add Built-Route And Source-Route Coverage

**Files:**
- Modify: `scripts/enforcement/rendered-route-contract.test.js`

- [ ] **Step 1: Extend tests with current source and built-route checks**

Append this to `scripts/enforcement/rendered-route-contract.test.js`:

```js
const fs = require("fs");
const path = require("path");

const {
  readBuiltRoute,
  readRouteSource,
  routePathFromSourcePath
} = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");

test("routePathFromSourcePath maps source files to public routes", () => {
  assert.equal(routePathFromSourcePath("src/index.njk"), "/");
  assert.equal(routePathFromSourcePath("src/guides/bradenton-vs-sarasota.html"), "/guides/bradenton-vs-sarasota/");
  assert.equal(routePathFromSourcePath("src/properties/dockside-dreams/index.njk"), "/properties/dockside-dreams/");
});

test("readRouteSource builds a source contract for a current guide", () => {
  const contract = readRouteSource(projectRoot, "src/guides/bradenton-vs-sarasota.html");

  assert.equal(contract.routePath, "/guides/bradenton-vs-sarasota/");
  assert.equal(contract.sourcePath, "src/guides/bradenton-vs-sarasota.html");
  assert.equal(contract.head.title, "Bradenton vs Sarasota for Vacation: Which Base Wins?");
  assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/bradenton-vs-sarasota/");
  assert.equal(contract.pathFacts.isGuide, true);
});

test("readBuiltRoute builds a route contract after the site is built", () => {
  const builtHomepage = path.join(projectRoot, "_site", "index.html");
  if (!fs.existsSync(builtHomepage)) {
    assert.fail("_site/index.html missing. Run npm run build before this built-route assertion.");
  }

  const contract = readBuiltRoute(projectRoot, "/");

  assert.equal(contract.routePath, "/");
  assert.equal(contract.pathFacts.isHomepage, true);
  assertRequiredHeadTags(contract);
  assert.equal(contract.templateLeakMarkers.length, 0);
  assert.equal(contract.standaloneShellMarkers.length, 0);
});
```

- [ ] **Step 2: Run before build to observe the intended failure if `_site` is absent**

Run:

```bash
rm -rf _site
node --test scripts/enforcement/rendered-route-contract.test.js
```

Expected: FAIL with `_site/index.html missing. Run npm run build before this built-route assertion.`

- [ ] **Step 3: Build then run the tests**

Run:

```bash
npm run build
node --test scripts/enforcement/rendered-route-contract.test.js
```

Expected: PASS.

## Task 4: Refactor Metadata Tests To Use The Route Contract Interface

**Files:**
- Modify: `scripts/enforcement/metadata-integrity.test.js`
- Test: `scripts/enforcement/metadata-integrity.test.js`

- [ ] **Step 1: Replace local source/meta helpers**

In `scripts/enforcement/metadata-integrity.test.js`, replace:

```js
function readSource(...parts) {
  return fs.readFileSync(path.join(projectRoot, ...parts), "utf8");
}

function findMetaContent(source, pattern) {
  const match = source.match(pattern);
  return match ? match[1] : null;
}
```

with:

```js
const {
  assertRequiredHeadTags,
  readRouteSource
} = require("./rendered-route-contract");

function readSource(...parts) {
  return fs.readFileSync(path.join(projectRoot, ...parts), "utf8");
}

function readSourceContract(...parts) {
  return readRouteSource(projectRoot, path.join(...parts));
}
```

- [ ] **Step 2: Refactor the anna-maria-city head-tag test**

Replace the first test body with:

```js
test("anna-maria-city ships parseable primary head tags", () => {
  const contract = readSourceContract("src", "guides", "anna-maria-city.html");
  assertRequiredHeadTags(contract);

  assert.equal(contract.head.title, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(
    contract.head.description,
    "Discover Anna Maria City at the northern tip of Anna Maria Island — secluded Bean Point, the historic Rod & Reel Pier, Pine Avenue shops, and vacation rentals. AMI's quietest gem."
  );
  assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/anna-maria-city/");
  assert.equal(contract.head.ogTitle, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(contract.head.ogDescription, "AMI's quietest gem — Bean Point, Rod & Reel Pier, and true Old Florida.");
});
```

- [ ] **Step 3: Refactor the rainy-day guide metadata reads**

Inside the rainy-day test, replace the local `title`, `description`, `canonical`, `ogTitle`, `ogDescription`, and `twitterTitle` extraction with:

```js
const contract = readSourceContract("src", "guides", "rainy-day-activities-bradenton-sarasota.html");
const source = readSource("src", "guides", "rainy-day-activities-bradenton-sarasota.html");

assertRequiredHeadTags(contract);
assert.equal(contract.head.title, "Rainy Day Activities in Sarasota & Bradenton");
assert.equal(
  contract.head.description,
  "Rain in Sarasota or Bradenton? Compare indoor picks: Mote SEA, The Ringling, Sarasota Art Museum, arcades, shopping, and AMI backup plans."
);
assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/rainy-day-activities-bradenton-sarasota/");
assert.equal(contract.head.ogTitle, contract.head.title);
assert.equal(contract.head.ogDescription, contract.head.description);
assert.equal(contract.head.twitterTitle, contract.head.title);
```

Keep the remaining body assertions unchanged.

- [ ] **Step 4: Refactor the winner guide metadata reads**

Inside the winner guide test, add:

```js
const amiContract = readSourceContract("src", "guides", "anna-maria-island-vs-siesta-key.html");
const bradentonContract = readSourceContract("src", "guides", "bradenton-vs-sarasota.html");
```

Replace `findMetaContent(...)` title/description/OG assertions with `amiContract.head.*` and `bradentonContract.head.*`. Keep visible-copy and date assertions against `amiVsSiesta` and `bradentonVsSarasota`.

- [ ] **Step 5: Run metadata and route contract tests**

Run:

```bash
node --test scripts/enforcement/rendered-route-contract.test.js scripts/enforcement/metadata-integrity.test.js
```

Expected: PASS after `npm run build` has created `_site`.

## Task 5: Use The Route Contract For Static Tracking Assertions

**Files:**
- Modify: `scripts/enforcement/direct-booking-event-smoke.test.js`
- Test: `scripts/enforcement/direct-booking-event-smoke.test.js`

- [ ] **Step 1: Import the contract helper**

Add this near the top of `scripts/enforcement/direct-booking-event-smoke.test.js`:

```js
const {
  buildRouteContract
} = require("./rendered-route-contract");
```

- [ ] **Step 2: Replace event string matching in the homepage/popup test**

In the `homepage and shared popup partial use the tracked email capture path` test, after reading `homepage` and `popupPartial`, add:

```js
const homepageContract = buildRouteContract({
  html: homepage,
  routePath: "/",
  sourcePath: "src/index.njk"
});
const popupContract = buildRouteContract({
  html: popupPartial,
  routePath: "/partials/email-popup/",
  sourcePath: "src/_includes/partials/email-popup.njk"
});
```

Then replace the `data-form-submit-event` assertions with:

```js
assert.ok(homepageContract.trackedEvents.includes("email_capture_submit"));
assert.ok(popupContract.trackedEvents.includes("email_capture_submit"));
```

Keep the `data-track-form`, `data-inline-email-capture`, success markup, and legacy handler assertions unchanged because those are specific markup contracts, not route facts.

- [ ] **Step 3: Run the focused tests**

Run:

```bash
node --test scripts/enforcement/rendered-route-contract.test.js scripts/enforcement/direct-booking-event-smoke.test.js
```

Expected: PASS after `npm run build` has created `_site`.

## Task 6: Protect Phase 1A Scope

**Files:**
- Inspect only: `scripts/enforcement/page-family-inventory.js`
- Inspect only: `docs/superpowers/specs/2026-05-19-route-domain-truth-architecture-roadmap.md`

- [ ] **Step 1: Confirm page-family inventory was not modified**

Run:

```bash
git diff --name-only
```

Expected output includes only:

```text
scripts/enforcement/direct-booking-event-smoke.test.js
scripts/enforcement/metadata-integrity.test.js
scripts/enforcement/rendered-route-contract.js
scripts/enforcement/rendered-route-contract.test.js
```

If `scripts/enforcement/page-family-inventory.js`, `docs/portfolio/`, `src/_data/seoPages.json`, `src/_redirects`, or public source pages appear, stop and split that work into Phase 1B or another owning workflow.

- [ ] **Step 2: Confirm no generated output is staged**

Run:

```bash
git status --short
```

Expected: no `_site/` staged or unstaged entries that will be committed.

## Task 7: Full Verification And Commit

**Files:**
- All files changed in Tasks 1-5

- [ ] **Step 1: Run build and focused tests**

Run:

```bash
npm run build
node --test scripts/enforcement/rendered-route-contract.test.js scripts/enforcement/metadata-integrity.test.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/lib.test.js
```

Expected: PASS.

- [ ] **Step 2: Run the repo test suite**

Run:

```bash
npm test
```

Expected: PASS. If it fails because `@netlify/blobs` is missing, first verify `package-lock.json` and `node_modules/@netlify/blobs` state. Do not edit code to work around a missing install; run `npm install` only if dependency state is stale against `package-lock.json`.

- [ ] **Step 3: Run property truth check**

Run:

```bash
npm run property:truth:check
```

Expected: `Property truth surfaces already match src/_data/properties-fallback.json`.

- [ ] **Step 4: Run merge check**

Run:

```bash
npm run git:merge-check
```

Expected: PASS. If merge-check fails on baseline environment setup, capture the exact failing tests and do not claim the branch is merge-ready.

- [ ] **Step 5: Review source-only diff**

Run:

```bash
git diff --stat
git diff -- scripts/enforcement/rendered-route-contract.js scripts/enforcement/rendered-route-contract.test.js scripts/enforcement/metadata-integrity.test.js scripts/enforcement/direct-booking-event-smoke.test.js
```

Expected: only the Module and narrow test refactors.

- [ ] **Step 6: Commit through guardrails**

Run:

```bash
/Users/sawbeck/bin/guardrail-safe-commit --stage-source -m "test: add rendered route contract module"
```

Expected: one commit, source-only, no generated output staged.

- [ ] **Step 7: Push and open PR**

Run:

```bash
git push -u origin codex/rendered-route-contract
gh pr create --base main --head codex/rendered-route-contract --title "Add rendered route contract module" --body "## Summary
- Adds a rendered route contract Module for route head tags, JSON-LD, tracked events, path facts, and leak markers
- Refactors narrow metadata/tracking tests to use the shared Interface
- Leaves page-family inventory for Phase 1B

## Verification
- npm run build
- node --test scripts/enforcement/rendered-route-contract.test.js scripts/enforcement/metadata-integrity.test.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/lib.test.js
- npm test
- npm run property:truth:check
- npm run git:merge-check"
```

Expected: PR opened against `main`.

## Self-Review

- This plan implements only Phase 1A.
- Page-family inventory is explicitly out of scope.
- Public copy, redirects, schema content, visual design, deployment, and generated `_site` output are out of scope.
- Tests are written before implementation.
- Every changed code path has concrete commands and expected outcomes.
