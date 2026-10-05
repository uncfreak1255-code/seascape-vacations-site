# Seascape Vacations Site — Agent Entry Point

This repo owns website execution for Seascape Vacations.

Before loading task documents, run `git status --short --branch` and compare
`HEAD` with a freshly fetched `origin/main`. Preserve dirty, divergent, detached,
and existing task checkouts. For new work, use a guarded worktree from current
`origin/main`; for a read-only audit, `git show origin/main:<path>` can supply
current source without changing the checkout. Every session first reads
`docs/process/git-session-rules.md` -> Source currency for the exact route;
the rest of that file is required before edits or publication.

## Load context for the task

Every session reads this entrypoint and `docs/process/agent-safety-standard.md`
after selecting current source. Claude also reads `CLAUDE.md` for its harness
delta; Codex uses the shared rules here. Use the Repo Truth map below to find
the affected source and existing proof, then load only the matching branches:

| When the task involves… | Read before acting |
| --- | --- |
| Behavior diagnosis, a focused fix, or tests | Affected source and existing tests from Repo Truth; read Git Session Rules before edits or publication |
| UI, CSS, templates or layout | `DESIGN.md`, then `docs/process/design-review-workflow.md`; use its specialist/critic and rendered-review lane for meaningful visual changes |
| Public copy or SEO copy | Select the exact brief through `docs/briefs/README.md`, then follow Reading Order For SEO Work and Content Gate below, including all three `docs/style/` sources |
| Measured SEO expansion, title/meta rewrites, or prioritization from analytics | `docs/status/current-state.md`, `docs/status/next-batch.md`, the matching brief and portfolio file; apply the owning measurement gate |
| Business-priority or experiment recommendations | `docs/status/current-state.md` and current evidence from the owning repo; historical forecasts do not set today's priority |
| Browser, DOM, screenshots, Playwright, web search or desktop automation | `docs/process/agent-evidence-routing.md` before selecting a tool |
| Commit, push, PR or merge | `docs/process/git-session-rules.md` and `docs/process/before-merge-checklist.md`; read the user-review or post-merge checklist when entering that phase |
| Skills or workflow changes | `docs/process/skill-policy.md` and `docs/process/learning-contract.md`, plus the affected consumer and proof |

Combine branches when the task spans them. Conditional reading changes what
loads at startup; it does not waive a content, design, safety, measurement or
release requirement. Read linked references at their trigger, using focused
sections and searches rather than concatenating unrelated directories or logs.

## This Repo Owns

- page source
- SEO and GEO implementation
- owner-page and guide-page CRO
- schema and metadata
- internal linking
- tracking hooks that live on the site
- deploy readiness

## This Repo Does Not Own

- company-wide strategy memory
- financial planning
- cross-project decision history
- analytics pipeline logic that belongs in `seascape-analytics`
- email-campaign delivery, sender credentials, schedules, or send receipts;
  policy lives in `seascape-hub/context/operating-canon.md#business-email` and
  execution lives in `seascape-ops`. Three-lane email split (2026-08-20 lock):
  1. Mailchimp is the paid guest-marketing sender (Journey 8592, trigger tag
     `guest-capture`).
  2. Outlook Graph `info@` campaigns / post-stay email are Phase 1 hard-disabled
     in `seascape-ops`. Do not activate.
  3. Owner Graph `info@` is transactional only (form confirmations +
     founder-approved replies).
  Personal Gmail remains prohibited.

## Business Priorities And Experiments

- Start from Sawyer's current objective and the affected source or guest flow.
  Owner acquisition and direct booking are business levers, not permanent
  rankings of the current bottleneck. Verify a ranking against the owning
  business or analytics source before using it to redirect work.
- Status files describe their dated evidence window. Historical holds and
  forecasts do not become current facts because a startup document cites them.
- `docs/status/next-batch.md` governs measured SEO and entity expansion.
  Preserve its thresholds, evidence requirements, and publication gates.
  Missing analytics limits measurement and impact claims; it does not by
  itself block an authorized bug fix, local product prototype, or reversible
  capability trial that has independent source and behavior proof.
