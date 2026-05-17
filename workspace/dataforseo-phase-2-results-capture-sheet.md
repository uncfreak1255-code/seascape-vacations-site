# DataForSEO Phase 2 Results Capture Sheet

Use this sheet with:
- [dataforseo-phase-2-run-sheet-ai-mode-llm-mentions-maps-local-finder.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-phase-2-run-sheet-ai-mode-llm-mentions-maps-local-finder.md)
- [dataforseo-seo-geo-ai-capability-verdict.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-seo-geo-ai-capability-verdict.md)

Fill one row per API call.
Do not collapse results across lanes until every row is filled.

## Lane 1 - AI Mode

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `check_url` captured | Seascape cited | OTA or publisher-heavy answer | Island-first framing | Near-island framing | Bradenton framing | Sarasota framing | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI-1 | `/` | `Where should I book direct vacation rentals near Anna Maria Island?` | `p2-ai-home-book-direct-near-ami` | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | AI answer says to book through AMI-local agencies or owner sites. Seascape is absent, so this reads like an entity/citation gap, not a homepage-copy miss. |
| AI-2 | `/properties/` | `What are the best vacation rental areas near Anna Maria Island if I want a pool home?` | `p2-ai-properties-areas-near-ami-pool` | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | AI routes this query to on-island neighborhood choice and local AMI operators, not a broad multi-city collection page. |
| AI-3 | `/stays/book-direct-anna-maria-island/` | `How can I book a vacation rental near Anna Maria Island without Airbnb or Vrbo fees?` | `p2-ai-book-direct-no-ota-fees` | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | The fee-first angle still matches, but the cited answers are dominated by on-island direct operators, so the page should front-load near-AMI truth and its tradeoff earlier. |
| AI-4 | `/stays/anna-maria-island-vacation-rentals/` | `Where should a family stay near Anna Maria Island if we want a pool home and easy beach access?` | `p2-ai-ami-family-pool-beach` | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | AI pushes this query into Holmes Beach and other on-island family neighborhoods, which is a mismatch for a near-island Seascape collection page. |
| AI-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `Is Bradenton a good place to stay if I want easier access to Anna Maria Island beaches?` | `p2-ai-bradenton-near-beaches` | [x] | [x] | [x] | [x] | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | This is the cleanest AI fit. Bradenton is framed as the cheaper bridge-access base, and Seascape appears among cited domains. |
| AI-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `What part of Sarasota is best for a vacation rental with a private pool?` | `p2-ai-sarasota-private-pool` | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | AI says Siesta Key and neighborhood choice matter first. The city/pool angle is still valid, but the opening answer is too generic for what Google is rewarding. |

## Lane 2 - LLM Mentions Search

Current blocker:
- All six calls returned `40204 Access denied`. This is a plan/subscription gap for `LLM Mentions`, not evidence that Seascape failed to earn citations.

| Call | Target page | Keyword target | Tag | Completed | Status code ok | Cost captured | `items` captured | `ai_search_volume` captured | Seascape in `sources` | OTA-heavy cited domains | Major publisher-heavy cited domains | Question-answer fit | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LM-1 | `/` | `seascape vacations` | `p2-mentions-home-brand` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |
| LM-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-mentions-properties-near-ami` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |
| LM-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-mentions-book-direct-ami` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |
| LM-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-mentions-ami-vacation-rentals` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |
| LM-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-mentions-bradenton-near-beaches` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |
| LM-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-mentions-sarasota-pool` | [x] | [ ] | [x] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40204 Access denied` on the current plan. This lane is blocked, not negative. |

