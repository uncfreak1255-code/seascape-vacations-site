# DataForSEO Phase 2 Run Sheet - AI Mode, LLM Mentions, Maps, Local Finder

This phase uses the same queue-1 pages:
- `/`
- `/properties/`
- `/stays/book-direct-anna-maria-island/`
- `/stays/anna-maria-island-vacation-rentals/`
- `/stays/bradenton-vacation-rentals-near-beaches/`
- `/stays/sarasota-vacation-rentals-with-pool/`

## Goal

Phase 1 told us what classic Google organic looks like.
Phase 2 tells us:
- how Google AI Mode frames the same intents;
- whether Seascape or `seascape-vacations.com` is cited in AI-search-style answers;
- and whether local/travel discovery is being captured in Google Maps or Local Finder before classic organic even matters.

## Practical Verdict

Yes, DataForSEO has real enhancements for Seascape's SEO, GEO, and AI-searchability work.
The most useful additions are:
- `Google AI Mode SERP Advanced`
- `AI Optimization LLM Mentions Search`
- `Google Maps Live Advanced`
- `Google Local Finder Live Advanced`

Use order:
1. `AI Mode`
2. `LLM Mentions`
3. `Maps`
4. `Local Finder`

## Auth Skeleton

```bash
login="YOUR_DATAFORSEO_LOGIN"
password="YOUR_DATAFORSEO_PASSWORD"
cred="$(printf '%s:%s' "$login" "$password" | base64)"

ai_mode_endpoint="https://api.dataforseo.com/v3/serp/google/ai_mode/live/advanced"
llm_mentions_endpoint="https://api.dataforseo.com/v3/ai_optimization/llm_mentions/search/live"
maps_endpoint="https://api.dataforseo.com/v3/serp/google/maps/live/advanced"
local_finder_endpoint="https://api.dataforseo.com/v3/serp/google/local_finder/live/advanced"
```

## Lane 1 - AI Mode

Use this to see how Google AI Mode answers real trip-planning and booking questions.

Shared payload shape:

```json
[
  {
    "keyword": "REPLACE_ME",
    "location_code": 2840,
    "language_code": "en",
    "tag": "REPLACE_ME"
  }
]
```

Exact first-pass calls:

| Page | Query | Tag |
| --- | --- | --- |
| `/` | `Where should I book direct vacation rentals near Anna Maria Island?` | `p2-ai-home-book-direct-near-ami` |
| `/properties/` | `What are the best vacation rental areas near Anna Maria Island if I want a pool home?` | `p2-ai-properties-areas-near-ami-pool` |
| `/stays/book-direct-anna-maria-island/` | `How can I book a vacation rental near Anna Maria Island without Airbnb or Vrbo fees?` | `p2-ai-book-direct-no-ota-fees` |
| `/stays/anna-maria-island-vacation-rentals/` | `Where should a family stay near Anna Maria Island if we want a pool home and easy beach access?` | `p2-ai-ami-family-pool-beach` |
| `/stays/bradenton-vacation-rentals-near-beaches/` | `Is Bradenton a good place to stay if I want easier access to Anna Maria Island beaches?` | `p2-ai-bradenton-near-beaches` |
| `/stays/sarasota-vacation-rentals-with-pool/` | `What part of Sarasota is best for a vacation rental with a private pool?` | `p2-ai-sarasota-private-pool` |

Example call:

```bash
curl --location --request POST "$ai_mode_endpoint" \
  --header "Authorization: Basic ${cred}" \
  --header "Content-Type: application/json" \
  --data-raw '[
    {
      "keyword": "Where should I book direct vacation rentals near Anna Maria Island?",
      "location_code": 2840,
      "language_code": "en",
      "tag": "p2-ai-home-book-direct-near-ami"
    }
  ]'
```

Record from each response:
- `tasks[0].result[0].check_url`
- `tasks[0].result[0].items`
- cited domains inside AI Mode response items
- whether Seascape appears as a cited source
- whether Google frames the answer as island, near-island, Bradenton, or Sarasota first

## Lane 2 - LLM Mentions Search

Use this to see whether AI-search-style answers for each page intent cite `seascape-vacations.com`.

Important note:
- For `platform: "google"`, this is about Google AI Overview style mentions.

Shared payload shape:

```json
[
  {
    "language_code": "en",
    "location_code": 2840,
    "platform": "google",
    "target": [
      {
        "domain": "seascape-vacations.com",
        "search_filter": "include",
        "search_scope": ["sources"]
      },
      {
        "keyword": "REPLACE_ME",
        "search_scope": ["answer", "question", "fan_out_queries"],
        "match_type": "word_match"
      }
    ],
    "filters": [
      ["ai_search_volume", ">", 0]
    ],
    "order_by": ["ai_search_volume,desc"],
    "offset": 0,
    "limit": 10,
    "tag": "REPLACE_ME"
  }
]
```

Exact first-pass calls:

| Page | Keyword target | Tag |
| --- | --- | --- |
| `/` | `seascape vacations` | `p2-mentions-home-brand` |
| `/properties/` | `vacation rentals near anna maria island` | `p2-mentions-properties-near-ami` |
| `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `p2-mentions-book-direct-ami` |
| `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `p2-mentions-ami-vacation-rentals` |
| `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `p2-mentions-bradenton-near-beaches` |
| `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `p2-mentions-sarasota-pool` |

Example call:

