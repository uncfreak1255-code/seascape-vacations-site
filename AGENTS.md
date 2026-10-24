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
delta. Use Repo Truth below to find the affected source and existing proof,
then load only the matching branches:

| When the task involves… | Read before acting |
| --- | --- |
| Behavior diagnosis, a focused fix, or tests | Affected source and existing tests from Repo Truth; read Git Session Rules before edits or publication |
| UI, CSS, templates or layout | `DESIGN.md`, then `docs/process/design-review-workflow.md`; Design below |
| Public copy or SEO copy | Select the exact brief through `docs/briefs/README.md`, then follow Content Gate below |
| Measured SEO expansion, title/meta rewrites, or prioritization from analytics | `docs/status/current-state.md`, `docs/status/next-batch.md`, the matching brief and portfolio file; apply the owning measurement gate |
| Business-priority, experiment, or capability-trial recommendations | Business Priorities below, `docs/process/learning-contract.md`, and current evidence from the owning repo |
| Browser, DOM, screenshots, Playwright, web search or desktop automation | `docs/process/agent-evidence-routing.md` before selecting a tool |
| Commit, push, PR or merge | `docs/process/git-session-rules.md` and `docs/process/before-merge-checklist.md`; read the user-review or post-merge checklist when entering that phase |
| A red or queued CI check, a visual-baseline refresh, or a missing Netlify deploy | `docs/process/checks-and-runners.md` |
| Submitting or integrating a Codex cloud task | `docs/process/codex-cloud-handoff.md` |
| Skills, SEO tooling, or workflow changes | `docs/process/skill-policy.md`, `docs/process/learning-contract.md`, and `docs/process/openseo.md` (SEO starts from local OpenSEO) |

Combine branches when the task spans them. Conditional reading never waives a
content, design, safety, measurement or release requirement; read each linked
reference at its trigger, in focused sections.

## Ownership

This repo owns page source, SEO and GEO implementation, owner-page and
guide-page CRO, schema and metadata, internal linking, site-side tracking
hooks, and deploy readiness.

It does not own strategy memory, financial planning, cross-project decision
history, analytics pipelines or AI-citation / GSC / GA4 proof systems
(`seascape-analytics`; this repo exposes endpoints and markup only), or email
delivery, sender credentials, schedules, or send receipts. Email policy lives in
`seascape-hub/context/operating-canon.md#business-email` and execution in
`seascape-ops` (2026-08-20 lock): Mailchimp is the paid guest-marketing sender
(Journey 8592, tag `guest-capture`); Outlook Graph `info@` campaigns and
post-stay email stay Phase 1 hard-disabled (do not activate); owner Graph `info@` is
transactional only (form confirmations and founder-approved replies); personal
Gmail is prohibited.

## Business Priorities And Experiments

- Start from Sawyer's current objective and the affected source or guest flow.
  Verify any ranking of the bottleneck (owner acquisition, direct booking)
  against the owning business or analytics source before redirecting work;
  dated holds and forecasts in status files are not current facts.
- `docs/status/next-batch.md` governs measured SEO and entity expansion;
  preserve its thresholds, evidence requirements, and publication gates.
  Missing analytics limits measurement and impact claims; it does not block an
  authorized bug fix, local prototype, or reversible capability trial with
  independent source and behavior proof.
- For an AI-workflow or product-improvement request, propose one concrete
  improvement with its upside and cost of inaction, prefer an existing
  capability, and test it locally; an old toolchain freeze is not a permanent
  veto. Trials follow `docs/process/learning-contract.md` -> Local Capability
  Trials.

## Non-Negotiable Rules

- root `main` is sync-only
- local non-trivial work happens on `codex/<task>` branches in `.worktrees/<task>`;
  a Claude Code session pinned to `.claude/worktrees/<name>` already satisfies
  this (see `CLAUDE.md`)
