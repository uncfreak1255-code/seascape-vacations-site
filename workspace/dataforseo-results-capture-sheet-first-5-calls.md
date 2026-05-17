# DataForSEO Results Capture Sheet - First 5 Calls

Use this sheet with:
- [dataforseo-run-sheet-first-5-calls.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-run-sheet-first-5-calls.md)
- [dataforseo-research-plan-core-guest-pages.md](/Users/sawbeck/Projects/seascape-vacations-site/workspace/dataforseo-research-plan-core-guest-pages.md)

Fill one row per API call.
Do not summarize across pages until all five rows are complete.

## Call Tracker

| Call | Target page | Query | Tag | Completed | Status code ok | Cost captured | `check_url` captured | `item_types` captured | `ai_overview` present | `local_pack` present | `people_also_ask` present | OTA-heavy SERP | Local operator visible | Page angle still fits | Needs page change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/` | `seascape vacations` | `q1-home-brand-mobile-us` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Strong brand result. `seascape-vacations.com` is rank 1 organic with knowledge graph and reviews present. |
| 2 | `/` | `seascape vacations bradenton` | `q2-home-bradenton-mobile-us` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Strong brand plus location result. Seascape is rank 1 organic; Bradenton Gulf Islands, MapQuest, Facebook, and Airbnb also appear. |
| 3 | `/` | `seascape vacations anna maria island` | `q3-home-ami-mobile-us` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Strong visibility with more pressure. Seascape is rank 1 in local pack and rank 4 organic; AMI-specific operators are visible and local intent is higher here. |
| 4 | `/` | `seascape vacations sarasota` | `q4-home-sarasota-mobile-us` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [x] Yes [ ] No | [x] Yes [ ] No | [ ] Yes [x] No | Strong rank 1 branded result, but Sarasota modifier attracts heavier OTA and aggregator competition. |
| 5 | `/properties/` | `vacation rentals near anna maria island` | `q5-properties-near-ami-mobile-us` | [x] | [x] | [x] | [x] | [x] | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [ ] Yes [x] No | [x] Yes [ ] No | [ ] Yes [x] No | [x] Yes [ ] No | Weakest page/query fit so far. Hotels pack plus AMI-focused local operators dominate; `seascape-vacations.com` is absent from page 1. |

## Response Fields To Paste

| Call | Top 5 organic domains | Dominant non-organic features | Brand/entity notes | Geography notes | Best next action |
| --- | --- | --- | --- | --- | --- |
| 1 | `seascape-vacations.com`, `seascapevacationhomes.com`, `www.vacasa.com`, `www.mapquest.com` | `knowledge_graph`, `google_reviews`, `featured_snippet`, `people_also_search` | Seascape owns rank 1 organic and entity signals are strong. | Generic branded query still resolves cleanly to Seascape. | Leave homepage brand/entity lane alone for now. |
| 2 | `seascape-vacations.com`, `www.bradentongulfislands.com`, `www.airbnb.com`, `www.mapquest.com`, `www.facebook.com` | `knowledge_graph`, `google_reviews`, `people_also_search` | Seascape owns rank 1 organic with good entity support. | Bradenton modifier still maps cleanly to the brand. | No immediate homepage change from this query. |
| 3 | `seascape-vacations.com`, `www.bradentongulfislands.com`, `www.annamarialifevacationrentals.com`, `www.facebook.com`, `annamariaislandbeachrentals.com` | `local_pack`, `people_also_search`, `people_also_ask` | Seascape is visible in both local pack and organic, but local intent is stronger. | AMI modifier shifts the SERP toward local and island-specific operators. | Carry this into phase 2 to test whether near-island framing still wins in AI and local surfaces. |
| 4 | `seascape-vacations.com`, `www.vuniquevacations.com`, `www.booking.com`, `www.vrbo.com`, `www.mapquest.com` | `knowledge_graph`, `google_reviews`, `people_also_search` | Seascape still owns rank 1 organic. | Sarasota modifier pulls in a mix of OTAs and Sarasota-specific inventory. | No immediate homepage change; watch this in phase 2 for OTA pressure. |
| 5 | `www.annamaria.com`, `www.annamarialifevacationrentals.com`, `www.amilocals.com`, `www.seabreezevacation.com`, `www.anchordownvacationrentals.com` | `hotels_pack`, `people_also_search`, `knowledge_graph_expanded_item` | Seascape is absent from page 1. | Query behaves like on-island or strongly AMI-adjacent inventory intent, not a broad near-AMI catalog result. | Treat `/properties/` as the first page likely needing angle work, not homepage changes. |

## What Counts As Pass

- `Status code ok`: API response returned success for the task.
- `Cost captured`: request-level or task-level cost is copied into your notes.
- ``check_url` captured`: the exact validation URL from the result is saved.
- ``item_types` captured`: the SERP feature list is saved from the result.
- `Local operator visible`: at least one non-OTA local operator appears in meaningful view, not just directory clutter.
- `Page angle still fits`: current page intent still matches what the SERP rewards.

## Quick Read Rules

- If calls 1-4 are weak on branded/entity visibility, homepage/entity work moves ahead of content expansion.
- If call 5 is dominated by AI Overview, local pack, or OTAs, do not default to "write more." First decide whether the `/properties/` angle needs to narrow.
- If AMI-modified branded queries reward near-island honesty, keep that framing. Do not soften it just to sound more on-island.

## Recommended Raw Fields To Save

For each call, copy these fields somewhere under the row notes or an attached JSON block:
- `tasks[0].status_code`
- `tasks[0].cost`
- `tasks[0].result[0].check_url`
- `tasks[0].result[0].item_types`
- `tasks[0].result[0].items`

## Evidence Paths

- Raw responses: `workspace/dataforseo-phase1-raw/call-1.json` through `workspace/dataforseo-phase1-raw/call-5.json`

## Optional JSON Capture Stub

```json
{
  "call": 1,
  "tag": "q1-home-brand-mobile-us",
  "status_code": 20000,
  "cost": 0,
  "check_url": "",
  "item_types": [],
  "top_organic_domains": [],
  "ai_overview_present": false,
  "local_pack_present": false,
  "people_also_ask_present": false,
  "ota_heavy": false,
  "local_operator_visible": false,
  "page_angle_still_fits": true,
  "needs_page_change": false,
  "notes": ""
}
```
