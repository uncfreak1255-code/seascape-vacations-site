# Brief: Category SEO Voice Research

## Why This Batch

- Seascape research and calculator pages just exposed a copy-quality problem: visible page intros can sound like internal methodology notes instead of useful guest or owner guidance.
- Local SERP research shows ranking pages win less through distinctive prose and more through predictable structure: exact-match headings, fast answer blocks, inventory/category modules, comparison tables, local proof, and decision-focused FAQs.
- This batch should turn current SERP patterns into a category structure guide and a Seascape translation layer. It should not rewrite live pages until the guide is accepted.

What should wait:

- sitewide article rewrites
- new SEO agent/persona files
- automated lint tooling
- calculator formula changes
- portfolio routing changes

## Search Operator Read

Guest-facing SERP sample, checked May 3, 2026:

- https://blucoastvacation.com/
- https://homes-and-villas.marriott.com/en/vacation-rentals/united-states/florida/bradenton
- https://www.airbnb.com/bradenton-fl/stays
- https://www.islandvacationproperties.com/
- https://annamariaisland.com/vacation-rentals
- https://www.annamaria.com/rentals/
- https://www.floridavacationhomes.com/gulf-coast/anna-maria-island/faq/
- https://www.airbnb.com/sarasota-fl/stays
- https://www.vacasa.com/usa/Florida/Sarasota/
- https://www.kayak.com/Sarasota-Vacation-Rentals.35451.rental.ksp
- https://www.emeraldcoastbyowner.com/florida/sarasota
- https://ww2.aaa.com/tripcanvas/article/bradenton-travel-guide-CM1489

Owner-acquisition SERP sample, checked May 3, 2026:

- https://anchordownmanagement.com/vacation-rental-management-pricing/
- https://www.beanpointproperty.com/
- https://www.aparadiserentals.com/property-management/
- https://www.choosegulfcoast.com/vacation-rentals-management
- https://www.amilocals.com/property-management/
- https://www.checkinandco.com/
- https://evolve.com/owner/vacation-rental-management
- https://www.vacasa.com/homeowner-guides/vacation-rental-management-fees
- https://www.fvh.com/anna-maria-island-property-management/
- https://www.itrip.net/property-management/sarasota-bradenton
- https://weekendermanagement.com/pricing/
- https://thefullerproperties.com/blog/owning-a-vacation-rental-on-anna-maria-island-rules-and-returns

Local proof sources to prefer over unsourced competitor claims:

- https://www.bradentongulfislands.com/gulf-islands-ferry/
- https://www.sarasotafl.gov/Department-Pages/Development-Services/Vacation-Rental-Registration-and-Compliance
- https://www.bradentonfl.gov/index.asp?SEC=%7BB931C314-E8E1-481C-90E8-3EFD25B83D7F%7D&pri=0
- https://annamariaislandchamber.org/island-trolley/

## Cluster In Scope

This is a research and voice-structure batch, not a page-build batch.

Canonical working artifact:

- `docs/briefs/2026-05-category-seo-voice-research.md`

Likely future style destinations after human review:

- `docs/style/voice.md`
- `docs/style/approved-examples.md`
- `docs/style/banned-patterns.md`
- `docs/process/before-user-review-checklist.md`

Money destinations this guide should protect:

- guest stay pages under `src/stays/`
- guest planning guides under `src/guides/`
- research assets under `src/research/`
- owner pages under `src/property-management/`

## Category Structure Guide

Guest SEO mode should use this pattern:

- exact-match H1
- first paragraph answers the visitor's decision, tradeoff, or anxiety
- short answer block near the top
- booking/search, property cards, or category paths above the fold when the page is a stay page
- comparison table when the query is comparative or financial
- local proof block below the reader-facing hook
- FAQ block around real traveler decisions: area choice, costs, beach access, traffic, parking, pets, pools, minimum stays, direct booking, and booking fees
- internal links to the strongest stay or guide destination, not generic browsing dead ends

Owner acquisition mode should use this pattern:

- H1 or hero copy names the owner problem, not just the service category
- first paragraph frames the economic leak: fee drag, OTA dependence, underpricing, weak operations, switching risk, or hidden costs
- proof appears early as owner net, direct-booking mix, fee-stack example, market comparison, or operator process
- service matrix compares Seascape against self-management, OTA-only management, national managers, and generic local full-service managers
- local trust proof is measurable: homes served, corridor coverage, vendor control, revenue review method, owner reporting, and actual proof assets
- CTA names the desired owner outcome: revenue review, fee-stack review, or sample owner review

