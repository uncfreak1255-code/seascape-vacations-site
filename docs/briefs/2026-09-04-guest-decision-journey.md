# Guest decision journey — active brief and continuation

- persona: The guest organizing a shared Gulf Coast vacation.
- primary keyword: vacation rentals near Anna Maria Island (existing catalog intent; no keyword expansion).
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals.
- audience pattern: Compare real homes, keep dates and group size, reach the complete checkout total.
- proof source: properties-fallback.json via properties.js; live guest journey September 4, 2026; current main 7219d33e.
- required internal links: /properties/dockside-dreams/, /properties/the-oasis/, /properties/sarasota-luxe/, /properties/river-house/, /properties/bradenton-pool-home/, /guides/, /stays/book-direct-anna-maria-island/.
- CTA target: The matching Hostaway listing at book.seascape-vacations.com.
- anti-claims: No selected-date availability, complete quote, savings percentage, on-island location, boat suitability, or unrestricted pet permission without current authoritative evidence.
- hypothesis: Clear home differences and persistent trip context reduce effort between catalog entry, home evaluation and booking handoff.
- primary event: booking_engine_handoff, with catalog_view_details_click and catalog_book_direct_click as diagnostic steps.
- guardrail event: Invalid itinerary, no fitting homes, missing-image or browser error; no reservation or email action in QA.
- entry criteria: Sawyer explicitly commissioned this bounded product build; live November 7–14 / eight-guest journey reproduced date loss and unrelated September opening prices. This is not an SEO expansion.
- readback window: First 28 complete days after an approved production release; first 7 days for errors. Analytics owns the dated aggregate read.
- decision rule: Retain only if functional guardrails hold. Compare qualified catalog sessions progressing to handoff and reconciled direct reservations; with fewer than 50 qualified sessions, report counts and uncertainty rather than a causal lift claim. Five moderated journey tests are the cheapest initial test.

## North Star and choice

Become the local host that helps a whole group confidently choose the right house, then book with the trip intact. Keep Eleventy, the current brand, property source and Hostaway checkout. Build the existing catalog into a decision surface before adding an AI app or a new service.

Observed live: the homepage date search reaches the catalog with arrive/depart/guests; the catalog shows unrelated next openings and baseline prices; detail navigation drops arrival/departure. The shared tracking allowlist knows checkin/checkout, but not the hero's arrive/depart vocabulary. Hostaway's widget loads after scrolling and has a visible blank period. These are demonstrated friction points, not measured abandonment. Older policy/pricing claims elsewhere need an owner-backed factual pass: the detail pages still say best-rate guarantee/flexible cancellation, while the observed Hostaway checkout presents dated refund thresholds. Room layouts exist in detail copy but are not consistently structured for reuse. Reconcile those sources before promoting them into new comparison fields or assistant answers.

Accessible performance evidence is historical: the Aug 11 read of Aug 3–9 reports 34 catalog GA4 sessions and 82 guide-winner sessions. No newer joined aggregate receipt was found; revenue uplift is unproven. Active PR 541 is a sticky-CTA plan, not this build. Old booking branches contain unsupported savings copy; current attribution code is already integrated.

## Design packet and decision

Surface: /properties/, plus trip continuity through existing detail pages. Audience: the organizer comparing five homes. Preserve cream/teal/gold, Playfair/Poppins, pill CTAs, 1100px content, real property imagery, existing canonical URLs and attribution.

Critic: current catalog Needs another pass. Considered (1) compact editorial home comparison, (2) long five-vacation magazine sequence, (3) geography/map-first selection. Selected (1), Approved with edge: strongest useful first screen and lowest data maintenance. Compact two-column thesis and actual home photo; visible dates/group controls; generous property photography with distinct sourced highlights; compare up to three homes in a semantic table; share a shortlist URL; clear no-fit and incomplete-date recovery. Mobile puts the trip controls before the editorial photo: a two-column date row and compact guest/action row keep the complete form in the first viewport. Two comparison columns fit; a third scrolls with pinned row labels. The fixed tray reserves bottom space and focus-scroll clearance. This rendered revision supersedes the initial full-width guest/action proposal.

