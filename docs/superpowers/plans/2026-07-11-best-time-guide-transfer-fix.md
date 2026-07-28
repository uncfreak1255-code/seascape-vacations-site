# Best-Time Guide Transfer Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give readers of the proven best-time guide an early, tracked choice between the two approved Anna Maria Island stay paths without changing the field-journal pilot or adding a new guide pattern.

**Architecture:** Keep the existing standalone guide and shared lower conversion kit intact. Add one route-local editorial decision strip after the answer block, backed by a focused source assertion and a new active brief tied to the July 11 joined GSC + GA4 receipt.

**Tech Stack:** Eleventy/Nunjucks, route-local HTML/CSS, Node test runner, repo content/build/link/visual gates.

---

## Seascape Design Packet

### Page decision

After choosing a travel month, the reader needs to decide whether to keep Anna Maria Island beaches 5-15 minutes away or accept a 12-25 minute drive for the larger-group near-island alternative. Both destinations are off-island/near-island; neither may be presented as true beachfront.

### Constraints and current-route critique

- The route has a strong answer-first summary and useful month-by-month detail, but the first tracked stay path is a plain paragraph near the end of the article.
- The shared conversion kit is strong but arrives after a long page, which matches the measured `32 sessions / 0 tracked stay actions` placement problem.
- The shelling field-journal presentation remains a pilot. This route must not borrow its cover, journal rail, or template structure before the 28-day decision.
- No new photo, reviewer, local note, annotated map, or factual proof may be invented.

**Current-route critic verdict:** `Needs another pass`, with high confidence in the hierarchy/CTA finding and provisional visual confidence because the in-app browser DOM read succeeded but its screenshot capture timed out.

**Refined Direction A critic verdict:** `Approved with edge`. The proposed strip has one clear job, names the honest drive-time tradeoff, avoids a generic card grid, leaves the strong answer block and lower conversion kit intact, and adds no new visual law. Its edge comes from turning the timing article into a concrete stay-location decision without copying the shelling field-journal treatment. Final approval remains conditional on Sawyer accepting the direction and rendered desktop/mobile proof preserving that restraint.

### Direction A: Editorial seasonal decision strip (recommended)

- **Core idea:** connect the month decision to the next honest stay-location tradeoff in one restrained section.
- **Hero move:** no hero change; the strip sits directly after the answer-first summary.
- **Rhythm:** answer block, decision strip, then uninterrupted article.
- **CTA treatment:** two editorial text-link choices with small labels, not two heavy buttons or a generic card grid.
- **Memorable moment:** the drive-time tradeoff is stated plainly: 5-15 minutes versus 12-25 minutes.
- **Mobile:** stack the two choices with a single hairline divider and comfortable tap targets; no sticky UI.
- **Risk:** the two collections overlap, so labels must explain the degree of proximity/house tradeoff without pretending they are different inventory universes.

### Direction B: Plain inline-link revision

- **Core idea:** move the existing tracked sentence immediately below the summary and add the second destination as another link.
- **Hero move:** none.
- **Rhythm:** preserves pure article flow.
- **CTA treatment:** ordinary underlined links.
- **Memorable moment:** none beyond the copy.
- **Mobile:** lowest density and risk.
- **Risk:** too visually quiet to test the measured placement problem; likely repeats the existing failure with slightly different wording.

### Direction C: Move the full conversion kit upward

- **Core idea:** put the existing stay/email/booking module directly after the summary.
- **Hero move:** the conversion kit becomes the first major surface.
- **Rhythm:** answer, large conversion block, then article.
- **CTA treatment:** existing full kit with primary and booking actions.
- **Memorable moment:** strongest commercial treatment.
- **Mobile:** long and interruption-heavy before the article starts.
- **Risk:** changes placement, density, email capture, and booking CTA exposure together, making the result hard to interpret and worsening the route's known mobile length.

### Recommended implementation brief

- Add one route-local `section[data-season-stay-choice]` after the answer-first intro.
- Use the existing cream canvas, a cream-light/white editorial surface, a restrained gold hairline, Playfair heading, Poppins labels, and dark-teal text links.
- Keep one heading and two choices. Avoid badges, icons, property cards, new imagery, sticky elements, or motion.
- Choice 1 points to `/stays/anna-maria-island-vacation-rentals/` and states the source-backed fit: AMI beaches 5-15 minutes away, with more room, pool time, and easier parking than forcing island-only inventory.
- Choice 2 points to `/stays/anna-maria-island-beachfront-rentals/` and states the source-backed tradeoff: a larger near-island group house, not true beachfront, with a 12-25 minute beach drive.
- Keep the shared lower conversion kit byte-for-byte unchanged so this remains a placement/hierarchy test.
- On desktop, use a two-column editorial split with equal visual weight. On mobile, stack with a divider and at least 44px-high link treatment.
- No `DESIGN.md` change is required; the strip uses existing editorial and button-link laws.

### Proof plan

- Deterministic: focused source test, content lint, build, links, JSON-LD, route/direct-booking smoke, visual regression.
- Rendered: targeted local screenshots at `1440x900` and `390x844`, centered on the answer-to-strip transition plus one normal first viewport.
- Taste/accessibility: global `design-review` skill, keyboard/focus check, wrapping check, no horizontal overflow, and exact link/event readback.

---

## Chunk 1: Contract and implementation

### Task 0: Approve the design packet before source work

**Files:**
- Review only: `DESIGN.md`, `docs/process/design-review-workflow.md`, `docs/process/seascape-design-studio.md`, the live route, and both destination-page records in `src/_data/seoPages.json`

