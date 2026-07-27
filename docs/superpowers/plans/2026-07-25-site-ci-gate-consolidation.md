# Site CI Gate Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce duplicate GitHub Actions work without weakening the required build, release-safety, Lighthouse, visual, or live-production checks.

**Architecture:** Make `Release Safety` the authoritative deterministic gate for pull requests and main pushes, with a compatibility `build` job so the existing ruleset remains satisfied. Keep Lighthouse in a separate path-filtered, cancellable workflow using the proven three-run median, and keep Playwright and Live Smoke as independent browser and production gates.

**Tech Stack:** GitHub Actions YAML, Node.js 22, npm, Node test runner, Eleventy, Lighthouse CI, Playwright.

---

## Chunk 1: Preserve required checks while removing duplicate work

### Task 1: Lock the workflow contract in tests

**Files:**
- Create: `scripts/enforcement/workflow-contract.test.js`
- Modify: `scripts/enforcement/perf-budget-config.test.js`

- [ ] **Step 1: Write a failing workflow contract test**

Assert that `release-safety.yml` runs on pull requests and main pushes, has cancellation and a timeout, retains a job named `release-safety`, and exposes a dependent job named `build`. Keep only the Release Safety assertions in this first red/green unit; add Performance Budget and Playwright assertions in Tasks 3 and 4 so each planned commit can be green.

Use this fail-closed assertion shape in `scripts/enforcement/workflow-contract.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const readWorkflow = (filename) =>
  fs.readFileSync(path.join(projectRoot, ".github", "workflows", filename), "utf8");

test("release safety preserves main coverage and both required check names", () => {
  const workflow = readWorkflow("release-safety.yml");
  assert.match(workflow, /pull_request:\s*\n\s+branches:/);
  assert.match(workflow, /push:\s*\n\s+branches:/);
  assert.match(workflow, /release-safety:\s*\n\s+name:\s*release-safety/);
  assert.match(workflow, /\n  build:\s*\n\s+name:\s*build\s*\n\s+needs:\s*release-safety/);
  assert.match(workflow, /\n\s+if:\s*always\(\)/);
  assert.match(workflow, /needs\.release-safety\.result[^\n]+success/);
});
```

- [ ] **Step 2: Run the Release Safety contract test and confirm it fails**

Run: `node --test --test-name-pattern="release safety" scripts/enforcement/workflow-contract.test.js`

Expected: FAIL because main-push coverage, PR/ref concurrency, and the fail-closed compatibility job are not implemented yet.

### Task 2: Make Release Safety authoritative and non-duplicative

**Files:**
- Modify: `.github/workflows/release-safety.yml`
- Delete: `.github/workflows/pr-check.yml`
- Modify: `package.json`
- Modify: `scripts/enforcement/verify-release.js`
- Modify: `scripts/enforcement/direct-booking-event-smoke.test.js`
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Preserve both pull-request and main-push coverage**

Keep `pull_request` and `push: branches: [main]`. Give concurrency a PR-number-or-ref fallback so main pushes do not share an empty group, and add a bounded job timeout.

- [ ] **Step 2: Audit dependencies only when dependency files change**

Use the existing base/head range to detect `package.json` or `package-lock.json` changes. Run the existing `npm run audit:deps` policy—`npm audit --audit-level=moderate --omit=dev`—only for those pull requests, while retaining the same audit on direct main pushes. Add an exact package-script assertion so severity and production-only scope cannot drift silently.

- [ ] **Step 3: Build once and run tests without rebuilding**

Add `test:unit` as the direct Node test command. Keep `npm test` backward-compatible, but change the release verifier's test step to `npm run test:unit` because the verifier already performs the production build first.

- [ ] **Step 4: Retain the required `build` context without duplicating the build**

Add a minimal `build` job with `needs: release-safety` and `name: build`. It should report that the authoritative gate passed; it must not reinstall dependencies or rebuild the site.

The job must fail closed instead of becoming a neutral skipped check:

```yaml
  build:
    name: build
    needs: release-safety
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Confirm authoritative gate passed
        run: |
          if [ "${{ needs.release-safety.result }}" != "success" ]; then
            echo "release-safety did not pass."
            exit 1
          fi
          echo "Build and tests passed in release-safety."
```