- For an AI-workflow or product-improvement request, propose one concrete
  improvement and explain both its upside and the cost of inaction. Prefer an
  existing capability when it serves the outcome. Test a plausible improvement
  locally instead of treating an old toolchain freeze as a permanent veto.
- A local trial needs a named task, isolated checkout, affected surface,
  comparison with the current method, time limit, and stop condition. Judge
  correctness, useful output, and Sawyer intervention; file counts and a
  polished report are not evidence of improvement. Retain or reverse the
  candidate based on that result before expanding its scope.
- Local experiment authority does not authorize paid services, credential or
  permission changes, external sends, production mutation, publication, or
  global configuration activation. Existing owner-intake, content, design,
  privacy, and release requirements still apply. New installed skills, MCPs,
  and workflow layers still require the existing audit and learning contract.

## Non-Negotiable Rules

- root `main` is sync-only
- local non-trivial work happens on `codex/<task>` branches in `.worktrees/<task>`;
  a Claude Code session that its harness pinned to `.claude/worktrees/<name>`
  is already in an isolated worktree and satisfies this rule as-is. Do not
  create a second worktree from inside it, and do not edit the root checkout
  from it (the harness rejects those edits)
- edit source, not `_site`
- never use `DEPLOY THIS FOLDER TO NETLIFY/` as the source of truth
- one serious SEO cluster at a time, with one brief driving it
- no public content PR without one active brief, the content gate read, and passing content lint through `npm run lint:content` or `npm run verify:release`
- review the diff before push, PR, or merge
- any PR changing visible copy on smoke-asserted routes (homepage, `/properties/`, `/property-management/`, `/stays/`) must update `scripts/recovery/assert-live-smoke.js` in the same PR, or the daily live-smoke workflow goes red on a healthy site
- live `/.netlify/functions/*` endpoint paths, metrics `receipts[]` field names, and `verify:*` npm script names have cross-repo consumers in seascape-ops, seascape-hub, and seascape-analytics; check the contract locks in `docs/plans/2026-06-12-v1-implementation-handoff.md` before renaming any of them
- claims about amenities must trace to property truth: no invented equipment, no fake waterfront spread, no padded sleeping-capacity claims
- owner proof claims must trace to approved proof assets or current source truth; do not reuse old sitewide review-count theater
- do not import seomachine code, publishing assumptions, or folder structure directly into this repo; use seomachine only as reference for context rules, brief shape, rewrite workflow, and prioritization concepts
- if a workflow doc conflicts with repo safety docs, the stricter repo rule wins

## Execution Defaults

- Think before coding: state assumptions explicitly, ask when the missing fact matters, push back when a simpler approach exists, and stop to clarify before editing when the path is unclear.
- Simplicity first: make the minimum change that solves the problem. Nothing speculative. No abstractions for single-use code.
- Surgical changes: touch only what you must, match existing style, and do not refactor adjacent code that is not broken unless the task requires it.
- Goal-driven execution: define success criteria early, then loop until the right proof gate verifies the work.
- Documentation impact: start from current `origin/main`; when code changes
  affect active instructions, runbooks, status, source-of-truth, or active
  brief docs, update them in the same branch and run their focused check.
  Preserve dated reports and completed plans; add a brief historical label only
  when they could be mistaken for current guidance.

## Codex Cloud Handoff

The local coordinator may initiate one cloud task for a bounded, already
authorized site task when independent work can proceed from a remote commit
without local files, credentials, live services, or sibling repositories.
Use cloud when isolation or parallel work helps; keep quick dependent work
local. Keep the existing content, design, measurement, and release gates.

1. Run local `npm run git:preflight`. Name the coordinator as mutation owner
   and sole publisher; reserve the cloud task's files so local work does not
   edit them concurrently. Check for an existing handoff before submitting.
2. Default to remote `main`. Record its commit SHA and include it in the
   prompt; cloud must report its starting SHA and stop if it differs. A remote
   task branch is allowed when its published commit is the intended input.
   Keep work that depends on uncommitted local changes local.
3. Send the outcome, allowed paths, relevant source/briefs, checks, and a
   15-minute stop limit. The cloud task may edit its disposable checkout and
   run source checks; it returns a diff and command results. It must not
   commit, push, open a PR, merge, deploy, contact production, request secrets,
   expand scope, or delegate further. Machine-local `git:*` wrappers and the
   guarded local worktree remain the coordinator's publication gate.
