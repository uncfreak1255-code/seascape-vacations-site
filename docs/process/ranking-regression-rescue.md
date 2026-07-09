# Ranking Regression Rescue

This lane is for pages that already proved they matter, then start slipping.
It keeps the SEO system from turning a freshness wait into passive drift.

## Decision Rule

A reread can block impact claims. It cannot block useful rescue work when a
known winner or money page has a confirmed ranking, CTR, indexation, or
conversion regression.

Use this split every time:

- Proof lane: wait for final GSC, GA4, booking, or crawl data before claiming
  impact.
- Attack lane: use live SERPs, competitor gaps, source truth, internal links,
  schema checks, and page-quality review to make the next bounded improvement.

Google's own Search Console guidance supports this split: Search Console data
normally has a 2-3 day lag, but traffic drops should still be investigated by
query, page, date comparison, and affected surface instead of ignored until the
next export.

## Rescue Triggers

Open this lane when one of these is true:

- a tracked winner drops from top 3 to position 5 or lower for its primary query
- a winner or money URL loses top-10 visibility for a tracked query
- GSC shows a 30%+ click decline on a winner URL after comparing a comparable
  period, once final data is available
- a high-impression query has weak CTR while the page still has page-one
  average position
- a rank tracker or live SERP read names visible competitors that overtook the
  page
- indexing, canonical, redirect, schema, or 404 drift affects a winner, money
  page, or its aliases
- downstream tracked events for a winner hit the portfolio failure rule, such
  as sessions with no `guide_book_direct_click`

## Source Order

Read these before changing public copy:

1. `docs/status/next-batch.md` for the canonical proof gate.
2. The newest rank tracker or search report naming the regression.
3. The relevant portfolio file:
   - `docs/portfolio/winner-guides.md`
   - `docs/portfolio/stay-money-pages.md`
   - `docs/portfolio/owner-acquisition.md`
4. `docs/status/search-growth-map.md` for query family, proof lane, and attack
   lane.
5. The live URL, source file, canonical, title, meta description, schema, and
   tracked CTA event.
6. A live SERP read for the target query family.
7. GSC + GA4 from `seascape-analytics` when final data exists.

If the SERP read and source page disagree, trust the live SERP for competitive
shape and the repo source for what Seascape is actually publishing.

## Gate 0 Rescue Block

Before recommending or shipping a rescue edit, capture this block in the active
brief:

| Field | Required answer |
| --- | --- |
| Target query family | Exact query family, not a page label. |
| Searcher intent | Guest booking, owner-management, guide/research, comparison, local brand, or support. |
| Current Seascape URL | Existing URL or `missing page`. |
| SERP observed date | Date-only `YYYY-MM-DD` from the live SERP, rank tracker, or completed SERP receipt. |
| SERP stale after | Date-only `YYYY-MM-DD`; default to 7 days after observation unless the SERP is moving faster. |
| Current proof | Latest final GSC/GA4 when available, plus rank tracker or live SERP signal. Name the dated receipt or say final analytics are not ready. |
| Top visible competitors | Top 3 visible organic/local/OTA/SERP competitors. |
| Competitor angle | Inventory, price, local trust, guide depth, real estate/living advice, reviews, map pack, OTA, directory, or UGC. |
| Visual/format gap | Tables, maps, galleries, charts, comparison layouts, imagery, or other visible formats competitors use to make the answer easier to scan; say whether Seascape should match, skip, or answer differently. |
| Seascape gap | Concrete gap versus the visible winners. |
| Search fit | Why the existing URL should be rescued for this query, what conversion it should support, or why the rescue should stop. |
| Local/GBP proof | GBP/category/NAP/map-pack note for local or owner-management intent; otherwise explain why it is `N/A`. |
| AEO/readback note | AEO score, AI-answer readback, or why it is `N/A` for this route. |
| Recommended action | Title/meta, intro, new section, proof cleanup, internal links, schema, CTA routing, redirect/canonical fix, or hold. |

If the block cannot name the query, visible competitors, and Seascape gap, the
work is still research, not a source edit.

Do not treat a generic `tmp/*latest*` analytics output as final proof when dated
receipts disagree. Use the matching dated receipt, rerun the analytics read, or
mark the proof lane as waiting while the attack lane handles source-safe rescue
work.

## What Is Allowed During `blocked by freshness`

Allowed:

- live SERP and competitor capture
- active rescue brief creation
- title/meta drafts, held until the brief and content gate authorize them
- freshness and proof cleanup that has source truth
- internal-link improvements into mapped money pages
- `npm run seo:links:plan` to find rough donor-link candidates, followed by
  route intent, indexability, and sentence-fit review before source links change
- schema, canonical, sitemap, redirect, noindex, and route hygiene
- source-page sections that answer the live query better without making new
  unproven claims
- rendered route smoke, JSON-LD validation, link validation, and content lint

Not allowed:

- claiming rankings, clicks, leads, bookings, or AI visibility improved before
  final data proves it
- creating a new page when the rank tracker says to fix the existing winner
- broad site-wide SEO audits as a substitute for the named rescue
- copying competitor structure without Seascape-specific proof
- new page volume while indexing is shrinking

## CEO Review Cadence

This is the operating standard:

- Same day: classify the regression and decide whether it needs rescue.
- Within one business day: open a rescue brief or write the reason it is not
  worth fixing.
- Within one working branch: ship the smallest honest fix that has its own
  proof gate, or leave a named blocker.
- After deploy: reread the first 7 complete days after Google has final data,
  then compare against the pre-edit page/query baseline.

No page that has already been called a winner should fall from #1 to #5 and sit
in a generic wait state with no named owner, no brief, and no attack-lane move.

## Release Gates

Use the smallest gate that proves the changed surface:

- Public copy or title/meta: one active brief, style docs read,
  `npm run lint:content`, and `npm run build`.
- Schema or structured data: `npm run verify:jsonld` when available, plus route
  smoke.
- Links or redirects: `npm run verify:links` or the repo-specific route checker
  when available.
- Visual/layout change: desktop and mobile screenshot proof.
- No public `src/` change: `npm run git:preflight` plus a diff review is enough.

## Bradenton vs Sarasota Trigger

The current live example is `/guides/bradenton-vs-sarasota/`.

`docs/reports/rank-tracker-2026-06-03.md` says the page dropped from #1 to #5
for `bradenton vs sarasota`, calls it the largest single drop of the week, and
names the action: freshness pass plus content-depth audit against the pages that
overtook it. The same report says not to create a new comparison page.

That means the correct move is a bounded rescue of the existing winner, not a
new guide batch and not another passive reread.
