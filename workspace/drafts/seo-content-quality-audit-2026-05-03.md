# SEO Content Quality Audit - 2026-05-03

Scope: `src/guides/`, `src/research/`, `src/property-management/`, `src/stays/`, `src/_data/seoPages.json`, `docs/portfolio/`, and `docs/style/`.

This is a draft audit. It does not change live page source or agent role files.

## Verdict

Do not create a new standing content-writer agent yet. The site already has the right role split in `.claude/agents/voice-editor.md`, `.claude/agents/seo-architect.md`, and `docs/style/voice.md`.

The content problem is narrower:

- canonical duplicates need cleanup before new article production
- several pages read like older generic SEO output or thin programmatic copy
- stay-page JSON still contains banned phrasing from `docs/style/banned-patterns.md`
- proof-heavy claims need source checks before a rewrite wave
- guest SEO and owner acquisition need two different writing modes

## External Pattern Read

Live SERP/category sources checked:

- `https://annamariacartrentals.com/anna-maria-island-vacation-rentals-guide/`
- `https://www.amilocals.com/about-us/the-ami-locals-experience/`
- `https://annamariarentals.com/property-management/`
- `https://primevacations.com/property-management/`
- search results for Bradenton vacation rentals, AMI vacation rentals, Sarasota short-term rental tips, and AMI property management

Category pattern:

- top guest pages answer location choice fast, then explain town-by-town tradeoffs
- strong pages use simple H2 blocks: what makes the area different, where to stay, rental fit, transportation, planning tips, CTA
- comparison pages need a quick answer, table, category-by-category breakdown, and clear final recommendation
- owner pages generally lead with local operation, revenue management, direct booking, property care, owner portal/reporting, and a revenue projection CTA
- weak competitor pages rely on elevated/coastal/luxury language; Seascape should use harder economics and sharper local tradeoff logic instead

## Recommended Style Guide

### Guest SEO Mode

Use for `src/guides/`, `src/research/` when the reader is planning a trip, and `src/_data/seoPages.json.vacationer`.

- answer the query in the first 1-2 paragraphs
- state who should choose the place, who should not, and what the tradeoff is
- use tables for location, cost, season, airport, family, and activity comparisons
- use local specifics: bridge, parking, beach access, drive time, minimum-stay friction, group size, pool/dock value
- keep CTAs practical: browse direct homes, check direct dates, compare nearby homes, read the linked guide
- avoid travel-magazine language unless it is directly tied to a decision

### Owner Acquisition Mode

Use for `src/property-management/`, owner entries in `src/_data/seoPages.json`, owner research, and market/income pages.

- lead with owner economics, not hospitality adjectives
- name the leak: fee drag, stale pricing, OTA dependence, weak direct-booking capture, turnover quality, compliance risk
- use proof modules from approved owner assets, not invented one-off stats
- make the CTA a revenue review or manager-switch diagnosis
- avoid sounding like a national franchise page with "full-service care" and "five-star hospitality" as the main argument

## Content Template

### Guest Guide Template

1. Quick answer: the decision in 60-120 words.
2. Comparison table when there are multiple options.
3. Practical sections: cost, drive time, beach access, parking, best fit, worst fit.
4. Local caveat: what most visitors misunderstand.
5. Internal links: one money stay page plus 2-4 supporting guide links.
6. CTA: direct booking or browse homes, not a generic contact pitch.
7. FAQ: only questions that help search intent or conversion.

### Owner Page Template

1. Owner problem: what is leaking money or creating risk.
2. Local proof: market, portfolio, or operations fact with source.
3. Economics block: rates, channel mix, booking window, fees, or direct-book math.
4. Service proof: pricing, marketing, guest screening, turnover, maintenance, reporting.
5. Objection handling: switching managers, self-management, platform dependence.
6. CTA: request revenue review.
7. FAQ: compliance, fees, onboarding, timing, and owner-control questions.

## Claims And Proof Boundaries

Needs proof/source check before reuse:

- any 10-15%, 10-20%, 30-40%, 16%, or dollar-savings claim
- "545 bookings" research claims
- "5 homes", "$1.4M", "$119,923", ADR/occupancy/revenue claims
- airport fare ranges and rental-car cost ranges
- "top-rated", "best", "guaranteed sightings", "premier", or ranking language
- waterfront, dock, beachfront, near-island, private pool, sleep-count, and accessibility claims

