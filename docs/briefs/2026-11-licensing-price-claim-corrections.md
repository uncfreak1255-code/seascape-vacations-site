# Brief: Correct unsupported licensing and price claims

- lifecycle: active
- task scope: Sawyer's November 3 approval to remove proposed Manatee rental requirements presented as law, unsupported fixed savings/prices, and stale current portfolio counts; preserve existing corrections and held guides
- completion or successor: local proof, reviewed source release and scheduled production readback remain required; public issue creation was denied by automatic approval review

## Content Gate Inputs

- persona: owner checking rental requirements and guest comparing a Gulf Coast stay
- primary keyword: none; factual repair on existing pages
- secondary keywords: none; no search expansion
- audience pattern: readers and assistants may repeat a quoted permit requirement or fixed price as current fact
- proof source: current source 0cb3d0f8; Florida DBPR vacation-rental licensing guide and Manatee County Tax Collector tourist-tax guidance, read November 3, 2026; current canonical portfolio data; source audit and frozen production HTML in local claim-corrections artifacts
- offer claim: seascape-hub/context/owner-offer.md sections 4 and 7: a small local collection, real homes, and the existing property-specific review; no licensing guarantee, universal fee or savings promise
- required internal links: /property-management/, /properties/
- CTA target: existing owner inquiry and property/stay destinations; no routing or tracking changes
- anti-claims: no proposed county STR permit, fee, approval timeline or occupancy formula as adopted law; no automatic insurance/tax consequence; no fixed savings, new rate, permanent portfolio count, new legal promise or commercial-lift claim

## Current Evidence And Scope

The owner hub already derives its count from `properties | length`; keep that
implementation. The direct-booking and cost guides already require the same
home, dates, guests and complete checkout total; keep that guidance. The only
remaining published quoted $300-600 range is a fishing activity label. Retired
cost and best-time variants have `permalink: false` and stay untouched, as do
all held guide families. Historical research sample sizes are not current
inventory counts and remain unchanged.

The licensing FAQs in `seoPages.owner` still conflate tourist-tax registration
with an STR permit, quote county fees/processing times and a universal occupancy
formula, and assert automatic tax/insurance outcomes. Replace those assertions
with the adopted state/tax sources and address-specific checks. Do not claim a
county proposal has been adopted or that a newly drafted legal conclusion has
been approved by counsel.

## Boundary Proof Written Before Source Edits

Must not break: titles, descriptions, canonical/robots/OG/Twitter fields,
routes, existing CTA href/tracking tuples, booking/contact behavior, held-guide
sources/output, original layout, and FAQ/schema parity. Non-licensing data
entries must remain identical. No schedules, paid calls or provider writes.

Acceptance comes from Sawyer's three corrections and the old source. A focused
regression check must fail on the original licensing fee/timeline/occupancy
assertions and unsupported activity-price label, then pass on the repair.
Existing portfolio-count and unsupported-savings tests cover the already-fixed
claim families. Compare rendered metadata and original links to frozen
production HTML, inspect desktop/phone, then run the native release gate.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Existing Florida rental-licensing and Bradenton activities pages; no new target query |
| Searcher intent | Owner compliance and guest planning |
| Current Seascape URL | /property-management/vacation-rental-licensing-florida/ and /guides/things-to-do-bradenton-fl/ |
| SERP observed date | 2026-11-03 |
| SERP stale after | 2026-11-10 |
| Current proof | November 3 source audit at 0cb3d0f8 confirms unsupported licensing FAQs and activity-price label; no analytics or lift claim |
| Top visible competitors | Official Florida DBPR licensing guide and Manatee Tax Collector tourist-tax guidance are the authorities for this correction |
| Competitor angle | DBPR explains state licensing; Tax Collector explains tax registration and separate city contacts |
| Visual/format gap | None; retain the existing FAQ and activity label structures |
| Seascape gap | Tax registration is presented as rental permission, with unsupported fees, timelines and occupancy limits |
| Search fit | Preserve these existing URLs, their intent and their current management/property destinations; factual repair only |
| Local/GBP proof | Not a GBP change; verify the property's actual jurisdiction with the responsible agency |
| AEO/readback note | FAQ and generated schema must agree; no AI mention or citation check is authorized |
| Recommendation | Correct the remaining assertions and verify existing savings/count fixes without rewriting them |
| Attack status | completed |
| Query variants inspected | Manatee County proposed short-term rental registration; DBPR vacation rental licensing; Manatee tourist-tax registration |
| SERP source | Public web search November 3; official DBPR and Tax Collector pages read |
| Competitor URLs inspected | https://www2.myfloridalicense.com/hotels-restaurants/licensing/vrtsp-guide/ ; https://www.taxcollector.com/services/tourist-tax/tourist-tax.cfm |
| Content gap and Seascape answer | State licensing, tax registration and adopted local permission are separate checks; current quotes replace unsupported fixed prices |
| Design/format strategy | Text-only changes; no new component, CSS or layout |
| Seascape proof available | Canonical portfolio and current generated count; existing correct same-home/date/guest/total comparison guidance |
| Tools/plugins used | Source/Git reads, official web sources, native content/release checks and isolated rendered QA; no paid research |
| Decision and reason | Remove only remaining unsupported claims; current corrections do not need another rewrite |

## Source Files Likely To Change

- src/_data/seoPages.json: licensing owner entry only
- src/guides/things-to-do-bradenton-fl.html: fishing-price label only
- scripts/enforcement/licensing-price-claims.test.js: focused regression proof

## Release And Readback

Draft the copy, remove internal wording, check voice and specificity; one
independent targeted reviewer must approve voice/source consistency. Required
pre-PR bug review, issue-only spec review, final-head native review and CI remain
in force. Run `npm run verify:release -- --range origin/main`, the focused
regression check and rendered preservation proof. No new growth experiment.

Source approval covers normal review/merge and the scheduled 09:05 UTC
publication, not an early publish. After deployment, require containing
production ancestry, actual ready Netlify published identity, affected live
pages and native post-deploy checks. Use a reviewed revert through the same
release lane if the correction breaks a required contract. Commercial results
remain unmeasured.

## Local Coverage Proof, November 3

The built-public-surface audit examined all 164 generated HTML files (reader
text, metadata and JSON-LD) for the named percentages, $300-600 range, nightly
rate ranges and weekly savings estimates. It detected all four planted wrong
examples and found zero matching published claims after the repair. Both
retired price-bearing guide variants remain absent from built output. Existing
owner counts are derived from canonical property data; no count rewrite or
historical sample change is required. Direct-booking and cost guides already
contain the same-home/date/guest/complete-total instructions. Underlying local
record: `claim-corrections/published-claims-audit.json`; this is bounded claim
coverage, not a price audit or commercial-outcome proof. Focused regression
checks pass 2/2 after both failed against the original source; native release
passes all 1350 tests and all release checks.
