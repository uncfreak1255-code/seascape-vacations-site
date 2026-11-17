# Brief: AMI vs Siesta Key snippet CTR rescue (2026-11-17)

- lifecycle: active
- task scope: one draft-only search-description rescue for `/guides/anna-maria-island-vs-siesta-key/`, authorized by the 2026-11-09 read in `docs/status/next-batch.md`. Keep the title, H1, JSON-LD, body, layout, and images unchanged.
- completion or successor: source draft only. Publication requires the normal content and release gates plus a `Settle-Override: weak CTR rescue authorized by the 2026-11-09 next-batch read` commit trailer because the page's 2026-10-25 rescue settles through 2026-11-22.

## Content Gate Inputs

- persona: a traveler choosing between Anna Maria Island and Siesta Key before choosing where to stay
- primary keyword: anna maria island vs siesta key
- secondary keywords: anna maria island or siesta key; anna maria vs siesta key; anna maria or siesta key; how far is anna maria island from siesta key
- audience pattern: comparison searcher who needs a direct beach-style choice and a stay-planning next step
- proof source: free OpenSEO Search Console read on 2026-11-17 for 2026-10-18 through 2026-11-14, saved at `/Users/sawbeck/Projects/runs/grokbot-openseo/gsc-ami-vs-siesta-28d.txt`; prior completed SERP receipt in `docs/briefs/2026-10-ami-vs-siesta-key-rescue.md`
- required internal links: unchanged
- CTA target: unchanged existing `guide_book_direct_click` stay links
- anti-claims: no ranking or click lift before readback; no claim that a Seascape home is on either island; no new distance, price, fee, capacity, or amenity claim

## Why This Rescue

- The URL earned 7,855 impressions and 5 clicks in the supplied 28-day read. The broad query `siesta key` accounted for 6,744 impressions at average position 8.5 and one click; mobile accounted for 7,128 total impressions at position 8.5.
- The comparison family remains visible around positions 9–10: `anna maria island vs siesta key` (74 impressions), `anna maria island or siesta key` (53), `anna maria vs siesta key` (23), `anna maria or siesta key` (7), and `how far is anna maria island from siesta key` (8).
- The title already matches the comparison word order. The description instead opens with the acronym `AMI`, so this rescue spells out both destinations early and answers the choice directly. It changes no page-body or visual surface.

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
| SERP observed date | 2026-10-25, from the completed OpenSEO SERP receipt in the October rescue brief; the new 2026-11-17 evidence is Search Console, not a new SERP lookup |
| SERP stale after | 2026-11-01. Competitor ordering is stale and is not used to claim a current ranking gap. |
| Current proof | Free Search Console read, 2026-10-18 through 2026-11-14: 7,855 impressions and 5 clicks on the URL; comparison-family rows remain around positions 9–10 with weak CTR. The 2026-11-09 next-batch read names this URL as the secondary snippet rescue and authorizes draft PRs only. |
| Top visible competitors | Prior 2026-10-25 receipt: Reddit, Herald-Tribune/Thrillist, and Tripadvisor above comparable guides from vacationflorida.tv, annamariaislandbeachrentals.com, and headtosarasota.com. Current order is unverified. |
| Competitor angle | Community answers lead with a personal choice; comparable guides use a quick answer, local framing, parking, getting around, and FAQs. |
| Visual/format gap | None in scope. Seascape already has a direct answer, comparison tables, topic verdicts, FAQ schema, and stay choices. Skip layout, image, and visible-FAQ changes. |
| Seascape gap | The current description leads with `AMI` and adds Bradenton before spelling out Anna Maria Island. It does not give the comparison searcher as direct a pick as the body does. |
| Search fit | This winner guide already answers the two-destination choice and routes guests to the matching stay pages. Rescue the existing URL; do not create a new page. |
| Local/GBP proof | N/A. This is an informational comparison result, not a local-pack or map result. |
| AEO/readback note | N/A for this metadata-only rescue. No paid AEO check was run, and body answer text remains unchanged. |
| Recommended action | Keep the title. Replace only `meta description`, `og:description`, and `twitter:description` with: “Anna Maria Island or Siesta Key? Compare quieter Old Florida beaches with Siesta's famous quartz sand, plus Bradenton stays near the island.” |

## Writing Pass

- Draft the copy: put the choice first and spell out both destinations.
- Remove internal wording: no metric, process, rescue, or acronym language appears in reader copy.
- Check voice and specificity: the 140-character sentence uses only body-supported distinctions: `Quiet, Old Florida charm`, nearly pure quartz sand, and the existing where-to-stay decision.
- Compound line edit and AI-residue check: passed; the sentence is direct, source-bounded, and free of stock framing or inflated claims.

## Source Files In This Draft

- `src/guides/anna-maria-island-vs-siesta-key.html` (three matching description fields only)
- `docs/briefs/2026-11-ami-vs-siesta-snippet-rescue.md`
- `docs/status/page-ledger.json` (unshipped entry for this rescue)