## Intro Patterns

Use:

- "See what a Gulf Coast beach trip really costs before you book."
- "Bradenton usually makes more sense when you want AMI access without AMI pricing."
- "If your rental calendar is busy but the owner payout feels thin, the leak is usually in pricing, channel mix, or fee structure."

Avoid:

- "This page uses accepted formulas..."
- "The calculator keeps lodging separate..."
- "This source-bounded guide..."
- "Our methodology analyzes..."
- "Marketplace-fee exposure..."

Rule: the first visible paragraph should sound like a person helping the reader make a decision. Methodology and proof boundaries belong in a source/proof box below the hook.

## Table And Comparison Expectations

Use tables for:

- Bradenton vs Sarasota vs Anna Maria Island cost
- area fit by traveler type
- booking fee exposure by channel
- seasonal ADR or lodging spread
- owner fee-stack comparisons
- self-management vs local manager vs national manager

Do not use tables for:

- scenic filler
- generic amenity lists that should be filters or property cards
- unsupported claims where no source/proof boundary exists

## Internal-Link Expectations

Guest pages should link toward:

- relevant stay collection
- strongest area comparison guide
- cost calculator or cost index when price anxiety is the intent
- direct-booking explainer only when fee savings are actually relevant

Owner pages should link toward:

- `/property-management/`
- `/property-management/vacation-rental-management-fees-florida/`
- `/property-management/maximize-vacation-rental-income-florida/`
- `/research/owner-fee-revenue-leak-benchmark-2026/`
- local owner pages only when the geography is truly relevant

## CTA Pattern

Guest CTAs:

- "Compare stays"
- "Check direct booking options"
- "See homes near AMI"
- "Estimate your trip cost"

Owner CTAs:

- "Request a revenue review"
- "Compare your fee stack"
- "Ask for a sample owner review"
- "Review my property's booking mix"

Avoid:

- generic "Contact us" as the only CTA
- giant CTA blocks before useful content
- asking for trust before showing the decision logic

## Source And Proof Constraints

- Cost claims must tie to Seascape booking data, an approved research asset, or named current public sources.
- Transportation, ferry, trolley, parking, local rules, and registration claims must be checked against official local sources before publication.
- Review-count, inventory-count, direct-booking, and owner-revenue claims must come from approved proof assets or current source truth.
- Do not reuse competitor claims as fact unless independently sourced.
- Do not imply live local conditions after storms, schedule changes, or regulation updates unless the source was checked for the publication date.

## Page Builder Tasks

No page-source tasks are approved by this brief yet.

Possible next batch after review:

- add approved example pairs to `docs/style/approved-examples.md`
- add a page-family voice matrix to `docs/style/voice.md`
- add or tighten dull-copy phrases in `docs/style/banned-patterns.md`
- update the user-review checklist with a category-voice QA step

## Voice Editor Checklist

Flag visible copy that:

- opens with methodology instead of the reader's problem
- sounds like an internal project note
- says "source-bounded," "accepted formulas," "proof boundaries," "marketplace-fee exposure," "planning math," or "keeps X separate"
- uses tourism-board filler instead of route, timing, price, area, or trip-fit details
- turns owner pages into service laundry lists
- uses proof numbers without a nearby source boundary
- says "local" without showing what local execution changes

## Release Gate Checklist

For this brief-only batch:

- `git diff --stat origin/main...HEAD`
- `npm run git:merge-check` if the branch later touches source or process docs

For any future page rewrite batch:

- rebuild the site
- open every changed route locally or on a deploy preview
- check desktop and mobile screenshots for visible content and CTA hierarchy
- verify structured data when schema changes
- verify changed source/proof claims against approved assets

## Done When

- The brief gives Search Operator, SEO Architect, Page Builder, and Voice Editor one shared category structure.
- It separates guest SEO mode from owner acquisition mode.
- It identifies what Google/category pages reward structurally without copying competitor prose.
- It names proof boundaries and banned gray-copy patterns.
- It leaves live page rewrites for a later accepted batch.

## Post-Reread Outcome

- Not applicable yet. This is a pre-build research brief.

## Not In Scope

- adding new `.claude/agents/` roles
- editing calculator formulas
- rewriting existing pages
- changing page-family canonical routing
- creating automated SERP scraping
- adding a content linter before the style guide is accepted
