# DataForSEO Run Sheet - First 5 Calls

This run sheet implements the first five calls from the core guest pages research plan.

All five calls use:
- Endpoint: `POST https://api.dataforseo.com/v3/serp/google/organic/live/advanced`
- Device: `mobile`
- OS: `android`
- Location: `United States`
- Location code: `2840`
- Language: `en`
- Depth: `10`

Why this shape:
- `Google Organic Live Advanced` gives the full SERP layout.
- `load_async_ai_overview: true` helps surface `ai_overview` when Google loads it asynchronously.
- `remove_from_url: ["srsltid"]` keeps returned URLs cleaner for analysis.

## Official Notes Behind This Run Sheet

- Live SERP API calls take JSON and `each Live SERP API call can contain only one task`.
- `location_code: 2840` corresponds to `United States`.
- `depth` defaults to `10`; going above `10` can increase cost.
- `load_async_ai_overview: true` adds a small extra charge but is the right setting when we care about AI Overview presence.

## Auth Skeleton

```bash
login="YOUR_DATAFORSEO_LOGIN"
password="YOUR_DATAFORSEO_PASSWORD"
cred="$(printf '%s:%s' "$login" "$password" | base64)"
endpoint="https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
```

## Shared Payload Template

```json
[
  {
    "keyword": "REPLACE_ME",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "REPLACE_ME"
  }
]
```

## Call 1

Target page:
- `/`

Research intent:
- branded homepage/entity query

Payload:

```json
[
  {
    "keyword": "seascape vacations",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "q1-home-brand-mobile-us"
  }
]
```

Command:

```bash
curl --location --request POST "$endpoint" \
  --header "Authorization: Basic ${cred}" \
  --header "Content-Type: application/json" \
  --data-raw '[
    {
      "keyword": "seascape vacations",
      "location_code": 2840,
      "language_code": "en",
      "device": "mobile",
      "os": "android",
      "depth": 10,
      "load_async_ai_overview": true,
      "remove_from_url": ["srsltid"],
      "tag": "q1-home-brand-mobile-us"
    }
  ]'
```

## Call 2

Target page:
- `/`

Research intent:
- branded plus Bradenton modifier

Payload:

```json
[
  {
    "keyword": "seascape vacations bradenton",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "q2-home-bradenton-mobile-us"
  }
]
```

## Call 3

Target page:
- `/`

Research intent:
- branded plus AMI modifier

Payload:

```json
[
  {
    "keyword": "seascape vacations anna maria island",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "q3-home-ami-mobile-us"
  }
]
```

## Call 4

Target page:
- `/`

Research intent:
- branded plus Sarasota modifier

Payload:

```json
[
  {
    "keyword": "seascape vacations sarasota",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "q4-home-sarasota-mobile-us"
  }
]
```

## Call 5

Target page:
- `/properties/`

Research intent:
- broad non-branded collection query

Payload:

```json
[
  {
    "keyword": "vacation rentals near anna maria island",
    "location_code": 2840,
    "language_code": "en",
    "device": "mobile",
    "os": "android",
    "depth": 10,
    "load_async_ai_overview": true,
    "remove_from_url": ["srsltid"],
    "tag": "q5-properties-near-ami-mobile-us"
  }
]
```

## What To Save From Each Response

- `tasks[0].result[0].check_url`
- `tasks[0].result[0].item_types`
- top organic domains from `tasks[0].result[0].items`
- whether `ai_overview` appears
- whether `local_pack` appears
- whether `people_also_ask` appears
- whether OTAs dominate the visible results

## Quick Read Rules

- If branded queries are weak, homepage/entity work moves up.
- If `vacation rentals near anna maria island` rewards near-island honesty, keep that framing instead of softening it.
- If AI Overview or local pack dominates above organic, content angle matters more than adding more inventory copy.
- If the SERP is OTA-heavy, do not assume the answer is "write more"; first narrow the page angle.
