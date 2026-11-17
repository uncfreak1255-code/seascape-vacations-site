# Brief: AMI vs Siesta Key snippet CTR rescue (2026-11-17)

- lifecycle: active
- task scope: complete the evidence and Gate 0 attack receipt for `/guides/anna-maria-island-vs-siesta-key/`, authorized by the 2026-11-09 read in `docs/status/next-batch.md`, and replace only the meta, Open Graph, and Twitter description. Keep the title, H1, body, JSON-LD, layout, images, and CSS unchanged; update the pinned metadata test and page ledger with the description change.
- completion or successor: metadata-only source draft plus Gate 0 evidence. The 2026-11-17 live SERP introduces a possible mobile cannibalization question, but this task does not act on it. Publication requires the normal content and release gates and the approved settle override recorded in the source commit while the page's 2026-10-25 rescue settles through 2026-11-22.

## Content Gate Inputs

- persona: a traveler choosing between Anna Maria Island and Siesta Key before choosing where to stay
- primary keyword: anna maria island vs siesta key
- secondary keywords: anna maria island or siesta key; anna maria vs siesta key; anna maria or siesta key; how far is anna maria island from siesta key
- audience pattern: comparison searcher who needs a direct beach-style choice and a stay-planning next step
- proof source: free OpenSEO Search Console read on 2026-11-17 for 2026-10-18 through 2026-11-14; live local OpenSEO SERP captured 2026-11-17 17:29 ET for US/en, desktop and mobile, depth 20 and saved as the private report `AMI vs Siesta Key Gate 0 SERP — Nov 17, 2026` (about $0.01)
- required internal links: unchanged
- CTA target: unchanged existing `guide_book_direct_click` stay links
- anti-claims: no ranking or click lift before readback; no claim that a Seascape home is on either island; no new distance, price, fee, capacity, or amenity claim

## Why This Rescue

- The URL earned 7,855 impressions and 5 clicks in the supplied 28-day read. The broad query `siesta key` accounted for 6,744 impressions at average position 8.5 and one click; mobile accounted for 7,128 total impressions at position 8.5.
- The comparison family remains visible around positions 9–10: `anna maria island vs siesta key` (74 impressions), `anna maria island or siesta key` (53), `anna maria vs siesta key` (23), `anna maria or siesta key` (7), and `how far is anna maria island from siesta key` (8).
- The title already matches the comparison word order. The description instead opened with the acronym `AMI`; this metadata-only rescue spells out both destinations early and states the supported beach-style choice. The live SERP also shows a device split: Seascape is absent through desktop organic #16, while mobile ranks the families page at organic #6 and the target page at organic #8. That second Seascape result may indicate cannibalization, but one SERP capture is not enough to diagnose or change routing.

## Experiment And Readback Contract

