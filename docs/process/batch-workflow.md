# Required Batch Workflow

Choose the route before starting work. All routes retain the content,
source-truth, measurement, design and publication requirements in `AGENTS.md`.

## Approved Friday pilot: action and evaluation

This section is the operating contract for selecting and evaluating SEO/content
work. The repair and batch routes below implement the selected action; the
[enterprise checklist](enterprise-seo-operating-loop.md) supplies diagnostic
inputs. The existing Friday pilot supplies the cadence. It adds no scheduler,
paid research, outreach, permission change, publisher or measurement feed.

### Establish the owner and evidence

1. Read [the OpenSEO integration policy](openseo.md) for the authoritative
   tool/store map and current configured tool boundary. Confirm the local
   Seascape project before a project read. Hosted plugin results are a separate
   store; an empty hosted project is not missing local history. A matching
   upstream skill does not authorize its paid steps or writes.
2. Read current affected-path PRs/issues and the existing task's latest scope.
   Keep one coordinator, one acknowledged mutation owner per affected surface,
   and the required review route. Reuse an active owner. An archived/unreachable task or
   missing acknowledgement is an ownership gap: continue independent research,
   but hold the dependent handoff rather than appoint another publisher.
3. Reuse the owning GitHub issue/PR as the backlog item. The existing private
   pilot action/worklog links to it and records lifecycle; it is not a second
   queue. `docs/status/next-batch.md` remains the sole search branch decision.
   Daily oversight reads and reports; the coordinator reconciles the action.

### Evaluate before selecting

First evaluate the previous action against its deployed revision, affected
behavior and compatible complete post-release window: `keep`, `revise`,
`revert`, or `insufficient evidence` (inconclusive). An overdue record is not a
new experiment. Reconcile newer release/proof receipts with the canonical
private handoff before using an old pending or blocked state. Preserve dated
failures as history; preserve a current unresolved blocker with its owner.

Refresh the Analytics decision in `docs/status/next-batch.md`. Diagnose a
demonstrated measurement defect or broken journey before selecting a growth
experiment. Otherwise rank bounded opportunities by qualified outcome and
credible mechanism, not by article count, keyword volume or tool availability:

- Guest: discovery -> suitable property arrival -> dates/availability -> checkout
  handoff -> reviewed confirmed reservation. Report the earliest measured step;
  a click does not prove an arrival, and a handoff does not prove a booking.
- Owner: permissioned signal -> qualified reply -> assessment -> signed/onboarded
  outcome in the existing private pipeline. Hub owns interpretation; test forms,
  sends and page views do not prove demand. Unknown private coverage is not zero.
- Choose protect/repair, improve an existing page, consolidate, or new content.
  Verify the current canonical winner, intent, sibling/alias URLs and internal
  destinations in source and the matching portfolio. Check page/query changes
  together before calling cannibalization; similar keywords alone prove none.
  A new page needs distinct useful intent and a money destination. Protect the
  existing winner and explain the evidence for changing, merging or retiring it.

Apply `next-batch-gate` and the existing regression-rescue exception. Preserve
hold when no action qualifies. Every supported hold records named checks,
missing data or observation, the numeric/observable clearance threshold, one
accountable owner and a dated next review in the existing handoff. A missing
source is unverified, not observed zero. For each cluster, read impressions,
`OWNER_IMPRESSION_GATE` (1000) and equivalent volume weeks from the Analytics
`hold_diagnostics`. More than eight volume weeks is `structurally blocked`:
route owner evidence to permissioned intake and other clusters to evidence for
existing-page fixes. Rolling-window impressions do not accumulate by waiting;
volume weeks never promise that the shipping gate will clear.

Use the same report's `ranked_opportunities` section, at most three ideas.
Each names the revenue lever as a direction (never dollar lift), evidence
strength, cheapest discriminating test, kill rule, four-to-six-week time box,
owner and status. Read GSC and booking evidence from Analytics-owned receipts;
use saved OpenSEO research as context. A ranked proposal does not override the
gate, winner/intent checks, page-level thin-sample limits or rescue proof.
See `seascape-analytics/docs/weekly-search-funnel-runbook.md` for the Markdown,
JSON and decision-receipt format; the current status sync does not render these
new sections. Carry the fields in the existing private handoff when needed.

