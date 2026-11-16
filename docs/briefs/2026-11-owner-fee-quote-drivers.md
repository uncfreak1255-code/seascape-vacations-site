# Brief: Owner fee questions answered without a published fee range

- lifecycle: active
- task scope: Sawyer's November 16, 2026 2:48 PM ET decision: publish no Seascape management-fee percentage or range; instead answer what drives a quote, what full-service management includes, and what to ask any manager. Existing owner-hub FAQ partial plus removal of unsourced fee figures on existing pages. No new URL, title, meta or template.
- completion or successor: draft PR from `seo/owner-fees-quote-drivers`; merge needs Sawyer's yes

## Content Gate Inputs

- persona: Bradenton or Sarasota pool-home owner asking what management costs and what it covers
- primary keyword: vacation rental management fees Bradenton Sarasota
- secondary keywords: what does full-service vacation rental management include, how to compare vacation rental managers
- audience pattern: owners and AI answer engines ask for a fee number; a quotable answer must explain the quote basis without a number
- proof source: current source (`src/property-management/index.njk` "What we do for your home" rows, owner pricing block; `src/_data/seoPages.json` fees-page FAQ; `src/research/how-seascape-protects-owner-net-2026.njk` comparison rows); seascape-hub origin/main `context/owner-offer.md` sections 1, 2, 3 and 7; Hub `CORRECTIONS.md` 2026-11-12 pricing-authority line; Hub draft PR #1063 (draft evidence of the November 16 decision)
- offer claim: seascape-hub/context/owner-offer.md section 3 (property-specific share of net rent, no public fixed rate) and section 7 (property-specific pricing after a review; no universal fee)
- required internal links: /property-management/vacation-rental-management-fees-florida/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: existing `#owner-cta` on /property-management/
- anti-claims: no Seascape fee percentage, range, minimum or "starting at"; no market fee range (no neutral public source verified on November 16); no pool-heat inclusion; no response-time, home-count, revenue, savings or software-name claim; no competitor disparagement; pricing never described as one person's sole authority

## Why This Batch

- Sawyer decided on November 16 that no fee range is published because a published range sets an expectation Seascape rarely means to meet.
- Hub AEO citation plan (2026-11-04, section 2) found Seascape is never named on owner fee prompts. A quotable, number-free answer on the existing owner hub is the bounded fix.
- Waits: market-range copy, fees-page title/meta changes, new owner URLs. Expansion stays held per `docs/status/next-batch.md` (2026-11-09, fresh but below threshold).

## Experiment And Readback Contract

- hypothesis: standalone fee-basis, scope and comparison answers make Seascape quotable on owner fee prompts without anchoring a number
- primary event: owner_primary_cta_click on /property-management/
- guardrail event: owner_form_start; submit activity alone is not demand
- entry criteria: Sawyer's November 16 decision; existing-page edit only
- readback window: existing weekly owner review, four complete weeks after publication, excluding launch day
- decision rule: keep on parity and no fee figure in rendered owner pages; AI and commercial effect stay insufficient evidence until compatible observed outcomes

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
| Visual/format gap | Keep the existing owner FAQ disclosure design; three more items in the same partial |
| Seascape gap | The hub says the fee is property-specific but has no standalone answer for what drives the quote, what full service covers, or what to ask any manager |
| Search fit | Existing owner money page answers the fee question without a number and routes to the real review form |
| Local/GBP proof | Existing Bradenton/Sarasota local-team facts only; no GBP change |
| AEO/readback note | Visible FAQ text and FAQPage JSON-LD match exactly, in the partial that already emits FAQPage; no new FAQPage elsewhere |
| Recommendation | Add three FAQ answers; remove unsourced fee figures from the AMI vs Clearwater guide and the fees-page intro; neutralize owner-form fee placeholders |
| Attack status | completed |
| Query variants inspected | vacation rental management fees Bradenton Sarasota what is included |
| SERP source | Free live web search November 16, 2026; no paid rank, SERP or AI-visibility check |
| Competitor URLs inspected | https://itrip.net/property-management/sarasota-bradenton; https://awning.com/airbnb-management/bradenton-florida; https://skyrun.com/blog/faq/what-do-vacation-rental-management-fees-cover/ (search result titles and snippets only) |
| Content gap and Seascape answer | Competitors lead with a percentage; Seascape answers with quote factors, a verified scope list and neutral comparison questions |
| Design/format strategy | Retain the existing owner Waterline FAQ partial; no CSS or template change |
| Seascape proof available | Current source copy and Hub owner-offer sections 1, 2, 3, 7 (claim map in the PR body) |
| Tools/plugins used | Free web search, repo source reads, Hub origin/main reads, local build and tests, Playwright screenshots |
| Decision and reason | Existing-page answer only; expansion held and Sawyer's decision forbids a fee number |

## Required Internal Link Map

Inventory of links each changed page already carries; not an enforced link map.

- src/guides/anna-maria-island-vs-clearwater-beach.html: /guides/best-vacation-rental-companies-ami/, /stays/anna-maria-island-vacation-rentals/

## Source files changed in this batch

- `src/_includes/partials/owner-management-faq.njk`
- `src/_includes/partials/owner-evaluation-form.njk`
- `src/property-management/index.njk`
- `src/_data/seoPages.json`
- `src/guides/anna-maria-island-vs-clearwater-beach.html`

## Copy and review contract

Draft, remove internal wording, then check voice and specificity. Each answer's
first sentence answers the question and names Seascape. Every service claim
traces to both current Site copy and Hub owner-offer section 2. Quote factors
trace to the live fees-page FAQ and Hub section 1 and 3. Omitted as unverified:
home size or sleeping capacity as a quote factor, seasonality as a separate
factor, level-of-service tiers, onboarding or setup needs, and any market fee
range. Keep existing reader copy and the local-alternative answer unchanged.
