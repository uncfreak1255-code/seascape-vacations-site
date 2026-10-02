# UI Skills booking-path donor trial

Date: 2026-10-02

## Decision

Retain narrow ideas from UI Skills' `better-layout` and `improve-ui` inside the
existing `page-cro` and `design-review` skills. Keep both external skills as
donor references. Do not install them, promote them to local authority, or
create a `booking-path-ux` skill.

## Trial box

- Route: live `/stays/` collection index
- Task: inspect responsive decision hierarchy on the route that moves guests
  from trip intent toward a property search
- Current method: `page-cro`, `design-review`, `DESIGN.md`, route source, and
  desktop/mobile rendered evidence
- Candidate references:
  - `better-layout`: grouping, reading order, progressive disclosure,
    content-led breakpoints, long-label growth, safe areas, and clipping
  - `improve-ui`: contract, runtime, and deterministic-correction proof before
    a candidate becomes a finding
- Time limit: one route, one desktop viewport, one 393px mobile viewport
- Stop condition: retain only guidance that adds a useful check without
  creating new authority or contradicting Waterline

Sources:

- <https://www.ui-skills.com/skills/jakubkrehel/better-layout>
- <https://www.ui-skills.com/skills/ibelick/improve-ui>

## Evidence

The live route was read on desktop at 1440 by 900 and mobile at 393 by 852. The
route preserved the selected December 5–12, 2026 dates and six guests in its
links. At both viewports, `Find your home` remained visible in the header. The
mobile header's call, booking, and menu controls each rendered at least 44px
high. DOM metrics reported no horizontal overflow at either viewport.

The current Seascape skills already owned CTA hierarchy, desktop/mobile proof,
clipping, responsive stacks, and interaction state. `better-layout` added useful
stress-test detail: content-led breakpoints, long-label growth, 200% zoom,
safe-area obstruction, visible disclosure cues, and reading-order comparison.
Those checks belong in the booking-flow branch of `page-cro`, not a new skill.

`improve-ui` added a useful falsification rule. The route's long destination
and amenity lists could be called dense, but the trial found no governing
contract or deterministic correction proving that density was a defect.
Contract/runtime/correction therefore rejected that candidate instead of
turning taste into an implementation recommendation. That filter belongs in
`design-review`.

## Result

- Correctness: both retained ideas preserve `DESIGN.md` and existing owners.
- Useful output: the donors added responsive stress tests and a stronger
  evidence filter, but no new route defect survived the proof gate.
- Sawyer intervention: none required to interpret competing skill authority.
- Installation or activation: none.
- New skill decision: rejected. One route showed complementary reference value,
  not a repeated gap across search, property detail, and booking handoff.

## Limits

This was one live route and does not prove the full booking journey is free of
responsive or conversion defects. The 200% zoom and complete property-to-booking
handoff were not exercised in this bounded trial. Future real tasks should reuse
the new checks; only repeated failures that cannot be expressed by `page-cro`
plus `design-review` would reopen the `booking-path-ux` decision.
