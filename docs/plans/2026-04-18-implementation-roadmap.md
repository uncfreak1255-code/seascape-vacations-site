# Seascape Implementation Roadmap Refresh

Date: 2026-04-18
Horizon: 12 months

## Hard Read

The repo does not need a bigger roadmap. It needs a stricter one.

The wrong version of this plan would stuff more work into Phase 2 and call that ambition.

The right version is tighter:

- Foundation: finish convergence and repair the measurement layer
- Expansion: improve owner-page CTR and stay-page quality
- Scale: expand only where the readbacks justify it
- Authority: formalize the entity layer only after the core pages deserve it

## Phase 1: Foundation

Timeline: Weeks 1-4

### Objectives

- finish winner ownership in the guide families
- repair noisy verification
- align discoverability surfaces with current business priorities

### Workstreams

1. complete `winner-guide-consolidation`
2. fix stale live-smoke assertions so release verification is trustworthy again
3. align:
   - `src/_redirects`
   - `src/sitemap.njk`
   - `src/llms.txt`
   - canonical tags
   - in-body links on priority guides
4. add owner money pages to `llms.txt`
5. set the post-recrawl read that decides the next batch

### Exit Criteria

- tracked guide families have clear canonical winners
- release smoke reflects real failures instead of stale copy expectations
- owner and guest priority pages are present on the agreed discoverability surfaces
- the next branch decision can be made from the 7-day read without guesswork

## Phase 2: Expansion

Timeline: Weeks 5-12

### Objectives

- turn ranking owner pages into higher-CTR pages
- turn the top AMI stay pages into better commercial endpoints

### Workstreams

1. open `owner-ctr-rewrite-round-2` only if the gate clears
2. strengthen page titles, descriptions, and first-screen proof on fees and licensing where page-level evidence supports it
3. keep VRBO positioned as a support page unless demand proves otherwise
4. publish or harden the owner proof asset
5. improve AMI stay-page speed, image handling, and CTA handoff
6. tighten visible reviewed-by and updated-date treatment on the top guides and money pages

### Exit Criteria

- owner money CTR moves materially from the `0.11%` 28-day baseline
- fees and licensing pages are stronger on proof and snippet framing
- `/stays/anna-maria-island-vacation-rentals/` LCP is under `3.5s`
- the two priority AMI stay pages are better at moving users deeper than they were at the start of the phase

## Phase 3: Scale

Timeline: Weeks 13-24

### Gate Condition

Do not enter this phase on hope.

Scale happens only if:

- guide-family leakage is materially reduced
- owner money CTR improves
- the AMI stay pages show better commercial behavior

### Objectives

- expand only where the site has already earned the right to expand

### Workstreams

1. launch Holmes Beach only if the stay gate clears
2. launch one additional comparison page only if it has a named money-page destination
3. extend guide-to-money-page routing patterns that are already working
4. keep performance and image hygiene from regressing as the page count grows

### Exit Criteria

- at least one controlled expansion page is live and performing better than the older page-launch pattern
- no new family is adding canonical or routing chaos
- the operator report still supports the sequence

## Phase 4: Authority

Timeline: Months 7-12

### Objectives

- formalize the entity and reputation layer around pages that already perform

### Workstreams

1. expand maintained author and reviewer surfaces only if they are real
2. strengthen off-site entity signals that can be kept current
3. update proof assets and benchmark pages on a cadence that prevents stale claims
4. look for selective local mentions or PR only after on-site pages are solid

### Exit Criteria

- top guides and money pages show consistent, credible authorship and review treatment
- off-site entity surfaces reinforce the on-site story instead of pretending to create it
- the authority layer is maintained, not just launched

## Dependencies

- `src/_data/seoPages.json` remains a shared collision point for owner and stay work
- the operator report is the decision layer for sequencing, not a post-hoc reporting artifact
- proof assets must exist before owner and stay rewrites can stay consistent at scale
- verification must stay clean enough to trust before faster shipping is safe

## Risks

| Risk | Why it happens | Mitigation |
|---|---|---|
| scope drift back into page volume | page publishing feels like momentum | hold every proposed page against the operator gate and money-page destination rule |
| owner rewrites happen before enough recrawl data | impatience gets mistaken for decisiveness | keep the 7-day gate as the branch opener |
| stay pages get longer but not more commercial | copy expansion is easier than page design and performance work | measure LCP, CTA handoff, and downstream clicks, not just words |
| release safety stays noisy | stale smoke checks look official | fix failing assertions that no longer map to live truth |
| entity work becomes a distraction | AI/authority tasks feel strategic | keep authority work after page quality, not before it |

## Verification Plan

Every phase should include:

1. repo enforcement tests
2. `npm run verify:release` after relevant fixes
3. live checks on priority URLs
4. operator rereads after recrawl windows

### Minimum Verification Additions

- keep metadata and canonical integrity coverage active
- update the stale live-smoke assertion
- preserve image and performance checks on priority stay pages
- keep guide-to-money-page routing checks in place where they exist

## Success Criteria

- Seascape stops leaking value between discovery and money pages
- owner pages turn rank into clicks more reliably
- AMI stay pages become stronger commercial pages before any family expansion
- the roadmap stays branch-driven and evidence-driven instead of wish-driven