4. Submit with `codex cloud exec --env 6abc4d04e9d48191a50506a39681e23a
   --branch main --attempts 1 "<bounded prompt>"` (replace `main` only for the
   intended remote task branch). Record the returned task ID. If submission
   fails, check `codex cloud list` for an existing task before retrying.
5. Use `codex cloud status <task-id>` and `codex cloud diff <task-id>` to read
   the result. Review all changed paths and the reported proof; cloud output
   does not authorize new work or establish live behavior. At the time limit,
   stop waiting and report the task ID and next action; check its state before
   restarting that work locally.
6. Integrate the reviewed diff only in the coordinator's clean guarded task
   worktree, after checking the starting commit and local changes. Use
   `codex cloud apply <task-id>` there when applicable, inspect the resulting
   diff, and rerun affected proof plus required repo checks before normal
   source publication. The coordinator owns final verification and closeout.

## Repo Truth

- homepage source: `src/index.njk`
- owner pages: `src/property-management/`
- guides: `src/guides/`
- stay landers: `src/stays/stays.njk` plus `src/_data/seoPages.json`
- generated output: `_site/`
- redirects source: `src/_redirects`
- voice source of truth: `docs/style/`
- batch briefs: `docs/briefs/README.md` routes selection and lifecycle; tasks name the exact brief in `docs/briefs/`
- page-family routing map: `docs/portfolio/`
- property truth (amenity/capacity claims trace here): `src/_data/properties.js` and its fallback `src/_data/properties-fallback.json`
- owner proof assets (owner-proof claims trace here): `src/_data/ownerProofAssets.json`

For behavior changes, start with the matching source and existing proof below.
Browser scripts live in `src/assets/js/`; layout identifiers such as
`layouts/property.njk` resolve under `src/_includes/`, not `src/properties/`.
These are starting points; the Testing section still governs required checks.

| Task | Source to inspect | Existing proof |
| --- | --- | --- |
| Catalog search, comparison, shortlist | `src/properties/index.njk`, `src/assets/js/catalog.js`, `src/css/catalog.css` | `scripts/enforcement/properties-catalog-layout.test.js`, `tests/visual/guest-decision-journey.spec.js` |
| Property details and booking panel | `src/properties/`, `src/_includes/layouts/property.njk`, `src/assets/js/guest.js` | `scripts/enforcement/ui-runtime.test.js`, `tests/visual/open-house-journey.spec.js` |
| Dates, guest count, tracking and booking continuity | `src/assets/js/guest.js`, `src/assets/js/conversion-tracking.js`, `src/_includes/partials/guest-trip-form.njk` | `scripts/enforcement/trip-continuity.test.js`, `tests/visual/trip-continuity.spec.js` |
| Shared guest shell and styling | `src/_includes/layouts/guest.njk`, `src/_includes/partials/guest-header.njk`, `src/_includes/partials/guest-footer.njk`, `src/css/guest.css` | `scripts/enforcement/shared-shell.test.js`, `scripts/enforcement/internal-link-floor.test.js`, `tests/visual/design-floors.spec.js` |
| Owner inquiry form and public proof | `src/property-management/index.njk`, `src/_includes/partials/owner-evaluation-form.njk`, `src/css/owner.css`, `src/_data/ownerProofAssets.json` | `scripts/enforcement/owner-acquisition.test.js`, `tests/visual/owner-form-steps.spec.js` |
| Live availability lookup behind the booking panel | `netlify/functions/booking-availability.js`, `scripts/booking/stay-availability.js`, `scripts/cache/booking-engine-calendar.js` | `scripts/enforcement/stay-availability.test.js` |
| Booking handoff and guide click lineage (`seascape_booking_handoff_session_id`, `sv_guide_click_id`) | `src/assets/js/conversion-tracking.js` | `scripts/enforcement/booking-handoff.test.js`, `scripts/enforcement/guide-funnel-lineage.test.js` |
| GA4 loading, tracking IDs and PII scrubbing | `src/assets/js/homepage.js`, `src/assets/js/conversion-tracking.js` | `scripts/enforcement/tracking-privacy-ids.test.js`, `scripts/enforcement/tracking-script-coverage.test.js`, `scripts/enforcement/direct-booking-event-smoke.test.js` |
| Guest email capture (homepage exit signup, guide conversion kit) | `src/assets/js/guest.js`, `src/_includes/partials/guide-conversion-kit.njk`, `netlify/functions/guest-email-capture.js` | `scripts/enforcement/home-exit-signup.test.js`, `scripts/enforcement/guide-conversion.test.js`, `scripts/enforcement/guest-capture-bot-guard.test.js` |
| Homepage hero phrase, ticker and parallax | `src/assets/js/hero-v2.js`, `src/index.njk` | `scripts/enforcement/ui-runtime.test.js` (append `?visual-test=1` to freeze motion in screenshots) |
| Header menu button state | `src/assets/js/guest-menu.js` | no unit test; covered only by `tests/visual/*.spec.js` |
| Live-smoke assertions after visible-copy changes | `scripts/recovery/assert-live-smoke.js` | `scripts/enforcement/recovery-smoke.test.js` |

