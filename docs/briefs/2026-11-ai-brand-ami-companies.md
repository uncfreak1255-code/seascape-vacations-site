# Brief: Brand naming on the ChatGPT-cited AMI company guide

- lifecycle: active
- task scope: Put "Seascape Vacations" in the hero BLUF and first FAQ JSON-LD answer on `/guides/best-vacation-rental-companies-ami/`. Companion to `docs/briefs/2026-11-ai-brand-chatgpt-cites.md`. No homepage, title/meta, table, or layout change.
- completion or successor: not complete until this brand-naming edit merges.

## Content Gate Inputs

- persona: an answer engine quoting this company guide, and a guest choosing an AMI rental company
- primary keyword: Seascape Vacations
- secondary keywords: best vacation rental companies Anna Maria Island
- audience pattern: AI extracts the hero paragraph or FAQ answer; those sentences currently omit the operator name
- proof source: `docs/briefs/2026-09-03-ai-entity-rescue-ami-companies.md` (ChatGPT used this URL as a source on 2026-09-03); live Direct answer already names Seascape Vacations; property catalog for mainland Bradenton/Sarasota homes
- required internal links: /stays/anna-maria-island-vacation-rentals/, /property-management/vacation-rental-management-anna-maria-island/
- CTA target: existing AMI stay collection; no CTA change
- anti-claims: no AI citation lift, best-overall superlative, on-island inventory, fee-range, or booking claim
- hypothesis: naming Seascape Vacations in the hero and FAQ reduces nameless citations of this URL; citation lift is unproven
- primary event: Seascape Vacations named in ChatGPT answers that cite this URL, on the next OpenSEO rerun owned by Analytics
- guardrail event: keyword stuffing or an on-island inventory claim
- entry criteria: Gate 0 filled from the dated 2026-09-03 citation receipt; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: next identical OpenSEO frozen-prompt rerun after production publish, not sooner than 28 days
- decision rule: keep the truthful brand naming; report insufficient evidence for citation lift; revert stuffing or on-island claims

## Why This Batch

- What changed: ChatGPT used this guide as a source while the hero and FAQ JSON-LD still described "an AMI rental company" without the operator name. The Direct answer already names Seascape Vacations.
- Why now: Sawyer directed brand naming on pages ChatGPT already cites.
- What waits: table rewrite, title/meta, homepage, and any AI-lift claim.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | best vacation rental companies on Anna Maria Island |
| Searcher intent | Guest company comparison; AI answers that already retrieve this URL |
| Current Seascape URL | `/guides/best-vacation-rental-companies-ami/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | 2026-09-03 OpenSEO receipt in `docs/briefs/2026-09-03-ai-entity-rescue-ami-companies.md`: ChatGPT used this guide as a source. Live hero and first FAQ JSON-LD still omit "Seascape Vacations". Direct answer already names it. |
| Top visible competitors | Island Real Estate, Anna Maria Life Vacation Rentals, Sato Real Estate, as already listed on this page |
| Competitor angle | Named local operators |
| Visual/format gap | None. No layout change. |
| Seascape gap | The most extractable hero and FAQ sentences omit the operator name. |
| Search fit | Keep this URL. It already gets retrieved. Name Seascape Vacations in those sentences. Conversion stays on `/stays/anna-maria-island-vacation-rentals/`. |
| Local/GBP proof | Not a map-pack action. Homes are mainland Bradenton/Sarasota, near the island, not on it. |
| AEO/readback note | ChatGPT already cited this URL. No citation lift is claimed. |
| Recommendation | Add the operator name to the hero BLUF and first FAQ answer only. |
| Attack status | completed |
| Query variants inspected | What are the best vacation rental companies on Anna Maria Island? |
| SERP source | Dated OpenSEO citation receipt 2026-09-03 in the existing AMI-companies brief; live source check 2026-11-18. No paid lookup. |
| Competitor URLs inspected | https://seascape-vacations.com/guides/best-vacation-rental-companies-ami/ ; https://islandreal.com/ ; https://annamarialife.com/ |
| Content gap and Seascape answer | Name Seascape Vacations as a locally managed Bradenton and Sarasota operator with mainland homes near the island. |
| Design/format strategy | No layout, CSS, title, or meta change. |
| Seascape proof available | Existing Direct answer on this page; property catalog geography |
| Tools/plugins used | Repo briefs and source. No paid OpenSEO. No Hostaway write. |
| Decision and reason | Improve the existing cited guide. Do not expand the company table or change the homepage. |

## Cluster In Scope

- canonical winner URL: `/guides/best-vacation-rental-companies-ami/`
- feeder pages: none changed
- money destination: `/stays/anna-maria-island-vacation-rentals/`
- active lane: distribution/entity fact repair

## Source Files Changed

  - src/guides/best-vacation-rental-companies-ami.html

## Not In Scope

- homepage (`src/index.njk` must stay untouched)
- title/meta, comparison table, layout
