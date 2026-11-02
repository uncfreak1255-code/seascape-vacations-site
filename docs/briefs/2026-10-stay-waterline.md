# Brief: Shared stay collections on Waterline

- lifecycle: active
- approved scope: Sawyer, October 31, 2026: migrate the stay template to Waterline; fix the legacy exception and design checks; preserve copy, SEO and booking links; show a preview before publishing. Local implementation/preview is authorized; no push, public PR, merge or production activation before preview selection.
- owner: Codex chat 01a18dda-ff9c-73e3-8451-d3f1e9e059ee, sole writer and eventual merger; worktree .worktrees/stay-waterline, branch codex/stay-waterline, base 696f0abf185630596d01a50554f6747cc66602c2.
- persona: Guest comparing real Bradenton/Sarasota homes and their trip tradeoffs before opening property details.
- primary keyword: Existing stay-collection intents; no keyword or ranking change.
- secondary keywords: Existing per-page terms preserved verbatim.
- audience pattern: Read the collection's existing answer, compare the listed homes and follow its existing property/booking links.
- proof source: Current DESIGN.md, shared Waterline guest.css and catalog/activity-guide patterns; all 58 active generated stay pages at base 696f0abf; October 31 rendered diagnosis of family page versus homepage/Rainy Day.
- required internal links: /properties/, /guides/
- Source files changed in this batch:
  - `src/stays/stays.njk`
  - `src/stays/index.njk`
  - `src/_includes/partials/stay-property-photo.njk`
  - `src/_includes/partials/stay-family-homes.njk`
  - `src/_includes/partials/stay-supporting-actions.njk`
  - `src/_includes/partials/catalog-trip.njk`
  - `src/_includes/partials/catalog-comparison.njk`
  - `src/properties/index.njk`
  - `src/css/stay-family.css`
- family reference links: /properties/bradenton-pool-home/ and /properties/the-oasis/ stay on the family collection; other generated collections keep their own matched homes. The 59-route preservation check verifies every original destination, rather than requiring those two homes on all shared-template renders.
- CTA target: Every existing anchor destination and tracking tuple remains unchanged, including hero/section jumps, property cards, bottom and mobile booking actions.
- anti-claims: No copy rewrite, new property fact, rate, review, savings or availability promise. Preserve all existing text, metadata, JSON-LD, link destinations/order, tracking and photos; no held guide edits, host changes, paid checks, new dependencies or schedules. Existing copy is preserved, not newly fact-certified.

## Design intake and scope

Surface: src/stays/stays.njk generates 58 active leaf collections; src/stays/index.njk is a separate hub. Family reference: http://127.0.0.1:4197/stays/family-vacation-rentals-anna-maria-island/; prior screenshots in /private/tmp/seascape-family-pool-proof-20261031. Current law: paper/ink/citron/clay, Instrument Serif/Poppins, existing space scale, 4px controls, 12px minimum text, 44px touch controls, full-page F1/F2/F3. Reuse the existing shared header/footer and SVG family, actual current property photos, no decorative data or new interactions.

Business job: make the collection visually consistent with the current site while preserving each guest's path into an appropriate home. Current failures: the active template embeds legacy colors/Playfair/rounded cards; the design scanner omits src/stays; the body lacks whole-page floor coverage; family page has no dedicated visual route. These were observed in actual work, not synthetic guard probes.

Prepare two local rendered directions inside existing Waterline art direction: A, an editorial split opening tied to the current Seascape catalog; B, a photographic opening tied to the current Seascape homepage. Both retain DOM text/order and all metadata/actions. Specialist/critic select a recommended direction before source styling; Sawyer chooses the preview before publication. The donor scan classified site-page, found an optional frontend-design metadata match and no evidence-audit capability; no donor was invoked or installed.

## Boundary invariants and proof (before implementation)

Must not break: all 58 current routes, original reader words/order, title/meta/robots/canonical/JSON-LD, named-home/price facts, existing photo identity, all href/tracking tuples, section anchors, shared shell, FAQ parity and no-JavaScript access. Baseline snapshots come from an unchanged build at the base revision. Compare every generated leaf before/after, not only the family page. A mismatch blocks preview readiness; no normalization may discard reader words or semantic SEO data.

