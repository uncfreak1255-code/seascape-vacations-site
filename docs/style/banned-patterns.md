# Banned Patterns

## Language Bans

- generic tourism-board adjectives that say nothing
- AI-sludge phrasing like `curated`, `nestled`, `elevate`, `boasts`, `myriad`, `seamless`, `unparalleled`, `cleaner`
- throat-clearing and formulaic AI rhythm: `here's the thing`, `here's why`, `this matters because`, `let me be clear`, `make no mistake`, `at its core`, `in today's`, `in a world where`, `it's worth noting`, `when it comes to`, `at the end of the day`, `full stop`, `moving forward`, `on the same page`
- generic business/research wrappers: `game-changer`, `deep dive`, `unpack`, `lean into`, `landscape`, `double down`, `take a step back`, `circle back`, and `navigate challenges`
- vague importance claims like `the stakes are high`, `the implications are significant`, `the consequences are real`, or `the reasons are structural`
- mechanical contrast structures like `not just X but also Y`, `the question isn't X, it's Y`, `X is not the problem. Y is.`, or `it feels like X. It is actually Y.`
- gray internal-documentation or review-template phrasing in visible page copy, including `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, `proof boundaries`, `proven cost`, `likely cost`, and `missing information`
- instruction-template phrasing that sounds like a role card, prompt, or session note in visible copy, including `Use this when`, `Use this if`, `Use it when`, `Read this if`, `Read this when`, `Open this page if`, `Choose this when`, `Pick this when`, and `Do not use this page if`
- funnel-mechanics language written as guest copy: `fastest path into direct dates`, `move straight from comparison into live availability`, `filter by fit`, `jump into direct dates`
- internal travel-planning shorthand written as guest copy: `trip shape`, `stay base`, `booking path`, `named Sarasota-side option`, `named home`, `right stay`, or `research mode`. Agents may use those ideas while planning, but visible copy must name the vacation the reader wants or the home they can open.
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
- `Use this if…`
- `Use it when…`
- `Read this if…`
- `Read this when…`
- `Open this page if…`
- `Do not use this page if…`
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
