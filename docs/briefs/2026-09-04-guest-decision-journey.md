# Waterline — guest journey and continuation

- persona: The person organizing a shared Gulf Coast vacation.
- primary keyword: vacation rentals near Anna Maria Island (existing intent).
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals.
- audience pattern: Compare real homes, understand sleeping and restrictions, keep the trip, check the complete total.
- proof source: Canonical properties-fallback.json via properties.js; Blue House Hub canon, public Hostaway listing schema, booking page and photography inspected September 13, 2026; rendered live before and local after.
- required internal links: /properties/, /guides/
- CTA target: The selected home's public Hostaway listing at book.seascape-vacations.com.
- anti-claims: No invented amenities, unconditional pet permission, step-free access, cancellation guarantees, savings percentages, selected-date availability or model-generated prices. No revenue lift claimed.

## Decision and scope

October 1 interaction refinement: Sawyer approved the emil-design-eng review’s three upgrades. Preserve the Waterline composition and direct homepage Book now handoff. Add subtle pointer/touch press feedback to shared guest buttons, make keyboard scene changes and selector movement immediate, and retain clear postcard keyboard focus without lift/scale while shortening desktop pointer hover to 200ms. Reduced-motion behavior stays static. Scope: guest.css, arrival.css, guest.js, DESIGN.md, and focused browser regression coverage. The session owns mutation and source closeout; deployment remains separately gated.

October 1 homepage booking shortcut: Sawyer requested that the homepage header button say “Book now” and open Seascape’s Hostaway booking platform directly. Scope: `src/index.njk`, `src/_includes/partials/guest-header.njk`, and the corresponding homepage live smoke assertion. Use the existing https://book.seascape-vacations.com destination in the same tab; retain the on-page date form and existing internal navigation. Preserve the button styling. Voice pass: Approved after drafting “Book now”, removing internal wording, and checking that the label accurately describes the booking destination. No reservation, payment, or deployment is authorized by this source change.

September 5 copy decision: Sawyer prefers “our homes” with no fixed inventory count. Apply this across navigation, homepage, catalog and descriptive metadata. Per-home capacity and room counts remain factual. The decorative scene number is an ordinal, with no inventory-total denominator.

September 13 Blue House addition: Sawyer directed the site to add the live Blue House as the sixth managed home. Public Hostaway listing 589288 and its direct-booking page identify it as Pickleball Pool Home Retreat: 4 bedrooms, 2 bathrooms and 10 guests at that dated inspection (capacity superseded by the September 30 correction below). The implementation uses 13 real photos selected from the current 30-photo Hostaway gallery and generated from the archived original-resolution Elite Realty Shots files. Source changes are limited to `src/_data/properties.js`, `src/_data/properties-fallback.json`, the generated property route and AI property summary, the shared verification-date rendering, responsive local photos, current inventory wording and the corresponding property, catalog, schema, smoke and visual checks. Lily’s home remains outside published inventory until its own verified facts, photography and bookable Hostaway record exist.

September 30 Blue House capacity correction: Sawyer directly confirmed "11 guest is the truth" and authorized updating every affected Blue House capacity surface. This supersedes the earlier 10-guest Hub/API capture and September 13 Site brief; Hub PR #785 records the September 30 exact booking-listing 589288 display as 11 guests; a fresh read in this task also found `personCapacity: 11` and booking JSON-LD occupancy 11. Canonical `src/_data/properties-fallback.json` now carries 11 guests and matching specs. Regenerate `src/llms.txt`; the shared property layout, JSON-LD, catalog/homepage, and `src/ai-discovery.json.njk` consume the property data. Record a separate September 30 capacity verification date in the fallback, visible source note and AI facts; keep the other home details dated September 13. Update capacity regression and live-smoke assertions. Preserve 4BR/2BA, sleeping arrangements and all other facts; do not refresh unrelated verification dates. Scope is a factual source correction, not a new search/AI experiment, deployment or Hostaway write. Voice pass: Approved after drafting the count correction, removing internal wording from reader copy, and checking specificity.

September 14 completeness: Blue House has no verified hot tub or spa. Scope `/stays/vacation-rentals-with-pool-and-hot-tub/` intro, FAQs, and highlights to the five homes that have one. Register listing 589288 in `src/assets/js/conversion-tracking.js` so checkout attribution and shortlist continuity keep `blue-house`. Keep the desktop postcard fan in one count-agnostic row with a sixth-card treatment. Require Blue House in the safe availability projection. SAVE50 landing, catalog openings, and Bradenton-area match counts follow the sixth home.

September 14 review-band revert: the homepage guest-review ink band shipped inside the Blue House PR is reverted on Sawyer's direction. `src/index.njk` and `src/css/arrival.css` return to the paper review grid, the `DESIGN.md` band rule is withdrawn, and the homepage visual baselines return to the pre-band macOS actuals. Sawyer owns the guest-review redesign in a separate pass; no new copy, proof claim, or design rule ships in this revert.

