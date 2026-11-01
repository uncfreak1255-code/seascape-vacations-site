# Relaxing Oasis property-page preview

- lifecycle: active
- persona: guests choosing a Bradenton home for a group
- primary keyword: Relaxing Oasis; existing exact listing identity, no search expansion
- secondary keywords: Bradenton vacation home; no ranking or traffic claim
- audience pattern: inspect the actual home, watch its optional film, check important rules, choose dates
- proof source: October 31 Hostaway 607228 Basic info, Rooms & beds, description and captions via Aside; direct booking page; Hub section 8 at c563a0a259e1d241f8084d19f8fac87df92087d8
- required internal links: /properties/, /guides/anna-maria-island-area-guide/
- CTA target: https://book.seascape-vacations.com/listings/607228 with guest dates and group size preserved
- anti-claims: no room arrangements beyond the October 31 exact-listing verification; no separate hot tub, in-ground pool, waterfront, beach distance, review quotes or guaranteed temperature; no private owner/access information

## Current scope — October 31, 2026

This chat owns the worktree-only count and room-breakdown update. Sawyer requested
5 bedrooms, 4 bathrooms, the verified five-room breakdown, and removal of the
outdated sleeping warning. Hostaway, production, catalog membership and indexing
remain unchanged. Reuse the existing sleeping-list component without design changes.

Current proof: read-only Aside review of exact Hostaway 607228 on October 31,
including Basic info, Rooms & beds, description and photo captions; direct booking
agrees on 5 bedrooms, 4 bathrooms and 11 guests. Hub origin/main
c563a0a259e1d241f8084d19f8fac87df92087d8 section 8 records the detached suite
and its bathroom within the totals. The current Hostaway description explicitly
maps two king rooms with private bathrooms; queen and two twin-over-twin bunks
sharing a bathroom; detached twin daybed suite with private bathroom. Each bathroom
is described with a walk-in shower. Eight beds total does not mean eight bedrooms.

Acceptance gate, written before implementation: show 5 bedrooms / 4 bathrooms /
11 guests, exactly five room entries with the correct shared/private bathroom
relationships, no obsolete detached-inclusion warning. Preserve gallery, noindex,
booking listing 607228, guest/date handoff and both stay-story formats. Update the
existing route test; observe it fail on the old page, then pass on the changed
page. Build, content lint, focused route/story tests and desktop/mobile rendered
inspection prove this preview. Do not refresh approved screenshot baselines or
publish before Sawyer reviews the preview.

The dated sections below are historical release evidence. Their count omission
and physical-inventory hold are superseded for this update; they do not block
using the now-verified room map. Catalog/indexing remains separately deferred.

## Scope and approved direction

Sawyer requested a worktree-only property page with its already approved desktop
and mobile film. Reuse the existing Waterline property template and gallery;
no new design tokens, animation or catalog rollout. The design specialist
approved reuse with an edge: final rendered desktop/mobile proof is required.
The route remains excluded from indexing and the global catalog until the physical inventory is reconciled.

Source files: `src/properties/relaxing-oasis/`, shared property/guest layouts,
`partials/property-schema.njk`, `src/_data/stayStories.json`, and exact-home
photos under `images/homes/relaxing-oasis/`.

## Verified content and limits

The current direct listing and Hub agree on the 11-person guest limit. Public
room counts still conflict with the physical layout record, so omit bedroom,
bathroom and bed totals from visible copy, metadata and structured data. Do not
turn configured bed labels into a physical room map. Use concise guidance to
confirm sleeping arrangements and detached-room access before booking.

Use the approved wording “private heated above-ground pool.” New bookings use
optional heat at $40 per booked night for the whole stay; preserve already
confirmed heat-included reservations. Do not promise a temperature. Max four
cars; confirm boat/trailer dimensions before promising fit. Ordinary pets,
smoking/vaping and parties/events are not permitted. Check-in from 4 PM,
checkout by 10 AM. Listed putting green, game room and kitchen/laundry equipment
may be described without condition or supply guarantees.

