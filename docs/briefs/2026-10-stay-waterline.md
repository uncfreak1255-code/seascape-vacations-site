# Brief: Shared stay collections on Waterline

- lifecycle: active
- approved scope: Sawyer approved the guide-first browse preview on November 2, 2026, then authorized PR, normal publication and live verification. Preserve original copy, SEO, booking links and host identities; no paid checks or manual early publish. Earlier preview-only holds are superseded.
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

Native PR #856 review F1 (P2) found that catalog initialization preceded the
existing remembered-trip restoration. The first repair round moves catalog.js
after analytics-ga4's conversion-tracking.js, without duplicating the tracking
script. The returning-guest regression was observed failing with blank inputs
despite restored URL dates; it must now restore dates and 12 guests, hide the
10-guest home and route Dockside to the same trip. No host/provider change.

Performance CI passed its unchanged Lighthouse ceilings but correctly flagged
two stay routes' stylesheet byte counts: the old 14,129-byte inline style was
not counted as an external resource; its shared replacement is 14,633 bytes.
The native ratchet updater uses CI run 41531519260's actual Lighthouse reports
to record only those two measured stylesheet changes, with a reason. No speed,
transfer, script, accessibility or visual tolerance is relaxed.

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

Historical preview checkpoints are retained in [preview history](../design/stay-waterline/preview-history.md). Earlier publication holds there were superseded by the November 2 approval above.