Use one approved proof asset when the same claim appears across multiple pages.

## Do Not Sound Like This

Avoid:

- "escape to paradise"
- "hidden gem"
- "elevate your vacation"
- "curated interiors/itineraries"
- "seamless operations"
- "full-service property management" without the economic leak
- "something for everyone"
- "Old Florida charm" unless it supports a concrete choice
- generic "local expertise" without naming what the local operator knows

## Source Page Audit

Legend: Mode = `guest SEO` or `owner acquisition`. Status = `keep`, `rewrite`, `merge/canonicalize`, `retire/redirect`, or `proof check`.

| Page | Mode | Status | Notes |
| --- | --- | --- | --- |
| `src/guides/2026-bradenton-vacation-rental-market-analysis.html` | owner acquisition | keep + proof check | Strong table-driven owner economics page; verify pricing/occupancy claims before broader reuse. |
| `src/guides/anna-maria-city.html` | guest SEO | keep | Good local area page; keep practical town/beach framing. |
| `src/guides/anna-maria-island-area-guide/index.html` | guest SEO | rewrite | Has useful structure, but still uses paradise/pristine/generic destination language. |
| `src/guides/anna-maria-island-beaches.html` | guest SEO | keep | Useful beach breakdown; ensure local claims and pet/beach rules stay current. |
| `src/guides/anna-maria-island-noise-ordinance-guide.html` | guest SEO | keep + proof check | Useful compliance topic; verify ordinance details and fines. |
| `src/guides/anna-maria-island-vacation-cost-guide-2026/index.html` | guest SEO | merge/canonicalize + proof check | Stronger long version; consolidate with older cost URL and verify all dollar ranges. |
| `src/guides/anna-maria-island-vacation-cost.html` | guest SEO | merge/canonicalize | Shorter duplicate; should either redirect/feed the 2026 cost guide or become a tight summary. |
| `src/guides/anna-maria-island-vs-clearwater-beach.html` | guest SEO | proof check | Good comparison structure; remove "hidden gem" style language and verify cost ranges. |
| `src/guides/anna-maria-island-vs-longboat-key.html` | guest SEO | keep | Strong comparison-page fit. |
| `src/guides/anna-maria-island-vs-siesta-key.html` | guest SEO | keep + proof check | Portfolio already names it as winner; preserve and verify source claims. |
| `src/guides/anna-maria-island-weather.html` | guest SEO | keep + proof check | Useful monthly pattern; weather averages need source refresh. |
| `src/guides/best-restaurants-anna-maria-island.html` | guest SEO | proof check | Listicle claims need freshness and local-open status verification. |
| `src/guides/best-time-to-visit-anna-maria-island/index.html` | guest SEO | merge/canonicalize | Better URL shape than legacy duplicate; confirm canonical target. |
| `src/guides/best-time-visit-anna-maria-island.html` | guest SEO | merge/canonicalize | Duplicate of best-time page; use as alias/feed, not a second winner. |
| `src/guides/best-vacation-rental-companies-ami.html` | owner acquisition | proof check | Useful competitive page; "curated" and ranking methodology need cleanup/source discipline. |
| `src/guides/best-waterfront-restaurants-with-boat-dock.html` | guest SEO | proof check | Verify dock access, boat access, and current restaurant status. |
| `src/guides/booking-direct-vacation-rentals.html` | guest SEO | keep + proof check | Approved example; verify savings claims before repeated reuse. |
| `src/guides/bradenton-area-guide/index.html` | guest SEO | rewrite | Short and generic; includes paradise/hidden-gem phrasing. Needs practical trip-shape rewrite. |
| `src/guides/bradenton-beach-area-guide/index.html` | guest SEO | keep | Thin but serviceable town lander; can improve later if GSC shows demand. |
| `src/guides/bradenton-beach.html` | guest SEO | keep | Useful local page; verify pet/beach claims. |
| `src/guides/bradenton-insider-guide.html` | guest SEO | proof check | Good depth; several activity claims need current status/source check. |
| `src/guides/bradenton-vs-sarasota-beaches/index.html` | guest SEO | proof check | Good comparison format; remove generic paradise phrasing and verify beach details. |
| `src/guides/bradenton-vs-sarasota-cost-of-living/index.html` | guest SEO | proof check | Data-heavy comparison; verify 2026 cost figures. |
| `src/guides/bradenton-vs-sarasota-for-families/index.html` | guest SEO | keep | Strong trip-shape query page. |
| `src/guides/bradenton-vs-sarasota-restaurants/index.html` | guest SEO | proof check | Verify restaurants and open status before ranking language. |
| `src/guides/bradenton-vs-sarasota-retirement/index.html` | guest SEO | proof check | Strong structure; healthcare/cost claims need source verification. |
| `src/guides/bradenton-vs-sarasota.html` | guest SEO | keep + proof check | Approved example and portfolio winner; protect as canonical hub. |
| `src/guides/bradenton-vs-tampa-vacation-rentals.html` | guest SEO | keep + proof check | Good practical value framing; verify savings/distance claims. |
| `src/guides/do-you-need-a-car-anna-maria-island.html` | guest SEO | keep + proof check | Good query fit; remove paradise language and verify trolley/golf-cart rules. |
| `src/guides/dolphins-manatees-bradenton.html` | guest SEO | proof check | Wildlife claim freshness matters; verify seasonality and tour details. |
| `src/guides/family-vacation-anna-maria-island.html` | guest SEO | keep | Portfolio names it as a canonical family guide. |
| `src/guides/fishing-guide-anna-maria-sarasota.html` | guest SEO | proof check | Verify seasons/species/charter claims. |
| `src/guides/flights-to-anna-maria-island/index.html` | guest SEO | proof check | Strong query page; fare/airport claims need current source check. |
| `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html` | owner acquisition | proof check | Useful owner feeder; verify data source and date. |
| `src/guides/holmes-beach-area-guide/index.html` | guest SEO | keep | Thin but clear town lander; no urgent rewrite without GSC trigger. |
| `src/guides/holmes-beach-vs-bradenton-beach.html` | guest SEO | keep | Solid comparison format. |
| `src/guides/holmes-beach.html` | guest SEO | keep | Useful local page; verify rules and access points. |
| `src/guides/how-to-get-to-anna-maria-island.html` | guest SEO | proof check | Transportation rules/routes need freshness. |
| `src/guides/hurricane-preparedness-florida-vacation.html` | guest SEO | rewrite + proof check | Too thin for the risk topic; needs official-source policy and booking guidance. |
| `src/guides/index.njk` | guest SEO | keep | Collection hub, not a full article. |
| `src/guides/is-anna-maria-island-worth-visiting.html` | guest SEO | keep | Good decision-query fit; remove generic language if touched. |
| `src/guides/longboat-key-area-guide/index.html` | guest SEO | keep | Thin but acceptable as a feeder. |
| `src/guides/pet-friendly-anna-maria-island.html` | guest SEO | proof check | Pet/beach rules must be verified before promotion. |
| `src/guides/rainy-day-activities-bradenton-sarasota.html` | guest SEO | proof check | Verify venues and current names. |
| `src/guides/sarasota-area-guide/index.html` | guest SEO | keep | Thin but clear feeder; rewrite only if GSC demand appears. |
| `src/guides/shelling-guide-florida.html` | guest SEO | proof check | Verify beach/shelling claims and rule sensitivity. |
| `src/guides/siesta-key-area-guide/index.html` | guest SEO | proof check | Verify TripAdvisor/ranking claim. |
| `src/guides/siesta-key-beach-guide.html` | guest SEO | proof check | Strong page but needs current source checks. |
| `src/guides/siesta-key-vs-anna-maria-island-families.html` | guest SEO | keep | Good family comparison fit. |
| `src/guides/snowbirds-guide-extended-stays-florida.html` | guest SEO | keep | Good topic; verify monthly/minimum-stay statements if expanded. |
| `src/guides/spring-break-activities-bradenton-anna-maria-island/index.html` | guest SEO | proof check | Year-specific activities need refresh before 2026 promotion. |
| `src/guides/srq-airport-to-anna-maria-island.html` | guest SEO | proof check | Verify routes, costs, and transportation availability. |
| `src/guides/things-to-do-bradenton-fl.html` | guest SEO | proof check | Deep page but needs current venue/status review; contains generic language. |
| `src/guides/vacation-rental-income-anna-maria.html` | owner acquisition | proof check | Owner economics page; verify revenue ranges before reuse. |
| `src/guides/where-to-stay-near-anna-maria-island/index.html` | guest SEO | rewrite | Important page but contains paradise/hidden-gem language and needs sharper trip-shape logic. |
| `src/research/gulf-coast-vacation-booking-trends-2026.njk` | owner acquisition | keep + proof check | Strong original-data asset; preserve, but source the 545-booking proof. |
| `src/research/index.njk` | guest SEO | keep | Collection page. |
| `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk` | guest SEO | proof check | Strong cost page; all price claims need source discipline. |
| `src/property-management/index.njk` | owner acquisition | keep + proof check | Approved example; strongest owner page. Verify shared proof metrics. |
| `src/property-management/property-management.njk` | owner acquisition | retire/redirect | Extremely thin duplicate shell; should redirect/feed canonical owner destination. |
| `src/stays/index.njk` | guest SEO | keep | Collection hub. |
| `src/stays/stays.njk` | guest SEO | keep | Template is okay; programmatic copy quality lives in `src/_data/seoPages.json`. |

