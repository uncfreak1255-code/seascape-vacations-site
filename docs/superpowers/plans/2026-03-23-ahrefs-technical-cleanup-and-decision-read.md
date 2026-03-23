# Ahrefs Technical Cleanup And Decision Read Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** remove the highest-priority legacy URL and canonical leaks from Seascape's money pages, then leave a clean March 27-28 decision framework instead of guessing from fresh relands.

**Architecture:** this is a source-first technical cleanup pass in the site repo. Fix only issues that still split crawl signals or route users into legacy URL families. Do not use this sprint to reinterpret SEO outcomes before the reporting window matures.

**Tech Stack:** Eleventy, Netlify redirects, repo enforcement tests, ripgrep, Node test runner

---

## File Structure

- Modify: `src/_redirects`
  - normalize highest-priority legacy targets to canonical slash routes
  - keep equity-preserving 301s for old URL families
- Modify: `eleventy.config.js`
  - remove stale ignore for duplicate guide source if the duplicate source is deleted
- Modify: `scripts/enforcement/seo-structure.test.js`
  - replace stale assumptions about "retired duplicate guides" with assertions that the bad route is removed from source and canonical routing remains intact
- Create or modify: `scripts/enforcement/technical-cleanup.test.js`
  - assert the targeted `.html` link families no longer appear in live source
  - assert the highest-priority redirect targets point to canonical routes
- Modify: targeted guide files returned by grep
  - replace internal links from legacy `.html` variants to canonical slash routes
- Delete: `src/guides/bradenton-vs-sarasota-vacation-rental-comparison/index.html`
  - stop building the retired duplicate comparison route from source

## Worktree

- Branch: `codex/ahrefs-technical-cleanup`
- Worktree: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/codex-ahrefs-technical-cleanup`

## Ahrefs Checklist

Use this checklist exactly during the March 23 pass. The audit output goes in the PR summary or a repo note, not in random chat fragments.

- [ ] Internal Links To Redirects
  - inspect internal links still hitting 3xx for:
    - `area-guide-`
    - `.html`
    - `bradenton-vs-sarasota-vacation-rental-comparison`
    - `best-time-visit-anna-maria-island`
    - `srq-airport-to-anna-maria-island`
- [ ] Canonical Conflicts
  - inspect canonical-to-redirect, mixed slash/non-slash, and old/new family mismatches
- [ ] Redirect Chains And Broken Routes
  - inspect redirect chains, loops, and any internally linked 4xx paths
- [ ] Orphan Pages
  - confirm internal routing into:
    - `/property-management/`
    - `/property-management/vacation-rental-management-anna-maria-island/`
    - `/property-management/vacation-rental-management-sarasota/`
    - `/property-management/switch-vacation-rental-management-company/`
    - Week 1 and Week 2 direct-booking guides
- [ ] Legacy URL Residue
  - classify old URL families as:
    - `301 and keep`
    - `canonicalize`
    - `remove from internal linking and let die`
- [ ] Backlinks To Old URLs
  - inspect exact old aliases before removing or weakening any 301s
- [ ] URL Variant Splits
  - inspect signal splits on:
    - `/guides/bradenton-vs-sarasota`
    - `/guides/bradenton-vs-sarasota/`
    - `/guides/best-time-visit-anna-maria-island.html`
    - `/guides/srq-airport-to-anna-maria-island.html`
    - `/guides/bradenton-vs-sarasota-vacation-rental-comparison/`
- [ ] Money-Page Crawl Health
  - confirm owner and direct-booking money pages are indexable, canonicalized correctly, not buried, and internally linked

## Output Template

Use exactly these three buckets:

```markdown
## Fix Now
- [issue]
  - Source path:
  - Why it matters:
  - Action:

## Watch
- [issue]
  - Observed state:
  - Why not act yet:
  - Recheck date:

## Ignore Until March 27-28
- [issue]
  - Why it is too early:
  - What evidence would justify action later:
