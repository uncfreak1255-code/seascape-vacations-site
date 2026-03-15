# Site Recovery Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore one repo-owned build/deploy path for the homepage, guides, stays, and property-management pages while fixing the live homepage JS failure, the `/property-management/` redirect loop, the priority-guide metadata defects, and the highest-value schema/performance problems on the audited priority pages.

**Architecture:** Consolidate production around Eleventy output in `_site`. Replace the root homepage passthrough with a `src`-owned homepage, create a real `/property-management/` landing page plus repo-owned redirects, import legacy guides into `src/guides/` as authoritative static content, and add script-based build/live verification so every "fixed" claim is backed by evidence instead of guesswork.

**Tech Stack:** Eleventy 3, Nunjucks, static HTML, Netlify hosting/functions, Node verification scripts, `curl`, and targeted Lighthouse/Playwright smoke checks.

---

## Current Repo Reality

These facts are already observable and the plan depends on them:

- `eleventy.config.js` currently passes the root `index.html` straight through to `_site/index.html`.
- `src/stays/stays.njk` and `src/property-management/property-management.njk` already generate the pSEO money pages in `_site/`.
- `_site/guides/` does not exist today, but production guide URLs do exist, which means guide authority is living outside the current Eleventy build path.
- `DEPLOY THIS FOLDER TO NETLIFY/_redirects` contains the legacy redirect rules, including the `/property-management -> /property-management/` canonicalization that is contributing to the live loop.
- `src/robots.txt` is cleaner than the live robots behavior audited on 2026-03-15, which confirms production drift.

## File Structure

### Files To Create

- `src/index.njk`
  Purpose: authoritative homepage source replacing the root passthrough homepage.
- `src/property-management/index.njk`
  Purpose: real landing page for `/property-management/` so the route family has a canonical parent page.
- `src/_redirects`
  Purpose: repo-owned Netlify redirects replacing the legacy deploy-folder-only redirect source.
- `src/llms.txt`
  Purpose: repo-owned AI crawler guidance file served independently from `robots.txt`.
- `src/guides/`
  Purpose: authoritative home for existing guide HTML files copied from the legacy export path.
- `scripts/recovery/assert-build-output.js`
  Purpose: local build assertions for the recovery phases.
- `scripts/recovery/assert-live-smoke.js`
  Purpose: production smoke checks after deploy.
- `src/_includes/partials/deferred-meta-pixel.njk`
  Purpose: shared non-blocking Meta Pixel snippet used by priority templates.
- `src/_includes/partials/property-card-image.njk`
  Purpose: shared responsive image markup for stay/property cards.
- `docs/source-of-truth.md`
  Purpose: short operational note documenting editable paths, generated paths, build command, and deploy path.

### Files To Modify

- `eleventy.config.js`
  Purpose: remove the root homepage passthrough, add passthrough copy for `src/_redirects`, `src/llms.txt`, and raw guide HTML under `src/guides/`, and add recovery filters.
- `package.json`
  Purpose: add explicit recovery verification scripts.
- `src/stays/stays.njk`
  Purpose: switch to shared image markup, sanitize FAQ schema output, fix owner-route links, and defer Meta Pixel.
- `src/property-management/property-management.njk`
  Purpose: sanitize FAQ schema output, fix owner-route links, and defer Meta Pixel.
- `src/_includes/layouts/base.njk`
  Purpose: normalize nav/footer owner links to `/property-management/`.
- `src/_data/site.json`
  Purpose: update `dateUpdated` when recovery ships.
- `src/robots.txt`
  Purpose: keep the repo-owned valid robots file as the production source.
- `CLAUDE.md`
  Purpose: replace stale deploy guidance that still points agents at `DEPLOY THIS FOLDER TO NETLIFY`.
- `AGENTS.md`
  Purpose: record concise architecture patterns, known gotchas, and recovery learnings.
- `src/guides/anna-maria-island-area-guide/index.html`
  Purpose: fix the priority guide page’s canonical/OG/schema/breadcrumb/link defects after import.

### Legacy Paths To Deprecate But Not Blindly Delete

- `index.html`
  Status after recovery: legacy reference file only; no longer publish-authoritative.
