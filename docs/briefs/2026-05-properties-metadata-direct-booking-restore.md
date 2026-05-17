# Brief: Properties Metadata Direct-Booking Restore

## Content Gate Inputs

- persona: search visitors comparing Seascape vacation rentals before opening live availability
- primary keyword: vacation rentals near Anna Maria Island
- secondary keywords: direct booking vacation rentals Anna Maria Island, Bradenton vacation rentals, Sarasota vacation rentals
- audience pattern: guests deciding whether Seascape has near-AMI inventory worth clicking into direct dates
- proof source: current `/properties/` route structure, existing property inventory, rendered route screenshots, and DESIGN.md
- required internal links: /guides/
- CTA target: /properties/
- anti-claims: do not imply on-island inventory, do not move route panels, do not rewrite the H1/body layout, and do not change card copy or tracking behavior

## Why This Batch

- PR #164 closed because the branch mixed a visible `/properties/` layout rewrite with existing stale guide baselines.
- The only follow-up worth reopening is the metadata restore that puts Seascape + direct-booking intent back into the page title and description.
- This batch must stay one-file small on the route plus one brief file for content-gate compliance.

## Cluster In Scope

- canonical URL: `/properties/`
- money destination: `/properties/`
- active lane: metadata-only intent restore

## Source And Proof Constraints

- property truth needed: none beyond the existing catalog inventory
- owner proof asset needed: none
- claims that are off-limits: anything suggesting the homes are on Anna Maria Island, any new savings percentage, and any new destination claims

## Page Builder Tasks

- source file likely to change: `src/properties/index.njk`
- redirect or schema work: none
- internal-link or CTA work: preserve existing guide link and booking CTA behavior exactly as-is

## Release Gate Checklist

- routes to smoke test: `/properties/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/booking-handoff.test.js`, `npm run build:prod`, `npx playwright test tests/visual/visual.spec.js --grep "properties-catalog"`, `npm run test:visual`
- regression risks to watch: any hero/body layout movement, route-panel movement, or new visual diff on `properties-catalog`

## Done When

- the diff in `src/properties/index.njk` is limited to front matter only
- the properties route keeps the approved rendered layout
- the full visual suite passes from the updated baseline on main
