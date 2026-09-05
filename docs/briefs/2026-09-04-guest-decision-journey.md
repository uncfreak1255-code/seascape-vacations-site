# Open House — guest journey and continuation

- persona: The person organizing a shared Gulf Coast vacation.
- primary keyword: vacation rentals near Anna Maria Island (existing intent).
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals.
- audience pattern: Compare real homes, understand sleeping and restrictions, keep the trip, check the complete total.
- proof source: Canonical properties-fallback.json via properties.js; public Hostaway listing descriptions and photography inspected September 4, 2026; rendered live before and local after.
- required internal links: /properties/, /guides/
- CTA target: The selected home's public Hostaway listing at book.seascape-vacations.com.
- anti-claims: No invented amenities, unconditional pet permission, step-free access, cancellation guarantees, savings percentages, selected-date availability or model-generated prices. No revenue lift claimed.

## Decision and scope

North Star: make Seascape the easiest small collection for a group organizer to choose with confidence. Five distinct homes and a person who knows them are the advantage. Build the choice, then carry it intact to the authoritative quote and checkout.

The first draft improved only the catalog. This revision connects the homepage, catalog, comparison/share link, all five detail pages, prepared property questions and Hostaway handoff. Keep existing canonical routes, attribution, guide discovery, reviewed guest reviews and SAVE50 email landing continuity. Retire the unidentified homepage hero, competing baseline prices, weather ticker, automatic homepage discount popup, blanket cancellation language and five duplicated detail templates. No framework, account, model, database or new service is needed.

Sawyer explicitly authorized revising repository-owned design and process decisions. DESIGN.md now records an editable Open House direction. Existing visual rules were preferences, not evidence. Security, accurate facts, ownership, source review and separate deployment authority remain requirements. Inventory and surface audit found no reason for new agents, skills or review machinery.

## Design decision and faithful evidence

Two small rendered directions used real property assets: Open House (light editorial, separate photography and text, visible trip controls) and Afterglow (dark photographic cover). Chose Open House: it gives each actual home an identity and keeps the decision controls legible. Afterglow's mobile image cover delayed the form and resembled broad luxury marketing. Keep local Playfair/Poppins; use warm white, deep marine, clay accents, restrained rules and rectangular controls. Important photography includes interiors, sleeping spaces and bathrooms, not just five exterior thumbnails.

Live before: /private/tmp/seascape-next-proof/before. Alternatives: /private/tmp/seascape-next-proof/directions. Local after: /private/tmp/seascape-next-proof/after-final. Interactive before/after review: http://127.0.0.1:4197/review.html; working journey: http://127.0.0.1:4196/. Public Hostaway source snapshots and numbered photo contact sheets are in the same temporary proof directory. These are reproducible local review files, not permanent business records. The committed visual baselines and this brief are the durable continuation.

The old visual runner blocked Hostaway images and triggered a generic guide/OG fallback. That was misleading evidence, not proof of a live replacement. Live five-home photos loaded correctly September 4. The 62 reviewed property photos are local copies of the exact public Hostaway assets, with smaller 800px renditions for responsive delivery (regenerate with node scripts/prepare-property-photos.js); the canonical record stores source URL, inspected date, dimensions and alt text. Missing photos render a named neutral notice. Proof refuses missing or cross-property photos. Review captures use the real clock/network except blocked analytics; CI behavior fixtures must remain explicitly identified as simulated, and cannot prove availability or prices.

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

Final local proof on September 4, 2026 (local date): full native browser suite 116/116 passed, including desktop/mobile journeys, accessibility and snapshots. After Sawyer approved the specific UI test migration, the full release check passed all 904 unit tests; content checks passed 22/22. Recovery p0/guides/remediation, 448 redirects, all internal links on 162 pages, and 688 JSON-LD blocks passed. The full unchanged release gate passed against the actual working diff using --range origin/main, including property-truth, build, unit, design lint and all recovery/link/schema checks. Final normal build restored the non-fixture preview. Logs: /private/tmp/seascape-full-visual-final.log, /private/tmp/seascape-release-approved.log and /private/tmp/seascape-content-approved.log. The actual homepage → two-home comparison → Dockside handoff preserved September 20–22 and eight guests; Hostaway showed the $1,093.70 full total, with no booking/payment action. Proof: /private/tmp/seascape-next-proof/hostaway-final.png.

Current lab verification: three mobile Lighthouse runs each for homepage, catalog and Dockside passed the unchanged 4.5s LCP / 0.2 CLS / 300ms TBT budgets. Median LCP: 2.48s / 2.48s / 2.55s; transfers 578KB / 689KB / 344KB. The first new catalog run failed at 9.68s; hiding eager comparison downloads, responsive photos, and guest font swap/preload fixed it. These numbers are local lab measurements, not production real-user performance.

Independent rendered critic found no material visual weakness. A separate read-only check of the final recovery assertion migration found no coverage regression; real photo, contact/legal, navigation, trip-form and anti-fake-live checks remain enforced. Behavior review's confirmed pet-schema and no-JS capacity findings are fixed and tested. Its alleged question-email leak was retracted after inspecting the actual listener; real-click proof confirms topic-only events. Sanitizers now also omit non-HTTP URL schemes.

The earlier automatic-approval blocker is resolved: Sawyer approved the exact four-test migration, it was applied, and all 11 UI-runtime tests now pass. No hook or test was skipped. The migration verifies current legal/contact routes, native trip controls, mobile booking shortcuts and absence of false live claims. The full 904-test suite also passes.

Draft PR 546 is the keeper for this expanded revision. Use its current head, CI and review state for continuation; historical results for the first catalog-only f053a848 head do not verify this revision. The source remains on the isolated branch; root Astra-upgrades and unrelated work remain untouched. Current GitHub readback confirms a personal repository with one human collaborator with merge access and zero required submitted approvals; use the separate read-only current-head review route for this Boundary change. This session remains the sole branch mutation owner. Do not merge or deploy as part of source closeout.

Release decision belongs to Sawyer. The main-linked Netlify build runs npm run build and publishes _site; merging can therefore activate production. This task authorizes a draft PR, not merge/deployment. After explicit approval, read the Netlify deployment for the exact merged SHA, verify data-guest-version/data-catalog-version open-house-v2, photo identity, mobile/desktop continuity and real Hostaway dates/total without booking. Run the existing recovery live/entity checks. Merged source alone is not live proof.

Rollback: restore the previous verified Netlify deploy or revert this bounded source change and rebuild with production authority; preserve tracking and property truth. Keep this clean review worktree while the preview is useful; remove it through the broker only after approved landing and fresh inactivity/equivalence proof.

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
| Design/format strategy | Open House editorial composition, real local photos, conventional date controls and an account-free comparison. No imitation of competitor identity. |
| Seascape proof available | Canonical property data, reviewed public Hostaway descriptions/photos, before/after renders, 116 passing browser checks and live dates/guest/total readback. |
| Tools/plugins used | Web search; Agent Reach Jina read-only page reader; existing Playwright and repository tools. No paid service or plugin installation. |
| Decision and reason | Keep the five-home organizer direction. It addresses observed choice/handoff defects and can be tested without speculative platform work or a new acquisition claim. |