- hypothesis: a description that names both destinations and states the page's supported choice improves qualified comparison-family clicks without changing position or page content
- primary metric: Search Console CTR and clicks for the comparison query family on this URL over the first 7 complete days after production publish, then the 28-day settle window
- comparison query family: `anna maria island vs siesta key`, `anna maria island or siesta key`, `anna maria vs siesta key`, `anna maria or siesta key`, and close word-order variants containing both destinations; report the broad `siesta key` row separately so it cannot swamp the comparison result
- guardrail: comparison-family average position; lower is better
- kill/revert rule: revert the description if comparison-family clicks are zero in the first 7 complete days while impressions are at least 100, or if average position worsens by 3 or more positions versus the 2026-10-18 through 2026-11-14 baseline. At 28 days, keep only if comparison-family CTR or clicks improve without that position loss; otherwise record insufficient evidence and revert to the prior description.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | `anna maria island vs siesta key`, `anna maria island or siesta key`, `anna maria vs siesta key`, `anna maria or siesta key`, and close variants containing both destinations |
| Searcher intent | Comparison and guide/research with downstream guest booking |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/` |
| SERP observed date | 2026-11-17 |
| SERP stale after | 2026-11-24 |
| Current proof | Final free Search Console read for 2026-10-18 through 2026-11-14: 7,855 impressions and 5 clicks on the URL; `anna maria island vs siesta key` had 74 impressions, 0 clicks, and average position 9.6, while mobile had 7,128 impressions at average position 8.5. The 2026-11-17 live SERP shows no Seascape result through desktop organic #16; mobile shows `/guides/siesta-key-vs-anna-maria-island-families/` at organic #6 and the target at organic #8. The 2026-11-09 next-batch read authorizes draft work only. |
| Top visible competitors | Desktop organic #1 Facebook, #2 Florida Vacation Advisor, and #3 Always on the Shore; mobile organic #1 Mousin' Around, #4 Compass Hotel, and #5 Tripadvisor are the leading named comparison results around the intent. |
| Competitor angle | Desktop mixes UGC with direct “which is better” comparison guides. Mobile favors first-person/community choice, hotel/local-stay framing, and direct vacation-fit answers. AI Overview and People Also Ask appear on both devices, increasing the value of concise, extractable answers. |
| Visual/format gap | The SERPs include AI Overview and People Also Ask on both devices, plus video and image features. Seascape already supplies a direct answer, comparison tables, topic verdicts, FAQ schema, and stay choices, so skip new visual formats in this evidence-only task; a later source proposal should answer differently through clearer page ownership rather than copying competitor media. |
| Seascape gap | Seascape has no desktop organic visibility through #16, and mobile splits visibility between the families page at #6 and the target at #8. The device split and possible cannibalization are the concrete gaps; this single capture does not establish which page should own the family variant. |
| Search fit | The target remains the intended broad two-destination comparison and supports existing `guide_book_direct_click` stay links. Rescue this URL with the description-only change rather than create a new page; hold body, routing, and ownership changes until the families-page overlap is diagnosed from repeated query/landing-page evidence. |
| Local/GBP proof | N/A. This is an informational comparison result, not a local-pack or map result. |
| AEO/readback note | The 2026-11-17 desktop and mobile SERPs both contain AI Overview and People Also Ask. No separate AEO score or answer-citation readback was run; the live feature readback is sufficient to record the surface, not to claim Seascape inclusion. |
| Recommended action | Keep the title. Replace only `meta description`, `og:description`, and `twitter:description` with: “Anna Maria Island or Siesta Key? Compare quieter Old Florida beaches with Siesta's famous quartz sand, plus Bradenton stays near the island.” Record the desktop absence, mobile #6/#8 URL split, and possible cannibalization for later diagnosis; do not change routing from this one capture. |
| Attack status | completed |
| Query variants inspected | Live SERP: `anna maria island vs siesta key` on US/en desktop and mobile at depth 20. GSC: `anna maria island vs siesta key`, `anna maria island or siesta key`, `anna maria vs siesta key`, `anna maria or siesta key`, `siesta key anna maria island`, distance variants, and the broad `siesta key` row reported separately. |
| SERP source | Local OpenSEO `get_serp_results`, observed 2026-11-17 17:29 ET, US/en, desktop and mobile, depth 20; saved report `AMI vs Siesta Key Gate 0 SERP — Nov 17, 2026`; about $0.01. |
| Competitor URLs inspected | Captured SERP rows and snippets inspected for competitors on [Facebook](https://facebook.com), [Florida Vacation Advisor](https://floridavacationadvisor.com), [Always on the Shore](https://alwaysontheshore.com), [Mousin' Around](https://mousinaround.com), [Compass Hotel](https://compasshotel.com), and [Tripadvisor](https://tripadvisor.com); no independent competitor-page fetch was used. |
| Content gap and Seascape answer | Gap: desktop absence and two mobile Seascape URLs for one broad query. Seascape answer: keep the broad target as the comparison destination, update only its description, and retain its existing direct answer; do not rewrite the body or consolidate pages until repeated SERP and landing-page evidence identifies whether the families page is actually competing. |
| Design/format strategy | Keep the existing comparison table, topic verdicts, FAQ schema, imagery, and layout. Do not add video, image, or PAA-mirroring modules in this task; the evidence points first to page ownership and device visibility, not an unserved format. |
| Seascape proof available | Current source/body support the existing direct island-choice answer and stay CTA; the dated GSC receipt supplies query, device, impression, click, CTR, and position evidence; the live SERP supplies device-specific ranks and features. No booking-lift or AI-citation proof is claimed. |
| Tools/plugins used | Local OpenSEO `get_serp_results` receipt and saved-report title supplied by the task; free OpenSEO Search Console export supplied by the task; Compound Writing `cw-line-edit` with its required AI-residue check applied in this correction; repository `check:brief` and content lint for validation. No new lookup, report readback, or hosted OpenSEO fallback was used. |
| Decision and reason | Keep the title and change only the three matching description fields. The description now spells out the comparison destinations and reflects body-supported distinctions; the possible mobile cannibalization remains a separate diagnosis and does not change routing in this batch. |

## Writing Pass

- Draft the copy: used the committed description as the draft: “Anna Maria Island or Siesta Key? Compare quieter Old Florida beaches with Siesta's famous quartz sand, plus Bradenton stays near the island.” It puts the choice first and spells out both destinations.
- Remove internal wording: checked the sentence and retained no metric, process, rescue, test, or acronym language.
- Check claims against page source: confirmed the page supports AMI's quieter Old Florida character, Siesta's nearly pure quartz sand, and Bradenton homes near AMI beaches. No ranking lift, on-island inventory, distance, price, fee, capacity, or amenity claim was added.
- Check voice and specificity: applied `cw-line-edit` and its required AI-residue pass against the Site voice, banned-pattern, and approved-example sources. The sentence stays direct, guest-facing, specific, and free of stock framing or inflated certainty; no wording change was needed during this correction.
- Independent voice review: not run. No separate independent voice reviewer was available in this session; the native source-backed voice check above is not recorded as independent review.

## Source Files Changed In This Batch

- `docs/briefs/2026-11-ami-vs-siesta-snippet-rescue.md`
- `src/guides/anna-maria-island-vs-siesta-key.html` (meta, Open Graph, and Twitter description only)
- `scripts/enforcement/metadata-integrity.test.js` (pinned description expectation)
- `docs/status/page-ledger.json` (unshipped metadata-rescue entry)
