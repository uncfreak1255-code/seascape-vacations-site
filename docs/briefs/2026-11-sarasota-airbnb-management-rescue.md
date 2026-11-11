# Brief: Sarasota Airbnb management owner page rescue (2026-11-10)

- lifecycle: active
- task scope: rewrite the search snippet and reader copy of the existing owner page `/property-management/airbnb-management-services-sarasota/` (one `seoPages.owner` entry). No new URL, no layout, CSS, template, form, tracking or redirect change. Requested by Sawyer on 2026-11-10: "Set the best outcome and achieve it in this session", with the goal stated as more direct bookings and more owners under management, and up to $20 of paid OpenSEO lookups approved. Follow-on, same day: after seeing the page Sawyer said "God that is the old design legacy template", then approved moving the shared owner-lander template onto the Waterline owner design ("Yes push the design further though if needed"). That follow-on changes the template and one new stylesheet for every generated owner lander; it adds no claim and keeps the form, tracking and routes.
- completion or successor: draft PR only. `docs/status/next-batch.md` (2026-11-09 read) allows evidence-backed fixes to existing pages as draft PRs while expansion is held; merge needs review of the final head and Sawyer's decision.

## Content Gate Inputs

- persona: owner of a Sarasota home that is already on Airbnb, either self-managing and worn out or unhappy with a current manager, comparing local managers
- primary keyword: airbnb management sarasota
- secondary keywords: airbnb property management sarasota; airbnb management sarasota florida; airbnb management companies sarasota; airbnb management siesta key florida
- audience pattern: comparison shopper reading listicles and AI answers that quote fee percentages, then opening two or three manager pages to see who is local and what it costs
- proof source: Search Console through OpenSEO `get_search_console_performance`, 2026-10-11 to 2026-11-07, read 2026-11-10; OpenSEO `get_serp_results` US desktop depth 20, observed 2026-11-10 (result `b07f4e7a-4e62-4587-92a2-f93e27be12cb`); OpenSEO AI-visibility run `4e420ff5-6e5a-4358-adf5-704bdc3c8d61`, topic "Owner: property management"; `seascape-hub` `origin/main` `context/owner-offer.md` sections 6 and 7, read 2026-11-10; City of Sarasota "Vacation Rental Registration and Compliance" page, read 2026-11-10; the published Airbnb host-fee wording already on the Bradenton owner entry in `src/_data/seoPages.json`
- offer claim: `seascape-hub/context/owner-offer.md` section 7, "property-specific pricing after a review; the 48-hour revenue review and exactly what comes back", carried by the section 6 sentence: "A small local team that gives my home direct attention, tells me what it earned and what needs fixing before I ask, and answers the phone."
- required internal links: /property-management/vacation-rental-management-sarasota/, /property-management/vacation-rental-management-fees-florida/, /property-management/switch-from-airbnb-self-manage/, /property-management/switch-vacation-rental-management-company/, /property-management/vacation-rental-licensing-florida/
- CTA target: the existing owner evaluation form on the page; primary CTA label stays "Request Your Revenue Review"; no href, form field or tracking change
- anti-claims: no revenue, booking or occupancy figure; no savings from direct booking; no response-time or review-count number; no universal fee or fee range; no performance guarantee; no passive income or hands-off management; no count of homes; no operating software name; no Seascape home placed on Siesta Key, Longboat Key or Anna Maria Island; no legal advice, and no city rule stated as applying to every Sarasota address

## Why This Batch

- What changed in the data: this page is the owner page Google shows most for owner-intent queries, and nobody clicks. Search Console, 2026-10-11 to 2026-11-07: "airbnb management sarasota" 44 impressions at average position 6.1, "airbnb property management sarasota" 29 at 6.9, "airbnb management sarasota florida" 22 at 9.2, "airbnb management siesta key florida" 12 at 11.8; 0 clicks on all four. In the 2026-11 owner AI-visibility run it is one of two Seascape URLs cited in answers to owner prompts (3 answers; `/property-management/` also 3).
- Why this page wins now: its copy is the original template text. The description reads "We handle everything.", the benefits include "Instant messaging response", one FAQ contains the typo "professional betters", and two FAQ answers promise results ("dramatically increase booking conversion rates", "our balance ensures maximum yield") that owner-offer section 7 excludes. The page a searcher or an assistant lands on says nothing a Sarasota owner can check.
- What should wait: every other owner lander, the 24/7 stat on the shared proof asset, title tests on other pages, any new owner URL, and outreach to the third-party lists that AI answers cite most (a send, which needs Sawyer).

## Experiment And Readback Contract

