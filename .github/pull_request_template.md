## What and why

<!-- One or two sentences on the outcome. Name the brief for public copy. -->

<!-- For a visual PR with a primary route, uncomment and replace this example
     in the opening description so Netlify links to that route.
@netlify /path/
-->

## Review this change

<!-- Required before asking Sawyer to review a visible design change.
     Remove this section for PRs with no visible design change.
     Follow docs/process/before-user-review-checklist.md#6-visual-pr-handoff. -->

- **Open the preview** — Link directly to each changed route or section.
- **Before / after** — Embed labeled, matching Playwright screenshots directly in this PR description, with mobile first for phone changes. Artifact or project-thread links can supplement the images but do not replace them. If images cannot be uploaded, keep the PR in draft and do not request review yet.
- **Try it** — Give one short instruction and attach a brief clip if the interaction needs it.
- **Decision** — State what you want Sawyer to approve in one sentence.

## Proof

<!-- The command you ran and its result, for the behavior this changes. -->

## Merge danger

<!-- One line: door type + blast radius.
     One-way door: reaches guests or bookings, changes URLs, redirects, structured
       data, booking or contact paths, or anything indexed by search engines.
     Two-way door: easy to revert, local effect.
     Example: "Two-way door: footer copy on one page; revert the commit." -->

## How to revert

<!-- One line. A merge to main does not deploy; Publish Production fast-forwards
     production to main daily at 09:05 UTC, and Netlify builds from there.
     Before publish: revert the merge commit on main.
     After publish: revert on main and it ships at the next publish; an earlier
       publish or a Netlify rollback is Sawyer's call. -->
