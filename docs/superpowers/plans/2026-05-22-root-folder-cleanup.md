# Root Folder Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce repo-root clutter and local worktree graveyard without touching active source truth or breaking legacy redirect/runtime compatibility.

**Architecture:** Use repo-owned truth surfaces and deterministic scripts first. Split cleanup into three buckets: `safe delete now`, `compatibility-sensitive verify first`, and `defer`. Execute only the safe bucket in this pass, then rerun build and enforcement checks before touching anything riskier.

**Tech Stack:** Git worktrees, Node.js enforcement scripts, Eleventy build, repo guardrail CLI

---

## File Structure And Scope

**Create**
- `docs/superpowers/plans/2026-05-22-root-folder-cleanup.md`

**Modify**
- repo root tracked artifacts that are confirmed unused and non-source

**Do Not Touch In This Pass Unless Verification Forces It**
- `src/`
- `docs/status/`
- `DEPLOY THIS FOLDER TO NETLIFY/`
- root public assets with possible live URL compatibility value:
  - `hero.jpg`
  - `hero-mobile.jpg`
  - `logo-white.png`
  - `logo-white-optimized.png`
- root tracked files that tests/docs explicitly reference:
  - `rank-tracker-latest.md`
  - `content-priorities-2026-03.md`

## Risk Buckets

### Safe Delete Now

These are tracked root artifacts with no current source/docs/scripts/tests references and no clear role in current repo truth:

- `About`
- `DEMO-A-cinematic.html`
- `DEMO-B-mosaic.html`
- `DEMO-C-hybrid.html`
- `PREVIEW-gallery-river-house.html`
- `property-owners-preview.html`
- `revenue-calculator-preview.html`
- `deploy-1772550514488-d0ed5d54-2413-456f-8075-ec794fc1cefa.zip`
- `fix-cards.js`
- `fix-cards2.js`
- `fix-desc.js`
- `fix-url-props.js`
- `fix-url-props2.js`
- `fix-url.js`
- `fix_lh.js`
- `fix_lh.py`
- `fix_lh_contrast.py`
- `inject_mobile_cta.py`
- `internal-linking-fix.py`
- `lighthouse-report-deferred.json`
- `lighthouse-report-final.json`
- `lighthouse-report.json`
- `minify-html.js`
- `temp.txt`
- `verify_lighthouse.js`
- `about-desktop.jpeg`
- `about-mobile.jpeg`
- `contact-desktop.jpeg`
- `contact-mobile.jpeg`
- `homepage-desktop.jpeg`
- `homepage-mobile.jpeg`

### Compatibility-Sensitive: Verify Before Touching

These are root artifacts that look stale but still encode compatibility behavior or may still be reachable as public URLs:

- `area-guide-ami.html`
- `area-guide-ami-preview.html`
- `area-guide-bradenton.html`
- `area-guide-sarasota.html`
- `area-guide-siesta-key.html`
- `index.html`
- `hero.jpg`
- `hero-mobile.jpg`
- `logo-white.png`
- `logo-white-optimized.png`

### Defer In This Pass

These may be clutter, but deleting them cleanly needs archival or doc-routing judgment rather than pure repo hygiene:

- `bradenton-vs-sarasota-cluster-research.md`
- `competitor-intel-2026-03.md`
- `geo-audit-2026-03-13.md`
- `GEO-Action-Plan-2026.html`
- `SEO-Audit-Seascape-Vacations-2026.html`
- `SEO-IMPLEMENTATION-PLAN.md`
- `link-building-targets.md`
- `mailchimp-welcome-sequence.md`
- `outreach-templates-2026-03.md`
- `writing-style-guide.md`
- `listing-photos.json`
- `skills-lock.json`
- `sync-props.js`
- `task-log-2026-03.md`

## Expected Issues Before Execution

- Removing legacy alias HTML files may break redirect expectations unless `_redirects` remains authoritative and build output keeps the alias redirects.
- Removing public root assets may create live 404s for old public URLs even if current source no longer references them.
- `DEPLOY THIS FOLDER TO NETLIFY/` is still encoded in docs, tests, guardrails, and the old cleanup branch; deleting it is a separate migration, not a drive-by cleanup.
- Worktree/branch graveyard cleanup must only delete `safe_to_delete` items from `scripts/enforcement/graveyard-prune.js`; anything with source dirt or non-main ancestry stays out.
- Verification in a fresh worktree may require a local `node_modules/` install before build/test can run.

