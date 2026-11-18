# Brief: Publish the owner management fee

- lifecycle: active
- task scope: Sawyer's November 18, 2026 decision (GBrain facts 13251, 13255) reverses the November 16 no-number rule: publish the management fee as 17–20% of net rent plus $85 a month for booking and accounting software, set owner by owner, most homes 20%, led by a "from 17%" headline. Existing owner-hub FAQ partial, owner pricing block, fees-page copy and the owner fee benchmark pricing note. No new URL, title, meta or template.
- completion or successor: PR from `seo/owner-fees-quote-drivers`; DO NOT MERGE until Villa Tessa signs (about 2026-12-01) and Sawyer says go; a merge may deploy per `AGENTS.md` Deploy

## Content Gate Inputs

- persona: Bradenton or Sarasota pool-home owner asking what management costs and what it covers
- primary keyword: vacation rental management fees Bradenton Sarasota
- secondary keywords: what does full-service vacation rental management include, how to compare vacation rental managers
- audience pattern: owners and AI answer engines ask for a fee number; the quotable answer leads with the number
- proof source: current source (`src/property-management/index.njk` "What we do for your home" rows, owner pricing block; `src/_data/seoPages.json` fees-page FAQ; `src/research/how-seascape-protects-owner-net-2026.njk` comparison rows); seascape-hub origin/main `context/owner-offer.md` sections 1, 2, 3 and 7; Hub `CORRECTIONS.md` 2026-11-12 pricing-authority line; Hub draft PR #1063 (draft evidence of the November 16 decision)
- offer claim: seascape-hub/context/owner-offer.md section 3 (fee basis: a share of net rent plus a monthly fee), with the published figures from Sawyer's November 18, 2026 decision (GBrain facts 13251, 13255): 17–20% of net rent plus $85 a month for booking and accounting software, set owner by owner, most homes 20%. The hub file's "no published fee range" paragraph (2026-11-16) predates that decision and needs its own update
- required internal links: /property-management/vacation-rental-management-fees-florida/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: existing `#owner-cta` on /property-management/
- anti-claims: no earnings tier, dollar threshold or sliding scale; no definition of net rent beyond the approved wording; no market fee range; no pool-heat inclusion; no response-time, home-count, revenue, savings or software-name claim; no competitor disparagement; pricing never described as one person's sole authority

## Why This Batch

- Sawyer decided on November 18 to publish the fee with a "from 17%" headline; the November 16 no-number rule is withdrawn.
- Hub AEO citation plan (2026-11-04, section 2) found Seascape is never named on owner fee prompts. A quotable fee answer on the existing owner hub is the bounded fix.
- Waits: market-range copy, fees-page title/meta changes, new owner URLs. Expansion stays held per `docs/status/next-batch.md` (2026-11-09, fresh but below threshold).

## Experiment And Readback Contract

- hypothesis: standalone fee-basis, scope and comparison answers make Seascape quotable on owner fee prompts without anchoring a number
- primary event: owner_primary_cta_click on /property-management/
- guardrail event: owner_form_start; submit activity alone is not demand
- entry criteria: Sawyer's November 18 decision; existing-page edit only; merge waits for Villa Tessa's signature and Sawyer's go
- readback window: existing weekly owner review, four complete weeks after publication, excluding launch day
- decision rule: keep on parity and the same fee wording on every owner page that answers a fee question; AI and commercial effect stay insufficient evidence until compatible observed outcomes

## Gate 0 Search And Attack Receipt

| Field | Evidence |
| --- | --- |
| Target query family | vacation rental management fees Bradenton Sarasota; what does full-service management include |
| Searcher intent | Owner wants a cost expectation and a scope list before requesting a quote |
| Current Seascape URL | /property-management/ |
| SERP observed date | 2026-11-16 |
| SERP stale after | 2026-11-23 |
| Current proof | 2026-11-09 Analytics read: owner_hub 43 impressions, 0 clicks; owner_money 14 impressions. Hub AEO plan 2026-11-04: Seascape named 0 of 5 on the fees prompt. Dated sample, no lift claim. |
| Top visible competitors | https://itrip.net/property-management/sarasota-bradenton, https://awning.com/airbnb-management/bradenton-florida, https://skyrun.com/blog/faq/what-do-vacation-rental-management-fees-cover/ |
| Competitor angle | Manager marketing pages quote their own percentages and list included services; no figure adopted |
| Visual/format gap | Keep the existing owner FAQ disclosure design; the fee answer becomes the first, open item |
| Seascape gap | No page states the fee; the owner fee prompts have no Seascape number to cite |
| Search fit | Existing owner money page answers the fee question with the number and routes to the real review form |
| Local/GBP proof | Existing Bradenton/Sarasota local-team facts only; no GBP change |
| AEO/readback note | Visible FAQ text and FAQPage JSON-LD match exactly, in the partial that already emits FAQPage; no new FAQPage elsewhere |
| Recommendation | Lead the owner FAQ with the fee answer and keep the scope and compare answers; state the fee in the owner pricing block, the fees page and the benchmark pricing note; neutralize owner-form fee placeholders |
| Attack status | completed |
| Query variants inspected | vacation rental management fees Bradenton Sarasota what is included |
| SERP source | Free live web search November 16, 2026; no paid rank, SERP or AI-visibility check |
| Competitor URLs inspected | https://itrip.net/property-management/sarasota-bradenton; https://awning.com/airbnb-management/bradenton-florida; https://skyrun.com/blog/faq/what-do-vacation-rental-management-fees-cover/ (search result titles and snippets only) |
| Content gap and Seascape answer | Competitors lead with a percentage; Seascape now leads with its own, then the scope list and neutral comparison questions |
| Design/format strategy | Retain the existing owner Waterline FAQ partial; no CSS or template change |
| Seascape proof available | Current source copy and Hub owner-offer sections 1, 2, 3, 7 (claim map in the PR body) |
| Tools/plugins used | Free web search, repo source reads, Hub origin/main reads, local build and tests, Playwright screenshots |
| Decision and reason | Existing-page answer only; expansion held; Sawyer's November 18 decision approves the fee copy |

## Required Internal Link Map

Inventory of links each changed page already carries; not an enforced link map.

- src/_includes/partials/owner-management-faq.njk: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/

## Source files changed in this batch

- `src/_includes/partials/owner-management-faq.njk`
- `src/_includes/partials/owner-fee-statement.njk`
- `src/_includes/partials/owner-evaluation-form.njk`
- `src/property-management/index.njk`
- `src/_data/seoPages.json`
- `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
- `scripts/recovery/validate-owner-live-surface.js`
- `scripts/enforcement/owner-acquisition.test.js`
- `scripts/enforcement/recovery-smoke-owner.test.js`

## Copy and review contract

Draft, remove internal wording, then check voice and specificity. Approved copy
(Sawyer, 2026-11-18): headline "Vacation rental management from 17%"; body "Our
fee is 17–20% of net rent, plus $85 a month for booking and accounting
software. Every home is quoted owner by owner after we see it — most homes are
20%, and our best rates go to our highest-earning homes. You get your exact
number in writing, from Sawyer or Patrick." The same wording appears in the
owner FAQ (visible text and FAQPage JSON-LD match exactly), the owner pricing
block, the fees page and the benchmark pricing note. Net rent is not defined
beyond this wording. The scope answer (06 full-service) and the neutral compare
answer (07) keep their November 16 text. `src/llms.txt` states no fee and is unchanged.