## Lane 3 - Google Maps

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `item_types` captured | `cid` captured | Seascape visible | Directory-heavy map view | OTA-heavy map view | Local operator visible | Strong local justifications | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAP-1 | `/` | `seascape vacations` | `p2-maps-home-brand-bradenton` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Maps brand search surfaced Vunique, but Local Finder still resolves Seascape. That points to brand/entity work, not homepage surgery. |
| MAP-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-maps-properties-near-ami-bradenton` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | Maps mixes Bradenton pool-home operators with multiple VRBO listings. Seascape is absent, and the result still behaves like a near-AMI local-operator field. |
| MAP-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-maps-book-direct-ami-bradenton` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | Direct-book map intent is dominated by local operators with website mentions and review proof, so the page needs stronger near-AMI honesty if it keeps this query. |
| MAP-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-maps-ami-vacation-rentals-bradenton` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | This query resolves to island operators and even ferry/boat entities before Seascape appears. That is a mismatch for a near-island collection page. |
| MAP-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-maps-bradenton-near-beaches` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Bradenton beach-access framing matches the surface well even though Seascape is absent. This looks like a local/entity visibility gap before it looks like copy failure. |
| MAP-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-maps-sarasota-pool` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | Sarasota pool intent behaves like a dense local-operator map field. The city/pool angle is right, but the opening answer is too generic to carry this page alone. |

## Lane 4 - Local Finder

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `check_url` captured | `items` captured | Seascape visible | Local-pack expansion useful | Directory-heavy local view | OTA-heavy local view | Local operator visible | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LF-1 | `/` | `seascape vacations` | `p2-localfinder-home-brand-bradenton` | [x] | [x] | [x] | [x] | [x] | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | GBP/local pack resolves the brand cleanly with Seascape, 5.0 rating, and 35 reviews. |
| LF-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-localfinder-properties-near-ami-bradenton` | [x] | [ ] | [x] | [x] | [ ] | [ ] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40102 No Search Results`. Local Finder does not expand this query in Bradenton, so Maps is the meaningful local surface here. |
| LF-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-localfinder-book-direct-ami-bradenton` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | The local pack is pure on-island operator intent. That confirms this query is treated as island-first local discovery, not a generic near-AMI catalog result. |
| LF-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-localfinder-ami-vacation-rentals-bradenton` | [x] | [ ] | [x] | [x] | [ ] | [ ] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40102 No Search Results`. Maps is the real local surface for this page's query, not Local Finder. |
| LF-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-localfinder-bradenton-near-beaches` | [x] | [ ] | [x] | [x] | [ ] | [ ] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40102 No Search Results`. The page lives in Maps/organic territory more than Local Finder territory. |
| LF-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-localfinder-sarasota-pool` | [x] | [ ] | [x] | [x] | [ ] | [ ] Yes [ ] No | [ ] Yes [x] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `40102 No Search Results`. Treat Maps and AI Mode as the useful local surfaces for Sarasota pool intent. |

## Response Paste Zones

### AI Mode

| Call | Top cited domains | Framing summary | Best next action |
| --- | --- | --- | --- |
| AI-1 | `island-dreams-realty.com`, `annamariaislandhomerental.com`, `annamaria.com`, `ownerdirect.com` | Direct-book answer is island-first and agency-led; Seascape is absent from citations. | Leave homepage copy alone and treat this as a brand/entity citation gap. |
| AI-2 | `teamduncan.com`, `annamaria.com`, `islandvacationproperties.com`, `annamariaislandcondorentals.com` | Pool-home answer starts on Anna Maria Island and organizes by island neighborhoods. | Tighten `/properties/` into an honest near-AMI router instead of a broad luxury catalog. |
| AI-3 | `facebook.com`, `reddit.com`, `amilocals.com`, `annamariaisland.com`, `annamarialifevacationrentals.com` | Fee-avoidance answer points to local island managers and community sourcing, not Seascape. | Keep the fee-first angle, but rewrite the intro/CTA around near-AMI direct savings instead of sounding on-island. |
| AI-4 | `islandvacationproperties.com`, `annamaria.com`, `seabreezevacation.com`, `airbnb.com`, `wander.com` | Family pool-beach answer is Holmes Beach and on-island neighborhood first. | Tighten the page toward near-island tradeoffs before any broader rewrite. |
| AI-5 | `bradentongulfislands.com`, `beachboutiquerentals.com`, `islandvacationproperties.com`, `seascape-vacations.com` | Bradenton is validated as the cheaper bridge-access base for AMI beach days. | Leave the page angle alone; local/entity work is the bigger gap than copy. |
| AI-6 | `roelensvacations.com`, `booking.com`, `vrbo.com`, `siestakeyluxuryrentalproperties.com` | Sarasota pool intent is neighborhood-led, especially Siesta Key, rather than generic city copy. | Rewrite the opening answer around neighborhood fit and private-pool tradeoffs. |

### LLM Mentions

| Call | `ai_search_volume` | Top `sources` domains | Best next action |
| --- | --- | --- | --- |
| LM-1 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |
| LM-2 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |
| LM-3 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |
| LM-4 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |
| LM-5 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |
| LM-6 | blocked | blocked by `40204 Access denied` | Enable the `LLM Mentions` subscription before using this lane for citation decisions. |

### Maps / Local Finder

| Call | Top visible entities or domains | Local justification summary | Best next action |
| --- | --- | --- | --- |
| MAP-1 | `Vunique Vacations` | Brand search opens a competing map entity first. | Use GBP/local-entity hygiene, not homepage rewrite, for this gap. |
| MAP-2 | `PRIME VACATIONS`, `Gulf Coast Vacation Rentals Bradenton`, `BeachRentals.Mobi`, `VRBO` | Pool, backyard, and beach review snippets dominate the map result. | Keep `/properties/` as a router, not a pretend island catalog. |
| MAP-3 | `BeachRentals.Mobi`, `PRIME VACATIONS`, `Gulf Coast Vacation Rentals`, `Bay and Key` | Website mentions and pool-review snippets reward direct-book local operators. | Keep the fee-first angle, but front-load near-AMI truth. |
| MAP-4 | `PRIME VACATIONS`, `Anchor Down`, `Gulf Islands Ferry` | Island and ferry travel entities crowd the result before Seascape appears. | Do not push this page as generic on-island inventory. |
| MAP-5 | `Gulf Coast Vacation Rentals`, `Shorewalk`, `BeachRentals.Mobi`, `Bonjour AMI` | Beach-access and pool-home proof support Bradenton as the value base. | Hold copy and push the next effort toward local/entity visibility instead. |
| MAP-6 | `Gulf Coast Vacation Rentals`, `Fischer Vacation Rentals`, `Lido Key Vacations` | Pool/privacy/beach proximity snippets dominate the field. | Rewrite the opening answer before any broader Sarasota expansion. |
| LF-1 | `Seascape Vacations` | Brand local pack resolves cleanly with 5.0 rating and 35 reviews. | Homepage copy can stay put; maintain GBP/entity hygiene. |
| LF-2 | no Local Finder surface | `40102 No Search Results` | Treat local pack as a non-factor for this query and read Maps instead. |
| LF-3 | `Anna Maria Island Accommodations`, `Anna Maria Vacations`, `Anna Maria Island Vacation Rentals` | Pure on-island operator local pack. | Keep this page in the answer/tradeoff lane; do not pretend Seascape is an island-pack winner. |
| LF-4 | no Local Finder surface | `40102 No Search Results` | Use Maps, not Local Finder, for the local read here. |
| LF-5 | no Local Finder surface | `40102 No Search Results` | Use Maps, not Local Finder, for the local read here. |
| LF-6 | no Local Finder surface | `40102 No Search Results` | Use Maps, not Local Finder, for the local read here. |

## What Counts As Pass

- `Status code ok`: task succeeded.
- `Cost captured`: request or task cost was copied into notes.
- `Seascape visible` or `Seascape cited`: the response shows either `seascape-vacations.com` or a clear Seascape entity appearance in the expected place.
- `Page angle still fits`: the current page intent still matches how the surface answers or routes the query.

## Quick Decision Rules

- If `AI Mode` and `LLM Mentions` both miss Seascape, treat it as an AI-citation visibility gap, not just a ranking gap.
- If `Maps` or `Local Finder` dominate a page's core query, local entity and GBP work move up beside page-copy work.
- If near-island framing wins repeatedly, keep it and strengthen it. Do not blur Bradenton into on-island language.
- If book-direct intent performs poorly in local surfaces but better in AI Mode, keep that page in the answer-and-trust lane rather than the map lane.

## Recommended Raw Fields To Save

### AI Mode
- `tasks[0].status_code`
- `tasks[0].cost`
- `tasks[0].result[0].check_url`
- `tasks[0].result[0].items`

### LLM Mentions
- `tasks[0].status_code`
- `tasks[0].cost`
- `tasks[0].result[0].items`
- `items[].ai_search_volume`
- `items[].sources`

### Maps / Local Finder
- `tasks[0].status_code`
- `tasks[0].cost`
- `tasks[0].result[0].check_url`
- `tasks[0].result[0].items`

## Optional JSON Stub

```json
{
  "call": "AI-1",
  "tag": "p2-ai-home-book-direct-near-ami",
  "status_code": 20000,
  "cost": 0,
  "seascape_visible_or_cited": false,
  "ota_heavy": false,
  "local_operator_visible": false,
  "page_angle_still_fits": true,
  "needs_page_change": false,
  "notes": ""
}
```
