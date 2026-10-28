# Relaxing Oasis property-page preview

- lifecycle: active
- persona: guests choosing a Bradenton home for a group
- primary keyword: Relaxing Oasis; existing exact listing identity, no search expansion
- secondary keywords: Bradenton vacation home; no ranking or traffic claim
- audience pattern: inspect the actual home, watch its optional film, check important rules, choose dates
- proof source: Hub `context/seascape-properties.md` section 8 at `3d12c21255a0988796a092c63bda231bd8314b2f`; exact public Hostaway listing 607228 and its photo gallery read 2026-10-28 UTC
- required internal links: /properties/, /guides/anna-maria-island-area-guide/
- CTA target: https://book.seascape-vacations.com/listings/607228 with guest dates and group size preserved
- anti-claims: no verified bedroom/bathroom totals or room assignments; no separate hot tub, in-ground pool, waterfront, beach distance, review quotes or guaranteed temperature; no private owner/access information

## Scope and approved direction

Sawyer requested a worktree-only property page with its already approved desktop
and mobile film. Reuse the existing Waterline property template and gallery;
no new design tokens, animation or catalog rollout. The design specialist
approved reuse with an edge: final rendered desktop/mobile proof is required.
The route remains excluded from indexing and the global catalog until review.

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
