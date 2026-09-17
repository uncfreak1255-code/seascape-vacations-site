# Claude Design program — Waterline everywhere (2026-09-16)

Owner: Sawyer (taste, priority, approvals). Execution: Claude Code sessions in
this repo under `AGENTS.md` and `docs/process/design-review-workflow.md`.

Decision recorded 2026-09-16: Claude Design is the mock surface for Seascape
visual work, seeded only from this repo's Waterline system. The sync lane is
`scripts/design/design-sync/` (`npm run design:sync`, `npm run design:sync:check`)
and the push is the DesignSync tool in Claude Code. First sync landed the same
day: 38 files written, 20 pre-Waterline cards removed, 18 Waterline cards
rendered clean at their viewports. The pre-sync project was exported whole
(150 files) to `~/Downloads/Seascape Vacations Design System (1).zip` first.

## Why this order

Each item names the revenue task it unblocks. Items ship one at a time; the
next starts when the previous is merged and proven live, so a bad direction
cannot spread.

| # | Item | Unblocks | Gate |
| --- | --- | --- | --- |
| 1 | Owner landing page in Waterline (`/property-management/`) | Owner acquisition; the funnel still runs the retired palette | Sawyer approves the Claude Design mock on his phone, then Playwright floors F1 to F6 widen to the route |
| 2 | Legacy guide routes, one family at a time (51 routes) | Guide traffic to booking; finishes the redesign per `DESIGN.md` | Same loop; `design-lint-baseline.json` shrinks per migrated file |
| 3 | Mailchimp welcome emails 1 and 2 in Waterline | The one lane guests actually receive; on-brand from first touch | Designed in Claude Design from `waterline/tokens.css`; loaded through the Mailchimp connector as drafts; Sawyer activates |
| 4 | Owner pitch deck ("Why list with Seascape") in Slides | Owner outreach batches (`owner-outbound-batch`) | Facts from `ownerProofAssets.json` only; PDF export; Sawyer approves before any send |
| 5 | Per-home guest one-pagers (PDF) | Welcome message and house binder; fewer guest questions | Facts from `properties-fallback.json` and the Homes/ Drive folders; photography rule applies |
| 6 | Artifact-based visual PR review | Sawyer approves visual PRs on his phone instead of reading diffs | One-time test: publish `npm run proof:visual` output as an artifact; if the plan lacks artifacts, fall back to the PR screenshot comment |

## Item 1 design packet: owner landing page

Route: `/property-management/` (source `src/property-management/index.njk`;
the 26 city landers come from `property-management.njk` and follow later).

- **Business goal.** An owner who lands here requests the 48-hour revenue
  review. The form is the conversion; nothing may cover it or delay it.
- **Audience.** Bradenton and Sarasota owners comparing fees and results,
  often arriving from a guide or a search on management fees.
- **Current state.** Legacy magazine layout: `owner-hero-media`,
  `sv-magazine-header-title` sections (The Fee Comparison, By Market, Owner
  Economics, the review form, Owner Guides, Specific Situations, Selected FAQ).
  Buttons already run the Waterline overrides from `guest.css` (ink, or citron
  on the near-black hero); the body typography and bands do not.
- **Constraints from `DESIGN.md`.** Paper canvas, ink text, Instrument Serif
  display, Poppins body at 15/1.65, 4px controls, rules not shadows, 44px hit
  boxes, no text below 12px, no horizontal scroll at 360/375/393. Owner proof
  numbers come only from `ownerProofAssets.json` and
  `ownerOperatorProofAssets.json`; no invented ADR, occupancy or savings claims.
  Real photography only; the hero photo must be a named Seascape home.
- **Patterns to reuse.** Guest header and footer (already shared), the
  `g-label` eyebrow, `g-section` rhythm, the trip-form field style for the
  review form, the postcard stock for proof cards if a lifted surface is needed.
- **Proof boundary.** Fee comparison and market tables keep their sourced
  figures and dates. Copy follows `docs/style/` and the owner brief.
- **Risks.** The 26 landers share partials with this page; change the page
  first, then the landers as one batch. The owner form has its own Playwright
  spec (`owner-form-steps.spec.js`) that must stay green.
- **Prompt for Claude Design** (paste after opening the Seascape design system):
  "Redesign seascape-vacations.com/property-management/ in the Waterline
  system. Keep every section and its facts; change hierarchy, type, colour,
  spacing and CTA treatment only. Paper canvas, Instrument Serif display,
  Poppins body, ink buttons at 4px, rules not shadows. The 48-hour revenue
  review form is the conversion and must stay above the fold on desktop and
  reachable in one tap on a 393px phone. Show desktop 1280 and mobile 393."

## Item 1 council verdict (2026-09-16, four lenses, proven by execution)

The first Claude Design mock is saved at `docs/mockups/2026-09-16-property-management-waterline.html`.
Four independent reviewers measured it; their findings agree.

- **Floors (Playwright at 1280, 393, 375, 360).** F1 pass (nothing under 12px). F3 pass (no overflow).
  F2 two misses at 393: the footer "Terms" link is 40px wide, and the hidden file input reads as a 1x1
  control. Submit button bottom is 809px at a 1280x800 fold, 9px under. Buttons: 4px radius, 48px,
  ink/white 11.78:1, citron/ink 9.02:1, citron only on dark surfaces. Focus ring correct. Sticky bar
  hides while the form is in view.
- **Truth.** Every number, label and headline matches the live page word for word, including the
  masthead, page numbers, fee figures and "Reply guaranteed" (already live; still a claim to retire
  under DESIGN.md's trust rule). All 45 links and images return 200. Structural gaps: the mock hand-rolls
  a header and footer instead of the shared shell (F5), and its form is decorative rather than the real
  four-step Netlify form (`owner-revenue-teardown`, hidden fields, `current_manager`,
  `current_fee_quote`). Guide cards dropped their seven photos.
- **Critic (repo taste gate): Needs another pass, scoped to one module.** Keep the Waterline
  application, fold hierarchy, copy and button reasoning. Cut the seven-market "portfolio map": two towns
  reuse a neighbour's photo (Holmes Beach and Longboat Key; Cortez and Bradenton), Cortez links to the
  Bradenton guide, and the "GPS lock" chips are generic decoration. Drop the "Pages X to Y" counters, keep
  volume and issue. Record citron on the flat ink band as a fourth sanctioned on-dark surface if approved.
- **Structure.** The design-system project stays HTML-only and generated. Claude Design's in-project
  additions (`waterline/components/*.jsx`, `button.html`, `tokens.html`, `live-mockup/`) are deleted by
  the sync; `build.js` emits the `@kind` token annotations itself. Mocks are built as their own design
  project that attaches the system, then copied into `docs/mockups/`.

Implementation contract for item 1, once Sawyer approves the direction: this mock, with the By Market
module reduced to the markets Seascape serves with one real named photo each, no GPS chips, no page
counters; the shared `g-header`/`g-footer`; the real four-step Netlify form; the Terms link and file
input brought to 44px; the submit button above the 800px fold; guide photos restored.

## What this program does not do

- No second design lane, router or review layer. The repo's specialist and
  critic remain the taste gate; Claude Design is where Sawyer looks at the
  thing before saying yes.
- No scheduled or automatic sync. The sync is re-run by the PR that changes
  the law, and the workflow says so.
- No Figma bridge. The Figma connector stays unauthenticated until a task
  needs it.
- No new marketing tooling until item 3 shows the connector can carry a
  designed email end to end. Any plugin proposal answers the five questions in
  the standing plugin decision (does something built-ins cannot, Sawyer will
  type it, a task this week, he will read the output, not a duplicate).
