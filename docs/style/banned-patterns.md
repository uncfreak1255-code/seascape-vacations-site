# Banned Patterns

## Language Bans

- generic tourism-board adjectives that say nothing
- AI-sludge phrasing like `curated`, `nestled`, `elevate`, `boasts`, `myriad`, `seamless`, `unparalleled`
- gray internal-documentation phrasing in visible page copy, including `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, and `proof boundaries`
- page-self-explanatory meta copy like `this page is broad on purpose`, `this page is here to`, `this page is built around`, `use this page when`, `if your real search is`, `if your real question is`, or `tradeoff stated clearly`
- fake certainty when the proof is missing
- owner pages that say `full service` five different ways and still never explain the leak

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