- [ ] Complete the `seascape-design-specialist` packet and record separate critic verdicts for the current route and selected direction before implementation.
- [ ] Present three distinct choices: a small editorial decision strip, a plain inline-link revision, and moving the shared conversion kit upward.
- [ ] Recommend the editorial decision strip because it makes the next choice visible without duplicating the lower conversion kit or promoting the shelling field-journal format.
- [ ] Frame the honest destination choice as `AMI beaches 5-15 minutes away with more space/pool/parking ease` versus `a larger near-island group house with a 12-25 minute beach drive`; never imply either collection is on-island or true beachfront.
- [ ] Iterate the selected direction until the critic returns `Approved with edge` or `Approved`; stop if it remains `Reject` or `Needs another pass`.
- [ ] Obtain Sawyer's approval of the selected direction. Stop before source or test edits until approval is explicit.

### Task 1: Lock the route contract

**Files:**
- Modify: `scripts/enforcement/stay-money-pages.test.js`

- [ ] Add a focused test that requires `data-season-stay-choice` on `src/guides/best-time-visit-anna-maria-island.html`.
- [ ] Require tracked links to both `/stays/anna-maria-island-vacation-rentals/` and `/stays/anna-maria-island-beachfront-rentals/` inside that decision surface.
- [ ] Run `node --test scripts/enforcement/stay-money-pages.test.js` and confirm the new assertion fails before implementation.

### Task 2: Add the active reread brief

**Files:**
- Create: `docs/briefs/2026-07-best-time-guide-transfer-fix.md`

- [ ] Read `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md` immediately before writing.
- [ ] Include every required flat field: `persona`, `primary keyword`, `secondary keywords`, `audience pattern`, `proof source`, `required internal links`, `CTA target`, `anti-claims`, `hypothesis`, `primary event`, `guardrail event`, `entry criteria`, `readback window`, and `decision rule`.
- [ ] Cite the exact dated analytics receipt path and SHA-256, then record the July 11 receipt window (`2026-07-03` through `2026-07-09`) and the page evidence: `1,917` impressions, `16` GSC clicks, `32` GA4 sessions, `0` guide direct clicks, `0` booking handoffs, and one canonical variant.
- [ ] Name both existing AMI stay money destinations, `guide_book_direct_click`, the first seven complete post-deploy days, and the retain/refine decision rule.
- [ ] State the anti-claims: no field-journal promotion, no new guide, no ranking or conversion lift claim, and no invented reviewer/photo/local note/map.
- [ ] Keep the brief scoped to this one route and this one placement treatment.

### Task 3: Implement the early seasonal stay decision strip

**Files:**
- Modify: `src/guides/best-time-visit-anna-maria-island.html`

- [ ] Add route-local CSS using existing `--cream`, `--cream-dark`, `--brand-dark`, `--gold`, and existing radius/typography rules; do not change `DESIGN.md`.
- [ ] Place one `data-season-stay-choice` section directly after the answer-first summary.
- [ ] Present two honest near-island choices: keep AMI beaches 5-15 minutes away with more space/pool/parking ease, or choose the larger-group alternative while accepting a 12-25 minute beach drive.
- [ ] Put `data-track-event="guide_book_direct_click"`, the existing guide slug, and distinct labels on both links.
- [ ] Keep the lower shared conversion kit unchanged so the test isolates placement, not a second simultaneous copy experiment.
- [ ] Update `dateModified` and the visible updated date only to reflect this real July 11 edit; do not add an unverified named reviewer or field claim.
- [ ] Run `node --test scripts/enforcement/stay-money-pages.test.js` and confirm it passes.

## Chunk 2: Proof and review

### Task 4: Run copy and source gates

**Files:**
- Review only: current diff

- [ ] Run the visible-copy passes against changed reader copy: copywriting, enterprise UI writing, then humanizer.
- [ ] Run `npm run lint:content`.
- [ ] Apply the repo-local content-quality rubric and record the strongest remaining risk.
- [ ] Run `npm run build`.
- [ ] Run `npm run verify:links`.
- [ ] Run `npm run verify:jsonld`.
- [ ] Run the focused route/direct-booking smoke checks that cover this guide.

### Task 5: Render and inspect desktop/mobile

**Files:**
- Generated proof only: screenshot artifacts from the repo visual workflow

- [ ] Run `npm run test:visual`.
- [ ] Capture targeted screenshots with Playwright against the local built route at desktop `1440x900` and mobile `390x844`, including a viewport centered on `data-season-stay-choice`; save them under a task-specific ignored artifact directory.
- [ ] Do not rely on `npm run proof:visual` for this route: `tests/visual/routes.js` does not currently include it, and expanding the shared visual route set is outside this bounded fix.
- [ ] Inspect desktop and mobile at the answer block and decision strip, plus a mobile viewport showing the transition into the long article.
- [ ] Run the required `design-review` skill; fix only task-scoped hierarchy, spacing, wrapping, accessibility, or interaction defects and rerun affected gates.

### Task 6: Review and close the branch without publishing

**Files:**
- Review only: intended diff and repo state

- [ ] Run the simplify checkpoint on the current diff.
- [ ] Run the configured autoreview gate and use Sol only as a design/review challenger if the installed review surface supports it.
- [ ] Recheck `git status --short --branch` and confirm root `main` remains clean.
- [ ] Report the branch, exact analytics receipt, proof outputs, screenshots, and any residue. Do not push, open a PR, merge, or deploy without a separate publish instruction.
