# DataForSEO Phase 2 Results Capture Sheet

Use this sheet with:
- [dataforseo-phase-2-run-sheet-ai-mode-llm-mentions-maps-local-finder.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-phase-2-run-sheet-ai-mode-llm-mentions-maps-local-finder.md)
- [dataforseo-seo-geo-ai-capability-verdict.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-seo-geo-ai-capability-verdict.md)

Fill one row per API call.
Do not collapse results across lanes until every row is filled.

## Lane 1 - AI Mode

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `check_url` captured | Seascape cited | OTA or publisher-heavy answer | Island-first framing | Near-island framing | Bradenton framing | Sarasota framing | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI-1 | `/` | `Where should I book direct vacation rentals near Anna Maria Island?` | `p2-ai-home-book-direct-near-ami` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| AI-2 | `/properties/` | `What are the best vacation rental areas near Anna Maria Island if I want a pool home?` | `p2-ai-properties-areas-near-ami-pool` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| AI-3 | `/stays/book-direct-anna-maria-island/` | `How can I book a vacation rental near Anna Maria Island without Airbnb or Vrbo fees?` | `p2-ai-book-direct-no-ota-fees` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| AI-4 | `/stays/anna-maria-island-vacation-rentals/` | `Where should a family stay near Anna Maria Island if we want a pool home and easy beach access?` | `p2-ai-ami-family-pool-beach` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| AI-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `Is Bradenton a good place to stay if I want easier access to Anna Maria Island beaches?` | `p2-ai-bradenton-near-beaches` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| AI-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `What part of Sarasota is best for a vacation rental with a private pool?` | `p2-ai-sarasota-private-pool` | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |

## Lane 2 - LLM Mentions Search

| Call | Target page | Keyword target | Tag | Completed | Status code ok | Cost captured | `items` captured | `ai_search_volume` captured | Seascape in `sources` | OTA-heavy cited domains | Major publisher-heavy cited domains | Question-answer fit | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LM-1 | `/` | `seascape vacations` | `p2-mentions-home-brand` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LM-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-mentions-properties-near-ami` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LM-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-mentions-book-direct-ami` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LM-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-mentions-ami-vacation-rentals` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LM-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-mentions-bradenton-near-beaches` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LM-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-mentions-sarasota-pool` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |

## Lane 3 - Google Maps

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `item_types` captured | `cid` captured | Seascape visible | Directory-heavy map view | OTA-heavy map view | Local operator visible | Strong local justifications | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAP-1 | `/` | `seascape vacations` | `p2-maps-home-brand-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| MAP-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-maps-properties-near-ami-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| MAP-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-maps-book-direct-ami-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| MAP-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-maps-ami-vacation-rentals-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| MAP-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-maps-bradenton-near-beaches` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| MAP-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-maps-sarasota-pool` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |

## Lane 4 - Local Finder

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `check_url` captured | `items` captured | Seascape visible | Local-pack expansion useful | Directory-heavy local view | OTA-heavy local view | Local operator visible | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LF-1 | `/` | `seascape vacations` | `p2-localfinder-home-brand-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LF-2 | `/properties/` | `vacation rentals near anna maria island` | `p2-localfinder-properties-near-ami-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LF-3 | `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-localfinder-book-direct-ami-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LF-4 | `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-localfinder-ami-vacation-rentals-bradenton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LF-5 | `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-localfinder-bradenton-near-beaches` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |
| LF-6 | `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-localfinder-sarasota-pool` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | |

## Response Paste Zones

### AI Mode

| Call | Top cited domains | Framing summary | Best next action |
| --- | --- | --- | --- |
| AI-1 |  |  |  |
| AI-2 |  |  |  |
| AI-3 |  |  |  |
| AI-4 |  |  |  |
| AI-5 |  |  |  |
| AI-6 |  |  |  |

### LLM Mentions

| Call | `ai_search_volume` | Top `sources` domains | Best next action |
| --- | --- | --- | --- |
| LM-1 |  |  |  |
| LM-2 |  |  |  |
| LM-3 |  |  |  |
| LM-4 |  |  |  |
| LM-5 |  |  |  |
| LM-6 |  |  |  |

### Maps / Local Finder

| Call | Top visible entities or domains | Local justification summary | Best next action |
| --- | --- | --- | --- |
| MAP-1 |  |  |  |
| MAP-2 |  |  |  |
| MAP-3 |  |  |  |
| MAP-4 |  |  |  |
| MAP-5 |  |  |  |
| MAP-6 |  |  |  |
| LF-1 |  |  |  |
| LF-2 |  |  |  |
| LF-3 |  |  |  |
| LF-4 |  |  |  |
| LF-5 |  |  |  |
| LF-6 |  |  |  |

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
