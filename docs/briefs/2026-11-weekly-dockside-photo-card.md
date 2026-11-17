# Brief: Weekly Florida guide photo-card A

- lifecycle: active
- task scope: Sawyer-approved A photo-card design for the existing /stays/week-long-vacation-rentals-florida/ only, approved 2026-11-17 in Aside task fJTJMsoXwFLlzJ3w. No merge or deployment approval.
- persona: A guest comparing a week-long Gulf Coast rental for their group.
- primary keyword: weekly Florida vacation rentals
- secondary keywords: Florida weekly pool homes; Bradenton weekly vacation rentals
- audience pattern: Compare a real home and group capacity, select dates and guests, then inspect current direct-booking availability and total.
- proof source: Current property catalog and Dockside property page checked 2026-11-17; catalog-bound four bedrooms and twelve guests, pool/spa/dock, verified real dusk photograph. Parent fetched Hub origin/main property canon the same day.
- required internal links: /properties/dockside-dreams/, /properties/, /guides/
- CTA target: https://book.seascape-vacations.com/listings/206016 with selected start, end and numberOfGuests, using the existing tracked booking handoff.
- anti-claims: No guaranteed availability, weekly discount, savings, conversion lift, beachfront position, new amenities or invented rates. No booking or payment submission on this page.
- hypothesis: Connecting a named real-home photograph with date and guest selection may make the next booking step clearer; no lift is measured.
- primary event: guide_property_check_dates_click on the outbound direct listing action, with existing booking_engine_handoff and guide lineage.
- guardrail event: Lost trip parameters, party silently reduced, incorrect listing, invalid dates, misleading availability or accessibility regression.
- entry criteria: Approved rendered A direction, current property source, focused regression tests and independent rendered review.
- readback window: Technical verification before PR; Analytics can define an outcome window only after the actual deployment boundary.
- decision rule: Keep source-correct, accessible behavior; do not infer booking lift from screenshots or synthetic clicks.

## Gate 0 Search And Attack Receipt

| Field | Read |
| --- | --- |
| Target query family | weekly Florida vacation rentals; Florida weekly pool homes; Bradenton weekly vacation rentals |
| Searcher intent | Compare a real rental for a week and check dates and group fit. |
| Current Seascape URL | https://seascape-vacations.com/stays/week-long-vacation-rentals-florida/ |
| SERP observed date | 2026-11-17 |
| SERP stale after | 2026-11-24 |
| Current proof | Live page and Dockside property inspected 2026-11-17; approved local rendered A/B study in Aside task fJTJMsoXwFLlzJ3w, not analytics proof. |
| Top visible competitors | FloridaRentals, Airbnb and Owner Direct appeared in free public search results; discovery examples, not measured rank order or a top-three claim. |
| Competitor angle | FloridaRentals shows photos, sleeps/bed/bath, weekly rates, filters and detail links. Airbnb shows photo-led home cards, reviews and FAQs. |
| Visual/format gap | A real named home and its next booking action can occupy the hero instead of an anonymous background photograph. |
| Seascape gap | Existing hero does not connect its photograph to a named home or a property-specific date selector. |
| Search fit | Improve this existing weekly-stay URL, retaining title, metadata, canonical, inventory, original answers and schema; conversion goes to the named direct listing. |
| Local/GBP proof | No profile edits or local ranking claims; Bradenton location comes from current Dockside catalog/property source. |
| AEO/readback note | No citation or AI lift claim. Existing original guide body, FAQ answers and structured data remain available. |
| Recommendation | Implement approved photo-card A, native date/guest dialog, original-answer accordion and specific intro heading on this route only. |
| Attack status | completed |
| Query variants inspected | weekly Florida vacation rentals; Florida weekly pool homes; Bradenton weekly vacation rentals |
| SERP source | Free public websearch on 2026-11-17, parent receipts NXXMPSwNxewYlVpZe2Vxo, sRdEC7JrvVJnHziMAoNWt, RpKZajZ8RUezLtmv2-UMz; no paid research. |
| Competitor URLs inspected | https://www.floridarentals.com/southwest/bradenton-vacation-rentals/weekly/ ; https://www.airbnb.com/bradenton-fl/stays |
| Content gap and Seascape answer | Show actual Dockside dusk photo, catalog-bound group facts, selected dates and guests, and a clear onward listing action. |
| Design/format strategy | Approved split editorial copy plus rounded shallow-tilt photo card; reference BeUI interaction as inspected in Studio, rewritten with Waterline tokens. |
| Seascape proof available | Actual home photograph and existing verified property inventory, named direct listing and trip contract. |
| Tools/plugins used | Free websearch/webfetch, current git source, native Studio inspection, local rendered A/B study and independent critic. |
| Decision and reason | Bounded implementation of Sawyer-approved existing-route design; no SEO expansion, title/meta rewrite, experimental rollout or outcome claim. |

