# Guide family 1: Getting there and around (software factory run 1)

Status: draft for Sawyer's approval (spec and tickets approved together, one checkpoint).
Tickets: `docs/plans/2026-10-23-guide-family-1-tickets.md`.
Written 2026-10-23 against `origin/main` `9772be5f`. Drafted natively; the typed-only
`/to-spec` and `/to-tickets` commands were not invoked.

## Outcome

Four legacy "getting there" guides move onto the Waterline planning-guide frame
(`DESIGN.md`, "Planning guides (October 2026)"). Each guide also gets the one element its
data actually supports (figure, table, or nothing), and the family's travel facts stop
contradicting each other. This is factory run 1: judged on the clean-run definition before
any second family starts (`docs/plans/2026-09-16-claude-design-program.md`, item 2).

## Why this family goes first

| Test | Getting there and around |
|---|---|
| Small | 4 routes, 786 lines of HTML in total |
| Coherent | One reader task: arrive at AMI and get around. All match the router's `planning` family (`npm run design:donors`) |
| Frame already exists | The planning frame was approved 2026-10-02 and is live on the cost guide (#665) |
| No overlap | No open PR touches these files (#734, #750, #763 checked 2026-10-23). No active brief or readback window names them. #736 finished its only change here (how-to-get-to prices) |
| Real data | Every guide has a table; two have airport distance and drive-time data that can carry a figure |
| Demand | Saved tracker: `anna maria island airport` 1,300/mo, unranked; SRQ queries rank 2-7 |

Families rejected for run 1: Bradenton vs Sarasota (#766 measurement pending, #771 just
changed its baselines); best-time and weather (active briefs, #720/#747 figures just shipped);
shelling (already Waterline).

## The four guides

| Guide | File | Lines | Table data today | Risk |
|---|---|---|---|---|
| Do you need a car | `src/guides/do-you-need-a-car-anna-maria-island.html` | 148 | Trolley, golf cart, bike, rideshare, rental car, walking | Low |
| How to get to AMI | `src/guides/how-to-get-to-anna-maria-island.html` | 132 | 5 airports: code, miles, drive time, route | Low |
| Flights to AMI | `src/guides/flights-to-anna-maria-island/index.html` | 288 | 4 airports: miles, drive, airlines, nonstop cities; fares; transport | Medium (3 tables, 360px fit) |
| SRQ airport to AMI | `src/guides/srq-airport-to-anna-maria-island.html` | 218 | 5 transfer options: time, cost, best for | High: ranking page; strings pinned by `scripts/recovery/assert-live-smoke.js` (507-516), `search-content-rescue`, `technical-cleanup`, `guide-conversion` tests |

Facts found while reading (they drive lane B, not lane A):

- No guide cites a source.
- The guides disagree: SRQ is 25 mi (how-to-get-to) vs 18-20 mi (flights); TPA 55 vs 54-60 mi;
  PIE 45 vs 35-45 mi; drive times differ too.
- Dollar ranges without a source remain in the SRQ guide (rideshare, shuttle, taxi, rental) and
  the car guide (golf cart, bike, rideshare, rental). #736 removed the same kind of range from
  how-to-get-to only.

## Lane A: layout move to Waterline (technical)

Rule: frame, same words. Title, meta description, headings, answer, table figures, links,
JSON-LD and the booking box (position and `data-track-*` attributes) stay identical.

1. **L0 shared frame.** The planning frame lives inline in the cost guide (`<style>` about lines
   123-279, `--pg-*` tokens, `pg-open`/`pg-figure`/`pg-rail`/`pg-step`/`pg-tail` markup). Lift it
   into `src/css/planning-guide.css` and a front-matter-driven layout
   `src/_includes/layouts/guide-planning.njk`, and move the cost guide onto it with no visible
   change. No guide-specific copy may be hardcoded in the layout (the field-journal layout's
   hardcoded shelling copy is the mistake to avoid). Opening a fifth planning guide copy of the
   inline CSS is the alternative; rejected because four more copies would drift.
2. **L1-L4 one guide per PR**, in risk order: car, how-to-get-to, flights, SRQ last.
   Each conversion:
   - uses the layout; drops inline legacy styles and Google Fonts;
   - numbers steps 01, 02, 03 with the "In this guide" rail; keeps the existing h2 text;
   - leaves the Instrument figure slot empty (figures are lane B);
   - keeps every table's information visible at 360, 375 and 393px with no sideways scroll.
     A column may hide below 900px only when its values stay visible in another cell of the
     same row (the how-to-get-to airport Code column, whose codes stay in the airport name,
     is the one case so far). SRQ keeps every column visible (E2c);
   - adds the route to `moneyRoutes` in `tests/visual/routes.js` only (the floors spec reads
     `floorRoutes = moneyRoutes`, so a second registration duplicates test titles), and
     refreshes baselines for that route only;
   - shrinks `scripts/design/design-lint-baseline.json` with `npm run lint:design:update`
     (entries only removed, never added);
   - SRQ only: keeps "Reviewed August 19, 2026", "<strong>August 2026 review:</strong>",
     "planning ranges, not live quotes" and the breadcrumb name unchanged, so the pinned tests
     pass without edits.

Known risk: touching a file can make `npm run lint:content` demand phrase swaps (the cost guide
needed five). A swap is a copy change, so each layout PR carries the family layout brief
(`docs/briefs/2026-10-guide-family-1-planning-frame.md`, created in L0) listing every swap,
and that PR goes to the copy lane for Sawyer's review. A layout PR with zero swaps stays technical.

## Lane B: enhancements (copy lane, Sawyer reviews)

Each guide gets an element only when the data passes all four "Guide figures" tests in
`DESIGN.md`: real comparison, already published with a source, read in about 3 seconds,
fits the question. No invented facts; a text diff proves it.

**E1 family facts brief (data first).** One brief reconciles the airport distances and drive
times across the four guides, cites a source for each, and resolves unsourced dollar ranges.
- Sources to verify (the agent checks them; none is asserted here): official airport sites
  (flysrq.com, tampaairport.com, fly2pie.com, flylcpa.com, flymco.com) for airlines and
  nonstop counts; one dated mapping-route reading per airport to the island for miles and
  drive time; the Manatee County / AMI trolley page for the free trolley's hours and frequency.
- Dollar ranges in SRQ and car: follow the #736 precedent. Keep only a range with a source or
  a `src/_data/sourcedClaims.json` row; otherwise "check a current quote".
- Gate: active brief, Gate 0 block (search-driven page), `npm run lint:content`, independent
  Voice Editor pass returning `Approved`, Sawyer review.

**E2 per-guide element (after E1 lands; data must be published and sourced first).**

| Guide | Element | Data source | Why |
|---|---|---|---|
| How to get to | Drive-time figure: one bar per airport on a shared minutes scale (or a labeled map if Sawyer picks it on the variant board) | E1's reconciled airport table on the same page | 5 airports x 2 measures passes the comparison test; "which airport is closest" is answered at a glance |
| Flights | Same drive-time figure family, adding nonstop-city count as a second measure | Flights airport table after E1 | 4 airports x 3 measures; the reader is choosing an airport |
| SRQ | No chart. Keep the options table, made fully visible at 360px | Existing table after E1 | Place A vs B options read better as a side-by-side table (`DESIGN.md` figure types) |
| Car | No figure. Table plus numbered "which option" steps | Existing table after E1 | "What should I do" fails test 4; a chart would decorate |

- **E0 variant board.** Two or three variants of the drive-time figure, rendered locally
  under `docs/mockups/2026-10-guide-family-1-figures/`, shown to Sawyer once before any figure
  is built (`DESIGN.md`: "Shown to Sawyer as two or three variants before it is built"),
  each anchored to a named reference from `npm run design:donors` (`AGENTS.md`).
- Ship rules: plain HTML or inline SVG built at build time, no script, one figure per guide
  directly under the answer, colors from `DESIGN.md` only, the source table stays on the page
  (the #720 and #747 month-strip figures are the pattern).

**E3 flights page for "anna maria island airport".** The query has 1,300 monthly searches,
KD 0, and Seascape does not rank (local OpenSEO tracker `247b971a`, checked 2026-10-22). The
flights guide is the natural owner. Title, H1 and answer changes follow Gate 0 with the SERP
evidence from the research below. Runs after L3 so the layout and copy diffs stay separate.

## OpenSEO research (needs Sawyer's approval; nothing run)

Saved evidence read for free: project `7c97b83b-1950-41f1-a797-f7c7a79390e4` (no saved
keywords; six reports, none about these guides) and mobile tracker `247b971a` (SRQ queries
and the airport query above).

Proposed run, location 2840 (United States), language `en`:

| Tool | Inputs | Raw USD estimate |
|---|---|---|
| `get_serp_results` (depth 20) | anna maria island airport; how to get to anna maria island; flights to anna maria island; do you need a car on anna maria island; srq to anna maria island | 5 x $0.0035 = $0.018 |
| `get_keyword_metrics` | the same 5 plus closest airport to anna maria island; anna maria island trolley; sarasota airport to anna maria island | about $0.013 |
| `research_keywords` (limit 100 each) | anna maria island airport; getting to anna maria island; anna maria island transportation | 3 x $0.024 = $0.072 |

Total about $0.10 raw DataForSEO spend (about 100-130 credits at 1,000 credits per USD,
including the 1.28 markup if billed through hosted credits). Well under the 2,000-credit ask
threshold. Prices come from `open-seo-review/src/server/lib/dataforseo/pricing.ts` and
`src/shared/rank-tracking.ts`; confirm with the tool's own estimate before running. The run
feeds E1 (which pages answer these queries and what they cite) and E3 (title and answer).

## Gates per lane

| Gate | Lane A (L0-L4) | Lane B (E0-E3) |
|---|---|---|
| Content brief | Family layout brief; required only if lint forces swaps | Required, changed in the same PR |
| Gate 0 block | No (no search-driven change) | E1 and E3 yes |
| `npm run lint:content` | Pass | Pass |
| `npm run verify:release -- --range origin/main` | Pass | Pass |
| Same-words text diff | Must show no removed or changed words | Must show only the brief's listed changes |
| Visual baselines | Refreshed for the changed route only | Refreshed for the changed route only |
| Desktop 1440 and mobile 393 screenshots | Attached to the PR | Attached to the PR |
| Floors (`tests/visual/design-floors.spec.js`) | Pass for the route | Pass for the route |
| Voice Editor `Approved` | Only with swaps | Yes |
| Sawyer | Ready-PR review (technical self-merge not yet earned) | Copy-lane review |

## Done criteria (run from the repo root at the PR head)

```
npm run build
npm test
npm run lint:content
npm run lint:design
npm run verify:release -- --range origin/main
npx playwright test tests/visual/design-floors.spec.js -g "guide-"
npm run test:visual
npm run proof:visual
node --test scripts/enforcement/guide-conversion.test.js scripts/enforcement/search-content-rescue.test.js scripts/enforcement/technical-cleanup.test.js
git diff --check origin/main...HEAD
```

Family-level done: all four guides render `body.planning-guide`:
`for f in do-you-need-a-car-anna-maria-island how-to-get-to-anna-maria-island flights-to-anna-maria-island srq-airport-to-anna-maria-island; do grep -l 'planning-guide' _site/guides/$f*/index.html _site/guides/$f.html 2>/dev/null; done`
returns four files; `grep -c 'fonts.googleapis'` on each source file returns 0; and
`scripts/design/design-lint-baseline.json` has no entry for the four files.

## Decisions for Sawyer (asked once, with the tickets)

1. **Per-guide approval.** `DESIGN.md` says each conversion is its own approval with a Claude
   Design mock. Recommendation: approving this spec counts as approval for all four layout moves,
   because the frame is already approved and lane A changes no words. Saves four mock rounds.
2. **One figure board.** E0 is the only extra look Sawyer is asked for before PRs: one batched
   board of 2-3 figure variants. Recommendation: yes.
3. **OpenSEO spend.** About $0.10 for the run above. Recommendation: approve; it decides E3.

## Out of scope

New guides, URL or redirect changes, schema type changes, other guide families, CI or ruleset
changes, and making `playwright-visual` a required check (tracked separately).
