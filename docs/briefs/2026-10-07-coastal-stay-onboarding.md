# The Coastal direct-booking onboarding

- lifecycle: active
- task scope: Sawyer October 7 final Airbnb-reference approval; prepare the seventh managed home's Site source using the existing Blue House pattern. Sawyer's October 9 Operating Episode 001 decision replaces the public working title with the approved Hostaway name, The Coastal. Source branch only; no main merge or Netlify deployment authorized.
- persona: Guests choosing a Bradenton private-pool home for up to ten people.
- primary keyword: The Coastal Bradenton vacation rental
- secondary keywords: Bradenton pickleball pool hot tub vacation rental
- audience pattern: Families and groups comparing sleeping arrangements and backyard activities.
- proof source: Sawyer final-reference direction October 7; exact Airbnb 1790003469785984034 and Hostaway 599394 public listing readbacks October 7; Sawyer's October 9 instruction that the Site match Hostaway's approved name, The Coastal. Hub PR807 retains dated documentary history.
- required internal links: /properties/, /properties/coastal-stay/
- CTA target: https://book.seascape-vacations.com/listings/599394
- anti-claims: No fire pit (October 8: the visible "No fire-pit amenity." line was removed from the property page; the anti-claim still forbids claiming one), waterfront, dock, extra infant-capacity exception, sofa-bed exception, crib/highchair promise, pool-heat price/duration/temperature guarantee, supplied propane refills, equipment safety guarantee or private owner details.

## Approved facts and source boundaries

Approved public name: The Coastal. The earlier working titles "Coastal Stay" and "Pickleball, Pool, Spa, Hoops & Mini Golf" are historical and must not remain as reader-facing names. The route slug and Hostaway listing ID stay unchanged. Three bedrooms, seven beds, two bathrooms, ten guests. King, Queen, two twin-over-twin bunks plus twin trundle. Verified public coordinates 27.4887612, -82.6364131. Private pool, hot tub, pickleball, basketball hoop, putting green and air-conditioned game room. Public photos bind exact Hostaway 599394; retain source URLs and optimize local variants. No invented ratings, rates or reviews.

Both channels show a 4 pm check-in start (Airbnb showed a 4–6 pm window on October 7 and a 4–8 pm window on October 8; the booking page shows only the 4 pm start, so the Site states the start only) and 10 am checkout, no late checkout, quiet hours 10 pm–8 am, driveway parking, no parties, no smoking and no ordinary pets. Pet wording does not define legal assistance-animal eligibility. Pool heat fee must be confirmed at booking because day/night charging wording differs. Child/infant numerical exceptions and equipment promises remain excluded.

Availability must remain unknown when no current safe projection or verified booking-calendar result exists. A source branch is not installed/live. The existing provider booking page owns quote/checkout terms.

## Design and voice

Reuse the Waterline shared property layout, catalog and homepage scene pattern. No CSS, motion, hierarchy or component redesign. Current Emil design engineering skill was read; existing design/accessibility and reduced-motion behavior take precedence. Selected gallery reviewed visually: aerial/backyard, hot tub, courts, pool, game room, King, Queen, bunks, living/dining/kitchen. Preserve public factual captions without heat or safety promises.

Visible copy lane: drafted concrete bedroom/amenity/choice copy; removed internal reconciliation language; checked specificity and banned patterns. Voice Editor verdict: Approved. Publication requires rendered desktop/mobile proof and final exact-head review.

## Operating Episode 001 readback contract

- hypothesis: Matching the Site's public property name to Hostaway removes an avoidable trust and handoff inconsistency; no booking or revenue lift is claimed before exact property-level evidence exists.
- primary event: A dated, exact-property Site-to-Hostaway handoff for listing 599394 followed by a reconciled booking outcome.
- guardrail event: The property route, catalog detail link, structured data, availability handoff and booking URL remain intact; weekly Sawyer involvement after onboarding stays below one hour.
- entry criteria: The approved-name source change is merged and deployed, the live Site readback shows The Coastal, and the property-performance collector has produced a valid row for listing 599394.
- readback window: Initial integrity readback after deployment; outcome reviews at 7, 14 and 30 days after deployment using exact listing 599394 evidence.
- decision rule: Keep the correction when public names match and no route or handoff regression appears. Do not claim conversion lift without a reconciled booking. Escalate the operating model if Sawyer involvement reaches one hour in a week or the expected unit economics become non-positive.

Validated baseline at episode start: Hostaway uses The Coastal; the Site still uses older public names. The October 9 arrival and fire-pit corrections are merged. Property-level revenue lift, guest-response improvement and weekly Sawyer minutes are not yet measured.

## Verification and publication

Property truth regeneration/check; full release suite; route/JSON-LD/AI/discovery/checkout identity checks; no fake availability; desktop/mobile screenshots. Current-count wording and smoke assertions follow seven homes. Main merges trigger Netlify, so publication stops at a reviewed keeper branch until production authority is supplied.

## Source files changed in this batch