North Star: make Seascape the easiest small collection for a group organizer to choose with confidence. Distinct homes and a person who knows them are the advantage. Build the choice, then carry it intact to the authoritative quote and checkout.

The first draft improved only the catalog. This revision connects the homepage, catalog, comparison/share link, all five detail pages, prepared property questions and Hostaway handoff. Keep existing canonical routes, attribution, guide discovery, reviewed guest reviews and SAVE50 email landing continuity. Retire the unidentified homepage hero, competing baseline prices, weather ticker, automatic homepage discount popup, blanket cancellation language and five duplicated detail templates. No framework, account, model, database or new service is needed.

Sawyer explicitly authorized revising repository-owned design and process decisions. DESIGN.md records the editable Waterline direction. Existing visual rules were preferences, not evidence. Security, accurate facts, ownership, source review and separate deployment authority remain requirements. Inventory and surface audit found no reason for new agents, skills or review machinery.

## Design decision and faithful evidence

The first Open House revision improved the connected journey but was too restrained. Sawyer asked for a more ambitious visual result. On September 5, rendered Waterline (full-width real-photo scenes) and Spatial Atlas (a fan of real-photo postcards) on desktop and 390px mobile. Chose Waterline's photographic arrival plus a readable postcard collection. Instrument Serif replaces the guest display font; Poppins stays for controls/body. Warm paper, deep marine, clay and a limited citron selection/CTA accent. The new visual language continues through catalog, all five property details and galleries. No game engine, WebGL dependency, fabricated home model, autoplay or scroll hijacking.

Manual scene changes reveal the chosen home's actual image, name, facts and correct property link. Native image decoding plus a latest-choice guard prevents a slower previous image from replacing the final selection. Links remain ordinary property links without JavaScript. Arrow/space keys work; reduced motion disables animation. Same-origin photo transitions progressively connect catalog and detail pages. Mobile starts with the actual home photo and a direct top navigation jump to the trip form. Desktop postcards have subtle depth; touch uses a readable native snap list.

