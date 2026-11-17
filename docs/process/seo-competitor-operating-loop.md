# SEO Competitor Operating Loop

This loop is for generated stay pages, generated owner pages, and page-family
triage. It turns the pSEO inventory into action without restarting a site-wide
SEO audit.

For a known winner or money page that has already regressed, use
`docs/process/ranking-regression-rescue.md` first. Regression rescue is not a new
page batch. It is a bounded fix to an existing page that already proved it can
matter.

## Growth Decision: One Move Per Run

Read the existing handoff, live project context and saved evidence before
proposing a page change. Check the due outcome and open work first; reuse the
existing brief, PR, report or private queue, not a new dashboard or report for
the same job. Use the upstream skill matching the question, not the entire pack.

| Business goal | OpenSEO evidence | Decide and verify |
| --- | --- | --- |
| Direct bookings | Settled GSC query/page data, saved rank history and GA4 organic landing pages/key events. Inspect the actual property and booking handoff on desktop and phone before blaming a guide. | Fix one verified break or improve one existing high-intent path before expanding content. Track property arrivals and checkout starts separately; Analytics confirms non-test native Hostaway channel 2013 bookings, not broad Direct, and verifies attribution separately. |
| Owners under contract | Owner-intent GSC and saved AI answers plus cited pages. Start with an existing owner page and a real objection or traffic source. | Choose one offer, intake or distribution gap. A citation is not owner demand; measure qualified replies, conversations and signed agreements in the existing private intake/Hub workflow. Compare against warm referrals separately. |
| Outreach and referral partners | Use the local AI Visibility Audit and Link Prospecting skill as methods: same-run results and sources, repeated citation URL, live page check and public business inquiry route. Check relevance and terms before proposing any partner. | Prefer one supported editorial listing or permissioned introduction over bulk outreach or paid placement. Route owners through the existing owner-intake policy; no scraping, guessed contacts, automated sends or private lead details in public Git or OpenSEO. Sawyer approves the exact outreach; Sawyer sends. |