- edit source, not `_site`
- never use `DEPLOY THIS FOLDER TO NETLIFY/` as the source of truth
- one serious SEO cluster at a time, with one brief driving it
- no public content PR without one active brief, the content gate read, and passing content lint through `npm run lint:content` or `npm run verify:release`
- review the diff before push, PR, or merge
- any PR changing visible copy on smoke-asserted routes (homepage, `/properties/`, `/property-management/`, `/stays/`) must update `scripts/recovery/assert-live-smoke.js` in the same PR, or the daily live-smoke workflow goes red on a healthy site
- live `/.netlify/functions/*` endpoint paths, metrics `receipts[]` field names, and `verify:*` npm script names have cross-repo consumers in seascape-ops, seascape-hub, and seascape-analytics; check the contract locks in `docs/plans/2026-06-12-v1-implementation-handoff.md` before renaming any of them
- claims about amenities must trace to property truth: no invented equipment, no fake waterfront spread, no padded sleeping-capacity claims
- owner proof claims must trace to approved proof assets or current source truth; do not reuse old sitewide review-count theater
- use seomachine only as a reference for context rules, brief shape, rewrite workflow, and prioritization; never import its code, publishing assumptions, or folder structure
- when code changes affect active instructions, runbooks, status, source-of-truth, or active brief docs, update them in the same branch and run their focused check; label dated reports historical only when they could pass for current guidance
- if a workflow doc conflicts with repo safety docs, the stricter repo rule wins

## Repo Truth

- homepage `src/index.njk`; owner pages `src/property-management/`; guides
  `src/guides/`; stay landers `src/stays/stays.njk` plus `src/_data/seoPages.json`;
  redirects `src/_redirects`; generated output `_site/`
- voice: `docs/style/`; briefs: `docs/briefs/README.md` routes selection and
  lifecycle; page-family map: `docs/portfolio/`
- property truth (amenity/capacity claims trace here): `src/_data/properties.js`
  and its fallback `src/_data/properties-fallback.json`
- owner proof assets (owner-proof claims trace here): `src/_data/ownerProofAssets.json`
- status: `docs/status/next-batch.md` is the canonical reread handoff surface
  for volatile measurement truth; after every reread it must say exactly one of
  `blocked by freshness`, `fresh but below threshold`, or `open next batch`,
  plus one concrete next move. `docs/status/current-state.md` keeps durable
  repo truth only, never reread windows or `data_date` details.
- skills: `.agents/skills/` (`.claude/skills/` mirrors the active ones;
  Claude-only exceptions in `.agents/skills-divergence.json`); SEO role cards:
  `.claude/agents/`. A skill never replaces the gates, approval, or proof
  requirements in this file.

For behavior changes, start with the matching source and existing proof below.
Browser scripts live in `src/assets/js/`; layout identifiers such as
`layouts/property.njk` resolve under `src/_includes/`, not `src/properties/`.
Testing below still governs required checks.

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
| Homepage scenes and native trip search | `src/assets/js/guest.js`, `src/index.njk` | `scripts/enforcement/ui-runtime.test.js`, `tests/visual/waterline-scenes.spec.js`, `tests/e2e/site-flows.e2e.ts` |
| Header menu button state | `src/assets/js/guest-menu.js` | no unit test; covered only by `tests/visual/*.spec.js` |
| Live-smoke assertions after visible-copy changes | `scripts/recovery/assert-live-smoke.js` | `scripts/enforcement/recovery-smoke.test.js` |

## Testing

`npm run build` is the `scripts/enforcement/build-site.js` wrapper (worktree
lock, Hostaway cache sync, Eleventy, availability validation).

- Fast gate for copy-only work: `npm run lint:content`
- Fast gate for structural source work: `npm run build`
- Full pre-PR gate: `npm run verify:release`. It builds once, then runs the
  full suite (including content lint) and release checks under one worktree
  lock; use standalone `npm test` and `npm run lint:content` for iteration, not
  before an unchanged full verification. On a dirty worktree, stage the task's
  new files and pass the base explicitly:
  `npm run verify:release -- --range origin/main`.
- Visual changes also require `npm run test:visual` (committed desktop/mobile
  baselines plus an axe spec) and fresh desktop and mobile screenshots.
- When changing a flow covered by the [TesterArmy journey guide](docs/runbooks/tester-army-e2e.md),
  run `npm run test:e2e -- --grep '<test title>'`; when fixing a demonstrated
  flow bug, add or update a journey that fails on the bug and passes on the fix.
