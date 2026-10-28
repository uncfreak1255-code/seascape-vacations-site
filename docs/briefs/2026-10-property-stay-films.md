# Approved property stay films and reviews

- lifecycle: active
- persona: guests comparing individual homes before booking
- primary keyword: existing property names; no keyword targeting changes
- secondary keywords: existing Bradenton and Sarasota property terms; no metadata changes
- audience pattern: inspect photos, watch an optional short film, read verified reviews, then choose dates
- proof source: each property's existing photo gallery and sourced review records in `src/_data/properties-fallback.json`; approved rendered desktop and mobile previews on 2026-10-27
- required internal links: preserve `/properties/`, each existing property route, and each property's booking panel
- CTA target: existing property trip form and Hostaway handoff
- anti-claims: no invented amenities, guest quotes, review counts, waterfront, capacity, savings or beach distances; photo stories are identified as photo stories

## Approved scope

Sawyer approved the rendered films, mobile versions, and swipe carousels, then
authorized release on 2026-10-27. This is an interaction and media improvement,
not a search expansion or title rewrite. The held property-page regression
research brief is not activated by this change.

Routes: `/properties/dockside-dreams/`, `/properties/the-oasis/`,
`/properties/sarasota-luxe/`, `/properties/river-house/`,
`/properties/bradenton-pool-home/`, `/properties/blue-house/`, and
`/properties/coastal-stay/`. Source: `src/_data/stayStories.json`,
`src/_includes/layouts/property.njk`, `src/_includes/layouts/guest.njk`,
`src/_includes/partials/stay-story.njk`, and the shared player/review CSS and JS.
Relaxing Oasis has a finished standalone film but no Site property page; this
release does not create a page or change its booking identity.

## Copy and acceptance

The approved short headings and scene descriptions identify photographed spaces.
Draft, internal-wording removal, and voice/specificity inspection are complete;
the required independent voice verdict is recorded with PR review.

Preserve existing page facts, structured data, canonical URLs and booking
continuity. Load no MP4 before a guest presses play; choose the matching desktop
or mobile file, support loading/error/retry/end/replay, and retain native media
controls. Keep the approved compact control and reduced-motion behavior.
Enable swipe carousels only for existing sufficiently sourced review sets;
preserve quoted text, attribution and source links.

Proof: existing `tests/visual/stay-stories.spec.js`,
`tests/visual/dockside-story.spec.js`, `tests/visual/property-reviews.spec.js`,
desktop/mobile property baselines, booking journeys and `verify:release`.
The current tests cover deferred media requests, responsive source identity,
play/replay and swipe/keyboard interaction. Production verification repeats
these affected behaviors after the normal release workflow completes.