- hypothesis: a snippet that names what a comparing owner wants to know (local team, pricing set per home, a one-page review in 48 hours) and a page that answers the cost question directly will earn clicks from the owner queries the page already ranks for, and those visits will start the owner form. This is a direction, not a forecast; 107 impressions in 28 days is a thin sample.
- primary event: `owner_primary_cta_click` on this route
- guardrail event: owner evaluation form submits on this route, plus average position for "airbnb management sarasota" in Search Console
- entry criteria: Gate 0 filled (below); copy contains only claims approved in owner-offer section 7 or published third-party facts with their source; voice pass approved; `npm run verify:release` green
- readback window: first 7 complete days after production publish for a safety read, then the 28-day settle window in `docs/status/page-ledger.json`
- decision rule: at 7 days, revert with a plain revert commit if the page is deindexed or "airbnb management sarasota" falls 3 or more positions below 6.1. At 28 days, keep if the four queries together show at least 1 click or impressions hold within 30% with position no worse than 2 places lower; revert the title only if position fell 3 or more places while the sibling `/property-management/vacation-rental-management-sarasota/` held; otherwise record `insufficient evidence` and leave the copy, because the removed claims were excluded claims regardless of traffic.

## Gate 0 Search And Attack Receipt

Evidence receipts (dated; raw JSON not committed): OpenSEO `get_serp_results`, US, desktop, depth 20, two keywords, observed 2026-11-10. Search Console read through OpenSEO the same day. Competitor pages fetched 2026-11-10.

| Field | Answer |
| --- | --- |
| Target query family | "airbnb management sarasota", "airbnb property management sarasota", "airbnb management sarasota florida", "airbnb management companies sarasota" |
| Searcher intent | Commercial comparison: an owner choosing a local manager for a home on Airbnb, and asking what it costs |
| Current Seascape URL | `/property-management/airbnb-management-services-sarasota/` |
| SERP observed date | 2026-11-10 |
| SERP stale after | 2026-11-17 |
| Attack status | completed |
| Query variants inspected | "airbnb management sarasota" and "airbnb property management sarasota" (SERP, depth 20); Search Console rows for the four queries in "Why This Batch" |
| SERP source | OpenSEO `get_serp_results` US desktop depth 20, observed 2026-11-10. "airbnb management sarasota": AI Overview first, then airbnb.com Sarasota rentals, a "Who manages local Airbnb or vacation rentals in Sarasota?" forum result, Yelp's property-management list, the City of Sarasota vacation rental registration page, onefinebnb.com's Siesta Key list, iTrip Sarasota-Bradenton, airbtics.com, iTrip Sarasota and Venice, PMI Southwest Florida, redawning, AirDNA. "airbnb property management sarasota": a local pack (EasyStay, Great Stay Homes, AirBnB Properties LLC), then choosegulfcoast.com, a forum post, skyrun.com, two onefinebnb.com lists, PMI, a setup guide, airbnb.com, AirDNA. Seascape is absent from both national top 20s; Search Console's averages include local and personalised results. |
| Competitor URLs inspected | Fetched and read 2026-11-10: `https://www.gowithsurge.com/blog/best-airbnb-management-sarasota` (the source AI answers cite most for owner prompts in the 2026-11 run), `https://awning.com/post/top-airbnb-management-sarasota-fl`, `https://skyrun.com/sarasota/management/`, and the City of Sarasota registration page. SERP title and snippet only: onefinebnb.com, airbtics.com, iTrip, PMI. |
| Top visible competitors | List pages (gowithsurge.com, awning.com, onefinebnb.com, airbtics.com) and national franchise pages (iTrip, SkyRun, PMI), plus the city's own registration page |
| Competitor angle | The lists compare companies by published fee and say "Not published" where there is none; gowithsurge.com already lists Seascape Vacations with the fee unpublished and the 48-hour one-page review as its offer. Franchise pages lead with review counts and earnings promises and tell the owner to call for fees. |
| Content gap and Seascape answer | No competitor page read explains what a management percentage is taken from or what sits outside it, and the franchise pages do not say who answers. Seascape answer: say plainly that pricing is quoted per home as a share of net rent with the basis in writing, name Airbnb's own published host fee as a separate cost, name the two people who answer, state what the 48-hour review returns, and point Sarasota owners to the city's registration page. |
| Visual/format gap | None addressed. The lists use fee tables; Seascape has no public fee to tabulate, so a table would be empty theatre. The page keeps its existing template sections. |
| Design/format strategy | No layout, CSS or template change. Text changes only, in fields the template already renders: title, meta description, H1, hero intro, proof stats, checklist, body copy, FAQ, related links. The page's visual baseline changes because the words change. |
| Seascape gap | Snippet and substance. Title "Airbnb Management Services in Sarasota FL" and description "Full-service Airbnb management for Sarasota vacation rentals. We handle everything." give a comparing owner no reason to click, and the body is generic template text with two result promises the owner offer excludes. |
| Cannibalization check | The sibling `/property-management/vacation-rental-management-sarasota/` targets "vacation rental management sarasota" and premium-home switchers. Search Console shows the Airbnb page, not the sibling, for the four Airbnb queries. The rewrite keeps "Airbnb" in the title, H1 and FAQ and links to the sibling, so the two pages keep separate jobs. |
| Seascape proof available | Owner-offer section 7 approved claims; the published Airbnb host fee wording already used on the Bradenton owner page; the named team; the City of Sarasota page for the registration facts. No Seascape performance figure is used. |
| Current proof | Search Console, 2026-10-11 to 2026-11-07: 107 impressions across the four queries, 0 clicks, average positions 6.1 to 11.8. AI-visibility run 2026-11: this URL cited in 3 owner-prompt answers. No owner lead is attributed to this page; none is claimed. |
| Search fit | Existing owner page with the most owner-query visibility; improve in place. Not a new page and not an expansion branch. |
| Local/GBP proof | The second query shows a local pack that Seascape is not in. No Google Business Profile field is changed here; the pack is recorded as a separate gap. |
| AEO/readback note | An AI Overview leads the head query. The new FAQ opens with the cost question and answers it in the first sentence, and the FAQ answers render into the page's FAQ markup unchanged in structure. `npm run eval:aeo` calls a paid provider and was not run. Any citation change is read from the next scheduled AI-visibility run, not claimed here. |
| Tools/plugins used | OpenSEO `get_serp_results` (one paid call, two keywords), `get_search_console_performance`, `get_ai_visibility_sources`; WebFetch for four pages. No Hostaway call. |
| Decision and reason | Ship one change set on one URL: replace the template copy with approved, checkable claims and a snippet that states the offer. It removes excluded claims that are live today, costs nothing to reverse, and targets the only owner queries where Seascape already holds a first-page average position. |
| Recommendation | Rewrite the `airbnb-management-services-sarasota` entry in `src/_data/seoPages.json`; add the page-ledger entry; update the pSEO triage note that asked for this SERP capture. |

