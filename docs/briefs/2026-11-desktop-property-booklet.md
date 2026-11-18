# Desktop property photo booklet

- lifecycle: active
- task scope: Implement Sawyer's selected booklet on property detail pages at 900px and above, preserve the existing mobile/tablet gallery, harden loading and carry through release. Assess shared use across properties and listing cards.
- persona: A guest inspecting a home before choosing dates.
- primary keyword: existing property names; no search-presentation change.
- secondary keywords: existing property detail intent; no new keyword targeting.
- audience pattern: Inspect the real rooms, reach every photo, then check dates.
- proof source: Existing verified photography records in src/_data/properties-fallback.json; approved rendered Dockside booklet; refreshed Hub property reference on November 18, 2026.
- required internal links: /properties/, #all-photos, #booking
- CTA target: Existing property date form and unchanged booking handoff.
- anti-claims: No new amenity, rate, availability, savings, review or booking-lift claims. Preserve existing captions and property data.

## Approved request and implementation

Sawyer: “do your reccomendations and take it into deployment. see if we should do the same for the other properties and listings”. This follows the approved contextual booklet and recommendation to retain mobile's current gallery.

Scope: src/_includes/layouts/property.njk; src/_includes/layouts/guest.njk; src/assets/js/property-booklet.js; src/css/property-gallery.css; src/css/property-booklet.css; small derivatives of existing images/homes photos; tests/visual/property-booklet.spec.js. The common template covers all eight property detail pages; each has 12 or 13 local captioned photos. Catalog, homepage and stay listing cards retain their scan/compare treatment. No external listing or Hostaway change.

Two-page spread starts at 900px and above to retain readable photo faces; widths below 900px keep the existing mobile or tablet layout. Native transform/opacity turn, immediate keyboard/reduced-motion, interruptible navigation, full photo dialog and original booking controls. The opening exists in server HTML before JavaScript. The desktop module imports only when the media query matches; 160px photo derivatives replace original-size thumbnail downloads. Original photos remain unchanged.

## Copy and design review

Draft the copy: reuse existing photo alt captions and selected preview's short controls: Explore the home, Previous, Next, End of photo collection, and named unavailable state.
Remove internal wording: no library or implementation names in reader UI.
Check voice and specificity: concrete photo navigation, no promotional or business claims. Independent voice/design verdict recorded with rendered review before publication.

Layout and control adaptation only: OpenSEO research and substantial writing skills are not applicable. Emil design-engineering, animation and mobile guidance applied: native WAAPI, transform/opacity, keyboard immediacy, gated hover, focus and reduced motion. Existing approved Studio/Amicro-inspired booklet is the reference. Donor scan executed; no donor installed.

## Verification and release

Acceptance: unchanged mobile gallery and no desktop module/thumbnail downloads there; every property retains its photo identity/count; desktop forward/reverse/odd endpoint/resize/reduced-motion/full-gallery navigation; no overflow; complete booking journey. Capture each property at 390, 768, 901 and 1440px. Compare throttled loading and layout shift with desktop enhancement disabled. Run required release, visual, accessibility and performance gates. Source merge, publication and live proof remain separate receipts.

## Recorded evidence (November 18, 2026)

Site critic `/root/design_critic`: Approved with edge, high confidence after inspecting Dockside at 390/768/901/1440 and diverse property sets. Voice Editor: Approved. The fallback edge is addressed with a no-JavaScript complete contact sheet; imported-module failure retains the existing guest.js View all dialog. A focused browser test covers both paths.

Fresh native pre-PR bug review `/root/booklet_bug_review`, completed 02:43 UTC: zero actionable introduced findings; complete diff SHA-256 `0abbc4ffde8926191420e8799195890c33ce32de8afbe38c9a20abcb4d3b1787`, base `e239fafb259f8755a7ae41ef68ef5acea90e1291`. No source edits by reviewer.

Early intercepted-control timings were superseded: interception affected HTML timing, and the old phone fade made Chrome report the heading as LCP while the candidate reported the photo. Do not infer an image-arrival regression from that raw LCP difference. Final proof serves unchanged main and candidate independently under the same 100ms latency, 200KB/s and4x CPU conditions, in counterbalanced order. The phone's resource difference is1037 bytes in the existing stylesheet; it requests no booklet CSS, JavaScript or thumbnails. Desktop opening resource transfer:742317 bytes before vs361658 after, with candidate median LCP1876ms and CLS0.00310 (three runs). Raw LCP comparison is not field or booking proof. Phone hero-arrival medians are recorded in the final PR receipt and `performance-phone-arrival.json`; the old heading-only LCP is not treated as the photo-load time.

Required Lighthouse budget and byte-size ratchet passed on all eight configured routes without raised limits. Native TesterArmy intercepted search/property/checkout journey: two passed, desktop and mobile, using Node 24.22.2. Sixteen initial gallery cases passed; final full suite also covers no-JS and import failure.

The 99 thumbnail derivatives total 326370 bytes across all homes (each guest loads only the selected home's set). Generated from each existing approved `photo.src` with sharp resize width160, without enlargement, WebP quality65; no crop or content edit. Fresh route captures and logs remain under `/Users/sawbeck/Projects/agent-work/codex/desktop-property-booklet/`. The PR embeds committed desktop/mobile baselines and links the short turn recording. Real-device touch feel remains unverified; the existing phone interaction is retained.

Final author repairs: actual single-photo enlargement now uses the existing native dialog, View all resets every image, and leaving desktop clears selected-photo mode. Reserved header height56 matches the static opening. Native review `/root/booklet_bug_review` inspected these repairs at 02:50 UTC and returned no actionable defect; it also approved final thumbnail label/text matching and region/group semantics.

The full visual run initially returned687 passed/96 skipped/15 failures. Thirteen were in-scope accessibility and stale assertions: thumbnail padded label mismatch fixed; named/position tests now inspect the visible gallery; no-JS test expects the complete added photo set. All142 affected tests then passed, including every property's axe check. Two homepage baseline failures reproduce on unchanged main e239fafb in a separate clean worktree and are tracked in #1004. No homepage baseline or tolerance is changed here. Final desktop property baselines are generated through the repository's native GitHub workflow, not committed from a local refresh.

Final performance hardening moved static opening geometry into the existing 2426-byte gallery stylesheet (within3072 budget). The booklet stylesheet is now requested only by the desktop loader, before importing the turn module; failure retains the static opening and full photo paths. Native bug reviewer approved the loader/style split without actionable findings. Final affected native suites:142 passed on the desktop-only loading path. Stage focus uses its actual class selector; unused donor top-link/single-phone rules were removed.

The final source uses DESIGN.md’s sanctioned900px mid breakpoint consistently in CSS and loader (rather than901px); the candidate was inspected at901px and the one-pixel adjustment preserves that spread. The unit token gate caught901px when static CSS moved into the existing sheet; no ceiling or token policy was raised.

Final release proof: guarded source commit8d3ba657 passed the content/unit/link proof chain. Native baseline workflow44229116925 passed16 cases and committed0b01aa6f, changing exactly eight desktop property screenshots; mobile baselines were unchanged. Exact899/900 viewport smoke passed: original gallery below900, booklet at900, stage keyboard outline2px. Final direct phone hero arrival medians:2037ms main vs2001ms candidate (three runs); no booklet CSS/module/thumb requests. The raw LCP element was H1 on main and IMG on candidate, so heading-only timing is not used as a photo-speed claim. Performance remains local lab proof, not field data.