- `DEPLOY THIS FOLDER TO NETLIFY/`
  Status after recovery: archival source for imported legacy content only; do not deploy from here again.
- top-level `stays/` and `property-management/`
  Status after recovery: legacy copies; repo-owned production authority lives in `src/` + `_site/`.

## Verification Rules

- All local verification runs from the repo root.
- Use `npm run build` as the single local build command.
- Use `node scripts/recovery/assert-build-output.js <phase>` for phase-local assertions.
- Use `node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com` for production smoke checks.
- Do not deploy until all local checks for the active phase pass.

## Chunk 1: P0 Proof And Route/Homepage Ownership

### Task 1: Create the recovery verification harness

**Files:**
- Create: `scripts/recovery/assert-build-output.js`
- Create: `scripts/recovery/assert-live-smoke.js`
- Modify: `package.json`

- [ ] **Step 1: Create an isolated worktree and branch**

Run:

```bash
git worktree add ../seascape-site-recovery -b codex/site-recovery
```

Expected: a new worktree exists at `../seascape-site-recovery` and the current branch is `codex/site-recovery` inside that worktree.

- [ ] **Step 2: Write the build-assertion script with phase-aware checks**

Create `scripts/recovery/assert-build-output.js` with this structure:

```js
const fs = require("fs");
const path = require("path");

const phase = process.argv[2] || "p0";

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function expectExists(file) {
  if (!fs.existsSync(path.resolve(file))) {
    throw new Error(`Missing expected file: ${file}`);
  }
}

function expectNotContains(file, needle) {
  const contents = read(file);
  if (contents.includes(needle)) {
    throw new Error(`Unexpected content in ${file}: ${needle}`);
  }
}

function expectContains(file, needle) {
  const contents = read(file);
  if (!contents.includes(needle)) {
    throw new Error(`Missing expected content in ${file}: ${needle}`);
  }
}

if (phase === "p0") {
  expectExists("_site/index.html");
  expectExists("_site/property-management/index.html");
  expectNotContains("eleventy.config.js", 'addPassthroughCopy({"index.html": "index.html"})');
  expectNotContains("_site/index.html", "wp-content/uploads/2025/03/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2.jpg");
  expectContains("_site/index.html", "Partner With Seascape Vacations");
  expectContains("_site/property-management/index.html", "Property Management");
}

if (phase === "guides") {
  expectExists("_site/guides/anna-maria-island-area-guide/index.html");
  expectExists("_site/llms.txt");
  expectExists("_site/_redirects");
  expectNotContains("_site/_redirects", "/property-management   /property-management/   301");
}

if (phase === "remediation") {
  expectNotContains("_site/stays/anna-maria-island-vacation-rentals/index.html", '"text": "Manatee Public Beach in <a href=');
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "srcset=");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'width="800"');
  expectNotContains("_site/property-management/vacation-rental-management-sarasota/index.html", "/property-owners/");
  expectNotContains("_site/robots.txt", "LLMs-txt:");
}

console.log(`assert-build-output: ${phase} checks passed`);
```

- [ ] **Step 3: Write the live smoke script**

Create `scripts/recovery/assert-live-smoke.js` with this structure:

```js
const https = require("https");

const baseUrl = process.argv[2];
if (!baseUrl) throw new Error("Usage: node scripts/recovery/assert-live-smoke.js <base-url>");

const targets = [
  { path: "/", status: 200 },
  { path: "/property-management/", status: 200 },
  { path: "/stays/anna-maria-island-vacation-rentals/", status: 200 },
  { path: "/property-management/vacation-rental-management-sarasota/", status: 200 },
  { path: "/guides/anna-maria-island-area-guide/", status: 200 },
  { path: "/property-owners/", status: 301 }
];

function check(target) {
  return new Promise((resolve, reject) => {
    https.get(`${baseUrl}${target.path}`, (res) => {
      if (res.statusCode !== target.status) {
        reject(new Error(`${target.path} expected ${target.status}, got ${res.statusCode}`));
        return;
      }
      resolve();
    }).on("error", reject);
  });
}

Promise.all(targets.map(check))
  .then(() => console.log("assert-live-smoke: all targets passed"))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
```