## Draft copy rules

- Every Seascape claim maps to owner-offer section 7 or to wording already published on `/property-management/`: pricing as a share of net rent quoted after a review with the basis in writing; the one-page review, usually within 48 hours; Sawyer and Patrick answer the phone and Patrick sets pricing; listing on Airbnb, Vrbo and the direct-booking site with one connected calendar; guest screening and replies by a local person; cleaning and maintenance coordination; payments, taxes, monthly payout and monthly statement.
- Third-party facts carry their source in the sentence: Airbnb's 15.5% single-fee host fee ("check its pricing page for current terms"); the City of Sarasota certificate, described as applying to some homes in residential zones, with the reader sent to the city for their address. The copy does not describe the city's fees, minimum stay, occupancy limit or exemptions, so a city change cannot make the page wrong.
- The Superhost FAQ is unchanged; it was corrected in an earlier sweep.

## Source Files Changed In This Batch

  - `src/_data/seoPages.json` (the `airbnb-management-services-sarasota` owner entry only)
  - `docs/status/page-ledger.json` (ledger entry for this change)
  - `scripts/seo/generate-pseo-triage.js` and `docs/portfolio/pseo-inventory-triage.md` (triage note follows the completed SERP capture)
  - `tests/visual/__screenshots__/*/visual.spec.js/owner-airbnb-management-sarasota.png` (baseline follows the new words, refreshed by the baseline workflow)

  - follow-on design change: `src/property-management/property-management.njk` and `src/css/owner-lander.css` (Waterline layout for every generated owner lander), `scripts/enforcement/waterline-tokens.test.js` (ledger row for the new stylesheet), `DESIGN.md` The template's own reader text is limited to the approved owner offer in `seascape-hub/context/owner-offer.md` (free one-page review, usually within 48 hours, and the three things it returns), a caption naming the pictured managed home and its city, and the shorter header label "For owners" on the two quarantined pages so the header fits a phone.

## Required Internal Link Map

- src/property-management/property-management.njk: /property-management/, /property-management/vacation-rental-management-fees-florida/, /property-management/switch-vacation-rental-management-company/

## Boundary Proof

Must not break: the route, canonical, form fields and tracking on the page; the unchanged Superhost FAQ; FAQ markup parity; every other `seoPages` entry (the diff touches one entry). Must not appear: any claim owner-offer section 7 excludes. Check from a source other than the new copy: `OWNER_EXCLUDED_CLAIM_PATTERNS` in `scripts/enforcement/content-voice.test.js`, which encodes section 7. Observed failing against a wrong variant on 2026-11-10: with "hands-off management" added to this entry's intro, `node --test scripts/enforcement/content-voice.test.js` failed with `airbnb-management-services-sarasota: owner copy makes an excluded performance claim ("hands-off")`; with the shipped copy it passes.

Voice and specificity pass (2026-11-10): an independent Voice Editor read the entry three times. Round one asked for eight changes (city-rule detail that read as legal advice, an implied overnight-coverage promise, "every" in the proof title, a guaranteed-sounding 48 hours, an earnings implication, tone in the intro); round two asked for two more (the 48-hour wording beside the form, a repeated sentence). All were applied except the Patrick pricing sentence, which is the wording already published on `/property-management/`. Round three returned `Approved`.
