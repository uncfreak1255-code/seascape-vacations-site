# Brief: The Oasis for groups of 16

- lifecycle: active
- task scope: Sawyer-approved copy and booking button on the existing Bradenton large-group page, tracked in #921.
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