- GitHub rulesets on `main` require exactly three checks: `build`,
  `release-safety` and `performance-budget`. Other jobs are informational; read
  them anyway.

## Deploy

- Netlify publishes `https://seascape-vacations.com` from `production`, which
  `publish-production.yml` fast-forwards to `main` daily at 09:05 UTC.
- Agents never push to `production` and never dispatch Publish Production; an
  early publish costs a Netlify build and needs Sawyer's approval each time.
- Post-deploy proof: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- "Shipped" means: merged to `main`, published to `production`, Netlify built
  successfully, and the relevant live smoke checks passed

## Required Batch Workflow

Choose the task route in `docs/process/batch-workflow.md`: source-backed
existing-guide accuracy repairs use one lead plus one targeted reviewer; other
SEO batches retain their required specialist lane. The visible-copy order is
non-negotiable: **Draft the copy**, then **Remove internal wording**, then
**Check voice and specificity** using the active brief and `docs/style/`.
Complete these steps before content lint through `npm run lint:content` or the
full `npm run verify:release` gate.

## Content Gate

For any PR that changes public copy in `src/`, read in order:
`docs/status/current-state.md`, the active brief in `docs/briefs/`,
`docs/process/content-quality-gate.md`, the page-family file in
`docs/portfolio/`, `docs/style/voice.md`, `docs/style/banned-patterns.md`,
`docs/style/approved-examples.md`, then the source file. Then:

- run the visible-copy lane in order: **Draft the copy** for the draft, **Remove internal wording** to strip internal/process wording, then **Check voice and specificity** for the final pass on reader copy
- keep reader copy, proof copy, and agent copy separate
- pass `npm run lint:content` or the full `npm run verify:release` before push,
  PR, or merge; both run the same content checks against fresh rendered output
- when a required source is stale, refresh the affected evidence before scaling
  a measured batch or making an impact claim

## Design

- `DESIGN.md` is the visual law: read it before UI work and use only its
  colors, fonts, spacing, radius, shadows, and component styles. Figma, Stitch,
  and other outside tools are donors; a new direction from any tool lands as a
  `DESIGN.md` change first. Claude Design is the approved mock surface only
  while synced by `npm run design:sync`.
- Meaningful visual work (mockups, page concepts, layout, type, color,
  imagery, CTA treatment, motion) starts in the `seascape-design-specialist`
  lane with `seascape-design-critic` as taste gate (`npm run design:lane --
  "<task>"`) and ends with the `design-review` rendered QA loop.
- An approved mock or direction is the implementation contract: build it
  closely and name any deviation with its source, accessibility, performance,
  or responsive reason.
- Sawyer cannot steer design by describing it. For any visible design change,
  show two or three rendered variants (deploy-preview links or screenshots),
  each anchored to a named reference site from `npm run design:donors`, and ask
  only "which one" or "keep X, lose Y".
- Keep UI lean: cut marketing filler and repeated labels; keep accessible
  names, essential instructions, errors, and required disclosures.
- Treat any edit to a shared header, footer or nav partial as an SEO change as
  well as a visual one: it redistributes internal links across every built
  page. Run `node --test scripts/enforcement/internal-link-floor.test.js`
  against a fresh build; a green visual gate is not proof a shell edit was
  safe — its per-route pixel tolerance absorbed an entire new footer column on
  2026-09-10 without a single diff.

## Writeback Boundary

If the work changes Seascape’s business understanding, write back to
`/Users/sawbeck/Projects/seascape-hub`, without full implementation logs. Land
durable writebacks to any other repo through a clean keeper branch or PR from
that repo's current `origin/main`, never by mutating a local sibling checkout.

## Closeout Rule

Before finishing, check the touched area for stale instructions, dead code,
and agent-navigation obstacles. Verify source and consumers before removal.
Fix task-caused leftovers and in-scope broken pointers; report unrelated
opportunities. Prefer source/test pointers to duplicate indexes.

Agents may not hand site work back as local dirt. A task is not complete
because a checkout is dirty, a worktree is left on detached `HEAD`, or cleanup
is left for Sawyer. The worker owns verification, keeper branch or PR, and
branch/worktree cleanup unless a named blocker stops the lane.