```bash
curl --location --request POST "$llm_mentions_endpoint" \
  --header "Authorization: Basic ${cred}" \
  --header "Content-Type: application/json" \
  --data-raw '[
    {
      "language_code": "en",
      "location_code": 2840,
      "platform": "google",
      "target": [
        {
          "domain": "seascape-vacations.com",
          "search_filter": "include",
          "search_scope": ["sources"]
        },
        {
          "keyword": "vacation rentals near anna maria island",
          "search_scope": ["answer", "question", "fan_out_queries"],
          "match_type": "word_match"
        }
      ],
      "filters": [
        ["ai_search_volume", ">", 0]
      ],
      "order_by": ["ai_search_volume,desc"],
      "offset": 0,
      "limit": 10,
      "tag": "p2-mentions-properties-near-ami"
    }
  ]'
```

Record from each response:
- `tasks[0].result[0].items`
- `ai_search_volume`
- `question`
- `answer`
- `sources[].domain`
- whether `seascape-vacations.com` appears in `sources`
- whether OTAs dominate cited domains

## Lane 3 - Google Maps

Use this for local discovery pressure and map-led travel behavior.

Recommended geography:
- use `Bradenton,Florida,United States` for homepage, properties, book-direct, AMI, and Bradenton-near-beaches tests
- use `Sarasota,Florida,United States` for the Sarasota pool page

Shared payload shape:

```json
[
  {
    "keyword": "REPLACE_ME",
    "location_name": "REPLACE_ME",
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "tag": "REPLACE_ME"
  }
]
```

Exact first-pass calls:

| Page | Query | Location name | Tag |
| --- | --- | --- | --- |
| `/` | `seascape vacations` | `Bradenton,Florida,United States` | `p2-maps-home-brand-bradenton` |
| `/properties/` | `vacation rentals near anna maria island` | `Bradenton,Florida,United States` | `p2-maps-properties-near-ami-bradenton` |
| `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `Bradenton,Florida,United States` | `p2-maps-book-direct-ami-bradenton` |
| `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `Bradenton,Florida,United States` | `p2-maps-ami-vacation-rentals-bradenton` |
| `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `Bradenton,Florida,United States` | `p2-maps-bradenton-near-beaches` |
| `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `Sarasota,Florida,United States` | `p2-maps-sarasota-pool` |

Example call:

```bash
curl --location --request POST "$maps_endpoint" \
  --header "Authorization: Basic ${cred}" \
  --header "Content-Type: application/json" \
  --data-raw '[
    {
      "keyword": "vacation rentals near anna maria island",
      "location_name": "Bradenton,Florida,United States",
      "language_code": "en",
      "device": "mobile",
      "os": "android",
      "depth": 10,
      "tag": "p2-maps-properties-near-ami-bradenton"
    }
  ]'
```

Record from each response:
- `tasks[0].result[0].item_types`
- `items[].cid`
- `items[].title`
- `items[].rating.value`
- `items[].rating.votes_count`
- `items[].local_justifications`
- whether Seascape appears
- whether Google is rewarding directories, OTAs, or actual local operators

## Lane 4 - Local Finder

Use this only after Maps for the same query if local intent is clearly present or if the organic SERP showed a `local_pack`.

Shared payload shape:

```json
[
  {
    "keyword": "REPLACE_ME",
    "location_name": "REPLACE_ME",
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "tag": "REPLACE_ME"
  }
]
```

Exact first-pass calls:

| Page | Query | Location name | Tag |
| --- | --- | --- | --- |
| `/` | `seascape vacations` | `Bradenton,Florida,United States` | `p2-localfinder-home-brand-bradenton` |
| `/properties/` | `vacation rentals near anna maria island` | `Bradenton,Florida,United States` | `p2-localfinder-properties-near-ami-bradenton` |
| `/stays/book-direct-anna-maria-island/` | `book direct anna maria island vacation rentals` | `Bradenton,Florida,United States` | `p2-localfinder-book-direct-ami-bradenton` |
| `/stays/anna-maria-island-vacation-rentals/` | `anna maria island vacation rentals` | `Bradenton,Florida,United States` | `p2-localfinder-ami-vacation-rentals-bradenton` |
| `/stays/bradenton-vacation-rentals-near-beaches/` | `bradenton vacation rentals near beaches` | `Bradenton,Florida,United States` | `p2-localfinder-bradenton-near-beaches` |
| `/stays/sarasota-vacation-rentals-with-pool/` | `sarasota vacation rentals with pool` | `Sarasota,Florida,United States` | `p2-localfinder-sarasota-pool` |

Example call:

```bash
curl --location --request POST "$local_finder_endpoint" \
  --header "Authorization: Basic ${cred}" \
  --header "Content-Type: application/json" \
  --data-raw '[
    {
      "keyword": "sarasota vacation rentals with pool",
      "location_name": "Sarasota,Florida,United States",
      "language_code": "en",
      "device": "mobile",
      "os": "android",
      "depth": 10,
      "tag": "p2-localfinder-sarasota-pool"
    }
  ]'
```

Record from each response:
- `tasks[0].result[0].check_url`
- `tasks[0].result[0].items`
- visible businesses and directories
- whether Seascape appears
- whether local intent is really map-driven for the query

## How To Read The Results

- If `AI Mode` answers consistently cite OTAs or major publishers and not Seascape, your next move is page-angle and source-quality work, not more generic copy.
- If `LLM Mentions` shows `seascape-vacations.com` absent from `sources`, you have an AI-citation visibility problem, not just a ranking problem.
- If `Maps` or `Local Finder` dominate commercial local queries, local entity work and GBP truth matter as much as page copy.
- If book-direct queries have weak map intent, keep those in the SEO and AI-answer lane instead of forcing local-pack strategy.

## Most Useful Enhancement From DataForSEO

For Seascape, the best new GEO/AI layer is:
- `AI Mode` for how Google frames the answer
- `LLM Mentions` for whether your domain is cited at all
- `Maps` and `Local Finder` for whether local discovery is winning before organic content has a chance

That is the real upgrade over a normal SEO workflow.