## Chunk 1: Manifest And Safe Root Cleanup

### Task 1: Reconfirm the cleanup manifest

**Files:**
- Modify: repo root tracked artifacts listed in `Safe Delete Now`
- Review: `docs/source-of-truth.md`
- Review: `scripts/enforcement/seo-governance.test.js`
- Review: `scripts/guides/normalize-guides.js`

- [x] **Step 1: Reconfirm branch/worktree state**

Run: `git status --short --branch`
Expected: `## codex/root-folder-cleanup`

- [x] **Step 2: Reconfirm repo guardrail state**

Run: `/Users/sawbeck/bin/guardrail-preflight`
Expected: `Preflight passed.`

- [x] **Step 3: Delete the safe root artifact bucket**

Run:

```bash
git rm \
  About \
  DEMO-A-cinematic.html \
  DEMO-B-mosaic.html \
  DEMO-C-hybrid.html \
  PREVIEW-gallery-river-house.html \
  property-owners-preview.html \
  revenue-calculator-preview.html \
  deploy-1772550514488-d0ed5d54-2413-456f-8075-ec794fc1cefa.zip \
  fix-cards.js \
  fix-cards2.js \
  fix-desc.js \
  fix-url-props.js \
  fix-url-props2.js \
  fix-url.js \
  fix_lh.js \
  fix_lh.py \
  fix_lh_contrast.py \
  inject_mobile_cta.py \
  internal-linking-fix.py \
  lighthouse-report-deferred.json \
  lighthouse-report-final.json \
  lighthouse-report.json \
  minify-html.js \
  temp.txt \
  verify_lighthouse.js \
  about-desktop.jpeg \
  about-mobile.jpeg \
  contact-desktop.jpeg \
  contact-mobile.jpeg \
  homepage-desktop.jpeg \
  homepage-mobile.jpeg
```

Expected: only the listed files are staged as deletions.

- [x] **Step 4: Inspect the diff for accidental scope creep**

Run: `git diff --stat`
Expected: deletions limited to the safe bucket plus this plan file

## Chunk 2: Graveyard Cleanup

### Task 2: Apply only repo-classified safe branch/worktree cleanup

**Files:**
- Modify: `.git/worktrees/*` and local branch refs via git commands only
- Review: `scripts/enforcement/graveyard-prune.js`

- [x] **Step 1: Audit graveyard state**

Run: `node scripts/enforcement/graveyard-prune.js`
Expected: only repo-classified `safe` worktrees/branches are candidates for auto-delete

- [x] **Step 2: Apply safe graveyard cleanup**

Run: `node scripts/enforcement/graveyard-prune.js --apply`
Expected: safe merged branches and safe stale worktrees are removed; `needs review` and `keep` buckets remain

- [x] **Step 3: Re-audit to confirm cleanup**

Run: `node scripts/enforcement/graveyard-prune.js`
Expected: the previous safe bucket is reduced or empty

## Chunk 3: Verification

### Task 3: Verify repo behavior still matches source truth

**Files:**
- Review: `package.json`
- Review: build and enforcement output

- [x] **Step 1: Install dependencies in the worktree if needed**

Run: `npm install`
Expected: local `node_modules/` is available for build/test commands

- [x] **Step 2: Run the test suite**

Run: `npm test`
Expected: PASS

- [x] **Step 3: Run redirect validation**

Run: `npm run verify:redirects`
Expected: PASS

- [x] **Step 4: Run release verification**

Run: `npm run verify:release`
Expected: PASS

- [x] **Step 5: Review final status**

Run: `git status --short --branch`
Expected: only the intentional plan file and cleanup diff remain

## Execution Notes

- Do not widen this pass into deleting `DEPLOY THIS FOLDER TO NETLIFY/`.
- Do not delete compatibility-sensitive root assets without a second explicit verification pass.
- If `npm test` or `verify:release` reveals references to any file in `Safe Delete Now`, restore that file in the same branch and move it to `Defer`.
