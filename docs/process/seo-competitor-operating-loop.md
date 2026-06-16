# SEO Competitor Operating Loop

This loop is for generated stay pages, generated owner pages, and page-family
triage. It turns the pSEO inventory into action without restarting a site-wide
SEO audit.

For a known winner or money page that has already regressed, use
`docs/process/ranking-regression-rescue.md` first. Regression rescue is not a new
page batch. It is a bounded fix to an existing page that already proved it can
matter.

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
| Current proof | GSC clicks, impressions, CTR, average position, GA4 sessions, and tracked conversion event when available. |
| Top visible competitors | Top 3 organic/local/OTA/SERP competitors from the live read. |
| Competitor angle | Inventory, price, direct booking, local trust, owner revenue, amenities, guide depth, reviews, map pack, OTA, directory, or UGC. |
| Seascape gap | The concrete gap versus the live winners. |
| Recommendation | `keep`, `improve`, `noindex`, `redirect`, or `consolidate`, plus the exact source edit only if the gate allows work. |

If the competitor read cannot name the keyword, live winners, and Seascape gap,
it is not strong enough to change a page.

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
