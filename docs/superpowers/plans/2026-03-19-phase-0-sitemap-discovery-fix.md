# Phase 0 Sitemap Discovery Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** make the sitemap accurately reflect the current indexable site inventory, especially paginated `/stays/` and `/property-management/` pages, and remove the source-of-truth ambiguity that caused the March 19 reporting confusion.

**Architecture:** keep `src/sitemap.njk` as the source of truth, but stop relying on `collections.all` alone for paginated templates. Generate non-paginated sitemap entries from `collections.all`, then add explicit loops for indexable stay pages and owner pages so the built `_site/sitemap.xml` matches the intended live inventory. Tighten enforcement with a failing regression test and update repo guidance that still implies `sitemap.xml` is hand-edited.

**Tech Stack:** Eleventy 3, Nunjucks, Node test runner, existing repo enforcement tests

---

## Chunk 1: Reproduce And Lock The Failure

### Task 1: Add a failing regression test for paginated sitemap coverage

**Files:**
- Modify: `scripts/enforcement/seo-structure.test.js`

- [ ] **Step 1: Add a new failing test that asserts the sitemap template explicitly handles paginated stays and owner pages**

Test intent:
- the sitemap source must reference `staysPages`
- the sitemap source must reference `seoPages.owner`
- the sitemap source must not rely on `collections.all` alone for `/stays/` and `/property-management/` inventory

Suggested assertion shape:

```js
test("sitemap explicitly includes paginated stay and owner inventories", () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, "src", "sitemap.njk"), "utf8");

  assert.equal(sitemap.includes("staysPages"), true);
  assert.equal(sitemap.includes("seoPages.owner"), true);
  assert.equal(sitemap.includes("url.indexOf('/stays/') === -1"), true);
  assert.equal(sitemap.includes("url.indexOf('/property-management/') === -1"), true);
});
```

- [ ] **Step 2: Run the test suite to verify the new test fails for the expected reason**

Run:

```bash
npm test
```

Expected:
- one new failing test in `seo-structure.test.js`
- failure because `src/sitemap.njk` does not yet reference `staysPages`, `seoPages.owner`, and the new exclusions

---

## Chunk 2: Fix Sitemap Generation At The Source

### Task 2: Update the sitemap template to include paginated inventory explicitly

**Files:**
- Modify: `src/sitemap.njk`

- [ ] **Step 1: Import the paginated data sources into the sitemap template**

Add front matter data access for:
- `staysPages`
- `seoPages`
- `seoGovernance`

Use the existing global data names already available in Nunjucks templates.

- [ ] **Step 2: Keep the `collections.all` loop for non-paginated pages only**

Update the existing `collections.all` condition so it excludes:
- `/stays/`
- `/property-management/`

Rationale:
- those routes are produced by paginated templates and `collections.all` is only surfacing the first generated page for each template
- leaving them in the generic loop would duplicate the first stay page and first owner page once the explicit loops are added

- [ ] **Step 3: Add an explicit loop for indexable stay pages**

For each `seoPage` in `staysPages`:
- skip any slug listed in `seoGovernance.staysNoindexSlugs`
- emit `/stays/{{ seoPage.slug }}/`
- use monthly change frequency and `0.7` priority to match current stays behavior

- [ ] **Step 4: Add an explicit loop for owner pages**

For each `seoPage` in `seoPages.owner`:
- emit `/property-management/{{ seoPage.slug }}/`
- use monthly change frequency and `0.7` priority unless there is a stronger existing convention in the current sitemap template

- [ ] **Step 5: Preserve existing exclusions for retired duplicate guide URLs**

Do not remove the `excludedUrls` logic for retired guide paths.

- [ ] **Step 6: Run the test suite and confirm the new regression test passes**

Run:

```bash
npm test
```

Expected:
- all tests pass

---

## Chunk 3: Fix Source-Of-Truth Confusion And Verify Build Output

### Task 3: Update repo guidance so future agents stop treating `sitemap.xml` as hand-maintained source

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace instructions that imply `sitemap.xml` is manually edited**

Update the sitemap guidance so it says:
- source lives in `src/sitemap.njk`
- verification happens against built `_site/sitemap.xml`
- agents should not hand-edit root `sitemap.xml`

Target the lines that currently say:
- “All new pages added to `sitemap.xml`...”
- “Update `sitemap.xml` with the new URL...”

- [ ] **Step 2: Keep the instruction aligned with repo safety docs**

The final wording must agree with:
- `docs/process/agent-safety-standard.md`
- repo rule: edit source, not generated output

### Task 4: Verify the build output now contains the expected paginated inventory

**Files:**
- No source edits expected

- [ ] **Step 1: Run a clean build**

Run:

```bash
npm run build
```

Expected:
- Eleventy completes successfully

- [ ] **Step 2: Count sitemap URLs and compare them with the intended current inventory**

Run:

```bash
node - <<'NODE'
const fs=require('fs');
const xml=fs.readFileSync('_site/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\\/loc>/g)].map(m=>m[1].replace('https://seascape-vacations.com',''));
const counts={guides:0,stays:0,pm:0,properties:0,research:0,services:0,other:0};
for (const url of urls) {
  if (url.startsWith('/guides/')) counts.guides++;
  else if (url.startsWith('/stays/')) counts.stays++;
  else if (url.startsWith('/property-management/')) counts.pm++;
  else if (url.startsWith('/properties/')) counts.properties++;
  else if (url.startsWith('/research/')) counts.research++;
  else if (url.startsWith('/services/')) counts.services++;
  else counts.other++;
}
console.log(JSON.stringify({total: urls.length, counts}, null, 2));
NODE
```

Expected:
- `/stays/` count materially increases from `1`
- `/property-management/` count materially increases from `2`
- total sitemap URLs materially increase from `68`

- [ ] **Step 3: Smoke check representative URLs that were previously missing**

Run:

```bash
node - <<'NODE'
const fs=require('fs');
const xml=fs.readFileSync('_site/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\\/loc>/g)].map(m=>m[1]);
for (const url of [
  'https://seascape-vacations.com/stays/bradenton-waterfront-vacation-rentals/',
  'https://seascape-vacations.com/stays/book-direct-anna-maria-island/',
  'https://seascape-vacations.com/property-management/vacation-rental-management-bradenton/',
  'https://seascape-vacations.com/property-management/vacation-rental-management-sarasota/'
]) {
  console.log(url, urls.includes(url) ? 'FOUND' : 'MISSING');
}
NODE
```

Expected:
- all representative URLs print `FOUND`

- [ ] **Step 4: Review diff for scope**

Run:

```bash
git diff -- src/sitemap.njk scripts/enforcement/seo-structure.test.js CLAUDE.md _site/sitemap.xml
```

Expected:
- only the planned files changed in source
- generated sitemap change matches the intended fix

---

## Finish Gate

- [ ] **Step 1: Re-run the exact verification commands before claiming Phase 0 is fixed**

Run:

```bash
npm test
npm run build
```

Expected:
- both commands exit `0`

- [ ] **Step 2: Summarize root cause precisely**

Required summary:
- `collections.all` only surfaced the first generated page for the paginated stay and owner templates in the sitemap context
- the live 68-URL sitemap was therefore real
- the “147 missing pages” framing was also inflated by comparing against stale inventory counts