Independent design acceptance comes from DESIGN.md and the current rendered catalog/guide reference. The old template must fail a focused assertion for the Waterline body class/shared sheet and design-scanner coverage. Plant a legacy/off-brand style in a temporary stay template and observe the existing design lint catch it after the coverage fix; never add a baseline exemption for migrated stays. Register family stay in the existing visual route/floor family map. Prove the floors exercise the whole body and reject a missing migrated class.

Local browser proof: 1440, 1024, 768, 393, 375 and 360 widths; no overflow or covered final content; real property photos load; menu and anchor/booking links work; desktop/mobile axe plus existing full visual/release gates. Reuse native tests and screenshot helpers. CSS/template edits only; preserve data and scripts. Preview variants belong only to local preview tooling, not public visitor controls.

## Gate 0 Search And Attack Receipt

This is a guest-interface refinement requested from the preview, not an SEO
priority change. The checker treats the added property name as search-facing
copy. Free public reads below supply its required context; they establish no
ranking, demand, recommendation lift or new property claim.

| Field | Evidence / decision |
| --- | --- |
| Target query family | Existing family/private-pool rentals near Anna Maria Island; unchanged. |
| Searcher intent | Compare a real home and continue to that home's dates. |
| Current Seascape URL | https://seascape-vacations.com/stays/family-vacation-rentals-anna-maria-island/ (implementation reviewed on local 4212). |
| SERP observed date | 2026-10-31 |
| SERP stale after | 2026-11-07 |
| Current proof | 2026-10-31 user-marked desktop screenshot; old generic action failed the identity test; 27 current browser checks pass. |
| Top visible competitors | Airbnb family collection and Seabreeze private-pool collection appeared in the public search read; no ordered-rank claim. |
| Competitor angle | Airbnb presents distinct named family listings; Seabreeze presents a pool collection with dates/guest filters. |
| Visual/format gap | Local stay cards put a generic narrow action far from each home's title. |
| Seascape gap | Each action needs a clear visible home identity and closer grouping with its own price/specs. |
| Search fit | Keep existing keyword, answer, title, metadata and schema content; improve the existing conversion decision only. |
| Local/GBP proof | Not applicable: no Maps/profile/local-entity change. |
| AEO/readback note | No new AI checks or lift claim; preserve existing answer modules and schema. |
| Recommendation | Group each price with a full-width action that includes the existing home name; restrained pointer feedback only. |
| Attack status | completed |
| Query variants inspected | Single bounded public query: Anna Maria Island family vacation rentals private pool family friendly homes; no expansion batch. |
| SERP source | Public web search read on 2026-10-31; research context only. |
| Competitor URLs inspected | https://www.airbnb.com/anna-maria-island-fl/stays/family-friendly and https://www.seabreezevacation.com/vacation-rentals/search-by-amenity/private-pool-rentals/ |
| Content gap and Seascape answer | Booking action lacked the home's identity; add only its existing name, without new amenity or location claims. |
| Design/format strategy | Preserve Waterline photo-led grid; full-width named action/price group; 200ms pointer photo response, 120ms press feedback, static keyboard/reduced-motion paths. |
| Seascape proof available | Existing dynamic property names, image markup, exact destinations/tracking and original unchanged-build snapshot. |
| Tools/plugins used | Free public web reads, official Emil guidance as donor reference, Site specialist/critic, Playwright, axe and native source gates; no paid OpenSEO checks. |
| Decision and reason | Finish the explicitly requested local UI refinement; hold publication and broader SEO changes. |

## Worklog

November 2 publication: Sawyer approved the displayed guide-first browse
preview, PR, normal publication and live verification. Issue #855 records the
originating request. This supersedes the earlier preview-only holds below.
Preserve host identities and no paid checks. Sole mutation owner remains this
chat. Integrate the selected family layout in real Nunjucks source, reusing
the native catalog trip form, comparison dialog and catalog.js; retain the
other stay leaves' shared Waterline migration.

