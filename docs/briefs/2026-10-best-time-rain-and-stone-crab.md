# Brief: Best-time guide rain and stone-crab corrections

- lifecycle: active
- task scope: Sawyer approved correcting only two factual errors on 2026-10-22: the November rainfall promise and the month label for the October 15 stone-crab opening. One existing guide; no layout, search-intent, metadata, schema, routing, tracking or other copy changes.
- completion or successor: this branch owns the two corrections and the required checks and targeted review. Source publication and live release are separate results.
- mutation owner: this Codex chat; sole editor and source publisher for this correction.

## Content Gate Inputs

- persona: a traveler choosing an Anna Maria Island travel month.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Anna Maria Island in November, stone crab season Anna Maria Island
- audience pattern: compare the seasonal weather paragraph and the annual-events month list before choosing dates.
- proof source: NOAA Sarasota-Bradenton 1991–2020 normals, November rainfall 1.81 inches versus June 7.05, July 7.39 and August 9.11 inches (https://www.weather.gov/media/tbw/climate/srqannnormrec.pdf); FWC stone-crab FAQ, opening October 15 (https://myfwc.com/research/saltwater/crustaceans/stone-crabs/faq/). Both read on 2026-10-22 during the preceding private audit.
- required internal links: /guides/anna-maria-island-weather/, /stays/anna-maria-island-vacation-rentals/
- CTA target: existing /stays/anna-maria-island-vacation-rentals/ and /stays/anna-maria-island-beachfront-rentals/ links, unchanged.
- anti-claims: no rain-free promise; no ranking, conversion or revenue lift claim; no new activity, restaurant availability, price or property claim.

## Exact Repair

- Draft the copy: replace “with virtually no rain” with “with less rain than summer”; change only the stone-crab entry's month label from November to October.
- Remove internal wording: the two substitutions contain only traveler-facing weather and calendar wording.
- Check voice and specificity: keep the existing sentences, plain phrasing and stated October 15 date. The targeted reviewer must independently approve the changed copy.
- Source file: `src/guides/best-time-visit-anna-maria-island.html`.
- The preceding audit found no corroborated ranking decline. This is a source-backed accuracy repair, not a growth experiment or rescue rewrite.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | best time to visit Anna Maria Island month by month |
| Searcher intent | Choose a travel month using seasonal weather and activities. |
| Current Seascape URL | /guides/best-time-visit-anna-maria-island/ |
| SERP observed date | 2026-10-22 |
| SERP stale after | 2026-10-29 |
| Current proof | Private audit on 2026-10-22 reproduced both errors in current source and the live guide. NOAA and FWC establish the correction. Analytics October 14–20 receipt: 1520 impressions, 23 clicks, average position 4.68; no ranking-loss attribution. |
| Top visible competitors | Plan Anna Maria best-time page, One Stop AMI month-by-month guide, Rent Anna Maria seasonal guide, in a free unlocated public search sample; result order is not a measured rank. |
| Competitor angle | Month choice by weather, crowds and activities; Plan Anna Maria uses month controls, One Stop AMI seasonal prose, Rent Anna Maria season cards. |
| Visual/format gap | No format change is needed to correct these two claims; retain the existing tiles, table and event list. |
| Seascape gap | November is described as almost rain-free and an October event is labeled November. |
| Search fit | Preserve the current month-choice winner and its existing AMI stay destinations; repair only the inaccurate weather promise and calendar label. |
| Local/GBP proof | Not applicable because this is existing guide accuracy, with no local business or map-pack claim. |
| AEO/readback note | No AI answer collection or citation-lift claim; schema answers are unchanged. |
| Recommendation | Make the two approved substitutions and retain all other page behavior. |
| Attack status | completed |
| Query variants inspected | best time to visit Anna Maria Island month by month |
| SERP source | Free public web search, 2026-10-22, without location control. |
| Competitor URLs inspected | https://www.planannamaria.com/best-time-to-visit ; https://onestopami.com/blog/best-time-to-visit-anna-maria-island ; https://www.rentannamaria.com/best-time-to-visit |
| Content gap and Seascape answer | Source-backed rain comparison and the correct stone-crab opening month; no competitor-derived factual claims. |
| Design/format strategy | Keep all markup, layout, tiles, table, CTA labels and links intact. |
| Seascape proof available | Existing weather guide agrees with NOAA; current live guide reproduces both errors. |
| Tools/plugins used | Source reads, prior live-browser audit and free public web reads. No paid lookup or fresh rank check. |
| Decision and reason | Correct the two demonstrated errors with the smallest source diff. |

## Verification And Release

- Prove the original two strings exist, then verify the complete guide equals its base version with exactly the two substitutions.
- Run `npm run verify:release -- --range origin/main` (includes fresh build and content lint), the guide recovery check, and a local route readback of the changed text.
- Obtain one fresh read-only combined voice/release review of the exact diff and source facts; no reviewer edits or external posts.
- Rollback target: base commit 8af18fb498cc164cb70c3174a68d8eb222735a78, limited to these two substitutions if their source facts are disproved or they cause a regression.
- No new experiment, schedule, paid research, tracking, deployment dispatch or unrelated change. Normal consolidated publication retains its existing authority.
