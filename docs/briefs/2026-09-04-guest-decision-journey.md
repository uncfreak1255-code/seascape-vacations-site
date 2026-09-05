# Waterline — guest journey and continuation

- persona: The person organizing a shared Gulf Coast vacation.
- primary keyword: vacation rentals near Anna Maria Island (existing intent).
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals.
- audience pattern: Compare real homes, understand sleeping and restrictions, keep the trip, check the complete total.
- proof source: Canonical properties-fallback.json via properties.js; public Hostaway listing descriptions and photography inspected September 4, 2026; rendered live before and local after.
- required internal links: /properties/, /guides/
- CTA target: The selected home's public Hostaway listing at book.seascape-vacations.com.
- anti-claims: No invented amenities, unconditional pet permission, step-free access, cancellation guarantees, savings percentages, selected-date availability or model-generated prices. No revenue lift claimed.

## Decision and scope

September 5 copy decision: Sawyer prefers “our homes” with no fixed inventory count. Apply this across navigation, homepage, catalog and descriptive metadata. Dunia’s Blue Pool House and Lily’s home are planned additions, not published inventory; photos, verified facts and bookable Hostaway records remain required before adding either. Per-home capacity and room counts remain factual. The decorative scene number is an ordinal, with no inventory-total denominator.

North Star: make Seascape the easiest small collection for a group organizer to choose with confidence. Five distinct homes and a person who knows them are the advantage. Build the choice, then carry it intact to the authoritative quote and checkout.

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
