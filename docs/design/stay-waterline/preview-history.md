# Historical stay preview worklog

These dated checkpoints precede the November 2 PR/publication approval. Current scope and commands are in the active stay Waterline brief.

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