Before production implementation, family boundary invariants: retain the
approved short answer once before the form, four exact matched homes in order,
five detailed paragraphs and seven FAQs below; preserve property facts/photo
identity, all original internal destinations/tracking, metadata and schema
except source-derived modified dates. Native dates/guest inputs must reach the
correct home; failed availability must stay honest. No provider/host changes.
Acceptance derives from issue #855 and the approved rendered preview, not the
new implementation. Compare rendered public HTML with the approved preview
and its original source contract; test actual intercepted booking navigation,
empty/loading/error, comparison and no-JavaScript access. The old photo-only
family page lacks the trip form and must fail the new journey assertion.
Run release verification, visual floors and native screenshot gates, refreshing
intentional baselines only via the existing workflow after inspected proof.

November 1 spacing pass: fresh 1261x903 capture measured first home at836px.
The native trip panel inherited margin16px 0 40px, and its tall right column
left unused space under the intro. The browse preview now uses a compact
title/description row and full-width horizontal trip form on desktop, with
stacked touch-friendly controls on phones. Removed inherited panel margins and
tightened collection/card gaps using the existing spacing scale. First home
now starts at720px (116px earlier). Booking logic, fields, copy and links are
unchanged. Product Design audit guidance informed the screenshot/measurement
pass; actual capture and functional proof use the Site's existing Playwright
route. No plugin installation, new design system, canvas or publication.

November 1 architecture correction: Sawyer rejected the photo-led page and
oversized dates controls as unhelpful for choosing/booking Dockside Dreams.
The previous critic's visual approval did not establish that the architecture
served that task. Source read confirms its dates actions open detail-page tops,
and there are no trip inputs on the collection.

Two local-only functional alternatives are now composed in docs/design:
`build-flows.cjs` uses the actual built catalog and Dockside components;
`preview.cjs` serves `?flow=browse` and `?flow=dockside`. Public src, the
existing migration checkpoint and committed screenshot baselines are unchanged.
The reference surfaces are Seascape's existing Our homes catalog and Dockside
property booking panel. The donor inventory returned optional skill metadata,
not an available external reference-site implementation; none was installed.

A recommends trip-first comparison of the four matched homes with real direct
booking links plus distinct detail links. B leads with Dockside's native booking
panel and a chooser for the other homes, at the cost of privileging one home.
Both retain all 58 original paragraphs/headings and the original SEO/JSON-LD;
the architecture intentionally changes ordering and the confusing action labels.
Existing original internal destinations remain available. No invented rates,
availability, new imagery or new booking engine is introduced.

Run `node docs/design/stay-waterline/build-flows.cjs` after the native build,
then start the existing preview server. Generated alternatives live in
/private/tmp/stay-flow-previews (override with STAY_FLOW_PREVIEW_DIR).
Run `node docs/design/stay-waterline/check-flows.cjs <receipt.json>` for source
copy/SEO, pending state, actual intercepted Dockside click, dates/guests, four
widths and axe proof. Availability is synthetic and provider navigation is
intercepted; this proves the handoff contract, not live availability or a
reservation. Both 503 states retain an honest confirmation-on-booking-page
message; A's 17-guest case shows no single matching home. No sends, paid checks,
push, public PR, merge, deployment or new schedule. Preview selection remains
the next user decision before applying a replacement shared architecture.

October 31 rating revision: Sawyer requested five-star graphics in place of
the photo's Rated label. Use five existing SVG stars with proportional fill
from the actual score and an accessible score out of five; omit missing/zero
ratings and remove the duplicate body rating. No rating values, review counts,
provider identities, facts, photos, SEO or links change. The unchanged 20f0a5dd
render was captured as rating-baseline.json, excluding only those two old
rating presentations. Compare with `--star-ratings --history-dates` (without
`--property-actions`, because this snapshot already contains named actions).
The rating fixture must reject the old text presentation, prove fractional
scores and omit unrated badges. Publication remains held.
Verified: both rating tests failed on the old version and pass on the new;
release verification, 27 focused browser checks and 59-route preservation pass.
Critic approved desktop/360px and the synthetic fractional-star capture.

