# Brief: Family-guide safety FAQ correction

- lifecycle: active
- persona: Parent planning an Anna Maria Island beach trip with children.
- primary keyword: Anna Maria Island safe for families
- secondary keywords: Anna Maria Island family vacation, family beach safety
- audience pattern: Existing family-guide visitor checking the safety FAQ.
- proof source: Current main 3b2aa89e0fbbc241056d1f30543fdf0af66c1dfa inspected 2026-10-06; Manatee County Beach Patrol https://www.mymanatee.org/services-and-amenities/service-listing/service-details/beach-patrol and Bradenton Area Convention and Visitors Bureau https://www.bradentongulfislands.com/beach-conditions/ read 2026-10-06. FDLE https://www.fdle.state.fl.us/cjab/ucr/annual-reports explains mixed reporting during its transition; it does not establish an island-wide safest-destination ranking.
- required internal links: /stays/family-vacation-rentals-anna-maria-island/, /properties/
- CTA target: Preserve the existing family-stay and property links.
- anti-claims: No crime rate, comparative safety ranking, blanket safety reassurance, invented statistics, or booking/citation lift. No whole-page factual-refresh claim.

## Source Files Changed

- src/guides/family-vacation-anna-maria-island.html
- Replace only the answer to "Is Anna Maria Island safe for families?" in the visible FAQ and FAQPage JSON-LD. Keep the question and all other FAQ entries unchanged.
- Preserve layout, links, tracking, metadata and update dates: this is a single-answer correction, not a whole-guide refresh.

## Gate 0 — Existing-page factual correction

| Field | Read |
| --- | --- |
| Target query family | Anna Maria Island safe for families; Anna Maria Island family vacation. |
| Searcher intent | Decide how to plan family beach time and supervise children. |
| Current Seascape URL | /guides/family-vacation-anna-maria-island/ |
| SERP observed date | 2026-10-06 |
| SERP stale after | 2026-10-13 |
| Current proof | 2026-10-06 source read at 3b2aa89 shows the same unsourced very-low-crime and safest-destination assertion in the visible FAQ and JSON-LD after PR #691. Official county page confirms lifeguards at Manatee Public Beach, Cortez Beach and Coquina Beach; official visitor bureau describes posted flags, changing conditions, child supervision and unguarded north-end beaches. FDLE reporting caveats do not substantiate a comparative island ranking. |
| Top visible competitors | Anna Maria Vacations family-beach articles and Anna Maria Island Getaway family beach-day guide appeared in an unlocated public search sample; no ranking claim. |
| Competitor angle | Family logistics and beach amenities; one Anna Maria Vacations extract assures parents their children are safe because lifeguards watch them. That assurance is not adopted. |
| Visual/format gap | None needed: replace one paragraph within existing FAQ markup. |
| Seascape gap | Source parity alone repeated an unsupported safety assertion in machine-readable answers. |
| Search fit | Repair the existing family feeder guide and retain its family-stay and property destinations. No new page or keyword expansion. |
| Local/GBP proof | Not local-pack work; county beach patrol and official visitor guidance support the specific beach-planning advice. |
| AEO/readback note | Compare every visible FAQ question and answer with FAQPage JSON-LD in source and fresh build; claim no citation lift. |
| Recommendation | Remove comparative crime/safety claims and give practical advice about staffed lifeguard areas, posted warnings, conditions and child supervision. |
| Attack status | completed |
| Query variants inspected | Manatee county marine rescue beach safety lifeguards official; Holmes Beach police annual report crime statistics official; Anna Maria Island family beach safety guide kids. |
| SERP source | Public web search and official-page reads on 2026-10-06, without location control. |
| Competitor URLs inspected | Search extracts at https://www.annamaria.com/news-and-blog/how-to-plan-for-the-perfect-beach-day-on-anna-maria-island/ and https://amislandgetaway.com/a-simple-guide-to-ami-beach-days-with-kids/; neither supplies evidence for the old crime or safety ranking. |
| Content gap and Seascape answer | For family beach days, choose an area with a lifeguard on duty at Manatee Public Beach or Coquina Beach. Check posted warnings and current water conditions before swimming, follow lifeguard instructions, and supervise children closely around the water. Conditions can change throughout the day. |
| Design/format strategy | Text-only correction within existing FAQ and schema. |
| Seascape proof available | Exact source answer and official beach guidance; no new property facts or observations. |
| Tools/plugins used | Native source inspection, public web search, official-page reads, repository source/build checks and independent review. |
| Decision and reason | Correct the unsupported assertion in both public extraction surfaces while retaining useful local family guidance. |

## Acceptance

- Complete Draft the copy, Remove internal wording, and Check voice and specificity; obtain the read-only Voice Editor verdict.
- Add regression coverage for removed claims, practical guidance, and full visible/schema FAQ parity in source and rendered output. Demonstrate the claim test fails on current main.
- Run the full release gate (fresh build, content lint, unit tests, schema, links and recovery checks), visual gate, preview surface and performance gates. Inspect the changed FAQ on desktop and mobile.
- Obtain independent review of the exact published head and merge only if clean. Use `[skip netlify]` for source publication; deployment is outside this task.
