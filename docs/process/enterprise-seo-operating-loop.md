# Enterprise SEO Operating Loop

*Updated: 2026-06-20*

This is Seascape's agency-grade SEO loop. It keeps the site moving without
turning weak or stale evidence into page edits.

## Ownership

- `seascape-analytics` proves demand, ranking movement, indexation, AI
  visibility, and direct-booking attribution.
- `seascape-vacations-site` executes public page, metadata, schema, redirect,
  internal-link, and content-quality changes.
- `seascape-hub` keeps durable strategy and decisions after the owning repo has
  evidence.
- External SEO packs, SearchFit, and donor workflows may challenge the plan, but
  they do not override repo proof or the active brief gate.

## Weekly Inputs

Read these in order before opening SEO source work:

1. `docs/status/next-batch.md` for the live branch gate.
2. A dated weekly search operator receipt from `seascape-analytics`; do not use a
   generic `tmp/*latest*` file when dated outputs disagree.
3. Completed DataForSEO or live SERP evidence for the target query family.
   Queued `task_not_ready` receipts are not competitor proof.
4. `seascape-analytics/queries/rank_history_deltas.sql` output when a known
   winner or money page may have slipped.
5. GSC inspection or crawl evidence for stale pages, 404s, indexation, canonical,
   noindex, or redirect questions.
6. Google Search Console generative AI performance reports when the property has
   access. If unavailable, use dated direct observations or a validated tool
   receipt and label the proof surface as observational.
7. `npm run seo:decay -- --as-of YYYY-MM-DD` for the content-decay patrol over
   static guide/research pages and generated stay/owner pSEO records. Treat the
   output as a queue for proof review, not approval to change public copy.
8. `npm run seo:links:plan` for rough internal-link donor candidates into
   existing winner, stay-money, and owner-money pages. Treat output as candidate
   planning only; the active brief must still verify route intent, indexability,
   and conversion fit before links change.
9. `npm run eval:aeo` or an explicit AI-answer readback note for guide/research
   rescue work.

## Loop

1. **Proof lane.** Run or read the dated analytics receipts. Classify the window
   as `READY_FOR_SITE_BRANCH`, `HOLD_AND_REREAD`, or
   `INVESTIGATE_INSTRUMENTATION`.
2. **Attack lane.** Even when proof blocks impact claims, run live SERP,
   competitor, stale-content, internal-link, local/GBP, and AEO checks for the
   named query family.
3. **Decision.** Choose one of: `no action`, `research only`, `rescue existing
   winner`, `improve existing page`, `consolidate`, `redirect/noindex`, or
   `open new batch`.
4. **Brief.** If source changes are allowed, update one active brief for the
   active lane with the filled Gate 0 block required by
   `docs/process/content-quality-gate.md`. If a PR intentionally carries more
   than one active lane, each changed search-facing source file must be named in
   the matching changed brief.
5. **Ship the smallest fix.** Edit only the page, metadata, schema, redirect, or
   internal-link surface named in the brief.
6. **Verify.** Run the smallest command set that proves the changed surface.
   Public copy still needs `npm run lint:content` and `npm run build`.
7. **Reread.** After deploy, compare the first complete post-change window
   against the pre-edit query/page baseline before claiming impact.

## Decision Rules

| Signal | Allowed move | Blocked move |
| --- | --- | --- |
| `READY_FOR_SITE_BRANCH` from dated analytics | One active brief for the named family | Broad page volume or unrelated cleanup |
| `HOLD_AND_REREAD` | SERP research, stale-content triage, candidate donor-link plan, rescue prep | Impact claims or expansion branches |
| Confirmed rank/CTR/indexation/conversion regression | Use `docs/process/ranking-regression-rescue.md` | Waiting passively or creating a replacement page |
| DataForSEO receipt is queued or missing | Rerun/complete the receipt or use a dated live SERP note | Treating competitor proof as complete |
| AI visibility receipt has no current observations | AEO readback notes and citeability cleanup | AI visibility impact claims |
| Direct-booking attribution is blocked | Site-funnel and campaign-touchpoint claims only | Revenue-lift claims |

## Stale Advice Rules

- Any strategic SEO claim older than 30 days needs a dated receipt, a live SERP
  read, or a `stale` label.
- Any Gate 0 SERP read expires on its `SERP stale after` date.
- The search growth map is strategy context. `docs/status/next-batch.md` owns the
  current gate.
- Page cleanup is allowed only as a bounded list: stale facts, source-truth drift,
  low-value overlap, 404/indexation damage, or a named consolidation candidate.
- Publishing cadence is not a goal by itself. New content opens only when the
  proof lane and search fit say a page should exist.

## SearchFit And Donor Tools

Use SearchFit or any donor SEO system as a challenger, not the spine. A donor
finding is promotable only when it names:

- the query family
- the URL or missing page
- the dated proof source
- the competitor or SERP gap
- the exact source change
- the verification command
- the kill/defer reason if evidence is weak

Do not install an external SEO pack, copy new skills into this repo, or change
the agent surface unless a repeated gap survives this loop and the agent-surface
audit approves the change.

## Receipt Shape

Every SEO loop closeout should include:

| Field | Answer |
| --- | --- |
| Query family | Exact query family. |
| Current URL | Existing URL or `missing page`. |
| Proof lane | Dated analytics, crawl, indexation, or revenue proof; include blocker if waiting. |
| Attack lane | SERP, competitor, internal-link, stale-content, local/GBP, or AEO move completed. |
| Decision | No action, research only, rescue, improve, consolidate, redirect/noindex, or open batch. |
| Verification | Commands, receipts, screenshots, or live readbacks. |
| Next reread | Date/window and owner. |