User authorization: select and implement routine design decisions now; draft PR only. No design-system rule change or outside donor needed. Specialist and critic ran; unavailable optional frontend-design donor was not invoked. Native copy draft -> interface-language pass -> humanization follows the repository voice rules; the named legacy global copy helper packages are absent from the current exposed skill set and local roots.

## Scope and release boundary

One mutation owner: Codex session 01a06e5c-06cc-7e62-8c13-975dc3686728. Sole merger after separate approval: Sawyer. Source work only in codex/design-guest-decision-journey. Do not merge/deploy, change Hostaway settings, send messages, create reservations, or add paid services.

Target files: src/properties/index.njk, src/css/catalog.css, src/assets/js/catalog.js, src/assets/js/conversion-tracking.js; associated behavior, visual, and smoke checks. No competing property database or model-generated facts.

## Recommended moves and cheapest tests

These are product recommendations, not promoted Seascape Hub canon or proved revenue outcomes.

| Move | Customer problem and commercial mechanism | Evidence / confidence | Burden and cheapest useful test |
| --- | --- | --- | --- |
| Ship a clear choice and an intact trip | The organizer compares real differences, rules and group capacity without losing dates. Fewer restarts can increase qualified checkout visits. | High confidence in observed date loss and conflicting price context; commercial lift unknown. Implemented here. | Low: existing Eleventy, canonical property data and browser tests; no service, account or model cost. Five observed mobile/desktop tasks before release, then 28 days of qualified handoff and reservation counts. |
| Make property facts easier to trust and reuse | Resolve “who sleeps where?”, pool heating, pet restrictions, stairs/access, dock/boat suitability and complete policies before guests must call. Those same facts help search and assistants represent homes accurately. | Current descriptions/highlights exist, but not all decision facts are structured and verified. Only Dockside has private waterfront/dock; River House is near a ramp. | Low to medium: Sawyer verifies missing facts once in the owning property source; updates follow actual home/policy changes. Audit the five most repeated guest questions against five homes; publish only verified answers. No copied second database. |
| Test the group organizer as a distribution channel | A shortlist travels into the existing group chat. Other travelers evaluate actual Seascape homes; a returning organizer can restart from the same homes next season. This is the surprising small-operator opportunity. | Sharing itself is demonstrated; repeat behavior and new visitor acquisition are hypotheses. Journi and Engine show usable organizer patterns, not proof they will work here. | Low for current URL sharing; medium for a later reusable group itinerary. Ask five consenting organizers to use the shortlist and observe completion. No unsolicited guest messages or new email sender. |

Next distribution investigation: confirm Hostaway's current Google Vacation Rentals connectivity and Seascape eligibility before building a feed or paying for a channel. Preserve guide discovery, existing canonical URLs and crawlable server-rendered facts. New SEO/entity batches remain subject to the existing next-batch gate.

Reject now: a generic chatbot that repeats listing copy, and a branded ChatGPT app as the first acquisition investment. Five homes do not by themselves create a reason to install or discover a branded app. A trustworthy conventional selection path and accurate public facts work for more guests today. Revisit a small read-only assistant distribution experiment only after referral or partner evidence identifies real demand.

## AI distribution: four separate capabilities

| Capability | Authoritative source, freshness and missing-data behavior | Current position / next test |
| --- | --- | --- |
| Be found and cited | Public canonical pages, structured data, sitemaps, robots, existing llms.txt, ai-discovery.json and AI summaries. Canonical property source supplies facts; sitemap/structured-data checks prove syntax and links, not citations. | Already implemented in part. Measure named queries and actual AI referrals through analytics; do not infer discovery from file existence. Audit public fact consistency before adding more endpoints. |
| Help choose a home | Canonical capacity, location, amenities and approved policy details. Unknown boat suitability, access, pet permission or fees must remain unknown and prompt the guest to verify. | This build provides deterministic matching and comparison without generated claims. Facts update through the normal source/build path. |
| Get valid availability and a full quote | Hostaway calendar and server-side priceDetails, including fees/taxes/policies for exact dates and party size. A build snapshot is not a chosen-date result. | Current catalog sends guests to Hostaway. Optional cached openings start hidden, are shown only within 36 hours of sync, and disappear with selected dates. Future API use must fetch/revalidate per request, label time/currency/inclusions, handle 429/timeouts, and fail to a booking link rather than invent availability or price. |
| Handoff / reserve | Public Hostaway listing with supported date/guest parameters. Hostaway owns checkout and final confirmation. A quote does not reserve inventory. | Handoff is demonstrated; no reservation or payment was attempted. Completing bookings inside an AI interface is a separate eligibility, authentication, payment and approval project. |