## Workflow Layer

- process rules live in `docs/process/`
- `docs/process/agent-evidence-routing.md` is the default tool-choice router:
  Browser explains, Chrome diagnoses, DOM confirms structure, Playwright
  proves, web search updates current external truth, and Computer Use handles
  edge cases.
- the site learning contract lives in `docs/process/learning-contract.md`; it defines what inputs the site may learn from, what approvals are required, and what receipt proves public claims or workflow promotion
- current execution context lives in `docs/status/`
- `docs/status/next-batch.md` is the canonical reread handoff surface for volatile measurement truth; after every reread it must say exactly one of `blocked by freshness`, `fresh but below threshold`, or `open next batch`, plus one concrete next move
- `docs/status/current-state.md` should keep durable repo truth only and must not duplicate volatile reread windows or `data_date` details that belong in `docs/status/next-batch.md`
- the five SEO OS role cards live in `.claude/agents/`; the on-demand role model and local skill/external-pack policy load from `docs/process/five-roles.md` and `docs/process/skill-policy.md`
- active repo-local skills are limited to `.agents/skills/accessibility`, `.agents/skills/content-quality-rubric`, `.agents/skills/design-review`, `.agents/skills/internal-link-targeting`, `.agents/skills/next-batch-gate`, `.agents/skills/owner-opportunity-intake`, `.agents/skills/owner-reply-intake`, `.agents/skills/owner-proof-integrity`, `.agents/skills/page-cro`, `.agents/skills/property-truth-regeneration`, `.agents/skills/schema-markup`, `.agents/skills/seascape-design-critic`, `.agents/skills/seascape-design-specialist`, `.agents/skills/serp-ctr-title-rewrite`, `.agents/skills/site-architecture`, and `.agents/skills/openseo-review`
- `.claude/skills/` should mirror only those active site/design skills; copied marketing, deploy, monthly reset, and generic SEO skills are not live authority
- global marketing skills in `/Users/sawbeck/.codex/skills/` may be used as advisory helpers for CRO, SEO, copy, psychology, analytics, and growth decisions, but they do not override this repo's source files, briefs, status docs, or five-role workflow
- canonical lane for internal-link family/page inbound planning is `.agents/skills/internal-link-targeting`
- canonical lane for live SERP CTR title-rewrite recommendation packs is `.agents/skills/serp-ctr-title-rewrite`; ship title/meta edits only when `docs/status/next-batch.md` is not `blocked by freshness`
- AI discovery, GEO/AEO, and schema work follows the Search Operator role in `.claude/agents/search-operator.md` and `docs/process/seo-competitor-operating-loop.md` for proof and attack research, plus `.agents/skills/schema-markup` for implementation rules
- external SEO/GEO packs such as `geo-optimizer-skill`, `gtm-engineer-skills`, `searchstack-aeo`, `claude-seo`, `akii-seo-ai-search-optimizer`, and `aeo.js` are donor references only; do not install or mirror them here without a fresh `repo-dev-setup` inventory, repeated repo-specific need, and a smoke-tested win
- AI citation monitoring and Search Console/GA4 proof systems belong in `seascape-analytics`; this repo may expose site endpoints and markup, but it must not become the measurement control plane
- OpenSEO is a bounded local read surface for saved project state and rank
  history. Its project-scoped Codex MCP allowlist and cost/ownership rules live
  in `docs/process/openseo.md`. It does not replace the direct DataForSEO Gate 0
  path or analytics-owned measurement receipts.
