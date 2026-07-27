# Brief: Best-Time Guide Transfer Fix

## Content Gate Inputs

- persona: Gulf Coast traveler who has chosen Anna Maria Island and is deciding when to visit and how close the rental needs to be.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Anna Maria Island weather by month, Anna Maria Island peak season, Anna Maria Island vacation rentals, near-island vacation rentals
- audience pattern: organic planning visitor who reaches the month decision but does not move into a stay collection.
- proof source: `seascape-analytics/docs/status/weekly-search-operator-report-2026-07-03-to-2026-07-09-shelling-followthrough.json` (SHA-256 `605bbb6507118890fa9b0cf004a525dc147222062cc5c9d50289ace5219130ff`) and `seascape-analytics/docs/status/dataforseo-serp-receipt-best-time-guide-2026-07-11-completed.json` (SHA-256 `d744e8951c35125babec810a446a1029468c913e43a1eff4d80ce69b3b96ff`).
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- CTA target: add one early editorial stay-choice strip after the answer block while leaving the lower shared conversion kit unchanged.
- anti-claims: no conversion-lift or ranking-win claim, no on-island or true-beachfront claim for either stay page, no field-journal template promotion, no new guide, and no invented reviewer, field photo, local note, or annotated map.

## Experiment And Readback Contract

- hypothesis: readers understand the month tradeoff but miss the stay decision because the tracked stay paths appear too late and too quietly; one early, honest proximity-versus-house-fit choice should produce at least one `guide_book_direct_click` without adding mobile density across the full article.
- primary event: guide_book_direct_click
- guardrail event: booking_engine_handoff, canonical integrity, content lint, internal-link integrity, JSON-LD validity, desktop/mobile rendering, and no horizontal overflow.
- entry criteria: the joined 2026-07-03 to 2026-07-09 read shows `1,917` impressions, `16` GSC clicks, `32` GA4 sessions, `0` guide direct clicks, `0` booking handoffs, and one canonical URL variant for `/guides/best-time-visit-anna-maria-island/`.
- readback window: first seven complete days after the fix deploy once final GSC data covers the full window.
- decision rule: keep if the guide records at least one `guide_book_direct_click` without a route, schema, content, or visual regression; refine once if sessions reach `20` and tracked stay and booking actions remain at `0`; do not promote the treatment to another guide from this read alone.

## Gate 0 — Scoped Existing-Guide CRO Rescue

| Field | Read |
| --- | --- |
| Target query family | `best time to visit Anna Maria Island` and month/season planning variants. |
| Searcher intent | Choose a month by weather, crowds, value, and storm flexibility, then find a rental that fits the resulting trip. |
| Current Seascape URL | `/guides/best-time-visit-anna-maria-island/`. |
| SERP observed date | 2026-07-11 |
| SERP stale after | 2026-07-18 |
| Current proof | The joined 2026-07-03 to 2026-07-09 GSC + GA4 receipt shows `16` clicks, `1,917` impressions, average position `5.01`, `32` sessions, and zero tracked guide or booking actions. The scoped DataForSEO receipt places Seascape at organic group rank `5` / absolute rank `8`. |
| Top visible competitors | Island Vacation Properties, Anna Maria Island Beach Rentals, AnnaMaria.com, Visit Florida, Coconut Rentals, plus one Facebook discussion result in the sampled top ten. |
| Competitor angle | Current results lean on local weather/season guidance, vacation-rental context, and general destination authority. The rescue does not copy their layouts; it connects Seascape's existing timing answer to its approved near-island stay paths. |
| Visual/format gap | Seascape's answer block is clear, but the first tracked stay choice is plain body copy near the end and the stronger conversion kit comes after the long article. The page needs one restrained early decision surface, not a new template. |
| Seascape gap | The route explains when to go but does not make the next proximity-versus-house-fit choice visible while intent is highest. |
| Search fit | Keep the existing URL, title, meta, and answer structure. Conversion belongs in the same proven guide because the searcher has already made the seasonal decision there. |
| Local/GBP proof | Not applicable to this scoped on-page handoff test; no local-pack or GBP claim is being made. |
| AEO/readback note | Preserve the standalone answer block and FAQ schema. Judge the new surface only through the joined GSC + GA4 read and tracked downstream events. |
| Recommendation | Add one route-local early editorial stay-choice strip; leave the field-journal pilot and lower conversion kit unchanged. |
| Attack status | completed |
| Query variants inspected | `best time to visit Anna Maria Island`, `Anna Maria Island weather by month`, `Anna Maria Island peak season`, and stay-choice variants around Anna Maria Island vacation rentals and near-island rentals. |
| SERP source | DataForSEO SERP receipt `seascape-analytics/docs/status/dataforseo-serp-receipt-best-time-guide-2026-07-11-completed.json` observed 2026-07-11. |
| Competitor URLs inspected | `https://www.islandvacationproperties.com/when-is-the-best-time-to-visit-anna-maria-island-fl/`, `https://annamariaislandbeachrentals.com/blog/best-time-of-year-to-visit-anna-maria-island`, `https://www.visitflorida.com/places-to-go/southwest/anna-maria-island/`, `https://thecoconutrentals.com/best-time-to-visit-anna-maria-island-for-vacation-weather-crowds-tips/`, and `https://www.facebook.com/groups/AMILife/posts/1839390173191123/`. |
| Content gap and Seascape answer | Competitors answer seasonal timing and rental context, while Seascape already answers timing but buries the stay decision; Seascape's answer is one early proximity-versus-house-fit choice tied to existing approved stay pages. |
| Design/format strategy | Use a restrained route-local two-choice editorial strip after the answer block; no new template, field-journal promotion, map, gallery, or broad design-system change. |
| Seascape proof available | Dated GSC + GA4 receipt for 2026-07-03 to 2026-07-09, completed DataForSEO SERP receipt from 2026-07-11, existing tracked stay URLs, and existing guide direct-book tracking events. |
| Tools/plugins used | First-party analytics receipts, completed DataForSEO SERP receipt, repo source read, and release-gate/content checks. No live posting, sends, or external account mutation. |
| Decision and reason | improve the existing guide because it has page-one demand and zero tracked downstream guide clicks; add the smallest visible stay-choice handoff without claiming conversion lift before the post-deploy readback window. |

## Design Contract

- The first choice is the closer near-island path: AMI beaches generally 5-15 minutes away, with more room, pool time, and easier parking than forcing island-only inventory.
- The second choice is the larger-group near-island alternative: not true beachfront, with a 12-25 minute beach drive.
- Desktop uses a restrained two-column editorial split. Mobile stacks the choices with one divider and 44px minimum link targets.
- Use existing cream, teal, gold-hairline, Playfair, Poppins, and pill/link rules. Add no new visual law.

## Release Gate

- `npm run lint:content`
- `npm run build`
- `npm run verify:links`
- `npm run verify:jsonld`
- focused guide/direct-booking event tests and route smoke
- `npm run test:visual`
- fresh targeted desktop and mobile screenshots
- `design-review`, simplify checkpoint, and configured autoreview

## Done When

- the source contract proves both early tracked stay choices
- the lower shared conversion kit remains unchanged
- all content, build, link, schema, smoke, and visual gates pass
- the branch closeout names the post-deploy seven-day reread window and does not claim lift before that window matures