Do not use today's rank label or aggregate AI score as the baseline. Record
market, device, window, current run IDs and coverage. In AEO, separate branded
and non-branded prompts, mentions and owned citations, valid no-answer and
failures. Compare the same prompts/engines/market across runs and do not turn
missing tasks into losses. Before a paid lookup, name the decision it could
change. Use saved reports and free source checks first; the [OpenSEO Cost Boundary](openseo.md#cost-boundary)
still governs paid tools. New trackers, schedules and prompt expansions are not
approved by a good baseline.

**Gate before editing:** In the existing handoff, record the business lever,
exact query/prompt family and URL, dated evidence and limitation, competing
explanation checked, smallest change and owner, what waits, and the success/stop
rule plus review date. A second reader should be able to reopen the evidence.
Report one build disposition (verified/ready, killed, or blocked with an owner
and next action) and a separate outcome verdict. A held publication or thin
sample is not permission to edit a different guide or rerun the same window.
Existing brief, ownership, approval and release gates still apply.

## Source Order

1. Read `docs/status/next-batch.md`.
2. Read `docs/portfolio/pseo-inventory-triage.md`.
3. Read the relevant portfolio file:
   - `docs/portfolio/stay-money-pages.md`
   - `docs/portfolio/owner-acquisition.md`
   - `docs/portfolio/winner-guides.md`
4. Read the source page data in `src/_data/seoPages.json`.
5. Pull GSC + GA4 proof from `seascape-analytics` when a page-level decision
   would change indexability, redirects, title/meta, copy, or routing.
6. Run the live SERP read for the target query family.

## Gate 0: Query And SERP Competition

Before recommending site work, capture this block:

| Field | Required answer |
| --- | --- |
| Target query family | The exact keyword family, not a vague page label. |
| Searcher intent | `guest booking`, `owner-management`, `guide/research`, `comparison`, `local brand`, or `support`. |
| Current Seascape URL | Existing URL, or `missing page`. |
| SERP observed date | Date-only `YYYY-MM-DD` from the live SERP or completed SERP receipt. |
| SERP stale after | Date-only `YYYY-MM-DD`; default to 7 days after observation unless a volatile event requires sooner. |
| Current proof | GSC clicks, impressions, CTR, average position, GA4 sessions, and tracked conversion event when available. Name the dated receipt or say final analytics are not ready. |
| Top visible competitors | Top 3 organic/local/OTA/SERP competitors from the live read. |
| Competitor angle | Inventory, price, direct booking, local trust, owner revenue, amenities, guide depth, reviews, map pack, OTA, directory, or UGC. |
| Visual/format gap | Tables, maps, galleries, charts, comparison layouts, imagery, or other visible formats competitors use to make the answer easier to scan; say whether Seascape should match, skip, or answer differently. |
| Seascape gap | The concrete gap versus the live winners. |
| Search fit | Why this URL should own the query, what conversion it should drive, or why the idea should be killed/deferred. |
| Local/GBP proof | GBP/category/NAP/map-pack note for local or owner-management intent; otherwise explain why it is `N/A`. |
| AEO/readback note | AEO score, AI-answer readback, or why it is `N/A` for this route. |
| Recommendation | `keep`, `improve`, `noindex`, `redirect`, or `consolidate`, plus the exact source edit only if the gate allows work. |

If the competitor read cannot name the keyword, live winners, and Seascape gap,
it is not strong enough to change a page.

Do not cite a generic `tmp/*latest*` analytics output as the proof source when
dated receipts disagree. Rerun the analytics read or use the dated receipt that
matches the window being discussed.

## Classification To Action

| Inventory class | Allowed action while `fresh but below threshold` | Action when the gate opens |
| --- | --- | --- |
| `keep` | Preserve. Do not rewrite from hunches. | Improve only if the analytics receipt identifies the page family or live SERP read shows a narrow fix. |
| `improve` | Gather Gate 0 evidence and write candidate notes. | Open one brief for the winning cluster, then edit title/meta, intro, proof section, internal links, schema, or CTA routing. |
| `noindex` | Leave noindex in place. | Reconsider only with page-level demand and a clear user-value gap. |
| `redirect` | Keep redirect ownership explicit. | Do not revive unless the target page family changes and the brief names why. |
| `consolidate` | Treat as candidate consolidation only. Do not remove or redirect yet. | Redirect, noindex, or merge only after page-level GSC plus SERP evidence proves low distinct value. |

## Next-Batch Gate

Do not open a new batch brief unless `docs/status/next-batch.md` says
`open next batch`.

Exception: a confirmed ranking, CTR, indexation, or conversion regression on a
tracked winner or money page may open a rescue brief under
`docs/process/ranking-regression-rescue.md`. That exception does not authorize
new page volume, broad expansion, or impact claims before the proof lane catches
up.

If the status is `fresh but below threshold`, the specialist can still do useful
work:

- refresh the pSEO inventory
- run Gate 0 competitor reads
- run `npm run seo:links:plan` and capture rough donor-link candidates for
  existing money or winner pages; verify route intent, indexability, and sentence
  fit before changing links
- identify likely consolidation candidates
- flag pages that need property-truth or owner-proof verification
- prepare a candidate brief outline without treating it as active work

If the status is `blocked by freshness`, do not claim impact or make indexation
decisions from incomplete proof. Attack-lane research can continue, but proof
claims wait. If the attack lane is a confirmed regression rescue, use the
rescue lane instead of returning a passive wait state.

## Tooling Rule

Add or change tooling only when the current loop has a proven gap:

- inventory cannot be refreshed from source data
- competitor findings cannot be captured in a repeatable format
- `seascape-analytics` reread receipts cannot sync cleanly into
  `docs/status/next-batch.md`
- release checks do not cover the changed source surface

Do not add new SEO personas, broad marketing skills, or external SEO packs just
because the work is strategic. The repo already has a five-role SEO OS.