- if work writes durable state into another repo, route it through a clean
  keeper branch or PR from that repo's current `origin/main`

## Agent Skills

Skills are maintained in `.agents/skills/`; `.claude/skills/<name>` is a
relative link to the same file, so both paths resolve to one procedure. Use
native reasoning for routine site work; a skill never replaces the gates,
approval, or proof requirements in this file.
Codex discovers `.agents/skills` natively and each skill's frontmatter states
its trigger, so no per-skill index is kept here.

## Environment

- `npm run build` runs `scripts/enforcement/build-site.js`, a custom
  enforcement wrapper (worktree lock, Hostaway build-cache sync, Eleventy,
  property-availability output validation) — NOT raw Eleventy.

## Commands

- Visual proof capture: `npm run proof:visual`
- Safe commit: `npm run git:safe-commit`
- Merge check: `npm run git:merge-check`
- Design lane worktree: `npm run design:lane -- "<task>"`
- Read-only donor route report: `npm run design:donors -- "<task>"`

## Testing

- Fast gate for copy-only work: `npm run lint:content`
- Fast gate for structural source work: `npm run build`
- Full pre-PR gate: `npm run verify:release`. It builds once, then runs the
  full suite (including content lint against that fresh build) and release checks
  under one worktree lock. Standalone `npm test` and `npm run lint:content`
  still build fresh; use them for iteration rather than repeating them before
  an unchanged full release verification.
  On a dirty worktree, stage the task's new files and pass the approved base
  explicitly, for example `npm run verify:release -- --range origin/main`;
  the verifier preserves its existing requirement for an explicit dirty-tree range.
- Visual changes also require: `npm run test:visual` and fresh desktop/mobile
  screenshot proof. That gate diffs the committed desktop and mobile baselines
  in `tests/visual/__screenshots__/` and includes an axe accessibility spec;
  still attach desktop and mobile screenshots for subjective changes.
- Refresh a committed visual baseline only when the screenshot change is
  intended and you have looked at the new screenshots. Start the
  `update-visual-baselines.yml` workflow for the task branch with the route
  slug in `grep`. It runs only for Sawyer's GitHub account, so start it from
  the Mac session, not from a cloud thread. The bot commit does not start the
  PR checks again; push your next real commit to start them. Run it without
  asking Sawyer when the screenshot change is intended; use only your own PR
  branch and report the run ID and the pushed commit.
