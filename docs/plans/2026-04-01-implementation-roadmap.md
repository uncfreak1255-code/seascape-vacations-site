# Seascape Implementation Roadmap

Date: 2026-04-01
Horizon: 90 days

## Hard Read

This is not a "publish a bunch of pages" roadmap.

This is a shared-system roadmap across:

- discoverability surfaces
- owner money pages
- stay money pages
- guide routing
- entity clarity
- enforcement

## Phase 1: Convergence and release gates

Timeline: Weeks 1-2

### Objectives

- stop splitting authority across legacy families
- stop shipping broken metadata or canonical drift
- turn the two best comparison guides into cleaner routing assets

### Workstreams

1. canonical winner audit across:
   - `src/_redirects`
   - `src/sitemap.njk`
   - `src/llms.txt`
   - priority guide source links
2. metadata QA and release-gate coverage
3. guide-to-money-page routing cleanup

### Exit criteria

- priority legacy families point to one discoverable canonical
- metadata integrity checks are part of release verification
- the top two comparison guides each route to the intended money page(s)

## Phase 2: Owner proof system

Timeline: Weeks 3-5

### Objectives

- turn owner pages from brochure copy into evidence pages
- improve click yield on pages already ranking

### Workstreams

1. build shared owner proof asset
2. update fees page around benchmarks and owner-keeps math
3. update licensing page around DBPR and Florida license intent
4. update VRBO page as a support/conversion page, not a fake cluster page
5. extend owner-page test coverage

### Exit criteria

- one reusable proof asset exists and is cited by the top owner pages
- fees, licensing, and VRBO pages use stronger snippet framing
- owner pages have visible reviewer/date/source treatment where useful

## Phase 3: Guest proof and stay-page rebuild

Timeline: Weeks 6-8

### Objectives

- build one guest asset AI and humans can cite
- turn the top AMI stay pages into real commercial landers

### Workstreams

1. publish guest proof asset
2. rebuild AMI vacation rentals page
3. rebuild AMI beachfront page with honest value-fit positioning
4. extend guide-to-stay routing
5. add required-module enforcement for priority stay pages

### Exit criteria

- AMI vacation rentals page clearly targets the main commercial term
- AMI beachfront page no longer reads like faux beachfront inventory positioning
- comparison guides route into the stay pages intentionally

## Phase 4: Entity clarity and authority pass

Timeline: Weeks 9-10

### Objectives

- reduce ambiguity about who is behind the content
- strengthen the entity layer only after the pages are stronger

### Workstreams

1. visible reviewer/person treatment on top pages
2. expand `sameAs` with real maintained profiles
3. launch or strengthen LinkedIn and YouTube presence
4. pursue selective local mentions only after on-site proof is live

### Exit criteria

- top guides and money pages show consistent reviewer treatment
- `sameAs` expands beyond the thin current set
- at least 2 maintained off-site entity surfaces are live

## Phase 5: Controlled expansion gate

Timeline: Weeks 11-13

### Gate condition

Expansion only happens if:

- legacy attribution is clearly improving
- owner-page CTR moved
- AMI stay pages moved in impressions/position/clicks

### Allowed next moves

- Holmes Beach stay page
- one new comparison page that clearly feeds a money page

### Deferred

- broad owner page families
- broad VRBO cluster expansion
- second owner domain
- page-volume programs with no money-page destination

## Dependencies

### Critical dependencies

- `src/_data/seoPages.json` remains a shared collision point for owner and stay work
- guide routing changes depend on canonical cleanup being accurate
- proof assets must exist before the owner and stay rewrites are considered complete

### Sequencing rule

Owner and stay work should not pretend to be safely parallel if they both depend on the same shared data file and shared commercial templates.

## Verification Plan

Each phase requires:

1. repo enforcement tests
2. `npm run verify:release`
3. browser QA on changed pages
4. GSC reread after deploy on affected URLs

### Minimum test additions

- metadata integrity test
- owner money-page integrity test expansion
- stay money-page test
- guide routing assertions
- homepage/perf-sensitive smoke coverage where relevant

## Risks

| Risk | Why it happens | Mitigation |
|---|---|---|
| canonical cleanup remains partial | redirects update without source-surface cleanup | treat discoverability as one system, not one file |
| owner copy drifts back to generic | no reusable proof asset | make proof infrastructure mandatory |
| stay pages get longer but not stronger | word-count thinking replaces commercial-fit thinking | enforce value-fit and inventory honesty |
| entity work dilutes execution | off-site work starts before on-site pages are strong | sequence entity work after commercial-page hardening |

## Success Criteria

- Seascape stops leaking authority across legacy families
- comparison guides materially help money pages
- owner pages earn more clicks on existing impressions
- AMI stay pages become credible commercial destinations
- AI surfaces have better pages to cite than the homepage