- src/_data/properties-fallback.json and src/_data/properties.js
- src/properties/coastal-stay/index.njk and src/llms.txt
- src/index.njk; src/property-management/index.njk (current count only)
- src/guides/flights-to-anna-maria-island/index.html and src/guides/bradenton-vs-sarasota-restaurants/index.html (current count only)
- src/assets/js/conversion-tracking.js; scripts/booking/stay-availability.js; scripts/cache/sync-hostaway-build-cache.js
- src/_data/seoPages.json pool-and-hot-tub page (follow-up): the "five homes with a hot tub" count becomes six because The Coastal has a hot tub; the newest home is named with its approved public name and joins the page's featured-home list. Included hot-tub heat, year-round operation, independent controls and the $40/day pool-heat price stay scoped to the five established homes; for the newest home the hot-tub terms and pool-heat fee are stated as confirm-at-booking, never a price or an included-heat promise (property truth records only that the hot tub exists).
- src/css/arrival.css (follow-up): the homepage postcard fan gains a seventh tilt step and a neutral default for any later card, so a new home never renders with an undefined transform.
- scripts/recovery/assert-live-smoke.js (follow-up): the live catalog smoke now requires the /properties/coastal-stay/ link.
- src/_data/properties-fallback.json, generated property truth, src/_data/seoPages.json and public labels (follow-up, Sawyer approved October 9): every reader-facing property name shows "The Coastal". The stable `/properties/coastal-stay/` route and Hostaway 599394 identity do not change.
- src/properties/coastal-stay/index.njk and src/_data/properties.js (follow-up, October 8, from the Codex review of the onboarding PR): The Coastal page mounts the same SAVE50 campaign reminder as the other six property pages, so a campaign visitor who picks this home from /properties/ keeps the offer through to checkout; structured data for the home carries its postal code, 34209.
- scripts/recovery/assert-live-smoke.js (follow-up): the catalog detail-link label for /properties/coastal-stay/ reads "View The Coastal details".

- offer claim: seascape-hub/context/owner-offer.md existing owner-service offer retained; this change corrects inventory count only and introduces no offer.

## Gate 0 source onboarding search receipt

| Field | Required answer |
| --- | --- |
| Target query family | Bradenton private pool pickleball hot tub vacation rental |
| Searcher intent | Compare a home with private backyard activities and exact group fit |
| Current Seascape URL | /properties/coastal-stay/ prepared source; /properties/ current collection |
| SERP observed date | 2026-10-07 |
| SERP stale after | 2026-10-14 |
| Current proof | October 7 exact Airbnb1790003469785984034 and Hostaway599394 source readbacks and verified photos |
| Top visible competitors | Airbnb listings1621059334967303662 and1569558176337049417 |
| Competitor angle | Private pool, pickleball and hot tub with large-group capacity |
| Visual/format gap | Existing Waterline gallery and sleeping facts already serve this property; no new visual pattern needed |
| Seascape gap | The home was absent from the collection at onboarding; the October 9 gap is inconsistent public naming between the Site and Hostaway |
| Search fit | Named ten-guest home answers a narrower comparison than competitors' larger houses; conversion goes to exact599394 booking page |
| Local/GBP proof | Not applicable: this is an existing verified Bradenton home, no new business-location claim |
| AEO/readback note | Existing generated property, llms and AI facts share fallback authority; no search-impact claim |
| Recommendation | Add the authorized verified home using existing source pattern; do not expand a keyword cluster |
| Attack status | completed |
| Query variants inspected | Bradenton private pool pickleball hot tub vacation rental The Coastal |
| SERP source | Web search October 7, 2026 |
| Competitor URLs inspected | https://www.airbnb.com/rooms/1621059334967303662; https://www.airbnb.com/rooms/1569558176337049417 |
| Content gap and Seascape answer | Own exact property is absent; supply ten-guest sleeping layout, current photos and booking identity |
| Design/format strategy | Reuse shared property layout; no redesign |
| Seascape proof available | Exact final listing, Hostaway photos and coordinates, approved facts |
| Tools/plugins used | Current source read, web search, public listing capture, local photo inspection |
| Decision and reason | Proceed authorized source onboarding; Site main merge and production publication remain gated |

## Required Internal Link Map

- src/index.njk: /properties/
- src/property-management/index.njk: /properties/, /property-management/maximize-vacation-rental-income-florida/
- src/guides/flights-to-anna-maria-island/index.html: /properties/, /guides/srq-airport-to-anna-maria-island/
- src/guides/bradenton-vs-sarasota-restaurants/index.html: /properties/, /guides/bradenton-vs-sarasota/
- src/properties/coastal-stay/index.njk: /properties/

- src/guides/dolphins-manatees-bradenton.html: /properties/, /guides/fishing-guide-anna-maria-sarasota/

## Availability loader ownership

The Site's optional `SEASCAPE_SAFE_PROPERTY_PROJECTION_PATH` is unset in the inspected local session and absent from the canonical Site `.env`. No configured writer was found in tracked Ops source. This is an optional external projection contract, not proof of an installed Ops exporter. Existing fallback hydration belongs to Site `scripts/cache/booking-engine-calendar.js`, which reads the public Hostaway booking calendar. A legacy Netlify Blob cache must include every current curated exact identity (including599394) before wholesale use; old partial caches are ignored. Calendar read failures retain unknown availability and booking-page handoff. No cache, exporter or live configuration was written by this task.

## Workflow baseline provenance

Scoped generation run37652925376/job112900645059 passed on sourcec7cccbdf62c64cbc955fdfda591ec7d7a90dda41. Artifact11497980845 contains exactly eight changed PNGs: desktop/mobile home, properties-catalog, property-management and new coastal-stay. All eight were visually inspected. The queued commit-baselines job was cancelled before any writer started; remote tip remainedc7cccbdf. Parent authorized importing these immutable workflow-generated files through ordinary guarded commit; no local snapshot generation, hand-edited image or hook bypass. Source/test repairs since generation do not change rendered page design. SHA256 path receipts retained in the task artifact directory. The existing listing identity map was compacted only by removing whitespace to offset the added entry's 28 script bytes; performance thresholds were not raised.