At most two experiments may be live across the workflow. Reconcile the existing
private pilot handoff first; unknown counts block new starts. Retain this pilot's
stricter rule: do not add a second unresolved pilot action. Changes from another
active lane are recorded
as concurrent changes and possible confounds, not silently attributed to this
pilot.

### Make the change measurable before implementation

In the existing brief/private handoff record hypothesis, allowed source paths,
owner acknowledgement, baseline and coverage, outcome metric, guardrails,
reviewer, rollback target and evaluation window. Bind evidence to observation
and retrieval dates, stale-after, property timezone, channel/filter definitions,
page/event/placement grain, denominators, and complete source date coverage.
A fresh file timestamp alone does not establish a complete reporting window.

Analytics confirms that the intended event and required dimensions are received
and queryable, with missing, thresholded and observed-zero states separated.
A frontend payload test alone does not establish GA4 receipt or historical
backfill. Keep organic, paid and observed AI sources distinct. Preserve failed
and no-answer AI observations and engine/prompt/geography comparability; a
mention, citation, referral or rank change is not a commercial outcome.

Freeze the baseline/post windows at actual publication under the brief's
existing rule, excluding partial launch days. Disclose simultaneous changes,
seasonality, consent limits and thin samples. Later tracking repairs do not
reset an experiment or replace unavailable history with zeros. When essential
coverage is missing, route the smallest defect to Analytics before expanding
content; independent source-backed repairs keep their existing authority.

### Use skills only for their stage

Source truth, measurement, content and publication safeguards are mandatory.
The helpers below load only for the matching task; advisory output cannot add
a gate, waive one, or grant execution authority. Existing specialist requirements
still apply when the selected route explicitly requires them.

| Stage / trigger | Existing skill or procedure | Completion / when to skip |
| --- | --- | --- |
| Saved ranking, citation or competitor evidence | `.agents/skills/openseo-review` | Confirm local project, observed window and coverage. Follow `openseo.md`; no hosted fallback or fresh paid check. |
| Opportunity/branch selection | `.agents/skills/next-batch-gate`; Search Operator and SEO Architect responsibilities | One eligible action or supported hold naming missing data, threshold, owner and review date; read the report's hold diagnostics and maximum-three ranked opportunities, including winner/intent overlap check. No new page from a tool suggestion alone. |
| A named research gap | Installed local upstream `keyword-research`, `keyword-clustering`, `competitor-analysis`, `competitive-landscape`, `ai-prompt-research`, `ai-visibility-audit` or `local-seo` | Use only the matching workflow with available approved tools; hold its excluded steps. Skip broad `seo-audit` for an already diagnosed defect. |
| Internal links / conversion / snippet diagnosis | `.agents/skills/internal-link-targeting`, `.agents/skills/page-cro`, `.agents/skills/serp-ctr-title-rewrite` | Select only the affected helper. Title/meta changes retain the current measurement gate; none grants expansion. |
| Verified reader copy / facts / structured data | Content gate and `docs/style/`; `.agents/skills/content-quality-rubric`, `.agents/skills/owner-proof-integrity`, `.agents/skills/property-truth-regeneration`, `.agents/skills/schema-markup` | Load the fact/markup helper only when affected. Rubric is advisory; generic global SEO claims never override verified sources or schema eligibility. |
| Layout or new-format work | Existing design-review workflow and its local specialist/critic | Only for an authorized visual change; source-backed accuracy repairs keep the targeted-review route below. |
| Report / release / outcome | Optional local upstream `seo-report`; Release Gate and owning closeout procedure; Analytics contract | Report privately only when requested; a report is not delivery. No additional skill, dashboard or collector is needed to evaluate the action. |

Resolve repo-local skills from `.agents/skills/<name>/SKILL.md`; Claude links
resolve to the same procedure. Resolve upstream skills through the local paths
in `openseo.md`, not a same-named hosted skill. For an exact fact/link correction,
use the tiny-fix route in `skill-policy.md` without research-pack fanout.