## Programmatic Stay And Owner Pages

`src/_data/seoPages.json` feeds real stay and owner pages. It should be included in any rewrite pass even though the route source is data, not one HTML file per URL.

### Vacationer Entries

Classification:

- `keep`: the page can stay, but many entries are thin and should not be expanded without GSC demand.
- `rewrite`: contains banned phrasing or generic luxury copy.
- `merge/canonicalize`: aliases already documented in `docs/portfolio/stay-money-pages.md`.

| Slug | Status | Notes |
| --- | --- | --- |
| `anna-maria-island-homes-with-pool` | rewrite | Contains paradise language; important enough to sharpen. |
| `bradenton-waterfront-vacation-rentals` | keep + proof check | Verify dock/waterfront claims. |
| `bradenton-vacation-rentals-with-hot-tub` | keep | Thin but acceptable. |
| `large-group-vacation-rentals-bradenton` | keep | Good trip-shape fit. |
| `large-group-vacation-rentals-anna-maria-island` | keep | Good trip-shape fit. |
| `book-direct-anna-maria-island` | proof check | Savings claims need approved source. |
| `spring-break-rentals-anna-maria-island` | proof check | Year/season-specific claims need refresh. |
| `fishing-vacation-rentals-bradenton` | proof check | Dock/fishing claims need verification. |
| `romantic-getaway-anna-maria-island` | keep | No urgent issue. |
| `sarasota-vacation-rentals-with-pool` | keep | No urgent issue. |
| `downtown-sarasota-vacation-rentals` | keep | No urgent issue. |
| `siesta-key-area-vacation-rentals` | keep | Portfolio money page. |
| `sarasota-arts-culture-vacation-rentals` | keep | No urgent issue. |
| `florida-gulf-coast-vacation-rentals` | keep | Broad hub; only expand with evidence. |
| `pet-friendly-vacation-rentals-bradenton` | proof check | Pet rules/amenities need verification. |
| `family-vacation-rentals-anna-maria-island` | keep | Portfolio money page. |
| `snowbird-rentals-florida-gulf-coast` | rewrite | Contains paradise language. |
| `vacation-rentals-near-anna-maria-island` | keep | Useful near-island value page. |
| `luxury-vacation-rentals-sarasota` | rewrite | Contains curated/elevate language. |
| `vacation-rentals-with-pool-and-hot-tub` | keep | No urgent issue. |
| `beach-house-rentals-florida-gulf-coast` | proof check | Avoid implying true beachfront unless verified. |
| `bradenton-vacation-rentals-near-beaches` | keep | Portfolio money page. |
| `gulf-coast-vacation-homes-with-dock` | proof check | Dock claims need property mapping. |
| `vacation-rentals-sleeps-12-florida` | proof check | Sleep-count claims need property mapping. |
| `vacation-rentals-sleeps-16-florida` | proof check | Sleep-count claims need property mapping. |
| `4-bedroom-vacation-rentals-florida` | proof check | Bedroom count needs property mapping. |
| `5-bedroom-vacation-rentals-florida` | proof check | Bedroom count needs property mapping. |
| `summer-vacation-rentals-florida-gulf-coast` | keep | Thin seasonal page; rewrite only with GSC demand. |
| `winter-vacation-rentals-florida-gulf-coast` | keep | Thin seasonal page; rewrite only with GSC demand. |
| `holiday-vacation-rentals-anna-maria-island` | merge/canonicalize | Portfolio marks as retired alias of AMI stay page. |
| `new-years-eve-rentals-florida` | rewrite | Contains paradise language and likely seasonal proof gaps. |
| `golf-vacation-rentals-bradenton` | rewrite + proof check | Contains paradise language; verify course references. |
| `girl-trip-vacation-rentals-florida` | keep | Thin but acceptable. |
| `bachelor-bachelorette-rentals-florida` | keep | Thin but acceptable. |
| `family-reunion-rentals-florida` | keep | Thin but acceptable. |
| `birthday-celebration-rentals-florida` | rewrite | Contains paradise language. |
| `anniversary-trip-rentals-florida` | rewrite | Contains paradise language. |
| `retirement-celebration-rentals-florida` | rewrite | Contains paradise language. |
| `kayaking-vacation-rentals-bradenton` | proof check | Verify launch/access claims. |
| `dolphin-watching-vacation-rentals-florida` | proof check | Avoid guaranteed wildlife claims. |
| `beach-wedding-vacation-rentals-florida` | proof check | Event/wedding rules need verification. |
| `honeymoon-rentals-anna-maria-island` | rewrite | Contains paradise language. |
| `babymoon-vacation-rentals-florida` | keep | Thin but acceptable. |
| `multigenerational-vacation-rentals-florida` | keep | Good trip-shape fit. |
| `accessible-vacation-rentals-florida` | proof check | Accessibility claims need exact property proof. |
| `long-weekend-getaway-florida` | rewrite | Contains paradise language. |
| `week-long-vacation-rentals-florida` | rewrite | Contains paradise language. |
| `extended-stay-vacation-rentals-florida` | keep | Useful trip-shape fit. |
| `work-from-home-vacation-rentals-florida` | rewrite + proof check | Contains paradise language; verify workspace/WiFi claims. |
| `quiet-relaxing-vacation-rentals-florida` | keep | Thin but acceptable. |
| `last-minute-vacation-rentals-florida` | keep | Useful demand page. |
| `affordable-vacation-rentals-florida-gulf-coast` | keep | Useful value page. |
| `vacation-rentals-with-game-room` | proof check | Amenity mapping needed. |
| `vacation-rentals-with-fire-pit` | proof check | Amenity mapping needed. |
| `vacation-rentals-with-outdoor-grill` | proof check | Amenity mapping needed. |
| `bean-point-luxury-rentals` | proof check | Avoid overclaiming Bean Point proximity. |
| `vacation-rentals-near-restaurants-florida` | rewrite | Contains paradise/hidden-gem language. |
| `vacation-rentals-with-elevator` | proof check | Accessibility/elevator property mapping needed. |
| `canal-homes-with-boat-dock` | proof check | Dock/canal claims need property mapping. |
| `hurricane-preparedness-guide` | rewrite + proof check | Risk topic needs stronger official-source treatment. |
| `luxury-concierge-services` | rewrite | Contains elevate/curated/hidden-gem language. |
| `anna-maria-island-vacation-rentals` | keep | Portfolio money page. |
| `holmes-beach-vacation-rentals` | keep | Thin feeder. |
| `easter-vacation-rentals-florida-gulf-coast` | proof check | Seasonal page; verify event/date assumptions. |
| `anna-maria-island-beachfront-rentals` | proof check | Portfolio says near-island alternative, not true beachfront. Guard claims tightly. |