- Live post-merge smoke when the release surface matters:
  `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- The same smoke trio also runs daily via `.github/workflows/live-smoke.yml`
  (dispatchable manually); a red scheduled run means production drift or stale
  smoke assertions, not necessarily an outage. A scheduled run that does not
  pass opens a `Daily live smoke failed` issue, or comments on the open one

## Checks And Runners

Which local command proves what, and which CI job repeats it. Run the local
column before pushing; read the CI column when a PR check is red.

| Local command | What it proves | CI job that repeats it |
| --- | --- | --- |
| `npm run build` | Eleventy build under the worktree lock plus availability-output validation | inside `release-safety`, `performance-budget`, `preview-surface` |
| `npm test` (`test:unit`) | `node --test` over `scripts/enforcement`, `scripts/recovery`, `scripts/evals` and `scripts/perf` tests, after a fresh build | inside `release-safety` via `verify:release` |
| `node --test scripts/enforcement/<name>.test.js` | one gate from the Repo Truth table, without rebuilding | same |
| `npm run lint:content` | `content-voice.test.js` against the fresh build | inside `release-safety` via `verify:release` |
| `npm run verify:release` | build, full suite and release checks under one lock | `release-safety` |
| `npm run audit:deps` | `npm audit` at moderate on production dependencies | `release-safety` |
| `npm run test:visual` | Playwright screenshot diffs against `tests/visual/__screenshots__/` plus the axe spec | `visual-regression` |
| `npm run perf:budget` / `npm run perf:ratchet` | Lighthouse budgets in `lighthouserc.js` and the byte-size ratchet | `performance-budget` |
| `npm run verify:preview-surface -- <url>` | homepage, property and booking-handoff assertions against a served `_site` | `preview-surface` |
| smoke trio under Testing | the live production site | `live-smoke` |

GitHub rulesets on `main` require exactly three status checks: `build`,
`release-safety` and `performance-budget`. Every other job is informational
and a red one does not block a merge by itself; read it anyway.

| Workflow | Job (check name) | Runs when | Runner | Required |
| --- | --- | --- | --- | --- |
| `release-safety.yml` | `release-safety`, then `build` | every PR to `main` and every push to `main` | `ubuntu-latest` | yes, both |
| `performance-budget.yml` | `performance-budget` | every PR to `main` (no paths filter, so it always reports), daily 09:17 UTC, manual | `ubuntu-latest` | yes; docs-only PRs report without running Lighthouse |
| `playwright-visual.yml` (Playwright Visual Gate) | `visual-regression` | PRs to `main` that touch `src/**`, `eleventy.config.js`, `playwright.config.js`, `tests/visual/**`, the visual scripts or `package-lock.json`; docs-only PRs skip it | Sawyer's own PRs: self-hosted `mac-sawbeck-seascape-vacations-site`; forks and other authors: `macos-latest` | no |
| `preview-surface.yml` | `preview-surface` | every PR to `main` | `ubuntu-latest` | no, by design |
| `live-smoke.yml` | `live-smoke` (`report-failure` on `ubuntu-latest`) | daily 10:17 UTC; manual dispatch by Sawyer's account only | self-hosted `[self-hosted, macOS, arm64]` | not a PR check |
| `update-visual-baselines.yml` | `generate-baselines` | manual dispatch only, by Sawyer's account | self-hosted `[self-hosted, macOS, arm64]` | not a check; see Testing for the recipe |

A self-hosted job that sits in `queued` means the Mac runner is offline, not
that the check failed; it does not fall back to GitHub-hosted compute.

## Deploy Configuration

- Deployable: `yes`
- Deploy surface: `Netlify`
- Production URL: `https://seascape-vacations.com`
- How production deploys: Netlify builds every merge to `main` using
  `netlify.toml` (`npm run build`, publish `_site`). There is no manual deploy
  command and no deploy step in GitHub Actions. `scripts/enforcement/netlify-ignore-build.js`
  skips the deploy for agent-only merges; a missing deploy after a merge is
  usually that skip, not an outage. Diagnose with `docs/runbooks/failed-netlify-deploy.md`.
- Post-deploy proof: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- "Shipped" means: merged to `main`, Netlify built successfully, and the
  relevant live smoke checks passed

## Reading Order For SEO Work

1. `docs/status/current-state.md`
2. the active brief in `docs/briefs/`
3. `docs/process/content-quality-gate.md`
4. the relevant page-family file in `docs/portfolio/`
5. `docs/style/voice.md`
6. `docs/style/banned-patterns.md`
7. `docs/style/approved-examples.md`
8. the source file you are about to touch

If a required source is stale, refresh the affected evidence before scaling a
measured batch or making an impact claim. Do not repair unrelated documentation
as a prerequisite for a bounded task with independent proof. Apply the
"Business Priorities And Experiments" section above to local trials.

## Required Batch Workflow

Full order of operations: `docs/process/batch-workflow.md`. The visible-copy
order is non-negotiable: **Draft the copy**, then **Remove internal wording**,
then **Check voice and specificity** using the active brief and `docs/style/`.
Complete these steps before content lint through `npm run lint:content` or
the full `npm run verify:release` gate.

## Content Gate

For any PR that changes public copy in `src/`:

- read the active brief plus `docs/process/content-quality-gate.md`
- read `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`
- run the visible-copy lane in order: **Draft the copy** for the draft, **Remove internal wording** to strip internal/process wording, then **Check voice and specificity** for the final pass on reader copy
- keep reader copy, proof copy, and agent copy separate
- pass `npm run lint:content` or the full `npm run verify:release` before push,
  PR, or merge; both run the same content checks against fresh rendered output

## Design Review Workflow

- For Seascape mockups, marketing page concepts, homepage/lander direction
  work, guide/article/blog-style pages, owner pages, research pages, or any
  meaningful website visual change, the default design-thinking lane is the
  repo-local `seascape-design-specialist` skill before implementation.
- `seascape-design-specialist` must run `seascape-design-critic` as the taste
  gate before a concept is treated as good enough.
- Codex should prepare the design packet first: repo/source truth, page goal,
  audience, `DESIGN.md` constraints, existing patterns, proof/copy boundaries,
  URLs or screenshots, implementation risks, and responsive requirements.
- The design launcher automatically classifies the page or guide family and
  scans locally cached Codex and Claude plugin skill metadata for relevant
  interface, product-design, imagery, map, chart, comparison, or interactive
  artifact donors. Use a discovered donor only when the current session exposes
  it as available. The scan never installs, copies, globally loads, or promotes
  a donor, and donors never override repo truth.
- If Sawyer approves a design direction or mockup, implement that approved
  direction closely. Do not reinterpret it into a different layout, art
  direction, hierarchy, CTA treatment, or component style. Any deviation must
  be named and justified by repo truth, `DESIGN.md`, accessibility,
  performance, responsive behavior, or source constraints.
- Codex still owns repo truth, `DESIGN.md`, implementation, and verification.
- `DESIGN.md` is the visual law. Figma, Stitch, and other outside tools are
  donor surfaces only unless Sawyer explicitly says otherwise.
- Claude Design is the approved mock surface (Sawyer, 2026-09-16) only while
  its "Seascape Vacations Design System" project is synced from this repo by
  `npm run design:sync` (`scripts/design/design-sync/`). A mock built there
  from the Waterline system and approved by Sawyer is the implementation
  contract under the workflow below; a mock built from the legacy layers in
  that project is not. Re-sync after any PR that touches `DESIGN.md`,
  `src/css/{base,guest,arrival,catalog}.css` or the guest partials.
- For any meaningful visual change, including layout, spacing, typography, color, imagery, iconography, CTA treatment, or motion, run the repo flow in `docs/process/design-review-workflow.md`.
- The required rendered QA loop for visual changes is the repo-local `design-review` skill (`.agents/skills/design-review`). Use it after implementation and before human review so the review surface is screenshots plus live route checks, not code alone.
- Start a fresh repo-local design worktree with `npm run design:lane -- "<task>"`
  or `./scripts/design/codex-seascape-design "<task>"` when you want the
  specialist/critic lane, guide-family route, and local donor scan in one
  command. Use `npm run design:donors -- "<task>"` for a read-only route report.
- If an outside design tool introduces a new pattern or style direction, propose it as a `DESIGN.md` change first, then implement after that design law is explicit.

## Design System

Before UI work, read `DESIGN.md`; treat it as the visual source of truth.
Do not invent colors, fonts, spacing, border radius, shadows, or component styles unless Sawyer explicitly asks for a design-system change.
Treat any edit to a shared header, footer or nav partial as an SEO change as well as a visual one: it redistributes internal links across every built page at once. Run `node --test scripts/enforcement/internal-link-floor.test.js` against a fresh build, and do not read a green visual gate as proof a shell edit was safe — its per-route pixel tolerance absorbed an entire new footer column on 2026-09-10 without a single diff.
If `seascape-design-specialist`, Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first when it changes the visual law.

## Writeback Boundary

If the work changes Seascape’s business understanding, write back to:

- `/Users/sawbeck/Projects/seascape-hub`

Do not dump full implementation logs there.
Do not mutate whatever local sibling checkout happens to exist on disk; land
durable writebacks through a clean keeper branch or PR in the target repo.

## Closeout Rule

Agents may not hand site work back as local dirt. A task is not complete
because a checkout is dirty, a worktree is left on detached `HEAD`, or cleanup
is left for Sawyer. The worker owns verification, keeper branch or PR, and
branch/worktree cleanup unless a named blocker stops the lane.
