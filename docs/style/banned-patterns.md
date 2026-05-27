# Banned Patterns

## Language Bans

- generic tourism-board adjectives that say nothing
- AI-sludge phrasing like `curated`, `nestled`, `elevate`, `boasts`, `myriad`, `seamless`, `unparalleled`
- gray internal-documentation or review-template phrasing in visible page copy, including `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, `proof boundaries`, `proven cost`, `likely cost`, and `missing information`
- funnel-mechanics language written as guest copy: `fastest path into direct dates`, `move straight from comparison into live availability`, `filter by fit`, `jump into direct dates`
- agent meta-commentary on the page's own positioning: `with the tradeoff stated clearly`, `without pretending every stay is on-island`
- generic hospitality filler: `resort-style amenities` (name the actual amenities), `luxury` as a standalone descriptor
- UI logic narrated at the user: `instead of assuming the collection disappeared`, `short booking windows` (say "book this week" not "short booking window")
- fake certainty when the proof is missing
- owner pages that say `full service` five different ways and still never explain the leak
- `routed through`
- `OTA drag`
- `rate power`
- `channel mix`
- `leak` / `leakage`
- `fee stack`
- `the home` (prefer `your home`/`your property` when clear)
- `Use this when…`
- `Read this if…`
- `For homes where X, Y, and Z matter more than…`

## Proof Bans

- stale sitewide review-count claims used as universal proof
- invented amenities or equipment
- plural waterfront language when only one property is actually waterfront
- direct-beach claims on near-island pages that are intentionally not beachfront
- random stat insertion that is not backed by current source or approved proof assets
- putting proof disclaimers, methodology notes, or quote limitations in the opening paragraph when they belong in a source/proof box below the visitor-facing hook
- amenity labels, bedroom or bathroom counts, or feature claims that differ between `src/_data/properties-fallback.json`, `src/properties/<slug>/index.njk`, and `src/llms.txt` — pick one authority and propagate, do not let those three files tell LLMs three different stories

## Workflow Bans

- editing `_site/`
- using `DEPLOY THIS FOLDER TO NETLIFY/` as source truth
- treating old monthly root markdown files as live authority
- importing another repo's SEO publishing system whole
- spinning up extra role files when the five-role system already covers the work
- opening a new SEO batch before the active brief has a measured outcome
