# Brief: Anna Maria Island vs Siesta Key Freshness Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler choosing between Anna Maria Island and Siesta Key as a beach base.
- primary keyword: Anna Maria Island vs Siesta Key
- secondary keywords: Siesta Key vs Anna Maria Island, Anna Maria Island or Siesta Key, AMI vs Siesta Key, Anna Maria Island vs Siesta Key vacation rentals
- audience pattern: comparison researcher who wants a practical beach, parking, dining, and stay-base answer before booking.
- proof source: `docs/status/next-batch.md` run date 2026-06-20, `docs/reports/rank-tracker-2026-06-03.md`, `docs/portfolio/winner-guides.md`, `docs/status/content-decay-patrol.md`, live SERP read on 2026-06-20, current Sarasota County Siesta Beach page, current Manatee County Route 5 AMI Trolley page, and current source for `/guides/anna-maria-island-vs-siesta-key/`.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /stays/siesta-key-area-vacation-rentals/
- CTA target: keep `guideConversionKit` and route beach-choice readers into AMI and Siesta stay pages with `guide_book_direct_click`.
- anti-claims: no rank recovery claim, no AI citation claim, no broad current price claim from old rate checks, no copied competitor structure, no new comparison page, no stale "Tripadvisor #1 today" wording.

## Experiment And Readback Contract

- hypothesis: a narrow freshness cleanup that replaces stale award/rate labels with current beach-source proof and planning-context language should improve trust and snippet safety without changing the page's proven comparison structure.
- primary event: `guide_book_direct_click`
- guardrail event: indexability, canonical, Article, FAQPage, BreadcrumbList, and existing stay-destination links stay intact.
- entry criteria: `docs/status/next-batch.md` lists the route at rank 6 for `Anna Maria Island vs Siesta Key`, `docs/reports/rank-tracker-2026-06-03.md` keeps the route in striking-distance comparison-guide work, and `docs/status/content-decay-patrol.md` flags stale proof labels/dateModified on this priority URL.
- readback window: first 7 complete days after deploy once final GSC data covers the window.
- decision rule: keep if rank, CTR, clicks, or `guide_book_direct_click` trend improves without a guardrail failure; if flat, run a second content-depth pass against visible winners; if worse, retune title/meta or revert the weakest freshness change.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | `Anna Maria Island vs Siesta Key`, `Siesta Key vs Anna Maria Island`, and `Anna Maria Island or Siesta Key`. |
| Searcher intent | Comparison / guide research feeding guest booking. |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `docs/status/next-batch.md` run date 2026-06-20 lists this URL at rank 6 for `Anna Maria Island vs Siesta Key` with CTR-support classification and competitors Reddit, Mousin' Around, and Facebook. `docs/reports/rank-tracker-2026-06-03.md` lists the URL at positions 5.8-6.4 across the query family and names Mousin' Around plus Luxury Travel Diarie as competitor pressure. Final post-edit impact analytics are not ready. |
| Top visible competitors | Reddit beach-choice discussion, Mousin' Around's Siesta Key vs Anna Maria Island vs Longboat Key guide, Facebook AMI/Siesta discussion; supporting visible surface: Luxury Travel Diarie's Siesta Key vs Anna Maria article. |
| Competitor angle | UGC opinion, travel-blog beach comparison, sand reputation, nightlife, restaurants, parking, where-to-stay tradeoffs. |
| Seascape gap | The page has the right direct-booking handoff, but stale April/March labels and broad `#1 Beach in America` wording weaken trust. It should use current official beach/parking/transit proof and treat old rate checks as planning context, not current pricing proof. |
| Search fit | The existing URL already owns the winner-guide role and feeds AMI plus Siesta stay pages. Rescue the current page; do not create a variant. |
| Local/GBP proof | N/A for this route because the decision is beach-choice and stay-base research, not map-pack or local brand intent. |
| AEO/readback note | AEO impact is not proven. Keep the direct-answer block, comparison table, FAQPage schema, and stay links extractable for AI/search answers; wait for the next analytics/AI readback before claiming citation movement. |
| Recommended action | Update stale proof labels, current beach-source language, FAQPage award/rate wording, visible evidence card, `dateModified`, and the content-decay patrol readback. Keep title/meta and route structure unchanged. |