### Owner Entries

All owner entries are `owner acquisition` mode.

| Slug | Status | Notes |
| --- | --- | --- |
| `vacation-rental-management-anna-maria-island` | keep + proof check | Portfolio owner money page. |
| `vacation-rental-management-bradenton` | keep + proof check | Portfolio owner money page. |
| `maximize-vacation-rental-income-florida` | keep + proof check | Strong owner-economics bridge. |
| `vacation-rental-management-fees-florida` | keep + proof check | Portfolio owner page; verify fee ranges. |
| `switch-vacation-rental-management-company` | keep | Good switcher intent. |
| `airbnb-management-services-sarasota` | keep | Channel-specific owner intent. |
| `self-manage-vs-property-management-florida` | keep | Good decision query. |
| `vacation-rental-management-sarasota` | keep + proof check | Location owner page. |
| `vacation-rental-management-siesta-key` | keep + proof check | Location owner page. |
| `vacation-rental-management-longboat-key` | keep + proof check | Location owner page. |
| `condo-rental-management-florida` | proof check | Condo rules vary; verify before promotion. |
| `new-vacation-rental-owner-guide-florida` | proof check | Licensing/tax claims need official sources. |
| `switch-from-airbnb-self-manage` | keep | Good switcher intent. |
| `increase-vacation-rental-bookings` | proof check | Avoid generic marketing claims without proof. |
| `vacation-rental-pricing-strategy` | proof check | Pricing claims need source/portfolio evidence. |
| `vacation-rental-marketing-florida` | proof check | Marketing claims need specific Seascape proof. |
| `vacation-rental-cleaning-services-florida` | proof check | Operations claim needs service boundary. |
| `vacation-rental-maintenance-florida` | proof check | Operations claim needs service boundary. |
| `vacation-rental-guest-screening` | proof check | Policy and fair-housing risk; verify wording. |
| `vacation-rental-insurance-florida` | proof check | Legal/insurance topic; official-source check required. |
| `vacation-rental-taxes-florida` | proof check | Tax topic; official-source check required. |
| `vacation-rental-licensing-florida` | proof check | Licensing topic; official-source check required. |
| `vrbo-management-services-florida` | proof check | Channel claims need source and PMS/tool boundary. |
| `vacation-rental-photography-florida` | keep | Useful owner support page if service is real. |
| `vacation-rental-interior-design-florida` | proof check | Avoid promising design service unless operationally true. |
| `sell-vacation-rental-property-florida` | proof check | Real estate/legal sensitivity; verify scope. |
| `buy-vacation-rental-property-florida` | proof check | Real estate/legal sensitivity; verify scope. |

