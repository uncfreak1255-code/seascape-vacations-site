# Brief: The Oasis for groups of 16

- lifecycle: active
- task scope: Sawyer-approved copy and booking button from #921, followed by the selected A design and live delivery in #923.
- persona: The person booking a Bradenton vacation home for a group of 16.
- primary keyword: large vacation rental that sleeps 16 near Bradenton
- secondary keywords: Bradenton vacation home for 16, large group vacation rentals in Bradenton
- audience pattern: Confirm everyone fits, understand sleeping arrangements and extra guest charges, then check dates.
- proof source: The Oasis and Dockside Dreams public property pages and Site property data, checked November 10, 2026. The Oasis lists five bedrooms, three bathrooms, a 16-guest limit, and extra guest charges above 12. Dockside Dreams lists a 12-guest limit. Both direct guests to driveway parking only.
- required internal links: /properties/the-oasis/?guests=16#booking, /properties/dockside-dreams/
- CTA target: The Oasis booking panel, then Hostaway checkout for listing 189511.
- anti-claims: No guarantee of dates, price, sleeping privacy, beachfront access, or a 16-guest stay at Dockside Dreams.

- hypothesis: Showing the exact fit and preselecting 16 reduces friction for a guest who arrives looking for a home that fits the whole group.
- primary event: The Oasis booking-engine handoff following the collection page, tracked by Analytics separately from test traffic.
- guardrail event: Checkout for the wrong home or with a different guest count or dates; an unsupported property, availability or pricing claim.
- entry criteria: A browser can follow the actual primary link and open the correct checkout with 16 and both chosen dates on mobile and desktop.
- readback window: First seven complete days after publication for coverage. Compare 28 complete days after publication with the 28 days before for an outcome read, excluding test traffic and partial launch days.
- decision rule: Keep the page for the verified technical improvement. Treat traffic or booking lift as insufficient until comparable real handoffs and the booking proof support it.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Large vacation rental that sleeps 16 near Bradenton |
| Searcher intent | Guest booking |
| Current Seascape URL | https://seascape-vacations.com/stays/large-group-vacation-rentals-bradenton/ |
| SERP observed date | 2026-11-10 |
| SERP stale after | 2026-11-17 |
| Current proof | October 12–November 8 GA4 referral read on November 10 recorded six ChatGPT-source sessions on the collection and five direct-book click events on the page. Its sole tracked handoff was on another home. Final post-change search and booking evidence is pending. |
| Top visible competitors | Clover's Coastal Clubhouse, Beach Boutique Rentals' What a Catch, and Airbnb's Bradenton 16-guest listings. |
| Competitor angle | Named home capacity, sleeping layout, pools and beach tradeoffs. |
| Visual/format gap | Competitor listings put occupancy near the home name and show sleeping arrangements. Use the existing Waterline hero and a short sleeping paragraph. |
| Seascape gap | The collection opens with a 12–16 range for two homes. Its parking answer conflicts with the property pages and the existing collection CTA does not preselect 16. |
| Search fit | Keep this URL as the Bradenton group comparison. Show that The Oasis fits 16 and send guests to that home's booking form. |
| Local/GBP proof | The search is for a vacation home with a specific capacity. This change uses listing facts and has no local-profile dependency. |
| AEO/readback note | ChatGPT cited this collection for the sleeps-16 prompt in the October 12, October 27 and November 9 saved OpenSEO runs. No citation lift is claimed. |
| Recommendation | Use the existing hero and first decision section to show the 16-guest fit, preserve the two home cards and FAQ, and add the exact Oasis link. |
| Attack status | completed |
| Query variants inspected | Large vacation rental that sleeps 16 near Bradenton Florida private pool |
| SERP source | Public web results on November 10 and saved OpenSEO November 9 answers. |
| Competitor URLs inspected | https://www.clovervacationhomes.com/property/655465848525291921/coastal-clubhouse and https://homes-and-villas.marriott.com/en/properties/40460090 |
| Content gap and Seascape answer | Separate 16 and 12 at the first decision, show the published Oasis sleeping layout and explain full-group pricing. |
| Design/format strategy | Reuse the current hero button, secondary browse link and first decision section. |
| Seascape proof available | Site property pages, the public booking listing, and the existing booking panel's trip handling. |
| Tools/plugins used | Saved local OpenSEO, public page reads, and the existing GA4 referral report. |
| Decision and reason | One approved improvement to the existing page. Site owns the implementation, Analytics owns outcome measurement. Defer expansion to other group pages. |

