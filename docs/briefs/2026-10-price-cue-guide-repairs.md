# Brief: drop unsourced mainland price-advantage lines

- lifecycle: active
- task scope: rewrite existing-guide sentences that pair a price term with a comparative or quantity cue and have no sourcedClaims row, so the fail-closed claim scanner does not allowlist a live price-advantage
- completion or successor: stacked with the claim-parser PR; do not merge until Sawyer merges the stack

## Content Gate Inputs

- persona: a guest pricing a mainland vs island week, a spring-break charter, or an AMI vs Siesta checkout who will quote the first cheaper/lower-rate or hundreds-in-fees sentence they see
- primary keyword: anna maria island vacation cost
- secondary keywords: spring break activities bradenton, anna maria island vs siesta key
- audience pattern: a planner or assistant repeats the mainland-vs-island cost line, the charter-rate line, or the platform-fee “hundreds” line as current fact
- proof source: `src/_data/sourcedClaims.json` is `[]` on 2026-10-17; `docs/status/next-batch.md` reread on 2026-10-12 is fresh but below threshold; live cost, spring-break, and AMI vs Siesta guides still carried unsourced price-advantage lines
- offer claim: n/a (guest-lane claim repair; no owner-offer line)
- required internal links: /guides/, /properties/
- CTA target: unchanged on the named guides
- anti-claims: do not publish a mainland lodging, charter, platform-fee, airfare, Bradenton-vs-Sarasota, or seasonal-rate advantage without a sourcedClaims row; do not invent nightly rates, savings percents, or a cheaper-than-island guarantee; do not keep “often cost less,” “slightly lower rates,” “separate by hundreds,” “significantly lower rates,” “typically cost less,” “prices lower,” or “most affordable months” as current fact
- hypothesis: the fail-closed price-cue scanner will keep catching qualitative advantages; rewriting the live sentences is the honest fix, not a hashed allowlist
- primary event: guide_book_direct_click
- guardrail event: email_capture_submit
- entry criteria: published guide sentences still asserted a mainland cost, charter-rate, or quantified platform-fee advantage with no sourcedClaims row
- readback window: after the rewrite is on a deploy preview, compare the named sentences to production
- decision rule: ship only if the named sentences stop asserting a cheaper/lower-rate or hundreds-in-fees advantage and no new rate or savings figure is added

## Required Internal Link Map

These guides are not a topical cluster. They share only the same unsourced price-cue defect, so each page keeps the links it already owns.