- [ ] **Step 4: Add package scripts**

Update `package.json`:

```json
{
  "scripts": {
    "build": "npx @11ty/eleventy",
    "build:prod": "NODE_ENV=production npx @11ty/eleventy",
    "verify:recovery:p0": "node scripts/recovery/assert-build-output.js p0",
    "verify:recovery:guides": "node scripts/recovery/assert-build-output.js guides",
    "verify:recovery:remediation": "node scripts/recovery/assert-build-output.js remediation",
    "verify:recovery:live": "node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com"
  }
}
```

- [ ] **Step 5: Run the failing P0 baseline**

Run:

```bash
npm run build
npm run verify:recovery:p0
```

Expected: `npm run build` succeeds, then `npm run verify:recovery:p0` fails because `_site/property-management/index.html` does not exist and `eleventy.config.js` still passes through the root homepage.

### Task 2: Move homepage ownership into `src/` and create the real `/property-management/` landing page

**Files:**
- Create: `src/index.njk`
- Create: `src/property-management/index.njk`
- Modify: `eleventy.config.js`
- Modify: `src/_includes/layouts/base.njk`
- Modify: `src/stays/stays.njk`
- Modify: `src/property-management/property-management.njk`

- [ ] **Step 1: Copy the homepage source into the Eleventy input tree**

Run:

```bash
cp index.html src/index.njk
```

Expected: `src/index.njk` exists and contains the current homepage markup/JS as the starting point.

- [ ] **Step 2: Remove the root homepage passthrough and add source-owned passthrough entries**

Replace the passthrough section in `eleventy.config.js` with:

```js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("netlify");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "src/guides": "guides" });
  // filters remain below
};
```

Do not keep this line:

```js
eleventyConfig.addPassthroughCopy({"index.html": "index.html"});
```

- [ ] **Step 3: Replace the known broken homepage CTA background**

In `src/index.njk`, replace:

```html
style="background-image:url('https://seascape-vacations.com/wp-content/uploads/2025/03/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2.jpg')"
```

with:

```html
style="background-image:url('/images/sarasota-sunset-hero.jpg')"
```

- [ ] **Step 4: Create the `/property-management/` landing page**

Create `src/property-management/index.njk` using the existing property-management visual system, with:

