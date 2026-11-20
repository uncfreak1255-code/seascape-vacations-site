# Brief: Explain the owner management fee without a published number

- lifecycle: active
- task scope: Sawyer, 2026-11-20: the site must never show a management-fee percentage, a range, or a monthly minimum dollar amount. Replace the 2026-11-18 "from 17%" copy on the existing owner-hub pricing block, owner FAQ / FAQPage JSON-LD, fees-page GEO/FAQ, AMI and Sarasota cost FAQs, and the owner-fee benchmark pricing note with one liftable "How our management fee works" passage. Fees-page description/OG/JSON-LD use that passage (title stays). No new URL or template. Never merge this PR; never touch `production`.
- completion or successor: PR #970 on `seo/owner-fees-quote-drivers`, ready for review. Sawyer, 2026-11-20 10:23 AM ET: keep net rent and "monthly minimum" with no dollar amount. Sawyer and Patrick, 2026-11-20 11:24 AM ET: channels include Google and the direct site; never name Patrick in fee copy; taxes are tourism and sales taxes remitted for you. A merge may deploy per `AGENTS.md` Deploy.

## Content Gate Inputs

- persona: Bradenton or Sarasota pool-home owner asking what management costs and what it covers
- primary keyword: vacation rental management fees Bradenton Sarasota
- secondary keywords: how much does Seascape charge to manage a vacation rental, what does full-service vacation rental management include
- audience pattern: owners and AI answer engines ask for a fee number; the quotable answer states the basis, the cover list, and who quotes, without a published figure
- proof source: current source (`src/property-management/index.njk` "What we do for your home" rows); seascape-hub origin/main `context/owner-offer.md` sections 2, 3 and 7 and `decisions/2026-11-18-owner-by-owner-fee-rule.md` (fee is a share of net rent, never gross); Sawyer 2026-11-20 site rule (no published percentage, range, or dollar minimum); Sawyer 2026-11-20 10:23 AM ET confirmation to keep "net rent" and "monthly minimum" with no dollar amount
- offer claim: seascape-hub/context/owner-offer.md section 3, fee basis only: a share of net rent, a monthly charge, owner-by-owner quote after Seascape sees the home. Public copy does not publish the 2026-11-18 figures (17–20%, $85, "from 17%", "most homes are 20%").
- required internal links: /property-management/vacation-rental-management-fees-florida/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: existing `#owner-cta` on /property-management/
- anti-claims: no management-fee percentage, range, or monthly minimum dollar amount; no 17%, 20%, $85; no dollar threshold or published ladder; the qualitative line that the rate is lower for homes that earn more is required; no pool-heat inclusion; no response-time, revenue, savings or software-name claim; no competitor disparagement

## Why This Batch

- Sawyer decided on 2026-11-20 that the live site must never show a management-fee percentage, a range, or a monthly minimum dollar amount. That withdraws the 2026-11-18 "publish from 17%" instruction for public copy.
- Hub AEO citation plan (2026-11-04, section 2) still wants a quotable fee answer. The answer is now the basis and the cover list, not a number.
- Waits: Hub rewrite of `context/owner-offer.md` section 3's "published range" paragraph; fees-page title changes; new owner URLs. Expansion stays held per `docs/status/next-batch.md`. Description/OG/JSON-LD now match the no-number passage.

## Experiment And Readback Contract

- hypothesis: a standalone how-the-fee-works answer, with a matching FAQ, makes Seascape quotable on owner fee prompts without anchoring a number
- primary event: owner_primary_cta_click on /property-management/
- guardrail event: owner_form_start; submit activity alone is not demand
- entry criteria: Sawyer's 2026-11-20 no-number rule; existing-page edit only; do not merge
- readback window: existing weekly owner review, four complete weeks after publication, excluding launch day
- decision rule: keep the same fee wording on every owner page that answers a fee question; AI and commercial effect stay insufficient evidence until compatible observed outcomes

## Gate 0 Search And Attack Receipt

