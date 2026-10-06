# Brief: Guide FAQ schema parity (best-time and family guides)

- lifecycle: active
- persona: Traveler asking an AI assistant or search engine a trip-planning question about Anna Maria Island.
- primary keyword: best time to visit Anna Maria Island; Anna Maria Island family vacation
- secondary keywords: Anna Maria Island hurricanes, Anna Maria Island safe for families
- audience pattern: Existing guide visitor reading the visible FAQ.
- proof source: The visible FAQ text on each page at origin/main 63a8ded. Audit: project note ai-seo-guide-audit-2026-10-05.
- required internal links: /guides/holmes-beach-area-guide/, /stays/family-vacation-rentals-anna-maria-island/
- CTA target: Preserve existing booking boxes and stay links.
- anti-claims: No ranking, citation or conversion lift claim. No new visible copy. No new facts. No date change.

## Source Files Changed

- src/guides/best-time-visit-anna-maria-island.html
- src/guides/family-vacation-anna-maria-island.html
- Replace the FAQPage JSON-LD questions and answers with the exact visible FAQ questions and answers on the same page. Before: the schema asked different questions from the visible FAQ (best-time: best month, summer crowds, hurricane season; family: good for families, kid activities). After: three schema questions per page, matching the visible text word for word.
- Leave Article `dateModified`, visible copy, layout, tracking and links unchanged.

## Gate 0 — Existing-page structured-data correction

| Field | Read |
| --- | --- |
| Target query family | Best time to visit Anna Maria Island; Anna Maria Island family vacation. |
| Searcher intent | Plan timing and family fit for an Anna Maria Island trip. |
| Current Seascape URL | /guides/best-time-visit-anna-maria-island/; /guides/family-vacation-anna-maria-island/ |
| SERP observed date | 2026-10-06 |
| SERP stale after | 2026-10-13 |
| Current proof | Source inspection on 2026-10-06 at origin/main 63a8ded: FAQPage JSON-LD questions did not match the visible FAQ on either page. |
| Top visible competitors | islaguru.com best-time article (posted 2025-06-01) and flashpackingfamily.com Anna Maria guide (modified 2025-06-24), in an unlocated public search sample. No ranking claim. |
| Competitor angle | Season-by-season and month-by-month lists; family guide organized by trip logistics. |
| Visual/format gap | None. Both competitors have no FAQ section and no FAQ schema visible on the fetched page. No visible change needed. |
| Seascape gap | Structured data that differs from visible content is not a reliable extraction source and risks being ignored. Seascape already has the FAQ and table that competitors lack. |
| Search fit | Keeps the existing winner-guide feeders consistent. No new page. |
| Local/GBP proof | Not applicable: this is page structured data, not local-pack work. |
| AEO/readback note | Not applicable to a measured claim: no citation-lift claim is made. Read back live AI answers for these queries later through OpenSEO on Sawyer's Mac. |
| Recommendation | Mirror the visible FAQ in FAQPage JSON-LD. |
| Attack status | completed |
| Query variants inspected | best time to visit Anna Maria Island; Anna Maria Island family vacation guide kids |
| SERP source | WebSearch standard snapshot on 2026-10-06, no location control. Many results were scraper domains and are ignored. |
| Competitor URLs inspected | https://islaguru.com/articles/best-time-visit-anna-maria-island ; https://flashpackingfamily.com/anna-maria-island/ |
| Content gap and Seascape answer | Competitors give no FAQ block. Seascape's visible FAQ stays; its schema now matches it. |
| Design/format strategy | No visible change. JSON-LD only. |
| Seascape proof available | The visible FAQ text on both pages at origin/main 63a8ded. |
| Tools/plugins used | WebSearch, WebFetch, source inspection, marketing-skills ai-seo checklist. No paid tool. |
| Decision and reason | Ship the parity repair. It is small, reversible and uses only text already on the page. |
