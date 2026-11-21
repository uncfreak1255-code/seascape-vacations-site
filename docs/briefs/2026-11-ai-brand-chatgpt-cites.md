# Brief: Brand naming on ChatGPT-cited pages

- lifecycle: active
- task scope: On stay pages ChatGPT already cites, put "Seascape Vacations" in the most quotable intro and FAQ sentences. Covers `/stays/large-group-vacation-rentals-bradenton/` and `/stays/vacation-rentals-near-anna-maria-island/`. The AMI company-guide edits live in `docs/briefs/2026-11-ai-brand-ami-companies.md`. Minimal truthful edits. No homepage, title/meta, layout, or keyword stuffing.
- completion or successor: not complete until these brand-naming edits merge.

## Content Gate Inputs

- persona: an answer engine quoting a Seascape page, and a guest or owner who then needs the company name attached to the fact
- primary keyword: Seascape Vacations
- secondary keywords: large group vacation rentals Bradenton; best vacation rental companies Anna Maria Island; vacation rentals near Anna Maria Island
- audience pattern: AI extracts the first summary sentence or FAQ answer; if that sentence omits the operator name, the citation can describe the homes without naming Seascape Vacations
- proof source: `docs/briefs/2026-11-bradenton-large-group-booking.md` (ChatGPT cited `/stays/large-group-vacation-rentals-bradenton/` on Oct 12, Oct 27, and Nov 9 OpenSEO runs); `docs/briefs/2026-09-03-ai-entity-rescue-ami-companies.md` (ChatGPT used `/guides/best-vacation-rental-companies-ami/` and `/stays/vacation-rentals-near-anna-maria-island/` as sources); property fallback for mainland Bradenton/Sarasota homes
- required internal links: /properties/dockside-dreams/, /properties/the-oasis/?guests={sleeps:the-oasis}#booking
- CTA target: existing stay and property links; no CTA or event change
- anti-claims: no AI citation lift, ranking, booking, fee-range, on-island inventory, or "best overall" claim; no second invented home
- hypothesis: naming Seascape Vacations in the sentences models already quote reduces nameless citations; citation lift is unproven
- primary event: Seascape Vacations named in ChatGPT answers that already cite these URLs, on the next identical OpenSEO rerun owned by Analytics
- guardrail event: keyword stuffing, on-island inventory claim, or lost existing booking links
- entry criteria: Gate 0 filled from dated citation receipts already in repo briefs; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: next identical OpenSEO frozen-prompt rerun after production publish, not sooner than 28 days; Analytics owns the citation receipt
- decision rule: keep the truthful brand naming; report insufficient evidence for any citation or booking lift; revert stuffing, on-island claims, or broken handoff links

## Why This Batch

- What changed: ChatGPT already cites these URLs. Several first-answer and FAQ sentences still say "these homes" or "a good AMI rental company" without "Seascape Vacations".
- Why now: Sawyer directed a minimal brand-naming pass on pages ChatGPT already cites. Expansion remains held.
- What waits: title/meta, new pages, homepage, llms.txt, and any AI-lift claim.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | large vacation rental that sleeps 16 near Bradenton; best vacation rental companies on Anna Maria Island; vacation rentals near Anna Maria Island |
| Searcher intent | Guest booking and company identification; AI answers that already retrieve these URLs |
| Current Seascape URL | `/stays/large-group-vacation-rentals-bradenton/`; `/stays/vacation-rentals-near-anna-maria-island/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | Saved OpenSEO runs cited in repo briefs: ChatGPT cited the large-group collection on 2026-10-12, 2026-10-27, and 2026-11-09; the 2026-09-03 AMI-companies receipt recorded ChatGPT using the company guide and near-AMI stay page as sources. Live large-group intro already says "This Seascape Vacations home"; geoIntro and the first FAQ do not. Near-AMI intro does not name the operator. AMI-companies Direct answer already names Seascape Vacations; the FAQ JSON-LD and hero BLUF do not. |
| Top visible competitors | Local AMI managers named in the company guide (Island Real Estate, Anna Maria Life, Sato); VRBO/Airbnb group homes on the sleeps-16 prompt |
| Competitor angle | Named operators in the first sentence |
| Visual/format gap | None. No layout change. |
| Seascape gap | Cited pages can be quoted without the legal/brand name in the extract. |
| Search fit | Keep these URLs. They already get retrieved. Put the operator name in the sentences models quote. Conversion stays on existing stay and property links. |
| Local/GBP proof | Not a map-pack action. Geography comes from the property catalog: mainland Bradenton and Sarasota, not on Anna Maria Island. |
| AEO/readback note | ChatGPT already cites these URLs. This batch names the operator in quotable sentences. No citation lift is claimed. |
| Recommendation | Minimal intro/FAQ brand naming on the two cited stay URLs. |
| Attack status | completed |
| Query variants inspected | large vacation rental that sleeps 16 near Bradenton; vacation rentals near Anna Maria Island |
| SERP source | Dated OpenSEO citation receipts already in repo briefs (2026-09-03, 2026-10-12, 2026-10-27, 2026-11-09); public confirmation 2026-11-18 that the live pages still omit the brand in those sentences. No paid lookup. |
| Competitor URLs inspected | https://seascape-vacations.com/stays/large-group-vacation-rentals-bradenton/ ; https://www.clovervacationhomes.com/property/655465848525291921/coastal-clubhouse ; https://homes-and-villas.marriott.com/en/properties/40460090 |
| Content gap and Seascape answer | Name Seascape Vacations in the first extractable sentence and FAQ answers, and keep mainland Bradenton/Sarasota geography. |
| Design/format strategy | No layout, CSS, title, or meta change. |
| Seascape proof available | Property fallback; existing briefs with citation dates; current page source |
| Tools/plugins used | Repo briefs and source. No paid OpenSEO. No Hostaway write. |
| Decision and reason | Improve existing cited pages only. Do not create a new AI page or change the homepage. |

## Cluster In Scope

- canonical winner URLs: `/stays/large-group-vacation-rentals-bradenton/`; `/stays/vacation-rentals-near-anna-maria-island/`
- feeder pages: none changed
- money destination: existing property and stay links already on those pages
- active lane: distribution/entity fact repair on existing pages

## Source Files Changed

  - src/_data/seoPages.json
  - scripts/enforcement/ai-brand-chatgpt-cites.test.js

## Not In Scope

- homepage (`src/index.njk` must stay untouched)
- title/meta, layout, schema types, llms.txt
- new pages or a second Sarasota home