October 31 revision (Sawyer's browser comment): booking actions feel detached
from their properties. Preserve the existing photo-led collection and group
each price with one full-width action that repeats that home's existing name.
This explicitly permits only adding the dynamic property name to each dates
action; all other reader copy, SEO, facts, images, links and tracking stay exact.
Acceptance: the accessible and visible action name must identify its own home
(the old generic action must fail); 59-route preservation permits only that
precise addition. Verify desktop/mobile grouping and all links, focus, press,
fine-pointer hover and static reduced-motion behavior before updating preview.

Specialist/critic recommends retaining the photo-led two-column collection.
Motion opportunities: subtle photo zoom (1.02, 200ms) and arrow feedback on
pointer hover, existing 120ms press response. Reject scroll reveals, animated
facts/prices and automatic image movement: they delay reading or imply
interactivity where none exists. Use native CSS and existing Waterline tokens;
no package or global skill installation. Emil's official emil-design-eng and
find-animation-opportunities guidance was consulted as donor reference, not
installed or promoted to site policy. Publication hold remains unchanged.

Revision proof: critic approved desktop 1261px and phone 393/360px cards.
Observed pointer photo scale 1.02 / arrow translation 2px; keyboard focus
shows a 3px outline with static photo/arrow, and reduced motion is static.
Release verification and the 105-source design scan pass. Preservation still
checks all 59 routes: use `--property-actions --history-dates` for this revision.
The latter validates normal freshness changes against the exact source Git
timestamp, including the hub's generated Updated label; it does not discard
other dates, schema, metadata or reader text. Screenshot baselines remain
unapproved and publication remains held, as in the original preview.

October 31: current base verified; root .claude/launch.json preserved. Open #734 overlaps src/stays/stays.njk in a separate claim-parser task; no competing migration exists and no changes are copied from it.

Implemented shared Waterline sheet/body and removed the stay-leaf legacy exception. Scanner now includes src/stays; the broadened scan exposed only hub color/font-loader violations, repaired with sanctioned colors and the existing local-font partial. The stay hub's layout and copy remain unchanged. Family route now participates in native visual screenshots, whole-page floors and a computed Instrument Serif/paper/zero-radius FAQ check.

Observed red/green: source coverage and shared-shell assertions reject the old source; the computed design assertion rejects the actual old 4197 page and passes the Waterline page. Existing design lint rejected a temporary off-brand style planted in the stay template; it was restored immediately. Final lint: 105 sources, zero new violations, no new exemptions. All 1,320 unit tests pass. Release verification passes (including internal links and JSON-LD). Initial concurrent build/testing caused missing-output failures; sequential completed-build verification resolved them without changing assertions.

Preservation helper compares an unchanged base-build snapshot with all 58 leaf pages plus the hub: 59 routes, zero mismatches for reader words/order, metadata, JSON-LD, anchor/tracking attributes and photo markup. Browser overflow checks passed on all 58 leaves at 360 and 1440px. A real comparison page additionally passed 1440/1024/768/393/375/360px, with the last footer link above the fixed booking bar. Mobile comparison rows now use a full-width label and two 14px answer columns, preserving all table text/order. Specialist/critic approved the rendered preview after inspecting that correction and recommends A.

Preview: run `node docs/design/stay-waterline/preview.cjs` after the native build. A is http://127.0.0.1:4212/stays/family-vacation-rentals-anna-maria-island/ ; B adds `?variant=photo`. B's stylesheet is served only by the local review server and is not part of public output. Desktop/mobile hero, homes, FAQ and full-page captures plus baseline.json are in /Users/sawbeck/.codex/visualizations/2026/10/30/01a18dda-ff9c-73e3-8451-d3f1e9e059ee/stay-waterline.

Publication remains held for Sawyer's preview selection. Intentional stay screenshot changes and the new family baseline must be refreshed through the owning update-visual-baselines workflow after that selection permits a branch push; do not commit local snapshot updates. Then complete current-head source review and the ordinary publication route. No paid checks, host changes, schedules, pushes, public PRs, merges or deployments belong to this preview checkpoint.

November 2: Sawyer approved the recommendation to give the family browse preview
a short useful answer before its dates and homes, with detailed advice and FAQs
below. Move the existing first intro paragraph verbatim, once, between the
heading/description and native trip form. Preserve the remaining five article
paragraphs below the homes, all seven FAQs, metadata, schema and booking links.
This changes only the local family preview generator and CSS. The focused
check-flows gate now verifies this order and the absence of duplicate intro
copy, alongside original copy/SEO preservation, four responsive widths, axe and
the intercepted dates/guests booking handoff. Publication remains held.