## Source files likely to change

- `DESIGN.md`, `docs/design/weekly-photo-card.md`
- `src/stays/stays.njk`, `src/_data/staysPages.js`
- `src/_includes/partials/stay-main-hero.njk`, `src/_includes/partials/stay-weekly-hero.njk`, `src/_includes/partials/stay-weekly-booking.njk`, `src/_includes/partials/stay-faq-section.njk`
- `src/css/stay-weekly.css`, `src/assets/js/stay-weekly.js`
- Focused unit and Playwright tests; no new weekly baseline or threshold changes. Shared prerequisite: reuse the already committed mobile-home baseline from PR #971, as documented below.

## Editorial and design receipt

1. **Draft the copy**: use approved A hero and specific intro heading; original FAQ answers stay unchanged.
2. **Remove internal wording**: no preview controls, Studio/vendor names or prototype disclosures ship in guest copy.
3. **Check voice and specificity**: name the real home and selection action, preserve availability and full-total qualifications beside booking.

Independent concept critic returned Approved with edge, favoring A over B; small labels, control corners and trip-preserving exploration links were corrected in the approved preview. Independent Voice Editor: Pass on 2026-11-17 after clarifying the 12-person limit and larger-group comparison path. Independent built-source critic: Approved on 2026-11-17 at desktop and 390px, including booking-sheet, intro and FAQ evidence. Direct listing submission was tested only with interception; no real booking was made. The full visual and performance gates remain required before PR publication; physical-device and screen-reader checks remain unverified. Concept screenshots are not production evidence.

## Not in scope

Other guides, SEO expansion, prices or policies, shared header/footer changes, new tracking definitions, new dependencies, merges, production publishing or booking submissions.

## Shared test-fixture prerequisite

The full visual suite found one existing failure on the untouched base 4c542004: mobile homepage expected 393×4460 (old carousel), actual 393×7776 (the vertical list already merged in PR #965). Candidate and untouched-base tests failed with the same 1,391,046-pixel diff. PR #971 commit 6ad104e8b8a98d8b3762293f8d756fef1f1467f8 already commits the correct 393×7776 fixture, produced in commit ea7b0d00 by the repository update-visual-baselines workflow. Its decoded pixels exactly match the candidate capture. This branch reuses only that committed test fixture, without regenerating, editing, raising tolerances, changing homepage source or importing PR #971's restaurant changes. The fixture file overlap is intentional and identical in both branches. Re-run the whole visual suite after import.

## Review follow-up

Codex P2 on initial head 8aec14ab identified unsupported incoming party counts above the static selector's 17 options. The fix preserves the exact sanitized incoming safe-integer count as an explicitly labeled comparison-only option, rather than silently reducing it; a required selector and positive safe-integer guard fail closed on an empty/invalid value. Desktop/mobile regression cases cover 18, 99 and the largest safe integer, preserving the group and date range in the comparison URL and asserting no outbound booking navigation. The approved normal-party visual direction is unchanged.

The larger-group phone state also keeps its comparison action at the documented 44px target floor; the pre-fix rendered link was 21px high. A browser assertion now checks the actual bounding box. Normal-party layout is unchanged.
