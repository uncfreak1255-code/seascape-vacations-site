# Claude Handoff: `/properties/` Writing Pass

## Goal

Do the writing pass for the Seascape `/properties/` page without changing the layout, tracking, routing targets, or the truth boundary.

This is a copy job, not a redesign job.

## Source File To Edit

- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk`

Primary copy block right now:

- hero + route panel at lines 728-830

## Read First

1. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/.claude/agents/page-builder.md`
2. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/.claude/agents/voice-editor.md`
3. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/docs/briefs/2026-05-properties-near-ami-angle.md`
4. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/docs/style/voice.md`
5. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/docs/style/approved-examples.md`
6. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/docs/style/banned-patterns.md`
7. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/docs/process/content-quality-gate.md`
8. `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk`

## Why This Exists

The page structure is directionally right, but the writing still drifts into "explaining the page to the user" instead of sounding like Seascape making a recommendation.

Sawyer does not want copy that sounds like:

- the website describing its own routing logic
- the page explaining what kind of page it is
- content-farm "decision framework" narration
- SEO tool phrasing smoothed into guest copy

The fresh DataForSEO evidence still says `/properties/` should be an honest near-AMI router, not a fake on-island inventory page.

## Core Truth To Preserve

- These homes are in Bradenton and Sarasota, not on Anna Maria Island itself.
- The page should stay honest about near-island positioning.
- Bradenton is the better lane when AMI beach access matters most.
- Sarasota is the better lane when the city is part of the trip.
- The book-direct route matters for fee-sensitive travelers.
- Do not imply beachfront, on-island, or AMI-scale inventory Seascape does not have.

## What Needs Rewriting

Focus only on the visible copy in this section unless you find one adjacent line that obviously needs the same treatment:

- H1
- hero paragraph
- the 3 quick-answer highlight blurbs
- `Start with the right base...` section copy
- route-panel intro copy
- the 5 route-card blurbs

Current source block to rewrite is here:

- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:732`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:734`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:739`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:743`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:747`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:759`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:761`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:770`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:772`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:785`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:796`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:807`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:818`
- `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle/src/properties/index.njk:829`

## Writing Problems To Fix

- Too much "page describing itself" energy.
- Still a little too mechanical and operator-ish.
- Some copy sounds like a decision tree instead of a confident local recommendation.
- The page is honest now, but not yet sharp enough.

## Hard Bans

Do not write any visible copy like:

- `this page is...`
- `use this page when...`
- `this page is here to...`
- `this page is built around...`
- `if your real search is...`
- `if your real question is...`
- `tradeoff stated clearly`

Also avoid:

- `curated`
- `nestled`
- `elevate`
- `boasts`
- `myriad`
- `seamless`
- tourism-board fluff
- fake luxury language

## Keep These Structural Constraints

- Do not change CSS classes.
- Do not change tracking attributes.
- Do not change href targets.
- Do not change route-card count or order.
- Do not touch `_site/`.
- Do not widen the batch into other pages.

## Desired Voice

Make it sound like:

- a sharp local operator
- practical and specific
- comfortable saying which option fits which trip
- commercially useful, not "content marketing"

It should feel more like:

- "Bradenton makes more sense when..."
- "Sarasota wins when..."
- "Book direct first if..."

And less like:

- "This page helps users..."
- "If your real intent is..."
- "This route is designed to..."

## Deliverable

Edit the source file directly.

Then give a short closeout with:

1. what copy areas you changed
2. any claim-risk you deliberately avoided
3. the commands you ran

## Required Checks After Writing

Run these in:

1. `npm run lint:content`
2. `npm run build`
3. `npm test`

## Prompt To Paste Into Claude

```text
Work in /Users/sawbeck/Projects/seascape-vacations-site/.worktrees/properties-near-ami-angle.

Do the writing pass for /src/properties/index.njk only. This is a copy job, not a redesign job.

Read first:
1. .claude/agents/page-builder.md
2. .claude/agents/voice-editor.md
3. docs/briefs/2026-05-properties-near-ami-angle.md
4. docs/style/voice.md
5. docs/style/approved-examples.md
6. docs/style/banned-patterns.md
7. docs/process/content-quality-gate.md
8. src/properties/index.njk

Rewrite the hero copy, quick-answer blurbs, toolbar copy, route-panel intro, and route-card blurbs around lines 728-830.

Preserve these truths:
- homes are in Bradenton and Sarasota, not on Anna Maria Island itself
- Bradenton is the better lane for easier AMI beach days
- Sarasota is the better lane when the city is part of the trip
- book-direct matters for fee-sensitive guests

Do not write any page-explaining meta copy like:
- this page is...
- use this page when...
- if your real search is...
- if your real question is...
- tradeoff stated clearly

Do not change CSS classes, hrefs, tracking attributes, route-card count/order, or layout.

Edit the source file directly, then run:
1. npm run lint:content
2. npm run build
3. npm test

Close out with the exact lines/sections you changed and any claim-risk you intentionally avoided.
```