- [ ] **Step 5: Run focused release tests**

Run: `node --test scripts/enforcement/workflow-contract.test.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/design-lint.test.js`

Expected: PASS, proving the required contexts and live-smoke ownership contract remain present.

- [ ] **Step 6: Commit the deterministic-gate unit**

Run:

```bash
git add .github/workflows/release-safety.yml .github/workflows/pr-check.yml package.json scripts/enforcement/verify-release.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/workflow-contract.test.js
npm run git:safe-commit -- -m "ci: consolidate deterministic site gate"
```

## Chunk 2: Preserve performance and visual proof with lower usage

### Task 3: Create a targeted Performance Budget workflow with stable sampling

**Files:**
- Create: `.github/workflows/performance-budget.yml`
- Corrective restore: `lighthouserc.js` (remove the failed one-run experiment and return to the fixed three-run behavior on `origin/main`)
- Corrective restore: `scripts/enforcement/perf-budget-config.test.js` (remove the one-run override test and return to the fixed three-run contract on `origin/main`)
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Add relevant pull-request path filters**

First add the Performance Budget assertions to `workflow-contract.test.js` and run `node --test --test-name-pattern="performance budget" scripts/enforcement/workflow-contract.test.js`; expect failure because the workflow does not exist. Then add the workflow for source, assets, build configuration, dependency manifests, Lighthouse configuration, nightly schedule, and manual dispatch.

The path list must include every Eleventy pass-through asset that affects rendering or transfer size:

```yaml
    paths:
      - "src/**"
      - "images/**"
      - "css/**"
      - "js/**"
      - "hero-optimized.jpg"
      - "hero-mobile.jpg"
      - "*.png"
      - "*.webp"
      - "*.avif"
      - "config/perf-budget.json"
      - "scripts/enforcement/build-site.js"
      - "scripts/perf/**"
      - "eleventy.config.js"
      - "lighthouserc.js"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/performance-budget.yml"
```

- [ ] **Step 2: Add cancellation and a timeout**

Use PR-number-or-ref concurrency with `cancel-in-progress: true` and a bounded timeout so rapid revisions do not pile up.

- [ ] **Step 3: Keep the proven three-run median**

Keep `lighthouserc.js` at `numberOfRuns: 3` for every invocation. A GitHub run proved that a single sample produced a false red (`total-blocking-time` 1971.5ms on the homepage against the 300ms budget), while the previous three-run lane was stable. Usage savings come from path filtering and cancellation, not weaker sampling.

```js
collect: {
  staticDistDir: "./_site",
  url: budgetRoutes.map((route) => `http://localhost${route}`),
  numberOfRuns: 3,
}
```

The workflow job uses the value directly:

```yaml
concurrency:
  group: performance-budget-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  performance-budget:
    name: performance-budget
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run perf:budget:check
```

- [ ] **Step 4: Run the focused performance tests**

Run: `node --test scripts/enforcement/perf-budget-config.test.js scripts/enforcement/workflow-contract.test.js`

Expected: PASS for the route inventory, fixed three-run configuration, triggers, cancellation, and timeout.

- [ ] **Step 5: Checkpoint the stable-sampling correction**

Stage the new workflow plus both files that reverse the failed one-run experiment. Even though the two restored files have no final effective diff from `origin/main`, they are intentionally dirty relative to the previous local commit and must be included in this corrective checkpoint:

```bash
git add .github/workflows/performance-budget.yml lighthouserc.js scripts/enforcement/perf-budget-config.test.js scripts/enforcement/workflow-contract.test.js
npm run git:safe-commit -- -m "ci: restore stable Lighthouse sampling"
```

### Task 4: Cancel superseded Playwright runs

**Files:**
- Modify: `.github/workflows/playwright-visual.yml`
- Test: `scripts/enforcement/workflow-contract.test.js`

- [ ] **Step 1: Add PR-scoped concurrency**

Use the pull-request number as the concurrency identity and enable `cancel-in-progress` without changing the existing path filters, runner, or browser assertions.

Before implementation, add only the visual assertion and run `node --test --test-name-pattern="visual regression" scripts/enforcement/workflow-contract.test.js`; expect failure because concurrency is absent.

```yaml
concurrency:
  group: playwright-visual-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

