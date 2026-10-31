# Brief: Shared stay collections on Waterline

- lifecycle: active
- approved scope: Sawyer, October 31, 2026: migrate the stay template to Waterline; fix the legacy exception and design checks; preserve copy, SEO and booking links; show a preview before publishing. Local implementation/preview is authorized; no push, public PR, merge or production activation before preview selection.
- owner: Codex chat 01a18dda-ff9c-73e3-8451-d3f1e9e059ee, sole writer and eventual merger; worktree .worktrees/stay-waterline, branch codex/stay-waterline, base 696f0abf185630596d01a50554f6747cc66602c2.
- persona: Guest comparing real Bradenton/Sarasota homes and their trip tradeoffs before opening property details.
- primary keyword: Existing stay-collection intents; no keyword or ranking change.
- secondary keywords: Existing per-page terms preserved verbatim.
- audience pattern: Read the collection's existing answer, compare the listed homes and follow its existing property/booking links.
- proof source: Current DESIGN.md, shared Waterline guest.css and catalog/activity-guide patterns; all 58 active generated stay pages at base 696f0abf; October 31 rendered diagnosis of family page versus homepage/Rainy Day.
- required internal links: /properties/, /guides/, /properties/bradenton-pool-home/, /properties/the-oasis/
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

## Worklog

October 31: current base verified; root .claude/launch.json preserved. Open #734 overlaps src/stays/stays.njk in a separate claim-parser task; no competing migration exists and no changes are copied from it.

Implemented shared Waterline sheet/body and removed the stay-leaf legacy exception. Scanner now includes src/stays; the broadened scan exposed only hub color/font-loader violations, repaired with sanctioned colors and the existing local-font partial. The stay hub's layout and copy remain unchanged. Family route now participates in native visual screenshots, whole-page floors and a computed Instrument Serif/paper/zero-radius FAQ check.

Observed red/green: source coverage and shared-shell assertions reject the old source; the computed design assertion rejects the actual old 4197 page and passes the Waterline page. Existing design lint rejected a temporary off-brand style planted in the stay template; it was restored immediately. Final lint: 105 sources, zero new violations, no new exemptions. All 1,320 unit tests pass. Release verification passes (including internal links and JSON-LD). Initial concurrent build/testing caused missing-output failures; sequential completed-build verification resolved them without changing assertions.

Preservation helper compares an unchanged base-build snapshot with all 58 leaf pages plus the hub: 59 routes, zero mismatches for reader words/order, metadata, JSON-LD, anchor/tracking attributes and photo markup. Browser overflow checks passed on all 58 leaves at 360 and 1440px. A real comparison page additionally passed 1440/1024/768/393/375/360px, with the last footer link above the fixed booking bar. Mobile comparison rows now use a full-width label and two 14px answer columns, preserving all table text/order. Specialist/critic approved the rendered preview after inspecting that correction and recommends A.

Preview: run `node docs/design/stay-waterline/preview.cjs` after the native build. A is http://127.0.0.1:4212/stays/family-vacation-rentals-anna-maria-island/ ; B adds `?variant=photo`. B's stylesheet is served only by the local review server and is not part of public output. Desktop/mobile hero, homes, FAQ and full-page captures plus baseline.json are in /Users/sawbeck/.codex/visualizations/2026/10/30/01a18dda-ff9c-73e3-8451-d3f1e9e059ee/stay-waterline.

Publication remains held for Sawyer's preview selection. Intentional stay screenshot changes and the new family baseline must be refreshed through the owning update-visual-baselines workflow after that selection permits a branch push; do not commit local snapshot updates. Then complete current-head source review and the ordinary publication route. No paid checks, host changes, schedules, pushes, public PRs, merges or deployments belong to this preview checkpoint.
