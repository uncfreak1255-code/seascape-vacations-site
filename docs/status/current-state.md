# Current State

Guidance reviewed: 2026-09-05. This page provides durable source routing; it
does not refresh analytics, owner demand, deployed commits, or runtime health.

## Choose Work From Current Evidence

Start from Sawyer's current objective and the affected source or guest flow.
Use `docs/process/learning-contract.md` ("Local Capability Trials") for local
fixes, prototypes, and capability comparisons, and `AGENTS.md` ("Business
Priorities And Experiments") for what Sawyer still decides. Apply the measured expansion gate when
the proposed work depends on it; do not extend it to unrelated local work.

The June 2026 audit and strategy conclusions are historical context. Their
toolchain hold, lead counts, traffic rankings, and proposed allocation of founder
hours must not be presented as current evidence. The original record remains
available in Git history and the dated research files.

- `docs/status/next-batch.md` is the canonical operator-read status surface;
  it must carry exactly one reread status and one concrete next move after
  every reread. Check its observation window before using a measurement.
- `seascape-analytics` owns the joined search read, demand measurements, and
  attribution evidence. Missing proof limits only the decision or claim that
  depends on it.
- `seascape-hub` owns company priorities and owner-demand interpretation.
  This site owns the implementation of guest and owner experiences.
- A confirmed winner or money-page regression follows
  `docs/process/ranking-regression-rescue.md` and its affected checks.

## Owner Intake And Communication

A platform listing or public host label is not contact permission. Qualify an
owner-direct, permissioned signal under
`docs/status/owner-direct-intake-policy.md`; do not build an OTA host-message
list or store named candidate state in this public repository.

Intake does not authorize a send. Personalized drafts and sends need Sawyer's
batch approval of one template and one recipient list, as the owner-intake
policy (version 2, 2026-10-07) requires, and Sawyer sends. A prototype or local
experiment must not create a mailbox draft outside an approved batch, automate
outreach, or turn test activity into owner demand.

## Source Of Truth

- Start with Git state to identify the current branch and checkout. Root
  `main` is sync-only; implementation belongs in an isolated task worktree.
- `_site/` is generated output. The removed legacy deploy path `DEPLOY THIS FOLDER TO NETLIFY/` must stay absent. Root leftover HTML (`index.html`, leftover `stays/`, leftover `property-management/`) is also deleted; production builds from `src/` only. The forbidden-path lint stays.
- Code map below identifies editable page, property, redirect, and proof
  sources; `AGENTS.md` names the property-truth and owner-proof files.
- `DESIGN.md` owns visual conventions; the existing design-review workflow
  owns rendered desktop and mobile proof.
- `docs/process/learning-contract.md` defines evidence for retaining an
  improvement and the boundary between a local trial and activation.
- The owner metrics endpoint and its verification script prove measurement
  behavior only. They do not by themselves prove bookings or owner demand.
- A merged commit or historical release note does not prove current production.
  Use the deployed commit and the relevant live check for a live claim.

## Outcomes To Evaluate

Evaluate owner lead quality, guest decision clarity, direct-booking completion,
maintainable delivery, and Sawyer's intervention time when relevant to the task.
Choose the priority from current evidence and the approved objective. State
unmeasured business effects as hypotheses, and keep public claims within their
source-backed proof.

## Code map

Homepage `src/index.njk`; owner pages `src/property-management/`; guides
`src/guides/`; stay landers `src/stays/stays.njk` plus `src/_data/seoPages.json`;
redirects `src/_redirects`; generated output `_site/`. Voice: `docs/style/`;
briefs: `docs/briefs/README.md`; page-family map: `docs/portfolio/`.

For behavior changes, start with the matching source and existing proof below.
Browser scripts live in `src/assets/js/`; layout identifiers such as
`layouts/property.njk` resolve under `src/_includes/`, not `src/properties/`.
`AGENTS.md` -> Testing and `docs/process/checks-and-runners.md` still govern
required checks.

| Task | Source to inspect | Existing proof |
| --- | --- | --- |
| Catalog search, comparison, shortlist | `src/properties/index.njk`, `src/assets/js/catalog.js`, `src/css/catalog.css` | `scripts/enforcement/properties-catalog-layout.test.js`, `tests/visual/guest-decision-journey.spec.js` |
| Property details and booking panel | `src/properties/`, `src/_includes/layouts/property.njk`, `src/assets/js/guest.js` | `scripts/enforcement/ui-runtime.test.js`, `tests/visual/open-house-journey.spec.js` |
| Dates, guest count, tracking and booking continuity | `src/assets/js/guest.js`, `src/assets/js/conversion-tracking.js`, `src/_includes/partials/guest-trip-form.njk` | `scripts/enforcement/trip-continuity.test.js`, `tests/visual/trip-continuity.spec.js` |
| Shared guest shell and styling | `src/_includes/layouts/guest.njk`, `src/_includes/partials/guest-header.njk`, `src/_includes/partials/guest-footer.njk`, `src/css/guest.css` | `scripts/enforcement/shared-shell.test.js`, `scripts/enforcement/internal-link-floor.test.js`, `tests/visual/design-floors.spec.js` |
| Owner inquiry form and public proof | `src/property-management/index.njk`, `src/_includes/partials/owner-evaluation-form.njk`, `src/css/owner.css`, `src/_data/ownerProofAssets.json`, `src/_includes/partials/owner-form-source-fields.njk` and `src/assets/js/owner-first-touch.js` (first-touch referrer/utm hidden fields) | `scripts/enforcement/owner-acquisition.test.js`, `scripts/enforcement/owner-first-touch.test.js`, `tests/visual/owner-form-steps.spec.js` |
| Live availability lookup behind the booking panel | `netlify/functions/booking-availability.js`, `scripts/booking/stay-availability.js`, `scripts/cache/booking-engine-calendar.js` | `scripts/enforcement/stay-availability.test.js` |
| Booking handoff and guide click lineage (`seascape_booking_handoff_session_id`, `sv_guide_click_id`) | `src/assets/js/conversion-tracking.js` | `scripts/enforcement/booking-handoff.test.js`, `scripts/enforcement/guide-funnel-lineage.test.js` |
| GA4 loading, tracking IDs and PII scrubbing | `src/_includes/partials/analytics-ga4.njk`, `src/assets/js/conversion-tracking.js` | `scripts/enforcement/tracking-privacy-ids.test.js`, `scripts/enforcement/tracking-script-coverage.test.js`, `scripts/enforcement/direct-booking-event-smoke.test.js` |
| Guest email capture (homepage exit signup, guide conversion kit) | `src/assets/js/guest.js`, `src/_includes/partials/guide-conversion-kit.njk`, `netlify/functions/guest-email-capture.js` | `scripts/enforcement/home-exit-signup.test.js`, `scripts/enforcement/guide-conversion.test.js`, `scripts/enforcement/guest-capture-bot-guard.test.js` |
| Homepage scenes and native trip search | `src/assets/js/guest.js`, `src/index.njk` | `scripts/enforcement/ui-runtime.test.js`, `tests/visual/waterline-scenes.spec.js`, `tests/e2e/site-flows.e2e.ts` |
| Header menu button state | `src/assets/js/guest-menu.js` | no unit test; covered only by `tests/visual/*.spec.js` |
| Live-smoke assertions after visible-copy changes | `scripts/recovery/assert-live-smoke.js` | `scripts/enforcement/recovery-smoke.test.js` |
| A brief's Required Internal Link Map marked `link map: enforced` (`docs/briefs/README.md` -> Lifecycle; the regression case is the four donor guides of `docs/briefs/2026-10-owner-market-page-links.md`) | the `src/` pages listed in that brief's map | `scripts/enforcement/owner-market-link-map.test.js` (reads `_site/`; build first) |
