# Brief: AMI vs Siesta Transfer Readback

## Content Gate Inputs

- persona: Gulf Coast traveler comparing Anna Maria Island and Siesta Key before choosing a stay base.
- primary keyword: Anna Maria Island vs Siesta Key
- secondary keywords: Siesta Key vs Anna Maria Island, best time to visit Anna Maria Island, Bradenton vs Sarasota vacation, Siesta Key vs Anna Maria Island for families
- audience pattern: comparison reader with enough demand to justify a stay-base handoff, but not enough downstream action to claim the current transfer path works.
- proof source: `seascape-analytics/tmp/serp-weekly/weekly-ai-visibility-receipt.md`, `seascape-analytics/tmp/serp-weekly/weekly-ai-visibility-decision.json`, DataForSEO Standard Queue receipt `seascape-analytics/tmp/serp-weekly/dataforseo-serp-receipt.json`, and GSC inspection audit `seascape-analytics/tmp/serp-weekly/gsc-inspection-guide-winners.json`, rerun on 2026-06-26 for the 2026-06-15 to 2026-06-21 window.
- required internal links: `/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/siesta-key-area-vacation-rentals/`, `/stays/anna-maria-island-beachfront-rentals/`
- CTA target: move comparison readers into one stay-base page using the existing `guide_book_direct_click` tracking.
- anti-claims: no booking lift, no revenue lift, no AI-citation lift, no local-pack claim, no broad guide rewrite, no new comparison page, no owner-demand claim.

## Why This Brief

- The repaired analytics receipt no longer blocks on a DataForSEO source failure.
- The completed SERP rows cover all five `guide-winners` inspection pages.
- `/guides/anna-maria-island-vs-siesta-key/` still has demand in the measured window: `22` GSC clicks, `2224` impressions, `110` GA4 sessions, and `0` guide transfer events.
- GSC inspection shows `5` of `5` guide-winner pages passing, with `0` canonical mismatches, `0` not indexed pages, `0` robots blocks, and `0` fetch issues.
- This read overlaps the prior transfer-path deploy window, so it opens the next readback brief but does not prove the June 24 implementation failed.

## Experiment And Readback Contract

- hypothesis: if the first complete post-deploy window still shows AMI-vs-Siesta demand with zero transfer, the next smallest site test is CTA placement or stay-base copy, not another guide rewrite.
- primary event: `guide_book_direct_click`
- guardrail event: indexability, canonical, Article, FAQPage, BreadcrumbList, and existing stay-base links remain intact.
- entry criteria: wait for the first full post-deploy GSC + GA4 window described in `docs/status/ami-vs-siesta-readback.md`.
- decision rule: if `guide_book_direct_click >= 1` and no crawl/index/event regression appears, hold. If sessions stay above `20` and guide/stay/booking actions remain `0`, open one CTA placement or copy test on the existing guide.
- what should wait: a broad comparison-guide rewrite, a new AMI-vs-Siesta page, an offsite authority review, and any booking or revenue claim.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `Anna Maria Island vs Siesta Key`, `Siesta Key vs Anna Maria Island`, and stay-base follow-up queries. |
| Searcher intent | Beach comparison feeding guest stay selection. |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-06-26 |
| SERP stale after | 2026-07-03 |
| Current proof | Repaired analytics receipt shows the page at `22 / 2224 / 110 / 0` for GSC clicks / impressions / GA4 sessions / guide transfer events, with a visible DataForSEO SERP row and no GSC inspection regression. |
| Top visible competitors | Reddit, Mousin' Around, Facebook discussions, TripAdvisor, and travel-blog style comparison pages. |
| Competitor angle | User opinion, beach feel, restaurant/nightlife tradeoffs, public access, and where-to-stay framing. |
| Seascape gap | Demand exists, but the tracked stay-base handoff still needs a clean post-deploy read before another source change. |
| Search fit | The existing guide remains the right URL. This brief is a readback/next-test brief, not a new page brief. |
| Local/GBP proof | Not proven. The analytics receipt says local-pack and GBP-sensitive commercial coverage are still not measured for this route. |
| AEO/readback note | Keep the direct comparison answer extractable. Any next test should move the stay-base choice closer to the reader without burying the answer. |
| Recommendation | Hold for the full post-deploy readback window; if still zero transfer, test CTA placement or copy only. |

## Release Gate Checklist

- source files likely to change: none until the post-deploy readback qualifies a follow-up source change.
- routes to smoke test if a follow-up source change opens:
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
- commands to run for this brief-only change:
  - `npm run git:preflight`
  - `npm run lint:content`
- regression risks to watch: treating an overlapping pre/post-deploy window as a completed experiment, adding more CTAs before the answer, or claiming booking impact from page-level behavior.

## Done When

- the brief exists as the narrow next-cycle contract
- no public source copy changed from this brief alone
- the next agent can run `npm run verify:ami-vs-siesta-readback` and then apply the decision rule above