- src/guides/anna-maria-island-vacation-cost-guide-2026/index.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-waterfront-vacation-rentals/, /guides/
- src/guides/spring-break-activities-bradenton-anna-maria-island/index.html: /stays/spring-break-rentals-anna-maria-island/, /guides/, /properties/
- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /guides/
- src/guides/best-time-visit-anna-maria-island.html: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /guides/
- src/guides/best-time-to-visit-anna-maria-island/index.html: /stays/anna-maria-island-vacation-rentals/, /guides/, /properties/
- src/guides/bradenton-insider-guide.html: /stays/bradenton-waterfront-vacation-rentals/, /guides/, /properties/
- src/guides/flights-to-anna-maria-island/index.html: /stays/anna-maria-island-vacation-rentals/, /guides/, /properties/

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Anna Maria Island vacation cost; spring break activities Bradenton Anna Maria Island; Anna Maria Island vs Siesta Key |
| Searcher intent | guide / trip-cost research, not a new stay lander |
| Current Seascape URL | /guides/anna-maria-island-vacation-cost/, /guides/spring-break-activities-bradenton-anna-maria-island/, /guides/anna-maria-island-vs-siesta-key/, /guides/best-time-visit-anna-maria-island/, /guides/bradenton-insider-guide/, /guides/flights-to-anna-maria-island/ |
| SERP observed date | 2026-10-17 |
| SERP stale after | 2026-10-24 |
| Current proof | docs/status/next-batch.md reread on 2026-10-12 is fresh but below threshold (requested window 2026-10-03 to 2026-10-09; BigQuery GSC data_date 2026-10-09). This edit uses the empty sourcedClaims.json file and the live guide sentences, not an impact claim. |
| Top visible competitors | No competitor rewrite. This batch only removes unsourced comparative price lines on existing guides. |
| Competitor angle | Destination and charter pages still quote nightly or trip prices. The gap here is Seascape copy that asserts a mainland cost, charter-rate, or quantified platform-fee advantage without a sourced row. |
| Visual/format gap | None required. Keep existing guide layout and only replace the named claim sentences. |
| Seascape gap | The cost guide said mainland homes “often cost less” and that September and October are the most affordable months with lower peak-season rates. The spring-break guide said Bradenton fishing charters have “slightly lower rates.” The AMI vs Siesta kit said platform fees “separate by hundreds.” The live best-time pages said shifting dates can mean “significantly lower rates” or that fall has the lowest rental rates. The Bradenton insider FAQ said rentals “typically cost less” than Sarasota. The flights guide said TPA “often prices lower.” None of those lines has a sourcedClaims row. |
| Search fit | Keep the existing guide URLs. Replace the unsourced advantages with a checkout or quote comparison. Conversion stays on /properties/ and the existing stay links. Do not open a new page. |
| Local/GBP proof | Not applicable: organic guide-copy claim repair, no local-pack or GBP claim. |
| AEO/readback note | No AI citation-lift claim. Readback is only that the preview sentences stop publishing an unsourced cheaper/lower-rate or hundreds-in-fees advantage. |
| Recommendation | keep the existing guides: drop the mainland cost-less, lower-rate, and hundreds-in-fees lines; tell the reader to compare a complete checkout or current charter quote for the same dates. |
| Attack status | none found after named checks |
| Query variants inspected | how much does a vacation to Anna Maria Island cost; spring break activities Bradenton; Anna Maria Island vs Siesta Key; best time to visit Anna Maria Island |
| SERP source | Public live guide reads on 2026-10-17; next-batch.md 2026-10-12 freshness receipt. Not a location-controlled rank report. |
| Competitor URLs inspected | source check: live cost, spring-break, AMI vs Siesta, and best-time guides plus empty `src/_data/sourcedClaims.json` on 2026-10-17; SERP check: no DataForSEO or public SERP action because next-batch.md is fresh but below threshold on 2026-10-12; competitor-page check: no competitor page rewrite, this batch only removes unsourced price-cue sentences |
| Content gap and Seascape answer | Guides must not assert a mainland lodging, charter, or quantified platform-fee advantage without a sourced row. Answer: compare a complete checkout or current charter quote for the same trip. |
| Design/format strategy | Text-only sentence replacement inside existing guide HTML. No new visual pattern. |
| Seascape proof available | Empty sourcedClaims.json on 2026-10-17. Live cost-guide, spring-break, and AMI vs Siesta sentences still used “often cost less,” “slightly lower rates,” and “separate by hundreds” before this rewrite. |
| Tools/plugins used | Public live page reads on 2026-10-17; docs/status/next-batch.md 2026-10-12 freshness receipt; local sourced-claims, search-brief-gate, and content-voice gates. |
| Decision and reason | Repair the source-backed price-cue sentences on the existing guides. next-batch.md remains below threshold, so this is claim hygiene, not a new SEO batch. |

## Why This Batch

- The fail-closed claim scanner treats any price/cost/fee/rate term paired with a comparative cue as a candidate.
- Coverage is a sourcedClaims row or an exact hashed non-claim sentence. These lines were live claims, not frozen non-claims.
- Allowlisting them would hide a real price-advantage. Rewriting them is the intended repair.

## Source Files Changed In This Batch

- source files likely to change: `src/guides/anna-maria-island-vacation-cost-guide-2026/index.html`, `src/guides/spring-break-activities-bradenton-anna-maria-island/index.html`, `src/guides/anna-maria-island-vs-siesta-key.html`, `src/guides/best-time-visit-anna-maria-island.html`, `src/guides/best-time-to-visit-anna-maria-island/index.html`, `src/guides/bradenton-insider-guide.html`, `src/guides/flights-to-anna-maria-island/index.html`
- src/guides/anna-maria-island-vacation-cost-guide-2026/index.html
- src/guides/spring-break-activities-bradenton-anna-maria-island/index.html
- src/guides/anna-maria-island-vs-siesta-key.html
- src/guides/best-time-visit-anna-maria-island.html
- src/guides/best-time-to-visit-anna-maria-island/index.html
- src/guides/bradenton-insider-guide.html
- src/guides/flights-to-anna-maria-island/index.html