- [ ] **Step 2: Run the workflow contract test**

Run: `node --test scripts/enforcement/workflow-contract.test.js`

Expected: PASS.

- [ ] **Step 3: Commit the performance and cancellation unit**

Run:

```bash
git add .github/workflows/performance-budget.yml .github/workflows/playwright-visual.yml lighthouserc.js scripts/enforcement/perf-budget-config.test.js scripts/enforcement/workflow-contract.test.js
npm run git:safe-commit -- -m "ci: preserve performance proof with bounded runs"
```

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
- Modify: `docs/superpowers/plans/2026-07-25-site-ci-gate-consolidation.md`
- Modify: `scripts/enforcement/workflow-contract.test.js`
- Corrective checkpoint from Task 3: `.github/workflows/performance-budget.yml`, `lighthouserc.js`, and `scripts/enforcement/perf-budget-config.test.js`

- [ ] **Step 1: Commit only the intended workflow, test, script, and plan changes**

Run the exact guardrail path, then verify the worktree is clean:

```bash
git add .github/workflows/performance-budget.yml lighthouserc.js scripts/enforcement/perf-budget-config.test.js scripts/enforcement/workflow-contract.test.js docs/superpowers/plans/2026-07-25-site-ci-gate-consolidation.md
npm run git:safe-commit -- -m "docs: record site gate consolidation proof"
git status --short --branch
```

- [ ] **Step 2: Push without force**

Run:

```bash
git push origin codex/consolidate-site-gates
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/codex/consolidate-site-gates)"
```

- [ ] **Step 3: Run a full-branch exact-SHA review receipt**

Run:

```bash
review_receipt_dir="$(mktemp -d)"
/Users/sawbeck/.codex/skills/autoreview/scripts/autoreview \
  --mode branch \
  --base origin/main \
  --ref codex/consolidate-site-gates \
  --merge-receipt "$review_receipt_dir/merge-review.json"
```

Expected: non-empty clean receipt whose base and head SHAs exactly match current GitHub state.

- [ ] **Step 4: Watch GitHub checks and merge only if the full gate passes**

Required proof: `build` and `release-safety` green, applicable Performance Budget and Playwright checks green, no unresolved review threads, GitHub `MERGEABLE`, exact-head review clean, and no production deploy boundary crossed.

- [ ] **Step 5: Read back main and runtime health**

Merging this repo can trigger a production Netlify deploy, so stop before merge unless that production action is approved in the current turn. After an approved merge, bind every readback to the merged SHA:

```bash
merged_sha="$(gh pr view 480 --repo uncfreak1255-code/seascape-vacations-site --json mergeCommit --jq .mergeCommit.oid)"
netlify_state=""
for attempt in {1..24}; do
  netlify_state="$(gh api "repos/uncfreak1255-code/seascape-vacations-site/commits/$merged_sha/status" --jq '[.statuses[] | select(.context | test("^netlify/.+/deploy$"))][0].state // ""')"
  [ "$netlify_state" = "success" ] && break
  sleep 10
done
test "$netlify_state" = "success"
dispatch_started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
gh workflow run live-smoke.yml --repo uncfreak1255-code/seascape-vacations-site --ref main
live_run_id=""
for attempt in {1..12}; do
  live_run_id="$(gh run list --repo uncfreak1255-code/seascape-vacations-site --workflow live-smoke.yml --branch main --event workflow_dispatch --limit 20 --json databaseId,headSha,createdAt --jq '[.[] | select(.headSha == "'"$merged_sha"'" and .createdAt >= "'"$dispatch_started"'")][0].databaseId // ""')"
  [ -n "$live_run_id" ] && break
  sleep 5
done
test -n "$live_run_id"
gh run watch "$live_run_id" --repo uncfreak1255-code/seascape-vacations-site --exit-status
```

The production status selector requires the exact main commit's Netlify production context to succeed. The Live Smoke selector requires both `headSha == merged_sha` and a creation time after this dispatch. A pre-merge scheduled smoke is stale and cannot support a shipped claim.
