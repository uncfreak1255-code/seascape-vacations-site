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