## Portfolio And Style Docs

| File | Status | Notes |
| --- | --- | --- |
| `docs/portfolio/README.md` | keep | Correct portfolio contract. |
| `docs/portfolio/winner-guides.md` | keep | Useful canonical map; update after duplicate cleanup. |
| `docs/portfolio/stay-money-pages.md` | keep | Strong stay-page routing and KPI contract. |
| `docs/portfolio/owner-acquisition.md` | keep | Strong owner routing and KPI contract. |
| `docs/style/voice.md` | keep | Already contains two-mode voice logic. |
| `docs/style/approved-examples.md` | keep | Correct examples; add one category-pattern example after first rewrite. |
| `docs/style/banned-patterns.md` | keep | Correct anti-sludge rules; enforce against `seoPages.json`. |

## Rewrite Queue

Do these before any new SEO batch:

1. `src/property-management/property-management.njk` - retire/redirect or make it a real canonical owner page.
2. Best-time duplicate pair - choose one canonical route and redirect/feed the other.
3. AMI vacation-cost duplicate pair - choose one canonical route and redirect/feed the other.
4. `src/_data/seoPages.json` banned-phrase cleanup - no agent role changes required.
5. `src/guides/hurricane-preparedness-florida-vacation.html` - rewrite with official-source weather/booking policy treatment.
6. `src/guides/bradenton-area-guide/index.html` - rewrite with practical Bradenton trip-shape logic.
7. `src/guides/where-to-stay-near-anna-maria-island/index.html` - rewrite around who should stay on island vs near island vs Sarasota/Bradenton.

## Agent Surface Recommendation

No new agent file.

If the next pass proves that the existing role cards miss something, patch existing files only:

- `voice-editor.md`: add category-pattern check, two-mode classification, and banned-phrase enforcement against `src/_data/seoPages.json`
- `seo-architect.md`: add duplicate/canonical check before any rewrite recommendation

That should happen after one rewrite/proof-check pass, not before.

## Verification Commands For The Next Patch

For this audit draft:

- `git diff --check`

For any actual content/source patch:

- `npm run git:preflight`
- `npm run verify:release`
- `npm run test`
- `npm run build:prod`
- `npm run git:merge-check`
