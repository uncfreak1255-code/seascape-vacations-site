# Brief: AI entity name disambiguation and llms.txt fact repair

- lifecycle: active

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

- reread window used: pending (rerun no sooner than 2026-11-09)
- decision taken: `hold`
