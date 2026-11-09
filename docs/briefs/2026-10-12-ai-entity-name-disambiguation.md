# Brief: AI entity name disambiguation and llms.txt fact repair

- lifecycle: completed (source change merged in PR #718, `be5d1cab`; readback recorded 2026-11-09 below)

## Content Gate Inputs

- persona: answer engines and AI assistants resolving "Seascape Vacations" for owners vetting a manager and guests choosing a Bradenton or Sarasota home.
- primary keyword: Seascape Vacations
- secondary keywords: Seascape Vacations reviews; Is Seascape Vacations a good company to manage my rental property; vacation rental with a pickleball court in Bradenton; vacation home in Sarasota near St. Armands Circle with a pool
- audience pattern: machine readers of `llms.txt`, `/ai/summary.json`, and Organization JSON-LD; no visible page copy changes.
- proof source: OpenSEO AI-visibility baseline run `33cd86bb-ddbd-405b-bc70-5fb0e12c0797` (Seascape Vacations project, 22 frozen prompts x 5 engines, US, 2026-10-12 14:11-14:21Z), plus source truth in `src/_data/properties-fallback.json`, `src/_data/site.json`, and the live `/property-management/` page ("Seven homes. One local team.").
- required internal links: none
- CTA target: none; no CTA or event changes.
- anti-claims: no AI citation lift, ranking, review score, fee, occupancy, revenue, booking, or owner-lead claim; no on-island inventory claim; no legal-affiliation claim beyond "a different business".

## Source Receipt

- analytics receipt path: none yet; OpenSEO run `33cd86bb-ddbd-405b-bc70-5fb0e12c0797` is the live prompt check. `seascape-analytics` owns the analytics proof and records the citation receipt; this repo claims no lift.
- receipt run date: 2026-10-12
- receipt status: 103 of 110 answers collected, 7 failed (mostly Google AI Overviews).
- triggering query set: "Is Seascape Vacations a good company to manage my rental property?"; "Seascape Vacations reviews"; "vacation rental with a pickleball court in Bradenton"; "vacation home in Sarasota near St. Armands Circle with a pool"; "small local vacation rental manager in Bradenton or Sarasota".
- triggering pages: `/llms.txt`; `/ai/summary.json`; Organization JSON-LD on every page using `partials/organization-schema.njk`.
- recommendation copied from receipt: `hold-and-reread` (`docs/status/next-batch.md`, 2026-10-12). This batch opens no expansion branch; it repairs facts on existing machine surfaces.

## Batch Type

- chosen batch type: distribution/entity fact repair
- why this type wins now: on the owner-vetting brand prompt, Claude spent its answer on Seascape Property Management (Lewes, Delaware; BBB 1.29/5), and Gemini and Perplexity mixed in Sea Scape Properties (North Carolina), Seascapes Vacation Rentals (`seascapesmanagement.com`), and 30A Seascapes. Separately, `llms.txt` listed only four of the six Bradenton private-pool homes and had no retrieval line for the pickleball, St. Armands, IMG, or sleeps-16 facts. Every engine missed the pickleball and St. Armands prompts, even though matching homes exist.
- why other batch types wait: the next-batch gate blocks new stay, owner, guide, and GEO pages.
- active lane: machine-readable AI surfaces

## In Scope

- canonical target page(s): `/llms.txt`, `/ai/summary.json`
- supporting pages: existing property pages named in `llms.txt` (no edits)
- off-site entities or profiles involved: none changed. The Bradenton Gulf Islands listing still says "five" homes; updating it is Sawyer's call.
- GBP/local surfaces involved: none
- internal links to change: none
- structured data or `sameAs` changes allowed: add `disambiguatingDescription` and `areaServed` to Organization JSON-LD; JSON-encode `sameAs` so the Google profile URL no longer renders `&amp;`.
- proof/data assets allowed: property fallback facts and the OpenSEO baseline run

## Not In Scope

- new pages, title/meta, visible copy, CTA, or sitemap changes
- off-site profile edits, directory submissions, Hostaway edits
- measurement-system changes

## Experiment And Readback Contract

- hypothesis: an explicit name clarification in schema and AI summaries, plus retrieval lines for already-true home facts, reduces wrong-company answers on the brand prompts and raises Seascape visibility on the pickleball and St. Armands prompts.
- primary event: Seascape mentioned or cited on the five triggering prompts in an identical OpenSEO rerun.
- guardrail event: JSON-LD parses on every page; `llms.txt` property bullets still match `properties-fallback.json`; no other-company name appears as a Seascape fact.
- entry criteria: baseline run `33cd86bb-ddbd-405b-bc70-5fb0e12c0797` complete; change deployed and recrawled.
- readback window: one identical rerun of the frozen tracker no sooner than 2026-11-09 (four weeks after deploy).
- decision rule: keep if wrong-company content drops or the two amenity prompts gain a mention, with no guardrail failure; hold if flat; revert only a change tied to a guardrail failure.

## Release Gate

- commands to run: `npm run build`; `npm test`; `npm run lint:content`; `node scripts/recovery/assert-build-output.js remediation`; `node --test scripts/enforcement/ai-discovery-schema.test.js`; `npm run verify:jsonld`; `npm run verify:links`; `git diff --check`
- routes to smoke test: `/`, `/llms.txt`, `/ai/summary.json`
- screenshots required: none; no visible change.

## Done When

- the built Organization JSON-LD carries the disambiguation and a clean `sameAs` URL, `llms.txt` names all six Bradenton pool homes and the amenity retrieval lines, and the release gate passes on the committed head.

## Post-Reread Readback

- reread window used: one identical rerun of tracker `3bab4c09`, run `4e420ff5-6e5a-4358-adf5-704bdc3c8d61`, 2026-11-09 15:01Z (22 prompts x 5 engines, US; 109 of 110 collected, 1 failed, 5 no-answer; estimate $5.10 under a $6 cap). Tracker left paused, no schedule. Compared with baseline `33cd86bb` (2026-10-12) and the intervening run `c3add468` (2026-10-27).
- change still live on 2026-11-09: `/llms.txt` carries the name clarification and the pickleball and St. Armands retrieval lines; the homepage Organization JSON-LD carries `disambiguatingDescription`. The full JSON-LD parse on every page was not rerun.
- brand prompts (wrong-company content): not reduced. Brand answers naming another "Seascape" business: 5 of 14 (Oct 12), 8 of 14 (Oct 27), 7 of 13 (Nov 9). The framing changed: on Nov 9, Claude and Perplexity named the other companies as different businesses, while on Oct 12 Gemini put Sea Scape Properties' rating under a Seascape Vacations heading. New confusions appeared: Gemini's "Seascape Vacations reviews" answer and Google AI Overviews' owner-vetting answer were about Seascape Resort (Miramar Beach), with no Bradenton reference. ChatGPT's owner-vetting answer asked which of three similarly named companies was meant.
- pickleball prompt: gained. 0 of 5 engines (Oct 12); cited by Claude and Perplexity (Oct 27); cited by Claude and Gemini (Nov 9).
- St. Armands prompt: flat at 0 of 5 engines on all three runs.
- non-brand visibility by engine (Seascape named or cited, over answered cells; Oct 12 -> Oct 27 -> Nov 9): ChatGPT 6/19 -> 2/19 -> 4/19; Claude 5/19 -> 7/19 -> 8/19; Perplexity 7/19 -> 8/19 -> 3/19; Gemini 1/19 -> 4/19 -> 6/19; Google AI Overviews 0/12 -> 1/15 -> 0/15.
- run-to-run noise: of the non-brand prompt-and-engine cells answered in both runs, 11 of 86 flipped between Oct 12 and Oct 27 and 9 of 87 between Oct 27 and Nov 9, so single-cell moves are within noise.
- concurrent changes, so no lift is attributed to this batch: owner outreach emails (2026-10-27), a Yelp profile update (2026-11-05), and the site merges since 2026-10-27 (owner page hero and home cards, Waterline stay pages and guides).
- decision taken: `keep` under this brief's rule, because the pickleball prompt gained mentions on two consecutive runs and no guardrail failure was found. Wrong-company content on the brand prompts was not reduced and St. Armands stayed at zero; both remain open, and fixing them is off-site entity work outside this brief's scope. No AI citation lift is claimed. `seascape-analytics` owns any further readback.
