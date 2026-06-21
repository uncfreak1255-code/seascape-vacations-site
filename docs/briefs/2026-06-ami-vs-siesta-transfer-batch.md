# Brief: Anna Maria Island vs Siesta Key Transfer Batch

## Content Gate Inputs

- persona: Gulf Coast traveler choosing a beach base before comparing direct-bookable stays.
- primary keyword: Anna Maria Island vs Siesta Key
- secondary keywords: Siesta Key vs Anna Maria Island, Anna Maria Island vacation rentals, Siesta Key area vacation rentals, Bradenton homes near AMI beaches
- audience pattern: comparison reader who already understands the beach tradeoff but needs the next stay-area decision made obvious.
- proof source: `seascape-analytics/docs/status/weekly-ai-visibility-receipt-2026-06-12-to-2026-06-18.md`, `docs/status/next-batch.md` run date 2026-06-20, `seascape-analytics/docs/status/weekly-ai-visibility-decision-2026-06-12-to-2026-06-18.json`, DataForSEO live SERP receipt `seascape-analytics/docs/status/dataforseo-serp-receipt-2026-06-20.json`, live web SERP review on 2026-06-20, and current source for `/guides/anna-maria-island-vs-siesta-key/`.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- CTA target: move beach-choice readers into stay-area pages with `guide_book_direct_click` and keep the booking-engine handoff as a secondary direct-availability action.
- anti-claims: no booking or revenue lift claim, no rank recovery claim, no AI citation claim, no current price claim from old rate checks, no broad rewrite, no new comparison page, no off-site authority claim.

## Experiment And Readback Contract

- hypothesis: if the guide turns the beach comparison into a clear stay-base shortcut above the main comparison table, more comparison readers will click into a relevant stay page without weakening the current snippet structure.
- primary event: `guide_book_direct_click`
- guardrail event: indexability, canonical, Article, FAQPage, BreadcrumbList, existing guide conversion kit, and tracked stay links remain intact.
- entry criteria: the 2026-06-12 to 2026-06-18 analytics receipt marks `/guides/anna-maria-island-vs-siesta-key/` as the clearest distribution gap: `25` GSC clicks, `2502` impressions, `104` GA4 sessions, and `0` guide transfer events.
- readback window: first 7 complete days after deploy once GSC and GA4 cover the window.
- decision rule: keep if `guide_book_direct_click` reaches at least `1` without rank, CTR, indexation, or event markup regression; if traffic remains above 20 sessions and all guide/stay/booking actions stay at `0`, test CTA placement or copy before broad guide expansion.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `Anna Maria Island vs Siesta Key`, `Siesta Key vs Anna Maria Island`, and stay-base follow-up queries around AMI, Bradenton near AMI beaches, and Siesta Key area stays. |
| Searcher intent | Comparison / guide research feeding guest booking. |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `seascape-analytics/docs/status/weekly-ai-visibility-receipt-2026-06-12-to-2026-06-18.md` says this page moved from `19 / 2598 / 121 / 0` to `25 / 2502 / 104 / 0` for GSC clicks / impressions / GA4 sessions / guide transfer events and calls it a `distribution gap`. `docs/status/next-batch.md` says `open next batch` for a narrow `anna-maria-island-vs-siesta-key-distribution-content` batch. |
| Top visible competitors | Reddit discussion, Mousin' Around's Siesta Key vs Anna Maria Island vs Longboat Key guide, Facebook beach-choice discussion, Luxury Travel Diarie's Siesta Key vs Anna Maria article, and travel-blog style Sarasota beach roundups. |
| Competitor angle | UGC opinion, sand reputation, public beach access, restaurants/nightlife, island pace, where-to-stay framing, and broad vacation-rental/value claims. |
| Seascape gap | The page answers the beach question and has tracked stay links, but the stay decision is still easy to skim past. The page should turn AMI, Bradenton near AMI, and Siesta-side trips into a clearer stay-base shortcut before the long comparison continues. |
| Search fit | The existing winner guide is the correct URL. It already ranks in striking distance and owns the comparison intent; the action is a transfer/CRO improvement on the current page, not a new page or title rewrite. |
| Local/GBP proof | Not a local-pack or GBP route. The map/local work belongs to analytics off-site/entity review, not this guide transfer batch. |
| AEO/readback note | Keep the direct-answer block and comparison table extractable. The new stay-base module should support readers after the answer, not replace the answer. AI/citation movement is analytics-later work. |
| Recommended action | Add a concise stay-base shortcut with tracked links to the AMI, Bradenton-near-AMI, and Siesta-area stay pages; tighten guide conversion kit labels so the primary action names a real stay area. |

## Required Internal Link Map

- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/

## Release Gate Checklist

- source files likely to change:
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `scripts/enforcement/metadata-integrity.test.js`
- routes to smoke test:
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
- commands to run:
  - `npm run lint:content`
  - `node --test scripts/enforcement/metadata-integrity.test.js`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run git:preflight`
- regression risks to watch: top answer diluted, too many CTAs before the answer, broken event markup, vague booking-fee copy, or a page that sounds like an SEO work order.

## Done When

- one active transfer brief exists
- the page gives comparison readers an early stay-base shortcut with tracked stay links
- the guide conversion kit CTA labels name the real stay decision
- content lint and targeted tests pass
- the next analytics reread can compare `guide_book_direct_click` after deploy