```

## March 23 Findings

### Fix Now
- Retired duplicate comparison route still existed in source
  - Source path: `src/guides/bradenton-vs-sarasota-vacation-rental-comparison/index.html`
  - Why it matters: the route was supposed to be retired behind a 301, but source still built it, which keeps the duplicate family alive.
  - Action: deleted the source file and removed its stale Eleventy ignore entry.

- Highest-priority weather-family redirects still pointed at a non-canonical `.html` target
  - Source path: `src/_redirects`
  - Why it matters: old aliases were routing into another legacy variant instead of the canonical slash route.
  - Action: pointed the weather-family redirects at `/guides/anna-maria-island-weather/`.

- Live guide corpus still linked to priority legacy `.html` guide families
  - Source path: targeted guide files under `src/guides/`
  - Why it matters: internal links were still reinforcing old best-time, SRQ, and weather URL variants.
  - Action: replaced those links with canonical slash routes and added enforcement coverage.

### Watch
- Lower-priority redirect table still contains many older `.html` targets outside today’s priority families
  - Observed state: `src/_redirects` still carries a broad legacy map for older guide families and CMS aliases.
  - Why not act yet: some of those routes may still hold crawl or backlink equity, and this sprint was scoped to the highest-priority money-page families.
  - Recheck date: 2026-03-27 to 2026-03-28 after crawl data and link evidence are reviewed together.

- Nested `area-guide-*` cleanup is still mostly redirect-driven, not yet evidence-pruned
  - Observed state: source scan did not show live internal links to the old nested `area-guide-*` paths, but the redirect family remains in `src/_redirects`.
  - Why not act yet: removing redirect coverage before crawl evidence would be cleanup theater.
  - Recheck date: 2026-03-27 to 2026-03-28.

### Ignore Until March 27-28
- CTR or ranking judgments on the March relands
  - Why it is too early: the reporting window is still too close to the relands and recrawl lag can look like insight when it is just lag.
  - What evidence would justify action later: stable GSC page-level read for the winner guides and owner pages over the March 27-28 window.

- Owner-page success or failure calls from fresh impressions
  - Why it is too early: technical cleanup and recent relands need time to consolidate before you interpret the owner lane.
  - What evidence would justify action later: page-level impressions, clicks, and crawl health for `/property-management/` plus the top local owner pages.

## March 27-28 Decision Table

| Observed evidence | Decision | Next sprint |
|---|---|---|
| Guide-originated clicks are moving into properties / booking CTAs, but booking handoff is still weak | Keep direct-booking lane | Property-page / booking-engine handoff optimization |
| Owner pages still have weak impressions / clicks while booking pages improve | Shift to owner SEO architecture | Owner internal-link support + local authority routing |
| Canonical and redirect residue is still splitting signals on money pages | Stay in technical cleanup | Second cleanup sprint before more copy work |
| No reliable signal yet because recrawl/reporting is still immature | Hold | No new rewrite sprint until next reporting window |

## Chunk 1: Lock Audit Scope And Write Failing Tests

**Files:**
- Modify: `scripts/enforcement/seo-structure.test.js`
- Create: `scripts/enforcement/technical-cleanup.test.js`

- [ ] **Step 1: Write failing test coverage for the retired duplicate comparison route**

Assert that:
- the source file `src/guides/bradenton-vs-sarasota-vacation-rental-comparison/index.html` no longer exists
- `_redirects` still preserves the 301 to `/guides/bradenton-vs-sarasota/`

- [ ] **Step 2: Write failing test coverage for priority legacy `.html` link families**

Assert that live source files do not include:
- `/guides/best-time-visit-anna-maria-island.html`
- `/guides/srq-airport-to-anna-maria-island.html`
- `/guides/anna-maria-island-weather.html`
- `/guides/bradenton-vs-sarasota-vacation-rental-comparison/`

- [ ] **Step 3: Run the targeted enforcement tests and confirm they fail first**

Run:
```bash
node --test scripts/enforcement/seo-structure.test.js scripts/enforcement/technical-cleanup.test.js
```

- [ ] **Step 4: Commit the test-only checkpoint if helpful**

```bash
git status --short
```

## Chunk 2: Remove Duplicate Source And Normalize Canonical Routing

**Files:**
- Delete: `src/guides/bradenton-vs-sarasota-vacation-rental-comparison/index.html`
- Modify: `eleventy.config.js`
- Modify: `src/_redirects`

- [ ] **Step 1: Delete the retired duplicate comparison source route**

- [ ] **Step 2: Remove the now-stale Eleventy ignore for that deleted guide family**

- [ ] **Step 3: Normalize the highest-priority redirect targets to canonical slash routes**

At minimum:
- weather-family redirects should point to `/guides/anna-maria-island-weather/`
- the duplicate comparison family should preserve the canonical `/guides/bradenton-vs-sarasota/`

- [ ] **Step 4: Re-run targeted tests**

Run:
```bash
node --test scripts/enforcement/seo-structure.test.js scripts/enforcement/technical-cleanup.test.js
```

## Chunk 3: Sweep Live Internal Links For Highest-Priority Families

**Files:**
- Modify: every source file returned by:

```bash
rg -l '/guides/best-time-visit-anna-maria-island\.html|/guides/srq-airport-to-anna-maria-island\.html|/guides/anna-maria-island-weather\.html|/guides/bradenton-vs-sarasota-vacation-rental-comparison/' src --glob '!src/_redirects'
```

- [ ] **Step 1: Replace internal links to canonical slash routes**

Use:
- `/guides/best-time-visit-anna-maria-island/`
- `/guides/srq-airport-to-anna-maria-island/`
- `/guides/anna-maria-island-weather/`
- `/guides/bradenton-vs-sarasota/`

- [ ] **Step 2: Re-run targeted tests**

Run:
```bash
node --test scripts/enforcement/seo-structure.test.js scripts/enforcement/technical-cleanup.test.js
```

- [ ] **Step 3: Run full repo verification**

Run:
```bash
npm test
npm run build
npm run verify:recovery:guides
```

## Chunk 4: Produce The March 23 Audit Read

**Files:**
- Modify if needed: `docs/superpowers/plans/2026-03-23-ahrefs-technical-cleanup-and-decision-read.md`
- Optional note in repo docs only if there is durable operational value

- [ ] **Step 1: Fill the output template with this sprint's actual findings**

- [ ] **Step 2: Confirm every finding lands in exactly one bucket**

- [ ] **Step 3: Stop after the technical pass**

Do not start a new copy sprint from this branch.

## Verification Gate

Before asking for review:

- [ ] `node --test scripts/enforcement/seo-structure.test.js scripts/enforcement/technical-cleanup.test.js`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run verify:recovery:guides`
- [ ] review diff for unrelated churn
- [ ] restore `_site/` noise if needed so the branch is source-only again

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-23-ahrefs-technical-cleanup-and-decision-read.md`. Ready to execute.
