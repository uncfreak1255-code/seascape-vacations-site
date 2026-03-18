# SEO Governance Pass Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock down homepage URL governance, reduce homepage intent dilution, and upgrade the two highest-visibility comparison guides for stronger CTR and citation readiness.

**Architecture:** Use one enforcement test to stop URL-governance and homepage-content regressions, then make surgical edits in `src/index.njk` and the two winning guide files. Verification includes targeted tests, a full Eleventy build, generated-output spot checks, sitemap resubmission, and fresh GSC inspections on canonical-risk URLs.

**Tech Stack:** Eleventy, Nunjucks, static HTML, Node test runner, Google Search Console MCP

---

## File Map

### Planning

- Create: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/docs/superpowers/plans/2026-03-18-seo-governance-pass.md`

### Enforcement

- Create: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/scripts/enforcement/seo-governance.test.js`

### Homepage

- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/index.njk`

### Guides

- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/guides/bradenton-vs-sarasota.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/guides/anna-maria-island-vs-siesta-key.html`

### Verification

- Verify build output under: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/_site/`

---

## Chunk 1: Guard The Regression Surface

### Task 1: Add A Failing SEO Governance Test

**Files:**
- Create: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/scripts/enforcement/seo-governance.test.js`

- [ ] **Step 1: Write the failing test**

Add assertions that the source currently violates:
- homepage does not contain `area-guide-*.html`
- homepage contains exactly one `<h1`
- homepage does not contain `Updated 2025`
- homepage does not contain `page-blog`
- changed guides do not contain internal guide links ending in `.html`

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
node --test scripts/enforcement/seo-governance.test.js
```

Expected:
- FAIL because the current homepage and guide sources still contain the banned patterns

- [ ] **Step 3: Commit the red test only if it is useful to checkpoint locally**

Optional checkpoint only if the branch state becomes risky:
```bash
npm run git:safe-commit -- --stage-source -m "test: add seo governance regression coverage"
```

---

## Chunk 2: Fix Homepage URL Governance And Intent Dilution

### Task 2: Remove Alias Links And Embedded Blog-Like Document Clutter

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/index.njk`

- [ ] **Step 1: Replace homepage destination alias links with canonical guide routes**

Replace legacy links:
- `area-guide-ami.html`
- `area-guide-bradenton.html`
- `area-guide-sarasota.html`
- `area-guide-siesta-key.html`

With:
- `/guides/anna-maria-island-area-guide/`
- `/guides/bradenton-area-guide/`
- `/guides/sarasota-area-guide/`
- `/guides/siesta-key-area-guide/`

Apply the change in both desktop and mobile navigation.

- [ ] **Step 2: Remove the homepage blog-shell section and stale `Updated 2025` cards**

Delete the embedded `page-blog` shell and the homepage article-card block that exists only to mimic separate guide pages inside the homepage document.

- [ ] **Step 3: Reduce extra homepage document-level headings**

Demote or remove extra embedded-page `<h1>` blocks so the rendered homepage has one real document `<h1>`. Preserve necessary booking or discovery sections, but stop pretending the homepage is multiple pages.

- [ ] **Step 4: Run the targeted regression test**

Run:
```bash
node --test scripts/enforcement/seo-governance.test.js
```

Expected:
- homepage-related assertions pass
- guide assertions may still fail until guide cleanup lands

---

## Chunk 3: Upgrade The Two Winner Guides

### Task 3: Improve Bradenton Vs Sarasota

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/guides/bradenton-vs-sarasota.html`

- [ ] **Step 1: Tighten title/meta/opening copy for CTR**

Make the opening answer immediate and specific. Remove redundant filler and avoid vague “which is better” framing that wastes snippet space.

- [ ] **Step 2: Add named-author treatment**

Use a real person, not organization-only framing. Match the tone and evidence posture used in the research content where practical.

- [ ] **Step 3: Add an evidence-forward block**

Include a compact evidence section or table that cites the sources already referenced in the page and makes the cost, population, or beach-positioning claims easier to trust.

- [ ] **Step 4: Replace internal stale `.html` guide links with slash routes**

Clean internal guide references so changed pages no longer emit the old extension style.

- [ ] **Step 5: Check the sticky booking bar for obvious CLS risk**

Do the minimum necessary to reduce avoidable layout shift if the current implementation visibly injects or animates late.

### Task 4: Improve Anna Maria Island Vs Siesta Key

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/seo-governance-pass/src/guides/anna-maria-island-vs-siesta-key.html`

- [ ] **Step 1: Tighten title/meta/opening copy for CTR**

Keep the direct-answer pattern, but sharpen the first screen so the snippet and first 100 words earn the click.

- [ ] **Step 2: Add named-author treatment**

Use a person-led trust layer consistent with the research section instead of generic operator voice only.

- [ ] **Step 3: Add an evidence-forward block**

Add a compact evidence section or table that supports the core claims around rankings, atmosphere, access, or pricing.

- [ ] **Step 4: Replace internal stale `.html` guide links with slash routes**

Remove extension-style internal guide references from the changed page.

- [ ] **Step 5: Run the targeted regression test**

Run:
```bash
node --test scripts/enforcement/seo-governance.test.js
```

Expected:
- PASS

---

## Chunk 4: Build, Inspect, And Establish The New Baseline

### Task 5: Verify Source And Build Output

**Files:**
- Verify only

- [ ] **Step 1: Run the full enforcement suite**

Run:
```bash
npm test
```

Expected:
- all `scripts/enforcement/*.test.js` tests pass

- [ ] **Step 2: Build the site**

Run:
```bash
npm run build
```

Expected:
- Eleventy exits with code `0`

- [ ] **Step 3: Spot-check generated output**

Run:
```bash
rg -n "area-guide-(ami|bradenton|sarasota|siesta-key)\\.html|Updated 2025|<h1" _site/index.html
rg -n "/guides/[^\" ]+\\.html" _site/guides/bradenton-vs-sarasota/index.html _site/guides/anna-maria-island-vs-siesta-key/index.html
```

Expected:
- no alias links in homepage output
- no `Updated 2025`
- homepage output contains one `<h1`
- no internal guide `.html` links in the two changed guide outputs

- [ ] **Step 4: Commit the implementation**

```bash
npm run git:safe-commit -- --stage-source -m "fix: tighten seo governance and priority guides"
```

### Task 6: Resubmit Sitemap And Inspect Canonical Risk URLs

**Files:**
- Verify only

- [ ] **Step 1: Resubmit the sitemap in GSC**

Submit:
- `https://seascape-vacations.com/sitemap.xml`

- [ ] **Step 2: Inspect the top money URLs and legacy alias URLs**

Inspect at least:
- `https://seascape-vacations.com/`
- `https://seascape-vacations.com/guides/bradenton-vs-sarasota`
- `https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key`
- `https://seascape-vacations.com/area-guide-ami`
- one representative old `.html` guide URL if still historically indexed

- [ ] **Step 3: Record the post-fix baseline**

Capture:
- whether Google still prefers alias URLs
- whether the homepage canonical and referring signals now look cleaner
- whether the two winner guides are indexed on the preferred route

