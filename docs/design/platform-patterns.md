# Platform patterns playbook (November 6, 2026)

Sawyer's direction, November 6, 2026: the site, especially on mobile, follows the
interaction patterns of the big booking platforms that hold the user data
(Airbnb first, then Vrbo, Booking.com, Expedia/Hopper), dressed in Seascape's
own Waterline look. Local competitors are not the design reference.

Every design task that touches search, the catalog, a property page, a booking
control, a sticky bar, filters, galleries or reviews checks this file first and
names the pattern it applies or the reason it departs.

## Rules of use

- Borrow interaction patterns only. No platform branding, logos, illustrations,
  copy, color or exact visual trade dress. Build with Waterline tokens in
  `DESIGN.md`: paper/ink/citron/clay, Instrument Serif and Poppins, 4px controls,
  44px targets, the F1-F6 floors.
- Site constraints still win: no price or rating unless it comes from a live,
  real source; no invented amenity, capacity or availability; no popup that
  interrupts the core journey; motion stays CSS-only; stay inside the page-speed
  budgets. Capacity matching is not availability, and a remembered trip is not a
  quote (`DESIGN.md`, Trust and usability).
- Visible changes still ship as two or three rendered variants anchored to a
  named donor (`docs/agents/rules/design.md`). This playbook names the donor
  pattern; it does not replace Sawyer's pick.

## Evidence key

- **E** published research or an official platform statement, linked below.
- **D** the platform's own help text, linked below.
- **O** widely used behavior described from general familiarity with the live
  products. It was not re-captured in the session that wrote this file. Re-check
  it on the live product before building a variant on it.
- **A** assumption or hypothesis; no evidence found. Treat as a test to run.

No conversion-lift number below is measured on Seascape. None is quoted unless a
source gives it. Baymard's page-level findings are paywalled; only its public
summaries were read.

## Patterns

Each entry: what the platforms do; evidence; Waterline adaptation; what the site
has today (checked against `src/` on origin/main, November 6, 2026).

### 1. Search entry: Where / When / Who in one sheet
- Platforms: a single pill that opens a full-screen sheet with three stacked
  steps (destination, dates, guests), each collapsing to a one-line summary.
  Vrbo documents the same three inputs (Where, dates, guests) then Search (D1).
  Booking.com keeps the search box at the top of its mobile pages (O).
- Evidence: Baymard finds many accommodation sites fail by not prioritizing the
  booking search on the homepage (E4, Jan 2026 summary). The collapsed-summary
  sheet itself: O.
- Adaptation: Seascape has one destination, so drop "Where". A pill reading
  "Dates and guests" (value shown as `Apr 3 - 7, 4 guests` once set, from the
  existing trip state) opens a bottom sheet in paper with ink labels and the ink
  primary "Find my home" button. Native date and select controls stay.
- Site today: partial. The homepage has the native trip form as an in-page
  section below the scene hero (`partials/guest-trip-form.njk`), not a pill or
  sheet, and not visible at first paint on a phone.

### 2. Date picker
- Platforms: a calendar sheet with range selection, a clear start/end state and
  a "flexible dates" escape (Airbnb, Expedia) (O). Baymard publishes annotated
  Airbnb and Expedia mobile date pickers but the findings are paywalled (E5).
- Adaptation: keep the native date inputs (`DESIGN.md` requires native
  date/dialog behavior) and add a calm trip summary line plus "Flexible dates"
  as an explicit choice. Do not build a custom calendar without a variant
  review; native pickers are the accessibility baseline.
- Site today: native `type=date` arrival/departure inputs; copy "Dates optional".
  Flexible-date summary exists on the homepage prototypes (PR 888), not live.

### 3. Category chips as quick filters
- Platforms: one horizontally scrolling row of icon+label chips under the search
  pill that re-filter the list in place (Airbnb) (O).
- Evidence: A. NN/g advises half-visible items as the cue that a row scrolls
  (E2, 2018).
- Adaptation: chips from real property truth only (Waterfront, Near AMI,
  Sarasota, Ask about pets), 44px high, ink-on-paper with citron selected state,
  last chip cut off at the screen edge. No invented amenity chip.
- Site today: yes, five filter buttons on `/properties/`; wrapping behavior on
  phones should be checked against this row pattern.

### 4. Listing card: swipeable photos plus save
- Platforms: a large rounded photo card with swipe through several photos, dots,
  a heart that saves to a wishlist, then name, location line and price (O).
  Airbnb's engineering team orders and categorizes listing photos by learned
  booking appeal and room type (E6, E7).
- Evidence: swipe and half-visible cues over dots, short sequences, 3-4 swipes to
  reach the end (E2). The heart: A for Seascape (no account system).
