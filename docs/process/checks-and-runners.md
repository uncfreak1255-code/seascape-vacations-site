# Checks And Runners

Read this when a PR check is red, a self-hosted job is queued, or a visual
baseline needs refreshing. Moved from `AGENTS.md` on 2026-10-24; the required
checks and test gates stay in `AGENTS.md` -> Testing.

Which local command proves what, and which CI job repeats it. Run the local
column before pushing; read the CI column when a PR check is red.

| Local command | What it proves | CI job that repeats it |
| --- | --- | --- |
| `npm run build` | Eleventy build under the worktree lock plus availability-output validation | inside `release-safety`, `performance-budget`, `preview-surface` |
| `npm test` (`test:unit`) | `node --test` over `scripts/enforcement`, `scripts/recovery`, `scripts/evals` and `scripts/perf` tests, after a fresh build | inside `release-safety` via `verify:release` |
| `node --test scripts/enforcement/<name>.test.js` | one gate from the Repo Truth table, without rebuilding | same |
| `npm run lint:content` | `content-voice.test.js` and sourced-claim enforcement against the fresh build | inside `release-safety` via `verify:release` |
| `npm run verify:release` | build, full suite and release checks under one lock | `release-safety` |
| `npm run audit:deps` | `npm audit` at moderate on production dependencies | `release-safety` |
| `node scripts/enforcement/run-visual-tests.js tests/visual/accessibility.spec.js` | existing desktop/mobile accessibility assertions with the installed lockfile | inside required `release-safety` when dependency manifests or that workflow change |
| `npm run test:e2e` | 19 guest-flow journeys (desktop and mobile Chromium) against a fresh build | `e2e-flows` |
| `npm run test:visual` | Playwright screenshot diffs against `tests/visual/__screenshots__/` plus the axe spec | `visual-regression` |
| `npm run perf:budget` / `npm run perf:ratchet` | Lighthouse budgets in `lighthouserc.js` and the byte-size ratchet | `performance-budget` |
| `npm run verify:preview-surface -- <url>` | homepage, property and booking-handoff assertions against a served `_site` | `preview-surface` |
| post-deploy smoke trio in `AGENTS.md` -> Deploy | the live production site | `live-smoke` |

The visual runner holds the existing `repo-build` lock through its build,
browser run and server shutdown. A competing build or safe-commit proof in
the same worktree waits, then reports the existing timeout if testing is still
running. Let the visual run finish before retrying that command.

Before publishing browser JavaScript or CSS changes, run `npm run perf:budget`
and then `npm run perf:ratchet` against the fresh reports from that same source.
`verify:release` does not include these performance checks. Inspect byte growth;
use `perf:ratchet:update -- --allow-raise "<reason>"` only for an intentional,
measured increase. The existing commands and required CI check own this proof.

Dependency-manifest and release-workflow changes also install locked Chromium and run the complete existing accessibility spec inside `release-safety`. A failed browser result fails that required job; optional or cancelled visual results do not substitute for it. The dependency comparison fails when its Git range cannot be read.

The visual workflow uses two workers on the self-hosted runner and one on
GitHub-hosted runners. A four-run, counterbalanced local trial on 2026-11-03
reduced median full-suite time from 934.9s to 470.4s (49.7%) with identical
616 passed / 38 skipped results and no retries. Assertions, baselines and
tolerances stayed fixed. Local defaults remain one worker; use `--workers=2`
to reproduce the measured concurrency. CI uploads the native JSON results as
`visual-results` for seven days on success or failure, alongside the existing
failure reports. Full Git history remains unchanged: the blobless checkout
trial did not establish a repeatable benefit.

GitHub rulesets on `main` require exactly three status checks: `build`,
`release-safety` and `performance-budget`. Every other job is informational
and a red one does not block a merge by itself; read it anyway.

| Workflow | Job (check name) | Runs when | Runner | Required |
| --- | --- | --- | --- | --- |
| `release-safety.yml` | `release-safety`, then `build` | every PR to `main` and every push to `main` | `ubuntu-latest` | yes, both |
| `performance-budget.yml` | `performance-budget` | every PR to `main` (no paths filter, so it always reports), daily 09:17 UTC, manual | `ubuntu-latest` | yes; docs-only PRs report without running Lighthouse |
| `playwright-visual.yml` (Playwright Visual Gate) | `visual-regression` | PRs to `main` that touch `src/**`, `eleventy.config.js`, `playwright.config.js`, `tests/visual/**`, the visual scripts or `package-lock.json`; docs-only PRs skip it | Sawyer's own PRs: self-hosted `mac-sawbeck-seascape-vacations-site`; forks and other authors: `macos-latest` | no |
| `e2e-flows.yml` (E2E Guest Flows) | `e2e-flows` | PRs to `main` that touch `src/**`, `eleventy.config.js`, `e2e.config.ts`, `tests/e2e/**`, `scripts/enforcement/serve-static.js` or `package*.json` | same rule as `visual-regression` | no |
| `preview-surface.yml` | `preview-surface` | every PR to `main` | `ubuntu-latest` | no, by design |
| `live-smoke.yml` | `live-smoke` (`report-failure` on `ubuntu-latest`) | daily 10:17 UTC; manual dispatch by Sawyer's account only | self-hosted `[self-hosted, macOS, arm64]` | not a PR check |
| `publish-production.yml` | `publish` | daily 09:05 UTC; manual dispatch by Sawyer's account only | `ubuntu-latest` | not a PR check |
| `update-visual-baselines.yml` | `generate-baselines` | manual dispatch only, by Sawyer's account | self-hosted `[self-hosted, macOS, arm64]` | not a check; see Refreshing visual baselines below |

A self-hosted job that sits in `queued` means the Mac runner is offline, not
that the check failed; it does not fall back to GitHub-hosted compute.

## Refreshing visual baselines and live smoke

- Refresh a committed visual baseline only when the screenshot change is
  intended and you have looked at the new screenshots. Start the
  `update-visual-baselines.yml` workflow for the task branch with the route
  slug in `grep`. It runs only for Sawyer's GitHub account, so start it from
  the Mac session, not from a cloud thread. The bot commit does not start the
  PR checks again; push your next real commit to start them. Run it without
  asking Sawyer when the screenshot change is intended; use only your own PR
  branch and report the run ID and the pushed commit. Never use it to clear a
  diff you did not intend; that is a regression to fix.
- The post-deploy smoke trio (`AGENTS.md` -> Deploy) also runs daily via `.github/workflows/live-smoke.yml`
  (dispatchable manually); a red scheduled run means production drift or stale
  smoke assertions, not necessarily an outage. A scheduled run that does not
  pass opens a `Daily live smoke failed` issue, or comments on the open one.

## How production publishes

Netlify builds the `production` branch using `netlify.toml` (`npm run build`,
publish `_site`). Merges to `main` do not deploy on their own;
`.github/workflows/publish-production.yml` fast-forwards `production` to `main`
once a day at 09:05 UTC, so every merge since the last publish ships in one
build. `scripts/enforcement/netlify-ignore-build.js` still skips that build
when only agent-only paths changed; a missing deploy is usually the skip or a
day with no merges, not an outage. Diagnose with
`docs/runbooks/failed-netlify-deploy.md`.
