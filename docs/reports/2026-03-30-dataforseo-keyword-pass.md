# DataForSEO Keyword Pass

*Date:* 2026-03-30

## Scope

Pulled a narrow DataForSEO pass to support Seascape SEO prioritization after Phase 2 owner-page deployment.

Method:

- `dataforseo_labs/google/ranked_keywords/live` for `seascape-vacations.com`
- `dataforseo_labs/keyword_suggestions/live` for owner-intent and stay-intent seed phrases
- location: `United States`
- language: `English`

Reference docs:

- `https://docs.dataforseo.com/v3/dataforseo_labs-google-ranked_keywords-live/`
- `https://docs.dataforseo.com/v3/dataforseo_labs-keyword_suggestions-live/`

## Hard Findings

### 1. The domain still wins on guides, not money pages

The strongest ranked keyword slice is still guide/location intent, not owner acquisition.

Examples from the ranked domain pull:

- `bradenton vs sarasota` at rank group `2`
- `srq airport to anna maria island` at rank group `3`
- several other Anna Maria / Sarasota travel-guide terms in the top `5`

Owner-intent rankings were weak and sparse. The only clean owner-adjacent ranking in the sampled set was:

- `siesta key property management companies` with search volume `30`, CPC `$4.68`, rank group `23`, landing on `/property-management/vacation-rental-management-siesta-key/`

Most other "owner" hits in the ranked sample were false friends:

- random `vrbo` stay queries
- branded `seascape vrbo`
- stay pages matching `pet friendly airbnb` wording

Conclusion: the current domain footprint is still structurally guide-heavy. That matches the GSC read. Do not pretend the domain is already competing broadly on owner money terms.

### 2. Licensing is the cleanest immediate owner-intent keyword cluster

The licensing seed returned the most usable Florida-specific demand:

- `florida vacation rental license` — volume `170`, CPC `$7.29`, difficulty `4`
- `vacation rental license florida` — volume `170`, CPC `$7.29`, difficulty `1`
- `florida dbpr vacation rental license` — volume `30`

This supports the current licensing page. It also says the page should stay tightly centered on:

- Florida license terminology
- DBPR phrasing
- direct answer structure

### 3. Fees has real demand, but it is mostly national and question-shaped

The fees seed produced a usable cluster:

- `rental property management fees` — volume `590`, CPC `$9.07`, difficulty `12`
- `average rental property management fees` — volume `90`, CPC `$9.13`, difficulty `10`
- `short term rental management fees` — volume `50`, CPC `$17.61`, difficulty `0`
- `vacation rental management fees` — volume `40`, CPC `$2.06`, difficulty `1`
- `vacation rental property management fees` — volume `30`, CPC `$12.16`, difficulty `0`

Conclusion: the fees page should be sharpened around:

- average fee ranges
- short-term / vacation rental framing
- question-led headings and FAQ coverage

This does **not** justify spinning up a dozen fee pages.

### 4. Florida management-company demand exists, but it is thin and expensive

The management seed returned only four Florida-specific suggestions, all at low volume:

- `vacation rental management florida` — volume `20`, CPC `$40.26`, difficulty `31`
- `florida vacation rental management companies` — volume `20`, CPC `$26.04`, difficulty `42`
- `vacation rental management companies florida` — volume `20`, CPC `$26.04`, difficulty `62`
- `vacation rental management companies in florida` — volume `20`, CPC `$26.04`, difficulty `42`

Conclusion: this is one page problem, not a page-volume opportunity. Build one strong Florida management page or strengthen the existing Florida owner page architecture. Do not split these into separate near-duplicate pages.

### 5. Airbnb has a Florida angle; VRBO does not show the same phrase inventory

Florida-constrained suggestions:

- `airbnb property management florida` — volume `20`, CPC `$21.79`, difficulty `17`
- `vrbo property management` + Florida filter — no returned suggestions
- `vrbo management` + Florida filter — no returned suggestions

Conclusion:

- the Airbnb framing is a viable supporting angle or section
- the VRBO page is still useful as a conversion/support page
- DataForSEO did **not** validate a broader Florida VRBO page cluster worth expanding right now

### 6. Stay-page demand is real, but it should be consolidated into a few serious money pages

#### Anna Maria Island

The AMI cluster is materially larger than the others:

- `anna maria island vacation rentals` — volume `9900`, difficulty `37`
- several reordered variants at `9900`
- `vacation rentals anna maria island` — volume `14800`, difficulty `41`
- `anna maria island beach vacation rentals` — volume `3600`, difficulty `32`
- `anna maria island vacation rentals on the beach` — volume `3600`, difficulty `32`
- `anna maria island florida vacation rentals by owner` — volume `3600`, difficulty `7`

This is not a thin-page keyword. It wants one genuinely strong commercial lander.

#### Holmes Beach

The Holmes Beach cluster is smaller but still substantial:

- `holmes beach vacation rentals` — volume `4400`
- several close variants also at `4400`
- `holmes beach vacation rentals oceanfront` — volume `30`
- `holmes beach vacation rentals beachfront` — volume `30`

This supports one real Holmes Beach money page, with beachfront/oceanfront handled as sections or modules first.

#### Bradenton Beach

Bradenton Beach is meaningful but clearly behind AMI and Holmes:

- `bradenton beach vacation rentals` — volume `720`
- multiple close variants also at `720`
- `bradenton beach florida vacation rentals by owner` — volume `320`
- `bradenton beach vacation rentals beachfront` — volume `720`

This is still worth a strong page, but not before AMI and Holmes Beach are handled correctly.

## What This Means

### Keep

- owner-page focus
- licensing and fees page strengthening
- one shared-system approach instead of page sprawl

### Do Not Do

- broad VRBO page expansion based on assumption
- random new Florida management pages
- generic keyword-volume farming from DataForSEO exports

### Next Useful SEO Moves

1. Tighten the licensing page around `vacation rental license florida` and DBPR phrasing.
2. Tighten the fees page around fee-range and short-term rental fee questions.
3. Treat Florida management-company terms as one page / one cluster.
4. If stay-page work starts, prioritize in this order:
   - Anna Maria Island vacation rentals
   - Holmes Beach vacation rentals
   - Bradenton Beach vacation rentals
5. Keep VRBO as a supporting conversion page unless GSC later shows real term expansion that DataForSEO did not surface here.

## Notes

Raw temporary outputs from this pass were written locally during analysis and were not committed:

- `/tmp/dataforseo-seascape-pass.json`
- `/tmp/dataforseo-seascape-suggestions.json`