- Adaptation: card photo becomes a native scroll-snap strip of the first 4-5 real
  photos of that home (Photography is evidence: only the named home). Save = the
  existing compare/shortlist toggle, kept 44px, no accounts, no emoji (SVG icon
  via `ui-icon.njk`). Lead with the home's strongest approved photo.
- Site today: partial. One photo per card, a compare toggle, a shortlist tray and
  a comparison dialog; no in-card swipe.

### 5. Total price, not nightly price
- Platforms: Airbnb now shows the total including fees, before taxes in search
  and always the full total before checkout (E1, D2). The first launch was 2019 in
  parts of Europe, Australia, Canada and Korea; a toggle followed in 2023; global
  default April 2025. Airbnb states almost 17 million guests used the toggle
  to book as of December 31, 2024 (E1, Airbnb's own count). The US FTC rule on
  total price took effect May 12, 2025 (reported; verify before citing as law).
- Adaptation: the principle is "never surprise at checkout". Show a price only
  from a live Hostaway quote for the guest's dates, labelled with what it
  includes. Until a live quote exists, keep the current honest copy ("You will
  see the full price before you pay") and lead cards with fit, not a number.
- Site today: no prices anywhere by design. The booking panel states the full
  total is confirmed on the booking page.

### 6. Map toggle
- Platforms: list first, a floating "Map" pill toggles a full-screen map with
  price pins and a card carousel at the bottom (Airbnb, Booking.com); Vrbo
  documents a map with tappable pins (D1) (O for the rest).
- Evidence: no Seascape-relevant evidence found. A: with eight homes in two
  cities, a map earns its place mainly to show "mainland Bradenton versus the
  island", a question the site already answers in words.
- Adaptation (low priority): static, labelled area map of the real locations,
  no live-map library (budgets), pins without prices.
- Site today: none.

### 7. Filters in a bottom sheet
- Platforms: a Filters button opens a bottom sheet with grouped sections and a
  sticky footer "Show N homes" / "Clear all" (Airbnb, Booking.com, Vrbo) (O; Vrbo
  filter set documented in D1). Baymard says beyond price and rating, domain
  filters such as amenities help and must be easy to scan and apply (E4).
- Adaptation: only needed if filters outgrow five chips. A native `<dialog>`
  sheet from the bottom, live count in the apply button, same Waterline dialog
  motion (250ms in, 150ms out).
- Site today: chips only, no sheet and no live result count.

### 8. Photo gallery and photo tour
- Platforms: tapping the hero opens a full-screen gallery; Airbnb groups photos
  by room ("photo tour") using automatic room categorization (E7, D3). A single
  gallery behavior is shared across web and app (O, third-party portfolio).
- Adaptation: the existing gallery is already close. Add room-group jump chips
  (Pool, Kitchen, Bedrooms) only from captions already in property data, never
  guessed from the image.
- Site today: yes. Swipe strip with `1 / N` counter, "View all N photos" and a
  native dialog; photos beyond the third are lazy-loaded.

### 9. Sticky bottom bar on the listing page
- Platforms: after the booking section scrolls out of view, a fixed bar shows
  price and dates on the left and a single Reserve button on the right
  (Airbnb, Booking.com, Vrbo) (O).
- Evidence: Airbnb's "Reserve" label beat three tested alternatives in a leaked
  2019 test (third-party GoodUI report, unverified). Baymard did not publish a
  public sticky-CTA finding that was read. Treat the lift as A.
- Adaptation: the bar already follows `DESIGN.md` (paper, ink button, safe-area
  padding, must not cover the form). The left side already shows the trip
  summary; add a price only once a live quote exists, and bring the same bar to
  `/properties/`, which has none.
- Site today: yes, `.g-mobile-booking`: home name, trip summary, ink button,
  hidden while the booking panel is on screen.

### 10. Reviews summary
- Platforms: a rating and count at the top, category bars, then a short
  carousel of review cards (O).
- Adaptation: show only what is real. No aggregate rating unless it is computed
  from a verified source with a count and date. PR 888's author reported only 4
  of 8 homes have ratings (not re-checked here); show the individual cards
  with source and date, as now, and nothing for the others.
- Site today: partial. Review cards with author, date and rating on property
  pages and a review grid on the homepage; no aggregate summary, correctly.

### 11. Speed as a pattern
- Platforms are fast first; Google-commissioned research on mobile retail/travel
  sites found a 0.1s speed improvement associated with roughly 10% higher travel
  conversion in that sample (E8, 2020, 37 brands; correlational and across four
  speed metrics). Keep the existing perf ratchet; every pattern above must pass it.

## Ranked gaps: mobile, highest value for least work

Ranked by judgement from the evidence above. No Seascape booking impact has been
measured; the ranks are hypotheses to test in A/B or previews.

1. **Dates-and-guests summary pill that opens a sheet, visible at first paint on
   the homepage and `/properties/`.** Pattern 1. Reuses the existing trip form
   and state; mostly CSS and a `<dialog>`. Baymard (E4) ties search prominence to
   findability.
2. **Bring the sticky trip-summary bar (live on property pages) to
   `/properties/` on phones.** Pattern 9. Small: the component and trip state
   exist; keep it clear of the shortlist tray.
3. **In-card swipeable photo strip on `/properties/`.** Pattern 4. Native
   scroll-snap, first 4-5 approved photos, lazy loaded; watch the performance
   budget.
4. **"Available for your dates" status on cards, driven by the existing
   `booking-availability` lookup.** Closest honest stand-in for the price line
   (pattern 5) until a live quote exists. Labelled availability, never a quote.
5. **Filter chips tuned as one scrolling row with a live result count, and a
   clear-all.** Patterns 3 and 7. Low effort; the chips exist.

Larger bets, not ranked: a live total price from Hostaway for the guest's dates
(pattern 5; needs a source and Sawyer's approval), and an area map (pattern 6).

## PR 888 prototypes against this playbook

Compared by reading `src/internal/booking-1..3.njk` and `booking-prototype.css`
on `claude/booking-first-prototypes` (preview URLs were not opened):
the preview
`https://deploy-preview-888--cozy-licorice-e83928.netlify.app/internal/booking-1/`
(and -2, -3) shows them. Booking-1 (search sheet first, large photo cards) is
closest: it leads with the trip form as the first object, which is pattern 1,
and stacks full-width photo cards, which is the Airbnb card shape. Booking-2 has
the better summary pattern (a collapsed "Dates and guests" row with the value,
and compact rows) and a fixed bottom bar, but the bar carries a generic
"Dates" anchor rather than a trip summary plus a primary action. Booking-3 has
the strongest photographic first view but hides search under the hero and uses
a horizontal rail, which NN/g notes needs a cue and a short length (E2). None
shows in-card swipe, a result count or an availability status, and none changes
the property page. To reach the playbook, booking-1 needs: the collapsed
summary behavior from booking-2 (opening a sheet instead of an always-open
form), the sticky bar from booking-2 carrying the trip summary, and the
"available for your dates" status (gap 4). That mix is the recommended next
variant; the pick stays Sawyer's.

## Sources

- E1 Airbnb Newsroom, "Total price display is now standard for guests worldwide",
  April 21, 2025: https://news.airbnb.com/total-price-display-is-now-standard-globally
- D1 Vrbo Help, "How do I search for a vacation rental" (read November 6, 2026):
  https://help.vrbo.com/articles/How-do-I-search-for-a-vacation-rental
- D2 Airbnb Help, displaying total price (search result summary only; page not
  read in full): https://www.airbnb.com/help/article/3365
- E2 Nielsen Norman Group, "Mobile Carousels", August 19, 2018:
  https://www.nngroup.com/articles/mobile-carousels/
- E4 Baymard Institute, Travel Accommodations UX Benchmark 2026, January 15, 2026
  (public summary): https://baymard.com/blog/travel-accommodations-ux-benchmark-2026
- E5 Baymard annotated Airbnb mobile date picker (findings paywalled):
  https://baymard.com/ecommerce-design-examples/date-picker/11329-airbnb
- E6 Airbnb Engineering, "When a Picture Is Worth More Than Words", 2022:
  https://medium.com/airbnb-engineering/when-a-picture-is-worth-more-than-words-17718860dcc2
- E7 Airbnb Engineering, "Categorizing Listing Photos at Airbnb":
  https://medium.com/airbnb-engineering/categorizing-listing-photos-at-airbnb-f9483f3ab7e3
- D3 Airbnb Help, photo tour / room sorting:
  https://www.airbnb.com/help/article/3509
- E8 Google and Deloitte, "Milliseconds Make Millions", 2020:
  https://web.dev/case-studies/milliseconds-make-millions
- Third party, unverified: GoodUI on Airbnb's "Reserve" label test:
  https://www.goodui.org/leaks/airbnb-a-b-tested-these-3-button-labels-and-they-all-failed

## Not verified

- Live Airbnb, Booking.com, Vrbo and Expedia/Hopper mobile UIs were not
  re-captured; every "Platforms" statement marked O is from general familiarity.
  Booking.com and Expedia/Hopper have no primary source here.
- Baymard sticky-bar, date-picker and mobile-filter findings are paywalled.
- NN/g's carousel article is from 2018; it is not travel-specific.
- Review at least once a year, and before any variant claims a platform does X:
  open the live product and record the date.
