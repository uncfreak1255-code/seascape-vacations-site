# Brief: AMI guide calendar correction

- persona: Traveler choosing dates for an Anna Maria Island vacation.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Anna Maria Island events, Cortez Commercial Fishing Festival, Manatee County Fair
- audience pattern: Existing organic visitor comparing travel months.
- proof source: Florida Federation of Fairs https://www.floridafairs.org/events/2026/manatee-county-fair and Bradenton Area Convention and Visitors Bureau https://www.bradentongulfislands.com/event/cortez-commercial-fishing-festival/; checked 2026-09-08.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/beach-wedding-vacation-rentals-florida/
- CTA target: Preserve the existing stay links.
- anti-claims: No ranking or conversion lift, no future-year event dates inferred from 2026, no claim that the entire calendar was reverified.

## Source Files Changed

- src/guides/best-time-visit-anna-maria-island.html
- Correct only the fair and Cortez festival entries, order them by month, link the published 2026 dates, and distinguish those dates from future schedules.
- Preserve other page content, metadata, layout, tracking, and URLs.

## Gate 0 — Existing-page factual correction

| Field | Read |
| --- | --- |
| Target query family | Best time to visit Anna Maria Island; trip timing. |
| Searcher intent | Choose travel dates with accurate event information. |
| Current Seascape URL | /guides/best-time-visit-anna-maria-island/ |
| SERP observed date | 2026-09-08 |
| SERP stale after | 2026-09-15 |
| Current proof | Finalized Search Console Web results, all countries/devices, 2026-08-10 through 2026-09-06: exact canonical page had 52 clicks and 6,883 impressions. The analytics-owned joined read for 2026-08-31 through 2026-09-06 remains HOLD_AND_REREAD; overall quality is human-review. This correction relies on verified source errors, not expansion or impact authority. |
| Top visible competitors | One Stop AMI; AnnaMariaIsland.com; Plan Anna Maria. Public search sample, not a location-controlled rank report. |
| Competitor angle | Seasonal weather, crowds, rental timing, and month-based planning. |
| Visual/format gap | None required for this correction; keep existing list markup. |
| Seascape gap | Live and source copy put the January fair in April and February festival in March. |
| Search fit | Correct the existing timing guide where visitors already research months; retain current stay destinations. |
| Local/GBP proof | Not applicable: event-source validation, no local-pack claim. |
| AEO/readback note | No AI citation claim; verify the corrected list in built HTML. |
| Recommendation | Correct two dated event entries and cite their sources. No expansion or snippet rewrite. |

## Acceptance

Content lint, build, guide recovery check, source diff review, and rendered calendar readback. Complete the native voice pass before publication. Production deployment needs separate approval.