### Review, release and close the outcome

The acknowledged owner implements the eligible narrow action in a guarded
worktree through the matching route below. Run affected regression checks and
required release checks, then obtain independent review at the exact material
head. Protect canonical/redirect/noindex routing, factual and schema parity,
legacy conversion paths, desktop/mobile behavior and performance. Record the
rollback revision and the condition that triggers it; use the same owning
review/release lane for a rollback rather than an ad hoc live edit.

Record source merge, publication and deployed behavior separately. Production
activation uses the existing approved consolidated release lane and runtime
proof checklist. A merged PR remains pending release until deployment evidence
contains it; a passing build alone cannot clear a live outcome.

At the due review, use the agreed metric, compatible windows and raw counts plus
rates. A technical `keep` establishes only the verified behavior. Commercial
`keep` or expansion needs the brief's outcome/guardrail evidence; a partial,
confounded or thin window remains `insufficient evidence`, with the exact gap,
owner and next existing review. Never manufacture a traffic result before its
due date. Carry the action until deployed proof and evaluation support a verdict,
and route durable conclusions to Hub through its existing writeback rules.

## Existing-guide accuracy repairs

Use one lead plus one read-only targeted reviewer when an approved brief repairs
facts, numerical consistency, existing FAQ/schema parity or source attribution
on an existing guide, with search intent, routing and layout unchanged. This
route is for an authorized repair; it does not select a new growth batch.

1. The lead reads the active brief, affected source, authoritative facts,
   existing tests, content gate and all three `docs/style/` sources. Resolve
   contradictions in the brief against its named source before editing.
2. The lead works in the guarded task checkout, completes **Draft the copy**,
   **Remove internal wording**, then **Check voice and specificity**, and edits
   only the repair and its required supporting files. Run the affected proof
   and required Site checks.
3. One targeted reviewer independently checks the actual before/after diff,
   source facts, prose/data/FAQ/schema consistency, voice, scope and proof.
   The reviewer performs the Voice Editor and Release Gate responsibilities
   together and returns an explicit copy verdict plus check results. Use the
   existing Release Gate card or an equivalent native read-only reviewer;
   this route introduces no new persona or model default.
4. The lead repairs findings. Recheck the affected material and required
   checks before the normal source-publication lane. Deployment and measured
   impact retain their existing authority and evidence gates.

If the task changes search intent, routing, layout, adds a page or becomes a
meaningful rescue, use the batch lane below and its required specialist work.
Tiny fixes retain the no-fanout route in `docs/process/skill-policy.md`.

## SEO batch lane

Use this lane for new guides, growth decisions, search-intent/routing changes
and meaningful rescues. The five responsibilities may need separate specialists.

1. Search Operator runs the proof lane and attack lane for one named query family.
2. Search Operator records the attack receipt. `hold` is incomplete unless the
   attack status is `completed` or `none found after named checks`.
3. SEO Architect turns that receipt into content, routing, and design/format
   strategy. New guides and meaningful visual rescues invoke
   `seascape-design-specialist` before Page Builder work.
4. One cluster gets chosen and one brief gets written or updated in
   `docs/briefs/` only after that strategy exists.
5. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
6. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`, then completes **Draft the copy** for changed reader copy.
7. Page Builder edits source and only the docs needed to support that batch.
8. Page Builder rewrites any sentence that still sounds like a role card, session note, or helper instruction before it lands in source.
9. Voice Editor checks **Remove internal wording** and then **Check voice and specificity** against the same brief and content gate. Page Builder makes any requested rewrites; Voice Editor stays read-only.
10. Release Gate runs `npm run lint:content` and requires a visible-copy voice pass before the rest of verification.
11. Publish source through the owning closeout lane; deploy only under its
    existing authorization and runtime-proof requirements.
12. Reread after the crawl window instead of inventing a new batch too early.

See also `docs/process/five-roles.md` for who owns each step, and the "Reading
Order For SEO Work" section in `CLAUDE.md`.
