# Brief: Family stay page safety FAQ correction

- lifecycle: active
- persona: Parent comparing family vacation rentals near Anna Maria Island and checking whether the island suits children.
- primary keyword: Anna Maria Island safe for families
- secondary keywords: family vacation rentals Anna Maria Island, family beach safety
- audience pattern: Existing family-stay page visitor reading the safety FAQ.
- proof source: The sourced answer and official pages recorded in `docs/briefs/2026-10-family-safety-faq.md` (Manatee County Beach Patrol and Bradenton Area Convention and Visitors Bureau, read 2026-10-06; merged in #693). Current main af8c70c inspected 2026-10-07.
- required internal links: /properties/
- CTA target: Preserve the existing family-stay and property links.
- anti-claims: No crime rate, comparative safety ranking, blanket safety reassurance, invented statistics, or booking/citation lift. No whole-page refresh claim.

## Source Files Changed

- src/_data/seoPages.json
- Replace only the answer to "Is Anna Maria Island safe for families?" on the `family-vacation-rentals-anna-maria-island` entry. It feeds the visible FAQ and the FAQPage JSON-LD of `/stays/family-vacation-rentals-anna-maria-island/`. Keep the question and all other FAQ entries unchanged.
- scripts/enforcement/p0-booking-evidence.test.js
- Add one regression test for the built stay page. It fails on the old answer and passes on the new one.

## Gate 0 — Existing-page factual correction

| Field | Read |
| --- | --- |
| Target query family | Anna Maria Island safe for families; family vacation rentals Anna Maria Island. |
| Searcher intent | Decide whether the island and a nearby rental suit a family with children. |
| Current Seascape URL | /stays/family-vacation-rentals-anna-maria-island/ |
| SERP observed date | 2026-10-06 |
| SERP stale after | 2026-10-13 |
| Current proof | 2026-10-07 source read at af8c70c: `src/_data/seoPages.json` line 1026 still says "one of the safest vacation destinations in Florida" and "low crime". PR #693 removed the same unsourced claim from the family guide. The official beach pages cited in the #693 brief support the lifeguard and posted-warning advice. |
| Top visible competitors | Anna Maria Vacations and Anna Maria Island Getaway family beach-day articles, from the 2026-10-06 public search sample recorded in the #693 brief. No ranking claim. |
| Competitor angle | Family logistics and beach amenities. |
| Visual/format gap | None. One FAQ answer is replaced inside existing markup. |
| Seascape gap | The stay page repeats an unsupported safety assertion that the guide no longer makes. |
| Search fit | Repairs an existing stay lander. No new page or keyword. |
| Local/GBP proof | Not local-pack work. County beach patrol and visitor bureau guidance support the specific advice. |
| AEO/readback note | The visible answer and the FAQPage JSON-LD come from one data field, so they match. No citation lift is claimed. |
| Recommendation | Reuse the sourced answer already live on the family guide. |
| Attack status | completed |
| Query variants inspected | Manatee county marine rescue beach safety lifeguards official; Anna Maria Island family beach safety guide kids (both from the #693 brief, 2026-10-06). |
| SERP source | Public web search and official-page reads on 2026-10-06, no location control, as recorded in the #693 brief. No new search was run for this one-sentence reuse. |
| Competitor URLs inspected | https://www.annamaria.com/news-and-blog/how-to-plan-for-the-perfect-beach-day-on-anna-maria-island/ and https://amislandgetaway.com/a-simple-guide-to-ami-beach-days-with-kids/ (search extracts, per the #693 brief). |
| Content gap and Seascape answer | For family beach days, choose an area with a lifeguard on duty at Manatee Public Beach or Coquina Beach. Check posted warnings and current water conditions before swimming, follow lifeguard instructions, and supervise children closely around the water. Conditions can change throughout the day. |
| Design/format strategy | Text-only correction in existing FAQ data. |
| Seascape proof available | The exact answer already live on the family guide, plus the official pages in the #693 brief. No new property facts. |
| Tools/plugins used | Source inspection, repository build and tests. No paid tool. |
| Decision and reason | Remove the unsupported claim and reuse the sourced wording so the guide and the stay page agree. |
