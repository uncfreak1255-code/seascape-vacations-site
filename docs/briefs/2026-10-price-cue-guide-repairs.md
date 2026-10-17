# Brief: drop unsourced mainland price-advantage lines

- lifecycle: active
- task scope: rewrite two existing-guide sentences that pair a price term with a comparative cue and have no sourcedClaims row, so the fail-closed claim scanner does not allowlist a live price-advantage
- completion or successor: stacked with the claim-parser PR; do not merge until Sawyer merges the stack

## Content Gate Inputs

- persona: a guest pricing a mainland vs island week, or a spring-break charter, who will quote the first cheaper/lower-rate sentence they see
- primary keyword: anna maria island vacation cost
- secondary keywords: spring break activities bradenton, bradenton fishing charters
- audience pattern: a planner or assistant repeats the mainland-vs-island cost line or the charter-rate line as current fact
- proof source: `src/_data/sourcedClaims.json` is `[]` on 2026-10-17; `docs/status/next-batch.md` reread on 2026-10-12 is fresh but below threshold; live cost guide and spring-break guide still carried unsourced “cost less” / “lower rates” lines
- offer claim: n/a (guest-lane claim repair; no owner-offer line)
- required internal links: /guides/, /properties/
- CTA target: unchanged on both guides
- anti-claims: do not publish a mainland lodging or charter price advantage without a sourcedClaims row; do not invent nightly rates, savings percents, or a cheaper-than-island guarantee; do not keep “often cost less” or “slightly lower rates” as current fact
- hypothesis: the fail-closed price-cue scanner will keep catching qualitative advantages; rewriting the two live sentences is the honest fix, not a hashed allowlist
- primary event: guide_book_direct_click
- guardrail event: email_capture_submit
- entry criteria: two published guide sentences still asserted a mainland cost or rate advantage with no sourcedClaims row
- readback window: after the rewrite is on a deploy preview, compare the two sentences to production
- decision rule: ship only if both sentences stop asserting a cheaper/lower-rate advantage and no new rate or savings figure is added

## Required Internal Link Map

These two guides are not a topical cluster. They share only the same unsourced price-cue defect, so each page keeps the links it already owns.

- src/guides/anna-maria-island-vacation-cost-guide-2026/index.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-waterfront-vacation-rentals/, /guides/
- src/guides/spring-break-activities-bradenton-anna-maria-island/index.html: /stays/spring-break-rentals-anna-maria-island/, /guides/, /properties/

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Anna Maria Island vacation cost; spring break activities Bradenton Anna Maria Island |
| Searcher intent | guide / trip-cost research, not a new stay lander |
| Current Seascape URL | /guides/anna-maria-island-vacation-cost/, /guides/spring-break-activities-bradenton-anna-maria-island/ |
| SERP observed date | 2026-10-17 |
| SERP stale after | 2026-10-24 |
| Current proof | docs/status/next-batch.md reread on 2026-10-12 is fresh but below threshold (requested window 2026-10-03 to 2026-10-09; BigQuery GSC data_date 2026-10-09). This edit uses the empty sourcedClaims.json file and the two live guide sentences, not an impact claim. |
| Top visible competitors | No competitor rewrite. This batch only removes two unsourced comparative price lines on existing guides. |
| Competitor angle | Destination and charter pages still quote nightly or trip prices. The gap here is Seascape copy that asserts a mainland cost or rate advantage without a sourced row. |
| Visual/format gap | None required. Keep existing guide layout and only replace the two claim sentences. |
| Seascape gap | The cost guide said mainland homes “often cost less” than equivalent island listings. The spring-break guide said Bradenton fishing charters have “slightly lower rates” than island-based operators. Neither line has a sourcedClaims row. |
| Search fit | Keep the existing guide URLs. Replace the two unsourced advantages with a same-dates quote comparison. Conversion stays on /properties/ and the existing stay links. Do not open a new page. |
| Local/GBP proof | Not applicable: organic guide-copy claim repair, no local-pack or GBP claim. |
| AEO/readback note | No AI citation-lift claim. Readback is only that the two preview sentences stop publishing an unsourced cheaper/lower-rate advantage. |
| Recommendation | keep the existing guides: drop the mainland cost-less and lower-rate lines; tell the reader to compare a complete checkout or current charter quote for the same dates. |
| Attack status | none found after named checks |
| Query variants inspected | how much does a vacation to Anna Maria Island cost; spring break activities Bradenton; Bradenton fishing charters vs Anna Maria Island |
| SERP source | Public live guide reads on 2026-10-17; next-batch.md 2026-10-12 freshness receipt. Not a location-controlled rank report. |
| Competitor URLs inspected | source check: live cost and spring-break guides plus empty `src/_data/sourcedClaims.json` on 2026-10-17; SERP check: no DataForSEO or public SERP action because next-batch.md is fresh but below threshold on 2026-10-12; competitor-page check: no competitor page rewrite, this batch only removes two unsourced price-cue sentences |
| Content gap and Seascape answer | Guides must not assert a mainland lodging or charter price advantage without a sourced row. Answer: compare a complete checkout or current charter quote for the same trip. |
| Design/format strategy | Text-only sentence replacement inside existing guide HTML. No new visual pattern. |
| Seascape proof available | Empty sourcedClaims.json on 2026-10-17. Live cost-guide and spring-break sentences still used “often cost less” and “slightly lower rates” before this rewrite. |
| Tools/plugins used | Public live page reads on 2026-10-17; docs/status/next-batch.md 2026-10-12 freshness receipt; local sourced-claims, search-brief-gate, and content-voice gates. |
| Decision and reason | Repair the two source-backed price-cue sentences on the existing guides. next-batch.md remains below threshold, so this is claim hygiene, not a new SEO batch. |

## Why This Batch

- The fail-closed claim scanner treats any price/cost/fee/rate term paired with a comparative cue as a candidate.
- Coverage is a sourcedClaims row or an exact hashed non-claim sentence. These two lines were live claims, not frozen non-claims.
- Allowlisting them would hide a real price-advantage. Rewriting them is the intended repair.

## Source Files Changed In This Batch

- source files likely to change: `src/guides/anna-maria-island-vacation-cost-guide-2026/index.html`, `src/guides/spring-break-activities-bradenton-anna-maria-island/index.html`
- src/guides/anna-maria-island-vacation-cost-guide-2026/index.html
- src/guides/spring-break-activities-bradenton-anna-maria-island/index.html