## Boundary proof, written before source edits

- The normal two-home browse and property checkout remain available. A group of 16 is routed to The Oasis and the entry link itself creates no booking.
- The approved request defines the test. Click the new primary link, check that 16 is selected, enter dates, and click through to checkout. Require listing 189511, both entered dates and `numberOfGuests=16` on both viewports.
- The check must reject the existing page, which lacks a primary link for 16, and a wrong link that drops the guest count or sends the guest to Dockside Dreams.
- Verify the same path against a read-only Hostaway checkout before claiming provider acceptance. Stop before any contact or payment form submission.

## November 10 verification

- The new test in `tests/visual/trip-continuity.spec.js` failed on the old page for the missing button in both projects. The updated page passed the trip-continuity suite with 20 tests across desktop and mobile Chromium.
- On a local build, followed the new button, entered December 6–9, 2026 and clicked the site's booking action. The real Hostaway checkout for listing 189511 returned HTTP 200 and visibly showed The Oasis, December 6–9 and 16 guests in desktop Chrome and Pixel 5 emulation. Browser routing excluded analytics and blocked non-GET requests. No form was submitted. Checkout totals were outside this proof.
- `npm run verify:release -- --range origin/main` passed 1,390 tests, content and design gates, internal links and JSON-LD verification.
- The full visual pass caught a changed related card on the Bradenton fishing page. Keeping the new headline and summary in the target hero preserved collection metadata on other pages. Both fishing-page screenshots match their baselines, and both 16-guest trip checks pass on the narrowed change.

## Selected A design, approved November 10

Sawyer selected the rendered A direction and said “doesnt matter a is fine just ship it”. The implementation contract is the compact split opening with the actual Oasis pool photograph, the headline “A Bradenton home for all 16.”, an open guest/bedroom/bathroom row, one primary Oasis action and a quiet comparison link. The surcharge and sharing notes sit near the action. The complete sleeping arrangement becomes three readable bed groups. Existing Waterline tokens support this direction without a new design-system rule.

This approval covers source delivery and publication of the named page through the existing Site release flow. This Codex chat is the sole mutation owner and merger. The existing unpublished main range contains #919 cleanup and the previously approved #922 booking change.

### Boundary proof for #923, written before source edits

- The pictured home must be The Oasis. The independent reference is its verified `photography.photos` entry in `src/_data/properties-fallback.json`, including `/images/homes/the-oasis/01.webp`. The current page wrongly shows listing 206016, Dockside Dreams. The existing two-device booking regression will be strengthened and observed red on that wrong case before the source repair.
- The approved A rendering sets the visible hierarchy, real photo, 16/5/3 fit facts, 48px primary action and readable sleeping groups. Check 375px, 393px, 768px and desktop for overflow and inspect fresh desktop/mobile screenshots against the selected renders.
- Preserve the already-proven booking invariant from #921. The actual action must carry 16 and entered dates to Oasis checkout listing 189511 on desktop and mobile. Stop before contact or payment submission. Keep all sleeping, surcharge, parking, mainland-location and Dockside capacity facts accurate.
- Scope the new markup and stylesheet to the selected collection. Existing stay pages must retain their rendering and booking routes. Use the full visual and release checks to catch shared-template regressions.
- Completion requires source checks and current-head reviews, merge, production deploy identity and actual production page/checkout readback. Preview screenshots alone do not satisfy live delivery.

### A implementation proof

- The canonical-image assertion failed on the old page in both desktop and mobile projects. The new image comes from the named home's verified photography record, which also sets the page's hero/social/schema image.
- Fresh source renders at 375px, 393px, 768px and 1440px have no horizontal overflow, the selected Oasis photo loads, and the primary action is 48.9px high. Desktop/mobile screenshots match A's composition. To keep the existing fact checker intact, the lede is split into two sentences and sleeping-group labels use equivalent prose with the counts in their descriptions.
- Source-to-provider readback passed on desktop Chrome and Pixel 5 emulation for December 6–9, 2026. Real checkout returned HTTP 200 and displayed The Oasis and 16 guests. The local server proxied only its missing availability GET to the production availability endpoint. Analytics and non-GET requests were blocked. Checkout pricing is outside this proof.
- The release gate passed 1,390 tests plus content/design, redirects, internal links and JSON-LD checks. The full visual suite passed with 632 passed and 58 skipped, including the strengthened image/checkout case. Both guide-to-stay end-to-end controls passed. Lighthouse budgets and the performance ratchet passed across eight routes.