Rows below added 2026-07-24 for the post-#465 marker restore (see the dated addendum at the end of this brief):

| Field | Required answer |
| --- | --- |
| SERP observed date | 2026-07-24 |
| SERP stale after | 2026-07-31 |
| Current proof | 2026-07-24 post-deploy verify:recovery:live red on this route: "Reviewed June 20, 2026" and "950 free parking spaces" markers missing after the PR #465 redesign deploy |
| Visual/format gap | N/A — redesign layout kept exactly as #465 shipped it; one sentence restored in the existing intro style |
| Attack status | completed |
| Query variants inspected | "anna maria island vs siesta key"; "siesta key or anna maria island" (existing tracked variants) |
| SERP source | Existing rank tracking plus the 2026-07-24 post-deploy live-smoke read; no fresh SERP pull needed for an own-content restore |
| Competitor URLs inspected | Own-route live read: https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/ (markers absent post-#465, restored this batch) |
| Content gap and Seascape answer | No competitor gap — self-inflicted marker loss; the answer is restoration of the dated review line and cited parking statistic, not new content |
| Design/format strategy | Keep the #465 redesign untouched; one plain paragraph in the existing intro citation pattern |
| Seascape proof available | Sarasota County official Siesta Beach page citation, already used elsewhere on the page |
| Tools/plugins used | verify:recovery:live, git diff of #465, lint:content, lint:design, npm test, verify:release, test:visual |
| Decision and reason | Restore rather than relax the smoke assertion: dated review + cited statistic are deliberate proof mechanics on a winner page; relaxing would ratify a silent regression |
| Recommendation | Restore both markers verbatim in the redesigned intro; bump Article dateModified to match |

## Required Internal Link Map

- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /stays/siesta-key-area-vacation-rentals/
- src/guides/index.njk: /guides/anna-maria-island-vs-siesta-key/, /guides/bradenton-vs-sarasota/, /guides/

## Release Gate Checklist

- source files likely to change:
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/guides/index.njk`
  - `docs/status/next-batch.md`
  - `docs/status/content-decay-patrol.md`
  - `scripts/enforcement/metadata-integrity.test.js`
- routes to smoke test:
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/anna-maria-island-beachfront-rentals/`
  - `/stays/siesta-key-area-vacation-rentals/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run git:preflight`
- regression risks to watch: stale award claims, stale rate proof, broken guide conversion kit, schema parse failure, or public copy that sounds like an SEO work order.

## Done When

- active rescue brief exists
- source page no longer presents old rate checks as fresh proof
- source page uses current official beach/parking/transit source language where relevant
- content-decay patrol no longer flags this priority route for stale proof/dateModified
- verification commands pass or a blocker is named

## Post-Redesign Marker Restore (2026-07-24 addendum)

- What happened: the #465 AMI-vs-Siesta editorial redesign (merged 2026-07-24) dropped
  two live-smoke-enforced proof elements this brief originally shipped — the
  "Reviewed June 20, 2026" dated review line and the cited "950 free parking spaces"
  Sarasota County statistic. `verify:recovery:live` went red on the route immediately
  after the next production deploy; the daily live-smoke cron would follow.
- Decision: restore both markers as one sentence inside the redesigned intro,
  reusing the page's existing Sarasota County citation style. No other copy changed;
  the redesign's structure, sources list, and conversion kit stay as #465 shipped them.
- Why restore rather than relax the smoke assertion: the dated-review line and the
  cited statistic are deliberate freshness/proof mechanics on a tracked winner-family
  page (and the statistic+citation pattern is the highest-evidence AI-citation
  formatting per the 2026-07-24 GEO research read). Removing the assertion would have
  ratified a silent proof regression.
- Proof: `verify:recovery:live` green post-deploy; lint:content, npm test,
  verify:release green pre-merge.