Photos are from listing 607228, with reuse authorized in the Hub record.
Selected photos and captions must be visually inspected. No stock or generated
property imagery. No invented reviews; no review carousel on this page.

## Acceptance gate (before implementation)

The new route must show Relaxing Oasis, its own real photos and both approved
film formats. Preserve the existing seven pages. No MP4 before play; natural
end/replay and correct format on mobile/desktop. No unsupported room counts in
visible text, metadata or JSON-LD. Booking must retain dates and group size and
target listing 607228, without making a reservation or sending a message.
Observe the new-route test fail on the old site, then pass on the preview.
Run build, release/unit checks, relevant booking and full visual checks; inspect
desktop, tablet and narrow mobile rendering and save screenshots. No production
publish, merge, external send or Hostaway mutation is part of this step.

Draft, remove internal wording, and check voice/specificity before rendered
review. This brief is an agent record; its verification caveats do not become
marketing filler on the page.

## Verified preview checkpoint — October 27, 2026 EDT

Preview: http://127.0.0.1:8775/properties/relaxing-oasis/
Worktree: `.worktrees/relaxing-oasis-property-preview`; branch
`codex/relaxing-oasis-property-preview`, based on `9fee5560c117fb71a06d91b27532a492e1dcb721`.
The concurrent main update `521cb1d27209eff80d021b86e3d15a000b64002d`
is not included in this preview; rebase and repeat affected proof before publication.

- New-route test failed against the earlier preview, then six focused checks passed.
- Full browser suite: 513 passed, 33 intentionally skipped; existing desktop/mobile baselines unchanged.
- Release checks passed, including 1,279 unit tests, links and JSON-LD.
- Intercepted booking journeys: 10 passed across desktop and mobile.
- Native browser verified landscape playback, portrait end/replay, exact home identity, loaded gallery images and the corrected October 27 local verification date.
- Rendered design and voice review approved with edge after the verification-date correction; no invented room counts or reviews.
- Final captures: `artifacts/relaxing-oasis/desktop.png`, `desktop-story.png`, `mobile.png`, `mobile-story.png`; mobile story capture verified at 390 × 844.

Only source and preview files changed. No push, PR, merge, deployment, reservation or send.
Await Sawyer's review of this page before publication. Room-layout reconciliation
and catalog/indexing rollout remain separate from this route-only preview.

## Approved release — October 27, 2026 EDT

Sawyer approved publishing this page and its video after PR review and release
checks, with live desktop/mobile verification. Keep bedroom/bathroom counts
out. This supersedes the preview-only hold above; it does not authorize a
global catalog rollout or invent missing inventory. This chat is the sole
mutation owner and merger.

Public property claims and fee/rule copy make the source change BOUNDARY.
Classification was recorded after implementation. The acceptance section above
was written before implementation from Sawyer's request, Hub facts and the
existing property-page behavior. The new-route test was observed failing on
the old site and passing here. The final PR must preserve exact listing 607228,
no unsupported room counts in copy/meta/schema, the approved pool terminology
and correct desktop/mobile movie selection without preloading MP4s.

Latest main integrated for release: c591021f2cfe190804c14c9bc1ea42a81954f3eb.
Its motion, guide and test-helper changes are preserved. Other open PRs787/790
cover separate design consolidation/type work; no Relaxing Oasis task duplicates
this branch. Final integrated checks and release readback belong in the PR.

## October 31 worktree proof

Owner: this Codex chat; branch `codex/relaxing-oasis-verified-rooms`, base
`696f0abf185630596d01a50554f6747cc66602c2`. Preview on localhost:8776.
Updated route test failed on the old page (missing 5 bedrooms), then all six
focused desktop/mobile property and film tests passed. Content lint passed
41 checks. Native browser inspected the heading and five-room list at desktop
and 390px mobile; overflow checks passed 360/375/390/768/1440px. Screenshots in
`artifacts/verified-rooms/desktop.jpg` and `mobile.jpg`. Independent Voice Editor:
Approved. No template, stylesheet, Hostaway, indexing, catalog or live changes.
Approved screenshot baselines remain untouched pending user review.

## October 31 — homepage and catalog preview