Research: [Instrument Serif and its OFL source](https://github.com/Instrument/instrument-serif); [browser view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using); [CSS scroll animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline); [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). Native browser features cover the selected interactions, so no animation dependency was added. Current Astra 3D examples were search-discoverable via a thread mirror, but the authenticated X backend was unavailable; do not claim a personally verified X demo or infer a faithful property model from an impressive reconstruction. Approved property photos remain the only accommodation imagery.

Faithful review: http://127.0.0.1:4198/review.html; working journey: http://127.0.0.1:4196/. The review includes desktop/mobile before-and-after pages, both rendered concepts, and an actual browser motion recording. Current files are /private/tmp/seascape-waterline/final and waterline-motion.mp4; ten scene captures verify all five photo identities on both devices. Previous Open House proof is /private/tmp/seascape-next-proof/full-final; public live before is /private/tmp/seascape-next-proof/before. Local files are review aids; committed visual baselines and this brief preserve the source decision.

The old visual runner blocked Hostaway images and triggered a generic guide/OG fallback. That was misleading evidence, not proof of a live replacement. Live five-home photos loaded correctly September 4. The 62 reviewed photos are exact public Hostaway asset copies, with 800px responsive renditions (node scripts/prepare-property-photos.js); canonical records retain source URL, inspected date, dimensions and alt text. Missing photos render a named neutral notice. Faithful captures refuse missing/cross-property photos and use the real clock/network except blocked analytics. The local Netlify image-CDN substitute serves the exact source image, without CDN compression. Behavior-test availability, clock and checkout fixtures are simulated and cannot prove current quotes or bookability.

## Important discoveries and sources

Observed problems, not measured abandonment: trip dates were lost between catalog and details; cached opening/pricing context competed with the guest's selection; mobile booking controls competed with a fixed CTA; detail pages scattered sleeping/fee rules and asserted flexible cancellation. Public booking descriptions supply useful restrictions that were absent from discovery. Only Dockside has a private waterfront dock. River House is near Warner Bayou's public ramp and has an interior step. Pool Home prohibits pets, has entry/interior steps and cannot heat pool and spa simultaneously.

Reviewed guestFacts live in the existing property fallback, joined by slug even when operational data arrives from the safe projection/cache. Hostaway descriptions are evidence; conflicts are not silently resolved. Sarasota's public schema says 8 while narrative/canonical capacity say 12: show the canonical 12 and request confirmation for 9–12 before booking. Pool-heat day/night wording and parking counts conflict in some listings: omit disputed amounts/counts and ask. River check-in/out and pet terms are incomplete: do not infer. Room layouts do not increase permitted occupancy. Sawyer owns final source corrections in Hostaway; this task does not change external settings.

## High-conviction moves

| Move | Guest/owner problem and commercial mechanism | Evidence, uncertainty and maintenance | Cheapest useful test |
| --- | --- | --- | --- |
| Connected choice and booking | Compare rooms and restrictions, retain dates/group, reach the correct complete checkout total. Fewer restarts may produce more qualified handoffs. | Observed friction is strong evidence; lift is unproven. Existing Eleventy and tracking, no service cost. | Five observed guest tasks, then 28 days of qualified handoff and reconciled booking counts. |
| Answer the deciding question once | Canonical sleeping, pets, steps, dock, heating and fee conditions reduce repeated prebooking questions. Prepared email includes the exact home, dates, group and a fixed topic; the guest adds and sends the question. | Facts reviewed against public listings; exceptions explicit. One curated field set in the existing canonical record, reviewed when a home or policy changes. | Ask Sawyer which five questions repeat, compare incoming question topics before/after. No automated guest sends. |
| Let the organizer distribute Seascape | A privacy-clean shortlist link travels into the group's existing chat; friends can inspect the same comparison without an account. This is the surprising small-operator acquisition test. | Workflow works; sharing demand, group influence and repeat acquisition remain hypotheses. Very low maintenance; no new CRM or collaboration service. | Five consenting organizers share a real shortlist; observe whether other travelers evaluate it and whether the organizer reaches checkout. |

Preserve existing paid Mailchimp guest marketing and its consent path. Journey 8592/tag guest-capture already belongs to ops. Outlook post-stay sending remains disabled. Do not build or activate a second sender. A future useful local-partner test is a boat-trip planning referral that distinguishes Dockside's boat restrictions from River House's nearby public ramp; establish permission and demand before adding a commercial offer.

Reject a generic concierge chatbot and a Seascape-only ChatGPT app as the first acquisition investment. Neither fixes missing facts or guarantees discovery. Also reject a framework rewrite and a broad SEO page expansion. Existing guides already bring discovery; prioritize their path into a trustworthy collection. New content batches still need evidence of useful demand.

## AI: four distinct capabilities

| Capability | Source and freshness | Decision |
| --- | --- | --- |
| Discovery and citation | Crawlable canonical HTML, real property photos, consistent JSON-LD, sitemap, robots and existing AI summaries. | Preserve and improve fact accuracy; do not equate markup with actual citations. The existing /ai-discovery.json now exposes the same five records, sleeping layouts, restrictions, source dates and booking links. No extra endpoint proliferation. |
| Matching | Canonical capacity/location/amenities plus reviewed guestFacts. Missing answers remain explicit. | Deterministic comparison is useful now and reusable by assistants; model output is never truth. |
| Availability and complete quote | Hostaway per-request calendar/priceDetails, dates, full party, fees/taxes/currency/policies. Build snapshots do not answer selected dates. | This build hands off to Hostaway; cached openings remain freshness-bound and hidden for selected dates. A later API must revalidate, handle timeouts/429, and fail to a booking link without invented prices. |
| Checkout/reservation | Hostaway booking session and confirmation; a quote reserves nothing. | Handoff demonstrated without reservation/payment. In-assistant checkout is a separate permission and platform-eligibility project. |

Current official sources, checked September 4, 2026: OpenAI [submission](https://developers.openai.com/plugins/deploy/submission), [OAuth/anonymous access](https://developers.openai.com/plugins/build/auth), [metadata/distribution](https://developers.openai.com/plugins/guides/optimize-metadata), [local-services quote](https://developers.openai.com/plugins/guides/local-services-request-quote-conversion-spec), and [product checkout](https://developers.openai.com/plugins/guides/product-checkout-conversion-spec). A public app requires production MCP, developer verification, privacy/support information, test coverage, review and publication. Anonymous read tools can avoid login; personal actions need OAuth 2.1/PKCE. Partner checkout specifications do not establish lodging eligibility. No guaranteed directory placement or definitive flat operating fee was established; hosting, maintenance, monitoring and optional model calls remain costs. Technical feasibility is not launch permission or acquisition.

[Hostaway API](https://api.hostaway.com/documentation): server POST /v1/listings/{listingId}/calendar/priceDetails uses startingDate/endingDate/numberOfGuests, version 2. Public booking links instead use start/end/numberOfGuests. Credentials stay server-side. [Google Vacation Rentals](https://developers.google.com/hotels/vacation-rentals/dev-guide/onboarding) has structured ingestion for smaller inventory plus pricing/availability/landing and registration requirements. Confirm Seascape's existing Hostaway/provider route before creating a feed or paying for a channel. A broader destination/partner distribution route is more credible than relying on five-home branded-app discovery.

Product references: [Journi](https://www.getjourni.co/) for group decisions without a download; [Engine groups](https://engine.com/groups) for the organizer's job. These demonstrate product patterns, not Seascape demand.

## Measurement and proof boundaries

Accessible aggregate evidence is historical: the Aug 11 read for Aug 3–9 recorded 34 catalog and 82 guide-winner GA4 sessions. No fresh joined September aggregate was found. Do not invent conversion rates or revenue. Existing analytics-owned attribution can connect handoffs to reservations; this repo must not duplicate the measurement pipeline.

Verify event ingestion after release, then count homepage/catalog entry → detail → booking_engine_handoff → reconciled completed direct booking by source/device. Add shortlist and question-topic counts from existing tracking. No question text or contact data enters events/shared URLs. Compare contribution only with actual reservation and channel/payment cost evidence. Seasonal changes and low traffic limit causal claims; moderated tasks are the first useful test.

Earlier live Hostaway read: September 20–22, 2026 with eight Dockside guests displayed $1,093.70 including listed mandatory fees/taxes. This dated observation is not an evergreen quote or a guarantee those dates remain available. No reservation or payment occurred. New local browser tests intercept checkout navigation and must be labelled simulated; real review screenshots do not mock price or availability. Lab performance is not real-user performance.

## Continuation, verification and release

Sole mutation owner: this Codex session 01a06e5c-06cc-7e62-8c13-975dc3686728, branch codex/design-guest-decision-journey, draft PR 546. Root Astra-upgrades and unrelated worktrees remain untouched. Current source is intentionally unmerged. This brief supersedes the first catalog-only draft.

Run preview with npm run build and node scripts/enforcement/serve-static.js --root _site --port 4196. Journey: / → choose future dates and eight guests → /properties/ → compare two homes → share link → open a home → inspect sleeping/rules/interior photos → prepare a question or check dates/total → matching Hostaway listing. Verify incomplete/reversed/past dates, no-fit groups, clipboard denial, missing photos, keyboard menu/dialog, no-JS path and trip clearing.

Current September 5 source proof:
- Native release gate passed: 904 unit tests, property truth, content 22/22, build, design lint, recovery, redirects, all internal links on 162 pages and 688 JSON-LD blocks. No hook or test skipped.
- Native browser suite: 130/130 passed on desktop/mobile, including all-five scenes, latest-choice image loading, missing-photo identity, keyboard/no-JS/reduced-motion paths, comparison/share privacy, date errors, no-fit groups and simulated Hostaway handoff. Editing the homepage trip before search now preserves the new dates into a home; the old failure was reproduced first.
- Faithful production-data proof: home, collection and all five details on both devices, real photos, no mocked price/availability. Additional 375px/tablet overflow checks passed. Parent inspected the actual mobile/desktop journey and bright-photo scene variants.
- Three-run mobile Lighthouse budgets passed unchanged for home/catalog/Dockside. Median LCP 3.98s / 2.93s / 2.40s; maximum CLS 0.046 and TBT 0ms; transfer approximately 679KB / 644KB / 340KB. These are local lab measurements, not real-user results. Homepage-only CSS keeps the catalog below the existing 50KB stylesheet budget.
- Logs and faithful proof: /private/tmp/seascape-waterline/{release.log,visual-native.log,performance.log,final,scene-proof.json}. The earlier two AMI image-delivery fixes remain intact; their three-run LCP 3.53s/3.54s and unchanged snapshots were verified before this visual revision.
- Current-head GitHub CI and independent final review must be read from PR 546; historical catalog-only or Open House heads do not verify Waterline. The separate critic approved the direction with minor refinements, which were integrated. No model-generated property facts were introduced.

A real September 4 homepage → comparison → Dockside handoff preserved September 20–22, 2026 and eight guests; Hostaway displayed $1,093.70 including listed fees/taxes. That dated observation is not an evergreen quote. This revision's manual local journey preserved December 5–12 and eight guests into the correct public booking URL; automated checkout destinations are simulated. Neither action reserved or paid.

Release dependency: draft PR 547 at 8ea5893e4121450d50a2573508c187974905da9e fixes inherited random tracking IDs that the PII filter can reject. It changes token generation while keeping privacy filters unchanged; its separate release/browser/CI proof is on that PR. Release 547 before 546. Do not duplicate the repair or weaken filtering. The previous combined tree passed four forced-ID handoff replays; reread mergeability for the new 546 head before release.

Keeper: draft PR 546, branch codex/design-guest-decision-journey. Root Astra-upgrades and unrelated worktrees remain untouched. Parent session is sole mutation owner. A personal repository with one human merger and zero required submitted approvals was confirmed this session; the Boundary review route is a separate read-only current-head analysis, not a submitted GitHub approval. Keep draft; no merge or deploy in source closeout. Six inherited development-tool dependency alerts remain separate maintenance; this revision adds no package dependencies.

Exact release decision: Sawyer approves releasing 547, then 546. The main-linked Netlify build runs npm run build and publishes _site, so merge may activate production and needs explicit release authority. After approval, verify the Netlify deploy's exact merged SHA; data-guest-version/data-catalog-version must read waterline-v3. Inspect all-five photo identity, mobile/desktop trip continuity and the real Hostaway dates/full total without booking; run existing live recovery/entity checks and verify receipt identity. Merged source is not deployed proof.

Rollback under release authority: restore the previous verified Netlify deploy, or revert the bounded source change and rebuild. Preserve tracking and property truth. Keep this clean worktree while its preview is useful; remove through the broker only after approved landing and fresh inactivity/equivalence proof.

## Gate 0 — existing guest journey, no new SEO cluster

This final qualitative search read checks the product decision against current alternatives. It is not a localized Google ranking report or evidence of demand/lift. The initial direction was developed before this read; source and rendered guest failures drove implementation.

| Field | Evidence / decision |
| --- | --- |
| Target query family | Bradenton vacation rental private pool 12 guests direct booking; Sarasota vacation rental private pool families; Anna Maria Island vacation rentals compare homes. |
| Searcher intent | guest booking and comparison |
| Current Seascape URL | https://seascape-vacations.com/ and https://seascape-vacations.com/properties/ |
| SERP observed date | 2026-09-04 |
| SERP stale after | 2026-09-11 |
| Current proof | 2026-09-04 source, rendered mobile/desktop and live Hostaway handoff. Historical Aug 3–9 GA4 counts are described above; no fresh September GSC or joined booking-impact estimate. |
| Top visible competitors | Visible in returned search results, without rank-order claims: Mi Casa Sarasota, Anna Maria Vacations, Savvy. Saltwater Siesta also appeared, but its reader returned a CAPTCHA warning and was excluded from inspected-page evidence. |
| Competitor angle | Mi Casa: single-home family amenities/photos/reviews; Anna Maria Vacations: large inventory, direct contact and offers; Savvy: broad direct-booking inventory plus destination FAQs. |
| Visual/format gap | Page-content read shows home photography and concise capacity facts, catalog/search framing and destination FAQs. Match clear home identity; answer differently with room-by-room comparison and a shared trip. This read does not claim a full rendered competitor audit. |
| Seascape gap | Fragmented trip state, thin room/rule explanations, inconsistent photo proof, and separate detail templates. These were directly observed in Seascape source/rendered journeys. |
| Search fit | Preserve existing homepage and catalog intents. Help existing discovery become a suitable-home handoff, without new landers or island-location overclaims. |
| Local/GBP proof | No GBP/map-pack change in this task; canonical Bradenton/Sarasota geography and the existing tourism-profile entity links remain. |
| AEO/readback note | Existing discovery JSON now exposes the same canonical property facts, source dates and booking boundaries. No claim of increased citations or AI bookings. |
| Recommendation | improve: connect src/index.njk, src/properties/, shared property/layout components and existing AI discovery facts; preserve canonical routes and guide inventory. |
| Attack status | completed |
| Query variants inspected | Bradenton vacation rental private pool 12 guests direct booking; Sarasota vacation rental private pool families book direct; Anna Maria Island vacation rentals compare homes direct booking. |
| SERP source | Available web search, three named queries on 2026-09-04; qualitative returned results, not controlled organic positions. |
| Competitor URLs inspected | https://casasarasota.com/ ; https://www.annamaria.com/rentals/ ; https://www.savvy.com/vacation-rentals/united-states/florida/anna-maria-island |
| Content gap and Seascape answer | Five actual homes allow a compact comparison of sleeping arrangements, pets, steps and dock restrictions, then one accurate booking handoff. Broad destination FAQs are not the differentiator. |
| Design/format strategy | Waterline photographic arrival and postcard collection, real local photos, conventional date controls and an account-free comparison. No imitation of competitor identity. |
| Seascape proof available | Canonical property data, reviewed public Hostaway descriptions/photos, before/after renders, 130 passing browser checks and dated live dates/guest/total readback. |
| Tools/plugins used | Web search; Agent Reach Jina read-only page reader; existing Playwright and repository tools. No paid service or plugin installation. |
| Decision and reason | Keep the five-home organizer direction. It addresses observed choice/handoff defects and can be tested without speculative platform work or a new acquisition claim. |

## September 6 release repair
Source files also include `src/about-us/index.njk` for the two existing text contrast failures exposed by the new guest-route accessibility coverage.
The rendered guide detour dropped dates and party size. Preserve the existing validated trip fields across same-origin guides, stays, properties, the homepage and About page. Reuse the Waterline header and footer on these connected page families, preserving editorial body layouts and the owner funnel. This repairs the approved guest direction; it adds no SEO cluster or new property claims. Replace the unfulfilled “Meet your hosts” label with “About Seascape” and remove the guide index's redundant reading instructions. Acceptance: desktop/mobile guide-to-stay-to-property form and checkout retain dates and party size; rendered navigation, images and menus remain usable; release checks and live handoff pass.

## Required Internal Link Map
- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/

## September 6 release readiness
The combined branch includes the exact attribution fix from #547 and the connected-guide repair. Canonical verification passed 910 unit tests, release checks, 162-page link validation and 688 JSON-LD blocks. The native fixture-aware browser suite passed 144 desktop/mobile tests. Separate read-only source and rendered review found no blocking issue at source commit `2bbd442c29a9b9d4616a226b7e7020fd90560709`.

A pre-release browser check used the actual generated handoff into public Hostaway listing 206016. December 1–8, 2026 and eight guests appeared in the real booking form with a full total; no inquiry or reservation was submitted. The November 7–14 test dates were unavailable in Hostaway and its UI cleared those selections. Preserve this distinction: local tests prove URL/state handling; only the booking engine confirms availability. The combined source can be released once, with #547 closed as incorporated after verified merge, rather than requiring two production deploys.

Production is unchanged. Automatic approval review rejected the merge because it still applies the initial no-production limit. Do not retry a production action without the direct approval needed to clear that block. The current Codex task remains the sole mutation owner and merger. The pre-release Netlify deploy is `6a9cc3a4471f8e000861a36b`, commit `6d93d9ef021f0d488df4088b2bd13c9d6916fa64`; retain it as the rollback target. After release approval, merge the verified combined #546 head, read Netlify's deployed commit, repeat the live public handoff, and close #547 only after its change is verified in main.

## September 9 — approved Waterline owner and email capture completion

Sawyer chose the Waterline direction and asked to fix owner and email-capture gaps before launch. This task owns the continuation on `codex/waterline-owner-email`; the previous branch stays preserved. This section supersedes the earlier branch ownership, dependency order and prepare-state notes above. Production launch is held for the exact release decision after current proof.

Revenue lever: preserve owner enquiry discovery and guest email acquisition while improving the guest home-selection experience. Owner: seascape-vacations-site for templates and tracking; seascape-ops for email delivery; seascape-analytics for measured outcomes. Proof: rendered desktop/mobile owner navigation and review form, mocked homepage email capture success/pending/error/retry and privacy, retained guide capture, current GA4 booking lineage, canonical release and visual gates. Stop: defer production launch and further visual expansion until these paths pass. No new campaign, sender, form endpoint, commercial offer or infrastructure is introduced.

Design critic: Approved with edge for a compact editorial owner band and inline signup under the existing collection; preserve Waterline imagery, typography, paper/marine surfaces and 44px controls. Desktop nav gains Property Owners; tablet/mobile use the existing menu before links collide. The owner section links to the existing review form and service page. Signup uses the existing required name/email fields, capture metadata and response states; it reveals SAVE50 only after completed capture. Without JavaScript, a readable fallback replaces the form. Native form validation and visible consent remain. No popup returns to the core guest journey.

Changed additions: `src/index.njk`, `src/_includes/partials/guest-header.njk`, `src/css/arrival.css`, `src/css/guest.css`, `src/assets/js/guest.js`. Integration preserves current main attribution, schema coordinates/nested reviews and factual guide repairs. Existing owner form fields and backend, Mailchimp integration and guide capture contracts remain unchanged. New section copy is grounded in the current owner review and existing homepage SAVE50 offer; no new outcome or response-time claim.

Voice pass: Approved. Reader copy names the owner problem and guest offer, contains no internal process language, and preserves the existing three-night/first-direct-booking terms and unsubscribe/privacy disclosure. Tests use synthetic data with intercepted submission; no real signup, owner lead, email, booking or payment is authorized by this preparation task. Email delivery and conversion lift remain unproven until separately authorized live readback.

The integration includes current-main factual repairs on the following existing routes; preserve those corrections while applying the approved guest shell.

- source files likely to change: `src/_includes/layouts/base.njk`, `src/_includes/layouts/guest.njk`, `src/_includes/layouts/guide-field-journal.njk`, `src/_includes/layouts/property.njk`, `src/_includes/partials/analytics-ga4.njk`, `src/_includes/partials/guest-footer.njk`, `src/_includes/partials/guest-header.njk`, `src/_includes/partials/guest-trip-form.njk`, `src/_includes/partials/local-font-head.njk`, `src/_includes/partials/property-card-image.njk`, `src/_includes/partials/property-schema.njk`, `src/_includes/partials/ui-icon.njk`, `src/about-us/index.njk`, `src/ai-discovery.json.njk`, `src/guides/2026-bradenton-vacation-rental-market-analysis.html`, `src/guides/anna-maria-city.html`, `src/guides/anna-maria-island-area-guide/index.html`, `src/guides/anna-maria-island-beaches.html`, `src/guides/anna-maria-island-noise-ordinance-guide.html`, `src/guides/anna-maria-island-vs-clearwater-beach.html`, `src/guides/anna-maria-island-vs-longboat-key.html`, `src/guides/anna-maria-island-vs-siesta-key.html`, `src/guides/best-restaurants-anna-maria-island.html`, `src/guides/best-time-visit-anna-maria-island.html`, `src/guides/best-waterfront-restaurants-with-boat-dock.html`, `src/guides/bradenton-area-guide/index.html`, `src/guides/bradenton-beach-area-guide/index.html`, `src/guides/bradenton-beach.html`, `src/guides/bradenton-insider-guide.html`, `src/guides/bradenton-vs-sarasota-for-families/index.html`, `src/guides/bradenton-vs-sarasota.html`, `src/guides/bradenton-vs-tampa-vacation-rentals.html`, `src/guides/do-you-need-a-car-anna-maria-island.html`, `src/guides/dolphins-manatees-bradenton.html`, `src/guides/family-vacation-anna-maria-island.html`, `src/guides/fishing-guide-anna-maria-sarasota.html`, `src/guides/flights-to-anna-maria-island/index.html`, `src/guides/holmes-beach-area-guide/index.html`, `src/guides/holmes-beach-vs-bradenton-beach.html`, `src/guides/holmes-beach.html`, `src/guides/how-to-get-to-anna-maria-island.html`, `src/guides/index.njk`, `src/guides/is-anna-maria-island-worth-visiting.html`, `src/guides/longboat-key-area-guide/index.html`, `src/guides/pet-friendly-anna-maria-island.html`, `src/guides/sarasota-area-guide/index.html`, `src/guides/siesta-key-area-guide/index.html`, `src/guides/siesta-key-beach-guide.html`, `src/guides/snowbirds-guide-extended-stays-florida.html`, `src/guides/things-to-do-bradenton-fl.html`, `src/guides/where-to-stay-near-anna-maria-island/index.html`, `src/index.njk`, `src/properties/bradenton-pool-home/index.njk`, `src/properties/dockside-dreams/index.njk`, `src/properties/index.njk`, `src/properties/river-house/index.njk`, `src/properties/sarasota-luxe/index.njk`, `src/properties/the-oasis/index.njk`, `src/research/gulf-coast-vacation-booking-trends-2026.njk`, `src/stays/stays.njk`

## September 10 usability repair

Preserve the approved Waterline composition and property facts. Raise undersized supporting text to 12px and mobile body text to 15px; use 44px navigation and footer targets. Strengthen the photographic scrim, size catalog ordinals to fit, show plus/check comparison states, and wrap comparison row labels. Apply marine/paper styling to the existing SAVE50 panel. Restore Guest Support and booking/cancellation links using the existing routes; no policy or offer terms change. The scoped browser regression checks exercise these rendered states on desktop and mobile. Broader owner/legacy shell redesign, new reviews, fonts, maps, pricing, and gallery enhancements are outside this repair.

## September 30 capacity repair — source files changed

- `src/_data/properties-fallback.json`
- `src/_data/seoPages.json` (only the Blue House guest count in the pool-and-hot-tub stay intro)
- `src/llms.txt`
- `src/_includes/layouts/property.njk` (separate capacity provenance; other homes keep existing notes)
- `src/ai-discovery.json.njk` (optional capacity verification date)

## Gate 0 — September 30 property capacity correction

This receipt applies only to the confirmed capacity correction. No new search lane or experiment is opened.

| Field | Required answer |
| --- | --- |
| Target query family | Exact property identity check only; no new keyword target |
| Searcher intent | Confirm the group capacity of Pickleball Pool Home Retreat |
| Current Seascape URL | `/properties/blue-house/`, `/stays/vacation-rentals-with-pool-and-hot-tub/` |
| SERP observed date | 2026-09-30 |
| SERP stale after | 2026-09-30 |
| Current proof | Sawyer direct capacity confirmation and current exact booking-listing 589288 heading/data/schema read, 2026-09-30; pre-edit Site source says 10 |
| Top visible competitors | No same-property competitor evidence used; the exact-name search returned Seascape detail, homepage and catalog plus unrelated listing results |
| Competitor angle | Not a competitor or ranking action; preserve the existing page intent |
| Visual/format gap | None; one count changes inside the existing sentence |
| Seascape gap | Pool-and-hot-tub stay intro hard-codes sleeps 10 while approved Blue House capacity is 11 |
| Search fit | Existing property and stay pages retain their URLs, titles, intent and checkout destination |
| Local/GBP proof | Not applicable because the task corrects one home's capacity, without a GBP/local-pack change |
| AEO/readback note | Align visible stay copy with property/schema/AI facts; no citation or ranking lift is claimed |
| Recommendation | Correct the Blue House count to 11 and prove generated surfaces agree |
| Attack status | none found after named checks |
| Query variants inspected | Exact name: "Pickleball Pool Home Retreat" Bradenton |
| SERP source | Web search of that exact name on 2026-09-30; Seascape snippets still showed the pre-release 10, with cached crawl ages distinct from current booking truth |
| Competitor URLs inspected | None. Current source check covered property fallback, seoPages and templates; the SERP check used the exact-property query; competitor-page inspection was deliberately omitted because unrelated listings cannot establish this home's approved capacity |
| Content gap and Seascape answer | 4 bedrooms, 2 bathrooms, up to 11 guests; preserve sleeping layout and amenity limits |
| Design/format strategy | Existing shared templates and one unchanged stay paragraph |
| Seascape proof available | Direct Sawyer confirmation and exact booking page data, September 30 |
| Tools/plugins used | Connected GitHub source reads, read-only booking GET, web search, native regeneration and Site release gate |
| Decision and reason | Correct: one factual count conflict, no expansion or impact claim |

## October 1 trip memory

Third slice of the booking-path direction Sawyer approved on 2026-10-01. A guest's last arrival date, departure date and guest count are kept in this browser (`localStorage` key `seascape_trip`, 30 days) and nothing else is stored with them. The page address remains the source of truth: memory fills only a guest page (homepage, `/properties/`, guides, stays, About) whose address names no trip, and never an owner page, a shared comparison link, or an address whose own dates were rejected. Changing the trip in a form replaces the memory; clearing the trip forgets it. A blocked or full browser store changes nothing else.

Source: `src/assets/js/conversion-tracking.js` (`rememberTrip`, `restoreRememberedTrip`), `src/assets/js/guest.js`, `src/assets/js/catalog.js`, and `src/properties/index.njk`, which now loads the tracking script before the catalog script so the catalog reads the restored address. The catalog therefore applies the booking handoff fields to its own booking links, as the home pages already do. No event is added or renamed. Proof: `scripts/enforcement/trip-continuity.test.js` and `tests/visual/trip-continuity.spec.js`. Anti-claim: a remembered trip does not prove availability, price or a reservation.

## October 1 home page booking button

Fourth slice of the booking-path direction Sawyer approved on 2026-10-01. On a home's page the three booking buttons (beside the heading, in the booking panel, and in the bottom bar on a phone) now say the same word and do the same thing:

| What the page knows | Button | Where it goes |
| --- | --- | --- |
| No dates yet | `Check dates` | The date fields |
| Dates open, group size chosen | `Book these dates` | Hostaway's priced checkout for this home and stay, in the same tab |
| Dates open, no group size | `Book these dates` | The group-size field |
| Dates booked | `See open homes` | `/properties/` with the dates and group size kept |
| Minimum stay, or a closed arrival or departure day | `Check dates` | The date fields, with the existing message |
| The dates check failed or the calendar could not be read | `Check dates` | The home's booking page with the trip filled in, in the same tab |

The separate text link `Open the booking page` is removed. On a phone the button beside the heading is hidden, so the bottom bar is the one booking button; desktop keeps the heading button.

Reader copy added or changed: `Check dates` (was `Check dates & total`), `Book these dates`, `See open homes`, `Choose your dates and group size. You’ll see the full price before you pay.`, `These dates are open. You’ll see the full price on the next screen, before you pay.`, `These dates are open. Choose your group size to book them.` and `Choose your arrival and departure dates.`

Source: `src/assets/js/guest.js`, `src/_includes/layouts/property.njk`, `src/_includes/partials/guest-trip-form.njk`, `src/css/guest.css`, and `src/assets/js/conversion-tracking.js` (a checkout address now carries the same home and listing fields as a listing address). No event is added or renamed; `property_booking_page_click` reports the checkout press. Proof: `tests/visual/home-booking-button.spec.js`, `scripts/recovery/assert-direct-booking-event-smoke.js`, and a daily live-smoke check in `scripts/recovery/assert-live-smoke.js` that loads the checkout address for an open stay and fails when the priced checkout stops appearing.

Anti-claims: open dates come from a cached calendar and are not a quote or a reservation; the page promises the full price before payment and says nothing about cancellation terms on the checkout screen; nothing is reserved until the guest pays on Hostaway.

## October 2 catalog card to checkout

Fifth slice of the booking-path direction Sawyer approved on 2026-10-01. On `/properties/`, once the live dates check confirms a home is open, that home's card button and its button in the comparison say and do what the home's own page does:

| What the catalog knows | Button | Where it goes |
| --- | --- | --- |
| No dates yet | `Check dates` | The home's booking page, in a new tab (unchanged) |
| Dates open, group size chosen | `Book these dates` | Hostaway's priced checkout for that home and stay, in the same tab |
| Dates open, no group size | `Book these dates` | The group-size field; the size chosen there applies at once |
| Dates booked, or a stay rule not met | none | The card is hidden, as before |
| The dates check failed or a calendar could not be read | `Check dates` | The home's booking page with the trip filled in, in a new tab (unchanged) |

Reader copy added or changed: the count line after an open-dates answer ends `You’ll see the full price before you pay.` with a group size and `Choose your group size to book.` without one (was `Price and cancellation terms are on the booking page.`); the trip status says `These dates are open. Choose your group size to book them.` when a guest presses `Book these dates` without a group size; the comparison's trip line ends `These dates are open.` when the dates check confirmed the homes shown (otherwise `Dates and prices need confirmation.`, unchanged). The card note `Full price, fees and cancellation terms on the booking page.` is unchanged; Hostaway's checkout screen shows the total and the cancellation policy (read on 2026-10-02, load and read only).

Source: `src/assets/js/catalog.js`, plus one rule in `src/css/catalog.css` that keeps the comparison's button at its phone size so the longer word fits on two lines. No event is added or renamed; `catalog_book_direct_click` reports the checkout press and is sent before the same-tab navigation. Pressing `Book these dates` without a group size reports no booking click. Proof: `tests/visual/catalog-card-checkout.spec.js` and the daily checkout-address check in `scripts/recovery/assert-live-smoke.js`, whose rollback message now names both the home page and the catalog.

Anti-claims: the same as the home page button. Open dates come from a cached calendar and are not a quote or a reservation; nothing is reserved until the guest pays on Hostaway.
