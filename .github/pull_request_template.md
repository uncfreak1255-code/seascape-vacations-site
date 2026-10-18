## What and why

<!-- One or two sentences on the outcome. Name the brief for public copy. -->

## Proof

<!-- The command you ran and its result, for the behavior this changes.
     For visual changes: the deploy-preview link or screenshots. -->

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