Current official research, read September 4, 2026:

- OpenAI's [submission documentation](https://developers.openai.com/plugins/deploy/submission) now routes the Apps SDK surface through Plugins. Directory submission requires a verified developer, the relevant management role, production MCP endpoint, public policy/support information, positive/negative tests, review and explicit publication. Technical feasibility does not establish travel-checkout eligibility or acquisition.
- [Authentication](https://developers.openai.com/plugins/build/auth): anonymous read-only tools can reduce friction; user-specific actions need supported OAuth 2.1/PKCE. Keep Hostaway credentials server-side. No credential or account changes are part of this work.
- [Metadata guidance](https://developers.openai.com/plugins/guides/optimize-metadata) can help an assistant understand when a tool is useful; a directory listing is not guaranteed placement. A broad destination comparison surface or partner channel could reach more travelers than a Seascape-only installation. Test demand before maintaining a public MCP service.
- OpenAI's [local-services quote specification](https://developers.openai.com/plugins/guides/local-services-request-quote-conversion-spec) and [product-checkout specification](https://developers.openai.com/plugins/guides/product-checkout-conversion-spec) describe controlled partner paths. Neither establishes Seascape's lodging-payment eligibility. Do not promise in-ChatGPT accommodation checkout. No definitive flat submission fee or free ongoing operation was established; budget hosting, monitoring, authentication and any model API usage only if a later pilot is approved.
- [Hostaway API documentation](https://api.hostaway.com/documentation): server-side POST /v1/listings/{listingId}/calendar/priceDetails uses startingDate/endingDate/numberOfGuests and version 2. These are API parameters, distinct from the public booking site's start/end. Documented account/IP limits require bounded retries and 429 handling; webhooks can support updates but do not replace quote revalidation.
- Hostaway's [quote workflow](https://support.hostaway.com/hc/en-us/articles/24155962940315-Calendar-Sending-a-quote), [widget guidance](https://support.hostaway.com/hc/en-us/articles/9521197987995-Booking-Website-Embeddable-Search-Bar-and-Calendar-Widgets), and [search/checkout settings](https://support.hostaway.com/hc/en-us/articles/48213177775387-Booking-Website-Search-Bar-and-Checkout-Settings) were checked. API access and server credentials were not assumed or changed.
- Google's [vacation-rental onboarding guide](https://developers.google.com/hotels/vacation-rentals/dev-guide/onboarding) includes structured listing ingestion for smaller inventories, with additional registration, pricing/availability and landing-page requirements. JSON-LD alone does not establish eligibility or a working booking feed. Confirm the existing provider path first.
- Product references: [Journi](https://www.getjourni.co/) for no-download shared planning and accommodation comparison; [Engine groups](https://engine.com/groups) for the organizer's job; [FindMyBnB](https://www.findmybnb.co/) for property matching with direct handoffs. Borrow the useful task sequence, not their identity or unproved adoption claims.

## Demonstration and measurement

Live Hostaway proof: on September 4, selecting September 20–22, 2026 in the public Dockside calendar produced start/end URL parameters. Reloading the same listing with numberOfGuests=8 settled to eight guests and a complete displayed total of $1,093.70 ($527.88 lodging, $440 cleaning, $58.07 lodging tax, $67.75 sales tax). This is a dated observation, never an evergreen quote. The earlier November 7–14 attempt cleared the fields; its reason was not established. No Book Now, inquiry, reservation or payment action occurred.

The local journey is /properties/?arrive=2026-11-07&depart=2026-11-14&guests=8. Compare two homes, copy the shortlist, open the copied link, open a detail page, return through “Change trip / compare homes”, and inspect or follow Check dates without reserving. Malformed, incomplete, reversed and past dates recover; groups larger than 16 have an explicit no-fit state. No-JavaScript visitors retain all home details and checkout links.

The shared tracking script preserves existing guide/session/handoff lineage. New browser events are catalog_trip_update, catalog_filter_change, catalog_compare_select, catalog_compare_open and catalog_shortlist_copy. Their presence in source is not proof of GA4 ingestion. Shared shortlist URLs allowlist only trip/filter/known property IDs and exclude attribution, session IDs and unknown contact fields. They are ordinary public URLs, not access-controlled private trip records.

Measure after approval: verify events first, then use analytics-owned aggregate receipts for catalog entry → detail → booking_engine_handoff → reconciled completed direct reservation. Report counts by source/device, share-link use, guest questions and unsuitable-home recoveries. Compare contribution after channel/payment costs only when actual reservation and cost evidence exists. Low traffic and changing season/date availability prevent a casual before/after comparison from proving causation. Five moderated sessions are more useful now than declaring an A/B winner from a small sample.

## Proof and release continuation

Source owner remains this session; no other session may push this branch. The final PR stays draft. Local preview runs on http://127.0.0.1:4196; durable route screenshots are committed under tests/visual/__screenshots__/{desktop,mobile}-chromium/visual.spec.js/properties-catalog.png. Additional first-screen/comparison screenshots and lab reports are in /private/tmp/seascape-guest-journey-proof; these temporary files can be recreated with the browser suite and the existing proof tool.

Verification: 901 unit tests passed; verify:release passed (162 pages, 687 JSON-LD blocks, internal links valid); the full 66-test desktop/mobile visual and behavior suite passed. After the final dock wording correction, the four affected viewport/comparison checks passed and only the two catalog baselines were refreshed. Content and commit-time checks are recorded by their command output and PR. Automated accessibility is supplemented by rendered desktop/mobile inspection, keyboard comparison checks and image/source review. The independent review found malformed/past destination dates and insufficient slug-to-listing validation; both were corrected with negative tests. Native copy/voice and bounded simplify passes found no unsupported new public property claims. No framework, dependency, database, workflow, Hostaway setting or design token was added.

Release: repository source and netlify.toml specify a main-linked Netlify build (npm run build) publishing _site. No separate feature switch is needed. The authorized source PR must satisfy current-head CI/review before Sawyer explicitly approves merge and the resulting production deployment. GitHub's deployment list returned no records, so do not claim a verified dashboard deployment state from it.

After approval, the release owner must read the Netlify deployment for the exact merged SHA, then verify production data-catalog-version="guest-journey-v1", assets, mobile/desktop trip continuity, comparison sharing, and the same available-date Hostaway handoff without booking. Run verify:recovery:live and verify:recovery:entity-live and record UTC/SHA/results. A merged SHA alone is insufficient.

Rollback: use the repo's release-incident/failed-Netlify-deploy runbooks; restore the previous known-good Netlify deploy or revert this bounded source change and rebuild, with explicit production authority. Preserve current tracking lineage and property source. Do not rewrite history.

Keep this clean, unmerged worktree while the draft is reviewed and the preview is useful. Remove it through the broker only after approved landing and fresh equivalence/inactivity proof. Root Astra-upgrades and unrelated worktrees remain untouched.

Lab performance: three final local catalog runs passed the existing repository budgets, with LCP 3.30–3.45 s, CLS 0 and TBT 0–6 ms. These are simulated lab results on the local static build, not real-user Core Web Vitals or a measured conversion result. Reports: /private/tmp/seascape-guest-journey-proof/lighthouse. Next action: Sawyer reviews the draft and preview, then explicitly authorizes the separate merge/Netlify release if accepted. The release owner then performs the exact-SHA production readback above.
