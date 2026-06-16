# Deferred Guide And Canonical Tranche Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the guide winner + canonical tranche fully execution-ready while freshness is blocked, then execute it safely once `docs/status/next-batch.md` opens.

**Architecture:** Split work into two phases. Phase A is prep-only and can run while freshness is blocked: tighten brief/plan/contracts and stage deterministic verification commands. Phase B runs only after reread status becomes `open next batch`: apply bounded guide/canonical edits, run de-duplicated checks, then land through safe commit + merge gates.

**Tech Stack:** Eleventy/Nunjucks, `src/_redirects`, `src/llms.txt`, `src/ai-discovery.json.njk`, guide templates in `src/guides/`, Node test runner, repo guardrail scripts

---

## File Structure And Responsibilities

- Create: `docs/briefs/2026-05-deferred-guide-canonical-tranche.md` (single active brief contract for this tranche)
- Create: `docs/superpowers/plans/2026-05-25-deferred-guide-and-canonical-tranche.md` (execution-safe sequence)
- Modify in Phase B only:
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/guides/best-time-visit-anna-maria-island.html`
  - `src/_redirects`
  - `src/llms.txt`
  - `src/ai-discovery.json.njk`
- Modify tests only if real assertion gaps are proven:
  - `scripts/enforcement/winner-guide-consolidation.test.js`
  - `scripts/enforcement/guide-conversion.test.js`
  - `scripts/enforcement/technical-cleanup.test.js`
  - `scripts/enforcement/ai-discovery-schema.test.js`

## Scope Locks

- No owner-page edits.
- No stay-page CRO expansion.
- No net-new guides.
- No broad template redesign.
- No source edits while `docs/status/next-batch.md` shows `Reread status: blocked by freshness`.

## De-duplicated Verification Matrix

Run checks once per responsibility surface instead of repeating the same commands in every chunk.

- Content/voice gate: `npm run lint:content`
- Guide/canonical coverage: `node --test scripts/enforcement/winner-guide-consolidation.test.js scripts/enforcement/guide-conversion.test.js scripts/enforcement/technical-cleanup.test.js scripts/enforcement/ai-discovery-schema.test.js`
- Routing/structure: `npm run verify:redirects && npm run verify:links && npm run verify:jsonld`
- Full regression (single end-of-branch pass): `npm run verify:release && npm run git:merge-check`

## Safe Commit Rules

- Never use `git add -A`.
- Stage explicit file lists only.
- Use repo guardrail wrapper:
  - `npm run git:safe-commit -- --stage-source -m "<message>"`
- Keep commit boundaries small:
  - commit 1: tests only (if changed)
  - commit 2: source/docs tranche changes

### Task 1: Phase A Prep (Allowed While Blocked)

**Files:**
- Create: `docs/briefs/2026-05-deferred-guide-canonical-tranche.md`
- Create: `docs/superpowers/plans/2026-05-25-deferred-guide-and-canonical-tranche.md`

- [ ] **Step 1: Confirm branch/worktree safety**

Run: `git status --short --branch && npm run git:preflight`
Expected: non-main branch and preflight pass.

- [ ] **Step 2: Confirm reread gate state**

Run: `rg -n "Reread status|Concrete next move" docs/status/next-batch.md`
Expected: exactly one status and one concrete next move line.

- [ ] **Step 3: Refresh the active tranche brief and plan**

Update both docs so they:
- preserve freshness gate lock,
- enumerate exact in-scope routes,
- encode de-duplicated tests,
- and lock safe commit behavior.

- [ ] **Step 4: Validate doc-only diff scope**

Run: `git diff --stat`
Expected: only tranche prep docs changed in Phase A.

- [ ] **Step 5: Commit Phase A docs**

```bash
git add docs/briefs/2026-05-deferred-guide-canonical-tranche.md docs/superpowers/plans/2026-05-25-deferred-guide-and-canonical-tranche.md
npm run git:safe-commit -- --stage-source -m "docs: queue deferred guide canonical tranche safely"
```

### Task 2: Phase B Execution Gate (Run Only When Freshness Opens)

**Files:**
- No source edits expected

- [ ] **Step 1: Recheck gate immediately before source edits**

Run: `rg -n "Reread status" docs/status/next-batch.md`
Expected: `Reread status: open next batch`.

- [ ] **Step 2: Stop if still blocked**

If status is not `open next batch`, do not edit `src/`. Record wait state and end run.

- [ ] **Step 3: Snapshot baseline tests once**

Run:
```bash
npm run lint:content
node --test scripts/enforcement/winner-guide-consolidation.test.js scripts/enforcement/guide-conversion.test.js scripts/enforcement/technical-cleanup.test.js scripts/enforcement/ai-discovery-schema.test.js
```
Expected: baseline pass or known failure reproduced before changes.

### Task 3: Phase B Guide And Canonical Source Pass

**Files:**
- Modify: `src/guides/bradenton-vs-sarasota.html`
- Modify: `src/guides/anna-maria-island-vs-siesta-key.html`
- Modify: `src/guides/best-time-visit-anna-maria-island.html`
- Modify: `src/_redirects`
- Modify: `src/llms.txt`
- Modify: `src/ai-discovery.json.njk`
- Optional test updates only if missing assertions are proven

- [ ] **Step 1: Apply bounded guide winner edits**

Limit edits to:
- decision-first openings and snippet clarity,
- canonical URL consistency,
- preserved CTA handoff to mapped stay winners.

- [ ] **Step 2: Apply bounded alias/canonical cleanup**

Keep one-hop redirect ownership for known aliases and align canonical hints across guide source, discovery files, and redirects.

- [ ] **Step 3: Add tests only for real gaps**

If a regression surface is uncovered and untested, add minimal assertions to owning test files. Do not create duplicate harnesses.

- [ ] **Step 4: Run tranche matrix once after edits**

Run:
```bash
npm run lint:content
node --test scripts/enforcement/winner-guide-consolidation.test.js scripts/enforcement/guide-conversion.test.js scripts/enforcement/technical-cleanup.test.js scripts/enforcement/ai-discovery-schema.test.js
npm run verify:redirects
npm run verify:links
npm run verify:jsonld
```
Expected: pass.

- [ ] **Step 5: Commit tests first when present**

```bash
git add scripts/enforcement/winner-guide-consolidation.test.js scripts/enforcement/guide-conversion.test.js scripts/enforcement/technical-cleanup.test.js scripts/enforcement/ai-discovery-schema.test.js
npm run git:safe-commit -- --stage-source -m "test: cover guide canonical tranche gaps"
```
Skip this commit if no test file changed.

- [ ] **Step 6: Commit source tranche**

```bash
git add src/guides/bradenton-vs-sarasota.html src/guides/anna-maria-island-vs-siesta-key.html src/guides/best-time-visit-anna-maria-island.html src/_redirects src/llms.txt src/ai-discovery.json.njk
npm run git:safe-commit -- --stage-source -m "feat: execute deferred guide canonical tranche"
```

### Task 4: Final Verification, PR, And Merge Readiness

**Files:**
- No source edits expected

- [ ] **Step 1: Run one final full regression pass**

Run:
```bash
npm run verify:release
npm run git:merge-check
```
Expected: pass.

- [ ] **Step 2: Confirm final scope**

Run: `git status --short --branch && git diff --stat origin/main...HEAD`
Expected: only intended tranche files differ.

- [ ] **Step 3: Push and open PR with explicit gate note**

Run:
```bash
git push -u origin codex/deferred-guide-canonical-tranche-prep
```
Then open a PR that states:
- freshness status used at execution time,
- exact in-scope routes,
- verification commands and pass state.

- [ ] **Step 4: Merge only after checks and review**

After merge:
- pull root `main`,
- remove clean worktree + branch,
- verify no local dirt remains.

## Stop Conditions

- freshness gate is still blocked at Phase B start,
- any check in the de-duplicated matrix fails and root cause is unknown,
- diff widens beyond guide/canonical tranche scope.
