# Guide family 1 tickets: Getting there and around

Spec: `docs/plans/2026-10-23-guide-family-1-spec.md`. One ticket is one PR, built in a fresh
session by a `worker`, with `verifier` run on HEAD. PRs open ready. Layout (L) and enhancement
(E) tickets never share a PR.

## Dependency graph

```
L0 shared frame + cost guide move
 ├── L1 car ── L2 how-to-get-to ── L3 flights ── L4 SRQ
 │
E1 family facts brief (needs Sawyer's OpenSEO approval) ── E0 figure board (Sawyer picks)
 └──────────────┬─────────────────────────────────────────────┘
                ├── E2a how-to-get-to figure   (also blocked by L2)
                ├── E2b flights figure          (also blocked by L3)
                ├── E2c SRQ table at 360px      (also blocked by L4)
                └── E2d car steps               (also blocked by L1)
E3 flights "anna maria island airport" title/answer   (blocked by L3, E1)
```

Common done criteria (every ticket, at the PR head):
`npm run build && npm test && npm run lint:content && npm run lint:design && npm run verify:release -- --range origin/main && git diff --check origin/main...HEAD`,
plus desktop 1440 and mobile 393 screenshots from `npm run proof:visual` attached to the PR.

---

## Layout lane

### L0. Shared planning-guide frame; move the cost guide onto it (tracer)
- Blocked by: none.
- Write set: `src/css/planning-guide.css` (new), `src/_includes/layouts/guide-planning.njk` (new),
  `src/guides/anna-maria-island-vacation-cost.html`, `tests/visual/routes.js`,
  `tests/visual/__screenshots__/**` for `guide-ami-vacation-cost` only,
  `docs/briefs/2026-10-guide-family-1-planning-frame.md` (new),
  `scripts/enforcement/guide-conversion.test.js` (only if a layout assertion must move).
- Done:
  - Common criteria pass.
  - Commit 1 adds the cost guide to `tests/visual/routes.js` with a baseline taken from the
    unchanged page; commit 2 moves the page; `npm run test:visual` is green for
    `guide-ami-vacation-cost` with no snapshot update in commit 2.
  - Visible text and JSON-LD of `_site/guides/anna-maria-island-vacation-cost/index.html`
    are byte-identical between `origin/main` and HEAD builds (diff of extracted text and of
    each `application/ld+json` block is empty).
  - `grep -c '<style' src/guides/anna-maria-island-vacation-cost.html` is lower than on main;
    `grep -n -i 'shell\|cost' src/_includes/layouts/guide-planning.njk` finds no guide-specific copy.
  - `npx playwright test tests/visual/design-floors.spec.js -g guide-ami-vacation-cost` passes.

### L1. Do you need a car: planning frame
- Blocked by: L0.
- Write set: `src/guides/do-you-need-a-car-anna-maria-island.html`, `tests/visual/routes.js`
  (`moneyRoutes`; the floors spec picks the route up from there), that route's screenshots,
  `scripts/design/design-lint-baseline.json`, family layout brief (only if lint forces swaps).
- Done:
  - Common criteria pass; `npm run lint:design:update` only removed entries
    (`git diff origin/main -- scripts/design/design-lint-baseline.json | grep -c '^+ '` is 0).
  - Text diff vs main: no removed or changed words except swaps listed in the brief.
  - JSON-LD blocks identical to main.
  - `grep -c 'fonts.googleapis' src/guides/do-you-need-a-car-anna-maria-island.html` is 0;
    `data-track-event="guide_book_direct_click"` still present.
  - Floors spec passes for the new route at 360/375/393 (no horizontal scroll, table fits).
  - Visual baseline refreshed for this route only (`update-visual-baselines.yml` with a route grep).

### L2. How to get to AMI: planning frame
- Blocked by: L1.
- Write set: `src/guides/how-to-get-to-anna-maria-island.html`, plus the same test, baseline
  and brief files as L1 for this route.
- Done: as L1 for this route; every airport-table value visible at 360px. The standalone
  Code column may hide below 900px because each code stays in its airport name.

### L3. Flights to AMI: planning frame
- Blocked by: L2.
- Write set: `src/guides/flights-to-anna-maria-island/index.html`, plus the same test, baseline
  and brief files as L1 for this route.
- Done: as L1 for this route; all three tables fit at 360, 375 and 393px without sideways scroll.

### L4. SRQ airport to AMI: planning frame (ranking page, last)
- Blocked by: L3.
- Write set: `src/guides/srq-airport-to-anna-maria-island.html`, plus the same test, baseline
  and brief files as L1 for this route. Not in write set: `scripts/recovery/assert-live-smoke.js`
  and the pinned enforcement tests (they must pass unchanged).
