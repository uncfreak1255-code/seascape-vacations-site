# Enterprise SEO Operating Loop

*Diagnostic reference; operating sequence consolidated 2026-10-20.*

Use this checklist for diagnostic inputs. The single operating contract is
[Required Batch Workflow](batch-workflow.md#approved-friday-pilot-action-and-evaluation),
including ownership, selection, skill routing, release and evaluation. The
[OpenSEO policy](openseo.md) owns tool/store selection and spending boundaries;
this reference does not create a parallel loop or override either contract.

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

## Decision and execution

Apply the operating contract in `batch-workflow.md` to classify the Analytics
decision, complete the bounded proof/attack work, select one eligible action
or supported hold, and use the matching repair/batch route. A queued provider
receipt is not completed research. Current joined Analytics evidence governs
measured expansion; the existing regression-rescue lane handles a confirmed
winner or money-page regression. Evaluation follows actual deployment and the
brief's complete comparable window, not source merge or report production.

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

An authorized, isolated instruction trial may test a candidate under
`docs/process/learning-contract.md` before adoption. The trial does not waive
source inspection or the existing agent-surface audit.

Do not install an external SEO pack, copy new skills into this repo, or promote
an agent-surface change for use beyond the isolated trial unless a repeated gap
survives this loop and the agent-surface audit approves the change.

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