User-authorized scope: include Relaxing Oasis in the existing homepage scenes/postcards and Our homes catalog, with its own approved photos and the verified 5 bedrooms, 4 bathrooms and capacity of 11. Reuse Waterline cards and responsive behavior; no new design direction. The catalog hold above is superseded; the property's noindex setting remains unchanged. Hostaway and production remain untouched.

Acceptance: desktop and mobile show the home's own photo and details, link to its property page, and preserve its exact booking identity. Bradenton filtering includes it; waterfront and pet-friendly filters exclude it. Comparison and capacity filtering use the verified counts. Existing property page/video remain intact. The prior missing-home version must fail the collection presence check. Review screenshots before any baseline refresh or release.

Content source: the read-only Hostaway 607228 verification recorded above and existing approved property photography. No invented ratings, coordinates, fees, amenities or reviews. One shared inventory record will own both cards and the detail page.

Implementation and proof:
- Moved the approved route-local facts/photos into the shared catalog; the detail route reads that same record. Homepage scene/picker/postcard, catalog, comparison and generated property summary now include Relaxing Oasis. No new ratings or reviews are displayed; existing noindex/schema omission and reservation-sensitive heat wording are retained.
- Added exact listing 607228 to the existing read-only availability lookup and regenerated the client identity map. Updated inventory-count and smoke fixtures for eight homes; no provider writes.
- Collection presence test failed before integration and passes afterward. Six desktop/mobile page, handoff and collection tests passed (own photo, correct links, location/pet/waterfront filters, comparison, 11-person inclusion and 12-person exclusion).
- 1,318 unit tests and 41 content tests passed. Homepage, catalog and property accessibility checks found no serious/critical violations on desktop/mobile. Both video-format playback checks passed.
- Voice Editor: Approved. Desktop 1440px and mobile 390px inspected in native browser. Screenshots retained locally under artifacts/relaxing-collection; existing visual baselines are intentionally not refreshed before user approval.
- Owner-count surfaces derive from the same catalog and now reflect eight homes. No source publication, deployment or Hostaway mutation. Local preview stays on port 8776.
- Rendered design review: Approved after inspecting desktop catalog normal state, desktop homepage, mobile homepage scene/postcard and mobile catalog. Screenshot regression comparison: three expected differences (desktop home, desktop/mobile catalog); mobile homepage's initial viewport remains unchanged. Baseline approval remains pending.
- Final local checkpoint cleanup: extracted property schema-fact tests and stable smoke detail links to respect repository file-size limits. The existing build generator supplies the current client listing map; its parity test now checks the built script actually served to guests rather than the pre-generation source seed. Focused rerun: 64 passed.
- Main advanced independently to c930a7c7 (#841) during this preview. This worktree preserves its original 696f0abf base plus the approved room checkpoint; integration with that unrelated guide/owner change is a later pre-release step, not performed here.

## November 1 — eight-card fan correction

Sawyer identified the neutral eighth-card fallback as visually unbalanced and approved a worktree-only correction. All eight desktop cards now form four mirrored pairs in angle, height and stacking order; the two center cards share the raised center. Preserve photos, copy, hover/focus behavior and the upright native mobile snap list. Acceptance: mirrored outer/inner pairs, no page overflow, readable mobile first/last cards, desktop/mobile screenshots. Regression check first failed because only seven of eight homes had a fan position. No new design direction, baseline refresh or live changes.

Proof: 13 focused unit checks passed; desktop/mobile homepage discovery and axe checks passed (4). Native desktop1395px and phone390/375px readback confirmed mirrored fan and flat mobile transforms; horizontal browsing and keyboard access reached the last card. At768px the new outer tilt exposed4px of page overflow; tablet fan padding now uses32px rather than24px and readback is766px scroll width within768px viewport. Desktop and phone CSS unaffected by that margin adjustment. Desktop/mobile rendered review approved. Screenshots: artifacts/eight-card-fan/{desktop,mobile,tablet}.jpg. Existing desktop screenshot differs as intended; mobile baseline passes. Baselines remain unchanged pending user review. Local preview server restarted on8776; no publication or live changes.