- Done:
  - As L1 for this route.
  - `node --test scripts/enforcement/search-content-rescue.test.js scripts/enforcement/technical-cleanup.test.js scripts/enforcement/guide-conversion.test.js` passes with those files untouched.
  - `grep -c 'Reviewed August 19, 2026\|<strong>August 2026 review:</strong>\|planning ranges, not live quotes' src/guides/srq-airport-to-anna-maria-island.html` matches main.
  - Title, meta description, canonical and H1 identical to main.

---

## Enhancement lane (copy lane: brief, Gate 0, Voice Editor, Sawyer review)

### E1. Family facts brief: reconcile and source travel data
- Blocked by: Sawyer's approval of the OpenSEO run in the spec (research runs inside this ticket).
  Not blocked by L tickets; if an L PR is open on the same file, E1 waits for it to merge.
- Write set: `docs/briefs/2026-10-guide-family-1-travel-facts.md` (new, with Gate 0 block),
  the four guide files (fact and source lines only), `src/_data/sourcedClaims.json` (rows for
  any kept dollar range), `scripts/recovery/assert-live-smoke.js` only if a smoke string changes.
- Done:
  - Common criteria pass; `npm run lint:content` passes with no new unsourced price claim.
  - Each airport's miles and drive time are the same numbers on every guide that states them.
    Proof: a scratch script over the built `_site` pages of the three guides (how-to-get-to,
    flights, SRQ) parses every airport table row into airport code, miles and minutes as
    numbers (code from the airport or Code cell; a range such as "45-60 min" kept as its two
    ends), and also collects prose sentences that name an airport with a mile or minute value.
    For each airport code it prints one line per distinct (miles, minutes) value with the
    guides that state it; the check passes when every code has exactly one line. Paste the
    output in the PR.
  - Every remaining dollar range has a source link on the page or a `sourcedClaims.json` row.
  - Brief records each source URL with its read date; Voice Editor returned `Approved`.

### E0. Figure variant board (one look for Sawyer)
- Blocked by: E1 (figures draw only on reconciled, sourced data).
- Write set: `docs/mockups/2026-10-guide-family-1-figures/**` (new).
- Done: 2-3 static HTML variants of the drive-time figure at 1440 and 393, each built only from
  E1's table values, with PNG screenshots; Sawyer's pick recorded in the E1 brief.

### E2a. How to get to: drive-time figure
- Blocked by: E0, L2.
- Write set: `src/guides/how-to-get-to-anna-maria-island.html`, `src/css/planning-guide.css`
  (figure classes only), the E1 brief, that route's screenshots.
- Done: common criteria; one `pg-figure` directly under the answer; no `<script>` in the figure;
  every number in the figure appears in the page's airport table (text diff shows no new fact);
  `npm run lint:design` reports no new off-brand hex; floors pass.

### E2b. Flights: drive-time and nonstop-cities figure
- Blocked by: E0, L3, E2a (reuses its figure classes).
- Write set: `src/guides/flights-to-anna-maria-island/index.html`, `src/css/planning-guide.css`
  (figure classes only), the E1 brief, that route's screenshots.
- Done: as E2a for this route.

### E2c. SRQ: options table fully visible at 360px (no chart)
- Blocked by: E1, L4.
- Write set: `src/guides/srq-airport-to-anna-maria-island.html`, the E1 brief, that route's screenshots.
- Done: common criteria; pinned SRQ tests pass untouched; floors pass with all table columns
  visible at 360px; no figure element added.

### E2d. Car: "which option" numbered steps (no figure)
- Blocked by: E1, L1.
- Write set: `src/guides/do-you-need-a-car-anna-maria-island.html`, the E1 brief, that route's screenshots.
- Done: common criteria; steps use only facts already in the table; no figure element added.

### E3. Flights: answer "anna maria island airport"
- Blocked by: L3, E1 (and the approved SERP evidence).
- Write set: `src/guides/flights-to-anna-maria-island/index.html` (title, meta description, H1,
  answer paragraph), a Gate 0 brief `docs/briefs/2026-10-flights-ami-airport-query.md`.
- Done: common criteria; Gate 0 block cites the saved SERP report id; brief names the
  readback window and re-check (tracker `247b971a`, 28 days); Voice Editor `Approved`.

---

## Run accounting

Clean-run tally is kept per kind: L0-L4 count as "technical site layout", E-tickets as
"site copy". Each PR records its review-fix round count and any intervention in its
description so the 5-minute post-run review can score the run.