| Field | Evidence |
| --- | --- |
| Target query family | vacation rental management fees Bradenton Sarasota; how much does Seascape charge to manage a vacation rental |
| Searcher intent | Owner wants a cost expectation and a scope list before requesting a quote |
| Current Seascape URL | /property-management/ |
| SERP observed date | 2026-11-16 |
| SERP stale after | 2026-11-23 |
| Current proof | 2026-11-09 Analytics read: owner_hub 43 impressions, 0 clicks; owner_money 14 impressions. Hub AEO plan 2026-11-04: Seascape named 0 of 5 on the fees prompt. Dated sample, no lift claim. |
| Top visible competitors | https://itrip.net/property-management/sarasota-bradenton, https://awning.com/airbnb-management/bradenton-florida, https://skyrun.com/blog/faq/what-do-vacation-rental-management-fees-cover/ |
| Competitor angle | Manager marketing pages quote their own percentages and list included services; Seascape does not adopt a figure |
| Visual/format gap | Keep the existing owner FAQ disclosure design; the fee answer stays the first, open item |
| Seascape gap | The 2026-11-18 draft published 17–20% and $85; 2026-11-20 forbids those numbers |
| Search fit | Existing owner money page answers the fee question with the basis and cover list, then routes to the review form |
| Local/GBP proof | Existing Bradenton/Sarasota local-team facts only; no GBP change |
| AEO/readback note | Visible FAQ text and FAQPage JSON-LD match exactly, in the partial that already emits FAQPage; no new FAQPage elsewhere |
| Recommendation | Lead the owner FAQ with "How much does Seascape charge to manage a vacation rental?" and keep the same passage on the pricing block, fees page, AMI/Sarasota cost FAQs, and the benchmark pricing note |
| Attack status | completed |
| Query variants inspected | vacation rental management fees Bradenton Sarasota what is included |
| SERP source | Free live web search November 16, 2026; no paid rank, SERP or AI-visibility check |
| Competitor URLs inspected | https://itrip.net/property-management/sarasota-bradenton; https://awning.com/airbnb-management/bradenton-florida; https://skyrun.com/blog/faq/what-do-vacation-rental-management-fees-cover/ (search result titles and snippets only) |
| Content gap and Seascape answer | Competitors lead with a percentage; Seascape leads with the fee basis, who quotes, and the five jobs already on the owner hub |
| Design/format strategy | Retain the existing owner Waterline FAQ partial; no CSS or template change |
| Seascape proof available | Current source copy and Hub owner-offer sections 2, 3, 7; Hub DEC-2026-11-18 (net rent, never gross) |
| Tools/plugins used | Free web search, repo source reads, Hub origin/main reads, local build and tests, Playwright screenshots |
| Decision and reason | Existing-page answer only; expansion held; Sawyer's 2026-11-20 decision forbids published fee numbers |

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
- `scripts/enforcement/owner-fee-statement.test.js`
- `scripts/enforcement/recovery-smoke-owner.test.js`

## Copy and review contract

Draft, remove internal wording, then check voice and specificity. Approved public
copy (Sawyer and Patrick, 2026-11-20 11:24 AM ET, net-rent basis from Hub
DEC-2026-11-18): section label "How our management fee works"; body "Seascape
charges a share of your home's net rent, with a lower rate for homes that earn
more and a monthly minimum. We quote your exact fee after looking at your home.
That covers listing on Airbnb, Vrbo, Google, our direct website and more;
setting and adjusting nightly rates as demand moves; screening and messaging
guests from Bradenton; coordinating cleaning and maintenance, with a note
before you have to ask; and paying you monthly with a statement of what your
home earned and spent, with tourism and sales taxes remitted for you." Fees-page
description uses the opener plus "We quote each owner after looking at the
home." The same body appears in the owner FAQ (visible text and FAQPage JSON-LD
match exactly), the owner pricing block, the fees page, the AMI and Sarasota
cost FAQs, and the benchmark pricing note. Never name Patrick in fee copy.
`src/llms.txt` is unchanged.