```njk
---
layout: layouts/base.njk
permalink: "/property-management/"
pageTitle: "Vacation Rental Property Management | Seascape Vacations"
pageDescription: "Full-service vacation rental property management for owners in Bradenton, Sarasota, Anna Maria Island, Siesta Key, and Longboat Key."
---
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><span>›</span></li>
    <li><span aria-current="page">Property Management</span></li>
  </ol>
</nav>

<section class="section" style="background: linear-gradient(135deg, var(--brand-dark) 0%, #1a3a3c 100%); color: white;">
  <div class="container" style="text-align: center;">
    <p class="section-tag" style="color: var(--gold);">For Property Owners</p>
    <h1 style="font-size: clamp(32px, 5vw, 48px); margin-bottom: 20px; color: white;">Vacation Rental Property Management</h1>
    <p style="max-width: 700px; margin: 0 auto; opacity: 0.9; font-size: 18px;">Local, full-service management for Gulf Coast vacation rentals with hands-on guest support, revenue strategy, and owner reporting.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="properties-grid">
      <a class="property-card" href="/property-management/vacation-rental-management-sarasota/">
        <div class="property-body">
          <h2 class="property-title">Sarasota Property Management</h2>
          <p class="property-meta">Owner services for Sarasota vacation rentals</p>
        </div>
      </a>
      <a class="property-card" href="/property-management/vacation-rental-management-bradenton/">
        <div class="property-body">
          <h2 class="property-title">Bradenton Property Management</h2>
          <p class="property-meta">Local operations, guest support, and revenue optimization</p>
        </div>
      </a>
      <a class="property-card" href="/property-management/vacation-rental-management-anna-maria-island/">
        <div class="property-body">
          <h2 class="property-title">Anna Maria Island Property Management</h2>
          <p class="property-meta">Management support for AMI-area owners</p>
        </div>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Normalize owner links**

Replace every `/property-owners/` link in these files with `/property-management/`:

- `src/_includes/layouts/base.njk`
- `src/stays/stays.njk`
- `src/property-management/property-management.njk`

Expected replacements include:

```html
<a href="/property-management/">Property Owners</a>
<a href="/property-management/" class="btn btn-gold">Get Your Free Evaluation →</a>
```

- [ ] **Step 6: Rebuild and verify P0 ownership**

Run:

```bash
npm run build
npm run verify:recovery:p0
```

Expected: both commands succeed and `assert-build-output: p0 checks passed` prints.

- [ ] **Step 7: Commit the P0 ownership changes**

Run:

```bash
git add package.json eleventy.config.js src/index.njk src/property-management/index.njk src/_includes/layouts/base.njk src/stays/stays.njk src/property-management/property-management.njk scripts/recovery/assert-build-output.js scripts/recovery/assert-live-smoke.js
git commit -m "fix: move homepage and owner landing into src"
```

## Chunk 2: Guide Authority And Redirect Ownership

### Task 3: Import the live guide corpus and `llms.txt` into `src/`

**Files:**
- Create: `src/guides/` (all imported guide files preserving paths)
- Create: `src/llms.txt`
- Create: `src/_redirects`

- [ ] **Step 1: Extend the build assertions for guide ownership**

Add these checks to the `guides` phase in `scripts/recovery/assert-build-output.js` if they are not already present:

```js
expectExists("_site/guides/anna-maria-island-area-guide/index.html");
expectExists("_site/llms.txt");
expectExists("_site/_redirects");
expectContains("_site/guides/anna-maria-island-area-guide/index.html", '<link rel="canonical" href="https://seascape-vacations.com/guides/anna-maria-island-area-guide/">');
```

- [ ] **Step 2: Run the failing guide baseline**

Run:

```bash
npm run build
npm run verify:recovery:guides
```

Expected: `npm run verify:recovery:guides` fails because `_site/guides/anna-maria-island-area-guide/index.html`, `_site/llms.txt`, and `_site/_redirects` do not exist yet.

- [ ] **Step 3: Import the legacy guide tree into `src/guides/`**

Run:

```bash
mkdir -p src/guides
rsync -a "DEPLOY THIS FOLDER TO NETLIFY/guides/" "src/guides/"
cp "DEPLOY THIS FOLDER TO NETLIFY/llms.txt" src/llms.txt
cp "DEPLOY THIS FOLDER TO NETLIFY/_redirects" src/_redirects
```

Expected: `src/guides/`, `src/llms.txt`, and `src/_redirects` now exist in the authoritative source tree.

- [ ] **Step 4: Remove the redirect loop source from `src/_redirects`**

Delete this line from `src/_redirects`:

```text
/property-management   /property-management/   301
```

Keep these aliases:

```text
/property-owners   /property-management/   301
/property-owners/*   /property-management/   301
```

If any other redirect has identical source and target after Netlify normalization, remove it in the same edit.

- [ ] **Step 5: Rebuild and verify guide ownership**

Run:

```bash
npm run build
npm run verify:recovery:guides
```

Expected: both commands succeed and `assert-build-output: guides checks passed` prints.

### Task 4: Repair the priority guide page from the new source-of-truth location

**Files:**
- Modify: `src/guides/anna-maria-island-area-guide/index.html`

- [ ] **Step 1: Add failing assertions for the priority guide defects**

Extend the `guides` phase in `scripts/recovery/assert-build-output.js` with:

```js
expectNotContains("_site/guides/anna-maria-island-area-guide/index.html", 'content="https://seascape-vacations.com/area-guide-ami"');
expectNotContains("_site/guides/anna-maria-island-area-guide/index.html", 'href=/guides/best-time-visit-anna-maria-island');
expectNotContains("_site/guides/anna-maria-island-area-guide/index.html", 'href=/stays/anna-maria-island-homes-with-pool/"');
```

- [ ] **Step 2: Fix canonical, OG, and schema URLs**

In `src/guides/anna-maria-island-area-guide/index.html`, replace every stale `/area-guide-ami` identity with the live canonical route:

```html
<link rel="canonical" href="https://seascape-vacations.com/guides/anna-maria-island-area-guide/">
<meta property="og:url" content="https://seascape-vacations.com/guides/anna-maria-island-area-guide/">
```

And in JSON-LD:

```json
"url": "https://seascape-vacations.com/guides/anna-maria-island-area-guide/"
```

- [ ] **Step 3: Fix malformed links and breadcrumb targets**

Make these exact corrections in `src/guides/anna-maria-island-area-guide/index.html`:

```html
<a href="/guides/best-time-to-visit-anna-maria-island/">Best Time to Visit Anna Maria Island</a>
<a href="/guides/best-restaurants-anna-maria-island.html">Best Restaurants on Anna Maria Island</a>
<a href="/stays/anna-maria-island-homes-with-pool/">Anna Maria Island Homes With Pool</a>
```

If the page’s breadcrumb "Home" or "Guides" links point at the current page or a fragment, replace them with:

```html
<a href="/">Home</a>
<a href="/guides/">Guides</a>
```

- [ ] **Step 4: Rebuild and verify the guide page**

Run:

```bash
npm run build
npm run verify:recovery:guides
```

Expected: both commands succeed and no stale `/area-guide-ami` or malformed hrefs remain in `_site/guides/anna-maria-island-area-guide/index.html`.

- [ ] **Step 5: Commit the guide authority changes**

Run:

```bash
git add src/guides src/llms.txt src/_redirects scripts/recovery/assert-build-output.js
git commit -m "fix: import guides and repo-owned redirects into src"
```

## Chunk 3: Priority Page Remediation, Governance, And Deploy

### Task 5: Sanitize structured data and clean the priority page render path

**Files:**
- Create: `src/_includes/partials/deferred-meta-pixel.njk`
- Create: `src/_includes/partials/property-card-image.njk`
- Modify: `eleventy.config.js`
- Modify: `src/stays/stays.njk`
- Modify: `src/property-management/property-management.njk`
- Modify: `src/_data/site.json`
- Modify: `src/robots.txt`

- [ ] **Step 1: Add failing remediation assertions**

Extend the `remediation` phase in `scripts/recovery/assert-build-output.js` with:

```js
expectNotContains("_site/stays/anna-maria-island-vacation-rentals/index.html", '"text": "Manatee Public Beach in <a href=');
expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", "srcset=");
expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'width="800"');
expectNotContains("_site/property-management/vacation-rental-management-sarasota/index.html", "!function (f, b, e, v, n, t, s) {");
expectNotContains("_site/robots.txt", "LLMs-txt:");
```

Note: the Meta Pixel check is specifically for the old eager inline loader signature. The deferred partial may still reference `fbevents.js` inside the lazy loader.

- [ ] **Step 2: Add the reusable filters and partials**

In `eleventy.config.js`, add:

```js
eleventyConfig.addFilter("stripHtml", function(input) {
  return String(input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
});

eleventyConfig.addFilter("imgProxy", function(url, width = 800) {
  const clean = String(url || "").replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=${width}&output=webp&q=82`;
});
```

Create `src/_includes/partials/deferred-meta-pixel.njk`:

```html
<script>
!function(){function e(){var e,n,t,o,a,d;window.__seascapeMetaPixelLoaded||(window.__seascapeMetaPixelLoaded=!0,e=window,n=document,t="script",e.fbq||(o=e.fbq=function(){o.callMethod?o.callMethod.apply(o,arguments):o.queue.push(arguments)},e._fbq||(e._fbq=o),o.push=o,o.loaded=!0,o.version="2.0",o.queue=[],(a=n.createElement(t)).async=!0,a.src="https://connect.facebook.net/en_US/fbevents.js",(d=n.getElementsByTagName(t)[0]).parentNode.insertBefore(a,d)),fbq("init","2748551298816267"),fbq("track","PageView"))}window.addEventListener("pointerdown",e,{once:!0,passive:!0}),window.addEventListener("keydown",e,{once:!0}),window.addEventListener("scroll",e,{once:!0,passive:!0})}();
</script>
```

Create `src/_includes/partials/property-card-image.njk`:

```njk
<div class="property-img">
  <img
    src="{{ property.image | imgProxy(800) }}"
    srcset="{{ property.image | imgProxy(400) }} 400w, {{ property.image | imgProxy(800) }} 800w, {{ property.image | imgProxy(1200) }} 1200w"
    sizes="(min-width: 1100px) 33vw, (min-width: 768px) 50vw, 100vw"
    width="800"
    height="533"
    loading="{{ loading | default('lazy') }}"
    decoding="async"
    alt="{{ property.name }} - {{ property.specs }} vacation rental in {{ property.city }}, Florida">
  {% if badge %}
  <span class="property-badge">{{ badge }}</span>
  {% endif %}
</div>
```

- [ ] **Step 3: Replace synchronous schema/image usage in `src/stays/stays.njk`**

Make these exact changes:

1. Replace the eager Meta Pixel block with:

```njk
{% include "partials/deferred-meta-pixel.njk" %}
```

2. Replace FAQ JSON-LD answers with:

```njk
"text": "{{ faq.answer | stripHtml | escape }}"
```

3. Replace the property image block:

```njk
<div class="property-img" style="background-image: url('{{ property.image }}')">
  <img src="{{ property.image }}" alt="{{ property.name }} - {{ property.specs }} vacation rental in {{ property.city }}, Florida" loading="lazy" style="position:absolute;width:100%;height:100%;object-fit:cover;top:0;left:0;">
```

with:

```njk
{% include "partials/property-card-image.njk", property=property, badge=property.tags[0], loading=(loop.index == 1 ? "eager" : "lazy") %}
```

- [ ] **Step 4: Replace synchronous schema/link usage in `src/property-management/property-management.njk`**

Make these exact changes:

1. Replace the eager Meta Pixel block with:

```njk
{% include "partials/deferred-meta-pixel.njk" %}
```

2. Replace FAQ JSON-LD answers with:

```njk
"acceptedAnswer": { "@type": "Answer", "text": "{{ faq.a | stripHtml | escape }}" }
```

3. Ensure all owner CTAs and breadcrumbs use `/property-management/`, not `/property-owners/`.

- [ ] **Step 5: Keep repo-owned robots clean and stamp the release date**

1. Confirm `src/robots.txt` does not contain `LLMs-txt:`.
2. Update `src/_data/site.json`:

```json
"dateUpdated": "2026-03-15"
```

- [ ] **Step 6: Rebuild and verify remediation**

Run:

```bash
npm run build
npm run verify:recovery:remediation
```

Expected: both commands succeed and the FAQ/schema/image/robots assertions pass.

- [ ] **Step 7: Commit the remediation changes**

Run:

```bash
git add eleventy.config.js src/_includes/partials/deferred-meta-pixel.njk src/_includes/partials/property-card-image.njk src/stays/stays.njk src/property-management/property-management.njk src/_data/site.json src/robots.txt scripts/recovery/assert-build-output.js
git commit -m "fix: remediate schema and render path on priority pages"
```

### Task 6: Update governance files so future agents stop using the broken workflow

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`
- Create: `docs/source-of-truth.md`

- [ ] **Step 1: Replace stale deploy guidance in `CLAUDE.md`**

Update the project facts so they say:

```md
| **Site** | seascape-vacations.com (Eleventy build to `_site`, Netlify publish from `_site`) |
| **Deploy dir** | `_site` (generated only; never edit directly) |
```

Remove or rewrite any instruction that tells agents to deploy from `DEPLOY THIS FOLDER TO NETLIFY`.

- [ ] **Step 2: Add concise architecture truth to `AGENTS.md`**

Populate these sections:

```md
## Architecture Patterns
- Homepage source lives in `src/index.njk`
- pSEO stays/property pages are generated from `src/stays/stays.njk` and `src/property-management/property-management.njk`
- Legacy guides now live under `src/guides/` and are copied to `guides/` at build time
- Netlify redirects come from `src/_redirects`

## Known Gotchas
- Do not edit `_site/`; it is generated output
- Do not deploy from `DEPLOY THIS FOLDER TO NETLIFY/`
- `/property-management/` must resolve to a real landing page; do not reintroduce self-redirect rules

## Recent Learnings
- Production had drifted away from repo source; local build verification is mandatory before deploy
```

- [ ] **Step 3: Add a short repo-owned source-of-truth note**

Create `docs/source-of-truth.md`:

```md
# Source Of Truth

- Editable source: `src/`, `eleventy.config.js`, `package.json`, `netlify.toml`
- Generated output: `_site/`
- Build command: `npm run build`
- Publish directory: `_site`
- Legacy archival content only: `DEPLOY THIS FOLDER TO NETLIFY/`, top-level `stays/`, top-level `property-management/`, root `index.html`
- Never hand-edit generated output before deploy
```

- [ ] **Step 4: Commit the governance changes**

Run:

```bash
git add CLAUDE.md AGENTS.md docs/source-of-truth.md
git commit -m "docs: record the recovered source-of-truth workflow"
```

### Task 7: Run final verification, deploy, and smoke test production

**Files:**
- Verify: `_site/index.html`
- Verify: `_site/property-management/index.html`
- Verify: `_site/stays/anna-maria-island-vacation-rentals/index.html`
- Verify: `_site/property-management/vacation-rental-management-sarasota/index.html`
- Verify: `_site/guides/anna-maria-island-area-guide/index.html`

- [ ] **Step 1: Run the full local verification sequence**

Run:

```bash
npm run build
npm run verify:recovery:p0
npm run verify:recovery:guides
npm run verify:recovery:remediation
```

Expected: all commands succeed.

- [ ] **Step 2: Run targeted manual smoke checks before deploy**

Run:

```bash
curl -I -s http://localhost:8080/property-management/ | sed -n '1,20p'
curl -I -s http://localhost:8080/guides/anna-maria-island-area-guide/ | sed -n '1,20p'
```

If using a local static server is required, serve `_site` first:

```bash
npx serve _site -l 8080
```

Expected: both local routes resolve without loops or missing files.

- [ ] **Step 3: Review the generated diff for unrelated churn**

Run:

```bash
git status --short
git diff --stat
```

Expected: changes are limited to the planned source, docs, scripts, and generated outputs that match those source edits.

- [ ] **Step 4: Deploy from the recovered build path**

Preferred direct deploy from the verified build output:

```bash
npx netlify deploy --dir=_site --prod --site "$(node -p 'require("./.netlify/state.json").siteId')"
```

Expected: Netlify returns a successful production deploy URL for `seascape-vacations.com`.

- [ ] **Step 5: Smoke test production**

Run:

```bash
node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com
curl -I -s https://seascape-vacations.com/property-management/ | sed -n '1,20p'
```

Expected:

- live smoke script passes
- `/property-management/` returns `200`
- homepage returns `200`
- `/property-owners/` returns `301` to `/property-management/`

- [ ] **Step 6: Optional spot-audit the priority pages**

Run one mobile Lighthouse sample after deploy for each page type:

```bash
lighthouse https://seascape-vacations.com/ --only-categories=performance,accessibility,best-practices,seo --emulated-form-factor=mobile --output=json --output-path=./tmp-home-mobile.json
lighthouse https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/ --only-categories=performance,accessibility,best-practices,seo --emulated-form-factor=mobile --output=json --output-path=./tmp-stays-mobile.json
lighthouse https://seascape-vacations.com/property-management/vacation-rental-management-sarasota/ --only-categories=performance,accessibility,best-practices,seo --emulated-form-factor=mobile --output=json --output-path=./tmp-pm-mobile.json
lighthouse https://seascape-vacations.com/guides/anna-maria-island-area-guide/ --only-categories=performance,accessibility,best-practices,seo --emulated-form-factor=mobile --output=json --output-path=./tmp-guide-mobile.json
```

Expected: no regression from the 2026-03-15 baselines and clear improvement on the broken runtime/route/schema issues.

- [ ] **Step 7: If production still does not match the repo after direct deploy, stop**

Stop condition:

- direct Netlify deploy succeeds
- live HTML still contains stale guide/homepage content not present in the new build

If that happens, investigate Netlify site settings, branch deploy config, and any out-of-band deploy workflow before touching more SEO or design code.
