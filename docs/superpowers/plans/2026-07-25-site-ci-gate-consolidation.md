# Site CI Gate Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce duplicate GitHub Actions work without weakening the required build, release-safety, Lighthouse, visual, or live-production checks.

**Architecture:** Make `Release Safety` the authoritative deterministic gate for pull requests and main pushes, with a compatibility `build` job so the existing ruleset remains satisfied. Keep Lighthouse in a separate cancellable workflow with one PR run and three scheduled/manual runs, and keep Playwright and Live Smoke as independent browser and production gates.

**Tech Stack:** GitHub Actions YAML, Node.js 22, npm, Node test runner, Eleventy, Lighthouse CI, Playwright.

---

## Chunk 1: Preserve required checks while removing duplicate work

### Task 1: Lock the workflow contract in tests

**Files:**
- Create: `scripts/enforcement/workflow-contract.test.js`
- Modify: `scripts/enforcement/perf-budget-config.test.js`

- [ ] **Step 1: Write a failing workflow contract test**

Assert that `release-safety.yml` runs on pull requests and main pushes, has cancellation and a timeout, retains a job named `release-safety`, and exposes a dependent job named `build`. Assert that dependency audit is conditional and that `playwright-visual.yml` cancels superseded PR runs.

- [ ] **Step 2: Write a failing Lighthouse configuration test**

Load `lighthouserc.js` with `LHCI_RUNS=1`, clear the require cache, and assert `ci.collect.numberOfRuns === 1`. Load it without the environment override and assert the default remains `3`.

- [ ] **Step 3: Run the focused tests and confirm they fail**

Run: `node --test scripts/enforcement/workflow-contract.test.js scripts/enforcement/perf-budget-config.test.js`

Expected: FAIL because the compatibility job, workflow concurrency, and environment-selected Lighthouse run count are not implemented yet.

### Task 2: Make Release Safety authoritative and non-duplicative

**Files:**
- Modify: `.github/workflows/release-safety.yml`
- Modify: `package.json`
- Modify: `scripts/enforcement/verify-release.js`
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Preserve both pull-request and main-push coverage**

Keep `pull_request` and `push: branches: [main]`. Give concurrency a PR-number-or-ref fallback so main pushes do not share an empty group, and add a bounded job timeout.

- [ ] **Step 2: Audit dependencies only when dependency files change**

Use the existing base/head range to detect `package.json` or `package-lock.json` changes. Run `npm audit --audit-level=high` only for those pull requests, while retaining audit coverage for direct main pushes.

- [ ] **Step 3: Build once and run tests without rebuilding**

Add `test:unit` as the direct Node test command. Keep `npm test` backward-compatible, but change the release verifier's test step to `npm run test:unit` because the verifier already performs the production build first.

- [ ] **Step 4: Retain the required `build` context without duplicating the build**

Add a minimal `build` job with `needs: release-safety` and `name: build`. It should report that the authoritative gate passed; it must not reinstall dependencies or rebuild the site.

- [ ] **Step 5: Run focused release tests**

Run: `node --test scripts/enforcement/workflow-contract.test.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/design-lint.test.js`

Expected: PASS, proving the required contexts and live-smoke ownership contract remain present.

## Chunk 2: Preserve performance and visual proof with lower usage

### Task 3: Create a targeted Performance Budget workflow

**Files:**
- Create: `.github/workflows/performance-budget.yml`
- Modify: `lighthouserc.js`
- Modify: `scripts/enforcement/perf-budget-config.test.js`
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Add relevant pull-request path filters**

Run for source, assets, build configuration, dependency manifests, Lighthouse configuration, and the workflow itself. Also support a nightly schedule and manual dispatch.

- [ ] **Step 2: Add cancellation and a timeout**

Use PR-number-or-ref concurrency with `cancel-in-progress: true` and a bounded timeout so rapid revisions do not pile up.

- [ ] **Step 3: Use one PR audit and three scheduled/manual audits**

Set `LHCI_RUNS` to `1` for pull requests and `3` otherwise. Parse only a positive integer in `lighthouserc.js`; default to `3` for missing or invalid values.

- [ ] **Step 4: Run the focused performance tests**

Run: `node --test scripts/enforcement/perf-budget-config.test.js scripts/enforcement/workflow-contract.test.js`

Expected: PASS for the route inventory, default three-run configuration, one-run override, triggers, cancellation, and timeout.

### Task 4: Cancel superseded Playwright runs

**Files:**
- Modify: `.github/workflows/playwright-visual.yml`
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Add PR-scoped concurrency**

Use the pull-request number as the concurrency identity and enable `cancel-in-progress` without changing the existing path filters, runner, or browser assertions.

- [ ] **Step 2: Run the workflow contract test**

Run: `node --test scripts/enforcement/workflow-contract.test.js`

Expected: PASS.

## Chunk 3: Integrate, verify, and land safely

### Task 5: Sync the docs-only main change and run repo proof

**Files:**
- Modify only merge-resolved files, if any.

- [ ] **Step 1: Merge current `origin/main` into the task branch**

Run: `git fetch origin && git merge --no-edit origin/main`

Expected: clean merge; stop on conflicts instead of force-pushing.

- [ ] **Step 2: Run the required repo checks**

Run: `npm run lint:content && npm test && npm run verify:release && npm run build:prod && npm run git:merge-check`

Expected: all commands exit `0`.

- [ ] **Step 3: Run the simplify checkpoint**

Review only the current diff for duplicate logic, unclear names, hidden side effects, swallowed errors, dead code, or unnecessary workflow complexity. Apply only task-scoped simplifications, then rerun the affected proof.

### Task 6: Review the exact branch and update PR #480

**Files:**
- No new source files expected.

- [ ] **Step 1: Commit only the intended workflow, test, script, and plan changes**

Use the repo guardrail commit path and verify `git status --short --branch` is clean afterward.

- [ ] **Step 2: Push without force**

Push `codex/consolidate-site-gates` and confirm the remote head equals the local head.

- [ ] **Step 3: Run a full-branch exact-SHA review receipt**

Run the configured Autoreview helper with `--mode branch --base origin/main --ref codex/consolidate-site-gates --merge-receipt <fresh-path>`.

Expected: non-empty clean receipt whose base and head SHAs exactly match current GitHub state.

- [ ] **Step 4: Watch GitHub checks and merge only if the full gate passes**

Required proof: `build` and `release-safety` green, applicable Performance Budget and Playwright checks green, no unresolved review threads, GitHub `MERGEABLE`, exact-head review clean, and no production deploy boundary crossed.

- [ ] **Step 5: Read back main and runtime health**

Confirm the merged main SHA, the main-push Release Safety result, and the latest production Live Smoke status. Do not claim the workflow is shipped from PR checks alone.
